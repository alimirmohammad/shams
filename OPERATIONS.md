# Worker database lifecycle

The deployed Worker is `shams`. Nuxt generates its Wrangler configuration at
`.output/server/wrangler.json`; edit `nuxt.config.ts`, not the generated file.

Prisma clients belong to one H3 request. Use `getPrisma(event)` in middleware and
handlers so they share a client within that request. The lifecycle plugin closes
it after the response, including rendered errors and aborted connections.

Prisma Postgres's hosted pooler rejects the PostgreSQL startup parameter
`statement_timeout` with a generic upstream connection failure. Keep timeouts in
the pg client (`connectionTimeoutMillis` and `query_timeout`) instead.

## Validate

```sh
pnpm build
pnpm test
pnpm exec wrangler versions upload --config .output/server/wrangler.json --name shams --dry-run
node scripts/smoke-worker.mjs https://<version-prefix>-shams.ali-mirmohammad-86.workers.dev
```

Tests require Node.js 24 and permission to bind local TCP ports. They use temporary
in-memory PostgreSQL databases and never migrate the production database. The
smoke script performs 22 database lookups for a random nonexistent account;
expected HTTP 404 responses prove the lookup completed. It performs no writes.
It covers sequential, concurrent, and after-idle requests.

The repository's TypeScript 5.0 checker cannot parse some existing Vite dependency
declarations. A temporary TypeScript 5.9.3 server-only check passes. Full-project
checking with that newer checker also reports existing frontend Vue module and
implicit-any issues. No dependency versions were changed for this fix.

## Release

Upload without changing production traffic, preserving existing secrets and vars:

```sh
pnpm exec wrangler versions upload --config .output/server/wrangler.json --name shams --keep-vars
```

Version URLs are public and use the version's production resources. Test only
reads there. Cloudflare does not expose logs for requests to version URLs.
Validate signed-in pages as well as the smoke script before deploying.

```sh
pnpm exec wrangler versions deploy <version-id>@100 --config .output/server/wrangler.json --name shams --yes
```

The version preceding this fix is `ed8b3523-7a6f-4635-abfb-309ee544ee1e`. To restore
its code if a regression appears:

```sh
pnpm exec wrangler versions deploy ed8b3523-7a6f-4635-abfb-309ee544ee1e@100 --config .output/server/wrangler.json --name shams --yes
```

Rollback does not change database data. This fix contains no schema migrations.

## Validation record, 22 October 2026

- Original production version: 6/22 database probes completed; 16 returned HTTP 500.
- Candidate `29c7c4c3-f50d-4f9b-ab96-8445208cd670`: 22/22 probes completed.
- Deployed that version at 100% on 22 October 2026 at 23:23 Berlin time.
- Production after deployment: 22/22 probes completed; no errors appeared in the
  new version's logs during validation.
- Signed-in shareholders, share bills, and loan bills (including `loanId=61`)
  loaded successfully on the staged version with no browser console errors.
- Production build, Wrangler packaging check, and 20 regression tests passed.
- Tests exercise the built Nitro Worker with its deployed compatibility settings,
  verify request isolation and cleanup on error, and reproduce a hosted pooler's
  rejection of unsupported startup parameters.
