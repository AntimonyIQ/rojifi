import type { RootState } from "../store"

// Product selectors
export const selectProducts = (state: RootState) => state.product.products
export const selectSelectedProduct = (state: RootState) => state.product.selectedProduct
export const selectCategories = (state: RootState) => state.product.categories
export const selectTotalCount = (state: RootState) => state.product.totalCount
export const selectCurrentPage = (state: RootState) => state.product.currentPage
export const selectTotalPages = (state: RootState) => state.product.totalPages
export const selectProductLoading = (state: RootState) => state.product.isLoading
export const selectProductError = (state: RootState) => state.product.error
