import type { H3Event } from 'h3';
import { Role } from '~/server/generated/prisma/enums';

export default (event: H3Event): void => {
  const user = event.context.user;
  if (user?.role !== Role.ADMIN) {
    throw createError({
      statusCode: 403,
      message: 'شما دسترسی لازم را ندارید.',
    });
  }
};
