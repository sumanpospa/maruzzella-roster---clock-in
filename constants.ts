import { Employee, Roster } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  // Kitchen Team (10 employees)
  { id: 1, name: 'Huda', role: 'Manager', pin: '1234', department: 'Kitchen' },
  { id: 2, name: 'Suman', role: 'Manager', pin: '1234', department: 'Kitchen' },
  { id: 3, name: 'Luca', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 4, name: 'Dennis', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 5, name: 'Enrico', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 6, name: 'Sundesh', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 7, name: 'Siyam', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 8, name: 'Taki', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 9, name: 'Tanbir', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 10, name: 'Progganur', role: 'Chef', pin: '1234', department: 'Kitchen' },
  
  // FOH Team (6 employees - 1 manager + 5 staff)
  { id: 11, name: 'Manager FOH', role: 'Manager', pin: '1234', department: 'FOH' },
  { id: 12, name: 'Marco', role: 'Waiter', pin: '1234', department: 'FOH' },
  { id: 13, name: 'Sofia', role: 'Waiter', pin: '1234', department: 'FOH' },
  { id: 14, name: 'Giovanni', role: 'Bar Tender', pin: '1234', department: 'FOH' },
  { id: 15, name: 'Isabella', role: 'Food Runner', pin: '1234', department: 'FOH' },
  { id: 16, name: 'Alessandro', role: 'Supervisor', pin: '1234', department: 'FOH' },
  
  // Stewarding Team (6 employees - 1 manager + 5 staff)
  { id: 17, name: 'Manager STW', role: 'Manager', pin: '1234', department: 'Stewarding' },
  { id: 18, name: 'Ahmed', role: 'Dishwasher', pin: '1234', department: 'Stewarding' },
  { id: 19, name: 'Raj', role: 'Dishwasher', pin: '1234', department: 'Stewarding' },
  { id: 20, name: 'Carlos', role: 'Cleaner', pin: '1234', department: 'Stewarding' },
  { id: 21, name: 'Miguel', role: 'Cleaner', pin: '1234', department: 'Stewarding' },
  { id: 22, name: 'Kumar', role: 'Dishwasher', pin: '1234', department: 'Stewarding' },
];

export const WEEKLY_ROSTER: Roster = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
};