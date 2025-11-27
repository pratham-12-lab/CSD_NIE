# Analytics Dashboard - Complete Guide

## 📊 Overview

The Analytics Dashboard is a resume analyzer tool that helps job seekers check how well their resume matches job requirements. It provides:

- **Match Score**: Percentage of job requirements covered by your resume
- **Matched Skills**: Skills from your resume that match job requirements
- **Missing Skills**: Skills you lack with learning resources

---

## 🚀 How to Access

### Step 1: Login
1. Go to `/login` page
2. Enter your email and password
3. Select "Student" role
4. Click Submit

### Step 2: Browse Jobs
1. Navigate to `/jobs` page
2. Browse available job listings
3. Click on any job card to view details

### Step 3: Open Analytics Dashboard
1. On the Job Description page, you'll see two buttons:
   - "Apply Now" (to apply for the job)
   - "📊 Analyze Resume" (to analyze your resume)
2. Click the "📊 Analyze Resume" button
3. This takes you to `/analytics/:jobId`

---

## 📝 Using the Resume Analyzer

### Step 1: Paste Your Resume
1. You'll see a textarea where it says "Paste your resume text below"
2. Copy your resume content (must be in plain text format)
3. Paste it into the textarea
4. Minimum 20 characters required

### Step 2: Click Analyze
1. Click the "🔍 Analyze Resume" button
2. Wait for the analysis to complete (usually 1-2 seconds)
3. Results will appear below

### Step 3: Review Results

#### Match Score (0-100%)
- **80%+**: ✅ Great match - Your resume aligns well
- **60-79%**: ⚠️ Fair match - Consider adding more skills
- **Below 60%**: ❌ Needs improvement - Review missing skills

#### Matched Skills ✅
All requirements from your resume that match the job

#### Missing Skills 📚
Skills you don't have with learning resources:
- Direct links to online courses
- Official documentation
- Learning platforms

---

## 🔄 Step-by-Step Example

### Scenario: Applying for a React Developer Position

**Job Requirements:**
- React
- JavaScript
- Node.js
- MongoDB
- REST APIs

**Your Resume Contains:**
- React experience
- JavaScript
- REST API development

**Analysis Results:**
```
Match Score: 60%

✅ Matched (3/5):
- React
- JavaScript  
- REST APIs

📚 Missing (2/5):
- Node.js
  → Links to Node.js learning resources
- MongoDB
  → Links to MongoDB learning resources
```

**Action Items:**
1. Learn Node.js basics
2. Study MongoDB
3. Practice building projects with these technologies
4. Update resume with new skills
5. Come back and analyze again

---

## 💡 Tips for Best Results

### 1. Format Your Resume Properly
- Use plain text format (no special formatting)
- Include all relevant skills and experiences
- Use clear, descriptive language

### 2. Be Specific with Skills
- Instead of "Web Development", use "React, Node.js, MongoDB"
- List technologies you've used
- Include years of experience if relevant

### 3. Match Job Language
- Use the same terminology as the job posting
- If job says "JavaScript", don't write "JS"
- Match capitalization of technology names

### 4. Test Multiple Times
- Try different jobs to see which matches your skills best
- Use feedback to guide your learning
- Track your progress over time

---

## 🔗 Backend API Details

### Endpoint
```
POST /api/analytics/analyze
```

### Requirements
- **Authentication**: Required (JWT token via cookies)
- **Role**: Student/Job Seeker

### Request Body
```json
{
  "jobId": "652a1f8c9e4d0e8f3c2a1b5d",
  "resumeText": "Your resume text here..."
}
```

### Response
```json
{
  "success": true,
  "matched": ["React", "JavaScript"],
  "missing": ["Node.js", "MongoDB"],
  "score": 60,
  "suggestions": [
    {
      "skill": "Node.js",
      "resources": [
        {
          "title": "Node.js Official Guide",
          "url": "https://nodejs.dev/learn"
        }
      ]
    }
  ],
  "jobTitle": "React Developer"
}
```

---

## ⚙️ Technical Architecture

### Frontend Flow
```
JobDescription Page
    ↓ (Click "📊 Analyze Resume")
    ↓
Analytics Dashboard Page (/analytics/:jobId)
    ↓ (Paste resume + Click Analyze)
    ↓
API Call: POST /api/analytics/analyze
    ↓
Backend Analysis
    ↓
Display Results
```

### Backend Flow
```
Request Validation
    ↓ (Check jobId, resumeText)
    ↓
Fetch Job from Database
    ↓
Extract Job Requirements
    ↓
Tokenize & Normalize Text
    ↓
Match Resume Tokens with Requirements
    ↓
Calculate Match Score (percentage)
    ↓
Generate Suggestions with Resources
    ↓
Return Results to Frontend
```

---

## 🛠️ Customization

### Add More Skill Resources
Edit `/backend/controllers/analytics.controller.js`:

```javascript
const SKILL_RESOURCES = {
  javascript: [
    { title: 'MDN JavaScript', url: '...' },
    { title: 'FreeCodeCamp JS', url: '...' }
  ],
  // Add more skills here
  typescript: [
    { title: 'TypeScript Handbook', url: '...' },
  ]
};
```

### Adjust Match Algorithm
In the `analyzeResume` function, modify the matching logic:

```javascript
// Current: Matches if at least 1 token appears
// You can change this to require multiple tokens
// or use more sophisticated NLP
```

---

## 📱 Supported Browsers

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (responsive design)

---

## ❓ FAQ

**Q: Do I need to be logged in?**
A: Yes, authentication is required. Only logged-in students can use the analyzer.

**Q: Can I save my analysis results?**
A: Currently, results are shown live. You can take screenshots or copy the results manually.

**Q: How accurate is the matching?**
A: It performs keyword matching based on job requirements. It's a starting point to identify skill gaps.

**Q: Can recruiters use this?**
A: Currently designed for job seekers. Recruiters have their own dashboard.

**Q: What format should my resume be in?**
A: Plain text format works best. Copy from Word docs, PDFs, or text editors.

---

## 🚨 Troubleshooting

**Issue: "Analysis failed" error**
- Ensure you're logged in
- Paste at least 20 characters
- Check internet connection
- Try a shorter resume text

**Issue: No match score appears**
- Wait for the loading indicator to finish
- Check browser console for errors
- Refresh the page and try again

**Issue: Can't access analytics button**
- Verify you're on a job description page
- Log out and log back in
- Clear browser cache

---

## 📞 Support

For issues or features requests, contact the development team or check the GitHub repository.

---

**Last Updated:** November 21, 2025
**Version:** 1.0
