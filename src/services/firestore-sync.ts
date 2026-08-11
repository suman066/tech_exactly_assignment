import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
} from 'firebase/firestore';

import { firestore } from './firebase';
import type { Task } from '../types';

const taskCollection = (userId: string) => collection(firestore, 'users', userId, 'tasks');
const taskDocument = (userId: string, taskId: string) => doc(taskCollection(userId), taskId);

export async function uploadTask(userId: string, task: Task): Promise<void> {
  await setDoc(taskDocument(userId, task.id), {
    ...task,
    synced: true,
  });
}

export async function deleteRemoteTask(userId: string, taskId: string): Promise<void> {
  await deleteDoc(taskDocument(userId, taskId));
}

export async function fetchRemoteTasks(userId: string): Promise<Task[]> {
  const snapshot = await getDocs(query(taskCollection(userId)));

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data() as Task;
    return {
      ...data,
      id: docSnapshot.id,
      ownerId: userId,
      completed: data.completed ?? false,
      synced: true,
      reminder: data.reminder ?? undefined,
      notificationId: data.notificationId ?? undefined,
      notes: data.notes ?? undefined,
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    };
  });
}
