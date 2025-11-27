# 🔐 Security Architecture - Visual Guide

## System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         JOB PORTAL SECURITY SYSTEM                       │
└──────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────┐
                    │     USER LOGIN          │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  LAYER 1: UI SECURITY   │ ← Admin option hidden
                    │  (Login.jsx)            │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────────────┐
                    │  LAYER 2: ROUTE SECURITY        │ ← Rejection check
                    │  (Login.jsx routing logic)       │
                    └────────────┬────────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │  LOGIN SUCCESS/FAILURE      │
                    │                             │
                    │  ✅ Rejected user → Home   │
                    │  ✅ Pending user → Verify  │
                    │  ✅ Approved → Dashboard   │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼──────────────────────┐
                    │  LAYER 3: COMPONENT PROTECTION    │ ← Status check
                    │  (ProtectedRoute.jsx)             │
                    └────────────┬──────────────────────┘
                                 │
                    ┌────────────▼────────────────────────┐
                    │  ROUTE ACCESS DECISION              │
                    │                                      │
                    │  Role check ✓                       │
                    │  Status check ✓                     │
                    │  Admin verification ✓               │
                    └────────────┬────────────────────────┘
                                 │
                    ┌────────────▼────────────────────────┐
                    │  API REQUEST INITIATED              │
                    │  (with JWT token in cookie)         │
                    └────────────┬────────────────────────┘
                                 │
                    ┌────────────▼─────────────────────────┐
                    │  LAYER 4: MIDDLEWARE VALIDATION      │
                    │  (isRecruiterVerified / isAdmin)     │
                    │                                       │
                    │  Token validation ✓                  │
                    │  User existence ✓                    │
                    │  Role verification ✓                 │
                    │  Status enforcement ✓                │
                    └────────────┬─────────────────────────┘
                                 │
                    ┌────────────▼──────────────────────────┐
                    │  LAYER 5: DATABASE CHECK             │
                    │  (MongoDB verification_status field)  │
                    │                                        │
                    │  Status: pending/approved/rejected    │
                    │  Role: student/recruiter/admin        │
                    └────────────┬──────────────────────────┘
                                 │
                    ┌────────────▼──────────────────────────┐
                    │  RESOURCE ACCESS GRANTED/DENIED       │
                    │                                        │
                    │  ✅ 200 OK - Resource accessible      │
                    │  ❌ 401 Unauthorized - No token       │
                    │  ❌ 403 Forbidden - Not permitted     │
                    │  ❌ 500 Error - Server error          │
                    └────────────────────────────────────────┘
```

---

## User Role Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      USER REGISTRATION                              │
└────────────────────┬────────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    ┌────────┐              ┌──────────┐
    │Student │              │Recruiter │
    └────┬───┘              └────┬─────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         │              │Status: PENDING   │
         │              │(Awaiting Admin)  │
         │              └────┬─────────────┘
         │                   │
         │                   ├──────────────────┐
         │                   ▼                  ▼
         │            ┌──────────────┐  ┌────────────────┐
         │            │APPROVED      │  │REJECTED        │
         │            │Full access   │  │No access       │
         │            └──────────────┘  └────────────────┘
         │
         ▼
    ┌──────────────┐
    │DASHBOARD     │
    │ACCESS        │
    └──────────────┘
```

---

## Permission Matrix

