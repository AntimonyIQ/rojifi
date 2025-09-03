import { createAsyncThunk } from "@reduxjs/toolkit"
import { authService } from "../services/authService"

// Login user thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.loginUser(credentials)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to login")
    }
  },
)

// Register user thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      firstName: string
      lastName: string
      email: string
      password: string
      role?: "Buyer" | "Seller" | "Service Provider"
      companyName?: string
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.registerUser(userData)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to register")
    }
  },
)

// Logout user thunk
export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.logoutUser()
    return response
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to logout")
  }
})
