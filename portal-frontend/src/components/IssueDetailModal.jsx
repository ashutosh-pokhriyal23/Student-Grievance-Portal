import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, Clock, ArrowDownCircle } from 'lucide-react';

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

const STATUS_STEPS = ['Created', 'In Progress', 'On Hold', 'Resolved', 'Closed'];

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
    assigned: 'In Progress', // Map assigned status to 'In Progress' for the student view
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
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (dateString) => {
  if (!dateString) return 'Unknown';
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const IssueDetailModal = ({ issue, isOpen, onClose }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 500);
    }
  }, [isOpen, issue?.status_history]);

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
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.16)] animate-in scale-in-95 fade-in duration-200 scroll-smooth">
        {/* Header with Close Button */}
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 p-6 bg-white border-b border-gray-100 shadow-sm">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-gray-50/50 rounded-[32px] border border-gray-100/50">
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.25em]">
                Submitted by
              </p>
              <p className="text-sm font-black text-primary truncate">
                {issue.is_anonymous ? 'Anonymous Member' : issue.submitted_by || issue.student_name || 'Verified User'}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.25em]">
                Reported Date
              </p>
              <p className="text-sm font-black text-primary">
                {formatDate(issue.created_at)}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.25em]">
                Exact Time
              </p>
              <p className="text-sm font-black text-primary">
                {formatTime(issue.created_at)}
              </p>
            </div>
          </div>

          {/* Status Timeline & Activity Feed */}
          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-[11px] font-black text-secondary tracking-[0.25em] uppercase mb-10">
              Activity History
            </h3>

            <div className="relative pl-8 space-y-12">
              {/* Vertical Line Connector */}
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-100" />

              {/* Status Update History (Loop) */}
              {Array.isArray(issue.status_history) && issue.status_history.length > 0 ? (
                issue.status_history.map((entry, index) => (
                  <div
                    key={index}
                    ref={index === issue.status_history.length - 1 ? scrollRef : null}
                    className="relative animate-in fade-in slide-in-from-left-4 duration-700"
                    style={{ animationDelay: `${(index + 1) * 150}ms` }}
                  >
                    {/* Indicator Dot */}
                    <div className={`absolute -left-[27px] top-1 w-[14px] h-[14px] rounded-full ring-4 shadow-sm ${
                      index === issue.status_history.length - 1 ? 'bg-indigo-600 ring-indigo-50' : 'bg-white border-2 border-gray-200 ring-gray-50'
                    }`} />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">
                          {entry.status?.replace('_', ' ')}
                        </p>
                      </div>

                      {entry.comment && (
                        <div className={`rounded-[28px] p-8 border relative group hover:bg-white transition-all shadow-sm flex flex-col items-center ${
                          entry.status === 'resolved' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-indigo-50/50 border-indigo-100'
                        }`}>
                          <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                            entry.status === 'resolved' ? 'bg-emerald-400' : 'bg-indigo-400'
                          }`} />
                          
                          <p className={`text-[15px] font-bold leading-relaxed text-center mb-8 max-w-[80%] ${
                            entry.status === 'resolved' ? 'text-emerald-900' : 'text-primary'
                          }`}>
                            {entry.comment}
                          </p>

                          <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-sm border ${
                            entry.status === 'resolved' 
                              ? 'bg-emerald-100/50 text-emerald-800 border-emerald-200/50' 
                              : 'bg-indigo-100/50 text-indigo-800 border-indigo-200/50'
                          }`}>
                            <span>{formatDate(entry.timestamp)}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${entry.status === 'resolved' ? 'bg-emerald-500/30' : 'bg-indigo-500/30'}`} />
                            <span>{formatTime(entry.timestamp)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (issue.status !== 'created' && (issue.latest_comment || issue.resolution_note)) && (
                <div 
                  ref={scrollRef}
                  className="relative animate-in fade-in slide-in-from-left-4 duration-700" 
                >
                  <div className="absolute -left-[27px] top-1 w-[14px] h-[14px] rounded-full bg-indigo-600 ring-4 ring-indigo-50 shadow-sm" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">
                        {issue.status?.replace('_', ' ')}
                      </p>
                    </div>

                    <div className="bg-indigo-50/50 rounded-[28px] p-8 border border-indigo-100 relative shadow-sm hover:bg-white transition-all flex flex-col items-center">
                      <p className="text-[15px] font-bold text-primary leading-relaxed text-center mb-8 max-w-[80%]">
                        {issue.latest_comment || issue.resolution_note}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-black text-indigo-800 bg-indigo-100/50 px-6 py-2.5 rounded-full border border-indigo-200/50 uppercase tracking-widest">
                        <span>{formatDate(issue.updated_at)}</span>
                        <span className="opacity-30">•</span>
                        <span>{formatTime(issue.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
