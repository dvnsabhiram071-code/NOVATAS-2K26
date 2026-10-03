import { VolunteerEvent, VolunteerApplication, AdminSettings, ContactPerson, FAQItem } from '../types';

export const INITIAL_EVENTS: VolunteerEvent[] = [
  // SPORTS
  {
    id: 'evt-cricket',
    name: 'Cricket',
    category: 'SPORTS',
    description: 'Coordinate pitch logistics, scoring desks, crowd boundaries, and umpire liaison.',
    rules: 'Volunteers must report 45 mins prior to match starts and manage ground protocol.',
    status: 'ACTIVE'
  },
  {
    id: 'evt-freefire',
    name: 'Free Fire',
    category: 'SPORTS',
    description: 'Esports tournament coordination, Wi-Fi connectivity monitoring, and room management.',
    rules: 'Ensure strict anti-cheating guidelines and match lobby verification.',
    status: 'ACTIVE'
  },
  {
    id: 'evt-chess',
    name: 'Chess',
    category: 'SPORTS',
    description: 'Silent hall management, chess clock monitoring, pairing sheet updates, and arbiter support.',
    rules: 'Strict silence maintenance and electronic device prohibition enforcement.',
    status: 'ACTIVE'
  },
  {
    id: 'evt-tugofwar',
    name: 'Tug of War',
    category: 'SPORTS',
    description: 'Arena safety perimeter, grip rope inspection, lineup coordination, and referee assistance.',
    rules: 'Enforce proper footwear and boundary distance for spectators.',
    status: 'ACTIVE'
  },

  // CULTURAL
  {
    id: 'evt-rampwalk',
    name: 'Ramp Walk',
    category: 'CULTURAL',
    description: 'Backstage green room queue, wardrobe check, green room lineup, and stage cue management.',
    rules: 'Coordinate runway timing and backstage access credentials.',
    status: 'ACTIVE'
  },
  {
    id: 'evt-singing',
    name: 'Singing',
    category: 'CULTURAL',
    description: 'Microphone soundcheck queue, track playback coordination, and judge scoring sheet delivery.',
    rules: 'Ensure backing tracks are tested with sound engineers before each performance.',
    status: 'ACTIVE'
  },
  {
    id: 'evt-dance',
    name: 'Dance',
    category: 'CULTURAL',
    description: 'Stage props placement, quick floor clearing, performer lineup, and green room ushering.',
    rules: 'Stage clearance must be executed within 30 seconds between crew routines.',
    status: 'ACTIVE'
  },
  {
    id: 'evt-monoacting',
    name: 'Mono Acting',
    category: 'CULTURAL',
    description: 'Spotlight cues, minimal stage prop setups, silent audience management, and judge liaison.',
    rules: 'Ensure no noise disturbance from backstage or auditorium aisles.',
    status: 'ACTIVE'
  },
  {
    id: 'evt-anchoring',
    name: 'Anchoring',
    category: 'CULTURAL',
    description: 'Host itinerary coordination, guest escorting, emergency filler coordination, and teleprompter/cue cards.',
    rules: 'Maintain constant radio or liaison contact with the stage director.',
    status: 'ACTIVE'
  },

  // MEDIA / CREATIVE
  {
    id: 'evt-photography',
    name: 'Photography',
    category: 'MEDIA / CREATIVE',
    description: 'DSLR event coverage, VIP photo moments, candid volunteer highlights, and drive uploads.',
    rules: 'Bring personal DSLR/Mirrorless camera if available and adhere to shot list.',
    status: 'ACTIVE'
  },
  {
    id: 'evt-reels',
    name: 'Reels Making',
    category: 'MEDIA / CREATIVE',
    description: 'Vertical 9:16 video capture, trending audio matching, instant story updates, and reels drafting.',
    rules: 'Submit short cuts to social media lead within 30 minutes of major event highlights.',
    status: 'ACTIVE'
  }
];

export const INITIAL_SETTINGS: AdminSettings = {
  eventName: 'NOVATAS 2K26',
  department: 'CSE',
  isRegistrationOpen: true,
  maxEventPreferences: 2,
  maxImageSizeMB: 5,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp']
};

// Realistic mock profile avatars
const AVATAR_1 = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
const AVATAR_2 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';
const AVATAR_3 = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400';
const AVATAR_4 = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400';
const AVATAR_5 = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400';

