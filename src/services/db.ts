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

// Config storage keys
const CONFIG_KEYS = {
  SUPABASE_URL: 'novatas_config_supabase_url',
  SUPABASE_KEY: 'novatas_config_supabase_key',
};

// Memory & local persistent cache key for instant rendering while cloud fetches
const CACHE_KEYS = {
  APPLICATIONS: 'novatas_db_cache_apps',
  EVENTS: 'novatas_db_cache_events',
  CONTACTS: 'novatas_db_cache_contacts',
  FAQS: 'novatas_db_cache_faqs',
  SETTINGS: 'novatas_db_cache_settings',
};

// Resolve Supabase credentials: Vercel environment variables take priority, followed by stored config
function resolveSupabaseConfig(): { url: string; key: string; source: 'env' | 'storage' | 'none' } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey && !envUrl.includes('your-project-id')) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  try {
    const storedUrl = (localStorage.getItem(CONFIG_KEYS.SUPABASE_URL) || '').trim();
    const storedKey = (localStorage.getItem(CONFIG_KEYS.SUPABASE_KEY) || '').trim();
    if (storedUrl && storedKey && !storedUrl.includes('your-project-id')) {
      return { url: storedUrl, key: storedKey, source: 'storage' };
    }
  } catch {}

  return { url: '', key: '', source: 'none' };
}

let activeConfig = resolveSupabaseConfig();
let supabase: SupabaseClient | null = null;

function initClient() {
  activeConfig = resolveSupabaseConfig();
  if (activeConfig.url && activeConfig.key) {
    try {
      supabase = createClient(activeConfig.url, activeConfig.key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      supabase = null;
    }
  } else {
    supabase = null;
  }
}

initClient();

// Helper: Map database snake_case row to VolunteerApplication
function mapApplicationRow(row: any): VolunteerApplication {
  let displayCheckedInAt: string | undefined = undefined;
  if (row.checked_in_at) {
    try {
      const d = new Date(row.checked_in_at);
      if (!isNaN(d.getTime())) {
        displayCheckedInAt = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        displayCheckedInAt = String(row.checked_in_at);
      }
    } catch {
      displayCheckedInAt = String(row.checked_in_at);
    }
  }

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
    rejectionReason: row.rejection_reason || undefined,
    assignedEvent1: row.assigned_event_1 || undefined,
    assignedEvent2: row.assigned_event_2 || undefined,
    assignedCategory: row.assigned_category || undefined,
    volunteerRole: row.volunteer_role || undefined,
    volunteerId: row.volunteer_id || undefined,
    qrToken: row.qr_token || undefined,
    approvedAt: row.approved_at || undefined,
    submittedAt: row.submitted_at || row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    checkedIn: Boolean(row.checked_in),
    checkedInAt: displayCheckedInAt,
    isDeleted: Boolean(row.is_deleted),
  };
}

// Helper: Map VolunteerApplication to database snake_case row
function toApplicationRow(app: VolunteerApplication) {
  // Ensure valid TIMESTAMPTZ for checked_in_at
  let safeCheckedInAt: string | null = null;
  if (app.checkedIn) {
    if (app.checkedInAt && app.checkedInAt.includes('T')) {
      safeCheckedInAt = app.checkedInAt;
    } else {
      safeCheckedInAt = new Date().toISOString();
    }
  }

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
    checked_in_at: safeCheckedInAt,
    is_deleted: Boolean(app.isDeleted),
  };
}

class DatabaseService {
  public isCloudConnected(): boolean {
    return supabase !== null && Boolean(activeConfig.url && activeConfig.key);
  }

  public getConfig() {
    return { ...activeConfig };
  }

  public async setConfig(url: string, key: string): Promise<{ success: boolean; message: string }> {
    const cleanUrl = (url || '').trim();
    const cleanKey = (key || '').trim();

    if (!cleanUrl || !cleanKey) {
      return { success: false, message: 'Both Supabase URL and Anon Key are required.' };
    }

    try {
      const testClient = createClient(cleanUrl, cleanKey, {
        auth: { persistSession: false }
      });

      // Test query
      const { error } = await testClient.from('settings').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: `Connection test failed: ${error.message}` };
      }

      // Save to localStorage
      try {
        localStorage.setItem(CONFIG_KEYS.SUPABASE_URL, cleanUrl);
        localStorage.setItem(CONFIG_KEYS.SUPABASE_KEY, cleanKey);
      } catch {}

      // Re-init active client
      initClient();

