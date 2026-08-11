import * as SQLite from 'expo-sqlite';

import type { Task } from '@/types';

const database = SQLite.openDatabase('tasks.db');

function executeSql<T = unknown>(sql: string, args: (string | number | null)[] = []): Promise<T> {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        sql,
        args,
        (_, result) => resolve(result as unknown as T),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

export function initializeTaskDatabase(): Promise<void> {
  return executeSql(
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      ownerId TEXT,
      title TEXT,
      notes TEXT,
      completed INTEGER,
      reminder TEXT,
      notificationId TEXT,
      updatedAt TEXT,
      synced INTEGER
    );`
  ).then(() => undefined);
}

export async function getLocalTasks(ownerId: string): Promise<Task[]> {
  const result = await executeSql<SQLite.SQLResultSet>(
    'SELECT * FROM tasks WHERE ownerId = ? ORDER BY updatedAt DESC;',
    [ownerId]
  );

  return Array.from({ length: result.rows.length }, (_, index) => {
    const row = result.rows.item(index);
    return {
      id: row.id,
      ownerId: row.ownerId,
      title: row.title,
      notes: row.notes,
      completed: row.completed === 1,
      reminder: row.reminder ?? undefined,
      notificationId: row.notificationId ?? undefined,
      updatedAt: row.updatedAt,
      synced: row.synced === 1,
    };
  });
}

export function saveLocalTask(task: Task): Promise<void> {
  return executeSql(
    `INSERT OR REPLACE INTO tasks (id, ownerId, title, notes, completed, reminder, notificationId, updatedAt, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      task.id,
      task.ownerId,
      task.title,
      task.notes ?? null,
      task.completed ? 1 : 0,
      task.reminder ?? null,
      task.notificationId ?? null,
      task.updatedAt,
      task.synced ? 1 : 0,
    ]
  ).then(() => undefined);
}

export function deleteLocalTask(taskId: string): Promise<void> {
  return executeSql('DELETE FROM tasks WHERE id = ?;', [taskId]).then(() => undefined);
}

export function getUnsyncedTasks(ownerId: string): Promise<Task[]> {
  return executeSql<SQLite.SQLResultSet>(
    'SELECT * FROM tasks WHERE ownerId = ? AND synced = 0 ORDER BY updatedAt DESC;',
    [ownerId]
  ).then((result) =>
    Array.from({ length: result.rows.length }, (_, index) => {
      const row = result.rows.item(index);
      return {
        id: row.id,
        ownerId: row.ownerId,
        title: row.title,
        notes: row.notes,
        completed: row.completed === 1,
        reminder: row.reminder ?? undefined,
        notificationId: row.notificationId ?? undefined,
        updatedAt: row.updatedAt,
        synced: row.synced === 1,
      };
    })
  );
}
