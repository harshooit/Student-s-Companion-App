
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../components/ui/Card';
import { ICONS } from '../constants';

const features = [
  { name: 'AI Timetable', icon: ICONS.timetable, desc: 'Scan your schedule and get a daily view.', link: '#/timetable' },
  { name: 'Task Manager', icon: ICONS.tasks, desc: 'Organize your assignments and set reminders.', link: '#/tasks' },
  { name: 'AI Study Helper', icon: ICONS.study, desc: 'Get instant help with your academic questions.', link: '#/study' },
  { name: 'Class Notes', icon: ICONS.notes, desc: 'Access shared notes and materials for your subjects.', link: '#/notes' },
  { name: 'Food Guide', icon: ICONS.food, desc: 'Discover nearby restaurants with filters.', link: '#/food' },
];

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}!</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Your smart campus companion is ready to assist you.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <a href={feature.link} key={feature.name} className="block">
            <Card className="h-full hover:border-indigo-500 dark:hover:border-indigo-400 border-2 border-transparent">
              <CardContent className="flex flex-col items-center text-center">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{feature.name}</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">{feature.desc}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
