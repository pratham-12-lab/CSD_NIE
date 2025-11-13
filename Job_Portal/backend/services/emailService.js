import transporter from '../config/emailConfig.js';
import emailTemplates from '../utils/emailTemplates.js';

class EmailService {
  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Job Portal'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email',
      };
    }
  }

  async sendWelcomeEmail(userEmail, userName, userType) {
    const { subject, html } = emailTemplates.welcomeEmail(userName, userType);
    return await this.sendEmail(userEmail, subject, html);
  }

  async sendJobApplicationConfirmation(candidateEmail, candidateName, jobTitle, companyName) {
    const { subject, html } = emailTemplates.jobApplicationConfirmation(
      candidateName,
      jobTitle,
      companyName
    );
    return await this.sendEmail(candidateEmail, subject, html);
  }

  async sendNewApplicationNotification(
    employerEmail,
    employerName,
    candidateName,
    jobTitle,
    candidateEmail,
    candidatePhone
  ) {
    const { subject, html } = emailTemplates.newApplicationNotification(
      employerName,
      candidateName,
      jobTitle,
      candidateEmail,
      candidatePhone
    );
    return await this.sendEmail(employerEmail, subject, html);
  }

  async sendJobPostedNotification(employerEmail, employerName, jobTitle, jobId) {
    const { subject, html } = emailTemplates.jobPostedSuccess(employerName, jobTitle, jobId);
    return await this.sendEmail(employerEmail, subject, html);
  }

  async sendApplicationStatusUpdate(candidateEmail, candidateName, jobTitle, status, message = '') {
    const { subject, html } = emailTemplates.applicationStatusUpdate(
      candidateName,
      jobTitle,
      status,
      message
    );
    return await this.sendEmail(candidateEmail, subject, html);
  }

  async sendBulkEmails(recipients, subject, html) {
    const results = [];
    for (const recipient of recipients) {
      const result = await this.sendEmail(recipient, subject, html);
      results.push({ email: recipient, ...result });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // rate limit
    }
    return results;
  }

  // ✅ Send employer approval/rejection email
  async sendEmployerApprovalEmail(email, name, status, reason = '') {
    const subject =
      status === 'approved'
        ? '✅ Your Employer Account Has Been Approved!'
        : '❌ Employer Account Application Update';

    const html =
      status === 'approved'
        ? `...approved email HTML...` // keep your existing approved HTML
        : `...rejected email HTML with reason...`; // keep your existing rejected HTML

    await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });
  }

  // ✅ NEW: Send job alert email
  async sendJobAlertEmail(email, name, job) {
    const subject = `🚨 New Job Alert: ${job.title}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .job-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .job-title { color: #667eea; font-size: 24px; margin-bottom: 10px; }
          .company-name { color: #666; font-size: 18px; margin-bottom: 15px; }
          .detail-row { display: flex; margin: 10px 0; }
          .detail-label { font-weight: bold; width: 120px; color: #555; }
          .detail-value { color: #333; }
          .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎯 New Job Alert!</h1>
            <p style="margin: 10px 0 0 0;">A new job matching your criteria has been posted</p>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! A new job that matches your alert preferences has been posted:</p>
            <div class="job-card">
              <h2 class="job-title">${job.title}</h2>
              <p class="company-name">${job.company?.name || 'Company Name'}</p>
              <div class="detail-row"><span class="detail-label">📍 Location:</span><span class="detail-value">${job.location}</span></div>
              <div class="detail-row"><span class="detail-label">💼 Job Type:</span><span class="detail-value">${job.jobType}</span></div>
              <div class="detail-row"><span class="detail-label">💰 Salary:</span><span class="detail-value">${job.salary} LPA</span></div>
              <div class="detail-row"><span class="detail-label">📊 Experience:</span><span class="detail-value">${job.experienceLevel} years</span></div>
              <div class="detail-row"><span class="detail-label">👥 Positions:</span><span class="detail-value">${job.position}</span></div>
              <p style="margin-top: 15px;"><strong>Description:</strong></p>
              <p>${job.description}</p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/description/${job._id}" class="button">View Job Details & Apply</a>
              </div>
            </div>
            <p>Don't miss out on this opportunity!</p>
            <p><small>You're receiving this email because you set up a job alert matching these criteria.</small></p>
          </div>
          <div class="footer">
            <p>Manage your job alerts in your <a href="${process.env.FRONTEND_URL}/job-alerts">account settings</a></p>
            <p>&copy; 2025 ${process.env.APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html
    });
  }
}

const emailServiceInstance = new EmailService();
export default emailServiceInstance;
