import { useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useDispatch } from 'react-redux';

import { auth } from '../services/firebase';
import { setUser, finishInitializing, setPushToken } from '../store/authSlice';
import type { UserProfile } from '../types';
import { registerForPushNotificationsAsync } from '../services/notifications';

function mapFirebaseUser(user: User | null): UserProfile | null {
  if (!user) {
    return null;
  }

  return {
    userId: user.uid,
    email: user.email,
  };
}

export function AuthStateListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        console.debug('AuthStateListener: push token', { token });
        dispatch(setPushToken(token));
      } catch (err) {
        console.debug('AuthStateListener: push registration failed', { err });
        dispatch(setPushToken(null));
      }
    })();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(mapFirebaseUser(user)));
      dispatch(finishInitializing());
    });

    return unsubscribe;
  }, [dispatch]);

  return null;
}
