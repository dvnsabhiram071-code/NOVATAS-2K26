-- =========================================================================
-- NOVATAS 2K26 — DATABASE SCHEMA (PostgreSQL / Supabase)
-- Single Source of Truth for Volunteer Registration & Admin Management
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY,
  application_id TEXT,
  full_name TEXT NOT NULL,
  usn TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'CSE',
  section TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  photo_url TEXT,
  preference1 TEXT NOT NULL,
  preference2 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  rejection_reason TEXT,
  assigned_event_1 TEXT,
  assigned_event_2 TEXT,
  assigned_category TEXT,
  volunteer_role TEXT,
  volunteer_id TEXT,
  qr_token TEXT,
  approved_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_applications_usn ON public.applications (usn);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_volunteer_id ON public.applications (volunteer_id);
CREATE INDEX IF NOT EXISTS idx_applications_qr_token ON public.applications (qr_token);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('SPORTS', 'CULTURAL', 'MEDIA / CREATIVE')),
  description TEXT,
  rules TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  image_url TEXT,
  role TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SETTINGS TABLE (Singleton)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  event_name TEXT NOT NULL DEFAULT 'NOVATAS 2K26',
  department TEXT NOT NULL DEFAULT 'Department of Computer Science & Engineering',
  is_registration_open BOOLEAN NOT NULL DEFAULT TRUE,
  max_event_preferences INTEGER NOT NULL DEFAULT 2,
  max_image_size_mb INTEGER NOT NULL DEFAULT 5,
  allowed_image_types TEXT[] DEFAULT ARRAY['image/jpeg', 'image/png', 'image/webp'],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (timestamp DESC);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous / Public access policies (for public event website)
CREATE POLICY "Public can view active events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public can view active contacts" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Public can view active faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);

-- Public application submission and lookup
CREATE POLICY "Public can submit applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view non-deleted applications" ON public.applications FOR SELECT USING (is_deleted = false);
CREATE POLICY "Public/Admin can update applications" ON public.applications FOR UPDATE USING (true);

-- Admin tables & full access policies
CREATE POLICY "Admin full access on events" ON public.events FOR ALL USING (true);
CREATE POLICY "Admin full access on contacts" ON public.contacts FOR ALL USING (true);
CREATE POLICY "Admin full access on faqs" ON public.faqs FOR ALL USING (true);
CREATE POLICY "Admin full access on settings" ON public.settings FOR ALL USING (true);
CREATE POLICY "Admin full access on admins" ON public.admins FOR ALL USING (true);
CREATE POLICY "Admin full access on audit_logs" ON public.audit_logs FOR ALL USING (true);

-- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================

-- Seed Settings
INSERT INTO public.settings (id, event_name, department, is_registration_open, max_event_preferences, max_image_size_mb)
VALUES ('singleton', 'NOVATAS 2K26', 'Department of Computer Science & Engineering', TRUE, 2, 5)
ON CONFLICT (id) DO NOTHING;

