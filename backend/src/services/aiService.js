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

/**
 * Service to generate highly structured AI-curated MERN lessons.
 */
const generateAdaptiveLesson = async (topicName, difficulty, journals, decisions, focalPoints = "") => {
  // If GEMINI_API_KEY is not defined, use high-fidelity mock generated lesson JSON
  if (!process.env.GEMINI_API_KEY) {
    return getMockAdaptiveLesson(topicName, difficulty, journals, decisions);
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format emotional journals and trading decisions context for prompt injection
    const formattedJournals = journals.slice(0, 5).map(j => (
      `- Date: ${j.date}, Sentiment: ${j.marketSentiment}, Stress: ${j.stressLevel}/10, Focus: ${j.focusLevel}/10, Thoughts: "${j.thoughts}", Defended Biases: [${j.biasesChecked.join(', ')}]`
    )).join('\n');

    const formattedDecisions = decisions.slice(0, 5).map(d => (
      `- Asset: ${d.asset}, Thesis: "${d.rationale}", Stop Loss: "${d.metrics.stop}", Conviction: ${d.conviction}/10, Outcome: ${d.result}`
    )).join('\n');

    const prompt = `You are a world-class AI Investing Coach and Behavioral Finance Professor.
Generate a structured, interactive investing lesson on the topic: "${topicName}" tailored for a "${difficulty}" level.

${focalPoints ? `STUDENT CUSTOM FOCUS / DIRECTIVES:
The student explicitly requested the following areas to be covered, prioritized, and analyzed in this lesson:
"${focalPoints}"\n` : ''}

You must customize this lesson directly based on the student's recent psychological logs and trading decisions:
--- Student Journals (Mental States) ---
${formattedJournals || 'No journals logged yet.'}

--- Student Decisions (Portfolio Execution) ---
${formattedDecisions || 'No decisions logged yet.'}

Highlight any specific patterns you see (e.g. stress causing premature exit, greed causing impulsive buying, revenge trading on loss, or lack of defined stop losses). Weave these exact real-world habits of the student into the slides and quiz as actual study cases!

You MUST respond with a valid JSON object matching the following structure:
{
  "title": "A premium, customized Title for the Lesson",
  "summary": "A high-fidelity 2-3 sentence overview of this lesson.",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "text": "Core bullet points or educational content for the slide card. Keep it compact, professional, and highly readable (max 3 bullet points). Use bullet symbol •.",
      "visualDescription": "A highly detailed suggestion for a premium diagram, chart, or glassmorphic animation that represents this slide visually.",
      "narrativeScript": "An elegant, calm voiceover script (2-4 sentences) written in the first person that will be spoken aloud to the student when this slide is active. Introduce concepts clearly."
    }
  ],
  "tips": [
    "Actionable, technical tip 1",
    "Actionable, technical tip 2"
  ],
  "mistakes": [
    "Common emotional pitfall 1 related to this topic",
    "Common emotional pitfall 2 related to this topic"
  ],
  "quiz": [
    {
      "questionNumber": 1,
      "question": "A multiple-choice question testing the knowledge of the slides or referencing the user's specific context.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "A detailed explanation of why the correct option is right."
    }
  ]
}

Create exactly 4 slides and 3 quiz questions. Keep your tone encouraging, calm, structured, and professional. Output ONLY raw valid JSON matching the schema.`;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text);
    return parsedJson;
  } catch (error) {
    console.error('Gemini lesson generation error, falling back to mock response:', error.message);
    return getMockAdaptiveLesson(topicName, difficulty, journals, decisions);
  }
};

/**
 * Generate high-fidelity customized offline mock lessons.
 */