      return { success: true, message: 'Connected to Supabase PostgreSQL successfully!' };
    } catch (err: any) {
      return { success: false, message: `Failed to connect: ${err.message || 'Unknown error'}` };
    }
  }

  // Real-time subscription to postgres changes
  public subscribeToChanges(onTableChange: (tableName: string) => void): () => void {
    if (!this.isCloudConnected()) {
      return () => {};
    }

    try {
      const channel = supabase!.channel('novatas_live_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'applications' },
          () => onTableChange('applications')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events' },
          () => onTableChange('events')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'contacts' },
          () => onTableChange('contacts')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'faqs' },
          () => onTableChange('faqs')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'settings' },
          () => onTableChange('settings')
        )
        .subscribe();

      return () => {
        try {
          supabase!.removeChannel(channel);
        } catch {}
      };
    } catch (err) {
      console.warn('Realtime subscription error:', err);
      return () => {};
    }
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
          // If the cloud database is completely empty, auto-seed with initial baseline applications
          if (data.length === 0) {
            console.log('Seeding baseline applications to Supabase...');
            const seedRows = INITIAL_APPLICATIONS.map(toApplicationRow);
            await supabase!.from('applications').upsert(seedRows, { onConflict: 'id' });
            try { localStorage.setItem(CACHE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS)); } catch {}
            return INITIAL_APPLICATIONS;
          }

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
      const cached = localStorage.getItem(CACHE_KEYS.APPLICATIONS);
      const existing: VolunteerApplication[] = cached ? JSON.parse(cached) : [];
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
      const cached = localStorage.getItem(CACHE_KEYS.APPLICATIONS);
      const existing: VolunteerApplication[] = cached ? JSON.parse(cached) : [];
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

        if (!error && data) {
          if (data.length === 0) {
            console.log('Seeding baseline events to Supabase...');
            const seedEvents = INITIAL_EVENTS.map(e => ({
              id: e.id,
              name: e.name,
              category: e.category,
              description: e.description,
              rules: e.rules,
              status: e.status,
              updated_at: new Date().toISOString(),
            }));
            await supabase!.from('events').upsert(seedEvents, { onConflict: 'id' });
            try { localStorage.setItem(CACHE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS)); } catch {}
            return INITIAL_EVENTS;
          }

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
      const cached = localStorage.getItem(CACHE_KEYS.EVENTS);
      const existing: VolunteerEvent[] = cached ? JSON.parse(cached) : [];
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
      const cached = localStorage.getItem(CACHE_KEYS.EVENTS);
      const existing: VolunteerEvent[] = cached ? JSON.parse(cached) : [];
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

        if (!error && data) {
          if (data.length === 0) {
            console.log('Seeding baseline contacts to Supabase...');
            const seedContacts = INITIAL_CONTACTS.map(c => ({
              id: c.id,
              name: c.name,
              email: c.email,
              mobile: c.mobile,
              image_url: c.imageUrl,
              role: c.role,
              status: c.status,
              display_order: c.displayOrder,
              updated_at: new Date().toISOString(),
            }));
            await supabase!.from('contacts').upsert(seedContacts, { onConflict: 'id' });
            try { localStorage.setItem(CACHE_KEYS.CONTACTS, JSON.stringify(INITIAL_CONTACTS)); } catch {}
            return INITIAL_CONTACTS;
          }

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
      const cached = localStorage.getItem(CACHE_KEYS.CONTACTS);
      const existing: ContactPerson[] = cached ? JSON.parse(cached) : [];
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
      const cached = localStorage.getItem(CACHE_KEYS.CONTACTS);
      const existing: ContactPerson[] = cached ? JSON.parse(cached) : [];
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

        if (!error && data) {
          if (data.length === 0) {
            console.log('Seeding baseline FAQs to Supabase...');
            const seedFaqs = INITIAL_FAQS.map(f => ({
              id: f.id,
              question: f.question,
              answer: f.answer,
              category: f.category,
              status: f.status,
              display_order: f.displayOrder,
              updated_at: new Date().toISOString(),
            }));
            await supabase!.from('faqs').upsert(seedFaqs, { onConflict: 'id' });
            try { localStorage.setItem(CACHE_KEYS.FAQS, JSON.stringify(INITIAL_FAQS)); } catch {}
            return INITIAL_FAQS;
          }

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
      const cached = localStorage.getItem(CACHE_KEYS.FAQS);
      const existing: FAQItem[] = cached ? JSON.parse(cached) : [];
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
      const cached = localStorage.getItem(CACHE_KEYS.FAQS);
      const existing: FAQItem[] = cached ? JSON.parse(cached) : [];
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
          .maybeSingle();

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

        // If settings table empty, seed it
        if (!error && !data) {
          await this.saveSettings(INITIAL_SETTINGS);
          return INITIAL_SETTINGS;
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
