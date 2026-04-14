import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import UpvoteButton from './UpvoteButton';

const ComplaintCard = ({ complaint, onUpvoteUpdate }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0': return 'bg-priority-P0';
      case 'P1': return 'bg-priority-P1';
      case 'P2': return 'bg-priority-P2';
      default: return 'bg-gray-400';
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100 hover:border-gray-200 transition-all card-hover">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(complaint.priority)}`} title={`Priority: ${complaint.priority}`} />
          <span className="text-[10px] font-bold text-secondary uppercase tracking-tighter">
            {complaint.category}
          </span>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <Link to={`/complaint/${complaint.id}`} className="block group">
        <h3 className="text-lg font-semibold text-primary group-hover:text-accent-dept transition-colors line-clamp-1">
          {complaint.title}
        </h3>
        <p className="mt-2 text-sm text-secondary line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>
      </Link>

      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-secondary font-medium">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{timeAgo(complaint.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User size={14} />
            <span>{complaint.is_anonymous ? 'Anonymous' : (complaint.student_name || 'Uknown')}</span>
          </div>
        </div>
        
        <UpvoteButton 
          complaintId={complaint.id} 
          initialUpvotes={complaint.upvotes} 
          onUpvote={onUpvoteUpdate}
        />
      </div>
    </div>
  );
};

export default ComplaintCard;
