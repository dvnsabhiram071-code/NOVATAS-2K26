import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  Layers, 
  QrCode, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  HelpCircle,
  Database,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminTab } from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { ApplicationsTable } from './ApplicationsTable';
import { VolunteersDirectory } from './VolunteersDirectory';
import { EventManagement } from './EventManagement';
import { VolunteerAssignments } from './VolunteerAssignments';
import { ContactManagement } from './ContactManagement';
import { FAQManagement } from './FAQManagement';
import { QRCheckIn } from './QRCheckIn';
import { ExcelExportView } from './ExcelExportView';
import { AdminSettingsView } from './AdminSettingsView';

import { adminAuthService } from '../../services/adminAuthService';

export const AdminLayout: React.FC<{ onExitAdmin: () => void; initialTab?: AdminTab }> = ({ onExitAdmin, initialTab }) => {
  const { 
    activeAdminTab, 
    setActiveAdminTab, 
    setIsAdminLoggedIn, 
    applications,
    isCloudConnected,
    refreshData,
    isLoadingData
  } = useApp();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const session = adminAuthService.getSession();

  // If initialTab passed, set it
  React.useEffect(() => {
    if (initialTab && initialTab !== activeAdminTab) {
      setActiveAdminTab(initialTab);
    }
  }, [initialTab]);

  const pendingCount = applications.filter(a => !a.isDeleted && a.status === 'PENDING').length;

  const tabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: Users, badge: pendingCount },
    { id: 'volunteers', label: 'Volunteers', icon: UserCheck },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: Layers },
    { id: 'contacts', label: 'Contacts', icon: PhoneCall },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'qr-checkin', label: 'QR Check-in', icon: QrCode },
    { id: 'exports', label: 'Excel Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    adminAuthService.logout();
    setIsAdminLoggedIn(false);
    window.history.pushState(null, '', '/admin/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleTabClick = (tabId: AdminTab) => {
    setActiveAdminTab(tabId);
    window.history.pushState(null, '', `/admin/${tabId}`);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col">
      
      {/* Top Admin Bar */}
      <header className="bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onExitAdmin}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">PUBLIC SITE</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-800" />

            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-lg text-white">
                NOVATAS <span className="font-brush text-cyan-400">2K26</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Database status and manual sync */}
            <div className="hidden md:flex items-center space-x-2">
              <span 
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  isCloudConnected
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400'
                    : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-400'
                }`}
                title={isCloudConnected ? 'Connected to Supabase PostgreSQL' : 'Persistent Storage Active (Add Supabase env vars in Vercel to connect cloud database)'}
              >
                <Database className="w-3 h-3" />
                <span>{isCloudConnected ? 'SUPABASE LIVE' : 'DATABASE PERSISTENT'}</span>
              </span>

              <button
                onClick={handleManualSync}
                disabled={isRefreshing || isLoadingData}
                title="Sync database with latest records"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-white">{session?.name || 'Administrator'}</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">{session?.email || 'admin@novatas.internal'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-xl text-xs font-mono text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOGOUT</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation Ribbon */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-black text-cyan-400' : 'bg-amber-500 text-black'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeAdminTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveAdminTab} />}
        {activeAdminTab === 'applications' && <ApplicationsTable />}
        {activeAdminTab === 'volunteers' && <VolunteersDirectory />}
        {activeAdminTab === 'events' && <EventManagement />}
        {activeAdminTab === 'assignments' && <VolunteerAssignments />}
        {activeAdminTab === 'contacts' && <ContactManagement />}
        {activeAdminTab === 'faqs' && <FAQManagement />}
        {activeAdminTab === 'qr-checkin' && <QRCheckIn />}
        {activeAdminTab === 'exports' && <ExcelExportView />}
        {activeAdminTab === 'settings' && <AdminSettingsView />}
      </main>

    </div>
  );
};
