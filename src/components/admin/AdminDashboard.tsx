import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  QrCode, 
  ArrowUpRight, 
  Sparkles,
  Calendar,
  Layers,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminTab, VolunteerApplication } from '../../types';
import { dbService } from '../../services/db';

export const AdminDashboard: React.FC<{ onNavigateTab: (tab: AdminTab) => void }> = ({ onNavigateTab }) => {
  const { applications, events, appStats } = useApp();

  const activeApps = applications.filter(a => !a.isDeleted);
  const [recentApps, setRecentApps] = useState<VolunteerApplication[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  // Exact PostgreSQL database counts from appStats (no client-side truncation)
  const total = appStats?.total ?? applications.filter(a => !a.isDeleted).length;
  const pending = appStats?.pending ?? applications.filter(a => !a.isDeleted && a.status === 'PENDING').length;
  const approved = appStats?.approved ?? applications.filter(a => !a.isDeleted && a.status === 'APPROVED').length;
  const rejected = appStats?.rejected ?? applications.filter(a => !a.isDeleted && a.status === 'REJECTED').length;
  const assigned = appStats?.assigned ?? applications.filter(a => !a.isDeleted && a.status === 'APPROVED' && (a.assignedEvent1 || a.assignedEvent2)).length;
  const checkedIn = appStats?.checkedIn ?? applications.filter(a => !a.isDeleted && a.checkedIn).length;

  useEffect(() => {
    let isMounted = true;
    const loadRecent = async () => {
      setIsLoadingRecent(true);
      try {
        const data = await dbService.fetchRecentApplications(5);
        if (isMounted) {
          setRecentApps(data);
        }
      } catch (err) {
        console.error('Failed to load recent applications:', err);
      } finally {
        if (isMounted) {
          setIsLoadingRecent(false);
        }
      }
    };
    loadRecent();
    return () => {
      isMounted = false;
    };
  }, [appStats]);

  const cards = [
    {
      title: 'TOTAL APPLICATIONS',
      count: total,
      sub: 'All applicant records',
      icon: Users,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      tab: 'applications' as AdminTab
    },
    {
      title: 'PENDING REVIEW',
      count: pending,
      sub: 'Awaiting committee screening',
      icon: Clock,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      tab: 'applications' as AdminTab
    },
    {
      title: 'APPROVED VOLUNTEERS',
      count: approved,
      sub: 'Badges & QR passes issued',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      tab: 'volunteers' as AdminTab
    },
    {
      title: 'REJECTED',
      count: rejected,
      sub: 'Incomplete or unverified',
      icon: XCircle,
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      tab: 'applications' as AdminTab
    },
    {
      title: 'VOLUNTEERS ASSIGNED',
      count: assigned,
      sub: 'Allocated to specific events',
      icon: Layers,
      color: 'text-violet-400',
      border: 'border-violet-500/30',
      tab: 'assignments' as AdminTab
    },
    {
      title: 'QR CHECKED IN',
      count: checkedIn,
      sub: 'Scanned present on-site',
      icon: QrCode,
      color: 'text-yellow-400',
      border: 'border-yellow-500/30',
      tab: 'qr-checkin' as AdminTab
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
            NOVATAS 2K26 • EXECUTIVE CONSOLE
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide mt-1">
            VOLUNTEER MANAGEMENT DASHBOARD
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Live volunteer registrations, event logistics, QR scan verifications, and Excel data distribution.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigateTab('qr-checkin')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold rounded-xl transition-all shadow-md"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>OPEN QR SCANNER</span>
          </button>
          <button
            onClick={() => onNavigateTab('exports')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-display font-bold uppercase rounded-xl transition-all shadow-md shadow-cyan-500/20"
          >
            <span>EXPORT EXCEL</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Key Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              onClick={() => onNavigateTab(c.tab)}
              className={`glass-panel p-5 rounded-2xl border ${c.border} hover:scale-[1.03] transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${c.color}`} />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                  {c.count}
                </p>
                <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold mt-1">
                  {c.title}
                </p>
                <p className="text-[9px] text-slate-500 truncate mt-0.5">
                  {c.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Columns: Recent Applications & Category Allocation Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Applications */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                RECENT APPLICATIONS
              </h3>
              <p className="text-xs text-slate-400">Latest student registrations</p>
            </div>
            <button
              onClick={() => onNavigateTab('applications')}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              View all ({total}) →
            </button>
          </div>

          <div className="space-y-3">
            {isLoadingRecent ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-500 font-mono text-xs">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                <span>Loading recent registrations...</span>
              </div>
            ) : recentApps.length === 0 ? (
              <div className="py-8 text-center text-slate-500 font-mono text-xs">
                No recent applications found in database.
              </div>
            ) : (
              recentApps.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={app.photoUrl}
                      alt={app.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-white truncate">
                        {app.fullName}
                      </p>
                      <p className="text-xs font-mono text-slate-400">
                        {app.usn} • Sec {app.section}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      app.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : app.status === 'REJECTED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">
                      {app.preferences.join(' • ')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Event Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">
              EVENT BREAKDOWN
            </h3>
            <span className="text-xs font-mono text-cyan-400">{events.length} Events</span>
          </div>

          <div className="space-y-3">
            {events.slice(0, 6).map((evt) => {
              const count = activeApps.filter(
                a => a.status === 'APPROVED' && (a.assignedEvent1 === evt.name || a.assignedEvent2 === evt.name)
              ).length;
              return (
                <div key={evt.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{evt.name}</span>
                    <span className="font-mono text-cyan-400 font-bold">{count} assigned</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                      style={{ width: `${Math.min(100, count * 20)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigateTab('events')}
            className="w-full py-2.5 mt-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 rounded-xl transition-colors"
          >
            MANAGE EVENTS →
          </button>
        </div>

      </div>

    </div>
  );
};
