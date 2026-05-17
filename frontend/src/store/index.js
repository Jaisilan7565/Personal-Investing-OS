import { configureStore, createSlice } from "@reduxjs/toolkit";

// Auth Slice to manage logged in state, JWT token, and active user name
const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: localStorage.getItem("investorOS_auth") === "true",
    token: localStorage.getItem("investorOS_token") || null,
    username: localStorage.getItem("investorOS_username") || null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.username = action.payload.username;
      localStorage.setItem("investorOS_auth", "true");
      localStorage.setItem("investorOS_token", action.payload.token);
      localStorage.setItem("investorOS_username", action.payload.username);
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.username = null;
      localStorage.removeItem("investorOS_auth");
      localStorage.removeItem("investorOS_token");
      localStorage.removeItem("investorOS_username");
    },
  },
});

// UI Slice to manage theme, active tabs, etc.
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    theme: localStorage.getItem("investorOS_theme") || "dark",
    activeTab: "dashboard",
  },
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      state.theme = nextTheme;
      localStorage.setItem("investorOS_theme", nextTheme);
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

// Toast Slice for global top-right non-blocking notification queues
const toastSlice = createSlice({
  name: "toast",
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: (state, action) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;
export const { toggleTheme, setActiveTab } = uiSlice.actions;
export const { addToast, removeToast } = toastSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    toast: toastSlice.reducer,
  },
});
