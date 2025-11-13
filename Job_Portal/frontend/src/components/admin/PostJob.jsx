import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const companyArray = [];

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        companyId: ""
    });
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company)=> company.name.toLowerCase() === value);
        setInput({...input, companyId:selectedCompany._id});
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, input,{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
            <Navbar />
            <div className='flex items-center justify-center w-screen py-8'>
                <form onSubmit = {submitHandler} className='p-8 max-w-4xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-xl transform transition-all duration-500 hover:shadow-3xl animate-in fade-in slide-in-from-bottom-4'>
                    <h1 className='font-bold text-3xl mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300'>
                        Post New Job
                    </h1>
                    <div className='grid grid-cols-2 gap-6'>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Salary</Label>
                            <Input
                                type="text"
                                name="salary"
                                value={input.salary}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>Experience Level</Label>
                            <Input
                                type="text"
                                name="experience"
                                value={input.experience}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2 block font-medium text-gray-700'>No of Position</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 transition-all duration-300 hover:border-blue-400 focus:ring-blue-500"
                            />
                        </div>
                        {
                            companies.length > 0 && (
                                <div className='mb-4'>
                                    <Label className='mb-2 block font-medium text-gray-700'>Company</Label>
                                    <Select onValueChange={selectChangeHandler}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a Company" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {
                                                    companies.map((company) => {
                                                        return (
                                                            <SelectItem key={company._id} value={company?.name?.toLowerCase()}>{company.name}</SelectItem>
                                                        )
                                                    })
                                                }

                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )
                        }
                    </div> 
                    {
                        loading ? <Button className="w-full my-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">Post New Job</Button>
                    }
                    {
                        companies.length === 0 && <p className='text-xs text-red-600 font-bold text-center my-3'>*Please register a company first, before posting a jobs</p>
                    }
                </form>
            </div>
        </div>
    )
}

export default PostJob