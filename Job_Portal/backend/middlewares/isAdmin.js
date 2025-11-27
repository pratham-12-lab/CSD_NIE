import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/**
 * ✅ Admin-Only Middleware: Checks if user is authenticated AND is a verified admin
 * Prevents any non-admin user from accessing admin endpoints
 * Prevents spam users from accessing admin dashboard
 */
const isAdmin = async (req, res, next) => {
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

        // ✅ Check 4: Verify user is an admin
        if (user.role !== 'admin') {
            return res.status(403).json({
                message: "Only admins can access this resource",
                success: false,
            });
        }

        // ✅ Check 5: Verify admin account is legitimate
        if (!user.verificationStatus || user.verificationStatus === 'rejected') {
            return res.status(403).json({
                message: "Admin account verification failed",
                success: false,
            });
        }

        // ✅ Check 6: Set user ID and user in request for use in controllers
        req.id = decode.userId;
        req.user = user;
        next();

    } catch (error) {
        console.error("Admin Middleware Error:", error);
        return res.status(401).json({
            message: "Authentication failed",
            success: false,
        });
    }
};

export default isAdmin;
