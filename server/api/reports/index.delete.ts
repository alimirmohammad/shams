import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  protectRoute(event);
  protectAdminRoute(event);

  const { id } = await readBody(event);

  if (!id)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

  await prisma.report.delete({
    where: { id },
  });

  return { success: true };
});
