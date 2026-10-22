import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import { SignJWT } from 'jose';
import { createError } from 'h3';

const compiled = await build({
  entryPoints: [path.resolve(import.meta.dirname, '../server/middleware/auth.ts')],
  bundle: true, write: false, format: 'cjs', platform: 'node', external: ['jose'],
  plugins: [{ name: 'auth-fixture', setup(builder) {
    builder.onResolve({ filter: /^~\/server\/utils\/prisma$/ }, () => ({ path: 'database', namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `export function getPrisma(event) { state.databaseAccesses++; if (state.constructionError) throw state.constructionError; return {user: {async findUnique(args) { state.query = args; if(state.queryError) throw state.queryError; return state.user; }}}; }` }));
  }}],
});
const secret = 'fixture-secret-used-only-in-tests';
const key = new TextEncoder().encode(secret);
const token = userId => new SignJWT({ userId }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(key);
function fixture(cookie) {
  const state = { databaseAccesses: 0, logs: [], user: { id: 42, role: 'USER' } };
  const context = vm.createContext({
    state, module: { exports: {} }, exports: {}, require: createRequire(import.meta.url),
    defineEventHandler: fn => fn, getCookie: () => cookie,
    useRuntimeConfig: () => ({ jwtSecret: secret }), TextEncoder, createError,
    console: { error: value => state.logs.push(value) },
  });
  vm.runInContext(compiled.outputFiles[0].text, context);
  return { state, run: context.module.exports.default };
}

for (const [name, cookie] of [['missing', undefined], ['malformed', 'invalid.jwt'], ['invalid signature', await new SignJWT({ userId: 42 }).setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode('wrong-secret'))]]) {
  test(`${name} JWT avoids all database access`, async () => {
    const f = fixture(cookie), event = { context: { user: 'stale' }, path: '/api/auth/me' };
    await f.run(event);
    assert.equal(event.context.user, null);
    assert.equal(f.state.databaseAccesses, 0);
    assert.equal(f.state.logs.length, 0);
  });
}
for (const userId of [0, -1, '42', 1.5, Number.MAX_SAFE_INTEGER + 1]) {
  test(`invalid JWT userId ${userId} avoids database access`, async () => {
    const f = fixture(await token(userId));
    await f.run({ context: {}, path: '/api/auth/me' });
    assert.equal(f.state.databaseAccesses, 0);
  });
}
test('verified JWT resolves user from request-scoped database', async () => {
  const f = fixture(await token(42)), event = { context: {}, path: '/api/auth/me' };
  await f.run(event);
  assert.equal(f.state.databaseAccesses, 1);
  assert.equal(f.state.query.where.id, 42);
  assert.equal(event.context.user, f.state.user);
});
for (const stage of ['constructionError', 'queryError']) {
  test(`${stage} returns controlled 503 and redacted diagnostics`, async () => {
    const f = fixture(await token(42));
    f.state[stage] = Object.assign(new Error('postgresql://secret-user:password@private-host/db'), { code: '28P01' });
    const event = { context: {}, path: '/api/people/private-user/share-bills?token=secret' };
    await assert.rejects(f.run(event), error => error.statusCode === 503 && !error.message.includes('password'));
    assert.equal(event.context.user, null);
    assert.equal(f.state.logs.length, 1);
    const log = f.state.logs[0];
    assert.equal(log.event, 'auth_database_failure');
    assert.equal(log.route, '/api/people/:userId/share-bills');
    assert.equal(log.stage, 'user_lookup');
    assert.equal(log.code, '28P01');
    assert.equal(typeof log.durationMs, 'number');
    assert.doesNotMatch(JSON.stringify(log), /password|private-user|private-host|token=|stack/);
  });
}
test('unrecognized database error codes cannot leak diagnostic values', async () => {
  const f = fixture(await token(42));
  f.state.queryError = { code: 'private-host.example.com' };
  await assert.rejects(f.run({ context: {}, path: '/secret/path?key=hidden' }), error => error.statusCode === 503);
  assert.equal(f.state.logs[0].code, 'UNKNOWN');
  assert.equal(f.state.logs[0].route, 'other');
});
