import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const { setIsAdminLoggedIn } = useApp();
  const [email, setEmail] = useState('admin@novatas.com');
  const [password, setPassword] = useState('admin2k26');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-seeded secure credentials
    if (
      (email === 'admin@novatas.com' && password === 'admin2k26') ||
      (email === 'dvnsabhiram071@gmail.com' && password === 'novatas2026')
    ) {
      setIsAdminLoggedIn(true);
      setError('');
      onSuccess();
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl shadow-amber-950/30 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
            RESTRICTED ACCESS
          </span>
          <h3 className="font-display font-black text-2xl text-white tracking-wide mt-1">
            NOVATAS ADMIN PORTAL
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Log in to manage applications, events, assignments, and export data.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@novatas.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              PASSWORD
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
            <p className="font-semibold text-slate-300">Default Demo Credentials:</p>
            <p className="font-mono text-cyan-400">admin@novatas.com / admin2k26</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            ENTER ADMIN PORTAL
          </button>
        </form>

      </div>
    </div>
  );
};
