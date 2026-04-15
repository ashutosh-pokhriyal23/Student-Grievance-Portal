import React, { useEffect, useState, useCallback } from 'react';
import { getStaffStats, getStaffComplaints, getStaffProfile } from '../api/staff';
import { getSpaces } from '../api/complaints';
import StatsCard from '../components/StatsCard';
import StaffComplaintCard from '../components/StaffComplaintCard';
import StaffNavbar from '../components/StaffNavbar';
import MaintainerAssignmentModal from '../components/MaintainerAssignmentModal';
import IssueDetailModal from '../components/IssueDetailModal';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Filter, 
  Search, 
  Loader2, 
  LayoutGrid,
  TrendingDown,
  Inbox,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Users
} from 'lucide-react';

const StaffDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection States
  const [assigningComplaint, setAssigningComplaint] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [filters, setFilters] = useState({
    space_id: '',
    status: '',
    priority: '',
    search: '',
  });

  // Sync selectedIssue with updated data when complaints array changes
  useEffect(() => {
    if (selectedIssue) {
      const updated = complaints.find(c => c.id === selectedIssue.id);
      if (updated) setSelectedIssue(updated);
    }
  }, [complaints, selectedIssue?.id]);

  const openAssignmentModal = (complaint = null) => {
    setAssigningComplaint(
      complaint || {
        id: null,
        title: 'New maintainer assignment',
        space_id: '',
        space: null,
      }
    );
  };

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, statsRes, complaintsRes, spacesRes] = await Promise.all([
        getStaffProfile(),
        getStaffStats(),
        getStaffComplaints(filters),
        getSpaces()
      ]);
      setProfile(profileRes.data);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
      setSpaces(spacesRes.data);
    } catch (error) {
      console.error('Failed to fetch staff data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-primary mb-4" size={48} />
      <p className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">Authorizing Workspace</p>
    </div>
  );

  const urgentIssues = complaints.filter(c => c.priority === 'P0' || c.is_escalated).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <StaffNavbar profile={profile} />

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Urgent Issues HUD */}
        {urgentIssues.length > 0 && (
          <div className="mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {urgentIssues.map(c => (
                 <div key={c.id} className="bg-white p-8 rounded-[40px] border border-red-100 shadow-[0_25px_60px_-15px_rgba(239,68,68,0.08)] flex items-center justify-between group">
                    <div className="flex-1">
                       <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-lg mb-3 inline-block">CRITICAL</span>
                       <h4 className="text-xl font-black text-primary group-hover:text-red-500 transition-colors leading-tight mb-2 truncate max-w-[200px] sm:max-w-md">
                          {c.title}
                       </h4>
                       <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest leading-none">
                          Space: {c.space?.name}
                       </p>
                    </div>
                    <button 
                      onClick={() => openAssignmentModal(c)}
                      className="shrink-0 p-5 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/30 hover:scale-110 active:scale-95 transition-all"
                    >
                      <ArrowRight size={24} />
                    </button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Intelligence Header & Export */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary rounded-2xl text-white shadow-xl shadow-primary/20">
                 <Sparkles size={18} />
              </div>
              <h3 className="text-2xl font-black text-primary tracking-tight">Workspace Insights</h3>
           </div>
           
           <button 
             onClick={() => openAssignmentModal(urgentIssues[0] || complaints[0])}
             className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-[0_20px_50px_-10px_rgba(26,26,46,0.3)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_-10px_rgba(26,26,46,0.5)] active:translate-y-0.5 active:shadow-inner border border-primary/10"
           >
              <Users size={18} className="transition-transform duration-500" />
              <span>Assign Maintainer</span>
           </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <StatsCard title="Total Assigned" value={stats?.total || 0} icon={Inbox} colorClass="bg-primary/5 text-primary" />
          <StatsCard title="Not Picked" value={stats?.open || 0} icon={Clock} colorClass="bg-amber-100/30 text-amber-600" />
          <StatsCard title="In Workspace" value={stats?.in_progress || 0} icon={CheckCircle2} colorClass="bg-blue-100/30 text-blue-600" />
          <StatsCard title="Past Deadline" value={stats?.escalated || 0} icon={AlertOctagon} colorClass="bg-red-100/30 text-red-600" />
        </div>

        {/* Filter Bar */}
        <div className={`sticky top-24 mb-12 transition-all duration-300 ${assigningComplaint ? 'z-0' : 'z-30'}`}>
          <div className="bg-white/60 backdrop-blur-3xl p-3 rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-white flex flex-col lg:flex-row items-center gap-4">
            <div className="relative w-full lg:w-1/3">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary opacity-30" size={18} />
              <input
                type="text"
                name="search"
                placeholder="Find specific issues..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-16 pr-6 py-4 bg-gray-50/50 border-none rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none tracking-tight"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-2/3">
              <select name="space_id" value={filters.space_id} onChange={handleFilterChange} className="w-full px-6 py-4 bg-gray-50/50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none appearance-none hover:bg-gray-100/50 cursor-pointer">
                <option value="">Space: All Units</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-6 py-4 bg-gray-50/50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none appearance-none hover:bg-gray-100/50 cursor-pointer">
                <option value="">Status: All</option>
                <option value="created">New</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">Working</option>
                <option value="resolved">Resolved</option>
              </select>
              <select name="priority" value={filters.priority} onChange={handleFilterChange} className="w-full px-6 py-4 bg-gray-50/50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none appearance-none hover:bg-gray-100/50 cursor-pointer">
                <option value="">Urgency: All</option>
                <option value="P0">P0 - Critical</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Normal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints Grid */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
           {complaints.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               {complaints.map(c => (
                 <StaffComplaintCard 
                   key={c.id} 
                   complaint={c} 
                   onUpdate={fetchData} 
                   onAssignClick={() => openAssignmentModal(c)}
                   onClick={() => setSelectedIssue(c)}
                 />
               ))}
             </div>
           ) : (
             <div className="text-center py-40 bg-white rounded-[48px] border-4 border-dashed border-gray-50 flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-secondary/10 mb-8 border border-gray-100">
                   <Inbox size={48} />
                </div>
                <h3 className="text-3xl font-black text-primary tracking-tight">Everything Clear</h3>
                <p className="mt-2 text-secondary font-medium">No grievances are currently requiring your attention.</p>
             </div>
           )}
        </div>
      </div>

      {/* Assignment Flow */}
      <MaintainerAssignmentModal 
        isOpen={!!assigningComplaint}
        onClose={() => setAssigningComplaint(null)}
        complaint={assigningComplaint}
        profile={profile}
        spaces={spaces}
        onAssigned={fetchData}
      />

      <IssueDetailModal 
        issue={selectedIssue}
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  );
};

export default StaffDashboard;
