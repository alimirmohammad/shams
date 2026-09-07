import type { H3Event } from 'h3';
import type { UserBaseData } from '~/server/middleware/auth';

export default (event: H3Event): UserBaseData => {
  const user = event.context.user;
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'باید با شماره و رمز عبور وارد شده باشید.',
    });
  }
  return user;
};
