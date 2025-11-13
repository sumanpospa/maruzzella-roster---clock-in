
import React, { useState } from 'react';
import { generateDailyBriefing } from '../services/geminiService';
// Fix: Corrected import path to be relative.
import { Employee, Shift } from '../types';

interface AiBriefingProps {
  todaysShifts: Shift[];
  employees: Employee[];
  currentUser: Employee;
}

const AiBriefing: React.FC<AiBriefingProps> = ({ todaysShifts, employees, currentUser }) => {
  const [briefing, setBriefing] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const isManager = currentUser.role === 'Manager';

  const handleGenerateBriefing = async () => {
    if (!isManager) return;
    setIsLoading(true);
    setError('');
    setBriefing('');
    try {
      const result = await generateDailyBriefing(todaysShifts, employees);
      setBriefing(result);
    } catch (err) {
      setError('Failed to generate briefing. Please try again.');
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 mb-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">AI Daily Briefing</h3>
          <p className="text-stone-600 mt-1">Get a motivational summary for today's team.</p>
        </div>
        <button
          onClick={handleGenerateBriefing}
          disabled={isLoading || todaysShifts.length === 0 || !isManager}
          className="bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200 ease-in-out hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transform hover:scale-105"
          title={!isManager ? "Only managers can generate briefings." : "Generate a briefing for today's shift"}
        >
          {isLoading ? 'Generating...' : 'Generate Briefing'}
        </button>
      </div>
      {isLoading && (
         <div className="mt-4 text-center text-stone-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2">Thinking...</p>
        </div>
      )}
      {error && <p className="mt-4 text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
      {briefing && (
        <div className="mt-4 bg-stone-50 p-4 rounded-lg border border-stone-200">
          <p className="text-slate-700 whitespace-pre-wrap">{briefing}</p>
        </div>
      )}
    </div>
  );
};

export default AiBriefing;
