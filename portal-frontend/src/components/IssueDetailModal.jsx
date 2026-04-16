import React from 'react';
import { X, Clock, MapPin, Shield, User, Calendar, MessageSquare, ArrowRight } from 'lucide-react';

const IssueDetailModal = ({ isOpen, issue, onClose, loading }) => {
  if (!isOpen) return null;
  if (!issue && !loading) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const priorityStyles = {
    P0: 'from-[#ff0055] to-[#ff4d00]',
    P1: 'from-[#7000ff] to-[#ff00d4]',
    P2: 'from-[#00f2fe] to-[#4facfe]'
  };

  const currentGrad = issue ? (priorityStyles[issue.priority] || 'from-gray-400 to-gray-600') : 'from-gray-100 to-gray-200';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 transition-opacity duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all transform-gpu">
        
        {/* Simple Priority Bar */}
        <div className={`h-2.5 w-full bg-gradient-to-r ${currentGrad} ${loading ? 'animate-pulse' : ''}`} />

        {/* Unified Scrollable Container */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            /* Easy Ghost Loading State */
            <div className="p-10 space-y-8 animate-pulse">
               <div className="flex justify-between items-start">
                  <div className="space-y-3">
                     <div className="w-32 h-6 bg-gray-100 rounded-lg" />
                     <div className="w-24 h-4 bg-gray-50 rounded-lg" />
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl" />
               </div>
               <div className="w-3/4 h-10 bg-gray-100 rounded-2xl" />
               <div className="w-full h-40 bg-gray-50 rounded-[32px]" />
               <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-gray-50 rounded-3xl" />
                  <div className="h-20 bg-gray-50 rounded-3xl" />
               </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-10 pt-10 pb-4">
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black text-white bg-gradient-to-br ${currentGrad}`}>
                        {issue.priority}
                      </span>
                      <span className="text-[9px] font-black text-gray-900 uppercase bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                        {issue.category || 'General'}
                      </span>
                   </div>
                   <p className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      <MapPin size={10} className="mr-1 text-primary" />
                      {issue.space?.name || 'Main Campus'}
                   </p>
                </div>
                <button onClick={onClose} className="w-10 h-10 bg-gray-50 hover:bg-black hover:text-white rounded-2xl flex items-center justify-center transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="px-10 pb-10">
                <h2 className="text-[30px] font-black text-gray-900 mt-6 mb-8 leading-tight tracking-tight">
                  {issue.title}
                </h2>

                <div className="space-y-10">
                  {/* Expanded Description Box */}
                  <div>
                    <p className="text-[9px] font-black text-gray-900/30 uppercase tracking-[0.2em] mb-4 ml-1">Original Description</p>
                    <div className="bg-gray-50/50 rounded-[32px] border border-gray-100 p-8">
                      <p className="text-[15px] text-gray-900 leading-relaxed font-medium">
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-100 rounded-[28px] p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                          {issue.is_anonymous ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Reporter</p>
                          <p className="text-[12px] font-black text-gray-900">
                            {issue.is_anonymous ? 'Anonymous' : (issue.student_name || 'Verified')}
                          </p>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-[28px] p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Timeline</p>
                          <p className="text-[12px] font-black text-gray-900">
                            {formatDate(issue.created_at)}
                          </p>
                        </div>
                    </div>
                  </div>

                  {/* Expanded Activity History */}
                  <div>
                    <p className="text-[9px] font-black text-gray-900/30 uppercase tracking-[0.2em] mb-6 ml-1">Staff Decision Log</p>
                    <div className="bg-gray-50/50 rounded-[32px] border border-gray-100 p-8 space-y-8">
                      {issue.status_history && issue.status_history.length > 0 ? (
                        issue.status_history.map((item, idx) => (
                          <div key={idx} className="relative pl-8 border-l border-gray-200 last:border-0 pb-2">
                            <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <div className="flex flex-col gap-4">
                              <p className="text-[12px] font-black text-gray-900 uppercase flex items-center gap-2">
                                Status Change <ArrowRight size={12} className="text-gray-300" /> <span className="text-primary">{item.status?.replace('_', ' ')}</span>
                              </p>
                              {item.comment && (
                                <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                                  <p className="text-[14px] text-gray-900 font-medium">
                                    {item.comment}
                                  </p>
                                </div>
                              )}
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <Clock size={11} /> {formatDate(item.timestamp)} • {formatTime(item.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center flex flex-col items-center gap-4 opacity-30">
                          <MessageSquare size={32} />
                          <p className="text-[11px] font-black uppercase tracking-widest">No Activity Yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
