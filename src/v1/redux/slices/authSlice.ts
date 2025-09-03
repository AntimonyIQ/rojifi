import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { loginUser, registerUser, logoutUser } from "../thunks/authThunks"

interface User {
    id: string
    name: string
    email: string
    role: "buyer" | "seller" | "service-provider"
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            const { user, token } = action.payload
            state.user = user
            state.token = token
            state.isAuthenticated = true
            state.error = null
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
            state.isLoading = false
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.error = null
        },
    },
    extraReducers: (builder) => {
        // Login user
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
            state.isLoading = false
            state.error = null
        })
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })

        // Register user
        builder.addCase(registerUser.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
            state.isLoading = false
            state.error = null
        })
        builder.addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })

        // Logout user
        builder.addCase(logoutUser.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.isLoading = false
            state.error = null
        })
        builder.addCase(logoutUser.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })
    },
})

export const { setCredentials, setLoading, setError, logout } = authSlice.actions

export default authSlice.reducer
