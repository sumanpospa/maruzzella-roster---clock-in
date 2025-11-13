


import React, { useState } from 'react';
// Fix: Corrected import path to be relative.
import { Employee, Roster, DayOfWeek, Shift, Rosters } from '../types';
import EmployeeModal from './EmployeeModal';

interface EmployeeCardProps {
    employee: Employee;
    onEdit: () => void;
    onDelete: () => void;
    isCurrentUser: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete, isCurrentUser }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const handleDeleteClick = () => {
        if (isCurrentUser) return;
        setIsConfirmingDelete(true);
    };

    const handleCancelDelete = () => {
        setIsConfirmingDelete(false);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between gap-4 group">
            <div>
                <p className="font-bold text-lg text-slate-800">{employee.name}</p>
                <p className="text-stone-500">{employee.role}</p>
            </div>
            <div className="flex items-center gap-2">
                {isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                         <span className="text-sm text-slate-600 mr-2 hidden sm:inline">Are you sure?</span>
                        <button 
                            onClick={onDelete} 
                            className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                            Delete
                        </button>
                        <button 
                            onClick={handleCancelDelete} 
                            className="px-3 py-2 text-sm font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                        <button onClick={onEdit} className="px-3 py-1 text-sm font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
                            Edit
                        </button>
                        <button 
                            onClick={handleDeleteClick} 
                            className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                            aria-label={`Delete ${employee.name}`}
                            disabled={isCurrentUser}
                            title={isCurrentUser ? "You cannot delete your own account." : `Delete ${employee.name}`}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


interface EmployeeViewProps {
    employees: Employee[];
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
    setRosters: React.Dispatch<React.SetStateAction<Rosters>>;
    currentUser: Employee;
}

const EmployeeView: React.FC<EmployeeViewProps> = ({ employees, setEmployees, setRosters, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const handleOpenAddModal = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Delay reset to allow for exit animation
        setTimeout(() => setEditingEmployee(null), 300);
    };

    const handleSaveEmployee = (employeeData: Omit<Employee, 'id'> & { id?: number }) => {
        if (employeeData.id) { // Editing existing employee
            setEmployees(prev => prev.map(emp => emp.id === employeeData.id ? { ...emp, ...employeeData } as Employee : emp));
        } else { // Adding new employee
            const newId = Math.max(0, ...employees.map(e => e.id)) + 1;
            setEmployees(prev => [...prev, { ...employeeData, id: newId } as Employee]);
        }
        handleCloseModal();
    };

    const handleDeleteEmployee = (employeeToDelete: Employee) => {
        if (employeeToDelete.id === currentUser.id) {
            alert("You cannot delete the currently active user.");
            return;
        }
        
        // Confirmation is now handled in the EmployeeCard component.
        
        // 1. Remove employee
        setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));

        // 2. Remove their shifts from both rosters
        setRosters(prevRosters => {
            const cleanRoster = (roster: Roster): Roster => {
                const newRoster = { ...roster };
                for (const day in newRoster) {
                    const dayKey = day as DayOfWeek;
                    newRoster[dayKey] = newRoster[dayKey]
                        .map(shift => {
                            // Filter out the deleted employee from the shift
                            const newEmployeeIds = shift.employeeIds.filter(
                                id => id !== employeeToDelete.id
                            );

                            // If other employees are still on the shift, update it
                            if (newEmployeeIds.length > 0) {
                                return { ...shift, employeeIds: newEmployeeIds };
                            }
                            
                            // If the shift is now empty, remove it by returning null
                            return null;
                        })
                        .filter((shift): shift is Shift => shift !== null); // Filter out the nulls
                }
                return newRoster;
            };

            return {
                currentWeek: cleanRoster(prevRosters.currentWeek),
                nextWeek: cleanRoster(prevRosters.nextWeek),
            };
        });
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Manage Employees</h2>
                    <p className="text-stone-600">Add, edit, or remove staff members.</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200 ease-in-out hover:bg-orange-700 transform hover:scale-105"
                >
                    Add Employee
                </button>
            </div>

            <div className="space-y-4">
                {employees.length > 0 ? employees.map(employee => (
                    <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        onEdit={() => handleOpenEditModal(employee)}
                        onDelete={() => handleDeleteEmployee(employee)}
                        isCurrentUser={currentUser.id === employee.id}
                    />
                )) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                        <p className="text-stone-600">No employees have been added yet.</p>

                        <p className="text-sm text-stone-500 mt-2">Click "Add Employee" to get started.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <EmployeeModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveEmployee}
                    employee={editingEmployee}
                />
            )}
        </div>
    );
};

export default EmployeeView;