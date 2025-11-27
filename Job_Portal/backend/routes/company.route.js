import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isRecruiterVerified from "../middlewares/isRecruiterVerified.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/mutler.js";

const router = express.Router();

// ✅ POST endpoints require recruiter verification (blocks rejected/pending recruiters from writing)
router.route("/register").post(isRecruiterVerified, registerCompany);

// ✅ GET endpoints allow authenticated users (read-only for pending recruiters)
router.route("/get").get(isAuthenticated, getCompany);
router.route("/get/:id").get(isAuthenticated, getCompanyById);

// ✅ PUT endpoints require recruiter verification (blocks rejected/pending recruiters from editing)
router.route("/update/:id").put(isRecruiterVerified, singleUpload, updateCompany);

export default router;
