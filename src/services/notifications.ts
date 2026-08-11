import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import type { Task } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function scheduleTaskReminder(task: Task): Promise<string | undefined> {
  if (!task.reminder) {
    return undefined;
  }

  const reminderDate = new Date(task.reminder);

  if (Number.isNaN(reminderDate.getTime()) || reminderDate <= new Date()) {
    return undefined;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Reminder',
      body: task.title,
      data: { taskId: task.id },
    },
    trigger: reminderDate,
  });

  return notificationId;
}

export function cancelScheduledReminder(notificationId?: string): Promise<void> {
  if (!notificationId) {
    return Promise.resolve();
  }

  return Notifications.cancelScheduledNotificationAsync(notificationId);
}
