import type { UserBaseData } from '~/server/middleware/auth';
import type { PrismaClient } from '~/server/generated/prisma/client';

declare module 'h3' {
  interface H3EventContext {
    user: UserBaseData | null;
    prisma?: PrismaClient;
    prismaDisconnect?: Promise<void>;
  }
}
