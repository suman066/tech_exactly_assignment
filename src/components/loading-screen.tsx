import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" />
      <ThemedText style={styles.message}>{message}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
  },
});
