import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import type { Task } from '../types';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let notificationHandlerConfigured = false;

function getNotifications() {
  if (isExpoGo) {
    return null;
  }

  const notifications = require('expo-notifications') as typeof import('expo-notifications');
  if (!notificationHandlerConfigured) {
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    notificationHandlerConfigured = true;
  }
  return notifications;
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const notifications = getNotifications();
  if (!Device.isDevice || !notifications) {
    return null;
  }

  const { status: existingStatus } = await notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function scheduleTaskReminder(task: Task): Promise<string | undefined> {
  const notifications = getNotifications();
  if (!task.reminder || !notifications) {
    return undefined;
  }

  const reminderDate = new Date(task.reminder);

  if (Number.isNaN(reminderDate.getTime()) || reminderDate <= new Date()) {
    return undefined;
  }

  const notificationId = await notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Reminder',
      body: task.title,
      data: { taskId: task.id },
    },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });

  return notificationId;
}

export function cancelScheduledReminder(notificationId?: string): Promise<void> {
  const notifications = getNotifications();
  if (!notificationId || !notifications) {
    return Promise.resolve();
  }

  return notifications.cancelScheduledNotificationAsync(notificationId);
}
