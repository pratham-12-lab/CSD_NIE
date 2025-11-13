import express from 'express';
import emailService from '../services/emailService.js';

const router = express.Router();

// Test email endpoint
router.post('/test', async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide to, subject, and message',
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #2c3e50;">Test Email</h2>
          <p>${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #7f8c8d; font-size: 12px;">This is a test email from Job Portal</p>
        </div>
      </div>
    `;

    const result = await emailService.sendEmail(to, subject, html);
    res.json(result);
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Send welcome email
router.post('/welcome', async (req, res) => {
  try {
    const { email, name, userType } = req.body;

    if (!email || !name || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, name, and userType (jobseeker or employer)',
      });
    }

    const result = await emailService.sendWelcomeEmail(email, name, userType);
    res.json(result);
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Send job application confirmation
router.post('/application-confirmation', async (req, res) => {
  try {
    const { candidateEmail, candidateName, jobTitle, companyName } = req.body;

    if (!candidateEmail || !candidateName || !jobTitle || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const result = await emailService.sendJobApplicationConfirmation(
      candidateEmail,
      candidateName,
      jobTitle,
      companyName
    );
    res.json(result);
  } catch (error) {
    console.error('Application confirmation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
