import express from 'express';
import {
  getAlerts,
  resolveAlert,
  triggerMonitoringScan
} from '../controllers/monitoringController.js';

const router = express.Router();

router.get('/alerts', getAlerts);
router.post('/alerts/:id/resolve', resolveAlert);
router.post('/run', triggerMonitoringScan);

export default router;
