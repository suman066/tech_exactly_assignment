import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as Network from 'expo-network';

import { cancelScheduledReminder, scheduleTaskReminder } from '../services/notifications';
import {
  deleteLocalTask,
  getLocalTasks,
  getPendingDeleteTasks,
  getUnsyncedTasks,
  getTaskById,
  initializeTaskDatabase,
  markLocalTaskDeleted,
  markLocalTaskSynced,
  saveLocalTask,
  saveRemoteTaskLocally,
} from '../services/local-db';
import { deleteRemoteTask, fetchRemoteTasks, uploadTask } from '../services/firestore-sync';
import type { Task } from '../types';

export interface TasksState {
  tasks: Task[];
  status: 'idle' | 'loading' | 'failed';
  syncing: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  status: 'idle',
  syncing: false,
  error: null,
};

export const initializeTasksAsync = createAsyncThunk(
  'tasks/initialize',
  async (ownerId: string, thunkAPI: any) => {
    await initializeTaskDatabase();
    const localTasks = await getLocalTasks(ownerId);

    const networkState = await Network.getNetworkStateAsync();
    const connected = networkState.isInternetReachable ?? networkState.isConnected ?? false;

    if (connected) {
      await thunkAPI.dispatch(syncTasksAsync(ownerId));
    }

    return localTasks;
  }
);

export const saveTaskAsync = createAsyncThunk(
  'tasks/save',
  async (
    payload: { task: Task; ownerId: string },
    thunkAPI: any
  ) => {
    const { task, ownerId } = payload;
    const existingTask = await getTaskById(task.id);
    const action = existingTask ? 'update' : 'create';

    const reminderId = await scheduleTaskReminder(task);
    const updatedTask: Task = {
      ...task,
      ownerId,
      notificationId: reminderId ?? task.notificationId,
      updatedAt: task.updatedAt ?? new Date().toISOString(),
      synced: false,
    };

    await saveLocalTask(updatedTask);

    const networkState = await Network.getNetworkStateAsync();
    const connected = networkState.isInternetReachable ?? networkState.isConnected ?? false;

    if (connected) {
      await uploadTask(ownerId, updatedTask);
      await markLocalTaskSynced(task.id, true);
      return { task: { ...updatedTask, synced: true } };
    }

    return { task: updatedTask };
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/delete',
  async (
    payload: { taskId: string; ownerId: string },
    thunkAPI: any
  ) => {
    const { taskId, ownerId } = payload;
    const task = await getTaskById(taskId);

    if (task?.notificationId) {
      await cancelScheduledReminder(task.notificationId);
    }

    const networkState = await Network.getNetworkStateAsync();
    const connected = networkState.isInternetReachable ?? networkState.isConnected ?? false;

    if (connected) {
      await deleteRemoteTask(ownerId, taskId);
      await deleteLocalTask(taskId);
      return { taskId };
    }

    await markLocalTaskDeleted(taskId);
    return { taskId, deletedOffline: true };
  }
);

export const syncTasksAsync = createAsyncThunk(
  'tasks/sync',
  async (ownerId: string) => {
    const networkState = await Network.getNetworkStateAsync();
    const connected = networkState.isInternetReachable ?? networkState.isConnected ?? false;

    if (!connected) {
      throw new Error('Offline, cannot sync tasks.');
    }

    const deletes = await getPendingDeleteTasks(ownerId);
    await Promise.all(
      deletes.map(async (task: Task) => {
        await deleteRemoteTask(ownerId, task.id);
        await deleteLocalTask(task.id);
      })
    );

    const unsynced = await getUnsyncedTasks(ownerId);
    await Promise.all(
      unsynced.map(async (task: Task) => {
        await uploadTask(ownerId, task);
        await markLocalTaskSynced(task.id, true);
      })
    );

    const remoteTasks = await fetchRemoteTasks(ownerId);
    await Promise.all(remoteTasks.map((remoteTask: Task) => saveRemoteTaskLocally(remoteTask)));

    return remoteTasks;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeTasksAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(initializeTasksAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.tasks = action.payload;
      })
      .addCase(initializeTasksAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load tasks.';
      })
      .addCase(saveTaskAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(saveTaskAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        const task = action.payload.task;
        const index = state.tasks.findIndex((item: Task) => item.id === task.id);
        if (index === -1) {
          state.tasks.unshift(task);
        } else {
          state.tasks[index] = task;
        }
      })
      .addCase(saveTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to save task.';
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task: Task) => task.id !== action.payload.taskId);
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to delete task.';
      })
      .addCase(syncTasksAsync.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncTasksAsync.fulfilled, (state, action) => {
        state.syncing = false;
        state.tasks = action.payload;
      })
      .addCase(syncTasksAsync.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.error.message ?? 'Failed to sync tasks.';
      });
  },
});

export default tasksSlice.reducer;
