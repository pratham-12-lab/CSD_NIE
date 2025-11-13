import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";

// SAVE A JOB
export const saveJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const user = await User.findById(userId);
        
        // Check if job is already saved
        if (user.savedJobs.includes(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Job already saved"
            });
        }

        // Add job to saved jobs
        user.savedJobs.push(jobId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Job saved successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error saving job"
        });
    }
};

// UNSAVE A JOB
export const unsaveJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        const user = await User.findById(userId);
        
        // Check if job is saved
        if (!user.savedJobs.includes(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Job is not saved"
            });
        }

        // Remove job from saved jobs
        user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Job removed from saved"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error removing saved job"
        });
    }
};

// GET ALL SAVED JOBS
export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id;

        const user = await User.findById(userId).populate({
            path: 'savedJobs',
            populate: {
                path: 'company',
                select: 'name location logo'
            }
        });

        return res.status(200).json({
            success: true,
            savedJobs: user.savedJobs
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching saved jobs"
        });
    }
};

// CHECK IF JOB IS SAVED
export const checkJobSaved = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        const user = await User.findById(userId);
        const isSaved = user.savedJobs.includes(jobId);

        return res.status(200).json({
            success: true,
            isSaved
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error checking saved job"
        });
    }
};
