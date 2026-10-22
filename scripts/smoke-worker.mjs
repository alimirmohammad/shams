// Read-only database smoke test: a nonexistent account must consistently return 404.
// Never supplies a real account or performs a database write.
const baseUrl = process.argv[2];
if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
  throw new Error('Usage: node scripts/smoke-worker.mjs <worker-url>');
}

const endpoint = new URL('/api/auth/signin', baseUrl);
const phoneNumber = `__database_probe_${crypto.randomUUID()}__`;
const results = [];

async function probe(phase) {
  const startedAt = Date.now();
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password: 'nonexistent-account-probe' }),
      signal: AbortSignal.timeout(20_000),
    });
    await response.arrayBuffer();
    results.push({ phase, status: response.status, durationMs: Date.now() - startedAt });
  } catch (error) {
    results.push({ phase, error: error.name, durationMs: Date.now() - startedAt });
  }
}

for (let i = 0; i < 6; i++) await probe('sequential');
await Promise.all(Array.from({ length: 12 }, () => probe('concurrent')));
await new Promise(resolve => setTimeout(resolve, 12_000));
for (let i = 0; i < 4; i++) await probe('after-idle');

const failures = results.filter(result => result.status !== 404);
console.log(JSON.stringify({
  origin: endpoint.origin,
  requests: results.length,
  passed: results.length - failures.length,
  failures,
  phases: ['sequential', 'concurrent', 'after-idle'].map(phase => {
    const entries = results.filter(result => result.phase === phase);
    return { phase, requests: entries.length, maxDurationMs: Math.max(...entries.map(result => result.durationMs)) };
  }),
}, null, 2));
process.exitCode = failures.length ? 1 : 0;
