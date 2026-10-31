import { analyzeMeetingWithGemini } from '../services/geminiService.js';

// @desc    Analyze meeting notes/transcript using Google Gemini API
// @route   POST /api/ai/analyze-meeting
export const analyzeMeeting = async (req, res, next) => {
  try {
    const {
      title,
      date,
      time,
      participants,
      description,
      transcript
    } = req.body;

    if (!transcript || !transcript.trim()) {
      res.status(400);
      throw new Error('Meeting transcript or discussion notes are required for AI analysis.');
    }

    console.log(`[AI Controller] Analyzing meeting "${title || 'Untitled'}" with Google Gemini...`);

    const analysis = await analyzeMeetingWithGemini({
      title,
      date,
      time,
      participants,
      description,
      transcript
    });

    console.log(`[AI Controller] Analysis completed successfully: ${analysis.actionItems.length} action items, ${analysis.decisions.length} decisions extracted.`);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('[AI Controller] Error in analyzeMeeting:', error.message);

    // If it's a Zod validation error
    if (error.name === 'ZodError') {
      res.status(422);
      return res.json({
        success: false,
        message: 'AI response failed structured schema validation',
        errors: error.errors
      });
    }

    // If it's an API key or Gemini service error
    if (error.message.includes('GEMINI_API_KEY') || error.message.includes('API_KEY_INVALID')) {
      res.status(401);
      return res.json({
        success: false,
        message: error.message
      });
    }

    res.status(500);
    next(error);
  }
};
