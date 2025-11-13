import { JobAlert } from "../models/jobAlert.model.js";
import { User } from "../models/user.model.js";
import emailService from "../services/emailService.js";

// CREATE JOB ALERT
export const createJobAlert = async (req, res) => {
    try {
        const { keywords, location, jobType, minSalary, frequency } = req.body;
        const userId = req.id;

        const jobAlert = await JobAlert.create({
            user: userId,
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
            location,
            jobType,
            minSalary,
            frequency
        });

        return res.status(201).json({
            success: true,
            message: "Job alert created successfully",
            jobAlert
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error creating job alert"
        });
    }
};

// GET USER'S JOB ALERTS
export const getJobAlerts = async (req, res) => {
    try {
        const userId = req.id;

        const jobAlerts = await JobAlert.find({ user: userId });

        return res.status(200).json({
            success: true,
            jobAlerts
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching job alerts"
        });
    }
};

// UPDATE JOB ALERT
export const updateJobAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const { keywords, location, jobType, minSalary, frequency, isActive } = req.body;

        const jobAlert = await JobAlert.findByIdAndUpdate(
            id,
            {
                keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
                location,
                jobType,
                minSalary,
                frequency,
                isActive
            },
            { new: true }
        );

        if (!jobAlert) {
            return res.status(404).json({
                success: false,
                message: "Job alert not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job alert updated successfully",
            jobAlert
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error updating job alert"
        });
    }
};

// DELETE JOB ALERT
export const deleteJobAlert = async (req, res) => {
    try {
        const { id } = req.params;

        const jobAlert = await JobAlert.findByIdAndDelete(id);

        if (!jobAlert) {
            return res.status(404).json({
                success: false,
                message: "Job alert not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job alert deleted successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error deleting job alert"
        });
    }
};

// ✅ SEND JOB ALERT EMAIL (Complete Function)
export const sendJobAlertEmail = async (job) => {
    try {
        // Find all active job alerts
        const jobAlerts = await JobAlert.find({ isActive: true }).populate('user');

        for (const alert of jobAlerts) {
            let matches = false;

            // Check if job matches alert criteria
            if (alert.keywords.length > 0) {
                const jobText = `${job.title} ${job.description}`.toLowerCase();
                matches = alert.keywords.some(keyword => 
                    jobText.includes(keyword.toLowerCase())
                );
            }

            // Check location match
            if (alert.location && job.location) {
                if (!job.location.toLowerCase().includes(alert.location.toLowerCase())) {
                    matches = false;
                }
            }

            // Check job type match
            if (alert.jobType && job.jobType !== alert.jobType) {
                matches = false;
            }

            // Check minimum salary
            if (alert.minSalary && job.salary < alert.minSalary) {
                matches = false;
            }

            // If job matches, send email
            if (matches) {
                await emailService.sendJobAlertEmail(
                    alert.user.email,
                    alert.user.fullname,
                    job
                );
            }
        }

    } catch (error) {
        console.log('Error sending job alert emails:', error);
    }
};
