import { PrismaClient } from '~/server/generated/prisma/client';
import type { PrismaClient as PrismaClientType } from '~/server/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

declare const process: { env: Record<string, string | undefined> };

function createPrismaClient() {
  return new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
  }).$extends(withAccelerate());
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

let _prisma: ExtendedPrismaClient | undefined;

// On Cloudflare Workers, env vars are only available during a request,
// so the client must be created lazily on first use.
// Typed as base PrismaClient (not extended) so TypeScript properly infers select return types.
export const prisma = new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    _prisma ??= createPrismaClient();
    return Reflect.get(_prisma, prop);
  },
});
