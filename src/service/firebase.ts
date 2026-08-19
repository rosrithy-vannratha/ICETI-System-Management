import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocFromServer,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, Teacher, ClassRoom, Major, Generation, AcademicYear, YearLevel, Semester, AttendanceStatus } from '../types';

// Operation Types for error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Initialize Firebase App & Firestore
let app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db: Firestore = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is in offline mode or initial test document is pending.');
    }
    return false;
  }
}

// ==========================================
// Generic Firestore CRUD Service
// ==========================================

export const firestoreDatabase = {
  // Subscribe to real-time updates for any collection
  subscribeCollection<T>(
    collectionName: string,
    onData: (items: T[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as T));
        onData(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, collectionName);
        } catch (wrappedErr) {
          if (onError) onError(wrappedErr as Error);
        }
      }
    );
  },

  // Get all documents from a collection
  async getAll<T>(collectionName: string): Promise<T[]> {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as T));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    }
  },

  // Set or update a document
  async setItem<T extends { id: string }>(collectionName: string, item: T): Promise<T> {
    const path = `${collectionName}/${item.id}`;
    try {
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, item, { merge: true });
      return item;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Delete a document
  async deleteItem(collectionName: string, id: string): Promise<void> {
    const path = `${collectionName}/${id}`;
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Batch import / replace
  async batchSet<T extends { id: string }>(collectionName: string, items: T[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      for (const item of items) {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, item, { merge: true });
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, collectionName);
    }
  },

  // Batch delete
  async batchDelete(collectionName: string, ids: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      for (const id of ids) {
        const docRef = doc(db, collectionName, id);
        batch.delete(docRef);
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, collectionName);
    }
  },

  // Save attendance record for a class & date
  async saveAttendanceRecord(
    classId: string,
    date: string,
    records: Record<string, { status: AttendanceStatus; note?: string }>
  ): Promise<void> {
    const recordId = `${classId}_${date}`;
    const path = `attendances/${recordId}`;
    try {
      const docRef = doc(db, 'attendances', recordId);
      await setDoc(docRef, {
        id: recordId,
        classId,
        date,
        records,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Get all attendances
  async getAllAttendances(): Promise<Record<string, Record<string, { status: AttendanceStatus; note?: string }>>> {
    try {
      const colRef = collection(db, 'attendances');
      const snapshot = await getDocs(colRef);
      const result: Record<string, Record<string, { status: AttendanceStatus; note?: string }>> = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.id && data.records) {
          result[data.id] = data.records;
        }
      });
      return result;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'attendances');
    }
  }
};
