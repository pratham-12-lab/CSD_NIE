import { User } from "../models/user.model.js";

export const checkEmployerVerification = async (req, res, next) => {
    try {
        const userId = req.id;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // ✅ Check if employer is verified
        if (user.role === 'recruiter' && user.verificationStatus !== 'approved') {
            const message = user.verificationStatus === 'pending' 
                ? "Your account is pending verification. Please wait for admin approval."
                : "Your account has been rejected. Please contact support.";

            return res.status(403).json({
                success: false,
                message,
                verificationStatus: user.verificationStatus
            });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error checking verification status"
        });
    }
};
