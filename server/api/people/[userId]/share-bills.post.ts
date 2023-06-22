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

  const shareBill = await prisma.shareBill.upsert({
    where: {
      id,
    },
    create: {
      ...payload,
      user: {
        connect: {
          id: userId,
        },
      },
    },
    update: payload,
  });

  return shareBill;
});
