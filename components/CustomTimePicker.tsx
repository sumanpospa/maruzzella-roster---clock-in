import React from 'react';

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange, label, id }) => {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="time"
          id={id}
          value={value}
          onChange={handleTimeChange}
          className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base bg-white"
          step="60"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-lg font-bold w-6 h-6 flex items-center justify-center"
            title="Clear time"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomTimePicker;
