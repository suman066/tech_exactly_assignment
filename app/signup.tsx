import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { signUpAsync } from '../src/store/authSlice';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';

export default function SignUpScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error, userId, initializing } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (userId && !initializing) {
    router.replace('/');
  }

  const onSignUp = () => {
    dispatch(signUpAsync({ email, password }));
  };

  return (
    <ThemedView style={styles.page}>
      <ThemedText type="title">Create Account</ThemedText>
      <View style={styles.field}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7a7f85"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.field}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7a7f85"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      <Pressable style={styles.button} onPress={onSignUp}>
        {status === 'loading' ? <ActivityIndicator color="#fff" /> : <ThemedText type="defaultSemiBold">Create Account</ThemedText>}
      </Pressable>
      <View style={styles.bottomText}>
        <ThemedText>Already have an account? </ThemedText>
        <Link href="/login">
          <ThemedText type="link">Sign In</ThemedText>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  field: {
    marginVertical: 10,
  },
  input: {
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
