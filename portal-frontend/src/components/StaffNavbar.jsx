import React from 'react';
import { User, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StaffNavbar = ({ profile }) => {
  const { logout } = useAuth();
  const initials = profile?.name
    ? profile.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    : 'SU';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-100 px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a href="/staff" className="font-sora font-extrabold text-2xl tracking-tight text-primary flex items-center">
            <span className="text-accent-dept">Staff</span> Workspace
          </a>
          <div className="h-6 w-px bg-gray-100 hidden sm:block" />
          <div className="hidden sm:flex items-center space-x-2">
            <ShieldCheck size={16} className="text-accent-dept opacity-40" />
            <span className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em]">Verified Access</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-primary leading-none mb-1.5">{profile?.name || 'Staff User'}</p>
            <p className="text-[10px] font-bold text-secondary opacity-40 lowercase mb-2">{profile?.email}</p>
            <div className="flex flex-wrap justify-end gap-1.5">
               {profile?.roles?.slice(0, 2).map((role, i) => (
                 <span key={i} className="text-[8px] font-black text-secondary/40 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg border border-gray-100/50">
                    {role}
                 </span>
               ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative group cursor-pointer">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white text-primary shadow-sm transition-all group-hover:border-gray-300 group-hover:shadow-md">
                 <span className="text-sm font-black tracking-[0.2em] text-primary/80">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white bg-emerald-500 transition-transform group-hover:scale-110">
                <User size={10} className="text-white" />
              </div>
            </div>

            <button 
              onClick={logout}
              className="flex items-center justify-center h-12 w-12 bg-red-50 text-red-500 rounded-2xl border border-red-100/50 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
              title="Logout from Workspace"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StaffNavbar;
