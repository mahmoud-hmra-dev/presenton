import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedIn: boolean;
  user?: string;
  pages: string[];
}

const initialState: AuthState = {
  isLoggedIn: false,
  pages: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: string; pages: string[] }>) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.pages = action.payload.pages;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = undefined;
      state.pages = [];
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
