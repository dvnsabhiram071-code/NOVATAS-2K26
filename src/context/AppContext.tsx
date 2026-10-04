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
import { dbService } from '../services/db';

interface AppContextType {
  applications: VolunteerApplication[];
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
  
  // Public Modals / Screens
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (val: boolean) => void;
  isStatusModalOpen: boolean;
  setIsStatusModalOpen: (val: boolean) => void;
  statusLookupUSN: string;
  setStatusLookupUSN: (usn: string) => void;
  
  // Actions
  submitApplication: (data: Omit<VolunteerApplication, 'id' | 'applicationId' | 'status' | 'submittedAt' | 'checkedIn' | 'isDeleted' | 'volunteerId' | 'qrToken' | 'approvedAt' | 'assignedEvent1' | 'assignedEvent2' | 'volunteerRole'>) => VolunteerApplication;
  approveApplication: (id: string, finalEvent?: string, volunteerRole?: string) => boolean;
  rejectApplication: (id: string, reason: string) => void;
  deleteApplication: (id: string) => void;
  assignVolunteerEvents: (id: string, event1: string, event2?: string, role?: string) => void;
  bulkAssign: (ids: string[], eventName: string) => void;
  checkInVolunteer: (identifier: string) => { success: boolean; volunteer?: VolunteerApplication; message: string };
  
  // Event Management
  addEvent: (event: Omit<VolunteerEvent, 'id'>) => void;
  updateEvent: (id: string, data: Partial<VolunteerEvent>) => void;
  deleteEvent: (id: string) => void;

  // Contact Management
  addContact: (contact: Omit<ContactPerson, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, data: Partial<ContactPerson>) => void;
  deleteContact: (id: string) => void;
  toggleContactStatus: (id: string) => void;
  reorderContacts: (orderedIds: string[]) => void;

  // FAQ Management
  addFAQ: (faq: Omit<FAQItem, 'id' | 'createdAt'>) => void;
  updateFAQ: (id: string, data: Partial<FAQItem>) => void;
  deleteFAQ: (id: string) => void;
  toggleFAQStatus: (id: string) => void;
  reorderFAQs: (orderedIds: string[]) => void;
  
  // Settings & Cloud Database
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  resetDemoData: () => void;
  saveCloudConfig: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  getCloudConfig: () => { url: string; key: string; source: 'env' | 'storage' | 'none' };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<VolunteerApplication[]>(INITIAL_APPLICATIONS);
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