```
┌──────────────────┬──────────────┬─────────────┬──────────────┐
│ Action           │ Student      │ Recruiter   │ Admin        │
│                  │              │ (Approved)  │              │
├──────────────────┼──────────────┼─────────────┼──────────────┤
│ View jobs        │ ✅ YES       │ ✅ YES      │ ✅ YES       │
│ Apply for job    │ ✅ YES       │ ❌ NO       │ ✅ YES       │
│ View profile     │ ✅ YES       │ ✅ YES      │ ✅ YES       │
│ Edit profile     │ ✅ YES       │ ✅ YES      │ ✅ YES       │
├──────────────────┼──────────────┼─────────────┼──────────────┤
│ Create company   │ ❌ NO        │ ✅ YES      │ ✅ YES       │
│ Edit company     │ ❌ NO        │ ✅ YES      │ ✅ YES       │
│ Post job         │ ❌ NO        │ ✅ YES      │ ✅ YES       │
│ View applications│ ❌ NO        │ ✅ YES      │ ✅ YES       │
├──────────────────┼──────────────┼─────────────┼──────────────┤
│ Admin dashboard  │ ❌ NO        │ ❌ NO       │ ✅ YES       │
│ Approve recruiter│ ❌ NO        │ ❌ NO       │ ✅ YES       │
│ Reject recruiter │ ❌ NO        │ ❌ NO       │ ✅ YES       │
│ View all users   │ ❌ NO        │ ❌ NO       │ ✅ YES       │
└──────────────────┴──────────────┴─────────────┴──────────────┘

✅ = Allowed
❌ = Denied
```

---

## Authentication Token Flow

```
┌────────────────────────────────────────────────────────────────┐
│                     LOGIN PROCESS                              │
└────────────────────┬───────────────────────────────────────────┘
                     │
     ┌───────────────▼────────────────┐
     │ Send credentials (email, pwd)  │
     └───────────────┬────────────────┘
                     │
     ┌───────────────▼──────────────────────┐
     │ Backend validates credentials        │
     │ - Email exists?                      │
     │ - Password matches?                  │
     │ - User role?                         │
     │ - Verification status?               │
     └───────────────┬──────────────────────┘
                     │
     ┌───────────────▼────────────────────┐
     │ ✅ CREATE JWT TOKEN               │
     │ Payload:                           │
     │ {                                  │
     │   userId: "...",                   │
     │   role: "recruiter",               │
     │   iat: 1234567890,                 │
     │   exp: 1234654290                  │
     │ }                                  │
     └───────────────┬────────────────────┘
                     │
     ┌───────────────▼────────────────────┐
     │ ✅ SEND TOKEN IN SECURE COOKIE     │
     │ - Name: "token"                    │
     │ - HttpOnly: true                   │
     │ - Secure: true (HTTPS)             │
     │ - SameSite: Strict                 │
     └───────────────┬────────────────────┘
                     │
     ┌───────────────▼────────────────────┐
     │ ✅ SEND USER DATA                  │
     │ {                                  │
     │   _id: "...",                      │
     │   email: "user@example.com",       │
     │   role: "recruiter",               │
     │   verificationStatus: "approved"   │
     │ }                                  │
     └───────────────┬────────────────────┘
                     │
     ┌───────────────▼────────────────────┐
     │ STORE IN REDUX AUTH SLICE          │
     │ - user object saved                │
     │ - Token in cookie (auto)           │
     │ - Ready for authenticated requests │
     └────────────────────────────────────┘

SUBSEQUENT REQUESTS:
┌────────────────────────────────────────────────────────────────┐
│ Browser automatically sends token cookie with each request     │
│ Middleware verifies token is valid and not expired             │
│ User data from token checked against database                  │
└────────────────────────────────────────────────────────────────┘
```

---

## Rejection Blocking Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  RECRUITER ACCOUNT REJECTED                 │
└────────────────┬──────────────────────────────────────────────┘
                 │
     ┌───────────▼──────────────────┐
     │ Admin Decision               │
     │ Rejects recruiter account    │
     │ verificationStatus = rejected│
     └───────────┬──────────────────┘
                 │
     ┌───────────▼──────────────────┐
     │ REJECTED RECRUITER           │
     │ ATTEMPTS LOGIN               │
     └───────────┬──────────────────┘
                 │
     ┌───────────▼────────────────────────────┐
     │ LAYER 2: LOGIN ROUTING                 │ ← BLOCK HERE
     │ Check verificationStatus               │
     │                                        │
     │ if (status === 'rejected') {           │
     │   setError('Account rejected')         │
     │   navigate('/')                        │
     │   return                               │
     │ }                                      │
     └───────────┬────────────────────────────┘
                 │
     ┌───────────▼──────────────────┐
     │ ❌ LOGIN BLOCKED             │
     │ Error shown to user          │
     │ Redirected to home           │
     └──────────────────────────────┘

