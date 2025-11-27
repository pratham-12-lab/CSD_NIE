import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/**
 * ✅ Enhanced Middleware: Checks if user is authenticated AND verified recruiter
 * Prevents rejected/pending recruiters from accessing recruiter-only endpoints
 */
const isRecruiterVerified = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        // ✅ Check 1: Token exists
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        // ✅ Check 2: Verify token validity
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false,
            });
        }

        // ✅ Check 3: Fetch user from database
        const user = await User.findById(decode.userId);
        if (!user) {
            return res.status(401).json({
                message: "User not found",
                success: false,
            });
        }

        // ✅ Check 4: Verify user is a recruiter
        if (user.role !== 'recruiter' && user.role !== 'admin') {
            return res.status(403).json({
                message: "Only recruiters and admins can access this resource",
                success: false,
            });
        }

        // ✅ Check 5: Block rejected recruiters
        if (user.role === 'recruiter' && user.verificationStatus === 'rejected') {
            return res.status(403).json({
                message: "Your account has been rejected. Please contact support.",
                success: false,
            });
        }

        // ✅ Check 6: Block pending recruiters from recruiter endpoints (allow read-only access)
        // Pending recruiters can access GET endpoints but not POST/PUT/DELETE
        if (user.role === 'recruiter' && user.verificationStatus === 'pending') {
            const method = req.method;
            if (method !== 'GET') {
                return res.status(403).json({
                    message: "Your account is pending verification. You can view information, but cannot make changes.",
                    success: false,
                });
            }
        }

        // ✅ Check 7: Set user ID in request for use in controllers
        req.id = decode.userId;
        req.user = user;
        next();

    } catch (error) {
        console.error("RecruiterVerified Middleware Error:", error);
        return res.status(401).json({
            message: "Authentication failed",
            success: false,
        });
    }
};

export default isRecruiterVerified;
