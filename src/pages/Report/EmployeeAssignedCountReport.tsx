import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFilter, faTimes, faPhone, faEnvelope, faMapMarkerAlt, faCalendarAlt, faHistory, faCommentAlt, faArrowRight, faUser, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

interface StageHistory {
  stage: string | null;
  assignedTo: string;
  remark: string | null;
  date: string;
}

interface LeadDetail {
  master_id: number;
  lead_name: string;
  current_stage: string;
  stage_history: string;
}

interface EmployeeReport {
  employee_name: string;
  role: string;
  total_assigned: number;
  today_assigned: number;
  upcoming_assigned: number;
  missed_assigned: number;
  converted_count: number;
  not_converted_count: number;
  lead_details: string;
}

interface LeadData {
  master_id: number;
  lead_name: string;
  number: string;
  email: string;
  city: string;
  assign_date: string | null;
  stage_history: string;
    reassignment_date: string | null;  // Add this line

}

// Add interface for the selected lead in stage history modal
interface SelectedLeadStageHistory {
  name: string;
  history: StageHistory[];
}

const EmployeeDetailedReport = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<EmployeeReport[]>([]);
  const [filteredData, setFilteredData] = useState<EmployeeReport[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add these two state variables for the new centered modal
  const [selectedLeadStageHistory, setSelectedLeadStageHistory] = useState<SelectedLeadStageHistory | null>(null);
  const [showStageHistoryModal, setShowStageHistoryModal] = useState(false);
  
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<{
    employee: string;
    leads: LeadDetail[];
  } | null>(null);
  const [leadData, setLeadData] = useState<LeadData[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedLeadModal, setSelectedLeadModal] = useState<{
    employee: string;
    visible: boolean;
  } | null>(null);

  const fetchEmployeeDetailedReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/reports/employee-detailed`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setReportData(response.data.data || []);
        setFilteredData(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employee detailed report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDetailedReport();
  }, []);

  useEffect(() => {
    let result = [...reportData];

    if (selectedEmployee) {
      result = result.filter(emp => 
        emp.employee_name === selectedEmployee
      );
    }

    if (selectedRole) {
      result = result.filter(emp => 
        emp.role.toLowerCase() === selectedRole.toLowerCase()
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(emp => 
        emp.employee_name.toLowerCase().includes(term) ||
        emp.role.toLowerCase().includes(term)
      );
    }

    setFilteredData(result);
  }, [selectedEmployee, selectedRole, searchTerm, reportData]);


  const parseLeadDetails = (leadDetailsJson?: string): LeadDetail[] => {
  if (!leadDetailsJson) return [];

  try {
    return JSON.parse(leadDetailsJson);
  } catch {
    return [];
  }
};




const parseStageHistory = (stageHistoryJson?: any): StageHistory[] => {
  if (!stageHistoryJson) return [];

  try {
    let data = stageHistoryJson;

    // If backend already sends array (future proof)
    if (Array.isArray(data)) return data;

    if (typeof data === "string") {
      data = data.trim();

      // Case: "[{...}]"
      if (data.startsWith('"[')) {
        data = JSON.parse(data);
      }

      return JSON.parse(data);
    }

    return [];
  } catch (err) {
    console.error("Stage history parse failed:", stageHistoryJson);
    return [];
  }
};




  const fetchEmployeeLeads = async (employeeName: string) => {
    try {
      setLoadingLeads(true);
      const encodedName = encodeURIComponent(employeeName);
      const response = await axios.get(
        `${BASE_URL}api/reports/employee-leads/${encodedName}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setLeadData(response.data.data || []);
        setSelectedLeadModal({
          employee: employeeName,
          visible: true
        });
      }
    } catch (error) {
      console.error('Error fetching employee leads:', error);
      alert('Failed to load lead details');
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleViewLeadDetails = async (employeeName: string, leadDetailsJson: string) => {
    // Show loading modal first
    setSelectedLeadModal({
      employee: employeeName,
      visible: true
    });
    
    // Fetch detailed lead data
    await fetchEmployeeLeads(employeeName);
  };

  const getLeadStageCounts = (leads: LeadDetail[]) => {
    const stageCountMap: Record<string, number> = {};

    leads.forEach((lead) => {
      const history = parseStageHistory(lead.stage_history);
      if (history.length === 0) return;

      const latestStage = history[history.length - 1]?.stage;
      if (!latestStage) return;

      stageCountMap[latestStage] = (stageCountMap[latestStage] || 0) + 1;
    });

    return stageCountMap;
  };


  // Format date - improved version
const formatDate = (dateString: string | null, showTime: boolean = false) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    
    if (showTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = true;
    }
    
    return date.toLocaleDateString('en-IN', options);
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Invalid Date';
  }
};

