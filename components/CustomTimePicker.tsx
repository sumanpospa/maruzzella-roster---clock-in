import React, { useState } from 'react';

interface CustomTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    id: string;
    required?: boolean;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange, label, id, required }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [hours, setHours] = useState(value ? value.split(':')[0] : '12');
    const [minutes, setMinutes] = useState(value ? value.split(':')[1] : '00');

    const handleSet = () => {
        const timeValue = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        onChange(timeValue);
        setShowPicker(false);
    };

    const handleClear = () => {
        setHours('12');
        setMinutes('00');
        onChange('');
        setShowPicker(false);
    };

    const handleCancel = () => {
        // Reset to current value
        if (value) {
            setHours(value.split(':')[0]);
            setMinutes(value.split(':')[1]);
        }
        setShowPicker(false);
    };

    const displayValue = value || 'Select time';

    return (
        <div className="relative">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-left bg-white"
            >
                {displayValue}
            </button>

            {showPicker && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/30 z-[9998]"
                        onClick={handleCancel}
                    />
                    <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-[9999] animate-slide-up">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-center mb-6">Select Time</h3>
                            
                            <div className="flex justify-center items-center gap-4 mb-8">
                                {/* Hours */}
                                <div className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        onClick={() => setHours(String((parseInt(hours) + 1) % 24).padStart(2, '0'))}
                                        className="w-12 h-12 flex items-center justify-center text-2xl text-orange-600 hover:bg-orange-50 rounded-lg"
                                    >
                                        ▲
                                    </button>
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={hours}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            setHours(String(Math.min(23, Math.max(0, val))).padStart(2, '0'));
                                        }}
                                        className="w-20 h-20 text-4xl font-bold text-center border-2 border-orange-600 rounded-xl my-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setHours(String((parseInt(hours) - 1 + 24) % 24).padStart(2, '0'))}
                                        className="w-12 h-12 flex items-center justify-center text-2xl text-orange-600 hover:bg-orange-50 rounded-lg"
                                    >
                                        ▼
                                    </button>
                                </div>

                                <span className="text-4xl font-bold text-slate-400">:</span>

                                {/* Minutes */}
                                <div className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        onClick={() => setMinutes(String((parseInt(minutes) + 1) % 60).padStart(2, '0'))}
                                        className="w-12 h-12 flex items-center justify-center text-2xl text-orange-600 hover:bg-orange-50 rounded-lg"
                                    >
                                        ▲
                                    </button>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={minutes}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            setMinutes(String(Math.min(59, Math.max(0, val))).padStart(2, '0'));
                                        }}
                                        className="w-20 h-20 text-4xl font-bold text-center border-2 border-orange-600 rounded-xl my-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMinutes(String((parseInt(minutes) - 1 + 60) % 60).padStart(2, '0'))}
                                        className="w-12 h-12 flex items-center justify-center text-2xl text-orange-600 hover:bg-orange-50 rounded-lg"
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>

                            {/* Buttons - VERTICAL with Set at top */}
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={handleSet}
                                    className="w-full py-4 bg-orange-600 text-white text-lg font-semibold rounded-xl hover:bg-orange-700 transition-colors"
                                >
                                    Set
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="w-full py-4 bg-gray-200 text-gray-800 text-lg font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="w-full py-4 bg-red-100 text-red-700 text-lg font-semibold rounded-xl hover:bg-red-200 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomTimePicker;
