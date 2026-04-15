import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, Plus, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getComplaints } from "../api/complaints";
import IssueCard from "./IssueCard";
import IssueDetailModal from "./IssueDetailModal";
import SubmitIssueModal from "./SubmitIssueModal";
import AnonymousConfirm from "./AnonymousConfirm";

const FILTER_PILLS = [
  "All",
  "Infrastructure",
  "Water",
  "Electricity",
  "Mess",
  "Academic",
  "Other",
];

const TYPE_META = {
  department: { label: "Department", color: "#4F46E5", bg: "#EEF2FF" },
  hostel: { label: "Hostel", color: "#0891B2", bg: "#E0F2FE" },
  facility: { label: "Facility", color: "#059669", bg: "#D1FAE5" },
  career: { label: "Career", color: "#7C3AED", bg: "#EDE9FE" },
  administrative: { label: "Admin", color: "#B45309", bg: "#FEF3C7" },
  sports: { label: "Sports", color: "#DC2626", bg: "#FEE2E2" },
  cultural: { label: "Cultural", color: "#DB2777", bg: "#FCE7F3" },
};

const SpaceDrawer = ({ isOpen, space, onClose, onIssueCreated }) => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
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
      if (drawerOpenRafRef.current)
        window.cancelAnimationFrame(drawerOpenRafRef.current);
      setIsDrawerRendered(true);
      setOpenAnimationToken((v) => v + 1);
      drawerOpenRafRef.current = window.requestAnimationFrame(() =>
        setIsDrawerVisible(true),
      );
    }
    if (!isOpen && wasOpenRef.current) {
      setIsDrawerVisible(false);
      drawerExitTimerRef.current = window.setTimeout(
        () => setIsDrawerRendered(false),
        320,
      );
      setIsSubmitSheetOpen(false);
      setIsConfirmOpen(false);
      setSubmitFormData(null);
      setIsImageUploading(false);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(
    () => () => {
      if (drawerExitTimerRef.current)
        window.clearTimeout(drawerExitTimerRef.current);
      if (drawerOpenRafRef.current)
        window.cancelAnimationFrame(drawerOpenRafRef.current);
    },
    [],
  );

  useEffect(() => {
    const shouldLock = isDrawerRendered || isSubmitSheetOpen || isConfirmOpen;
    if (!shouldLock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
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
      const next = Array.isArray(data) ? data : [];
      setIssues(next);
      setFilteredIssues(filterIssues(next, activeFilter));
    } catch {
      toast.error("Failed to load issues");
      setIssues([]);
      setFilteredIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = (list, filter = activeFilter) =>
    filter === "All"
      ? [...list]
      : list.filter(
          (i) =>
            String(i.category || "").toLowerCase() === filter.toLowerCase(),
        );

  useEffect(() => {
    setFilteredIssues(filterIssues(issues, activeFilter));
  }, [activeFilter, issues]);

  const openIssueCount = useMemo(() => {
    const closed = new Set(["resolved", "closed"]);
    return issues.filter(
      (i) => !closed.has(String(i.status || "").toLowerCase()),
    ).length;
  }, [issues]);

  const typeMeta = TYPE_META[space?.type] || {
    label: "Space",
    color: "#6B7280",
    bg: "#F3F4F6",
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

  const handleBackToForm = useCallback(() => setIsConfirmOpen(false), []);

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
    const next = [newIssue, ...issues];
    setIssues(next);
    setFilteredIssues(filterIssues(next, activeFilter));
    setIsConfirmOpen(false);
    setIsSubmitSheetOpen(false);
    setSubmitFormData(null);
    setIsImageUploading(false);
    if (onIssueCreated) onIssueCreated(newIssue);
    fetchIssues();
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (isConfirmOpen) {
        e.preventDefault();
        handleBackToForm();
        return;
      }
      if (isSubmitSheetOpen) {
        e.preventDefault();
        handleCloseSubmitSheet();
        return;
      }
      if (isDrawerRendered) {
        e.preventDefault();
        handleCloseDrawer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    handleBackToForm,
    handleCloseDrawer,
    handleCloseSubmitSheet,
    isConfirmOpen,
    isSubmitSheetOpen,
    isDrawerRendered,
  ]);



  if (!isDrawerRendered || !space) return null;

  return (
    <>
      <style>{`
        .sdrawer-backdrop {
          transition: opacity 320ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sdrawer-panel {
          transition: transform 360ms cubic-bezier(0.32, 0.72, 0, 1), opacity 320ms ease;
        }
        .sdrawer-filter-pill {
          transition: background 180ms ease, color 180ms ease, box-shadow 180ms ease;
          white-space: nowrap;
        }
        .sdrawer-filter-pill:hover {
          background: #E5E7EB;
        }
        .sdrawer-filter-pill.active {
          background: #1E1B4B;
          color: #fff;
          box-shadow: 0 2px 8px rgba(30,27,75,0.18);
        }
        .sdrawer-raise-btn {
          transition: background 180ms ease, transform 120ms ease, box-shadow 180ms ease;
        }
        .sdrawer-raise-btn:hover {
          box-shadow: 0 4px 16px rgba(79,70,229,0.25);
          transform: translateY(-1px);
        }
        .sdrawer-raise-btn:active {
          transform: scale(0.97);
        }
        .sdrawer-scroll {
          scrollbar-width: thin;
          scrollbar-color: #E5E7EB transparent;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        .sdrawer-scroll::-webkit-scrollbar { width: 4px; }
        .sdrawer-scroll::-webkit-scrollbar-track { background: transparent; }
        .sdrawer-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .sdrawer-empty-btn {
          transition: background 180ms ease, transform 120ms ease;
        }
        .sdrawer-empty-btn:hover { background: #4338CA; transform: translateY(-1px); }
        .sdrawer-empty-btn:active { transform: scale(0.97); }
        @keyframes sdrawer-card-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sdrawer-card-animate {
          animation: sdrawer-card-in 260ms cubic-bezier(0.34, 1.2, 0.64, 1) both;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="sdrawer-backdrop fixed inset-0 z-40 bg-black/40"
        style={{ opacity: isDrawerVisible ? 1 : 0 }}
        onClick={handleCloseDrawer}
      />

      {/* Panel */}
      <div
        className="sdrawer-panel fixed inset-x-0 bottom-0 z-50 mx-auto flex flex-col overflow-hidden bg-white lg:max-w-5xl"
        style={{
          height: "92dvh",
          borderRadius: "28px 28px 0 0",
          transform: isDrawerVisible ? "translateY(0)" : "translateY(100%)",
          opacity: isDrawerVisible ? 1 : 0.96,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.14), 0 -1px 0 rgba(0,0,0,0.06)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`${space.name} issues`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 99,
              background: "#D1D5DB",
            }}
          />
        </div>

        {/* Header */}
        <div
          className="flex-shrink-0 px-6 pt-3 pb-4"
          style={{ borderBottom: "1px solid #F3F4F6" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: typeMeta.bg,
                    color: typeMeta.color,
                    letterSpacing: "0.02em",
                  }}
                >
                  {typeMeta.label}
                </span>
              </div>
              <h2
                className="text-xl font-bold sm:text-2xl truncate"
                style={{
                  color: "#111827",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                {space?.name}
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#9CA3AF" }}>
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    fontWeight: openIssueCount > 0 ? 600 : 400,
                    color: openIssueCount > 0 ? "#4F46E5" : "#9CA3AF",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: openIssueCount > 0 ? "#4F46E5" : "#D1D5DB",
                    }}
                  />
                  {openIssueCount} open issue{openIssueCount === 1 ? "" : "s"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleRaiseIssueClick}
                className="sdrawer-raise-btn inline-flex items-center gap-2 text-sm font-semibold text-white"
                style={{
                  background: "#4F46E5",
                  borderRadius: 99,
                  padding: "10px 20px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Raise Issue</span>
              </button>
              <button
                onClick={handleCloseDrawer}
                style={{
                  background: "#F3F4F6",
                  border: "none",
                  borderRadius: "50%",
                  width: 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#6B7280",
                  transition: "background 150ms ease",
                  flexShrink: 0,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#E5E7EB")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#F3F4F6")
                }
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div
          className="flex-shrink-0 flex gap-2 overflow-x-auto px-6 py-3"
          style={{
            borderBottom: "1px solid #F3F4F6",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {FILTER_PILLS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`sdrawer-filter-pill text-xs font-semibold px-4 py-2 rounded-full ${activeFilter === filter ? "active" : ""}`}
              style={{
                background: activeFilter === filter ? "#1E1B4B" : "#F3F4F6",
                color: activeFilter === filter ? "#fff" : "#6B7280",
                border: "none",
                cursor: "pointer",
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Issues list */}
        <div className="sdrawer-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2
                  size={32}
                  className="animate-spin"
                  style={{ color: "#4F46E5" }}
                />
                <p className="text-sm" style={{ color: "#9CA3AF" }}>
                  Loading issues...
                </p>
              </div>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div
                className="mb-5 flex items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#EEF2FF",
                }}
              >
                <AlertCircle size={28} style={{ color: "#4F46E5" }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: "#111827" }}>
                No issues found
              </h3>
              <p
                className="mt-2 max-w-xs text-sm leading-relaxed"
                style={{ color: "#9CA3AF" }}
              >
                {activeFilter === "All"
                  ? `Be the first to raise an issue in ${space?.name}.`
                  : `No ${activeFilter.toLowerCase()} issues yet. Try a different filter.`}
              </p>
              {activeFilter === "All" && (
                <button
                  onClick={handleRaiseIssueClick}
                  className="sdrawer-empty-btn mt-6 text-sm font-semibold text-white"
                  style={{
                    background: "#4F46E5",
                    borderRadius: 99,
                    padding: "10px 24px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Raise an Issue
                </button>
              )}
            </div>
          ) : (
            <div
              className="px-5 py-4 sm:px-6"
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {filteredIssues.map((issue, index) => (
                <div
                  key={`${issue.id}-${openAnimationToken}`}
                  className="sdrawer-card-animate"
                  style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
                >
                  <IssueCard
                    issue={issue}
                    staggerIndex={index}
                    onCardClick={() => handleIssueClick(issue)}
                  />
                </div>
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
