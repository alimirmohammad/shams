import { Role } from '~/server/generated/prisma/enums';
import { jwtVerify } from 'jose';

import { getPrisma } from '~/server/utils/prisma';

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

// Use route templates so diagnostics never include user IDs or query values.
function getDiagnosticRoute(path: string) {
  const pathname = path.split('?')[0] ?? '/';
  if (/^\/api\/auth\/(signin|signup|me|change-password)$/.test(pathname)) {
    return pathname;
  }
  if (/^\/api\/(people|loans|reports)$/.test(pathname)) return pathname;
  if (pathname === '/api/people/edit-person') return pathname;
  if (/^\/api\/people\/[^/]+\/(loan-bills|share-bills)$/.test(pathname)) {
    return pathname.endsWith('/loan-bills')
      ? '/api/people/:userId/loan-bills'
      : '/api/people/:userId/share-bills';
  }
  if (/^\/api\/reports\/[^/]+$/.test(pathname)) return '/api/reports/:id';
  return 'other';
}

function getDiagnosticErrorCode(error: unknown) {
  if (!error || typeof error !== 'object') return 'UNKNOWN';
  const details = error as { code?: unknown; errorCode?: unknown };
  const code = details.code ?? details.errorCode;
  if (typeof code !== 'string') return 'UNKNOWN';
  // Prisma codes, PostgreSQL SQLSTATEs, and common connection failures only.
  if (/^P\d{4}$/.test(code) || /^[0-9][0-9A-Z]{4}$/.test(code)) return code;
  if (
    ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'].includes(code)
  ) {
    return code;
  }
  return 'UNKNOWN';
}

export default defineEventHandler(async event => {
  event.context.user = null;
  const token = getCookie(event, 'token');
  if (!token) return;

  let userId: number;
  try {
    const config = useRuntimeConfig();
    const secret = new TextEncoder().encode(config.jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    if (
      typeof payload.userId !== 'number' ||
      !Number.isSafeInteger(payload.userId) ||
      payload.userId <= 0
    ) {
      return;
    }
    userId = payload.userId;
  } catch {
    // An expired, malformed, or unverifiable token is an unauthenticated request.
    return;
  }

  const startedAt = Date.now();
  try {
    const prisma = getPrisma(event);
    event.context.user = await prisma.user.findUnique({
      where: { id: userId },
      ...userSelect,
    });
  } catch (error) {
    console.error({
      event: 'auth_database_failure',
      route: getDiagnosticRoute(event.path),
      stage: 'user_lookup',
      durationMs: Date.now() - startedAt,
      code: getDiagnosticErrorCode(error),
    });
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'سرویس موقتاً در دسترس نیست. لطفاً دوباره تلاش کنید.',
    });
  }
});
