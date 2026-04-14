import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStaffComplaints } from '../api/staff';
import { getSpaces } from '../api/complaints';
import StaffComplaintCard from '../components/StaffComplaintCard';
import { ChevronLeft, LayoutGrid, Loader2 } from 'lucide-react';

const StaffSpaceView = () => {
  const { id } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [compRes, spaceRes] = await Promise.all([
        getStaffComplaints({ space_id: id }),
        getSpaces()
      ]);
      setComplaints(compRes.data);
      setSpace(spaceRes.data.find(s => s.id === id));
    } catch (error) {
      console.error('Failed to fetch space data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent-dept" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/staff" className="inline-flex items-center text-secondary hover:text-primary mb-8 font-bold transition-all">
        <ChevronLeft size={20} className="mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-primary/5 text-primary rounded-lg uppercase text-[10px] font-black tracking-widest border border-primary/10">
            {space?.type}
          </div>
        </div>
        <h1 className="text-4xl font-black text-primary tracking-tight">{space?.name} Management</h1>
        <p className="mt-2 text-secondary font-medium">Resolving {complaints.length} tickets in this department.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {complaints.map(c => (
          <StaffComplaintCard key={c.id} complaint={c} onUpdate={fetchData} />
        ))}
      </div>
      
      {complaints.length === 0 && (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100 italic text-secondary">
          No complaints reported for this space yet.
        </div>
      )}
    </div>
  );
};

export default StaffSpaceView;
