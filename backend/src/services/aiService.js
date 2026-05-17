const { GoogleGenAI } = require('@google/generative-ai');

/**
 * Service to generate AI Mentor behavioral feedback.
 */
const generateBehavioralFeedback = async (journals, decisions, userPrompt = '') => {
  // If GEMINI_API_KEY is not defined, use high-fidelity rule-based mentor response
  if (!process.env.GEMINI_API_KEY) {
    return getMockMentorFeedback(journals, decisions, userPrompt);
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    
    // Use gemini-2.5-flash as default model
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format data for prompt
    const formattedJournals = journals.slice(0, 5).map(j => (
      `- Date: ${j.date}, Sentiment: ${j.marketSentiment}, Stress: ${j.stressLevel}/10, Focus: ${j.focusLevel}/10, Thoughts: "${j.thoughts}", Defended Biases: [${j.biasesChecked.join(', ')}]`
    )).join('\n');

    const formattedDecisions = decisions.slice(0, 5).map(d => (
      `- Asset: ${d.asset}, Thesis: "${d.rationale}", Stop Loss Criteria: "${d.metrics.stop}", Conviction: ${d.conviction}/10, Outcome: ${d.result}`
    )).join('\n');

    const systemContext = `You are a calm, professional, and empathetic Full-Stack AI Behavioral Finance Mentor. 
Your goal is to serve as a cognitive layer above the user's trading terminal.
You must analyze the user's psychological state and decisions to identify emotional patterns, biases (like FOMO, loss aversion, overconfidence, or revenge trading), and learning opportunities.

STRICT RULES:
1. NEVER provide financial advice, stock predictions, or buy/sell recommendations.
2. If the user asks for stock picks or predictions, calmly explain that you are a behavioral mentor, not an advisor, and redirect them to process discipline.
3. Keep your tone calm, introspective, structured, and highly encouraging.
4. Keep your response within 3-4 concise paragraphs with clear bullet points.

USER AUDIT CONTEXT:
--- Recent Psychological Journals ---
${formattedJournals || 'No journals logged yet.'}

--- Recent Investment Decisions ---
${formattedDecisions || 'No decisions logged yet.'}
`;

    const prompt = userPrompt 
      ? `User question/thought: "${userPrompt}"\n\nPlease provide behavioral feedback considering the user's context.`
      : `Provide a comprehensive behavioral audit of my recent journal logs and investment decisions. Identify my strengths, emotional vulnerabilities, and give 3 actionable rules to improve my discipline.`;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemContext + '\n\n' + prompt }] }]
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API Error, falling back to mock response:', error.message);
    return getMockMentorFeedback(journals, decisions, userPrompt);
  }
};

/**
 * High-fidelity fallback rule-based mentor response.
 */
function getMockMentorFeedback(journals, decisions, userPrompt) {
  // Analyze journals for mock insights
  let hasFOMOResistance = false;
  let highStressCount = 0;
  let greedCount = 0;
  let fearCount = 0;

  journals.forEach(j => {
    if (j.biasesChecked.includes('FOMO Resistance')) hasFOMOResistance = true;
    if (j.stressLevel > 6) highStressCount++;
    if (j.marketSentiment === 'greed') greedCount++;
    if (j.marketSentiment === 'fear') fearCount++;
  });

  const winRate = decisions.length > 0 
    ? Math.round((decisions.filter(d => d.result === 'Winner').length / decisions.filter(d => d.result !== 'Pending').length) * 100) || 0
    : null;

  let feedback = '';

  if (userPrompt) {
    const lowerPrompt = userPrompt.toLowerCase();
    
    if (lowerPrompt.includes('buy') || lowerPrompt.includes('sell') || lowerPrompt.includes('stock') || lowerPrompt.includes('predict') || lowerPrompt.includes('recommend')) {
      return `### 🛑 Behavioral Boundary Protocol

As your **Investing OS AI Mentor**, I am programmed to focus exclusively on your **psychological alignment, discipline, and emotional biases**. I am strictly prohibited from providing stock predictions, price targets, or buy/sell recommendations.

Instead, let's look at the process behind this asset:
*   **What is the thesis?** Have you logged the core reasons for wanting to allocate capital here in your **Decision Log**?
*   **What is the invalidation point?** Before entry, have you defined the exact price or data point that proves your thesis wrong?
*   **What is the emotional trigger?** Are you feeling the urge to buy due to price momentum (FOMO), or is it backed by patient observation?

Focus on **capital preservation and process consistency**—the numbers will take care of themselves.`;
    }

    feedback += `### Introspective Guidance

Thank you for sharing your thoughts: *"${userPrompt}"*. Let's break this down from a behavioral finance perspective.

Your recent entries show that you are actively striving to build a systematic process. By slowing down the friction between your emotional urges and your capital placement, you are already outperforming the average retail investor who trades on impulse.

`;
  } else {
    feedback += `### 🧠 Behavioral Audit & Reflections

Greetings. I have audited your recent psychological journals and systematic decision logs. Let's look at the cognitive patterns affecting your capital allocation:

`;
  }

  // Add specific insights
  if (highStressCount > 0) {
    feedback += `*   **Stress Management Alert**: You have logged high stress levels (${highStressCount} logs above 6/10). High cortisol impairs the prefrontal cortex, leading to premature exit of winning positions or holding on to losers out of hope. When stress is elevated, consider reducing your standard position size by 50%.
`;
  } else {
    feedback += `*   **Psychological Equilibrium**: Your emotional baseline is currently stable. This is the optimal state for making strategic decisions, as you are neither under the influence of panic nor overconfidence.
`;
  }

  if (greedCount > 0) {
    feedback += `*   **Greed Bias Exposure**: I detected greed-based sentiment in your logs. When market momentum is strong, the urge to chase returns (FOMO) increases. Maintain strict adherence to your entry criteria.
`;
  } else if (fearCount > 0) {
    feedback += `*   **Loss Aversion Exposure**: Fear-based sentiments are present. Remember that drawdowns are a standard cost of doing business. Focus on execution quality rather than dollar outcomes.
`;
  }

  if (hasFOMOResistance) {
    feedback += `*   **Discipline Strength**: Your logs show active resistance to FOMO. Selecting "FOMO Resistance" as an aligned defense indicates you successfully let an impulsive trade pass. This is a massive victory for your capital preservation!
`;
  }

  feedback += `
### 🛠️ Actionable Behavioral Directives
1.  **Enforce the Cool-Off Rule**: Continue using the 3-minute Anti-Impulse timer in your Decision Log. Use this time to write down exactly *why* your thesis could be wrong.
2.  **Define Invalidation Before Entry**: Never place a trade without a stop loss or structural invalidation point. If you do not know where you are wrong, you do not have a trade.
3.  **Journal on No-Trade Days**: Journaling consistency is the backbone of your Discipline Score. Log your thoughts even when you do nothing; patience is also an active investment decision.`;

  return feedback;
}

module.exports = {
  generateBehavioralFeedback,
};
