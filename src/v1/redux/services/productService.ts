// Product service functions for API calls
export const productService = {
  getProducts: async (params: { category?: string; search?: string; page?: number; limit?: number }) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          products: [],
          totalCount: 0,
          currentPage: params.page || 1,
          totalPages: 0,
        })
      }, 500)
    })
  },

  getProductById: async (id: string) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (id) {
          resolve({
            id,
            name: "Sample Product",
            price: 99.99,
            description: "This is a sample product",
            images: [],
            category: "electronics",
            rating: 4.5,
            reviewCount: 10,
          })
        } else {
          reject(new Error("Product not found"))
        }
      }, 500)
    })
  },

  getCategories: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          categories: [],
        })
      }, 500)
    })
  },
}
