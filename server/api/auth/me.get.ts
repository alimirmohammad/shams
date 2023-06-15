import { UserBaseData } from '~/server/middleware/auth';

export default defineEventHandler(event => {
  const user: UserBaseData | null = event.context.user;
  return user;
});
