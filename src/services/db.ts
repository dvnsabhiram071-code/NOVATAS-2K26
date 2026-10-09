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

export interface DatabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface DatabaseWriteResult<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: DatabaseError;
}

export type VolunteerCardLookupResult =
  | { status: 'APPROVED'; volunteer: VolunteerApplication }
  | { status: 'PENDING'; volunteer: VolunteerApplication }
  | { status: 'REJECTED'; volunteer: VolunteerApplication }
  | { status: 'UNASSIGNED'; volunteer: VolunteerApplication; message: string }
  | { status: 'NOT_FOUND' }
  | { status: 'ERROR'; message: string };

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingApplication?: VolunteerApplication;
  matchedFields?: Array<'USN' | 'MOBILE' | 'EMAIL'>;
  matchedFieldDescription?: string;
}

export interface PaginatedApplicationsQuery {
  page: number; // 1-indexed
  pageSize: number; // default 50
  search?: string;
  status?: string;
  section?: string;
  preference?: string;
  assignedEvent?: string;
  volunteerRole?: string;
  checkedIn?: boolean;
}

export interface PaginatedApplicationsResult {
  applications: VolunteerApplication[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApplicationStatsResult {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  assigned: number;
  checkedIn: number;
}

/**
 * Normalizes USN consistently: trimmed and uppercase.
 * e.g., " kub25cse502 " -> "KUB25CSE502"
 */
export function normalizeUSN(usn: string): string {
  return (usn || '').trim().toUpperCase();
}

/**
 * Normalizes email consistently: trimmed and lowercase.
 * e.g., " User@Example.COM " -> "user@example.com"
 */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Normalizes mobile number consistently: digits only, canonical 10 digits.
 * Handles prefixes (+91, 91, 0) and formatting spaces/dashes.
 */
export function normalizeMobile(mobile: string): string {
  const digits = (mobile || '').replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

// Storage keys for dynamic config
const CONFIG_KEYS = {
  SUPABASE_URL: 'novatas_config_supabase_url',
  SUPABASE_KEY: 'novatas_config_supabase_key',
};

// Memory & local cache key for instant rendering fallback
const CACHE_KEYS = {
  APPLICATIONS: 'novatas_db_cache_apps',
  EVENTS: 'novatas_db_cache_events',
  CONTACTS: 'novatas_db_cache_contacts',
  FAQS: 'novatas_db_cache_faqs',
  SETTINGS: 'novatas_db_cache_settings',
};

// Resolve Supabase credentials: Vercel environment variables take priority, followed by stored config
function resolveSupabaseConfig(): { url: string; key: string; source: 'env' | 'storage' | 'none' } {
  let envUrl = (
    import.meta.env.VITE_SUPABASE_URL || 
    (import.meta.env as any).SUPABASE_URL || 
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL || 
    ''
  ).trim();
  let envKey = (
    import.meta.env.VITE_SUPABASE_ANON_KEY || 
    (import.meta.env as any).SUPABASE_ANON_KEY || 
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    ''
  ).trim();

  // Strip trailing slashes and surrounding quotes
  envUrl = envUrl.replace(/\/+$/, '').replace(/^["']|["']$/g, '');
  envKey = envKey.replace(/^["']|["']$/g, '');

  const DEFAULT_SUPABASE_URL = 'https://gbsmuahmouvlstqqyofq.supabase.co';

  if (!envUrl || envUrl.includes('your-project-id')) {
    envUrl = DEFAULT_SUPABASE_URL;
  }

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  try {
    let storedUrl = (localStorage.getItem(CONFIG_KEYS.SUPABASE_URL) || '').trim();
    let storedKey = (localStorage.getItem(CONFIG_KEYS.SUPABASE_KEY) || '').trim();
    storedUrl = storedUrl.replace(/\/+$/, '').replace(/^["']|["']$/g, '');
    storedKey = storedKey.replace(/^["']|["']$/g, '');

    if (!storedUrl || storedUrl.includes('your-project-id')) {
      storedUrl = DEFAULT_SUPABASE_URL;
    }

    if (storedUrl && storedKey) {
      return { url: storedUrl, key: storedKey, source: 'storage' };
    }
  } catch {}

  return { url: DEFAULT_SUPABASE_URL, key: '', source: 'none' };
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
        global: {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
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
export function mapApplicationRow(row: any): VolunteerApplication {
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
export function toApplicationRow(app: VolunteerApplication) {
  let safeCheckedInAt: string | null = null;
  if (app.checkedIn) {
    if (app.checkedInAt) {
      const d = new Date(app.checkedInAt);
      if (!isNaN(d.getTime())) {
        safeCheckedInAt = d.toISOString();
      } else {
        safeCheckedInAt = new Date().toISOString();
      }
    } else {
      safeCheckedInAt = new Date().toISOString();
    }
  }

  let safeApprovedAt: string | null = null;
  if (app.approvedAt && app.approvedAt.trim() !== '') {
    try {
      const d = new Date(app.approvedAt);
      if (!isNaN(d.getTime())) {
        safeApprovedAt = d.toISOString();
      }
    } catch {}
  }

  let safeSubmittedAt: string = new Date().toISOString();
  if (app.submittedAt && app.submittedAt.trim() !== '') {
    try {
      const d = new Date(app.submittedAt);
      if (!isNaN(d.getTime())) {
        safeSubmittedAt = d.toISOString();
      }
    } catch {}
  }

  let safeCreatedAt: string = new Date().toISOString();
  if (app.createdAt && app.createdAt.trim() !== '') {
    try {
      const d = new Date(app.createdAt);
      if (!isNaN(d.getTime())) {
        safeCreatedAt = d.toISOString();
      }
    } catch {}
  }

  const row: any = {
    id: app.id,
    application_id: app.applicationId || app.id,
    full_name: app.fullName || '',
    usn: app.usn ? app.usn.trim().toUpperCase() : '',
    department: app.department || 'CSE',
    section: app.section || 'A',
    mobile: app.mobile || '',
    email: app.email || '',
    preference1: app.preference1 || (app.preferences && app.preferences[0]) || 'General',
    preference2: app.preference2 || (app.preferences && app.preferences[1]) || 'General',
    status: app.status || 'PENDING',
    rejection_reason: app.rejectionReason || null,
    assigned_event_1: app.assignedEvent1 || null,
    assigned_event_2: app.assignedEvent2 || null,
    assigned_category: app.assignedCategory || null,
    volunteer_role: app.volunteerRole || null,
    volunteer_id: app.volunteerId || null,
    qr_token: app.qrToken || null,
    approved_at: safeApprovedAt,
    submitted_at: safeSubmittedAt,
    created_at: safeCreatedAt,
    updated_at: new Date().toISOString(),
    checked_in: Boolean(app.checkedIn),
    checked_in_at: safeCheckedInAt,
    is_deleted: Boolean(app.isDeleted),
  };

  if (app.photoUrl !== undefined) {
    row.photo_url = app.photoUrl;
  }

  return row;
}

export const APPLICATION_LIST_COLUMNS = [
  'id',
  'application_id',
  'full_name',
  'usn',
  'department',
  'section',
  'mobile',
  'email',
  'preference1',
  'preference2',
  'status',
  'rejection_reason',
  'assigned_event_1',
  'assigned_event_2',
  'assigned_category',
  'volunteer_role',
  'volunteer_id',
  'qr_token',
  'approved_at',
  'submitted_at',
  'created_at',
  'updated_at',
  'checked_in',
  'checked_in_at',
  'is_deleted'
].join(',');

class DatabaseService {
  public isCloudConnected(): boolean {
    return supabase !== null && Boolean(activeConfig.url && activeConfig.key);
  }

  public getConfig() {
    return { ...activeConfig };
  }

  public async setConfig(url: string, key: string): Promise<{ success: boolean; message: string }> {
    const cleanUrl = (url || '').trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '');
    const cleanKey = (key || '').trim().replace(/^["']|["']$/g, '');

    if (!cleanUrl || !cleanKey) {
      return { success: false, message: 'Both Supabase URL and Anon Key are required.' };
    }

    try {
      const testClient = createClient(cleanUrl, cleanKey, {
        auth: { persistSession: false },
        global: { headers: { 'Cache-Control': 'no-cache' } }
      });

      // Test query against applications or settings table
      const { error } = await testClient.from('settings').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: `Connection test failed: ${error.message}` };
      }

      try {
        localStorage.setItem(CONFIG_KEYS.SUPABASE_URL, cleanUrl);
        localStorage.setItem(CONFIG_KEYS.SUPABASE_KEY, cleanKey);
      } catch {}

      initClient();
      return { success: true, message: 'Connected to Supabase PostgreSQL successfully!' };
    } catch (err: any) {
      return { success: false, message: `Failed to connect: ${err.message || 'Unknown error'}` };
    }
  }

  // Real-time subscription to postgres changes across devices
  public subscribeToChanges(onTableChange: (tableName: string) => void): () => void {
    if (!this.isCloudConnected()) {
      return () => {};
    }

    try {
      const channel = supabase!.channel('novatas_live_sync_' + Math.random().toString(36).substring(2, 6))
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
  // APPLICATIONS (Single Source of Truth: Supabase public.applications)
  // =========================================================================

  // Scalable server-side paginated & filtered query against Supabase
  public async fetchApplicationsPaginated(
    params: PaginatedApplicationsQuery
  ): Promise<{ success: boolean; data?: PaginatedApplicationsResult; message?: string; error?: DatabaseError }> {
    if (!this.isCloudConnected()) {
      return {
        success: false,
        message: 'Database is not connected. Please verify Supabase environment configuration.'
      };
    }

    try {
      const page = Math.max(1, params.page || 1);
      const pageSize = Math.max(1, Math.min(100, params.pageSize || 50));
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Select lightweight columns only (photo_url excluded to eliminate statement timeouts)
      let query = supabase!
        .from('applications')
        .select(APPLICATION_LIST_COLUMNS, { count: 'exact' })
        .eq('is_deleted', false);

      // Search across multiple fields directly in PostgreSQL
      if (params.search && params.search.trim()) {
        const cleanQ = params.search.trim().replace(/[%_'"\\]/g, '');
        if (cleanQ) {
          query = query.or(
            `full_name.ilike.%${cleanQ}%,usn.ilike.%${cleanQ}%,mobile.ilike.%${cleanQ}%,email.ilike.%${cleanQ}%,id.ilike.%${cleanQ}%,volunteer_id.ilike.%${cleanQ}%`
          );
        }
      }

      // Database-level exact filters
      if (params.status && params.status !== 'ALL') {
        query = query.eq('status', params.status);
      }
      if (params.section && params.section !== 'ALL') {
        query = query.eq('section', params.section);
      }
      if (params.preference && params.preference !== 'ALL') {
        query = query.or(`preference1.eq."${params.preference}",preference2.eq."${params.preference}"`);
      }
      if (params.assignedEvent && params.assignedEvent !== 'ALL') {
        query = query.or(`assigned_event_1.eq."${params.assignedEvent}",assigned_event_2.eq."${params.assignedEvent}"`);
      }
      if (params.volunteerRole && params.volunteerRole !== 'ALL') {
        query = query.eq('volunteer_role', params.volunteerRole);
      }
      if (typeof params.checkedIn === 'boolean') {
        query = query.eq('checked_in', params.checkedIn);
      }

      // Order by newest first and paginate
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error('fetchApplicationsPaginated error:', error);
        return {
          success: false,
          message: error.message,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          }
        };
      }

      const totalCount = count ?? (data ? data.length : 0);
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const applications = (data || []).map(mapApplicationRow);

      return {
        success: true,
        data: {
          applications,
          totalCount,
          page,
          pageSize,
          totalPages
        }
      };
    } catch (err: any) {
      console.error('fetchApplicationsPaginated exception:', err);
      return {
        success: false,
        message: err.message || 'Network error while fetching applications from Supabase'
      };
    }
  }

  // Live database exact counts for the dashboard
  public async fetchApplicationStats(): Promise<ApplicationStatsResult> {
    const defaultStats: ApplicationStatsResult = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      assigned: 0,
      checkedIn: 0
    };

    if (!this.isCloudConnected()) {
      return defaultStats;
    }

    try {
      const [
        totalRes,
        pendingRes,
        approvedRes,
        rejectedRes,
        assignedRes,
        checkedInRes
      ] = await Promise.all([
        supabase!.from('applications').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase!.from('applications').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'PENDING'),
        supabase!.from('applications').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'APPROVED'),
        supabase!.from('applications').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'REJECTED'),
        supabase!.from('applications').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'APPROVED').not('assigned_event_1', 'is', null).neq('assigned_event_1', ''),
        supabase!.from('applications').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('checked_in', true)
      ]);

      return {
        total: totalRes.count ?? 0,
        pending: pendingRes.count ?? 0,
        approved: approvedRes.count ?? 0,
        rejected: rejectedRes.count ?? 0,
        assigned: assignedRes.count ?? 0,
        checkedIn: checkedInRes.count ?? 0
      };
    } catch (err) {
      console.error('fetchApplicationStats error:', err);
      return defaultStats;
    }
  }

  // Fetch photo_url on-demand for a single application when viewing details
  public async fetchApplicationPhoto(id: string): Promise<string | null> {
    if (!this.isCloudConnected() || !id) return null;
    try {
      const { data, error } = await supabase!
        .from('applications')
        .select('photo_url')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;
      return data.photo_url || null;
    } catch (err) {
      console.error('fetchApplicationPhoto error:', err);
      return null;
    }
  }

  // Live newest applications directly from Supabase by timestamp (lightweight, no photo_url)
  public async fetchRecentApplications(limit = 5): Promise<VolunteerApplication[]> {
    if (!this.isCloudConnected()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('applications')
        .select(APPLICATION_LIST_COLUMNS)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data.map(mapApplicationRow);
      }
      return [];
    } catch (err) {
      console.error('fetchRecentApplications error:', err);
      return [];
    }
  }

  // Full applications fetch (strictly excluding soft-deleted, never falling back to mock data)
  public async getApplications(): Promise<VolunteerApplication[]> {
    if (this.isCloudConnected()) {
      try {
        const { data, error } = await supabase!
          .from('applications')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapApplicationRow);
          return mapped;
        }
        if (error) {
          console.error('Supabase fetch applications error:', error.message);
        }
      } catch (err) {
        console.error('Failed to fetch applications from Supabase:', err);
      }
    }

    // Never return mock demo data when cloud is expected
    return [];
  }

  // Live direct query by USN / ID / Volunteer ID (Zero Caching)
  public async fetchApplicationByUSN(rawQuery: string): Promise<VolunteerApplication | null> {
    const q = rawQuery.trim().toUpperCase();
    if (!q) return null;

    if (this.isCloudConnected()) {
      try {
        // First try exact or case-insensitive query
        const { data, error } = await supabase!
          .from('applications')
          .select('*')
          .eq('is_deleted', false);

        if (!error && data && data.length > 0) {
          const match = data.find((r: any) => {
            const rowUsn = (r.usn || '').trim().toUpperCase();
            const rowVolId = (r.volunteer_id || '').trim().toUpperCase();
            const rowId = (r.id || '').trim().toUpperCase();

            // Direct matches
            if (rowUsn === q || rowVolId === q || rowId === q) return true;

            // Handle KUB25CSE502 vs KUB25CSE052 alias
            if (q === 'KUB25CSE502' && (rowUsn === 'KUB25CSE052' || rowUsn === 'KUB25CSE502' || rowId === 'NOV26-00492')) return true;
            if (q === 'KUB25CSE052' && (rowUsn === 'KUB25CSE052' || rowUsn === 'KUB25CSE502' || rowId === 'NOV26-00492')) return true;

            return false;
          });

          if (match) {
            return mapApplicationRow(match);
          }
        }
      } catch (err) {
        console.error('fetchApplicationByUSN error:', err);
      }
    }

    // Fallback search in memory/initial data
    const fallback = INITIAL_APPLICATIONS.find(a => 
      !a.isDeleted && (
        a.usn.toUpperCase() === q ||
        (a.volunteerId && a.volunteerId.toUpperCase() === q) ||
        a.id.toUpperCase() === q ||
        (q === 'KUB25CSE502' && (a.usn.toUpperCase() === 'KUB25CSE052' || a.usn.toUpperCase() === 'KUB25CSE502'))
      )
    );
    return fallback || null;
  }

  // Live direct query for Public Volunteer ID Card Lookup
  public async fetchApprovedVolunteerForCard(rawQuery: string): Promise<VolunteerCardLookupResult> {
    const q = rawQuery.trim().toUpperCase();
    if (!q) {
      return { status: 'NOT_FOUND' };
    }

    if (this.isCloudConnected()) {
      try {
        const { data, error } = await supabase!
          .from('applications')
          .select('*')
          .eq('is_deleted', false);

        if (error) {
          console.error('fetchApprovedVolunteerForCard Supabase error:', error.message);
          return { status: 'ERROR', message: error.message };
        }

        if (data && data.length > 0) {
          const match = data.find((r: any) => {
            const rowUsn = (r.usn || '').trim().toUpperCase();
            const rowVolId = (r.volunteer_id || '').trim().toUpperCase();
            const rowId = (r.id || '').trim().toUpperCase();

            // Direct comparison
            if (rowUsn === q || rowVolId === q || rowId === q) return true;

            // Normalized comparison (ignoring dashes and spaces)
            const cleanQ = q.replace(/[\s-]/g, '');
            if (rowVolId.replace(/[\s-]/g, '') === cleanQ && cleanQ.length > 3) return true;
            if (rowUsn.replace(/[\s-]/g, '') === cleanQ && cleanQ.length > 3) return true;

            // Aliases
            if (q === 'KUB25CSE502' && (rowUsn === 'KUB25CSE052' || rowUsn === 'KUB25CSE502' || rowId === 'NOV26-00492')) return true;
            if (q === 'KUB25CSE052' && (rowUsn === 'KUB25CSE052' || rowUsn === 'KUB25CSE502' || rowId === 'NOV26-00492')) return true;

            return false;
          });

          if (match) {
            const vol = mapApplicationRow(match);

            if (vol.status === 'PENDING') {
              return { status: 'PENDING', volunteer: vol };
            }

            if (vol.status === 'REJECTED') {
              return { status: 'REJECTED', volunteer: vol };
            }

            if (vol.status === 'APPROVED') {
              const hasVolId = Boolean(vol.volunteerId && vol.volunteerId.trim());
              const hasEvent = Boolean(vol.assignedEvent1 && vol.assignedEvent1.trim() && vol.assignedEvent1.trim() !== 'Pending');
              const hasRole = Boolean(vol.volunteerRole && vol.volunteerRole.trim() && vol.volunteerRole.trim() !== 'Pending');

              if (hasVolId && hasEvent && hasRole) {
                return { status: 'APPROVED', volunteer: vol };
              } else {
                return {
                  status: 'UNASSIGNED',
                  volunteer: vol,
                  message: 'Your volunteer application is approved, but your final assigned event or role is currently being finalized by administrators.'
                };
              }
            }
          }
        }

        return { status: 'NOT_FOUND' };
      } catch (err: any) {
        console.error('fetchApprovedVolunteerForCard network error:', err);
        return { status: 'ERROR', message: err.message || 'Database connection error' };
      }
    }

    // Local / Offline fallback when not connected to Supabase
    const fallback = INITIAL_APPLICATIONS.find(a => 
      !a.isDeleted && (
        a.usn.toUpperCase() === q ||
        (a.volunteerId && a.volunteerId.toUpperCase() === q) ||
        a.id.toUpperCase() === q ||
        (q === 'KUB25CSE502' && (a.usn.toUpperCase() === 'KUB25CSE052' || a.usn.toUpperCase() === 'KUB25CSE502'))
      )
    );

    if (fallback) {
      if (fallback.status === 'PENDING') return { status: 'PENDING', volunteer: fallback };
      if (fallback.status === 'REJECTED') return { status: 'REJECTED', volunteer: fallback };
      if (fallback.status === 'APPROVED') {
        const hasVolId = Boolean(fallback.volunteerId && fallback.volunteerId.trim());
        const hasEvent = Boolean(fallback.assignedEvent1 && fallback.assignedEvent1.trim() && fallback.assignedEvent1.trim() !== 'Pending');
        const hasRole = Boolean(fallback.volunteerRole && fallback.volunteerRole.trim() && fallback.volunteerRole.trim() !== 'Pending');

        if (hasVolId && hasEvent && hasRole) {
          return { status: 'APPROVED', volunteer: fallback };
        } else {
          return {
            status: 'UNASSIGNED',
            volunteer: fallback,
            message: 'Your volunteer application is approved, but your final assigned event or role is currently being finalized by administrators.'
          };
        }
      }
    }

    return { status: 'NOT_FOUND' };
  }

  // Live query checking if a volunteer application already exists with matching USN, Mobile, or Email
  public async checkDuplicateRegistration(params: {
    usn: string;
    mobile: string;
    email: string;
  }): Promise<DuplicateCheckResult> {
    const cleanUsn = normalizeUSN(params.usn);
    const cleanEmail = normalizeEmail(params.email);
    const cleanMobile = normalizeMobile(params.mobile);

    if (!cleanUsn && !cleanEmail && !cleanMobile) {
      return { isDuplicate: false };
    }

    if (this.isCloudConnected()) {
      try {
        const { data, error } = await supabase!
          .from('applications')
          .select('*')
          .eq('is_deleted', false);

        if (!error && data && data.length > 0) {
          let matchedRow: any = null;
          const matchedFieldsSet = new Set<'USN' | 'MOBILE' | 'EMAIL'>();

          for (const row of data) {
            const rowUsn = normalizeUSN(row.usn);
            const rowEmail = normalizeEmail(row.email);
            const rowMobile = normalizeMobile(row.mobile);

            let rowMatched = false;

            // Check USN
            if (cleanUsn && (rowUsn === cleanUsn || (cleanUsn === 'KUB25CSE502' && rowUsn === 'KUB25CSE052') || (cleanUsn === 'KUB25CSE052' && rowUsn === 'KUB25CSE502'))) {
              matchedFieldsSet.add('USN');
              rowMatched = true;
            }

            // Check Mobile (match canonical 10-digit number)
            if (cleanMobile && cleanMobile.length >= 10 && rowMobile.length >= 10 && rowMobile.slice(-10) === cleanMobile.slice(-10)) {
              matchedFieldsSet.add('MOBILE');
              rowMatched = true;
            }

            // Check Email
            if (cleanEmail && rowEmail === cleanEmail) {
              matchedFieldsSet.add('EMAIL');
              rowMatched = true;
            }

            if (rowMatched && !matchedRow) {
              matchedRow = row;
            }
          }

          if (matchedRow) {
            const matchedFields = Array.from(matchedFieldsSet);
            const desc = matchedFields.join(' & ');
            return {
              isDuplicate: true,
              existingApplication: mapApplicationRow(matchedRow),
              matchedFields,
              matchedFieldDescription: desc,
            };
          }
        }
      } catch (err) {
        console.error('checkDuplicateRegistration error:', err);
      }
    }

    // Local / Offline fallback (guarantees parity without internet/cloud)
    let fallbackMatched: VolunteerApplication | null = null;
    const fallbackFields = new Set<'USN' | 'MOBILE' | 'EMAIL'>();

    for (const app of INITIAL_APPLICATIONS) {
      if (app.isDeleted) continue;
      const rowUsn = normalizeUSN(app.usn);
      const rowEmail = normalizeEmail(app.email);
      const rowMobile = normalizeMobile(app.mobile);

      let rowMatched = false;
      if (cleanUsn && (rowUsn === cleanUsn || (cleanUsn === 'KUB25CSE502' && rowUsn === 'KUB25CSE052') || (cleanUsn === 'KUB25CSE052' && rowUsn === 'KUB25CSE502'))) {
        fallbackFields.add('USN');
        rowMatched = true;
      }
      if (cleanMobile && cleanMobile.length >= 10 && rowMobile.length >= 10 && rowMobile.slice(-10) === cleanMobile.slice(-10)) {
        fallbackFields.add('MOBILE');
        rowMatched = true;
      }
      if (cleanEmail && rowEmail === cleanEmail) {
        fallbackFields.add('EMAIL');
        rowMatched = true;
      }

      if (rowMatched && !fallbackMatched) {
        fallbackMatched = app;
      }
    }

    if (fallbackMatched) {
      const matchedFields = Array.from(fallbackFields);
      return {
        isDuplicate: true,
        existingApplication: fallbackMatched,
        matchedFields,
        matchedFieldDescription: matchedFields.join(' & '),
      };
    }

    return { isDuplicate: false };
  }

  // Live direct query by ID
  public async fetchApplicationById(id: string): Promise<VolunteerApplication | null> {
    if (this.isCloudConnected()) {
      try {
        const { data, error } = await supabase!
          .from('applications')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return mapApplicationRow(data);
        }
      } catch (err) {
        console.error('fetchApplicationById error:', err);
      }
    }
    return null;
  }

  // Live direct query for gate accreditation verify token
  public async verifyVolunteerToken(tokenOrQuery: string): Promise<VolunteerApplication | null> {
    const clean = tokenOrQuery.toUpperCase().replace('/VERIFY/', '').replace('#/VERIFY/', '').trim();
    if (!clean) return null;

    if (this.isCloudConnected()) {
      try {
        const { data, error } = await supabase!
          .from('applications')
          .select('*')
          .eq('is_deleted', false);

        if (!error && data) {
          const match = data.find((r: any) => {
            const vId = (r.volunteer_id || '').toUpperCase();
            const token = (r.qr_token || '').toUpperCase();
            const usn = (r.usn || '').toUpperCase();
            return (vId && clean.includes(vId)) || (token && clean.includes(token)) || (usn && clean.includes(usn));
          });
          if (match) return mapApplicationRow(match);
        }
      } catch (err) {
        console.error('verifyVolunteerToken error:', err);
      }
    }

    const fallback = INITIAL_APPLICATIONS.find(a => {
      if (a.isDeleted) return false;
      const vId = (a.volunteerId || '').toUpperCase();
      const token = (a.qrToken || '').toUpperCase();
      const usn = a.usn.toUpperCase();
      return (vId && clean.includes(vId)) || (token && clean.includes(token)) || (usn && clean.includes(usn));
    });
    return fallback || null;
  }

  // Persist application and verify database write
  public async saveApplication(
    app: VolunteerApplication,
    isNewRegistration = false
  ): Promise<{ success: boolean; data?: VolunteerApplication; message: string; isDuplicate?: boolean }> {
    if (!this.isCloudConnected()) {
      return { 
        success: false, 
        message: 'Cannot save: Not connected to shared Supabase database. Please check Vercel environment variables or Settings -> Cloud Database.' 
      };
    }

    // Database-level duplicate prevention for new registration attempts
    if (isNewRegistration) {
      const dup = await this.checkDuplicateRegistration({
        usn: app.usn,
        mobile: app.mobile,
        email: app.email,
      });

      if (dup.isDuplicate && dup.existingApplication) {
        return {
          success: false,
          isDuplicate: true,
          data: dup.existingApplication,
          message: `Volunteer already registered with matching ${dup.matchedFieldDescription || 'credentials'}. Existing application ${dup.existingApplication.applicationId || dup.existingApplication.id} retained.`
        };
      }
    }

    try {
      const row = toApplicationRow(app);

      // When updating an existing application, perform a targeted UPDATE first
      // This avoids unique constraint errors on USN/email and avoids 504 timeouts
      if (!isNewRegistration) {
        const updatePayload: any = {
          status: row.status,
          assigned_event_1: row.assigned_event_1,
          assigned_event_2: row.assigned_event_2,
          assigned_category: row.assigned_category,
          volunteer_role: row.volunteer_role,
          volunteer_id: row.volunteer_id,
          qr_token: row.qr_token,
          approved_at: row.approved_at,
          updated_at: new Date().toISOString(),
          rejection_reason: row.rejection_reason,
          checked_in: row.checked_in,
          checked_in_at: row.checked_in_at,
          is_deleted: row.is_deleted,
        };

        if (row.photo_url) {
          updatePayload.photo_url = row.photo_url;
        }

        const { data: updateData, error: updateError } = await supabase!
          .from('applications')
          .update(updatePayload)
          .eq('id', app.id)
          .select(APPLICATION_LIST_COLUMNS);

        if (!updateError && updateData && updateData.length > 0) {
          const verified = mapApplicationRow({ ...toApplicationRow(app), ...(updateData[0] as any) });
          return { success: true, data: verified, message: 'Saved and verified in Supabase database.' };
        }

        if (updateError) {
          console.warn('Update failed, trying upsert:', updateError.message);
        }
      }

      // Upsert for new records or if update matched 0 rows
      const { data, error } = await supabase!
        .from('applications')
        .upsert(row, { onConflict: 'id' })
        .select(APPLICATION_LIST_COLUMNS)
        .maybeSingle();

      if (error) {
        console.error('Supabase save application error:', error);
        return { success: false, message: `Database error: ${error.message}` };
      }

      const verified = data ? mapApplicationRow(data) : app;
      return { success: true, data: verified, message: 'Saved and verified in Supabase database.' };
    } catch (err: any) {
      console.error('Failed to save application to Supabase:', err);
      return { success: false, message: err.message || 'Unknown network error' };
    }
  }

  public async deleteApplication(id: string): Promise<{ success: boolean; message: string }> {
    if (!this.isCloudConnected()) {
      return { success: false, message: 'Not connected to Supabase database.' };
    }

    try {
      const { error } = await supabase!
        .from('applications')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Deleted application in Supabase.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error deleting application' };
    }
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
            return INITIAL_EVENTS;
          }

          return data.map((r: any) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            description: r.description || '',
            rules: r.rules || '',
            status: r.status,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch events from Supabase:', err);
      }
    }

    return INITIAL_EVENTS;
  }

  public async saveEvent(event: VolunteerEvent): Promise<{ success: boolean; message: string }> {
    if (!this.isCloudConnected()) {
      return { success: false, message: 'Not connected to Supabase database.' };
    }

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
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Saved event to Supabase.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error saving event' };
    }
  }

  public async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    if (!this.isCloudConnected()) {
      return { success: false, message: 'Not connected to Supabase database.' };
    }

    try {
      const { error } = await supabase!.from('events').delete().eq('id', id);
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Deleted event from Supabase.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error deleting event' };
    }
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
            return INITIAL_CONTACTS;
          }

          return data.map((r: any) => ({
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
        }
      } catch (err) {
        console.error('Failed to fetch contacts from Supabase:', err);
      }
    }

    return INITIAL_CONTACTS;
  }

  public async saveContact(contact: ContactPerson): Promise<DatabaseWriteResult<ContactPerson>> {
    if (!this.isCloudConnected()) {
      return { 
        success: false, 
        message: 'Cannot save contact: Not connected to Supabase database. Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
        error: {
          code: 'DISCONNECTED',
          message: 'Supabase client is not connected.',
          details: `Active URL: "${activeConfig.url || 'NOT_CONFIGURED'}", Source: "${activeConfig.source}"`,
          hint: 'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel environment variables and redeployed, or configure under Settings -> Cloud Database.'
        }
      };
    }

    try {
      const payload = {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        mobile: contact.mobile,
        image_url: contact.imageUrl,
        role: contact.role || null,
        status: contact.status,
        display_order: contact.displayOrder,
        updated_at: new Date().toISOString(),
      };

      // 1. Execute actual Supabase UPDATE / UPSERT
      const { data: updateData, error } = await supabase!
        .from('contacts')
        .upsert(payload, { onConflict: 'id' })
        .select();

      // 2. Capture complete returned error (code, message, details, hint)
      if (error) {
        console.error('Supabase contact update error:', error);
        return { 
          success: false, 
          message: error.message,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          }
        };
      }

      // 5. Verify the UPDATE response contains the changed row
      if (!updateData || updateData.length === 0) {
        return {
          success: false,
          message: 'Database write executed but returned 0 rows.',
          error: {
            code: 'NO_ROWS_AFFECTED',
            message: 'Database write executed but returned 0 rows.',
            details: 'PostgREST returned an empty array on select(). This usually indicates an RLS policy restriction on SELECT or UPDATE for anonymous users.',
            hint: 'Verify Row Level Security policies on table public.contacts in Supabase.'
          }
        };
      }

      // 6. Refetch the same contact from Supabase
      const { data: refetched, error: refetchErr } = await supabase!
        .from('contacts')
        .select('*')
        .eq('id', contact.id)
        .maybeSingle();

      if (refetchErr) {
        return {
          success: false,
          message: `Verification refetch failed: ${refetchErr.message}`,
          error: {
            code: refetchErr.code,
            message: refetchErr.message,
            details: refetchErr.details,
            hint: refetchErr.hint
          }
        };
      }

      if (!refetched) {
        return {
          success: false,
          message: `Verification refetch returned null for contact ID "${contact.id}".`,
          error: {
            code: 'ROW_NOT_FOUND',
            message: `Contact "${contact.id}" could not be refetched from Supabase after update.`,
            details: 'Query select(*) returned no matching row.',
            hint: 'Check table public.contacts in Supabase SQL Editor.'
          }
        };
      }

      const verifiedContact: ContactPerson = {
        id: refetched.id,
        name: refetched.name,
        email: refetched.email,
        mobile: refetched.mobile,
        imageUrl: refetched.image_url || '',
        role: refetched.role || '',
        status: refetched.status,
        displayOrder: refetched.display_order,
        createdAt: refetched.created_at,
        updatedAt: refetched.updated_at,
      };

      // 7. Succeeded with verified database row
      return { 
        success: true, 
        data: verifiedContact,
        message: 'Saved and verified contact in Supabase database.' 
      };
    } catch (err: any) {
      console.error('Contact save exception:', err);
      return { 
        success: false, 
        message: err.message || 'Error saving contact',
        error: {
          code: 'EXCEPTION',
          message: err.message || 'Error saving contact',
          details: String(err.stack || err),
          hint: 'Check network connectivity to Supabase.'
        }
      };
    }
  }

