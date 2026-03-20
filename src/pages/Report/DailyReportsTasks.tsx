import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faUser,
  faCalendarCheck,
  faCheckCircle,
  faTimesCircle,
  faRefresh,
  faHistory,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { Download, Filter, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';

interface LeadData {
  master_id: number;
  lead_name: string | null;
  lead_phone: string | null;
  lead_email: string | null;
  source: string | null;
  employee_name: string;
  employee_role: string | null;
  employee_status: string | null;
  previous_stage: string;
  current_stage: string;
  conversion_status: string;
  time_spent: string;
  reassignment_date: string;
  last_updated: string;
  lead_created: string;
  city: string | null;
  assign_date: string;
}

interface ReportData {
  total_leads: number;
  assigned_leads: number;
  today_missed: number;
  completed_work: number;
  not_completed_work: number;
}

interface EmployeeOption {
  employee_name: string;
  role?: string;
}

interface HistoryItem {
  assign_date: string;
  created_by_user: string;
  assignedTo: string;
  reassignment_date: string;
  leadStage: string;
  remark: string;
  [key: string]: any;
}

const DailyReportsTasks = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [leadsData, setLeadsData] = useState<LeadData[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(50);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const openHistory = async (id: number) => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${BASE_URL}api/lead-history/${id}`, { withCredentials: true });
      setHistory(res.data?.data || []);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const [filters, setFilters] = useState({
    employeeName: '',
    fromDate: '',
    toDate: '',
  });

  const resetFilters = () => {
    setFilters({
      employeeName: '',
      fromDate: '',
      toDate: ''
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleDateFilterChange = (key: 'fromDate' | 'toDate', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const fetchLeadsData = async () => {
    setLoadingLeads(true);
    try {
      const response = await axios.get(
        `${BASE_URL}api/simple-lead-report`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLeadsData(response.data.data || []);
        setEmployees(response.data.employees || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching leads data:", error);
      setEmployees([]);
      setLeadsData([]);
    } finally {
      setLoadingLeads(false);
    }
  };

  const filteredLeadsData = useMemo(() => {
    if (!Array.isArray(leadsData)) return [];
    
    return leadsData.filter(item => {
      if (filters.employeeName) {
        if (!item?.employee_name?.toLowerCase().includes(filters.employeeName.toLowerCase())) {
          return false;
        }
      }
      
      if (filters.fromDate || filters.toDate) {
        const entryDate = item.assign_date ? new Date(item.assign_date) : null;
        
        if (!entryDate) return false;
        
        const entryDateStr = entryDate.toISOString().split('T')[0];
        
        if (filters.fromDate && entryDateStr < filters.fromDate) {
          return false;
        }
        
        if (filters.toDate && entryDateStr > filters.toDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [leadsData, filters]);

  const paginatedLeadsData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeadsData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeadsData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLeadsData.length / itemsPerPage);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}api/reports/leadworks-report`, {
        withCredentials: true,
        params: {
          employeeName: filters.employeeName || undefined
        }
      });
      setData(res.data.data);
    } catch (err) {
      console.error('❌ Failed to load Daily Reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters.employeeName]);

  useEffect(() => {
    fetchLeadsData();
  }, []);



  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      border: 'border-blue-200 dark:border-blue-700',
      gradient: 'from-blue-500 to-blue-600',
      text: 'text-blue-600 dark:text-blue-400'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      border: 'border-purple-200 dark:border-purple-700',
      gradient: 'from-purple-500 to-purple-600',
      text: 'text-purple-600 dark:text-purple-400'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      border: 'border-orange-200 dark:border-orange-700',
      gradient: 'from-orange-500 to-orange-600',
      text: 'text-orange-600 dark:text-orange-400'
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Master ID', 
      'Lead Name', 
      'Phone', 
      'Email', 
      'Source',
      'Employee Name',
      'Employee Role',
      'Employee Status',
      'Previous Stage',
      'Current Stage',
      'Conversion Status',
      'Time Spent',
      'Reassignment Date',
      'Last Updated',
      'Lead Created',
      'Entry Date'
    ];
    
    const csvRows = [
      headers.join(','),
      ...filteredLeadsData.map(item => [
        item.master_id,
        `"${item.lead_name || 'N/A'}"`,
        `"${item.lead_phone || 'N/A'}"`,
        `"${item.lead_email || 'N/A'}"`,
        `"${item.source || 'N/A'}"`,
        `"${item.employee_name}"`,
        `"${item.employee_role || 'N/A'}"`,
        `"${item.employee_status || 'N/A'}"`,
        `"${item.previous_stage}"`,
        `"${item.current_stage}"`,
        `"${item.conversion_status}"`,
        `"${item.time_spent}"`,
        `"${new Date(item.reassignment_date).toLocaleDateString('en-IN')}"`,
        `"${new Date(item.last_updated).toLocaleDateString('en-IN')}"`,
        `"${new Date(item.lead_created).toLocaleDateString('en-IN')}"`,
        `"${item.assign_date ? new Date(item.assign_date).toLocaleDateString('en-IN') : 'N/A'}"`
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-employee-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-boxdark p-3">
      <div className="max-w-7xl mx-auto">
{/* Filters - Single Line */}
<div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-3">
  <div className="flex items-center gap-2 flex-wrap">

    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded font-medium whitespace-nowrap">
      Total Leads: {data?.total_leads?.toLocaleString() || 0}
    </button>

    <button className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded font-medium whitespace-nowrap">
      Assigned Leads: {data?.assigned_leads?.toLocaleString() || 0}
    </button>

    <select
      name="employeeName"
      value={filters.employeeName}
      onChange={(e) => handleFilterChange('employeeName', e.target.value)}
      className="px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
    >
      <option value="">All Employees</option>
      {employees.map(emp => (
        <option key={emp.employee_name} value={emp.employee_name}>
          {emp.employee_name}
        </option>
      ))}
    </select>

    <input
      type="date"
      name="fromDate"
      value={filters.fromDate}
      onChange={(e) => handleDateFilterChange('fromDate', e.target.value)}
      className="px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
    />

    <input
      type="date"
      name="toDate"
      value={filters.toDate}
      onChange={(e) => handleDateFilterChange('toDate', e.target.value)}
      className="px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
    />

    <button
      onClick={resetFilters}
      className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-medium"
    >
      <RefreshCw size={12} />
      Reset
    </button>

    <button
      onClick={exportToCSV}
      disabled={!filteredLeadsData.length}
      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium disabled:opacity-50"
    >
      <Download size={12} />
      Export
    </button>

  </div>
</div>


        {/* Leads Table */}
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Lead Details</h2>
              <span className="text-xs text-gray-500">
                Showing {paginatedLeadsData.length} of {filteredLeadsData.length}
              </span>
            </div>
          </div>

          {loadingLeads ? (
            <div className="text-center p-8">Loading...</div>
          ) : paginatedLeadsData.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No records found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 text-left font-semibold">Lead</th>
                      <th className="p-2 text-left font-semibold">City</th>
                      <th className="p-2 text-left font-semibold">Entry Date</th>
                      <th className="p-2 text-left font-semibold">Employee</th>
                      <th className="p-2 text-left font-semibold">Stage</th>
                      <th className="p-2 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedLeadsData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-2">
                          <div className="font-medium">{item.lead_name || '-'}</div>
                          <div className="text-gray-500">{item.lead_phone || '-'}</div>
                        </td>
                        <td className="p-2">{item.city || '-'}</td>
                        <td className="p-2">
                          {item.assign_date ? new Date(item.assign_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-2">{item.employee_name}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-[10px]">
                            {item.current_stage || 'N/A'}
                          </span>
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => openHistory(item.master_id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] flex items-center gap-1"
                          >
                            <FontAwesomeIcon icon={faHistory} className="h-2 w-2" />
                         
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Like first example */}
              {filteredLeadsData.length > 0 && (
                <div className="px-3 py-2 border-t">
                  <div className="flex justify-between items-center text-xs">
                    <span>
                      Showing {(currentPage-1)*itemsPerPage+1} to {Math.min(currentPage*itemsPerPage, filteredLeadsData.length)} of {filteredLeadsData.length}
                    </span>
                    <div className="flex gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
                      >←</button>
                      <span className="px-2 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
                      >→</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* History Modal */}
        {open && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden mr-32">
              <div className="flex justify-between items-center p-3 border-b">
                <h3 className="font-semibold">Lead History</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="p-3 overflow-y-auto max-h-[75vh]">
                {loadingHistory ? (
                  <div className="text-center p-4">Loading...</div>
                ) : history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map((h, i) => (
                      <div key={i} className="border rounded p-2 text-xs">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <div>
                            <span className="text-gray-500">Date:</span>{" "}
                            {h.assign_date
                              ? new Date(h.assign_date).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div>
                            <span className="text-gray-500">From:</span>{" "}
                            {h.created_by_user || "N/A"}
                          </div>
                          <div>
                            <span className="text-gray-500">To:</span>{" "}
                            {h.assignedTo || "N/A"}
                          </div>
                          <div>
                            <span className="text-gray-500">Stage:</span>{" "}
                            {h.current_stage || "N/A"}
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Remark:</span>{" "}
                            {h.remark || "No remark"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    No history found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReportsTasks;