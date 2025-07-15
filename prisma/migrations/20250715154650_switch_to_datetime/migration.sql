/*
  Warnings:

  - You are about to drop the column `day` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Availability` table. All the data in the column will be lost.
  - Added the required column `endDateTime` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDateTime` to the `Availability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "day",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "endDateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDateTime" TIMESTAMP(3) NOT NULL;
