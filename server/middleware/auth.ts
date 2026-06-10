import { Role } from '@prisma/client';
import { jwtVerify } from 'jose';

import { prisma } from '~/server/utils/prisma';

export const userSelect = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
    numOfShares: true,
    role: true,
    mustChangePassword: true,
  },
};

export type UserBaseData = {
  id: number;
  role: Role;
  mustChangePassword: boolean;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  numOfShares: number;
};

export default defineEventHandler(async event => {
  const config = useRuntimeConfig();

  let user: UserBaseData | null = null;
  const token = getCookie(event, 'token');
  if (token) {
    try {
      const secret = new TextEncoder().encode(config.jwtSecret);
      const { payload } = await jwtVerify(token, secret);
      const { userId } = payload as { userId: number };

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
