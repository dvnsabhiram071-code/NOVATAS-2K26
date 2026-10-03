# NOVATAS 2K26 — Volunteer Registration & Management System

> **BE THE TEAM BEHIND THE EXPERIENCE.**  
> Official student volunteer recruitment, event coordination, digital accreditation, and administrative management portal for the Department of Computer Science & Engineering.

---

## ⚡ Key Highlights & System Architecture

### 1. Signature Letter-by-Letter Neon Opening Animation
- **Timeline**: 4.8-second sequenced neon letter reveal on pure black background with canvas electric spark particles.
  - **N** (`#00E5FF` Cyan) → **O** (`#2979FF` Blue) → **V** (`#7C4DFF` Violet) → **A** (`#FF2BD6` Magenta) → **T** (`#FF3D71` Hot Pink) → **A** (`#FF7A00` Orange) → **S** (`#FFE600` Yellow).
  - Letters smoothly lock together with an energetic rainbow light sweep.
  - **2K26** energetic brush reveal in sequence (2 → K → 2 → 6).
  - Subtitle: `VOLUNTEER REGISTRATION` • `CREATE • ORGANIZE • LEAD`.
  - Replayable at any time from the navigation bar, with instant skip option.

### 2. Public Volunteer Portal
- **Hero Section**: Cyberpunk dark glassmorphic styling, live stats, CTAs for registration and status lookup.
- **About NOVATAS**: Four foundational pillars:
  - `01 TEAMWORK`
  - `02 LEADERSHIP`
  - `03 RESPONSIBILITY`
  - `04 EXPERIENCE`
- **Volunteer Role Clarification**: Emphasizes that volunteers are organizers/managers, not competition participants. 9 core duties detailed (Event coordination, crowd management, stage cues, photo/reels, backstage management, etc.).
- **Event Preferences Showcase**:
  - **Sports**: Cricket, Free Fire, Chess, Tug of War
  - **Cultural**: Ramp Walk, Singing, Dance, Mono Acting, Anchoring
  - **Media / Creative**: Photography, Reels Making
  - **Admin Authority Notice**: Explicitly emphasizes that selections are preferences, and final assignment is determined by the organizing committee.
- **How It Works**: 7-step onboarding roadmap (Register → Review → Approval → Event Assignment → Volunteer ID → QR Code → Volunteer).
- **Interactive FAQ**: Comprehensive accordion answering all 8 official volunteer queries.
- **Direct Organizer Contact**: Direct profile card for Chief Student Organizer **D V N S ABHIRAM** (`dvnsabhiram071@gmail.com` | `+91 8618842527`) with one-click email and phone triggers.

### 3. Multi-Step Volunteer Registration Form
- **Step 1: Personal Details**: Full Name, USN, Department (CSE), Section (A–F/Other), Mobile Number, Email (all with strict validation).
- **Step 2: Profile Photo**: Compulsory high-resolution photo upload (JPG/PNG/WEBP up to 5MB) rendered onto the official ID badge.
- **Step 3: Event Preferences**: Requires selection of **exactly 2 preferences** with real-time counter and limit warnings.
- **Step 4: Review & Confirmation**: Summary breakdown, photo preview, and required confirmation checkbox before submission.
- **Submission Feedback**: Sequential Application ID (`NOV26-00482`), confetti celebration, and direct transition to status lookup.

### 4. Application Status Lookup & Digital ID Badge
- **USN Lookup**: Enter registered USN to view live status.
- **3 Dynamic States**:
  - `PENDING`: Shows submission details and awaiting review notice.
  - `APPROVED`: Congratulatory banner, issued Volunteer ID (`NVT26-V0482`), assigned event, and full **Digital Volunteer ID Badge** with embedded QR code.
  - `NOT APPROVED`: Explanation remark from organizers and direct contact button.
- **Digital Badge Features**:
  - Full-resolution card with photo, department, section, assigned duty, and QR verification pass.
  - **Save Volunteer ID**: Uses `html2canvas` to export crisp PNG badge directly to device.
  - **View QR**: Enlarged modal for security gate check-in.

### 5. Admin Management Console
- **Secure Authentication**: Protected admin login.
  - **Demo Email**: `admin@novatas.com`
  - **Demo Password**: `admin2k26`
- **Dashboard**: Live metric cards (Total Applications, Pending, Approved, Rejected, Assigned, Checked In) and event breakdown.
- **Application Management**: Searchable, filterable roster with modals to view photo, full details, approve (generates Volunteer ID + QR pass), reject with customized reason, or safe soft-delete.
- **Event Management**: Add new events, modify descriptions, rules, categories, or toggle active/inactive status.
- **Volunteer Assignment System**:
  - **Individual**: Select applicant and assign final Event 1 and optional Event 2.
  - **Bulk Assignment**: Select multiple applicants and allocate them to any chosen event with one click.
- **Approved Volunteers Directory**: Filterable by event or section with quick access to digital badges.
- **QR Code Check-In**: Optical camera scanner simulation + manual ID lookup. Instantly marks volunteer `PRESENT` with a real-time timestamp (e.g. `10:42 AM`).
- **Professional Multi-Sheet Excel Export**:
  - Filters by Status, Event, Section, and Date range.
  - Generates 6 formatted workbook sheets:
    1. *All Applications*
    2. *Approved Volunteers*
    3. *Pending Applications*
    4. *Rejected Applications*
    5. *Event Assignments*
    6. *Check-in Data*
- **Settings & Controls**:
  - **🟢 Registration Open / 🔴 Registration Closed** master switch (with automatic public portal banner when closed).
  - Dataset reset to initial demo records anytime.

---

## 🚀 Running the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Run Vite dev server
npm run dev

# 3. Production build
npm run build
```

The application will run locally at `http://localhost:5174/` (or port 5173).

NOVATAS 2K26 deployment update
