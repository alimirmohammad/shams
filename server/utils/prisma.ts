import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '~/server/generated/prisma/client';
import type { PrismaClient as PrismaClientType } from '~/server/generated/prisma/client';

declare const process: { env: Record<string, string | undefined> };

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });

  return new PrismaClient({ adapter });
}

let _prisma: PrismaClientType | undefined;

// On Cloudflare Workers, env vars are only available during a request,
// so the client must be created lazily on first use.
export const prisma = new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    _prisma ??= createPrismaClient();
    return Reflect.get(_prisma, prop);
  },
});
