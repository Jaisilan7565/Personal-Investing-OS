import { request } from "./api";

export const strategyService = {
  getAll: async (page = 1, limit = 10, filters = {}) => {
    let url = `/strategies?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.riskProfile) url += `&riskProfile=${encodeURIComponent(filters.riskProfile)}`;
    return request(url);
  },

  create: async (strategyData) => {
    return request("/strategies", {
      method: "POST",
      body: JSON.stringify(strategyData),
    });
  },

  update: async (id, strategyData) => {
    return request(`/strategies/${id}`, {
      method: "PUT",
      body: JSON.stringify(strategyData),
    });
  },

  delete: async (id) => {
    return request(`/strategies/${id}`, {
      method: "DELETE",
    });
  },
};
