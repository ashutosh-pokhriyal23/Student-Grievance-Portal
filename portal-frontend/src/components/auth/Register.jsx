import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronDown, User, Shield, BookOpen, UploadCloud, CheckCircle2, UserCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import RightPanel from './RightPanel';

export default function Register() {
  const [role, setRole] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Click outside logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [ocrStep, setOcrStep] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');

  const roles = [
    { id: 'student', label: 'Student', icon: BookOpen },
    { id: 'teacher', label: 'Teacher', icon: User },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
      setVerified(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Live validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (value && !gmailRegex.test(value)) {
      setEmailError('Please enter a valid Gmail address');
    } else {
      setEmailError('');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (emailError) return;
    if (!name || !email || !password || !file || !role) {
      setServerError('Please fill out all required fields and upload an ID card.');
      return;
    }
    
    setIsLoading(true);
    setOcrStep(1); // Uploading
    
    // Simulate progression timings for better UX context while waiting for slow OCR
    const timers = [
      setTimeout(() => setOcrStep(2), 2000), // Extracting Text
      setTimeout(() => setOcrStep(3), 4500), // Verifying College
      setTimeout(() => setOcrStep(4), 6000), // Checking year
      setTimeout(() => setOcrStep(5), 7500), // Finalizing
    ];
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('idCard', file);

      const { data } = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      timers.forEach(t => clearTimeout(t));

      setVerified(true);
      setVerificationStatus(data.status); // 'verified', 'pending', etc.
      
      // OTP REMOVED: Log in and go home immediately
      if (data.token) {
        login(data.user, data.token);
      }
      navigate('/'); 

    } catch (err) {
      timers.forEach(t => clearTimeout(t));
      setOcrStep(0);
      
      const data = err.response?.data;
      if (data?.status === 'rejected') {
        setVerified(true);
        setVerificationStatus('rejected');
        setServerError(data.error || 'ID Verification Failed');
      } else {
        setServerError(data?.error || err.message);
      }
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
            <h1 className="text-[28px] font-sora font-extrabold text-gray-900 tracking-tight mb-2">Create Account</h1>
            <p className="text-gray-500 text-[15px] font-medium">Join us and start your journey today</p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            {serverError && (
              <div className="p-3 mb-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <UserCircle size={18} />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 font-medium"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
                  type="email" 
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full bg-gray-50/50 text-gray-900 border ${emailError ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'} rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300 placeholder:text-gray-400 font-medium`}
                  placeholder="name@gmail.com"
                  required
                />
              </div>
              {emailError && (
                <p className="text-[12px] text-red-500 font-bold px-1 mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
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
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5 relative z-20" ref={dropdownRef}>
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
                Select Role <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 flex items-center justify-between focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  {role ? (
                    <>
                      {React.createElement(roles.find(r => r.id === role)?.icon, { size: 18, className: "text-blue-600" })}
                      <span className="capitalize font-semibold">{role}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 font-medium">Select your role</span>
                  )}
                </div>
                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-1 animate-in slide-in-from-top-2 duration-200">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => { setRole(r.id); setDropdownOpen(false); }}
                      className={`w-full text-left px-5 py-3.5 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${role === r.id ? 'bg-blue-50/50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <r.icon size={18} className={role === r.id ? 'text-blue-600' : 'text-gray-400'} />
                      <span className="font-semibold">{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ID Card Upload */}
            <div className="space-y-1.5 pt-2 relative z-10">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
                Upload ID Card <span className="text-red-500">*</span>
              </label>
              <label className={`group flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${fileName ? 'border-green-400 bg-green-50 shadow-sm' : 'border-gray-200 bg-gray-50 hover:border-blue-400/50 hover:bg-white'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {fileName ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500 mb-1 drop-shadow-sm" />
                      <p className="text-xs text-green-700 font-bold max-w-[200px] truncate">{fileName}</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-gray-400 mb-1 group-hover:text-blue-500 transition-colors" />
                      <p className="text-[12px] text-gray-500 font-medium group-hover:text-gray-900 transition-colors">Click to upload</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} required />
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || (verified && verificationStatus !== 'rejected') || emailError !== ''}
              className={`w-full font-bold py-3.5 px-4 rounded-xl transition-all duration-300 mt-8 flex items-center justify-center space-x-2 text-[15px] ${
                (verified && verificationStatus !== 'rejected') ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 
                (isLoading || emailError) ? 'bg-blue-600/60 text-white cursor-not-allowed' : 
                'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mb-2"></div>
                  <span className="text-[13px] font-semibold tracking-wide">
                    {ocrStep === 1 && "Uploading secure package..."}
                    {ocrStep === 2 && "Extracting text via AI..."}
                    {ocrStep === 3 && "Verifying college details..."}
                    {ocrStep === 4 && "Checking validation year..."}
                    {ocrStep === 5 && "Finalizing registration..."}
                  </span>
                </div>
              ) : verified ? (
                <div className="flex flex-col items-center py-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 size={18} />
                    <span>Processed</span>
                  </div>
                  {verificationStatus === 'pending' && (
                    <span className="text-[11px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full mt-2 inline-flex items-center">
                      <AlertCircle size={10} className="mr-1" />
                      Your ID is under review
                    </span>
                  )}
                  {verificationStatus === 'verified' && (
                    <span className="text-[11px] bg-green-400 text-green-900 px-2 py-0.5 rounded-full mt-2 inline-flex items-center">
                      <CheckCircle2 size={10} className="mr-1" />
                      ID verified automatically
                    </span>
                  )}
                  {verificationStatus === 'rejected' && (
                    <span className="text-[11px] bg-red-400 text-red-900 px-2 py-0.5 rounded-full mt-2 inline-flex items-center">
                      <AlertCircle size={10} className="mr-1" />
                      Status: Rejected - Re-upload ID
                    </span>
                  )}
                </div>
              ) : (
                <span>Continue</span>
              )}
            </button>
            <div className="text-[14px] text-center text-gray-500 mt-6 font-medium">
              <span>Already have an account?</span> 
              <Link to="/login" className="ml-1 text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
      <RightPanel />
    </div>
  );
}
