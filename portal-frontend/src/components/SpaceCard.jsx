import React from 'react';
import {
  Building2,
  Home,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Trophy,
  Theater,
  ChevronRight
} from 'lucide-react';

const CATEGORY_CONFIG = {
  department: { icon: Building2, color: 'text-accent-dept', bg: 'bg-accent-dept/5', border: 'border-accent-dept/10', glow: 'bg-accent-dept' },
  facility: { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', glow: 'bg-blue-600' },
  career: { icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', glow: 'bg-indigo-600' },
  administrative: { icon: ShieldCheck, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', glow: 'bg-slate-600' },
  hostel: { icon: Home, color: 'text-accent-hostel', bg: 'bg-accent-hostel/5', border: 'border-accent-hostel/10', glow: 'bg-accent-hostel' },
  sports: { icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', glow: 'bg-emerald-600' },
  cultural: { icon: Theater, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', glow: 'bg-purple-600' },
};

const SpaceCard = ({ space, onClick }) => {
  const config = CATEGORY_CONFIG[space.type] || CATEGORY_CONFIG.department;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`group relative block w-full p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-100 card-hover overflow-hidden text-left hover:shadow-lg transition-shadow duration-300`}
    >
      {/* Background Accent Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${config.glow}`} />

      <div className="flex items-start justify-between relative z-10">
        <div className={`p-4 rounded-2xl ${config.bg} ${config.color} transition-transform group-hover:scale-110 duration-300`}>
          <Icon size={28} />
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.color} ${config.border}`}>
            {space.type.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="mt-8 relative z-10">
        <h3 className="text-2xl font-black text-primary group-hover:text-accent-dept transition-colors leading-tight">
          {space.name}
        </h3>
        <p className="mt-2 text-sm text-secondary font-medium leading-relaxed">
          Raise issues or track ongoing grievances in this space.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <span className={`w-2 h-2 rounded-full ${config.glow}`} />
          <span className="text-xs font-bold text-primary tracking-tight">
            {space.open_complaints || 0} Open Tickets
          </span>
        </div>
        <div className="p-2 rounded-full bg-primary text-white scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-primary/20">
          <ChevronRight size={16} />
        </div>
      </div>
    </button>
  );
};

export default SpaceCard;
