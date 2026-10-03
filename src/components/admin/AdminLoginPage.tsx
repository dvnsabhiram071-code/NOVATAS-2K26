import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  KeyRound
} from 'lucide-react';
import { adminAuthService } from '../../services/adminAuthService';

interface AdminLoginPageProps {
  onSuccess: (mustChangePassword: boolean) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTitle(null);
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorTitle('VALIDATION ERROR');
      setErrorMessage('Email address is required.');
      return;
    }

    if (!password) {
      setErrorTitle('VALIDATION ERROR');
      setErrorMessage('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await adminAuthService.login(email, password);

      if (!res.success) {
        if (res.error?.includes('ACCESS DENIED')) {
          setErrorTitle('ACCESS DENIED');
          setErrorMessage('Your account is not authorized to access the NOVATAS 2K26 administration panel.');
        } else if (res.error?.includes('ACCOUNT DEACTIVATED')) {
          setErrorTitle('ACCOUNT DEACTIVATED');
          setErrorMessage('Your admin account has been deactivated. Please contact the system coordinator.');
        } else if (res.error?.includes('Too many login attempts')) {
          setErrorTitle('RATE LIMIT EXCEEDED');
          setErrorMessage(res.error);
        } else {
          setErrorTitle('AUTHENTICATION FAILED');
          setErrorMessage('Invalid email or password.');
        }
        setIsLoading(false);
        return;
      }

      // Successful login
      setIsLoading(false);
      onSuccess(!!res.must_change_password);
    } catch {
      setErrorTitle('SYSTEM ERROR');
      setErrorMessage('An unexpected error occurred during authentication. Please retry.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none selection:bg-cyan-500 selection:text-black">
      
      {/* Background Cyber Glow Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/10 via-violet-600/15 to-pink-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      {/* Cyber Grid Lines overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #00E5FF 1px, transparent 1px), linear-gradient(to bottom, #00E5FF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="w-full max-w-md relative z-10 animate-in fade-in duration-300">
        
        {/* Header Badge & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono tracking-widest uppercase mb-4 shadow-lg shadow-cyan-950/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SECURE ADMINISTRATION</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-wider text-white">
            NOVATAS <span className="font-brush text-cyan-400">2K26</span>
          </h1>
          <p className="font-mono text-xs tracking-widest text-slate-400 uppercase mt-1">
            ADMIN PORTAL
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-cyan-950/30 relative group hover:border-cyan-500/30 transition-all duration-300">
          
          {/* Subtle Top Gradient Accent */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

          {/* Security Alert / Error Notice */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs animate-in fade-in duration-200">
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold font-mono tracking-wide text-rose-300 uppercase text-[11px]">
                    {errorTitle}
                  </p>
                  <p className="text-rose-200 leading-relaxed font-sans">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label 
                htmlFor="admin-email"
                className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2"
              >
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <label 
                htmlFor="admin-password"
                className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2"
              >
                PASSWORD
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 p-1 rounded-lg focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Notice */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start space-x-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Authorized committee login only. System access is monitored and cryptographically audited.
              </span>
            </div>

            {/* Sign In CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
                isLoading
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <p className="text-[11px] font-mono text-slate-500">
            DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            Kishkinda University • NOVATAS 2K26 Security Subsystem
          </p>
        </div>

      </div>
    </div>
  );
};
