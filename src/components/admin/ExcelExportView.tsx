import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Filter, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  Users, 
  Check 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportVolunteersToExcel } from '../../utils/excelExporter';

export const ExcelExportView: React.FC = () => {
  const { applications, events } = useApp();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeApps = applications.filter(a => !a.isDeleted);

  // Filter preview count
  const filteredCount = activeApps.filter(app => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (eventFilter !== 'ALL') {
      const match = 
        app.assignedEvent1 === eventFilter || 
        app.assignedEvent2 === eventFilter || 
        app.preferences.includes(eventFilter);
      if (!match) return false;
    }
    if (sectionFilter !== 'ALL' && app.section !== sectionFilter) return false;
    return true;
  }).length;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportVolunteersToExcel(applications, {
        status: statusFilter,
        event: eventFilter,
        section: sectionFilter,
        dateRange: dateRangeFilter
      });
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    }, 600);
  };

  const sheetsInfo = [
    { title: 'Sheet 1: All Applications', desc: 'Master list of every applicant with full contact and preference records' },
    { title: 'Sheet 2: Approved Volunteers', desc: 'Accredited volunteers with issued Volunteer IDs and approval dates' },
    { title: 'Sheet 3: Pending Applications', desc: 'Submissions under current committee screening' },
    { title: 'Sheet 4: Rejected Applications', desc: 'Disqualified submissions with recorded administrative reasons' },
    { title: 'Sheet 5: Event Assignments', desc: 'Logistics roster grouped by assigned festival duty arenas' },
    { title: 'Sheet 6: Check-in Data', desc: 'Live event-day attendance timestamps and verification passes' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl text-white tracking-wide">
          EXPORT VOLUNTEER DATA TO EXCEL
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate high-fidelity, multi-tab Microsoft Excel (.xlsx) workbooks configured for organizers and department heads.
        </p>
      </div>

      {/* Export Configuration Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6">
        
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              CONFIGURE WORKBOOK EXPORT
            </h3>
            <p className="text-xs text-slate-400">
              Apply filters to target specific sections, statuses, or designated events before exporting.
            </p>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              APPLICATION STATUS
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved Volunteers Only</option>
              <option value="PENDING">Pending Review Only</option>
              <option value="REJECTED">Rejected Applications Only</option>
            </select>
          </div>

          {/* Event Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              EVENT / PREFERENCE
            </label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.name}>{e.name} ({e.category})</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              COLLEGE SECTION
            </label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Sections (A - F)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
              <option value="E">Section E</option>
              <option value="F">Section F</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              REGISTRATION DATE
            </label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Dates (Complete Dataset)</option>
              <option value="TODAY">Today Only</option>
              <option value="LAST7">Last 7 Days</option>
            </select>
          </div>

        </div>

        {/* Export Banner & CTA */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-300 font-mono">
            <span className="text-emerald-400 font-bold">{filteredCount} records</span> will be exported into the multi-sheet workbook.
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-emerald-500/20 hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'GENERATING EXCEL WORKBOOK...' : 'DOWNLOAD EXCEL (.XLSX)'}</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-mono flex items-center space-x-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">✓ Excel File Successfully Generated!</p>
              <p className="text-[11px] text-emerald-300/80">
                Downloaded as "NOVATAS_2K26_Volunteers.xlsx" with 6 dedicated workbook sheets.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Included Sheets Specification Preview */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-base text-white">
          INCLUDED WORKBOOK SHEETS STRUCTURE
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheetsInfo.map((s, idx) => (
            <div
              key={idx}
              className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center space-x-2 text-cyan-400">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="font-mono text-xs font-bold text-white">{s.title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
