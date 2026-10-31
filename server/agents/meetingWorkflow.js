import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { runMeetingAnalysisAgent } from './meetingAnalysisAgent.js';
import { runTaskManagementAgent } from './taskManagementAgent.js';
import { runMonitoringJob } from './monitoringAgent.js';
import { runFollowUpAgent } from './followupAgent.js';

/**
 * Shared State Annotation for the LangGraph Multi-Agent Workflow
 */
export const AgentWorkflowState = Annotation.Root({
  // Input meeting details from user
  meetingInput: Annotation({
    reducer: (curr, update) => update ?? curr,
    default: () => ({})
  }),
  // Agent 1: Analysis output (MOM, action items, decisions)
  analysisResult: Annotation({
    reducer: (curr, update) => update ?? curr,
    default: () => null
  }),
  // Agent 2: Task deduplication & conflict evaluation
  potentialDuplicates: Annotation({
    reducer: (curr, update) => update ?? curr,
    default: () => []
  }),
  // Agent 3: Deadline monitoring alerts
  monitoringSummary: Annotation({
    reducer: (curr, update) => update ?? curr,
    default: () => null
  }),
  // Agent 4: Next-meeting agenda & repeated topic follow-up
  followUpInsights: Annotation({
    reducer: (curr, update) => update ?? curr,
    default: () => null
  }),
  // Workflow execution status & error log
  status: Annotation({
    reducer: (curr, update) => update ?? curr,
    default: () => 'initialized'
  }),
  errors: Annotation({
    reducer: (curr, update) => (update ? [...(curr || []), update] : curr || []),
    default: () => []
  })
});

/**
 * Node 1: Meeting Analysis Agent Node
 */
async function analyzeMeetingNode(state) {
  try {
    console.log('[LangGraph Workflow] Executing Node 1: Meeting Analysis Agent...');
    const result = await runMeetingAnalysisAgent(state.meetingInput || {});
    return {
      analysisResult: result.analysisResult,
      status: 'analysis_completed'
    };
  } catch (err) {
    console.error('[LangGraph Workflow] Error in analyzeMeetingNode:', err);
    return {
      errors: `AnalysisNodeError: ${err.message}`,
      status: 'analysis_failed'
    };
  }
}

/**
 * Node 2: Task Management & Deduplication Node
 */
async function deduplicateTasksNode(state) {
  try {
    console.log('[LangGraph Workflow] Executing Node 2: Task Management Agent (Deduplication Check)...');
    const actionItems = state.analysisResult?.actionItems || [];
    const result = await runTaskManagementAgent(actionItems);
    return {
      potentialDuplicates: result.potentialDuplicates,
      status: 'deduplication_completed'
    };
  } catch (err) {
    console.error('[LangGraph Workflow] Error in deduplicateTasksNode:', err);
    return {
      errors: `DeduplicationNodeError: ${err.message}`,
      status: 'deduplication_failed'
    };
  }
}

/**
 * Node 3: Monitoring Agent Node
 */
async function monitoringScanNode(state) {
  try {
    console.log('[LangGraph Workflow] Executing Node 3: Monitoring Agent (Deadline Scan)...');
    const scan = await runMonitoringJob();
    return {
      monitoringSummary: scan,
      status: 'monitoring_completed'
    };
  } catch (err) {
    console.error('[LangGraph Workflow] Error in monitoringScanNode:', err);
    return {
      errors: `MonitoringNodeError: ${err.message}`,
      status: 'monitoring_failed'
    };
  }
}

/**
 * Node 4: Follow-up Agent Node
 */
async function followUpSynthesisNode(state) {
  try {
    console.log('[LangGraph Workflow] Executing Node 4: Follow-up Agent (Cross-meeting Synthesis)...');
    const followUp = await runFollowUpAgent();
    return {
      followUpInsights: followUp,
      status: 'completed'
    };
  } catch (err) {
    console.error('[LangGraph Workflow] Error in followUpSynthesisNode:', err);
    return {
      errors: `FollowUpNodeError: ${err.message}`,
      status: 'followup_failed'
    };
  }
}

// ============================================================================
// LangGraph StateGraph Assembly
// ============================================================================

const workflow = new StateGraph(AgentWorkflowState)
  .addNode('analyzeMeeting', analyzeMeetingNode)
  .addNode('deduplicateTasks', deduplicateTasksNode)
  .addNode('monitoringScan', monitoringScanNode)
  .addNode('followUpSynthesis', followUpSynthesisNode)
  .addEdge(START, 'analyzeMeeting')
  .addEdge('analyzeMeeting', 'deduplicateTasks')
  .addEdge('deduplicateTasks', 'monitoringScan')
  .addEdge('monitoringScan', 'followUpSynthesis')
  .addEdge('followUpSynthesis', END);

export const meetingLangGraphWorkflow = workflow.compile();

/**
 * Execute the full multi-agent workflow
 */
export async function executeAgentWorkflow(meetingInput) {
  console.log('[LangGraph Workflow] Initiating multi-agent execution pipeline...');
  const initialState = {
    meetingInput,
    status: 'starting',
    errors: []
  };

  const finalState = await meetingLangGraphWorkflow.invoke(initialState);
  console.log('[LangGraph Workflow] Multi-agent execution finished with status:', finalState.status);
  return finalState;
}
