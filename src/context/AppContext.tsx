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
  
  // Settings
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  APPLICATIONS: 'novatas_2k26_applications_v2',
  EVENTS: 'novatas_2k26_events_v2',
  SETTINGS: 'novatas_2k26_settings_v2',
  CONTACTS: 'novatas_2k26_contacts_v2',
  FAQS: 'novatas_2k26_faqs_v2',
  ADMIN_AUTH: 'novatas_2k26_admin_auth_v2'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<VolunteerApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const [events, setEvents] = useState<VolunteerEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [contacts, setContacts] = useState<ContactPerson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  });

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAQS);
      return saved ? JSON.parse(saved) : INITIAL_FAQS;
    } catch {
      return INITIAL_FAQS;
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return adminAuthService.isAuthenticated();
  });

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusLookupUSN, setStatusLookupUSN] = useState('');

  // Persist whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

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
    return newApp;
  };

  // Assign Volunteer Events & Role (Pre-approval draft assignment OR post-approval modification)
  const assignVolunteerEvents = (id: string, event1: string, event2?: string, role?: string) => {
    const matchedEvt = events.find(e => e.name.toLowerCase() === event1.toLowerCase());
    setApplications(prev => prev.map(app => {
      if (app.id !== id) return app;
      return {
        ...app,
        assignedEvent1: event1,
        assignedEvent2: event2 || undefined,
        assignedCategory: matchedEvt ? matchedEvt.category : app.assignedCategory,
        volunteerRole: role || app.volunteerRole,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  // Approve Application: Strict verification & generation of Volunteer ID + QR
  const approveApplication = (id: string, finalEvent?: string, volunteerRole?: string): boolean => {
    let succeeded = false;

    setApplications(prev => prev.map(app => {
      if (app.id !== id || app.isDeleted) return app;

      const eventToAssign = finalEvent || app.assignedEvent1;
      const roleToAssign = volunteerRole || app.volunteerRole;

      if (!eventToAssign || !roleToAssign) {
        console.warn('Cannot approve application: Final event and Volunteer role must both be assigned first.');
        return app;
      }

      const numPart = app.id.replace('NOV26-', '').padStart(5, '0');
      const volunteerId = app.volunteerId || `NVT26-V${numPart}`;
      const qrToken = app.qrToken || `sec-${Math.random().toString(36).substring(2, 8)}`;

      const matchedEvt = events.find(e => e.name.toLowerCase() === eventToAssign.toLowerCase());
      const cat = matchedEvt ? matchedEvt.category : (app.assignedCategory || 'General Coordination');

      succeeded = true;

      return {
        ...app,
        status: 'APPROVED',
        volunteerId,
        qrToken,
        assignedEvent1: eventToAssign,
        assignedCategory: cat,
        volunteerRole: roleToAssign,
        approvedAt: app.approvedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rejectionReason: undefined
      };
    }));

    return succeeded;
  };

  // Reject Application: No Volunteer ID, No QR, No Volunteer Card
  const rejectApplication = (id: string, reason: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== id) return app;
      return {
        ...app,
        status: 'REJECTED',
        rejectionReason: reason || 'Requirements not met at this time.',
        volunteerId: undefined,
        qrToken: undefined,
        updatedAt: new Date().toISOString()
      };
    }));
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
  };

  // Bulk Assign
  const bulkAssign = (ids: string[], eventName: string) => {
    const matchedEvt = events.find(e => e.name.toLowerCase() === eventName.toLowerCase());
    setApplications(prev => prev.map(app => {
      if (!ids.includes(app.id)) return app;
      return {
        ...app,
        assignedEvent1: eventName,
        assignedCategory: matchedEvt ? matchedEvt.category : app.assignedCategory,
        updatedAt: new Date().toISOString()
      };
    }));
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
    const updated = {
      ...found,
      checkedIn: true,
      checkedInAt: timeNow
    };

    setApplications(prev => prev.map(a => a.id === found.id ? updated : a));

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
  };

  const updateEvent = (id: string, data: Partial<VolunteerEvent>) => {
    setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...data } : evt));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(evt => evt.id !== id));
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
  };

  const updateContact = (id: string, data: Partial<ContactPerson>) => {
    setContacts(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...data, updatedAt: new Date().toISOString() } 
        : c
    ));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const toggleContactStatus = (id: string) => {
    setContacts(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', updatedAt: new Date().toISOString() } 
        : c
    ));
  };

  const reorderContacts = (orderedIds: string[]) => {
    setContacts(prev => {
      return prev.map(c => {
        const idx = orderedIds.indexOf(c.id);
        if (idx !== -1) {
          return { ...c, displayOrder: idx + 1, updatedAt: new Date().toISOString() };
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
  };

  const updateFAQ = (id: string, data: Partial<FAQItem>) => {
    setFaqs(prev => prev.map(f => 
      f.id === id 
        ? { ...f, ...data, updatedAt: new Date().toISOString() } 
        : f
    ));
  };

  const deleteFAQ = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const toggleFAQStatus = (id: string) => {
    setFaqs(prev => prev.map(f => 
      f.id === id 
        ? { ...f, status: f.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', updatedAt: new Date().toISOString() } 
        : f
    ));
  };

  const reorderFAQs = (orderedIds: string[]) => {
    setFaqs(prev => {
      return prev.map(f => {
        const idx = orderedIds.indexOf(f.id);
        if (idx !== -1) {
          return { ...f, displayOrder: idx + 1, updatedAt: new Date().toISOString() };
        }
        return f;
      });
    });
  };

  // Settings
  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetDemoData = () => {
    setApplications(INITIAL_APPLICATIONS);
    setEvents(INITIAL_EVENTS);
    setSettings(INITIAL_SETTINGS);
    setContacts(INITIAL_CONTACTS);
    setFaqs(INITIAL_FAQS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.FAQS);
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
        resetDemoData
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
