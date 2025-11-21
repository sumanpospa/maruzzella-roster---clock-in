

import React, { useState, useEffect, useMemo } from 'react';
// Fix: Corrected import path to be relative.
import { Employee, TimeLog, ClockStatus, Department } from '../types';

interface EmployeeClockCardProps {
    employee: Employee;
    status: ClockStatus;
    onClockIn: (id: number) => void;
    onClockOut: (id: number) => void;
}

const EmployeeClockCard: React.FC<EmployeeClockCardProps> = ({ employee, status, onClockIn, onClockOut }) => {
    const isClockedIn = status.status === 'in';
    const timeString = status.time 
        ? status.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : '--:--';

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <p className="font-bold text-lg text-slate-800">{employee.name}</p>
                <p className="text-stone-500">{employee.role}</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-center flex-grow sm:flex-grow-0">
                    <p className={`font-mono text-xl font-semibold ${isClockedIn ? 'text-green-600' : 'text-slate-500'}`}>{timeString}</p>
                    <p className={`text-xs font-medium uppercase tracking-wider ${isClockedIn ? 'text-green-500' : 'text-slate-400'}`}>
                        {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                    </p>
                </div>
                {isClockedIn ? (
                    <button 
                        onClick={() => onClockOut(employee.id)}
                        className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                    >
                        Clock Out
                    </button>
                ) : (
                    <button 
                        onClick={() => onClockIn(employee.id)}
                        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                    >
                        Clock In
                    </button>
                )}
            </div>
        </div>
    );
}

interface ClockInViewProps {
    employees: Employee[];
    timeLogs: TimeLog[];
    setTimeLogs: React.Dispatch<React.SetStateAction<TimeLog[]>>;
    currentUser: Employee;
    onNavigateToPayroll: () => void;
}

const ClockInView: React.FC<ClockInViewProps> = ({ employees, timeLogs, setTimeLogs, currentUser, onNavigateToPayroll }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isManager = currentUser.role === 'Manager';

  // Filter by current user's department only
  const filteredEmployees = employees.filter(e => e.department === currentUser.department);

  // Then filter for non-managers (show only themselves)
  const employeesToDisplay = isManager ? filteredEmployees : filteredEmployees.filter(e => e.id === currentUser.id);

  const employeeClockStatus = useMemo(() => {
    const statusMap = new Map<number, ClockStatus>();
    employees.forEach(employee => {
        const lastLog = timeLogs
            .filter(log => log.employeeId === employee.id)
            .sort((a, b) => b.clockInTime.getTime() - a.clockInTime.getTime())[0];
        
        if (lastLog && lastLog.clockOutTime === null) {
            statusMap.set(employee.id, { status: 'in', time: lastLog.clockInTime });
        } else {
            statusMap.set(employee.id, { status: 'out', time: lastLog?.clockOutTime || null });
        }
    });
    return statusMap;
  }, [employees, timeLogs]);


  const handleClockIn = (employeeId: number) => {
    if (employeeClockStatus.get(employeeId)?.status === 'in') {
      alert('This employee is already clocked in.');
      return;
    }
    const newLog: TimeLog = {
      id: Date.now(),
      employeeId,
      clockInTime: new Date(),
      clockOutTime: null,
    };
    setTimeLogs(prev => [...prev, newLog]);
  };

  const handleClockOut = (employeeId: number) => {
    setTimeLogs(prev => {
        const newLogs = [...prev];
        // Fix: Replaced `findLastIndex` with a manual reverse loop for broader JS environment compatibility.
        let activeLogIndex = -1;
        for (let i = newLogs.length - 1; i >= 0; i--) {
            if (newLogs[i].employeeId === employeeId && newLogs[i].clockOutTime === null) {
                activeLogIndex = i;
                break;
            }
        }

        if (activeLogIndex === -1) {
            alert('Error: Cannot find an active shift to clock out from.');
            return prev;
        }

        newLogs[activeLogIndex] = {
            ...newLogs[activeLogIndex],
            clockOutTime: new Date(),
            status: 'pending',
        };
        return newLogs;
    });
  };

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Time Clock - {currentUser.department}</h2>
                <p className="text-stone-600">{isManager ? "Manage clock-ins for your department." : "Clock in or out for your shift."}</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onNavigateToPayroll}
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-blue-700 transform hover:scale-105 flex items-center gap-2"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {isManager ? 'View Hours' : 'My Hours'}
                </button>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-stone-200 text-center">
                    <p className="font-mono text-3xl font-bold text-orange-600">
                        {currentTime.toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </div>

      <div className="space-y-4">
        {employeesToDisplay.map(employee => {
            const status = employeeClockStatus.get(employee.id) || { status: 'out', time: null };
            return (
                <EmployeeClockCard 
                    key={employee.id}
                    employee={employee}
                    status={status}
                    onClockIn={handleClockIn}
                    onClockOut={handleClockOut}
                />
            );
        })}
      </div>
    </div>
  );
};

export default ClockInView;