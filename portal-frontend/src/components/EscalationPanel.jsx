import React from 'react';
import { AlertCircle, Clock, ChevronRight } from 'lucide-react';

const EscalationPanel = ({ escalations }) => {
  return (
    <div className="bg-white rounded-[32px] border border-red-100 overflow-hidden shadow-[0_20px_50px_rgba(239,68,68,0.05)]">
      <div className="p-8 border-b border-red-50 bg-red-50/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-primary">Intervention Required</h3>
            <p className="text-xs font-bold text-red-600/70 uppercase tracking-widest leading-none mt-1">
              {escalations.length} Deadline Breaches
            </p>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto no-scrollbar">
        {escalations.map((item) => (
          <div key={item.id} className="p-6 hover:bg-red-50/10 transition-colors group">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest bg-red-500 text-white shadow-sm`}>
                    {item.priority}
                  </span>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                    {item.space?.name}
                  </span>
                </div>
                <h4 className="text-md font-bold text-primary group-hover:text-red-600 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center mt-3 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                  <Clock size={12} className="mr-1" />
                  <span>Crossed Deadline by {item.overdue_time} hours</span>
                </div>
              </div>
              <div className="p-2 rounded-full border border-gray-100 group-hover:bg-red-500 group-hover:text-white transition-all">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        ))}

        {escalations.length === 0 && (
          <div className="p-12 text-center text-secondary font-medium">
            No active escalations. System operating within Deadline limits.
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalationPanel;
