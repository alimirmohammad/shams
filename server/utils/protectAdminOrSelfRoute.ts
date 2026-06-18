import { H3Event } from 'h3';
import type { UserBaseData } from '../middleware/auth';
import { Role } from '~/server/generated/prisma/enums';

export default (event: H3Event, userId: number) => {
  const user = event.context.user;
  if (user?.role !== Role.ADMIN && user?.id !== userId) {
    throw createError({
      statusCode: 403,
      message: 'شما دسترسی لازم را ندارید.',
    });
  }
};
