import { Alert } from '../models/Alert.js';
import { runMonitoringJob } from '../agents/monitoringAgent.js';

// @desc    Get managerial alerts from Agent 3 monitoring
// @route   GET /api/monitoring/alerts
export const getAlerts = async (req, res, next) => {
  try {
    const { status } = req.query; // 'all', 'resolved', or default unresolved
    const query = {};
    if (status === 'resolved') {
      query.isResolved = true;
    } else if (status !== 'all') {
      query.isResolved = false;
    }

    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    const unresolvedCount = await Alert.countDocuments({ isResolved: false });
    const overdueCount = await Alert.countDocuments({ isResolved: false, type: 'overdue_task' });

    res.status(200).json({
      success: true,
      data: {
        alerts,
        unresolvedCount,
        overdueCount
      }
    });
  } catch (error) {
    console.error('[Monitoring Controller] Error fetching alerts:', error.message);
    next(error);
  }
};

// @desc    Mark an alert as resolved
// @route   POST /api/monitoring/alerts/:id/resolve
export const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndUpdate(
      id,
      { $set: { isResolved: true } },
      { new: true }
    );

    if (!alert) {
      res.status(404);
      throw new Error('Alert not found');
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('[Monitoring Controller] Error resolving alert:', error.message);
    next(error);
  }
};

// @desc    Manually trigger Agent 3 deadline monitoring scan
// @route   POST /api/monitoring/run
export const triggerMonitoringScan = async (req, res, next) => {
  try {
    console.log('[Monitoring Controller] Manually triggering Agent 3 deadline scan...');
    const result = await runMonitoringJob();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Monitoring Controller] Error running monitoring scan:', error.message);
    next(error);
  }
};
