import { prisma } from '~/server/utils/prisma';
import { calculateDebt } from '~/server/utils/debt';

export default defineEventHandler(async event => {
  // protectRoute(event);
  // protectAdminRoute(event);

  let users = await prisma.user.findMany({
    select: {
      firstName: true,
      lastName: true,
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
            select: {
              amount: true,
            },
          },
        },
      },
    },
  });

  const lastLoans = users.map(({ firstName, lastName, loans }) => ({
    id: loans.at(0)?.id,
    amount: loans.at(0)?.amount,
    date: loans.at(0)?.date,
    description: loans.at(0)?.description ?? '',
    debt: calculateDebt(loans),
    user: {
      firstName,
      lastName,
    },
  }));

  return lastLoans.filter(loan => loan.debt > 0);
});
