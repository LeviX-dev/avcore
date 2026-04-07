import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";
import { 
  FiX,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle
} from "react-icons/fi";

interface EmployeeReport {
  employee_name: string;
  role: string;
  total_assigned: number;
  converted_count: number;
  not_converted_count: number;
  drop_count: number;        // NEW
  loss_count: number;        // NEW
  total_dropped_lost: number; // NEW
  lead_details: any[];
}

interface LeadData {
  master_id: number;
  lead_name: string;
  number: string;
  email: string;
  city: string;
  stage: string;
  remark: string;
  assign_date: string | null;
  reassignment_date: string | null;
  drop_loss_type?: string;    // NEW - 'Drop' or 'loss'
  drop_loss_date?: string | null;  // NEW
  drop_loss_remark?: string | null; // NEW
  drop_loss_status?: string;   // NEW - 'Dropped', 'Lost', or 'Active'
  is_dropped_or_lost?: number; // NEW - 1 or 0
}

const PAGE_SIZE = 10;

const EmployeeDetailedReport = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<EmployeeReport[]>([]);
  const [filteredData, setFilteredData] = useState<EmployeeReport[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const [leadData, setLeadData] = useState<LeadData[]>([]);
  const [leadPage, setLeadPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const [selectedLeadModal, setSelectedLeadModal] = useState<{
    employee: string;
    type: string;
    visible: boolean;
  } | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Get unique roles for filter
  const uniqueRoles = useMemo(() => {
    const roles: string[] = [];
    const roleSet = new Set<string>();
    
    reportData.forEach(item => {
      if (item.role && !roleSet.has(item.role)) {
        roleSet.add(item.role);
        roles.push(item.role);
      }
    });
    
    return roles;
  }, [reportData]);

  // Get unique employees for filter
  const uniqueEmployees = useMemo(() => {
    const employees: string[] = [];
    const employeeSet = new Set<string>();
    
    reportData.forEach(item => {
      if (item.employee_name && !employeeSet.has(item.employee_name)) {
        employeeSet.add(item.employee_name);
        employees.push(item.employee_name);
      }
    });
    
    return employees;
  }, [reportData]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const fetchEmployeeDetailedReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${BASE_URL}api/reports/employee-detailed`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Ensure each employee has valid lead_details and drop/loss counts
        const processedData = (response.data.data || []).map((emp: EmployeeReport) => ({
          ...emp,
          drop_count: emp.drop_count || 0,
          loss_count: emp.loss_count || 0,
          total_dropped_lost: emp.total_dropped_lost || 0,
          lead_details: Array.isArray(emp.lead_details) ? emp.lead_details : []
        }));
        
        setReportData(processedData);
        setFilteredData(processedData);
      } else {
        setError('Failed to load report data');
      }
    } catch (error) {
      console.error("Error loading report", error);
      setError('Network error while loading report');
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
      result = result.filter(e => e.employee_name === selectedEmployee);
    }

    if (selectedRole) {
      result = result.filter(e => e.role === selectedRole);
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [selectedEmployee, selectedRole, reportData]);

  const fetchEmployeeLeads = async (employeeName: string, type: string = "all") => {
    try {
      setLoadingLeads(true);
      setLeadError(null);
      setLeadPage(1);
      
      const encodedName = encodeURIComponent(employeeName);
      let url = `${BASE_URL}api/reports/employee-leads/${encodedName}`;
      
      if (type !== "all") {
        url += `/${type}`;
      }

      const response = await axios.get(url, { withCredentials: true });

      if (response.data.success) {
        // Ensure we have an array
        const leads = Array.isArray(response.data.data) ? response.data.data : [];
        setLeadData(leads);
        setTotalLeads(leads.length);
        setSelectedLeadModal({
          employee: employeeName,
          type: type,
          visible: true
        });
      } else {
        setLeadError('Failed to load leads');
      }
    } catch (error) {
      console.error("Error fetching leads", error);
      setLeadError('Network error while loading leads');
    } finally {
      setLoadingLeads(false);
    }
  };

  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (leadPage - 1) * PAGE_SIZE;
    return leadData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [leadData, leadPage]);

  const totalLeadPages = Math.ceil(leadData.length / PAGE_SIZE);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "Invalid date";
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'converted': return 'Converted';
      case 'not_converted': return 'Not Converted';
      case 'drop': return 'Dropped';
      case 'lost': return 'Lost';
      default: return 'All';
    }
  };

  const getDropLossBadgeColor = (status: string) => {
    switch(status) {
      case 'Dropped':
        return 'bg-red-100 text-red-700';
      case 'Lost':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
    

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <FiAlertCircle size={16} />
          <span className="text-sm">{error}</span>
          <button 
            onClick={fetchEmployeeDetailedReport}
            className="ml-auto text-xs bg-red-100 px-2 py-1 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Employees</option>
          {uniqueEmployees.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          {uniqueRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        {filteredData.length > 0 && (
          <span className="text-sm text-gray-500 ml-auto">
            {filteredData.length} employee{filteredData.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Pagination on Top */}
            {filteredData.length > 0 && totalPages > 1 && (
              <div className="px-3 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredData.length)} of {filteredData.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                    >
                      <FiChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1 rounded border border-gray-200 bg-white">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 text-left font-medium text-gray-600">Employee</th>
                  <th className="p-3 text-left font-medium text-gray-600">Role</th>
                  <th className="p-3 text-center font-medium text-gray-600">Total Assign</th>
                  <th className="p-3 text-center font-medium text-gray-600">Converted</th>
                  <th className="p-3 text-center font-medium text-gray-600">Pending</th>
                  <th className="p-3 text-center font-medium text-gray-600">Drop</th>
                  <th className="p-3 text-center font-medium text-gray-600">Lost</th>
                  <th className="p-3 text-center font-medium text-gray-600">Conversion Ratio</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedData.length > 0 ? (
                  paginatedData.map((employee, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{employee.employee_name}</td>
                      <td className="p-3 text-gray-600">{employee.role}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchEmployeeLeads(employee.employee_name, "all")}
                          className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                          title={`View all ${employee.total_assigned} leads`}
                        >
                          {employee.total_assigned}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchEmployeeLeads(employee.employee_name, "converted")}
                          className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-sm"
                          title={`View ${employee.converted_count} converted leads`}
                        >
                          {employee.converted_count}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchEmployeeLeads(employee.employee_name, "not_converted")}
                          className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors text-sm"
                          title={`View ${employee.not_converted_count} pending leads`}
                        >
                          {employee.not_converted_count}
                        </button>
                      </td>
                      {/* NEW Drop Column */}
                   <td className="p-3 text-center">
  <span
    className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-red-100 text-red-700 text-sm"
    title={`${employee.drop_count || 0} dropped leads`}
  >
    {employee.drop_count || 0}
  </span>
</td>

{/* Loss Column */}
<td className="p-3 text-center">
  <span
    className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-sm"
    title={`${employee.loss_count || 0} lost leads`}
  >
    {employee.loss_count || 0}
  </span>
</td>

                      <td className="p-3 text-center w-[220px]">
                        {(() => {
                          const percent =
                            employee.total_assigned > 0
                              ? (employee.converted_count / employee.total_assigned) * 100
                              : 0;

                          return (
                            <div className="flex flex-col items-center gap-1">
                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-green-500 h-2 transition-all"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>

                              {/* Percentage */}
                              <span className="text-xs font-medium text-gray-700">
                                {percent.toFixed(2)}%
                              </span>
                            </div>
                          );
                        })()}
                       </td>
                     </tr>
                  ))
                ) : (
                  <tr>
<td colSpan={8} className="p-8 text-center text-gray-500">     
                   No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination on Bottom */}
            {filteredData.length > 0 && totalPages > 1 && (
              <div className="px-3 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredData.length)} of {filteredData.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                    >
                      <FiChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1 rounded border border-gray-200 bg-white">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

       {/* Leads Modal */}
      {selectedLeadModal && selectedLeadModal.visible && (
<div className="fixed inset-0 bg-black/20 flex items-start justify-center pt-22 p-4 z-50">      
    <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Modal Header */}
<div className="flex items-center justify-between p-4 border-b">
  
  <div className="flex items-center gap-3 text-sm">
    <span className="font-semibold text-gray-800">
      {selectedLeadModal.employee}
    </span>

    <span className="text-gray-500">
      {getTypeLabel(selectedLeadModal.type)} Leads • {totalLeads} total
    </span>
  </div>

  <button
    onClick={() => {
      setSelectedLeadModal(null);
      setLeadData([]);
      setLeadPage(1);
      setLeadError(null);
    }}
    className="p-1 hover:bg-gray-100 rounded"
  >
    <FiX size={18} className="text-gray-500" />
  </button>

</div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto">
              {loadingLeads ? (
                <div className="p-8 text-center text-gray-500">Loading leads...</div>
              ) : leadError ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-md">
                    <FiAlertCircle size={16} />
                    <span className="text-sm">{leadError}</span>
                  </div>
                </div>
              ) : (
                <>
                  {paginatedLeads.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left font-medium text-gray-600">Lead</th>
                          <th className="p-3 text-left font-medium text-gray-600">Contact</th>
                          <th className="p-3 text-left font-medium text-gray-600">City</th>
                          <th className="p-3 text-left font-medium text-gray-600">Assigned Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedLeads.map((lead, index) => (
                          <tr key={lead.master_id || index} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">{lead.lead_name || '—'}</td>
                            <td className="p-3">
                              <div className="space-y-1">
                                {lead.number && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <FiPhone size={12} />
                                    <span>{lead.number}</span>
                                  </div>
                                )}
                                {lead.email && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <FiMail size={12} />
                                    <span className="truncate max-w-[180px]">{lead.email}</span>
                                  </div>
                                )}
                                {!lead.number && !lead.email && '—'}
                              </div>
                            </td>
                            <td className="p-3">
                              {lead.city ? (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <FiMapPin size={12} />
                                  <span>{lead.city}</span>
                                </div>
                              ) : '—'}
                            </td>
                            <td className="p-3">
                              {lead.assign_date ? (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <FiCalendar size={12} />
                                  <span>{formatDate(lead.assign_date)}</span>
                                </div>
                              ) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No leads found
                    </div>
                  )}

                  {/* Modal Pagination */}
                  {leadData.length > 0 && totalLeadPages > 1 && (
                    <div className="p-3 border-t bg-gray-50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Showing {((leadPage - 1) * PAGE_SIZE) + 1} to {Math.min(leadPage * PAGE_SIZE, leadData.length)} of {leadData.length}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setLeadPage(p => Math.max(1, p - 1))}
                            disabled={leadPage === 1}
                            className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40"
                          >
                            <FiChevronLeft size={16} />
                          </button>
                          <span className="px-3 py-1 rounded border border-gray-200 bg-white">
                            Page {leadPage} of {totalLeadPages}
                          </span>
                          <button
                            onClick={() => setLeadPage(p => Math.min(totalLeadPages, p + 1))}
                            disabled={leadPage === totalLeadPages}
                            className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40"
                          >
                            <FiChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeDetailedReport;