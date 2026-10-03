import React from 'react';
import { 
  UserPlus, 
  Search, 
  CheckCircle, 
  Layers, 
  BadgePercent, 
  QrCode, 
  Sparkles,
  ArrowDown
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'REGISTER',
      desc: 'Submit your volunteer application with personal details, mandatory photo, and 2 event preferences.',
      icon: UserPlus,
      color: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/20'
    },
    {
      num: '02',
      title: 'ADMIN REVIEW',
      desc: 'The organizing team reviews and verifies your USN, profile photo, and branch credentials.',
      icon: Search,
      color: 'border-blue-500/50 text-blue-400 bg-blue-950/20'
    },
    {
      num: '03',
      title: 'APPROVAL',
      desc: 'Your application status updates to APPROVED or NOT APPROVED with an explanatory remark.',
      icon: CheckCircle,
      color: 'border-violet-500/50 text-violet-400 bg-violet-950/20'
    },
    {
      num: '04',
      title: 'EVENT ASSIGNMENT',
      desc: 'Organizers review your preferences and officially assign your designated fest event responsibilities.',
      icon: Layers,
      color: 'border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-950/20'
    },
    {
      num: '05',
      title: 'VOLUNTEER ID',
      desc: 'A permanent digital identifier (e.g., NVT26-V0482) is officially generated for your credentials.',
      icon: BadgePercent,
      color: 'border-pink-500/50 text-pink-400 bg-pink-950/20'
    },
    {
      num: '06',
      title: 'QR CODE',
      desc: 'Your digital volunteer verification pass and encoded QR badge are immediately unlocked.',
      icon: QrCode,
      color: 'border-orange-500/50 text-orange-400 bg-orange-950/20'
    },
    {
      num: '07',
      title: 'VOLUNTEER',
      desc: 'Report on event day, scan your QR badge at the registration desk, and lead the experience!',
      icon: Sparkles,
      color: 'border-yellow-500/50 text-yellow-400 bg-yellow-950/20'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/80 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 mb-3">
            <span className="text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
              SEAMLESS ONBOARDING
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            HOW VOLUNTEERING WORKS
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            From online registration to official stage check-in, here is your complete volunteer onboarding journey for NOVATAS 2K26.
          </p>
        </div>

        {/* 7-Step Interactive Flow */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.slice(0, 4).map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.num}
                  className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 relative group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display font-black text-2xl text-slate-700 group-hover:text-cyan-400 transition-colors">
                        {step.num}
                      </span>
                      <div className={`p-2.5 rounded-xl border ${step.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-base text-white tracking-wider mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center my-6">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 animate-bounce">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {steps.slice(4).map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.num}
                  className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-yellow-500/40 transition-all duration-300 relative group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display font-black text-2xl text-slate-700 group-hover:text-yellow-400 transition-colors">
                        {step.num}
                      </span>
                      <div className={`p-2.5 rounded-xl border ${step.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-base text-white tracking-wider mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
