import { Meeting } from '../../models/Meeting.js';
import { Task } from '../../models/Task.js';
import { Decision } from '../../models/Decision.js';
import { Alert } from '../../models/Alert.js';
import { FollowUpReport } from '../../models/FollowUpReport.js';

/**
 * Tool: Retrieve previous meeting records
 */
export async function retrievePreviousMeetings(limit = 4) {
  try {
    const meetings = await Meeting.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(limit);
    return meetings.map((m) => ({
      id: m._id.toString(),
      title: m.title,
      date: m.date,
      summary: m.summary,
      discussionPoints: m.discussionPoints,
      participants: m.participants.map((p) => p.name).join(', ')
    }));
  } catch (err) {
    console.error('[Tool:retrievePreviousMeetings] Error:', err);
    return [];
  }
}

/**
 * Tool: Retrieve pending and in-progress tasks
 */
export async function retrievePendingTasks() {
  try {
    const tasks = await Task.find({ status: { $ne: 'Completed' } }).sort({ deadline: 1 });
    return tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      owner: t.owner,
      deadline: t.deadline,
      priority: t.priority,
      status: t.status,
      meetingTitle: t.meetingTitle,
      isOverdue: t.isOverdue,
      daysDiff: t.daysDiff
    }));
  } catch (err) {
    console.error('[Tool:retrievePendingTasks] Error:', err);
    return [];
  }
}

/**
 * Tool: Retrieve overdue tasks deterministically
 * Evaluates deadline against today's midnight timestamp
 * Never classifies completed tasks as overdue!
 */
export async function retrieveOverdueTasks() {
  try {
    const allTasks = await Task.find({ status: { $ne: 'Completed' } });
    const overdueTasks = allTasks.filter((t) => t.isOverdue);
    return overdueTasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      owner: t.owner,
      deadline: t.deadline,
      priority: t.priority,
      status: t.status,
      meetingTitle: t.meetingTitle,
      daysOverdue: Math.abs(t.daysDiff)
    }));
  } catch (err) {
    console.error('[Tool:retrieveOverdueTasks] Error:', err);
    return [];
  }
}

/**
 * Tool: Retrieve decisions awaiting implementation
 */
export async function retrievePendingDecisions() {
  try {
    const decisions = await Decision.find({ implementationStatus: { $ne: 'Implemented' } })
      .sort({ createdAt: -1 });
    return decisions.map((d) => ({
      id: d._id.toString(),
      title: d.title,
      description: d.description,
      responsiblePerson: d.responsiblePerson,
      implementationStatus: d.implementationStatus,
      category: d.category,
      rationale: d.rationale,
      meetingTitle: d.meetingTitle
    }));
  } catch (err) {
    console.error('[Tool:retrievePendingDecisions] Error:', err);
    return [];
  }
}

/**
 * Tool: Detect potential duplicate tasks
 * Compares incoming candidate tasks against currently active open tasks
 */
export async function detectDuplicateTasks(candidateTasks) {
  try {
    if (!Array.isArray(candidateTasks) || candidateTasks.length === 0) {
      return [];
    }

    const openTasks = await Task.find({ status: { $ne: 'Completed' } });
    const duplicates = [];

    for (const candidate of candidateTasks) {
      if (!candidate.title) continue;
      const candTitleNorm = candidate.title.toLowerCase().trim();
      const candOwnerNorm = (candidate.owner || '').toLowerCase().trim();

      for (const openTask of openTasks) {
        const openTitleNorm = openTask.title.toLowerCase().trim();
        const openOwnerNorm = openTask.owner.toLowerCase().trim();

        // Check for direct title match or strong keyword overlap with same owner
        const isSameOwner = candOwnerNorm && openOwnerNorm && candOwnerNorm === openOwnerNorm;
        const isTitleExact = candTitleNorm === openTitleNorm;
        const isSubstring = candTitleNorm.includes(openTitleNorm) || openTitleNorm.includes(candTitleNorm);

        if (isTitleExact || (isSubstring && isSameOwner)) {
          duplicates.push({
            candidateTitle: candidate.title,
            existingTaskId: openTask._id.toString(),
            existingTaskTitle: openTask.title,
            existingOwner: openTask.owner,
            existingDeadline: openTask.deadline,
            existingStatus: openTask.status,
            matchReason: isTitleExact ? 'Exact title match with active task' : 'Similar commitment title with same assignee'
          });
          break;
        }
      }
    }

    return duplicates;
  } catch (err) {
    console.error('[Tool:detectDuplicateTasks] Error:', err);
    return [];
  }
}

/**
 * Tool: Record managerial alerts in MongoDB without creating duplicate notifications
 */
export async function recordManagerialAlerts(newAlerts) {
  try {
    const createdAlerts = [];
    for (const alertData of newAlerts) {
      // Check if an unresolved alert for this event already exists
      const query = {
        type: alertData.type,
        isResolved: false
      };
      if (alertData.referenceId) {
        query.referenceId = alertData.referenceId;
      } else {
        query.title = alertData.title;
      }

      const existing = await Alert.findOne(query);
      if (!existing) {
        const alertDoc = await Alert.create(alertData);
        createdAlerts.push(alertDoc);
      } else if (alertData.daysOverdue && alertData.daysOverdue !== existing.daysOverdue) {
        // Update days overdue if changed
        existing.daysOverdue = alertData.daysOverdue;
        existing.message = alertData.message;
        await existing.save();
      }
    }
    return createdAlerts;
  } catch (err) {
    console.error('[Tool:recordManagerialAlerts] Error:', err);
    return [];
  }
}

/**
 * Tool: Save generated follow-up report to MongoDB
 */
export async function saveFollowUpReport(reportData) {
  try {
    const report = await FollowUpReport.create(reportData);
    return report;
  } catch (err) {
    console.error('[Tool:saveFollowUpReport] Error:', err);
    return null;
  }
}
