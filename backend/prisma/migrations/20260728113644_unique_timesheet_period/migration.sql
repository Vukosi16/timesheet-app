/*
  Warnings:

  - A unique constraint covering the columns `[userId,periodMonth]` on the table `Timesheet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Timesheet_userId_periodMonth_key" ON "Timesheet"("userId", "periodMonth");
