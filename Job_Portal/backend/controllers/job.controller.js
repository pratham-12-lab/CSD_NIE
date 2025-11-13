import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import emailService from "../services/emailService.js";
import { sendJobAlertEmail } from "./jobAlert.controller.js";

// ✅ CREATE JOB (ADMIN / EMPLOYER) with job alerts
export const postJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      requirements, 
      salary, 
      location, 
      jobType, 
      experience, 
      position, 
      companyId 
    } = req.body;
    const userId = req.id; // authenticated user

    // Validate required fields
    if (!title || !description || !requirements || !salary || !location || 
        !jobType || !experience || !position || !companyId) {
      return res.status(400).json({
        message: "All fields are required.",
        success: false
      });
    }

    // Create job
    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(",").map(req => req.trim()),
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: experience,
      position,
      company: companyId,
      created_by: userId
    });

    // Populate company details
    await job.populate("company");

    // ✅ Send job alerts to matching users (async, don't wait)
    sendJobAlertEmail(job).catch(err => 
      console.error('Job alert email error:', err)
    );

    // ✅ Send confirmation email to employer
    const employer = await User.findById(userId);
    if (employer?.email) {
      emailService.sendJobPostedNotification(
        employer.email,
        employer.fullname,
        title,
        job._id
      ).catch(err => 
        console.error('Employer notification error:', err)
      );
    }

    return res.status(201).json({
      message: "New job created successfully.",
      job,
      success: true
    });
  } catch (error) {
    console.error('Post job error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message
    });
  }
};

// ✅ GET ALL JOBS (For students) - Basic search
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    
    const query = keyword ? {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } }
      ]
    } : {};

    const jobs = await Job.find(query)
      .populate("company")
      .sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No jobs found."
      });
    }

    return res.status(200).json({
      success: true,
      jobs,
      count: jobs.length
    });

  } catch (error) {
    console.error('Get all jobs error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message
    });
  }
};

// ✅ ADVANCED FILTERED JOB SEARCH (with pagination)
export const getFilteredJobs = async (req, res) => {
  try {
    const { 
      keyword, 
      company, 
      location, 
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills, 
      dateFrom, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // ✅ Keyword search (title, description)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    // ✅ Location filter
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // ✅ Job type filter (Full-time, Part-time, etc)
    if (jobType) {
      query.jobType = jobType;
    }

    // ✅ Experience level filter
    if (experienceLevel) {
      query.experienceLevel = { $regex: experienceLevel, $options: "i" };
    }

    // ✅ Salary range filter
    if (salaryMin || salaryMax) {
      query.salary = {};
      if (salaryMin) query.salary.$gte = Number(salaryMin);
      if (salaryMax) query.salary.$lte = Number(salaryMax);
    }

    // ✅ Skills filter (match any skill in comma-separated list)
    if (skills) {
      const skillsArray = skills.split(",").map(s => s.trim());
      query.requirements = { 
        $in: skillsArray.map(skill => new RegExp(skill, 'i'))
      };
    }

    // ✅ Date filter (jobs posted after date)
    if (dateFrom) {
      query.createdAt = { $gte: new Date(dateFrom) };
    }

    // ✅ Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Job.countDocuments(query);

    // ✅ Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // ✅ Execute query with pagination
    const jobs = await Job.find(query)
      .populate("company")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        jobsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Filtered jobs error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch filtered jobs",
      error: error.message
    });
  }
};

// ✅ GET JOB BY ID (Student View)
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    const job = await Job.findById(jobId)
      .populate("company")
      .populate("applications");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found."
      });
    }

    return res.status(200).json({ 
      success: true, 
      job 
    });

  } catch (error) {
    console.error('Get job by ID error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details",
      error: error.message
    });
  }
};

// ✅ GET JOBS CREATED BY ADMIN / EMPLOYER
export const getAdminJobs = async (req, res) => {
  try {
    const userId = req.id;

    const jobs = await Job.find({ created_by: userId })
      .populate("company")
      .sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No jobs found."
      });
    }

    return res.status(200).json({
      success: true,
      jobs,
      count: jobs.length
    });

  } catch (error) {
    console.error('Get admin jobs error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your jobs",
      error: error.message
    });
  }
};
