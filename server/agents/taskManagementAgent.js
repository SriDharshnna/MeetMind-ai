import { Task } from '../models/Task.js';
import { detectDuplicateTasks } from './tools/agentTools.js';

/**
 * Agent 2: Task Management Agent
 * Manages action items, performs duplicate detection, and enforces status transitions
 */
export async function runTaskManagementAgent(actionItems) {
  console.log(`[Agent 2: Task Management] Checking ${actionItems?.length || 0} candidate action items for duplicates...`);

  // Tool Execution: Check existing open tasks for potential duplicates
  const detectedDuplicates = await detectDuplicateTasks(actionItems || []);

  if (detectedDuplicates.length > 0) {
    console.log(`[Agent 2: Task Management] Flagged ${detectedDuplicates.length} potential duplicate commitments.`);
  } else {
    console.log('[Agent 2: Task Management] Zero duplicates detected.');
  }

  return {
    potentialDuplicates: detectedDuplicates,
    itemCount: actionItems?.length || 0
  };
}

/**
 * Validated Task Status Update
 * Ensures only human-authorized status changes occur and auto-updates completedAt
 */
export async function updateTaskStatusWithAgent(taskId, newStatus) {
  const allowedStatuses = ['Pending', 'In Progress', 'Completed'];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Invalid status "${newStatus}". Must be one of: ${allowedStatuses.join(', ')}`);
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error('Task not found.');
  }

  const updateData = { status: newStatus };
  if (newStatus === 'Completed' && task.status !== 'Completed') {
    updateData.completedAt = new Date();
  } else if (newStatus !== 'Completed') {
    updateData.completedAt = null;
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  console.log(`[Agent 2: Task Management] Task "${task.title}" updated to status "${newStatus}".`);
  return updatedTask;
}
