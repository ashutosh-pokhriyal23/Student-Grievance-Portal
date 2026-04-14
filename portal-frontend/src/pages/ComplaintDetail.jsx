import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComplaintById } from '../api/complaints';
import StatusBadge from '../components/StatusBadge';
import UpvoteButton from '../components/UpvoteButton';
import { ChevronLeft, Clock, User, Shield, Tag, MessageCircle, ArrowLeft } from 'lucide-react';

const ComplaintDetail = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComplaint = useCallback(async () => {
    try {
      const { data } = await getComplaintById(id);
      setComplaint(data);
    } catch (error) {
      console.error('Failed to fetch complaint:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [id, fetchComplaint]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-dept border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!complaint) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold">Complaint not found</h2>
      <Link to="/" className="text-accent-dept mt-4 inline-block">Return to Home</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link 
        to={`/space/${complaint.space_id}`} 
        className="inline-flex items-center text-secondary hover:text-primary mb-8 font-medium transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to {complaint.space?.name}
      </Link>

      <div className="bg-white rounded-3xl shadow-soft p-8 md:p-12">
        {/* Top Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <Tag size={18} className="text-accent-dept" />
            <span className="text-sm font-bold text-accent-dept uppercase tracking-widest">{complaint.category}</span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center space-x-2 text-secondary font-medium text-sm">
              <Clock size={16} />
              <span>{new Date(complaint.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Title & Desc */}
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
          {complaint.title}
        </h1>
        
        <div className="prose prose-slate max-w-none text-secondary text-lg leading-relaxed mb-12">
          {complaint.description.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-10 border-t border-gray-100 gap-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl">
              {complaint.is_anonymous ? (
                <>
                  <Shield size={20} className="text-secondary" />
                  <div>
                    <p className="text-xs font-bold text-secondary uppercase tracking-tighter leading-none">Submitted</p>
                    <p className="text-sm font-bold text-primary">Anonymously</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-accent-dept/10 text-accent-dept rounded-full flex items-center justify-center font-bold">
                    {complaint.student_name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary uppercase tracking-tighter leading-none">Student</p>
                    <p className="text-sm font-bold text-primary">{complaint.student_name}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-secondary">
              <MessageCircle size={20} />
              <span className="font-semibold">{complaint.priority} Priority</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-secondary">Is this a common issue?</span>
            <UpvoteButton 
              complaintId={complaint.id} 
              initialUpvotes={complaint.upvotes} 
              onUpvote={(updated) => setComplaint({...complaint, ...updated})}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
