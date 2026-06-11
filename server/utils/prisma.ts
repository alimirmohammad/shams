import { PrismaClient } from '~/server/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

function createPrismaClient() {
  return new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
  }).$extends(withAccelerate());
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

let _prisma: ExtendedPrismaClient | undefined;

// On Cloudflare Workers, env vars are only available during a request,
// so the client must be created lazily on first use.
export const prisma = new Proxy({} as ExtendedPrismaClient, {
  get(_target, prop) {
    _prisma ??= createPrismaClient();
    return Reflect.get(_prisma, prop);
  },
});
