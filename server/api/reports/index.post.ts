import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  protectRoute(event);
  protectAdminRoute(event);

  const { title, description, id } = await readBody(event);

  if (!title || !description)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

  const payload = {
    title,
    description,
  };

  const select = {
    id: true,
    title: true,
    description: true,
  };

  if (id) {
    return prisma.report.update({
      where: { id },
      data: payload,
      select,
    });
  }

  return prisma.report.create({
    data: payload,
    select,
  });
});