IF SOMEHOW TOKEN EXISTS (Manual or cached):
│
└─→ LAYER 3: ProtectedRoute ← BLOCK HERE
    │
    └─→ Check verificationStatus
        │
        └─→ if (status === 'rejected') {
              toast.error('Account rejected')
              navigate('/')
              return
            }
        │
        └─→ ❌ BLOCKED - Component not rendered

IF SOMEHOW REACHES BACKEND API:
│
└─→ LAYER 4: isRecruiterVerified ← BLOCK HERE
    │
    └─→ Check verificationStatus
        │
        └─→ if (status === 'rejected') {
              return 403 {
                message: 'Account rejected'
              }
            }
        │
        └─→ ❌ BLOCKED - 403 Forbidden

IF SOMEHOW IN DATABASE:
│
└─→ LAYER 5: Database ← FINAL CHECK
    │
    └─→ verificationStatus = 'rejected'
        │
        └─→ Cannot perform operations
            with this status
```

---

## Pending Recruiter Limited Access Flow

```
┌────────────────────────────────────────────────────────────────┐
│              NEW RECRUITER ACCOUNT - STATUS: PENDING           │
└────────────┬─────────────────────────────────────────────────────┘
             │
   ┌─────────▼──────────────┐
   │ Recruiter Registration │
   │ Company details filled │
   │ Account created        │
   │ Status: PENDING        │
   └─────────┬──────────────┘
             │
   ┌─────────▼──────────────────────────────────┐
   │ ATTEMPT LOGIN                              │
   │                                            │
   │ ✅ Login succeeds (not rejected)           │
   └─────────┬──────────────────────────────────┘
             │
   ┌─────────▼──────────────────────────────────┐
   │ LAYER 3: ProtectedRoute                    │
   │                                            │
   │ if (requireVerified && status !== 'approved') {
   │   navigate('/pending-verification')
   │   return
   │ }                                          │
   │                                            │
   │ ✅ Redirected to pending verification page│
   └─────────────────────────────────────────────┘

PENDING RECRUITER ATTEMPTING API CALLS:

GET /api/companies/get
├─→ LAYER 4: isRecruiterVerified
├─→ Token valid ✅
├─→ Role = recruiter ✅
├─→ Status = pending ✅
├─→ Method = GET ✅
└─→ REQUEST ALLOWED ✅

POST /api/companies/register
├─→ LAYER 4: isRecruiterVerified
├─→ Token valid ✅
├─→ Role = recruiter ✅
├─→ Status = pending ✅
├─→ Method = POST ❌
├─→ 403 Forbidden
├─→ Message: "Your account is pending. Read-only access."
└─→ REQUEST BLOCKED ❌

PUT /api/companies/update/:id
├─→ LAYER 4: isRecruiterVerified
├─→ Method = PUT ❌
├─→ 403 Forbidden
└─→ REQUEST BLOCKED ❌

DELETE /api/jobs/:id
├─→ LAYER 4: isRecruiterVerified
├─→ Method = DELETE ❌
├─→ 403 Forbidden
└─→ REQUEST BLOCKED ❌

