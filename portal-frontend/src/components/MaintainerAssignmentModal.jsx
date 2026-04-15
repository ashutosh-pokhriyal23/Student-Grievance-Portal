import React, { useState, useEffect, useMemo } from 'react';
import { X, Building2, User, ChevronDown, Loader2, Info, Users, CheckCircle2, MapPin, Sparkles, GraduationCap, Hash } from 'lucide-react';
import { getMaintainers, assignMaintainer } from '../api/staff';

const BRANCH_OPTIONS = [
  'Applied Science Department (ASD)',
  'Computer Science & Engineering (CSE)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical Engineering (EE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Chemical Engineering (CHE)',
  'Biotechnology (BT)',
];

const CATEGORY_OPTIONS = [
  { id: 'department', label: 'Departments' },
  { id: 'hostel', label: 'Hostels' },
  { id: 'facility', label: 'Facilities' },
  { id: 'career', label: 'Career' },
  { id: 'administrative', label: 'Admin' },
  { id: 'sports', label: 'Sports' },
  { id: 'cultural', label: 'Cultural' },
];

const MaintainerAssignmentModal = ({ isOpen, onClose, complaint, onAssigned, spaces = [] }) => {
  const [maintainerName, setMaintainerName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [rollSuffix, setRollSuffix] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState('');

  const [loading, setLoading] = useState(false);

  // EXTREMELY ROBUST MAPPING - guaranteed to find units
  const filteredSpaces = useMemo(() => {
    if (!selectedCategoryId) return [];
    
    // Normalize category ID
    const catId = selectedCategoryId.toLowerCase();
    const allSpaces = Array.isArray(spaces) ? spaces : [];
    
    return allSpaces.filter(s => {
      const type = (s.type || '').toLowerCase();
      const name = (s.name || '').toLowerCase();
      
      // 1. Direct type match
      if (type === catId) return true;
      
      // 2. Plural/Singular Type Match
      if (type === 'hostels' && catId === 'hostel') return true;
      if (type === 'hostel' && catId === 'hostels') return true;

      // 3. String Inclusion Fallback (HEAVY)
      if (catId === 'hostel' && (name.includes('hostel') || name.includes('bh') || name.includes('dh'))) return true;
      if (catId === 'department' && (name.includes('dept') || name.includes('department') || name.includes('engineering'))) return true;
      if (catId === 'sports' && (name.includes('gym') || name.includes('sport') || name.includes('fitness'))) return true;
      if (catId === 'facility' && (name.includes('library') || name.includes('centre') || name.includes('cbc'))) return true;
      
      return false;
    });
  }, [spaces, selectedCategoryId]);

  useEffect(() => {
    if (isOpen) {
      setMaintainerName('');
      setSelectedBranch('');
      setRollSuffix('');
      setSelectedCategoryId('');
      setSelectedSpaceId('');
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      if (complaint?.space_id) {
        const s = spaces.find(sp => sp.id === complaint.space_id);
        if (s) {
          const type = (s.type || '').toLowerCase();
          if (CATEGORY_OPTIONS.some(c => c.id === type)) setSelectedCategoryId(type);
          setSelectedSpaceId(s.id);
        }
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, complaint, spaces]);

  useEffect(() => {
    if (selectedSpaceId) {
      const fetchCurrent = async () => {
        try {
          const res = await getMaintainers(selectedSpaceId);
          if (res.data && res.data[0]) {
             const m = res.data[0];
             setMaintainerName(m.name || '');
             setRollSuffix(m.roll_suffix || '');
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchCurrent();
    }
  }, [selectedSpaceId]);

  const handleAssign = async () => {
    if (!selectedSpaceId || !maintainerName) return;
    setLoading(true);
    try {
      const res = await getMaintainers(selectedSpaceId);
      const maintainerId = res.data?.[0]?.id;
      if (maintainerId && complaint?.id) {
        await assignMaintainer(complaint.id, maintainerId);
        onAssigned();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* EXTREMELY HIGH Z-INDEX + OPAQUE BACKDROP */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
      
      {/* MODAL CONTAINER - Ensuring it handles internal scrolling properly */}
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col animate-in zoom-in-95 duration-500 overflow-hidden border border-white">
        
        {/* HEADER */}
        <div className="px-8 py-8 border-b border-gray-100 bg-white flex items-center justify-between shrink-0 z-10">
           <div className="flex items-center gap-4">
              <div className="p-3.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                 <Users size={24} />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Assign Maintainer</h3>
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-2">Authority Delegation</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2.5 rounded-full hover:bg-slate-50 transition-all text-slate-300 hover:text-slate-900 border border-transparent hover:border-slate-100">
              <X size={22} />
           </button>
        </div>

        {/* SCROLLABLE FORM CONTENT - Clean & Smooth */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar overscroll-contain">
           
           {/* SECTION 1: IDENTITY */}
           <div className="space-y-6">
              <div className="flex items-center gap-3 pl-1 mb-2">
                 <div className="w-1.5 h-4 bg-primary rounded-full" />
                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Personnel Identity</label>
              </div>
              
              <div className="space-y-4">
                 <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="text"
                      placeholder="Personnel Full Name"
                      value={maintainerName}
                      onChange={(e) => setMaintainerName(e.target.value)}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[28px] text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all shadow-sm placeholder:text-slate-300"
                    />
                 </div>

                 <div className="relative group">
                    <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <select 
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full pl-16 pr-12 py-5 bg-slate-50 border-2 border-slate-50 rounded-[28px] text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all appearance-none cursor-pointer shadow-sm"
                    >
                       <option value="">Choose Branch...</option>
                       {BRANCH_OPTIONS.map(b => (
                         <option key={b} value={b}>{b}</option>
                       ))}
                    </select>
                 </div>

                 <div className="relative group">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="text"
                      maxLength="2"
                      placeholder="Roll Number (Last 2 Digits)"
                      value={rollSuffix}
                      onChange={(e) => setRollSuffix(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[28px] text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all shadow-sm placeholder:text-slate-300"
                    />
                 </div>
              </div>
           </div>

           {/* SECTION 2: CATEGORY & SPACE */}
           <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 pl-1 mb-2">
                 <div className="w-1.5 h-4 bg-primary rounded-full" />
                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Responsibility Domain</label>
              </div>
              
              <div className="space-y-5">
                 <div className="relative group">
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <select 
                      value={selectedCategoryId}
                      onChange={(e) => {
                         setSelectedCategoryId(e.target.value);
                         setSelectedSpaceId('');
                      }}
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-200 rounded-[28px] text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                    >
                       <option value="">Select Category...</option>
                       {CATEGORY_OPTIONS.map(c => (
                         <option key={c.id} value={c.id}>{c.label}</option>
                       ))}
                    </select>
                 </div>

                 <div className="relative group">
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <select 
                      disabled={!selectedCategoryId}
                      value={selectedSpaceId}
                      onChange={(e) => setSelectedSpaceId(e.target.value)}
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-200 rounded-[28px] text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-40 shadow-sm"
                    >
                       <option value="">Select Space...</option>
                       {filteredSpaces.map(s => (
                         <option key={s.id} value={s.id}>{s.name}</option>
                       ))}
                    </select>
                 </div>
                 {selectedCategoryId && filteredSpaces.length === 0 && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-2">
                       <Info size={14} className="text-red-400" />
                       <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">No units found in {selectedCategoryId}</p>
                    </div>
                 )}
              </div>
           </div>

           {/* FOOTER ADVISORY */}
           <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-start gap-4 shadow-inner">
              <div className="p-2.5 bg-white rounded-xl shadow-sm text-primary">
                 <Info size={20} />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                 Delegating a maintainer authorizes them to update status for the selected space. Final oversight remains yours.
              </p>
           </div>
        </div>

        {/* FOOTER ACTIONS - Solid & Smooth */}
        <div className="px-8 py-8 border-t border-gray-100 bg-white grid grid-cols-1 gap-3 shrink-0 z-10">
           <button 
             onClick={handleAssign}
             disabled={loading || !selectedSpaceId || !maintainerName}
             className="w-full py-5 bg-primary text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.25em] shadow-[0_20px_50px_-10px_rgba(26,26,46,0.35)] hover:shadow-[0_25px_60px_-10px_rgba(26,26,46,0.5)] active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3"
           >
             {loading ? <Loader2 size={18} className="animate-spin" /> : <>Confirm Assignment <CheckCircle2 size={18} /></>}
           </button>
           <button 
             onClick={onClose}
             className="w-full py-4 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest transition-colors"
           >
              Dismiss
           </button>
        </div>
      </div>
    </div>
  );
};

export default MaintainerAssignmentModal;
