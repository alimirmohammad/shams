/*
  Warnings:

  - You are about to drop the column `shares` on the `User` table. All the data in the column will be lost.
  - Added the required column `numOfShares` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "shares",
ADD COLUMN     "numOfShares" INTEGER NOT NULL,
ALTER COLUMN "balance" SET DEFAULT 0;
