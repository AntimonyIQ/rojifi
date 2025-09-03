import type { RootState } from "../store"

// UI selectors
export const selectToasts = (state: RootState) => state.ui.toasts
export const selectUILoading = (state: RootState) => state.ui.isLoading
