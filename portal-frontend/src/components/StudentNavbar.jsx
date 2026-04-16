import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const StudentNavbar = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initials = (user?.name || user?.email || 'User')
    .split(/[@\s]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();

  // Robust click-outside logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <a href="/" className="font-sora font-extrabold text-2xl tracking-tight text-primary">
            <span className="text-accent-dept">Student</span> Grievance
          </a>
          {user?.role?.toLowerCase() === 'admin' && (
            <a
              href="/admin"
              className="text-[10px] font-black uppercase tracking-widest text-secondary/40 hover:text-primary transition-colors border-l border-gray-100 pl-8 hidden md:block"
            >
              Admin Panel
            </a>
          )}
        </div>

        <div className="flex items-center space-x-3 md:space-x-8">
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-4 p-1.5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 active:scale-95 group"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-black text-gray-900 leading-tight">
                    {user.name || 'Student User'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:scale-105">
                  <span className="text-sm font-black tracking-tighter">{initials}</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-[24px] shadow-2xl shadow-primary/20 border border-gray-100 p-1.5 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-gray-50/50 rounded-[20px] mb-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Account</p>
                      <p className="text-[12px] font-black text-gray-900 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2.5 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all flex items-center gap-3 rounded-[18px] group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                        <LogOut size={14} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-[13px] font-bold">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;
