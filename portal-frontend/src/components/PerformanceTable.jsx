import React from 'react';

const PerformanceTable = ({ title, data }) => {
  // Helper to determine status based on performance metrics
  const getStatusDetails = (item) => {
    if (!item) return { label: "N/A", description: "No data", color: "gray", icon: "⚪" };
    
    const active = item.active || 0;
    const onTime = item.sla_compliance; // Could be 0, 100, or undefined/null
    
    // CASE 1: Perfect Clean Slate (No active issues, perfect history OR no history yet)
    if (active === 0 && (onTime === 100 || onTime === 0 || onTime === null)) {
      return {
        label: "On Track",
        description: "All operations on schedule, no pending issues",
        color: "green",
        icon: "🟢"
      };
    }

    // CASE 2: Active Work, No Missed Deadlines
    // If they have active work and their on-time rate is 100% (or they have no history yet but are working)
    if (active > 0 && (onTime === 100 || onTime === 0 || onTime === null)) {
      return {
        label: "In Progress",
        description: "Issues are being handled on time",
        color: "blue",
        icon: "🔵"
      };
    }

    // CASE 3: Performance Warning (History shows slips)
    if (onTime < 100 && onTime >= 50) {
      return {
        label: "Delayed",
        description: "Some tasks are running behind schedule",
        color: "amber",
        icon: "🟡"
      };
    }

    // CASE 4: Critical Backlog (SLA compliance is very low)
    return {
      label: "Overloaded",
      description: "High backlog, performance below expectations",
      color: "red",
      icon: "🔴"
    };
  };

  return (
    <div className="bg-white rounded-[32px] shadow-soft border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-xl font-black text-primary uppercase tracking-tight">{title}</h3>
      </div>

      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left table-fixed min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-4 w-1/4 text-[10px] font-black text-secondary uppercase tracking-widest">Name</th>
              <th className="px-8 py-4 w-[10%] text-[10px] font-black text-secondary uppercase tracking-widest text-center">Active</th>
              <th className="px-8 py-4 w-[15%] text-[10px] font-black text-secondary uppercase tracking-widest text-center">Time (Hrs)</th>
              <th className="px-8 py-4 w-[12%] text-[10px] font-black text-secondary uppercase tracking-widest text-center">On-Time %</th>
              <th className="px-8 py-4 w-[38%] text-[10px] font-black text-secondary uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => {
              const status = getStatusDetails(item);
              return (
                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-primary truncate" title={item.name}>
                    {item.name}
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-secondary text-center">
                    {item.active}
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-secondary text-center">
                    {item.avg_resolution_time === 0 ? "0" : item.avg_resolution_time}
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-primary text-center">
                    {item.sla_compliance}%
                  </td>
                  <td className="px-8 py-5">
                     <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                           <span className="text-[12px]">{status.icon}</span>
                           <span className={`text-[10px] font-black uppercase tracking-[0.1em] text-${status.color}-600`}>
                              {status.label}
                           </span>
                        </div>
                        <p className="text-[9px] font-medium text-secondary/60 mt-1 leading-tight">
                           {status.description}
                        </p>
                     </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceTable;
