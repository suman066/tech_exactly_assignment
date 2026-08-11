import { useEffect, useState, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';

import { TaskItem } from '../../src/components/task-item';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { initializeTasksAsync, saveTaskAsync, deleteTaskAsync, syncTasksAsync } from '../../src/store/tasksSlice';
import { signOutAsync } from '../../src/store/authSlice';
import type { Task } from '../../src/types';

export default function TaskListScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector((state) => state.auth);
  const { tasks, status, syncing, error } = useAppSelector((state) => state.tasks);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) {
      return;
    }

    dispatch(initializeTasksAsync(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    let isMounted = true;

    async function handleConnectivity() {
      const networkState = await Network.getNetworkStateAsync();
      const connected = networkState.isInternetReachable ?? networkState.isConnected ?? false;

      if (!isMounted) {
        return;
      }

      setIsOnline(connected);

      if (connected && userId) {
        dispatch(syncTasksAsync(userId));
      }
    }

    handleConnectivity();

    return () => {
      isMounted = false;
    };
  }, [dispatch, userId]);

  const onToggleTask = useCallback(
    (taskId: string, completed: boolean) => {
      const task = tasks.find((item: Task) => item.id === taskId);

      if (!task || !userId) {
        return;
      }

      dispatch(saveTaskAsync({
        task: {
          ...task,
          completed,
          updatedAt: new Date().toISOString(),
          synced: false,
        },
        ownerId: userId,
      }));
    },
    [dispatch, tasks, userId]
  );

  const onDeleteTask = useCallback(
    (taskId: string) => {
      if (!userId) {
        return;
      }

      dispatch(deleteTaskAsync({ taskId, ownerId: userId }));
    },
    [dispatch, userId]
  );

  const onEditTask = useCallback(
    (taskId: string) => {
      router.push(`/task-form?taskId=${taskId}`);
    },
    [router]
  );

  const onAddTask = useCallback(() => {
    router.push('/task-form');
  }, [router]);

  return (
    <ThemedView style={styles.page}>
      <View style={styles.header}>
        <ThemedText type="title">Tasks</ThemedText>
        <ThemedText>{isOnline ? 'Online' : 'Offline'}</ThemedText>
      </View>

      <View style={styles.statusBar}>
        <ThemedText>{status === 'loading' ? 'Loading tasks…' : syncing ? 'Syncing changes…' : 'Ready'}</ThemedText>
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      </View>

      <FlatList<Task>
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={(completed: boolean) => onToggleTask(item.id, completed)}
            onEdit={() => onEditTask(item.id)}
            onDelete={() => onDeleteTask(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText>No tasks yet. Tap Add Task to create your first task.</ThemedText>
          </View>
        }
        initialNumToRender={8}
        windowSize={10}
        removeClippedSubviews
        getItemLayout={(_, index) => ({ length: 96, offset: 96 * index, index })}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <Pressable style={styles.primaryButton} onPress={onAddTask}>
          <ThemedText type="defaultSemiBold">+ Add Task</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBar: {
    paddingVertical: 8,
    gap: 4,
  },
  error: {
    color: '#d64545',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 16,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
});
