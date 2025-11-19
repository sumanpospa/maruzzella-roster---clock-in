import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RosterView from './components/RosterView';
import ClockInView from './components/ClockInView';
import EmployeeView from './components/EmployeeView';
import PayrollView from './components/PayrollView';
import LoginView from './components/LoginView';
// Fix: Corrected import paths to be relative.
import { INITIAL_EMPLOYEES, WEEKLY_ROSTER } from './constants';
import { Employee, Roster, TimeLog, Shift, Rosters } from './types';
import { getState as apiGetState, saveState as apiSaveState } from './services/api';

type View = 'roster' | 'clock-in' | 'employees' | 'payroll';

// Rosters type moved to types.ts

// NOTE: state is now persisted to a backend. We initialize with defaults and
// then attempt to hydrate from the backend on mount.

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('roster');
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
    // Default to clock-in for FOH/Stewarding, roster for Kitchen
    if (employee.department === 'Kitchen') {
      setActiveView('roster');
    } else {
      setActiveView('clock-in');
    }
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
      case 'roster':
        return isKitchenDepartment ? <RosterView employees={employees} rosters={rosters} setRosters={setRosters} setEmployees={setEmployees} currentUser={currentUser} /> : <AccessDenied />;
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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-2 bg-white/80 backdrop-blur-sm shadow-lg rounded-full border border-stone-200">
            <nav className="flex gap-2">
                {isKitchenDepartment && (
                    <button onClick={() => handleNavClick('roster')} className={navButtonClasses('roster')} aria-label="Roster">
                        Roster
                    </button>
                )}
                <button onClick={() => handleNavClick('clock-in')} className={navButtonClasses('clock-in')} aria-label="Clock In">
                    Clock In
                </button>
                {isManager && (
                    <>
                        <button onClick={() => handleNavClick('employees')} className={navButtonClasses('employees')} aria-label="Employees">
                            Employees
                        </button>
                        <button onClick={() => handleNavClick('payroll')} className={navButtonClasses('payroll')} aria-label="Payroll">
                            Payroll
                        </button>
                    </>
                )}
            </nav>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;