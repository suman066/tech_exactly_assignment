import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseError } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import { initializeAuth, type Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { env } from '../config/env';

const firebaseApp = initializeApp(env.firebase);
const { getReactNativePersistence } = require('@firebase/auth/dist/rn/index.js') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};
export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const firestore = getFirestore(firebaseApp);
export { FirebaseError };
