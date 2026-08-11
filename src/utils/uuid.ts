import 'react-native-get-random-values';

export function generateId(): string {
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
