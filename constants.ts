import { Employee, Roster } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
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
  { id: 11, name: 'Manager FOH', role: 'Manager', pin: '1234', department: 'FOH' },
  { id: 12, name: 'Manager STW', role: 'Manager', pin: '1234', department: 'Stewarding' },
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