import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AlertState {
  toggleAlert: boolean;
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
}

export const initialState: AlertState = {
  toggleAlert: false,
  type: 'success',
  message: '',
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlert: (
      state: AlertState,
      { payload }: PayloadAction<Omit<AlertState, 'toggleAlert'>>
    ) => {
      state.toggleAlert = true;
      state.message = payload.message;
      state.type = payload.type;
    },
    closeAlert: (state: AlertState) => {
      state.message = '';
      state.toggleAlert = false;
      state.type = 'success';
    },
  },
});

export const { setAlert, closeAlert } = alertSlice.actions;
export default alertSlice.reducer;