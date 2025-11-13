import React, { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, X } from 'lucide-react';

const FilterCard = ({ filters, onFilterChange }) => {
  // Search states
  const [locationSearch, setLocationSearch] = useState('');
  const [jobTypeSearch, setJobTypeSearch] = useState('');
  const [experienceSearch, setExperienceSearch] = useState('');

  // Dropdown states
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showJobTypeDropdown, setShowJobTypeDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleSelection = (field, value) => {
    onFilterChange({ [field]: value });
    if (field === 'location') {
      setLocationSearch('');
      setShowLocationDropdown(false);
    } else if (field === 'jobType') {
      setJobTypeSearch('');
      setShowJobTypeDropdown(false);
    } else if (field === 'experienceLevel') {
      setExperienceSearch('');
      setShowExperienceDropdown(false);
    }
  };

  // ✅ Handle custom location entry (Enter key)
  const handleLocationKeyPress = (e) => {
    if (e.key === 'Enter' && locationSearch.trim()) {
      handleSelection('location', locationSearch.trim());
    }
  };

  const clearSelection = (field) => {
    onFilterChange({ [field]: '' });
  };

  // ✅ Suggested options (not mandatory)
  const suggestedLocations = ['Bangalore', 'Delhi NCR', 'Hyderabad', 'Pune', 'Mumbai', 'Chennai', 'Kolkata', 'Ahmedabad', 'Noida', 'Gurgaon'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Remote'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Director'];

  const filteredLocations = suggestedLocations.filter(loc => 
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );
  const filteredJobTypes = jobTypes.filter(type => 
    type.toLowerCase().includes(jobTypeSearch.toLowerCase())
  );
  const filteredExperience = experienceLevels.filter(exp => 
    exp.toLowerCase().includes(experienceSearch.toLowerCase())
  );

  return (
    <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200 sticky top-5 space-y-4">
      
      {/* Location Search */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Location</Label>
        
        {filters.location ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-md">
            <span className="text-sm text-green-800">{filters.location}</span>
            <X 
              className="h-4 w-4 cursor-pointer text-green-600 hover:text-green-800" 
              onClick={() => clearSelection('location')}
            />
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Type any location or press Enter..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              onKeyPress={handleLocationKeyPress}
              onFocus={() => setShowLocationDropdown(true)}
              className="w-full pl-9"
            />

            {showLocationDropdown && (
              <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
                {/* Show filtered suggestions */}
                {filteredLocations.length > 0 && (
                  <>
                    <div className="p-2 text-xs text-gray-500 font-semibold">Suggested Locations</div>
                    {filteredLocations.map((loc) => (
                      <div 
                        key={loc} 
                        className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                        onClick={() => handleSelection('location', loc)}
                      >
                        {loc}
                      </div>
                    ))}
                  </>
                )}
                
                {/* ✅ Option to use custom location */}
                {locationSearch.trim() && (
                  <div 
                    className="p-2 hover:bg-green-50 cursor-pointer text-sm border-t border-gray-200 text-green-700 font-medium"
                    onClick={() => handleSelection('location', locationSearch.trim())}
                  >
                    ✓ Use "{locationSearch.trim()}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Job Type Search */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Job Type</Label>

        {filters.jobType ? (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-3 py-2 rounded-md">
            <span className="text-sm text-blue-800">{filters.jobType}</span>
            <X 
              className="h-4 w-4 cursor-pointer text-blue-600 hover:text-blue-800" 
              onClick={() => clearSelection('jobType')}
            />
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search job type..."
              value={jobTypeSearch}
              onChange={(e) => setJobTypeSearch(e.target.value)}
              onFocus={() => setShowJobTypeDropdown(true)}
              className="w-full pl-9"
            />

            {showJobTypeDropdown && (
              <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
                {filteredJobTypes.length > 0 ? (
                  filteredJobTypes.map((type) => (
                    <div 
                      key={type} 
                      className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                      onClick={() => handleSelection('jobType', type)}
                    >
                      {type}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">No job types found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Experience Search */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Experience</Label>

        {filters.experienceLevel ? (
          <div className="flex items-center justify-between bg-purple-50 border border-purple-200 px-3 py-2 rounded-md">
            <span className="text-sm text-purple-800">{filters.experienceLevel}</span>
            <X 
              className="h-4 w-4 cursor-pointer text-purple-600 hover:text-purple-800" 
              onClick={() => clearSelection('experienceLevel')}
            />
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search experience level..."
              value={experienceSearch}
              onChange={(e) => setExperienceSearch(e.target.value)}
              onFocus={() => setShowExperienceDropdown(true)}
              className="w-full pl-9"
            />

            {showExperienceDropdown && (
              <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
                {filteredExperience.length > 0 ? (
                  filteredExperience.map((exp) => (
                    <div 
                      key={exp} 
                      className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                      onClick={() => handleSelection('experienceLevel', exp)}
                    >
                      {exp}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">No experience levels found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Salary Range */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Salary Range</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.salaryMin}
            onChange={(e) => handleInputChange('salaryMin', e.target.value)}
            className="w-1/2"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.salaryMax}
            onChange={(e) => handleInputChange('salaryMax', e.target.value)}
            className="w-1/2"
          />
        </div>
      </div>

      {/* Skills */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Skills (comma-separated)</Label>
        <Input
          type="text"
          placeholder="e.g. React, Node, MongoDB"
          value={filters.skills}
          onChange={(e) => handleInputChange('skills', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Date Filter */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Posted After</Label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleInputChange('dateFrom', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Overlay to close dropdowns */}
      {(showLocationDropdown || showJobTypeDropdown || showExperienceDropdown) && (
        <div 
          className="fixed inset-0 z-[5]" 
          onClick={() => {
            setShowLocationDropdown(false);
            setShowJobTypeDropdown(false);
            setShowExperienceDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default FilterCard;
