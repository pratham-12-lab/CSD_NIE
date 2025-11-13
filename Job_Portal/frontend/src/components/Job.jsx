import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Bookmark } from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SAVED_JOBS_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const Job = ({ job }) => {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkIfSaved();
    }, [job._id]);

    const checkIfSaved = async () => {
        try {
            const res = await axios.get(`${SAVED_JOBS_API_END_POINT}/check/${job._id}`, {
                withCredentials: true
            });
            if (res.data.success) {
                setIsSaved(res.data.isSaved);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSaveToggle = async () => {
        setLoading(true);
        try {
            if (isSaved) {
                // Unsave the job
                const res = await axios.delete(`${SAVED_JOBS_API_END_POINT}/unsave/${job._id}`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    setIsSaved(false);
                    toast.success('Job removed from saved');
                }
            } else {
                // Save the job
                const res = await axios.post(`${SAVED_JOBS_API_END_POINT}/save/${job._id}`, {}, {
                    withCredentials: true
                });
                if (res.data.success) {
                    setIsSaved(true);
                    toast.success('Job saved successfully');
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to save job');
        } finally {
            setLoading(false);
        }
    };

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    };

    return (
        <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500'>
                    {daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
                </p>
                {/* ✅ Save Button */}
                <button
                    onClick={handleSaveToggle}
                    disabled={loading}
                    className='p-2 rounded-full hover:bg-gray-100 transition-colors'
                    title={isSaved ? 'Remove from saved' : 'Save job'}
                >
                    <Bookmark 
                        className={`w-5 h-5 ${isSaved ? 'fill-current text-blue-600' : 'text-gray-600'}`}
                    />
                </button>
            </div>

            <div className='flex items-center gap-2 my-2'>
                <Button className="p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                    </Avatar>
                </Button>
                <div>
                    <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
                    <p className='text-sm text-gray-500'>India</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='text-sm text-gray-600'>{job?.description}</p>
            </div>

            <div className='flex items-center gap-2 mt-4'>
                <Badge className={'text-blue-700 font-bold'} variant="ghost">
                    {job?.position} Positions
                </Badge>
                <Badge className={'text-[#F83002] font-bold'} variant="ghost">
                    {job?.jobType}
                </Badge>
                <Badge className={'text-[#7209b7] font-bold'} variant="ghost">
                    {job?.salary} LPA
                </Badge>
            </div>

            <div className='flex items-center gap-4 mt-4'>
                <Button 
                    onClick={() => navigate(`/description/${job?._id}`)} 
                    variant="outline"
                >
                    Details
                </Button>
                <Button className="bg-[#7209b7]">
                    Save For Later
                </Button>
            </div>
        </div>
    );
};

export default Job;
