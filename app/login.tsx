import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { signInAsync } from '../src/store/authSlice';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const onSignIn = () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setFormError('Enter your email address and password.');
      return;
    }

    setFormError(null);
    dispatch(signInAsync({ email: normalizedEmail, password }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.page}>
      <ThemedText type="title">Sign In</ThemedText>
      <ThemedText style={styles.description}>Sign in to your own task list with the email you registered.</ThemedText>
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Email address</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7a7f85"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Password</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7a7f85"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          value={password}
          onChangeText={setPassword}
        />
      </View>
      {formError || error ? <ThemedText style={styles.error}>{formError ?? error}</ThemedText> : null}
      <Pressable style={[styles.button, status === 'loading' && styles.buttonDisabled]} onPress={onSignIn} disabled={status === 'loading'}>
        {status === 'loading' ? <ActivityIndicator color="#fff" /> : <ThemedText type="defaultSemiBold">Continue</ThemedText>}
      </Pressable>
      <View style={styles.bottomText}>
        <ThemedText>Don’t have an account? </ThemedText>
        <Link href="/signup">
          <ThemedText type="link">Sign Up</ThemedText>
        </Link>
      </View>
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
    padding: 20,
    justifyContent: 'center',
  },
  field: {
    marginVertical: 10,
  },
  description: {
    marginTop: 8,
    color: '#667085',
  },
  input: {
    marginTop: 6,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  bottomText: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  error: {
    marginTop: 12,
    color: '#d64545',
  },
});
