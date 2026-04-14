import React from 'react';
import { Clock, User, Shield, MapPin, Users } from 'lucide-react';
import DeadlineIndicator from './DeadlineIndicator';
import StatusUpdateDropdown from './StatusUpdateDropdown';

const StaffComplaintCard = ({ complaint, onUpdate, onAssignClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0': return 'bg-red-500 text-white ring-4 ring-red-500/10';
      case 'P1': return 'bg-amber-500 text-white ring-4 ring-amber-500/10';
      case 'P2': return 'bg-emerald-500 text-white ring-4 ring-emerald-500/10';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className={`group relative bg-white rounded-[40px] p-8 border transition-all duration-700 ${
      complaint.is_escalated 
        ? 'border-red-200 shadow-[0_20px_60px_rgba(239,68,68,0.1)] scale-[1.02]' 
        : 'border-transparent shadow-[0_15px_45px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:-translate-y-3'
    }`}>
      {/* Visual Intensity Glow */}
      <div className={`absolute inset-0 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10 bg-gradient-to-br ${
        complaint.priority === 'P0' ? 'from-red-50/50 to-transparent' : 'from-indigo-50/30 to-transparent'
      }`} />

      {/* Top Header */}
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest shadow-lg ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority}
            </span>
            <span className="text-[10px] font-black text-secondary/60 uppercase tracking-widest bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
              {complaint.category}
            </span>
          </div>
          <div className="flex items-center text-[11px] font-black text-secondary/40 uppercase tracking-[0.2em] leading-none">
             <MapPin size={12} className="mr-1.5 text-primary/20" />
             {complaint.space?.name}
          </div>
        </div>
        <DeadlineIndicator deadline={complaint.deadline} isEscalated={complaint.is_escalated} />
      </div>

      {/* Title & Body */}
      <div className="mb-10">
        <h3 className="text-2xl font-black text-primary mb-3 leading-tight tracking-tight group-hover:text-primary transition-colors">
          {complaint.title}
        </h3>
        <p className="text-sm text-secondary/60 line-clamp-3 leading-relaxed font-medium">
          {complaint.description}
        </p>
      </div>

      {/* Management Row */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <button 
          onClick={onAssignClick}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all shadow-[0_16px_35px_-15px_rgba(26,26,46,0.55)] border border-primary/10 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-15px_rgba(26,26,46,0.65)] active:translate-y-0"
        >
          <Users size={14} />
          <span>Assign Maintainer</span>
        </button>
        <StatusUpdateDropdown 
           complaintId={complaint.id} 
           currentStatus={complaint.status} 
           onUpdate={onUpdate} 
        />
      </div>

      {/* Footer Meta */}
      <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 group/meta">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover/meta:bg-white transition-colors shadow-sm">
               <Clock size={16} className="text-secondary/40" />
            </div>
            <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest leading-none">New Issue</span>
          </div>
          <div className="flex items-center space-x-2 group/meta">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover/meta:bg-white transition-colors shadow-sm">
               {complaint.is_anonymous ? <Shield size={16} className="text-secondary/40" /> : <User size={16} className="text-secondary/40" />}
            </div>
            <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest leading-none truncate max-w-[80px]">
              {complaint.is_anonymous ? 'Guest' : (complaint.student_name || 'Verified')}
            </span>
          </div>
        </div>
        <div className="w-4 h-4 bg-gray-50 rounded-full border border-gray-100" />
      </div>
    </div>
  );
};

export default StaffComplaintCard;
