import type { H3Event } from 'h3';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '~/server/generated/prisma/client';

declare const process: { env: Record<string, string | undefined> };

export function getPrisma(event: H3Event): PrismaClient {
  if (event.context.prismaDisconnect) {
    throw new Error('The request database client has already been closed');
  }

  if (!event.context.prisma) {
    // Read bindings during this request; a Worker isolate serves many requests.
    const connectionString = event.context.cloudflare?.env?.DATABASE_URL
      ?? process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }

    const adapter = new PrismaPg({
      connectionString,
      max: 2,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 1_000,
      // Prisma Postgres's pooler rejects statement_timeout startup parameters.
      // Bound query waits in the pg client instead.
      query_timeout: 15_000,
    });
    event.context.prisma = new PrismaClient({ adapter });
  }

  return event.context.prisma;
}

export function disconnectPrisma(event: H3Event): Promise<void> | undefined {
  // Do not create a client for requests that never access the database.
  if (!event.context.prisma) return;

  // Response hooks and socket completion can both fire for the same request.
  // Keep the promise on that request so disposal happens exactly once.
  event.context.prismaDisconnect ??= Promise.resolve().then(() =>
    event.context.prisma!.$disconnect(),
  );
  return event.context.prismaDisconnect;
}
