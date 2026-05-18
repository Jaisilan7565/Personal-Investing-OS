import { request } from "./api";

export const learningService = {
  getWorkspace: async () => {
    return request("/learning");
  },

  updateProgress: async (topic, status) => {
    return request("/learning", {
      method: "POST",
      body: JSON.stringify({ topic, status }),
    });
  },

  generateLesson: async (topic, forceRegenerate = false, focalPoints = "") => {
    return request("/learning/generate", {
      method: "POST",
      body: JSON.stringify({ topic, forceRegenerate, focalPoints }),
    });
  },

  getLesson: async (topic) => {
    return request(`/learning/lesson/${encodeURIComponent(topic)}`);
  },

  syncDrive: async (topic) => {
    return request("/learning/sync-drive", {
      method: "POST",
      body: JSON.stringify({ topic }),
    });
  },
};
