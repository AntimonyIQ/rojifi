import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../thunks/cartThunks"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  isLoading: boolean
  error: string | null
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  error: null,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCartAction: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }

      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    removeFromCartAction: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    updateQuantityAction: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload
      const item = state.items.find((item) => item.id === id)

      if (item) {
        item.quantity = quantity
      }

      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    clearCartAction: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalAmount = 0
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
  },
  extraReducers: (builder) => {
    // Get cart
    builder.addCase(getCart.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getCart.fulfilled, (state, action) => {
      state.items = action.payload.items
      state.totalItems = action.payload.totalItems
      state.totalAmount = action.payload.totalAmount
      state.isLoading = false
      state.error = null
    })
    builder.addCase(getCart.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Add to cart
    builder.addCase(addToCart.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(addToCart.fulfilled, (state) => {
      state.isLoading = false
      state.error = null
    })
    builder.addCase(addToCart.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Update cart item
    builder.addCase(updateCartItem.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(updateCartItem.fulfilled, (state) => {
      state.isLoading = false
      state.error = null
    })
    builder.addCase(updateCartItem.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Remove from cart
    builder.addCase(removeFromCart.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(removeFromCart.fulfilled, (state) => {
      state.isLoading = false
      state.error = null
    })
    builder.addCase(removeFromCart.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Clear cart
    builder.addCase(clearCart.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(clearCart.fulfilled, (state) => {
      state.isLoading = false
      state.error = null
    })
    builder.addCase(clearCart.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
  },
})

export const { addToCartAction, removeFromCartAction, updateQuantityAction, clearCartAction, setLoading, setError } =
  cartSlice.actions

export default cartSlice.reducer
