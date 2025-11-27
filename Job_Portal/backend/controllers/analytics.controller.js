import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import axios from 'axios';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { extractSkillsFromResume } from "../utils/resumeParser.js";

// Simple static resource suggestions for common skills
const SKILL_RESOURCES = {
  javascript: [
    { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
    { title: 'FreeCodeCamp JS', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' }
  ],
  react: [
    { title: 'React Official Docs', url: 'https://reactjs.org/docs/getting-started.html' },
    { title: 'Scrimba React Course', url: 'https://scrimba.com/learn/learnreact' }
  ],
  node: [
    { title: 'Node.js Guide', url: 'https://nodejs.dev/learn' }
  ],
  nodejs: [
    { title: 'Node.js Guide', url: 'https://nodejs.dev/learn' }
  ],
  python: [
    { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' }
  ],
  sql: [
    { title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/' }
  ],
  mongodb: [
    { title: 'MongoDB University', url: 'https://university.mongodb.com/' }
  ],
  express: [
    { title: 'Express.js Guide', url: 'https://expressjs.com/' }
  ],
};

const normalize = (text = '') =>
  text
    .toLowerCase()
    .replace(/[\W_]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

// Fetch resume URL and extract plain text (supports PDF and DOCX)
const parseResumeFromUrl = async (url) => {
  try {
    if (!url) return '';
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const contentType = (res.headers['content-type'] || '').toLowerCase();
    const buffer = Buffer.from(res.data);

    // PDF
    if (contentType.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
      try {
        const data = await pdfParse(buffer);
        return data?.text || '';
      } catch (e) {
        console.warn('pdf-parse failed:', e.message);
      }
    }

    // DOCX
    if (contentType.includes('officedocument') || url.toLowerCase().endsWith('.docx')) {
      try {
        const { value } = await mammoth.extractRawText({ buffer });
        return value || '';
      } catch (e) {
        console.warn('mammoth failed:', e.message);
      }
    }

    // Plain text or fallback - try to convert buffer to utf8 string
    try {
      return buffer.toString('utf8');
    } catch (e) {
      console.warn('Buffer toString failed:', e.message);
      return '';
    }
  } catch (error) {
    console.error('Failed to fetch/parse resume URL:', error.message);
    return '';
  }
};

// Helper: check if user skill matches a job requirement
const skillMatchesRequirement = (userSkill, requirement) => {
  const userTokens = normalize(userSkill);
  const reqTokens = normalize(requirement);
  return reqTokens.some((t) => userTokens.includes(t));
};

// POST /api/analytics/analyze-for-job
// Analyze user's skills against a specific job
export const analyzeForJob = async (req, res) => {
  try {
    const userId = req.id;
    const { jobId } = req.body;

    console.log('📊 analyzeForJob called with userId:', userId, 'jobId:', jobId);

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }

    const user = await User.findById(userId);
    console.log('👤 User found:', user ? 'Yes' : 'No');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const job = await Job.findById(jobId);
    console.log('💼 Job found:', job ? 'Yes' : 'No');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Determine user skills: prefer profile.skills, but try to parse resume if available
    let userSkills = Array.isArray(user.profile?.skills) ? [...user.profile.skills] : [];

    // If resume URL exists, try to parse and extract skills; merge with profile.skills
    if (user.profile?.resume) {
      try {
        console.log('📄 Attempting to parse resume at URL:', user.profile.resume);
        const resumeText = await parseResumeFromUrl(user.profile.resume);
        if (resumeText && resumeText.length > 30) {
          const parsed = extractSkillsFromResume(resumeText);
          if (parsed && parsed.length > 0) {
            // merge deduplicated
            userSkills = Array.from(new Set([...userSkills, ...parsed]));
            console.log('🔎 Parsed skills from resume:', parsed);
          } else {
            console.log('🔎 No skills parsed from resume text');
          }
        } else {
          console.log('🔎 Resume text empty or too short to parse');
        }
      } catch (e) {
        console.warn('Error parsing resume:', e.message);
      }
    }

    if (!userSkills || userSkills.length === 0) {
      console.log('⚠️  No skills found in profile or parsed from resume.');
    }

    console.log('🎯 User skills (final):', userSkills);
    
    const requirements = Array.isArray(job.requirements) ? job.requirements : [];
    console.log('📋 Job requirements:', requirements);

    const matched = [];
    const missing = [];

    requirements.forEach((reqStr) => {
      const isMatched = userSkills.some((skill) => skillMatchesRequirement(skill, reqStr));
      if (isMatched) matched.push(reqStr);
      else missing.push(reqStr);
    });

    const score = requirements.length ? Math.round((matched.length / requirements.length) * 100) : 0;

    // Build suggestions for missing skills
    const suggestions = missing.map((skill) => {
      const key = normalize(skill)[0] || skill.toLowerCase();
      const resources = SKILL_RESOURCES[key] || [];
      return { skill, resources };
    });

    console.log('✅ Analysis complete - Score:', score);

    return res.status(200).json({
      success: true,
      matched,
      missing,
      score,
      suggestions,
      jobTitle: job.title,
      userSkills
    });
  } catch (error) {
    console.error('❌ Error in analyzeForJob:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/analytics/recommended-jobs
// Get list of jobs recommended based on user's current skills
export const getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.id;

    console.log('📊 getRecommendedJobs called for userId:', userId);

    const user = await User.findById(userId);
    console.log('👤 User found:', user ? 'Yes' : 'No');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Determine user skills: prefer profile.skills, but try to parse resume if available
    let userSkills = Array.isArray(user.profile?.skills) ? [...user.profile.skills] : [];
    if (user.profile?.resume) {
      try {
        console.log('📄 Attempting to parse resume at URL for recommendations:', user.profile.resume);
        const resumeText = await parseResumeFromUrl(user.profile.resume);
        if (resumeText && resumeText.length > 30) {
          const parsed = extractSkillsFromResume(resumeText);
          if (parsed && parsed.length > 0) {
            userSkills = Array.from(new Set([...userSkills, ...parsed]));
            console.log('🔎 Parsed skills from resume for recommendations:', parsed);
          }
        }
      } catch (e) {
        console.warn('Error parsing resume for recommendations:', e.message);
      }
    }

    console.log('🎯 User skills for recommendations (final):', userSkills);

    if (userSkills.length === 0) {
      console.log('⚠️  User has no skills. Cannot generate recommendations.');
      return res.status(200).json({
        success: true,
        ready: [],
        almost: [],
        explore: [],
        other: [],
        userSkills: [],
        message: 'Please add skills to your profile or upload a resume to get job recommendations.'
      });
    }

    // Fetch all jobs and score them based on user skills
    const allJobs = await Job.find().populate('company').populate('created_by');
    console.log('💼 Total jobs found:', allJobs.length);

    const scoredJobs = allJobs.map((job) => {
      const requirements = Array.isArray(job.requirements) ? job.requirements : [];
      let matched = 0;

      requirements.forEach((reqStr) => {
        const isMatched = userSkills.some((skill) => skillMatchesRequirement(skill, reqStr));
        if (isMatched) matched++;
      });

      const score = requirements.length ? Math.round((matched / requirements.length) * 100) : 0;
      return { job, score, matched, total: requirements.length };
    });

    // Sort by score descending and split into categories
    const ready = scoredJobs.filter((s) => s.score === 100).sort((a, b) => b.score - a.score);
    const almost = scoredJobs.filter((s) => s.score >= 70 && s.score < 100).sort((a, b) => b.score - a.score);
    const explore = scoredJobs.filter((s) => s.score >= 50 && s.score < 70).sort((a, b) => b.score - a.score);
    const other = scoredJobs.filter((s) => s.score < 50).sort((a, b) => b.score - a.score);

    console.log('✅ Recommendations ready:', ready.length, 'almost:', almost.length, 'explore:', explore.length, 'other:', other.length);

    return res.status(200).json({
      success: true,
      ready,
      almost,
      explore,
      other,
      userSkills
    });
  } catch (error) {
    console.error('❌ Error in getRecommendedJobs:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/analytics/analyze-resume-file
// Parse uploaded resume file and analyze against a job
export const analyzeResumeFile = async (req, res) => {
  try {
    const userId = req.id;
    const { jobId } = req.body;
    const file = req.file;

    console.log('📄 analyzeResumeFile called - userId:', userId, 'jobId:', jobId, 'fileName:', file?.originalname);

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: 'Resume file is required' });
    }

    // Validate file type
    const fileName = (file.originalname || '').toLowerCase();
    const isPDF = fileName.endsWith('.pdf') || file.mimetype === 'application/pdf';
    const isDOCX = fileName.endsWith('.docx') || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isTXT = fileName.endsWith('.txt') || file.mimetype === 'text/plain';

    if (!isPDF && !isDOCX && !isTXT) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file type. Please upload PDF, DOCX, or TXT files only.' 
      });
    }

    let resumeText = '';

    // Parse based on file type
    if (isPDF) {
      try {
        const data = await pdfParse(file.buffer);
        resumeText = data?.text || '';
      } catch (e) {
        console.warn('PDF parsing failed:', e.message);
        return res.status(400).json({ success: false, message: 'Failed to parse PDF file' });
      }
    } else if (isDOCX) {
      try {
        const { value } = await mammoth.extractRawText({ buffer: file.buffer });
        resumeText = value || '';
      } catch (e) {
        console.warn('DOCX parsing failed:', e.message);
        return res.status(400).json({ success: false, message: 'Failed to parse DOCX file' });
      }
    } else if (isTXT) {
      resumeText = file.buffer.toString('utf8');
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Resume file is empty or could not be read' });
    }

    console.log('📊 Resume text extracted, length:', resumeText.length);

    // Extract skills from resume
    const extractedSkills = extractSkillsFromResume(resumeText);
    console.log('🔍 Skills extracted:', extractedSkills);

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const requirements = Array.isArray(job.requirements) ? job.requirements : [];
    console.log('📋 Job requirements:', requirements);

    // Match skills
    const matched = [];
    const missing = [];

    requirements.forEach((reqStr) => {
      const isMatched = extractedSkills.some((skill) => skillMatchesRequirement(skill, reqStr));
      if (isMatched) matched.push(reqStr);
      else missing.push(reqStr);
    });

    const score = requirements.length ? Math.round((matched.length / requirements.length) * 100) : 0;

    // Build suggestions for missing skills
    const suggestions = missing.map((skill) => {
      const key = normalize(skill)[0] || skill.toLowerCase();
      const resources = SKILL_RESOURCES[key] || [];
      return { skill, resources };
    });

    console.log('✅ Resume analysis complete - Score:', score, 'Matched:', matched.length, 'Missing:', missing.length);

    return res.status(200).json({
      success: true,
      matched,
      missing,
      score,
      suggestions,
      jobTitle: job.title,
      extractedSkills,
      resumeFileName: file.originalname,
      message: `Resume analyzed successfully! You have ${score}% match for ${job.title}`
    });

  } catch (error) {
    console.error('❌ Error in analyzeResumeFile:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { analyzeForJob, getRecommendedJobs, analyzeResumeFile };
