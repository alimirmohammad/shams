import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  // protectRoute(event);
  // protectAdminRoute(event);

  const userId = getRouterParam(event, 'userId');
  const searchParams = getQuery(event);
  const from = (searchParams.from as string) || undefined;
  const to = (searchParams.to as string) || undefined;
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
      bills: {
        take: from || to ? undefined : 10,
        orderBy: {
          date: 'desc',
        },
        where: {
          date: {
            gte: from,
            lte: to,
          },
        },
        select: {
          id: true,
          amount: true,
          date: true,
          description: true,
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

  const aggregation = await prisma.shareBill.aggregate({
    where: {
      userId: +userId,
    },
    _sum: {
      amount: true,
    },
  });

  const balance = aggregation._sum.amount;

  return { ...user, balance };
});
