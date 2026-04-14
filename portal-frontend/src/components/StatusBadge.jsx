import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'created':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'assigned':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'in_progress':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'on_hold':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'resolved':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'closed':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(status)} capitalize`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
