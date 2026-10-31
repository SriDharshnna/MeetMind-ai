import cron from 'node-cron';
import { retrieveOverdueTasks, recordManagerialAlerts } from './tools/agentTools.js';
import { Alert } from '../models/Alert.js';

let cronJobInstance = null;

/**
 * Agent 3: Monitoring Agent
 * Scans incomplete tasks, calculates overdue days, and records non-duplicate alerts
 */
export async function runMonitoringJob() {
  console.log('[Agent 3: Monitoring] Running scheduled task deadline scan...');

  try {
    // 1. Tool Execution: Deterministically retrieve overdue tasks
    const overdueTasks = await retrieveOverdueTasks();

    console.log(`[Agent 3: Monitoring] Evaluated task registry: ${overdueTasks.length} overdue deliverables identified.`);

    // 2. Formulate managerial alerts
    const alertsToRecord = overdueTasks.map((t) => ({
      type: 'overdue_task',
      title: `Task Overdue: ${t.title}`,
      message: `Commitment assigned to ${t.owner} from meeting "${t.meetingTitle}" is ${t.daysOverdue} days past target deadline (${t.deadline}).`,
      severity: t.priority === 'High' ? 'high' : 'medium',
      referenceId: t.id,
      referenceModel: 'Task',
      referenceTitle: t.title,
      daysOverdue: t.daysOverdue
    }));

    // 3. Tool Execution: Persist alerts without duplicate flooding
    const createdAlerts = await recordManagerialAlerts(alertsToRecord);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      overdueCount: overdueTasks.length,
      overdueTasks,
      newAlertsRecorded: createdAlerts.length
    };
  } catch (error) {
    console.error('[Agent 3: Monitoring] Error during monitoring cycle:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Initialize background scheduled cron job for Agent 3
 * Runs every hour at minute 0
 */
export function initMonitoringCron() {
  if (cronJobInstance) {
    return cronJobInstance;
  }

  // Schedule to run every hour
  cronJobInstance = cron.schedule('0 * * * *', async () => {
    console.log('[Agent 3: Monitoring] Triggering hourly cron check...');
    await runMonitoringJob();
  });

  console.log('[Agent 3: Monitoring] Scheduled cron job initialized (hourly cadence: 0 * * * *).');

  // Also trigger one initial pass upon server startup
  runMonitoringJob().catch((err) => {
    console.error('[Agent 3: Monitoring] Initial startup check failed:', err);
  });

  return cronJobInstance;
}
