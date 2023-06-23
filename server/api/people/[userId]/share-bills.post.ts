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

  const { date, amount, description, id } = await readBody(event);

  if (!date || !amount)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

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
  };

  if (id) {
    return prisma.shareBill.update({
      where: { id },
      data: payload,
      select,
    });
  }

  return prisma.shareBill.create({
    data: {
      ...payload,
      user: {
        connect: {
          id: +userId,
        },
      },
    },
    select,
  });
});
