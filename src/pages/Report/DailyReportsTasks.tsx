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
  assign_date: string; // Added for entry date
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
  const [itemsPerPage] = useState<number>(20);

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
      // Employee filter
      if (filters.employeeName) {
        if (!item?.employee_name?.toLowerCase().includes(filters.employeeName.toLowerCase())) {
          return false;
        }
      }
      
      // Date range filter
      if (filters.fromDate || filters.toDate) {
        const entryDate = item.assign_date ? new Date(item.assign_date) : null;
        
        if (!entryDate) return false;
        
        // Convert to date-only string for comparison (YYYY-MM-DD)
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

  const mainCards = [
    { 
      label: 'Total Leads', 
      value: data?.total_leads || 0, 
      color: 'blue', 
      icon: faChartLine,
      description: 'All leads in system'
    },
    { 
      label: 'Assigned Leads', 
      value: data?.assigned_leads || 0, 
      color: 'purple', 
      icon: faUser,
      description: 'Leads assigned to employees'
    },
    { 
      label: 'Today + Missed', 
      value: data?.today_missed || 0, 
      color: 'orange', 
      icon: faCalendarCheck,
      description: 'Today\'s tasks + Missed deadlines'
    },
  ];

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
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      border: 'border-green-200 dark:border-green-700',
      gradient: 'from-green-500 to-green-600',
      text: 'text-green-600 dark:text-green-400'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      border: 'border-red-200 dark:border-red-700',
      gradient: 'from-red-500 to-red-600',
      text: 'text-red-600 dark:text-red-400'
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
      'Entry Date' // Added entry date
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
        `"${item.assign_date ? new Date(item.assign_date).toLocaleDateString('en-IN') : 'N/A'}"` // Added entry date
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
        <p className="ml-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
<div className="space-y-2">
  {/* Header - More Compact */}
  <div className="mb-1">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Lead Dashboard
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Lead tracking with employee details
        </p>
      </div>
    </div>
  </div>

{/* ULTRA COMPACT FILTER SECTION - SINGLE LINE */}
<div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-2">
  <div className="flex flex-wrap items-center gap-2 md:gap-3">
    {/* Filter Label */}
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="p-1 bg-blue-600 rounded">
        <Filter className="h-3.5 w-3.5 text-white" />
      </div>
      <div>
        <h2 className="text-xs font-semibold text-gray-800 dark:text-white">Filters</h2>
        <p className="text-[10px] text-gray-500">{employees.length} emp</p>
      </div>
    </div>

    {/* Employee Filter */}
    <select
      value={filters.employeeName}
      onChange={(e) => handleFilterChange('employeeName', e.target.value)}
      className="h-8 px-2 text-xs border rounded bg-white dark:bg-gray-700 dark:text-white min-w-[140px]"
    >
      <option value="">All Employees</option>
      {employees.map(emp => (
        <option key={emp.employee_name} value={emp.employee_name}>
          {emp.employee_name.length > 15 ? emp.employee_name.substring(0, 15) + "..." : emp.employee_name}
        </option>
      ))}
    </select>

    {/* Date Range */}
    <div className="flex items-center gap-1">
      <input
        type="date"
        value={filters.fromDate}
        onChange={(e) => handleDateFilterChange('fromDate', e.target.value)}
        className="h-8 px-2 text-xs border border-gray-300 dark:border-gray-600 rounded 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[110px]"
        title="From Date"
      />
      <span className="text-xs text-gray-500 mx-1">to</span>
      <input
        type="date"
        value={filters.toDate}
        onChange={(e) => handleDateFilterChange('toDate', e.target.value)}
        className="h-8 px-2 text-xs border border-gray-300 dark:border-gray-600 rounded 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[110px]"
        title="To Date"
      />
    </div>

    {/* Action Buttons */}
    <div className="flex gap-1 ml-auto">
      <button
        onClick={resetFilters}
        className="h-8 px-3 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-md 
          flex items-center gap-1 whitespace-nowrap"
      >
        <RefreshCw className="h-3 w-3" />
        Reset
      </button>
      <button
        onClick={exportToCSV}
        className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md 
          flex items-center gap-1 whitespace-nowrap"
      >
        <Download className="h-3 w-3" />
        Export
      </button>
    </div>
  </div>
</div>
  {/* ULTRA COMPACT DASHBOARD CARDS */}
  <div className="mb-2">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {mainCards.map((card, index) => {
        const colors = colorClasses[card.color as keyof typeof colorClasses];

        return (
          <div
            key={index}
            className={`
              ${colors.bg}
              border ${colors.border}
              rounded-lg
              p-3
              transform transition-all duration-200
              hover:scale-[1.02] hover:shadow-md
              group
              min-h-[90px]
              flex flex-col justify-between
            `}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className={`
                  w-6 h-6 rounded-lg
                  bg-gradient-to-br ${colors.gradient}
                  flex items-center justify-center
                  shadow group-hover:shadow-md
                  transition-all duration-200
                `}>
                  <FontAwesomeIcon
                    icon={card.icon}
                    className="text-white text-xs"
                  />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">
                    {card.label}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {card.value.toLocaleString()}
              </div>
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-1"></div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>

      {/* LEADS TABLE SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Lead & Employee Details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filters.employeeName ? `Filtered by: ${filters.employeeName}` : 'All leads with employee information'}
              </p>
              {(filters.fromDate || filters.toDate) && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Date range: {filters.fromDate || 'Start'} to {filters.toDate || 'End'}
                </p>
              )}
            </div>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Showing <span className="text-blue-600 dark:text-blue-400">{paginatedLeadsData.length}</span> of{' '}
                <span className="text-purple-600 dark:text-purple-400">{filteredLeadsData.length}</span> leads
              </span>
            </div>
          </div>
        </div>

        {loadingLeads ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading lead data...</p>
            </div>
          </div>
        ) : paginatedLeadsData.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500">
              <Filter className="mx-auto h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">No leads found</h3>
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-500 max-w-md mx-auto">
                {filters.employeeName || filters.fromDate || filters.toDate
                  ? 'No leads match the current filters. Try adjusting your filter criteria.'
                  : 'No leads available. Please check back later.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <tr>
                    <th className="py-4 px-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/5">
                      Lead Details
                    </th>
                    <th className="py-4 px-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/6">
                      City
                    </th>
                    <th className="py-4 px-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/6">
                      Entry Date
                    </th>
                    <th className="py-4 px-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/5">
                      Employee
                    </th>
                    <th className="py-4 px-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/6">
                      Stage
                    </th>
                    <th className="py-4 px-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedLeadsData.map((item, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-gray-700/50 dark:hover:to-gray-800/50 transition-all duration-200"
                    >
                      {/* Lead Details Column */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {item.lead_name || <span className="italic text-gray-400 dark:text-gray-500">Unnamed Lead</span>}
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              📞 {item.lead_phone || <span className="italic text-gray-400">No phone</span>}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      {/* City Column */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {item.city || 'N/A'}
                          </div>
                        </div>
                      </td>
                      
                      {/* Entry Date Column */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Entry Date
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.assign_date ? new Date(item.assign_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </td>
                      
                      {/* Employee Details Column */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {item.employee_name}
                          </div>
                        </div>
                      </td>
                      
                      {/* Stage Column */}
                      <td className="py-4 px-5 align-top">
                        <div className="flex flex-col items-start gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300">
                            {item.current_stage || 'N/A'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Actions Column */}
                      <td className="py-4 px-5 align-middle">
                        <div className="flex justify-start">
                          <button
                            onClick={() => openHistory(item.master_id)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 
                              text-white rounded-xl text-xs font-medium flex items-center gap-2
                              transition-all duration-200 hover:shadow-lg"
                          >
                            <FontAwesomeIcon icon={faHistory} className="h-3 w-3" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-5 py-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Page <span className="font-bold text-blue-600 dark:text-blue-400">{currentPage}</span> of{' '}
                    <span className="font-bold text-purple-600 dark:text-purple-400">{totalPages}</span> | 
                    Total: <span className="font-bold">{filteredLeadsData.length}</span> leads
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2.5 text-sm rounded-xl flex items-center gap-2 transition-all duration-200 ${
                        currentPage === 1
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <div className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-xl">
                      {currentPage}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2.5 text-sm rounded-xl flex items-center gap-2 transition-all duration-200 ${
                        currentPage === totalPages
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* HISTORY MODAL */}
      {open && (
      

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-300 dark:border-gray-700 ml-auto mr-8">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Lead History Timeline</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-3 overflow-y-auto max-h-[55vh]">
              {loadingHistory ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : history && history.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300 dark:from-indigo-700 dark:to-purple-700"></div>
                  
                  <div className="space-y-3">
                    {history.map((h, i) => (
                      <div key={i} className="relative pl-16">
                        <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 ring-4 ring-indigo-100 dark:ring-indigo-900/30"></div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entry Date</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {h.assign_date ? new Date(h.assign_date).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {h.created_by_user || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">To</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {h.assignedTo || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Follow-up</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {h.reassignment_date ? new Date(h.reassignment_date).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stage</p>
                              <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                {h.current_stage || 'N/A'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remark</p>
                              <p className="text-sm text-gray-900 dark:text-white break-words whitespace-normal">
                                {h.remark || 'No remark'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500">
                    <FontAwesomeIcon icon={faHistory} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No history found</h3>
                    <p className="text-sm mt-2 text-gray-500 dark:text-gray-500">
                      No historical data available for this lead.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setOpen(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 
                  text-white rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReportsTasks;