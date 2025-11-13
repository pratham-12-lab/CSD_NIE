import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";

// Import routes
import userRoutes from "./routes/user.route.js";
import companyRoutes from "./routes/company.route.js";
import jobRoutes from "./routes/job.route.js";
import applicationRoutes from "./routes/application.route.js";
import emailRoutes from "./routes/email.route.js";
import adminRoutes from "./routes/admin.route.js";
import savedJobRoutes from "./routes/savedJob.route.js";
import jobAlertRoutes from "./routes/jobAlert.route.js";
import chatbotRoutes from './routes/chatbot.routes.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/job-alerts", jobAlertRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "✅ Job Portal API is running" });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
