import { request } from "./api";

export const authService = {
  login: async (email, password) => {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (username, email, password) => {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },
};
