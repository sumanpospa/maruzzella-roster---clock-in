Migration: add_time_logs

Description
-- Adds three tables to the PostgreSQL database used by Prisma:
  - Shift: stores roster shift records (week, day, start/end times, notes)
  - ShiftAssignment: relation between Shift and Employee
  - TimeLog: canonical time log records with clockIn/clockOut timestamps

How to apply
1. Ensure `DATABASE_URL` is configured in `server/.env` or your environment.
2. From `server/` run:

   npx prisma migrate deploy --preview-feature

   or for local development:

   npx prisma migrate dev --name add_time_logs

Notes
- This migration file is provided for convenience; Prisma will generate its own migrations when you run `prisma migrate`.
- After applying migration, run `npm run build` in `server/` to regenerate the Prisma client.
