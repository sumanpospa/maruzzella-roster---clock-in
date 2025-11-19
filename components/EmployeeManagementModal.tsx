import React, { useState } from 'react';
import { Employee, Department } from '../types';
import EmployeeModal from './EmployeeModal';
import { UsersIcon } from './icons/UsersIcon';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface EmployeeManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const EmployeeManagementModal: React.FC<EmployeeManagementModalProps> = ({ isOpen, onClose, employees, setEmployees }) => {
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | 'All'>('All');

    if (!isOpen) return null;

    // Filter employees by selected department
    const filteredEmployees = selectedDepartment === 'All' 
        ? employees 
        : employees.filter(e => e.department === selectedDepartment);

    const handleAddEmployee = () => {
        setEditingEmployee(null);
        setIsEmployeeModalOpen(true);
    };

    const handleEditEmployee = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsEmployeeModalOpen(true);
    };

    const handleDeleteEmployee = (id: number) => {
        if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            setEmployees(prev => prev.filter(e => e.id !== id));
        }
    };

    const handleSaveEmployee = (employee: Employee) => {
        if (editingEmployee) {
            // Edit existing
            setEmployees(prev => prev.map(e => e.id === employee.id ? employee : e));
        } else {
            // Add new
            const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
            setEmployees(prev => [...prev, { ...employee, id: newId }]);
        }
        setIsEmployeeModalOpen(false);
        setEditingEmployee(null);
    };

    const handleCloseEmployeeModal = () => {
        setIsEmployeeModalOpen(false);
        setEditingEmployee(null);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <UsersIcon className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Manage Employees</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                        {/* Department Filter Buttons */}
                        <div className="mb-4 flex gap-2 flex-wrap">
                            <button
                                onClick={() => setSelectedDepartment('All')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    selectedDepartment === 'All'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-stone-100 text-slate-700 border border-stone-300 hover:bg-stone-200'
                                }`}
                            >
                                All Departments ({employees.length})
                            </button>
                            <button
                                onClick={() => setSelectedDepartment('Kitchen')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    selectedDepartment === 'Kitchen'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-stone-100 text-slate-700 border border-stone-300 hover:bg-stone-200'
                                }`}
                            >
                                Kitchen ({employees.filter(e => e.department === 'Kitchen').length})
                            </button>
                            <button
                                onClick={() => setSelectedDepartment('FOH')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    selectedDepartment === 'FOH'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-stone-100 text-slate-700 border border-stone-300 hover:bg-stone-200'
                                }`}
                            >
                                FOH ({employees.filter(e => e.department === 'FOH').length})
                            </button>
                            <button
                                onClick={() => setSelectedDepartment('Stewarding')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    selectedDepartment === 'Stewarding'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-stone-100 text-slate-700 border border-stone-300 hover:bg-stone-200'
                                }`}
                            >
                                Stewarding ({employees.filter(e => e.department === 'Stewarding').length})
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <p className="text-stone-600">
                                {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
                            </p>
                            <button
                                onClick={handleAddEmployee}
                                className="bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:bg-orange-700 transform hover:scale-105 flex items-center gap-2"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Add Employee
                            </button>
                        </div>

                        {/* Employee List */}
                        <div className="space-y-3">
                            {filteredEmployees.map(employee => (
                                <div
                                    key={employee.id}
                                    className="bg-stone-50 rounded-lg p-4 border border-stone-200 hover:border-orange-300 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                                                    {employee.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{employee.name}</h3>
                                                    <p className="text-sm text-stone-500">{employee.role} • {employee.department}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditEmployee(employee)}
                                                className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                title="Edit employee"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete employee"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredEmployees.length === 0 && (
                            <div className="text-center py-12">
                                <UsersIcon className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                                <p className="text-stone-500 text-lg">No employees in {selectedDepartment === 'All' ? 'any department' : selectedDepartment}</p>
                                <p className="text-stone-400 text-sm mt-2">Click "Add Employee" to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Employee Add/Edit Modal */}
            {isEmployeeModalOpen && (
                <EmployeeModal
                    isOpen={isEmployeeModalOpen}
                    onClose={handleCloseEmployeeModal}
                    onSave={handleSaveEmployee}
                    employee={editingEmployee}
                />
            )}
        </>
    );
};

export default EmployeeManagementModal;
