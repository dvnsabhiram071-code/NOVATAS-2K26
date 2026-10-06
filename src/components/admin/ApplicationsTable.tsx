import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download,
  Mail,
  Phone,
  Crown,
  Users,
  Sparkles,
  ShieldCheck,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerApplication } from '../../types';
import { dbService } from '../../services/db';

const STANDARD_VOLUNTEER_ROLES = [
  'Event Coordination',
  'Stage Coordination',
  'Registration Support',
  'Crowd Management',
  'Backstage Coordination',
  'Photography Support',
  'Media Support',
  'Participant Assistance',
  'Technical Support',
  'General Event Support'
];

export const ApplicationsTable: React.FC = () => {
  const { 
    approveApplication, 
    rejectApplication, 
    deleteApplication,
    assignVolunteerEvents,
    events,
    refreshStats 
  } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [preferenceFilter, setPreferenceFilter] = useState('ALL');

  // Server-side Pagination & Data state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Request sequencing to prevent race conditions
  const requestIdRef = useRef(0);

  // Modals state
  const [selectedApp, setSelectedApp] = useState<VolunteerApplication | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [targetAppId, setTargetAppId] = useState<string>('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Assignment form state inside details modal
  const [assignedEventInput, setAssignedEventInput] = useState('');
  const [assignedRoleInput, setAssignedRoleInput] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Active events for dropdown
  const activeEvents = events.filter(e => e.status === 'ACTIVE');

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Primary data fetch from Supabase
  const loadApplications = useCallback(async () => {
    const currentReq = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await dbService.fetchApplicationsPaginated({
        page,
        pageSize,
        search: debouncedSearch.trim(),
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        section: sectionFilter !== 'ALL' ? sectionFilter : undefined,
        preference: preferenceFilter !== 'ALL' ? preferenceFilter : undefined
      });

      if (requestIdRef.current !== currentReq) {
        return; // Discard out-of-order response
      }

      if (!res.success || !res.data) {
        setErrorMessage(res.message || 'Unable to retrieve applications from database.');
        setApplications([]);
        setTotalCount(0);
        setTotalPages(1);
      } else {
        setApplications(res.data.applications);
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      if (requestIdRef.current === currentReq) {
        setErrorMessage(err?.message || 'Network error while loading applications.');
      }
    } finally {
      if (requestIdRef.current === currentReq) {
        setIsLoading(false);
      }
    }
  }, [page, pageSize, debouncedSearch, statusFilter, sectionFilter, preferenceFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleOpenView = (app: VolunteerApplication) => {
    setSelectedApp(app);
    setAssignedEventInput(app.assignedEvent1 || '');
    
    const existingRole = app.volunteerRole || '';
    if (existingRole && !STANDARD_VOLUNTEER_ROLES.includes(existingRole)) {
      setIsCustomRole(true);
      setCustomRoleInput(existingRole);
      setAssignedRoleInput('CUSTOM');
    } else {
      setIsCustomRole(false);
      setCustomRoleInput('');
      setAssignedRoleInput(existingRole);
    }

    setSaveSuccessNotice(false);
    setIsViewModalOpen(true);
  };

  const getEffectiveRole = () => {
    return isCustomRole ? customRoleInput.trim() : assignedRoleInput.trim();
  };

  // Save Assignment without approving
  const handleSaveAssignment = async () => {
    if (!selectedApp) return;
    const finalEvent = assignedEventInput.trim();
    const finalRole = getEffectiveRole();

    const res = await assignVolunteerEvents(selectedApp.id, finalEvent, undefined, finalRole);
    if (res.success && res.data) {
      setSelectedApp(res.data);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2500);
      loadApplications();
      refreshStats();
    } else {
      alert(`Save failed: ${res.message}`);
    }
  };

  // Open Approval Confirmation
  const handleOpenApproveModal = () => {
    if (!selectedApp) return;
    const finalEvent = assignedEventInput.trim();
    const finalRole = getEffectiveRole();

    if (!finalEvent || !finalRole) {
      alert('Please assign both a Final Event and a Volunteer Role before approving.');
      return;
    }

    setTargetAppId(selectedApp.id);
    setIsApproveConfirmOpen(true);
  };

  // Confirm Approval (Strict State Machine Execution)
  const handleConfirmApprove = async () => {
    const finalEvent = assignedEventInput.trim();
    const finalRole = getEffectiveRole();

    const res = await approveApplication(targetAppId, finalEvent, finalRole);
    if (res.success && res.data) {
      setIsApproveConfirmOpen(false);
      setSelectedApp(res.data);
      loadApplications();
      refreshStats();
    } else {
      alert(`Approval failed: ${res.message}`);
    }
  };

  const handleOpenReject = (id: string) => {
    setTargetAppId(id);
    setRejectionReasonInput('Requirements or quotas for selected event preferences were not met at this time.');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReasonInput.trim()) return;
    const res = await rejectApplication(targetAppId, rejectionReasonInput.trim());
    if (res.success && res.data) {
      setIsRejectModalOpen(false);
      if (selectedApp && selectedApp.id === targetAppId) {
        setSelectedApp(res.data);
      }
      loadApplications();
      refreshStats();
    } else {
      alert(`Rejection failed: ${res.message}`);
    }
  };

  const handleOpenDelete = (id: string) => {
    setTargetAppId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    const res = await deleteApplication(targetAppId);
    if (res.success) {
      setIsDeleteConfirmOpen(false);
      setIsViewModalOpen(false);
      loadApplications();
      refreshStats();
    } else {
      alert(`Delete failed: ${res.message}`);
    }
  };

  // Pagination calculations
  const fromRecord = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toRecord = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title & Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white tracking-wide">
            APPLICATIONS MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Single Source of Truth: Supabase <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">public.applications</code>
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Name, USN, Mobile, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>FILTERS:</span>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          <option value="ALL">Status: All</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Section Filter */}
        <select
          value={sectionFilter}
          onChange={(e) => {
            setSectionFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          <option value="ALL">Section: All</option>
          {['A', 'B', 'C', 'D', 'E', 'F', 'OTHER'].map(s => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>

        {/* Event Preference Filter */}
        <select
          value={preferenceFilter}
          onChange={(e) => {
            setPreferenceFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          <option value="ALL">Preference: All Events</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.name}>{ev.name}</option>
          ))}
        </select>

        {/* Refresh Button */}
        <button
          onClick={() => {
            loadApplications();
            refreshStats();
          }}
          disabled={isLoading}
          title="Refresh from Supabase"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        <span className="text-xs text-slate-400 font-mono ml-auto">
          {isLoading ? (
            <span className="text-cyan-400 animate-pulse">Syncing database...</span>
          ) : (
            `Showing ${fromRecord}–${toRecord} of ${totalCount.toLocaleString()} applications`
          )}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 12. ADMIN APPLICATION TABLE */}
      {/* ========================================================================= */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4">PHOTO</th>
                <th className="py-4 px-4">NAME</th>
                <th className="py-4 px-4">USN</th>
                <th className="py-4 px-4">PREFERENCES</th>
                <th className="py-4 px-4">FINAL EVENT</th>
                <th className="py-4 px-4">VOLUNTEER ROLE</th>
                <th className="py-4 px-4">STATUS</th>
                <th className="py-4 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
                      <span className="font-mono text-xs uppercase tracking-wider text-cyan-300 font-bold">
                        LOADING APPLICATIONS...
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Querying Supabase public.applications (Page {page} of {totalPages})
                      </span>
                    </div>
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={8} className="py-12 px-6 text-center">
                    <div className="max-w-md mx-auto p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
                      <div className="flex items-center justify-center space-x-2 text-rose-400">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-bold text-sm uppercase font-mono">UNABLE TO LOAD APPLICATIONS</span>
                      </div>
                      <p className="text-xs text-rose-300 font-mono break-words">
                        {errorMessage}
                      </p>
                      <button
                        onClick={() => loadApplications()}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-md cursor-pointer"
                      >
                        RETRY DATABASE QUERY
                      </button>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-bold text-slate-400">NO APPLICATIONS FOUND</span>
                      <span className="text-xs text-slate-500">
                        {searchQuery || statusFilter !== 'ALL' || sectionFilter !== 'ALL' || preferenceFilter !== 'ALL'
                          ? 'No applications match the current filter criteria.'
                          : 'The database currently contains no non-deleted records.'}
                      </span>
                      {(searchQuery || statusFilter !== 'ALL' || sectionFilter !== 'ALL' || preferenceFilter !== 'ALL') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('ALL');
                            setSectionFilter('ALL');
                            setPreferenceFilter('ALL');
                            setPage(1);
                          }}
                          className="mt-2 text-xs text-cyan-400 hover:underline cursor-pointer"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-slate-900/40 transition-colors group"
                  >
                    {/* PHOTO */}
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                        <img
                          src={app.photoUrl}
                          alt={app.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* NAME */}
                    <td className="py-3 px-4 font-sans font-bold text-white">
                      <div className="flex flex-col">
                        <span className="text-sm">{app.fullName}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">{app.id}</span>
                      </div>
                    </td>

                    {/* USN */}
                    <td className="py-3 px-4 text-slate-300">
                      <div>
                        <span className="font-bold text-white">{app.usn}</span>
                        <span className="text-[10px] text-slate-500 block">Sec {app.section}</span>
                      </div>
                    </td>

                    {/* PREFERENCES */}
                    <td className="py-3 px-4">
                      <div className="text-xs space-y-0.5">
                        <span className="text-cyan-300 block">1. {app.preference1 || app.preferences[0]}</span>
                        <span className="text-violet-300 block">2. {app.preference2 || app.preferences[1]}</span>
                      </div>
                    </td>

                    {/* FINAL EVENT */}
                    <td className="py-3 px-4">
                      {app.assignedEvent1 ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold text-[11px]">
                          {app.assignedEvent1}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* VOLUNTEER ROLE */}
                    <td className="py-3 px-4">
                      {app.volunteerRole ? (
                        <span className="px-2.5 py-1 rounded-lg bg-violet-950/60 border border-violet-500/40 text-violet-300 text-[11px]">
                          {app.volunteerRole}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : app.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          app.status === 'APPROVED' ? 'bg-emerald-400' : app.status === 'PENDING' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'
                        }`} />
                        <span>{app.status}</span>
                      </span>
                    </td>

                    {/* ACTION: VIEW BUTTON */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenView(app)}
                        className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>PREV</span>
          </button>

          <div className="flex items-center space-x-1">
            {(() => {
              const pages: (number | string)[] = [];
              const maxButtons = 5;
              if (totalPages <= maxButtons + 2) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                let start = Math.max(2, page - 1);
                let end = Math.min(totalPages - 1, page + 1);

                if (page <= 3) {
                  start = 2;
                  end = 4;
                } else if (page >= totalPages - 2) {
                  start = totalPages - 3;
                  end = totalPages - 1;
                }

                if (start > 2) pages.push('...');
                for (let i = start; i <= end; i++) pages.push(i);
                if (end < totalPages - 1) pages.push('...');
                pages.push(totalPages);
              }

              return pages.map((p, idx) => {
                if (typeof p === 'string') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs font-mono text-slate-600">
                      ...
                    </span>
                  );
                }
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                );
              });
            })()}
          </div>

          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono transition-colors cursor-pointer"
          >
            <span>NEXT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 13. ADMIN APPLICATION DETAILS MODAL (Exact Layout Specified in Section 13) */}
      {/* ========================================================================= */}
      {isViewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-left relative max-h-[92vh] overflow-y-auto shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  VOLUNTEER APPLICATION REVIEW
                </span>
                <h3 className="font-display font-black text-xl text-white">
                  {selectedApp.fullName}
                </h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-5">
              
              {/* SECTION: PERSONAL INFORMATION */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  PERSONAL INFORMATION
                </span>
                <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-400 shrink-0 bg-slate-950">
                    <img src={selectedApp.photoUrl} alt={selectedApp.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-cyan-400 font-bold">{selectedApp.id}</p>
                    <p className="font-display font-black text-white text-lg">{selectedApp.fullName}</p>
                    <p className="font-mono text-xs text-slate-300">
                      USN: <strong className="text-white">{selectedApp.usn}</strong> • {selectedApp.department} (Sec {selectedApp.section})
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                      <span className="flex items-center space-x-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{selectedApp.mobile}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-mono">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{selectedApp.email}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: VOLUNTEER PREFERENCES (Read-only preferences from applicant) */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  VOLUNTEER PREFERENCES (APPLICANT CHOICE)
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block">Preference 1</span>
                    <span className="font-bold text-cyan-300 text-sm">{selectedApp.preference1 || selectedApp.preferences[0]}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block">Preference 2</span>
                    <span className="font-bold text-violet-300 text-sm">{selectedApp.preference2 || selectedApp.preferences[1]}</span>
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* SECTION: FINAL ASSIGNMENT (Admin Controlled) */}
              {/* ============================================================= */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border-2 border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-mono uppercase text-white font-bold tracking-wider">
                      FINAL ADMIN ASSIGNMENT
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">MANDATORY FOR APPROVAL</span>
                </div>

                {/* Final Assigned Event Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-300 uppercase font-bold">
                    FINAL ASSIGNED EVENT:
                  </label>
                  <select
                    value={assignedEventInput}
                    onChange={(e) => setAssignedEventInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="">-- Select Final Assigned Event --</option>
                    {activeEvents.map((ev) => (
                      <option key={ev.id} value={ev.name}>
                        {ev.name} ({ev.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Volunteer Role Dropdown + Custom Role */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono text-slate-300 uppercase font-bold">
                      VOLUNTEER ROLE:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomRole(!isCustomRole);
                        if (!isCustomRole) setAssignedRoleInput('CUSTOM');
                        else setAssignedRoleInput('');
                      }}
                      className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isCustomRole ? 'Choose Preset Role' : '+ CUSTOM ROLE'}</span>
                    </button>
                  </div>

                  {isCustomRole ? (
                    <input
                      type="text"
                      placeholder="Enter custom volunteer role title..."
                      value={customRoleInput}
                      onChange={(e) => setCustomRoleInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-cyan-400 rounded-xl text-white font-mono text-xs focus:outline-none"
                    />
                  ) : (
                    <select
                      value={assignedRoleInput}
                      onChange={(e) => setAssignedRoleInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="">-- Select Volunteer Role --</option>
                      {STANDARD_VOLUNTEER_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  )}
                </div>

                {saveSuccessNotice && (
                  <p className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Assignment saved successfully! (Click Approve when ready)</span>
                  </p>
                )}
              </div>

              {/* APPLICATION STATUS */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                  APPLICATION STATUS:
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                  selectedApp.status === 'APPROVED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : selectedApp.status === 'PENDING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {selectedApp.status}
                </span>
              </div>

              {selectedApp.status === 'APPROVED' && selectedApp.volunteerId && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs font-mono space-y-1">
                  <p className="text-emerald-300 font-bold">✓ Official Volunteer ID: {selectedApp.volunteerId}</p>
                  <p className="text-slate-300">QR Token: {selectedApp.qrToken} • Digital ID Card Active</p>
                </div>
              )}

              {selectedApp.status === 'REJECTED' && selectedApp.rejectionReason && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs font-mono text-rose-300">
                  <strong>Rejection Reason:</strong> {selectedApp.rejectionReason}
                </div>
              )}

            </div>

            {/* ============================================================= */}
            {/* ADMIN ACTIONS: SAVE, APPROVE, REJECT, DELETE */}
            {/* ============================================================= */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleOpenDelete(selectedApp.id)}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-rose-950 text-rose-400 hover:border-rose-800 border border-slate-800 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
              >
                DELETE
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {selectedApp.status !== 'REJECTED' && (
                  <button
                    onClick={() => {
                      handleOpenReject(selectedApp.id);
                    }}
                    className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    REJECT
                  </button>
                )}

                <button
                  onClick={handleSaveAssignment}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
                >
                  SAVE ASSIGNMENT
                </button>

                {/* APPROVE VOLUNTEER: Disabled until Final Event != empty AND Volunteer Role != empty */}
                <button
                  onClick={handleOpenApproveModal}
                  disabled={!assignedEventInput.trim() || !getEffectiveRole()}
                  title={
                    !assignedEventInput.trim() || !getEffectiveRole() 
                      ? 'Please assign both a Final Event and a Volunteer Role to enable approval'
                      : 'Approve application and issue Volunteer ID & QR'
                  }
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  APPROVE VOLUNTEER
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. APPROVAL CONFIRMATION MODAL (Exact Content Specified in Section 7) */}
      {/* ========================================================================= */}
      {isApproveConfirmOpen && selectedApp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="bg-slate-950 border-2 border-emerald-500/60 rounded-3xl max-w-md w-full p-6 text-left space-y-5 shadow-2xl shadow-emerald-950/60">
            
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-white">
                  APPROVE VOLUNTEER?
                </h3>
                <p className="text-xs text-slate-400">Confirm official accreditation</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Volunteer:</span>
                <span className="text-white font-bold text-sm">{selectedApp.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Final Event:</span>
                <span className="text-yellow-400 font-bold">{assignedEventInput}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Volunteer Role:</span>
                <span className="text-violet-300 font-bold">{getEffectiveRole()}</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5 text-xs text-emerald-200 font-mono">
              <p className="font-bold text-emerald-400 uppercase text-[11px] mb-1">Approval will:</p>
              <p>✓ Approve the application</p>
              <p>✓ Generate Volunteer ID (e.g. NVT26-V00492)</p>
              <p>✓ Generate secure QR token</p>
              <p>✓ Generate QR code</p>
              <p>✓ Enable Volunteer ID Card</p>
              <p>✓ Make the volunteer visible in Approved Volunteers</p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsApproveConfirmOpen(false)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-xl transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                CONFIRM APPROVAL
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14. REJECT WORKFLOW MODAL */}
      {/* ========================================================================= */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="bg-slate-950 border-2 border-rose-600/60 rounded-3xl max-w-md w-full p-6 text-left space-y-4 shadow-2xl shadow-rose-950/60">
            
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                <XCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-white">
                  REJECT APPLICATION
                </h3>
                <p className="text-xs text-slate-400">Record administrative rejection reason</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-300">
                Reason *
              </label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Specify rejection reason..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-rose-400"
              />
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Note: Rejected applicants will NOT receive a Volunteer ID, QR code, or Volunteer Card.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-xl transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-lg shadow-rose-600/25 cursor-pointer"
              >
                CONFIRM REJECTION
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 15. DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-black text-lg text-white">
                DELETE APPLICATION?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                This application will be removed from all active rosters.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-xl cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold rounded-xl cursor-pointer"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
