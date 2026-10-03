import React from 'react';
import { Users2, Award, Compass, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const pillars = [
    {
      num: '01',
      title: 'TEAMWORK',
      desc: 'Collaborate with fellow peers and seniors across departments to orchestrate large-scale stages, tournaments, and crowds seamlessly.',
      icon: Users2,
      color: 'from-cyan-500 to-blue-500',
      border: 'hover:border-cyan-500/50'
    },
    {
      num: '02',
      title: 'LEADERSHIP',
      desc: 'Take direct ownership of live event arenas, coordinate stage timings, direct participants, and solve real-time logistical challenges.',
      icon: Compass,
      color: 'from-violet-500 to-purple-500',
      border: 'hover:border-violet-500/50'
    },
    {
      num: '03',
      title: 'RESPONSIBILITY',
      desc: 'Act as the trusted backbone of NOVATAS 2K26. Ensure strict fair play, protocol adherence, and attendee security throughout the fest.',
      icon: Award,
      color: 'from-pink-500 to-rose-500',
      border: 'hover:border-pink-500/50'
    },
    {
      num: '04',
      title: 'EXPERIENCE',
      desc: 'Gain unmatched management credentials, an official verified digital Volunteer ID badge, certificate eligibility, and unforgettable memories.',
      icon: Sparkles,
      color: 'from-amber-400 to-yellow-500',
      border: 'hover:border-yellow-500/50'
    }
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/60 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 mb-3">
            <span className="text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
              ABOUT NOVATAS 2K26
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
            POWRED BY STUDENTS.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400">
              CRAFTED BY VOLUNTEERS.
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            NOVATAS 2K26 is a premier freshers festival powered entirely by students who organize, coordinate, and create the experience behind the scenes. As a volunteer, you will be part of the team responsible for helping every event run smoothly.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.num}
                className={`glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 transition-all duration-300 group hover:-translate-y-1.5 ${pillar.border}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display font-black text-3xl sm:text-4xl text-slate-700 group-hover:text-white transition-colors">
                    {pillar.num}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.color} p-0.5 shadow-lg`}>
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-white tracking-wide mb-3">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
