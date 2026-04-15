import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import RightPanel from './RightPanel';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });

      // Update React auth state + store token (via context)
      login(data.user, data.token);
      
      // Redirect based on role — must match routes defined in App.jsx
      const userRole = data.user.role;
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'staff' || userRole === 'teacher') {
        navigate('/staff', { replace: true });
      } else {
        navigate('/', { replace: true }); // student → Dashboard
      }

    } catch (err) {
      // Axios wraps backend errors in response.data
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex font-dmsans selection:bg-blue-500 selection:text-white transition-opacity duration-300 animate-in fade-in">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        
        {/* Soft background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="w-full max-w-[480px] bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-sora font-extrabold text-gray-900 tracking-tight mb-2">Welcome back!</h1>
            <p className="text-gray-500 text-[15px] font-medium">We're so excited to see you again!</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            
            {error && (
              <div className="p-3 mb-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 font-medium"
                  placeholder="name@gmail.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex pt-2 px-1 text-sm text-left">
                <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-[13px] transition-colors">Forgot your password?</a>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full font-bold py-3.5 px-4 rounded-xl transition-all duration-300 mt-8 flex items-center justify-center text-[15px] space-x-2 ${
                isLoading 
                  ? 'bg-blue-600/60 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>
            <div className="text-[14px] text-center text-gray-500 mt-6 font-medium">
              <span>Need an account?</span> 
              <Link to="/register" className="ml-1 text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors">Register</Link>
            </div>
          </form>
        </div>
      </div>
      <RightPanel />
    </div>
  );
}
