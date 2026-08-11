import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { ThemedText } from '../../components/themed-text';

export function NotificationsStatus() {
  const pushToken = useAppSelector((s) => s.auth.pushToken);

  const statusText = pushToken ? 'Notifications: Enabled' : 'Notifications: Disabled';
  const tokenShort = pushToken ? `${pushToken.slice(0, 8)}…` : '';

  return (
    <View style={styles.container} pointerEvents="none">
      <ThemedText style={styles.text}>{statusText} {tokenShort}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'transparent',
    zIndex: 50,
  },
  text: {
    fontSize: 12,
    opacity: 0.9,
  },
});
