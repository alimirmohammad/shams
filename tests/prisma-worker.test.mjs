import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { createServer, createConnection } from 'node:net';
import pg from 'pg';
import { SignJWT } from 'jose';
import path from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const root = path.resolve(import.meta.dirname, '..');
const wasmPath = path.join(root, 'server/generated/prisma/internal/query_compiler_fast_bg.wasm');

// PGlite's socket wrapper can otherwise leave start() pending when a sandbox
// rejects loopback bind. Surface that error immediately in restricted runners.
async function startDatabaseServer(db) {
  const server = new PGLiteSocketServer({ db, port: 0, maxConnections: 20 });
  await Promise.race([
    server.start(),
    new Promise((_, reject) => server.addEventListener('error', event => reject(event.detail), { once: true })),
  ]);
  return server;
}

// Model hosted poolers at the protocol boundary: an otherwise valid startup
// packet containing an unsupported setting is rejected before authentication.
async function startPooler(upstream) {
  const sockets = new Set();
  const stats = { accepted: 0, rejected: 0 };
  const server = createServer(socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    let startup = Buffer.alloc(0);
    const inspect = chunk => {
      startup = Buffer.concat([startup, chunk]);
      if (startup.length < 4 || startup.length < startup.readInt32BE(0)) return;
      socket.off('data', inspect);
      const fields = startup.subarray(8, startup.readInt32BE(0) - 1).toString().split('\0');
      const parameters = Object.fromEntries(Array.from({ length: Math.floor(fields.length / 2) }, (_, i) => [fields[2 * i], fields[2 * i + 1]]));
      if (Object.hasOwn(parameters, 'statement_timeout')) {
        stats.rejected++;
        const message = Buffer.from('SFATAL\0C08006\0MFailed to connect to upstream database\0\0');
        const packet = Buffer.alloc(5 + message.length);
        packet[0] = 69;
        packet.writeInt32BE(message.length + 4, 1);
        message.copy(packet, 5);
        socket.end(packet);
        return;
      }
      stats.accepted++;
      const [host, port] = upstream.getServerConn().split(':');
      const target = createConnection({ host, port: Number(port) });
      sockets.add(target);
      target.on('close', () => sockets.delete(target));
      target.on('error', () => socket.destroy());
      socket.on('error', () => target.destroy());
      socket.on('close', () => target.destroy());
      target.on('connect', () => { target.write(startup); socket.pipe(target); target.pipe(socket); });
    };
    socket.on('data', inspect);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return {
    stats,
    url: `postgresql://postgres:postgres@127.0.0.1:${server.address().port}/postgres?sslmode=disable`,
    async close() { for (const socket of sockets) socket.destroy(); await new Promise(resolve => server.close(resolve)); },
  };
}

async function queryWorker(runtime) {
  let timeout;
  try {
    return await Promise.race([
      runtime.dispatchFetch('http://fixture/query'),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Worker query exceeded 10 seconds')), 10000); }),
    ]);
  } finally { clearTimeout(timeout); }
}

async function worker(databaseUrl, legacy = false) {
  const fixture = `
    import * as database from './server/utils/prisma.ts';
    ${legacy ? 'let shared;' : ''}
    export default { async fetch(request, env) {
      const event = { context: { cloudflare: { env } } };
      const client = ${legacy ? '(shared ??= database.getPrisma(event))' : 'database.getPrisma(event)'};
      try {
        const result = await client.$queryRawUnsafe('SELECT 42::int AS answer');
        return Response.json(result);
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      } finally {
        ${legacy ? '' : 'await database.disconnectPrisma(event);'}
      }
    }};`;
  const bundled = await build({
    stdin: { contents: fixture, resolveDir: root, sourcefile: 'worker-fixture.ts' },
    bundle: true, write: false, format: 'esm', platform: 'neutral',
    banner: { js: "import { createRequire } from 'node:module'; const require = createRequire('/worker.mjs');" },
    conditions: ['workerd', 'worker', 'node'], mainFields: ['module', 'main'],
    plugins: [{ name: 'worker-imports', setup(builder) {
      builder.onResolve({ filter: /^~\// }, ({ path: name }) => ({ path: path.join(root, name.slice(2)) + '.ts' }));
      builder.onResolve({ filter: /\.wasm\?module$/ }, () => ({ path: './compiler.wasm', external: true }));
      builder.onResolve({ filter: /^pg-native$/ }, () => ({ path: 'pg-native', namespace: 'empty' }));
      builder.onLoad({ filter: /.*/, namespace: 'empty' }, () => ({ contents: 'export default {};', loader: 'js' }));
      builder.onResolve({ filter: /.*/ }, ({ path: name }) => {
        if (builtinModules.includes(name) || name.startsWith('node:')) {
          return { path: name.startsWith('node:') ? name : `node:${name}`, external: true };
        }
      });
    }}],
  });
  return new Miniflare(convertV4MiniflareOptions({
    compatibilityDate: '2026-09-01', compatibilityFlags: ['nodejs_compat'],
    modules: [
      { type: 'ESModule', path: 'worker.mjs', contents: bundled.outputFiles[0].text },
      { type: 'CompiledWasm', path: 'compiler.wasm', contents: await readFile(wasmPath) },
    ],
    bindings: { DATABASE_URL: databaseUrl },
  }));
}

test('workerd: request-scoped Prisma survives repeated and concurrent PostgreSQL queries', { timeout: 60000 }, async (t) => {
  const db = new PGlite();
  await db.waitReady;
  const server = await startDatabaseServer(db);
  t.after(async () => { await server.stop(); await db.close(); });
  const databaseUrl = `postgresql://postgres:postgres@${server.getServerConn()}/postgres?sslmode=disable`;
  const fixed = await worker(databaseUrl);
  t.after(() => fixed.dispose());
  for (let i = 0; i < 3; i++) {
    const response = await queryWorker(fixed);
    assert.equal(response.status, 200, await response.clone().text());
    assert.deepEqual(await response.json(), [{ answer: 42 }]);
  }
  const parallel = await Promise.all(Array.from({ length: 3 }, () => queryWorker(fixed)));
  for (const response of parallel) {
    assert.equal(response.status, 200, await response.clone().text());
    assert.deepEqual(await response.json(), [{ answer: 42 }]);
  }
  // A shared client deliberately recreates the previous ownership bug. This
  // control ensures the fixture exercises workerd's real I/O isolation.
  const old = await worker(databaseUrl, true);
  t.after(() => old.dispose());
  assert.equal((await queryWorker(old)).status, 200);
  let timeout;
  const failed = await Promise.race([
    old.dispatchFetch('http://fixture/query'),
    new Promise(resolve => { timeout = setTimeout(() => resolve(null), 3000); }),
  ]);
  clearTimeout(timeout);
  if (failed) {
    assert.equal(failed.status, 500);
    assert.match(await failed.text(), /different request|I\/O|hung|canceled/i);
  } else {
    t.diagnostic('Legacy singleton query stalled when workerd reused the first request connection');
  }
});


async function builtWorker(databaseUrl, config) {
  return new Miniflare(convertV4MiniflareOptions({
    modules: await Promise.all(['index.mjs', ...(await readdir(path.join(root, '.output/server'), { recursive: true })).filter(name => name !== 'index.mjs' && /\.(mjs|wasm)$/.test(name))].map(async name => ({
      type: name.endsWith('.wasm') ? 'CompiledWasm' : 'ESModule',
      path: name, contents: await readFile(path.join(root, '.output/server', name)),
    }))),
    compatibilityDate: config.compatibility_date,
    compatibilityFlags: config.compatibility_flags,
    bindings: { DATABASE_URL: databaseUrl, NUXT_JWT_SECRET: 'isolated-fixture' },
    serviceBindings: { ASSETS: () => new Response('not found', { status: 404 }) },
  }));
}

// Build first: this checks Nitro's own polyfills and deployed compatibility flags.
test('built Nitro Worker: pooled PostgreSQL startup and repeated error responses stay compatible', { timeout: 60000 }, async (t) => {
  const configPath = path.join(root, '.output/server/wrangler.json');
  let config;
  try { config = JSON.parse(await readFile(configPath, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') { t.skip('Run pnpm build to test the deployed Nitro artifact'); return; } throw error; }
  const db = new PGlite();
  await db.waitReady;
  const migrations = path.join(root, 'prisma/migrations');
  for (const name of (await readdir(migrations)).filter(name => /^\d/.test(name)).sort()) {
    await db.exec(await readFile(path.join(migrations, name, 'migration.sql'), 'utf8'));
  }
  const server = await startDatabaseServer(db);
  t.after(async () => { await server.stop(); await db.close(); });
  const pooler = await startPooler(server);
  t.after(() => pooler.close());
  const runtime = await builtWorker(pooler.url, config);
  t.after(() => runtime.dispose());
  const query = () => runtime.dispatchFetch('http://fixture/api/auth/signin', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phoneNumber: 'nonexistent-fixture-user', password: 'fixture-only' }),
  });
  for (let i = 0; i < 3; i++) {
    const response = await query();
    assert.equal(response.status, 404, await response.clone().text());
    await response.text();
  }
  const parallel = await Promise.all(Array.from({ length: 3 }, query));
  for (const response of parallel) {
    assert.equal(response.status, 404, await response.clone().text());
    await response.text();
  }
  assert.ok(pooler.stats.accepted >= 6, 'Real Worker queries must pass through PostgreSQL startup inspection');
  assert.equal(pooler.stats.rejected, 0);

  // Negative control proves that the fixture reproduces hosted-pooler rejection
  // rather than accepting every startup packet like a direct Postgres server.
  const incompatible = new pg.Client({ connectionString: pooler.url, statement_timeout: 10000 });
  try {
    await assert.rejects(incompatible.connect(), /Failed to connect to upstream database/);
  } finally { await incompatible.end(); }
  assert.equal(pooler.stats.rejected, 1);
});


test('built Nitro Worker: PostgreSQL authentication failures remain controlled 503s', { timeout: 30000 }, async (t) => {
  let config;
  try { config = JSON.parse(await readFile(path.join(root, '.output/server/wrangler.json'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') { t.skip('Run pnpm build to test the deployed Nitro artifact'); return; } throw error; }
  const sockets = new Set();
  const server = createServer(socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.once('data', () => {
      const fields = Buffer.from('SFATAL\0C28P01\0Mfixture authentication failure\0\0');
      const packet = Buffer.alloc(5 + fields.length);
      packet[0] = 69; // PostgreSQL ErrorResponse
      packet.writeInt32BE(fields.length + 4, 1);
      fields.copy(packet, 5);
      socket.end(packet);
    });
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { for (const socket of sockets) socket.destroy(); await new Promise(resolve => server.close(resolve)); });
  const runtime = await builtWorker(`postgresql://postgres:fixture@127.0.0.1:${server.address().port}/postgres?sslmode=disable`, config);
  t.after(() => runtime.dispose());
  const jwt = await new SignJWT({ userId: 42 }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new TextEncoder().encode('isolated-fixture'));
  for (let i = 0; i < 2; i++) {
    const response = await runtime.dispatchFetch('http://fixture/api/auth/me', { headers: { cookie: `token=${jwt}` } });
    const body = await response.text();
    assert.equal(response.status, 503, body);
    assert.doesNotMatch(body, /fixture authentication|postgresql:\/\/|28P01/);
  }
});
