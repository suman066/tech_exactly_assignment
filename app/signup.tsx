import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { signUpAsync } from '../src/store/authSlice';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';

export default function SignUpScreen() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const onSignUp = () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setFormError('Enter an email address and password.');
      return;
    }

    if (password.length < 6) {
      setFormError('Use a password with at least 6 characters.');
      return;
    }

    setFormError(null);
    dispatch(signUpAsync({ email: normalizedEmail, password }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.page}>
      <ThemedText type="title">Create Account</ThemedText>
      <ThemedText style={styles.description}>Create a separate account for each user. Tasks stay private to that email.</ThemedText>
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
          autoComplete="new-password"
          textContentType="newPassword"
          value={password}
          onChangeText={setPassword}
        />
      </View>
      {formError || error ? <ThemedText style={styles.error}>{formError ?? error}</ThemedText> : null}
      <Pressable style={[styles.button, status === 'loading' && styles.buttonDisabled]} onPress={onSignUp} disabled={status === 'loading'}>
        {status === 'loading' ? <ActivityIndicator color="#fff" /> : <ThemedText type="defaultSemiBold">Create Account</ThemedText>}
      </Pressable>
      <View style={styles.bottomText}>
        <ThemedText>Already have an account? </ThemedText>
        <Link href="/login">
          <ThemedText type="link">Sign In</ThemedText>
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
