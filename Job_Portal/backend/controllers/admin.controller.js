import { User } from "../models/user.model.js";
import emailService from "../services/emailService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

// ADMIN: Create recruiter (approved) - Admin-only
export const createRecruiter = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, companyName, companyWebsite } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !companyName) {
            return res.status(400).json({
                success: false,
                message: "All fields are required for recruiter creation"
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "User already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const recruiter = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role: 'recruiter',
            companyName,
            companyWebsite,
            isVerified: true,
            verificationStatus: 'approved'
        });

        // Send welcome email to recruiter
        await emailService.sendWelcomeEmail(email, fullname, 'employer');

        return res.status(201).json({ success: true, message: 'Recruiter created and approved', recruiter: {
            id: recruiter._id,
            fullname: recruiter.fullname,
            email: recruiter.email,
            companyName: recruiter.companyName
        }});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Error creating recruiter' });
    }
};

// ADMIN LOGIN - separate admin login endpoint
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Incorrect email or password' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not an admin account' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        const safeUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role
        };

        return res.status(200).cookie('token', token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({ success: true, message: `Welcome back ${user.fullname}`, user: safeUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Admin login failed' });
    }
};
