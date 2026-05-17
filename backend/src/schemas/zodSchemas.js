const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const journalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  marketSentiment: z.enum(['fear', 'neutral', 'greed']),
  stressLevel: z.number().int().min(1).max(10),
  focusLevel: z.number().int().min(1).max(10),
  thoughts: z.string().min(5, 'Thoughts must be at least 5 characters long'),
  tags: z.array(z.string()).default(['Discipline']),
  biasesChecked: z.array(z.string()).default([]),
});

const decisionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  asset: z.string().min(1, 'Stock symbol or asset name is required'),
  horizon: z.string().min(1, 'Time horizon is required'),
  rationale: z.string().min(5, ' Thesis / rationale must be at least 5 characters long'),
  conviction: z.number().int().min(1).max(10),
  result: z.enum(['Pending', 'Winner', 'Loser']).optional().default('Pending'),
  sentimentTag: z.string().optional().default('Discipline'),
  metrics: z.object({
    entry: z.string().default('Market'),
    stop: z.string().min(3, 'Stop loss/invalidation criteria must be at least 3 characters long'),
  }),
});

const watchlistSchema = z.object({
  symbol: z.string().min(1, 'Stock symbol is required'),
  notes: z.string().optional().default(''),
});

const learningSchema = z.object({
  topic: z.string().min(1, 'Topic name is required'),
  status: z.enum(['todo', 'in_progress', 'mastered']).default('todo'),
});

module.exports = {
  registerSchema,
  loginSchema,
  journalSchema,
  decisionSchema,
  watchlistSchema,
  learningSchema,
};
