import { Status } from '@prisma/client';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  // protectRoute(event);
  // protectAdminRoute(event);

  const loans = await prisma.loan.findMany({
    where: {
      status: Status.ONGOING,
    },
    select: {
      amount: true,
      date: true,
      debt: true,
      id: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return loans;
});
