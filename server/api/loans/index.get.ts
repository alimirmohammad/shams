import { prisma } from '~/server/utils/prisma';
import { Prisma } from '~/server/generated/prisma/client';

const PAGE_SIZE = 15;

type LoanRow = {
  id: number;
  amount: number;
  date: Date;
  description: string | null;
  debt: number;
  userId: number;
  firstName: string;
  lastName: string;
};

export default defineEventHandler(async event => {
  protectRoute(event);
  protectAdminRoute(event);

  const query = getQuery(event);
  const status = query.status === 'settled' ? 'settled' : 'unsettled';
  const page = Math.max(1, Number(query.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Debt is a computed aggregate (loan amount minus paid bills), so it can't be
  // filtered/paginated through Prisma's `where`. We express it in raw SQL and
  // filter with HAVING on the aggregated debt.
  const debtExpr = Prisma.sql`l."amount" - COALESCE(SUM(lb."amount"), 0)`;
  const havingClause =
    status === 'settled'
      ? Prisma.sql`HAVING ${debtExpr} <= 0`
      : Prisma.sql`HAVING ${debtExpr} > 0`;

  // Fetch one extra row to know whether there is a next page.
  const rows = await prisma.$queryRaw<LoanRow[]>`
    SELECT
      l."id",
      l."amount",
      l."date",
      l."description",
      (${debtExpr})::int AS "debt",
      u."id" AS "userId",
      u."firstName",
      u."lastName"
    FROM "Loan" l
    JOIN "User" u ON u."id" = l."userId"
    LEFT JOIN "LoanBill" lb ON lb."loanId" = l."id"
    GROUP BY l."id", u."id"
    ${havingClause}
    ORDER BY l."date" DESC
    LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}
  `;

  const hasNextPage = rows.length > PAGE_SIZE;
  const loans = rows.slice(0, PAGE_SIZE).map(row => ({
    id: row.id,
    amount: row.amount,
    date: row.date,
    description: row.description ?? '',
    debt: row.debt,
    user: {
      id: row.userId,
      firstName: row.firstName,
      lastName: row.lastName,
    },
  }));

  // Total outstanding debt across every loan (settled loans contribute 0).
  // Equals sum(all loan amounts) - sum(all paid bills) since no loan is overpaid.
  const [loanSum, billSum] = await Promise.all([
    prisma.loan.aggregate({ _sum: { amount: true } }),
    prisma.loanBill.aggregate({ _sum: { amount: true } }),
  ]);
  const totalDebt = (loanSum._sum.amount ?? 0) - (billSum._sum.amount ?? 0);

  return {
    loans,
    nextPage: hasNextPage ? page + 1 : null,
    totalDebt,
  };
});
