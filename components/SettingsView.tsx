



import React, { useState, useRef } from 'react';
import { Employee, Roster, TimeLog, Rosters } from '../types';

interface SettingsViewProps {
    employees: Employee[];
    rosters: Rosters;
    timeLogs: TimeLog[];
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
    setRosters: React.Dispatch<React.SetStateAction<Rosters>>;
    setTimeLogs: React.Dispatch<React.SetStateAction<TimeLog[]>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ employees, rosters, timeLogs, setEmployees, setRosters, setTimeLogs }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isMerging, setIsMerging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mergeFileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        setIsExporting(true);
        try {
            const dataToExport = {
                employees,
                rosters,
                timeLogs,
                exportDate: new Date().toISOString(),
            };

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `maruzzella_data_${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('An error occurred while exporting data.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('Failed to read file content.');
                }
                const data = JSON.parse(text);

                if (!data.employees || !data.rosters || !data.timeLogs) {
                    throw new Error('Invalid data file. Missing required sections (employees, rosters, timeLogs).');
                }

                if (window.confirm('Are you sure you want to import this data? This will overwrite all current employees, roster, and time logs on this device.')) {
                    setEmployees(data.employees);
                    setRosters(data.rosters);
                    // We must re-hydrate dates from the JSON strings
                    const parsedTimeLogs = (data.timeLogs as TimeLog[]).map(log => ({
                        ...log,
                        clockInTime: new Date(log.clockInTime),
                        clockOutTime: log.clockOutTime ? new Date(log.clockOutTime) : null,
                    }));
                    setTimeLogs(parsedTimeLogs);
                    alert('Data imported successfully! The app will now use the new data.');
                }
            } catch (error) {
                console.error('Import failed:', error);
                alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setIsImporting(false);
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };

        reader.onerror = () => {
            alert('Failed to read the file.');
            setIsImporting(false);
        };

        reader.readAsText(file);
    };

    const handleMergeClick = () => {
        mergeFileInputRef.current?.click();
    };

    const handleMergeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsMerging(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('Failed to read file content.');
                }
                const data = JSON.parse(text);

                if (!data.timeLogs || !Array.isArray(data.timeLogs)) {
                    throw new Error('Invalid data file. Missing or invalid "timeLogs" array.');
                }

                if (window.confirm('Are you sure you want to merge time logs from this file? This will add new entries to your current time log data.')) {
                    const importedLogs: TimeLog[] = (data.timeLogs as any[]).map(log => ({
                        ...log,
                        clockInTime: new Date(log.clockInTime),
                        clockOutTime: log.clockOutTime ? new Date(log.clockOutTime) : null,
                    }));

                    const logMap = new Map<number, TimeLog>();
                    
                    timeLogs.forEach(log => logMap.set(log.id, log));

                    let addedCount = 0;
                    importedLogs.forEach(log => {
                        if (!logMap.has(log.id)) {
                            logMap.set(log.id, log);
                            addedCount++;
                        }
                    });
                    
                    const mergedLogs = Array.from(logMap.values());
                    
                    setTimeLogs(mergedLogs);
                    alert(`Merge complete! ${addedCount} new time log entries were added.`);
                }
            } catch (error) {
                console.error('Merge failed:', error);
                alert(`Merge failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setIsMerging(false);
                if (mergeFileInputRef.current) {
                    mergeFileInputRef.current.value = '';
                }
            }
        };

        reader.onerror = () => {
            alert('Failed to read the file.');
            setIsMerging(false);
        };

        reader.readAsText(file);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">App Settings</h2>
                <p className="text-stone-600">Manage application data for synchronization across devices.</p>
            </div>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="text-lg font-bold text-slate-800">Export Data</h3>
                    <p className="text-stone-500 mt-1 mb-4 text-sm max-w-prose">
                        Export all employees, roster schedules, and time logs into a single JSON file. This file acts as a backup and can be used to synchronize other devices.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors hover:bg-orange-700 disabled:bg-orange-300"
                    >
                        {isExporting ? 'Exporting...' : 'Export All Data'}
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                     <h3 className="text-lg font-bold text-slate-800">Import & Overwrite Data</h3>
                    <p className="text-stone-500 mt-1 mb-4 text-sm max-w-prose">
                        Import a data file (`.json`) to overwrite the current application data. This is how you update an employee's device with the master schedule.
                    </p>
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                        <p className="text-sm text-amber-800"><span className="font-bold">Warning:</span> Importing data will replace all existing information on this device. This action cannot be undone.</p>
                    </div>
                    <button
                        onClick={handleImportClick}
                        disabled={isImporting}
                        className="mt-4 bg-slate-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors hover:bg-slate-800 disabled:bg-slate-400"
                    >
                        {isImporting ? 'Importing...' : 'Import Data File'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="application/json"
                    />
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                     <h3 className="text-lg font-bold text-slate-800">Import & Merge Time Logs</h3>
                    <p className="text-stone-500 mt-1 mb-4 text-sm max-w-prose">
                        Combine time logs from an exported file with the current device's data. This is useful for aggregating hours from multiple devices without overwriting employees or rosters. Only new log entries will be added.
                    </p>
                    <button
                        onClick={handleMergeClick}
                        disabled={isMerging}
                        className="bg-sky-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors hover:bg-sky-700 disabled:bg-sky-400"
                    >
                        {isMerging ? 'Merging...' : 'Merge Logs From File'}
                    </button>
                    <input
                        type="file"
                        ref={mergeFileInputRef}
                        onChange={handleMergeFileChange}
                        className="hidden"
                        accept="application/json"
                    />
                </div>
            </div>
        </div>
    );
};

export default SettingsView;