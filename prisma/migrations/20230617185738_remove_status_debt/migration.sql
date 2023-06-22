/*
  Warnings:

  - You are about to drop the column `debt` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Loan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "debt",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "Status";
