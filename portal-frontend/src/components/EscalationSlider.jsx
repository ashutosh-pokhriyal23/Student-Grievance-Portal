import React, { useRef } from 'react';
import { CheckCircle2, Clock, User, Building2, ChevronRight, ChevronLeft } from 'lucide-react';

const EscalationSlider = ({ escalations }) => {
  const scrollContainer = useRef(null);

  const scroll = (direction) => {
    if (scrollContainer.current) {
      const { scrollLeft, clientWidth } = scrollContainer.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainer.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!escalations || escalations.length === 0) {
    return (
      <div className="mb-16 bg-white rounded-[32px] p-12 border border-gray-100 flex flex-col items-center justify-center text-center shadow-soft">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-black text-primary tracking-tight">System Status: Optimal</h3>
        <p className="text-secondary/60 font-medium mt-2">No active escalations. System is running smoothly within deadline limits.</p>
      </div>
    );
  }

  return (
    <div className="mb-16 relative">
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tighter flex items-center gap-3">
            Intervention Required
            <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-full border border-red-100 animate-pulse">
              {escalations.length} Active Breaches
            </span>
          </h2>
          <p className="text-[12px] text-secondary font-bold uppercase tracking-widest mt-1 opacity-60">Real-time live operational monitoring</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-3 bg-white border border-gray-100 rounded-full hover:bg-gray-50 transition-colors shadow-sm active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll('right')} className="p-3 bg-white border border-gray-100 rounded-full hover:bg-gray-50 transition-colors shadow-sm active:scale-90">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainer}
        className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {escalations.map((item) => {
          const isCritical = item.priority === 'High' || item.status === 'Overloaded';
          
          return (
            <div 
              key={item.id} 
              className="flex-none w-[380px] snap-start bg-white rounded-[32px] p-8 border border-gray-100 shadow-soft hover:shadow-xl hover:border-indigo-100 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  item.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                  item.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  {item.priority} Priority
                </span>
                <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">
                  #{item.id?.toString().slice(-4)}
                </span>
              </div>

              <h3 className="text-lg font-black text-primary tracking-tight mb-4 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {item.title || "Issue Title Undefined"}
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-secondary/60">
                  <Building2 size={16} className="text-gray-300" />
                  <span className="text-[13px] font-bold">{item.space_name || "Department / Hostel"}</span>
                </div>
                <div className="flex items-center gap-3 text-secondary/60">
                  <User size={16} className="text-gray-300" />
                  <span className="text-[13px] font-bold">{item.assigned_to || "No Lead Assigned"}</span>
                </div>
                <div className="flex items-center gap-3 text-secondary/60">
                  <Clock size={16} className="text-gray-300" />
                  <span className="text-[13px] font-bold">Due: {item.deadline_time || "4:00 PM Today"}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isCritical ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    isCritical ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {item.status || "Delayed"}
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-gray-50 rounded-xl">
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                      {item.delay_indicator || "2 hrs overdue"}
                   </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EscalationSlider;
