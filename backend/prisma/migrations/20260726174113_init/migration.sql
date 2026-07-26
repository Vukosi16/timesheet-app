-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COACH', 'ADMIN');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('STAGING', 'SUBMITTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('TRAINING', 'MATCH', 'REF_KIDS', 'REF_ADULT', 'MISC');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timesheet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedDate" TIMESTAMP(3),
    "periodMonth" TIMESTAMP(3) NOT NULL,
    "stage" "Stage" NOT NULL DEFAULT 'STAGING',
    "adminMessage" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimesheetEntry" (
    "id" SERIAL NOT NULL,
    "timesheetId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,

    CONSTRAINT "TimesheetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LookupActivity" (
    "id" SERIAL NOT NULL,
    "activity" "ActivityType" NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "LookupActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LookupActivity_activity_key" ON "LookupActivity"("activity");

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetEntry" ADD CONSTRAINT "TimesheetEntry_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
