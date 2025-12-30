
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import * as db from '../lib/database';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';
import { Spinner } from '../components/ui/Spinner';

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newReminder, setNewReminder] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadTasks = async () => {
      setLoading(true);
      const storedTasks = await db.getTasks(user.uid);
      setTasks(storedTasks);
      setLoading(false);
    };
    loadTasks();
  }, [user]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !user) return;
    const newTask: Task = {
      id: `task_${Date.now()}`,
      text: newTaskText,
      completed: false,
      reminder: newReminder || undefined,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await db.saveTasks(user.uid, updatedTasks);
    setNewTaskText('');
    setNewReminder('');
  };

  const handleToggleTask = async (id: string) => {
    if (!user) return;
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await db.saveTasks(user.uid, updatedTasks);
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    await db.saveTasks(user.uid, updatedTasks);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" color="border-indigo-600" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Tasks & Reminders</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 mb-6">
          <Input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow"
          />
          <Input
            type="datetime-local"
            value={newReminder}
            onChange={(e) => setNewReminder(e.target.value)}
            title="Set a reminder"
          />
          <Button type="submit">Add Task</Button>
        </form>
        <ul className="space-y-3">
          {tasks.length > 0 ? tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                />
                <div>
                  <p className={`text-gray-800 dark:text-gray-200 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.text}
                  </p>
                  {task.reminder && (
                    <p className="text-xs text-indigo-500 dark:text-indigo-400">
                      Reminder: {new Date(task.reminder).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-gray-400 hover:text-red-500"
                aria-label="Delete task"
              >
                <ICONS.trash className="w-5 h-5" />
              </button>
            </li>
          )) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No tasks yet. Add one to get started!</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TasksPage;
