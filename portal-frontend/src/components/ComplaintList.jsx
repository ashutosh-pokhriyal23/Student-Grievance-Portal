import React from 'react';
import ComplaintCard from './ComplaintCard';
import { MousePointer2 } from 'lucide-react';

const ComplaintList = ({ complaints, onRefresh }) => {
  if (!complaints || complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
        <div className="p-4 bg-gray-50 rounded-full text-secondary mb-4">
          <MousePointer2 size={32} />
        </div>
        <h3 className="text-xl font-semibold text-primary">No complaints yet</h3>
        <p className="text-secondary mt-1">Be the first one to raise a concern in this space.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {complaints.map((complaint) => (
        <ComplaintCard 
          key={complaint.id} 
          complaint={complaint} 
          onUpvoteUpdate={onRefresh}
        />
      ))}
    </div>
  );
};

export default ComplaintList;
