import { hash } from 'bcrypt';
import { prisma } from '~/server/utils/prisma';
import { userSelect } from '~~/server/middleware/auth';
import protectAdminRoute from '~~/server/utils/protectAdminRoute';
import protectRoute from '~~/server/utils/protectRoute';

export default defineEventHandler(async event => {
  protectRoute(event);
  protectAdminRoute(event);
  const { phoneNumber, firstName, lastName, numOfShares } = await readBody(
    event
  );

  if (!phoneNumber || !firstName || !lastName || !numOfShares)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

  const existingUser = await prisma.user.findFirst({ where: { phoneNumber } });
  if (existingUser)
    throw createError({
      statusCode: 400,
      message: 'این شماره قبلا ثبت شده است.',
    });

  const hashedPassword = await hash(phoneNumber, 12);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      numOfShares,
      phoneNumber,
      password: hashedPassword,
    },
    ...userSelect,
  });

  return user;
});
