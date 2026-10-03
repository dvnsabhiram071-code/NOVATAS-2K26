import React, { useState } from 'react';
import { ArrowLeft, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DigitalVolunteerCard } from './DigitalVolunteerCard';

export const VolunteerCardPage: React.FC<{ 
  initialVolunteerId?: string;
  onBackToHome: () => void;
}> = ({ initialVolunteerId, onBackToHome }) => {
  const { applications } = useApp();
  const [searchQuery, setSearchQuery] = useState(initialVolunteerId || 'NVT26-V00492');

  const approvedList = applications.filter(a => !a.isDeleted && a.status === 'APPROVED');
  
  // Find matching volunteer
  const currentVolunteer = approvedList.find(a => 
    (a.volunteerId && a.volunteerId.toUpperCase() === searchQuery.trim().toUpperCase()) ||
    (a.usn && a.usn.toUpperCase() === searchQuery.trim().toUpperCase()) ||
    (a.id && a.id.toUpperCase() === searchQuery.trim().toUpperCase())
  ) || approvedList[0];

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center justify-start py-8 px-4 relative overflow-hidden bg-grid-cyber">
      
      {/* Background ambient neon glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-6 mb-6 border-b border-slate-900 relative z-20">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO HOME</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="font-display font-black text-lg text-white">
            NOVATAS <span className="font-brush text-cyan-400">2K26</span>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
            CREDENTIAL PORTAL
          </span>
        </div>
      </header>

      {/* Card Lookup Search Bar */}
      <div className="w-full max-w-md mb-8 relative z-20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Volunteer ID or USN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white font-mono text-xs uppercase focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            onClick={() => {}}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs uppercase rounded-xl transition-all"
          >
            VIEW
          </button>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-2">
          <span>Quick Select:</span>
          {approvedList.slice(0, 3).map((vol) => (
            <button
              key={vol.id}
              onClick={() => setSearchQuery(vol.volunteerId || vol.usn)}
              className="text-cyan-400 hover:underline"
            >
              {vol.volunteerId || vol.usn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Digital ID Card Display */}
      <div className="relative z-20 pb-12 w-full flex justify-center">
        {currentVolunteer ? (
          <DigitalVolunteerCard volunteer={currentVolunteer} />
        ) : (
          <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center">
            <p className="text-slate-400 font-mono text-xs">No volunteer record found.</p>
          </div>
        )}
      </div>

    </div>
  );
};
