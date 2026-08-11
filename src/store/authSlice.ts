import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';

import { auth } from '../services/firebase';
import type { UserProfile } from '../types';

export interface AuthState {
  userId: string | null;
  email: string | null;
  pushToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  initializing: boolean;
}

const initialState: AuthState = {
  userId: null,
  email: null,
  pushToken: null,
  status: 'idle',
  error: null,
  initializing: true,
};

function mapFirebaseUser(user: User | null): UserProfile | null {
  if (!user) {
    return null;
  }

  return {
    userId: user.uid,
    email: user.email,
  };
}

export const signInAsync = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(credential.user);
  }
);

export const signUpAsync = createAsyncThunk(
  'auth/signUp',
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(credential.user);
  }
);

export const signOutAsync = createAsyncThunk('auth/signOut', async () => {
  await firebaseSignOut(auth);
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserProfile | null>) {
      state.userId = action.payload?.userId ?? null;
      state.email = action.payload?.email ?? null;
      // keep existing pushToken value; user changes shouldn't clear it
      state.initializing = false;
      state.error = null;
      state.status = 'succeeded';
    },
    setPushToken(state, action: PayloadAction<string | null>) {
      state.pushToken = action.payload;
    },
    clearUser(state) {
      state.userId = null;
      state.email = null;
      state.initializing = false;
      state.status = 'idle';
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.status = action.payload ? 'failed' : 'idle';
    },
    finishInitializing(state) {
      state.initializing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signInAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.userId = action.payload?.userId ?? null;
        state.email = action.payload?.email ?? null;
        state.initializing = false;
      })
      .addCase(signInAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to sign in.';
        state.initializing = false;
      })
      .addCase(signUpAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signUpAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.userId = action.payload?.userId ?? null;
        state.email = action.payload?.email ?? null;
        state.initializing = false;
      })
      .addCase(signUpAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to create account.';
        state.initializing = false;
      })
      .addCase(signOutAsync.fulfilled, (state) => {
        state.userId = null;
        state.email = null;
        state.status = 'idle';
        state.error = null;
        state.initializing = false;
      })
      .addCase(signOutAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to sign out.';
      });
  },
});

export const { setUser, setPushToken, clearUser, setError, finishInitializing } = authSlice.actions;

export default authSlice.reducer;
