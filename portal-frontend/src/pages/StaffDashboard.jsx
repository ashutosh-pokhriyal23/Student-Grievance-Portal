import React, { useEffect, useState, useCallback } from 'react';
import { getStaffStats, getStaffComplaints } from '../api/staff';
import { getSpaces } from '../api/complaints';
import StatsCard from '../components/StatsCard';
import StaffComplaintCard from '../components/StaffComplaintCard';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Filter, 
  Search, 
  Loader2, 
  LayoutGrid,
  RefreshCw,
  TrendingUp,
  Inbox
} from 'lucide-react';

const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    space_id: '',
    status: '',
    priority: '',
    search: '',
  });

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [statsRes, complaintsRes, spacesRes] = await Promise.all([
        getStaffStats(),
        getStaffComplaints(filters),
        getSpaces()
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
      setSpaces(spacesRes.data);
    } catch (error) {
      console.error('Failed to fetch staff data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-accent-dept mb-4" size={48} />
        <p className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">Loading Workspace</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-dept/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-hostel/5 blur-[120px] rounded-full -ml-48 -mb-48" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-8">
          <div>
            <h1 className="text-5xl font-black text-primary tracking-tighter leading-none mb-4">
               Workspace <span className="text-accent-dept">Overview</span>
            </h1>
            <p className="text-lg text-secondary font-medium max-w-lg">
               System monitor for tracking resolutions and resolving on-time.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={fetchData}
                disabled={refreshing}
                className="group p-4 rounded-2xl bg-white border border-gray-100 text-secondary shadow-sm hover:shadow-md hover:text-primary transition-all active:scale-95"
                title="Sync Portal"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
              </button>
          </div>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatsCard 
            title="Total Tickets" 
            value={stats?.total || 0} 
            icon={Inbox} 
            colorClass="bg-primary/10 text-primary" 
          />
          <StatsCard 
            title="Not Picked" 
            value={stats?.open || 0} 
            icon={Clock} 
            colorClass="bg-amber-100/50 text-amber-600" 
          />
          <StatsCard 
            title="In Progress" 
            value={stats?.in_progress || 0} 
            icon={CheckCircle2} 
            colorClass="bg-blue-100/50 text-blue-600" 
          />
          <StatsCard 
            title="Deadline Passed" 
            value={stats?.escalated || 0} 
            icon={AlertOctagon} 
            colorClass="bg-red-100/50 text-red-600" 
          />
        </div>

        {/* Pro Filter Bar */}
        <div className="sticky top-24 z-30 mb-12">
          <div className="bg-white/80 backdrop-blur-2xl p-3 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col lg:flex-row items-center gap-4">
            <div className="relative w-full lg:w-1/3">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary opacity-40" size={20} />
              <input
                type="text"
                name="search"
                placeholder="Find specific issues..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-16 pr-6 py-4 bg-gray-50/50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-2/3">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary opacity-40 group-hover:text-primary transition-colors" size={16} />
                <select
                  name="space_id"
                  value={filters.space_id}
                  onChange={handleFilterChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none appearance-none hover:bg-gray-100/50 transition-all cursor-pointer"
                >
                  <option value="">Space: All Units</option>
                  {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="relative group">
                <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary opacity-40 group-hover:text-primary transition-colors" size={16} />
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none appearance-none hover:bg-gray-100/50 transition-all cursor-pointer"
                >
                  <option value="">Sort: All Status</option>
                  <option value="created">New Entries</option>
                  <option value="in_progress">Work in Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed Archive</option>
                </select>
              </div>
              <div className="relative group">
                <AlertOctagon className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary opacity-40 group-hover:text-primary transition-colors" size={16} />
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none appearance-none hover:bg-gray-100/50 transition-all cursor-pointer"
                >
                  <option value="">Urgency: All</option>
                  <option value="P0">P0 - Critical</option>
                  <option value="P1">P1 - High Priority</option>
                  <option value="P2">P2 - Standard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
           {complaints.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {complaints.map(complaint => (
                 <StaffComplaintCard 
                   key={complaint.id} 
                   complaint={complaint} 
                   onUpdate={fetchData} 
                 />
               ))}
             </div>
           ) : (
             <div className="text-center py-40 bg-white/50 backdrop-blur-sm rounded-[48px] border-4 border-dashed border-gray-100 flex flex-col items-center">
               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-secondary/30 mb-8 border border-gray-200 shadow-inner">
                  <Inbox size={48} />
               </div>
               <h3 className="text-3xl font-black text-primary tracking-tight mb-3">Workspace Clear</h3>
               <p className="mt-2 text-secondary font-medium">Manage grievances and resolve on-time efficiently.</p>
               <p className="text-secondary font-medium max-w-sm mx-auto leading-relaxed">
                  No grievances found matching these parameters. Try adjusting your filters or search terms.
               </p>
               <button 
                  onClick={() => setFilters({ space_id: '', status: '', priority: '', search: '' })}
                  className="mt-8 px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-lg transition-all"
               >
                  Reload Workspace
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
