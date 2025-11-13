import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const ADMIN_API = 'http://localhost:8000/api/admin';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const [employers, setEmployers] = useState([]);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only admin can access this page (you can add admin role check)
        if (!user) {
            navigate('/login');
        }
        fetchEmployers();
    }, [filter]);

    const fetchEmployers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${ADMIN_API}/employers?status=${filter}`, {
                withCredentials: true
            });
            if (res.data.success) {
                setEmployers(res.data.employers);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to fetch employers');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (employerId, employerName) => {
        try {
            const res = await axios.post(
                `${ADMIN_API}/employers/${employerId}/approve`,
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(`${employerName} approved successfully!`);
                fetchEmployers(); // Refresh list
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to approve employer');
        }
    };

    const handleReject = async (employerId, employerName) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const res = await axios.post(
                `${ADMIN_API}/employers/${employerId}/reject`,
                { reason },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(`${employerName} rejected`);
                fetchEmployers(); // Refresh list
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to reject employer');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-yellow-400 text-gray-800',
            approved: 'bg-green-400 text-white',
            rejected: 'bg-red-400 text-white'
        };
        return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
    };

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto my-10 px-4'>
                <h1 className='font-bold text-3xl mb-8'>Employer Verification Dashboard</h1>

                {/* Filter Buttons */}
                <div className='flex gap-4 mb-6'>
                    {['pending', 'approved', 'rejected', 'all'].map((status) => (
                        <Button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={filter === status ? 'bg-blue-600' : 'bg-gray-400'}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
                </div>

                {/* Employers Table */}
                {loading ? (
                    <div className='text-center py-10'>Loading...</div>
                ) : employers.length === 0 ? (
                    <div className='text-center py-10 text-gray-500'>
                        No {filter !== 'all' ? filter : ''} employers found
                    </div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
                            <thead className='bg-gray-100'>
                                <tr>
                                    <th className='py-3 px-4 text-left'>Name</th>
                                    <th className='py-3 px-4 text-left'>Email</th>
                                    <th className='py-3 px-4 text-left'>Company</th>
                                    <th className='py-3 px-4 text-left'>Website</th>
                                    <th className='py-3 px-4 text-left'>Status</th>
                                    <th className='py-3 px-4 text-left'>Registered</th>
                                    <th className='py-3 px-4 text-right'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employers.map((employer) => (
                                    <tr key={employer._id} className='border-b hover:bg-gray-50'>
                                        <td className='py-3 px-4'>{employer.fullname}</td>
                                        <td className='py-3 px-4'>{employer.email}</td>
                                        <td className='py-3 px-4'>{employer.companyName || 'N/A'}</td>
                                        <td className='py-3 px-4'>
                                            {employer.companyWebsite ? (
                                                <a
                                                    href={employer.companyWebsite}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-blue-600 hover:underline'
                                                >
                                                    Visit
                                                </a>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td className='py-3 px-4'>
                                            {getStatusBadge(employer.verificationStatus)}
                                        </td>
                                        <td className='py-3 px-4'>
                                            {new Date(employer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className='py-3 px-4 text-right'>
                                            {employer.verificationStatus === 'pending' && (
                                                <div className='flex gap-2 justify-end'>
                                                    <Button
                                                        onClick={() => handleApprove(employer._id, employer.fullname)}
                                                        className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm'
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleReject(employer._id, employer.fullname)}
                                                        className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm'
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
