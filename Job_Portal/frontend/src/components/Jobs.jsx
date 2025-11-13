import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import axios from 'axios';
import { motion } from 'framer-motion';
import { JOB_API_END_POINT } from '@/utils/constant';
import { Loader2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Jobs = () => {
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    skills: '',
    dateFrom: '',
    page: 1,
    limit: 9,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [searchInput, setSearchInput] = useState(''); // For controlled search input
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    jobsPerPage: 9
  });

  // ✅ Fetch jobs whenever filters change
  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(
        `${JOB_API_END_POINT}/search?${params.toString()}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setJobs(res.data.jobs || []);
        setPagination(res.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalJobs: 0,
          jobsPerPage: 9
        });
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Fetch jobs error:', err);
      if (err.response?.status === 401) {
        setError('Please login to view jobs');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch jobs');
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({
      ...filters,
      keyword: searchInput,
      page: 1
    });
  };

  // ✅ Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1
    });
  };

  // ✅ Handle page change
  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Clear all filters
  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      keyword: '',
      location: '',
      jobType: '',
      experienceLevel: '',
      salaryMin: '',
      salaryMax: '',
      skills: '',
      dateFrom: '',
      page: 1,
      limit: 9,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  return (
    <div>
      <Navbar />
      
      {/* ✅ Search Bar Section */}
      <div className="max-w-7xl mx-auto mt-5 px-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by title or description"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <Button 
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-8"
          >
            Search
          </Button>
        </form>

        <div className="flex gap-5">
          {/* ✅ Left filter panel */}
          <div className="w-[20%]">
            <FilterCard 
              filters={filters} 
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* ✅ Right job listings */}
          <div className="flex-1">
            {/* ✅ Results header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="font-bold text-xl">
                  {loading ? 'Loading...' : `${pagination.totalJobs} Jobs Found`}
                </h1>
                {pagination.totalJobs > 0 && (
                  <p className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * pagination.jobsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.jobsPerPage, pagination.totalJobs)} of {pagination.totalJobs}
                  </p>
                )}
              </div>

              {/* ✅ Sort dropdown */}
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange({ sortBy, sortOrder });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="salary-desc">Highest Salary</option>
                <option value="salary-asc">Lowest Salary</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>

            {/* ✅ Job listings */}
            <div className="min-h-[60vh]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                  <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <p className="text-red-500 text-lg mb-4">{error}</p>
                  <Button onClick={fetchJobs} className="bg-green-600 hover:bg-green-700">
                    Try Again
                  </Button>
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <p className="text-gray-600 text-lg mb-4">No jobs found matching your criteria</p>
                  <Button onClick={clearFilters} className="bg-green-600 hover:bg-green-700">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.map((job, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      key={job?._id}
                    >
                      <Job job={job} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ Pagination */}
            {!loading && !error && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                <Button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {[...Array(pagination.totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={pagination.currentPage === pageNum ? "default" : "outline"}
                          className={
                            pagination.currentPage === pageNum
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : ''
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (
                      pageNum === pagination.currentPage - 2 ||
                      pageNum === pagination.currentPage + 2
                    ) {
                      return <span key={pageNum}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
