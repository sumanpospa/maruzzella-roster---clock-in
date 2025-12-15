import React, { useState, useEffect } from 'react';
import { Employee, TimeLog } from '../types';
import CustomTimePicker from './CustomTimePicker';

interface TimeLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (logData: TimeLog) => void;
    onDelete?: () => void;
    log: Partial<TimeLog> | null;
    employee: Employee;
}

// Helper to format Date to 'YYYY-MM-DD' for date input
const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Helper to format Date to 'HH:mm' for time input
const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5);
};

const TimeLogModal: React.FC<TimeLogModalProps> = ({ isOpen, onClose, onSave, onDelete, log, employee }) => {
    const isEditing = log && log.id;
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const [clockInDate, setClockInDate] = useState('');
    const [clockInTime, setClockInTime] = useState('');
    const [clockOutDate, setClockOutDate] = useState('');
    const [clockOutTime, setClockOutTime] = useState('');
    const [status, setStatus] = useState<TimeLog['status']>('pending');

    useEffect(() => {
        if (!isOpen) return;

        const now = new Date();
        const initialClockIn = log?.clockInTime ? new Date(log.clockInTime) : now;
        const initialClockOut = log?.clockOutTime ? new Date(log.clockOutTime) : null;

        setClockInDate(formatDateForInput(initialClockIn));
        setClockInTime(formatTimeForInput(initialClockIn));
        
        setClockOutDate(initialClockOut ? formatDateForInput(initialClockOut) : '');
        setClockOutTime(initialClockOut ? formatTimeForInput(initialClockOut) : '');

        setStatus(log?.status || (initialClockOut ? 'pending' : undefined));

    }, [log, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!clockInDate || !clockInTime) {
            alert('Clock-in date and time are required.');
            return;
        }

        const finalClockInTime = new Date(`${clockInDate}T${clockInTime}`);
        let finalClockOutTime: Date | null = null;

        if (clockOutDate && clockOutTime) {
            finalClockOutTime = new Date(`${clockOutDate}T${clockOutTime}`);
        }
        
        if (finalClockOutTime && finalClockInTime >= finalClockOutTime) {
            alert('Clock-out time must be after clock-in time.');
            return;
        }

        const newLogData: TimeLog = {
            id: log?.id || 0, // 0 for new, will be replaced in parent
            employeeId: employee.id,
            clockInTime: finalClockInTime,
            clockOutTime: finalClockOutTime,
            status: finalClockOutTime ? (status || 'pending') : undefined,
        };

        onSave(newLogData);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="timelog-modal-title"
        >
            <div 
                className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md animate-slide-up sm:animate-scale-in max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="p-6 overflow-y-auto flex-1">
                <h2 id="timelog-modal-title" className="text-2xl font-bold text-slate-800 mb-2">{isEditing ? 'Edit Time Entry' : 'Add Time Entry'}</h2>
                <p className="text-stone-500 mb-6">for {employee.name}</p>
                
                <div className="space-y-4">
                    <fieldset className="p-4 border border-stone-200 rounded-lg">
                        <legend className="px-2 text-sm font-medium text-slate-600">Clock In</legend>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="clockInDate" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    id="clockInDate"
                                    value={clockInDate}
                                    onChange={(e) => setClockInDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                {isMobile || isEditing ? (
                                    <CustomTimePicker
                                        id="clockInTime"
                                        label="Time"
                                        value={clockInTime}
                                        onChange={setClockInTime}
                                        required
                                    />
                                ) : (
                                    <>
                                        <label htmlFor="clockInTime" className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            id="clockInTime"
                                            value={clockInTime}
                                            onChange={(e) => setClockInTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </fieldset>
                    
                    <fieldset className="p-4 border border-stone-200 rounded-lg">
                        <legend className="px-2 text-sm font-medium text-slate-600">Clock Out</legend>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="clockOutDate" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    id="clockOutDate"
                                    value={clockOutDate}
                                    onChange={(e) => setClockOutDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                {isMobile || isEditing ? (
                                    <CustomTimePicker
                                        id="clockOutTime"
                                        label="Time"
                                        value={clockOutTime}
                                        onChange={setClockOutTime}
                                    />
                                ) : (
                                    <>
                                        <label htmlFor="clockOutTime" className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            id="clockOutTime"
                                            value={clockOutTime}
                                            onChange={(e) => setClockOutTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    {(clockOutDate && clockOutTime) && (
                        <div>
                             <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                             <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TimeLog['status'])}
                                className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                             >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                             </select>
                        </div>
                    )}
                </div>
                </div>
                    
                    <div className="flex flex-col gap-3 p-4 sm:p-6 border-t border-stone-200 bg-white">
                        <button
                            type="submit"
                            className="w-full px-5 py-3 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors"
                        >
                             {isEditing ? 'Save Changes' : 'Save Entry'}
                        </button>
                        
                        {isEditing && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this time log?')) {
                                        onDelete();
                                    }
                                }}
                                className="w-full px-5 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                            >
                                Delete Entry
                            </button>
                        )}
                        
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full px-4 py-3 text-sm font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
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
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default TimeLogModal;
