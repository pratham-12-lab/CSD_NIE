import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import emailService from "../services/emailService.js";

// ✅ REGISTER - With Admin Role & Verification
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role, companyName, companyWebsite } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Validate role
    if (!['student', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be student, recruiter, or admin",
      });
    }

    // ✅ Validate company info for recruiters
    if (role === 'recruiter') {
      if (!companyName) {
        return res.status(400).json({
          success: false,
          message: "Company name is required for employers",
        });
      }
    }

    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const file = req.file;
    let profilePhotoUrl = "";
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      profilePhotoUrl = cloudResponse.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      companyName: role === 'recruiter' ? companyName : undefined,
      companyWebsite: role === 'recruiter' ? companyWebsite : undefined,
      // ✅ Auto-verify Student and Admin, Recruiter needs approval
      isVerified: (role === 'student' || role === 'admin') ? true : false,
      verificationStatus: (role === 'student' || role === 'admin') ? 'approved' : 'pending',
      profile: {
        profilePhoto: profilePhotoUrl,
      },
    });

    // Send welcome email
    const userType = role === 'student' ? 'jobseeker' : role === 'admin' ? 'admin' : 'employer';
    await emailService.sendWelcomeEmail(email, fullname, userType);

    // ✅ Different success messages based on role
    let message;
    if (role === 'recruiter') {
      message = "Registration successful! Your account is pending admin approval.";
    } else if (role === 'admin') {
      message = "Admin account created successfully!";
    } else {
      message = "Registration successful! Welcome email sent to your inbox.";
    }

    return res.status(201).json({
      success: true,
      message,
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
        verificationStatus: newUser.verificationStatus,
        isVerified: newUser.isVerified,
      },
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ✅ LOGIN - With Admin Support & Verification Check
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    if (role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role.",
        success: false,
      });
    }

    // ✅ Check if recruiter is verified (skip for admin and student)
    if (user.role === 'recruiter' && user.verificationStatus !== 'approved') {
      return res.status(403).json({
        message: `Your account is ${user.verificationStatus}. ${
          user.verificationStatus === 'pending'
            ? 'Please wait for admin approval.'
            : 'Your account has been rejected.'
        }`,
        success: false,
        verificationStatus: user.verificationStatus,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// ✅ UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;

    const file = req.file;
    let cloudResponse;
    if (file) {
      const fileUri = getDataUri(file);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content);
    }

    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }

    const userId = req.id;
    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;
    if (cloudResponse) {
      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = file.originalname;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
};
