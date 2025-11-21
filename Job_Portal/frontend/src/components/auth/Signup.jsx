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
import { validateField, getPasswordStrength } from '@/utils/validation';

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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
    
    // Validate field on change
    if (touched[name]) {
      const validation = validateField(name, value);
      setErrors({
        ...errors,
        [name]: validation.isValid ? '' : validation.message
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    if (value) {
      const validation = validateField(name, value);
      setErrors({
        ...errors,
        [name]: validation.isValid ? '' : validation.message
      });
    }
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields before submit
    const fieldsToValidate = ['fullname', 'email', 'phoneNumber', 'password'];
    
    // Only validate company name for recruiters
    if (input.role === 'recruiter') {
      fieldsToValidate.push('companyName');
    }

    const newErrors = {};

    fieldsToValidate.forEach(fieldName => {
      if (!input[fieldName] || !input[fieldName].trim()) {
        newErrors[fieldName] = 'This field is required';
      } else {
        const validation = validateField(fieldName, input[fieldName].trim());
        if (!validation.isValid) {
          newErrors[fieldName] = validation.message;
        }
      }
    });

    // Skip company website validation if role is not recruiter
    if (input.role === 'recruiter' && input.companyWebsite && input.companyWebsite.trim()) {
      const validation = validateField('companyWebsite', input.companyWebsite.trim());
      if (!validation.isValid) {
        newErrors['companyWebsite'] = validation.message;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix all validation errors');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname.trim());
    formData.append("email", input.email.trim());
    formData.append("phoneNumber", input.phoneNumber.trim());
    formData.append("password", input.password);
    formData.append("role", input.role);
    
    if (input.role === 'recruiter') {
      formData.append("companyName", input.companyName.trim());
      if (input.companyWebsite && input.companyWebsite.trim()) {
        formData.append("companyWebsite", input.companyWebsite.trim());
      }
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

  const passwordStrength = input.password ? getPasswordStrength(input.password) : null;

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
              Full Name: <span className='text-red-500'>*</span>
            </Label>
            <Input
              id="fullname"
              type="text"
              value={input.fullname}
              name="fullname"
              onChange={changeEventHandler}
              onBlur={handleBlur}
              placeholder="Enter your Full Name"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                errors.fullname && touched.fullname
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500 hover:border-blue-400'
              }`}
            />
            {errors.fullname && touched.fullname && (
              <p className='text-red-500 text-sm mt-1'>✗ {errors.fullname}</p>
            )}
            <p className='text-gray-500 text-xs mt-1'>Letters only, 2-50 characters</p>
          </div>
          
          {/* Email */}
          <div className='mb-5'>
            <Label htmlFor="email" className="block mb-2 font-medium text-gray-700">
              Email: <span className='text-red-500'>*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={input.email}
              name="email"
              onChange={changeEventHandler}
              onBlur={handleBlur}
              placeholder="Enter your Email"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                errors.email && touched.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500 hover:border-blue-400'
              }`}
            />
            {errors.email && touched.email && (
              <p className='text-red-500 text-sm mt-1'>✗ {errors.email}</p>
            )}
          </div>
          
          {/* Phone Number */}
          <div className='mb-5'>
            <Label htmlFor="phoneNumber" className="block mb-2 font-medium text-gray-700">
              Phone Number: <span className='text-red-500'>*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={input.phoneNumber}
              name="phoneNumber"
              onChange={changeEventHandler}
              onBlur={handleBlur}
              placeholder="Enter your 10-digit phone number"
              maxLength="10"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                errors.phoneNumber && touched.phoneNumber
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500 hover:border-blue-400'
              }`}
            />
            {errors.phoneNumber && touched.phoneNumber && (
              <p className='text-red-500 text-sm mt-1'>✗ {errors.phoneNumber}</p>
            )}
            <p className='text-gray-500 text-xs mt-1'>Must be exactly 10 digits</p>
          </div>
          
          {/* Password */}
          <div className='mb-6'>
            <Label htmlFor="password" className="block mb-2 font-medium text-gray-700">
              Password: <span className='text-red-500'>*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={input.password}
                name="password"
                onChange={changeEventHandler}
                onBlur={handleBlur}
                placeholder="Enter your Password"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 pr-10 ${
                  errors.password && touched.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500 hover:border-blue-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className='text-red-500 text-sm mt-1'>✗ {errors.password}</p>
            )}
            {passwordStrength && (
              <div className='mt-2'>
                <div className='flex items-center justify-between mb-1'>
                  <p className='text-xs text-gray-600'>Password Strength:</p>
                  <p className={`text-xs font-semibold ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </p>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score < 2
                        ? 'w-1/5 bg-red-500'
                        : passwordStrength.score < 4
                        ? 'w-3/5 bg-yellow-500'
                        : 'w-full bg-green-500'
                    }`}
                  ></div>
                </div>
              </div>
            )}
            <p className='text-gray-500 text-xs mt-2'>
              ✓ At least 8 characters<br/>
              ✓ 1 uppercase letter (A-Z)<br/>
              ✓ 1 lowercase letter (a-z)<br/>
              ✓ 1 number (0-9)<br/>
              ✓ 1 special character (@$!%*?&)
            </p>
          </div>
          
          {/* Role Selection */}
          <div className='mb-5'>
            <Label className="block mb-3 font-medium text-gray-700">Select Role: <span className='text-red-500'>*</span></Label>
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
                  Company Name: <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  value={input.companyName}
                  name="companyName"
                  onChange={changeEventHandler}
                  onBlur={handleBlur}
                  placeholder="Enter your Company Name"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    errors.companyName && touched.companyName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 hover:border-blue-400'
                  }`}
                />
                {errors.companyName && touched.companyName && (
                  <p className='text-red-500 text-sm mt-1'>✗ {errors.companyName}</p>
                )}
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
                  onBlur={handleBlur}
                  placeholder="https://company.com"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    errors.companyWebsite && touched.companyWebsite
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 hover:border-blue-400'
                  }`}
                />
                {errors.companyWebsite && touched.companyWebsite && (
                  <p className='text-red-500 text-sm mt-1'>✗ {errors.companyWebsite}</p>
                )}
                <p className='text-gray-500 text-xs mt-1'>(Optional)</p>
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
            <p className='text-gray-500 text-xs mt-1'>(Optional)</p>
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
