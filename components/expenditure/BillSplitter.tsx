
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as db from '../../lib/database';
import { BillSplit, User } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { BillSplitModal } from './BillSplitModal';

export const BillSplitter = () => {
    const { user } = useAuth();
    const [allSplits, setAllSplits] = useState<BillSplit[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = db.onBillSplitsUpdate(user.uid, (splits) => {
            setAllSplits(splits);
            setLoading(false);
        });

        const fetchUsers = async () => {
            const users = await db.getAllUsers();
            setAllUsers(users);
        };
        fetchUsers();

        return () => unsubscribe();
    }, [user]);

    const { debtsOwed, owedToYou } = useMemo(() => {
        if (!user) return { debtsOwed: [], owedToYou: [] };

        const debtsOwed = allSplits.filter(split => 
            split.participants.some(p => p.uid === user.uid && !p.hasPaid)
        );

        const owedToYou = allSplits.filter(split => split.payerId === user.uid);

        return { debtsOwed, owedToYou };
    }, [allSplits, user]);

    const handleSettleDebt = async (billSplitId: string, participantUid: string) => {
        await db.settleDebt(billSplitId, participantUid);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" color="border-indigo-600" /></div>;
    }

    return (
        <>
            <BillSplitModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} allUsers={allUsers} />
            <div className="space-y-6">
                <div className="text-right">
                    <Button onClick={() => setModalOpen(true)}>Create New Split</Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><h3 className="text-lg font-semibold">You Owe</h3></CardHeader>
                        <CardContent>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {debtsOwed.length > 0 ? debtsOwed.map(split => {
                                    const myDebt = split.participants.find(p => p.uid === user?.uid);
                                    if (!myDebt) return null;
                                    return (
                                        <li key={split.id} className="py-3">
                                            <p>You owe <span className="font-bold text-red-500">${myDebt.amountOwed.toFixed(2)}</span> to <span className="font-semibold">{split.payerName}</span></p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">For: {split.description}</p>
                                        </li>
                                    );
                                }) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">You have no outstanding debts. Good job!</p>}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><h3 className="text-lg font-semibold">Owed to You</h3></CardHeader>
                        <CardContent>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {owedToYou.length > 0 ? owedToYou.map(split => (
                                    <li key={split.id} className="py-3 space-y-2">
                                        <p className="font-medium">For: {split.description} (${split.totalAmount.toFixed(2)})</p>
                                        <ul className="pl-4 space-y-1">
                                            {split.participants.filter(p => p.uid !== user?.uid).map(p => (
                                                <li key={p.uid} className="flex justify-between items-center">
                                                    <div>
                                                        <p className={p.hasPaid ? 'line-through text-gray-500' : ''}>{p.username} owes <span className="font-bold">${p.amountOwed.toFixed(2)}</span></p>
                                                    </div>
                                                    {!p.hasPaid && (
                                                        <Button size="sm" variant="secondary" onClick={() => handleSettleDebt(split.id, p.uid)}>Settle</Button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                )) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">No one owes you money from splits.</p>}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};
