import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  getAdminOverview, 
  getAdminTrends, 
  getAdminPerformance, 
  getAdminEscalations, 
  getAdminCategories 
} from '../api/admin';
import AnalyticsCard from '../components/AnalyticsCard';
import PerformanceTable from '../components/PerformanceTable';
import EscalationPanel from '../components/EscalationPanel';
import { 
  Loader2, 
  BarChart3, 
  Activity, 
  UserCheck, 
  AlertTriangle, 
  Zap, 
  Calendar,
  ShieldCheck,
  LogOut,
  UserCircle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [performance, setPerformance] = useState({ departments: [], hostels: [] });
  const [escalations, setEscalations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [ov, tr, pr, es, cat] = await Promise.all([
        getAdminOverview(),
        getAdminTrends(),
        getAdminPerformance(),
        getAdminEscalations(),
        getAdminCategories()
      ]);
      setOverview(ov.data);
      setTrends(tr.data);
      setPerformance(pr.data);
      setEscalations(es.data);
      setCategories(cat.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fetchData]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
      <Loader2 className="animate-spin text-primary mb-4" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Securing Analytics...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/10 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h1 className="text-5xl font-black text-primary tracking-tighter leading-none mb-4">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">Command Center</span>
            </h1>
            <p className="text-lg text-secondary font-medium uppercase tracking-tight opacity-60">Global tracking and resolution monitoring for Director / Dean.</p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap justify-end">
             {/* Big Profile Avatar on the Left (Relative to actions) */}
             <div className="relative mr-4 pr-6 border-r border-gray-100" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-4 group"
                >
                  <div className="text-right">
                    <p className="text-[14px] font-black text-primary leading-tight uppercase tracking-tight">{user?.name || "ASHUTOSH POKHRIYAL"}</p>
                    <p className="text-[11px] font-bold text-secondary opacity-60">{user?.email || "ashupokhriyal810@gmail.com"}</p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 transition-all group-hover:shadow-md active:scale-95">
                    <UserCircle size={28} />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-4 w-56 bg-white border border-gray-100 rounded-3xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={logout}
                      className="w-full flex items-center justify-between px-5 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <span>Logout</span>
                      <LogOut size={16} />
                    </button>
                  </div>
                )}
             </div>

             <div className="flex items-center gap-3">
                <Link
                  to="/admin/spaces"
                  className="flex items-center space-x-2 px-6 py-4 bg-white border border-indigo-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-indigo-600 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm"
                >
                   <ShieldCheck size={14} />
                   <span>Space Heads</span>
                </Link>

                <button className="flex items-center space-x-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-secondary hover:text-primary transition-all shadow-sm">
                   <Calendar size={14} />
                   <span>Last 30 Days</span>
                </button>
             </div>
          </div>
        </div>

        {/* Global KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          <AnalyticsCard 
            title="Total Tickets" 
            value={overview?.total} 
            icon={BarChart3} 
            colorClass="bg-indigo-50 text-indigo-600" 
            subtitle="Global Count"
          />
          <AnalyticsCard 
            title="In Resolution" 
            value={overview?.active} 
            icon={Activity} 
            colorClass="bg-amber-50 text-amber-600" 
            subtitle="Backlog"
          />
          <AnalyticsCard 
            title="Success" 
            value={overview?.resolved} 
            icon={UserCheck} 
            colorClass="bg-green-50 text-green-600" 
            subtitle="Closed Issues"
          />
          <AnalyticsCard 
            title="Deadline Passed" 
            value={overview?.escalated} 
            icon={AlertTriangle} 
            colorClass="bg-red-50 text-red-600" 
            subtitle="Urgent Intervention"
          />
          <AnalyticsCard 
            title="On-Time Rate" 
            value={`${overview?.sla_compliance}%`} 
            icon={Zap} 
            colorClass="bg-blue-50 text-blue-600" 
            subtitle="Work Speed"
          />
        </div>

        {/* Performance Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <PerformanceTable title="Department Audit" data={performance.departments} />
          <PerformanceTable title="Hostel Audit" data={performance.hostels} />
        </div>

        {/* Secondary Row: Trends & Escalations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[32px] shadow-soft border border-gray-100">
               <h3 className="text-2xl font-black text-primary mb-8 tracking-tighter">Recent Trends</h3>
               <div className="flex items-end justify-between h-48 gap-2">
                 {trends.slice(-21).map((day, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                      <div className="relative w-full flex items-end justify-center h-32 gap-0.5">
                         <div 
                           className="w-full bg-indigo-100 rounded-t-md transition-all group-hover:bg-indigo-200"
                           style={{ height: `${(day.created / (Math.max(...trends.map(t => t.created)) || 1)) * 100}%` }}
                           title={`Created: ${day.created}`}
                         />
                         <div 
                           className="w-full bg-green-200 rounded-t-md transition-all group-hover:bg-green-300"
                           style={{ height: `${(day.resolved / (Math.max(...trends.map(t => t.created)) || 1)) * 100}%` }}
                           title={`Resolved: ${day.resolved}`}
                         />
                      </div>
                      <span className="text-[8px] font-black text-secondary/30 mt-2 uppercase tracking-tighter">
                         {day.date.split('-').slice(1).join('/')}
                      </span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <EscalationPanel escalations={escalations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
