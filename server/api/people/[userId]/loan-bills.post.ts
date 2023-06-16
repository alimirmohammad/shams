import { Status } from '@prisma/client';
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
          status: true,
          debt: true,
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

  if (lastLoan.status === Status.COMPLETED) {
    throw createError({
      statusCode: 400,
      message: 'وام مورد نظر تسویه شده است.',
    });
  }

  if (lastLoan.debt < amount) {
    throw createError({
      statusCode: 400,
      message: 'مقدار قسط بیش از حد مجاز است.',
    });
  }

  const loan = await prisma.loan.update({
    where: {
      id: lastLoan.id,
    },
    data: {
      debt: {
        decrement: amount,
      },
      status: lastLoan.debt === amount ? Status.COMPLETED : Status.ONGOING,
      bills: {
        create: {
          amount,
          date,
          description,
        },
      },
    },
    select: {
      id: true,
      debt: true,
      status: true,
    },
  });

  return loan;
});
