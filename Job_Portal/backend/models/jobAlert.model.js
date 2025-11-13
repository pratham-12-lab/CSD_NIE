import mongoose from "mongoose";

const jobAlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    keywords: [{
        type: String
    }],
    location: {
        type: String
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Remote', 'Internship']
    },
    minSalary: {
        type: Number
    },
    frequency: {
        type: String,
        enum: ['instant', 'daily', 'weekly'],
        default: 'daily'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const JobAlert = mongoose.model('JobAlert', jobAlertSchema);
