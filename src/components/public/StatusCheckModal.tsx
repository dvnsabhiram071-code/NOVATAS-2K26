import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  QrCode, 
  ExternalLink,
  CreditCard,
  Eye,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerApplication } from '../../types';
import { DigitalVolunteerCard } from './DigitalVolunteerCard';
import { generateVolunteerQRCode } from '../../utils/qrGenerator';
import { dbService } from '../../services/db';

export const StatusCheckModal: React.FC = () => {
  const { 
    isStatusModalOpen, 
    setIsStatusModalOpen, 
    applications, 
    statusLookupUSN, 
    setStatusLookupUSN,
    setIsRegisterModalOpen 
  } = useApp();

  const [inputUSN, setInputUSN] = useState<string>('');
  const [searched, setSearched] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [result, setResult] = useState<VolunteerApplication | null>(null);
  const [showLargeQRModal, setShowLargeQRModal] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (statusLookupUSN) {
      setInputUSN(statusLookupUSN);
      handleSearch(statusLookupUSN);
    }
  }, [statusLookupUSN, isStatusModalOpen]);

  // Synchronize open result if applications array changes in real time
  useEffect(() => {
    if (result) {
      const match = applications.find(a => 
        a.id === result.id || 
        a.usn.toUpperCase() === result.usn.toUpperCase() ||
        (a.volunteerId && a.volunteerId === result.volunteerId)
      );
      if (match && (
        match.assignedEvent1 !== result.assignedEvent1 ||
        match.assignedEvent2 !== result.assignedEvent2 ||
        match.volunteerRole !== result.volunteerRole ||
        match.status !== result.status ||
        match.checkedIn !== result.checkedIn
      )) {
        setResult(match);
      }
    }
  }, [applications]);

  if (!isStatusModalOpen) return null;

  const handleSearch = async (usnToSearch?: string) => {
    const query = (usnToSearch || inputUSN).trim().toUpperCase();
    if (!query) return;

    setSearched(true);
    setIsSearching(true);
    setResult(null);

    try {
      // 1. Direct LIVE fetch from Supabase (Zero Caching)
      const liveMatch = await dbService.fetchApplicationByUSN(query);
      const match = liveMatch || applications.find(
        app => !app.isDeleted && (
          app.usn.toUpperCase() === query || 
          app.id.toUpperCase() === query ||
          (app.volunteerId && app.volunteerId.toUpperCase() === query)
        )
      ) || null;

      setResult(match);

      // CRITICAL QR RULE: ONLY generate QR if status is APPROVED
      if (match && match.status === 'APPROVED' && match.volunteerId && match.qrToken) {
        generateVolunteerQRCode({
          system: 'NOVATAS-2K26',
          volunteerId: match.volunteerId,
          fullName: match.fullName,
          usn: match.usn,
          department: match.department,
          section: match.section,
          assignedEvent1: match.assignedEvent1 || 'Assigned Event',
          volunteerRole: match.volunteerRole || 'Event Coordination',
          status: match.status,
          qrToken: match.qrToken,
          verifiedAt: new Date().toISOString()
        }).then(url => setQrCodeDataUrl(url));
      } else {
        setQrCodeDataUrl('');
      }
    } catch (err) {
      console.error('Error fetching live application status:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setIsStatusModalOpen(false);
    setStatusLookupUSN('');
    setSearched(false);
    setIsSearching(false);
    setResult(null);
    setShowLargeQRModal(false);
    setShowCardModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Modal Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/40 relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                LOOKUP PORTAL
              </span>
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide mt-1">
              CHECK APPLICATION STATUS
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/40">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
            ENTER YOUR USN NUMBER (OR APPLICATION ID)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. KUB25CSE052 or NOV26-00492"
                value={inputCodeText(inputUSN)}
                onChange={(e) => setInputUSN(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm uppercase focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              {isSearching ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>CHECKING...</span>
                </>
              ) : (
                <span>CHECK STATUS</span>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-2 font-mono">
            <span>Quick Test:</span>
            <button 
              onClick={() => { setInputUSN('KUB25CSE502'); handleSearch('KUB25CSE502'); }}
              className="text-cyan-400 hover:underline font-bold"
            >
              KUB25CSE502 (Abhiram - Approved)
            </button>
            <span>•</span>
            <button 
              onClick={() => { setInputUSN('1XX23CS088'); handleSearch('1XX23CS088'); }}
              className="text-amber-400 hover:underline font-bold"
            >
              1XX23CS088 (Ananya - Pending)
            </button>
            <span>•</span>
            <button 
              onClick={() => { setInputUSN('1XX23CS150'); handleSearch('1XX23CS150'); }}
              className="text-rose-400 hover:underline font-bold"
            >
              1XX23CS150 (Sneha - Rejected)
            </button>
          </div>
        </div>

        {/* Result Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {searched && !result && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-white">
                  NO APPLICATION FOUND
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  We could not find any volunteer application matching "{inputUSN}". Please verify your USN or submit a new application.
                </p>
              </div>
              <button
                onClick={() => {
                  handleClose();
                  setIsRegisterModalOpen(true);
                }}
                className="px-5 py-2.5 bg-cyan-500 text-black text-xs font-bold rounded-xl cursor-pointer"
              >
                APPLY AS VOLUNTEER
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* 1. EXACT PENDING STATUS (Section 10 Requirement) */}
          {/* ================================================================= */}
          {result && result.status === 'PENDING' && (
            <div className="space-y-6 py-2">
              <div className="p-6 rounded-3xl bg-amber-950/20 border-2 border-amber-500/50 text-left space-y-5 shadow-xl">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                    APPLICATION STATUS
                  </span>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>● PENDING REVIEW</span>
                  </span>
                </div>

                <div>
                  <h4 className="font-display font-black text-xl text-white">
                    Your application is under review.
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    The NOVATAS organizing committee is currently reviewing applications and assigning duty arenas.
                  </p>
                </div>

                {/* Preferences */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                    PREFERENCES:
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">Preference 1</span>
                      <span className="font-bold text-cyan-300">{result.preference1 || result.preferences[0]}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">Preference 2</span>
                      <span className="font-bold text-violet-300">{result.preference2 || result.preferences[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Pending Breakdown Table */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Final Event:</span>
                    <span className="text-amber-400 font-bold">Pending</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Volunteer Role:</span>
                    <span className="text-amber-400 font-bold">Pending</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Volunteer ID:</span>
                    <span className="text-slate-400 font-semibold italic">Not generated</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">QR:</span>
                    <span className="text-slate-400 font-semibold italic">Not available yet</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-[11px] text-slate-300 space-y-1">
                  <p className="font-bold text-amber-300">⏳ Notice to Applicant:</p>
                  <p>
                    Final event assignment and volunteer role are decided by the organizing team. Once the admin approves your application, your unique Volunteer ID and Digital Volunteer Badge will be activated here automatically.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 2. EXACT APPROVED STATUS (Section 10 Requirement) */}
          {/* ================================================================= */}
          {result && result.status === 'APPROVED' && (
            <div className="space-y-6 py-2">
              <div className="p-6 rounded-3xl bg-emerald-950/20 border-2 border-emerald-500/50 text-left space-y-5 shadow-xl">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                    APPLICATION STATUS
                  </span>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-[0_0_15px_rgba(0,208,132,0.2)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                    <span>APPLICATION APPROVED ✓</span>
                  </span>
                </div>

                {/* Volunteer ID callout */}
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">VOLUNTEER ID:</span>
                    <span className="font-display font-black text-2xl sm:text-3xl text-cyan-400 tracking-wider">
                      {result.volunteerId}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">QR BADGE:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800 inline-block">
                      AVAILABLE
                    </span>
                  </div>
                </div>

                {/* Final Assignment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3.5 bg-slate-900/90 rounded-2xl border-2 border-amber-500/50 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-amber-300 font-bold block">
                      FINAL ASSIGNED EVENT:
                    </span>
                    <p className="font-display font-black text-xl text-yellow-400">
                      {result.assignedEvent1 || 'Assigned Event'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-2xl border-2 border-violet-500/50 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-violet-300 font-bold block">
                      VOLUNTEER ROLE:
                    </span>
                    <p className="font-display font-black text-base text-slate-100">
                      {result.volunteerRole || 'Event Coordination'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons: VIEW VOLUNTEER CARD & VIEW QR */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowCardModal(true)}
                    className="flex-1 flex items-center justify-center space-x-2 px-5 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>VIEW VOLUNTEER CARD</span>
                  </button>

                  <button
                    onClick={() => setShowLargeQRModal(true)}
                    className="flex items-center justify-center space-x-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-400 font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>VIEW QR</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 3. EXACT REJECTED STATUS (Section 10 Requirement) */}
          {/* ================================================================= */}
          {result && result.status === 'REJECTED' && (
            <div className="space-y-6 py-2">
              <div className="p-6 rounded-3xl bg-rose-950/20 border-2 border-rose-500/50 text-left space-y-5 shadow-xl">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-rose-900/40">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                    APPLICATION STATUS
                  </span>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-rose-950 text-rose-400 border border-rose-800">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>APPLICATION NOT APPROVED</span>
                  </span>
                </div>

                {/* Reason Callout */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-rose-800/40 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                    REASON:
                  </span>
                  <p className="text-xs text-rose-200 leading-relaxed font-mono">
                    {result.rejectionReason || 'Requirements not met or quota filled for selected preferences.'}
                  </p>
                </div>

                {/* Inactive credentials table */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Volunteer ID:</span>
                    <span className="text-slate-400 italic">Not generated</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">QR:</span>
                    <span className="text-slate-400 italic">Not available</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      handleClose();
                      setIsRegisterModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    SUBMIT NEW APPLICATION
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: VIEW VOLUNTEER CARD (POPUP) */}
      {showCardModal && result && result.status === 'APPROVED' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in">
          <div className="relative max-w-md w-full max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setShowCardModal(false)}
              className="absolute top-2 right-2 z-50 p-2 bg-black/70 hover:bg-black rounded-full text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <DigitalVolunteerCard volunteer={result} />
          </div>
        </div>
      )}

      {/* MODAL: VIEW QR (POPUP) */}
      {showLargeQRModal && result && result.status === 'APPROVED' && qrCodeDataUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-slate-950 border border-cyan-500/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl shadow-cyan-950/60">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-display font-bold text-sm text-white">OFFICIAL ACCREDITATION QR</span>
              <button
                onClick={() => setShowLargeQRModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl w-60 h-60 mx-auto flex items-center justify-center border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.3)]">
              <img src={qrCodeDataUrl} alt="Accreditation QR" className="w-full h-full object-contain" />
            </div>

            <div>
              <p className="font-display font-black text-lg text-white">{result.fullName}</p>
              <p className="font-mono text-cyan-400 font-bold text-sm">{result.volunteerId}</p>
              <p className="text-xs text-yellow-400 font-mono mt-1">{result.assignedEvent1} • {result.volunteerRole}</p>
            </div>

            <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-300 font-mono">
              ✓ Present this QR at the festival gate for live accreditation check-in.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper
function inputCodeText(val: string): string {
  return val;
}
