import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { prisma } from '~/server/utils/prisma';

export const userSelect = Prisma.validator<Prisma.UserArgs>()({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
    numOfShares: true,
    role: true,
    mustChangePassword: true,
  },
});

export type UserBaseData = Prisma.UserGetPayload<typeof userSelect>;

export default defineEventHandler(async event => {
  const config = useRuntimeConfig();

  let user: UserBaseData | null = null;
  const token = getCookie(event, 'token');
  if (token) {
    try {
      const { userId } = jwt.verify(token, config.jwtSecret) as JwtPayload;

      user = await prisma.user.findUnique({
        where: { id: userId },
        ...userSelect,
      });
    } catch (error) {
      console.error(error);
    }
  }
  event.context.user = user;
});