AFTER ADMIN APPROVAL:
┌─────────────────────────────────┐
│ Admin reviews recruiter         │
│ Approves account                │
│ Status: APPROVED                │
├─────────────────────────────────┤
│ POST /api/companies/register    │
│ ✅ 200 OK - Company created     │
│                                 │
│ PUT /api/companies/update/:id   │
│ ✅ 200 OK - Company updated     │
│                                 │
│ POST /api/jobs/post             │
│ ✅ 200 OK - Job posted          │
└─────────────────────────────────┘
```

---

## Admin Access Prevention Flow

```
┌──────────────────────────────────────────────────────────┐
│         SPAM USER ATTEMPTS ADMIN ACCESS                  │
└──────────┬───────────────────────────────────────────────┘
           │
  ┌────────▼────────────┐
  │ LAYER 1: LOGIN      │
  │ Admin option NOT    │
  │ visible in form     │
  │ Only: Student,      │
  │       Recruiter     │
  │                     │
  │ ❌ ATTEMPT BLOCKED  │
  │    AT SOURCE        │
  └─────────────────────┘

IF SOMEHOW GETS ADMIN TOKEN (Manual manipulation):
│
└─→ LAYER 3: ProtectedRoute
    │
    └─→ if (allowedRoles.includes('admin')) {
          if (!user.isVerified) {
            toast.error('Admin verification required')
            navigate('/login')
            return
          }
        }
    │
    └─→ Component not rendered

IF SOMEHOW REACHES BACKEND API:
│
└─→ LAYER 4: isAdmin Middleware
    │
    ├─→ Check 1: Token exists? ❌ → 401
    │
    ├─→ Check 2: Token valid? ❌ → 401
    │
    ├─→ Check 3: User exists? ❌ → 401
    │
    ├─→ Check 4: User.role === 'admin'?
    │   if (role !== 'admin') {
    │     return 403 {
    │       message: 'Only admins can access'
    │     }
    │   }
    │   ❌ → 403 Forbidden
    │
    ├─→ Check 5: Admin verified?
    │   if (!verificationStatus) {
    │     return 403 {
    │       message: 'Admin verification failed'
    │     }
    │   }
    │   ❌ → 403 Forbidden
    │
    └─→ REQUEST BLOCKED ❌

RESULT: NO WAY TO ACCESS ADMIN ENDPOINTS
Multiple layers each independently block access
```

---

## Error Response Codes

```
┌────────────────┬─────────────────────────────────────┐
│ Status Code    │ Meaning & Common Causes             │
├────────────────┼─────────────────────────────────────┤
│ 200 OK         │ Success - Request processed         │
│ ✅ Expected    │ - Valid token                       │
│                │ - Correct role/status               │
│                │ - Permission granted                │
├────────────────┼─────────────────────────────────────┤
│ 401 Unauthorized
│                │ User NOT authenticated              │
│ ❌ Security    │ - No token provided                 │
│                │ - Invalid token                     │
│                │ - Token expired                     │
│                │ - User not found                    │
├────────────────┼─────────────────────────────────────┤
│ 403 Forbidden   │ User authenticated BUT not          │
│                │ authorized                          │
│ ❌ Security    │ - Wrong role (e.g., student)        │
│                │ - Account rejected                  │
│                │ - Account pending (write op)        │
│                │ - Not admin                         │
├────────────────┼─────────────────────────────────────┤
│ 500 Server Error
│                │ Server error occurred               │
│ ❌ Unexpected  │ - Database connection failed        │
│                │ - Middleware error                  │
│                │ - Unexpected exception              │
└────────────────┴─────────────────────────────────────┘

