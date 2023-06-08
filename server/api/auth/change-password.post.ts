import { hash } from 'bcrypt';
import { UserBaseData } from '~~/server/middleware/auth';

export default defineEventHandler(async event => {
  protectRoute(event);
  const { password } = await readBody(event);
  if (!password) {
    throw createError({
      statusCode: 400,
      message: 'رمز عبور الزامی است.',
    });
  }

  const user: UserBaseData = event.context.user;
  const hashedPassword = await hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });
  return { message: 'رمز عبور با موفقیت تغییر یافت.' };
});
