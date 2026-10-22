import type { H3Event } from 'h3';
import { defineNitroPlugin } from 'nitropack/runtime';
import { disconnectPrisma } from '../utils/prisma';

export default defineNitroPlugin((nitroApp) => {
  const cleanup = (event: H3Event) => {
    const disconnect = disconnectPrisma(event);
    if (!disconnect) return;

    // Observe failures without breaking an already completed response.
    const completion = disconnect.catch((error: unknown) => {
      nitroApp.captureError(
        error instanceof Error ? error : new Error('Request database cleanup failed'),
        { event, tags: ['prisma', 'cleanup'] },
      );
    });
    // Nitro forwards event.waitUntil to the Cloudflare execution context.
    if (event.waitUntil) {
      event.waitUntil(completion);
    } else if (event.context.cloudflare?.context) {
      event.context.cloudflare.context.waitUntil(completion);
    }
    return completion;
  };

  nitroApp.hooks.hook('request', (event) => {
    // H3 skips afterResponse when its error renderer already sent the response.
    // finish covers that path; close also covers an aborted connection.
    event.node.res.once('finish', () => { void cleanup(event); });
    event.node.res.once('close', () => { void cleanup(event); });
  });

  nitroApp.hooks.hook('afterResponse', cleanup);
});
