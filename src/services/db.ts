import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  VolunteerApplication, 
  VolunteerEvent, 
  ContactPerson, 
  FAQItem, 
  AdminSettings 
} from '../types';
import { 
  INITIAL_APPLICATIONS, 
  INITIAL_EVENTS, 
  INITIAL_CONTACTS, 
  INITIAL_FAQS, 
  INITIAL_SETTINGS 
} from '../data/initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
);

let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabase = null;
  }
}

// Memory & local persistent cache key for instant rendering while cloud fetches
const CACHE_KEYS = {
  APPLICATIONS: 'novatas_db_cache_apps',
  EVENTS: 'novatas_db_cache_events',
  CONTACTS: 'novatas_db_cache_contacts',
  FAQS: 'novatas_db_cache_faqs',
  SETTINGS: 'novatas_db_cache_settings',
};

// Helper: Map database snake_case row to VolunteerApplication
function mapApplicationRow(row: any): VolunteerApplication {
  return {
    id: row.id,
    applicationId: row.application_id || row.id,
    fullName: row.full_name,
    usn: row.usn,
    department: row.department || 'CSE',
    section: row.section,
    mobile: row.mobile,
    email: row.email,
    photoUrl: row.photo_url || '',
    preference1: row.preference1,
    preference2: row.preference2,
    preferences: [row.preference1 || '', row.preference2 || ''],
    status: row.status,
    rejectionReason: row.rejection_reason,
    assignedEvent1: row.assigned_event_1,
    assignedEvent2: row.assigned_event_2,
    assignedCategory: row.assigned_category,
    volunteerRole: row.volunteer_role,
    volunteerId: row.volunteer_id,
    qrToken: row.qr_token,
    approvedAt: row.approved_at,
    submittedAt: row.submitted_at || row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    checkedIn: Boolean(row.checked_in),
    checkedInAt: row.checked_in_at,
    isDeleted: Boolean(row.is_deleted),
  };
}

// Helper: Map VolunteerApplication to database snake_case row
function toApplicationRow(app: VolunteerApplication) {
  return {
    id: app.id,
    application_id: app.applicationId || app.id,
    full_name: app.fullName,
    usn: app.usn,
    department: app.department || 'CSE',
    section: app.section,
    mobile: app.mobile,
    email: app.email,
    photo_url: app.photoUrl || '',
    preference1: app.preference1 || app.preferences[0] || '',
    preference2: app.preference2 || app.preferences[1] || '',
    status: app.status,
    rejection_reason: app.rejectionReason || null,
    assigned_event_1: app.assignedEvent1 || null,
    assigned_event_2: app.assignedEvent2 || null,
    assigned_category: app.assignedCategory || null,
    volunteer_role: app.volunteerRole || null,
    volunteer_id: app.volunteerId || null,
    qr_token: app.qrToken || null,
    approved_at: app.approvedAt || null,
    submitted_at: app.submittedAt || new Date().toISOString(),
    created_at: app.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    checked_in: Boolean(app.checkedIn),
    checked_in_at: app.checkedInAt || null,
    is_deleted: Boolean(app.isDeleted),
  };
}

class DatabaseService {
  public isCloudConnected(): boolean {
    return isSupabaseConfigured && supabase !== null;
  }

