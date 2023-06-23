import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  // protectRoute(event);
  // protectAdminRoute(event);

  const reports = await prisma.report.findMany({
    select: {
      id: true,
      title: true,
      description: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reports;
});
