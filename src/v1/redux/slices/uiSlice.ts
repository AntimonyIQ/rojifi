import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "info" | "warning"
}

interface UIState {
  toasts: Toast[]
  isLoading: boolean
}

const initialState: UIState = {
  toasts: [],
  isLoading: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Toast>) => {
      state.toasts.push(action.payload)
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { addToast, removeToast, setLoading } = uiSlice.actions

export default uiSlice.reducer
