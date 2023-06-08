import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '~/utils/prisma';

export default defineEventHandler(async event => {
  const { phoneNumber, password } = await readBody(event);

  if (!phoneNumber || !password)
    throw createError('پر کردن همه فیلدها الزامی است.');

  const user = await prisma.user.findFirst({ where: { phoneNumber } });
  if (!user) throw createError('این شماره قبلا ثبت نشده است.');

  const match = await compare(password, user.password);

  if (!match) throw createError('رمز عبور نادرست است.');

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  return { userId: user.id, token };
});
