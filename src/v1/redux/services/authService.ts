// Auth service functions for API calls
export const authService = {
  loginUser: async (credentials: { email: string; password: string }) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock successful login
        if (credentials.email && credentials.password) {
          resolve({
            user: {
              id: "user123",
              name: "John Doe",
              email: credentials.email,
              role: "buyer",
            },
            token: "mock-jwt-token",
          })
        } else {
          reject(new Error("Invalid credentials"))
        }
      }, 1000)
    })
  },

  registerUser: async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role?: "Buyer" | "Seller" | "Service Provider"
    companyName?: string
  }) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock successful registration
        if (userData.email && userData.password) {
          resolve({
            user: {
              id: "user123",
              name: `${userData.firstName} ${userData.lastName}`,
              email: userData.email,
              role: userData.role || "Buyer",
              companyName: userData.companyName,
            },
            token: "mock-jwt-token",
          })
        } else {
          reject(new Error("Invalid user data"))
        }
      }, 1000)
    })
  },

  logoutUser: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },
}
