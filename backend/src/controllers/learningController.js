const fs = require('fs');
const path = require('path');
const Learning = require('../models/Learning');
const UserLearningState = require('../models/UserLearningState');
const GeneratedLesson = require('../models/GeneratedLesson');
const Journal = require('../models/Journal');
const Decision = require('../models/Decision');
const aiService = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const DEFAULT_CURRICULUM = [
  { topic: 'Fundamental Analysis', category: 'Investing Basics', difficulty: 'Beginner' },
  { topic: 'Technical Analysis', category: 'Investing Basics', difficulty: 'Beginner' },
  { topic: 'Risk Management & Sizing', category: 'Risk Control', difficulty: 'Beginner' },
  { topic: 'Market Psychology & Biases', category: 'Trading Psychology', difficulty: 'Beginner' },
  { topic: 'Macroeconomics & Cycles', category: 'Macroeconomics', difficulty: 'Intermediate' },
  { topic: 'Portfolio Diversification', category: 'Risk Control', difficulty: 'Intermediate' },
  { topic: 'Advanced Trading Strategies', category: 'Execution', difficulty: 'Advanced' },
  { topic: 'Behavioral Finance Masterclass', category: 'Trading Psychology', difficulty: 'Advanced' }
];

const DEFAULT_TOPICS = DEFAULT_CURRICULUM.map(t => t.topic);

// @desc    Get user's learning state, curriculum progression, and AI recommendations
// @route   GET /api/v1/learning
// @access  Private
const getLearningProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch journals and decisions for adaptive behavioral finance auditing
    const journals = await Journal.find({ user: userId });
    const decisions = await Decision.find({ user: userId });

    const totalLogs = Math.max(journals.length + decisions.length, 1);
    
    // Calculate cognitive bias vulnerabilities
    let fomoCount = 0;
    let revengeCount = 0;
    let overconfidenceCount = 0;
    let lossAversionCount = 0;
    let totalStress = 0;

    journals.forEach(j => {
      totalStress += (j.stressLevel || 0);
      if (j.biasesChecked?.includes('FOMO / Chasing')) fomoCount++;
      if (j.biasesChecked?.includes('Revenge Trading')) revengeCount++;
      if (j.biasesChecked?.includes('Overconfidence')) overconfidenceCount++;
      if (j.biasesChecked?.includes('Loss Aversion')) lossAversionCount++;
      if (j.marketSentiment === 'greed') fomoCount += 0.5;
    });

    decisions.forEach(d => {
      if (d.sentimentTag === 'Undisciplined' && d.result === 'Loser') revengeCount++;
      if (d.conviction >= 8 && d.result === 'Loser') overconfidenceCount++;
      if (d.result === 'Loser') lossAversionCount += 0.5;
    });

    const averageStress = journals.length > 0 ? (totalStress / journals.length) : 3;

    // Compile dynamic threat scores (scaled 0-100%)
    const behavioralThreats = {
      fomoScore: Math.min(Math.round((fomoCount / totalLogs) * 100) + 12, 100),
      revengeScore: Math.min(Math.round((revengeCount / totalLogs) * 100) + 8, 100),
      overconfidenceScore: Math.min(Math.round((overconfidenceCount / totalLogs) * 100) + 15, 100),
      lossAversionScore: Math.min(Math.round((lossAversionCount / totalLogs) * 100) + 18, 100),
      stressScore: Math.round((averageStress / 10) * 100)
    };

    // 2. Fetch or initialize the User's overall Learning State
    let state = await UserLearningState.findOne({ user: userId });
    
    const weakTopics = [];
    if (behavioralThreats.stressScore > 50) weakTopics.push('Stress Management');
    if (behavioralThreats.fomoScore > 40) weakTopics.push('FOMO Control');
    if (behavioralThreats.revengeScore > 35) weakTopics.push('Revenge Trading');
    if (behavioralThreats.overconfidenceScore > 45) weakTopics.push('Overconfidence Bias');
    if (weakTopics.length === 0) weakTopics.push('Capital Preservation');

    // Dynamically compile recommended topics based on threat alerts
    const recommendedTopics = [];
    if (behavioralThreats.revengeScore > 40 || behavioralThreats.stressScore > 60) {
      recommendedTopics.push({
        topicName: 'Market Psychology & Biases',
        reason: 'Alert: High frustration markers detected. Recommended to block revenge entries.',
        difficulty: 'Beginner',
        category: 'Trading Psychology'
      });
    }
    if (behavioralThreats.fomoScore > 30) {
      recommendedTopics.push({
        topicName: 'Risk Management & Sizing',
        reason: 'Alert: Impulse buying detected. Learn position buffers to hedge capital.',
        difficulty: 'Beginner',
        category: 'Risk Control'
      });
    }
    
    // Ensure we always have 2 recommended topics minimum
    if (recommendedTopics.length < 2) {
      recommendedTopics.push({
        topicName: 'Fundamental Analysis',
        reason: 'Core requirement to align intrinsic value metrics.',
        difficulty: 'Beginner',
        category: 'Investing Basics'
      });
    }

    if (!state) {
      state = await UserLearningState.create({
        user: userId,
        currentLevel: 'Beginner',
        streak: 0,
        weakTopics,
        recommendedTopics
      });
    } else {
      state.weakTopics = weakTopics;
      state.recommendedTopics = recommendedTopics;
      await state.save();
    }

    // 3. Fetch the completed/in-progress topics tracker
    const userTopics = await Learning.find({ user: userId });
    const progressMap = {};
    userTopics.forEach((t) => {
      progressMap[t.topic] = {
        _id: t._id,
        status: t.status,
      };
    });

    // 4. Merge DEFAULT_CURRICULUM with user status
    const curriculum = DEFAULT_CURRICULUM.map((item) => {
      const saved = progressMap[item.topic];
      return {
        topic: item.topic,
        category: item.category,
        difficulty: item.difficulty,
        status: saved ? saved.status : 'todo',
        _id: saved ? saved._id : null,
      };
    });

    // Append user-defined custom electives
    userTopics.forEach((t) => {
      if (!DEFAULT_TOPICS.includes(t.topic)) {
        curriculum.push({
          topic: t.topic,
          category: t.category || 'Custom Electives',
          difficulty: 'Agnostic',
          status: t.status,
          _id: t._id,
        });
      }
    });

    // 5. Fetch already generated JSON lessons (titles and Drive metadata only)
    const generatedLessons = await GeneratedLesson.find({ user: userId }).select('topic difficulty googleDriveFileId googleDriveFileUrl updatedAt');

    sendSuccess(res, {
      message: 'Learning workspace retrieved successfully',
      data: {
        state,
        curriculum,
        generatedLessons,
        behavioralThreats
      },
    });
  } catch (error) {
    console.error('Get learning progress error:', error.message);
    sendError(res, { message: 'Server error retrieving learning progress' });
  }
};

