import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { JOB_API_END_POINT, ANALYTICS_API_END_POINT } from '@/utils/constant';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const AnalyticsDashboard = () => {
  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`);
        if (res.data.success) setJob(res.data.job);
      } catch (err) {
        console.error(err);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  const handleAnalyze = async () => {
    if (!resumeText || resumeText.trim().length < 20) {
      toast.error('Please paste your resume text (at least 20 characters)');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${ANALYTICS_API_END_POINT}/analyze`, { jobId, resumeText }, { withCredentials: true });
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10">
      <h2 className="text-2xl font-bold mb-4">Resume Analyzer</h2>
      <div className="mb-4">
        <h3 className="font-semibold">Job</h3>
        <div className="text-gray-700">{job ? job.title : 'Loading job...'}</div>
        <div className="text-sm text-gray-500">{job?.company?.name}</div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Paste your resume text</label>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={10}
          className="w-full border rounded p-2"
          placeholder="Paste the plain text of your resume here"
        />
      </div>

      <div className="mb-6">
        <Button onClick={handleAnalyze} disabled={loading} className="bg-[#7209b7]">
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </Button>
      </div>

      {result && (
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold">Analysis for: {result.jobTitle}</h3>
          <div className="mt-2">Match Score: <strong>{result.score}%</strong></div>

          <div className="mt-4">
            <h4 className="font-semibold">Matched Requirements</h4>
            {result.matched && result.matched.length ? (
              <ul className="list-disc pl-6 text-gray-700">
                {result.matched.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            ) : <div className="text-gray-500">None matched</div>}
          </div>

          <div className="mt-4">
            <h4 className="font-semibold">Missing / Recommended Skills</h4>
            {result.missing && result.missing.length ? (
              result.suggestions.map((s, i) => (
                <div key={i} className="mb-3">
                  <div className="font-medium">{s.skill}</div>
                  {s.resources && s.resources.length ? (
                    <ul className="list-disc pl-6 text-sm text-blue-700">
                      {s.resources.map((r, idx) => (
                        <li key={idx}><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">No specific resources available. Consider online courses or tutorials.</div>
                  )}
                </div>
              ))
            ) : <div className="text-gray-500">No missing skills detected.</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