function getMockAdaptiveLesson(topicName, difficulty, journals, decisions) {
  const hasHighStress = journals.some(j => j.stressLevel > 6);
  const hasGreed = journals.some(j => j.marketSentiment === 'greed');
  
  let personalizedMessage = "Remember that standard process outlives short-term momentum.";
  if (hasHighStress) {
    personalizedMessage = "I noticed your stress levels have been elevated recently. Always secure psychological margin of safety by keeping trade sizes manageable.";
  } else if (hasGreed) {
    personalizedMessage = "Your logs show strong greed sentiments. Keep strict entries; do not chase green momentum without structural stop levels.";
  }

  return {
    title: `${topicName}: Structural Strategy Masterclass`,
    summary: `A high-fidelity adaptive lesson on ${topicName} customized for your ${difficulty} training level. We explore mechanical procedures to secure capital discipline.`,
    slides: [
      {
        slideNumber: 1,
        title: `Introduction to ${topicName}`,
        text: `• Establish a systematic workflow for ${topicName}.\n• Secure mathematical margin of safety.\n• Protect cognitive resources against impulsive actions.`,
        visualDescription: "An elegant glassmorphic shield representing cognitive armor protecting capital balances.",
        narrativeScript: `Welcome to your Aether Academy masterclass. Today we are investigating ${topicName}. ${personalizedMessage}`
      },
      {
        slideNumber: 2,
        title: "The Mechanics of Process Control",
        text: `• Emotional baseline dictates long-term performance.\n• Keep standard capital allocations consistent.\n• Log thesis and invalidation criteria before capital placement.`,
        visualDescription: "A modern dual-scale dashboard visualizing the balance between discipline score and emotional volatility.",
        narrativeScript: "Investing is not about guessing price movements; it is a game of probability and process management. A sound methodology is the ultimate shield against drawdowns."
      },
      {
        slideNumber: 3,
        title: "Personalized Behavioral Audit",
        text: `• Stress spikes lead to premature win exits or late stop-losses.\n• Greed triggers lead to FOMO chasing.\n• Rule: Implement the 3-minute Anti-Impulse buffer.`,
        visualDescription: "A stylized hourglass timer demonstrating the flow of cool-off periods before executing decisions.",
        narrativeScript: "Reviewing your trading behavior, we can see that emotional friction is our primary variable. Slowing down the interval between an urge and an trade execution is how we build consistency."
      },
      {
        slideNumber: 4,
        title: "Rule-Based Asset Execution",
        text: `• Check matching strategies checklist.\n• Define Stop Losses dynamically before order entry.\n• Treat every trade as a business transaction, not a bet.`,
        visualDescription: "A neat grid showing a strategic checklist with all items successfully marked done.",
        narrativeScript: "To master this, promise yourself one rule: never enter a position without knowing where you are wrong. A stop-loss is not a sign of failure—it is the exact cost of systematic business."
      }
    ],
    tips: [
      "Securing psychological margin of safety is more valuable than leverage.",
      "Check your strategies checklist on every single trade without exception.",
      "Log your emotional baseline in the Daily Journal even on days with zero activity."
    ],
    mistakes: [
      "Chasing volatile assets without pre-defined stop loss targets.",
      "Revenge trading to recoup a loss from a previous trading session.",
      "Trading when stress is higher than 6/10 without reducing position sizing."
    ],
    quiz: [
      {
        questionNumber: 1,
        question: "When stress levels are elevated (above 6/10), what is the most systematic behavioral action to take?",
        options: [
          "Double position sizing to recoup stress costs",
          "Immediately exit all assets without analysis",
          "Reduce position sizing by 50% or take a no-trade day",
          "Leverage options to hedge aggressively"
        ],
        correctOptionIndex: 2,
        explanation: "High stress compromises risk assessment. Reducing size by 50% or staying on the sidelines maintains capital preservation and peace of mind."
      },
      {
        questionNumber: 2,
        question: "What is the primary role of a stop loss in capital preservation?",
        options: [
          "To guarantee maximum profitable exits",
          "To act as the pre-defined cost of systematic business",
          "To prevent any loss from occurring",
          "To signal that a strategy is 100% correct"
        ],
        correctOptionIndex: 1,
        explanation: "A stop loss represents your thesis invalidation criteria. It is the known cost of doing business when a probability doesn't align in your favor."
      },
      {
        questionNumber: 3,
        question: "Which of these traits defines a high-discipline Aether Investor?",
        options: [
          "Always chasing assets with strong positive momentum",
          "Refusing to log journals on losing days",
          "Logging a detailed entry thesis and stop criteria BEFORE trade execution",
          "Entering trades purely on intuitive feelings"
        ],
        correctOptionIndex: 2,
        explanation: "Discipline is about process consistency. Logging entry rationale and stop criteria before placing capital eliminates impulsive bias."
      }
    ]
  };
}

module.exports = {
  generateBehavioralFeedback,
  generateAdaptiveLesson,
};
