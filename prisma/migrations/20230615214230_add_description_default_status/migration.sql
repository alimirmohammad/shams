-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "description" TEXT,
ALTER COLUMN "status" SET DEFAULT 'ONGOING';

-- AlterTable
ALTER TABLE "LoanBill" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "ShareBill" ADD COLUMN     "description" TEXT;
