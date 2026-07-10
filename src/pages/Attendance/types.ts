// Attendance-related TypeScript interfaces

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  checkin_time: string;
  checkout_time: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Half Day';
}

export interface TodayStatus {
  checkin_time: string | null;
  checkout_time: string | null;
  status: string;
}

export interface DashboardStats {
  present_count: number;
  absent_count: number;
  late_count: number;
  total_employees: number;
  [key: string]: any;
}

export interface MonthlyStats {
  month: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface TrendData {
  date: string;
  present: number;
  absent: number;
  late: number;
}

export interface ShiftInfo {
  shift_name: string;
  start_time: string;
  end_time: string;
  [key: string]: any;
}

export interface HolidayInfo {
  is_holiday: boolean;
  holiday_name?: string;
  [key: string]: any;
}

export interface AttendanceForm {
  employee_id: string;
  date: string;
  checkin_time: string;
  checkout_time: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Half Day';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
