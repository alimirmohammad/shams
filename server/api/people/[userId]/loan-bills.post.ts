import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  protectRoute(event);
  protectAdminRoute(event);

  const userId = getRouterParam(event, 'userId');
  if (!userId || isNaN(+userId) || !Number.isInteger(+userId)) {
    throw createError({
      statusCode: 400,
      message: 'شناسه کاربر نادرست است.',
    });
  }

  const { date, amount, description, id, loanId } = await readBody(event);

  if (!date || !amount)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

  const loan =
    loanId && !isNaN(+loanId)
      ? await prisma.loan.findFirst({
          where: { id: +loanId, userId: +userId },
          select: {
            id: true,
            amount: true,
            bills: {
              select: {
                id: true,
                amount: true,
              },
            },
          },
        })
      : await prisma.loan.findFirst({
          where: { userId: +userId },
          orderBy: { date: 'desc' },
          select: {
            id: true,
            amount: true,
            bills: {
              select: {
                id: true,
                amount: true,
              },
            },
          },
        });

  if (!loan) {
    throw createError({
      statusCode: 404,
      message: 'وام مورد نظر یافت نشد.',
    });
  }

  const totalPaid = loan.bills
    .filter(bill => bill.id !== id)
    .reduce((acc, bill) => acc + bill.amount, 0);
  const remaining = loan.amount - totalPaid;

  if (amount > remaining) {
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
          id: loan.id,
        },
      },
    },
    select,
  });
});
