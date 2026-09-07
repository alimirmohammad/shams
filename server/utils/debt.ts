export function calculateDebt(loan: Loan): number {
  const totalPaid = loan.bills.reduce((acc, cur) => acc + cur.amount, 0);
  return loan.amount - totalPaid;
}

export function calculateTotalDebt(loans: Loan[]): number {
  return loans.reduce((acc, loan) => acc + calculateDebt(loan), 0);
}

type Loan = {
  amount: number;
  bills: {
    amount: number;
  }[];
};
