import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';

import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { saveTaskAsync } from '../src/store/tasksSlice';
import { generateId } from '../src/utils/uuid';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import type { Task } from '../src/types';

export default function TaskFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ taskId?: string }>();
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector((state) => state.auth);
  const { tasks } = useAppSelector((state) => state.tasks);

  const editingTask = useMemo(() => {
    if (!params.taskId) return null;
    return tasks.find((task) => task.id === params.taskId) ?? null;
  }, [params.taskId, tasks]);

  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [notes, setNotes] = useState(editingTask?.notes ?? '');
  const [reminder, setReminder] = useState(editingTask?.reminder ?? '');

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Authentication required', 'Please sign in before saving tasks.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Missing title', 'Please provide a task title.');
      return;
    }

    const now = new Date().toISOString();
    const task: Task = {
      id: editingTask?.id ?? generateId(),
      ownerId: userId,
      title: title.trim(),
      notes: notes.trim() || undefined,
      completed: editingTask?.completed ?? false,
      reminder: reminder.trim() || undefined,
      notificationId: editingTask?.notificationId,
      updatedAt: now,
      synced: false,
    };

    await dispatch(saveTaskAsync({ task, ownerId: userId }));
    router.back();
  };

  return (
    <ThemedView style={styles.page}>
      <ThemedText type="title">{editingTask ? 'Edit Task' : 'New Task'}</ThemedText>

      <View style={styles.field}>
        <ThemedText type="subtitle">Title</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Task title"
          placeholderTextColor="#7a7f85"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="subtitle">Notes</ThemedText>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Optional notes"
          placeholderTextColor="#7a7f85"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="subtitle">Reminder</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD HH:mm"
          placeholderTextColor="#7a7f85"
          value={reminder}
          onChangeText={setReminder}
        />
        <ThemedText>Example: {format(new Date(), 'yyyy-MM-dd HH:mm')}</ThemedText>
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <ThemedText type="defaultSemiBold">Save Task</ThemedText>
      </Pressable>
      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <ThemedText>Cancel</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginTop: 20,
    gap: 10,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    padding: 14,
    backgroundColor: '#fff',
    color: '#111',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e0',
  },
});
