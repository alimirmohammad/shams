import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  // protectRoute(event);
  // protectAdminRoute(event);

  const userId = getRouterParam(event, 'userId');
  if (!userId || isNaN(+userId) || !Number.isInteger(+userId)) {
    throw createError({
      statusCode: 400,
      message: 'شناسه کاربر نادرست است.',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      numOfShares: true,
      balance: true,
      loans: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          amount: true,
          date: true,
          debt: true,
          status: true,
          bills: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              amount: true,
              date: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'کاربر مورد نظر یافت نشد.',
    });
  }

  return user;
});
