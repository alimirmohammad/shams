import { hash } from 'bcrypt';
import { prisma } from '~/server/utils/prisma';
import { userSelect } from '~/server/middleware/auth';
import protectAdminRoute from '~/server/utils/protectAdminRoute';
import protectRoute from '~/server/utils/protectRoute';

export default defineEventHandler(async event => {
  // protectRoute(event);
  // protectAdminRoute(event);
  const { phoneNumber, firstName, lastName, numOfShares, id } = await readBody(
    event
  );

  if (!phoneNumber || !firstName || !lastName || !numOfShares || !id)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

  const user = await prisma.user.update({
    where: { id },
    data: {
      firstName,
      lastName,
      numOfShares,
      phoneNumber,
    },
    ...userSelect,
  });

  return user;
});
