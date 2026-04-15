import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getComplaints } from '../api/complaints';
import IssueCard from './IssueCard';
import IssueDetailModal from './IssueDetailModal';
import SubmitIssueModal from './SubmitIssueModal';
import AnonymousConfirm from './AnonymousConfirm';

const FILTER_PILLS = ['All', 'Infrastructure', 'Water', 'Electricity', 'Mess', 'Academic', 'Other'];
const SHEET_ANIMATION = 'space-sheet-in 220ms cubic-bezier(0.32, 0.72, 0, 1) forwards';
const SHEET_EXIT_ANIMATION = 'space-sheet-out 220ms cubic-bezier(0.32, 0.72, 0, 1) forwards';

const SpaceDrawer = ({ isOpen, space, onClose, onIssueCreated }) => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitSheetOpen, setIsSubmitSheetOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitFormData, setSubmitFormData] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isDrawerRendered, setIsDrawerRendered] = useState(isOpen);
  const [isDrawerVisible, setIsDrawerVisible] = useState(isOpen);
  const [openAnimationToken, setOpenAnimationToken] = useState(0);
  const drawerExitTimerRef = useRef(null);
  const drawerOpenRafRef = useRef(null);
  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (drawerExitTimerRef.current) {
        window.clearTimeout(drawerExitTimerRef.current);
        drawerExitTimerRef.current = null;
      }
      if (drawerOpenRafRef.current) {
        window.cancelAnimationFrame(drawerOpenRafRef.current);
      }
      setIsDrawerRendered(true);
      setOpenAnimationToken((value) => value + 1);
      drawerOpenRafRef.current = window.requestAnimationFrame(() => setIsDrawerVisible(true));
    }

    if (!isOpen && wasOpenRef.current) {
      setIsDrawerVisible(false);
      drawerExitTimerRef.current = window.setTimeout(() => {
        setIsDrawerRendered(false);
      }, 220);
      setIsSubmitSheetOpen(false);
      setIsConfirmOpen(false);
      setSubmitFormData(null);
      setIsImageUploading(false);
    }

    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (drawerExitTimerRef.current) {
        window.clearTimeout(drawerExitTimerRef.current);
      }
      if (drawerOpenRafRef.current) {
        window.cancelAnimationFrame(drawerOpenRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const shouldLockBody = isDrawerRendered || isSubmitSheetOpen || isConfirmOpen;
    if (!shouldLockBody) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerRendered, isSubmitSheetOpen, isConfirmOpen]);

  useEffect(() => {
    if (!isOpen || !space?.id) return;

    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, space?.id]);

  const fetchIssues = async () => {
    if (!space?.id) return;

    setLoading(true);
    try {
      const { data } = await getComplaints(space.id);
      const nextIssues = Array.isArray(data) ? data : [];
      setIssues(nextIssues);
      setFilteredIssues(filterIssues(nextIssues, activeFilter));
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      toast.error('Failed to load issues');
      setIssues([]);
      setFilteredIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = (issuesToFilter, filter = activeFilter) => {
    if (filter === 'All') return [...issuesToFilter];
    return issuesToFilter.filter(
      (issue) => String(issue.category || '').toLowerCase() === filter.toLowerCase()
    );
  };

  useEffect(() => {
    const nextFiltered =
      activeFilter === 'All'
        ? [...issues]
        : issues.filter((issue) => String(issue.category || '').toLowerCase() === activeFilter.toLowerCase());
    setFilteredIssues(nextFiltered);
  }, [activeFilter, issues]);

  const openIssueCount = useMemo(() => {
    const closedStates = new Set(['resolved', 'closed']);
    return issues.filter((issue) => !closedStates.has(String(issue.status || '').toLowerCase())).length;
  }, [issues]);

  const getTypeLabel = () => {
    const types = {
      department: 'Department',
      hostel: 'Hostel',
      facility: 'Facility',
      career: 'Career',
      administrative: 'Administrative',
      sports: 'Sports',
      cultural: 'Cultural',
    };

    return types[space?.type] || 'Space';
  };

  const handleIssueClick = useCallback((issue) => {
    setSelectedIssue(issue);
    setIsDetailModalOpen(true);
  }, []);

  const handleRaiseIssueClick = useCallback(() => {
    setSubmitFormData(null);
    setIsConfirmOpen(false);
    setIsSubmitSheetOpen(true);
  }, []);

  const handleFormContinue = useCallback((data) => {
    setSubmitFormData(data);
    setIsConfirmOpen(true);
  }, []);

  const handleBackToForm = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  const handleCloseSubmitSheet = useCallback(() => {
    setIsConfirmOpen(false);
    setIsSubmitSheetOpen(false);
    setSubmitFormData(null);
    setIsImageUploading(false);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    handleCloseSubmitSheet();
    setIsDetailModalOpen(false);
    setSelectedIssue(null);
    onClose();
  }, [handleCloseSubmitSheet, onClose]);

  const handleSubmitSuccess = (newIssue) => {
    const nextIssues = [newIssue, ...issues];
    setIssues(nextIssues);
    setFilteredIssues(filterIssues(nextIssues, activeFilter));
    setIsConfirmOpen(false);
    setIsSubmitSheetOpen(false);
    setSubmitFormData(null);
    setIsImageUploading(false);
    if (onIssueCreated) onIssueCreated(newIssue);
    fetchIssues();
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;

      if (isConfirmOpen) {
        event.preventDefault();
        handleBackToForm();
        return;
      }

      if (isSubmitSheetOpen) {
        event.preventDefault();
        handleCloseSubmitSheet();
        return;
      }

      if (isDrawerRendered) {
        event.preventDefault();
        handleCloseDrawer();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleBackToForm,
    handleCloseDrawer,
    handleCloseSubmitSheet,
    isConfirmOpen,
    isSubmitSheetOpen,
    isDrawerRendered,
  ]);

  const handleIssueUpvoteSuccess = (issueId, updatedIssue) => {
    const nextIssues = issues.map((issue) =>
      issue.id === issueId ? { ...issue, ...updatedIssue } : issue
    );
    setIssues(nextIssues);
    setFilteredIssues(filterIssues(nextIssues, activeFilter));
    if (selectedIssue?.id === issueId) {
      setSelectedIssue((current) => ({ ...current, ...updatedIssue }));
    }
  };

  if (!isDrawerRendered || !space) return null;

  const sheetAnimation = isOpen ? SHEET_ANIMATION : SHEET_EXIT_ANIMATION;

  return (
    <>
      <style>{`
        @keyframes space-sheet-in {
          from { transform: translateY(100%); opacity: 0.98; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes space-sheet-out {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0.98; }
        }
        @keyframes space-confirm-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes space-confirm-out {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.95); opacity: 0; }
        }
        @keyframes issue-card-in {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
        onClick={handleCloseDrawer}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transform-gpu will-change-transform lg:max-w-5xl ${
          isDrawerVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transition: 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1)',
          animation: sheetAnimation,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`${space.name} issues`}
      >
        <div className="flex flex-shrink-0 flex-col border-b border-gray-100 bg-white">
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-gray-300" />
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-bold text-primary sm:text-2xl">
                  {space?.name}
                </h2>
                <span className="rounded-full bg-accent-dept/10 px-3 py-1 text-xs font-semibold text-accent-dept">
                  {getTypeLabel()}
                </span>
              </div>
              <p className="mt-1 text-sm text-secondary">
                {openIssueCount} open issue{openIssueCount === 1 ? '' : 's'}
              </p>
            </div>

            <button
              onClick={handleRaiseIssueClick}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent-dept px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-dept/90 active:scale-[0.98]"
            >
              <Plus size={16} />
              <span>Raise an Issue</span>
            </button>
          </div>
        </div>

        <div className="flex flex-shrink-0 gap-2 overflow-x-auto border-b border-gray-100 px-5 py-4 no-scrollbar sm:px-6">
          {FILTER_PILLS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-secondary hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {loading ? (
            <div className="flex h-full items-center justify-center p-8">
              <Loader2 size={40} className="animate-spin text-accent-dept" />
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Plus size={28} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-primary">No issues yet</h3>
              <p className="mt-2 max-w-sm text-sm text-secondary">
                Be the first to raise an issue in this {getTypeLabel().toLowerCase()}.
              </p>
              <button
                onClick={handleRaiseIssueClick}
                className="mt-6 rounded-full bg-accent-dept px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-dept/90"
              >
                Raise an Issue
              </button>
            </div>
          ) : (
            <div className="space-y-3 px-5 py-4 sm:px-6">
              {filteredIssues.map((issue, index) => (
                <IssueCard
                  key={`${issue.id}-${openAnimationToken}`}
                  issue={issue}
                  staggerIndex={index}
                  onCardClick={() => handleIssueClick(issue)}
                  onUpvoteSuccess={(updatedIssue) => handleIssueUpvoteSuccess(issue.id, updatedIssue)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <IssueDetailModal
        issue={selectedIssue}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedIssue(null);
        }}
        onUpvoteSuccess={(updatedIssue) => {
          if (!selectedIssue?.id) return;

          const nextIssues = issues.map((issue) =>
            issue.id === selectedIssue.id
              ? { ...issue, ...(updatedIssue || {}), upvotes: updatedIssue?.upvotes ?? (issue.upvotes || 0) + 1 }
              : issue
          );
          setIssues(nextIssues);
          setFilteredIssues(filterIssues(nextIssues, activeFilter));
          setSelectedIssue((current) =>
            current
              ? { ...current, ...(updatedIssue || {}), upvotes: updatedIssue?.upvotes ?? (current.upvotes || 0) + 1 }
              : current
          );
        }}
      />

      <SubmitIssueModal
        isOpen={isSubmitSheetOpen}
        onClose={handleCloseSubmitSheet}
        onContinue={handleFormContinue}
        spaceName={space?.name}
        isUploadingImage={isImageUploading}
      />

      <AnonymousConfirm
        isOpen={isConfirmOpen}
        formData={submitFormData}
        spaceId={space?.id}
        onSuccess={handleSubmitSuccess}
        onBack={handleBackToForm}
        onClose={handleBackToForm}
        onUploadStateChange={setIsImageUploading}
      />
    </>
  );
};

export default SpaceDrawer;
