export const initialJournalEntries = [
  {
    id: '1',
    date: '2026-05-14',
    marketSentiment: 'neutral', // fear, greed, neutral
    stressLevel: 3, // 1-10
    focusLevel: 8, // 1-10
    thoughts: 'Markets stabilized after CPI data. Stayed disciplined and didn’t chase the initial pre-market pop. Keeping cash reserves ready for QQQ retest.',
    tags: ['Discipline'],
    biasesChecked: ['FOMO Resistance'],
  },
  {
    id: '2',
    date: '2026-05-13',
    marketSentiment: 'fear',
    stressLevel: 5,
    focusLevel: 7,
    thoughts: 'Tech indices drawing down hard. Felt immediate urge to sell everything, but recalled my systematic process and long-term horizon. Need to watch anchoring bias.',
    tags: ['Calm'],
    biasesChecked: ['Loss Aversion Resistance'],
  },
  {
    id: '3',
    date: '2026-05-12',
    marketSentiment: 'greed',
    stressLevel: 2,
    focusLevel: 9,
    thoughts: 'Solid conviction built up on TSLA trade. Executed beautifully exactly at supply level. Great routine today—meditated before open.',
    tags: ['Discipline'],
    biasesChecked: ['Systematic Execution'],
  }
];

export const initialDecisions = [
  {
    id: 'd1',
    date: '2026-05-14',
    asset: 'NVDA',
    type: 'BUY',
    rationale: 'Position add at the 50-day EMA supporting level with strong institutional order flow and ahead of Blackwell delivery milestones. Solid dynamic risk-reward.',
    conviction: 8, // 1-10
    result: 'Pending',
    sentimentTag: 'Discipline',
    metrics: { entry: 885.50, stop: 840.00, target: 990.00 }
  },
  {
    id: 'd2',
    date: '2026-05-13',
    asset: 'COIN',
    type: 'SELL',
    rationale: 'Sold partial position to lock in 25% gains as Bitcoin hits resistance at 72k. Protecting profits instead of being greedy.',
    conviction: 7,
    result: 'Winner',
    sentimentTag: 'Discipline',
    metrics: { entry: 205.00, stop: 230.00, exit: 258.50 }
  },
  {
    id: 'd3',
    date: '2026-05-10',
    asset: 'AAPL',
    type: 'SELL',
    rationale: 'Exited full position at stop loss level. Painful, but strictly adhered to predetermined plan. High discipline score, low greed score.',
    conviction: 9,
    result: 'Loser',
    sentimentTag: 'Fear',
    metrics: { entry: 175.00, stop: 168.00, exit: 167.80 }
  },
  {
    id: 'd4',
    date: '2026-05-08',
    asset: 'BTC',
    type: 'BUY',
    rationale: 'Felt standard FOMO urge after weekend gap-up. FOMO trade with no structural thesis. Exited quickly with minor slippage.',
    conviction: 3,
    result: 'Loser',
    sentimentTag: 'Greed',
    metrics: { entry: 68500, stop: 67800, exit: 67950 }
  }
];

export const metricsData = [
  { day: 'Mon', disciplined: 85, greed: 10, fear: 5 },
  { day: 'Tue', disciplined: 70, greed: 15, fear: 15 },
  { day: 'Wed', disciplined: 90, greed: 5, fear: 5 },
  { day: 'Thu', disciplined: 92, greed: 4, fear: 4 },
  { day: 'Fri', disciplined: 80, greed: 10, fear: 10 },
];
