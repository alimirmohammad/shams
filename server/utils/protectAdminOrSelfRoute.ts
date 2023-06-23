import { H3Event } from 'h3';
import { UserBaseData } from '../middleware/auth';
import { Role } from '@prisma/client';

export default (event: H3Event, userId: number) => {
  const user: UserBaseData = event.context.user;
  if (user.role !== Role.ADMIN && user.id !== userId) {
    throw createError({
      statusCode: 403,
      message: 'شما دسترسی لازم را ندارید.',
    });
  }
};
