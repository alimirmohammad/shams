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

  const { id } = await readBody(event);

  if (!id)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

  await prisma.loanBill.delete({
    where: { id },
  });

  return { success: true };
});
