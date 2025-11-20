import React from 'react';
import { Employee } from '../types';

interface DashboardViewProps {
    currentUser: Employee;
    employees: Employee[];
    onSelectDepartment: (department: 'Kitchen' | 'FOH' | 'Stewarding') => void;
    showBackButton?: boolean;
    onBackToDashboard?: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ currentUser, employees, onSelectDepartment, showBackButton = false, onBackToDashboard }) => {
    const isManager = currentUser.role === 'Manager';
    const isGuest = currentUser.id === 0;

    // Count employees by department
    const kitchenCount = employees.filter(e => e.department === 'Kitchen').length;
    const fohCount = employees.filter(e => e.department === 'FOH').length;
    const stewardingCount = employees.filter(e => e.department === 'Stewarding').length;

    const departments = [
        {
            name: 'Kitchen Team',
            department: 'Kitchen' as const,
            count: kitchenCount,
            icon: '👨‍🍳',
            color: 'from-orange-500 to-red-500',
            description: 'Chefs & Kitchen Staff'
        },
        {
            name: 'FOH Team',
            department: 'FOH' as const,
            count: fohCount,
            icon: '🍽️',
            color: 'from-blue-500 to-cyan-500',
            description: 'Waiters & Hosts'
        },
        {
            name: 'Stewarding Team',
            department: 'Stewarding' as const,
            count: stewardingCount,
            icon: '🧼',
            color: 'from-green-500 to-emerald-500',
            description: 'Dishwashers & Cleaning'
        }
    ];

    // Filter departments based on user access
    const accessibleDepartments = isManager 
        ? departments 
        : departments.filter(d => d.department === currentUser.department);

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-800 mb-2">
                    Welcome{!isGuest ? `, ${currentUser.name}` : ''}! 👋
                </h1>
                <p className="text-lg text-stone-600">
                    {isGuest ? 'Select a department to get started' : isManager ? 'Select a department to manage' : `${currentUser.department} Department`}
                </p>
            </div>

            {/* Department Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {accessibleDepartments.map(dept => (
                    <button
                        key={dept.department}
                        onClick={() => onSelectDepartment(dept.department)}
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105 p-8 text-left"
                    >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${dept.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        
                        {/* Content */}
                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="text-6xl mb-4">
                                {dept.icon}
                            </div>

                            {/* Department Name */}
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                {dept.name}
                            </h2>

                            {/* Description */}
                            <p className="text-stone-600 mb-4">
                                {dept.description}
                            </p>

                            {/* Staff Count */}
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${dept.color} text-white font-semibold`}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                <span>{dept.count} Staff</span>
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute bottom-8 right-8 text-stone-300 group-hover:text-orange-500 transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Quick Stats for Managers */}
            {isManager && (
                <div className="max-w-6xl mx-auto mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">📊 Quick Overview</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-3xl font-bold text-orange-600">{kitchenCount + fohCount + stewardingCount}</p>
                            <p className="text-sm text-stone-600">Total Staff</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-blue-600">3</p>
                            <p className="text-sm text-stone-600">Departments</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-green-600">{currentUser.role}</p>
                            <p className="text-sm text-stone-600">Your Role</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardView;
