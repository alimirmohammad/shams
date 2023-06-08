import { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '~/utils/prisma';

export default defineEventHandler(async event => {
  const { phoneNumber, password, firstName, lastName, numOfShares } =
    await readBody(event);

  if (!phoneNumber || !password || !firstName || !lastName || !numOfShares)
    throw createError('پر کردن همه فیلدها الزامی است.');

  const existingUser = await prisma.user.findFirst({ where: { phoneNumber } });
  if (existingUser) throw createError('این شماره قبلا ثبت شده است.');

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      numOfShares,
      phoneNumber,
      password: hashedPassword,
    },
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  return { userId: user.id, token };
});
