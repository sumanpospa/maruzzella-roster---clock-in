
import React, { useState } from 'react';
import { Employee } from '../types';
import PinModal from './PinModal';

interface LoginViewProps {
    employees: Employee[];
    onLogin: (employee: Employee) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ employees, onLogin }) => {
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const handleEmployeeSelect = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsPinModalOpen(true);
    };

    const handlePinSuccess = () => {
        if (selectedEmployee) {
            onLogin(selectedEmployee);
        }
        setIsPinModalOpen(false);
        setSelectedEmployee(null);
    };

    const handlePinModalClose = () => {
        setIsPinModalOpen(false);
        setSelectedEmployee(null);
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                 <h1 className="text-5xl font-bold text-center text-slate-800 tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Maruzzella
                </h1>
                <p className="text-center text-lg text-stone-500 mb-8">Roster & Time Clock</p>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-200">
                    <h2 className="text-xl font-bold text-center text-slate-800 mb-6">Who's Clocking In?</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {employees.map(employee => (
                            <button
                                key={employee.id}
                                onClick={() => handleEmployeeSelect(employee)}
                                className="flex flex-col items-center justify-center p-4 rounded-lg text-center transition-all duration-200 bg-stone-50 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 h-28"
                            >
                                <span className="font-semibold text-slate-700">{employee.name}</span>
                            </button>
                        ))}
                         {employees.length === 0 && (
                            <p className="col-span-2 sm:col-span-3 text-center text-stone-500 py-4">No employees found.</p>
                        )}
                    </div>
                </div>
            </div>
            {isPinModalOpen && selectedEmployee && (
                <PinModal
                    isOpen={isPinModalOpen}
                    onClose={handlePinModalClose}
                    onSuccess={handlePinSuccess}
                    employee={selectedEmployee}
                />
            )}
        </div>
    );
};

export default LoginView;
