
import React, { useState } from 'react';
// Fix: Corrected import path to be relative.
import { DayOfWeek, Shift, Roster, Employee, Rosters } from '../types';
import ShiftModal from './ShiftModal';
import AiBriefing from './AiBriefing';

const COLORS = [
  'bg-emerald-100/70 border-l-4 border-emerald-400 text-emerald-900',
  'bg-sky-100/70 border-l-4 border-sky-400 text-sky-900',
  'bg-amber-100/70 border-l-4 border-amber-400 text-amber-900',
  'bg-rose-100/70 border-l-4 border-rose-400 text-rose-900',
  'bg-indigo-100/70 border-l-4 border-indigo-400 text-indigo-900',
  'bg-pink-100/70 border-l-4 border-pink-400 text-pink-900',
  'bg-lime-100/70 border-l-4 border-lime-400 text-lime-900',
  'bg-cyan-100/70 border-l-4 border-cyan-400 text-cyan-900',
  'bg-teal-100/70 border-l-4 border-teal-400 text-teal-900',
  'bg-purple-100/70 border-l-4 border-purple-400 text-purple-900',
];

// Helper function to get dates for the week
const getWeekDates = (weekOffset: number = 0): Date[] => {
    const now = new Date();
    const currentDay = now.getDay(); // Sunday - 0, Monday - 1, etc.
    const mondayOffset = (currentDay === 0 ? -6 : 1) - currentDay; // get to last Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + (weekOffset * 7));
    
    return Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return date;
    });
};

interface RosterViewProps {
    employees: Employee[];
    rosters: Rosters;
    setRosters: React.Dispatch<React.SetStateAction<Rosters>>;
    currentUser: Employee;
}

