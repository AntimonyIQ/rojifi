import { createAsyncThunk } from "@reduxjs/toolkit"
import { productService } from "../services/productService"

// Get products thunk
export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (params: { category?: string; search?: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(params)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to get products")
    }
  },
)

// Get product by ID thunk
export const getProductById = createAsyncThunk("product/getProductById", async (id: string, { rejectWithValue }) => {
  try {
    const response = await productService.getProductById(id)
    return response
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to get product")
  }
})

// Get categories thunk
export const getCategories = createAsyncThunk("product/getCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await productService.getCategories()
    return response
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to get categories")
  }
})