export const INITIAL_APPLICATIONS: VolunteerApplication[] = [
  // 1. D V N S ABHIRAM (Approved, Ramp Walk, Stage Coordination)
  {
    id: 'NOV26-00492',
    applicationId: 'NOV26-00492',
    volunteerId: 'NVT26-V00492',
    fullName: 'D V N S ABHIRAM',
    usn: 'KUB25CSE052',
    department: 'CSE',
    section: 'A',
    mobile: '8618842527',
    email: 'dvnsabhiram071@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    preference1: 'Ramp Walk',
    preference2: 'Chess',
    preferences: ['Ramp Walk', 'Chess'],
    status: 'APPROVED',
    assignedEvent1: 'Ramp Walk',
    assignedCategory: 'CULTURAL',
    volunteerRole: 'Stage Coordination',
    qrToken: 'sec-9842a1',
    submittedAt: '2026-10-02T10:00:00',
    approvedAt: '2026-10-03T10:00:00',
    checkedIn: false,
    isDeleted: false
  },
  // 2. Rahul Kumar (Approved, Photography, Photography Support)
  {
    id: 'NOV26-00482',
    applicationId: 'NOV26-00482',
    volunteerId: 'NVT26-V0482',
    fullName: 'Rahul Kumar',
    usn: '1XX23CS001',
    department: 'CSE',
    section: 'B',
    mobile: '9876543210',
    email: 'rahul.kumar@gmail.com',
    photoUrl: AVATAR_2,
    preference1: 'Cricket',
    preference2: 'Photography',
    preferences: ['Cricket', 'Photography'],
    status: 'APPROVED',
    assignedEvent1: 'Photography',
    assignedCategory: 'MEDIA / CREATIVE',
    volunteerRole: 'Photography Support',
    qrToken: 'sec-482bc3',
    submittedAt: '2026-10-01T10:15:00',
    approvedAt: '2026-10-02T14:30:00',
    checkedIn: true,
    checkedInAt: '10:42 AM',
    isDeleted: false
  },
  // 3. Priya Sharma (Approved, Dance, Stage Coordination)
  {
    id: 'NOV26-00067',
    applicationId: 'NOV26-00067',
    volunteerId: 'NVT26-V0067',
    fullName: 'Priya Sharma',
    usn: '1XX23CS045',
    department: 'CSE',
    section: 'A',
    mobile: '9812345678',
    email: 'priya.sharma@gmail.com',
    photoUrl: AVATAR_3,
    preference1: 'Dance',
    preference2: 'Singing',
    preferences: ['Dance', 'Singing'],
    status: 'APPROVED',
    assignedEvent1: 'Dance',
    assignedCategory: 'CULTURAL',
    volunteerRole: 'Stage Coordination',
    qrToken: 'sec-0067ab',
    submittedAt: '2026-10-01T11:20:00',
    approvedAt: '2026-10-02T15:10:00',
    checkedIn: false,
    isDeleted: false
  },
  // 4. Arjun Kumar (Approved, Chess, Event Coordination)
  {
    id: 'NOV26-00092',
    applicationId: 'NOV26-00092',
    volunteerId: 'NVT26-V0092',
    fullName: 'Arjun Kumar',
    usn: '1XX23CS012',
    department: 'CSE',
    section: 'D',
    mobile: '9845671230',
    email: 'arjun.k@gmail.com',
    photoUrl: AVATAR_4,
    preference1: 'Chess',
    preference2: 'Tug of War',
    preferences: ['Chess', 'Tug of War'],
    status: 'APPROVED',
    assignedEvent1: 'Chess',
    assignedCategory: 'SPORTS',
    volunteerRole: 'Event Coordination',
    qrToken: 'sec-0092cd',
    submittedAt: '2026-10-01T12:05:00',
    approvedAt: '2026-10-02T16:00:00',
    checkedIn: true,
    checkedInAt: '09:15 AM',
    isDeleted: false
  },
  // 5. Ananya Rao (PENDING REVIEW - No Volunteer ID, No QR, No Assignment)
  {
    id: 'NOV26-00483',
    applicationId: 'NOV26-00483',
    fullName: 'Ananya Rao',
    usn: '1XX23CS088',
    department: 'CSE',
    section: 'C',
    mobile: '9765432109',
    email: 'ananya.rao@gmail.com',
    photoUrl: AVATAR_1,
    preference1: 'Reels Making',
    preference2: 'Anchoring',
    preferences: ['Reels Making', 'Anchoring'],
    status: 'PENDING',
    submittedAt: '2026-10-02T09:30:00',
    checkedIn: false,
    isDeleted: false
  },
  // 6. Siddharth Nair (PENDING REVIEW - No Volunteer ID, No QR, No Assignment)
  {
    id: 'NOV26-00484',
    applicationId: 'NOV26-00484',
    fullName: 'Siddharth Nair',
    usn: '1XX23CS104',
    department: 'CSE',
    section: 'E',
    mobile: '9654321098',
    email: 'siddharth.nair@gmail.com',
    photoUrl: AVATAR_4,
    preference1: 'Free Fire',
    preference2: 'Ramp Walk',
    preferences: ['Free Fire', 'Ramp Walk'],
    status: 'PENDING',
    submittedAt: '2026-10-02T10:45:00',
    checkedIn: false,
    isDeleted: false
  },
  // 7. Sneha Patel (REJECTED - No Volunteer ID, No QR)
  {
    id: 'NOV26-00485',
    applicationId: 'NOV26-00485',
    fullName: 'Sneha Patel',
    usn: '1XX23CS150',
    department: 'CSE',
    section: 'F',
    mobile: '9543210987',
    email: 'sneha.patel@gmail.com',
    photoUrl: AVATAR_5,
    preference1: 'Singing',
    preference2: 'Mono Acting',
    preferences: ['Singing', 'Mono Acting'],
    status: 'REJECTED',
    rejectionReason: 'Invalid USN credentials provided. Please re-apply with verified ID card.',
    submittedAt: '2026-10-02T11:15:00',
    checkedIn: false,
    isDeleted: false
  },
  // 8. Karthik Varma (Approved, Cricket, Crowd Management)
  {
    id: 'NOV26-00486',
    applicationId: 'NOV26-00486',
    volunteerId: 'NVT26-V0486',
    fullName: 'Karthik Varma',
    usn: '1XX23CS072',
    department: 'CSE',
    section: 'B',
    mobile: '9432109876',
    email: 'karthik.varma@gmail.com',
    photoUrl: AVATAR_2,
    preference1: 'Cricket',
    preference2: 'Tug of War',
    preferences: ['Cricket', 'Tug of War'],
    status: 'APPROVED',
    assignedEvent1: 'Cricket',
    assignedCategory: 'SPORTS',
    volunteerRole: 'Crowd Management',
    qrToken: 'sec-0486ef',
    submittedAt: '2026-10-02T12:00:00',
    approvedAt: '2026-10-03T09:00:00',
    checkedIn: false,
    isDeleted: false
  },
  // 9. Meera Iyer (PENDING REVIEW)
  {
    id: 'NOV26-00487',
    applicationId: 'NOV26-00487',
    fullName: 'Meera Iyer',
    usn: '1XX23CS095',
    department: 'CSE',
    section: 'A',
    mobile: '9321098765',
    email: 'meera.iyer@gmail.com',
    photoUrl: AVATAR_1,
    preference1: 'Ramp Walk',
    preference2: 'Photography',
    preferences: ['Ramp Walk', 'Photography'],
    status: 'PENDING',
    submittedAt: '2026-10-02T13:25:00',
    checkedIn: false,
    isDeleted: false
  },
  // 10. Rohan Deshmukh (Approved, Free Fire, Technical Support)
  {
    id: 'NOV26-00488',
    applicationId: 'NOV26-00488',
    volunteerId: 'NVT26-V0488',
    fullName: 'Rohan Deshmukh',
    usn: '1XX23CS121',
    department: 'CSE',
    section: 'C',
    mobile: '9210987654',
    email: 'rohan.d@gmail.com',
    photoUrl: AVATAR_4,
    preference1: 'Free Fire',
    preference2: 'Chess',
    preferences: ['Free Fire', 'Chess'],
    status: 'APPROVED',
    assignedEvent1: 'Free Fire',
    assignedCategory: 'SPORTS',
    volunteerRole: 'Technical Support',
    qrToken: 'sec-0488gh',
    submittedAt: '2026-10-02T14:10:00',
    approvedAt: '2026-10-03T09:30:00',
    checkedIn: true,
    checkedInAt: '11:05 AM',
    isDeleted: false
  },
  // 11. Tanvi Joshi (PENDING REVIEW)
  {
    id: 'NOV26-00489',
    applicationId: 'NOV26-00489',
    fullName: 'Tanvi Joshi',
    usn: '1XX23CS139',
    department: 'CSE',
    section: 'D',
    mobile: '9109876543',
    email: 'tanvi.j@gmail.com',
    photoUrl: AVATAR_3,
    preference1: 'Anchoring',
    preference2: 'Dance',
    preferences: ['Anchoring', 'Dance'],
    status: 'PENDING',
    submittedAt: '2026-10-02T15:00:00',
    checkedIn: false,
    isDeleted: false
  }
];

