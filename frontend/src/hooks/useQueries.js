import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { journalService } from "../services/journalService";
import { decisionService } from "../services/decisionService";
import { strategyService } from "../services/strategyService";

// ==========================================
// 1. DAILY JOURNAL QUERIES & MUTATIONS
// ==========================================

export function useJournals(page = 1, limit = 200, filters = {}, options = {}) {
  return useQuery({
    queryKey: ["journals", page, limit, filters],
    queryFn: async () => {
      const res = await journalService.getAll(page, limit, filters);
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    ...options,
  });
}

export function useCreateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (journalData) => journalService.create(journalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
    },
  });
}

export function useUpdateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, journalData }) => journalService.update(id, journalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
    },
  });
}

export function useDeleteJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => journalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
    },
  });
}

// ==========================================
// 2. DECISION LOG QUERIES & MUTATIONS
// ==========================================

export function useDecisions(page = 1, limit = 200, filters = {}, options = {}) {
  return useQuery({
    queryKey: ["decisions", page, limit, filters],
    queryFn: async () => {
      const res = await decisionService.getAll(page, limit, filters);
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useCreateDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (decisionData) => decisionService.create(decisionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
    },
  });
}

export function useUpdateDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decisionData }) => decisionService.update(id, decisionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
    },
  });
}

export function useUpdateDecisionOutcome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, result }) => decisionService.updateOutcome(id, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
    },
  });
}

export function useDeleteDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => decisionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
    },
  });
}

// ==========================================
// 3. INVESTING STRATEGIES QUERIES & MUTATIONS
// ==========================================

export function useStrategies(page = 1, limit = 200, filters = {}, options = {}) {
  return useQuery({
    queryKey: ["strategies", page, limit, filters],
    queryFn: async () => {
      const res = await strategyService.getAll(page, limit, filters);
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (strategyData) => strategyService.create(strategyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, strategyData }) => strategyService.update(id, strategyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => strategyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
}
