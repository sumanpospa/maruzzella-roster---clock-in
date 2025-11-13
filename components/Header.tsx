
import React from 'react';
// Fix: Corrected import path to be relative.
import { Employee } from '../types';

interface HeaderProps {
    currentUser: Employee;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Maruzzella
            </h1>
            <p className="text-center text-sm text-stone-500">Roster & Time Clock</p>
        </div>
        <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{currentUser.name}</span>
                </div>
                <button 
                    onClick={onLogout}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                    aria-label="Log out"
                >
                    Log Out
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
