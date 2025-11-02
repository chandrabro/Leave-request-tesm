
export enum LeaveType {
  HOME = 'Home Leave',
  CASUAL = 'Casual Leave',
  SICK = 'Sick Leave',
  ANNUAL = 'Annual Leave',
}

export interface LeaveRequest {
  employeeName: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  submissionDate: string;
}

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';
