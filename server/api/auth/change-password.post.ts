import { hash } from 'bcryptjs';

export default defineEventHandler(async event => {
  const user = protectRoute(event);
  const { password } = await readBody<{ password: string }>(event);
  if (!password) {
    throw createError({
      statusCode: 400,
      message: 'رمز عبور الزامی است.',
    });
  }
  const hashedPassword = await hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, mustChangePassword: false },
  });
  deleteCookie(event, 'token');
  return { message: 'رمز عبور با موفقیت تغییر یافت' };
});
