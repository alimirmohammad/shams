import { Status } from '@prisma/client';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  // protectRoute(event);
  // protectAdminRoute(event);

  const { date, amount, description, userId } = await readBody(event);

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
          id: true,
          status: true,
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

  const status = user.loans.at(0)?.status;

  if (status === Status.ONGOING) {
    throw createError({
      statusCode: 400,
      message: 'کاربر وام تسویه نشده دارد.',
    });
  }

  const loan = await prisma.loan.create({
    data: {
      amount,
      date,
      description,
      debt: amount,
      user: {
        connect: {
          id: userId,
        },
      },
    },
    select: {
      id: true,
    },
  });

  return loan;
});
