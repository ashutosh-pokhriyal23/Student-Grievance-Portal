import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComplaints, getSpaces } from '../api/complaints';
import ComplaintList from '../components/ComplaintList';
import ComplaintForm from '../components/ComplaintForm';
import StudentNavbar from '../components/StudentNavbar';
import { ChevronLeft, Plus, Building2, Home, Loader2, RefreshCw } from 'lucide-react';

const SpacePage = () => {
  const { spaceId } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [complaintsRes, spacesRes] = await Promise.all([
        getComplaints(spaceId),
        getSpaces()
      ]);
      setComplaints(complaintsRes.data);
      setSpace(spacesRes.data.find(s => s.id === spaceId));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    fetchData();
  }, [spaceId, fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await getComplaints(spaceId);
      setComplaints(data);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-dept" size={40} />
      </div>
    );
  }

  if (!space) return <div>Space not found</div>;

  const isDept = space.type === 'department';
  const Icon = isDept ? Building2 : Home;

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Navigation */}
      <Link 
        to="/" 
        className="inline-flex items-center text-secondary hover:text-primary mb-8 font-medium transition-colors group"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${isDept ? 'bg-accent-dept/10 text-accent-dept' : 'bg-accent-hostel/10 text-accent-hostel'}`}>
              <Icon size={20} />
            </div>
            <span className="text-sm font-bold text-secondary uppercase tracking-widest">{space.type}</span>
          </div>
          <h1 className="text-4xl font-bold text-primary">{space.name}</h1>
          <p className="mt-2 text-secondary">
            Viewing all complaints raised for {space.name}. Help prioritize issues by upvoting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-white border border-gray-200 rounded-xl text-secondary hover:bg-gray-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/95 shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Raise a Complaint
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Complaints ({complaints.length})</h2>
          <div className="text-sm text-secondary font-medium">Sorted by: Newest first</div>
        </div>
        <ComplaintList complaints={complaints} onRefresh={handleRefresh} />
      </div>

      {/* Complaint Form Modal */}
      {showForm && (
        <ComplaintForm 
          spaceId={spaceId} 
          onOpenChange={setShowForm} 
          onSuccess={handleRefresh}
        />
      )}
      </div>
    </div>
  );
};

export default SpacePage;