  // Primary Database Loader
  const refreshData = async () => {
    try {
      setIsCloudConnected(dbService.isCloudConnected());
      const [appsData, eventsData, contactsData, faqsData, settingsData] = await Promise.all([
        dbService.getApplications(),
        dbService.getEvents(),
        dbService.getContacts(),
        dbService.getFaqs(),
        dbService.getSettings()
      ]);
      setApplications(appsData);
      setEvents(eventsData);
      setContacts(contactsData);
      setFaqs(faqsData);
      setSettings(settingsData);
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
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Submit new application: NEVER generates Volunteer ID, QR, or final assignment
  const submitApplication = (data: Omit<VolunteerApplication, 'id' | 'applicationId' | 'status' | 'submittedAt' | 'checkedIn' | 'isDeleted' | 'volunteerId' | 'qrToken' | 'approvedAt' | 'assignedEvent1' | 'assignedEvent2' | 'volunteerRole'>): VolunteerApplication => {
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

    setApplications(prev => [newApp, ...prev]);
    // Persist to database
    dbService.saveApplication(newApp);

    return newApp;
  };

  // Assign Volunteer Events & Role (Pre-approval draft assignment OR post-approval modification)
  const assignVolunteerEvents = (id: string, event1: string, event2?: string, role?: string) => {
    const matchedEvt = events.find(e => e.name.toLowerCase() === event1.toLowerCase());
    const target = applications.find(a => a.id === id);
    if (!target) return;

    const updated: VolunteerApplication = {
      ...target,
      assignedEvent1: event1,
      assignedEvent2: event2 || undefined,
      assignedCategory: matchedEvt ? matchedEvt.category : target.assignedCategory,
      volunteerRole: role || target.volunteerRole,
      updatedAt: new Date().toISOString()
    };

    setApplications(prev => prev.map(app => app.id === id ? updated : app));
    dbService.saveApplication(updated);

    adminAuthService.logAudit('EVENT_ASSIGNED', 'APPLICATION', id, `Assigned to ${event1}${role ? ` (${role})` : ''}`);
  };

  // Approve Application: Strict verification & generation of Volunteer ID + QR
  const approveApplication = (id: string, finalEvent?: string, volunteerRole?: string): boolean => {
    const target = applications.find(a => a.id === id && !a.isDeleted);
    if (!target) return false;

    const eventToAssign = finalEvent || target.assignedEvent1;
    const roleToAssign = volunteerRole || target.volunteerRole;

    if (!eventToAssign || !roleToAssign) {
      console.warn('Cannot approve application: Final event and Volunteer role must both be assigned first.');
      return false;
    }

    const numPart = target.id.replace('NOV26-', '').padStart(5, '0');
    const volunteerId = target.volunteerId || `NVT26-V${numPart}`;
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

    setApplications(prev => prev.map(app => app.id === id ? updated : app));
    dbService.saveApplication(updated);

    adminAuthService.logAudit('APPLICATION_APPROVED', 'APPLICATION', id, `Approved and assigned to ${eventToAssign}`);

    return true;
  };

  // Reject Application: No Volunteer ID, No QR, No Volunteer Card
  const rejectApplication = (id: string, reason: string) => {
    const target = applications.find(a => a.id === id);
    if (!target) return;

    const updated: VolunteerApplication = {
      ...target,
      status: 'REJECTED',
      rejectionReason: reason || 'Requirements not met at this time.',
      volunteerId: undefined,
      qrToken: undefined,
      updatedAt: new Date().toISOString()
    };

    setApplications(prev => prev.map(app => app.id === id ? updated : app));
    dbService.saveApplication(updated);

    adminAuthService.logAudit('APPLICATION_REJECTED', 'APPLICATION', id, `Reason: ${reason}`);
  };

  // Soft Delete Application
  const deleteApplication = (id: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== id) return app;
      return { 
        ...app, 
        isDeleted: true, 
        updatedAt: new Date().toISOString()
      };
    }));
    dbService.deleteApplication(id);
    adminAuthService.logAudit('APPLICATION_DELETED', 'APPLICATION', id, 'Soft-deleted application');
  };

  // Bulk Assign
  const bulkAssign = (ids: string[], eventName: string) => {
    const matchedEvt = events.find(e => e.name.toLowerCase() === eventName.toLowerCase());
    setApplications(prev => prev.map(app => {
      if (!ids.includes(app.id)) return app;
      const updated: VolunteerApplication = {
        ...app,
        assignedEvent1: eventName,
        assignedCategory: matchedEvt ? matchedEvt.category : app.assignedCategory,
        updatedAt: new Date().toISOString()
      };
      dbService.saveApplication(updated);
      return updated;
    }));
    adminAuthService.logAudit('BULK_ASSIGNED', 'APPLICATION', ids.join(','), `Bulk assigned to ${eventName}`);
  };

  // QR or ID Check-in
  const checkInVolunteer = (identifier: string): { success: boolean; volunteer?: VolunteerApplication; message: string } => {
    const cleanId = identifier.trim().toUpperCase();
    
    const found = applications.find(a => 
      !a.isDeleted && (
        (a.volunteerId && a.volunteerId.toUpperCase() === cleanId) ||
        (a.usn && a.usn.toUpperCase() === cleanId) ||
        (a.id && a.id.toUpperCase() === cleanId)
      )
    );

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
      checkedInAt: timeNow
    };

    setApplications(prev => prev.map(a => a.id === found.id ? updated : a));
    dbService.saveApplication(updated);
    adminAuthService.logAudit('CHECK_IN_RECORDED', 'VOLUNTEER', found.id, `Checked in at ${timeNow}`);

    return {
      success: true,
      volunteer: updated,
      message: `Volunteer ${found.fullName} (${found.volunteerId}) successfully accredited and checked in!`
    };
  };

  // Event Management
  const addEvent = (eventData: Omit<VolunteerEvent, 'id'>) => {
    const id = `evt-${eventData.name.toLowerCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`;
    const newEvent: VolunteerEvent = { ...eventData, id };
    setEvents(prev => [...prev, newEvent]);
    dbService.saveEvent(newEvent);
    adminAuthService.logAudit('EVENT_CREATED', 'EVENT', id, newEvent.name);
  };

  const updateEvent = (id: string, data: Partial<VolunteerEvent>) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id !== id) return evt;
      const updated: VolunteerEvent = { ...evt, ...data };
      dbService.saveEvent(updated);
      return updated;
    }));
    adminAuthService.logAudit('EVENT_UPDATED', 'EVENT', id, 'Updated event details');
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(evt => evt.id !== id));
    dbService.deleteEvent(id);
    adminAuthService.logAudit('EVENT_DELETED', 'EVENT', id, 'Deleted event');
  };

  // Contact Management
  const addContact = (contactData: Omit<ContactPerson, 'id' | 'createdAt'>) => {
    const id = `cnt-${Date.now().toString(36)}`;
    const newContact: ContactPerson = {
      ...contactData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setContacts(prev => [...prev, newContact]);
    dbService.saveContact(newContact);
    adminAuthService.logAudit('CONTACT_CREATED', 'CONTACT', id, newContact.name);
  };

  const updateContact = (id: string, data: Partial<ContactPerson>) => {
    setContacts(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated: ContactPerson = { ...c, ...data, updatedAt: new Date().toISOString() };
      dbService.saveContact(updated);
      return updated;
    }));
    adminAuthService.logAudit('CONTACT_UPDATED', 'CONTACT', id, 'Updated contact');
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    dbService.deleteContact(id);
    adminAuthService.logAudit('CONTACT_DELETED', 'CONTACT', id, 'Deleted contact');
  };

  const toggleContactStatus = (id: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated: ContactPerson = { 
        ...c, 
        status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', 
        updatedAt: new Date().toISOString() 
      };
      dbService.saveContact(updated);
      return updated;
    }));
  };

  const reorderContacts = (orderedIds: string[]) => {
    setContacts(prev => {
      return prev.map(c => {
        const idx = orderedIds.indexOf(c.id);
        if (idx !== -1) {
          const updated = { ...c, displayOrder: idx + 1, updatedAt: new Date().toISOString() };
          dbService.saveContact(updated);
          return updated;
        }
        return c;
      });
    });
  };

  // FAQ Management
  const addFAQ = (faqData: Omit<FAQItem, 'id' | 'createdAt'>) => {
    const id = `faq-${Date.now().toString(36)}`;
    const newFAQ: FAQItem = {
      ...faqData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFaqs(prev => [...prev, newFAQ]);
    dbService.saveFaq(newFAQ);
    adminAuthService.logAudit('FAQ_CREATED', 'FAQ', id, newFAQ.question);
  };

  const updateFAQ = (id: string, data: Partial<FAQItem>) => {
    setFaqs(prev => prev.map(f => {
      if (f.id !== id) return f;
      const updated: FAQItem = { ...f, ...data, updatedAt: new Date().toISOString() };
      dbService.saveFaq(updated);
      return updated;
    }));
    adminAuthService.logAudit('FAQ_UPDATED', 'FAQ', id, 'Updated FAQ');
  };

  const deleteFAQ = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    dbService.deleteFaq(id);
    adminAuthService.logAudit('FAQ_DELETED', 'FAQ', id, 'Deleted FAQ');
  };

  const toggleFAQStatus = (id: string) => {
    setFaqs(prev => prev.map(f => {
      if (f.id !== id) return f;
      const updated: FAQItem = { 
        ...f, 
        status: f.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', 
        updatedAt: new Date().toISOString() 
      };
      dbService.saveFaq(updated);
      return updated;
    }));
  };

  const reorderFAQs = (orderedIds: string[]) => {
    setFaqs(prev => {
      return prev.map(f => {
        const idx = orderedIds.indexOf(f.id);
        if (idx !== -1) {
          const updated = { ...f, displayOrder: idx + 1, updatedAt: new Date().toISOString() };
          dbService.saveFaq(updated);
          return updated;
        }
        return f;
      });
    });
  };

  // Settings
  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      dbService.saveSettings(updated);
      return updated;
    });
    adminAuthService.logAudit('SETTINGS_UPDATED', 'SETTINGS', 'singleton', 'Updated portal settings');
  };

  const resetDemoData = () => {
    setApplications(INITIAL_APPLICATIONS);
    setEvents(INITIAL_EVENTS);
    setSettings(INITIAL_SETTINGS);
    setContacts(INITIAL_CONTACTS);
    setFaqs(INITIAL_FAQS);
    INITIAL_APPLICATIONS.forEach(a => dbService.saveApplication(a));
    INITIAL_EVENTS.forEach(e => dbService.saveEvent(e));
    INITIAL_CONTACTS.forEach(c => dbService.saveContact(c));
    INITIAL_FAQS.forEach(f => dbService.saveFaq(f));
    dbService.saveSettings(INITIAL_SETTINGS);
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
