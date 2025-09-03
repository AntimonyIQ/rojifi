// Cart service functions for API calls
export const cartService = {
  getCart: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        })
      }, 500)
    })
  },

  addToCart: async (item: { id: string; quantity: number }) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Item added to cart",
        })
      }, 500)
    })
  },

  updateCartItem: async (item: { id: string; quantity: number }) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Cart item updated",
        })
      }, 500)
    })
  },

  removeFromCart: async (itemId: string) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Item removed from cart",
        })
      }, 500)
    })
  },

  clearCart: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Cart cleared",
        })
      }, 500)
    })
  },
}
