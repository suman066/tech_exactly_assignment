import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from 'firebase/firestore';

import { firestore } from './firebase';
import type { Task } from '../types';

const taskCollection = (userId: string) => collection(firestore, 'users', userId, 'tasks');
const taskDocument = (userId: string, taskId: string) => doc(taskCollection(userId), taskId);

export async function uploadTask(userId: string, task: Task): Promise<void> {
  const remoteTask = {
    id: task.id,
    ownerId: userId,
    title: task.title,
    completed: task.completed,
    updatedAt: task.updatedAt,
    synced: true,
    ...(task.notes !== undefined ? { notes: task.notes } : {}),
    ...(task.reminder !== undefined ? { reminder: task.reminder } : {}),
    ...(task.notificationId !== undefined ? { notificationId: task.notificationId } : {}),
  };

  await setDoc(taskDocument(userId, task.id), remoteTask);
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

export async function saveUserPushToken(userId: string, token: string): Promise<void> {
  const userDoc = doc(firestore, 'users', userId);
  await setDoc(userDoc, { pushToken: token }, { merge: true });
}

export async function fetchUserPushToken(userId: string): Promise<string | null> {
  const userDoc = doc(firestore, 'users', userId);
  const snapshot = await getDoc(userDoc);
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as any;
  return (data?.pushToken as string) ?? null;
}

export async function removeUserPushToken(userId: string): Promise<void> {
  const userDoc = doc(firestore, 'users', userId);
  await setDoc(userDoc, { pushToken: null }, { merge: true });
}