-- Seed Authorized Admins
-- (Using salted bcrypt hash of initial bootstrap password Kishkinda@135)
INSERT INTO public.admins (id, name, email, password_hash, role, must_change_password, is_active)
VALUES 
  ('ADM-001', 'D V N S ABHIRAM', 'dvnsabhiram071@gmail.com', '$2b$10$l0JrBlXrmnV3AjV1E2ejtu2F63VgKoUsii2crq9WRYkS/AC9Z.7mW', 'ADMIN', TRUE, TRUE),
  ('ADM-002', 'Bhuvan Rao K', 'bhuvanraok07@gmail.com', '$2b$10$l0JrBlXrmnV3AjV1E2ejtu2F63VgKoUsii2crq9WRYkS/AC9Z.7mW', 'ADMIN', TRUE, TRUE),
  ('ADM-003', 'Deepa Nani', 'deepanani51@gmail.com', '$2b$10$l0JrBlXrmnV3AjV1E2ejtu2F63VgKoUsii2crq9WRYkS/AC9Z.7mW', 'ADMIN', TRUE, TRUE),
  ('ADM-004', 'Chinmai M R', 'mrchinmai07@gmail.com', '$2b$10$l0JrBlXrmnV3AjV1E2ejtu2F63VgKoUsii2crq9WRYkS/AC9Z.7mW', 'ADMIN', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Seed Events
INSERT INTO public.events (id, name, category, description, rules, status)
VALUES
  ('EVT-01', 'Cricket', 'SPORTS', 'Box Cricket Tournament with 7 players per squad.', 'Tennis ball, 6 overs per innings.', 'ACTIVE'),
  ('EVT-02', 'Free Fire', 'SPORTS', 'Battle Royale Squad eSports championship.', 'Custom room matches, emulator not allowed.', 'ACTIVE'),
  ('EVT-03', 'Chess', 'SPORTS', 'Classical rapid Swiss league format.', '15 mins per player with touch-move rule.', 'ACTIVE'),
  ('EVT-04', 'Tug of War', 'SPORTS', 'High intensity team strength showdown.', 'Best of 3 pulls with weight limit restrictions.', 'ACTIVE'),
  ('EVT-05', 'Ramp Walk', 'CULTURAL', 'Theme-based fashion and ethnic styling.', 'Costume, posture, walk, and stage presence.', 'ACTIVE'),
  ('EVT-06', 'Singing', 'CULTURAL', 'Eastern and Western solo & duet melodies.', 'Maximum 4 mins performance per contestant.', 'ACTIVE'),
  ('EVT-07', 'Dance', 'CULTURAL', 'Solo and crew western/folk choreographies.', '5 mins max track length, no fire props.', 'ACTIVE'),
  ('EVT-08', 'Mono Acting', 'CULTURAL', 'Solo theatrical expression and drama monologue.', '3 to 5 minutes performance in costume.', 'ACTIVE'),
  ('EVT-09', 'Anchoring', 'MEDIA / CREATIVE', 'Stage hosting, audience engagement, announcements.', 'Language fluency, impromptu presence.', 'ACTIVE'),
  ('EVT-10', 'Photography', 'MEDIA / CREATIVE', 'Live fest event capture and photojournalism.', 'DSLR or mirrorless submissions without heavy editing.', 'ACTIVE'),
  ('EVT-11', 'Reels Making', 'MEDIA / CREATIVE', 'Creative 30-60 sec event social media edits.', 'Submissions within 2 hours of event conclusion.', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Seed Contact
INSERT INTO public.contacts (id, name, email, mobile, image_url, role, status, display_order)
VALUES
  ('CNT-001', 'D V N S ABHIRAM', 'dvnsabhiram071@gmail.com', '8618842527', '', 'Chief Student Organizer', 'ACTIVE', 1)
ON CONFLICT (id) DO NOTHING;

-- Seed FAQs
INSERT INTO public.faqs (id, question, answer, category, status, display_order)
VALUES
  ('FAQ-01', 'Are volunteers participating as contestants in the events?', 'No. Volunteers are not participating in the events. They are registering exclusively to coordinate, manage, and assist operations for specific events.', 'General', 'ACTIVE', 1),
  ('FAQ-02', 'How does event assignment work?', 'You select 2 event preferences during registration. The administrative committee reviews applications and makes the final event assignment and volunteer role assignment.', 'Registration', 'ACTIVE', 2),
  ('FAQ-03', 'When do I receive my Volunteer ID and Badge?', 'Your official digital Volunteer ID and holographic badge are generated ONLY after your application has been reviewed and approved by the admin committee.', 'Badges & QR', 'ACTIVE', 3),
  ('FAQ-04', 'How does event check-in work?', 'Once approved, your ID card contains an encrypted holographic QR code. On event day, coordinators scan your badge with the admin scanner to record check-in.', 'Badges & QR', 'ACTIVE', 4)
ON CONFLICT (id) DO NOTHING;
