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
import EscalationSlider from '../components/EscalationSlider';
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

      // Strict safety checks to prevent crashes
      setOverview(ov?.data || null);
      setTrends(Array.isArray(tr?.data) ? tr.data : []);
      setPerformance({
        departments: Array.isArray(pr?.data?.departments) ? pr.data.departments : [],
        hostels: Array.isArray(pr?.data?.hostels) ? pr.data.hostels : []
      });
      setEscalations(Array.isArray(es?.data) ? es.data : []);
      setCategories(Array.isArray(cat?.data) ? cat.data : []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      // Ensure state remains valid even on error
      setPerformance({ departments: [], hostels: [] });
      setTrends([]);
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
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-10">

        {/* TOP LEVEL: PROFILE IDENTITY */}
        <div className="flex items-start justify-between mb-16">
          <div className="border-l-4 border-indigo-600 pl-8">
            <h1 className="text-[52px] font-black text-primary tracking-tighter leading-[0.9] mb-4">
              Admin <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-100">Command Center</span>
            </h1>
          </div>

          <div className="relative pt-2" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-5 group p-2 -m-2 rounded-[32px] transition-all duration-300"
            >
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <ChevronDown size={14} className={`text-indigo-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  <h2 className="text-[22px] font-black text-primary tracking-tighter leading-none uppercase">
                    {user?.name || "Administrator"}
                  </h2>
                </div>
                <p className="text-[12px] font-bold text-secondary/50 mt-1.5 lowercase tracking-wide">
                  {user?.email}
                </p>
              </div>
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 p-[2px] shadow-lg shadow-indigo-200">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-indigo-600">
                  <UserCircle size={32} />
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-4 w-64 bg-white border border-gray-100 rounded-[30px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] p-2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="overflow-hidden bg-gray-50/50 rounded-[24px]">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-between px-6 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all rounded-[24px]"
                  >
                    <span>Dismiss Session</span>
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS HUB */}
        <div className="flex items-center gap-4 mb-20">
          <Link
            to="/admin/spaces"
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all active:scale-95"
          >
            <ShieldCheck size={18} />
            <span>Space Heads</span>
          </Link>

          <button className="flex items-center gap-3 px-10 py-5 bg-white border-2 border-gray-100 text-primary rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] shadow-sm hover:border-indigo-100 hover:text-indigo-600 transition-all active:scale-95">
            <Calendar size={18} />
            <span>Last 30 Days Report</span>
          </button>
        </div>

        {/* STATS KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
          <AnalyticsCard
            title="Total Tickets"
            value={overview?.total}
            icon={BarChart3}
            colorClass="bg-indigo-50 text-indigo-600"
            subtitle="Global Count"
          />
          <AnalyticsCard
            title="In Progress"
            value={overview?.active}
            icon={Activity}
            colorClass="bg-yellow-50 text-yellow-600"
            subtitle="Active"
          />
          <AnalyticsCard
            title="Resolved Issues"
            value={overview?.resolved}
            icon={UserCheck}
            colorClass="bg-green-50 text-green-600"
            subtitle="Completed"
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

        {/* DYNAMIC ESCALATION SLIDER (Now Above Performance & Trends) */}
        <EscalationSlider escalations={escalations} />

        {/* PERFORMANCE TABLES Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
          <PerformanceTable title="Department Audit" data={performance.departments} />
          <PerformanceTable title="Hostel Audit" data={performance.hostels} />
        </div>

        {/* HISTORICAL TRENDS (At the lowest section) */}
        <div className="bg-white p-10 rounded-[40px] shadow-soft border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-primary tracking-tighter">Velocity Trends</h3>
              <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest mt-1">Resolution throughput / 21 Day window</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-200 rounded-sm" />
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary/60">New</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-300 rounded-sm" />
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary/60">Resolved</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between h-64 gap-3">
            {trends.slice(-21).map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                <div className="relative w-full flex items-end justify-center h-48 gap-1">
                  <div
                    className="w-full bg-indigo-50 rounded-t-lg transition-all group-hover:bg-indigo-100 group-hover:scale-x-110"
                    style={{ height: `${(day.created / (Math.max(...trends.map(t => t.created)) || 1)) * 100}%` }}
                    title={`Created Date: ${day.date}`}
                  />
                  <div
                    className="w-full bg-green-200 rounded-t-lg transition-all group-hover:bg-green-300 group-hover:scale-x-110"
                    style={{ height: `${(day.resolved / (Math.max(...trends.map(t => t.created)) || 1)) * 100}%` }}
                    title={`Resolved Date: ${day.date}`}
                  />
                </div>
                <div className="h-0.5 w-full bg-gray-50 mt-4 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-200 w-0 group-hover:w-full transition-all duration-500" />
                </div>
                <span className="text-[9px] font-black text-secondary/30 mt-3 uppercase tracking-tighter">
                  {day.date.split('-').slice(1).join('/')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
