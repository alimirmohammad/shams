import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  const { phoneNumber, password } = await readBody(event);

  if (!phoneNumber || !password)
    throw createError({
      statusCode: 400,
      message: 'پر کردن همه فیلدها الزامی است.',
    });

  const user = await prisma.user.findFirst({ where: { phoneNumber } });
  if (!user)
    throw createError({
      statusCode: 404,
      message: 'این شماره قبلا ثبت نشده است.',
    });

  const match = await compare(password, user.password);

  if (!match)
    throw createError({
      statusCode: 401,
      message: 'رمز عبور نادرست است.',
    });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  setCookie(event, 'token', token, { maxAge: 60 * 60 });

  return {
    role: user.role,
    id: user.id,
    mustChangePassword: user.mustChangePassword,
  };
});
