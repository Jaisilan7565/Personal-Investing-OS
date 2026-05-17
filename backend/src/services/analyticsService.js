const Journal = require('../models/Journal');
const Decision = require('../models/Decision');
const Learning = require('../models/Learning');

/**
 * Calculates behavioral analytics based on user logs.
 */
const calculateUserAnalytics = async (userId) => {
  const [journals, decisions, learningTopics] = await Promise.all([
    Journal.find({ user: userId }),
    Decision.find({ user: userId }),
    Learning.find({ user: userId }),
  ]);

  // 1. Emotion Frequency (Pie Chart Data)
  const emotionCounts = { fear: 0, neutral: 0, greed: 0 };
  journals.forEach((j) => {
    const sentiment = j.marketSentiment.toLowerCase();
    if (emotionCounts[sentiment] !== undefined) {
      emotionCounts[sentiment]++;
    }
  });

  const totalJournals = journals.length;
  const emotionDistribution = Object.keys(emotionCounts).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: emotionCounts[key],
    percentage: totalJournals > 0 ? Math.round((emotionCounts[key] / totalJournals) * 100) : 0,
  }));

  // 2. Discipline Score Trend (Consistency over the last 7 entries/days)
  // Let's create an elegant trend line: consistency grows when they check biases and journal under low stress
  const disciplineTrend = journals
    .slice(0, 10)
    .reverse()
    .map((j) => {
      // Calculate discipline score for this log: 
      // Base is 70.
      // - Subtract stress factor (stressLevel > 6 reduces score)
      // - Add bias resistance (+6 per checked bias, max +30)
      // - Add high focus (+10 if focusLevel > 7)
      let score = 70;
      score -= Math.max(0, j.stressLevel - 5) * 3;
      score += Math.min(30, j.biasesChecked.length * 6);
      if (j.focusLevel >= 8) score += 10;
      if (j.focusLevel <= 3) score -= 10;

      // Keep it in bounds [0, 100]
      score = Math.max(0, Math.min(100, score));

      return {
        date: j.date,
        score: Math.round(score),
      };
    });

  // Calculate global Discipline Score (last 7 days average, or baseline if no logs)
  let overallDisciplineScore = 82; // Default baseline matching UI reference
  if (disciplineTrend.length > 0) {
    const sum = disciplineTrend.reduce((acc, curr) => acc + curr.score, 0);
    overallDisciplineScore = Math.round(sum / disciplineTrend.length);
  }

  // 3. Learning Momentum (Bar Chart Data)
  const learningCounts = { todo: 0, in_progress: 0, mastered: 0 };
  learningTopics.forEach((t) => {
    if (learningCounts[t.status] !== undefined) {
      learningCounts[t.status]++;
    }
  });
  
  // Account for topics that aren't initialized yet (default is 'todo')
  const totalDefaultCurriculumTopics = 6;
  const initializedCount = learningTopics.length;
  learningCounts.todo += Math.max(0, totalDefaultCurriculumTopics - initializedCount);

  const learningMomentum = [
    { name: 'To Do', value: learningCounts.todo },
    { name: 'In Progress', value: learningCounts.in_progress },
    { name: 'Mastered', value: learningCounts.mastered },
  ];

  // 4. Decision Quality (Win/Loss Ratios)
  const outcomes = { Winner: 0, Loser: 0, Pending: 0 };
  decisions.forEach((d) => {
    if (outcomes[d.result] !== undefined) {
      outcomes[d.result]++;
    }
  });

  const totalClosedDecisions = outcomes.Winner + outcomes.Loser;
  const winRate = totalClosedDecisions > 0 ? Math.round((outcomes.Winner / totalClosedDecisions) * 100) : 0;

  const decisionQuality = [
    { name: 'Winners', value: outcomes.Winner },
    { name: 'Losers', value: outcomes.Loser },
    { name: 'Pending', value: outcomes.Pending },
  ];

  // 5. Aligned Bias Resistance Frequencies
  const biasStats = {};
  journals.forEach((j) => {
    j.biasesChecked.forEach((bias) => {
      biasStats[bias] = (biasStats[bias] || 0) + 1;
    });
  });

  const biasResistance = Object.keys(biasStats).map((bias) => ({
    bias,
    count: biasStats[bias],
  })).sort((a, b) => b.count - a.count);

  return {
    disciplineScore: overallDisciplineScore,
    emotionDistribution,
    disciplineTrend,
    learningMomentum,
    decisionQuality,
    winRate,
    biasResistance,
  };
};

module.exports = {
  calculateUserAnalytics,
};
