import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { saveAuthState, clearAuthState } from "@/utils/authStorage";

export interface AuthState {
  isLoggedIn: boolean;
  user?: string;
  pages: string[];
  linkedinPages: string[];
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  pages: [],
  linkedinPages: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ user: string; pages: string[]; linkedinPages: string[] }>,
    ) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.pages = action.payload.pages;
      state.linkedinPages = action.payload.linkedinPages;
      saveAuthState({
        isLoggedIn: true,
        user: state.user,
        pages: state.pages,
        linkedinPages: state.linkedinPages,
      });
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = undefined;
      state.pages = [];
      state.linkedinPages = [];
      clearAuthState();
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
