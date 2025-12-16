import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import RosterView from './components/RosterView';
import ClockInView from './components/ClockInView';
import EmployeeView from './components/EmployeeView';
import PayrollView from './components/PayrollView';
import LoginView from './components/LoginView';
// Fix: Corrected import paths to be relative.
import { INITIAL_EMPLOYEES, WEEKLY_ROSTER } from './constants';
import { Employee, TimeLog, Rosters, Department } from './types';
import { getState as apiGetState, saveState as apiSaveState } from './services/api';

type View = 'dashboard' | 'roster' | 'clock-in' | 'employees' | 'payroll';

// Rosters type moved to types.ts

// NOTE: state is now persisted to a backend. We initialize with defaults and
// then attempt to hydrate from the backend on mount.
// Department system: Kitchen (with roster), FOH, Stewarding (clock in/payroll only)

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [, setSelectedDepartment] = useState<Department | null>(null);
  const [showLoginForDepartment, setShowLoginForDepartment] = useState<Department | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [rosters, setRosters] = useState<Rosters>({
    currentWeek: WEEKLY_ROSTER,
    nextWeek: WEEKLY_ROSTER,
  });
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Version check to detect cached old code
  useEffect(() => {
    const APP_VERSION = '3.1-save-feedback';
    console.log(`🔧 App Version: ${APP_VERSION}`);
    console.log('📱 User Agent:', navigator.userAgent);
  }, []);

  // Hydrate from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const remote = await apiGetState();
        if (!mounted || !remote) return;

        // CRITICAL SAFETY CHECK: Validate data before loading
        const remoteEmployeeCount = remote.employees?.length || 0;
        const remoteShiftCount =
          Object.values(remote.rosters?.nextWeek || {}).flat().length +
          Object.values(remote.rosters?.currentWeek || {}).flat().length;

        console.log(
          `📥 Backend data: ${remoteEmployeeCount} employees, ${remoteShiftCount} shifts`,
        );

        // If backend has suspiciously low data, DON'T LOAD IT
        if (remoteEmployeeCount < 20) {
          console.error(
            '🚨 CRITICAL: Backend has corrupted data! Only',
            remoteEmployeeCount,
            'employees found.',
          );
          console.error(
            '🚨 Expected at least 20 employees. NOT loading from backend to prevent data loss.',
          );
          console.error('🚨 Please restore from backup immediately!');
          alert(
            '⚠️ WARNING: Database appears corrupted. Using local defaults. Please contact support.',
          );
          setIsHydrated(true);
          setIsLoading(false);
          return;
        }

        // Merge remote values with defaults (so missing keys don't break)
        if (Array.isArray(remote.employees) && remote.employees.length > 0) {
          console.log('✅ Loaded employees from backend:', remote.employees.length);
          setEmployees(remote.employees);
        }
        // Only load rosters if they contain actual shifts (prevent overwriting with empty data)
        if (remote.rosters) {
          // Handle both thisWeek/currentWeek naming (backend uses thisWeek, frontend uses currentWeek)
          const normalizedRosters = {
            currentWeek: remote.rosters.currentWeek || remote.rosters.thisWeek || WEEKLY_ROSTER,
            nextWeek: remote.rosters.nextWeek || WEEKLY_ROSTER,
          };

          const currentWeekShifts = Object.values(normalizedRosters.currentWeek || {}).flat()
            .length;
          const nextWeekShifts = Object.values(normalizedRosters.nextWeek || {}).flat().length;
          console.log(
            `📅 Roster data received. Current Week: ${currentWeekShifts} shifts, Next Week: ${nextWeekShifts} shifts`,
          );

          if (currentWeekShifts > 0 || nextWeekShifts > 0) {
            console.log('✅ Loading rosters from backend');
            setRosters(normalizedRosters);
          } else {
            console.warn('⚠️ No shifts found in roster data, keeping defaults');
          }
        }
        if (Array.isArray(remote.timeLogs) && remote.timeLogs.length > 0) {
          // Rehydrate dates
          const parsed = remote.timeLogs.map((log) => {
            const l = log as Record<string, unknown>;
            return {
              ...(l as Record<string, unknown>),
              clockInTime: new Date(String(l['clockInTime'])),
              clockOutTime: l['clockOutTime'] ? new Date(String(l['clockOutTime'])) : null,
            } as unknown as TimeLog;
          });
          setTimeLogs(parsed as TimeLog[]);
        }
      } catch (error) {
        console.warn('Could not load remote state; continuing with local defaults.', error);
      } finally {
        if (mounted) {
          setIsHydrated(true);
          setIsLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // SAFETY: Auto-backup to localStorage on every change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const backup = {
        employees,
        rosters,
        timeLogs,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('roster-backup', JSON.stringify(backup));
      console.log('💾 Local backup saved at', backup.timestamp);
    } catch (error) {
      console.error('Failed to save local backup:', error);
    }
  }, [employees, rosters, timeLogs, isHydrated]);

  // Real-time sync: listen for server-sent socket events and merge updates
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

    const socket = io(API_BASE, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => console.log('[IO] connected', socket.id));

    socket.on('stateUpdated', (newState: unknown) => {
      try {
        if (!newState || typeof newState !== 'object') return;
        const s = newState as {
          employees?: unknown;
          rosters?: unknown;
          timeLogs?: unknown;
        };

        if (Array.isArray(s.employees)) {
          setEmployees(s.employees as Employee[]);
        }

        if (s.rosters && typeof s.rosters === 'object') {
          const r = s.rosters as Record<string, unknown>;
          const normalizedRosters = {
            currentWeek: r.currentWeek || r.thisWeek || WEEKLY_ROSTER,
            nextWeek: r.nextWeek || WEEKLY_ROSTER,
          };
          setRosters(normalizedRosters);
        }

        if (Array.isArray(s.timeLogs)) {
          const parsed = (s.timeLogs as unknown[]).map((log) => {
            const l = log as Record<string, unknown>;
            return {
              ...l,
              clockInTime: new Date(String(l['clockInTime'])),
              clockOutTime: l['clockOutTime'] ? new Date(String(l['clockOutTime'])) : null,
            } as TimeLog;
          });
          setTimeLogs(parsed as TimeLog[]);
        }
      } catch (err) {
        console.warn('[IO] stateUpdated handler error', err);
      }
    });

    socket.on('timeLogCreated', (log: unknown) => {
      try {
        if (!log || typeof log !== 'object') return;
        const l = log as Record<string, unknown>;
        const parsed: TimeLog = {
          ...l,
          clockInTime: new Date(String(l['clockInTime'])),
          clockOutTime: l['clockOutTime'] ? new Date(String(l['clockOutTime'])) : null,
        } as TimeLog;
        setTimeLogs((prev) => {
          if (prev.some((t) => String(t.id) === String(parsed.id))) return prev;
          return [...prev, parsed];
        });
      } catch (err) {
        console.warn('[IO] timeLogCreated handler error', err);
      }
    });

    socket.on('timeLogUpdated', (log: unknown) => {
      try {
        if (!log || typeof log !== 'object') return;
        const l = log as Record<string, unknown>;
        const parsed: TimeLog = {
          ...l,
          clockInTime: new Date(String(l['clockInTime'])),
          clockOutTime: l['clockOutTime'] ? new Date(String(l['clockOutTime'])) : null,
        } as TimeLog;
        setTimeLogs((prev) => prev.map((t) => (String(t.id) === String(parsed.id) ? parsed : t)));
      } catch (err) {
        console.warn('[IO] timeLogUpdated handler error', err);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Persist to backend whenever core state changes (but only after initial hydration)
  useEffect(() => {
    if (!isHydrated) return; // Skip until hydration is done

    // ENHANCED SAFETY CHECKS: Prevent saving corrupted or empty data
    if (employees.length === 0) {
      console.error('🚫 BLOCKED: Attempted to save empty employees list!');
      return;
    }

    // Check total data being saved
    const totalShifts =
      Object.values(rosters.nextWeek || {}).flat().length +
      Object.values(rosters.currentWeek || {}).flat().length;

    // CHANGED: Allow saving even with 0 shifts (but warn user)
    if (totalShifts === 0 && timeLogs.length === 0) {
      console.warn('⚠️ WARNING: Saving empty rosters and time logs');
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    (async () => {
      try {
        console.log(
          `💾 Saving state: ${employees.length} employees, ${totalShifts} shifts, ${timeLogs.length} time logs`,
        );

        // Serialize dates to ISO strings
        // Convert currentWeek to thisWeek for backend compatibility
        const serializable = {
          employees,
          rosters: {
            thisWeek: rosters.currentWeek,
            nextWeek: rosters.nextWeek,
          },
          timeLogs: timeLogs.map((t) => ({
            ...t,
            clockInTime: t.clockInTime?.toISOString(),
            clockOutTime: t.clockOutTime?.toISOString() || null,
          })),
        };
        await apiSaveState(serializable);

        setIsSaving(false);
        setLastSaveTime(new Date());
        setSaveSuccess(true);
        setSaveError(null);
        console.log('✅ Save completed successfully');
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to save state to backend', error);
        setIsSaving(false);
        setSaveError(errMsg);
        alert(
          `⚠️ SAVE FAILED: ${errMsg}\n\nYour data is backed up locally in your browser. Please check your internet connection and refresh the page.`,
        );
      }
    })();
  }, [employees, rosters, timeLogs, isHydrated]);

  useEffect(() => {
    // If the current user is deleted from the employee list, log them out.
    if (currentUser && !employees.some((e) => e.id === currentUser.id)) {
      setCurrentUser(null);
    }
  }, [employees, currentUser]);

  const handleLogin = (employee: Employee) => {
    setCurrentUser(employee);
    setShowLoginForDepartment(null);
    // After login, route based on department and role
    if (showLoginForDepartment) {
      setSelectedDepartment(showLoginForDepartment);

      // Managers go to their department management view
      if (employee.role === 'Manager') {
        if (showLoginForDepartment === 'Kitchen') {
          setActiveView('roster');
        } else {
          setActiveView('employees');
        }
      } else {
        // Regular employees go to clock-in
        setActiveView('clock-in');
      }
    }
  };

  const handleSelectDepartment = (department: Department) => {
    // Show login modal for the selected department
    setShowLoginForDepartment(department);
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedDepartment(null);
    setCurrentUser(null); // Log out when going back
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
    setSelectedDepartment(null);
  };

  const isManager = currentUser?.role === 'Manager';
  const isKitchenDepartment = currentUser?.department === 'Kitchen';

  // nav helpers removed (not used)

  const AccessDenied = () => (
    <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-stone-200">
      <h2 className="text-xl font-bold text-slate-700">Access Denied</h2>
      <p className="text-stone-500 mt-2">
        You do not have permission to view this page. Please contact a manager.
      </p>
    </div>
  );

  const renderContent = () => {
    // Show dashboard without login
    if (activeView === 'dashboard') {
      return (
        <DashboardView
          currentUser={
            currentUser || { id: 0, name: 'Guest', role: 'Manager', pin: '', department: 'Kitchen' }
          }
          employees={employees}
          onSelectDepartment={handleSelectDepartment}
          showBackButton={!!currentUser}
          onBackToDashboard={currentUser ? handleBackToDashboard : undefined}
        />
      );
    }

    // For other views, require login
    if (!currentUser) {
      return null;
    }

    switch (activeView) {
      case 'roster':
        return isKitchenDepartment ? (
          <RosterView
            employees={employees}
            rosters={rosters}
            setRosters={setRosters}
            setEmployees={setEmployees}
            currentUser={currentUser}
            onNavigateToEmployees={() => setActiveView('employees')}
            onNavigateToClockIn={() => setActiveView('clock-in')}
          />
        ) : (
          <AccessDenied />
        );
      case 'clock-in':
        return (
          <ClockInView
            employees={employees}
            timeLogs={timeLogs}
            setTimeLogs={setTimeLogs}
            currentUser={currentUser}
            onNavigateToPayroll={() => setActiveView('payroll')}
            onNavigateToRoster={() => setActiveView('roster')}
          />
        );
      case 'employees':
        return isManager ? (
          <EmployeeView
            employees={employees}
            setEmployees={setEmployees}
            setRosters={setRosters}
            currentUser={currentUser}
            onNavigateToClockIn={() => setActiveView('clock-in')}
          />
        ) : (
          <AccessDenied />
        );
      case 'payroll':
        return (
          <PayrollView
            employees={employees}
            timeLogs={timeLogs}
            setTimeLogs={setTimeLogs}
            currentUser={currentUser}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-stone-300 border-t-orange-600 mb-4"></div>
          <p className="text-slate-700 text-xl font-semibold">Loading your workspace...</p>
          <p className="text-stone-500 text-sm mt-2">This may take a moment on first load</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-800">
      {/* Save Status Indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span className="font-medium">Saving...</span>
        </div>
      )}
      {saveError && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="font-medium">Save failed - Backed up locally</span>
        </div>
      )}
      {!isSaving && !saveError && saveSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Saved successfully!</span>
        </div>
      )}
      {!isSaving && !saveError && !saveSuccess && lastSaveTime && (
        <div className="fixed top-4 right-4 z-50 bg-slate-500 text-white px-3 py-1 rounded-lg shadow text-sm opacity-75">
          Last saved: {lastSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      {/* Only show header when NOT on dashboard */}
      {activeView !== 'dashboard' && currentUser && (
        <Header currentUser={currentUser} onLogout={handleLogout} />
      )}

      <main
        className={`p-4 sm:p-6 md:p-8 max-w-7xl mx-auto ${
          activeView === 'dashboard' ? 'pt-8' : 'pb-24'
        }`}
      >
        {/* Back to Dashboard button for non-dashboard views */}
        {activeView !== 'dashboard' && currentUser && (
          <button
            onClick={handleBackToDashboard}
            className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        )}

        {/* Logout button on dashboard when logged in */}
        {activeView === 'dashboard' && currentUser && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
            >
              Log Out
            </button>
          </div>
        )}

        {renderContent()}
      </main>

      {/* Login Modal - Shows when department is selected */}
      {showLoginForDepartment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">
                  Login to {showLoginForDepartment}
                </h2>
                <button
                  onClick={() => setShowLoginForDepartment(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <LoginView
                employees={employees.filter((e) => e.department === showLoginForDepartment)}
                onLogin={handleLogin}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
