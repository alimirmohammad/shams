import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const publicDir = path.resolve(import.meta.dirname, '../.output/public');

// Execute the generated worker and its real Workbox runtime. A missing
// navigation fallback throws during startup, before installation can finish.
async function startServiceWorker() {
  const source = await readFile(path.join(publicDir, 'sw.js'), 'utf8');
  const runtimeName = source.match(/define\(\["\.\/(workbox-[^"]+)"\]/)?.[1];
  assert.ok(runtimeName, 'generated worker must load a Workbox runtime');
  const runtime = await readFile(path.join(publicDir, `${runtimeName}.js`), 'utf8');
  const workbox = {};
  const listeners = new Map();
  const cacheLookups = [];
  const shell = await readFile(path.join(publicDir, 'index.html'), 'utf8');
  class WorkerRequest extends Request {
    constructor(input, options) {
      super(typeof input === 'string' ? new URL(input, 'https://shams.test/') : input, options);
    }
  }
  const context = vm.createContext({
    URL, Request: WorkerRequest, Response, Headers,
    FetchEvent: class {},
    caches: {
      async match(request) {
        cacheLookups.push(request.url);
        return new URL(request.url).pathname === '/' ? new Response(shell) : undefined;
      },
    },
    fetch: () => { throw new Error('navigation must work with the network offline'); },
    location: new URL('https://shams.test/sw.js'),
    registration: { scope: 'https://shams.test/' },
    skipWaiting: () => Promise.resolve(),
    addEventListener(type, handler) {
      const handlers = listeners.get(type) ?? [];
      handlers.push(handler);
      listeners.set(type, handlers);
    },
    define: (_dependencies, factory) => factory(workbox),
  });
  context.self = context;
  vm.runInContext(runtime, context);
  vm.runInContext(source, context);
  async function navigate(pathname) {
    let response;
    const pending = [];
    const event = {
      request: { url: `https://shams.test${pathname}`, mode: 'navigate', method: 'GET' },
      respondWith(value) { response = value; },
      waitUntil(value) { pending.push(value); },
    };
    for (const handler of listeners.get('fetch') ?? []) handler(event);
    const result = await response;
    await Promise.all(pending);
    return result;
  }
  return { listeners, navigate, cacheLookups };
}

test('built PWA worker starts with a valid cached navigation fallback', async () => {
  const { listeners } = await startServiceWorker();
  assert.ok(listeners.has('install'));
  assert.ok(listeners.has('activate'));
  assert.ok(listeners.has('fetch'));
});

test('PWA shell and build metadata belong to the same release', async () => {
  const html = await readFile(path.join(publicDir, 'index.html'), 'utf8');
  const latest = JSON.parse(await readFile(path.join(publicDir, '_nuxt/builds/latest.json'), 'utf8'));
  assert.ok(html.includes(`buildId:"${latest.id}"`), 'cached shell must use the current build ID');
  const entry = html.match(/<script type="module" src="([^"]+)"/)[1];
  await readFile(path.join(publicDir, entry));
});

test('loan deep link can reload repeatedly from the cached shell while offline', async () => {
  const { navigate, cacheLookups } = await startServiceWorker();
  for (let visit = 0; visit < 3; visit++) {
    const response = await navigate('/6/loan?loanId=61');
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes('id="__nuxt"'));
  }
  assert.equal(cacheLookups.length, 3);
  assert.ok(cacheLookups.every(url => new URL(url).pathname === '/'));
});

test('API navigations bypass the cached HTML shell', async () => {
  const { navigate, cacheLookups } = await startServiceWorker();
  assert.equal(await navigate('/api/people/6/loan-bills?loanId=61'), undefined);
  assert.equal(cacheLookups.length, 0);
});
