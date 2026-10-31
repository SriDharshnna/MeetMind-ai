import express from 'express';
import { analyzeMeeting } from '../controllers/aiController.js';

const router = express.Router();

router.post('/analyze-meeting', analyzeMeeting);

export default router;
