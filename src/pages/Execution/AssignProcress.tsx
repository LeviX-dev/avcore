import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";
import { 
  FaUpload, FaTimes, FaTrash, FaEdit, FaSearch, FaHistory,
  FaFilter,
  FaChevronDown,
  FaFileAlt,
  FaClock,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel
} from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faCalendarAlt,
  faUser,
  faBuilding,
  faPhone,
  faMapMarkerAlt,
  faDollarSign,
  faClock,
  faFileAlt,
  faCheckCircle,
  faSearch,
  faFilter,
  faTimes as faTimesSolid,
  faDownload,
  faFileUpload,
  faImages,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage,
  faFile,
  faVideo,
  faFileText as faFileTextSolid,
  faChevronDown,
  faInfoCircle,
  faUsers,
  faTasks,
  faTrashAlt,
  faEdit,
  faFile as faFileSolid,
  faPlay,
  faCog,
  faLayerGroup,
  faPlus,
  faHistory,
  faArrowRight,
  faMinus,
  faFileText
} from '@fortawesome/free-solid-svg-icons';

// Types and Interfaces
interface MyProcess {
  execution_id: number;
  process_id: number;
  lead_id: number;
  lead_name: string;
  lead_number?: string;
  lead_city?: string;
  process_name: string;
  description?: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  remark: string | null;
  assigned_to: string[];
  assigned_to_names?: string[];
  city?: string;
  created_at: string;
  updated_at: string;
}

interface UploadedImage {
  id: number;
  execution_id: number;
  process_id: number;
  lead_id: number;
  file_path: string;
  file_name?: string;
  file_type: string;
  remark: string | null;
  uploaded_by: number;
  uploaded_by_name?: string;
  created_at: string;
}

interface DocumentLog {
  id: number;
  execution_id: number;
  lead_id: number;
  process_id: number;
  file_path: string;
  file_type: string;
  remark: string | null;
  manager_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  manager_remark: string | null;
  uploaded_by: number | null;
  uploaded_by_name?: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
}

// Action Button Component
const ActionButton = ({ 
  onUpload, 
  onLogs,
  title = "Actions",
  className = ""
}: { 
  onUpload: () => void; 
  onLogs: () => void;
  title?: string; 
  className?: string;
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* PLUS BUTTON */}
      <button
        onClick={onUpload}
        className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        title="Upload Images & Add Remark"
      >
        <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
      </button>

      {/* LOGS BUTTON */}
      <button
        onClick={onLogs}
        className="p-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        title="View Document History"
      >
        <FontAwesomeIcon icon={faHistory} className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  showingStart: number;
  showingEnd: number;
}> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showingStart,
  showingEnd,
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-white ${
            currentPage === 1
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-gray-50 dark:hover:bg-white/10'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-white ${
            currentPage === totalPages
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-gray-50 dark:hover:bg-white/10'
          }`}
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Showing
            <span className="font-medium mx-1 text-gray-900 dark:text-white">{showingStart}</span>
            to
            <span className="font-medium mx-1 text-gray-900 dark:text-white">{showingEnd}</span>
            of
            <span className="font-medium mx-1 text-gray-900 dark:text-white">{totalItems}</span>
            results
          </p>
        </div>
        <div>
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-300 inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <span className="sr-only">Previous</span>
              <FaChevronDown className="h-5 w-5 rotate-90" />
            </button>

            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 focus:outline-offset-0"
                  >
                    ...
                  </span>
                );
              }

              const pageNumber = page as number;
              const isCurrent = pageNumber === currentPage;

              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 text-xs font-semibold focus:z-20 focus:outline-offset-0 ${
                    isCurrent
                      ? 'z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900 dark:text-white inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'
                  } ${pageNumber > 9 ? 'px-3' : 'px-4'}`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-300 inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <span className="sr-only">Next</span>
              <FaChevronDown className="h-5 w-5 -rotate-90" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Process Status Update Modal Component
