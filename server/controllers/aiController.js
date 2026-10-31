import { runMeetingAnalysisAgent } from '../agents/meetingAnalysisAgent.js';
import { runTaskManagementAgent } from '../agents/taskManagementAgent.js';
import { runFollowUpAgent, getLatestFollowUpReport, updateFollowUpReport } from '../agents/followupAgent.js';
import { executeAgentWorkflow } from '../agents/meetingWorkflow.js';

// @desc    Agent 1 & Agent 2: Analyze meeting transcript & detect duplicate tasks
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

    console.log(`[AI Controller] Invoking Agent 1 for meeting "${title || 'Untitled'}"...`);

    // 1. Agent 1: Context retrieval + Gemini transcript analysis
    const agent1Result = await runMeetingAnalysisAgent({
      title,
      date,
      time,
      participants,
      description,
      transcript
    });

    const analysis = agent1Result.analysisResult;

    // 2. Agent 2: Duplicate commitment detection
    console.log(`[AI Controller] Invoking Agent 2 for duplicate check on ${analysis.actionItems?.length || 0} action items...`);
    const agent2Result = await runTaskManagementAgent(analysis.actionItems || []);

    res.status(200).json({
      success: true,
      data: {
        ...analysis,
        potentialDuplicates: agent2Result.potentialDuplicates || [],
        previousMeetingsContextCount: agent1Result.previousContextRetrieved || 0
      }
    });
  } catch (error) {
    console.error('[AI Controller] Error in analyzeMeeting:', error.message);

    if (error.name === 'ZodError') {
      res.status(422);
      return res.json({
        success: false,
        message: 'AI response failed structured schema validation',
        errors: error.errors
      });
    }

    res.status(500);
    next(error);
  }
};

// @desc    Multi-Agent LangGraph Workflow Execution
// @route   POST /api/ai/agent-workflow
export const runAgentWorkflow = async (req, res, next) => {
  try {
    const meetingInput = req.body;
    console.log('[AI Controller] Running complete LangGraph 4-Agent Workflow...');
    const workflowResult = await executeAgentWorkflow(meetingInput);

    res.status(200).json({
      success: true,
      data: workflowResult
    });
  } catch (error) {
    console.error('[AI Controller] Error in runAgentWorkflow:', error.message);
    next(error);
  }
};

// @desc    Agent 4: Generate Follow-up Agenda & Cross-Meeting Intelligence
// @route   POST /api/ai/generate-followup-agenda
export const generateFollowupAgenda = async (req, res, next) => {
  try {
    console.log('[AI Controller] Triggering Agent 4: Follow-up & Next-Meeting Intelligence...');
    const report = await runFollowUpAgent();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('[AI Controller] Error generating follow-up agenda:', error.message);
    next(error);
  }
};

// @desc    Retrieve the latest generated follow-up report
// @route   GET /api/ai/followup-report
export const getFollowupReport = async (req, res, next) => {
  try {
    let report = await getLatestFollowUpReport();

    // If none exists yet, automatically generate one so user sees immediate value
    if (!report) {
      console.log('[AI Controller] No follow-up report found, generating initial report...');
      report = await runFollowUpAgent();
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('[AI Controller] Error fetching follow-up report:', error.message);
    next(error);
  }
};

// @desc    Update/Edit follow-up agenda (Manager review & approval)
// @route   PUT /api/ai/followup-report/:id
export const editFollowupReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await updateFollowUpReport(id, updateData);
    if (!updated) {
      res.status(404);
      throw new Error('Follow-up report not found');
    }

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('[AI Controller] Error updating follow-up report:', error.message);
    next(error);
  }
};
