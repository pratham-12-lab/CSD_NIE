import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import emailService from "../services/emailService.js";

// ✅ APPLY FOR JOB
export const applyJob = async (req, res) => {
  try {
    const userId = req.id; // authenticated user
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required."
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job."
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId).populate('company').populate('created_by');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found."
      });
    }

    // Get candidate details
    const candidate = await User.findById(userId);

    // Create new application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
      status: "pending"
    });

    // Add application to job
    job.applications.push(newApplication._id);
    await job.save();

    // ✅ Send confirmation email to candidate
    if (candidate && candidate.email) {
      await emailService.sendJobApplicationConfirmation(
        candidate.email,
        candidate.fullname,
        job.title,
        job.company.name
      );
    }

    // ✅ Send notification email to employer
    if (job.created_by && job.created_by.email) {
      await emailService.sendNewApplicationNotification(
        job.created_by.email,
        job.created_by.fullname,
        candidate.fullname,
        job.title,
        candidate.email,
        candidate.phoneNumber
      );
    }

    return res.status(201).json({
      success: true,
      message: "Job application submitted successfully! Confirmation email sent."
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET APPLIED JOBS (For students)
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const applications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'job',
        populate: {
          path: 'company'
        }
      });

    if (!applications || applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No applications found."
      });
    }

    return res.status(200).json({
      success: true,
      applications
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET APPLICANTS FOR A JOB (For employers)
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: 'applications',
      options: { sort: { createdAt: -1 } },
      populate: {
        path: 'applicant'
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    return res.status(200).json({
      success: true,
      job
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ UPDATE APPLICATION STATUS (For employers)
export const updateStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    const applicationId = req.params.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Find the application
    const application = await Application.findOne({ _id: applicationId })
      .populate({
        path: 'applicant'
      })
      .populate({
        path: 'job'
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found."
      });
    }

    const normalizedStatus = status.toLowerCase();
    let feedbackMessage = message?.trim() || '';

    if (normalizedStatus === 'rejected' && !feedbackMessage) {
      return res.status(400).json({
        success: false,
        message: 'Rejection feedback is required'
      });
    }

    // Update status and feedback
    application.status = normalizedStatus;
    if (feedbackMessage) {
      application.feedback = feedbackMessage;
    } else if (normalizedStatus !== 'rejected') {
      application.feedback = '';
    }

    await application.save();

    // ✅ Send status update email to candidate
    if (application.applicant && application.applicant.email) {
      await emailService.sendApplicationStatusUpdate(
        application.applicant.email,
        application.applicant.fullname,
        application.job.title,
        normalizedStatus,
        feedbackMessage
      );
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully! Notification sent to candidate."
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
