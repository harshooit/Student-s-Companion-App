
import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../hooks/useAuth';
import { storage } from '../../lib/firebase';
import * as dbApi from '../../lib/database';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { NoteSubject, NoteFile } from '../../types';

interface UploadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (subjects: NoteSubject[]) => void;
  existingSubjects: NoteSubject[];
}

export const UploadNoteModal = ({ isOpen, onClose, onUploadSuccess, existingSubjects }: UploadNoteModalProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState(existingSubjects[0]?.name || '');
  const [isNewSubject, setIsNewSubject] = useState(existingSubjects.length === 0);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      setError('Please select a file.');
      return;
    }
    const finalSubjectName = isNewSubject ? newSubjectName.trim() : subject;
    if (!finalSubjectName) {
      setError('Please select or create a subject.');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
    const storagePath = `notes/global/${finalSubjectName}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (err) => {
        console.error(err);
        setError('Upload failed. Please try again.');
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newNoteFile: NoteFile = {
          name: file.name,
          path: downloadURL,
          storagePath: storagePath,
          type: fileType,
        };

        const currentNotes = await dbApi.getNotes();
        let subjectExists = false;
        const updatedNotes = currentNotes.map(s => {
          if (s.name === finalSubjectName) {
            subjectExists = true;
            return { ...s, files: [...s.files, newNoteFile] };
          }
          return s;
        });

        if (!subjectExists) {
          updatedNotes.push({ name: finalSubjectName, files: [newNoteFile] });
        }

        await dbApi.saveNotes(updatedNotes);
        setUploading(false);
        onUploadSuccess(updatedNotes);
        onClose();
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload a New Note">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
          <Input type="file" onChange={handleFileChange} accept="image/*,.pdf" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input id="existing-subject" name="subject-type" type="radio" checked={!isNewSubject} onChange={() => setIsNewSubject(false)} className="h-4 w-4 text-indigo-600 border-gray-300" disabled={existingSubjects.length === 0} />
              <label htmlFor="existing-subject" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">Existing</label>
            </div>
            <div className="flex items-center">
              <input id="new-subject" name="subject-type" type="radio" checked={isNewSubject} onChange={() => setIsNewSubject(true)} className="h-4 w-4 text-indigo-600 border-gray-300" />
              <label htmlFor="new-subject" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">New</label>
            </div>
          </div>
        </div>

        {isNewSubject ? (
          <Input type="text" placeholder="New subject name..." value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
        ) : (
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="" disabled>Select a subject</option>
            {existingSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        )}

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
            <div className="bg-indigo-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress}%` }}>
              {progress}%
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? <Spinner /> : 'Upload'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
