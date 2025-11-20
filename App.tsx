import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import RosterView from './components/RosterView';
import ClockInView from './components/ClockInView';
import EmployeeView from './components/EmployeeView';
import PayrollView from './components/PayrollView';
import LoginView from './components/LoginView';
// Fix: Corrected import paths to be relative.
import { INITIAL_EMPLOYEES, WEEKLY_ROSTER } from './constants';
import { Employee, Roster, TimeLog, Shift, Rosters, Department } from './types';
import { getState as apiGetState, saveState as apiSaveState } from './services/api';

type View = 'dashboard' | 'roster' | 'clock-in' | 'employees' | 'payroll';

// Rosters type moved to types.ts

// NOTE: state is now persisted to a backend. We initialize with defaults and
// then attempt to hydrate from the backend on mount.
// Department system: Kitchen (with roster), FOH, Stewarding (clock in/payroll only)

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [rosters, setRosters] = useState<Rosters>({ currentWeek: WEEKLY_ROSTER, nextWeek: WEEKLY_ROSTER });
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const remote = await apiGetState();
        if (!mounted || !remote) return;
        // Merge remote values with defaults (so missing keys don't break)
        if (Array.isArray(remote.employees) && remote.employees.length > 0) setEmployees(remote.employees);
        if (remote.rosters) setRosters(remote.rosters);
        if (Array.isArray(remote.timeLogs) && remote.timeLogs.length > 0) {
          // Rehydrate dates
          const parsed = remote.timeLogs.map((log: any) => ({
            ...log,
            clockInTime: new Date(log.clockInTime),
            clockOutTime: log.clockOutTime ? new Date(log.clockOutTime) : null,
          }));
          setTimeLogs(parsed);
        }
      } catch (error) {
        console.warn('Could not load remote state; continuing with local defaults.', error);
      } finally {
        if (mounted) setIsHydrated(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Persist to backend whenever core state changes (but only after initial hydration)
  useEffect(() => {
    if (!isHydrated) return; // Skip until hydration is done
    (async () => {
      try {
        // Serialize dates to ISO strings
        const serializable = {
          employees,
          rosters,
          timeLogs: timeLogs.map(t => ({ ...t, clockInTime: t.clockInTime?.toISOString(), clockOutTime: t.clockOutTime?.toISOString() || null })),
        };
        await apiSaveState(serializable);
      } catch (error) {
        console.error('Failed to save state to backend', error);
      }
    })();
  }, [employees, rosters, timeLogs, isHydrated]);


  useEffect(() => {
    // If the current user is deleted from the employee list, log them out.
    if (currentUser && !employees.some(e => e.id === currentUser.id)) {
      setCurrentUser(null);
    }
  }, [employees, currentUser]);

  const handleLogin = (employee: Employee) => {
    setCurrentUser(employee);
    setActiveView('dashboard'); // Always start at dashboard
  };

  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setActiveView('roster'); // Go to roster after selecting department
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedDepartment(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginView employees={employees} onLogin={handleLogin} />;
  }

  const isManager = currentUser.role === 'Manager';
  const isKitchenDepartment = currentUser.department === 'Kitchen';

  const navButtonClasses = (view: View) =>
    `px-4 py-3 text-sm font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
      activeView === view
        ? 'bg-orange-600 text-white shadow-lg'
        : 'bg-white text-slate-700 hover:bg-stone-100'
    }`;

  const handleNavClick = (view: View) => {
    if ((view === 'employees' || view === 'payroll') && !isManager) {
      return;
    }
    if (view === 'roster' && !isKitchenDepartment) {
      return; // FOH and Stewarding can't access roster
    }
    setActiveView(view);
  };
  
  const AccessDenied = () => (
    <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-stone-200">
        <h2 className="text-xl font-bold text-slate-700">Access Denied</h2>
        <p className="text-stone-500 mt-2">You do not have permission to view this page. Please contact a manager.</p>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView currentUser={currentUser} employees={employees} onSelectDepartment={handleSelectDepartment} />;
      case 'roster':
        return selectedDepartment ? <RosterView employees={employees} rosters={rosters} setRosters={setRosters} setEmployees={setEmployees} currentUser={currentUser} /> : <AccessDenied />;
      case 'clock-in':
        return <ClockInView employees={employees} timeLogs={timeLogs} setTimeLogs={setTimeLogs} currentUser={currentUser} />;
      case 'employees':
        return isManager ? <EmployeeView employees={employees} setEmployees={setEmployees} setRosters={setRosters} currentUser={currentUser} /> : <AccessDenied />;
      case 'payroll':
        return isManager ? <PayrollView employees={employees} timeLogs={timeLogs} setTimeLogs={setTimeLogs} /> : <AccessDenied />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-800">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto pb-24">
        {activeView !== 'dashboard' && (
          <button
            onClick={handleBackToDashboard}
            className="mb-4 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;