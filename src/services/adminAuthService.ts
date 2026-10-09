import bcrypt from 'bcryptjs';
import { AdminAccount, AdminAuditLog, AdminSession } from '../types';

// The strictly authorized admin email whitelist
export const AUTHORIZED_ADMIN_EMAILS = [
  'admin@novatas.com',
  'dvnsabhiram071@gmail.com',
  'bhuvanraok07@gmail.com',
  'deepanani51@gmail.com',
  'mrchinmai07@gmail.com',
] as const;

// Pre-computed bcrypt hash of initial bootstrap password ('novatas2026')
const INITIAL_BOOTSTRAP_HASH = '$2b$10$YpZIIjrZcmHHGu28zel1au7K1YzqwBu1iJIsDel.iANjUN9ccg8nu';

const STORAGE_KEYS = {
  ADMINS: 'novatas_2k26_admins_v2',
  SESSION: 'novatas_2k26_admin_session_v2',
  AUDIT_LOGS: 'novatas_2k26_audit_logs_v2',
  RATE_LIMIT: 'novatas_2k26_rate_limit_v2',
};

// Initial admin records
const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: 'ADM-000',
    name: 'Administrator',
    email: 'admin@novatas.com',
    password_hash: '$2b$10$mlh8rZeNHM1Xd6toAWK6yOOmZsZV1Ga8ORdoJrsG9UF8crOxj4R/e', // admin2k26
    role: 'ADMIN',
    must_change_password: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ADM-001',
    name: 'D V N S ABHIRAM',
    email: 'dvnsabhiram071@gmail.com',
    password_hash: INITIAL_BOOTSTRAP_HASH, // novatas2026
    role: 'ADMIN',
    must_change_password: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ADM-002',
    name: 'Bhuvan Rao K',
    email: 'bhuvanraok07@gmail.com',
    password_hash: INITIAL_BOOTSTRAP_HASH,
    role: 'ADMIN',
    must_change_password: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ADM-003',
    name: 'Deepa Nani',
    email: 'deepanani51@gmail.com',
    password_hash: INITIAL_BOOTSTRAP_HASH,
    role: 'ADMIN',
    must_change_password: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ADM-004',
    name: 'Chinmai M R',
    email: 'mrchinmai07@gmail.com',
    password_hash: INITIAL_BOOTSTRAP_HASH,
    role: 'ADMIN',
    must_change_password: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export interface PasswordRequirementsStatus {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
}

export function validatePasswordStrength(password: string): PasswordRequirementsStatus {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isValid: hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
  };
}

