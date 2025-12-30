
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { User, Task, Timetable, Attendance, NoteSubject, Expense, BillSplit } from '../types';

// --- Auth Functions ---

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        callback(userDoc.data() as User);
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

export const registerUser = async (name: string, username: string, password: string): Promise<User> => {
  const email = `${username.toLowerCase()}@campuscompass.app`;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    throw new Error('Username already exists.');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  await updateProfile(firebaseUser, { displayName: name });
  const newUser: User = {
    uid: firebaseUser.uid,
    name,
    username,
    email: firebaseUser.email!,
  };
  await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
  return newUser;
};

export const loginUser = async (username: string, password: string): Promise<User> => {
  const email = `${username.toLowerCase()}@campuscompass.app`;
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  if (!userDoc.exists()) {
    throw new Error('User data not found.');
  }
  return userDoc.data() as User;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getAllUsers = async (): Promise<User[]> => {
    const users: User[] = [];
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
        users.push(doc.data() as User);
    });
    return users;
}

// --- Data Functions ---

const getUserDataRef = (uid: string) => doc(db, 'userData', uid);
const getGlobalDataRef = (docId: string) => doc(db, 'globalData', docId);

// Timetable
export const saveTimetable = async (uid: string, timetable: Timetable): Promise<void> => {
  await setDoc(getUserDataRef(uid), { timetable }, { merge: true });
};
export const getTimetable = async (uid: string): Promise<Timetable | null> => {
  const docSnap = await getDoc(getUserDataRef(uid));
  return docSnap.exists() ? (docSnap.data().timetable as Timetable) : null;
};

// Attendance
export const saveAttendance = async (uid: string, attendance: Attendance): Promise<void> => {
  await setDoc(getUserDataRef(uid), { attendance }, { merge: true });
};
export const getAttendance = async (uid: string): Promise<Attendance> => {
  const docSnap = await getDoc(getUserDataRef(uid));
  return docSnap.exists() ? (docSnap.data().attendance as Attendance) : {};
};

// Tasks
export const saveTasks = async (uid: string, tasks: Task[]): Promise<void> => {
  await setDoc(getUserDataRef(uid), { tasks }, { merge: true });
};
export const getTasks = async (uid: string): Promise<Task[]> => {
  const docSnap = await getDoc(getUserDataRef(uid));
  return docSnap.exists() && docSnap.data().tasks ? (docSnap.data().tasks as Task[]) : [];
};

// Notes (Global)
export const saveNotes = async (notes: NoteSubject[]): Promise<void> => {
  await setDoc(getGlobalDataRef('notes'), { subjects: notes });
};
export const getNotes = async (): Promise<NoteSubject[]> => {
  const docSnap = await getDoc(getGlobalDataRef('notes'));
  return docSnap.exists() && docSnap.data().subjects ? (docSnap.data().subjects as NoteSubject[]) : [];
};
export const deleteNoteFileFromStorage = async (storagePath: string): Promise<void> => {
  const fileRef = ref(storage, storagePath);
  await deleteObject(fileRef);
};

// Personal Expenses
export const saveExpenses = async (uid: string, expenses: Expense[]): Promise<void> => {
    await setDoc(getUserDataRef(uid), { expenses }, { merge: true });
};
export const getExpenses = async (uid: string): Promise<Expense[]> => {
    const docSnap = await getDoc(getUserDataRef(uid));
    return docSnap.exists() && docSnap.data().expenses ? (docSnap.data().expenses as Expense[]) : [];
};

// Bill Splits
export const createBillSplit = async (billSplit: Omit<BillSplit, 'id'> & { participantIds: string[] }): Promise<void> => {
    await addDoc(collection(db, 'billSplits'), billSplit);
};

export const onBillSplitsUpdate = (uid: string, callback: (splits: BillSplit[]) => void) => {
    const q = query(collection(db, 'billSplits'), where('participantIds', 'array-contains', uid));
    return onSnapshot(q, (querySnapshot) => {
        const splits: BillSplit[] = [];
        querySnapshot.forEach((doc) => {
            splits.push({ id: doc.id, ...doc.data() } as BillSplit);
        });
        callback(splits);
    });
};

export const settleDebt = async (billSplitId: string, participantUid: string): Promise<void> => {
    const billSplitRef = doc(db, 'billSplits', billSplitId);
    const docSnap = await getDoc(billSplitRef);
    if (docSnap.exists()) {
        const billSplit = docSnap.data() as BillSplit;
        const updatedParticipants = billSplit.participants.map(p => 
            p.uid === participantUid ? { ...p, hasPaid: true } : p
        );
        await updateDoc(billSplitRef, { participants: updatedParticipants });
    }
};
