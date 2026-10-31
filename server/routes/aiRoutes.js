import express from 'express';
import {
  analyzeMeeting,
  runAgentWorkflow,
  generateFollowupAgenda,
  getFollowupReport,
  editFollowupReport
} from '../controllers/aiController.js';

const router = express.Router();

// Agent 1 & Agent 2: Transcript Analysis & Task Deduplication
router.post('/analyze-meeting', analyzeMeeting);

// Complete LangGraph Multi-Agent Workflow
router.post('/agent-workflow', runAgentWorkflow);

// Agent 4: Follow-up & Next-Meeting Intelligence
router.post('/generate-followup-agenda', generateFollowupAgenda);
router.get('/followup-report', getFollowupReport);
router.put('/followup-report/:id', editFollowupReport);

export default router;