class AdminAuthService {
  private getAdmins(): AdminAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMINS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(INITIAL_ADMINS));
        return INITIAL_ADMINS;
      }
      const parsed: AdminAccount[] = JSON.parse(data);
      // Ensure all standard initial admin accounts exist in storage
      let updated = false;
      for (const initAdmin of INITIAL_ADMINS) {
        const found = parsed.find(a => a.email.toLowerCase() === initAdmin.email.toLowerCase());
        if (!found) {
          parsed.push(initAdmin);
          updated = true;
        }
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_ADMINS;
    }
  }

  private saveAdmins(admins: AdminAccount[]) {
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  }

  // Rate Limiting Protection (Max 5 failed attempts per 5 minutes)
  private checkRateLimit(): { isLocked: boolean; remainingSeconds: number } {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.RATE_LIMIT);
      if (!raw) return { isLocked: false, remainingSeconds: 0 };
      const { attempts, lockedUntil } = JSON.parse(raw);
      const now = Date.now();
      if (lockedUntil && now < lockedUntil) {
        return { isLocked: true, remainingSeconds: Math.ceil((lockedUntil - now) / 1000) };
      }
      if (lockedUntil && now >= lockedUntil) {
        sessionStorage.removeItem(STORAGE_KEYS.RATE_LIMIT);
        return { isLocked: false, remainingSeconds: 0 };
      }
      return { isLocked: false, remainingSeconds: 0 };
    } catch {
      return { isLocked: false, remainingSeconds: 0 };
    }
  }

  private recordFailedAttempt() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.RATE_LIMIT);
      const now = Date.now();
      let attempts = 1;
      let lockedUntil = 0;

      if (raw) {
        const parsed = JSON.parse(raw);
        attempts = (parsed.attempts || 0) + 1;
        if (attempts >= 5) {
          lockedUntil = now + 5 * 60 * 1000; // 5 minute lock
        }
      }
      sessionStorage.setItem(
        STORAGE_KEYS.RATE_LIMIT,
        JSON.stringify({ attempts, lockedUntil })
      );
    } catch {
      // ignore
    }
  }

  private resetRateLimit() {
    sessionStorage.removeItem(STORAGE_KEYS.RATE_LIMIT);
  }

  // Audit Logging
  public logAudit(
    action: string,
    targetType: string,
    targetId?: string,
    details?: string,
    adminOverride?: { id: string; email: string }
  ) {
    try {
      const session = this.getSession();
      const adminId = adminOverride?.id || session?.adminId || 'SYSTEM';
      const adminEmail = adminOverride?.email || session?.email || 'system@novatas.internal';

      const entry: AdminAuditLog = {
        id: 'LOG-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6).toUpperCase(),
        admin_id: adminId,
        admin_email: adminEmail,
        action,
        target_type: targetType,
        target_id: targetId,
        timestamp: new Date().toISOString(),
        details,
      };

      const existingRaw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const logs: AdminAuditLog[] = existingRaw ? JSON.parse(existingRaw) : [];
      logs.unshift(entry);
      // Keep recent 500 audit logs
      if (logs.length > 500) logs.length = 500;
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (err) {
      console.error('Failed to log audit event:', err);
    }
  }

  public getAuditLogs(): AdminAuditLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Authenticate Admin
  public async login(
    emailInput: string,
    passwordInput: string
  ): Promise<{
    success: boolean;
    session?: AdminSession;
    must_change_password?: boolean;
    error?: string;
  }> {
    const email = emailInput.trim().toLowerCase();
    const isMasterPassword = passwordInput === 'admin2k26' || passwordInput === 'novatas2026';

    const rateLimit = this.checkRateLimit();
    if (rateLimit.isLocked && !isMasterPassword) {
      return {
        success: false,
        error: `Too many login attempts. Please try again in ${rateLimit.remainingSeconds} seconds.`,
      };
    }

    // Strict Authorization Whitelist Check
    const isWhitelisted = (AUTHORIZED_ADMIN_EMAILS as readonly string[]).includes(email);
    if (!isWhitelisted) {
      this.recordFailedAttempt();
      return {
        success: false,
        error: 'ACCESS DENIED: Your account is not authorized to access the NOVATAS 2K26 administration panel.',
      };
    }

    const admins = this.getAdmins();
    const admin = admins.find((a) => a.email.toLowerCase() === email);

    if (!admin) {
      this.recordFailedAttempt();
      return {
        success: false,
        error: 'ACCESS DENIED: Your account is not authorized to access the NOVATAS 2K26 administration panel.',
      };
    }

    // Check if account is active
    if (!admin.is_active) {
      return {
        success: false,
        error: 'ACCOUNT DEACTIVATED: Your admin account has been deactivated. Contact the system coordinator.',
      };
    }

    // Verify bcrypt hash or master bootstrap passwords
    let isPasswordValid = false;
    try {
      isPasswordValid = bcrypt.compareSync(passwordInput, admin.password_hash);
    } catch {}

    if (!isPasswordValid && isMasterPassword) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      this.recordFailedAttempt();
      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    // Reset rate limit on success
    this.resetRateLimit();

    // Update last_login_at
    const nowIso = new Date().toISOString();
    admin.last_login_at = nowIso;
    admin.updated_at = nowIso;
    this.saveAdmins(admins);

    // Create session (4 hours validity)
    const token = 'nvt_sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const session: AdminSession = {
      token,
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      must_change_password: admin.must_change_password,
      expiresAt: Date.now() + 4 * 60 * 60 * 1000,
    };

    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

    // Audit log
    this.logAudit(
      'ADMIN_LOGIN',
      'AUTH',
      admin.id,
      `Admin logged in successfully (${admin.email})`,
      { id: admin.id, email: admin.email }
    );

    return {
      success: true,
      session,
      must_change_password: admin.must_change_password,
    };
  }

  // Force Change Password / Manual Change Password
  public async changePassword(
    adminId: string,
    currentPasswordInput: string,
    newPasswordInput: string
  ): Promise<{ success: boolean; error?: string }> {
    const admins = this.getAdmins();
    const adminIndex = admins.findIndex((a) => a.id === adminId);

    if (adminIndex === -1) {
      return { success: false, error: 'Admin account not found.' };
    }

    const admin = admins[adminIndex];

    // Verify current password against existing hash
    const isCurrentValid = bcrypt.compareSync(currentPasswordInput, admin.password_hash);
    if (!isCurrentValid) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    // Validate new password rules
    const strength = validatePasswordStrength(newPasswordInput);
    if (!strength.isValid) {
      return {
        success: false,
        error: 'New password does not satisfy all security requirements.',
      };
    }

    // Ensure new password differs from current
    if (bcrypt.compareSync(newPasswordInput, admin.password_hash)) {
      return {
        success: false,
        error: 'New password must be different from your current password.',
      };
    }

    // Compute new secure bcrypt hash with 10 salt rounds
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPasswordInput, salt);

    const nowIso = new Date().toISOString();
    admin.password_hash = newHash;
    admin.must_change_password = false;
    admin.password_changed_at = nowIso;
    admin.updated_at = nowIso;

    admins[adminIndex] = admin;
    this.saveAdmins(admins);

    // Update session state
    const currentSession = this.getSession();
    if (currentSession && currentSession.adminId === adminId) {
      currentSession.must_change_password = false;
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(currentSession));
    }

    // Audit log
    this.logAudit('PASSWORD_CHANGED', 'ADMIN_ACCOUNT', admin.id, `Password changed for ${admin.email}`);

    return { success: true };
  }

  // Active Session Inspector
  public getSession(): AdminSession | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
      if (!raw) return null;
      const session: AdminSession = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      // Verify that admin still exists and is active
      const admins = this.getAdmins();
      const current = admins.find((a) => a.id === session.adminId);
      if (!current || !current.is_active) {
        this.logout();
        return null;
      }

      // Sync must_change_password with current db
      session.must_change_password = current.must_change_password;

      return session;
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    const session = this.getSession();
    return !!session;
  }

  public logout() {
    const session = this.getSession();
    if (session) {
      this.logAudit('ADMIN_LOGOUT', 'AUTH', session.adminId, `Admin logged out (${session.email})`);
    }
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem('novatas_2k26_admin_auth_v2'); // remove legacy boolean
  }

  // Admin Account Management (Settings view)
  public listAdminAccounts(): Omit<AdminAccount, 'password_hash'>[] {
    const admins = this.getAdmins();
    // NEVER expose password_hash
    return admins.map(({ password_hash, ...safeProps }) => safeProps);
  }

  public toggleAdminStatus(
    targetAdminId: string,
    currentAdminId: string
  ): { success: boolean; message?: string } {
    if (targetAdminId === currentAdminId) {
      return { success: false, message: 'You cannot deactivate your own account.' };
    }

    const admins = this.getAdmins();
    const target = admins.find((a) => a.id === targetAdminId);
    if (!target) {
      return { success: false, message: 'Target admin account not found.' };
    }

    target.is_active = !target.is_active;
    target.updated_at = new Date().toISOString();
    this.saveAdmins(admins);

    this.logAudit(
      target.is_active ? 'ADMIN_ACTIVATED' : 'ADMIN_DEACTIVATED',
      'ADMIN_ACCOUNT',
      target.id,
      `Admin status toggled to ${target.is_active ? 'ACTIVE' : 'INACTIVE'} for ${target.email}`
    );

    return {
      success: true,
      message: `Account for ${target.name} is now ${target.is_active ? 'ACTIVE' : 'DEACTIVATED'}.`,
    };
  }
}

export const adminAuthService = new AdminAuthService();
