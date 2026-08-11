import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import type { Task } from '../types';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let notificationHandlerConfigured = false;

function getNotifications() {
  if (isExpoGo) {
    console.debug('notifications: running in Expo Go / StoreClient — notifications disabled by getNotifications()');
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
    console.debug('registerForPushNotificationsAsync: no device or notifications not available', {
      isDevice: Device.isDevice,
      notificationsAvailable: !!notifications,
    });
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
    console.debug('scheduleTaskReminder: skipping — no reminder or notifications not available', {
      hasReminder: !!task.reminder,
      notificationsAvailable: !!notifications,
      taskId: task?.id,
    });
    return undefined;
  }

  const reminderDate = new Date(task.reminder);

  if (Number.isNaN(reminderDate.getTime()) || reminderDate <= new Date()) {
    console.debug('scheduleTaskReminder: invalid or past reminder date', {
      reminder: task.reminder,
      reminderDate: reminderDate.toString(),
      now: new Date().toString(),
      taskId: task?.id,
    });
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

  console.debug('scheduleTaskReminder: scheduled', { notificationId, taskId: task.id, reminder: task.reminder });

  return notificationId;
}

export function cancelScheduledReminder(notificationId?: string): Promise<void> {
  const notifications = getNotifications();
  if (!notificationId || !notifications) {
    return Promise.resolve();
  }

  return notifications.cancelScheduledNotificationAsync(notificationId);
}