export const INITIAL_CONTACTS: ContactPerson[] = [
  {
    id: 'cnt-001',
    name: 'D V N S ABHIRAM',
    email: 'dvnsabhiram071@gmail.com',
    mobile: '8618842527',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    role: 'Chief Student Organizer',
    status: 'ACTIVE',
    displayOrder: 1,
    createdAt: '2026-10-01T10:00:00'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-001',
    question: 'Who can register as a volunteer?',
    answer: 'All students enrolled in the Department of Computer Science & Engineering (across sections A through F and others) who are eager to coordinate and lead NOVATAS 2K26 behind the scenes are eligible.',
    category: 'Registration',
    status: 'ACTIVE',
    displayOrder: 1,
    createdAt: '2026-10-01T10:00:00'
  },
  {
    id: 'faq-002',
    question: 'How many event preferences can I select?',
    answer: 'You must select exactly 2 event preferences from the Sports, Cultural, and Media/Creative categories during your online registration.',
    category: 'Preferences',
    status: 'ACTIVE',
    displayOrder: 2,
    createdAt: '2026-10-01T10:00:00'
  },
  {
    id: 'faq-003',
    question: 'Are my selected events guaranteed?',
    answer: 'No. Your selected events are preferences. Final volunteer event assignments will be determined and balanced by the NOVATAS 2K26 organizing team according to event logistical demands.',
    category: 'Preferences',
    status: 'ACTIVE',
    displayOrder: 3,
    createdAt: '2026-10-01T10:00:00'
  },
  {
    id: 'faq-004',
    question: 'Is profile photo compulsory?',
    answer: 'Yes, absolutely. A clear, recent photograph is compulsory. It will be printed directly onto your official digital Volunteer ID Badge and encoded with your verification QR code.',
    category: 'Registration',
    status: 'ACTIVE',
    displayOrder: 4,
    createdAt: '2026-10-01T10:00:00'
  },
  {
    id: 'faq-005',
    question: 'Can I change my application after submitting?',
    answer: 'Once submitted, your application goes directly into admin review. If you need any corrections, you can contact the organizing lead (D V N S ABHIRAM) before admin approval.',
    category: 'Registration',
    status: 'ACTIVE',
    displayOrder: 5,
    createdAt: '2026-10-01T10:00:00'
  },
  {
    id: 'faq-006',
    question: 'How do I know whether I was approved?',
    answer: 'You can check your live application status anytime using the "Check Status" option in the navbar by simply entering your registered USN number.',
    category: 'Status & Approval',
    status: 'ACTIVE',
    displayOrder: 6,
    createdAt: '2026-10-01T10:00:00'
  },
  {
    id: 'faq-007',
    question: 'When do I receive my Volunteer ID?',
    answer: 'Your unique Volunteer ID (e.g., NVT26-V00492) is automatically generated and issued the moment the admin committee approves your application.',
    category: 'Badges & QR',
    status: 'ACTIVE',
    displayOrder: 7,
    createdAt: '2026-10-01T10:00:00'
  },
  {
    id: 'faq-008',
    question: 'Where can I find my QR code?',
    answer: 'Your digital QR code is available directly on your approved volunteer status page and is embedded within your downloadable Digital Volunteer ID Card.',
    category: 'Badges & QR',
    status: 'ACTIVE',
    displayOrder: 8,
    createdAt: '2026-10-01T10:00:00'
  }
];


