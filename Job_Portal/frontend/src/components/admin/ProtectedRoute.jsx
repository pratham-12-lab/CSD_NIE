import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = ['recruiter', 'admin'] }) => {
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
            navigate("/", { replace: true });
            return;
        }
    }, [user, navigate, allowedRoles]);

    // ✅ Don't render children if user is not authenticated
    if (!user) {
        return null;
    }

    // ✅ Don't render if role is not allowed
    if (!allowedRoles.includes(user.role)) {
        return null;
    }

    return (
        <>
            {children}
        </>
    );
};

export default ProtectedRoute;
