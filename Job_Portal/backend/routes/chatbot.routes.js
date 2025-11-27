import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendMessage as ruleBasedChat } from '../controllers/chatbot.controller.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';
import { User } from '../models/user.model.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Helper function to extract location from message
const extractLocation = (message) => {
  const locationPatterns = [
    /(?:jobs?|positions?|opportunities?|openings?)\s+(?:in|near|at|around)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.|\?)/i,
    /(?:in|near|at|around)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.|\?)/i,
    /(?:show|find|search|get|list)\s+(?:me\s+)?(?:jobs?|positions?)\s+(?:in|near|at|around)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.|\?)/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Check for common city names
  const commonCities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'pune', 'kolkata', 'ahmedabad', 'jaipur', 'surat'];
  const lowerMessage = message.toLowerCase();
  for (const city of commonCities) {
    if (lowerMessage.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  
  return null;
};

// Helper function to fetch jobs by location
const fetchJobsByLocation = async (location, limit = 5) => {
  try {
    const jobs = await Job.find({
      location: { $regex: location, $options: 'i' }
    })
      .populate('company')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return jobs.map(job => ({
      _id: job._id,
      title: job.title || 'No title',
      description: job.description ? (job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description) : 'No description available',
      location: job.location || 'Not specified',
      salary: job.salary || 0,
      jobType: job.jobType || 'Not specified',
      experienceLevel: job.experienceLevel || 0,
      position: job.position || 1,
      company: {
        _id: job.company?._id || null,
        name: job.company?.name || 'Unknown Company',
        logo: job.company?.logo || null
      },
      createdAt: job.createdAt || new Date()
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

const getUserContext = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select('fullname role profile verificationStatus rejectionReason')
      .lean();

    const applications = await Application.find({ applicant: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate({
        path: 'job',
        select: 'title location jobType salary experienceLevel requirements company',
        populate: { path: 'company', select: 'name logo' }
      })
      .lean();

    return { user, applications };
  } catch (error) {
    console.error('Error fetching user context:', error);
    return { user: null, applications: [] };
  }
};

const buildApplicationSummary = (userContext) => {
  const { user, applications } = userContext || {};
  if (!applications || applications.length === 0) {
    return {
      reply: `I couldn't find any applications linked to your account yet. Once you apply for roles, I'll keep track of their status here.`,
      data: []
    };
  }

  const userSkills = (user?.profile?.skills || []).map(skill => skill.toLowerCase());

  const applicationCards = applications.map((app) => {
    const job = app.job || {};
    const companyName = job.company?.name || 'Unknown Company';
    const status = (app.status || 'pending').toLowerCase();
    const jobRequirements = Array.isArray(job.requirements) ? job.requirements : [];
    const missingSkills = jobRequirements
      .map(req => req?.toString?.().trim())
      .filter(Boolean)
      .filter(req => !userSkills.includes(req.toLowerCase()));

    return {
      id: app._id.toString(),
      jobTitle: job.title || 'Unknown Role',
      companyName,
      status,
      feedback: app.feedback || '',
      appliedOn: app.createdAt,
      updatedAt: app.updatedAt,
      suggestedSkills: missingSkills
    };
  });

  let reply = `Here is the latest update on your applications:`;
  applicationCards.forEach((card, index) => {
    reply += `\n${index + 1}. ${card.jobTitle} at ${card.companyName} — Status: ${card.status.toUpperCase()}.`;
    if (card.feedback) {
      reply += ` Feedback from the employer: ${card.feedback}.`;
    } else if (card.status === 'rejected') {
      reply += ` No specific feedback was provided.`;
    }
    if (card.suggestedSkills.length > 0) {
      reply += ` Suggested skills to strengthen: ${card.suggestedSkills.join(', ')}.`;
    }
  });

  reply += `\n\nLet me know if you'd like help improving any of those skills or finding similar roles.`;

  return { reply, data: applicationCards };
};

// Initialize Gemini AI
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini AI initialized successfully');
} else {
  console.log('⚠️  GEMINI_API_KEY not found - Using rule-based chatbot fallback');
}

// GET /api/chatbot/test
router.get('/test', (req, res) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  
  res.json({ 
    success: true, 
    message: isConfigured ? 'Gemini chatbot is configured and ready!' : 'Gemini chatbot is NOT configured',
    configured: isConfigured,
    model: 'gemini-2.0-flash-exp',  // ✅ Updated
    provider: 'Google AI (2025)',
    timestamp: new Date()
  });
});

// Require authentication for personalized chatbot interactions
router.use(isAuthenticated);

// POST /api/chatbot/chat - Main chat endpoint
router.post('/chat', async (req, res) => {
  let message, history, location, jobs;
  let userContext = { user: null, applications: [] };
  let applicationSummary = { reply: '', data: [] };
  
  try {
    // Extract and validate input
    message = req.body?.message;
    history = req.body?.history;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }

    // Gather context for logged-in user
    userContext = await getUserContext(req.id);
    applicationSummary = buildApplicationSummary(userContext);

    const normalizedMessage = message.toLowerCase();
    const applicationKeywords = [
      'application status',
      'my application',
      'status of my application',
      'application update',
      'applied job',
      'application feedback',
      'did i get the job',
      'was i selected',
      'selection status'
    ];
    const askWhyRejected = normalizedMessage.includes('why') && normalizedMessage.includes('reject');
    const isApplicationQuery =
      applicationKeywords.some(keyword => normalizedMessage.includes(keyword)) ||
      (normalizedMessage.includes('application') && normalizedMessage.includes('status')) ||
      askWhyRejected;

    if (isApplicationQuery) {
      return res.status(200).json({
        success: true,
        reply: applicationSummary.reply,
        applications: applicationSummary.data,
        jobs: [],
        location: null,
        timestamp: new Date(),
        mode: 'application-status'
      });
    }

    // Check if user is asking about jobs in a specific location (before AI/fallback)
    location = extractLocation(message);
    jobs = [];
    
    if (location) {
      console.log(`📍 Detected location query: ${location}`);
      try {
        jobs = await fetchJobsByLocation(location, 5);
        console.log(`✅ Found ${jobs.length} jobs in ${location}`);
      } catch (jobError) {
        console.error('Error fetching jobs:', jobError);
        jobs = []; // Continue with empty jobs array
      }
    }

    // Check if Gemini is configured, if not use rule-based fallback
    if (!genAI) {
      console.log('📝 Using rule-based chatbot fallback');
      // Use rule-based chatbot as fallback
      const mockReq = {
        body: {
          message: message,
          userId: req.id,
          userRole: userContext.user?.role || 'user',
          conversationHistory: history,
          userContext
        }
      };
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            if (data.success) {
              let reply = data.reply;
              // Enhance reply with job search results
              if (location) {
                if (jobs.length > 0) {
                  reply += `\n\n✅ I found ${jobs.length} job${jobs.length > 1 ? 's' : ''} in ${location}! Here they are:`;
                } else {
                  reply += `\n\n❌ No jobs found in ${location} at the moment. 😞\n\nTry:\n- Searching in nearby cities\n- Adjusting your filters\n- Checking back later for new postings\n- Using Job Alerts to get notified!`;
                }
              }
              
              return res.status(200).json({
                success: true,
                reply: reply,
                jobs: jobs,
                applications: applicationSummary.data,
                location: location,
                timestamp: new Date(),
                mode: 'rule-based'
              });
            } else {
              return res.status(code).json(data);
            }
          }
        })
      };
      return await ruleBasedChat(mockReq, mockRes);
    }

    // ✅ FIXED: Use the new Gemini 2.5 model (November 2025)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'  // ✅ Latest working model
    });

    // Build chat history properly
    let chatHistory = [];
    if (history && history.length > 0) {
      chatHistory = history
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));
      
      // Ensure first message is from user
      if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
        chatHistory = chatHistory.slice(1);
      }
    }

    // Add system context to first message
    const systemContext = `You are a helpful AI assistant for a Job Portal platform. Help job seekers find jobs, answer application questions, and guide employers on posting jobs. Be professional, friendly, and concise (2-3 sentences unless more detail is needed). Tailor your answers using the provided user context.`;

    const userName = userContext.user?.fullname || 'Unknown user';
    const userRole = userContext.user?.role || 'unknown role';
    const userSkillsList = (userContext.user?.profile?.skills || []).length > 0
      ? userContext.user.profile.skills.join(', ')
      : 'Not provided';
    const applicationsContextText = applicationSummary.data.length > 0
      ? applicationSummary.data.map(app => {
          const feedbackText = app.feedback ? ` | Feedback: ${app.feedback}` : '';
          return `- ${app.jobTitle} at ${app.companyName}: ${app.status.toUpperCase()}${feedbackText}`;
        }).join('\n')
      : 'No applications on record yet.';

    const personalizedContext = `User Profile:
- Name: ${userName}
- Role: ${userRole}
- Skills: ${userSkillsList}

Recent Applications:
${applicationsContextText}`;

    const isFirstMessage = !history || history.length === 0;
    const messageToSend = isFirstMessage
      ? `${systemContext}\n\n${personalizedContext}\n\nUser: ${message}`
      : `${message}\n\n[Context]\n${personalizedContext}`;

    // Start chat session
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    // Send message and get response
    console.log(`📨 User message: ${message.substring(0, 50)}...`);
    const result = await chat.sendMessage(messageToSend);
    let reply = result.response.text();
    
    // Enhance reply with job search results
    if (location) {
      if (jobs.length > 0) {
        reply += `\n\n✅ I found ${jobs.length} job${jobs.length > 1 ? 's' : ''} in ${location}! Here they are:`;
      } else {
        reply += `\n\n❌ No jobs found in ${location} at the moment. 😞\n\nTry:\n- Searching in nearby cities\n- Adjusting your filters\n- Checking back later for new postings\n- Using Job Alerts to get notified!`;
      }
    }
    
    console.log(`🤖 Bot reply: ${reply.substring(0, 50)}...`);

    res.status(200).json({
      success: true,
      reply: reply,
      jobs: jobs, // Include jobs in response
      applications: applicationSummary.data,
      location: location, // Include detected location
      timestamp: new Date(),
      mode: 'ai-powered'
    });

  } catch (error) {
    console.error('❌ Chatbot Error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Ensure variables are initialized if error occurred early
    if (!message) {
      message = req.body?.message || 'Hello';
    }
    if (history === undefined) {
      history = req.body?.history;
    }
    if (location === undefined) {
      location = extractLocation(message);
    }
    if (jobs === undefined) {
      jobs = [];
      // Try to fetch jobs if location was detected
      if (location) {
        try {
          jobs = await fetchJobsByLocation(location, 5);
        } catch (jobError) {
          console.error('Error fetching jobs in fallback:', jobError);
          jobs = [];
        }
      }
    }
    
    // Fallback to rule-based chatbot on any error
    console.log('📝 Falling back to rule-based chatbot due to error');
    try {
      const mockReq = {
        body: {
          message: message,
          userId: req.id,
          userRole: userContext.user?.role || 'user',
          conversationHistory: history,
          userContext
        }
      };
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            if (data.success) {
              let reply = data.reply;
              // Enhance reply with job search results
              if (location) {
                if (jobs && jobs.length > 0) {
                  reply += `\n\n✅ I found ${jobs.length} job${jobs.length > 1 ? 's' : ''} in ${location}! Here they are:`;
                } else {
                  reply += `\n\n❌ No jobs found in ${location} at the moment. 😞\n\nTry:\n- Searching in nearby cities\n- Adjusting your filters\n- Checking back later for new postings\n- Using Job Alerts to get notified!`;
                }
              }
              
              return res.status(200).json({
                success: true,
                reply: reply,
                jobs: jobs || [],
                applications: applicationSummary.data,
                location: location || null,
                timestamp: new Date(),
                mode: 'rule-based-fallback'
              });
            } else {
              return res.status(code).json(data);
            }
          }
        })
      };
      return await ruleBasedChat(mockReq, mockRes);
    } catch (fallbackError) {
      console.error('❌ Fallback chatbot also failed:', fallbackError);
      res.status(500).json({
        success: false,
        message: 'Chatbot service temporarily unavailable. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

export default router;
