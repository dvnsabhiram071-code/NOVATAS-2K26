import React from 'react';
import { 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Users, 
  Calendar, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeroSection: React.FC = () => {
  const { 
    setIsRegisterModalOpen, 
    setIsStatusModalOpen, 
    settings, 
    applications 
  } = useApp();

  const totalApproved = applications.filter(a => a.status === 'APPROVED' && !a.isDeleted).length;

  return (
    <section 
      id="home" 
      className="relative min-h-[96vh] flex flex-col items-center justify-center pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-grid-cyber"
    >
      {/* Dynamic ambient glowing spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-600/15 via-violet-600/15 to-pink-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/10 rounded-full blur-[110px] pointer-events-none animate-pulse" />

      {/* ========================================================================= */}
      {/* OFFICIAL INSTITUTIONAL REFERENCE HEADER BAR (Kishkinda & T.E.H.R.D Trust) */}
      {/* ========================================================================= */}
      <div className="w-full max-w-6xl mx-auto mb-10 relative z-20">
        <div className="glass-panel p-3.5 sm:p-4 rounded-3xl border border-amber-500/30 bg-black/80 backdrop-blur-2xl shadow-2xl shadow-amber-950/20 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* LEFT: Kishkinda University Logo & Typography */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-sm group-hover:bg-amber-400/40 transition-all" />
              <img 
                src="/assets/kishkinda_university_logo.png" 
                alt="Kishkinda University" 
                className="relative h-12 sm:h-14 md:h-16 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-black text-sm sm:text-base md:text-lg tracking-widest text-[#F5B041] uppercase">
                KISHKINDA
              </span>
              <span className="font-display font-semibold text-[10px] sm:text-xs md:text-sm tracking-[0.25em] text-[#E59866] uppercase -mt-0.5">
                UNIVERSITY
              </span>
            </div>
          </div>


          {/* RIGHT: T.E.H.R.D Trust / Basavarajeswari Group & Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex flex-col text-right">
              <span className="font-display font-black text-xs sm:text-sm md:text-base tracking-[0.2em] text-white uppercase">
                T.E.H.R.D TRUST
              </span>
              <span className="font-display font-semibold text-[9px] sm:text-[11px] md:text-xs tracking-wider text-[#F5B041] uppercase -mt-0.5">
                BASAVARAJESWARI GROUP
              </span>
            </div>
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-full bg-white/20 blur-sm group-hover:bg-amber-400/30 transition-all" />
              <img 
                src="/assets/tehrd_trust_logo.png" 
                alt="T.E.H.R.D Trust" 
                className="relative h-12 sm:h-14 md:h-16 w-auto object-contain bg-white rounded-full p-0.5 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
              />
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono tracking-widest text-cyan-300 font-semibold uppercase">
            Official Volunteer Portal • Department of CSE
          </span>
        </div>

        {/* Big Neon Headings */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-3">
            <span className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-[0_0_35px_rgba(0,229,255,0.3)]">
              NOVATAS
            </span>
            <span className="font-brush text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 -rotate-3 inline-block">
              2K26
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-200 to-pink-300">
            BE THE TEAM<br />
            BEHIND THE EXPERIENCE.
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-300 font-light leading-relaxed pt-2">
            Join the <span className="text-white font-medium">NOVATAS 2K26</span> volunteer team and help make the grand freshers event happen. Coordinate, organize, and lead behind the scenes.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            disabled={!settings.isRegistrationOpen}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl font-display font-bold text-sm tracking-wider uppercase transition-all duration-300 group shadow-2xl ${
              settings.isRegistrationOpen
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-cyan-500/25 hover:shadow-cyan-400/50 hover:scale-105'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>{settings.isRegistrationOpen ? 'BECOME A VOLUNTEER' : 'REGISTRATION CLOSED'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl font-display font-semibold text-sm tracking-wider uppercase text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/50"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span>CHECK APPLICATION STATUS</span>
          </button>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className="glass-panel p-4 rounded-2xl text-left border-slate-800/90 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center space-x-2 text-cyan-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Volunteers</span>
            </div>
            <p className="font-display font-bold text-xl text-white">
              {totalApproved}+ Active
            </p>
          </div>

          <div className="glass-panel p-4 rounded-2xl text-left border-slate-800/90 hover:border-violet-500/30 transition-colors">
            <div className="flex items-center space-x-2 text-violet-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Events</span>
            </div>
            <p className="font-display font-bold text-xl text-white">
              11 Categories
            </p>
          </div>

          <div className="glass-panel p-4 rounded-2xl text-left border-slate-800/90 hover:border-pink-500/30 transition-colors">
            <div className="flex items-center space-x-2 text-pink-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Verification</span>
            </div>
            <p className="font-display font-bold text-xl text-white">
              Digital QR ID
            </p>
          </div>

          <div className="glass-panel p-4 rounded-2xl text-left border-slate-800/90 hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center space-x-2 text-yellow-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Status</span>
            </div>
            <p className="font-display font-bold text-xl text-emerald-400">
              {settings.isRegistrationOpen ? 'Registration Live' : 'Closed'}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
