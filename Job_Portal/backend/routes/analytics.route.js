import express from 'express';
import { analyzeForJob, getRecommendedJobs, analyzeResumeFile } from '../controllers/analytics.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { singleUpload } from '../middlewares/mutler.js';

const router = express.Router();

// Analyze user's skills against a specific job
router.post('/analyze-for-job', isAuthenticated, analyzeForJob);

// Get job recommendations based on user's current skills
router.post('/recommended-jobs', isAuthenticated, getRecommendedJobs);

// Analyze uploaded resume file against a specific job
router.post('/analyze-resume', isAuthenticated, singleUpload, analyzeResumeFile);

export default router;
