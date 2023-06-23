import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  // protectRoute(event);
  // protectAdminRoute(event);

  const id = getRouterParam(event, 'id');
  if (!id || isNaN(+id) || !Number.isInteger(+id)) {
    throw createError({
      statusCode: 400,
      message: 'شناسه گزارش نادرست است.',
    });
  }

  const report = await prisma.report.findUnique({
    where: {
      id: +id,
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  if (!report) {
    throw createError({
      statusCode: 404,
      message: 'گزارش مورد نظر یافت نشد.',
    });
  }

  return report;
});
