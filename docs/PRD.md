Product Requirements Document (PRD)

**Personal Investing OS - All-In-One Guide**

# 1\. Executive Summary & Vision

Personal Investing OS is a production-ready MERN application designed to serve as a cognitive layer above the trading terminal. Focused on Groww users, it prioritizes investing discipline, learning, and behavioral reflection over rapid execution.

- Vision: To transform retail investors from reactive traders into disciplined capital allocators through structured reflection and behavioral analytics.

# 2\. Core Principles

- Education over Execution: Prioritizing the 'why' over the 'how'.
- Reflection over Reaction: Slowing down the decision-making process.
- Discipline over Frequency: Consistency in process over volume of trades.
- Long-term Thinking: Focusing on years, not minutes.

# 3\. Technical Stack

| Layer        | Technologies                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Frontend     | React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, Redux Toolkit, Formik, Yup, Recharts |
| Backend      | Node.js, Express.js, JWT, Zod Validation                                                       |
| Database     | MongoDB Atlas, Mongoose                                                                        |
| Architecture | Controller-Service-Model                                                                       |

# 4\. Application Modules

**Dashboard:** Daily clarity, learning progress, and discipline score overview.

**Daily Journal:** Structured reflection with emotion tracking (Fear, Greed, Calm).

**Learning Tracker:** Topic-based progress monitoring (e.g., Fundamental Analysis).

**Watchlist:** Observation-only tracking without buy/sell buttons.

**Decision Log:** Anti-impulse framework requiring a thesis and risk assessment before action.

**AI Mentor:** Reflection, bias detection, and learning reinforcement (No financial advice).

# 5\. Behavioral Analytics & Charts

The OS uses Recharts to visualize non-financial performance metrics:

- Emotion Frequency: Pie chart showing emotional distribution (e.g., % of FOMO).
- Discipline Trend: Line chart tracking journaling consistency.
- Learning Momentum: Bar chart showing topics mastered over time.
- Decision Quality: Analysis of past theses vs. outcomes.

# 6\. AI Prompt Rules & Security

AI must be education-first. It is strictly prohibited from providing stock predictions or buy/sell advice. Its tone is a 'Calm Mentor', focused on identifying biases like FOMO or overconfidence.

- Security: Bcrypt password hashing, JWT expiry, rate limiting, and environment variable management.

# 7\. Execution Guide

- Phase 1: Backend API (Auth, Schemas, Zod Validation).
- Phase 2: Analytics Services (Server-side calculations).
- Phase 3: Frontend Dashboard & Journaling UI.
- Phase 4: AI Mentor Integration & Behavioral Logic.
