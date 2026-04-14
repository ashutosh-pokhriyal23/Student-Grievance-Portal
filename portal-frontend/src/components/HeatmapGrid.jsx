import React from 'react';

const HeatmapGrid = ({ departments, hostels }) => {
  const allSpaces = [...departments, ...hostels];

  // Helper to determine intensity color
  const getIntensity = (count) => {
    if (count === 0) return 'bg-gray-100 text-gray-400';
    if (count < 3) return 'bg-indigo-100 text-indigo-700';
    if (count < 7) return 'bg-indigo-300 text-indigo-900';
    if (count < 12) return 'bg-indigo-500 text-white';
    return 'bg-indigo-700 text-white';
  };

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-soft border border-gray-100">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-black text-primary tracking-tighter">Campus Load Heatmap</h3>
          <p className="text-sm text-secondary font-medium">Visualizing grievance density across all college units.</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-1.5 grayscale opacity-50">
             <div className="w-3 h-3 bg-indigo-100 rounded-sm" />
             <div className="w-3 h-3 bg-indigo-300 rounded-sm" />
             <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
             <div className="w-3 h-3 bg-indigo-700 rounded-sm" />
           </div>
           <span className="text-[10px] font-black uppercase text-secondary tracking-widest leading-none mt-0.5">Intensity Scale</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {allSpaces.map((space) => (
          <div 
            key={space.id}
            className={`p-4 rounded-2xl flex flex-col justify-center items-center text-center transition-all hover:scale-105 cursor-help min-h-[100px] ${getIntensity(space.total)}`}
            title={`${space.name}: ${space.total} complaints`}
          >
            <span className="text-[10px] font-black uppercase tracking-tight line-clamp-2 leading-tight mb-2">
              {space.name.split(' (')[0]}
            </span>
            <span className="text-xl font-black leading-none">{space.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapGrid;
