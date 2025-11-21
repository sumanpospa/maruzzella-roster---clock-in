
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole, Department } from '../types';

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employeeData: Omit<Employee, 'id'> & { id?: number }) => void;
    employee: Employee | null;
    defaultDepartment: Department;
}

// Department-specific roles
const DEPARTMENT_ROLES: Record<Department, EmployeeRole[]> = {
    Kitchen: ['Manager', 'Chef', 'Cook'],
    FOH: ['Manager', 'Supervisor', 'Bar Tender', 'Waiter', 'Food Runner'],
    Stewarding: ['Manager', 'Kitchen Hand'],
};

const DEPARTMENTS: Department[] = ['Kitchen', 'FOH', 'Stewarding'];

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, employee, defaultDepartment }) => {
    const isEditing = employee !== null;
    const [name, setName] = useState('');
    const [role, setRole] = useState<EmployeeRole>('Manager');
    const [department, setDepartment] = useState<Department>('Kitchen');
    const [pin, setPin] = useState('');
    const [isResettingPin, setIsResettingPin] = useState(false);
    const [showRoleWarning, setShowRoleWarning] = useState(false);

    // Get roles for the current department
    const availableRoles = DEPARTMENT_ROLES[department];

    useEffect(() => {
        if (!isOpen) return;

        if (employee) {
            setName(employee.name);
            setDepartment(employee.department);
            setPin(employee.pin);
            setIsResettingPin(false);
            
            // Validate that the employee's role exists in their department's role list
            const departmentRoles = DEPARTMENT_ROLES[employee.department];
            if (departmentRoles.includes(employee.role)) {
                setRole(employee.role);
                setShowRoleWarning(false);
            } else {
                // If role doesn't match department, set to first available role and show warning
                setRole(departmentRoles[0]);
                setShowRoleWarning(true);
            }
        } else {
            setName('');
            setDepartment(defaultDepartment);
            // Set first role from the department's role list
            setRole(DEPARTMENT_ROLES[defaultDepartment][0]);
            setPin('');
            setShowRoleWarning(false);
        }
    }, [employee, isOpen, defaultDepartment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !role || !department || !pin.match(/^\d{4}$/)) {
            alert('Please fill out all fields. PIN must be 4 digits.');
            return;
        }
        onSave({
            id: employee?.id,
            name,
            role,
            department,
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
                    {showRoleWarning && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-sm text-amber-800">
                                ⚠️ This employee's role has been updated to match their department's available roles.
                            </p>
                        </div>
                    )}
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
                            {availableRoles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                        <select
                            id="department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value as Department)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 disabled:bg-stone-100 disabled:text-stone-500"
                            required
                            disabled
                        >
                            {DEPARTMENTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <p className="text-xs text-stone-500 mt-1">Each department manages its own staff</p>
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
