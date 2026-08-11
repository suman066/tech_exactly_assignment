import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { registerForPushNotificationsAsync } from '../../src/services/notifications';
import { setPushToken } from '../../src/store/authSlice';
import { saveUserPushToken, fetchUserPushToken, removeUserPushToken } from '../../src/services/firestore-sync';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { userId, pushToken } = useAppSelector((s) => s.auth);
  const [saving, setSaving] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const onRequestToken = useCallback(async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      dispatch(setPushToken(token));
    } catch (err) {
      console.debug('Settings: request token failed', { err });
      dispatch(setPushToken(null));
    }
  }, [dispatch]);

  const onSaveToken = useCallback(async () => {
    if (!userId || !pushToken) return;
    setSaving(true);
    try {
      await saveUserPushToken(userId, pushToken);
    } catch (err) {
      console.debug('Settings: save token failed', { err });
    } finally {
      setSaving(false);
    }
  }, [userId, pushToken]);

  const onCopyToken = useCallback(async () => {
    if (!pushToken) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(pushToken);
      } else {
        console.debug('Settings: clipboard.writeText not available on this platform; token:', pushToken);
      }
      setCopyMessage('Copied!');
      setTimeout(() => setCopyMessage(''), 1500);
    } catch (err) {
      console.debug('Settings: copy failed', { err });
    }
  }, [pushToken]);

  const onUnregister = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await removeUserPushToken(userId);
      dispatch(setPushToken(null));
    } catch (err) {
      console.debug('Settings: remove token failed', { err });
    } finally {
      setSaving(false);
    }
  }, [userId, dispatch]);

  useEffect(() => {
    let mounted = true;
    if (!userId) return;
    (async () => {
      try {
        const saved = await fetchUserPushToken(userId);
        if (!mounted) return;
        if (saved) {
          dispatch(setPushToken(saved));
        }
      } catch (err) {
        console.debug('Settings: fetch saved token failed', { err });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, dispatch]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ThemedView style={styles.page}>
        <ThemedText type="title">Settings</ThemedText>

        <View style={styles.section}>
          <ThemedText type="subtitle">Notifications</ThemedText>
          <ThemedText style={styles.helper}>{pushToken ? `Enabled — ${pushToken.slice(0, 8)}…` : 'Disabled'}</ThemedText>
          {pushToken ? <ThemedText style={styles.token}>{pushToken}</ThemedText> : null}
          {copyMessage ? <ThemedText style={styles.copyMsg}>{copyMessage}</ThemedText> : null}
          <View style={styles.actions}>
            <Pressable style={styles.button} onPress={onRequestToken}>
              <ThemedText>{'Request Permission'}</ThemedText>
            </Pressable>
            <Pressable style={[styles.button, !pushToken && styles.buttonDisabled]} onPress={onSaveToken} disabled={!pushToken || saving}>
              {saving ? <ActivityIndicator color="#000" /> : <ThemedText>{'Save to Account'}</ThemedText>}
            </Pressable>
            <Pressable style={[styles.button, !pushToken && styles.buttonDisabled]} onPress={onCopyToken} disabled={!pushToken}>
              <ThemedText>{'Copy Token'}</ThemedText>
            </Pressable>
            <Pressable style={[styles.button, !pushToken && styles.buttonDisabled]} onPress={onUnregister} disabled={!pushToken || saving}>
              {saving ? <ActivityIndicator color="#000" /> : <ThemedText>{'Unregister'}</ThemedText>}
            </Pressable>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { flex: 1, padding: 16 },
  section: { marginTop: 20 },
  helper: { marginTop: 8, color: '#667085' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  button: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
});
