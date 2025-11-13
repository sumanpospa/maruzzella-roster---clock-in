
import React, { useState, useEffect } from 'react';
// Fix: Corrected import path to be relative.
import { DayOfWeek, Shift, Employee } from '../types';

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { newShift: Shift; isRecurring: boolean; recurringDays: DayOfWeek[] }) => void;
    onDelete?: () => void;
    day: DayOfWeek;
    shift: Shift | null;
    employees: Employee[];
    employeeId?: number | null;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSave, onDelete, day, shift, employees, employeeId: preselectedEmployeeId }) => {
    const isEditing = shift !== null;
    const [employeeIds, setEmployeeIds] = useState<number[]>([]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [breakStartTime, setBreakStartTime] = useState('');
    const [breakEndTime, setBreakEndTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDays, setRecurringDays] = useState<Set<DayOfWeek>>(new Set());
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    
    const weekDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        if (!isOpen) {
            setIsConfirmingDelete(false); // Reset confirmation on close
            return;
        }

        if (shift) { // Editing
            setEmployeeIds(shift.employeeIds);
            setStartTime(shift.startTime || '');
            setEndTime(shift.endTime || '');
            setBreakStartTime(shift.breakStartTime || '');
            setBreakEndTime(shift.breakEndTime || '');
            setNotes(shift.notes || '');
            setIsRecurring(false);
            setRecurringDays(new Set());
        } else { // Adding
            setEmployeeIds(preselectedEmployeeId ? [preselectedEmployeeId] : []);
            setStartTime('09:00');
            setEndTime('17:00');
            setBreakStartTime('');
            setBreakEndTime('');
            setNotes('');
            setIsRecurring(false);
            setRecurringDays(new Set([day]));
        }
    }, [shift, isOpen, preselectedEmployeeId, day]);

    const handleRecurringDayChange = (dayOfWeek: DayOfWeek) => {
        setRecurringDays(prev => {
            const newDays = new Set(prev);
            if (newDays.has(dayOfWeek)) {
                newDays.delete(dayOfWeek);
            } else {
                newDays.add(dayOfWeek);
            }
            return newDays;
        });
    };

    const handleEmployeeSelection = (selectedId: number) => {
        setEmployeeIds(prev =>
            prev.includes(selectedId)
                ? prev.filter(id => id !== selectedId)
                : [...prev, selectedId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfirmingDelete(false); // Reset confirmation on save attempt

        const finalStartTime = startTime.trim();
        const finalEndTime = endTime.trim();
        const finalBreakStartTime = breakStartTime.trim();
        const finalBreakEndTime = breakEndTime.trim();
        const finalNotes = notes.trim();

        if (employeeIds.length === 0) {
            alert('Please select at least one employee.');
            return;
        }

        if (!finalStartTime && !finalEndTime && !finalNotes) {
            if (isEditing) {
                alert('To delete this shift, please use the "Delete Entry" button.');
            } else {
                alert('A shift must have either times or a status/note (e.g., "RDO").');
            }
            return;
        }

        if ((finalStartTime && !finalEndTime) || (!finalStartTime && finalEndTime)) {
            alert('Please provide both a start and end time for a timed shift.');
            return;
        }
        
        if (finalStartTime && finalEndTime && finalStartTime >= finalEndTime && finalEndTime !== "00:00") {
            const end = new Date(`1970-01-02T${finalEndTime}:00`);
            const start = new Date(`1970-01-01T${finalStartTime}:00`);
            if(end <= start) {
                alert('End time must be after start time, even for overnight shifts.');
                return;
            }
        }
        
        if ((finalBreakStartTime && !finalBreakEndTime) || (!finalBreakStartTime && finalBreakEndTime)) {
            alert('Please provide both a start and end time for the break.');
            return;
        }

        if (finalBreakStartTime && finalBreakEndTime && finalBreakStartTime >= finalBreakEndTime) {
            alert('Break end time must be after break start time.');
            return;
        }

        onSave({
            newShift: {
                employeeIds: employeeIds,
                startTime: finalStartTime || undefined,
                endTime: finalEndTime || undefined,
                breakStartTime: finalBreakStartTime || undefined,
                breakEndTime: finalBreakEndTime || undefined,
                notes: finalNotes || undefined
            },
            isRecurring: !isEditing && isRecurring,
            recurringDays: Array.from(recurringDays)
        });
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shift-modal-title"
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[calc(100vh-2rem)] animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-stone-200 shrink-0">
                  <h2 id="shift-modal-title" className="text-2xl font-bold text-slate-800 mb-2">{isEditing ? 'Edit Entry' : 'Add Entry'}</h2>
                  <p className="text-stone-500">for {day}</p>
                </div>
                
                {/* Scrollable Form Body */}
                <form id="shift-modal-form" onSubmit={handleSubmit} className="space-y-4 p-6 flex-1 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Employees</label>
                        <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border border-stone-300 p-3 bg-stone-50/50">
                            {employees.map(emp => (
                                <div key={emp.id} className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id={`employee-${emp.id}`}
                                            name="employees"
                                            type="checkbox"
                                            checked={employeeIds.includes(emp.id)}
                                            onChange={() => handleEmployeeSelection(emp.id)}
                                            className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-600"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor={`employee-${emp.id}`} className="font-medium text-slate-900 cursor-pointer">
                                            {emp.name} <span className="text-stone-500">({emp.role})</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-slate-900"
                            />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                            <input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-slate-900"
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="breakStartTime" className="block text-sm font-medium text-slate-700 mb-1">Break Start (Optional)</label>
                            <input
                                type="time"
                                id="breakStartTime"
                                value={breakStartTime}
                                onChange={(e) => setBreakStartTime(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-slate-900"
                            />
                        </div>
                        <div>
                            <label htmlFor="breakEndTime" className="block text-sm font-medium text-slate-700 mb-1">Break End (Optional)</label>
                            <input
                                type="time"
                                id="breakEndTime"
                                value={breakEndTime}
                                onChange={(e) => setBreakEndTime(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-slate-900"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes / Status (e.g., RDO)</label>
                        <input
                            type="text"
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder-stone-500"
                            placeholder="Optional notes or status"
                        />
                    </div>

                    {!isEditing && (
                        <div className="pt-2 border-t border-stone-200 mt-4">
                            <div className="relative flex items-start mt-4">
                                <div className="flex h-6 items-center">
                                    <input
                                        id="recurring-checkbox"
                                        aria-describedby="recurring-description"
                                        name="recurring"
                                        type="checkbox"
                                        checked={isRecurring}
                                        onChange={(e) => setIsRecurring(e.target.checked)}
                                        className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-600"
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label htmlFor="recurring-checkbox" className="font-medium text-slate-900">
                                        Recurring Entry
                                    </label>
                                    <p id="recurring-description" className="text-stone-500">
                                        Create this entry for multiple days this week.
                                    </p>
                                </div>
                            </div>
                            {isRecurring && (
                                <div className="mt-4 p-4 bg-stone-50 rounded-lg">
                                    <p className="text-sm font-medium text-slate-700 mb-3">Repeat on:</p>
                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                        {weekDays.map(d => (
                                            <button
                                                type="button"
                                                key={d}
                                                onClick={() => handleRecurringDayChange(d)}
                                                className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                                    recurringDays.has(d)
                                                    ? 'bg-orange-600 text-white shadow-sm'
                                                    : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
                                                }`}
                                            >
                                                {d.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </form>

                 {/* Footer */}
                <div className="p-6 pt-4 border-t border-stone-200 shrink-0">
                    <div className="flex justify-end items-center gap-3">
                        {isEditing && onDelete && (
                             <div className="mr-auto">
                                {!isConfirmingDelete ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmingDelete(true)}
                                        className="px-4 py-2 text-sm font-medium text-red-600 bg-transparent hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Delete Entry
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 animate-fade-in-fast">
                                        <button
                                            type="button"
                                            onClick={onDelete}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                        >
                                            Confirm Delete
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsConfirmingDelete(false)}
                                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-transparent hover:bg-stone-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="shift-modal-form"
                            className="px-5 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors"
                        >
                             {isEditing ? 'Save Changes' : 'Save Entry'}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ShiftModal;
