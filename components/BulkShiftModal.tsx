import React, { useState } from 'react';

interface BulkShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (times: { startTime: string; endTime: string }) => void;
    selectedCount: number;
}

const BulkShiftModal: React.FC<BulkShiftModalProps> = ({ isOpen, onClose, onSave, selectedCount }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!startTime && !endTime) {
            alert('Please fill in at least one time field to apply a change.');
            return;
        }

        if (startTime && endTime && startTime >= endTime && endTime !== "00:00") {
             const end = new Date(`1970-01-02T${endTime}:00`);
             const start = new Date(`1970-01-01T${startTime}:00`);
             if(end <= start) {
                alert('End time must be after start time.');
                return;
             }
        }
        onSave({ startTime, endTime });
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-shift-modal-title"
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <h2 id="bulk-shift-modal-title" className="text-2xl font-bold text-slate-800 mb-2">Bulk Edit Shifts</h2>
                <p className="text-stone-500 mb-6">Applying changes to {selectedCount} selected shifts.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="bulkStartTime" className="block text-sm font-medium text-slate-700 mb-1">New Start Time</label>
                            <input
                                type="time"
                                id="bulkStartTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="bulkEndTime" className="block text-sm font-medium text-slate-700 mb-1">New End Time</label>
                            <input
                                type="time"
                                id="bulkEndTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors"
                        >
                            Apply to {selectedCount} Shifts
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
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default BulkShiftModal;