import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { upvoteComplaint } from '../api/complaints';
import { toast } from 'react-hot-toast';

const UpvoteButton = ({ complaintId, initialUpvotes, onUpvote }) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isUpvoted) {
      toast.error('You have already upvoted this complaint');
      return;
    }

    setLoading(true);
    try {
      const { data } = await upvoteComplaint(complaintId);
      setUpvotes(data.upvotes);
      setIsUpvoted(true);
      toast.success('Complaint upvoted!');
      if (onUpvote) onUpvote(data);
    } catch (error) {
      console.error('Upvote failed:', error);
      toast.error('Failed to upvote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={loading || isUpvoted}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
        isUpvoted 
          ? 'bg-accent-dept/10 border-accent-dept/20 text-accent-dept' 
          : 'bg-white border-gray-200 text-secondary hover:border-accent-dept hover:text-accent-dept hover:bg-accent-dept/5'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <ThumbsUp size={16} className={isUpvoted ? 'fill-current' : ''} />
      <span className="text-sm font-semibold">{upvotes}</span>
    </button>
  );
};

export default UpvoteButton;
