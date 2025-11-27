import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({ 
    children, 
    allowedRoles = ['recruiter', 'admin'],
    requireVerified = false 
}) => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        // ✅ Check 1: If no user, redirect to login
        if (!user) {
            navigate("/login", { replace: true });
            return;
        }

        // ✅ Check 2: If user role is not in allowed roles, redirect to home
        if (!allowedRoles.includes(user.role)) {
            toast.error('Unauthorized access');
            navigate("/", { replace: true });
            return;
        }

        // ✅ Check 3: If recruiter is rejected, block access
        if (user.role === 'recruiter' && user.verificationStatus === 'rejected') {
            toast.error('Your account has been rejected. Please contact support.');
            navigate("/", { replace: true });
            return;
        }

        // ✅ Check 4: If verification is required and user is not verified, redirect
        if (requireVerified && user.verificationStatus !== 'approved') {
            if (user.verificationStatus === 'pending') {
                navigate("/pending-verification", { replace: true });
            } else if (user.verificationStatus === 'rejected') {
                toast.error('Your account has been rejected.');
                navigate("/", { replace: true });
            }
            return;
        }

        // ✅ Check 5: Additional admin verification
        if (allowedRoles.includes('admin') && user.role === 'admin') {
            // Verify admin account is legitimate
            if (!user.isVerified) {
                toast.error('Admin account verification required');
                navigate("/login", { replace: true });
                return;
            }
        }

    }, [user, navigate, allowedRoles, requireVerified]);

    // ✅ Don't render children if user is not authenticated
    if (!user) {
        return null;
    }

    // ✅ Don't render if role is not allowed
    if (!allowedRoles.includes(user.role)) {
        return null;
    }

    // ✅ Don't render if recruiter is rejected
    if (user.role === 'recruiter' && user.verificationStatus === 'rejected') {
        return null;
    }

    // ✅ Don't render if verification is required but not approved
    if (requireVerified && user.verificationStatus !== 'approved') {
        return null;
    }

    return (
        <>
            {children}
        </>
    );
};

export default ProtectedRoute;