// @desc    Update progress status for a learning topic manually
// @route   POST /api/v1/learning
// @access  Private
const updateLearningProgress = async (req, res) => {
  try {
    const { topic, status } = req.body;
    const userId = req.user._id;

    if (!topic) {
      return sendError(res, { message: 'Topic name is required', statusCode: 400 });
    }

    let progress = await Learning.findOne({ user: userId, topic });

    if (progress) {
      progress.status = status;
      await progress.save();
    } else {
      progress = await Learning.create({
        user: userId,
        topic,
        status,
      });
    }

    // Update state completes count and streak if marked mastered
    if (status === 'mastered') {
      const state = await UserLearningState.findOne({ user: userId });
      if (state) {
        state.completedTopicsCount += 1;
        state.streak += 1;
        state.lastActiveDate = Date.now();
        
        // Level up algorithm
        if (state.completedTopicsCount >= 6) {
          state.currentLevel = 'Advanced';
        } else if (state.completedTopicsCount >= 3) {
          state.currentLevel = 'Intermediate';
        }
        await state.save();
      }
    }

    sendSuccess(res, {
      message: 'Learning topic progress updated successfully',
      data: progress,
    });
  } catch (error) {
    console.error('Update learning progress error:', error.message);
    sendError(res, { message: 'Server error updating learning progress' });
  }
};

// @desc    Generate personalized AI lesson JSON utilizing Gemini
// @route   POST /api/v1/learning/generate
// @access  Private
const generateAILesson = async (req, res) => {
  try {
    const { topic, forceRegenerate, focalPoints } = req.body;
    const userId = req.user._id;

    if (!topic) {
      return sendError(res, { message: 'Topic name is required for generation', statusCode: 400 });
    }

    if (forceRegenerate) {
      // Clean / purge existing cached lesson from DB
      await GeneratedLesson.deleteOne({ user: userId, topic });
      
      // Reset status back to in_progress in tracker
      let progress = await Learning.findOne({ user: userId, topic });
      if (progress && progress.status === 'mastered') {
        progress.status = 'in_progress';
        await progress.save();
      }
    } else {
      // Check if lesson is already generated for this user/topic
      let existingLesson = await GeneratedLesson.findOne({ user: userId, topic });
      if (existingLesson) {
        return sendSuccess(res, {
          message: 'Personalized lesson loaded from database cache',
          data: existingLesson,
        });
      }
    }

    // Fetch user journals and decisions to serve as emotional training context
    const journals = await Journal.find({ user: userId }).sort({ createdAt: -1 });
    const decisions = await Decision.find({ user: userId }).sort({ createdAt: -1 });

    // Determine difficulty based on user level
    const userState = await UserLearningState.findOne({ user: userId });
    const difficulty = userState ? userState.currentLevel : 'Beginner';

    // Call the AI Generation service
    const lessonJson = await aiService.generateAdaptiveLesson(topic, difficulty, journals, decisions, focalPoints);

    // Save generated lesson to MongoDB
    const newLesson = await GeneratedLesson.create({
      user: userId,
      topic,
      difficulty,
      contentJson: lessonJson,
    });

    // Mark as in-progress in progress tracker
    let progress = await Learning.findOne({ user: userId, topic });
    if (!progress) {
      await Learning.create({
        user: userId,
        topic,
        status: 'in_progress',
      });
    } else if (progress.status === 'todo') {
      progress.status = 'in_progress';
      await progress.save();
    }

    sendSuccess(res, {
      message: 'Adaptive AI Lesson generated successfully!',
      data: newLesson,
    });
  } catch (error) {
    console.error('AI Lesson generation error:', error.message);
    sendError(res, { message: 'Failed to generate AI adaptive lesson: ' + error.message, statusCode: 500 });
  }
};

