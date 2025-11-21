import express from "express";
import * as applicationController from "../controllers/application.controller.js";

import { 
  applyJob, 
  getAppliedJobs, 
  getApplicants, 
  updateStatus 
} from "../controllers/application.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/apply/:id").get(isAuthenticated, applyJob);  // ✅ This endpoint
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated, getApplicants);
router.route("/status/:id/update").post(isAuthenticated, updateStatus);
router.patch('/:applicationId/reject', applicationController.updateStatus);

export default router;
