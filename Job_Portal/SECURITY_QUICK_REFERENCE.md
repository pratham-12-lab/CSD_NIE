# 🔐 Security Quick Reference Guide

## For Developers - Quick Integration Guide

### When Creating New Recruiter Routes

**Use this middleware for write operations (POST, PUT, DELETE):**
```javascript
import isRecruiterVerified from "../middlewares/isRecruiterVerified.js";

// For creating/modifying recruiter resources
router.route("/create").post(isRecruiterVerified, createResource);
router.route("/update/:id").put(isRecruiterVerified, updateResource);
router.route("/delete/:id").delete(isRecruiterVerified, deleteResource);

// For viewing/reading recruiter resources
router.route("/get").get(isAuthenticated, getResources);
```

---

### When Creating New Admin Routes

**Use this middleware for all admin operations:**
```javascript
import isAdmin from "../middlewares/isAdmin.js";

// All admin endpoints require admin role
router.route("/dashboard").get(isAdmin, getAdminDashboard);
router.route("/approve/:id").post(isAdmin, approveUser);
router.route("/reject/:id").post(isAdmin, rejectUser);
router.route("/logs").get(isAdmin, getAccessLogs);
```

---

### When Creating New Protected Frontend Routes

**For recruiter-only dashboard:**
```jsx
import ProtectedRoute from "../components/admin/ProtectedRoute";

<ProtectedRoute allowedRoles={['recruiter']} requireVerified={true}>
    <RecruiterDashboard />
</ProtectedRoute>
```

**For admin-only panel:**
```jsx
<ProtectedRoute allowedRoles={['admin']}>
    <AdminPanel />
</ProtectedRoute>
```

**For student-only features:**
```jsx
<ProtectedRoute allowedRoles={['student']}>
    <StudentDashboard />
</ProtectedRoute>
```

---

## Response Status Codes Reference

### 200 OK ✅
- Request successful
- User authenticated and authorized
- Resource returned

### 401 Unauthorized ❌
- No token provided
- Invalid/expired token
- User not found

**Common Causes:**
- User not logged in
- Session expired
- Token corrupted

### 403 Forbidden ❌
- User authenticated but not authorized
- Insufficient permissions
- Verification status prevents access

**Common Causes:**
- Wrong role (e.g., student trying to post job)
- Account rejected
- Account pending verification
- Trying to perform write operation while pending

### 500 Server Error ❌
- Database error
- Middleware error
- Unexpected server issue

---

## Middleware Comparison Table

| Middleware | Purpose | Checks | Use Case |
|---|---|---|---|
| isAuthenticated | Basic auth | Token valid | Any authenticated endpoint |
| isRecruiterVerified | Recruiter write access | Token + Role + Verified status | Company/job creation/edit |
| isAdmin | Admin access | Token + Admin role + Legitimacy | Admin dashboard/endpoints |
| checkVerification | Job posting | Role + Status | Job posting only |

---

## Common Error Messages & Solutions

### "User not authenticated"
```
Cause: No token or invalid token
Solution: User needs to login
Response: 401 Unauthorized
```

### "Only recruiters and admins can access this resource"
```
Cause: User role is 'student'
Solution: Wrong user type accessing recruiter endpoint
Response: 403 Forbidden
```

### "Your account has been rejected. Please contact support."
```
Cause: User verificationStatus = 'rejected'
Solution: Account was rejected by admin
Response: 403 Forbidden
```

### "Your account is pending verification. You can view information, but cannot make changes."
```
Cause: User verificationStatus = 'pending' + write operation
Solution: Account not yet approved, read-only access
Response: 403 Forbidden
```

### "Only admins can access this resource"
```
Cause: User role is not 'admin'
Solution: Non-admin trying to access admin endpoint
Response: 403 Forbidden
```

### "Admin account verification failed"
```
Cause: Admin user with invalid verification status
Solution: Admin account data corrupted or invalid
Response: 403 Forbidden
```

---

## Testing Checklist

### ✅ Before Deploying

- [ ] Rejected recruiter blocked from login
- [ ] Pending recruiter can view but not create
- [ ] Approved recruiter has full access
- [ ] Non-admin cannot access /admin endpoints
- [ ] Admin can access all admin endpoints
- [ ] Student cannot access recruiter functions
- [ ] Token validation working
- [ ] Database connections healthy
- [ ] Error messages displaying correctly
- [ ] Toast notifications showing for blocked access

### ✅ Security Verification

- [ ] No "Admin" option in login form
- [ ] Admin role cannot be selected via UI
- [ ] Backend validates all security checks
- [ ] Database verification status enforced
- [ ] Multiple layers of security active
- [ ] Error codes correct (401, 403, etc.)

---

## Common Implementation Patterns

