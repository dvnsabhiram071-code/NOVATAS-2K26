export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type EventCategory = 'SPORTS' | 'CULTURAL' | 'MEDIA / CREATIVE';

export interface VolunteerEvent {
  id: string;
  name: string;
  category: EventCategory;
  description: string;
  rules: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface VolunteerApplication {
  id: string; // e.g. "NOV26-00482"
  applicationId?: string; // alias e.g. "NOV26-00482"
  fullName: string;
  usn: string;
  department: string; // default "CSE"
  section: string; // "A" | "B" | "C" | "D" | "E" | "F" | "OTHER"
  mobile: string;
  email: string;
  photoUrl: string; // Data URL or URL
  
  // Volunteer Preferences (Exactly 2, NOT final assignments)
  preference1?: string;
  preference2?: string;
  preferences: [string, string]; // e.g. ["Ramp Walk", "Chess"]
  
  // Application Status
  status: ApplicationStatus;
  rejectionReason?: string;
  
  // Admin Final Assignment (Nullable until admin assigned)
  assignedEventId?: string;
  assignedEvent1?: string; // Final Assigned Event chosen by admin
  assignedEvent2?: string;
  assignedCategory?: string;
  volunteerRole?: string; // Final Volunteer Role chosen by admin
  
  // Official Volunteer Identity (Generated ONLY upon Admin Approval)
  volunteerId?: string; // e.g. "NVT26-V00492"
  qrToken?: string; // Secure token for verification URL: /verify/{volunteerId}-{qrToken}
  approvedAt?: string;
  
  // Timestamps & Audit
  submittedAt: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Check-in
  checkedIn: boolean;
  checkedInAt?: string;
  isDeleted?: boolean; // Soft delete
}

export interface ContactPerson {
  id: string;
  name: string;
  email: string;
  mobile: string;
  imageUrl: string;
  role?: string; // e.g. "Chief Student Organizer", "Event Coordinator"
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string; // e.g. "Registration", "Preferences", "Badges & QR", "General"
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSettings {
  eventName: string;
  department: string;
  isRegistrationOpen: boolean;
  maxEventPreferences: number;
  maxImageSizeMB: number;
  allowedImageTypes: string[];
}

export type AdminTab = 
  | 'dashboard' 
  | 'applications' 
  | 'volunteers' 
  | 'events' 
  | 'assignments' 
  | 'contacts' 
  | 'faqs'
  | 'qr-checkin' 
  | 'exports' 
  | 'settings';

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  password_hash: string; // bcrypt hash only
  role: AdminRole;
  must_change_password: boolean;
  is_active: boolean;
  last_login_at?: string;
  password_changed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id?: string;
  timestamp: string;
  details?: string;
}

export interface AdminSession {
  token: string;
  adminId: string;
  email: string;
  name: string;
  role: AdminRole;
  must_change_password: boolean;
  expiresAt: number;
}
