import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isLoading: boolean;
  token: string | null;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  isLoading: false,
  token: null,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ token: string }>) {
      state.isLoading = false;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<{ error: string }>) {
      state.isLoading = false;
      state.error = action.payload.error;
      state.isAuthenticated = false;
    },
    logout(state) {
      state.isLoading = false;
      state.token = null;
      state.error = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;