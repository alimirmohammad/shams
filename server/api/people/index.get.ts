import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  // protectRoute(event);
  // protectAdminRoute(event);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      numOfShares: true,
      loans: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          amount: true,
          bills: {
            select: {
              amount: true,
            },
          },
        },
      },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  const usersWithLoans = users.map(
    ({ id, firstName, lastName, numOfShares, loans }) => ({
      id,
      firstName,
      lastName,
      numOfShares,
      debt: calculateDebt(loans),
    })
  );

  const aggregation = await prisma.shareBill.aggregate({
    _sum: {
      amount: true,
    },
  });

  const totalBalance = aggregation._sum.amount;

  return { users: usersWithLoans, totalBalance };
});
