-- Migration: add_time_logs
-- Added tables: Shift, ShiftAssignment, TimeLog

BEGIN;

-- Create Shift table
CREATE TABLE IF NOT EXISTS "Shift" (
  "id" SERIAL PRIMARY KEY,
  "week" TEXT NOT NULL,
  "day" TEXT NOT NULL,
  "startTime" TEXT,
  "endTime" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- Create ShiftAssignment table
CREATE TABLE IF NOT EXISTS "ShiftAssignment" (
  "id" SERIAL PRIMARY KEY,
  "shiftId" INTEGER NOT NULL,
  "employeeId" INTEGER NOT NULL,
  CONSTRAINT fk_shift FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE CASCADE,
  CONSTRAINT fk_employee_shiftassign FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shiftassignment_shiftid ON "ShiftAssignment" ("shiftId");
CREATE INDEX IF NOT EXISTS idx_shiftassignment_employeeid ON "ShiftAssignment" ("employeeId");

-- Create TimeLog table
CREATE TABLE IF NOT EXISTS "TimeLog" (
  "id" SERIAL PRIMARY KEY,
  "employeeId" INTEGER NOT NULL,
  "clockIn" TIMESTAMP(3) NOT NULL,
  "clockOut" TIMESTAMP(3),
  "status" TEXT,
  "date" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  CONSTRAINT fk_employee_timelog FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_timelog_employeeid ON "TimeLog" ("employeeId");
CREATE INDEX IF NOT EXISTS idx_timelog_clockin ON "TimeLog" ("clockIn");

COMMIT;
