export const sendMessage = async (req, res) => {
    try {
        const { message, userId, userRole, conversationHistory } = req.body;

        const userMessage = message.toLowerCase().trim();
        let reply = '';

        // Job Search Related
        if (userMessage.includes('find job') || userMessage.includes('search job') || userMessage.includes('looking for job')) {
            reply = `🔍 I can help you find jobs! Here's how:

1. Go to the **Jobs** page from the navbar
2. Use filters to narrow down by:
   - Location
   - Salary range
   - Job type (Full-time, Part-time, Remote)
   - Experience level
3. Click on any job to see full details
4. Hit **Apply** to submit your application

You can also **Save Jobs** for later and set up **Job Alerts** for new postings!`;
        }
        
        // Profile Help
        else if (userMessage.includes('profile') || userMessage.includes('complete profile') || userMessage.includes('update profile')) {
            reply = `👤 To complete your profile:

1. Click on your **avatar** in the top-right
2. Select **View Profile**
3. Fill in these sections:
   - 📝 Bio/Summary
   - 🎓 Education details
   - 💼 Work experience
   - 🛠️ Skills
   - 📄 Upload your resume

A complete profile increases your chances of getting hired by **60%**! Make sure to keep it updated.`;
        }
        
        // Application Help
        else if (userMessage.includes('apply') || userMessage.includes('application') || userMessage.includes('how to apply')) {
            reply = `📝 To apply for a job:

1. Browse jobs on the **Jobs** page
2. Click on a job that interests you
3. Review the job description and requirements
4. Click the **Apply** button
5. Your profile and resume will be submitted

**Tips:**
- Tailor your profile for each application
- Check application status in **My Applications**
- Follow up professionally after 1 week`;
        }
        
        // Application Status
        else if (userMessage.includes('status') || userMessage.includes('my application')) {
            reply = `📊 To check your application status:

1. Go to **My Applications** from the navbar
2. You'll see all your submitted applications
3. Status can be:
   - ⏳ **Pending** - Under review
   - ✅ **Shortlisted** - You're selected for next round
   - ❌ **Rejected** - Not selected this time
   - 🎉 **Accepted** - Congratulations!

Keep applying to increase your chances!`;
        }
        
        // Saved Jobs
        else if (userMessage.includes('save') || userMessage.includes('saved job') || userMessage.includes('bookmark')) {
            reply = `💾 Saved Jobs feature:

- Click the **bookmark icon** on any job card to save it
- Access all saved jobs from **Saved Jobs** in the navbar
- Review them later when you're ready to apply
- Remove jobs you're no longer interested in

Pro tip: Save jobs and apply in batches!`;
        }
        
        // Job Alerts
        else if (userMessage.includes('alert') || userMessage.includes('notification')) {
            reply = `🔔 Set up Job Alerts:

1. Go to **Job Alerts** from the navbar
2. Create an alert with your preferences:
   - Keywords (e.g., "Software Developer")
   - Location
   - Salary range
3. Choose notification frequency
4. Get notified when matching jobs are posted!

Never miss an opportunity again! 🎯`;
        }
        
        // Recruiter - Post Job
        else if (userRole === 'recruiter' && (userMessage.includes('post job') || userMessage.includes('create job'))) {
            reply = `💼 To post a new job:

1. Go to **Jobs** in the admin navbar
2. Click **Post New Job** button
3. Fill in job details:
   - Job title and description
   - Requirements and qualifications
   - Salary range
   - Location and job type
   - Number of positions
4. Click **Submit**

Your job will be visible to all candidates immediately!`;
        }
        
        // Recruiter - Manage Applications
        else if (userRole === 'recruiter' && userMessage.includes('application')) {
            reply = `📋 To manage applications:

1. Go to **Jobs** page
2. Click on any job to see applicants
3. Review candidate profiles and resumes
4. Update application status:
   - Shortlist promising candidates
   - Reject unsuitable applications
   - Accept the best candidate

You can also contact candidates directly through the platform.`;
        }
        
        // Recruiter - Company
        else if (userRole === 'recruiter' && userMessage.includes('company')) {
            reply = `🏢 To manage your company:

1. Go to **Companies** in the admin navbar
2. Click **Register New Company**
3. Add company details:
   - Company name and logo
   - Description
   - Website URL
   - Location
4. Save your company profile

A complete company profile attracts better candidates!`;
        }
        
        // Platform Features
        else if (userMessage.includes('feature') || userMessage.includes('what can') || userMessage.includes('help')) {
            if (userRole === 'recruiter') {
                reply = `👋 Hi! As a recruiter, I can help you with:

📋 **Post & Manage Jobs**
🏢 **Create Company Profiles**
👥 **Review Applications**
✅ **Shortlist Candidates**
📧 **Contact Applicants**

What would you like to know more about?`;
            } else {
                reply = `👋 Hi! I can help you with:

🔍 **Finding Jobs** - Search and filter jobs
📝 **Applications** - Apply and track status
👤 **Profile Help** - Complete your profile
💾 **Saved Jobs** - Bookmark interesting jobs
🔔 **Job Alerts** - Get notified of new jobs
📊 **Career Tips** - Improve your chances

What would you like to know?`;
            }
        }
        
        // Resume Help
        else if (userMessage.includes('resume') || userMessage.includes('cv')) {
            reply = `📄 Resume Tips:

1. **Upload your resume** in your profile
2. Keep it **updated** regularly
3. **Tailor it** for each application
4. Include:
   - Contact information
   - Professional summary
   - Work experience
   - Education
   - Skills and certifications

Format: PDF is preferred! Keep it to 1-2 pages.`;
        }
        
        // Skills
        else if (userMessage.includes('skill')) {
            reply = `🛠️ Adding Skills:

1. Go to your **Profile**
2. Click **Edit Profile**
3. Add relevant skills to your field
4. Include both technical and soft skills

**Popular Skills:**
- Programming languages (Python, Java, JavaScript)
- Frameworks (React, Node.js, Spring Boot)
- Tools (Git, Docker, AWS)
- Soft skills (Communication, Leadership)

Add 10-15 relevant skills for best results!`;
        }
        
        // Greetings
        else if (userMessage.includes('hi') || userMessage.includes('hello') || userMessage.includes('hey')) {
            reply = `👋 Hello! Welcome to JobPortal!

I'm your AI assistant here to help you ${userRole === 'recruiter' ? 'find great candidates and manage your job postings' : 'find your dream job'}!

Try asking me:
- "Help me find jobs"
- "How do I complete my profile?"
- "How to apply for a job?"
- "Check application status"

How can I assist you today?`;
        }
        
        // Thank you
        else if (userMessage.includes('thank')) {
            reply = `You're welcome! 😊 Feel free to ask if you need any more help. Good luck with your job ${userRole === 'recruiter' ? 'postings' : 'search'}! 🚀`;
        }
        
        // Default Response
        else {
            reply = `I'm here to help! You can ask me about:

${userRole === 'recruiter' ? `
🏢 Creating company profiles
📋 Posting jobs
👥 Managing applications
✅ Reviewing candidates` : `
🔍 Finding and searching jobs
📝 Applying for positions
👤 Completing your profile
💾 Saving jobs for later
🔔 Setting up job alerts
📊 Checking application status`}

What would you like to know?`;
        }

        res.status(200).json({
            success: true,
            reply: reply
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process message',
            error: error.message
        });
    }
};
