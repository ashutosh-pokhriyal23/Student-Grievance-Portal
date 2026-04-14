import React from 'react';

const StatsCard = (props) => {
  const { title, value, icon: Icon, colorClass } = props;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-bold text-secondary uppercase tracking-wider leading-none mb-1">{title}</p>
        <p className="text-3xl font-black text-primary">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