  // =========================================================================
  // APPLICATIONS
  // =========================================================================
  public async getApplications(): Promise<VolunteerApplication[]> {
    if (this.isCloudConnected()) {
      try {
        const { data, error } = await supabase!
          .from('applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapApplicationRow);
          try { localStorage.setItem(CACHE_KEYS.APPLICATIONS, JSON.stringify(mapped)); } catch {}
          return mapped;
        }
        if (error) {
          console.warn('Supabase fetch applications error, falling back to cache:', error.message);
        }
      } catch (err) {
        console.error('Failed to fetch applications from Supabase:', err);
      }
    }

    // Cache / Initial Fallback
    try {
      const cached = localStorage.getItem(CACHE_KEYS.APPLICATIONS);
      return cached ? JSON.parse(cached) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  }

  public async saveApplication(app: VolunteerApplication): Promise<boolean> {
    // 1. Update cache immediately for optimistic UI
    try {
      const existing = await this.getApplications();
      const updated = [app, ...existing.filter(a => a.id !== app.id)];
      localStorage.setItem(CACHE_KEYS.APPLICATIONS, JSON.stringify(updated));
    } catch {}

    // 2. Persist to Supabase if connected
    if (this.isCloudConnected()) {
      try {
        const row = toApplicationRow(app);
        const { error } = await supabase!
          .from('applications')
          .upsert(row, { onConflict: 'id' });

        if (error) {
          console.error('Supabase upsert application error:', error);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Failed to save application to Supabase:', err);
        return false;
      }
    }

    return true;
  }

  public async deleteApplication(id: string): Promise<boolean> {
    try {
      const existing = await this.getApplications();
      const updated = existing.map(a => a.id === id ? { ...a, isDeleted: true, updatedAt: new Date().toISOString() } : a);
      localStorage.setItem(CACHE_KEYS.APPLICATIONS, JSON.stringify(updated));
    } catch {}

    if (this.isCloudConnected()) {
      try {
        const { error } = await supabase!
          .from('applications')
          .update({ is_deleted: true, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          console.error('Supabase delete application error:', error);
          return false;
        }
      } catch (err) {
        console.error('Failed to delete application in Supabase:', err);
        return false;
      }
    }
    return true;
  }

  // =========================================================================
  // EVENTS
  // =========================================================================
  public async getEvents(): Promise<VolunteerEvent[]> {
    if (this.isCloudConnected()) {
      try {
        const { data, error } = await supabase!
          .from('events')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: VolunteerEvent[] = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            description: r.description || '',
            rules: r.rules || '',
            status: r.status,
          }));
          try { localStorage.setItem(CACHE_KEYS.EVENTS, JSON.stringify(mapped)); } catch {}
          return mapped;
        }
      } catch (err) {
        console.error('Failed to fetch events from Supabase:', err);
      }
    }

    try {
      const cached = localStorage.getItem(CACHE_KEYS.EVENTS);
      return cached ? JSON.parse(cached) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  }

