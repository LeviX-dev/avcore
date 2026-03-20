import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import * as XLSX from 'xlsx';
import { FiFilter, FiDownload, FiCalendar } from 'react-icons/fi';

interface Row {
  attendance_id: number | null;
  user_id: number;
  user_name: string;
  role: string;
  attendance_date: string | null;
  check_in_datetime: string | null;
  check_out_datetime: string | null;
  auto_checkout: number | null;
  status: 'Present' | 'Absent';
}

interface Employee {
  user_id: number;
  name: string;
}

const PAGE_SIZE = 10;

const AttendanceReport = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Set default dates to today
  const today = new Date().toISOString().split('T')[0];
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [autoFilter, setAutoFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [mode, setMode] = useState<'attendance' | 'presence'>('attendance');

  // Format time to 12-hour with AM/PM
const formatTimeTo12Hour = (val?: string | null): string => {
  if (!val) return 'Not Mark';  // Changed from '-' to 'not mark'
  try {
    const date = new Date(val);
    if (isNaN(date.getTime())) return 'Not Mark';  // Changed from '-' to 'not mark'
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours || 12; // Convert 0 to 12
    
    return `${hours}:${minutes} ${ampm}`;
  } catch {
    return 'Not Mark';  // Changed from '-' to 'not mark'
  }
};
  // Format date only (DD-MM-YYYY)
const formatDateOnly = (val?: string | null): string => {
  if (!val) return 'Not Mark';  // Changed from '-' to 'not mark'
  try {
    const date = new Date(val);
    if (isNaN(date.getTime())) return 'Not Mark';  // Changed from '-' to 'not mark'
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return 'Not Mark';  // Changed from '-' to 'not mark'
  }
};

  // Format date and time for export
const formatDateTimeForExport = (val?: string | null): string => {
  if (!val) return 'Not Mark';  // Changed from '-' to 'not mark'
  try {
    const date = new Date(val);
    if (isNaN(date.getTime())) return 'not mark';  // Changed from '-' to 'not mark'
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch {
    return 'not mark';  // Changed from '-' to 'not mark'
  }
};


  // Load employees list - FIXED: Direct call to users API
  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/users`, {
        withCredentials: true,
      });
      // Filter only active employees if needed
      const activeEmployees = (res.data || []).filter((emp: any) => 
        emp.status === 'active' || emp.status === undefined
      );
      setEmployees(activeEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      // Fallback to hardcoded list if API fails
      setEmployees([
        { user_id: 28, name: 'Amol Sir' },
        { user_id: 30, name: 'Nisha mam' },
        { user_id: 31, name: 'rohit' },
        { user_id: 32, name: 'ritesh' },
        { user_id: 33, name: 'priyanka' },
        { user_id: 34, name: 'ram' },
        { user_id: 35, name: 'mohini' },
        { user_id: 36, name: 'ambuj' },
        { user_id: 37, name: 'abhish sir' },
        { user_id: 38, name: 'Ganesh Telesales_1' },
        { user_id: 39, name: 'Rohit Telesales_2' },
        { user_id: 40, name: 'sham' },
      ]);
    }
  };

  // Load attendance data
  const loadAttendance = async (isExport = false) => {
    if (!isExport) {
      setLoading(true);
    }
    try {
      const res = await axios.get(`${BASE_URL}api/attendance/report`, {
        params: { 
          from, 
          to, 
          mode,
          employee: selectedEmployee === 'all' ? '' : selectedEmployee,
          export: isExport ? 'true' : 'false' // Add export parameter
        },
        withCredentials: true,
      });
      
      if (isExport) {
        return res.data || [];
      } else {
        setRows(res.data || []);
        setPage(1);
      }
    } catch (error) {
      console.error('Error loading attendance report:', error);
      return [];
    } finally {
      if (!isExport) {
        setLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    loadEmployees();
    loadAttendance();
  }, []);

  // Apply filters
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      // Auto checkout filter
      if (autoFilter !== 'all') {
        const isAuto = autoFilter === 'yes' ? 1 : 0;
        if (r.auto_checkout !== isAuto) {
          return false;
        }
      }

      return true;
    });
  }, [rows, autoFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  // Export to Excel - UPDATED to fetch only Amol Sir's data
const exportExcel = async () => {
  setExportLoading(true);
  try {
    // Fetch data specifically for export (only Amol Sir)
    const exportData = await loadAttendance(true);
    
    // If no data, show message
    if (!exportData || exportData.length === 0) {
      alert('No data found for Amol Sir in the selected date range');
      return;
    }
    
    // Prepare data for Excel
    const data = exportData.map(r => ({
      Name: r.user_name,
      Role: r.role,
      Date: formatDateOnly(r.attendance_date),
      'Check In': formatTimeTo12Hour(r.check_in_datetime),
      'Check Out': formatTimeTo12Hour(r.check_out_datetime),
      Status: r.status,
      'Auto Checkout': r.auto_checkout ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    // Add filter info
    const filterInfo = [
      ['Attendance Report - Amol Sir Only'],
      [`Exported: ${new Date().toLocaleString()}`],
      [`Date Range: ${from} to ${to}`],
      ['Employee: Amol Sir'],
      ['Auto Checkout Filter: All'],
      [''] // Empty row
    ];

    XLSX.utils.sheet_add_aoa(worksheet, filterInfo, { origin: -1 });
    
    // Auto-size columns
    const maxWidth = data.reduce((w, r) => Math.max(w, r.Name?.length || 0), 10);
    worksheet['!cols'] = [
      { wch: maxWidth + 2 }, // Name
      { wch: 20 }, // Role
      { wch: 15 }, // Date
      { wch: 15 }, // Check In
      { wch: 15 }, // Check Out
      { wch: 12 }, // Status
      { wch: 15 }, // Auto Checkout
    ];
    
    const fileName = `attendance_amol_sir_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error exporting to Excel');
  } finally {
    setExportLoading(false);
  }
};

  // Reset filters
  const resetFilters = () => {
    setFrom(today);
    setTo(today);
    setSelectedEmployee('all');
    setAutoFilter('all');
    setPage(1);
  };

  // Apply all filters and load data
  const applyFilters = () => {
    loadAttendance();
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-boxdark p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Report</h1>
        </div>

        {/* Filters Card - All in Single Line */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          
          {/* Date Range */}
<div className="lg:col-span-5"> {/* was lg:col-span-4 */}
  <div className="grid grid-cols-2 gap-4"> {/* gap increased */}

    {/* From */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        From
      </label>
      <div className="relative">
        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        />
      </div>
    </div>

    {/* To */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        To
      </label>
      <div className="relative">
        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        />
      </div>
    </div>

  </div>
</div>



            {/* Employee Dropdown - FIXED */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee</label>
              <select
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.user_id} value={emp.user_id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Checkout Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Auto Checkout</label>
              <select
                value={autoFilter}
                onChange={e => setAutoFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="lg:col-span-2 flex gap-2">
              <button
                onClick={applyFilters}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
              >
                <FiFilter size={14} />
                {loading ? 'Loading...' : 'Apply'}
              </button>
              <button
                onClick={resetFilters}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                title="Reset filters"
              >
                ⟳
              </button>
              
              {/* Export Button - UPDATED */}
             <button
  onClick={exportExcel}
  disabled={exportLoading}
  className="flex items-center gap-2 whitespace-nowrap bg-green-600 hover:bg-green-700 text-white px-1 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
  title="Export to Excel"
>
  <FiDownload size={12} />
  <span>{exportLoading ? 'Exporting...' : 'Export Excel'}</span>
</button>

            </div>
          </div>

          {/* Records Count */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredRows.length} records found
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Showing page {page} of {totalPages}
            </span>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Check In Time</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Check Out Time</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Auto Checkout</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedRows.map(r => (
                  <tr 
                    key={`${r.attendance_id || r.user_id}_${r.attendance_date}`} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-medium text-gray-900 dark:text-white">{r.user_name}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {r.role}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatDateOnly(r.attendance_date)}
                    </td>
                    <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatTimeTo12Hour(r.check_in_datetime)}
                    </td>
                    <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatTimeTo12Hour(r.check_out_datetime)}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'Present'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        r.auto_checkout
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {r.auto_checkout ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}

                {paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-3xl mb-2">📊</div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No records found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          {rows.length === 0 ? 'No data available' : 'Try adjusting your filters'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRows.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * PAGE_SIZE, filteredRows.length)}</span> of{' '}
                  <span className="font-medium">{filteredRows.length}</span> results
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 rounded-md text-sm ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
    
      </div>
    </div>
  );
};

export default AttendanceReport;