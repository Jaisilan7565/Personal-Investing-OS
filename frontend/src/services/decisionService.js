import { request } from "./api";

export const decisionService = {
  getAll: async (page = 1, limit = 10, filters = {}) => {
    let url = `/decisions?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.strategy) url += `&strategy=${encodeURIComponent(filters.strategy)}`;
    if (filters.result) url += `&result=${encodeURIComponent(filters.result)}`;
    if (filters.discipline) url += `&discipline=${encodeURIComponent(filters.discipline)}`;
    return request(url);
  },

  create: async (decisionData) => {
    return request("/decisions", {
      method: "POST",
      body: JSON.stringify(decisionData),
    });
  },

  // Full form edit — PUT (replace the entire editable surface)
  update: async (id, decisionData) => {
    return request(`/decisions/${id}`, {
      method: "PUT",
      body: JSON.stringify(decisionData),
    });
  },

  // Partial update — outcome field only — PATCH
  updateOutcome: async (id, result) => {
    return request(`/decisions/${id}/outcome`, {
      method: "PATCH",
      body: JSON.stringify({ result }),
    });
  },

  delete: async (id) => {
    return request(`/decisions/${id}`, {
      method: "DELETE",
    });
  },
};
