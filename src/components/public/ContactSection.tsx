import React from 'react';
import { Mail, Phone, MessageSquare, Send, Sparkles, User, ExternalLink, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

export const ContactSection: React.FC = () => {
  const { contacts } = useApp();

  // Filter only ACTIVE contacts and sort by displayOrder
  const activeContacts = contacts
    .filter(c => c.status === 'ACTIVE')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/70 border-t border-slate-900">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header (Exact Title & Subtitle Specified) */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
              ORGANIZING COMMITTEE SUPPORT
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            NEED HELP?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Have questions about NOVATAS 2K26 volunteer registration? Contact the organizing team.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CONTACT CARDS OR COMING SOON NOTICE */}
        {/* ========================================================================= */}
        {activeContacts.length === 0 ? (
          /* When NO active contacts exist */
          <div className="max-w-md mx-auto p-10 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                CONTACT INFORMATION COMING SOON
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Official coordinator contact details are being finalized by the organizing committee.
              </p>
            </div>
          </div>
        ) : (
          /* Render Active Contacts in Order */
          <div className={`grid gap-8 ${
            activeContacts.length === 1 
              ? 'max-w-2xl mx-auto' 
              : activeContacts.length === 2 
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {activeContacts.map((contact) => {
              const cleanMobile = contact.mobile.replace(/\D/g, '');
              const whatsappUrl = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(
                `Hi ${contact.name}, I have a question regarding NOVATAS 2K26 volunteer registration.`
              )}`;

              return (
                <div 
                  key={contact.id}
                  className="glass-panel-glow p-7 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden flex flex-col justify-between group hover:border-cyan-400/60 transition-all duration-300"
                >
                  {/* Neon Glow Highlights */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[60px] pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 blur-[60px] pointer-events-none group-hover:bg-violet-500/20 transition-all" />

                  <div className="space-y-6 relative z-10">
                    
                    {/* Profile Image & Identification */}
                    <div className="flex items-center space-x-5">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-violet-600 p-[3px] shadow-lg shadow-cyan-500/20 shrink-0">
                        <div className="w-full h-full rounded-[13px] overflow-hidden bg-slate-950">
                          {contact.imageUrl ? (
                            <img 
                              src={contact.imageUrl} 
                              alt={contact.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-cyan-400">
                              <User className="w-10 h-10" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 min-w-0">
                        {contact.role && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono tracking-wider uppercase bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold truncate max-w-full">
                            {contact.role}
                          </span>
                        )}
                        <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide uppercase leading-tight truncate">
                          {contact.name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400 tracking-wider">
                          NOVATAS 2K26 TEAM
                        </p>
                      </div>
                    </div>

                    {/* Contact Details Display */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                        <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-mono text-xs truncate select-all">{contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                        <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-mono text-xs font-bold select-all">+91 {contact.mobile}</span>
                      </div>
                    </div>

                  </div>

                  {/* 3 Action Buttons: EMAIL, CALL, WHATSAPP */}
                  <div className="pt-6 mt-6 border-t border-slate-800/80 relative z-10 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      
                      {/* Email Button */}
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 py-3 px-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-[11px] uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer text-center"
                      >
                        <Mail className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>EMAIL</span>
                      </a>

                      {/* Call Button */}
                      <a
                        href={`tel:${cleanMobile}`}
                        className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 py-3 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/60 text-emerald-300 font-display font-bold text-[11px] uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                        <span>CALL</span>
                      </a>

                      {/* WhatsApp Button */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 py-3 px-2 rounded-xl bg-[#07301e] hover:bg-[#0b422a] border border-[#00D084]/60 text-[#00D084] font-display font-bold text-[11px] uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#00D084] stroke-[2.5]" />
                        <span>WHATSAPP</span>
                      </a>

                    </div>

                    {/* Optional LinkedIn Button for lead coordinator */}
                    {contact.email.toLowerCase().includes('abhiram') && (
                      <a
                        href="https://www.linkedin.com/in/dvnsabhiram?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-[#0077b5]/20 border border-slate-800 hover:border-[#0077b5]/60 text-slate-300 hover:text-white text-xs font-mono transition-all group"
                      >
                        <LinkedInIcon className="w-3.5 h-3.5 text-[#0077b5] group-hover:scale-110 transition-transform" />
                        <span>Connect on LinkedIn</span>
                      </a>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
