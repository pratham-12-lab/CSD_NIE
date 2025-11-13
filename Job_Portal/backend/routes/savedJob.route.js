import express from "express";
import {
    saveJob,
    unsaveJob,
    getSavedJobs,
    checkJobSaved
} from "../controllers/savedJob.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/save/:id").post(isAuthenticated, saveJob);
router.route("/unsave/:id").delete(isAuthenticated, unsaveJob);
router.route("/get").get(isAuthenticated, getSavedJobs);
router.route("/check/:id").get(isAuthenticated, checkJobSaved);

export default router;
