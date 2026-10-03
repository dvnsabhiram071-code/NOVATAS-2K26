import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Upload, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Camera, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Search,
  ShieldAlert,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

export const RegistrationModal: React.FC = () => {
  const { 
    isRegisterModalOpen, 
    setIsRegisterModalOpen, 
    events, 
    settings, 
    submitApplication,
    setIsStatusModalOpen,
    setStatusLookupUSN
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    usn: '',
    department: 'CSE',
    section: 'A',
    mobile: '',
    email: '',
    photoUrl: '',
    preferences: ['', ''] as [string, string],
    confirmCorrect: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preferenceWarning, setPreferenceWarning] = useState<string>('');
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isRegisterModalOpen) return null;

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.usn.trim()) errs.usn = 'USN Number is required';
    if (!formData.section) errs.section = 'Section is required';
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation (Photo Compulsory)
  const validateStep2 = () => {
    if (!formData.photoUrl) {
      setErrors({ photo: 'Profile photo is required. Please upload your photo to continue.' });
      return false;
    }
    setErrors({});
    return true;
  };

  // Step 3 Validation (Exactly 2 Preferences)
  const validateStep3 = () => {
    const selectedCount = formData.preferences.filter(Boolean).length;
    if (selectedCount !== 2) {
      setPreferenceWarning('Please select exactly 2 event preferences to proceed.');
      return false;
    }
    setPreferenceWarning('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ photo: 'File size exceeds 5 MB. Please upload a smaller image.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      setErrors({});
    };
    reader.readAsDataURL(file);
  };

  // Handle Preference Toggle (Strictly max 2)
  const togglePreference = (eventName: string) => {
    setPreferenceWarning('');
    const current = [...formData.preferences].filter(Boolean);
    const exists = current.includes(eventName);

    if (exists) {
      const filtered = current.filter(name => name !== eventName);
      setFormData(prev => ({
        ...prev,
        preferences: [filtered[0] || '', filtered[1] || '']
      }));
    } else {
      if (current.length >= 2) {
        setPreferenceWarning('You can select only 2 preferences. Deselect one first to change.');
        return;
      }
      const updated = [...current, eventName];
      setFormData(prev => ({
        ...prev,
        preferences: [updated[0] || '', updated[1] || '']
      }));
    }
  };

  // Final Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirmCorrect) {
      setErrors({ confirm: 'Please confirm that all details provided are accurate.' });
      return;
    }

    const newApp = submitApplication({
      fullName: formData.fullName.trim(),
      usn: formData.usn.trim().toUpperCase(),
      department: 'CSE',
      section: formData.section,
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      photoUrl: formData.photoUrl,
      preference1: formData.preferences[0],
      preference2: formData.preferences[1],
      preferences: formData.preferences,
    });

    setSubmittedAppId(newApp.id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleClose = () => {
    setIsRegisterModalOpen(false);
    setCurrentStep(1);
    setSubmittedAppId(null);
    setErrors({});
    setPreferenceWarning('');
  };

  const handleGoToStatus = () => {
    setStatusLookupUSN(formData.usn.trim().toUpperCase());
    handleClose();
    setIsStatusModalOpen(true);
  };

  const sportsEvents = events.filter(e => e.category === 'SPORTS');
  const culturalEvents = events.filter(e => e.category === 'CULTURAL');
  const mediaEvents = events.filter(e => e.category === 'MEDIA / CREATIVE');
  const selectedPreferencesCount = formData.preferences.filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Modal Dialog Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/40 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                NOVATAS 2K26 PORTAL
              </span>
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide mt-1">
              VOLUNTEER REGISTRATION
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Indicator (Only if not submitted) */}
        {!submittedAppId && (
          <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800/80">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { step: 1, label: 'PERSONAL' },
                { step: 2, label: 'PHOTO' },
                { step: 3, label: 'PREFERENCES' },
                { step: 4, label: 'REVIEW' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all mb-1 ${
                      currentStep === item.step
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40'
                        : currentStep > item.step
                        ? 'bg-emerald-500 text-black'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {currentStep > item.step ? '✓' : item.step}
                  </div>
                  <span className={`text-[10px] font-mono tracking-wider ${
                    currentStep === item.step ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-200">
          
          {/* SUCCESS SCREEN (POST REGISTRATION - PENDING REVIEW) */}
          {submittedAppId ? (
            <div className="py-6 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <h4 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">
                  APPLICATION SUBMITTED
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                  Your application has been received and is currently under administrative review.
                </p>
              </div>

              {/* Exact Post-Registration Status Card matching Section 2 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md mx-auto text-left space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">APPLICATION ID</span>
                    <span className="font-display font-black text-2xl text-cyan-400">{submittedAppId}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-950 text-amber-400 border border-amber-800">
                    PENDING REVIEW
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                    VOLUNTEER PREFERENCES (UNDER REVIEW):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">Preference 1</span>
                      <span className="font-bold text-cyan-300">{formData.preferences[0]}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">Preference 2</span>
                      <span className="font-bold text-violet-300">{formData.preferences[1]}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                  <div className="p-2 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">VOLUNTEER ID</span>
                    <span className="text-slate-400 font-bold">NOT GENERATED</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">QR CODE</span>
                    <span className="text-slate-400 font-bold">NOT GENERATED</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">ASSIGNED EVENT</span>
                    <span className="text-amber-400 font-bold">NOT ASSIGNED</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">VOLUNTEER ROLE</span>
                    <span className="text-amber-400 font-bold">NOT ASSIGNED</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
                  ℹ️ Volunteer ID and Official QR Code badge are generated <strong>only after Admin assigns your final event & approves your application</strong>.
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleGoToStatus}
                  className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>CHECK APPLICATION STATUS</span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-display font-medium text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </div>
          ) : (
            /* MULTI-STEP FORM BODY */
            <div>
              
              {/* STEP 01: PERSONAL DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800/80 pb-3 mb-4">
                    <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                      STEP 01 OF 04
                    </span>
                    <h4 className="font-display font-bold text-lg text-white">
                      PERSONAL DETAILS
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                      FULL NAME <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Kumar"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    {errors.fullName && <p className="text-xs text-rose-400 mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                        USN NUMBER <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1XX23CS001"
                        value={formData.usn}
                        onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm uppercase focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                      />
                      {errors.usn && <p className="text-xs text-rose-400 mt-1">{errors.usn}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                        DEPARTMENT
                      </label>
                      <input
                        type="text"
                        value="CSE"
                        disabled
                        className="w-full px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-sm font-mono cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                      COLLEGE SECTION <span className="text-cyan-400">*</span>
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {['A', 'B', 'C', 'D', 'E', 'F', 'OTHER'].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setFormData({ ...formData, section: sec })}
                          className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                            formData.section === sec
                              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                        MOBILE NUMBER <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                      />
                      {errors.mobile && <p className="text-xs text-rose-400 mt-1">{errors.mobile}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                        EMAIL ADDRESS <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rahul@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                      {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 02: MANDATORY PROFILE PHOTO */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800/80 pb-3 mb-4">
                    <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                      STEP 02 OF 04
                    </span>
                    <h4 className="font-display font-bold text-lg text-white">
                      PROFILE PHOTO <span className="text-cyan-400">*</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload a clear recent photograph. This photo will be rendered on your official Digital Volunteer ID card.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />

                  {formData.photoUrl ? (
                    <div className="text-center space-y-4">
                      <div className="w-44 h-44 mx-auto rounded-2xl overflow-hidden border-2 border-cyan-400 p-1 shadow-xl shadow-cyan-500/20">
                        <img
                          src={formData.photoUrl}
                          alt="Uploaded Profile"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono uppercase tracking-wider text-cyan-400 rounded-xl transition-colors cursor-pointer"
                        >
                          CHANGE PHOTO
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80 group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h5 className="font-display font-bold text-sm text-white mb-1">
                        UPLOAD PHOTO
                      </h5>
                      <p className="text-xs text-slate-400 mb-4">
                        JPG / PNG / WEBP • Maximum 5 MB
                      </p>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          type="button"
                          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl"
                        >
                          CHOOSE FILE
                        </button>
                        <span className="text-xs text-slate-500">OR TAKE PHOTO ON MOBILE</span>
                      </div>
                    </div>
                  )}

                  {errors.photo && (
                    <div className="flex items-center space-x-2 text-rose-400 text-xs bg-rose-950/30 p-3 rounded-xl border border-rose-800/40">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.photo}</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 03: VOLUNTEER EVENT PREFERENCES */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800/80 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                        STEP 03 OF 04
                      </span>
                      <h4 className="font-display font-bold text-lg text-white">
                        SELECT 2 EVENT PREFERENCES
                      </h4>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold self-start sm:self-auto">
                      <span className={selectedPreferencesCount === 2 ? 'text-emerald-400' : 'text-cyan-400'}>
                        {selectedPreferencesCount}
                      </span>{' '}
                      / 2 selected
                    </div>
                  </div>

                  {/* Explicit Mandatory Workflow Notice Required by Section 1 */}
                  <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-1.5">
                    <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>IMPORTANT PREFERENCE GUIDELINE</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      "Select 2 event preferences. Final event assignment and volunteer role will be decided by the admin."
                    </p>
                    <p className="text-[11px] text-slate-400">
                      These are your preferred duty areas, not final participant enrollments or guaranteed assignments.
                    </p>
                  </div>

                  {/* Selected badges display */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-3 rounded-xl border ${
                      formData.preferences[0] 
                        ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">PREFERENCE 1:</span>
                      <span className="font-bold">{formData.preferences[0] || 'Select an event below'}</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${
                      formData.preferences[1] 
                        ? 'bg-violet-950/50 border-violet-500/60 text-violet-200' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">PREFERENCE 2:</span>
                      <span className="font-bold">{formData.preferences[1] || 'Select an event below'}</span>
                    </div>
                  </div>

                  {preferenceWarning && (
                    <div className="flex items-center space-x-2 text-amber-300 text-xs bg-amber-950/30 p-3 rounded-xl border border-amber-800/40">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{preferenceWarning}</span>
                    </div>
                  )}

                  {/* Sports Selection */}
                  <div>
                    <h5 className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold mb-2">
                      SPORTS
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sportsEvents.map((evt) => {
                        const isSelected = formData.preferences.includes(evt.name);
                        return (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => togglePreference(evt.name)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-sm'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs font-semibold">{evt.name}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected ? 'bg-cyan-500 border-cyan-400 text-black' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cultural Selection */}
                  <div>
                    <h5 className="text-[11px] font-mono uppercase tracking-widest text-violet-400 font-bold mb-2 pt-2">
                      CULTURAL
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {culturalEvents.map((evt) => {
                        const isSelected = formData.preferences.includes(evt.name);
                        return (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => togglePreference(evt.name)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-violet-950/70 border-violet-400 text-white shadow-sm'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs font-semibold">{evt.name}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected ? 'bg-violet-500 border-violet-400 text-white' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Media / Creative Selection */}
                  <div>
                    <h5 className="text-[11px] font-mono uppercase tracking-widest text-pink-400 font-bold mb-2 pt-2">
                      MEDIA / CREATIVE
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mediaEvents.map((evt) => {
                        const isSelected = formData.preferences.includes(evt.name);
                        return (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => togglePreference(evt.name)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-pink-950/70 border-pink-400 text-white shadow-sm'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs font-semibold">{evt.name}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected ? 'bg-pink-500 border-pink-400 text-white' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 04: REVIEW & CONFIRM */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800/80 pb-3 mb-4">
                    <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                      STEP 04 OF 04
                    </span>
                    <h4 className="font-display font-bold text-lg text-white">
                      REVIEW YOUR APPLICATION
                    </h4>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                    
                    {/* Top Row: Photo & Details */}
                    <div className="flex items-center space-x-4 pb-4 border-b border-slate-800">
                      <img
                        src={formData.photoUrl}
                        alt="Volunteer Profile"
                        className="w-16 h-16 rounded-xl object-cover border border-cyan-400"
                      />
                      <div>
                        <h5 className="font-display font-bold text-base text-white">
                          {formData.fullName}
                        </h5>
                        <p className="text-xs font-mono text-cyan-400">
                          {formData.usn.toUpperCase()} • CSE - Section {formData.section}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] font-mono uppercase">Mobile</span>
                        <p className="text-white font-mono">{formData.mobile}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-mono uppercase">Email</span>
                        <p className="text-white truncate">{formData.email}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-400 text-[10px] font-mono uppercase block mb-1">
                        EVENT PREFERENCES (2 SELECTED)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-mono block">Preference 1</span>
                          <span className="font-bold text-cyan-300">{formData.preferences[0]}</span>
                        </div>
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-mono block">Preference 2</span>
                          <span className="font-bold text-violet-300">{formData.preferences[1]}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Confirmation Checkbox */}
                  <label className="flex items-start space-x-3 p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.confirmCorrect}
                      onChange={(e) => setFormData({ ...formData, confirmCorrect: e.target.checked })}
                      className="mt-0.5 accent-cyan-400 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      I confirm that all information provided is accurate and understand that <strong>final event assignment and volunteer role will be decided by the admin</strong>.
                    </span>
                  </label>
                  {errors.confirm && <p className="text-xs text-rose-400">{errors.confirm}</p>}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Bottom Footer Navigation (Only if not submitted) */}
        {!submittedAppId && (
          <div className="p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-display font-bold uppercase rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-display font-bold uppercase rounded-xl shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>SUBMIT APPLICATION</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
