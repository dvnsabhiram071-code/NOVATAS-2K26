import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  VolunteerApplication, 
  VolunteerEvent, 
  AdminSettings, 
  AdminTab,
  ContactPerson, 
  FAQItem
} from '../types';
import { 
  INITIAL_APPLICATIONS, 
  INITIAL_EVENTS, 
  INITIAL_SETTINGS,
  INITIAL_CONTACTS, 
  INITIAL_FAQS
} from '../data/initialData';
import { adminAuthService } from '../services/adminAuthService';
import { dbService, DatabaseWriteResult, ApplicationStatsResult } from '../services/db';

interface AppContextType {
  applications: VolunteerApplication[];
  appStats: ApplicationStatsResult;
  events: VolunteerEvent[];
  settings: AdminSettings;
  contacts: ContactPerson[];
  faqs: FAQItem[];
  isAdminLoggedIn: boolean;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  setIsAdminLoggedIn: (val: boolean) => void;
  isCloudConnected: boolean;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  refreshStats: () => Promise<void>;
  
  // Public Modals / Screens
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (val: boolean) => void;
  isStatusModalOpen: boolean;
  setIsStatusModalOpen: (val: boolean) => void;
  statusLookupUSN: string;
  setStatusLookupUSN: (usn: string) => void;
  
  // Actions
  submitApplication: (data: Omit<VolunteerApplication, 'id' | 'applicationId' | 'status' | 'submittedAt' | 'checkedIn' | 'isDeleted' | 'volunteerId' | 'qrToken' | 'approvedAt' | 'assignedEvent1' | 'assignedEvent2' | 'volunteerRole'>) => Promise<VolunteerApplication & { isDuplicate?: boolean }>;
  approveApplication: (idOrApp: string | VolunteerApplication, finalEvent?: string, volunteerRole?: string) => Promise<{ success: boolean; message: string; data?: VolunteerApplication }>;
  rejectApplication: (idOrApp: string | VolunteerApplication, reason: string) => Promise<{ success: boolean; message: string; data?: VolunteerApplication }>;
  deleteApplication: (id: string) => Promise<{ success: boolean; message: string }>;
  assignVolunteerEvents: (idOrApp: string | VolunteerApplication, event1: string, event2?: string, role?: string) => Promise<{ success: boolean; message: string; data?: VolunteerApplication }>;
  bulkAssign: (ids: string[], eventName: string) => Promise<{ success: boolean; message: string }>;
  checkInVolunteer: (identifier: string) => Promise<{ success: boolean; volunteer?: VolunteerApplication; message: string }>;
  
  // Event Management
  addEvent: (event: Omit<VolunteerEvent, 'id'>) => Promise<{ success: boolean; message: string }>;
  updateEvent: (id: string, data: Partial<VolunteerEvent>) => Promise<{ success: boolean; message: string }>;
  deleteEvent: (id: string) => Promise<{ success: boolean; message: string }>;

  // Contact Management
  addContact: (contact: Omit<ContactPerson, 'id' | 'createdAt'>) => Promise<DatabaseWriteResult<ContactPerson>>;
  updateContact: (id: string, data: Partial<ContactPerson>) => Promise<DatabaseWriteResult<ContactPerson>>;
  deleteContact: (id: string) => Promise<DatabaseWriteResult>;
  toggleContactStatus: (id: string) => Promise<DatabaseWriteResult>;
  reorderContacts: (orderedIds: string[]) => Promise<void>;

  // FAQ Management
  addFAQ: (faq: Omit<FAQItem, 'id' | 'createdAt'>) => Promise<{ success: boolean; message: string }>;
  updateFAQ: (id: string, data: Partial<FAQItem>) => Promise<{ success: boolean; message: string }>;
  deleteFAQ: (id: string) => Promise<{ success: boolean; message: string }>;
  toggleFAQStatus: (id: string) => Promise<void>;
  reorderFAQs: (orderedIds: string[]) => Promise<void>;
  
