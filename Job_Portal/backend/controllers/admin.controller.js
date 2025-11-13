import { User } from "../models/user.model.js";
import emailService from "../services/emailService.js";

// GET ALL PENDING EMPLOYERS
export const getPendingEmployers = async (req, res) => {
    try {
        const pendingEmployers = await User.find({
            role: 'recruiter',
            verificationStatus: 'pending'
        }).select('-password').sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            employers: pendingEmployers,
            count: pendingEmployers.length
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching pending employers"
        });
    }
};

// GET ALL EMPLOYERS (with filter)
export const getAllEmployers = async (req, res) => {
    try {
        const { status } = req.query; // pending, approved, rejected, all

        let query = { role: 'recruiter' };
        
        if (status && status !== 'all') {
            query.verificationStatus = status;
        }

        const employers = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            employers,
            count: employers.length
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching employers"
        });
    }
};

// APPROVE EMPLOYER
export const approveEmployer = async (req, res) => {
    try {
        const { employerId } = req.params;

        const employer = await User.findByIdAndUpdate(
            employerId,
            {
                verificationStatus: 'approved',
                isVerified: true,
                rejectionReason: "" // Clear any previous rejection
            },
            { new: true }
        ).select('-password');

        if (!employer) {
            return res.status(404).json({
                success: false,
                message: "Employer not found"
            });
        }

        // ✅ Send approval email
        await emailService.sendEmployerApprovalEmail(
            employer.email,
            employer.fullname,
            'approved'
        );

        return res.status(200).json({
            success: true,
            message: `${employer.fullname} has been approved successfully`,
            employer
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error approving employer"
        });
    }
};

// REJECT EMPLOYER
export const rejectEmployer = async (req, res) => {
    try {
        const { employerId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const employer = await User.findByIdAndUpdate(
            employerId,
            {
                verificationStatus: 'rejected',
                isVerified: false,
                rejectionReason: reason
            },
            { new: true }
        ).select('-password');

        if (!employer) {
            return res.status(404).json({
                success: false,
                message: "Employer not found"
            });
        }

        // ✅ Send rejection email
        await emailService.sendEmployerApprovalEmail(
            employer.email,
            employer.fullname,
            'rejected',
            reason
        );

        return res.status(200).json({
            success: true,
            message: `${employer.fullname} has been rejected`,
            employer
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error rejecting employer"
        });
    }
};

// GET EMPLOYER DETAILS
export const getEmployerDetails = async (req, res) => {
    try {
        const { employerId } = req.params;

        const employer = await User.findById(employerId)
            .select('-password');

        if (!employer) {
            return res.status(404).json({
                success: false,
                message: "Employer not found"
            });
        }

        return res.status(200).json({
            success: true,
            employer
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching employer details"
        });
    }
};
