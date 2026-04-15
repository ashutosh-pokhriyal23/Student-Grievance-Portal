import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2, X, ArrowRight } from 'lucide-react';
import { updateComplaintStatus, getStatuses } from '../api/staff';
import { toast } from 'react-hot-toast';

const StatusUpdateDropdown = ({ complaintId, currentStatus, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [comment, setComment] = useState('');
  const [statuses, setStatuses] = useState([
    { id: 'created', label: 'New', color: 'bg-sky-600 text-white' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-indigo-600 text-white' },
    { id: 'on_hold', label: 'On Hold', color: 'bg-amber-500 text-white' },
    { id: 'resolved', label: 'Resolved', color: 'bg-emerald-600 text-white' },
    { id: 'closed', label: 'Closed', color: 'bg-purple-600 text-white' },
  ]);
  const dropdownRef = useRef(null);

  // Fetch dynamic statuses on mount (Enhancement)
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await getStatuses();
        if (res.data && res.data.length > 0) {
          setStatuses(res.data);
        }
      } catch (err) {
        console.warn('[Dropdown] Using fallback statuses as API fetch failed:', err.message);
      }
    };
    fetchStatuses();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen && !isConfirming) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isConfirming]);

  /* 
    DELETED HARDCODED STATUSES ARRAY
  */

  const handleSelectStatus = (id) => {
    setPendingStatus(id);
    setIsConfirming(true);
  };

  const handleUpdate = async () => {
    if (!comment.trim()) {
      toast.error('Please provide a brief explanation for this update.');
      return;
    }
    setLoading(true);
    try {
      await updateComplaintStatus(complaintId, { status: pendingStatus, comment });
      toast.success(`Status updated to ${pendingStatus.replace('_', ' ')}`);
      onUpdate();
      setIsOpen(false);
      setIsConfirming(false);
      setComment('');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const currentLabel = statuses.find(s => s.id === currentStatus || s.id.toLowerCase() === String(currentStatus || '').toLowerCase())?.label || currentStatus?.replace('_', ' ');

  const getStatusButtonStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === 'closed') return 'bg-purple-600 text-white border-transparent hover:bg-purple-700';
    if (s === 'resolved') return 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700';
    if (s === 'on_hold') return 'bg-amber-500 text-white border-transparent hover:bg-amber-600';
    if (s === 'in_progress' || s === 'assigned') return 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700';
    if (s === 'created') return 'bg-sky-600 text-white border-transparent hover:bg-sky-700';
    return 'bg-white border border-gray-100 text-primary hover:bg-gray-50';
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()} ref={dropdownRef}>
      {/* Dropdown Toggle */}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setIsConfirming(false); }}
        disabled={loading}
        className={`relative min-w-[140px] flex items-center justify-between px-5 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:pointer-events-none ${getStatusButtonStyles(currentStatus)}`}
      >
        <div className={`flex items-center justify-between w-full transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
          <span className="truncate pr-2 capitalize">{currentLabel}</span>
          <ChevronDown size={14} className="flex-shrink-0 opacity-40 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary/40" size={16} />
          </div>
        )}
      </button>

      {/* Status List Dropdown */}
      {isOpen && !isConfirming && (
        <div className="absolute top-full mt-3 left-0 w-64 bg-white border border-gray-100 rounded-[30px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.18)] p-2 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-1 bg-gradient-to-br from-white to-gray-50/50 rounded-[24px] p-1">
            <p className="text-[10px] font-black text-gray-900/40 uppercase tracking-[0.25em] py-3 px-4">Update Status</p>
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectStatus(s.id)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
                  currentStatus === s.id 
                    ? `${s.color} border border-current/10 opacity-30 cursor-not-allowed` 
                    : 'text-gray-900 hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-95'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal Overlay */}
      {isConfirming && (
        <div className="fixed inset-0 z-[10] flex items-center justify-center p-4 pt-44">
           {/* Simple Overlay */}
           <div 
             className="absolute inset-0 bg-black/30 transition-opacity duration-200" 
             onClick={(e) => { e.stopPropagation(); setIsConfirming(false); setIsOpen(false); }}
           />
           
           {/* Modal Body */}
           <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 z-10 transition-transform duration-200 border border-gray-100/50">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-black text-secondary/30 uppercase tracking-[0.2em] leading-none">Status Transition</p>
                    <div className="flex items-center gap-3">
                       <span className="text-[11px] font-black text-secondary/40 uppercase tracking-widest leading-none">{currentLabel}</span>
                       <ArrowRight size={14} className="text-secondary/20" />
                       <span className="text-[12px] font-black text-primary uppercase tracking-widest leading-none bg-primary/5 px-2 py-1 rounded-lg">
                          {statuses.find(s => s.id === pendingStatus)?.label || pendingStatus}
                       </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsConfirming(false)} 
                    className="p-3 bg-gray-50 hover:bg-red-50 text-secondary/40 hover:text-red-500 rounded-2xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                   <p className="text-[11px] font-black text-primary uppercase tracking-widest pl-1">Reason for Update <span className="text-red-500">*</span></p>
                   <div className="relative group">
                     <textarea
                        autoFocus
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="E.g. The replacement parts have been ordered and will arrive by tomorrow morning..."
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/5 focus:bg-white rounded-[32px] p-8 text-sm font-medium min-h-[180px] outline-none transition-all placeholder:text-secondary/20 leading-relaxed shadow-inner"
                     />
                   </div>
                </div>

                <div className="pt-2">
                   <button
                     onClick={handleUpdate}
                     disabled={loading || !comment.trim()}
                     className="w-full py-6 bg-primary text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_25px_50px_-15px_rgba(26,26,46,0.4)] hover:bg-black hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
                   >
                     {loading ? <Loader2 className="animate-spin mr-3" size={16} /> : 'Complete Status Update'}
                   </button>
                   <p className="text-center mt-6 text-[9px] font-bold text-secondary/30 uppercase tracking-widest">
                      This update will be visible to the student immediately.
                   </p>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StatusUpdateDropdown;
