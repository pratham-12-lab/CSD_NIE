import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState();
    const dispatch = useDispatch();
    const registerNewCompany = async () => {
        try {
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, {companyName}, {
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res?.data?.success){
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
            <Navbar />
            <div className='max-w-4xl mx-auto py-8'>
                <div className='bg-white/90 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-xl p-8 transform transition-all duration-500 hover:shadow-3xl animate-in fade-in slide-in-from-bottom-4'>
                    <div className='mb-8'>
                        <h1 className='font-bold text-3xl mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300'>
                            Your Company Name
                        </h1>
                        <p className='text-gray-600 text-lg'>What would you like to give your company name? You can change this later.</p>
                    </div>

                    <div className='mb-6'>
                        <Label className='mb-2 block font-medium text-gray-700 text-lg'>Company Name</Label>
                        <Input
                            type="text"
                            className="transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            placeholder="JobHunt, Microsoft etc."
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>
                    <div className='flex items-center gap-3 mt-8'>
                        <Button 
                            variant="outline" 
                            onClick={() => navigate("/admin/companies")}
                            className='transition-all duration-300 hover:bg-gray-100'
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={registerNewCompany}
                            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyCreate