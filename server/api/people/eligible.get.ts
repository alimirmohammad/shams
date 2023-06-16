import { Status } from '@prisma/client';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  // protectRoute(event);
  // protectAdminRoute(event);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      loans: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          status: true,
          debt: true,
        },
      },
    },
  });

  return users.filter(user => user.loans.at(0)?.status !== Status.ONGOING);
});
