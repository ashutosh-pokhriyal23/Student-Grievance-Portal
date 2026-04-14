import React from 'react';
import { Clock, User, Shield, ArrowRight, MapPin } from 'lucide-react';
import DeadlineIndicator from './DeadlineIndicator';
import StatusUpdateDropdown from './StatusUpdateDropdown';

const StaffComplaintCard = ({ complaint, onUpdate }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0': return 'bg-red-500 text-white ring-4 ring-red-500/10';
      case 'P1': return 'bg-amber-500 text-white ring-4 ring-amber-500/10';
      case 'P2': return 'bg-emerald-500 text-white ring-4 ring-emerald-500/10';
      default: return 'bg-gray-400 text-white';
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + "m ago";
    return "just now";
  };

  return (
    <div className={`group relative bg-white rounded-[32px] p-8 border transition-all duration-500 ${
      complaint.is_escalated 
        ? 'border-red-200 shadow-[0_20px_50px_rgba(239,68,68,0.1)]' 
        : 'border-white shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] hover:-translate-y-2'
    }`}>
      {/* Glow Effect on Hover */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-[32px]" />

      {/* Top Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest shadow-sm ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority}
            </span>
            <span className="text-[10px] font-black text-secondary/60 uppercase tracking-widest bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
              {complaint.category}
            </span>
          </div>
          <div className="flex items-center text-[10px] font-bold text-secondary/40 uppercase tracking-[0.15em]">
             <MapPin size={10} className="mr-1" />
             {complaint.space?.name}
          </div>
        </div>
        <DeadlineIndicator deadline={complaint.deadline} isEscalated={complaint.is_escalated} />
      </div>

      {/* Title */}
      <div className="mb-6">
        <h3 className="text-2xl font-black text-primary mb-3 leading-tight group-hover:text-accent-dept transition-colors">
          {complaint.title}
        </h3>
        <p className="text-sm text-secondary/70 line-clamp-3 leading-relaxed font-medium">
          {complaint.description}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="pt-8 mt-4 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5 text-[10px] font-black text-secondary/50 uppercase tracking-widest">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
               <Clock size={16} className="text-secondary/60" />
            </div>
            <span>{timeAgo(complaint.created_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
               {complaint.is_anonymous ? <Shield size={16} className="text-secondary/60" /> : <User size={16} className="text-secondary/60" />}
            </div>
            <span className="truncate max-w-[100px]">
              {complaint.is_anonymous ? 'Anonymous' : (complaint.student_name || 'Verified')}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <StatusUpdateDropdown 
            complaintId={complaint.id} 
            currentStatus={complaint.status} 
            onUpdate={onUpdate} 
          />
        </div>
      </div>
    </div>
  );
};

export default StaffComplaintCard;