  public async saveEvent(event: VolunteerEvent): Promise<boolean> {
    try {
      const existing = await this.getEvents();
      const updated = [event, ...existing.filter(e => e.id !== event.id)];
      localStorage.setItem(CACHE_KEYS.EVENTS, JSON.stringify(updated));
    } catch {}

    if (this.isCloudConnected()) {
      try {
        const { error } = await supabase!
          .from('events')
          .upsert({
            id: event.id,
            name: event.name,
            category: event.category,
            description: event.description,
            rules: event.rules,
            status: event.status,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (error) {
          console.error('Supabase save event error:', error);
          return false;
        }
      } catch (err) {
        console.error('Failed to save event to Supabase:', err);
        return false;
      }
    }
    return true;
  }

  public async deleteEvent(id: string): Promise<boolean> {
    try {
      const existing = await this.getEvents();
      const updated = existing.filter(e => e.id !== id);
      localStorage.setItem(CACHE_KEYS.EVENTS, JSON.stringify(updated));
    } catch {}

    if (this.isCloudConnected()) {
      try {
        await supabase!.from('events').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete event in Supabase:', err);
      }
    }
    return true;
  }

  // =========================================================================
  // CONTACTS
  // =========================================================================
  public async getContacts(): Promise<ContactPerson[]> {
    if (this.isCloudConnected()) {
      try {
        const { data, error } = await supabase!
          .from('contacts')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: ContactPerson[] = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            mobile: r.mobile,
            imageUrl: r.image_url || '',
            role: r.role || '',
            status: r.status,
            displayOrder: r.display_order,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
          try { localStorage.setItem(CACHE_KEYS.CONTACTS, JSON.stringify(mapped)); } catch {}
          return mapped;
        }
      } catch (err) {
        console.error('Failed to fetch contacts from Supabase:', err);
      }
    }

    try {
      const cached = localStorage.getItem(CACHE_KEYS.CONTACTS);
      return cached ? JSON.parse(cached) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  }

  public async saveContact(contact: ContactPerson): Promise<boolean> {
    try {
      const existing = await this.getContacts();
      const updated = [contact, ...existing.filter(c => c.id !== contact.id)];
      localStorage.setItem(CACHE_KEYS.CONTACTS, JSON.stringify(updated));
    } catch {}

    if (this.isCloudConnected()) {
      try {
        const { error } = await supabase!
          .from('contacts')
          .upsert({
            id: contact.id,
            name: contact.name,
            email: contact.email,
            mobile: contact.mobile,
            image_url: contact.imageUrl,
            role: contact.role,
            status: contact.status,
            display_order: contact.displayOrder,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (error) {
          console.error('Supabase save contact error:', error);
          return false;
        }
      } catch (err) {
        console.error('Failed to save contact to Supabase:', err);
        return false;
      }
    }
    return true;
  }

  public async deleteContact(id: string): Promise<boolean> {
    try {
      const existing = await this.getContacts();
      const updated = existing.filter(c => c.id !== id);
      localStorage.setItem(CACHE_KEYS.CONTACTS, JSON.stringify(updated));
    } catch {}

    if (this.isCloudConnected()) {
      try {
        await supabase!.from('contacts').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete contact in Supabase:', err);
      }
    }
    return true;
  }

  // =========================================================================
  // FAQS
  // =========================================================================
  public async getFaqs(): Promise<FAQItem[]> {
    if (this.isCloudConnected()) {
      try {
        const { data, error } = await supabase!
          .from('faqs')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: FAQItem[] = data.map((r: any) => ({
            id: r.id,
            question: r.question,
            answer: r.answer,
            category: r.category || 'General',
            status: r.status,
            displayOrder: r.display_order,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
          try { localStorage.setItem(CACHE_KEYS.FAQS, JSON.stringify(mapped)); } catch {}
          return mapped;
        }
      } catch (err) {
        console.error('Failed to fetch FAQs from Supabase:', err);
      }
    }

    try {
      const cached = localStorage.getItem(CACHE_KEYS.FAQS);
      return cached ? JSON.parse(cached) : INITIAL_FAQS;
    } catch {
      return INITIAL_FAQS;
    }
  }

  public async saveFaq(faq: FAQItem): Promise<boolean> {
    try {
      const existing = await this.getFaqs();
      const updated = [faq, ...existing.filter(f => f.id !== faq.id)];
      localStorage.setItem(CACHE_KEYS.FAQS, JSON.stringify(updated));
    } catch {}

    if (this.isCloudConnected()) {
      try {
        const { error } = await supabase!
          .from('faqs')
          .upsert({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            status: faq.status,
            display_order: faq.displayOrder,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (error) {
          console.error('Supabase save faq error:', error);
          return false;
        }
      } catch (err) {
        console.error('Failed to save faq to Supabase:', err);
        return false;
      }
    }
    return true;
  }

  public async deleteFaq(id: string): Promise<boolean> {
    try {
      const existing = await this.getFaqs();
      const updated = existing.filter(f => f.id !== id);
      localStorage.setItem(CACHE_KEYS.FAQS, JSON.stringify(updated));
    } catch {}

    if (this.isCloudConnected()) {
      try {
        await supabase!.from('faqs').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete faq in Supabase:', err);
      }
    }
    return true;
  }

  // =========================================================================
  // SETTINGS
  // =========================================================================
  public async getSettings(): Promise<AdminSettings> {
    if (this.isCloudConnected()) {
      try {
        const { data, error } = await supabase!
          .from('settings')
          .select('*')
          .eq('id', 'singleton')
          .single();

        if (!error && data) {
          const mapped: AdminSettings = {
            eventName: data.event_name,
            department: data.department,
            isRegistrationOpen: Boolean(data.is_registration_open),
            maxEventPreferences: data.max_event_preferences || 2,
            maxImageSizeMB: data.max_image_size_mb || 5,
            allowedImageTypes: data.allowed_image_types || ['image/jpeg', 'image/png', 'image/webp'],
          };
          try { localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(mapped)); } catch {}
          return mapped;
        }
      } catch (err) {
        console.error('Failed to fetch settings from Supabase:', err);
      }
    }

    try {
      const cached = localStorage.getItem(CACHE_KEYS.SETTINGS);
      return cached ? JSON.parse(cached) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public async saveSettings(newSettings: AdminSettings): Promise<boolean> {
    try {
      localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(newSettings));
    } catch {}

    if (this.isCloudConnected()) {
      try {
        const { error } = await supabase!
          .from('settings')
          .upsert({
            id: 'singleton',
            event_name: newSettings.eventName,
            department: newSettings.department,
            is_registration_open: newSettings.isRegistrationOpen,
            max_event_preferences: newSettings.maxEventPreferences,
            max_image_size_mb: newSettings.maxImageSizeMB,
            allowed_image_types: newSettings.allowedImageTypes,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (error) {
          console.error('Supabase save settings error:', error);
          return false;
        }
      } catch (err) {
        console.error('Failed to save settings to Supabase:', err);
        return false;
      }
    }
    return true;
  }
}

export const dbService = new DatabaseService();