Security Architecture ensures:
- 401: If no authentication provided
- 403: If authentication provided but no authorization
- User sees clear error messages
- System logs unauthorized attempts
```

---

## Security Layers Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                  DEFENSE IN DEPTH - 5 LAYERS                    │
└─────────────────────────────────────────────────────────────────┘

LAYER 1: FRONTEND UI SECURITY
├─ Where: Login.jsx form rendering
├─ What: Admin option removed from selection
├─ How: roleOptions = ['student', 'recruiter']
├─ Blocks: Casual spam attempts at login form
└─ Bypass: Manual token manipulation

LAYER 2: FRONTEND ROUTING SECURITY
├─ Where: Login.jsx post-login routing logic
├─ What: Rejection status check
├─ How: if (verificationStatus === 'rejected') navigate('/')
├─ Blocks: Rejected users from entering app
└─ Bypass: Direct URL navigation

LAYER 3: FRONTEND COMPONENT PROTECTION
├─ Where: ProtectedRoute.jsx wrapper
├─ What: Role + verification status validation
├─ How: Multiple checks before rendering
├─ Blocks: Unauthorized access to components
└─ Bypass: Direct API calls without UI

LAYER 4: BACKEND MIDDLEWARE VALIDATION
├─ Where: isRecruiterVerified / isAdmin middleware
├─ What: Token + role + status verification
├─ How: Middleware validates before controller
├─ Blocks: Invalid requests at entry point
└─ Bypass: Database manipulation

LAYER 5: DATABASE ENFORCEMENT
├─ Where: MongoDB user document
├─ What: verificationStatus & role fields
├─ How: Database stores and validates
├─ Blocks: Invalid state persistence
└─ Bypass: Direct database access (requires hacker)

EACH LAYER INDEPENDENT:
✅ Layer 1 blocks: UI tampering
✅ Layer 2 blocks: Session-based attempts
✅ Layer 3 blocks: Cached session attempts
✅ Layer 4 blocks: Direct API calls
✅ Layer 5 blocks: Data corruption

ATTACKER SUCCESS REQUIRES: Breaking ALL 5 layers
```

---

## Middleware Decision Tree

```
REQUEST ARRIVES AT BACKEND
│
├─→ PUBLIC ROUTE (no middleware)
│  └─→ Allow all requests
│
└─→ PROTECTED ROUTE (middleware applied)
   │
   ├─→ isAuthenticated ONLY
   │  ├─ Token valid? 
   │  ├─ User exists?
   │  └─ Allow any authenticated user (students, recruiters, admins)
   │
   ├─→ isRecruiterVerified
   │  ├─ Token valid?
   │  ├─ User exists?
   │  ├─ Role is recruiter/admin?
   │  ├─ Rejected? → Block with 403
   │  ├─ Pending + Write op? → Block with 403
   │  └─ Otherwise → Allow
   │
   └─→ isAdmin
      ├─ Token valid?
      ├─ User exists?
      ├─ Role is admin?
      ├─ Admin verified?
      └─ If all OK → Allow, else → 403
```

---

## Complete Attack Surface Analysis

```
Attack Vector 1: Select Admin in Login
├─ Status: ❌ PREVENTED
├─ Why: Admin option removed from UI
├─ Defense: Layer 1 - UI Level
└─ Fallback: Layer 2 - Routing Level

Attack Vector 2: Manipulate Local Token
├─ Status: ❌ PREVENTED
├─ Why: Backend validates all tokens
├─ Defense: Layer 4 - Middleware Level
└─ Fallback: Layer 5 - Database Level

Attack Vector 3: Access Rejected User Account
├─ Status: ❌ PREVENTED
├─ Why: Multiple checks on rejection status
├─ Defense: Layers 2, 3, 4 all check status
└─ Fallback: Layer 5 - Database verification

Attack Vector 4: Access /admin endpoints directly
├─ Status: ❌ PREVENTED
├─ Why: isAdmin middleware required
├─ Defense: Layer 4 - All routes protected
└─ Fallback: Layer 5 - Role stored in database

Attack Vector 5: Access recruiter functions while pending
├─ Status: ⚠️ PARTIALLY ALLOWED
├─ Why: Read-only access permitted
├─ Defense: Layer 4 - Middleware checks method
└─ Fallback: Prevents write operations

RESULT: Attack surface effectively eliminated
```

---

*This visual guide provides a clear overview of the security architecture. For detailed implementation, see SECURITY_IMPLEMENTATION.md*
