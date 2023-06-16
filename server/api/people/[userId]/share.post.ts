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

  const { date, amount, description } = await readBody(event);

  if (!date || !amount)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

  const user = await prisma.user.update({
    where: {
      id: +userId,
    },
    data: {
      bills: {
        create: {
          amount,
          date,
          description,
        },
      },
    },
    select: {
      bills: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
        },
      },
    },
  });

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
