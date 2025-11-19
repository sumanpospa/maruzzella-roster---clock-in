
import React, { useState } from 'react';
// Fix: Corrected import path to be relative.
import { DayOfWeek, Shift, Roster, Employee, Rosters } from '../types';
import ShiftModal from './ShiftModal';
import AiBriefing from './AiBriefing';
import { generateRosterPDF } from '../utils/pdfGenerator';

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

  const handleShareWhatsApp = () => {
    setIsExporting(true);
    try {
      const weekLabel = viewingWeek === 'currentWeek' ? 'Current Week' : 'Next Week';
      const pdfDataUrl = generateRosterPDF(roster, employees, weekLabel, dates);
      
      // Create a message for WhatsApp
      const message = `🍕 Maruzzella Staff Roster - ${weekLabel}\n\nWeek: ${dates[0].toLocaleDateString('en-GB')} - ${dates[6].toLocaleDateString('en-GB')}\n\nRoster has been generated. Please check the PDF for full details.`;
      
      // Open WhatsApp with pre-filled message
      // Note: WhatsApp Web doesn't support file attachments via URL, so we'll download the PDF and user can manually attach
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      
      // Also trigger PDF download so user can attach it
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = `Maruzzella_Roster_${weekLabel.replace(' ', '_')}_${dates[0].toISOString().split('T')[0]}.pdf`;
      link.click();
      
      // Open WhatsApp after a short delay
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 500);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
                        onClick={handleShareWhatsApp}
                        disabled={isExporting}
                        className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transform hover:scale-105 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        {isExporting ? 'Generating...' : 'Share via WhatsApp'}
                    </button>
                </div>
            )}
        </div>

        {viewingWeek === 'currentWeek' && <AiBriefing todaysShifts={roster[today] || []} employees={employees} currentUser={currentUser} />}

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
                <table className="w-full min-w-[800px] sm:min-w-full border-collapse">
                    <thead className="bg-stone-50">
                        <tr className="border-b border-stone-300">
                            <th className="sticky left-0 top-0 bg-stone-50 p-3 text-sm font-semibold text-slate-600 z-30 min-w-[150px] sm:min-w-[180px] text-left border-r border-stone-300 shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                                Employee
                            </th>
                            {days.map((day, i) => (
                                <th
                                    key={day}
                                    className={`sticky top-0 p-3 text-sm font-semibold text-slate-600 min-w-[120px] sm:min-w-[150px] md:min-w-0 text-left border-r border-stone-300 z-20 ${
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
                                    <td className={`sticky left-0 p-3 z-20 transition-colors duration-150 border-r border-stone-300 shadow-[2px_0_4px_rgba(0,0,0,0.05)] ${rowBgClass} ${hoverBgClass}`}>
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