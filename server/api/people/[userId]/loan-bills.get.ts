import { prisma } from '~/server/utils/prisma';
import protectAdminOrSelfRoute from '~/server/utils/protectAdminOrSelfRoute';

export default defineEventHandler(async event => {
  protectRoute(event);

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
  protectAdminOrSelfRoute(event, +userId);

  const user = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      numOfShares: true,
      phoneNumber: true,
      loans: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          amount: true,
          date: true,
          description: true,
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
      },
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'کاربر مورد نظر یافت نشد.',
    });
  }

  const loans = await prisma.loan.findMany({
    where: { userId: +userId },
    take: 1,
    orderBy: { createdAt: 'desc' },
    select: {
      amount: true,
      bills: {
        select: {
          amount: true,
        },
      },
    },
  });

  const debt = calculateDebt(loans);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    numOfShares: user.numOfShares,
    bills: user.loans.at(0)?.bills,
    debt,
  };
});
