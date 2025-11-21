import express from 'express';
import { analyzeResume } from '../controllers/analytics.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Analyze resume text against a job's requirements
router.post('/analyze', isAuthenticated, analyzeResume);

export default router;
