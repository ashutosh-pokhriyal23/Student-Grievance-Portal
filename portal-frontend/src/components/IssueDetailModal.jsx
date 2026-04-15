import React, { useState, useEffect } from 'react';
import { X, ThumbsUp, CheckCircle, Clock } from 'lucide-react';
import { upvoteComplaint } from '../api/complaints';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  Infrastructure: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  Water: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  Electricity: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Academic: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Mess: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Other: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const PRIORITY_COLORS = {
  P0: { bg: 'bg-red-100', text: 'text-red-700' },
  P1: { bg: 'bg-amber-100', text: 'text-amber-700' },
  P2: { bg: 'bg-green-100', text: 'text-green-700' },
};

const STATUS_COLORS = {
  Created: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Assigned: { bg: 'bg-sky-100', text: 'text-sky-700' },
  'In Progress': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'On Hold': { bg: 'bg-orange-100', text: 'text-orange-700' },
  Resolved: { bg: 'bg-green-100', text: 'text-green-700' },
  Closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const STATUS_STEPS = ['Created', 'Assigned', 'In Progress', 'On Hold', 'Resolved', 'Closed'];

const normalizeCategory = (value) => {
  const lower = String(value || '').toLowerCase();
  const lookup = {
    infrastructure: 'Infrastructure',
    water: 'Water',
    electricity: 'Electricity',
    academic: 'Academic',
    mess: 'Mess',
    other: 'Other',
  };
  return lookup[lower] || value || 'Other';
};

const normalizeStatus = (value) => {
  const lower = String(value || '').toLowerCase();
  const lookup = {
    created: 'Created',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    on_hold: 'On Hold',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return lookup[lower] || value || 'Created';
};

const timeAgo = (date) => {
  if (!date) return 'recently';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const IssueDetailModal = ({ issue, isOpen, onClose, onUpvoteSuccess }) => {
  const [upvotes, setUpvotes] = useState(issue?.upvotes || 0);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (issue?.id) {
      const storedUpvotes = localStorage.getItem(`upvoted_${issue.id}`);
      setIsUpvoted(!!storedUpvotes);
    }
  }, [issue?.id]);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    
    if (isUpvoted) {
      toast.error('You already upvoted this issue');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await upvoteComplaint(issue.id);
      setUpvotes(data.upvotes);
      setIsUpvoted(true);
      localStorage.setItem(`upvoted_${issue.id}`, 'true');
      toast.success('Issue upvoted!');
      if (onUpvoteSuccess) onUpvoteSuccess(data);
    } catch (error) {
      console.error('Upvote failed:', error);
      toast.error('Failed to upvote');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !issue) return null;

  const categoryLabel = normalizeCategory(issue.category);
  const statusLabel = normalizeStatus(issue.status);
  const categoryColor = CATEGORY_COLORS[categoryLabel] || CATEGORY_COLORS.Other;
  const priorityColor = PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS.P2;
  const statusColor = STATUS_COLORS[statusLabel] || STATUS_COLORS.Created;
  const currentStatusIndex = STATUS_STEPS.indexOf(statusLabel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.16)] animate-in scale-in-95 fade-in duration-200">
        {/* Header with Close Button */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 bg-white border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-primary line-clamp-2">
              {issue.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Badges Row */}
          <div className="flex flex-wrap gap-3">
            <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${categoryColor.bg} ${categoryColor.text}`}>
              {categoryLabel}
            </span>
            <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${priorityColor.bg} ${priorityColor.text}`}>
              {issue.priority}
            </span>
            <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${statusColor.bg} ${statusColor.text}`}>
              {statusLabel}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">
              Description
            </h3>
            <p className="text-base text-primary leading-relaxed whitespace-pre-wrap">
              {issue.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">
                Submitted by
              </p>
              <p className="text-sm font-semibold text-primary">
                {issue.is_anonymous ? 'Anonymous' : issue.submitted_by || issue.student_name || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">
                Date
              </p>
              <p className="text-sm font-semibold text-primary">
                {timeAgo(issue.created_at)}
              </p>
            </div>
          </div>

          {/* Upvote Section */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleUpvote}
              disabled={isLoading || isUpvoted}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 font-semibold ${
                isUpvoted
                  ? 'bg-accent-dept/10 border-accent-dept text-accent-dept'
                  : 'bg-white border-gray-200 text-secondary hover:border-accent-dept hover:bg-accent-dept/5 hover:text-accent-dept'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsUp size={18} className={isUpvoted ? 'fill-current' : ''} />
              <span>{upvotes}</span>
            </button>
          </div>

          {/* Status Timeline */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-6">
              Status Timeline
            </h3>
            <div className="relative">
              <div className="flex items-center gap-4">
                {STATUS_STEPS.map((step, index) => (
                  <div key={step} className="flex flex-col items-center gap-2 flex-1">
                    {/* Circle */}
                    <div className="relative z-10 flex items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          index < currentStatusIndex
                            ? 'bg-accent-dept border-accent-dept'
                            : index === currentStatusIndex
                            ? 'bg-white border-accent-dept'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        {index < currentStatusIndex && (
                          <CheckCircle size={20} className="text-white" />
                        )}
                        {index === currentStatusIndex && (
                          <Clock size={18} className="text-accent-dept" />
                        )}
                      </div>
                    </div>
                    {/* Label */}
                    <span
                      className={`text-xs font-semibold text-center ${
                        index <= currentStatusIndex ? 'text-primary' : 'text-secondary'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              {/* Connecting Line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-dept via-accent-dept to-gray-300 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
