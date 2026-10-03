import React from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft, 
  Calendar, 
  Users, 
  GraduationCap, 
  CreditCard,
  QrCode,
  AlertCircle,
  Crown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VerifyVolunteerPage: React.FC<{ 
  tokenQuery: string;
  onBackToHome: () => void;
}> = ({ tokenQuery, onBackToHome }) => {
  const { applications, checkInVolunteer } = useApp();

  // Find volunteer by matching ID or qrToken within tokenQuery
  const cleanQuery = tokenQuery.toUpperCase().replace('/VERIFY/', '').replace('#/VERIFY/', '').trim();
  
  const foundVolunteer = applications.find(a => {
    if (a.isDeleted) return false;
    const vId = (a.volunteerId || '').toUpperCase();
    const token = (a.qrToken || '').toUpperCase();
    const usn = a.usn.toUpperCase();
    return (vId && cleanQuery.includes(vId)) || (token && cleanQuery.includes(token)) || cleanQuery.includes(usn);
  });

  const isApproved = foundVolunteer && foundVolunteer.status === 'APPROVED' && !!foundVolunteer.volunteerId;

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden bg-grid-cyber">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-20">
        
        {/* Top return action */}
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 px-3.5 py-2 mb-6 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO PORTAL</span>
        </button>

        {/* Verification Card */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border-2 border-emerald-500/50 p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 text-center space-y-6">
          
          {/* Header Status */}
          {isApproved ? (
            <div className="space-y-3">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold block mb-1">
                  OFFICIAL GATE ACCREDITATION SYSTEM
                </span>
                <h2 className="font-display font-black text-2xl text-white">
                  ✓ VALID & VERIFIED VOLUNTEER
                </h2>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  NOVATAS 2K26 • CSE DEPARTMENT
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-display font-black text-2xl text-white">
                  ✕ UNVERIFIED CREDENTIALS
                </h2>
                <p className="text-xs text-rose-400 font-mono mt-0.5">
                  No active approved volunteer badge found for this QR token.
                </p>
              </div>
            </div>
          )}

          {/* Volunteer Credentials Box */}
          {foundVolunteer && isApproved && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b border-slate-800">
                <img 
                  src={foundVolunteer.photoUrl} 
                  alt={foundVolunteer.fullName} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shrink-0"
                />
                <div>
                  <h3 className="font-display font-black text-lg text-white">
                    {foundVolunteer.fullName}
                  </h3>
                  <p className="text-cyan-400 font-mono text-xs font-bold">
                    {foundVolunteer.volunteerId}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    USN: {foundVolunteer.usn} • Sec {foundVolunteer.section}
                  </p>
                </div>
              </div>

              {/* Assignment specifics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-amber-300 block font-bold">
                    ASSIGNED EVENT
                  </span>
                  <p className="font-display font-black text-base text-yellow-400 mt-0.5">
                    {foundVolunteer.assignedEvent1}
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-violet-300 block font-bold">
                    VOLUNTEER ROLE
                  </span>
                  <p className="font-display font-bold text-xs text-slate-200 mt-1">
                    {foundVolunteer.volunteerRole || 'Event Coordination'}
                  </p>
                </div>
              </div>

              {/* Attendance confirmation */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                <p className="text-xs font-mono font-bold text-emerald-400">
                  ✓ ACCREDITATION ACTIVE • ADMITTED TO FESTIVAL GROUNDS
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
