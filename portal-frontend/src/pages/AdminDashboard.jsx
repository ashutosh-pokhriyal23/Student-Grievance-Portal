import React, { useEffect, useState, useCallback } from 'react';
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
  Download,
  Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [performance, setPerformance] = useState({ departments: [], hostels: [] });
  const [escalations, setEscalations] = useState([]);
  const [categories, setCategories] = useState([]);

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
  }, [fetchData]);

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8,Category,Count\n" + 
      categories.map(c => `${c.category},${c.count}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "college_grievances_audit.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
      <Loader2 className="animate-spin text-primary mb-4" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Securing Analytics...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/20 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h1 className="text-5xl font-black text-primary tracking-tighter leading-none mb-4">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">Command Center</span>
            </h1>
            <p className="text-lg text-secondary font-medium">Global tracking and resolution monitoring for Director / Dean.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center space-x-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-secondary hover:text-primary transition-all shadow-sm">
                <Calendar size={14} />
                <span>Last 30 Days</span>
             </button>
             <button 
                onClick={exportData}
                className="flex items-center space-x-2 px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:shadow-xl hover:scale-105 transition-all"
             >
                <Download size={14} />
                <span>Export Audit</span>
             </button>
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
            {/* Simple Trends (CSS Bar Chart) */}
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
               <div className="flex items-center space-x-6 mt-8 pt-6 border-t border-gray-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-100 rounded-sm" />
                    <span className="text-[10px] font-black uppercase text-secondary tracking-widest">New Issues</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-200 rounded-sm" />
                    <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Resolved</span>
                  </div>
               </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <EscalationPanel escalations={escalations} />
            
            {/* Top Categories */}
            <div className="mt-10 bg-white p-8 rounded-[32px] shadow-soft border border-gray-100">
               <h3 className="text-xl font-black text-primary mb-6 tracking-tight">Top Recurring Issues</h3>
               <div className="space-y-4">
                 {categories.slice(0, 5).map((cat, i) => (
                   <div key={i}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-black uppercase tracking-widest text-secondary">{cat.category}</span>
                        <span className="text-sm font-black text-primary">{cat.count} Issues</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-primary" 
                           style={{ width: `${(cat.count / categories[0].count) * 100}%` }} 
                         />
                      </div>
                      <p className="text-[10px] font-medium text-secondary/60 mt-1 uppercase tracking-tight">
                        Mainly in: <span className="font-bold text-primary">{cat.top_space}</span>
                      </p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
