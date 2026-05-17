import { request } from "./api";

export const aiMentorService = {
  analyzeDiscipline: async () => {
    return request("/ai/discipline");
  },

  getLearningReinforcement: async () => {
    return request("/ai/reinforcement");
  },
};
