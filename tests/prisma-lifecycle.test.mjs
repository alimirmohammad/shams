import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
import { build } from 'esbuild';
import { createApp, eventHandler, toNodeListener } from 'h3';
import { createHooks } from 'hookable';
import { fetchNodeRequestHandler } from 'node-mock-http';

const root = path.resolve(import.meta.dirname, '..');
const compiled = await build({
  stdin: { contents: "export * from './server/utils/prisma'; export { default as lifecycle } from './server/plugins/prisma-lifecycle';", resolveDir: root },
  bundle: true, write: false, format: 'cjs', platform: 'node',
  plugins: [{ name: 'test-database', setup(builder) {
    builder.onResolve({ filter: /^(@prisma\/adapter-pg|~\/server\/generated\/prisma\/client|nitropack\/runtime)$/ }, args => ({ path: args.path, namespace: 'fake' }));
    builder.onLoad({ filter: /.*/, namespace: 'fake' }, ({ path: name }) => ({ contents: name === 'nitropack/runtime'
      ? 'export const defineNitroPlugin = fn => fn;'
      : name === '@prisma/adapter-pg'
      ? 'export class PrismaPg { constructor(options) { this.options = options; state.adapters.push(this); } }'
      : `export class PrismaClient {
          constructor(options) { this.options = options; this.disconnects = 0; state.clients.push(this); }
          async $disconnect() { this.disconnects++; if (state.disconnectError) throw state.disconnectError; }
        }`, loader: 'js' }));
  }}],
});

function fixture() {
  const state = { clients: [], adapters: [] };
  const context = vm.createContext({ state, exports: {}, module: { exports: {} }, process: { env: { DATABASE_URL: 'postgresql://fixture/only' } } });
  vm.runInContext(compiled.outputFiles[0].text, context);
  const api = context.module.exports;
  const hooks = createHooks();
  const captured = [];
  api.lifecycle({ hooks, captureError: (...args) => captured.push(args) });
  return { state, ...api, hooks, captured };
}

function event() {
  const pending = [];
  return { context: {}, node: { res: new EventEmitter() }, waitUntil(promise) { pending.push(promise); }, pending };
}

test('requests without database access create neither adapter nor client', async () => {
  const f = fixture();
  const e = event();
  await f.hooks.callHook('request', e);
  e.node.res.emit('finish');
  await f.hooks.callHook('afterResponse', e);
  assert.equal(f.state.clients.length, 0);
  assert.equal(f.state.adapters.length, 0);
});

test('same request reuses client; overlapping requests own separate clients and bindings', async () => {
  const f = fixture();
  const a = event(), b = event();
  a.context.cloudflare = { env: { DATABASE_URL: 'postgresql://fixture/a' } };
  b.context.cloudflare = { env: { DATABASE_URL: 'postgresql://fixture/b' } };
  const first = f.getPrisma(a);
  assert.equal(f.getPrisma(a), first);
  const second = f.getPrisma(b);
  assert.notEqual(first, second);
  assert.equal(first.options.adapter.options.connectionString, 'postgresql://fixture/a');
  assert.equal(second.options.adapter.options.connectionString, 'postgresql://fixture/b');
  await f.disconnectPrisma(a);
  assert.equal(second.disconnects, 0);
  assert.equal(f.getPrisma(b), second);
  await f.disconnectPrisma(b);
});

test('finish, close and afterResponse disconnect exactly once and register background work', async () => {
  const f = fixture();
  const e = event();
  await f.hooks.callHook('request', e);
  const client = f.getPrisma(e);
  e.node.res.emit('close');
  e.node.res.emit('finish');
  await f.hooks.callHook('afterResponse', e);
  await Promise.all(e.pending);
  assert.equal(client.disconnects, 1);
  assert.ok(e.pending.length > 0);
  assert.throws(() => f.getPrisma(e), /closed/);
});

test('cleanup failure is captured without replacing completed response', async () => {
  const f = fixture();
  f.state.disconnectError = new Error('fixture cleanup failure');
  const e = event();
  await f.hooks.callHook('request', e);
  f.getPrisma(e);
  await f.hooks.callHook('afterResponse', e);
  assert.ok(f.captured[0][0]);
  assert.equal(f.captured[0][1].event, e);
});

test('H3 success and already-rendered error responses both release their client', async () => {
  const f = fixture();
  const pending = [];
  const app = createApp({
    onRequest: async e => { e.waitUntil = p => pending.push(p); await f.hooks.callHook('request', e); },
    onAfterResponse: e => f.hooks.callHook('afterResponse', e),
    onError: (_error, e) => { e.node.res.statusCode = 503; e.node.res.end('controlled failure'); },
  });
  app.use(eventHandler(e => { f.getPrisma(e); if (e.path === '/error') throw new Error('fixture'); return 'ok'; }));
  const handler = toNodeListener(app);
  assert.equal((await fetchNodeRequestHandler(handler, 'http://fixture/success')).status, 200);
  assert.equal((await fetchNodeRequestHandler(handler, 'http://fixture/error')).status, 503);
  await Promise.all(pending);
  assert.equal(f.state.clients.length, 2);
  assert.deepEqual(f.state.clients.map(client => client.disconnects), [1, 1]);
});
