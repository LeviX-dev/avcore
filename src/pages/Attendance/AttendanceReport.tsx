import React, { useState, useEffect } from 'react';
import attendanceService from './attendanceService';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  checkin_time: string;
  checkout_time: string;
  status: string;
}

const AttendanceReport: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('by-date');
  const [employeeId, setEmployeeId] = useState('');
  const [monthYear, setMonthYear] = useState(new Date().toISOString().substring(0, 7));

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError('');
      let response;

      if (filterType === 'by-date' && filterDate) {
        response = await attendanceService.getAttendanceByDate({ date: filterDate });
      } else if (filterType === 'by-employee' && employeeId) {
        response = await attendanceService.getAttendanceDetails(employeeId);
      } else if (filterType === 'by-month' && monthYear) {
        response = await attendanceService.getAttendanceByMonth({ month: monthYear });
      } else if (filterType === 'daily-summary') {
        response = await attendanceService.getDailyAttendanceSummary();
      } else if (filterType === 'summary-by-date' && filterDate) {
        response = await attendanceService.getAttendanceSummaryByDate({ date: filterDate });
      }

      setRecords(response?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">
      <h3 className="mb-4 text-xl font-semibold">Attendance Report</h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">Report Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded border border-stroke bg-white px-4 py-2"
            >
              <option value="by-date">By Date</option>
              <option value="by-employee">By Employee</option>
              <option value="by-month">By Month</option>
              <option value="daily-summary">Daily Summary</option>
              <option value="summary-by-date">Summary by Date</option>
            </select>
          </div>

          {filterType === 'by-date' && (
            <div>
              <label className="mb-2 block font-medium">Select Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded border border-stroke bg-white px-4 py-2"
              />
            </div>
          )}

          {filterType === 'by-employee' && (
            <div>
              <label className="mb-2 block font-medium">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter employee ID"
                className="w-full rounded border border-stroke bg-white px-4 py-2"
              />
            </div>
          )}

          {filterType === 'by-month' && (
            <div>
              <label className="mb-2 block font-medium">Select Month</label>
              <input
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="w-full rounded border border-stroke bg-white px-4 py-2"
              />
            </div>
          )}

          {filterType === 'summary-by-date' && (
            <div>
              <label className="mb-2 block font-medium">Select Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded border border-stroke bg-white px-4 py-2"
              />
            </div>
          )}
        </div>

        <button
          onClick={fetchRecords}
          disabled={loading}
          className="w-full rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="border px-4 py-2 text-left text-sm font-semibold">ID</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Employee ID</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Date</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Check-in</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Check-out</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="border px-4 py-2 text-sm">{record.id}</td>
                  <td className="border px-4 py-2 text-sm">{record.employee_id}</td>
                  <td className="border px-4 py-2 text-sm">{record.date}</td>
                  <td className="border px-4 py-2 text-sm">{record.checkin_time || '-'}</td>
                  <td className="border px-4 py-2 text-sm">{record.checkout_time || '-'}</td>
                  <td className="border px-4 py-2 text-sm">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      record.status === 'Present' ? 'bg-green-100 text-green-800' :
                      record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="border px-4 py-4 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceReport;
