import { configureStore } from '@reduxjs/toolkit';
import alertReducer from '@/slices/alert';
import authReducer from '@/slices/auth';
import userReducer from '@/slices/user';

export const store = configureStore({
  reducer: {
    alert: alertReducer,
    auth: authReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;