import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, DollarSign, Users, Calendar, Briefcase, CheckCircle } from 'lucide-react';

const JobDescription = () => {
    const {singleJob} = useSelector(store => store.job);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    
    // Check if user has an active application (not rejected)
    const hasActiveApplication = singleJob?.applications?.some(
        application => application.applicant === user?._id && application.status !== 'rejected'
    ) || false;
    
    // Check if user has a rejected application
    const hasRejectedApplication = singleJob?.applications?.some(
        application => application.applicant === user?._id && application.status === 'rejected'
    ) || false;
    
    const [isApplied, setIsApplied] = useState(hasActiveApplication || hasRejectedApplication);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {withCredentials:true});
            
            if(res.data.success){
                setIsApplied(true); // Update the local state
                
                // If reapplying, remove old application from display
                let updatedApplications = singleJob.applications.filter(
                    app => !(app.applicant === user?._id && app.status === 'rejected')
                );
                
                const updatedSingleJob = {...singleJob, applications:[...updatedApplications,{applicant:user?._id}]}
                dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
                toast.success(res.data.message);

            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    useEffect(()=>{
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application=>application.applicant === user?._id)) // Ensure the state is in sync with fetched data
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob(); 
    },[jobId,dispatch, user?._id]);

    // Update isApplied state when singleJob or user changes
    useEffect(() => {
        const hasActiveApplication = singleJob?.applications?.some(
            application => application.applicant === user?._id && application.status !== 'rejected'
        ) || false;
        const hasRejectedApplication = singleJob?.applications?.some(
            application => application.applicant === user?._id && application.status === 'rejected'
        ) || false;
        setIsApplied(hasActiveApplication || hasRejectedApplication);
    }, [singleJob, user?._id]);

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
            <div className='max-w-5xl mx-auto px-4 py-8'>
                {/* Back Button */}
                <Button
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft size={20} />
                    Back
                </Button>

                {/* Main Content Card */}
                <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
                    {/* Header Section */}
                    <div className='bg-linear-to-r from-blue-600 to-purple-600 p-8 text-white'>
                        <div className='flex items-start justify-between mb-4'>
                            <div className='flex-1'>
                                <h1 className='text-4xl font-bold mb-3'>{singleJob?.title}</h1>
                                <p className='text-blue-100 text-lg'>{singleJob?.location}</p>
                            </div>
                            <div className='flex flex-col gap-3'>
                                <Button
                                    onClick={hasActiveApplication ? null : applyJobHandler}
                                    disabled={hasActiveApplication}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                        hasActiveApplication
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-white text-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    {hasActiveApplication ? '✓ Already Applied' : hasRejectedApplication ? 'Reapply Now' : 'Apply Now'}
                                </Button>
                                <Button
                                    onClick={() => navigate(`/analytics/${jobId}`)}
                                    className='px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 font-semibold'
                                >
                                    📊 Analyze Resume
                                </Button>
                            </div>
                        </div>

                        {/* Quick Stats Badges */}
                        <div className='flex flex-wrap gap-3'>
                            <Badge className='bg-white bg-opacity-20 text-white text-sm px-3 py-1'>
                                <Briefcase size={14} className='mr-1 inline' />
                                {singleJob?.postion} Positions
                            </Badge>
                            <Badge className='bg-white bg-opacity-20 text-white text-sm px-3 py-1'>
                                <Users size={14} className='mr-1 inline' />
                                {singleJob?.jobType}
                            </Badge>
                            <Badge className='bg-white bg-opacity-20 text-white text-sm px-3 py-1'>
                                <DollarSign size={14} className='mr-1 inline' />
                                ₹{singleJob?.salary} LPA
                            </Badge>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className='p-8'>
                        {/* Job Details Grid */}
                        <div className='grid md:grid-cols-2 gap-8 mb-8'>
                            {/* Left Column */}
                            <div className='space-y-6'>
                                <div className='border-l-4 border-blue-600 pl-4'>
                                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>Role</h3>
                                    <p className='text-xl font-bold text-gray-900 mt-1'>{singleJob?.title}</p>
                                </div>

                                <div className='border-l-4 border-purple-600 pl-4'>
                                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>Location</h3>
                                    <p className='text-xl font-bold text-gray-900 mt-1 flex items-center gap-2'>
                                        <MapPin size={18} className='text-purple-600' />
                                        {singleJob?.location}
                                    </p>
                                </div>

                                <div className='border-l-4 border-green-600 pl-4'>
                                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>Experience Required</h3>
                                    <p className='text-xl font-bold text-gray-900 mt-1'>{singleJob?.experience} Years</p>
                                </div>

                                <div className='border-l-4 border-pink-600 pl-4'>
                                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>Salary</h3>
                                    <p className='text-xl font-bold text-gray-900 mt-1'>₹{singleJob?.salary} LPA</p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className='space-y-6'>
                                <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
                                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>Job Type</h3>
                                    <p className='text-lg font-bold text-blue-700'>{singleJob?.jobType}</p>
                                </div>

                                <div className='bg-purple-50 rounded-lg p-4 border border-purple-200'>
                                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>Positions Available</h3>
                                    <p className='text-lg font-bold text-purple-700'>{singleJob?.postion}</p>
                                </div>

                                <div className='bg-green-50 rounded-lg p-4 border border-green-200'>
                                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1'>
                                        <Users size={14} />
                                        Total Applicants
                                    </h3>
                                    <p className='text-lg font-bold text-green-700'>{singleJob?.applications?.length || 0}</p>
                                </div>

                                <div className='bg-orange-50 rounded-lg p-4 border border-orange-200'>
                                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1'>
                                        <Calendar size={14} />
                                        Posted Date
                                    </h3>
                                    <p className='text-lg font-bold text-orange-700'>{singleJob?.createdAt?.split("T")[0] || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className='border-t-2 border-gray-200 pt-8 mt-8'>
                            <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                <CheckCircle size={28} className='text-blue-600' />
                                Job Description
                            </h2>
                            <p className='text-gray-700 leading-relaxed text-lg bg-gray-50 rounded-lg p-6 border border-gray-200'>
                                {singleJob?.description || 'No description available'}
                            </p>
                        </div>

                        {/* Requirements Section */}
                        {singleJob?.requirements && singleJob?.requirements.length > 0 && (
                            <div className='mt-8 pt-8 border-t-2 border-gray-200'>
                                <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                    <Briefcase size={28} className='text-purple-600' />
                                    Requirements
                                </h2>
                                <ul className='grid md:grid-cols-2 gap-3'>
                                    {singleJob.requirements.map((req, idx) => (
                                        <li key={idx} className='flex items-start gap-3 bg-purple-50 p-4 rounded-lg border border-purple-200'>
                                            <CheckCircle size={20} className='text-purple-600 mt-1 flex-shrink-0' />
                                            <span className='text-gray-700 font-medium'>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Application Status */}
                        {hasActiveApplication && (
                            <div className='mt-8 bg-green-50 border border-green-300 rounded-lg p-6'>
                                <div className='flex items-center gap-3'>
                                    <CheckCircle size={28} className='text-green-600' />
                                    <div>
                                        <h3 className='text-lg font-bold text-green-800'>Application Submitted</h3>
                                        <p className='text-green-700 text-sm'>Your application has been sent to the employer. Good luck!</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobDescription