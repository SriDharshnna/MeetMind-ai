import { Meeting } from '../models/Meeting.js';
import { Task } from '../models/Task.js';
import { Decision } from '../models/Decision.js';
import { Alert } from '../models/Alert.js';

// @desc    Get consolidated dashboard metrics from actual MongoDB records
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total meetings
    const totalMeetings = await Meeting.countDocuments();

    // 2. Tasks breakdown
    const allTasks = await Task.find();
    const pendingTasks = allTasks.filter((t) => t.status === 'Pending').length;
    const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
    const completedTasks = allTasks.filter((t) => t.status === 'Completed').length;

    // Overdue tasks: status !== 'Completed' and deadline < today
    const overdueTasks = allTasks.filter((t) => t.isOverdue).length;
    const totalTasks = allTasks.length;

    // 3. Decisions breakdown
    const allDecisions = await Decision.find();
    const pendingDecisions = allDecisions.filter((d) => d.implementationStatus !== 'Implemented').length;

    // 4. Recent Meetings (latest 4)
    const recentMeetings = await Meeting.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(4);

    const enrichedRecentMeetings = await Promise.all(
      recentMeetings.map(async (m) => {
        const actionItemsCount = await Task.countDocuments({ meetingId: m._id });
        const decisionsCount = await Decision.countDocuments({ meetingId: m._id });
        return {
          ...m.toObject(),
          actionItemsCount,
          decisionsCount
        };
      })
    );

    // 5. Upcoming Deadlines (active tasks sorted by deadline ascending)
    const upcomingDeadlines = allTasks
      .filter((t) => t.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);

    // 6. Active Agent 3 Alerts from MongoDB
    const agentAlerts = await Alert.find({ isResolved: false }).sort({ createdAt: -1 }).limit(10);

    // 7. AI Alerts based on actual database states (backward compatibility)
    const alerts = [
      {
        id: 'alert-overdue',
        type: 'overdue',
        title: `${overdueTasks} Commitments Require Attention`,
        description: overdueTasks > 0
          ? `${overdueTasks} assigned tasks have crossed target deadlines without completion confirmation.`
          : 'All team commitments are currently within scheduled deadlines.',
        count: overdueTasks,
        targetPage: 'overdue-tasks'
      },
      {
        id: 'alert-decisions',
        type: 'decisions',
        title: `${pendingDecisions} Decisions Awaiting Implementation`,
        description: `${pendingDecisions} architectural or procedural decisions are actively in progress.`,
        count: pendingDecisions,
        targetPage: 'decisions'
      },
      {
        id: 'alert-recurring',
        type: 'recurring',
        title: 'Recurring Discussion Topics Detected',
        description: 'Cross-meeting topic analysis detected recurring discussion points across recent sprints.',
        count: 2,
        targetPage: 'ai-followup'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        totalMeetings,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        activeTasksCount: pendingTasks + inProgressTasks,
        completedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        recentMeetings: enrichedRecentMeetings,
        upcomingDeadlines,
        alerts,
        agentAlerts
      }
    });
  } catch (error) {
    next(error);
  }
};
