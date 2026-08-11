import Constants from 'expo-constants';
import type { FirebaseOptions } from 'firebase/app';

export type AppEnvironment = 'dev' | 'staging' | 'production';

export interface EnvironmentConfig {
  appEnv: AppEnvironment;
  firebase: FirebaseOptions;
}

const envMap: Record<AppEnvironment, EnvironmentConfig> = {
  dev: {
    appEnv: 'dev',
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY ?? 'YOUR_DEV_FIREBASE_API_KEY',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? 'YOUR_DEV_PROJECT.firebaseapp.com',
      projectId: process.env.FIREBASE_PROJECT_ID ?? 'YOUR_DEV_PROJECT',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? 'YOUR_DEV_PROJECT.appspot.com',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? 'YOUR_DEV_SENDER_ID',
      appId: process.env.FIREBASE_APP_ID ?? 'YOUR_DEV_APP_ID',
    },
  },
  staging: {
    appEnv: 'staging',
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY ?? 'YOUR_STAGING_FIREBASE_API_KEY',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? 'YOUR_STAGING_PROJECT.firebaseapp.com',
      projectId: process.env.FIREBASE_PROJECT_ID ?? 'YOUR_STAGING_PROJECT',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? 'YOUR_STAGING_PROJECT.appspot.com',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? 'YOUR_STAGING_SENDER_ID',
      appId: process.env.FIREBASE_APP_ID ?? 'YOUR_STAGING_APP_ID',
    },
  },
  production: {
    appEnv: 'production',
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY ?? 'YOUR_PRODUCTION_FIREBASE_API_KEY',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? 'YOUR_PRODUCTION_PROJECT.firebaseapp.com',
      projectId: process.env.FIREBASE_PROJECT_ID ?? 'YOUR_PRODUCTION_PROJECT',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? 'YOUR_PRODUCTION_PROJECT.appspot.com',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? 'YOUR_PRODUCTION_SENDER_ID',
      appId: process.env.FIREBASE_APP_ID ?? 'YOUR_PRODUCTION_APP_ID',
    },
  },
};

function resolveExtras(): EnvironmentConfig {
  const extras = (Constants.expoConfig?.extra ?? Constants.manifest?.extra) as Partial<EnvironmentConfig> | undefined;
  const appEnv = extras?.appEnv as AppEnvironment | undefined;

  if (appEnv && envMap[appEnv]) {
    return {
      ...envMap[appEnv],
      firebase: {
        ...envMap[appEnv].firebase,
        ...extras?.firebase,
      },
    };
  }

  return envMap.dev;
}

export const env = resolveExtras();
