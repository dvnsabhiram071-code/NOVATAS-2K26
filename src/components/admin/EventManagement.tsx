import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Sparkles, 
  Video, 
  X, 
  Layers 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerEvent, EventCategory } from '../../types';

export const EventManagement: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, applications } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<VolunteerEvent | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'SPORTS' as EventCategory,
    description: '',
    rules: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'SPORTS',
      description: '',
      rules: '',
      status: 'ACTIVE'
    });
    setEditingEvent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (evt: VolunteerEvent) => {
    setFormData({
      name: evt.name,
      category: evt.category,
      description: evt.description,
      rules: evt.rules,
      status: evt.status
    });
    setEditingEvent(evt);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
    } else {
      addEvent(formData);
    }
    setIsAddModalOpen(false);
  };

  const sportsEvents = events.filter(e => e.category === 'SPORTS');
  const culturalEvents = events.filter(e => e.category === 'CULTURAL');
  const mediaEvents = events.filter(e => e.category === 'MEDIA / CREATIVE');

  // Count volunteers assigned to event
  const getAssignedCount = (eventName: string) => {
    return applications.filter(
      a => !a.isDeleted && a.status === 'APPROVED' && (a.assignedEvent1 === eventName || a.assignedEvent2 === eventName)
    ).length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white tracking-wide">
            EVENT MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add new events, update rules, and toggle active volunteer preferences.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>ADD EVENT</span>
        </button>
      </div>

      {/* 3 Categories Sections */}
      <div className="space-y-8">
        
        {/* SPORTS */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">SPORTS EVENTS</h3>
              <p className="text-[10px] font-mono text-cyan-400">{sportsEvents.length} Active Events</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sportsEvents.map((evt) => {
              const assignedCount = getAssignedCount(evt.name);
              return (
                <div 
                  key={evt.id} 
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-white text-sm">{evt.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        evt.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {evt.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                    <p className="text-[11px] font-mono text-cyan-400">Assigned: {assignedCount} volunteers</p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 mt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (assignedCount > 0) {
                          updateEvent(evt.id, { status: evt.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
                        } else {
                          deleteEvent(evt.id);
                        }
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-mono"
                    >
                      {assignedCount > 0 ? (evt.status === 'ACTIVE' ? 'Deactivate' : 'Activate') : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CULTURAL */}
        <div className="glass-panel p-6 rounded-3xl border border-violet-500/20 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-violet-950 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">CULTURAL EVENTS</h3>
              <p className="text-[10px] font-mono text-violet-400">{culturalEvents.length} Active Events</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {culturalEvents.map((evt) => {
              const assignedCount = getAssignedCount(evt.name);
              return (
                <div 
                  key={evt.id} 
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-white text-sm">{evt.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        evt.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {evt.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                    <p className="text-[11px] font-mono text-violet-400">Assigned: {assignedCount} volunteers</p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 mt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (assignedCount > 0) {
                          updateEvent(evt.id, { status: evt.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
                        } else {
                          deleteEvent(evt.id);
                        }
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-mono"
                    >
                      {assignedCount > 0 ? (evt.status === 'ACTIVE' ? 'Deactivate' : 'Activate') : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MEDIA / CREATIVE */}
        <div className="glass-panel p-6 rounded-3xl border border-pink-500/20 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-pink-950 border border-pink-500/30 flex items-center justify-center">
              <Video className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">MEDIA / CREATIVE</h3>
              <p className="text-[10px] font-mono text-pink-400">{mediaEvents.length} Active Events</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mediaEvents.map((evt) => {
              const assignedCount = getAssignedCount(evt.name);
              return (
                <div 
                  key={evt.id} 
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-white text-sm">{evt.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        evt.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {evt.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                    <p className="text-[11px] font-mono text-pink-400">Assigned: {assignedCount} volunteers</p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 mt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (assignedCount > 0) {
                          updateEvent(evt.id, { status: evt.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
                        } else {
                          deleteEvent(evt.id);
                        }
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-mono"
                    >
                      {assignedCount > 0 ? (evt.status === 'ACTIVE' ? 'Deactivate' : 'Activate') : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-display font-bold text-base text-white">
                {editingEvent ? 'EDIT EVENT' : 'ADD NEW EVENT'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-mono uppercase text-slate-300 mb-1">
                  EVENT NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Photography or Tug of War"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-slate-300 mb-1">
                  CATEGORY *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="SPORTS">SPORTS</option>
                  <option value="CULTURAL">CULTURAL</option>
                  <option value="MEDIA / CREATIVE">MEDIA / CREATIVE</option>
                </select>
              </div>

              <div>
                <label className="block font-mono uppercase text-slate-300 mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  placeholder="Key responsibilities for volunteers in this event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-slate-300 mb-1">
                  RULES & PROTOCOLS
                </label>
                <textarea
                  rows={2}
                  placeholder="Volunteer arrival times, attire, or guidelines..."
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-slate-300 mb-1">
                  STATUS
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold uppercase rounded-xl"
                >
                  {editingEvent ? 'SAVE CHANGES' : 'ADD EVENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
