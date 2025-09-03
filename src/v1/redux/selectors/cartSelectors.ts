import type { RootState } from "../store"

// Cart selectors
export const selectCartItems = (state: RootState) => state.cart.items
export const selectTotalItems = (state: RootState) => state.cart.totalItems
export const selectTotalAmount = (state: RootState) => state.cart.totalAmount
export const selectCartLoading = (state: RootState) => state.cart.isLoading
export const selectCartError = (state: RootState) => state.cart.error
