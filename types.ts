
export interface User {
  uid: string;
  name: string;
  username: string;
  email: string;
}

export interface Class {
  subject: string;
  time: string;
  room: string;
}

export interface Timetable {
  [day: string]: Class[];
}

export interface Attendance {
  [date: string]: { // YYYY-MM-DD
    [subject: string]: boolean;
  };
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  reminder?: string; // ISO string
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Restaurant {
  id:string;
  name: string;
  address: string;
  reviewSummary: string;
  isVeg: boolean;
  distance: number; // in km
}

export interface NoteFile {
  name: string;
  path: string; // Full download URL
  storagePath: string; // Path within Firebase Storage
  type: 'pdf' | 'image';
}

export interface NoteSubject {
  name: string;
  files: NoteFile[];
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string; // ISO string
}

export interface BillParticipant {
    uid: string;
    username: string;
    amountOwed: number;
    hasPaid: boolean;
}

export interface BillSplit {
    id: string;
    payerId: string;
    payerName: string;
    totalAmount: number;
    description: string;
    participants: BillParticipant[];
    participantIds: string[];
    createdAt: string; // ISO string
}
