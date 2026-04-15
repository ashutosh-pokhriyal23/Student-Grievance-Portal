import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  Infrastructure: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  Water: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300' },
  Electricity: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  Academic: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  Mess: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  Other: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
};

const PRIORITY_COLORS = {
  P0: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  P1: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  P2: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
};

const STATUS_COLORS = {
  Created: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Assigned: { bg: 'bg-sky-100', text: 'text-sky-700' },
  'In Progress': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'On Hold': { bg: 'bg-orange-100', text: 'text-orange-700' },
  Resolved: { bg: 'bg-green-100', text: 'text-green-700' },
  Closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

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
    assigned: 'In Progress',
    in_progress: 'In Progress',
    on_hold: 'On Hold',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return lookup[lower] || value || 'Created';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { 
    day: '2-digit',
    month: 'short',
    year: 'numeric' 
  });
};

const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const IssueCard = ({ issue, onCardClick, staggerIndex = 0 }) => {
  const categoryLabel = normalizeCategory(issue.category);
  const statusLabel = normalizeStatus(issue.status);
  const categoryColor = CATEGORY_COLORS[categoryLabel] || CATEGORY_COLORS.Other;
  const priorityColor = PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS.P2;
  const statusColor = STATUS_COLORS[statusLabel] || STATUS_COLORS.Created;

  const description = issue.description || '';
  const truncatedDescription = description.length > 100 
    ? description.substring(0, 100) + '...' 
    : description;

  return (
    <div
      onClick={onCardClick}
      className="group relative flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer"
      style={{
        animation: `issue-card-in 300ms ease-out ${staggerIndex * 40}ms forwards`,
      }}
    >
      {/* Priority Indicator Dot */}
      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${priorityColor.bg.replace('100', '600')}`} />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-primary line-clamp-1 group-hover:text-accent-dept transition-colors">
            {issue.title}
          </h3>
        </div>

        {/* Category, Priority, Status Badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}>
            {categoryLabel}
          </span>
          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded border ${priorityColor.bg} ${priorityColor.text} ${priorityColor.border}`}>
            {issue.priority}
          </span>
          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded border ${statusColor.bg} ${statusColor.text} border-transparent`}>
            {statusLabel}
          </span>
        </div>

        {/* Description Preview */}
        <p className="text-sm text-secondary line-clamp-2 mb-3">
          {truncatedDescription}
        </p>

        {/* Footer: Time, Author */}
        <div className="flex items-center justify-between text-[10px] text-secondary/60 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock size={12} className="opacity-40" />
              <span>{formatTime(issue.created_at)}</span>
              <span className="mx-1">•</span>
              <span>{formatDate(issue.created_at)}</span>
            </div>
            <span>
              by {issue.is_anonymous ? 'Anonymous' : issue.submitted_by || issue.student_name || 'Verified'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(IssueCard);
