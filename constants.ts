import { Employee, Roster } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  // Kitchen Team (11 employees)
  { id: 1, name: 'Huda', role: 'Manager', pin: '1111', department: 'Kitchen' },
  { id: 2, name: 'Suman', role: 'Manager', pin: '2222', department: 'Kitchen' },
  { id: 3, name: 'Luca', role: 'Chef', pin: '3333', department: 'Kitchen' },
  { id: 4, name: 'Dennis', role: 'Chef', pin: '4444', department: 'Kitchen' },
  { id: 5, name: 'Enrico', role: 'Chef', pin: '5555', department: 'Kitchen' },
  { id: 6, name: 'Sundesh', role: 'Chef', pin: '6666', department: 'Kitchen' },
  { id: 7, name: 'Siyam', role: 'Chef', pin: '7777', department: 'Kitchen' },
  { id: 8, name: 'Taki', role: 'Chef', pin: '8888', department: 'Kitchen' },
  { id: 9, name: 'Tanbir', role: 'Chef', pin: '9999', department: 'Kitchen' },
  { id: 10, name: 'Progganur', role: 'Chef', pin: '1010', department: 'Kitchen' },
  { id: 11, name: 'Fareeq', role: 'Chef', pin: '1112', department: 'Kitchen' },

  // FOH Team (1 manager)
  { id: 12, name: 'Manager FOH', role: 'Manager', pin: '1212', department: 'FOH' },

  // Stewarding Team (5 employees - 1 manager + 4 staff)
  { id: 13, name: 'Manager STW', role: 'Manager', pin: '1313', department: 'Stewarding' },
  { id: 14, name: 'mushfiq', role: 'Staff', pin: '1414', department: 'Stewarding' },
  { id: 15, name: 'mani', role: 'Staff', pin: '1515', department: 'Stewarding' },
  { id: 16, name: 'Ishraq', role: 'Staff', pin: '1616', department: 'Stewarding' },
  { id: 17, name: 'Ashfaq', role: 'Staff', pin: '1717', department: 'Stewarding' },
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
