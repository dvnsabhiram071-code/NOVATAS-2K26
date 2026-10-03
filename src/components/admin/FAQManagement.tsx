import React, { useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Power, 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  Sparkles,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FAQItem } from '../../types';

const FAQ_CATEGORIES = [
  'Registration',
  'Preferences',
  'Status & Approval',
  'Badges & QR',
  'Event Logistics',
  'General'
];

export const FAQManagement: React.FC = () => {
  const { 
    faqs, 
    addFAQ, 
    updateFAQ, 
    deleteFAQ, 
    toggleFAQStatus 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Registration',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    displayOrder: 1
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Filter & Sort FAQs
  const sortedFaqs = [...faqs].sort((a, b) => a.displayOrder - b.displayOrder);
  const filteredFaqs = sortedFaqs.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match = 
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) {
      return false;
    }

    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setEditingFAQ(null);
    setFormData({
      question: '',
      answer: '',
      category: 'Registration',
      status: 'ACTIVE',
      displayOrder: faqs.length + 1
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FAQItem) => {
    setEditingFAQ(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category || 'General',
      status: item.status,
      displayOrder: item.displayOrder
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.question.trim()) errs.question = 'Question is required';
    if (!formData.answer.trim()) errs.answer = 'Answer is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingFAQ) {
      updateFAQ(editingFAQ.id, {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category,
        status: formData.status,
        displayOrder: Number(formData.displayOrder) || 1
      });
    } else {
      addFAQ({
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category,
        status: formData.status,
        displayOrder: Number(formData.displayOrder) || (faqs.length + 1)
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white tracking-wide">
            FAQ MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, edit, organize, and toggle frequently asked questions displayed on the public website.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ ADD FAQ</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs by question or answer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          {FAQ_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active (Visible)</option>
          <option value="INACTIVE">Inactive (Hidden)</option>
        </select>

        <span className="text-xs text-slate-500 font-mono ml-auto">
          Showing {filteredFaqs.length} of {faqs.length} FAQs
        </span>
      </div>

      {/* Main Table / List */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4 w-12 text-center">ORDER</th>
                <th className="py-4 px-4">QUESTION</th>
                <th className="py-4 px-4">CATEGORY</th>
                <th className="py-4 px-4">STATUS</th>
                <th className="py-4 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No FAQs matching current filters. Click "+ ADD FAQ" to create one.
                  </td>
                </tr>
              ) : (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedRowId === faq.id;
                  return (
                    <React.Fragment key={faq.id}>
                      <tr className="hover:bg-slate-900/40 transition-colors group">
                        
                        {/* ORDER */}
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-xs">
                            #{faq.displayOrder}
                          </span>
                        </td>

                        {/* QUESTION */}
                        <td className="py-3 px-4 font-sans">
                          <div 
                            onClick={() => setExpandedRowId(isExpanded ? null : faq.id)}
                            className="cursor-pointer group-hover:text-cyan-300 transition-colors flex items-center justify-between"
                          >
                            <span className="font-bold text-white text-sm">{faq.question}</span>
                            <span className="text-slate-500 hover:text-cyan-400 p-1">
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </span>
                          </div>
                        </td>

                        {/* CATEGORY */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                            <Tag className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{faq.category || 'General'}</span>
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleFAQStatus(faq.id)}
                            title="Click to toggle Active / Inactive"
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              faq.status === 'ACTIVE'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${faq.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                            <span>{faq.status}</span>
                          </button>
                        </td>

                        {/* ACTIONS */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Toggle */}
                            <button
                              onClick={() => toggleFAQStatus(faq.id)}
                              title={faq.status === 'ACTIVE' ? 'Deactivate FAQ' : 'Activate FAQ'}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                faq.status === 'ACTIVE'
                                  ? 'bg-slate-900 hover:bg-amber-950/60 border-slate-800 text-amber-400'
                                  : 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(faq)}
                              title="Edit FAQ"
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteConfirmId(faq.id)}
                              title="Delete FAQ"
                              className="p-1.5 bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-800 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Answer Row */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80 animate-in fade-in">
                          <td colSpan={5} className="p-4 px-6 border-b border-slate-800/80">
                            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                                Answer Response:
                              </span>
                              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT FAQ */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-left relative max-h-[92vh] overflow-y-auto shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  {editingFAQ ? 'MODIFY QUESTION' : 'NEW FAQ ENTRY'}
                </span>
                <h3 className="font-display font-black text-xl text-white">
                  {editingFAQ ? 'EDIT FAQ' : 'ADD NEW FAQ'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFAQ} className="py-4 space-y-4">
              
              {/* Question */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  QUESTION <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Who can register as a volunteer?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 font-sans"
                />
                {formErrors.question && <p className="text-xs text-rose-400 mt-1">{formErrors.question}</p>}
              </div>

              {/* Answer */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  ANSWER <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide a clear, detailed answer for prospective student volunteers..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 font-sans leading-relaxed"
                />
                {formErrors.answer && <p className="text-xs text-rose-400 mt-1">{formErrors.answer}</p>}
              </div>

              {/* Category, Status & Order Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {FAQ_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    ORDER
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-xl transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  SAVE FAQ
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-black text-lg text-white">
                DELETE FAQ?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                This question will be removed permanently from the public website accordion.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-xl cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  deleteFAQ(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold rounded-xl cursor-pointer"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
