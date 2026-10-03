import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  QrCode, 
  Download, 
  ChevronRight, 
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerApplication } from '../../types';
import { DigitalVolunteerCard } from '../public/DigitalVolunteerCard';

export const VolunteersDirectory: React.FC = () => {
  const { applications, events } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('ALL');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL');
  const [activeVolunteerForCard, setActiveVolunteerForCard] = useState<VolunteerApplication | null>(null);

  // Only approved volunteers
  const approvedVolunteers = applications.filter(a => !a.isDeleted && a.status === 'APPROVED');

  const filtered = approvedVolunteers.filter(vol => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match =
        vol.fullName.toLowerCase().includes(q) ||
        vol.usn.toLowerCase().includes(q) ||
        (vol.volunteerId && vol.volunteerId.toLowerCase().includes(q)) ||
        vol.mobile.includes(q) ||
        vol.email.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedEventFilter !== 'ALL') {
      if (vol.assignedEvent1 !== selectedEventFilter && vol.assignedEvent2 !== selectedEventFilter) {
        return false;
      }
    }

    if (selectedSectionFilter !== 'ALL' && vol.section !== selectedSectionFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white tracking-wide">
            APPROVED VOLUNTEER DIRECTORY
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Event-wise rosters, digital badges, and contact details for all verified volunteers.
          </p>
        </div>

        {/* Quick event badges */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedEventFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedEventFilter === 'ALL'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Events ({approvedVolunteers.length})
          </button>
          {events.slice(0, 5).map((e) => {
            const count = approvedVolunteers.filter(
              a => a.assignedEvent1 === e.name || a.assignedEvent2 === e.name
            ).length;
            return (
              <button
                key={e.id}
                onClick={() => setSelectedEventFilter(e.name)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedEventFilter === e.name
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {e.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search volunteers by Name, USN, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <select
          value={selectedEventFilter}
          onChange={(e) => setSelectedEventFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
        >
          <option value="ALL">All Events</option>
          {events.map((e) => (
            <option key={e.id} value={e.name}>{e.name}</option>
          ))}
        </select>

        <select
          value={selectedSectionFilter}
          onChange={(e) => setSelectedSectionFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
        >
          <option value="ALL">All Sections</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
          <option value="D">Section D</option>
          <option value="E">Section E</option>
          <option value="F">Section F</option>
          <option value="OTHER">Other</option>
        </select>

        <span className="text-xs font-mono text-slate-400 ml-auto">
          {filtered.length} Volunteers
        </span>
      </div>

      {/* Grid of Volunteer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-500 font-mono">
            No approved volunteers found for the chosen filters.
          </div>
        ) : (
          filtered.map((vol) => (
            <div
              key={vol.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-cyan-500/50 shrink-0">
                    <img src={vol.photoUrl} alt={vol.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                      {vol.fullName}
                    </p>
                    <p className="font-mono text-xs font-bold text-cyan-400">{vol.volunteerId}</p>
                    <p className="text-[11px] font-mono text-slate-400">{vol.department} - Sec {vol.section} • {vol.usn}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1 mb-3">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Assigned Event</span>
                  <p className="font-display font-bold text-xs text-yellow-400">
                    {vol.assignedEvent1 || 'Pending Assignment'}
                  </p>
                  {vol.assignedEvent2 && (
                    <p className="text-[10px] text-cyan-300 font-semibold">+ {vol.assignedEvent2}</p>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                  <p className="truncate">📞 {vol.mobile}</p>
                  <p className="truncate">✉️ {vol.email}</p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                <span className={`inline-flex items-center space-x-1 text-[10px] font-mono font-bold uppercase ${
                  vol.checkedIn ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${vol.checkedIn ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span>{vol.checkedIn ? `CHECKED IN (${vol.checkedInAt})` : 'NOT CHECKED IN'}</span>
                </span>

                <button
                  onClick={() => setActiveVolunteerForCard(vol)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>ID Badge</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ID Badge Preview Modal */}
      {activeVolunteerForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-center relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveVolunteerForCard(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <DigitalVolunteerCard volunteer={activeVolunteerForCard} />
          </div>
        </div>
      )}

    </div>
  );
};
