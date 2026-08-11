import { useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useDispatch } from 'react-redux';

import { auth } from '../services/firebase';
import { setUser, finishInitializing } from '../store/authSlice';
import type { UserProfile } from '../types';

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(mapFirebaseUser(user)));
      dispatch(finishInitializing());
    });

    return unsubscribe;
  }, [dispatch]);

  return null;
}