  // Settings & Cloud Database
  updateSettings: (newSettings: Partial<AdminSettings>) => Promise<{ success: boolean; message: string }>;
  resetDemoData: () => void;
  saveCloudConfig: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  getCloudConfig: () => { url: string; key: string; source: 'env' | 'storage' | 'none' };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Production single source of truth: Applications start empty until loaded from Supabase
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [appStats, setAppStats] = useState<ApplicationStatsResult>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    assigned: 0,
    checkedIn: 0
  });
  const [events, setEvents] = useState<VolunteerEvent[]>(INITIAL_EVENTS);
  const [settings, setSettings] = useState<AdminSettings>(INITIAL_SETTINGS);
  const [contacts, setContacts] = useState<ContactPerson[]>(INITIAL_CONTACTS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() => dbService.isCloudConnected());

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return adminAuthService.isAuthenticated();
  });

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusLookupUSN, setStatusLookupUSN] = useState('');

  // Live Database Statistics Loader (Fast exact counts from PostgreSQL)
  const refreshStats = async () => {
    try {
      const stats = await dbService.fetchApplicationStats();
      setAppStats(stats);
    } catch (err) {
      console.error('Failed to refresh application stats:', err);
    }
  };

  // Primary Database Loader
  const refreshData = async () => {
    try {
      setIsCloudConnected(dbService.isCloudConnected());
      const [appsData, eventsData, contactsData, faqsData, settingsData, statsData] = await Promise.all([
        dbService.getApplications(),
        dbService.getEvents(),
        dbService.getContacts(),
        dbService.getFaqs(),
        dbService.getSettings(),
        dbService.fetchApplicationStats()
      ]);
      setApplications(appsData);
      setEvents(eventsData);
      setContacts(contactsData);
      setFaqs(faqsData);
      setSettings(settingsData);
      setAppStats(statsData);
    } catch (err) {
      console.error('Failed to refresh data from database:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Subscribe to real-time changes from other devices via Supabase Realtime
    const unsubscribe = dbService.subscribeToChanges(() => {
      refreshData();
      refreshStats();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Submit new application: NEVER generates Volunteer ID, QR, or final assignment. Enforces duplicate check.
  const submitApplication = async (data: Omit<VolunteerApplication, 'id' | 'applicationId' | 'status' | 'submittedAt' | 'checkedIn' | 'isDeleted' | 'volunteerId' | 'qrToken' | 'approvedAt' | 'assignedEvent1' | 'assignedEvent2' | 'volunteerRole'>): Promise<VolunteerApplication & { isDuplicate?: boolean }> => {
    // 1. Live duplicate verification against Supabase before ID generation or database write
    const dupCheck = await dbService.checkDuplicateRegistration({
      usn: data.usn,
      mobile: data.mobile,
      email: data.email
    });

    if (dupCheck.isDuplicate && dupCheck.existingApplication) {
      console.warn('Duplicate registration detected. Returning existing application without alteration:', dupCheck.existingApplication.id);
      return {
        ...dupCheck.existingApplication,
        isDuplicate: true
      };
    }

    const count = applications.length + 490;
    const padded = String(count).padStart(5, '0');
    const newId = `NOV26-${padded}`;

    const newApp: VolunteerApplication = {
      ...data,
      id: newId,
      applicationId: newId,
      preference1: data.preferences[0] || '',
      preference2: data.preferences[1] || '',
      status: 'PENDING',
      volunteerId: undefined,
      qrToken: undefined,
      assignedEvent1: undefined,
      assignedEvent2: undefined,
      volunteerRole: undefined,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      checkedIn: false,
      isDeleted: false
    };

    const res = await dbService.saveApplication(newApp, true);
    if (res.isDuplicate && res.data) {
      return {
        ...res.data,
        isDuplicate: true
      };
    }

    const finalApp = res.data || newApp;
    setApplications(prev => [finalApp, ...prev.filter(a => a.id !== newId)]);
    return {
      ...finalApp,
      isDuplicate: false
    };
  };

  // Assign Volunteer Events & Role (Pre-approval draft assignment OR post-approval modification)
  const assignVolunteerEvents = async (idOrApp: string | VolunteerApplication, event1: string, event2?: string, role?: string): Promise<{ success: boolean; message: string; data?: VolunteerApplication }> => {
    let target: VolunteerApplication | undefined;
    const id = typeof idOrApp === 'string' ? idOrApp : idOrApp.id;

    if (typeof idOrApp === 'object' && idOrApp !== null) {
      target = idOrApp;
    } else {
      target = applications.find(a => a.id === id);
      if (!target) {
        target = await dbService.fetchApplicationById(id) || undefined;
      }
    }
    if (!target) {
      return { success: false, message: `Application "${id}" not found.` };
    }

    const matchedEvt = events.find(e => e.name.toLowerCase() === event1.toLowerCase());
    const updated: VolunteerApplication = {
      ...target,
      assignedEvent1: event1,
      assignedEvent2: event2 || undefined,
      assignedCategory: matchedEvt ? matchedEvt.category : target.assignedCategory,
      volunteerRole: role || target.volunteerRole,
      updatedAt: new Date().toISOString()
    };

    const res = await dbService.saveApplication(updated);
    if (res.success && res.data) {
      setApplications(prev => {
        const exists = prev.some(app => app.id === id);
        if (exists) {
          return prev.map(app => app.id === id ? res.data! : app);
        }
        return [res.data!, ...prev];
      });
      adminAuthService.logAudit('EVENT_ASSIGNED', 'APPLICATION', id, `Assigned to ${event1}${role ? ` (${role})` : ''}`);
      return { success: true, message: 'Saved and verified in Supabase database.', data: res.data };
    } else {
      console.error('Failed to assign volunteer events:', res.message);
      return { success: false, message: res.message || 'Database error occurred while assigning.' };
    }
  };

  // Approve Application: Strict verification & generation of Volunteer ID + QR
  const approveApplication = async (idOrApp: string | VolunteerApplication, finalEvent?: string, volunteerRole?: string): Promise<{ success: boolean; message: string; data?: VolunteerApplication }> => {
    let target: VolunteerApplication | undefined;
    const id = typeof idOrApp === 'string' ? idOrApp : idOrApp.id;

    if (typeof idOrApp === 'object' && idOrApp !== null) {
      target = idOrApp;
    } else {
      target = applications.find(a => a.id === id && !a.isDeleted);
      if (!target) {
        target = await dbService.fetchApplicationById(id) || undefined;
      }
    }
    if (!target) return { success: false, message: `Volunteer application "${id}" not found.` };

    const eventToAssign = finalEvent || target.assignedEvent1 || target.preference1 || (target.preferences && target.preferences[0]) || (events[0]?.name || 'General Coordination');
    const roleToAssign = volunteerRole || target.volunteerRole || 'Event Coordination';

    const numPart = target.id.replace(/[^0-9]/g, '').slice(-5).padStart(5, '0');
    const volunteerId = target.volunteerId || `NVT26-V${numPart || '00001'}`;
    const qrToken = target.qrToken || `sec-${Math.random().toString(36).substring(2, 8)}`;

    const matchedEvt = events.find(e => e.name.toLowerCase() === eventToAssign.toLowerCase());
    const cat = matchedEvt ? matchedEvt.category : (target.assignedCategory || 'General Coordination');

    const updated: VolunteerApplication = {
      ...target,
      status: 'APPROVED',
      volunteerId,
      qrToken,
      assignedEvent1: eventToAssign,
      assignedCategory: cat,
      volunteerRole: roleToAssign,
      approvedAt: target.approvedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rejectionReason: undefined
    };

    const res = await dbService.saveApplication(updated);
    if (res.success && res.data) {
      setApplications(prev => {
        const exists = prev.some(app => app.id === id);
        if (exists) {
          return prev.map(app => app.id === id ? res.data! : app);
        }
        return [res.data!, ...prev];
      });
      adminAuthService.logAudit('APPLICATION_APPROVED', 'APPLICATION', id, `Approved and assigned to ${eventToAssign}`);
      return { success: true, message: 'Application approved and saved to database.', data: res.data };
    } else {
      return { success: false, message: res.message || 'Database save error during approval.' };
    }
  };

  // Reject Application: No Volunteer ID, No QR, No Volunteer Card
  const rejectApplication = async (idOrApp: string | VolunteerApplication, reason: string): Promise<{ success: boolean; message: string; data?: VolunteerApplication }> => {
    let target: VolunteerApplication | undefined;
    const id = typeof idOrApp === 'string' ? idOrApp : idOrApp.id;

    if (typeof idOrApp === 'object' && idOrApp !== null) {
      target = idOrApp;
    } else {
      target = applications.find(a => a.id === id);
      if (!target) {
        target = await dbService.fetchApplicationById(id) || undefined;
      }
    }
    if (!target) return { success: false, message: `Application "${id}" not found.` };

    const updated: VolunteerApplication = {
      ...target,
      status: 'REJECTED',
      rejectionReason: reason || 'Requirements not met at this time.',
      volunteerId: undefined,
      qrToken: undefined,
      updatedAt: new Date().toISOString()
    };

    const res = await dbService.saveApplication(updated);
    if (res.success && res.data) {
      setApplications(prev => {
        const exists = prev.some(app => app.id === id);
        if (exists) {
          return prev.map(app => app.id === id ? res.data! : app);
        }
        return [res.data!, ...prev];
      });
      adminAuthService.logAudit('APPLICATION_REJECTED', 'APPLICATION', id, `Reason: ${reason}`);
      return { success: true, message: 'Application rejected in database.', data: res.data };
    } else {
      return { success: false, message: res.message || 'Database error during rejection.' };
    }
  };

  // Soft Delete Application
  const deleteApplication = async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await dbService.deleteApplication(id);
    if (res.success) {
      setApplications(prev => prev.map(app => {
        if (app.id !== id) return app;
        return { 
          ...app, 
          isDeleted: true, 
          updatedAt: new Date().toISOString() 
        };
      }));
      adminAuthService.logAudit('APPLICATION_DELETED', 'APPLICATION', id, 'Soft-deleted application');
    }
    return res;
  };

  // Bulk Assign
  const bulkAssign = async (ids: string[], eventName: string): Promise<{ success: boolean; message: string }> => {
    const matchedEvt = events.find(e => e.name.toLowerCase() === eventName.toLowerCase());
    let failedCount = 0;
    const updatedApps: VolunteerApplication[] = [];

    for (const id of ids) {
      const target = applications.find(a => a.id === id);
      if (!target) continue;
      const updated: VolunteerApplication = {
        ...target,
        assignedEvent1: eventName,
        assignedCategory: matchedEvt ? matchedEvt.category : target.assignedCategory,
        updatedAt: new Date().toISOString()
      };
      const res = await dbService.saveApplication(updated);
      if (res.success && res.data) {
        updatedApps.push(res.data);
      } else {
        failedCount++;
      }
    }

    if (updatedApps.length > 0) {
      setApplications(prev => prev.map(app => {
        const found = updatedApps.find(u => u.id === app.id);
        return found || app;
      }));
      adminAuthService.logAudit('BULK_ASSIGNED', 'APPLICATION', ids.join(','), `Bulk assigned to ${eventName}`);
    }

    return {
      success: failedCount === 0,
      message: failedCount === 0 ? `Successfully assigned ${updatedApps.length} volunteers.` : `Assigned ${updatedApps.length}, but ${failedCount} failed to save.`
    };
  };

  // QR or ID Check-in
  const checkInVolunteer = async (identifier: string): Promise<{ success: boolean; volunteer?: VolunteerApplication; message: string }> => {
    const cleanId = identifier.trim().toUpperCase();
    
    // Live direct query against Supabase
    let found = await dbService.fetchApplicationByUSN(cleanId);
    if (!found) {
      found = applications.find(a => 
        !a.isDeleted && (
          (a.volunteerId && a.volunteerId.toUpperCase() === cleanId) ||
          (a.usn && a.usn.toUpperCase() === cleanId) ||
          (a.id && a.id.toUpperCase() === cleanId)
        )
      ) || null;
    }

    if (!found) {
      return { success: false, message: `No volunteer found matching "${identifier}".` };
    }

    if (found.status !== 'APPROVED') {
      return { 
        success: false, 
        volunteer: found, 
        message: `Volunteer status is ${found.status}. Only APPROVED volunteers can be accredited for entry.` 
      };
    }

    if (found.checkedIn) {
      return { 
        success: true, 
        volunteer: found, 
        message: `Volunteer was ALREADY CHECKED IN at ${found.checkedInAt || 'Gate Desk'}. Accreditation valid.` 
      };
    }

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: VolunteerApplication = {
      ...found,
      checkedIn: true,
      checkedInAt: new Date().toISOString()
    };

    const res = await dbService.saveApplication(updated);
    if (res.success && res.data) {
      setApplications(prev => prev.map(a => a.id === found!.id ? res.data! : a));
      adminAuthService.logAudit('CHECK_IN_RECORDED', 'VOLUNTEER', found.id, `Checked in at ${timeNow}`);
      return {
        success: true,
        volunteer: res.data,
        message: `Volunteer ${found.fullName} (${found.volunteerId}) successfully accredited and checked in!`
      };
    } else {
      return {
        success: false,
        message: `Failed to save check-in: ${res.message}`
      };
    }
  };

  // Event Management
  const addEvent = async (eventData: Omit<VolunteerEvent, 'id'>): Promise<{ success: boolean; message: string }> => {
    const id = `evt-${eventData.name.toLowerCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`;
    const newEvent: VolunteerEvent = { ...eventData, id };
    const res = await dbService.saveEvent(newEvent);
    if (res.success) {
      setEvents(prev => [...prev, newEvent]);
      adminAuthService.logAudit('EVENT_CREATED', 'EVENT', id, newEvent.name);
    }
    return res;
  };

  const updateEvent = async (id: string, data: Partial<VolunteerEvent>): Promise<{ success: boolean; message: string }> => {
    const existing = events.find(e => e.id === id);
    if (!existing) return { success: false, message: 'Event not found' };
    const updated: VolunteerEvent = { ...existing, ...data };
    const res = await dbService.saveEvent(updated);
    if (res.success) {
      setEvents(prev => prev.map(evt => evt.id === id ? updated : evt));
      adminAuthService.logAudit('EVENT_UPDATED', 'EVENT', id, 'Updated event details');
    }
    return res;
  };

  const deleteEvent = async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await dbService.deleteEvent(id);
    if (res.success) {
      setEvents(prev => prev.filter(evt => evt.id !== id));
      adminAuthService.logAudit('EVENT_DELETED', 'EVENT', id, 'Deleted event');
    }
    return res;
  };

  // Contact Management
  const addContact = async (contactData: Omit<ContactPerson, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
    const id = `CNT-${Date.now().toString(36).toUpperCase()}`;
    const newContact: ContactPerson = {
      ...contactData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const res = await dbService.saveContact(newContact);
    // 7. Only then update the Admin UI
    if (res.success && res.data) {
      setContacts(prev => [...prev, res.data!]);
      adminAuthService.logAudit('CONTACT_CREATED', 'CONTACT', id, res.data.name);
    }
    return res;
  };

  const updateContact = async (id: string, data: Partial<ContactPerson>): Promise<DatabaseWriteResult<ContactPerson>> => {
    const existing = contacts.find(c => c.id.toLowerCase() === id.toLowerCase());
    if (!existing) {
      return { 
        success: false, 
        message: 'Contact not found',
        error: {
          code: 'NOT_FOUND',
          message: `Contact with ID "${id}" not found in local active list.`
        }
      };
    }
    const updated: ContactPerson = { ...existing, ...data, updatedAt: new Date().toISOString() };
    const res = await dbService.saveContact(updated);
    // 7. Only then update the Admin UI with verified refetched row
    if (res.success && res.data) {
      setContacts(prev => prev.map(c => c.id.toLowerCase() === id.toLowerCase() ? res.data! : c));
      adminAuthService.logAudit('CONTACT_UPDATED', 'CONTACT', id, `Updated contact ${res.data.name}`);
    }
    return res;
  };

  const deleteContact = async (id: string): Promise<DatabaseWriteResult> => {
    const res = await dbService.deleteContact(id);
    if (res.success) {
      setContacts(prev => prev.filter(c => c.id.toLowerCase() !== id.toLowerCase()));
      adminAuthService.logAudit('CONTACT_DELETED', 'CONTACT', id, 'Deleted contact');
    }
    return res;
  };

  const toggleContactStatus = async (id: string): Promise<DatabaseWriteResult> => {
    const target = contacts.find(c => c.id.toLowerCase() === id.toLowerCase());
    if (!target) {
      return { 
        success: false, 
        message: 'Contact not found',
        error: { code: 'NOT_FOUND', message: `Contact "${id}" not found.` }
      };
    }
    const updated: ContactPerson = { 
      ...target, 
      status: target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', 
      updatedAt: new Date().toISOString() 
    };
    const res = await dbService.saveContact(updated);
    if (res.success && res.data) {
      setContacts(prev => prev.map(c => c.id.toLowerCase() === id.toLowerCase() ? res.data! : c));
    }
    return res;
  };

  const reorderContacts = async (orderedIds: string[]): Promise<void> => {
    const updatedList = contacts.map(c => {
      const idx = orderedIds.indexOf(c.id);
      if (idx !== -1) {
        return { ...c, displayOrder: idx + 1, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    setContacts(updatedList);
    for (const c of updatedList) {
      await dbService.saveContact(c);
    }
  };

  // FAQ Management
  const addFAQ = async (faqData: Omit<FAQItem, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
    const id = `faq-${Date.now().toString(36)}`;
    const newFAQ: FAQItem = {
      ...faqData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const res = await dbService.saveFaq(newFAQ);
    if (res.success) {
      setFaqs(prev => [...prev, newFAQ]);
      adminAuthService.logAudit('FAQ_CREATED', 'FAQ', id, newFAQ.question);
    }
    return res;
  };

  const updateFAQ = async (id: string, data: Partial<FAQItem>): Promise<{ success: boolean; message: string }> => {
    const existing = faqs.find(f => f.id === id);
    if (!existing) return { success: false, message: 'FAQ not found' };
    const updated: FAQItem = { ...existing, ...data, updatedAt: new Date().toISOString() };
    const res = await dbService.saveFaq(updated);
    if (res.success) {
      setFaqs(prev => prev.map(f => f.id === id ? updated : f));
      adminAuthService.logAudit('FAQ_UPDATED', 'FAQ', id, 'Updated FAQ');
    }
    return res;
  };

  const deleteFAQ = async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await dbService.deleteFaq(id);
    if (res.success) {
      setFaqs(prev => prev.filter(f => f.id !== id));
      adminAuthService.logAudit('FAQ_DELETED', 'FAQ', id, 'Deleted FAQ');
    }
    return res;
  };

  const toggleFAQStatus = async (id: string): Promise<void> => {
    const target = faqs.find(f => f.id === id);
    if (!target) return;
    const updated: FAQItem = { 
      ...target, 
      status: target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', 
      updatedAt: new Date().toISOString() 
    };
    const res = await dbService.saveFaq(updated);
    if (res.success) {
      setFaqs(prev => prev.map(f => f.id === id ? updated : f));
    }
  };

  const reorderFAQs = async (orderedIds: string[]): Promise<void> => {
    const updatedList = faqs.map(f => {
      const idx = orderedIds.indexOf(f.id);
      if (idx !== -1) {
        return { ...f, displayOrder: idx + 1, updatedAt: new Date().toISOString() };
      }
      return f;
    });
    setFaqs(updatedList);
    for (const f of updatedList) {
      await dbService.saveFaq(f);
    }
  };

  // Settings
  const updateSettings = async (newSettings: Partial<AdminSettings>): Promise<{ success: boolean; message: string }> => {
    const updated = { ...settings, ...newSettings };
    const res = await dbService.saveSettings(updated);
    if (res.success) {
      setSettings(updated);
      adminAuthService.logAudit('SETTINGS_UPDATED', 'SETTINGS', 'singleton', 'Updated portal settings');
    }
    return res;
  };

  const resetDemoData = () => {
    // PROTECTED: Production safety lock - never overwrite real volunteer applications
    console.warn('Production safety lock: resetting applications is disabled to protect live database records.');
  };

  const saveCloudConfig = async (url: string, key: string) => {
    const res = await dbService.setConfig(url, key);
    if (res.success) {
      setIsCloudConnected(true);
      await refreshData();
    }
    return res;
  };

  const getCloudConfig = () => {
    return dbService.getConfig();
  };

  return (
    <AppContext.Provider
      value={{
        applications,
        appStats,
        refreshStats,
        events,
        settings,
        contacts,
        faqs,
        isAdminLoggedIn,
        activeAdminTab,
        setActiveAdminTab,
        setIsAdminLoggedIn,
        isCloudConnected,
        isLoadingData,
        refreshData,
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        isStatusModalOpen,
        setIsStatusModalOpen,
        statusLookupUSN,
        setStatusLookupUSN,
        submitApplication,
        approveApplication,
        rejectApplication,
        deleteApplication,
        assignVolunteerEvents,
        bulkAssign,
        checkInVolunteer,
        addEvent,
        updateEvent,
        deleteEvent,
        addContact,
        updateContact,
        deleteContact,
        toggleContactStatus,
        reorderContacts,
        addFAQ,
        updateFAQ,
        deleteFAQ,
        toggleFAQStatus,
        reorderFAQs,
        updateSettings,
        resetDemoData,
        saveCloudConfig,
        getCloudConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
