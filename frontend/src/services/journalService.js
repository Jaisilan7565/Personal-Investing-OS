import { request } from "./api";

export const journalService = {
  getAll: async () => {
    return request("/journals");
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
