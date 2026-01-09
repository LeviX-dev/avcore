import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Filter, Download, User, Phone, Calendar, Clock, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
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

  // Filter states - merged leadName and number into leadSearch
  const [filters, setFilters] = useState({
    leadSearch: '', // Combined search for lead name OR phone number
    stage: '',
    employeeName: '',
    isConverted: 'all' // 'all', 'converted', 'not_converted'
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
      // Combined lead search filter (search in both lead_name AND number)
      if (filters.leadSearch) {
        const searchTerm = filters.leadSearch.toLowerCase();
        const leadNameMatch = item.lead_name?.toLowerCase().includes(searchTerm) || false;
        const numberMatch = item.number?.includes(filters.leadSearch) || false;
        
        // Return true if either lead name OR number matches
        if (!leadNameMatch && !numberMatch) {
          return false;
        }
      }

      // Stage filter (check both initial and final stage)
      if (filters.stage) {
        if (item.initial_stage !== filters.stage && item.final_stage !== filters.stage) {
          return false;
        }
      }

      // Employee name filter
      if (filters.employeeName) {
        if (!item.employee_name.toLowerCase().includes(filters.employeeName.toLowerCase())) {
          return false;
        }
      }

      // Conversion status filter
      if (filters.isConverted !== 'all') {
        const isConverted = filters.isConverted === 'converted';
        if (item.is_converted !== (isConverted ? 1 : 0)) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

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

  // Calculate statistics
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
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      leadSearch: '',
      stage: '',
      employeeName: '',
      isConverted: 'all'
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Employee Reports</h1>
        <p className="text-gray-600">Track employee lead work and performance metrics</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.totalLeads}</p>
            </div>
            <User className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Converted Leads</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.convertedLeads}</p>
              <p className="text-sm text-green-600">{statistics.conversionRate}% conversion rate</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Hours per Lead</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.avgHours}</p>
              <p className="text-sm text-purple-600">Hours spent</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Days per Lead</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.avgDays}</p>
              <p className="text-sm text-orange-600">Days to conversion</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-700">Filters</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </button>
              <button
                onClick={exportToCSV}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Download className="h-3 w-3 mr-1" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Combined Lead Name/Phone Number Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Lead (Name or Phone)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.leadSearch}
                  onChange={(e) => handleFilterChange('leadSearch', e.target.value)}
                  placeholder="Search by name or phone number..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Searches in both lead name and phone number fields
              </p>
            </div>

            {/* Employee Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
              <select
                value={filters.employeeName}
                onChange={(e) => handleFilterChange('employeeName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Employees</option>
                {uniqueEmployeeNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Stages</option>
                {uniqueStages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            {/* Conversion Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Status</label>
              <select
                value={filters.isConverted}
                onChange={(e) => handleFilterChange('isConverted', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredData.length}</span> of <span className="font-semibold">{total}</span> records
          </p>
        </div>
        {filters.leadSearch || filters.stage || filters.employeeName || filters.isConverted !== 'all' ? (
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Filters Active
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stages
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No records found</p>
                      <p className="mt-1">Try adjusting your filters or check back later</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={`${item.master_id}-${item.employee_name}`} className="hover:bg-gray-50">
                    {/* Lead Details */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {item.lead_name || <span className="text-gray-400 italic">Unnamed Lead</span>}
                        </div>
                        <div className="text-gray-500 flex items-center">
                          {item.number ? (
                            <>
                              <Phone className="h-3 w-3 mr-1" />
                              {item.number}
                            </>
                          ) : (
                            <span className="text-gray-400 italic">No number</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Master ID: {item.master_id}
                        </div>
                      </div>
                    </td>

                    {/* Employee */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {item.employee_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stages */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="mb-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Initial: {item.initial_stage}
                          </span>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.is_converted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            Final: {item.final_stage}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Timeline */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          <span>Start: {formatDate(item.start_time)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          <span>End: {formatDate(item.end_time)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Time Spent */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <Clock className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="font-medium">{item.hours_spent} hours</span>
                        </div>
                        <div className="text-gray-500 text-xs">
                          {item.days_spent} days
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.is_converted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_converted ? 'Converted ✓' : 'Not Converted'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (if needed) */}
        {filteredData.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">1</span> of <span className="font-medium">1</span>
              </div>
              <div className="flex space-x-2">
                <button
                  disabled
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    
    </div>
  );
};

export default EmployeeReportsPage;