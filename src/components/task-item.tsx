import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import type { Task } from '../types';

type TaskItemProps = {
  task: Task;
  onToggle: (completed: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  return (
    <ThemedView style={[styles.container, task.completed && styles.completedContainer]}>
      <Pressable style={styles.toggle} onPress={() => onToggle(!task.completed)}>
        <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
          {task.completed ? <View style={styles.checkboxMark} /> : null}
        </View>
      </Pressable>
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" style={task.completed ? styles.completedText : undefined}>
          {task.title}
        </ThemedText>
        {task.notes ? <ThemedText>{task.notes}</ThemedText> : null}
        {task.reminder ? <ThemedText>Reminder: {new Date(task.reminder).toLocaleString()}</ThemedText> : null}
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={onEdit}>
          <ThemedText>Edit</ThemedText>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
          <ThemedText>Delete</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#f4f7fb',
  },
  completedContainer: {
    opacity: 0.75,
  },
  toggle: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0a7ea4',
  },
  checkboxMark: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  content: {
    marginLeft: 44,
    gap: 6,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#dde7f0',
  },
  deleteButton: {
    backgroundColor: '#f8d7da',
  },
});
