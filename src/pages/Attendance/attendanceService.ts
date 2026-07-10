import axios from 'axios';
import { BASE_URL } from '../../../public/config';

const API_URL = `${BASE_URL}api/attendance`;

const attendanceService = {
  // Check-in/Check-out operations
  checkIn: (data: any) => axios.post(`${API_URL}/check-in`, data, { withCredentials: true }),
  checkOut: (data: any) => axios.post(`${API_URL}/check-out`, data, { withCredentials: true }),
  autoCheckout: (data?: any) => axios.post(`${API_URL}/auto-checkout`, data || {}, { withCredentials: true }),
  
  // Status and Reports
  getTodayStatus: () => axios.get(`${API_URL}/status`, { withCredentials: true }),
  getAttendanceReport: (params?: any) => axios.get(`${API_URL}/report`, { params, withCredentials: true }),
  
  // Read operations
  getAttendanceByDate: (params: any) => axios.get(`${API_URL}/by-date`, { params, withCredentials: true }),
  getAttendanceDetails: (employeeId: string) => axios.get(`${API_URL}/details/${employeeId}`, { withCredentials: true }),
  getAttendanceSummaryByDate: (params: any) => axios.get(`${API_URL}/summary-by-date`, { params, withCredentials: true }),
  getAttendanceRange: (params: any) => axios.get(`${API_URL}/range`, { params, withCredentials: true }),
  getAttendanceByMonth: (params: any) => axios.get(`${API_URL}/by-month`, { params, withCredentials: true }),
  getDailyAttendanceSummary: (params?: any) => axios.get(`${API_URL}/daily-summary`, { params, withCredentials: true }),
  getTodayShift: () => axios.get(`${API_URL}/today-shift`, { withCredentials: true }),
  getTodayHoliday: () => axios.get(`${API_URL}/today-holiday`, { withCredentials: true }),
  
  // Dashboard operations
  getDashboardStats: () => axios.get(`${API_URL}/dashboard/stats`, { withCredentials: true }),
  getDashboardMonthlyStats: () => axios.get(`${API_URL}/dashboard/monthly`, { withCredentials: true }),
  getDashboard20DayTrend: () => axios.get(`${API_URL}/dashboard/20-day-trend`, { withCredentials: true }),
  
  // Self-service check-in/out
  addCheckin: (data: any) => axios.post(`${API_URL}/checkin2`, data, { withCredentials: true }),
  updateCheckout: (data: any) => axios.post(`${API_URL}/checkout2`, data, { withCredentials: true }),
  appendAttendance: (data: any) => axios.post(`${API_URL}/append`, data, { withCredentials: true }),
  
  // Admin full add/update/delete
  addAttendance: (data: any) => axios.post(`${API_URL}/add`, data, { withCredentials: true }),
  updateAttendance: (data: any) => axios.put(`${API_URL}/update`, data, { withCredentials: true }),
  deleteAttendance: (id: string) => axios.delete(`${API_URL}/${id}`, { withCredentials: true }),
  deleteAttendanceLog: (logId: string) => axios.delete(`${API_URL}/log/${logId}`, { withCredentials: true }),
  
  // Shift and Holiday operations (ready for backend integration)
  getShifts: () => axios.get(`${API_URL}/shifts`, { withCredentials: true }),
  addShift: (data: any) => axios.post(`${API_URL}/shifts`, data, { withCredentials: true }),
  updateShift: (id: string, data: any) => axios.put(`${API_URL}/shifts/${id}`, data, { withCredentials: true }),
  deleteShift: (id: string) => axios.delete(`${API_URL}/shifts/${id}`, { withCredentials: true }),

  getHolidays: () => axios.get(`${API_URL}/holidays`, { withCredentials: true }),
  addHoliday: (data: any) => axios.post(`${API_URL}/holidays`, data, { withCredentials: true }),
  updateHoliday: (id: string, data: any) => axios.put(`${API_URL}/holidays/${id}`, data, { withCredentials: true }),
  deleteHoliday: (id: string) => axios.delete(`${API_URL}/holidays/${id}`, { withCredentials: true }),
};
