import { prisma } from '~/server/utils/prisma';
import protectAdminOrSelfRoute from '~/server/utils/protectAdminOrSelfRoute';

export default defineEventHandler(async event => {
  protectRoute(event);

  const userId = getRouterParam(event, 'userId');
  const searchParams = getQuery(event);
  const from = (searchParams.from as string) || undefined;
  const to = (searchParams.to as string) || undefined;
  const loanId = (searchParams.loanId as string) || undefined;
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
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'کاربر مورد نظر یافت نشد.',
    });
  }

  const loanOptions = await prisma.loan.findMany({
    where: { userId: +userId },
    orderBy: { date: 'desc' },
    select: { id: true, date: true, amount: true },
  });

  const activeLoanId =
    loanId && !isNaN(+loanId) ? +loanId : loanOptions.at(0)?.id;

  const activeLoan = activeLoanId
    ? await prisma.loan.findFirst({
        where: { id: activeLoanId, userId: +userId },
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
      })
    : null;

  const loanForDebt = activeLoanId
    ? await prisma.loan.findFirst({
        where: { id: activeLoanId, userId: +userId },
        select: {
          amount: true,
          bills: {
            select: {
              amount: true,
            },
          },
        },
      })
    : null;

  const debt = loanForDebt ? calculateDebt(loanForDebt) : 0;

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    numOfShares: user.numOfShares,
    bills: activeLoan?.bills,
    debt,
    loans: loanOptions,
    activeLoanId: activeLoan?.id,
  };
});