// Get relative time for follow-up date
const getRelativeTime = (dateString: string | null) => {
  if (!dateString) return 'No follow-up';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays > 0) {
      return `in ${diffDays} days`;
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else {
      return `${Math.abs(diffDays)} days ago`;
    }
  } catch (error) {
    return 'N/A';
  }
};


  const uniqueRoles = Array.from(new Set(reportData.map(emp => emp.role)));
  const uniqueEmployees = Array.from(new Set(reportData.map(emp => emp.employee_name))).sort();

  const clearFilters = () => {
    setSelectedEmployee('');
    setSelectedRole('');
    setSearchTerm('');
    setFilteredData(reportData);
  };

  // Stage color mapping
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

  // Count color mapping
  const getCountColor = (type: string, count: number) => {
    const base = 'px-2.5 py-1 text-xs font-semibold rounded-full';
    
    switch(type) {
      case 'total':
        return `${base} bg-gradient-to-r from-blue-500 to-blue-600 text-white`;
      case 'today':
        return `${base} bg-gradient-to-r from-green-500 to-green-600 text-white`;
      case 'upcoming':
        return `${base} bg-gradient-to-r from-amber-500 to-amber-600 text-white`;
      case 'missed':
        return `${base} bg-gradient-to-r from-rose-500 to-rose-600 text-white`;
      case 'converted':
        return `${base} bg-gradient-to-r from-emerald-500 to-emerald-600 text-white`;
      case 'not_converted':
        return `${base} bg-gradient-to-r from-red-500 to-red-600 text-white`;
      default:
        return `${base} bg-gray-200 text-gray-800`;
    }
  };


  // Get current/latest stage from history
  const getCurrentStage = (stageHistory: string): string => {
    try {
      const history = parseStageHistory(stageHistory);
      if (history.length === 0) return 'Not Assigned';
      
      // Find the last non-null stage
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].stage && history[i].stage.trim() !== '') {
          return history[i].stage;
        }
      }
      
      return 'Not Assigned';
    } catch (error) {
      return 'Error';
    }
  };

  // Get latest remark from history
  const getLatestRemark = (stageHistory: string): string => {
    try {
      const history = parseStageHistory(stageHistory);
      if (history.length === 0) return 'No remarks';
      
      // Find the last remark that's not null or empty
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].remark && history[i].remark.trim() !== '') {
          return history[i].remark;
        }
      }
      
      return 'No remarks';
    } catch (error) {
      return 'Error loading remarks';
    }
  };

  // Mobile view for employee card
  const EmployeeCard = ({ employee }: { employee: EmployeeReport }) => {
    const leads = parseLeadDetails(employee.lead_details);
    const uniqueLeads = leads.length;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {employee.employee_name}
            </h3>
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 mt-1">
              {employee.role}
            </span>
          </div>
          <button
            onClick={() => handleViewLeadDetails(employee.employee_name, employee.lead_details)}
            className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
            title="View Lead Details"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className={getCountColor('total', employee.total_assigned)}>
              {employee.total_assigned}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className={getCountColor('today', employee.today_assigned)}>
              {employee.today_assigned}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Today</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className={getCountColor('upcoming', employee.upcoming_assigned)}>
              {employee.upcoming_assigned}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upcoming</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className={getCountColor('missed', employee.missed_assigned)}>
              {employee.missed_assigned}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Missed</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className={getCountColor('converted', employee.converted_count)}>
              {employee.converted_count}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Converted</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className={getCountColor('not_converted', employee.not_converted_count)}>
              {employee.not_converted_count}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Not Converted</div>
          </div>
        </div>

        {/* Leads Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400 border-t pt-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">{uniqueLeads}</span> leads assigned
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Employee Performance Report
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
          Track employee assignments and lead progression
        </p>
      </div>

      {/* Compact Filter Section - Single Line */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Employee Dropdown Filter */}
          <div className="flex-1">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-300/80 dark:border-gray-600/80 rounded-lg 
                bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white 
                focus:ring-2 focus:ring-blue-500/50 focus:border-transparent h-full"
            >
              <option value="">All Employees</option>
              {uniqueEmployees.map((employee, index) => (
                <option key={index} value={employee}>
                  {employee}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex-1">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-300/80 dark:border-gray-600/80 rounded-lg 
                bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white 
                focus:ring-2 focus:ring-blue-500/50 focus:border-transparent h-full"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((role, index) => (
                <option key={index} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 
              text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm
              whitespace-nowrap min-w-[120px] h-full"
          >
            <FontAwesomeIcon icon={faFilter} className="text-xs" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">{filteredData.length}</span> employees found
        </div>
        <button
          onClick={fetchEmployeeDetailedReport}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Mobile View - Cards */}
      <div className="block sm:hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500">
              <svg className="mx-auto h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-base font-medium">No employees found</h3>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((employee, index) => (
              <EmployeeCard key={index} employee={employee} />
            ))}
            
            {/* Mobile Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredData.length} Total Employees
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {filteredData.reduce((sum, emp) => sum + emp.total_assigned, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Leads</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {filteredData.reduce((sum, emp) => sum + emp.converted_count, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Converted</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop View - Table (hidden on mobile) */}
<div className="hidden sm:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
  {loading ? (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>
  ) : filteredData.length === 0 ? (
    <div className="text-center py-12">
      <div className="text-gray-400 dark:text-gray-500">
        <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium">No employees found</h3>
        <p className="text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200/50 dark:border-gray-700/50">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-48">Employee</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">Role</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-24">Total</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-24">Today</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-24">Upcoming</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-24">Missed</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-24">Converted</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-24">Not Converted</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
          {filteredData.map((employee, index) => {
            const leads = parseLeadDetails(employee.lead_details);
            const uniqueLeads = leads.length;
            
            return (
              <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                {/* Employee Name */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[180px]" title={employee.employee_name}>
                      {employee.employee_name}
                    </div>
                  </div>
                </td>
                
                {/* Role */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 truncate inline-block max-w-[120px]" title={employee.role}>
                    {employee.role}
                  </span>
                </td>
                
                {/* Total Assigned */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex justify-start">
                    <span className={getCountColor('total', employee.total_assigned)}>
                      {employee.total_assigned}
                    </span>
                  </div>
                </td>
                
                {/* Today Assigned */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex justify-start">
                    <span className={getCountColor('today', employee.today_assigned)}>
                      {employee.today_assigned}
                    </span>
                  </div>
                </td>
                
                {/* Upcoming Assigned */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex justify-start">
                    <span className={getCountColor('upcoming', employee.upcoming_assigned)}>
                      {employee.upcoming_assigned}
                    </span>
                  </div>
                </td>
                
                {/* Missed Assigned */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex justify-start">
                    <span className={getCountColor('missed', employee.missed_assigned)}>
                      {employee.missed_assigned}
                    </span>
                  </div>
                </td>
                
                {/* Converted Count */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex justify-start">
                    <span className={getCountColor('converted', employee.converted_count)}>
                      {employee.converted_count}
                    </span>
                  </div>
                </td>
                
                {/* Not Converted Count */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex justify-start">
                    <span className={getCountColor('not_converted', employee.not_converted_count)}>
                      {employee.not_converted_count}
                    </span>
                  </div>
                </td>
                
                {/* Lead Details Button */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewLeadDetails(employee.employee_name, employee.lead_details)}
                      className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                        text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow flex-shrink-0"
                      title="View Lead Details"
                    >
                      <FontAwesomeIcon icon={faEye} className="text-xs" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        
        {/* Compact Footer */}
        <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-t border-gray-200/50 dark:border-gray-700/50">
          <tr>
            <td className="py-3 px-4 font-semibold text-sm text-gray-900 dark:text-white whitespace-nowrap">
              {filteredData.length} Total
            </td>
            <td className="py-3 px-4">
              <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
            </td>
            <td className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
              {filteredData.reduce((sum, emp) => sum + emp.total_assigned, 0)}
            </td>
            <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
              {filteredData.reduce((sum, emp) => sum + emp.today_assigned, 0)}
            </td>
            <td className="py-3 px-4 font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
              {filteredData.reduce((sum, emp) => sum + emp.upcoming_assigned, 0)}
            </td>
            <td className="py-3 px-4 font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
              {filteredData.reduce((sum, emp) => sum + emp.missed_assigned, 0)}
            </td>
            <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              {filteredData.reduce((sum, emp) => sum + emp.converted_count, 0)}
            </td>
            <td className="py-3 px-4 font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
              {filteredData.reduce((sum, emp) => sum + emp.not_converted_count, 0)}
            </td>
            <td className="py-3 px-4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )}
</div>

      {/* Compact Right-aligned Lead Details Modal with Top Margin */}
      {selectedLeadModal && selectedLeadModal.visible && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
  <div className="bg-white dark:bg-gray-800 w-full max-w-3xl max-h-[80vh] mt-12 rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">

      {/* Compact Header */}
            <div className="px-3 py-2 border-b dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {selectedLeadModal.employee.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedLeadModal.employee}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {leadData.length} leads
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedLeadModal(null);
                  setLeadData([]);
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
            </div>

         {/* Scrollable Content */}
<div className="flex-1 overflow-auto">
  {loadingLeads ? (
    <div className="flex justify-center items-center h-32">
      <div className="text-center">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mx-auto mb-1.5"></div>
        <p className="text-xs text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  ) : leadData.length === 0 ? (
    <div className="flex justify-center items-center h-32">
      <div className="text-center">
        <FontAwesomeIcon icon={faExclamationCircle} className="text-gray-400 text-lg mb-1.5" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">No leads</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">No data available</p>
      </div>
    </div>
  ) : (
    <div className="overflow-x-auto">
<table className="w-full min-w-[750px]">
  <thead className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
    <tr className="text-xs text-gray-600 dark:text-gray-400">
      <th className="py-1.5 px-2 text-left font-medium">Lead</th>
      <th className="py-1.5 px-2 text-left font-medium">Contact</th>
      <th className="py-1.5 px-2 text-left font-medium">Entry Date</th>
      <th className="py-1.5 px-2 text-left font-medium">Follow-up Date</th>
      <th className="py-1.5 px-2 text-left font-medium">Stage</th>
      <th className="py-1.5 px-2 text-left font-medium">Remark</th>
      <th className="py-1.5 px-2 text-left font-medium">Action</th>
    </tr>
  </thead>
  <tbody>
    {leadData.map((lead, index) => {
      const currentStage = getCurrentStage(lead.stage_history);
      const latestRemark = getLatestRemark(lead.stage_history);
      
      const getFollowUpStatus = (dateString: string | null) => {
        if (!dateString) return { text: 'Not set', className: 'text-gray-400 dark:text-gray-500' };
        
        try {
          const date = new Date(dateString);
          const now = new Date();
          const diffTime = date.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) {
            return { 
              text: 'Today', 
              className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-medium'
            };
          } else if (diffDays === 1) {
            return { 
              text: 'Tomorrow', 
              className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium'
            };
          } else if (diffDays > 1 && diffDays <= 3) {
            return { 
              text: `in ${diffDays} days`, 
              className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
            };
          } else if (diffDays > 3) {
            return { 
              text: formatDate(dateString), 
              className: 'text-gray-600 dark:text-gray-400'
            };
          } else if (diffDays < 0) {
            return { 
              text: `${Math.abs(diffDays)} days ago`, 
              className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 font-medium'
            };
          } else {
            return { 
              text: formatDate(dateString), 
              className: 'text-gray-600 dark:text-gray-400'
            };
          }
        } catch (error) {
          return { 
            text: 'Invalid date', 
            className: 'text-gray-400 dark:text-gray-500'
          };
        }
      };
      
      const followUpStatus = getFollowUpStatus(lead.reassignment_date);
      
      return (
        <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
          <td className="py-2 px-2">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {lead.lead_name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {lead.city && lead.city !== 'Not Found' && (
                  <>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-gray-500">{lead.city}</span>
                  </>
                )}
              </div>
            </div>
          </td>
          <td className="py-2 px-2">
            <div className="space-y-0.5">
              {lead.number && (
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-blue-500" />
                  <span className="text-xs truncate max-w-[90px]">{lead.number}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-blue-500" />
                  <span className="text-xs truncate max-w-[90px]">{lead.email}</span>
                </div>
              )}
            </div>
          </td>
          <td className="py-2 px-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {formatDate(lead.assign_date)}
                </span>
              </div>
              {lead.assign_date && (
                <div className="text-xs text-blue-600 dark:text-blue-400 ml-4">
                  Entry
                </div>
              )}
            </div>
          </td>
          <td className="py-2 px-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-amber-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {formatDate(lead.reassignment_date)}
                </span>
              </div>
              {lead.reassignment_date && (
                <div className="text-xs">
                  <span className={`px-1.5 py-0.5 rounded-full ${followUpStatus.className}`}>
                    {followUpStatus.text}
                  </span>
                </div>
              )}
            </div>
          </td>
          <td className="py-2 px-2">
            <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${getStageColor(currentStage)}`}>
              {currentStage}
            </span>
          </td>
          <td className="py-2 px-2 max-w-[120px]">
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {latestRemark.length > 40 ? `${latestRemark.substring(0, 40)}...` : latestRemark}
            </div>
          </td>
          <td className="py-2 px-2">
            <button
              onClick={() => {
                const history = parseStageHistory(lead.stage_history);
                setSelectedLeadStageHistory({
                  name: lead.lead_name,
                  history: history
                });
                setShowStageHistoryModal(true);
              }}
              className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500 hover:bg-blue-600 text-white"
            >
              View
            </button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
    </div>
  )}
</div>


            {/* Compact Footer */}
            <div className="px-3 py-1.5 border-t dark:border-gray-700 flex items-center justify-between">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total: <span className="font-medium">{leadData.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => selectedLeadModal && fetchEmployeeLeads(selectedLeadModal.employee)}
                  className="px-2.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                >
                  Refresh
                </button>
                <button
                  onClick={() => {
                    setSelectedLeadModal(null);
                    setLeadData([]);
                  }}
                  className="px-2.5 py-0.5 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    {/* NEW: Centered Stage History Modal (Compact Fonts + Top Margin) */}
{showStageHistoryModal && selectedLeadStageHistory && (
  <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[85vh] mt-12 rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">

      {/* Modal Header */}
      <div className="px-4 py-3 mt-3 border-b dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Stage History for {selectedLeadStageHistory.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Total stages: {selectedLeadStageHistory.history.length}
          </p>
        </div>
        <button
          onClick={() => {
            setShowStageHistoryModal(false);
            setSelectedLeadStageHistory(null);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <FontAwesomeIcon icon={faTimes} className="text-base" />
        </button>
      </div>

      {/* Modal Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3 text-sm">
          {selectedLeadStageHistory.history.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-xl mb-2" />
                <h3 className="text-sm font-medium">No stage history available</h3>
                <p className="text-xs mt-1">No stage data found for this lead</p>
              </div>
            </div>
          ) : (
            selectedLeadStageHistory.history.map((h, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                      {i + 1}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Stage: {h.stage || "N/A"}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        {h.date}
                      </span>
                    </div>

                    <div className="mt-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Assigned To:
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                        {h.assignedTo || "Not assigned"}
                      </p>
                    </div>

                    <div className="mt-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Remark:
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                        {h.remark || "No remark provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-4 py-2 border-t dark:border-gray-700 flex items-center justify-end">
        <button
          onClick={() => {
            setShowStageHistoryModal(false);
            setSelectedLeadStageHistory(null);
          }}
          className="px-4 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}


      {/* Lead Stage Count Modal - Mobile Responsive */}
      {selectedLeadDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm sm:max-w-xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedLeadDetails.employee}
                </h2>
                <p className="text-xs text-gray-500">
                  Lead Stage Summary
                </p>
              </div>
              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {(() => {
                const stageCounts = getLeadStageCounts(selectedLeadDetails.leads);
                const stages = Object.keys(stageCounts);

                if (stages.length === 0) {
                  return (
                    <div className="text-center text-sm text-gray-500 py-4">
                      No stage data available
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {stages.map((stage) => (
                      <div
                        key={stage}
                        className="p-3 rounded-lg border bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800"
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {stage}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs rounded-full truncate max-w-[120px] sm:max-w-[150px] ${getStageColor(stage)}`}>
                            {stage}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-gray-800 dark:text-white ml-2">
                            {stageCounts[stage]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailedReport;