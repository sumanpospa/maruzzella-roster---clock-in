
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole } from '../types';

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employeeData: Omit<Employee, 'id'> & { id?: number }) => void;
    employee: Employee | null;
}

const ROLES: EmployeeRole[] = ['Manager', 'Chef', 'Waiter', 'Host'];

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, employee }) => {
    const isEditing = employee !== null;
    const [name, setName] = useState('');
    const [role, setRole] = useState<EmployeeRole>('Waiter');
    const [pin, setPin] = useState('');
    const [isResettingPin, setIsResettingPin] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (employee) {
            setName(employee.name);
            setRole(employee.role);
            setPin(employee.pin);
            setIsResettingPin(false);
        } else {
            setName('');
            setRole('Waiter');
            setPin('');
        }
    }, [employee, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !role || !pin.match(/^\d{4}$/)) {
            alert('Please fill out all fields. PIN must be 4 digits.');
            return;
        }
        onSave({
            id: employee?.id,
            name,
            role,
            pin,
        });
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-modal-title"
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <h2 id="employee-modal-title" className="text-2xl font-bold text-slate-800 mb-6">{isEditing ? 'Edit Employee' : 'Add Employee'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as EmployeeRole)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            required
                        >
                            {ROLES.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        {isEditing ? (
                            <>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="pin" className="block text-sm font-medium text-slate-700">
                                        PIN
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const isCurrentlyResetting = isResettingPin;
                                            setIsResettingPin(!isCurrentlyResetting);
                                            if (!isCurrentlyResetting) {
                                                // Start resetting
                                                setPin('');
                                            } else {
                                                // Cancel resetting
                                                setPin(employee.pin);
                                            }
                                        }}
                                        className="text-sm font-medium text-orange-600 hover:text-orange-700 focus:outline-none"
                                    >
                                        {isResettingPin ? 'Cancel Reset' : 'Reset PIN'}
                                    </button>
                                </div>
                                <input
                                    id="pin"
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 disabled:bg-stone-100"
                                    required
                                    maxLength={4}
                                    pattern="\d{4}"
                                    title="PIN must be 4 digits."
                                    disabled={!isResettingPin}
                                    placeholder={isResettingPin ? 'Enter new 4-digit PIN' : ''}
                                    autoComplete="new-password"
                                />
                            </>
                        ) : (
                            <>
                                <label htmlFor="pin" className="block text-sm font-medium text-slate-700 mb-1">4-Digit PIN</label>
                                <input
                                    id="pin"
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    required
                                    maxLength={4}
                                    pattern="\d{4}"
                                    title="PIN must be 4 digits."
                                />
                            </>
                        )}
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
                            {isEditing ? 'Save Changes' : 'Add Employee'}
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

export default EmployeeModal;
