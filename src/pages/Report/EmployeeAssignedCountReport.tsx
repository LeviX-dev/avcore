import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFilter, faSearch, faTimes, faUser, faChartLine, faCalendarAlt, faHistory } from '@fortawesome/free-solid-svg-icons';

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
  drop_count: number;
  closed_count: number;
  lead_details: string;
}

const EmployeeDetailedReport = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<EmployeeReport[]>([]);
  const [filteredData, setFilteredData] = useState<EmployeeReport[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<{
    employee: string;
    leads: LeadDetail[];
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
        emp.employee_name.toLowerCase().includes(selectedEmployee.toLowerCase())
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

  const parseLeadDetails = (leadDetailsJson: string): LeadDetail[] => {
    try {
      return JSON.parse(leadDetailsJson);
    } catch (error) {
      console.error('Error parsing lead details:', error);
      return [];
    }
  };

  const parseStageHistory = (stageHistoryJson: string): StageHistory[] => {
    try {
      const cleanedJson = stageHistoryJson
        .replace(/\\\"/g, '"')
        .replace(/\\\\n/g, '\n')
        .replace(/\\\\"/g, '"');
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Error parsing stage history:', error);
      return [];
    }
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

  const handleViewLeadDetails = (employeeName: string, leadDetailsJson: string) => {
    const leads = parseLeadDetails(leadDetailsJson);
    setSelectedLeadDetails({
      employee: employeeName,
      leads
    });
  };

  const uniqueRoles = Array.from(new Set(reportData.map(emp => emp.role)));

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
      case 'drop':
        return `${base} bg-gradient-to-r from-red-500 to-red-600 text-white`;
      case 'closed':
        return `${base} bg-gradient-to-r from-emerald-500 to-emerald-600 text-white`;
      default:
        return `${base} bg-gray-200 text-gray-800`;
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
            <div className={getCountColor('drop', employee.drop_count)}>
              {employee.drop_count}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Drop</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className={getCountColor('closed', employee.closed_count)}>
              {employee.closed_count}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Closed</div>
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
    {/* Search */}
    <div className="flex-1">
      <div className="relative">
        <FontAwesomeIcon 
          icon={faSearch} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" 
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search employees..."
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300/80 dark:border-gray-600/80 rounded-lg 
            bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white 
            focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm h-full"
        />
      </div>
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
                    {filteredData.reduce((sum, emp) => sum + emp.closed_count, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Closed</div>
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
            <table className="w-full min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200/50 dark:border-gray-700/50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Today
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Upcoming
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Missed
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Drop
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Closed
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {filteredData.map((employee, index) => {
                  const leads = parseLeadDetails(employee.lead_details);
                  const uniqueLeads = leads.length;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      {/* Employee Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {employee.employee_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Role */}
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300">
                          {employee.role}
                        </span>
                      </td>
                      
                      {/* Counts */}
                      <td className="py-3 px-4">
                        <span className={getCountColor('total', employee.total_assigned)}>
                          {employee.total_assigned}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={getCountColor('today', employee.today_assigned)}>
                          {employee.today_assigned}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={getCountColor('upcoming', employee.upcoming_assigned)}>
                          {employee.upcoming_assigned}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={getCountColor('missed', employee.missed_assigned)}>
                          {employee.missed_assigned}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={getCountColor('drop', employee.drop_count)}>
                          {employee.drop_count}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={getCountColor('closed', employee.closed_count)}>
                          {employee.closed_count}
                        </span>
                      </td>
                      
                      {/* Lead Details Button */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {uniqueLeads}
                          </span>
                          <button
                            onClick={() => handleViewLeadDetails(employee.employee_name, employee.lead_details)}
                            className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                              text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow"
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
                  <td className="py-3 px-4 font-semibold text-sm text-gray-900 dark:text-white">
                    {filteredData.length} Total
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      -
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">
                    {filteredData.reduce((sum, emp) => sum + emp.total_assigned, 0)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                    {filteredData.reduce((sum, emp) => sum + emp.today_assigned, 0)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-600 dark:text-amber-400">
                    {filteredData.reduce((sum, emp) => sum + emp.upcoming_assigned, 0)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-rose-600 dark:text-rose-400">
                    {filteredData.reduce((sum, emp) => sum + emp.missed_assigned, 0)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-red-600 dark:text-red-400">
                    {filteredData.reduce((sum, emp) => sum + emp.drop_count, 0)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    {filteredData.reduce((sum, emp) => sum + emp.closed_count, 0)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {filteredData.reduce((sum, emp) => sum + parseLeadDetails(emp.lead_details).length, 0)} leads
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

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