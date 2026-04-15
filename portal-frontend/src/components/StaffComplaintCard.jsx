import React from 'react';
import { Clock, User, Shield, MapPin, ChevronRight, Zap } from 'lucide-react';
import DeadlineIndicator from './DeadlineIndicator';
import StatusUpdateDropdown from './StatusUpdateDropdown';

const StaffComplaintCard = ({ complaint, onUpdate, onAssignClick, onClick }) => {
  const getGradientColor = (priority) => {
    switch (priority) {
      case 'P0': return 'from-[#ff0055] via-[#ff4d00] to-[#ff9500]'; // Neon Red-Gold
      case 'P1': return 'from-[#7000ff] via-[#b300ff] to-[#ff00d4]'; // Cyber Purple-Pink
      case 'P2': return 'from-[#00f2fe] via-[#4facfe] to-[#00f2fe]'; // Electric Blue-Cyan
      default: return 'from-slate-600 to-gray-400';
    }
  };

  const getLightColor = (priority) => {
    switch (priority) {
      case 'P0': return 'bg-red-50 text-red-700 border-red-100';
      case 'P1': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'P2': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white rounded-[40px] p-7 border border-gray-100 transition-all duration-500 hover:shadow-[0_45px_90px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-2 cursor-pointer ${
        complaint.is_escalated ? 'ring-2 ring-red-400 ring-offset-2' : ''
      }`}
    >
      {/* Dynamic Header Gradient Bar */}
      <div className={`absolute top-0 left-0 w-full h-[12px] bg-gradient-to-r ${getGradientColor(complaint.priority)} opacity-100 shadow-[0_2px_15px_rgba(0,0,0,0.1)] rounded-t-[40px]`} />
      
      {/* Subtle Background Mesh Glow */}
      <div className={`absolute -bottom-20 -right-20 w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-[0.1] transition-opacity duration-1000 rounded-full bg-gradient-to-br ${getGradientColor(complaint.priority)}`} />

      {/* Header Row */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getLightColor(complaint.priority)} shadow-sm`}>
              {complaint.priority}
            </span>
            <span className="text-[9px] font-black text-gray-900 uppercase tracking-[0.2em] bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
              {complaint.category || 'General'}
            </span>
          </div>
          <div className="flex items-center text-[10px] font-black text-gray-700 uppercase tracking-[0.1em] mt-1">
             <MapPin size={10} className="mr-1.5 text-gray-900" />
             {complaint.space?.name || 'Main Campus'}
          </div>
        </div>
        
        {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
          <DeadlineIndicator deadline={complaint.deadline} isEscalated={complaint.is_escalated} />
        )}
      </div>

      {/* Title & Body */}
      <div className="mb-8">
        <h3 className="text-[20px] font-black text-gray-900 mb-3 leading-tight tracking-tight group-hover:text-blue-600 transition-colors duration-300">
          {complaint.title}
        </h3>
        <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed font-medium">
          {complaint.description}
        </p>
      </div>

      {/* Inline Management Row */}
      <div className="flex items-center justify-between gap-4 mb-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex -space-x-2">
          {/* Visual Avatar Placeholder */}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm">
            <Zap size={14} fill="currentColor" />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
            ?
          </div>
        </div>

        <div className="flex-1">
          <StatusUpdateDropdown 
            complaintId={complaint.id} 
            currentStatus={complaint.status} 
            onUpdate={onUpdate} 
          />
        </div>
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between pt-5 border-t border-gray-50/80">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 group/meta">
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover/meta:border-blue-200 transition-all shadow-sm">
               {complaint.is_anonymous ? <Shield size={14} className="text-gray-900/40" /> : <User size={14} className="text-gray-900/40" />}
            </div>
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
              {complaint.is_anonymous ? 'Anonymous' : (complaint.student_name || 'Verified')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 pr-2">
            <Clock size={12} className="text-gray-900/20" />
            <span className="text-[10px] font-black text-gray-900/40 uppercase tracking-widest">
              {new Date(complaint.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </span>
          </div>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm">
           <ChevronRight size={16} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

export default StaffComplaintCard;
