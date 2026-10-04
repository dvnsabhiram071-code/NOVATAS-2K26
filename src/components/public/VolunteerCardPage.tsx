import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  RotateCcw,
  CreditCard,
  X
} from 'lucide-react';
import { DigitalVolunteerCard } from './DigitalVolunteerCard';
import { dbService, VolunteerCardLookupResult } from '../../services/db';
import { VolunteerApplication } from '../../types';

export const VolunteerCardPage: React.FC<{ 
  initialVolunteerId?: string;
  onBackToHome: () => void;
}> = ({ initialVolunteerId, onBackToHome }) => {
  // Always start on lookup interface — never auto-reveal a card on mount or refresh
  const [searchQuery, setSearchQuery] = useState<string>(initialVolunteerId || '');
  const [currentVolunteer, setCurrentVolunteer] = useState<VolunteerApplication | null>(null);
  const [lookupResult, setLookupResult] = useState<VolunteerCardLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsLoading(true);
    setLookupResult(null);
    setCurrentVolunteer(null);

    try {
      const result = await dbService.fetchApprovedVolunteerForCard(query);
      setLookupResult(result);

      if (result.status === 'APPROVED') {
        setCurrentVolunteer(result.volunteer);
      } else {
        setCurrentVolunteer(null);
      }
    } catch (err: any) {
      setLookupResult({
        status: 'ERROR',
        message: err.message || 'Failed to query volunteer credentials.'
      });
      setCurrentVolunteer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setLookupResult(null);
    setCurrentVolunteer(null);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center justify-start py-8 px-4 relative overflow-hidden bg-grid-cyber">
      
      {/* Background ambient neon glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-6 mb-6 border-b border-slate-900 relative z-20">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-xl transition-all shadow-md shadow-black"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>RETURN TO HOME</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="font-display font-black text-lg text-white tracking-wide">
            NOVATAS <span className="font-brush text-cyan-400 text-xl">2K26</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold tracking-wider hidden sm:inline-flex items-center gap-1.5 shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            CREDENTIAL PORTAL
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl flex flex-col items-center relative z-20 pb-16">
        
        {/* If approved volunteer is found and verified, show Digital Volunteer Card */}
        {currentVolunteer && lookupResult?.status === 'APPROVED' ? (
          <div className="flex flex-col items-center w-full animate-fade-in">
            {/* Real Holographic Digital ID Card */}
            <DigitalVolunteerCard volunteer={currentVolunteer} />

            {/* Action Bar below Card */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2.5 px-6 py-3.5 bg-slate-900/95 hover:bg-slate-800/90 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-950/30 hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>SEARCH ANOTHER VOLUNTEER</span>
              </button>
            </div>
          </div>
        ) : (
          /* Futuristic ID Card Lookup Interface */
          <div className="w-full max-w-lg mx-auto">
            
            <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] p-6 sm:p-8 backdrop-blur-xl">
              
              {/* Decorative Corner Hologram Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-tr-3xl pointer-events-none" />
              <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              {/* Header Title Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase mb-4 shadow-sm">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>OFFICIAL CREDENTIAL VERIFICATION</span>
                </div>

                <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide uppercase mb-2">
                  VOLUNTEER <span className="text-cyan-400 text-glow">ID CARD</span>
                </h1>
                
                <p className="font-mono text-xs sm:text-sm text-slate-400 uppercase tracking-widest">
                  ENTER VOLUNTEER ID OR USN
                </p>
              </div>

              {/* Lookup Form */}
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </div>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Volunteer ID or USN..."
                    autoFocus
                    disabled={isLoading}
                    className="w-full pl-11 pr-10 py-3.5 bg-black/60 border border-slate-700 hover:border-cyan-500/50 focus:border-cyan-400 rounded-2xl text-white font-mono text-xs sm:text-sm tracking-wider uppercase placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  />

                  {searchQuery && !isLoading && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-display font-black text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>QUERYING DATABASE...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>VIEW ID CARD</span>
                    </>
                  )}
                </button>
              </form>

              {/* Status Feedback Messages */}
              {lookupResult && (
                <div className="mt-6">
                  {/* Case 1: NOT FOUND */}
                  {lookupResult.status === 'NOT_FOUND' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-center animate-fade-in shadow-lg shadow-amber-950/20">
                      <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-black text-sm text-amber-300 tracking-wider uppercase mb-1">
                        VOLUNTEER NOT FOUND
                      </h3>
                      <p className="font-mono text-xs text-slate-400">
                        Please check your Volunteer ID or USN.
                      </p>
                    </div>
                  )}

                  {/* Case 2: PENDING */}
                  {lookupResult.status === 'PENDING' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-center animate-fade-in shadow-lg shadow-cyan-950/20">
                      <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <h3 className="font-display font-black text-sm text-cyan-300 tracking-wider uppercase mb-1">
                        APPLICATION PENDING
                      </h3>
                      <p className="font-mono text-xs text-slate-400">
                        Your volunteer ID card will be available after approval.
                      </p>
                    </div>
                  )}

                  {/* Case 3: REJECTED */}
                  {lookupResult.status === 'REJECTED' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-red-950/30 border border-red-500/40 text-center animate-fade-in shadow-lg shadow-red-950/20">
                      <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-black text-sm text-red-300 tracking-wider uppercase mb-1">
                        APPLICATION REJECTED
                      </h3>
                      <p className="font-mono text-xs text-slate-400">
                        Your volunteer ID card is not available.
                      </p>
                    </div>
                  )}

                  {/* Case 4: UNASSIGNED (Approved but event/role pending) */}
                  {lookupResult.status === 'UNASSIGNED' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-violet-950/30 border border-violet-500/40 text-center animate-fade-in shadow-lg shadow-violet-950/20">
                      <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-black text-sm text-violet-300 tracking-wider uppercase mb-1">
                        ASSIGNMENT IN PROGRESS
                      </h3>
                      <p className="font-mono text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        {lookupResult.message || 'Your application is approved! Final event and role assignments are currently being finalized.'}
                      </p>
                    </div>
                  )}

                  {/* Case 5: ERROR */}
                  {lookupResult.status === 'ERROR' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-red-950/30 border border-red-500/40 text-center animate-fade-in shadow-lg shadow-red-950/20">
                      <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-black text-sm text-red-300 tracking-wider uppercase mb-1">
                        DATABASE LOOKUP ERROR
                      </h3>
                      <p className="font-mono text-xs text-slate-400">
                        {lookupResult.message}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Helpful Tips Section */}
              <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col space-y-2 text-center">
                <span className="text-[11px] font-mono text-slate-500">
                  Accepts Volunteer ID (<span className="text-cyan-400 font-bold">e.g. NVT26-V00492</span>) or University USN (<span className="text-cyan-400 font-bold">e.g. KUB25CSE502</span>).
                </span>
                <span className="text-[10px] font-mono text-slate-600">
                  Digital Volunteer Credentials are cryptographically signed and verified in real-time.
                </span>
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
};