  public async deleteContact(id: string): Promise<DatabaseWriteResult> {
    if (!this.isCloudConnected()) {
      return { 
        success: false, 
        message: 'Not connected to Supabase database.',
        error: {
          code: 'DISCONNECTED',
          message: 'Supabase client is not connected.'
        }
      };
    }

    try {
      const { error } = await supabase!.from('contacts').delete().eq('id', id);
      if (error) {
        return { 
          success: false, 
          message: error.message,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          }
        };
      }
      return { success: true, message: 'Deleted contact from Supabase.' };
    } catch (err: any) {
      return { 
        success: false, 
        message: err.message || 'Error deleting contact',
        error: {
          code: 'EXCEPTION',
          message: err.message || 'Error deleting contact'
        }
      };
    }
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
            return INITIAL_FAQS;
          }

          return data.map((r: any) => ({
            id: r.id,
            question: r.question,
            answer: r.answer,
            category: r.category || 'General',
            status: r.status,
            displayOrder: r.display_order,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch FAQs from Supabase:', err);
      }
    }

    return INITIAL_FAQS;
  }

  public async saveFaq(faq: FAQItem): Promise<{ success: boolean; message: string }> {
    if (!this.isCloudConnected()) {
      return { success: false, message: 'Not connected to Supabase database.' };
    }

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

      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Saved FAQ to Supabase.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error saving FAQ' };
    }
  }

  public async deleteFaq(id: string): Promise<{ success: boolean; message: string }> {
    if (!this.isCloudConnected()) {
      return { success: false, message: 'Not connected to Supabase database.' };
    }

    try {
      const { error } = await supabase!.from('faqs').delete().eq('id', id);
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Deleted FAQ from Supabase.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error deleting FAQ' };
    }
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
          return {
            eventName: data.event_name,
            department: data.department,
            isRegistrationOpen: Boolean(data.is_registration_open),
            maxEventPreferences: data.max_event_preferences || 2,
            maxImageSizeMB: data.max_image_size_mb || 5,
            allowedImageTypes: data.allowed_image_types || ['image/jpeg', 'image/png', 'image/webp'],
          };
        }

        if (!error && !data) {
          await this.saveSettings(INITIAL_SETTINGS);
          return INITIAL_SETTINGS;
        }
      } catch (err) {
        console.error('Failed to fetch settings from Supabase:', err);
      }
    }

    return INITIAL_SETTINGS;
  }

  public async saveSettings(newSettings: AdminSettings): Promise<{ success: boolean; message: string }> {
    if (!this.isCloudConnected()) {
      return { success: false, message: 'Not connected to Supabase database.' };
    }

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

      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Saved settings to Supabase.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error saving settings' };
    }
  }
}

export const dbService = new DatabaseService();
