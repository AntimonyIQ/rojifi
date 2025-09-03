import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { getProducts, getProductById, getCategories } from "../thunks/productThunks"

interface Product {
  id: string
  name: string
  price: number
  description: string
  images: string[]
  category: string
  rating: number
  reviewCount: number
}

interface Category {
  id: string
  name: string
  image: string
  itemCount?: number
}

interface ProductState {
  products: Product[]
  selectedProduct: Product | null
  categories: Category[]
  totalCount: number
  currentPage: number
  totalPages: number
  isLoading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  categories: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
}

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
    },
    setSelectedProduct: (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload
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
    // Get products
    builder.addCase(getProducts.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getProducts.fulfilled, (state, action) => {
      state.products = action.payload.products
      state.totalCount = action.payload.totalCount
      state.currentPage = action.payload.currentPage
      state.totalPages = action.payload.totalPages
      state.isLoading = false
      state.error = null
    })
    builder.addCase(getProducts.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Get product by ID
    builder.addCase(getProductById.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getProductById.fulfilled, (state, action) => {
      state.selectedProduct = action.payload
      state.isLoading = false
      state.error = null
    })
    builder.addCase(getProductById.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Get categories
    builder.addCase(getCategories.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getCategories.fulfilled, (state, action) => {
      state.categories = action.payload.categories
      state.isLoading = false
      state.error = null
    })
    builder.addCase(getCategories.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
  },
})

export const { setProducts, setSelectedProduct, setCategories, setLoading, setError } = productSlice.actions

export default productSlice.reducer