### Pattern 1: Protected Recruiter Route
```javascript
import isRecruiterVerified from "../middlewares/isRecruiterVerified.js";

// Create company (recruiter only, must be verified)
router.route("/companies/create")
    .post(isRecruiterVerified, createCompany);

// View companies (any authenticated user, read-only)
router.route("/companies/view")
    .get(isAuthenticated, viewCompanies);
```

### Pattern 2: Protected Admin Route
```javascript
import isAdmin from "../middlewares/isAdmin.js";

// Admin dashboard (admin only)
router.route("/dashboard")
    .get(isAdmin, getAdminDashboard);

// Approve recruiter (admin only)
router.route("/recruiters/:id/approve")
    .post(isAdmin, approveRecruiter);
```

### Pattern 3: Protected Frontend Component
```jsx
import ProtectedRoute from "../components/admin/ProtectedRoute";

export default function RecruiterDashboard() {
    return (
        <ProtectedRoute 
            allowedRoles={['recruiter']}
            requireVerified={true}
        >
            <div>
                {/* Dashboard content */}
            </div>
        </ProtectedRoute>
    );
}
```

---

## Debugging Tips

### Check User Role
```javascript
// In middleware/route
console.log('User role:', user.role); // 'student', 'recruiter', 'admin'
console.log('User status:', user.verificationStatus); // 'pending', 'approved', 'rejected'
```

### Check Token
```javascript
// In middleware
console.log('Token received:', !!token);
console.log('Token decoded:', decode); // Should have userId
```

### Check Request
```javascript
// In controller
console.log('User ID:', req.id);
console.log('User object:', req.user);
console.log('Request method:', req.method); // GET, POST, PUT, DELETE
```

### Verify Middleware Order
```javascript
// Correct order
router.route("/create")
    .post(isRecruiterVerified, singleUpload, createCompany);
    //  ^middleware1        ^middleware2   ^controller

// ❌ Wrong order - upload happens before auth check
router.route("/create")
    .post(singleUpload, isRecruiterVerified, createCompany);
```

---

## Quick Command Reference

### Check All Secure Routes
```bash
# Frontend - search for ProtectedRoute
grep -r "ProtectedRoute" src/

# Backend - search for middleware usage
grep -r "isRecruiterVerified\|isAdmin\|checkVerification" routes/
```

### Test Admin Access
```bash
# Try accessing admin endpoint without token
curl http://localhost:5000/api/admin/employers

# Try with student token
curl -H "Cookie: token=STUDENT_TOKEN" http://localhost:5000/api/admin/employers

# Try with admin token
curl -H "Cookie: token=ADMIN_TOKEN" http://localhost:5000/api/admin/employers
```

### Check Verification Status
```javascript
// In MongoDB
db.users.findOne({email: "recruiter@example.com"}, {verificationStatus: 1})
// Output: { _id: ObjectId(...), verificationStatus: "approved" }
```

---

## Troubleshooting Common Issues

### Issue: 403 Forbidden when user should have access
```
Steps:
1. Check user.verificationStatus in database
2. Check user.role is 'recruiter' or 'admin'
3. Verify token is valid
4. Check middleware order in routes
5. Look at server logs for specific error
```

### Issue: Admin option showing in login form
```
Steps:
1. Check Login.jsx roleOptions array
2. Ensure it's ['student', 'recruiter'] (no 'admin')
3. Clear browser cache
4. Restart frontend dev server
5. Verify no hardcoded role selection
```

### Issue: Rejected user can still login
```
Steps:
1. Check Login.jsx rejection status check
2. Verify verificationStatus field exists in database
3. Check ProtectedRoute is wrapped around routes
4. Verify user data is refreshing after rejection
5. Check Redux auth state is updating
```

### Issue: Pending recruiter can create resources
```
Steps:
1. Check isRecruiterVerified middleware is used
2. Verify verificationStatus check for pending status
3. Ensure POST/PUT routes use isRecruiterVerified
4. Check middleware is before controller
5. Verify method check (GET should work, POST shouldn't)
```

---

## Security Best Practices Checklist

- [ ] Never remove security middleware to "speed things up"
- [ ] Always duplicate frontend checks on backend
- [ ] Always set verification status in database
- [ ] Always validate user role before sensitive operations
- [ ] Always use HTTPS in production
- [ ] Always log security events
- [ ] Always handle errors gracefully
- [ ] Never expose sensitive user data in responses
- [ ] Never trust client-side role claims
- [ ] Always verify token authenticity

---

## Support & Documentation

| Topic | Location | Purpose |
|---|---|---|
| Full Security Guide | SECURITY_IMPLEMENTATION.md | Comprehensive documentation |
| Changes Summary | SECURITY_CHANGES_SUMMARY.md | What changed and why |
| Quick Reference | This file | Quick lookup for developers |
| User Model | backend/models/user.model.js | Database schema |
| Middleware List | backend/middlewares/ | All security middleware |

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2024 | Initial security implementation |

---

**Last Updated:** 2024
**Status:** ✅ Active
**Questions?** Check SECURITY_IMPLEMENTATION.md for detailed information
