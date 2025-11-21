import { Job } from "../models/job.model.js";

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
  python: [
    { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' }
  ],
};

const normalize = (text = '') =>
  text
    .toLowerCase()
    .replace(/[\W_]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

// POST /api/analytics/analyze
export const analyzeResume = async (req, res) => {
  try {
    const { jobId } = req.body;
    // Accept resume text in body; frontend can extract text from uploaded file or paste
    const resumeText = req.body.resumeText || '';

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Use job.requirements (array of strings) for matching
    const requirements = Array.isArray(job.requirements) ? job.requirements : [];

    const resumeTokens = normalize(resumeText);

    // For each requirement, check whether its tokens are present in resume tokens
    const matched = [];
    const missing = [];

    requirements.forEach((reqStr) => {
      const reqTokens = normalize(reqStr);
      // Consider a requirement matched if at least one token appears in resume
      const isMatched = reqTokens.some((t) => resumeTokens.includes(t));
      if (isMatched) matched.push(reqStr);
      else missing.push(reqStr);
    });

    const score = requirements.length ? Math.round((matched.length / requirements.length) * 100) : 0;

    // Build suggestions for missing skills using SKILL_RESOURCES lookup by keyword
    const suggestions = missing.map((skill) => {
      const key = normalize(skill)[0] || skill.toLowerCase();
      const resources = SKILL_RESOURCES[key] || [];
      return { skill, resources };
    });

    return res.status(200).json({
      success: true,
      matched,
      missing,
      score,
      suggestions,
      jobTitle: job.title
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { analyzeResume };
