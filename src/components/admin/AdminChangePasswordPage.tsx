import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Lock, 
  ArrowRight, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { adminAuthService, validatePasswordStrength } from '../../services/adminAuthService';

interface AdminChangePasswordPageProps {
  onSuccess: () => void;
}

export const AdminChangePasswordPage: React.FC<AdminChangePasswordPageProps> = ({ onSuccess }) => {
  const currentSession = adminAuthService.getSession();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const strength = validatePasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = strength.isValid && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentSession) {
      setErrorMessage('Admin session expired. Please sign in again.');
      return;
    }

    if (!isFormValid) {
      if (!passwordsMatch) {
        setErrorMessage('Passwords do not match.');
      } else {
        setErrorMessage('Please ensure your new password satisfies all security requirements.');
      }
      return;
    }

    setIsLoading(true);

    try {
      const res = await adminAuthService.changePassword(
        currentSession.adminId,
        currentPassword,
        newPassword
      );

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update password. Verify current password.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);

      // Auto redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch {
      setErrorMessage('An unexpected error occurred while securing your account. Please retry.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none selection:bg-cyan-500 selection:text-black">
      
      {/* Background Cyber Glow Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/10 via-violet-600/15 to-pink-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Cyber Grid Lines overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #00E5FF 1px, transparent 1px), linear-gradient(to bottom, #00E5FF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="w-full max-w-lg relative z-10 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] font-mono tracking-widest uppercase mb-3 shadow-lg shadow-amber-950/40">
            <Lock className="w-3.5 h-3.5" />
            <span>INITIAL CREDENTIAL SECURITY PROTOCOL</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-white">
            WELCOME TO NOVATAS 2K26 ADMIN
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            For security, you must create a new password before accessing the admin dashboard.
          </p>
          {currentSession && (
            <p className="text-[11px] font-mono text-cyan-400 mt-1">
              Securing account: <span className="font-semibold text-white">{currentSession.email}</span>
            </p>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-slate-900/85 backdrop-blur-2xl border border-cyan-500/25 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-cyan-950/30 relative">
          
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Success Banner */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="font-display font-black text-xl text-emerald-300 tracking-wide">
                  PASSWORD UPDATED ✓
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Your admin account has been secured.
                </p>
                <p className="text-[11px] font-mono text-cyan-400 mt-3 animate-pulse">
                  Redirecting to admin dashboard...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2.5 animate-in fade-in duration-200">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Current Password Field */}
              <div>
                <label 
                  htmlFor="current-password"
                  className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2"
                >
                  CURRENT PASSWORD
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current / initial password"
                    className="w-full pl-10 pr-12 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                    title={showCurrent ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 p-1 rounded-lg focus:outline-none transition-colors"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <label 
                  htmlFor="new-password"
                  className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2"
                >
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong new password"
                    className="w-full pl-10 pr-12 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                    title={showNew ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 p-1 rounded-lg focus:outline-none transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
                  PASSWORD REQUIREMENTS
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className={`flex items-center space-x-2 ${strength.hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasMinLength ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                    <span>At least 8 characters</span>
                  </div>

                  <div className={`flex items-center space-x-2 ${strength.hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasUppercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                    <span>Uppercase letter</span>
                  </div>

                  <div className={`flex items-center space-x-2 ${strength.hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasLowercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                    <span>Lowercase letter</span>
                  </div>

                  <div className={`flex items-center space-x-2 ${strength.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasNumber ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                    <span>Number</span>
                  </div>

                  <div className={`flex items-center space-x-2 sm:col-span-2 ${strength.hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasSpecialChar ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                    <span>Special character (!@#$%^&amp;*...)</span>
                  </div>
                </div>
              </div>

              {/* Confirm New Password Field */}
              <div>
                <label 
                  htmlFor="confirm-password"
                  className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2"
                >
                  CONFIRM NEW PASSWORD
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-12 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    title={showConfirm ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 p-1 rounded-lg focus:outline-none transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-rose-400 mt-1.5 font-mono">
                    Passwords do not match.
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-xs text-emerald-400 mt-1.5 font-mono flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Passwords match ✓</span>
                  </p>
                )}
              </div>

              {/* Update Password CTA */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full py-3.5 px-4 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                  !isFormValid || isLoading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-white rounded-full animate-spin" />
                    <span>SECURING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>UPDATE PASSWORD</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
