import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
        prepareHeaders: (headers, { getState }) => {
            // You can add auth headers here if needed
            return headers
        },
    }),
    tagTypes: ["Products", "Categories", "User", "Cart", "Orders"],
    endpoints: (builder) => ({}),
})
