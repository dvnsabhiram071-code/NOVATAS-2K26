import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  RotateCcw, 
  Save, 
  Check, 
  ShieldAlert, 
  Users, 
  KeyRound, 
  Activity, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  Lock,
  Clock,
  Sparkles,
  X,
  Database,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  adminAuthService, 
  validatePasswordStrength 
} from '../../services/adminAuthService';
import { AdminAccount, AdminAuditLog } from '../../types';

export const AdminSettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetDemoData, 
    isCloudConnected, 
    saveCloudConfig, 
    getCloudConfig, 
    refreshData 
  } = useApp();

  // Settings subtab navigation
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'database' | 'accounts' | 'password' | 'audit'>('general');

  // Cloud Database state
  const initialCloud = getCloudConfig();
  const [cloudUrl, setCloudUrl] = useState(initialCloud.url);
  const [cloudKey, setCloudKey] = useState(initialCloud.key);
  const [cloudSource, setCloudSource] = useState(initialCloud.source);
  const [cloudTestLoading, setCloudTestLoading] = useState(false);
  const [cloudStatusMsg, setCloudStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveCloudConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloudTestLoading(true);
    setCloudStatusMsg(null);
    try {
      const res = await saveCloudConfig(cloudUrl, cloudKey);
      if (res.success) {
        setCloudStatusMsg({ type: 'success', text: res.message });
        setCloudSource(getCloudConfig().source);
        await refreshData();
      } else {
        setCloudStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setCloudStatusMsg({ type: 'error', text: err.message || 'Connection failed' });
    } finally {
      setCloudTestLoading(false);
    }
  };

  // General Settings state
  const [eventName, setEventName] = useState(settings.eventName);
  const [department, setDepartment] = useState(settings.department);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(settings.isRegistrationOpen);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Admin Accounts state
  const [adminAccounts, setAdminAccounts] = useState<Omit<AdminAccount, 'password_hash'>[]>([]);
  const [accountActionMessage, setAccountActionMessage] = useState<string | null>(null);

  // Change Password state
  const currentSession = adminAuthService.getSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  useEffect(() => {
    refreshAccounts();
    refreshAuditLogs();
  }, []);

  useEffect(() => {
    setEventName(settings.eventName);
    setDepartment(settings.department);
    setIsRegistrationOpen(settings.isRegistrationOpen);
  }, [settings]);

  const refreshAccounts = () => {
    setAdminAccounts(adminAuthService.listAdminAccounts());
  };

  const refreshAuditLogs = () => {
    setAuditLogs(adminAuthService.getAuditLogs());
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      eventName,
      department,
      isRegistrationOpen,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all applications, events, and settings to original demo records?')) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleToggleAdminStatus = (targetId: string) => {
    if (!currentSession) return;
    const res = adminAuthService.toggleAdminStatus(targetId, currentSession.adminId);
    if (res.success) {
      setAccountActionMessage(res.message || 'Status updated.');
      refreshAccounts();
      refreshAuditLogs();
      setTimeout(() => setAccountActionMessage(null), 3000);
    } else {
      alert(res.message || 'Action failed.');
    }
  };

  const strength = validatePasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordFormValid = strength.isValid && passwordsMatch && currentPassword.length > 0;

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);

    if (!currentSession) {
      setPasswordChangeError('Session expired. Please sign in again.');
      return;
    }

    if (!isPasswordFormValid) {
      if (!passwordsMatch) {
        setPasswordChangeError('Passwords do not match.');
      } else {
        setPasswordChangeError('Password does not satisfy all security requirements.');
      }
      return;
    }

    setPasswordChangeLoading(true);

    try {
      const res = await adminAuthService.changePassword(
        currentSession.adminId,
        currentPassword,
        newPassword
      );

      if (!res.success) {
        setPasswordChangeError(res.error || 'Failed to update password.');
        setPasswordChangeLoading(false);
        return;
      }

      setPasswordChangeSuccess(true);
      setPasswordChangeLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      refreshAccounts();
      refreshAuditLogs();
      setTimeout(() => setPasswordChangeSuccess(false), 4000);
    } catch {
      setPasswordChangeError('An unexpected error occurred. Please retry.');
      setPasswordChangeLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl text-white tracking-wide">
          SYSTEM SETTINGS &amp; SECURITY CONTROLS
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage event parameters, administrator access, credential policies, and cryptographic audit records.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all ${
            activeSubTab === 'general'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>General Settings</span>
        </button>

        <button
          onClick={() => setActiveSubTab('database')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all ${
            activeSubTab === 'database'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Cloud Database</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('accounts');
            refreshAccounts();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all ${
            activeSubTab === 'accounts'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Admin Accounts</span>
        </button>

        <button
          onClick={() => setActiveSubTab('password')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all ${
            activeSubTab === 'password'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Change Password</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('audit');
            refreshAuditLogs();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all ${
            activeSubTab === 'audit'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Security &amp; Audit Logs</span>
        </button>
      </div>

      {/* SUBTAB 1: GENERAL SETTINGS */}
      {activeSubTab === 'general' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {savedSuccess && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-mono flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>System settings updated successfully!</span>
            </div>
          )}

          {resetSuccess && (
            <div className="p-4 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl text-cyan-300 text-xs font-mono flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Demo datasets restored to default test applications.</span>
            </div>
          )}

          <form onSubmit={handleSaveGeneral} className="space-y-6">
            
            {/* Registration Switch Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
                    PUBLIC INTAKE STATUS
                  </span>
                  <h3 className="font-display font-bold text-lg text-white">
                    VOLUNTEER REGISTRATION SWITCH
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    Toggle whether students can submit new volunteer applications from the public portal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                  className={`flex items-center space-x-3 px-5 py-3 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-all border ${
                    isRegistrationOpen
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-rose-950/80 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${isRegistrationOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                  <span>{isRegistrationOpen ? '🟢 REGISTRATION OPEN' : '🔴 REGISTRATION CLOSED'}</span>
                </button>
              </div>

              {!isRegistrationOpen && (
                <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300">
                  When closed, students viewing the registration page will see: 
                  <strong className="block mt-1 font-mono text-white">
                    &quot;REGISTRATION CLOSED — Volunteer registration for NOVATAS 2K26 is currently closed.&quot;
                  </strong>
                </div>
              )}
            </div>

            {/* General Settings Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
              <h3 className="font-display font-bold text-base text-white pb-3 border-b border-slate-800">
                EVENT SPECIFICATIONS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                    EVENT NAME
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                    ORGANIZING DEPARTMENT
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Max Event Preferences</span>
                  <p className="font-bold text-white mt-1">2 Events Required</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Max Image Size</span>
                  <p className="font-bold text-white mt-1">5 MB Limit</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Allowed Photo Formats</span>
                  <p className="font-bold text-white mt-1">JPG / PNG / WEBP</p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE SETTINGS</span>
                </button>
              </div>
            </div>

            {/* Demo Data Management */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-white">
                  RESTORE INITIAL DEMO DATA
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reset applications, volunteer IDs, events, and rosters back to initial demo state.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>RESET DEMO DATA</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* SUBTAB: CLOUD DATABASE */}
      {activeSubTab === 'database' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-display font-bold text-lg text-white">
                    SHARED CLOUD DATABASE (SUPABASE POSTGRESQL)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Single source of truth shared across all mobile phones, desktops, tablets, and the public website.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span 
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase border ${
                    isCloudConnected
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400'
                      : 'bg-amber-950/70 border-amber-500/40 text-amber-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isCloudConnected ? 'SUPABASE LIVE' : 'DISCONNECTED / LOCAL CACHE'}</span>
                </span>
              </div>
            </div>

            {cloudStatusMsg && (
              <div className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between ${
                cloudStatusMsg.type === 'success' 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}>
                <span>{cloudStatusMsg.text}</span>
                <button onClick={() => setCloudStatusMsg(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveCloudConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  SUPABASE PROJECT URL <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://your-project-id.supabase.co"
                  value={cloudUrl}
                  onChange={(e) => setCloudUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Found in your Supabase dashboard under: Project Settings → API → Project URL
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  SUPABASE PUBLIC ANON KEY <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={cloudKey}
                  onChange={(e) => setCloudKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Found in your Supabase dashboard under: Project Settings → API → Project API Keys (anon public)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                <div className="text-[11px] font-mono text-slate-400">
                  {cloudSource === 'env' && (
                    <span className="text-cyan-400">✓ Loaded from Vercel environment variables (VITE_SUPABASE_URL)</span>
                  )}
                  {cloudSource === 'storage' && (
                    <span className="text-emerald-400">✓ Saved in browser cloud storage connection</span>
                  )}
                  {cloudSource === 'none' && (
                    <span className="text-amber-400">⚠ No cloud database credentials configured yet</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={cloudTestLoading}
                  className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${cloudTestLoading ? 'animate-spin' : ''}`} />
                  <span>{cloudTestLoading ? 'TESTING CONNECTION...' : 'SAVE & CONNECT DATABASE'}</span>
                </button>
              </div>
            </form>

            {/* Sync instructions */}
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs space-y-2">
              <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>CROSS-DEVICE SYNCHRONIZATION GUARANTEE</span>
              </h4>
              <ul className="text-slate-400 space-y-1 list-disc list-inside font-mono text-[11px]">
                <li>Any changes made on this mobile phone or browser are stored directly in Supabase PostgreSQL.</li>
                <li>Supabase Realtime automatically broadcasts updates to all connected devices in milliseconds.</li>
                <li>When another device opens the public website, it always fetches the single source of truth from Supabase.</li>
                <li>Initial records (approved volunteers, events, contacts, FAQs) are automatically seeded if the database is newly initialized.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ADMIN ACCOUNTS */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                AUTHORIZED ADMINISTRATOR ACCOUNTS
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Access is strictly restricted to pre-approved committee members. Public registration is disabled.
              </p>
            </div>
            <div className="px-3 py-1 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-mono">
              4 Whitelisted Accounts
            </div>
          </div>

          {accountActionMessage && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-mono flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{accountActionMessage}</span>
            </div>
          )}

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    <th className="py-4 px-5">Admin Name</th>
                    <th className="py-4 px-5">Email Address</th>
                    <th className="py-4 px-5">Role</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Last Login</th>
                    <th className="py-4 px-5">Password Changed</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {adminAccounts.map((admin) => {
                    const isSelf = currentSession?.adminId === admin.id;

                    return (
                      <tr key={admin.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-semibold text-white flex items-center space-x-2">
                            <span>{admin.name}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{admin.id}</span>
                        </td>

                        <td className="py-4 px-5 font-mono text-slate-300">
                          {admin.email}
                        </td>

                        <td className="py-4 px-5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                            {admin.role}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                              admin.is_active
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${admin.is_active ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                            <span>{admin.is_active ? 'ACTIVE' : 'DEACTIVATED'}</span>
                          </span>
                        </td>

                        <td className="py-4 px-5 font-mono text-slate-400 text-[11px]">
                          {admin.last_login_at
                            ? new Date(admin.last_login_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Never logged in'}
                        </td>

                        <td className="py-4 px-5 font-mono text-slate-400 text-[11px]">
                          {admin.password_changed_at ? (
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>Secured</span>
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Initial Password</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleToggleAdminStatus(admin.id)}
                            disabled={isSelf}
                            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold tracking-wide uppercase transition-all ${
                              isSelf
                                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                                : admin.is_active
                                ? 'bg-rose-950/50 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer'
                                : 'bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 cursor-pointer'
                            }`}
                          >
                            {admin.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Passwords and hashes are never displayed in the UI or returned in client records for maximum security.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CHANGE PASSWORD */}
      {activeSubTab === 'password' && (
        <div className="space-y-6 animate-in fade-in duration-200 max-w-xl">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              CHANGE YOUR ADMIN PASSWORD
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Update your personal admin account password. Must satisfy all cryptographic complexity requirements.
            </p>
          </div>

          {passwordChangeSuccess && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-mono flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Password successfully updated and secured!</span>
            </div>
          )}

          {passwordChangeError && (
            <div className="p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{passwordChangeError}</span>
            </div>
          )}

          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <form onSubmit={handleChangePasswordSubmit} className="space-y-5">
              
              {/* Current Password Field */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2">
                  CURRENT PASSWORD
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                    className="w-full pl-10 pr-12 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 p-1"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2">
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create new strong password"
                    className="w-full pl-10 pr-12 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 p-1"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  PASSWORD REQUIREMENTS
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className={`flex items-center space-x-2 ${strength.hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>At least 8 characters</span>
                  </div>

                  <div className={`flex items-center space-x-2 ${strength.hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasUppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Uppercase letter</span>
                  </div>

                  <div className={`flex items-center space-x-2 ${strength.hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasLowercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Lowercase letter</span>
                  </div>

                  <div className={`flex items-center space-x-2 ${strength.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Number</span>
                  </div>

                  <div className={`flex items-center space-x-2 sm:col-span-2 ${strength.hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasSpecialChar ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Special character (!@#$%^&amp;*...)</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2">
                  CONFIRM NEW PASSWORD
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-12 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 p-1"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-rose-400 mt-1 font-mono">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isPasswordFormValid || passwordChangeLoading}
                className={`w-full py-3 px-4 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                  !isPasswordFormValid || passwordChangeLoading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 cursor-pointer'
                }`}
              >
                {passwordChangeLoading ? (
                  <span>SAVING PASSWORD...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>UPDATE ADMIN PASSWORD</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 4: SECURITY & AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                SECURITY &amp; ADMINISTRATIVE AUDIT TRAIL
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Cryptographic immutable log of authentication, approvals, assignments, and system modifications.
              </p>
            </div>
            <button
              onClick={refreshAuditLogs}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No audit logs recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 z-10">
                    <tr className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Admin Email</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {log.admin_email}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {log.target_type} {log.target_id ? `(${log.target_id})` : ''}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
