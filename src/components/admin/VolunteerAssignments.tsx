import React, { useState } from 'react';
import { 
  Layers, 
  Check, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  X,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerApplication } from '../../types';

export const VolunteerAssignments: React.FC = () => {
  const { applications, events, assignVolunteerEvents, bulkAssign } = useApp();

  // Selected for Individual assignment modal
  const [targetVolunteer, setTargetVolunteer] = useState<VolunteerApplication | null>(null);
  const [event1Choice, setEvent1Choice] = useState('');
  const [event2Choice, setEvent2Choice] = useState('');
  const [roleChoice, setRoleChoice] = useState('Event Coordination');

  // Bulk assignment state
  const [bulkEventChoice, setBulkEventChoice] = useState(events[0]?.name || 'Photography');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  const visibleVolunteers = applications.filter(a => {
    if (a.isDeleted) return false;
    if (statusTab === 'ALL') return true;
    return a.status === statusTab;
  });

  const filteredVolunteers = visibleVolunteers.filter(vol => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      vol.fullName.toLowerCase().includes(q) ||
      vol.usn.toLowerCase().includes(q) ||
      (vol.volunteerId && vol.volunteerId.toLowerCase().includes(q)) ||
      (vol.assignedEvent1 && vol.assignedEvent1.toLowerCase().includes(q))
    );
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleOpenIndividualAssign = (vol: VolunteerApplication) => {
    setTargetVolunteer(vol);
    setEvent1Choice(vol.assignedEvent1 || vol.preferences[0] || events[0]?.name || '');
    setEvent2Choice(vol.assignedEvent2 || '');
    setRoleChoice(vol.volunteerRole || 'Event Coordination');
    setSaveError('');
  };

  const handleSaveIndividualAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVolunteer) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const res = await assignVolunteerEvents(targetVolunteer.id, event1Choice, event2Choice || undefined, roleChoice);
      if (res.success) {
        setTargetVolunteer(null);
      } else {
        setSaveError(res.message);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error saving assignment');
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk selection toggles
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredVolunteers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVolunteers.map(v => v.id));
    }
  };

  const handleExecuteBulkAssign = async () => {
    if (selectedIds.length === 0 || !bulkEventChoice) return;
    setIsSaving(true);
    try {
      const res = await bulkAssign(selectedIds, bulkEventChoice);
      if (res.success) {
        setBulkSuccessMsg(res.message);
        setSelectedIds([]);
        setTimeout(() => setBulkSuccessMsg(''), 4000);
      } else {
        alert(res.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl text-white tracking-wide">
          VOLUNTEER ASSIGNMENT CONSOLE
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Admin has final authority. Assign approved volunteers individually or perform high-speed bulk allocations.
        </p>
      </div>

      {/* BULK ASSIGNMENT TOOLBAR */}
      <div className="glass-panel p-6 rounded-3xl border border-violet-500/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                BULK ASSIGNMENT MANAGEMENT
              </h3>
              <p className="text-xs text-slate-400">
                Select multiple volunteers and allocate them to an event with one click.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Target Event:</span>
              <select
                value={bulkEventChoice}
                onChange={(e) => setBulkEventChoice(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 font-semibold"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.name}>{e.name} ({e.category})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExecuteBulkAssign}
              disabled={selectedIds.length === 0}
              className={`px-5 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                selectedIds.length > 0
                  ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>ASSIGN SELECTED ({selectedIds.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {bulkSuccessMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bulkSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* VOLUNTEER LIST & TABLE */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-4">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={selectAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-xl font-mono cursor-pointer"
            >
              {selectedIds.length === filteredVolunteers.length && filteredVolunteers.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{selectedIds.length === filteredVolunteers.length && filteredVolunteers.length > 0 ? 'DESELECT ALL' : 'SELECT ALL'}</span>
            </button>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
              {(['ALL', 'PENDING', 'APPROVED'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusTab(tab)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusTab === tab 
                      ? 'bg-cyan-500 text-black font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-slate-400 ml-1">
              {selectedIds.length} selected of {filteredVolunteers.length}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search volunteers..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 font-mono uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-3 w-10">SELECT</th>
                <th className="p-3">VOLUNTEER</th>
                <th className="p-3">SECTION</th>
                <th className="p-3">APPLICANT PREFERENCES</th>
                <th className="p-3">FINAL ASSIGNED EVENT</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredVolunteers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                    No approved volunteers match the search.
                  </td>
                </tr>
              ) : (
                filteredVolunteers.map((vol) => {
                  const isChecked = selectedIds.includes(vol.id);
                  return (
                    <tr key={vol.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => toggleSelect(vol.id)}
                          className="text-slate-400 hover:text-cyan-400 focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={vol.photoUrl}
                            alt={vol.fullName}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <p className="font-display font-bold text-white text-xs">{vol.fullName}</p>
                            <p className="font-mono text-[10px] text-cyan-400">{vol.volunteerId || vol.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono text-slate-300">
                        {vol.department} - {vol.section}
                      </td>

                      <td className="p-3">
                        <span className="text-slate-400">1. {vol.preferences[0]}</span>
                        <br />
                        <span className="text-slate-400">2. {vol.preferences[1]}</span>
                      </td>

                      <td className="p-3">
                        {vol.assignedEvent1 ? (
                          <div>
                            <span className="font-display font-bold text-yellow-400 text-xs">
                              {vol.assignedEvent1}
                            </span>
                            {vol.assignedEvent2 && (
                              <span className="text-cyan-300 block text-[10px]">
                                + {vol.assignedEvent2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-400/80 italic font-mono text-[11px]">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenIndividualAssign(vol)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400 hover:text-cyan-300 rounded-lg transition-colors"
                        >
                          ASSIGN
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* INDIVIDUAL ASSIGNMENT MODAL */}
      {targetVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="bg-slate-950 border border-cyan-500/50 rounded-3xl max-w-md w-full p-6 text-left space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-display font-bold text-base text-white">
                ASSIGN VOLUNTEER
              </h3>
              <button
                onClick={() => setTargetVolunteer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Volunteer identity */}
            <div className="flex items-center space-x-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
              <img
                src={targetVolunteer.photoUrl}
                alt={targetVolunteer.fullName}
                className="w-12 h-12 rounded-xl object-cover border border-cyan-400 shrink-0"
              />
              <div>
                <p className="font-mono text-xs text-cyan-400 font-bold">{targetVolunteer.volunteerId}</p>
                <p className="font-display font-bold text-white text-sm">{targetVolunteer.fullName}</p>
                <p className="text-[11px] text-slate-400 font-mono">Sec {targetVolunteer.section} • {targetVolunteer.usn}</p>
              </div>
            </div>

            {/* Stated Preferences */}
            <div className="text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                APPLICANT'S STATED PREFERENCES:
              </span>
              <div className="flex space-x-2">
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  1. {targetVolunteer.preferences[0]}
                </span>
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  2. {targetVolunteer.preferences[1]}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveIndividualAssign} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  FINAL ASSIGNMENT: EVENT 1 <span className="text-cyan-400">*</span>
                </label>
                <select
                  required
                  value={event1Choice}
                  onChange={(e) => setEvent1Choice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.name}>{e.name} ({e.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  FINAL ASSIGNMENT: EVENT 2 (OPTIONAL)
                </label>
                <select
                  value={event2Choice}
                  onChange={(e) => setEvent2Choice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="">None (Single Event Assignment)</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.name}>{e.name} ({e.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  VOLUNTEER ROLE <span className="text-violet-400">*</span>
                </label>
                <select
                  value={roleChoice}
                  onChange={(e) => setRoleChoice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-400"
                >
                  <option value="Event Coordination">Event Coordination</option>
                  <option value="Stage Coordination">Stage Coordination</option>
                  <option value="Registration Support">Registration Support</option>
                  <option value="Crowd Management">Crowd Management</option>
                  <option value="Photography Support">Photography Support</option>
                  <option value="Backstage Coordination">Backstage Coordination</option>
                  <option value="General Event Support">General Event Support</option>
                </select>
              </div>

              {saveError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-mono">
                  ⚠ {saveError}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setTargetVolunteer(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-cyan-500/25 disabled:opacity-50"
                >
                  {isSaving ? 'SAVING TO SUPABASE...' : 'SAVE ASSIGNMENT'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
