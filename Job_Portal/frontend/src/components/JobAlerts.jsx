import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Bell, Trash2, Edit2, Plus, X } from 'lucide-react';

const JOB_ALERT_API = 'http://localhost:8000/api/job-alerts';

const JobAlerts = () => {
    const [jobAlerts, setJobAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        keywords: '',
        location: '',
        jobType: '',
        minSalary: '',
        frequency: 'daily'
    });

    useEffect(() => {
        fetchJobAlerts();
    }, []);

    const fetchJobAlerts = async () => {
        try {
            const res = await axios.get(`${JOB_ALERT_API}/get`, {
                withCredentials: true
            });
            if (res.data.success) {
                setJobAlerts(res.data.jobAlerts);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to fetch job alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${JOB_ALERT_API}/create`, formData, {
                withCredentials: true
            });
            if (res.data.success) {
                toast.success('Job alert created successfully! You\'ll receive emails for matching jobs.');
                fetchJobAlerts();
                setShowForm(false);
                setFormData({
                    keywords: '',
                    location: '',
                    jobType: '',
                    minSalary: '',
                    frequency: 'daily'
                });
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to create job alert');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job alert?')) return;

        try {
            const res = await axios.delete(`${JOB_ALERT_API}/delete/${id}`, {
                withCredentials: true
            });
            if (res.data.success) {
                toast.success('Job alert deleted successfully');
                fetchJobAlerts();
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to delete job alert');
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const res = await axios.put(
                `${JOB_ALERT_API}/update/${id}`,
                { isActive: !currentStatus },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(`Job alert ${!currentStatus ? 'activated' : 'deactivated'}`);
                fetchJobAlerts();
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to update job alert');
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
                <div className='flex justify-between items-center mb-8'>
                    <h1 className='font-bold text-3xl'>
                        <Bell className='inline mr-2' />
                        Job Alerts ({jobAlerts.length})
                    </h1>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? <X className='mr-2' /> : <Plus className='mr-2' />}
                        {showForm ? 'Cancel' : 'Create Alert'}
                    </Button>
                </div>

                {/* Create Alert Form */}
                {showForm && (
                    <div className='bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8'>
                        <h2 className='font-bold text-xl mb-4'>Create New Job Alert</h2>
                        <form onSubmit={handleSubmit}>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='keywords'>Keywords (comma separated)</Label>
                                    <Input
                                        id='keywords'
                                        type='text'
                                        placeholder='e.g., React, Node.js, Frontend'
                                        value={formData.keywords}
                                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                        className='mt-1'
                                    />
                                </div>

                                <div>
                                    <Label htmlFor='location'>Location</Label>
                                    <Input
                                        id='location'
                                        type='text'
                                        placeholder='e.g., Mumbai, Remote'
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className='mt-1'
                                    />
                                </div>

                                <div>
                                    <Label htmlFor='jobType'>Job Type</Label>
                                    <select
                                        id='jobType'
                                        value={formData.jobType}
                                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-md mt-1'
                                    >
                                        <option value=''>Any</option>
                                        <option value='Full-time'>Full-time</option>
                                        <option value='Part-time'>Part-time</option>
                                        <option value='Remote'>Remote</option>
                                        <option value='Internship'>Internship</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor='minSalary'>Minimum Salary (LPA)</Label>
                                    <Input
                                        id='minSalary'
                                        type='number'
                                        placeholder='e.g., 5'
                                        value={formData.minSalary}
                                        onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                                        className='mt-1'
                                    />
                                </div>

                                <div>
                                    <Label htmlFor='frequency'>Email Frequency</Label>
                                    <select
                                        id='frequency'
                                        value={formData.frequency}
                                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-md mt-1'
                                    >
                                        <option value='instant'>Instant</option>
                                        <option value='daily'>Daily</option>
                                        <option value='weekly'>Weekly</option>
                                    </select>
                                </div>
                            </div>

                            <Button type='submit' className='mt-4 w-full md:w-auto'>
                                Create Job Alert
                            </Button>
                        </form>
                    </div>
                )}

                {/* Job Alerts List */}
                {jobAlerts.length === 0 ? (
                    <div className='text-center py-10 bg-white rounded-lg shadow-md'>
                        <Bell className='w-20 h-20 mx-auto text-gray-300 mb-4' />
                        <p className='text-gray-500 text-lg mb-4'>No job alerts yet</p>
                        <p className='text-gray-400 mb-4'>Create your first job alert to receive email notifications</p>
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className='mr-2' />
                            Create Your First Alert
                        </Button>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {jobAlerts.map((alert) => (
                            <div
                                key={alert._id}
                                className={`bg-white p-6 rounded-lg shadow-md border ${
                                    alert.isActive ? 'border-green-200' : 'border-gray-200'
                                }`}
                            >
                                <div className='flex justify-between items-start'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-3 mb-3'>
                                            <h3 className='font-bold text-lg'>
                                                Job Alert #{jobAlerts.indexOf(alert) + 1}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    alert.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {alert.isActive ? '✓ Active' : '○ Inactive'}
                                            </span>
                                        </div>

                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
                                            {alert.keywords.length > 0 && (
                                                <div>
                                                    <span className='font-semibold'>Keywords:</span>{' '}
                                                    <span className='text-gray-600'>
                                                        {alert.keywords.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                            {alert.location && (
                                                <div>
                                                    <span className='font-semibold'>Location:</span>{' '}
                                                    <span className='text-gray-600'>{alert.location}</span>
                                                </div>
                                            )}
                                            {alert.jobType && (
                                                <div>
                                                    <span className='font-semibold'>Job Type:</span>{' '}
                                                    <span className='text-gray-600'>{alert.jobType}</span>
                                                </div>
                                            )}
                                            {alert.minSalary && (
                                                <div>
                                                    <span className='font-semibold'>Min Salary:</span>{' '}
                                                    <span className='text-gray-600'>{alert.minSalary} LPA</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className='font-semibold'>Frequency:</span>{' '}
                                                <span className='text-gray-600 capitalize'>{alert.frequency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex gap-2'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => handleToggleActive(alert._id, alert.isActive)}
                                        >
                                            {alert.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => handleDelete(alert._id)}
                                            className='text-red-600 hover:text-red-700'
                                        >
                                            <Trash2 className='w-4 h-4' />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                <div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6'>
                    <h3 className='font-bold text-lg mb-2'>📧 How Job Alerts Work</h3>
                    <ul className='list-disc list-inside space-y-2 text-gray-700'>
                        <li>You'll receive email notifications when new jobs match your criteria</li>
                        <li>Choose instant, daily, or weekly email frequency</li>
                        <li>You can activate/deactivate alerts anytime</li>
                        <li>Create multiple alerts for different job preferences</li>
                        <li>Manage all your alerts from this page</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default JobAlerts;
