
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as db from '../../lib/database';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { User, BillSplit, BillParticipant } from '../../types';

interface BillSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
}

export const BillSplitModal = ({ isOpen, onClose, allUsers }: BillSplitModalProps) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableUsers = allUsers.filter(u => u.uid !== user?.uid);

  const handleUserToggle = (selectedUser: User) => {
    setSelectedUsers(prev => 
      prev.some(u => u.uid === selectedUser.uid)
        ? prev.filter(u => u.uid !== selectedUser.uid)
        : [...prev, selectedUser]
    );
  };

  const handleSubmit = async () => {
    if (!description || !totalAmount || selectedUsers.length === 0 || !user) {
      setError('Please fill all fields and select at least one person to split with.');
      return;
    }

    setLoading(true);
    setError('');

    const amount = parseFloat(totalAmount);
    const participantsAndPayer = [...selectedUsers, user];
    const amountPerPerson = amount / participantsAndPayer.length;

    const participants: BillParticipant[] = participantsAndPayer.map(p => ({
        uid: p.uid,
        username: p.username,
        amountOwed: amountPerPerson,
        hasPaid: p.uid === user.uid, // Payer is considered paid
    }));

    const newBillSplit = {
        payerId: user.uid,
        payerName: user.username,
        totalAmount: amount,
        description,
        participants,
        createdAt: new Date().toISOString(),
        participantIds: participants.map(p => p.uid),
    };

    try {
        await db.createBillSplit(newBillSplit);
        setLoading(false);
        onClose();
    } catch (e) {
        setError('Failed to create split. Please try again.');
        setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a New Bill Split">
      <div className="space-y-4">
        <Input type="text" placeholder="Description (e.g., Pizza Night)" value={description} onChange={e => setDescription(e.target.value)} />
        <Input type="number" placeholder="Total Amount" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} min="0.01" step="0.01" />
        
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Split with:</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 space-y-2">
                {availableUsers.map(u => (
                    <div key={u.uid} className="flex items-center">
                        <input id={`user-${u.uid}`} type="checkbox" checked={selectedUsers.some(su => su.uid === u.uid)} onChange={() => handleUserToggle(u)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor={`user-${u.uid}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">{u.name} (@{u.username})</label>
                    </div>
                ))}
            </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner /> : 'Create Split'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
