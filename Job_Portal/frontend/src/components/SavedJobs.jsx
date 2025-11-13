import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import axios from 'axios';
import { SAVED_JOBS_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bookmark, MapPin, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = async () => {
        try {
            const res = await axios.get(`${SAVED_JOBS_API_END_POINT}/get`, {
                withCredentials: true
            });
            if (res.data.success) {
                setSavedJobs(res.data.savedJobs);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to fetch saved jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (jobId) => {
        try {
            const res = await axios.delete(`${SAVED_JOBS_API_END_POINT}/unsave/${jobId}`, {
                withCredentials: true
            });
            if (res.data.success) {
                toast.success('Job removed from saved');
                // Remove from local state
                setSavedJobs(savedJobs.filter(job => job._id !== jobId));
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to remove saved job');
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className='max-w-7xl mx-auto my-10 px-4'>
                    <p className='text-center'>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto my-10 px-4'>
                <h1 className='font-bold text-3xl mb-8'>
                    <Bookmark className='inline mr-2' />
                    Saved Jobs ({savedJobs.length})
                </h1>

                {savedJobs.length === 0 ? (
                    <div className='text-center py-10'>
                        <Bookmark className='w-20 h-20 mx-auto text-gray-300 mb-4' />
                        <p className='text-gray-500 text-lg'>No saved jobs yet</p>
                        <Button 
                            onClick={() => navigate('/jobs')}
                            className='mt-4'
                        >
                            Browse Jobs
                        </Button>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {savedJobs.map((job) => (
                            <div 
                                key={job._id} 
                                className='bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow'
                            >
                                <div className='flex justify-between items-start mb-4'>
                                    <div>
                                        <h2 className='font-bold text-xl mb-2'>{job?.title}</h2>
                                        <p className='text-gray-600 mb-2'>{job?.company?.name}</p>
                                    </div>
                                    <button
                                        onClick={() => handleUnsave(job._id)}
                                        className='text-red-500 hover:text-red-700'
                                        title='Remove from saved'
                                    >
                                        <Bookmark className='w-6 h-6 fill-current' />
                                    </button>
                                </div>

                                <div className='space-y-2 mb-4'>
                                    <div className='flex items-center text-gray-600 text-sm'>
                                        <MapPin className='w-4 h-4 mr-2' />
                                        {job?.location}
                                    </div>
                                    <div className='flex items-center text-gray-600 text-sm'>
                                        <DollarSign className='w-4 h-4 mr-2' />
                                        {job?.salary} LPA
                                    </div>
                                    <div className='flex items-center text-gray-600 text-sm'>
                                        <Clock className='w-4 h-4 mr-2' />
                                        {job?.jobType}
                                    </div>
                                </div>

                                <div className='flex gap-2 mb-4'>
                                    <Badge className='bg-blue-100 text-blue-800'>
                                        {job?.position} Positions
                                    </Badge>
                                    <Badge className='bg-green-100 text-green-800'>
                                        {job?.experienceLevel} yrs
                                    </Badge>
                                </div>

                                <Button
                                    onClick={() => navigate(`/description/${job._id}`)}
                                    className='w-full'
                                >
                                    View Details
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedJobs;
