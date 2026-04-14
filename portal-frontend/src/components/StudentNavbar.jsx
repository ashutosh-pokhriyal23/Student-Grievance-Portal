import React from 'react';
import { HelpCircle } from 'lucide-react';

const StudentNavbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <a href="/" className="font-sora font-extrabold text-2xl tracking-tight text-primary">
          <span className="text-accent-dept">Student</span> Grievance
        </a>
        <div className="hidden md:flex items-center space-x-6">
          <a href="/" className="group flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/10 hover:-translate-y-1 transition-all">
            <HelpCircle size={18} />
            <span>Help Desk</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;
