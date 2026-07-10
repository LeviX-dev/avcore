import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Filter, Download, User, Phone, Calendar, Clock, TrendingUp, RefreshCw, AlertCircle, Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import { BASE_URL } from '../../../public/config.js';

interface EmployeeReportData {
  master_id: number;
  lead_name: string | null;
  number: string | null;
  employee_name: string;
  initial_stage: string;
  final_stage: string;
  is_converted: number;
  start_time: string;
  end_time: string;
  hours_spent: string;
  days_spent: string;
}

const EmployeeReportsPage = () => {
  const [data, setData] = useState<EmployeeReportData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(20);

  // Filter states
  const [filters, setFilters] = useState({
    leadSearch: '',
    stage: '',
    employeeName: '',
    isConverted: 'all'
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}api/reports/employee-leadwork-report`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setData(response.data.data);
        setTotal(response.data.total);
      } else {
        setError('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching employee reports:', error);
      setError('Error fetching employee reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.leadSearch) {
        const searchTerm = filters.leadSearch.toLowerCase();
        const leadNameMatch = item.lead_name?.toLowerCase().includes(searchTerm) || false;
        const numberMatch = item.number?.includes(filters.leadSearch) || false;
        
        if (!leadNameMatch && !numberMatch) {
          return false;
        }
      }

      if (filters.stage) {
        if (item.initial_stage !== filters.stage && item.final_stage !== filters.stage) {
          return false;
        }
      }

      if (filters.employeeName) {
        if (!item.employee_name.toLowerCase().includes(filters.employeeName.toLowerCase())) {
          return false;
        }
      }

      if (filters.isConverted !== 'all') {
        const isConverted = filters.isConverted === 'converted';
        if (item.is_converted !== (isConverted ? 1 : 0)) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Stage color mapping (from first component)
  const getStageColor = (stage: string | null) => {
    if (!stage) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    const stageLower = stage.toLowerCase();
    if (stageLower.includes('closed')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (stageLower.includes('drop')) return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
    if (stageLower.includes('fresh')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (stageLower.includes('positive')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
    if (stageLower.includes('site')) return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300';
    if (stageLower.includes('demo')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
    if (stageLower.includes('quotation')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    if (stageLower.includes('projection')) return 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300';
    if (stageLower.includes('cold')) return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    if (stageLower.includes('hold')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Get unique stages for dropdown
  const uniqueStages = useMemo(() => {
    const stages = new Set<string>();
    data.forEach(item => {
      stages.add(item.initial_stage);
      stages.add(item.final_stage);
    });
    return Array.from(stages).sort();
  }, [data]);

  // Get unique employee names for dropdown
  const uniqueEmployeeNames = useMemo(() => {
    const names = new Set<string>();
    data.forEach(item => {
      if (item.employee_name) {
        names.add(item.employee_name);
      }
    });
    return Array.from(names).sort();
  }, [data]);

  // Calculate statistics with dark mode support
  const statistics = useMemo(() => {
    const totalLeads = filteredData.length;
    const convertedLeads = filteredData.filter(item => item.is_converted === 1).length;
    const avgHours = totalLeads > 0 
      ? (filteredData.reduce((sum, item) => sum + parseFloat(item.hours_spent || '0'), 0) / totalLeads).toFixed(2)
      : '0.00';
    const avgDays = totalLeads > 0 
      ? (filteredData.reduce((sum, item) => sum + parseFloat(item.days_spent || '0'), 0) / totalLeads).toFixed(2)
      : '0.00';

    return { totalLeads, convertedLeads, conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0', avgHours, avgDays };
  }, [filteredData]);

  // Handle filter changes
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      leadSearch: '',
      stage: '',
      employeeName: '',
      isConverted: 'all'
    });
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Master ID', 'Lead Name', 'Number', 'Employee Name', 'Initial Stage', 'Final Stage', 'Converted', 'Start Time', 'End Time', 'Hours Spent', 'Days Spent'];
    const csvRows = [
      headers.join(','),
      ...filteredData.map(item => [
        item.master_id,
        `"${item.lead_name || 'N/A'}"`,
        `"${item.number || 'N/A'}"`,
        `"${item.employee_name}"`,
        `"${item.initial_stage}"`,
        `"${item.final_stage}"`,
        item.is_converted ? 'Yes' : 'No',
        `"${formatDate(item.start_time)} ${formatTime(item.start_time)}"`,
        `"${formatDate(item.end_time)} ${formatTime(item.end_time)}"`,
        item.hours_spent,
        item.days_spent
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Employee Lead Work Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
          Track employee lead work and performance metrics
        </p>
      </div>

      {/* Statistics Cards with dark mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{statistics.totalLeads}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Converted Leads</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{statistics.convertedLeads}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{statistics.conversionRate}% conversion rate</p>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-violet-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Avg Hours per Lead</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{statistics.avgHours}</p>
              <p className="text-xs text-violet-600 dark:text-violet-400">Hours spent</p>
            </div>
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-violet-500 dark:text-violet-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Avg Days per Lead</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{statistics.avgDays}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Days to conversion</p>
            </div>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section with dark mode */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm mb-4 sm:mb-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="p-3 sm:p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-2 sm:mr-3">
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Filters</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Refine your search results</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </button>
              <button
                onClick={exportToCSV}
                className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg flex items-center"
              >
                <Download className="h-3 w-3 mr-1" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Combined Lead Name/Phone Number Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Lead (Name or Phone)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.leadSearch}
                  onChange={(e) => handleFilterChange('leadSearch', e.target.value)}
                  placeholder="Search by name or phone..."
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 text-sm border border-gray-300/80 dark:border-gray-600/80 rounded-lg 
                    bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white 
                    focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Searches in both lead name and phone number
              </p>
            </div>

            {/* Employee Name Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Name</label>
              <select
                value={filters.employeeName}
                onChange={(e) => handleFilterChange('employeeName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300/80 dark:border-gray-600/80 rounded-lg 
                  bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white 
                  focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              >
                <option value="">All Employees</option>
                {uniqueEmployeeNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300/80 dark:border-gray-600/80 rounded-lg 
                  bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white 
                  focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              >
                <option value="">All Stages</option>
                {uniqueStages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            {/* Conversion Status Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conversion Status</label>
              <select
                value={filters.isConverted}
                onChange={(e) => handleFilterChange('isConverted', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300/80 dark:border-gray-600/80 rounded-lg 
                  bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white 
                  focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              >
                <option value="all">All Leads</option>
                <option value="converted">Converted Only</option>
                <option value="not_converted">Not Converted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-300">{paginatedData.length}</span> of <span className="font-medium text-gray-700 dark:text-gray-300">{filteredData.length}</span> records
          {total !== filteredData.length && (
            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
              ({total} total in database)
            </span>
          )}
        </div>
        
        {(filters.leadSearch || filters.stage || filters.employeeName || filters.isConverted !== 'all') && (
          <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full flex items-center">
            <Filter className="h-3 w-3 mr-1" />
            Filters Active
          </div>
        )}
      </div>

      {/* Mobile View - Cards */}
      <div className="block sm:hidden">
        {paginatedData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500">
              <Search className="mx-auto h-12 w-12 mb-3 text-gray-300 dark:text-gray-600" />
              <h3 className="text-base font-medium text-gray-600 dark:text-gray-400">No records found</h3>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-500">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedData.map((item, index) => (
              <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-gray-200/50 dark:border-gray-700/50">
                {/* Lead Details */}
                <div className="mb-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.lead_name || <span className="text-gray-400 dark:text-gray-500 italic">Unnamed Lead</span>}
                      </h3>
                      <div className="flex items-center mt-1">
                        <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.number || <span className="italic">No number</span>}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        ID: {item.master_id}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.is_converted 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                    }`}>
                      {item.is_converted ? 'Converted' : 'Not Converted'}
                    </span>
                  </div>
                </div>

                {/* Employee Info */}
                <div className="flex items-center mb-3">
                  <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-2">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.employee_name}
                    </div>
                  </div>
                </div>

                {/* Stages */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Initial Stage</div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStageColor(item.initial_stage)}`}>
                      {item.initial_stage}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Final Stage</div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStageColor(item.final_stage)}`}>
                      {item.final_stage}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</div>
                    <div className="flex items-center text-sm text-gray-800 dark:text-gray-300">
                      <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-1" />
                      {formatDate(item.start_time)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</div>
                    <div className="flex items-center text-sm text-gray-800 dark:text-gray-300">
                      <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-1" />
                      {formatDate(item.end_time)}
                    </div>
                  </div>
                </div>

                {/* Time Spent */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time Spent</div>
                    <div className="flex items-center text-sm text-gray-800 dark:text-gray-300">
                      <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-1" />
                      {item.hours_spent} hours
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Days</div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-300">
                      {item.days_spent}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination for mobile */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${currentPage === 1 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg ${currentPage === totalPages 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden sm:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {paginatedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500">
              <Search className="mx-auto h-12 w-12 mb-3 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No records found</h3>
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-500">Try adjusting your filters or check back later</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200/50 dark:border-gray-700/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Lead Details
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Stages
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Timeline
                    </th>
                  
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {paginatedData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      {/* Lead Details */}
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.lead_name || <span className="text-gray-400 dark:text-gray-500 italic">Unnamed Lead</span>}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            {item.number ? (
                              <>
                                <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{item.number}</span>
                              </>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 italic">No number</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            ID: {item.master_id}
                          </div>
                        </div>
                      </td>

                      {/* Employee */}
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-2">
                            <User className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.employee_name}
                          </div>
                        </div>
                      </td>

                      {/* Stages */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${getStageColor(item.initial_stage)}`}>
                              Initial: {item.initial_stage}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${getStageColor(item.final_stage)}`}>
                              Final: {item.final_stage}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900 dark:text-gray-300 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-1 flex-shrink-0" />
                            <span>Start: {formatDate(item.start_time)}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-1 flex-shrink-0" />
                            <span>End: {formatDate(item.end_time)}</span>
                          </div>
                        </div>
                      </td>

                  

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.is_converted 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                        }`}>
                          {item.is_converted ? 'Converted ✓' : 'Not Converted'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{' '}
                    <span className="font-medium">{filteredData.length}</span> results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                        currentPage === 1
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300/80 dark:border-gray-600/80'
                      }`}
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                      Previous
                    </button>
                    <div className="flex items-center">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 text-sm mx-0.5 rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300/80 dark:border-gray-600/80'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                        currentPage === totalPages
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300/80 dark:border-gray-600/80'
                      }`}
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeReportsPage;