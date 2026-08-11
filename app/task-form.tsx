import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [reminderDate, setReminderDate] = useState<Date | null>(() => {
    if (!editingTask?.reminder) {
      return null;
    }

    const date = new Date(editingTask.reminder);
    return Number.isNaN(date.getTime()) ? null : date;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const updateReminderDate = (selectedDate: Date, mode: 'date' | 'time') => {
    const nextReminder = new Date(reminderDate ?? new Date());

    if (mode === 'date') {
      nextReminder.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    } else {
      nextReminder.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    }

    setReminderDate(nextReminder);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      updateReminderDate(selectedDate, 'date');
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      updateReminderDate(selectedDate, 'time');
    }
  };

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
      reminder: reminderDate?.toISOString(),
      notificationId: editingTask?.notificationId,
      updatedAt: now,
      synced: false,
    };

    await dispatch(saveTaskAsync({ task, ownerId: userId }));
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
        <View style={styles.reminderActions}>
          <Pressable style={styles.reminderButton} onPress={() => setShowDatePicker(true)}>
            <ThemedText>{reminderDate ? format(reminderDate, 'PPP') : 'Select date'}</ThemedText>
          </Pressable>
          <Pressable style={styles.reminderButton} onPress={() => setShowTimePicker(true)}>
            <ThemedText>{reminderDate ? format(reminderDate, 'p') : 'Select time'}</ThemedText>
          </Pressable>
        </View>
        {reminderDate ? (
          <Pressable style={styles.clearReminderButton} onPress={() => setReminderDate(null)}>
            <ThemedText style={styles.clearReminderText}>Clear reminder</ThemedText>
          </Pressable>
        ) : null}
        {showDatePicker ? (
          <DateTimePicker value={reminderDate ?? new Date()} mode="date" onChange={onDateChange} />
        ) : null}
        {showTimePicker ? (
          <DateTimePicker value={reminderDate ?? new Date()} mode="time" onChange={onTimeChange} />
        ) : null}
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <ThemedText type="defaultSemiBold">Save Task</ThemedText>
      </Pressable>
      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <ThemedText>Cancel</ThemedText>
      </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
  reminderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  reminderButton: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    backgroundColor: '#fff',
  },
  clearReminderButton: {
    alignSelf: 'flex-start',
  },
  clearReminderText: {
    color: '#d64545',
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
