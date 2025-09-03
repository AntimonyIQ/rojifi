import { createAsyncThunk } from "@reduxjs/toolkit"
import { cartService } from "../services/cartService"

// Get cart thunk
export const getCart = createAsyncThunk("cart/getCart", async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.getCart()
    return response
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to get cart")
  }
})

// Add to cart thunk
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (item: { id: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(item)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to add item to cart")
    }
  },
)

// Update cart item thunk
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (item: { id: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(item)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update cart item")
    }
  },
)

// Remove from cart thunk
export const removeFromCart = createAsyncThunk("cart/removeFromCart", async (itemId: string, { rejectWithValue }) => {
  try {
    const response = await cartService.removeFromCart(itemId)
    return response
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to remove item from cart")
  }
})

// Clear cart thunk
export const clearCart = createAsyncThunk("cart/clearCart", async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.clearCart()
    return response
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to clear cart")
  }
})
