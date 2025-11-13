import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "student",
    companyName: "",
    companyWebsite: "",
    file: null
  });
  
  const [loading, setLoading] = useState(false);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("password", input.password);
    formData.append("role", input.role);
    
    if (input.role === 'recruiter') {
      formData.append("companyName", input.companyName);
      formData.append("companyWebsite", input.companyWebsite);
    }
    
    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      <Navbar />
      <div className='flex items-center justify-center max-w-7xl mx-auto min-h-[calc(100vh-4rem)] px-4 py-10'>
        <form 
          onSubmit={submitHandler} 
          className='w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-10 transform transition-all duration-500 hover:shadow-3xl animate-in fade-in slide-in-from-bottom-4'
        >
          <h1 className='font-bold text-3xl mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300'>
            Sign Up
          </h1>
          
          {/* Full Name */}
          <div className='mb-5'>
            <Label htmlFor="fullname" className="block mb-2 font-medium text-gray-700">
              Full Name:
            </Label>
            <Input
              id="fullname"
              type="text"
              value={input.fullname}
              name="fullname"
              onChange={changeEventHandler}
              placeholder="Enter your Full Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
              required
            />
          </div>
          
          {/* Email */}
          <div className='mb-5'>
            <Label htmlFor="email" className="block mb-2 font-medium text-gray-700">
              Email:
            </Label>
            <Input
              id="email"
              type="email"
              value={input.email}
              name="email"
              onChange={changeEventHandler}
              placeholder="Enter your Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
              required
            />
          </div>
          
          {/* Phone Number */}
          <div className='mb-5'>
            <Label htmlFor="phoneNumber" className="block mb-2 font-medium text-gray-700">
              Phone Number:
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={input.phoneNumber}
              name="phoneNumber"
              onChange={changeEventHandler}
              placeholder="Enter your Phone Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
              required
            />
          </div>
          
          {/* Password */}
          <div className='mb-6'>
            <Label htmlFor="password" className="block mb-2 font-medium text-gray-700">
              Password:
            </Label>
            <Input
              id="password"
              type="password"
              value={input.password}
              name="password"
              onChange={changeEventHandler}
              placeholder="Enter your Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
              required
            />
          </div>
          
          {/* Role Selection */}
          <div className='mb-5'>
            <Label className="block mb-3 font-medium text-gray-700">Select Role:</Label>
            <RadioGroup className="flex flex-col gap-3">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="student"
                  id="student"
                  checked={input.role === 'student'}
                  onChange={changeEventHandler}
                  className="cursor-pointer w-4 h-4"
                />
                <Label htmlFor="student" className="cursor-pointer text-gray-700">Student (Job Seeker)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="recruiter"
                  id="recruiter"
                  checked={input.role === 'recruiter'}
                  onChange={changeEventHandler}
                  className="cursor-pointer w-4 h-4"
                />
                <Label htmlFor="recruiter" className="cursor-pointer text-gray-700">Recruiter (Employer)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="admin"
                  id="admin"
                  checked={input.role === 'admin'}
                  onChange={changeEventHandler}
                  className="cursor-pointer w-4 h-4"
                />
                <Label htmlFor="admin" className="cursor-pointer text-gray-700">Admin</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Company Fields for Recruiters */}
          {input.role === 'recruiter' && (
            <>
              <div className='mb-5'>
                <Label htmlFor="companyName" className="block mb-2 font-medium text-gray-700">
                  Company Name: *
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  value={input.companyName}
                  name="companyName"
                  onChange={changeEventHandler}
                  placeholder="Enter your Company Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                  required
                />
              </div>

              <div className='mb-5'>
                <Label htmlFor="companyWebsite" className="block mb-2 font-medium text-gray-700">
                  Company Website:
                </Label>
                <Input
                  id="companyWebsite"
                  type="url"
                  value={input.companyWebsite}
                  name="companyWebsite"
                  onChange={changeEventHandler}
                  placeholder="https://company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                />
              </div>
            </>
          )}
          
          {/* Profile Photo */}
          <div className='mb-6'>
            <Label htmlFor="file" className="block mb-2 font-medium text-gray-700">
              Profile Photo:
            </Label>
            <Input
              id="file"
              accept="image/*"
              type="file"
              onChange={changeFileHandler}
              className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {input.file && (
              <p className='text-sm text-gray-500 mt-2'>
                Selected: {input.file.name}
              </p>
            )}
          </div>
          
          {/* Submit Button */}
          {
            loading ? 
            <Button 
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md font-medium text-base transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50" 
              disabled
            >
              <Loader2 className='mr-2 h-5 w-5 animate-spin' /> 
              Please wait
            </Button> : 
            <Button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md font-medium text-base transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Submit
            </Button>
          }
          
          {/* Login Link */}
          <p className='text-center text-sm mt-6 text-gray-600'>
            Already have an account? <Link to="/login" className='text-blue-600 hover:underline font-medium'>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
