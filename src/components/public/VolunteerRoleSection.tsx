import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Camera, 
  Mic2, 
  Users, 
  Wrench, 
  ShieldAlert, 
  ClipboardList 
} from 'lucide-react';

export const VolunteerRoleSection: React.FC = () => {
  const roles = [
    { title: 'Event coordination', icon: Layers, desc: 'Keep timelines, match brackets, and session sequences strictly on schedule.' },
    { title: 'Participant assistance', icon: Users, desc: 'Guide registered students, clarify queries, and conduct spot roll calls.' },
    { title: 'Crowd management', icon: ShieldAlert, desc: 'Regulate auditorium flow, corridor passage, and prevent arena crowding.' },
    { title: 'Stage coordination', icon: Mic2, desc: 'Manage anchors, audio cables, podium presentation, and spotlight queues.' },
    { title: 'Event setup', icon: Wrench, desc: 'Assist with arena layouts, technical setup, banners, and table arrangements.' },
    { title: 'Photography/media support', icon: Camera, desc: 'Capture high-res candid moments, reels snippets, and crowd reactions.' },
    { title: 'Registration assistance', icon: ClipboardList, desc: 'Scan participant verification passes and distribute badges smoothly.' },
    { title: 'Backstage coordination', icon: CheckCircle2, desc: 'Line up next performers, green room clearance, and backstage access.' },
    { title: 'General event support', icon: CheckCircle2, desc: 'Provide versatile rapid response support wherever faculty or leads require.' },
  ];

  return (
    <section id="roles" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-900/30 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Vital Notice Box */}
        <div className="mb-12 p-4 sm:p-6 rounded-2xl border border-amber-500/40 bg-amber-950/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-display font-bold text-amber-300 tracking-wider uppercase mb-1">
              VOLUNTEERS ARE NOT PARTICIPANTS
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Volunteers are registering to <strong className="text-white">organize, manage, and coordinate</strong> NOVATAS 2K26 events behind the scenes. Volunteering does not count as competition participant entry.
            </p>
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold mb-3">
            RESPONSIBILITIES & DUTIES
          </h3>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            WHAT DOES A VOLUNTEER DO?
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Volunteers help the NOVATAS 2K26 organizing team manage and execute different events smoothly. Your assigned responsibilities on event day may include:
          </p>
        </div>

        {/* Roles 3x3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div 
                key={role.title}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex items-start space-x-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 group-hover:border-cyan-400 group-hover:bg-cyan-950/30 transition-colors">
                  <Icon className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors mb-1">
                    {role.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {role.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
