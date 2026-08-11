import * as SQLite from 'expo-sqlite';

import type { Task } from '../types';

type TaskRow = Omit<Task, 'completed' | 'synced' | 'reminder' | 'notificationId'> & {
  completed: number;
  synced: number;
  reminder: string | null;
  notificationId: string | null;
};

const databasePromise = SQLite.openDatabaseAsync('tasks.db');

function toTask(row: TaskRow): Task {
  return {
    ...row,
    completed: row.completed === 1,
    synced: row.synced === 1,
    reminder: row.reminder ?? undefined,
    notificationId: row.notificationId ?? undefined,
  };
}

async function executeSql(sql: string, args: SQLite.SQLiteBindParams = []): Promise<void> {
  const database = await databasePromise;
  await database.runAsync(sql, args);
}

export async function initializeTaskDatabase(): Promise<void> {
  await executeSql(
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      ownerId TEXT,
      title TEXT,
      notes TEXT,
      completed INTEGER,
      reminder TEXT,
      notificationId TEXT,
      updatedAt TEXT,
      synced INTEGER,
      deleted INTEGER DEFAULT 0
    );`
  );
}

export async function getLocalTasks(ownerId: string): Promise<Task[]> {
  const database = await databasePromise;
  const rows = await database.getAllAsync<TaskRow>(
    'SELECT * FROM tasks WHERE ownerId = ? AND deleted = 0 ORDER BY updatedAt DESC;',
    ownerId
  );
  return rows.map(toTask);
}

export async function saveLocalTask(task: Task): Promise<void> {
  await executeSql(
    `INSERT OR REPLACE INTO tasks (id, ownerId, title, notes, completed, reminder, notificationId, updatedAt, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [task.id, task.ownerId, task.title, task.notes ?? null, task.completed ? 1 : 0, task.reminder ?? null, task.notificationId ?? null, task.updatedAt, task.synced ? 1 : 0]
  );
}

export async function deleteLocalTask(taskId: string): Promise<void> {
  await executeSql('DELETE FROM tasks WHERE id = ?;', [taskId]);
}

export async function markLocalTaskDeleted(taskId: string): Promise<void> {
  await executeSql('UPDATE tasks SET deleted = 1 WHERE id = ?;', [taskId]);
}

export async function markLocalTaskSynced(taskId: string, synced: boolean): Promise<void> {
  await executeSql('UPDATE tasks SET synced = ? WHERE id = ?;', [synced ? 1 : 0, taskId]);
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const database = await databasePromise;
  const row = await database.getFirstAsync<TaskRow>('SELECT * FROM tasks WHERE id = ?;', taskId);
  return row ? toTask(row) : null;
}

export async function getPendingDeleteTasks(ownerId: string): Promise<Task[]> {
  const database = await databasePromise;
  const rows = await database.getAllAsync<TaskRow>(
    'SELECT * FROM tasks WHERE ownerId = ? AND deleted = 1 ORDER BY updatedAt DESC;',
    ownerId
  );
  return rows.map(toTask);
}

export async function saveRemoteTaskLocally(task: Task): Promise<void> {
  await executeSql(
    `INSERT OR REPLACE INTO tasks (id, ownerId, title, notes, completed, reminder, notificationId, updatedAt, synced, deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    [task.id, task.ownerId, task.title, task.notes ?? null, task.completed ? 1 : 0, task.reminder ?? null, task.notificationId ?? null, task.updatedAt, 1]
  );
}

export async function getUnsyncedTasks(ownerId: string): Promise<Task[]> {
  const database = await databasePromise;
  const rows = await database.getAllAsync<TaskRow>(
    'SELECT * FROM tasks WHERE ownerId = ? AND synced = 0 AND deleted = 0 ORDER BY updatedAt DESC;',
    ownerId
  );
  return rows.map(toTask);
}
