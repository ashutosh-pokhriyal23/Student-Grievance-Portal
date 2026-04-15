import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import RightPanel from './RightPanel';

export default function OTPVerification() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });

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
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex font-dmsans selection:bg-blue-500 selection:text-white transition-opacity duration-300 animate-in fade-in">
      {/* Left Panel: Verif Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        
        {/* Soft background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-[480px] bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-sora font-extrabold text-gray-900 tracking-tight mb-2">Check your email</h1>
            <p className="text-gray-500 text-[15px] font-medium leading-relaxed">We sent a 6-digit code to <br/><strong className="text-gray-900">{email}</strong></p>
          </div>

          <form className="space-y-5" onSubmit={handleVerify}>
            {error && (
              <div className="p-3 mb-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
                Verification Code <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <ShieldCheck size={18} />
                </div>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 text-center tracking-[0.5em] font-bold text-lg"
                  placeholder="------"
                  required
                />
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
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Login</span>
              )}
            </button>
            <div className="text-[14px] text-center text-gray-500 mt-6 font-medium">
              <span>Didn't receive the code?</span> 
              <button type="button" className="ml-1 text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors">Resend</button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right Panel */}
      <RightPanel />
    </div>
  );
}
