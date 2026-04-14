import React, { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { updateComplaintStatus } from '../api/staff';
import { toast } from 'react-hot-toast';

const StatusUpdateDropdown = ({ complaintId, currentStatus, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const statuses = [
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700' },
    { id: 'on_hold', label: 'On Hold', color: 'bg-purple-50 text-purple-700' },
    { id: 'resolved', label: 'Resolved', color: 'bg-green-50 text-green-700' },
    { id: 'closed', label: 'Closed', color: 'bg-slate-50 text-slate-700' },
  ];

  const handleUpdate = async (status) => {
    setLoading(true);
    try {
      await updateComplaintStatus(complaintId, status);
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-primary hover:bg-gray-50 transition-all shadow-sm"
      >
        {loading ? (
          <Loader2 className="animate-spin text-accent-dept" size={16} />
        ) : (
          <>
            <span className="capitalize">{currentStatus?.replace('_', ' ')}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-soft p-1.5 z-50 animate-in fade-in zoom-in duration-200">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => handleUpdate(s.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all mb-0.5 last:mb-0 ${
                currentStatus === s.id 
                  ? `${s.color} border border-current opacity-60 pointer-events-none` 
                  : 'text-secondary hover:bg-gray-50 hover:text-primary'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusUpdateDropdown;