const RosterView: React.FC<RosterViewProps> = ({ employees, rosters, setRosters, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    day: DayOfWeek | null;
    employeeId: number | null;
    shift: Shift | null;
    shiftIndex: number | null;
  }>({ day: null, employeeId: null, shift: null, shiftIndex: null });
  const [isExporting, setIsExporting] = useState(false);
  const [viewingWeek, setViewingWeek] = useState<'currentWeek' | 'nextWeek'>('currentWeek');
  
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday is 0
  const today = days[todayIndex];
  
  const roster = rosters[viewingWeek];
  const dates = getWeekDates(viewingWeek === 'currentWeek' ? 0 : 1);

  const isManager = currentUser.role === 'Manager';

  const handleOpenModal = (day: DayOfWeek, employeeId: number | null = null, shift: Shift | null = null, shiftIndex: number | null = null) => {
    if (!isManager) return;
    setModalConfig({ day, employeeId, shift, shiftIndex });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveShift = ({ newShift, isRecurring, recurringDays }: { newShift: Shift; isRecurring: boolean; recurringDays: DayOfWeek[] }) => {
    const { day, shiftIndex } = modalConfig;

    setRosters(prev => {
        const newRosters = { ...prev };
        const targetRoster = { ...newRosters[viewingWeek] };

        if (isRecurring) { // Adding a new recurring shift
            recurringDays.forEach(d => {
                targetRoster[d] = [...targetRoster[d], newShift];
            });
        } else if (day && shiftIndex !== null) { // Editing an existing shift
            const dayShifts = [...targetRoster[day]];
            dayShifts[shiftIndex] = newShift;
            targetRoster[day] = dayShifts;
        } else if (day) { // Adding a single new shift
            targetRoster[day] = [...targetRoster[day], newShift];
        }
        
        newRosters[viewingWeek] = targetRoster;
        return newRosters;
    });

    handleCloseModal();
  };

  const handleDeleteShift = () => {
    const { day, shiftIndex } = modalConfig;
    if (day && shiftIndex !== null) {
      setRosters(prev => {
        const newRosters = { ...prev };
        const targetRoster = { ...newRosters[viewingWeek] };
        const dayShifts = [...targetRoster[day]];
        dayShifts.splice(shiftIndex, 1);
        targetRoster[day] = dayShifts;
        newRosters[viewingWeek] = targetRoster;
        return newRosters;
      });
    }
    handleCloseModal();
  };
  
  const handleCopyToNextWeek = () => {
    if (!isManager) return;
    if (window.confirm("Are you sure you want to replace next week's roster with the current week's schedule? This action cannot be undone.")) {
        setRosters(prev => ({
            ...prev,
            nextWeek: JSON.parse(JSON.stringify(prev.currentWeek)) // Deep copy
        }));
        alert("Current week's roster has been copied to next week.");
    }
  };

  const handleExportCsv = () => {
    if (!isManager) return;
    setIsExporting(true);

    const header = ['Employee', 'Role', ...days];
    
    try {
        const rows = employees.map(employee => {
            const rowData: string[] = [
                `"${employee.name.replace(/"/g, '""')}"`, 
                `"${employee.role.replace(/"/g, '""')}"`
            ];

            days.forEach(day => {
                const employeeShifts = roster[day]?.filter(s => s.employeeIds.includes(employee.id)) || [];
                const cellContent = employeeShifts.map(shift => {
                    const time = (shift.startTime && shift.endTime) ? `${shift.startTime} - ${shift.endTime}` : '';
                    const notes = shift.notes ? `(${shift.notes})` : '';
                    return [time, notes].filter(Boolean).join(' ').trim();
                }).join('\n'); // Join multiple shifts with a newline
                
                const escapedContent = cellContent.replace(/"/g, '""');
                rowData.push(`"${escapedContent}"`);
            });
            return rowData.join(',');
        });

        const csvContent = [header.join(','), ...rows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const weekIdentifier = viewingWeek === 'currentWeek' ? 'ThisWeek' : 'NextWeek';
        const dateStr = dates[0].toISOString().split('T')[0];
        link.setAttribute("href", url);
        link.setAttribute("download", `Maruzzella_Roster_${weekIdentifier}_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error generating CSV:", error);
        alert("Sorry, there was an error creating the CSV file.");
    } finally {
        setIsExporting(false);
    }
  };
  
  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Weekly Roster</h2>
                <div className="mt-2 flex items-center bg-stone-200/80 rounded-full p-1">
                    <button
                        onClick={() => setViewingWeek('currentWeek')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${viewingWeek === 'currentWeek' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-stone-100/50'}`}
                    >
                        This Week
                    </button>
                    <button
                        onClick={() => setViewingWeek('nextWeek')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${viewingWeek === 'nextWeek' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-stone-100/50'}`}
                    >
                        Next Week
                    </button>
                </div>
            </div>
            {isManager && (
                 <div className="flex items-center gap-2 self-start sm:self-center">
                    {viewingWeek === 'currentWeek' && (
                        <button
                            onClick={handleCopyToNextWeek}
                            className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-sky-700 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            Copy to Next Week
                        </button>
                    )}
                    <button
                        onClick={handleExportCsv}
                        disabled={isExporting}
                        className="bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            )}
        </div>

        {viewingWeek === 'currentWeek' && <AiBriefing todaysShifts={roster[today] || []} employees={employees} currentUser={currentUser} />}

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] sm:min-w-full border-collapse">
                    <thead className="bg-stone-50">
                        <tr className="border-b border-stone-300">
                            <th className="sticky left-0 bg-stone-50 p-3 text-sm font-semibold text-slate-600 z-30 min-w-[150px] sm:min-w-[180px] text-left border-r border-stone-300">
                                Employee
                            </th>
                            {days.map((day, i) => (
                                <th
                                    key={day}
                                    className={`sticky top-0 p-3 text-sm font-semibold text-slate-600 min-w-[120px] sm:min-w-[150px] md:min-w-0 z-10 text-left border-r border-stone-300 ${
                                        viewingWeek === 'currentWeek' && day === today ? 'bg-orange-100 text-orange-800' : 'bg-stone-50'
                                    }`}
                                >
                                    <div className="flex flex-col">
                                        <span>{day}</span>
                                        <span className="font-normal text-xs text-stone-500">
                                            {dates[i].toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee, index) => {
                            const rowBgClass = index % 2 === 0 ? 'bg-white' : 'bg-stone-50/80';
                            const hoverBgClass = 'group-hover:bg-amber-50';

                            return (
                                <tr key={employee.id} className="group border-b border-stone-200 last:border-b-0">
                                    <td className={`sticky left-0 p-3 z-20 transition-colors duration-150 border-r border-stone-300 ${rowBgClass} ${hoverBgClass}`}>
                                        <div className="font-bold text-slate-800">{employee.name}</div>
                                        <div className="text-xs text-stone-500">{employee.role}</div>
                                    </td>
                                    {days.map(day => {
                                        const employeeShifts = roster[day]?.filter(s => s.employeeIds.includes(employee.id)) || [];
                                        const todayClass = viewingWeek === 'currentWeek' && day === today ? 'bg-orange-50' : rowBgClass;
                                        
                                        return (
                                            <td
                                                key={`${day}-${employee.id}`}
                                                onClick={() => isManager && employeeShifts.length === 0 && handleOpenModal(day, employee.id)}
                                                className={`relative p-2 align-top min-h-[80px] transition-colors duration-150 border-r border-stone-300 ${todayClass} ${hoverBgClass} ${isManager && employeeShifts.length === 0 ? 'cursor-pointer hover:bg-orange-100/50' : ''}`}
                                            >
                                                <div className="space-y-1.5">
                                                    {employeeShifts.map((shift) => {
                                                        const originalIndex = roster[day].findIndex(s => s === shift);
                                                        const colorIndex = (shift.employeeIds[0] || 0) % COLORS.length;
                                                        const otherEmployeesOnShift = shift.employeeIds
                                                            .filter(id => id !== employee.id)
                                                            .map(id => employees.find(e => e.id === id))
                                                            .filter((e): e is Employee => !!e);

                                                        return (
                                                            <div
                                                                key={originalIndex}
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // prevent td click from firing
                                                                    if (isManager) handleOpenModal(day, null, shift, originalIndex)
                                                                }}
                                                                className={`p-2 rounded-lg text-xs ${isManager ? 'cursor-pointer hover:shadow-md' : ''} ${COLORS[colorIndex]} transition-shadow`}
                                                            >
                                                                <p className="font-bold">
                                                                    {shift.startTime && shift.endTime ? `${shift.startTime} - ${shift.endTime}` : ''}
                                                                </p>
                                                                {shift.breakStartTime && shift.breakEndTime && (
                                                                    <p className="text-slate-600/90 italic mt-0.5">
                                                                        Break: {shift.breakStartTime} - {shift.breakEndTime}
                                                                    </p>
                                                                )}
                                                                <p className="text-slate-700/80">{shift.notes || <span>&nbsp;</span>}</p>
                                                                {otherEmployeesOnShift.length > 0 && (
                                                                    <div className="flex -space-x-1.5 overflow-hidden mt-1.5">
                                                                        {otherEmployeesOnShift.map(otherEmp => (
                                                                            <div key={otherEmp.id} title={otherEmp.name} className="inline-block h-5 w-5 rounded-full ring-1 ring-white/50 text-xs flex items-center justify-center bg-slate-500/50 text-white font-semibold">
                                                                                {otherEmp.name.charAt(0)}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {isModalOpen && modalConfig.day && (
            <ShiftModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveShift}
            onDelete={handleDeleteShift}
            day={modalConfig.day}
            shift={modalConfig.shift}
            employees={employees}
            employeeId={modalConfig.employeeId}
            />
        )}
    </div>
  );
};

export default RosterView;