import React from 'react';
import Navbar from './shared/Navbar';
import { useSelector } from 'react-redux';
import { AlertCircle, Clock, Mail } from 'lucide-react';

const PendingVerification = () => {
    const { user } = useSelector(store => store.auth);

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center min-h-screen px-4'>
                <div className='max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center'>
                    <div className='mb-6'>
                        <Clock className='w-20 h-20 mx-auto text-yellow-500' />
                    </div>
                    
                    <h1 className='text-2xl font-bold text-gray-800 mb-4'>
                        Account Pending Verification
                    </h1>
                    
                    <p className='text-gray-600 mb-6'>
                        Hi <strong>{user?.fullname}</strong>, your employer account is currently under review.
                    </p>
                    
                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
                        <div className='flex items-start gap-3'>
                            <AlertCircle className='w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5' />
                            <div className='text-left text-sm text-yellow-800'>
                                <p className='font-medium mb-2'>What happens next?</p>
                                <ul className='list-disc list-inside space-y-1'>
                                    <li>Our team is reviewing your account details</li>
                                    <li>This typically takes 24-48 hours</li>
                                    <li>You'll receive an email once approved</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                        <div className='flex items-center justify-center gap-2 text-blue-800'>
                            <Mail className='w-5 h-5' />
                            <p className='text-sm'>
                                We'll notify you at <strong>{user?.email}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingVerification;
