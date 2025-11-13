import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import useGetCompanyById from '@/hooks/useGetCompanyById'

const CompanySetup = () => {
    const params = useParams();
    useGetCompanyById(params.id);
    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null
    });
    const {singleCompany} = useSelector(store=>store.company);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", input.location);
        if (input.file) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            const res = await axios.put(`${COMPANY_API_END_POINT}/update/${params.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/companies");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setInput({
            name: singleCompany.name || "",
            description: singleCompany.description || "",
            website: singleCompany.website || "",
            location: singleCompany.location || "",
            file: singleCompany.file || null
        })
    },[singleCompany]);

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
            <Navbar />
            <div className='max-w-xl mx-auto py-8'>
                <form onSubmit={submitHandler} className='p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-xl transform transition-all duration-500 hover:shadow-3xl animate-in fade-in slide-in-from-bottom-4'>
                    <div className='flex items-center gap-5 mb-6'>
                        <Button onClick={() => navigate("/admin/companies")} variant="outline" className="flex items-center gap-2 text-gray-500 font-semibold transition-all duration-300 hover:bg-gray-100">
                            <ArrowLeft />
                            <span>Back</span>
                        </Button>
                        <h1 className='font-bold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300'>
                            Company Setup
                        </h1>
                    </div>
                    <div className='grid grid-cols-2 gap-6'>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Company Name</Label>
                            <Input
                                type="text"
                                name="name"
                                value={input.name}
                                onChange={changeEventHandler}
                                className="transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Website</Label>
                            <Input
                                type="text"
                                name="website"
                                value={input.website}
                                onChange={changeEventHandler}
                                className="transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={changeFileHandler}
                            />
                        </div>
                    </div>
                    {
                        loading ? <Button className="w-full my-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">Update</Button>
                    }
                </form>
            </div>

        </div>
    )
}

export default CompanySetup