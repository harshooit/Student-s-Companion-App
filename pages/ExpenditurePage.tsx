
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as db from '../lib/database';
import { Expense, BillSplit, User } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { ICONS } from '../constants';
import { BillSplitModal } from '../components/expenditure/BillSplitModal';
import { BillSplitter } from '../components/expenditure/BillSplitter';

const EXPENSE_CATEGORIES = ["Food", "Transport", "Supplies", "Entertainment", "Other"];

const PersonalExpenses = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);

    useEffect(() => {
        if (!user) return;
        const loadExpenses = async () => {
            setLoading(true);
            const data = await db.getExpenses(user.uid);
            setExpenses(data);
            setLoading(false);
        };
        loadExpenses();
    }, [user]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !user) return;

        const newExpense: Expense = {
            id: `exp_${Date.now()}`,
            description,
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString(),
        };
        const updatedExpenses = [...expenses, newExpense];
        setExpenses(updatedExpenses);
        await db.saveExpenses(user.uid, updatedExpenses);
        setDescription('');
        setAmount('');
    };

    const totalThisMonth = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return expenses
            .filter(exp => {
                const expDate = new Date(exp.date);
                return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
    }, [expenses]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Add New Expense</h3>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total This Month</p>
                            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${totalThisMonth.toFixed(2)}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <Input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="sm:col-span-2" />
                        <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" />
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <Button type="submit" className="sm:col-span-4">Add Expense</Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><h3 className="text-lg font-semibold">Expense History</h3></CardHeader>
                <CardContent>
                    {loading ? <Spinner color="border-indigo-600" /> : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {expenses.length > 0 ? [...expenses].reverse().map(exp => (
                                <li key={exp.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{exp.description}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{exp.category} - {new Date(exp.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">${exp.amount.toFixed(2)}</p>
                                </li>
                            )) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">No expenses logged yet.</p>}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const ExpenditurePage = () => {
    const [activeTab, setActiveTab] = useState<'expenses' | 'splitter'>('expenses');

    return (
        <div className="space-y-6">
            <div>
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('expenses')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'expenses' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            My Expenses
                        </button>
                        <button onClick={() => setActiveTab('splitter')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'splitter' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Bill Splitter
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'expenses' && <PersonalExpenses />}
            {activeTab === 'splitter' && <BillSplitter />}
        </div>
    );
};

export default ExpenditurePage;
