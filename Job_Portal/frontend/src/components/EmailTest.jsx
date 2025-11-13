import React, { useState } from 'react';
import axios from 'axios';

const EmailTest = () => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/email/test',
        formData
      );

      setResult({
        success: true,
        message: response.data.message || 'Email sent successfully! ✅',
      });

      // Reset form
      setFormData({
        to: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send email ❌',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <h3 className="mb-0">📧 Test Email Notification System</h3>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="to" className="form-label fw-bold">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="to"
                    name="to"
                    value={formData.to}
                    onChange={handleChange}
                    placeholder="Enter recipient email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="subject" className="form-label fw-bold">
                    Subject *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter email subject"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label fw-bold">
                    Message *
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-lg w-100 text-white"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Send Test Email
                    </>
                  )}
                </button>
              </form>

              {result && (
                <div
                  className={`alert ${
                    result.success ? 'alert-success' : 'alert-danger'
                  } mt-4 d-flex align-items-center`}
                  role="alert"
                >
                  <i className={`bi ${result.success ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2 fs-5`}></i>
                  <div>{result.message}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTest;
