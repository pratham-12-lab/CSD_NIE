import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { CHATBOT_API_END_POINT } from '../../utils/constant';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your Job Portal assistant. How can I help you today?',
      timestamp: new Date(),
      jobs: [],
      applications: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getStatusBadgeClasses = (status = '') => {
    const normalized = status.toLowerCase();
    if (normalized === 'accepted') {
      return 'bg-green-100 text-green-700 border border-green-200';
    }
    if (normalized === 'rejected') {
      return 'bg-red-100 text-red-700 border border-red-200';
    }
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return '—';
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get chat history (last 10 messages)
      const history = messages.slice(-10).map(({ role, content }) => ({
        role,
        content
      }));

      const response = await fetch(`${CHATBOT_API_END_POINT}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          message: input,
          history: history
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error occurred' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
          jobs: data.jobs || [],
          applications: data.applications || [],
          location: data.location || null
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || 'Failed to process message');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        jobs: [],
        applications: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={24} />
              <div>
                <h3 className="font-semibold">Job Portal Assistant</h3>
                <p className="text-xs text-blue-100">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 rounded p-1 transition"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {/* Display Application Status Cards */}
                {msg.applications && msg.applications.length > 0 && (
                  <div className="mt-2 w-full max-w-[85%] space-y-3">
                    {msg.applications.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">{app.jobTitle}</h4>
                            <p className="text-xs text-gray-600 truncate">at {app.companyName}</p>
                          </div>
                          <Badge className={`${getStatusBadgeClasses(app.status)} text-[10px] px-2 py-1`}>
                            {app.status?.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-gray-600">
                          <p><span className="font-semibold text-gray-700">Applied:</span> {formatDate(app.appliedOn)}</p>
                          <p><span className="font-semibold text-gray-700">Last update:</span> {formatDate(app.updatedAt)}</p>
                          {app.feedback && (
                            <p className="text-gray-700"><span className="font-semibold">Employer feedback:</span> {app.feedback}</p>
                          )}
                          {app.suggestedSkills && app.suggestedSkills.length > 0 && (
                            <p className="text-gray-700">
                              <span className="font-semibold">Suggested skills:</span> {app.suggestedSkills.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Display Job Cards */}
                {msg.jobs && msg.jobs.length > 0 && (
                  <div className="mt-2 w-full max-w-[85%] space-y-2">
                    {msg.jobs.map((job) => (
                      <div
                        key={job._id}
                        onClick={() => navigate(`/description/${job._id}`)}
                        className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">{job.title}</h4>
                            <p className="text-xs text-gray-600 truncate">{job.company?.name}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin size={12} />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <DollarSign size={12} />
                                <span>{job.salary} LPA</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Briefcase size={12} />
                                <span>{job.jobType}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 transition"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
