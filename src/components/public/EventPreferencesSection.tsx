import React from 'react';
import { 
  Trophy, 
  Sparkles, 
  Video, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EventPreferencesSection: React.FC = () => {
  const { events, setIsRegisterModalOpen, settings } = useApp();

  const sportsEvents = events.filter(e => e.category === 'SPORTS');
  const culturalEvents = events.filter(e => e.category === 'CULTURAL');
  const mediaEvents = events.filter(e => e.category === 'MEDIA / CREATIVE');

  return (
    <section id="preferences" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-800/40 mb-3">
            <span className="text-xs font-mono tracking-widest text-violet-400 font-bold uppercase">
              ASSIGNMENT PREFERENCES
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            SELECT YOUR VOLUNTEER EVENT PREFERENCES
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Choose <span className="text-cyan-400 font-semibold">exactly 2 events</span> you would like to volunteer for. These are volunteer assignment preferences, not participant registrations.
          </p>
        </div>

        {/* 3 Categories Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          
          {/* Sports */}
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">SPORTS</h3>
                <p className="text-[11px] font-mono text-cyan-400">4 EVENTS AVAILABLE</p>
              </div>
            </div>

            <div className="space-y-3">
              {sportsEvents.map((e) => (
                <div 
                  key={e.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-sm font-semibold text-slate-200">{e.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Preference
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cultural */}
          <div className="glass-panel p-6 rounded-3xl border border-violet-500/20 hover:border-violet-500/50 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">CULTURAL</h3>
                <p className="text-[11px] font-mono text-violet-400">5 EVENTS AVAILABLE</p>
              </div>
            </div>

            <div className="space-y-3">
              {culturalEvents.map((e) => (
                <div 
                  key={e.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    <span className="text-sm font-semibold text-slate-200">{e.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Preference
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Media / Creative */}
          <div className="glass-panel p-6 rounded-3xl border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-950 border border-pink-500/30 flex items-center justify-center">
                <Video className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">MEDIA / CREATIVE</h3>
                <p className="text-[11px] font-mono text-pink-400">2 EVENTS AVAILABLE</p>
              </div>
            </div>

            <div className="space-y-3">
              {mediaEvents.map((e) => (
                <div 
                  key={e.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    <span className="text-sm font-semibold text-slate-200">{e.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Preference
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Vital Rule: Admin Has Final Control */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-display font-bold text-base sm:text-lg text-white tracking-wide mb-1">
                  ADMIN HAS FINAL ASSIGNMENT CONTROL
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Your selected events are preferences. Final volunteer event assignments will be decided and balanced by the <strong className="text-white">NOVATAS 2K26 organizing team</strong> based on logistical needs.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              disabled={!settings.isRegistrationOpen}
              className={`shrink-0 flex items-center space-x-2 px-6 py-3 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all ${
                settings.isRegistrationOpen
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>REGISTER NOW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
