import express from "express";
import {
    getPendingEmployers,
    getAllEmployers,
    approveEmployer,
    rejectEmployer,
    getEmployerDetails
} from "../controllers/admin.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Get pending employers
router.route("/employers/pending").get(isAuthenticated, getPendingEmployers);

// Get all employers (with optional status filter)
router.route("/employers").get(isAuthenticated, getAllEmployers);

// Get employer details
router.route("/employers/:employerId").get(isAuthenticated, getEmployerDetails);

// Approve employer
router.route("/employers/:employerId/approve").post(isAuthenticated, approveEmployer);

// Reject employer
router.route("/employers/:employerId/reject").post(isAuthenticated, rejectEmployer);

export default router;
