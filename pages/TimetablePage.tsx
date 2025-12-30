
import React, { useState, useEffect, useMemo } from 'react';
import { Timetable, Class, Attendance } from '../types';
import * as db from '../lib/database';
import { useAuth } from '../hooks/useAuth';
import { parseTimetableFromImage } from '../lib/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ICONS } from '../constants';

const TimetableUpload = ({ onUploadSuccess }: { onUploadSuccess: (tt: Timetable) => void }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file || !user) {
      setError('Please select an image file.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const parsedTimetable = await parseTimetableFromImage(base64);
        await db.saveTimetable(user.uid, parsedTimetable);
        onUploadSuccess(parsedTimetable);
      };
      reader.onerror = () => {
        setError('Failed to read file.');
        setLoading(false);
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="text-center">
        <ICONS.upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Upload Timetable</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Upload a clear image of your class schedule.</p>
        <div className="mt-4">
          <input type="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-6">
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? <Spinner /> : 'Parse & Save Timetable'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AttendanceTracker = ({ attendance, timetable }: { attendance: Attendance, timetable: Timetable | null }) => {
    const stats = useMemo(() => {
        if (!timetable) return { attended: 0, missed: 0, percentage: 0 };

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        let attended = 0;
        let missed = 0;

        for (let d = new Date(firstDayOfMonth); d <= today; d.setDate(d.getDate() + 1)) {
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const dateString = d.toISOString().split('T')[0];
            const classesForDay = timetable[dayName] || [];
            
            if (classesForDay.length > 0) {
                const attendanceForDay = attendance[dateString] || {};
                classesForDay.forEach(cls => {
                    if (attendanceForDay[cls.subject] === true) {
                        attended++;
                    } else {
                        missed++;
                    }
                });
            }
        }
        
        const totalTracked = attended + missed;
        const percentage = totalTracked > 0 ? Math.round((attended / totalTracked) * 100) : 0;

        return { attended, missed, percentage };
    }, [attendance, timetable]);

    return (
        <Card>
            <CardHeader><h3 className="text-lg font-semibold">Monthly Attendance</h3></CardHeader>
            <CardContent>
                {(stats.attended + stats.missed) > 0 ? (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Attendance Percentage</span>
                            <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">{stats.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600 dark:text-green-400">Attended: {stats.attended}</span>
                            <span className="text-red-600 dark:text-red-400">Missed: {stats.missed}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No classes attended or missed yet this month.</p>
                )}
            </CardContent>
        </Card>
    );
};

const TimetablePage = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [attendance, setAttendance] = useState<Attendance>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      const [tt, att] = await Promise.all([db.getTimetable(user.uid), db.getAttendance(user.uid)]);
      setTimetable(tt);
      setAttendance(att);
      setLoading(false);
    };
    loadData();
  }, [user]);

  const handleAttendanceChange = async (subject: string, attended: boolean) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const newAttendance = {
      ...attendance,
      [today]: {
        ...attendance[today],
        [subject]: attended,
      },
    };
    setAttendance(newAttendance);
    await db.saveAttendance(user.uid, newAttendance);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" color="border-indigo-600" /></div>;
  }

  if (!timetable) {
    return <TimetableUpload onUploadSuccess={setTimetable} />;
  }

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todaysClasses = timetable[dayName] || [];
  const todayDateString = today.toISOString().split('T')[0];
  const todaysAttendance = attendance[todayDateString] || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Today's Schedule ({today.toLocaleDateString('en-US', { weekday: 'long' })})</h2>
          </CardHeader>
          <CardContent>
            {todaysClasses.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {todaysClasses.map((cls, index) => (
                  <li key={index} className="py-4 flex items-center justify-between">
                    <div className="flex-grow">
                      <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{cls.subject}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{cls.time} • {cls.room}</p>
                    </div>
                    <div className="flex items-center">
                        <label htmlFor={`att-${index}`} className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">Attended:</label>
                        <input
                            id={`att-${index}`}
                            type="checkbox"
                            checked={!!todaysAttendance[cls.subject]}
                            onChange={(e) => handleAttendanceChange(cls.subject, e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">No classes today. Enjoy your day off!</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <AttendanceTracker attendance={attendance} timetable={timetable} />
      </div>
    </div>
  );
};

export default TimetablePage;
