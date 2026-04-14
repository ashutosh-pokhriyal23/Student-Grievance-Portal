import React from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

const PerformanceTable = ({ title, data }) => {
  return (
    <div className="bg-white rounded-[32px] shadow-soft border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-xl font-black text-primary uppercase tracking-tight">{title}</h3>
        <button className="text-[10px] font-black text-secondary hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-[0.2em]">
          Detailed Audit <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Name</th>
              <th className="px-8 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Active</th>
              <th className="px-8 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Avg Time</th>
              <th className="px-8 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">On-Time %</th>
              <th className="px-8 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-8 py-5 text-sm font-bold text-primary">{item.name}</td>
                <td className="px-8 py-5 text-sm font-medium text-secondary">{item.active} / {item.total}</td>
                <td className="px-8 py-5 text-sm font-medium text-secondary">{item.avg_resolution_time}h</td>
                <td className="px-8 py-5 text-sm font-black text-primary">{item.sla_compliance}%</td>
                <td className="px-8 py-5">
                   <div className="flex items-center space-x-2">
                     <div className={`w-2 h-2 rounded-full ${
                       item.status === 'good' ? 'bg-green-500' : 
                       item.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                     } animate-pulse`} />
                     <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                       item.status === 'good' ? 'text-green-600' : 
                       item.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                     }`}>
                       {item.status}
                     </span>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceTable;
