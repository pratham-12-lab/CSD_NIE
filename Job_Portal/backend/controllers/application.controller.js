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
      // Allow reapplication only if the previous application was rejected
      if (existingApplication.status !== 'rejected') {
        return res.status(400).json({
          success: false,
          message: "You have already applied for this job."
        });
      }
      // If rejected, delete the old application and create a new one
      await Application.findByIdAndDelete(existingApplication._id);
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

// ✅ GET APPLICANTS FOR A JOB (For employers) - Only Pending
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: 'applications',
      match: { status: 'pending' }, // ✅ Only fetch pending applications
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
    const { id: applicationId } = req.params;
    const { status, message } = req.body;

    console.log('📝 updateStatus called with:', { applicationId, status, message, messageLength: message ? message.length : 0 });

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Normalize status to lowercase for comparisons
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'rejected' && !message) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required.'
      });
    }

    const update = { status: normalizedStatus };
    if (normalizedStatus === 'rejected') update.rejectionReason = message;
    else update.rejectionReason = '';

    const application = await Application.findByIdAndUpdate(applicationId, update, { new: true })
      .populate('applicant')
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    // ✅ Send status update email to candidate
    if (application.applicant && application.applicant.email) {
      console.log('📧 Sending email with rejection reason:', { message, status: normalizedStatus });
      await emailService.sendApplicationStatusUpdate(
        application.applicant.email,
        application.applicant.fullname,
        application.job.title,
        normalizedStatus,
        normalizedStatus === 'rejected' ? message : ''
      );
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully! Notification sent to candidate.",
      application
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
