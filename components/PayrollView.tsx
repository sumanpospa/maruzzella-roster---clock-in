import React, { useState } from 'react';
// Fix: Corrected import path to be relative.
import { Employee, TimeLog, Department } from '../types';
import TimeLogModal from './TimeLogModal';

const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 0) return '0h 0m';
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
};

const formatHoursDecimal = (milliseconds: number): string => {
    if (milliseconds <= 0) return '0.00';
    const hours = milliseconds / (1000 * 60 * 60);
    return hours.toFixed(2);
}

const formatDate = (date: Date): string => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const StatusBadge: React.FC<{ status: TimeLog['status'] }> = ({ status }) => {
    switch (status) {
        case 'approved':
            return <span className="font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Approved</span>;
        case 'rejected':
            return <span className="font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Rejected</span>;
        case 'pending':
            return <span className="font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">Pending</span>;
        default:
            return <span className="font-semibold px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs">Active</span>;
    }
}

interface PayrollViewProps {
    employees: Employee[];
    timeLogs: TimeLog[];
    setTimeLogs: React.Dispatch<React.SetStateAction<TimeLog[]>>;
    currentUser: Employee;
}

const PayrollView: React.FC<PayrollViewProps> = ({ employees, timeLogs, setTimeLogs, currentUser }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<{ log: Partial<TimeLog> | null; employee: Employee | null }>({ log: null, employee: null });

    const handleOpenModal = (log: Partial<TimeLog> | null, employee: Employee) => {
        setEditingLog({ log, employee });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLog({ log: null, employee: null });
    };
    
    const handleSaveLog = (logData: TimeLog) => {
        setTimeLogs(prevLogs => {
            if (logData.id) {
                // Editing existing log
                return prevLogs.map(log => log.id === logData.id ? logData : log);
            } else {
                // Adding new log
                const newLog = { ...logData, id: Date.now() };
                return [...prevLogs, newLog];
            }
        });
        handleCloseModal();
    };


    const handleDeleteLog = (logId: number) => {
        if (window.confirm('Are you sure you want to delete this time entry? This action cannot be undone.')) {
            setTimeLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
        }
    };

    const handleUpdateLogStatus = (logId: number, status: 'approved' | 'rejected') => {
        setTimeLogs(prevLogs =>
            prevLogs.map(log =>
                log.id === logId ? { ...log, status } : log
            )
        );
    };

    // Filter employees by current user's department
    const filteredEmployees = employees.filter(e => e.department === currentUser.department);

    const employeePayData = filteredEmployees.map(employee => {
        const employeeLogs = timeLogs.filter(log => log.employeeId === employee.id);
        
        const approvedHours = employeeLogs
            .filter(log => log.status === 'approved' && log.clockOutTime)
            .reduce((acc, log) => acc + (log.clockOutTime!.getTime() - log.clockInTime.getTime()), 0);

        const pendingHours = employeeLogs
            .filter(log => log.status === 'pending' && log.clockOutTime)
            .reduce((acc, log) => acc + (log.clockOutTime!.getTime() - log.clockInTime.getTime()), 0);
        
        const rejectedHours = employeeLogs
            .filter(log => log.status === 'rejected' && log.clockOutTime)
            .reduce((acc, log) => acc + (log.clockOutTime!.getTime() - log.clockInTime.getTime()), 0);

        return {
            ...employee,
            logs: employeeLogs,
            approvedHours,
            pendingHours,
            rejectedHours,
        };
    });

    const handleExportSummaryCsv = () => {
        setIsExporting(true);
        try {
            const header = ['Employee Name', 'Role', 'Approved Hours', 'Pending Hours', 'Rejected Hours'];
            const rows = employeePayData.map(data => {
                return [
                    `"${data.name.replace(/"/g, '""')}"`,
                    `"${data.role.replace(/"/g, '""')}"`,
                    formatHoursDecimal(data.approvedHours),
                    formatHoursDecimal(data.pendingHours),
                    formatHoursDecimal(data.rejectedHours)
                ].join(',');
            });

            const csvContent = [header.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute("href", url);
            link.setAttribute("download", `Maruzzella_Weekly_Summary_${date}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error generating summary CSV:", error);
            alert("Sorry, there was an error creating the summary CSV file.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Payroll & Timesheets - {currentUser.department}</h2>
                    <p className="text-stone-600">Review, approve, and manage all recorded work hours for your department.</p>
                </div>
                 <button
                    onClick={handleExportSummaryCsv}
                    disabled={isExporting}
                    className="bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {isExporting ? 'Exporting...' : 'Export Weekly Summary'}
                </button>
            </div>

            <div className="space-y-6">
                {employeePayData.map(data => (
                    <div key={data.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-stone-200">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start border-b border-stone-200 pb-4 mb-4">
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-slate-800">{data.name}</h3>
                                <p className="text-sm text-stone-500">{data.role}</p>
                            </div>
                             <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                <div className="flex items-center gap-6">
                                    {data.pendingHours > 0 && (
                                        <div className="text-left sm:text-right">
                                            <p className="text-sm font-medium text-amber-600">Pending</p>
                                            <p className="text-2xl font-bold text-amber-500">{formatDuration(data.pendingHours)}</p>
                                        </div>
                                    )}
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm font-medium text-slate-600">Approved</p>
                                        <p className="text-2xl font-bold text-orange-600">{formatDuration(data.approvedHours)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenModal(null, data)}
                                    className="ml-4 px-3 py-1 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                                >
                                    Add Entry
                                </button>
                            </div>
                        </div>
                        
                        {data.logs.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-left text-slate-500">
                                        <tr>
                                            <th className="font-semibold p-2">Date</th>
                                            <th className="font-semibold p-2">Clock In</th>
                                            <th className="font-semibold p-2">Clock Out</th>
                                            <th className="font-semibold p-2">Duration</th>
                                            <th className="font-semibold p-2">Status</th>
                                            <th className="font-semibold p-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.logs.sort((a,b) => b.clockInTime.getTime() - a.clockInTime.getTime()).map(log => {
                                            const duration = log.clockOutTime ? log.clockOutTime.getTime() - log.clockInTime.getTime() : null;
                                            return (
                                                <tr key={log.id} className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50">
                                                    <td className="p-2 whitespace-nowrap">{formatDate(log.clockInTime)}</td>
                                                    <td className="p-2 font-mono">{formatTime(log.clockInTime)}</td>
                                                    <td className="p-2 font-mono">
                                                      {log.clockOutTime ? formatTime(log.clockOutTime) : '—'}
                                                    </td>
                                                    <td className="p-2 font-mono font-semibold">{duration !== null ? formatDuration(duration) : '—'}</td>
                                                    <td className="p-2"><StatusBadge status={log.status} /></td>
                                                    <td className="p-2 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {log.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdateLogStatus(log.id, 'rejected')}
                                                                        className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                                                        aria-label="Reject time entry"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateLogStatus(log.id, 'approved')}
                                                                        className="px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                                                                        aria-label="Approve time entry"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                </>
                                                            )}
                                                             <button
                                                                onClick={() => handleOpenModal(log, data)}
                                                                className="px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 rounded-md transition-colors"
                                                                aria-label="Edit time entry"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteLog(log.id)} 
                                                                className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                                                                aria-label="Delete time entry"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-stone-500 py-4">No shifts recorded for this employee.</p>
                        )}
                    </div>
                ))}

                {employees.length === 0 && (
                     <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                        <p className="text-stone-600">No employees found.</p>
                        <p className="text-sm text-stone-500 mt-2">Add employees in the "Employees" tab to start tracking time.</p>
                    </div>
                )}
            </div>
            {isModalOpen && editingLog.employee && (
                <TimeLogModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveLog}
                    log={editingLog.log}
                    employee={editingLog.employee}
                />
            )}
        </div>
    );
};

export default PayrollView;