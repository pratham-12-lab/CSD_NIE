import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import {
    getPendingEmployers,
    getAllEmployers,
    approveEmployer,
    rejectEmployer,
    getEmployerDetails,
    createRecruiter,
    adminLogin
} from "../controllers/admin.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

// ✅ INIT ENDPOINT: Create first admin account (Development Only)
// ⚠️ This should be deleted in production or protected with a secret key
router.route("/init-admin").post(async (req, res) => {
    try {
        // Security: Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin account already exists. This endpoint can only be used once."
            });
        }

        // Check for secret key in production
        const secretKey = process.env.ADMIN_INIT_SECRET;
        if (secretKey && req.headers['x-admin-secret'] !== secretKey) {
            return res.status(403).json({
                success: false,
                message: "Invalid admin initialization secret"
            });
        }

        const { fullname, email, password, phoneNumber } = req.body;

        // Validation
        if (!fullname || !email || !password || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const adminUser = await User.create({
            fullname,
            email,
            password: hashedPassword,
            phoneNumber,
            role: 'admin',
            verificationStatus: 'approved',
            isVerified: true
        });

        return res.status(201).json({
            success: true,
            message: "Admin account created successfully",
            user: {
                id: adminUser._id,
                email: adminUser.email,
                role: adminUser.role
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error creating admin account"
        });
    }
});

// ✅ Get pending employers - Admin only
router.route("/employers/pending").get(isAdmin, getPendingEmployers);

// ✅ Get all employers (with optional status filter) - Admin only
router.route("/employers").get(isAdmin, getAllEmployers);

// ✅ Get employer details - Admin only
router.route("/employers/:employerId").get(isAdmin, getEmployerDetails);

// ✅ Approve employer - Admin only
router.route("/employers/:employerId/approve").post(isAdmin, approveEmployer);

// ✅ Reject employer - Admin only
router.route("/employers/:employerId/reject").post(isAdmin, rejectEmployer);

// ✅ Admin: Create recruiter directly (approved) - Admin only
router.route("/recruiters/create").post(isAdmin, createRecruiter);

// ✅ Admin login (separate endpoint)
router.route("/login").post(adminLogin);

export default router;
