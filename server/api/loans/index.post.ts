import { prisma } from '~/server/utils/prisma';
import { calculateDebt } from '~/server/utils/debt';

export default defineEventHandler(async event => {
  protectRoute(event);
  protectAdminRoute(event);

  const { date, amount, description, userId, id } = await readBody(event);

  if (!date || !amount || !userId)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
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
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'کاربر مورد نظر یافت نشد.',
    });
  }

  const payload = {
    amount,
    date,
    description,
  };

  const select = {
    id: true,
    amount: true,
    date: true,
    description: true,
    userId: true,
  };

  if (id) {
    const aggregation = await prisma.loanBill.aggregate({
      where: { loanId: id },
      _sum: {
        amount: true,
      },
    });

    if (aggregation._sum.amount != null && aggregation._sum.amount > amount) {
      throw createError({
        statusCode: 400,
        message: 'مقدار وام کمتر از قسط های پرداخت شده است.',
      });
    }

    return prisma.loan.update({
      where: { id },
      data: payload,
      select,
    });
  }

  const debt = calculateDebt(user.loans);

  if (debt > 0) {
    throw createError({
      statusCode: 400,
      message: 'کاربر وام تسویه نشده دارد.',
    });
  }

  return prisma.loan.create({
    data: {
      ...payload,
      user: {
        connect: {
          id: userId,
        },
      },
    },
    select,
  });
});
