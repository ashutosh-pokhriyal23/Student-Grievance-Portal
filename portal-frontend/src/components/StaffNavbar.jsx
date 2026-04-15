import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const StaffNavbar = ({ profile }) => {
  const { logout, user: authUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initials = (profile?.name || authUser?.name || profile?.email || authUser?.email || 'Staff')
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
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-100 px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <a href="/staff" className="font-sora font-extrabold text-2xl tracking-tight text-primary flex items-center">
            <span className="text-accent-dept">Staff</span> Workspace
          </a>
          
          {authUser?.role?.toLowerCase() === 'admin' && (
            <a 
              href="/admin" 
              className="text-[10px] font-black uppercase tracking-widest text-secondary/40 hover:text-primary transition-colors border-l border-gray-100 pl-8"
            >
              Command Center
            </a>
          )}
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-4 p-1.5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 active:scale-95 group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-primary leading-none">
                  {profile?.name || authUser?.name || 'Staff User'}
                </p>
              </div>

              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white text-primary shadow-sm transition-all group-hover:border-gray-300 group-hover:shadow-md">
                   <span className="text-sm font-black tracking-[0.2em] text-primary/80">{initials}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white bg-emerald-500 transition-transform group-hover:scale-110">
                  <User size={10} className="text-white" />
                </div>
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
                  className="absolute right-0 mt-2 w-64 bg-white rounded-[24px] shadow-2xl shadow-primary/20 border border-gray-100 p-1.5 z-50 overflow-hidden"
                >
                  <div className="px-5 py-3.5 bg-gray-50/50 rounded-[20px] mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Staff Account</p>
                    <p className="text-[12px] font-black text-gray-900 truncate">{profile?.email || authUser?.email}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-5 py-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all flex items-center gap-3 rounded-[18px] group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                      <LogOut size={14} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[13px] font-bold">Logout from Portal</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StaffNavbar;
