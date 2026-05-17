import { request } from "./api";

export const decisionService = {
  getAll: async () => {
    return request("/decisions");
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
