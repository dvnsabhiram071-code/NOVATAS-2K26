import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onReplayIntro: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReplayIntro }) => {
  const { 
    setIsRegisterModalOpen, 
    setIsStatusModalOpen, 
    isAdminLoggedIn, 
    settings 
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'HOME', href: '#home' },
    { name: 'ABOUT', href: '#about' },
    { name: 'ROLES', href: '#roles' },
    { name: 'PREFERENCES', href: '#preferences' },
    { name: 'HOW IT WORKS', href: '#how-it-works' },
    { name: 'ID CARD', href: '#/volunteer-card' },
    { name: 'FAQ', href: '#faq' },
    { name: 'CONTACT', href: '#contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-cyan-950/20 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo & University Crest */}
        <a 
          href="#home" 
          className="flex items-center space-x-3 group focus:outline-none"
        >
          <img 
            src="/assets/kishkinda_university_logo.png" 
            alt="Kishkinda University" 
            className="h-9 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform" 
          />
          <div className="h-7 w-[1px] bg-slate-800 hidden sm:block" />
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-wider text-white">
              NOVATAS <span className="font-brush text-cyan-400 text-lg">2K26</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 -mt-1">
              KISHKINDA UNIVERSITY • CSE
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold tracking-wider text-slate-300 hover:text-cyan-400 transition-colors uppercase py-1 relative group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-violet-500 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          
          {/* Replay Intro */}
          <button
            onClick={onReplayIntro}
            title="Replay Neon Intro Animation"
            className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded-lg transition-colors border border-slate-800"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Admin Panel Entry */}
          <a
            href="#/admin"
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold tracking-wide text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 rounded-xl transition-all shadow-sm"
            title="Organizer & Committee Admin Panel"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>ADMIN</span>
          </a>

          {/* Check Status Button */}
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium tracking-wide text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 rounded-xl transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>CHECK STATUS</span>
          </button>

          {/* Register CTA */}
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            disabled={!settings.isRegistrationOpen}
            className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold tracking-wider rounded-xl transition-all shadow-lg ${
              settings.isRegistrationOpen
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{settings.isRegistrationOpen ? 'REGISTER NOW' : 'REGISTRATION CLOSED'}</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="p-2 text-slate-300 bg-slate-900 border border-slate-800 rounded-lg text-xs"
            title="Check Status"
          >
            <Search className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-4 pb-6 mt-3 backdrop-blur-2xl animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-3 mb-5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold tracking-wider text-slate-300 hover:text-cyan-400 py-2 border-b border-slate-800/60"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex flex-col space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsRegisterModalOpen(true);
              }}
              disabled={!settings.isRegistrationOpen}
              className={`w-full py-3 text-center text-xs font-bold tracking-wider rounded-xl ${
                settings.isRegistrationOpen
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {settings.isRegistrationOpen ? 'REGISTER AS VOLUNTEER' : 'REGISTRATION CLOSED'}
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsStatusModalOpen(true);
              }}
              className="w-full py-2.5 text-center text-xs font-semibold tracking-wider text-slate-200 bg-slate-900 border border-slate-700 rounded-xl"
            >
              CHECK APPLICATION STATUS
            </button>

            <a
              href="#/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-semibold tracking-wider text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ADMIN PORTAL</span>
            </a>

            <div className="flex items-center justify-start pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReplayIntro();
                }}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Neon Intro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
