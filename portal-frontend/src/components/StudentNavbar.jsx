import React from 'react';
import { HelpCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudentNavbar = () => {
  const { user, logout } = useAuth();
  
  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    : (user?.email?.substring(0, 2).toUpperCase() || 'ST');

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <a href="/" className="font-sora font-extrabold text-2xl tracking-tight text-primary">
          <span className="text-accent-dept">Student</span> Grievance
        </a>
        
        <div className="flex items-center space-x-3 md:space-x-8">
          {user && (
            <div className="hidden sm:flex items-center space-x-3 pr-4 border-r border-gray-100">
              <div className="text-right">
                <p className="text-sm font-black text-gray-900 leading-tight">{user.name || 'Student User'}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">{user.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm transition-transform hover:scale-105">
                <span className="text-xs font-black tracking-tighter">{initials}</span>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 md:space-x-4">
            <a href="/" className="group flex items-center space-x-2 bg-primary text-white px-4 md:px-6 py-3 rounded-2xl text-[12px] md:text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/10 hover:-translate-y-1 transition-all">
              <HelpCircle size={18} />
              <span className="hidden xs:inline">Help Desk</span>
            </a>
            
            <button 
              onClick={logout}
              className="flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 h-11 w-11 md:h-12 md:w-12 rounded-2xl transition-all border border-gray-100 hover:border-red-100 active:scale-95 shadow-sm"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;
