import React, { useState } from 'react';
import { Send, X, Shield, User, Mail, MessageSquare } from 'lucide-react';
import { createComplaint } from '../api/complaints';
import { toast } from 'react-hot-toast';

const ComplaintForm = ({ spaceId, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infrastructure',
    is_anonymous: false,
    student_name: '',
    student_email: '',
  });

  const categories = [
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'water', label: 'Water' },
    { id: 'electricity', label: 'Electricity' },
    { id: 'academic', label: 'Academic' },
    { id: 'mess', label: 'Mess' },
    { id: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      await createComplaint({
        ...formData,
        space_id: spaceId,
      });
      toast.success('Complaint submitted successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-soft p-6 md:p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Raise a Complaint</h2>
            <p className="text-secondary text-sm">Fill in the details about your concern.</p>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-primary mb-1.5 flex items-center gap-2">
              <MessageSquare size={14} /> Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-dept focus:ring-4 focus:ring-accent-dept/5 outline-none transition-all"
              placeholder="E.g., Water leakage in Room 204"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-1.5">Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, category: cat.id }))}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    formData.category === cat.id
                      ? 'bg-accent-dept text-white border-accent-dept shadow-sm'
                      : 'bg-white text-secondary border-gray-200 hover:border-accent-dept/30'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-1.5">Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-dept focus:ring-4 focus:ring-accent-dept/5 outline-none transition-all resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="flex items-center space-x-2 bg-accent-dept/5 p-3 rounded-xl border border-accent-dept/10">
            <input
              type="checkbox"
              id="is_anonymous"
              name="is_anonymous"
              checked={formData.is_anonymous}
              onChange={handleChange}
              className="w-4 h-4 rounded text-accent-dept focus:ring-accent-dept border-gray-300"
            />
            <label htmlFor="is_anonymous" className="text-sm font-medium text-primary flex items-center gap-1.5 cursor-pointer">
              <Shield size={14} className="text-accent-dept" /> Submit Anonymously
            </label>
          </div>

          {!formData.is_anonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1 px-1 flex items-center gap-1">
                  <User size={10} /> Name (Optional)
                </label>
                <input
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-accent-dept outline-none text-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1 px-1 flex items-center gap-1">
                  <Mail size={10} /> Email (Optional)
                </label>
                <input
                  type="email"
                  name="student_email"
                  value={formData.student_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-accent-dept outline-none text-sm"
                  placeholder="your.email@college.edu"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-primary/95 shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Complaint</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
