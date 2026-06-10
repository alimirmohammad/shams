import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';

import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async event => {
  const config = useRuntimeConfig();

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

  const secret = new TextEncoder().encode(config.jwtSecret);
  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);

  setCookie(event, 'token', token, { maxAge: 60 * 60 });

  return {
    role: user.role,
    id: user.id,
    mustChangePassword: user.mustChangePassword,
  };
});
