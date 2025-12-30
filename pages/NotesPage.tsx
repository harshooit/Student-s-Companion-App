
import React, { useState, useEffect } from 'react';
import { NoteSubject, NoteFile } from '../types';
import { useAuth } from '../hooks/useAuth';
import * as db from '../lib/database';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { ICONS } from '../constants';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { UploadNoteModal } from '../components/notes/UploadNoteModal';

const FileIcon = ({ type }: { type: 'pdf' | 'image' }) => {
  const Icon = type === 'pdf' ? ICONS.pdf : ICONS.image;
  return <Icon className="w-6 h-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />;
};

const NotesPage = () => {
  const { user, isAdmin } = useAuth();
  const [subjects, setSubjects] = useState<NoteSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<NoteSubject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const data = await db.getNotes();
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubject(data[0]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleUploadSuccess = (updatedSubjects: NoteSubject[]) => {
    setSubjects(updatedSubjects);
    const newOrUpdatedSubject = updatedSubjects.find(s => s.name === (selectedSubject?.name || updatedSubjects[updatedSubjects.length-1].name));
    setSelectedSubject(newOrUpdatedSubject || null);
  };

  const handleDeleteNote = async (fileToDelete: NoteFile) => {
    if (!user || !selectedSubject || !isAdmin || !window.confirm(`Are you sure you want to delete "${fileToDelete.name}"? This will delete it for all users.`)) return;

    try {
      await db.deleteNoteFileFromStorage(fileToDelete.storagePath);

      const updatedFiles = selectedSubject.files.filter(f => f.path !== fileToDelete.path);
      const updatedSubject = { ...selectedSubject, files: updatedFiles };
      
      const updatedSubjects = subjects.map(s => s.name === selectedSubject.name ? updatedSubject : s);
      
      await db.saveNotes(updatedSubjects);
      setSubjects(updatedSubjects);
      setSelectedSubject(updatedSubject);

    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Could not delete the note. Please try again.");
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-48"><Spinner size="lg" color="border-indigo-600" /></div>;
    }
    if (error) {
      return <p className="text-center py-8 text-red-500 dark:text-red-400">{error}</p>;
    }
    if (selectedSubject) {
      return (
        <ul className="space-y-3">
          {selectedSubject.files.length > 0 ? selectedSubject.files.map((file) => (
            <li key={file.path} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <a href={file.path} target="_blank" rel="noopener noreferrer" className="flex items-center flex-grow min-w-0">
                <FileIcon type={file.type} />
                <span className="ml-3 font-medium text-gray-800 dark:text-gray-200 truncate" title={file.name}>{file.name}</span>
              </a>
              {isAdmin && (
                <button onClick={() => handleDeleteNote(file)} className="ml-4 p-1 text-gray-400 hover:text-red-500 flex-shrink-0" aria-label="Delete note">
                  <ICONS.trash className="w-5 h-5" />
                </button>
              )}
            </li>
          )) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No notes in this subject yet. {isAdmin && "Upload one to get started!"}</p>
          )}
        </ul>
      );
    }
    return <p className="text-center py-8 text-gray-500 dark:text-gray-400">Select a subject to view notes.</p>;
  };

  return (
    <>
      {isAdmin && <UploadNoteModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} existingSubjects={subjects} />}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Subjects</h2>
            {isAdmin && (
              <Button variant="secondary" onClick={() => setUploadModalOpen(true)} className="!p-2" aria-label="Upload new note">
                <ICONS.plus className="w-5 h-5" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-24"><Spinner color="border-indigo-600" /></div>
            ) : (
              <ul className="space-y-2">
                {subjects.map((subject) => (
                  <li key={subject.name}>
                    <button
                      onClick={() => setSelectedSubject(subject)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedSubject?.name === subject.name
                          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {subject.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <h2 className="text-xl font-bold">{selectedSubject?.name || 'Select a Subject'}</h2>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NotesPage;