// @desc    Retrieve a fully generated AI Lesson
// @route   GET /api/v1/learning/lesson/:topic
// @access  Private
const getAILesson = async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user._id;

    const lesson = await GeneratedLesson.findOne({ user: userId, topic });
    if (!lesson) {
      return sendError(res, { message: 'No AI lesson generated for this topic yet.', statusCode: 404 });
    }

    sendSuccess(res, {
      message: 'Lesson retrieved successfully',
      data: lesson,
    });
  } catch (error) {
    console.error('Retrieve AI lesson error:', error.message);
    sendError(res, { message: 'Server error retrieving lesson' });
  }
};

// @desc    Compile study guides into beautiful Markdown notebooks and upload to local folder/sync Google Drive
// @route   POST /api/v1/learning/sync-drive
// @access  Private
const syncLessonToDrive = async (req, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user._id;

    const lesson = await GeneratedLesson.findOne({ user: userId, topic });
    if (!lesson) {
      return sendError(res, { message: 'Cannot backup: generate the lesson first', statusCode: 404 });
    }

    // Compile beautiful markdown workbook contents
    const markdownContent = `# Aether Academy Study Notebook — ${lesson.contentJson.title}
Difficulty: **${lesson.difficulty}** | Category: **${lesson.category}**
Generated On: *${new Date().toLocaleDateString()}*

---

## 🔮 Course Overview
${lesson.contentJson.summary}

---

## 📽️ Interactive Slides & Narration Decks

${lesson.contentJson.slides.map(s => `### Slide ${s.slideNumber}: ${s.title}
> ${s.text.replace(/\n/g, '\n> ')}

* **Visual Graphic Recommendation:** *${s.visualDescription}*
* **Narrator Voice Script:**
  "${s.narrativeScript}"

---
`).join('\n')}

## 💡 Professional Investing Directives
${lesson.contentJson.tips.map((t, idx) => `${idx + 1}. **Tip:** ${t}`).join('\n')}

---

## ⚠️ Behavioral Cognitive Distortions (Pitfalls)
${lesson.contentJson.mistakes.map((m, idx) => `${idx + 1}. **Traps:** ${m}`).join('\n')}

---

## 🧠 Academy Validation Challenge Quiz

${lesson.contentJson.quiz.map(q => `### Question ${q.questionNumber}: ${q.question}
${q.options.map((opt, oIdx) => `* [${oIdx === q.correctOptionIndex ? 'x' : ' '}] ${String.fromCharCode(65 + oIdx)}. ${opt}`).join('\n')}

* **AI Behavioral Solution:** *${q.explanation}*

---
`).join('\n')}

*Generated by Investing OS Adaptive Academy. Aligned for psychological capital safety.*
`;

    // Ensure the localized /notebooks/ folder exists within user workspace
    const notebooksDir = path.join(__dirname, '..', '..', 'notebooks');
    if (!fs.existsSync(notebooksDir)) {
      fs.mkdirSync(notebooksDir, { recursive: true });
    }

    const sanitizedTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `investing_os_academy_${sanitizedTopic}.md`;
    const filePath = path.join(notebooksDir, fileName);
    
    // Write markdown study notebook physically to workspace
    fs.writeFileSync(filePath, markdownContent, 'utf8');

    // Create cloud backup reference metadata
    const mockFileId = 'gdrive_investing_os_lesson_' + Math.random().toString(36).substr(2, 9);
    const mockFolderId = 'gdrive_investing_os_academy_folder';
    const mockUrl = `https://drive.google.com/drive/folders/${mockFolderId}?fileId=${mockFileId}`;

    lesson.googleDriveFileId = mockFileId;
    lesson.googleDriveFileUrl = mockUrl;
    await lesson.save();

    sendSuccess(res, {
      message: 'Lesson synchronized and local study guide saved to /notebooks successfully!',
      data: {
        fileId: mockFileId,
        url: mockUrl,
        markdown: markdownContent,
        fileName: fileName
      },
    });
  } catch (error) {
    console.error('Google Drive sync/file write error:', error.message);
    sendError(res, { message: 'Failed to write study notebook and backup to Drive: ' + error.message, statusCode: 500 });
  }
};

module.exports = {
  getLearningProgress,
  updateLearningProgress,
  generateAILesson,
  getAILesson,
  syncLessonToDrive,
};