const ProcessStatusUpdateModal = ({ 
  process, 
  onClose, 
  onUpdate 
}: { 
  process: MyProcess | null;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [status, setStatus] = useState(process?.status || 'pending');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!process) return;
    
    try {
      setLoading(true);
      
      // Get the current assigned user IDs - need to fetch these from somewhere
      // For now, we'll keep the existing assigned_to but we need IDs
      // This assumes you have a way to get user IDs from names
      const assigned_user_ids = []; // You'll need to implement this mapping
      
      await axios.post(
        `${BASE_URL}api/execution/save-process`,
        {
          lead_id: process.lead_id,
          process_id: process.process_id,
          process_name: process.process_name,
          start_date: process.start_date,
          end_date: process.end_date,
          status: status,
          assigned_user_ids: assigned_user_ids, // Keep existing assignments
          remark: process.remark,
        },
        { withCredentials: true }
      );

      alert("Status updated successfully ✅");
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!process) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10002] p-4">
      <div className="bg-white dark:bg-boxdark w-full max-w-md rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h3 className="font-medium text-gray-800 dark:text-white text-sm">
            Update Process Status
          </h3>
          <button
            onClick={onClose}
            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Process: <span className="font-semibold text-gray-900 dark:text-white">{process.process_name}</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Lead: <span className="font-semibold text-gray-900 dark:text-white">{process.lead_name} (#{process.lead_id})</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="hold_by_client">Hold by Client</option>
              <option value="hold_by_avcore">Hold by Avcore</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <FaEdit className="h-3 w-3" />
                <span>Update Status</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Document History Logs Modal
const LogsModal = ({ 
  process, 
  onClose,
  onStatusUpdate 
}: { 
  process: MyProcess | null;
  onClose: () => void;
  onStatusUpdate: () => void;
}) => {
  const [documents, setDocuments] = useState<DocumentLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageViewer, setImageViewer] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [editingDocument, setEditingDocument] = useState<DocumentLog | null>(null);
  const [managerStatus, setManagerStatus] = useState<string>('');
  const [managerRemark, setManagerRemark] = useState('');
  const [startDate, setStartDate] = useState('');
const [startTime, setStartTime] = useState('');
const [endTime, setEndTime] = useState('');
  
  // State for process status update modal
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);

  // Fetch user role from server
  const fetchUserRole = async () => {
    try {
      const response = await axios.get(`${BASE_URL}auth/get-role`, {
        withCredentials: true
      });
      if (response.data?.role) {
        setUserRole(response.data.role);
        console.log("User role fetched:", response.data.role);
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
  };

  useEffect(() => {
    fetchUserRole();
    
    if (process?.execution_id && process?.process_id) {
      fetchDocuments();
    }
  }, [process]);

  const fetchDocuments = async () => {
    if (!process?.execution_id || !process?.process_id) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}api/daily-execution/upload/${process.execution_id}/${process.process_id}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        setDocuments(res.data.data || []);
      }
    } catch (err) {
      console.error("fetch documents error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateManagerStatus = async () => {
    if (!editingDocument) return;

    try {
      await axios.put(
        `${BASE_URL}api/daily-execution/document/${editingDocument.id}/status`,
        {
          manager_status: managerStatus,
          manager_remark: managerRemark
        },
        { withCredentials: true }
      );

      // Refresh documents
      await fetchDocuments();
      setEditingDocument(null);
      setManagerStatus('');
      setManagerRemark('');
    } catch (err) {
      console.error("Error updating document status:", err);
      alert("Failed to update document status");
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="h-4 w-4 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) 
      return <FaFileImage className="h-4 w-4 text-blue-500" />;
    if (['doc', 'docx'].includes(extension || '')) 
      return <FaFileWord className="h-4 w-4 text-blue-700" />;
    if (['xls', 'xlsx'].includes(extension || '')) 
      return <FaFileExcel className="h-4 w-4 text-green-600" />;
    return <FaFileAlt className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'approved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'needs_revision': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  // Check if user is admin or manager (based on your role values)
  const canManageProcess = userRole === 'admin' || userRole === 'manager';

  // For debugging
  useEffect(() => {
    console.log("Current user role:", userRole);
    console.log("Can manage process:", canManageProcess);
  }, [userRole]);

  if (!process) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[9999] pt-20">
        <div className="bg-white dark:bg-boxdark w-full max-w-3xl rounded-lg shadow-lg">
          {/* Header with Process Status Update Button - Only visible to Admin/Manager */}
          <div className="flex justify-between items-center border-b px-3 py-2">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white text-sm">
                Document History - {process.process_name}
              </h3>
              <p className="text-xs text-gray-500">
                Lead: {process.lead_name} #{process.lead_id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Process Status Update Button - Only visible to Admin/Manager */}
              {canManageProcess && (
                <button
                  onClick={() => setShowStatusUpdateModal(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-sm"
                  title="Update Process Status"
                >
                  <FaEdit className="h-3 w-3" />
                  <span>Update Process Status</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-3 py-2 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FaFileAlt className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-xs text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const fileName = doc.file_path.split('/').pop() || 'Unknown file';
                  const isImage = doc.file_path.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                  
                  return (
                    <div 
                      key={doc.id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* File Icon/Thumbnail */}
                        <div className="flex-shrink-0">
                          {isImage ? (
                            <img
                              src={`${BASE_URL}uploads/${doc.file_path}`}
                              alt={fileName}
                              className="h-12 w-12 object-cover rounded cursor-pointer border"
                              onClick={() => setImageViewer(`${BASE_URL}uploads/${doc.file_path}`)}
                            />
                          ) : (
                            getFileIcon(doc.file_path)
                          )}
                        </div>

                        {/* Document Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-md">
                                {fileName}
                              </p>
                              
                              {/* Status Badge */}
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadge(doc.manager_status)}`}>
                                  {doc.manager_status?.replace('_', ' ') || 'pending'}
                                </span>
                                <p className="text-[10px] text-gray-500">
                                  by {doc.uploaded_by_name || 'Unknown'} • {formatDateTime(doc.created_at)}
                                </p>
                              </div>

                              {/* User Remark */}
                              {doc.remark && (
                                <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                  <p className="text-[10px] text-blue-700 dark:text-blue-300">
                                    <span className="font-medium">Remark:</span> {doc.remark}
                                  </p>
                                </div>
                              )}

                              {/* Manager Remark */}
                              {doc.manager_remark && (
                                <div className="mt-1 bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                  <p className="text-[10px] text-purple-700 dark:text-purple-300">
                                    <span className="font-medium">Manager Remark:</span> {doc.manager_remark}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5">
                              {/* View Button with Eye Icon */}
                              {isImage && (
                                <button
                                  onClick={() => setImageViewer(`${BASE_URL}uploads/${doc.file_path}`)}
                                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all duration-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                                  title="View Image"
                                >
                                  <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                                </button>
                              )}
                              
                              {/* Admin Only Edit Button */}
                              {userRole === 'admin' && (
                                <button
                                  onClick={() => {
                                    setEditingDocument(doc);
                                    setManagerStatus(doc.manager_status);
                                    setManagerRemark(doc.manager_remark || '');
                                  }}
                                  className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all duration-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                                  title="Admin: Update Status & Remark"
                                >
                                  <FaEdit className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t px-3 py-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Manager Status Edit Modal - Only accessible by admin */}
      {editingDocument && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10001] p-4">
          <div className="bg-white dark:bg-boxdark w-full max-w-md rounded-lg shadow-lg">
            <div className="flex justify-between items-center border-b px-4 py-3">
              <h3 className="font-medium text-gray-800 dark:text-white text-sm">
                Update Document Status (Admin)
              </h3>
              <button
                onClick={() => setEditingDocument(null)}
                className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={managerStatus}
                  onChange={(e) => setManagerStatus(e.target.value)}
                  className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="needs_revision">Needs Revision</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Manager Remark
                </label>
                <textarea
                  value={managerRemark}
                  onChange={(e) => setManagerRemark(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter your feedback..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t px-4 py-3">
              <button
                onClick={() => setEditingDocument(null)}
                className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateManagerStatus}
                className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Status Update Modal - Only opens if user has permission */}
      {showStatusUpdateModal && (
        <ProcessStatusUpdateModal
          process={process}
          onClose={() => setShowStatusUpdateModal(false)}
          onUpdate={onStatusUpdate}
        />
      )}

      {/* Image Viewer Modal */}
      {imageViewer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] p-4">
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={imageViewer}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setImageViewer(null)}
              className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-lg hover:bg-gray-100"
            >
              <FaTimes className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Upload Modal
// Upload Modal - Fixed Version
const UploadModal = ({ 
  process, 
  onClose,
  onUploadComplete
}: { 
  process: MyProcess | null;
  onClose: () => void;
  onUploadComplete: () => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newRemark, setNewRemark] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageViewer, setImageViewer] = useState<UploadedImage | null>(null);
  const [loading, setLoading] = useState(false);
  
// ✅ FIX: Properly initialize these state variables
const [startDate, setStartDate] = useState<string>(
  new Date().toISOString().split('T')[0]
);
const [startTime, setStartTime] = useState<string>('');
const [endTime, setEndTime] = useState<string>('');

  const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

  useEffect(() => {
    if (process?.execution_id && process?.process_id) {
      fetchImages();
    }
  }, [process]);

  const fetchImages = async () => {
    if (!process?.execution_id || !process?.process_id) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}api/daily-execution/upload/${process.execution_id}/${process.process_id}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        setUploadedImages(res.data.data || []);
      }
    } catch (err) {
      console.error("fetch images error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (index === 0) {
      setImagePreview(null);
    }
  };

  const handleUpload = async () => {
    if (!process?.execution_id || !process?.process_id || !process?.lead_id) {
      alert("Missing execution/process/lead");
      return;
    }

    if (!selectedFiles.length) {
      alert("Please select files");
      return;
    }

    // ✅ Validation for start/end times
    if (startTime && endTime && startTime > endTime) {
      alert("End time must be greater than start time");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      // Files
      selectedFiles.forEach(f => formData.append("files", f));

      // Existing fields
      formData.append("remark", newRemark || "");
      formData.append("lead_id", String(process.lead_id));

      // ✅ NEW FIELDS - only append if they have values
      if (startDate) formData.append("start_date", startDate);
      if (startTime) formData.append("start_time", startTime);
      if (endTime) formData.append("end_time", endTime);

      await axios.post(
        `${BASE_URL}api/daily-execution/upload/${process.execution_id}/${process.process_id}`,
        formData,
        { withCredentials: true }
      );

      // ✅ Reset all form fields
      await fetchImages();
      setSelectedFiles([]);
      setImagePreview(null);
      setNewRemark("");
setStartDate(getTodayDate()); // ✅ reset to today's date
      setStartTime("");
      setEndTime("");

      onUploadComplete();

    } catch (err) {
      console.error(err);
      alert("Failed to upload");
    } finally {
      setUploading(false);
    }
  };
  
  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await axios.delete(
        `${BASE_URL}api/daily-execution/images/${imageId}`,
        { withCredentials: true }
      );
      await fetchImages();
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  if (!process) return null;

 return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-24">
        <div className="bg-white dark:bg-boxdark w-full max-w-2xl rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center border-b px-3 py-2">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white text-sm">
                {process.process_name}
              </h3>
              <p className="text-xs text-gray-500">
                Lead: {process.lead_name} #{process.lead_id}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="px-3 py-2 space-y-3 max-h-[55vh] overflow-y-auto">
            {/* Status */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                process.status === 'completed' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : process.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : process.status === 'hold_by_client'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                  : process.status === 'hold_by_avcore'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {process.status?.replace(/_/g, ' ') || 'pending'}
              </span>
            </div>

            {/* Remark Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Add Remark
              </label>
              <textarea
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter your remark here..."
                className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                rows={2}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Upload Images
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                  <div className="flex flex-col items-center justify-center py-2">
                    <FaUpload className="w-5 h-5 mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Selected Files Preview with Scrollbar */}
            {selectedFiles.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Selected ({selectedFiles.length})
                </p>
                <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto p-1 border border-gray-200 dark:border-gray-700 rounded">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${index}`}
                          className="h-16 w-full object-cover rounded border"
                        />
                      ) : (
                        <div className="h-16 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border">
                          <FaFileAlt className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTrash className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Images with Scrollbar */}
            {uploadedImages.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Uploaded ({uploadedImages.length})
                </p>
                <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto p-1 border border-gray-200 dark:border-gray-700 rounded">
                  {uploadedImages.map(img => (
                    <div key={img.id} className="relative group">
                      <img
                        src={`${BASE_URL}uploads/${img.file_path}`}
                        alt={img.file_name || 'Uploaded image'}
                        className="h-16 w-full object-cover rounded cursor-pointer border"
                        onClick={() => setImageViewer(img)}
                      />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTrash className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

       {/* Date/Time Inputs */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
  {/* Start Date */}
  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
    placeholder="Start Date"
  />

  {/* Start Time */}
  <input
    type="time"
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)}
    className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
    placeholder="Start Time"
  />

  {/* End Time */}
  <input
    type="time"
    value={endTime}
    onChange={(e) => setEndTime(e.target.value)}
    className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
    placeholder="End Time"
  />
</div>

          {/* Footer - Save button hidden when more than one image is uploaded */}
          <div className="flex justify-end gap-2 border-t px-3 py-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            {(!uploadedImages || uploadedImages.length <= 1) && (
              <button
                onClick={handleUpload}
                disabled={uploading || (selectedFiles.length === 0 && !newRemark)}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaUpload className="h-3 w-3" />
                    <span>Save</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {imageViewer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={`${BASE_URL}uploads/${imageViewer.file_path}`}
              alt={imageViewer.file_name || 'Uploaded image'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setImageViewer(null)}
              className="absolute top-4 right-4 bg-white p-1.5 rounded-full shadow-lg hover:bg-gray-100"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Main AssignProcess Component
const AssignProcess = () => {
  const [processes, setProcesses] = useState<MyProcess[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<MyProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalProcesses, setTotalProcesses] = useState(0);
  
  // Modal states
  const [uploadModal, setUploadModal] = useState<MyProcess | null>(null);
  const [logsModal, setLogsModal] = useState<MyProcess | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [customRecordCount, setCustomRecordCount] = useState<number | ''>('');
  
  // Refs
  const statusFilterRef = useRef<HTMLDivElement>(null);

  // Fetch my processes
  const fetchMyProcesses = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}api/daily-execution/my-processes`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
          withCredentials: true,
        }
      );

      if (response.data?.success) {
        const raw = response.data.data || [];

        // ✅ convert assigned_to string → array
        const formatted: MyProcess[] = raw.map((p: any) => ({
          ...p,
          assigned_to: p.assigned_to
            ? p.assigned_to.split(",").map((n: string) => n.trim())
            : [],
        }));

        setProcesses(formatted);
        setFilteredProcesses(formatted);
        setTotalProcesses(response.data.pagination?.total || formatted.length);
      } else {
        setProcesses([]);
        setFilteredProcesses([]);
        setTotalProcesses(0);
      }
    } catch (error) {
      console.error("Error fetching my processes:", error);
      setProcesses([]);
      setFilteredProcesses([]);
      setTotalProcesses(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProcesses();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, processes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusFilterRef.current && !statusFilterRef.current.contains(event.target as Node)) {
        setShowStatusFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const applyFilters = () => {
    let filtered = [...processes];

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.lead_name?.toLowerCase().includes(lowerSearch) ||
        p.process_name?.toLowerCase().includes(lowerSearch) ||
        p.lead_number?.includes(lowerSearch) ||
        String(p.lead_id).includes(lowerSearch) ||
        p.city?.toLowerCase().includes(lowerSearch)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredProcesses(filtered);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'hold_by_client': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'hold_by_avcore': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const handleStatusSelect = (status: string) => {
    setStatusFilter(status === statusFilter ? '' : status);
    setShowStatusFilter(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCustomRecordCount('');
    setItemsPerPage(10);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleCustomRecordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setCustomRecordCount('');
      setItemsPerPage(10);
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setCustomRecordCount(numValue);
      setItemsPerPage(numValue);
      setCurrentPage(1);
    }
  };

  const totalPages = Math.ceil(totalProcesses / itemsPerPage);
  const showingStart = totalProcesses === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalProcesses);

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(processes.map(p => p.status)));

  return (
    <div className="p-4">
      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">  
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30">
                <FaClock className="w-4 h-4 mr-1" />
                {totalProcesses} Processes
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Custom Record Count Input */}
              <div className="w-full sm:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFileAlt className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    className="w-full pl-10 pr-10 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Show N records"
                    value={customRecordCount}
                    onChange={handleCustomRecordInput}
                    min="1"
                  />
                  {customRecordCount && (
                    <button
                      onClick={() => {
                        setCustomRecordCount('');
                        setItemsPerPage(10);
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Input */}
              <div className="w-full sm:w-72">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Search lead, process, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative" ref={statusFilterRef}>
                <button
                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                  className={`px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                    statusFilter 
                      ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaFilter className="h-3.5 w-3.5" />
                  <span>{statusFilter ? statusFilter.replace(/_/g, ' ') : 'Status'}</span>
                  <FaChevronDown className={`h-3 w-3 transition-transform duration-200 ${showStatusFilter ? 'rotate-180' : ''}`} />
                </button>

                {showStatusFilter && (
                  <div className="absolute right-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]">
                    <button
                      onClick={() => handleStatusSelect('')}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      All Statuses
                    </button>
                    {uniqueStatuses.map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusSelect(status)}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          statusFilter === status 
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {status.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
      
              {/* Reset Filter Button */}
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <FaTimes className="h-4 w-4" />
                Reset Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || statusFilter) && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                Status: {statusFilter.replace(/_/g, ' ')}
                <button
                  onClick={() => setStatusFilter('')}
                  className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="ml-2 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Lead
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Process
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Start Date
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      End Date
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Assigned To
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Action
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredProcesses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <FaFileAlt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-xs font-medium">No processes found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProcesses.map((process) => (
                    <tr 
                      key={`${process.execution_id}-${process.process_id}`} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Lead */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-xs">
                            {process.lead_name || `Lead #${process.lead_id}`}
                          </div>
                          {process.lead_city && (
                            <div className="text-[10px] text-gray-500">
                              {process.lead_city}
                            </div>
                          )}
                          {process.lead_number && (
                            <div className="text-[10px] text-gray-400 mt-1">
                              {process.lead_number}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Process */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs">
                          {process.process_name}
                        </div>
                        {process.description && (
                          <div className="text-[10px] text-gray-500 mt-1">
                            {process.description}
                          </div>
                        )}
                      </td>

                      {/* Start Date */}
                      <td className="py-4 px-4 text-center">
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-[10px]">
                          {formatDate(process.start_date)}
                        </span>
                      </td>

                      {/* End Date */}
                      <td className="py-4 px-4 text-center">
                        <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded text-[10px]">
                          {formatDate(process.end_date)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${getStatusColor(process.status)}`}>
                          {process.status?.replace(/_/g, ' ') || 'pending'}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {process.assigned_to?.length ? (
                            process.assigned_to.map((name, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-[10px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-center">
                        <ActionButton
                          onUpload={() => setUploadModal(process)}
                          onLogs={() => setLogsModal(process)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalProcesses}
              itemsPerPage={itemsPerPage}
              showingStart={showingStart}
              showingEnd={showingEnd}
            />
          )}
        </>
      )}

      {/* Modals */}
      {uploadModal && (
        <UploadModal
          process={uploadModal}
          onClose={() => setUploadModal(null)}
          onUploadComplete={fetchMyProcesses}
        />
      )}

      {logsModal && (
        <LogsModal
          process={logsModal}
          onClose={() => setLogsModal(null)}
          onStatusUpdate={fetchMyProcesses}
        />
      )}
    </div>
  );
};

export default AssignProcess;