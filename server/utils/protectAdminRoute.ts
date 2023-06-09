import { H3Event } from 'h3';
import { UserBaseData } from '../middleware/auth';
import { Role } from '@prisma/client';

export default (event: H3Event) => {
  const user: UserBaseData = event.context.user;
  if (user.role !== Role.ADMIN) {
    throw createError({
      statusCode: 403,
      message: 'شما دسترسی لازم را ندارید.',
    });
  }
};
