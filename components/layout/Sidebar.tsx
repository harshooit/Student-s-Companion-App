
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ICONS } from '../../constants';

const navItems = [
  { href: '#/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
  { href: '#/timetable', label: 'Timetable', icon: ICONS.timetable },
  { href: '#/tasks', label: 'Tasks', icon: ICONS.tasks },
  { href: '#/expenditure', label: 'Expenditure', icon: ICONS.expenditure },
  { href: '#/study', label: 'Study Helper', icon: ICONS.study },
  { href: '#/notes', label: 'Notes', icon: ICONS.notes },
  { href: '#/food', label: 'Food Guide', icon: ICONS.food },
];

const NavLink = ({ href, label, icon: Icon }: typeof navItems[0]) => {
  const currentHash = window.location.hash || '#/dashboard';
  const isActive = currentHash === href;

  return (
    <a
      href={href}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="w-6 h-6 mr-3" />
      <span>{label}</span>
    </a>
  );
};

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Campus Compass</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 sidebar-scrollbar overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
            <ICONS.user className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">@{user?.username}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-lg transition-colors duration-200"
        >
          <ICONS.logout className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
