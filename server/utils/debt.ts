export function calculateDebt(
  loans: {
    amount: number;
    bills: {
      amount: number;
    }[];
  }[]
): number {
  const lastLoan = loans.at(0);
  const totalPaid = (lastLoan?.bills ?? []).reduce(
    (acc, cur) => acc + cur.amount,
    0
  );
  const lastLoanAmount = lastLoan?.amount ?? 0;
  return lastLoanAmount - totalPaid;
}
