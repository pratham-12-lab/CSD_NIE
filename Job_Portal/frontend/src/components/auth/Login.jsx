import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "student",
  });
  
  const [loading, setLoading] = useState(false);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/login`,
        input,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        const userRole = res.data.user.role;
        const verificationStatus = res.data.user.verificationStatus;
        
        toast.success(res.data.message);
        
        setTimeout(() => {
          if (userRole === 'admin') {
            navigate("/admin/dashboard", { replace: true });
          } else if (userRole === 'recruiter') {
            if (verificationStatus === 'pending') {
              navigate("/pending-verification", { replace: true });
            } else {
              navigate("/admin/companies", { replace: true });
            }
          } else {
            navigate("/", { replace: true });
          }
        }, 100);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      <Navbar />
      <div className='flex items-center justify-center max-w-7xl mx-auto min-h-[calc(100vh-4rem)] px-4 py-8'>
        <form 
          onSubmit={submitHandler} 
          className='w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-10 transform transition-all duration-500 hover:shadow-3xl animate-in fade-in slide-in-from-bottom-4'
        >
          <h1 className='font-bold text-3xl mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300'>
            Login
          </h1>
          
          {/* Username/Email Field */}
          <div className='mb-5'>
            <Label htmlFor="email" className="block mb-2 font-medium text-gray-700">
              Username:
            </Label>
            <Input
              id="email"
              type="email"
              value={input.email}
              name="email"
              onChange={changeEventHandler}
              placeholder="Enter your Username"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
              required
            />
          </div>

          {/* Password Field */}
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
          <div className='mb-6'>
            <Label className="block mb-3 font-medium text-gray-700">Login as:</Label>
            <RadioGroup className="flex flex-col gap-3">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="student"
                  id="r1"
                  checked={input.role === 'student'}
                  onChange={changeEventHandler}
                  className="cursor-pointer w-4 h-4"
                />
                <Label htmlFor="r1" className="cursor-pointer text-gray-700">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="recruiter"
                  id="r2"
                  checked={input.role === 'recruiter'}
                  onChange={changeEventHandler}
                  className="cursor-pointer w-4 h-4"
                />
                <Label htmlFor="r2" className="cursor-pointer text-gray-700">Recruiter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="admin"
                  id="r3"
                  checked={input.role === 'admin'}
                  onChange={changeEventHandler}
                  className="cursor-pointer w-4 h-4"
                />
                <Label htmlFor="r3" className="cursor-pointer text-gray-700">Admin</Label>
              </div>
            </RadioGroup>
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

          {/* Signup Link */}
          <p className='text-center text-sm mt-6 text-gray-600'>
            Not registered? <Link to="/signup" className='text-blue-600 hover:underline font-medium'>Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
