import React from 'react';

const AnalyticsCard = (props) => {
  const { title, value, icon: Icon, colorClass, subtitle } = props;
  return (
    <div className="bg-white p-8 rounded-[32px] shadow-soft border border-gray-100 flex flex-col justify-between h-full group hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="flex justify-between gap-10 items-center mb-6">
        <div className={`p-4 rounded-2xl ${colorClass} transition-transform group-hover:scale-110`}>
          <Icon size={24} />
        </div>
        {subtitle && (
          <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40">
            {subtitle}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-2">{title}</p>
        <p className="text-xl font-black text-secondary tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

export default AnalyticsCard;
