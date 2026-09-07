import type { UserBaseData } from '~/server/middleware/auth';

declare module 'h3' {
  interface H3EventContext {
    user: UserBaseData | null;
  }
}
