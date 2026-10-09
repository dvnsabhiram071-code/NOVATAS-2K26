import React from 'react';
import { Sparkles, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

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

export const Footer: React.FC = () => {
  const { setIsRegisterModalOpen, setIsStatusModalOpen } = useApp();

  return (
    <footer className="relative bg-slate-950 border-t border-slate-900 pt-16 pb-12 overflow-hidden">
      {/* Background neon ambient blur */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-gradient-to-r from-cyan-900/10 via-violet-900/10 to-pink-900/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Tagline + Instagram */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 p-0.5 shadow-md shadow-cyan-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-display font-black text-xl tracking-wider text-white">
                NOVATAS <span className="font-brush text-cyan-400">2K26</span>
              </span>
            </div>
            
            <p className="font-display text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 font-bold uppercase">
              BE THE TEAM BEHIND THE EXPERIENCE.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              The official volunteer management and coordination system for NOVATAS 2K26, organized by the Department of Computer Science & Engineering.
            </p>

            {/* Social Badges - Instagram & LinkedIn Logos */}
            <div className="pt-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2.5 font-semibold">
                CONNECT WITH US
              </p>
              <div className="flex items-center space-x-3">
                <a
                  href="https://www.instagram.com/vibeframes__/?utm_source=ig_web_button_share_sheet"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow on Instagram (@vibeframes__)"
                  aria-label="Instagram @vibeframes__"
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 hover:scale-110 hover:shadow-pink-500/40 hover:brightness-110 transition-all duration-200"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>

                <a
                  href="https://www.instagram.com/ku_cse_blud?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow on Instagram (@ku_cse_blud)"
                  aria-label="Instagram @ku_cse_blud"
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 hover:scale-110 hover:shadow-pink-500/40 hover:brightness-110 transition-all duration-200"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>

                <a
                  href="https://www.linkedin.com/in/dvnsabhiram?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Connect on LinkedIn (D V N S ABHIRAM)"
                  aria-label="LinkedIn D V N S ABHIRAM"
                  className="w-9 h-9 rounded-xl bg-[#0077b5] flex items-center justify-center text-white shadow-md shadow-[#0077b5]/25 hover:scale-110 hover:shadow-[#0077b5]/50 hover:brightness-110 transition-all duration-200"
                >
                  <LinkedInIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-bold mb-4">
              QUICK NAVIGATION
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#home" className="hover:text-cyan-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-cyan-400 transition-colors">About NOVATAS</a>
              </li>
              <li>
                <button 
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Volunteer Registration
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setIsStatusModalOpen(true)}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Check Application Status
                </button>
              </li>
              <li>
                <a href="#faq" className="hover:text-cyan-400 transition-colors">Frequently Asked Questions</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact Organizers</a>
              </li>
              <li className="pt-2 border-t border-slate-900">
                <a href="#/admin" className="text-amber-400/90 hover:text-amber-300 transition-colors font-mono font-semibold flex items-center space-x-1">
                  <span>🔒 Admin Portal</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Lead Coordinator Info */}
          <div>
            <h4 className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-bold mb-4">
              ORGANIZING COMMITTEE
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <p className="font-semibold text-white tracking-wide">
                D V N S ABHIRAM
              </p>
              <div className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <a href="mailto:dvnsabhiram071@gmail.com" className="truncate">dvnsabhiram071@gmail.com</a>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:8618842527">+91 8618842527</a>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 hover:text-[#0077b5] transition-colors">
                <LinkedInIcon className="w-3.5 h-3.5 text-[#0077b5] shrink-0" />
                <a 
                  href="https://www.linkedin.com/in/dvnsabhiram?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="truncate hover:underline"
                >
                  LinkedIn Profile
                </a>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Department of Computer Science &amp; Engineering
              </p>
            </div>
          </div>

          {/* Col 4: Campus Address */}
          <div>
            <h4 className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-bold mb-4">
              CAMPUS ADDRESS
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">
                    Main Campus (Mount View Campus):
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    GP No. 735, H. Hosalli Gram Panchayath, Near Sindhigeri, Off 28 KM, Ballari – Siruguppa Road, Siruguppa Taluk, Ballari District – 583120, Karnataka, India
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Official Student Volunteer Portal</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900/90 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div className="flex items-center space-x-4">
            <span>© 2026 NOVATAS 2K26. All Rights Reserved.</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-slate-400">Department of CSE</span>
          </div>

          <div className="flex items-center space-x-5">
            {/* Quick social icons in bottom row */}
            <div className="flex items-center space-x-2">
              <a
                href="https://www.instagram.com/vibeframes__/?utm_source=ig_web_button_share_sheet"
                target="_blank"
                rel="noopener noreferrer"
                title="@vibeframes__ on Instagram"
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 border border-slate-800 hover:border-transparent flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-sm"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.instagram.com/ku_cse_blud?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                title="@ku_cse_blud on Instagram"
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 border border-slate-800 hover:border-transparent flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-sm"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.linkedin.com/in/dvnsabhiram?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn (D V N S ABHIRAM)"
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-[#0077b5] border border-slate-800 hover:border-transparent flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-sm"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
              </a>
            </div>

            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms & Conditions</span>
          </div>
        </div>

        {/* Very last line: Built by ABHIRAM & team */}
        <div className="mt-8 pt-6 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <p className="text-xs font-mono tracking-wider text-slate-400">
            Built by <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400">ABHIRAM &amp; team</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
