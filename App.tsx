
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthPage from './components/auth/AuthPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import TimetablePage from './pages/TimetablePage';
import TasksPage from './pages/TasksPage';
import StudyHelperPage from './pages/StudyHelperPage';
import NotesPage from './pages/NotesPage';
import FoodPage from './pages/FoodPage';
import ExpenditurePage from './pages/ExpenditurePage';
import { Spinner } from './components/ui/Spinner';

const routes: { [key: string]: React.ComponentType } = {
  '/': DashboardPage,
  '/dashboard': DashboardPage,
  '/timetable': TimetablePage,
  '/tasks': TasksPage,
  '/study': StudyHelperPage,
  '/notes': NotesPage,
  '/food': FoodPage,
  '/expenditure': ExpenditurePage,
};

const AppRouter = () => {
  const { user, loading } = useAuth();
  const [hash, setHash] = useState(window.location.hash.substring(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash.substring(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const CurrentPage = routes[hash] || DashboardPage;
  const pageTitle = hash.substring(1).charAt(0).toUpperCase() + hash.substring(2) || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
          <CurrentPage />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
