import { request } from "./api";

export const journalService = {
  getAll: async (page = 1, limit = 10, filters = {}) => {
    let url = `/journals?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.marketSentiment) url += `&marketSentiment=${encodeURIComponent(filters.marketSentiment)}`;
    if (filters.tag) url += `&tag=${encodeURIComponent(filters.tag)}`;
    return request(url);
  },

  create: async (journalData) => {
    return request("/journals", {
      method: "POST",
      body: JSON.stringify(journalData),
    });
  },

  delete: async (id) => {
    return request(`/journals/${id}`, {
      method: "DELETE",
    });
  },

  update: async (id, journalData) => {
    return request(`/journals/${id}`, {
      method: "PUT",
      body: JSON.stringify(journalData),
    });
  },
};
