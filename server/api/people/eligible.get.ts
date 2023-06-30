import { prisma } from '~/server/utils/prisma';
import { calculateDebt } from '~/server/utils/debt';

export default defineEventHandler(async event => {
  protectRoute(event);
  protectAdminRoute(event);

  let users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      loans: {
        take: 1,
        orderBy: {
          date: 'desc',
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
  });

  const usersWithLoans = users.map(({ id, firstName, lastName, loans }) => ({
    id,
    firstName,
    lastName,
    debt: calculateDebt(loans),
  }));

  return usersWithLoans.filter(user => user.debt === 0);
});
