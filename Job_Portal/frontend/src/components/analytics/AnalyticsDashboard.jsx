import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { JOB_API_END_POINT, ANALYTICS_API_END_POINT } from '@/utils/constant';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const AnalyticsDashboard = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const [job, setJob] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    const fetchJobAndAnalyze = async () => {
      try {
        // Fetch job details with credentials
        const jobRes = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true
        });
        if (jobRes.data.success) {
          setJob(jobRes.data.job);
        }

        // Check if user has profile data
        if (!user?.profile?.resume && (!user?.profile?.skills || user.profile.skills.length === 0)) {
          setNoProfile(true);
          toast.error('Please upload resume and add skills to your profile first');
          return;
        }

        // Auto-analyze using profile data
        setLoading(true);
        const analysisRes = await axios.post(
          `${ANALYTICS_API_END_POINT}/analyze-for-job`,
          { jobId },
          { withCredentials: true }
        );
        
        if (analysisRes.data.success) {
          setResult(analysisRes.data);
          toast.success('Analysis complete! Based on your profile.');
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status !== 400) {
          toast.error(err.response?.data?.message || 'Failed to load analysis');
        }
      } finally {
        setLoading(false);
      }
    };

    if (jobId && user) fetchJobAndAnalyze();
  }, [jobId, user]);

  const handleReanalyze = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${ANALYTICS_API_END_POINT}/analyze-for-job`,
        { jobId },
        { withCredentials: true }
      );
      if (res.data.success) {
        setResult(res.data);
        toast.success('Re-analysis complete!');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10'>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            className="mb-4 bg-gray-600 hover:bg-gray-700"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📊 Resume Analyzer
          </h1>
          <p className="text-gray-600">Check how well your resume matches the job requirements</p>
        </div>

        {/* Job Info Card */}
        {job && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-purple-600">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h2>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Company:</span> {job.company?.name}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Location:</span> {job.location}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Experience Required:</span> {job.experienceLevel} years
            </p>
          </div>
        )}

        {/* Profile Info Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">👤 Your Profile</h3>
          
          {noProfile ? (
            <div className="bg-red-50 rounded-lg p-4 border border-red-300 mb-4">
              <p className="text-red-800 font-semibold mb-2">⚠️ Incomplete Profile</p>
              <p className="text-red-700 text-sm mb-3">
                Please upload a resume and add skills to your profile before analyzing job matches.
              </p>
              <Button
                onClick={() => navigate('/profile')}
                className="bg-red-600 hover:bg-red-700"
              >
                Go to Profile
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Resume:</label>
                  {user?.profile?.resume ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-lg">✓</span>
                      <a
                        href={user.profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {user.profile.resumeOriginalName || 'View Resume'}
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500">No resume uploaded</p>
                  )}
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Skills: ({user?.profile?.skills?.length || 0})
                  </label>
                  {user?.profile?.skills && user.profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.profile.skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills added</p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleReanalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg text-lg"
              >
                {loading ? '⏳ Analyzing...' : '🔍 Analyze Match'}
              </Button>

              <p className="text-sm text-gray-600 mt-2 text-center">
                💡 Analysis uses your profile resume and skills
              </p>
            </>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Match Score */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📈 Match Score</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-semibold">Overall Match:</span>
                <span className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    result.score >= 80
                      ? 'bg-green-500'
                      : result.score >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {result.score >= 80
                  ? '✅ Great match! Your resume aligns well with this job.'
                  : result.score >= 60
                  ? '⚠️ Fair match. Consider adding more relevant skills.'
                  : '❌ Needs improvement. Review the missing skills below.'}
              </p>
            </div>

            {/* Matched Requirements */}
            {result.matched && result.matched.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <h4 className="text-xl font-bold text-green-700 mb-4">
                  ✅ Matched Skills ({result.matched.length})
                </h4>
                <ul className="space-y-2">
                  {result.matched.map((skill, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <span className="text-green-600 font-bold mt-0.5">✓</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Skills & Recommendations */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
                <h4 className="text-xl font-bold text-yellow-700 mb-4">
                  📚 Missing Skills & Recommendations ({result.suggestions.length})
                </h4>
                <div className="space-y-4">
                  {result.suggestions.map((item, i) => {
                          // Try to pick out course-like resources by title/url keywords
                          const courseKeywords = /course|tutorial|udemy|coursera|edx|pluralsight|learn|training|bootcamp/i;
                          const courseLinks = (item.resources || []).filter(r => courseKeywords.test(r.title || '') || courseKeywords.test(r.url || ''));
                          const otherLinks = (item.resources || []).filter(r => !courseLinks.includes(r));

                          return (
                            <div
                              key={i}
                              className="bg-yellow-50 rounded-lg p-4 border border-yellow-200"
                            >
                              <div className="font-semibold text-gray-800 mb-2">
                                {item.skill}
                              </div>

                              {/* Recommended Courses (preferred) */}
                              {courseLinks.length > 0 ? (
                                <div className="ml-4 mb-2">
                                  <p className="text-sm text-gray-700 font-semibold mb-2">Recommended Courses:</p>
                                  <ul className="space-y-1">
                                    {courseLinks.map((resource, idx) => (
                                      <li key={idx} className="text-sm">
                                        <a
                                          href={resource.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                          🎓 {resource.title}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}

                              {/* Fallback: other learning resources */}
                              {otherLinks.length > 0 ? (
                                <div className="ml-4">
                                  <p className="text-sm text-gray-600 mb-2">Learning Resources:</p>
                                  <ul className="space-y-1">
                                    {otherLinks.map((resource, idx) => (
                                      <li key={idx} className="text-sm">
                                        <a
                                          href={resource.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                          🔗 {resource.title}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                // If no resources at all
                                courseLinks.length === 0 && (
                                  <p className="text-sm text-gray-600 italic">
                                    💡 Suggestion: Search for online courses or tutorials for this skill.
                                  </p>
                                )
                              )}
                            </div>
                          );
                        })}
                </div>
              </div>
            )}

            {/* No Missing Skills */}
            {(!result.suggestions || result.suggestions.length === 0) && (
              <div className="bg-green-50 rounded-lg shadow-md p-6 border border-green-300">
                <h4 className="text-xl font-bold text-green-700 mb-2">
                  🎉 Excellent Match!
                </h4>
                <p className="text-gray-700">
                  Your resume covers all the required skills for this position. You're well-prepared to apply!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State - Only show while loading before analysis starts */}
        {!result && !loading && !noProfile && (
          <div className="text-center text-gray-500 py-10">
            <p>Analysis will appear here once it completes...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
