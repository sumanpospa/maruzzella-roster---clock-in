
export type EmployeeRole = 'Manager' | 'Chef' | 'Cook' | 'Kitchen Hand' | 'Supervisor' | 'Bar Tender' | 'Food Runner';

export type Department = 'Kitchen' | 'FOH' | 'Stewarding';

export interface Employee {
  id: number;
  name: string;
  role: EmployeeRole;
  pin: string; // 4-digit string
  department: Department; // Kitchen, FOH, or Stewarding
}

export interface Shift {
  employeeIds: number[];
  startTime?: string; // e.g., "09:00"
  endTime?: string;   // e.g., "17:00"
  notes?: string;     // e.g., "RDO", "Opening Shift"
  breakStartTime?: string;
  breakEndTime?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type Roster = Record<DayOfWeek, Shift[]>;

export interface TimeLog {
  id: number;
  employeeId: number;
  clockInTime: Date;
  clockOutTime: Date | null;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ClockStatus {
    status: 'in' | 'out';
    time: Date | null;
}

export interface Rosters {
  currentWeek: Roster;
  nextWeek: Roster;
}
