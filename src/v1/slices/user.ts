import { IUser } from '@/interface/interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    currentUser: IUser | null;
}

const initialState: UserState = {
    currentUser: null,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<IUser>) => {
            state.currentUser = action.payload;
        },
        clearUser: (state) => {
            state.currentUser = null;
        },
    },
})

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;