import React, { useState, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  Phone, 
  Mail, 
  X, 
  ArrowUpDown, 
  AlertCircle,
  Eye,
  Check,
  Power,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContactPerson } from '../../types';

export const ContactManagement: React.FC = () => {
  const { 
    contacts, 
    addContact, 
    updateContact, 
    deleteContact, 
    toggleContactStatus 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: '',
    imageUrl: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    displayOrder: 1
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sort contacts by displayOrder ascending
  const sortedContacts = [...contacts].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      mobile: '',
      role: 'Organizing Team Coordinator',
      imageUrl: '',
      status: 'ACTIVE',
      displayOrder: contacts.length + 1
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: ContactPerson) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      mobile: contact.mobile,
      role: contact.role || '',
      imageUrl: contact.imageUrl,
      status: contact.status,
      displayOrder: contact.displayOrder
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, image: 'File size exceeds 5MB. Please upload a smaller photo.' }));
      return;
    }

    // Validate type (JPG, JPEG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, image: 'Allowed file formats: JPG, JPEG, PNG, WEBP.' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      setFormErrors(prev => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Contact Name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email address is required';
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      errs.mobile = 'Valid 10-digit mobile number is required';
    }
    if (!formData.imageUrl) errs.image = 'Profile image is required';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingContact) {
      updateContact(editingContact.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        role: formData.role.trim() || undefined,
        imageUrl: formData.imageUrl,
        status: formData.status,
        displayOrder: Number(formData.displayOrder) || 1
      });
    } else {
      addContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        role: formData.role.trim() || undefined,
        imageUrl: formData.imageUrl,
        status: formData.status,
        displayOrder: Number(formData.displayOrder) || (contacts.length + 1)
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
            CONTACT MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, update, activate, and arrange organizing team contacts displayed on the public website.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ ADD CONTACT</span>
        </button>
      </div>

      {/* Main Table / Directory Card */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4">PHOTO</th>
                <th className="py-4 px-4">NAME</th>
                <th className="py-4 px-4">EMAIL</th>
                <th className="py-4 px-4">MOBILE</th>
                <th className="py-4 px-4">STATUS</th>
                <th className="py-4 px-4 text-center">ORDER</th>
                <th className="py-4 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No contacts configured yet. Click "+ ADD CONTACT" above to add the first organizing team contact.
                  </td>
                </tr>
              ) : (
                sortedContacts.map((contact) => (
                  <tr 
                    key={contact.id}
                    className="hover:bg-slate-900/40 transition-colors group"
                  >
                    {/* PHOTO */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-cyan-400/50 bg-slate-950 p-0.5 shrink-0 shadow-md">
                        <img 
                          src={contact.imageUrl} 
                          alt={contact.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                    </td>

                    {/* NAME */}
                    <td className="py-3 px-4 font-sans font-bold text-white">
                      <div>
                        <span className="text-sm block">{contact.name}</span>
                        {contact.role && (
                          <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block mt-0.5">
                            {contact.role}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="py-3 px-4 text-slate-300">
                      <a 
                        href={`mailto:${contact.email}`} 
                        className="hover:text-cyan-400 hover:underline flex items-center space-x-1.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{contact.email}</span>
                      </a>
                    </td>

                    {/* MOBILE */}
                    <td className="py-3 px-4 text-slate-300">
                      <a 
                        href={`tel:${contact.mobile}`} 
                        className="hover:text-emerald-400 hover:underline flex items-center space-x-1.5 font-bold"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{contact.mobile}</span>
                      </a>
                    </td>

                    {/* STATUS */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleContactStatus(contact.id)}
                        title="Click to toggle Active / Inactive"
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          contact.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                            : 'bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${contact.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span>{contact.status}</span>
                      </button>
                    </td>

                    {/* ORDER */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-xs">
                        #{contact.displayOrder}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Toggle Status */}
                        <button
                          onClick={() => toggleContactStatus(contact.id)}
                          title={contact.status === 'ACTIVE' ? 'Deactivate Contact' : 'Activate Contact'}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            contact.status === 'ACTIVE'
                              ? 'bg-slate-900 hover:bg-amber-950/60 border-slate-800 text-amber-400'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(contact)}
                          title="Edit Contact"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirmId(contact.id)}
                          title="Delete Contact"
                          className="p-1.5 bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-800 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CONTACT */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-left relative max-h-[92vh] overflow-y-auto shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  {editingContact ? 'MODIFY CONTACT' : 'NEW CONTACT PERSON'}
                </span>
                <h3 className="font-display font-black text-xl text-white">
                  {editingContact ? `EDIT: ${editingContact.name}` : 'ADD CONTACT PERSON'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="py-4 space-y-4">
              
              {/* Profile Image Upload & Preview */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2 font-bold">
                  PROFILE IMAGE <span className="text-cyan-400">*</span>
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {formData.imageUrl ? (
                  <div className="flex items-center space-x-4 p-3 bg-slate-900 rounded-2xl border border-slate-800">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-xl object-cover border-2 border-cyan-400 shrink-0"
                    />
                    <div className="space-y-1">
                      <p className="text-xs text-white font-bold font-sans">Photo Selected</p>
                      <p className="text-[11px] text-slate-400">JPG, PNG, or WEBP &lt; 5MB</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono rounded-lg transition-colors cursor-pointer"
                      >
                        CHANGE IMAGE
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80 group"
                  >
                    <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-white">Click to Upload Photo</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">JPG / PNG / WEBP • Max 5 MB</p>
                  </div>
                )}
                {formErrors.image && <p className="text-xs text-rose-400 mt-1">{formErrors.image}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  NAME <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. D V N S ABHIRAM"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                />
                {formErrors.name && <p className="text-xs text-rose-400 mt-1">{formErrors.name}</p>}
              </div>

              {/* Role / Title (Optional) */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                  ROLE / DESIGNATION (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chief Student Organizer or Event Coordinator"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Email & Mobile Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    EMAIL ADDRESS <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. dvnsabhiram071@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                  {formErrors.email && <p className="text-xs text-rose-400 mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    MOBILE NUMBER <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 8618842527"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                  {formErrors.mobile && <p className="text-xs text-rose-400 mt-1">{formErrors.mobile}</p>}
                </div>
              </div>

              {/* Status & Display Order Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (Shown on website)</option>
                    <option value="INACTIVE">INACTIVE (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-bold">
                    DISPLAY ORDER
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
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
                  SAVE CONTACT
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
                DELETE CONTACT PERSON?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                This contact will be permanently removed from the organizing team registry.
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
                  deleteContact(deleteConfirmId);
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
