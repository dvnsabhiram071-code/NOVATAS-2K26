import * as XLSX from 'xlsx';
import { VolunteerApplication } from '../types';

export interface ExportFilterOptions {
  status?: string;
  event?: string;
  section?: string;
  dateRange?: string;
}

export function exportVolunteersToExcel(
  applications: VolunteerApplication[],
  filters: ExportFilterOptions = {}
) {
  // Apply active filters
  let filtered = applications.filter(app => !app.isDeleted);

  if (filters.status && filters.status !== 'ALL') {
    filtered = filtered.filter(app => app.status === filters.status);
  }

  if (filters.event && filters.event !== 'ALL') {
    filtered = filtered.filter(app => 
      app.assignedEvent1 === filters.event || 
      app.preference1 === filters.event ||
      app.preference2 === filters.event ||
      app.preferences.includes(filters.event as string)
    );
  }

  if (filters.section && filters.section !== 'ALL') {
    filtered = filtered.filter(app => app.section === filters.section);
  }

  // Exact Section 22 Column Mapping
  const mapToStandardRow = (app: VolunteerApplication) => {
    const isApproved = app.status === 'APPROVED';
    const regDate = app.submittedAt 
      ? new Date(app.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '-';
    const appDate = app.approvedAt 
      ? new Date(app.approvedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '-';

    return {
      'Application ID': app.id || app.applicationId || '-',
      'Volunteer ID': isApproved ? (app.volunteerId || 'NOT GENERATED') : 'NOT GENERATED',
      'Full Name': app.fullName,
      'USN': app.usn,
      'Department': app.department,
      'Section': app.section,
      'Mobile': app.mobile,
      'Email': app.email,
      'Preference 1': app.preference1 || app.preferences[0] || '-',
      'Preference 2': app.preference2 || app.preferences[1] || '-',
      'Final Assigned Event': isApproved ? (app.assignedEvent1 || 'UNASSIGNED') : 'NOT ASSIGNED',
      'Volunteer Role': isApproved ? (app.volunteerRole || 'UNASSIGNED') : 'NOT ASSIGNED',
      'Application Status': app.status,
      'Rejection Reason': app.status === 'REJECTED' ? (app.rejectionReason || 'Requirements not met') : '-',
      'Registered At': regDate,
      'Approved At': appDate,
      'QR Status': isApproved ? 'GENERATED' : 'NOT GENERATED',
      'Check-in Status': isApproved ? (app.checkedIn ? 'CHECKED IN' : 'NOT CHECKED IN') : '-',
      'Check-in Time': isApproved && app.checkedIn ? (app.checkedInAt || 'Gate Desk') : '-'
    };
  };

  const wb = XLSX.utils.book_new();

  // 1. Sheet: All Applications
  const allRows = filtered.map(mapToStandardRow);
  const wsAll = XLSX.utils.json_to_sheet(allRows.length > 0 ? allRows : [{}]);
  XLSX.utils.book_append_sheet(wb, wsAll, 'All Applications');

  // 2. Sheet: Approved Volunteers
  const approvedRows = filtered.filter(a => a.status === 'APPROVED').map(mapToStandardRow);
  const wsApproved = XLSX.utils.json_to_sheet(approvedRows.length > 0 ? approvedRows : [{}]);
  XLSX.utils.book_append_sheet(wb, wsApproved, 'Approved Volunteers');

  // 3. Sheet: Pending Applications
  const pendingRows = filtered.filter(a => a.status === 'PENDING').map(mapToStandardRow);
  const wsPending = XLSX.utils.json_to_sheet(pendingRows.length > 0 ? pendingRows : [{}]);
  XLSX.utils.book_append_sheet(wb, wsPending, 'Pending Applications');

  // 4. Sheet: Rejected Applications
  const rejectedRows = filtered.filter(a => a.status === 'REJECTED').map(mapToStandardRow);
  const wsRejected = XLSX.utils.json_to_sheet(rejectedRows.length > 0 ? rejectedRows : [{}]);
  XLSX.utils.book_append_sheet(wb, wsRejected, 'Rejected Applications');

  // 5. Sheet: Event Assignments (Only Approved Volunteers with assigned events)
  const assignmentsRows = filtered
    .filter(a => a.status === 'APPROVED' && a.assignedEvent1)
    .map(a => ({
      'Volunteer ID': a.volunteerId || '',
      'Full Name': a.fullName,
      'USN': a.usn,
      'Section': a.section,
      'Mobile': a.mobile,
      'Preference 1': a.preference1 || a.preferences[0] || '',
      'Preference 2': a.preference2 || a.preferences[1] || '',
      'Final Assigned Event': a.assignedEvent1 || '',
      'Volunteer Role': a.volunteerRole || 'Event Coordination',
      'QR Status': 'GENERATED'
    }));
  const wsAssignments = XLSX.utils.json_to_sheet(assignmentsRows.length > 0 ? assignmentsRows : [{}]);
  XLSX.utils.book_append_sheet(wb, wsAssignments, 'Event Assignments');

  // 6. Sheet: Check-in Attendance
  const checkinRows = filtered
    .filter(a => a.status === 'APPROVED')
    .map(a => ({
      'Volunteer ID': a.volunteerId || '',
      'Full Name': a.fullName,
      'USN': a.usn,
      'Section': a.section,
      'Final Assigned Event': a.assignedEvent1 || '',
      'Volunteer Role': a.volunteerRole || '',
      'Check-in Status': a.checkedIn ? 'CHECKED IN' : 'NOT CHECKED IN',
      'Check-in Time': a.checkedInAt || '-'
    }));
  const wsCheckin = XLSX.utils.json_to_sheet(checkinRows.length > 0 ? checkinRows : [{}]);
  XLSX.utils.book_append_sheet(wb, wsCheckin, 'Check-in Attendance');

  // Export file with clean timestamp
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `NOVATAS_2K26_Volunteers_Report_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
