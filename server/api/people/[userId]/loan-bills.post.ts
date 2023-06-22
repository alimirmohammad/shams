import { prisma } from '~/server/utils/prisma';
import { calculateDebt } from '~~/server/utils/debt';

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

  const { date, amount, description, id } = await readBody(event);

  if (!date || !amount)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

  const user = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
    select: {
      loans: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
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

  const lastLoan = user.loans.at(0);

  if (!lastLoan) {
    throw createError({
      statusCode: 404,
      message: 'وام مورد نظر یافت نشد.',
    });
  }

  const debt = calculateDebt(user.loans);

  if (debt === 0) {
    throw createError({
      statusCode: 400,
      message: 'وام قبلا تسویه شده است.',
    });
  }

  if (debt < amount) {
    throw createError({
      statusCode: 400,
      message: 'مقدار قسط بیش از حد مجاز است.',
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
    loanId: true,
  };

  if (id) {
    return prisma.loanBill.update({
      where: { id },
      data: payload,
      select,
    });
  }

  return prisma.loanBill.create({
    data: {
      ...payload,
      loan: {
        connect: {
          id: lastLoan.id,
        },
      },
    },
    select,
  });
});
