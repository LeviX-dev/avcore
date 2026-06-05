import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  FaUpload, FaTimes, FaTrash, FaEdit, FaSearch, FaHistory,
  FaFilter, FaChevronDown, FaFileAlt, FaClock, FaFilePdf,
  FaFileImage, FaFileWord, FaFileExcel, FaMapMarkerAlt, FaEye,
  FaCalendarAlt
} from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faCalendarAlt, faUser, faBuilding, faPhone,
  faMapMarkerAlt, faDollarSign, faClock as faClockSolid,
  faFileAlt as faFileAltSolid, faCheckCircle, faSearch as faSearchSolid,
  faFilter as faFilterSolid, faTimes as faTimesSolid, faDownload,
  faFileUpload, faImages, faFilePdf as faFilePdfSolid,
  faFileWord as faFileWordSolid, faFileExcel as faFileExcelSolid,
  faFileImage as faFileImageSolid, faFile, faVideo,
  faFileText as faFileTextSolid, faChevronDown as faChevronDownSolid,
  faInfoCircle, faUsers, faTasks, faTrashAlt, faEdit as faEditSolid,
  faFile as faFileSolid, faPlay, faCog, faLayerGroup, faPlus,
  faHistory as faHistorySolid, faArrowRight, faMinus, faFileText,
  faUpload as faUploadSolid,
  faFolderOpen,
  faImage,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from "../../../public/config.js";


// ============================================================
// TYPES & INTERFACES
// ============================================================
interface MyProcess {
  type_name: string;
  execution_type: string;
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
  manager_status?: string | null;
  manager_remark?: string | null;
  location_link?: string | null;
  number?: string;
  architect_name?: string;
  ar_number?: string;
  ca_number?: string;
  e_number?: string;
  sm_number?: string;
  pop_number?: string;
  other_number?: string;
  area_name?: string;
  completion_percentage?: number;
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

interface AssignProcessProps {
  onViewAll?: () => void;
  managerReportRef?: React.RefObject<{
    scrollToTop: () => void;
    refreshData: () => void;
  }>;
}

// ============================================================
// UNIFIED VIEW MODAL - Shows Documents, Quotation, and Checklist in tabs
// ============================================================

// ============================================================
// UNIFIED VIEW MODAL - Shows Details, Quotation, Documents, and Checklist in tabs
// ============================================================

// ============================================================
// UNIFIED VIEW MODAL - Shows Details, Quotation, Execution Documents, Lead Documents, and Checklist in tabs
// ============================================================
const UnifiedViewModal = ({ 
  show, 
  onClose, 
  lead, 
  executionDocuments,  // Changed from 'documents' to 'executionDocuments'
  loadingExecutionDocs,
  leadDocuments,       // New prop for lead documents
  loadingLeadDocs,
  quotationData,
  quotationLoading,
  checklistItems,
  selectedChecklistItems,
  checklistLoading,
  BASE_URL
}) => {
  const [activeTab, setActiveTab] = useState('details'); // Default to details tab

  if (!show || !lead) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    const colors = {
      'approved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'needs_revision': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getImageUrl = (filePath) => {
    if (!filePath) return null;
    return `${BASE_URL}uploads/${filePath}`;
  };

  const getFileIcon = (extension: string) => {
    const ext = extension?.toLowerCase() || '';
    if (ext.includes('pdf')) return '📕';
    if (ext.includes('doc')) return '📄';
    if (ext.includes('xls')) return '📊';
    if (ext.includes('ppt')) return '📽️';
    if (ext.includes('txt')) return '📝';
    return '📎';
  };

  const EMPTY_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNlNWU3ZWIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+SW1hZ2U8L3RleHQ+PC9zdmc+';

  // Format value helper for details tab
  const formatValue = (value: any) => {
    if (!value || value === '' || value === 'null' || value === 'undefined') return '—';
    return String(value);
  };

  const openLocation = (link: string | null | undefined) => {
    if (link && link !== 'null' && link !== 'undefined') {
      window.open(link, '_blank');
    } else {
      alert('No location link available');
    }
  };

  // Detail groups for Details tab
  const detailGroups = [
    { label: "Lead Info", items: [
      { label: "Name", value: lead.lead_name || lead.name },
      { label: "Phone", value: lead.lead_number || lead.number },
      { label: "City", value: lead.lead_city || lead.city },
      { label: "Location", value: lead.location_link ? (
        <button onClick={() => openLocation(lead.location_link)} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1">
          <FaMapMarkerAlt className="h-2.5 w-2.5" /> Open Map
        </button>
      ) : "—" }
    ]},
    { label: "Architect Details", items: [
      { label: "Architect", value: lead.architect_name },
      { label: "AR Number", value: lead.ar_number },
      { label: "CA Number", value: lead.ca_number }
    ]},
    { label: "Contact Numbers", items: [
      { label: "E Number", value: lead.e_number },
      { label: "SM Number", value: lead.sm_number },
      { label: "POP Number", value: lead.pop_number },
      { label: "Other", value: lead.other_number }
    ]},
  ];

  // Quotation data
  const quotationsArray = quotationData?.quotations || [];
  const quotation = quotationsArray[0] || {};
  const quotationItems = quotation.items || [];

  // Group quotation items by kit/option
  const quotationOptions = quotationItems.map((kit, index) => ({
    option_number: index + 1,
    option_name: kit.kit_name,
    items: kit.items || []
  }));

  // Get selected checklist items with details
  const getSelectedItemsWithDetails = () => {
    const result = [];
    if (!checklistItems || !selectedChecklistItems) return result;
    
    checklistItems.forEach(checklist => {
      checklist.items.forEach(item => {
        if (selectedChecklistItems.includes(item.item_id)) {
          result.push({
            ...item,
            checklist_name: checklist.checklist_name
          });
        }
      });
    });
    return result;
  };

  const selectedChecklistDetails = getSelectedItemsWithDetails();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div>
            <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faEye} className="text-blue-500" />
              Client Details
            </h2>
            <p className="text-sm text-gray-500">
              {lead.lead_name || lead.name} • #{lead.lead_id || lead.master_id}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-xl px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation - 5 tabs */}
        <div className="flex border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'details'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-white dark:bg-gray-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            } rounded-t-lg`}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
            Details
          </button>
          
          <button
            onClick={() => setActiveTab('quotation')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'quotation'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-white dark:bg-gray-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            } rounded-t-lg`}
          >
            <FontAwesomeIcon icon={faFileText} className="h-4 w-4" />
            Quotation
            {quotationData && <span className="ml-1 text-xs">({quotationData.revision || 1})</span>}
          </button>
          
          <button
            onClick={() => setActiveTab('executionDocs')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'executionDocs'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500 bg-white dark:bg-gray-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            } rounded-t-lg`}
          >
            <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4" />
            Execution Docs
            {executionDocuments && executionDocuments.length > 0 && (
              <span className="ml-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
                {executionDocuments.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('leadDocs')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'leadDocs'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-white dark:bg-gray-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            } rounded-t-lg`}
          >
            <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4" />
            Sales Docs
            {leadDocuments && (leadDocuments.images?.length + leadDocuments.documents?.length + leadDocuments.videos?.length) > 0 && (
              <span className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
                {leadDocuments.images?.length + leadDocuments.documents?.length + leadDocuments.videos?.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 bg-white dark:bg-gray-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            } rounded-t-lg`}
          >
            <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
            Checklist
            {selectedChecklistItems && selectedChecklistItems.length > 0 && (
              <span className="ml-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                {selectedChecklistItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div>
              <div className="space-y-4">
                {detailGroups.map((group, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">{group.label}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {group.items.map((item, itemIdx) => (
                        <div key={itemIdx}>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wide">{item.label}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white mt-1 break-words">
                            {typeof item.value === 'string' ? formatValue(item.value) : item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quotation Tab */}
          {activeTab === 'quotation' && (
            <div>
              {quotationLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-3 text-gray-500">Loading quotation...</p>
                </div>
              ) : !quotationData ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faFileText} className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-lg font-medium text-gray-600">No Quotation Found</p>
                  <p className="text-sm text-gray-500 mt-1">No quotation has been generated for this client.</p>
                </div>
              ) : quotationOptions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No items found in this quotation</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quotation Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800/30">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Quotation Number</div>
                        <div className="font-bold text-purple-600 dark:text-purple-400">{quotation.qt_number || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Revision</div>
                        <div className="font-semibold">v{quotationData.revision || 1}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Created Date</div>
                        <div className="font-semibold">{formatDate(quotation.created_at)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                        <div className="font-semibold">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(quotation.status)}`}>
                            {quotation.status || 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quotation Options/Items */}
                  {quotationOptions.map((option, optIdx) => (
                    <div key={optIdx} className="border rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 px-6 py-3 border-b">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-800 dark:text-white">
                            {option.option_name}
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead className="bg-purple-50 dark:bg-purple-900/20">
                            <tr>
                              <th className="border px-4 py-2 text-left text-sm font-semibold">#</th>
                              <th className="border px-4 py-2 text-left text-sm font-semibold">Product</th>
                              <th className="border px-4 py-2 text-left text-sm font-semibold">Model</th>
                              <th className="border px-4 py-2 text-center text-sm font-semibold w-20">Qty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {option.items.map((item, itemIdx) => (
                              <tr key={itemIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="border px-4 py-2 text-center text-sm">{itemIdx + 1}</td>
                                <td className="border px-4 py-2 text-sm">
                                  {item.product_type_name || item.cat_name || 'Product'}
                                  {item.brand_name && (
                                    <div className="text-xs text-gray-500 mt-0.5">{item.brand_name}</div>
                                  )}
                                </td>
                                <td className="border px-4 py-2 text-sm font-mono">{item.model || '—'}</td>
                                <td className="border px-4 py-2 text-center text-sm">{item.qty || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Execution Documents Tab */}
          {activeTab === 'executionDocs' && (
            <div>
              {loadingExecutionDocs ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                  <span className="ml-3 text-gray-600">Loading execution documents...</span>
                </div>
              ) : !executionDocuments || executionDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faFileAlt} className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-lg font-medium text-gray-600">No Execution Documents Found</p>
                  <p className="text-sm text-gray-500 mt-1">No documents have been uploaded during execution for this client.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Process</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Remark</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Manager Status</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Manager Remark</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">File</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {executionDocuments.map((doc, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(doc.document_created_at)}
                          </td>
                          <td className="px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {doc.process_name || '-'}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={doc.remark}>
                            {doc.remark || '-'}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(doc.manager_status)}`}>
                              {doc.manager_status || 'pending'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={doc.manager_remark}>
                            {doc.manager_remark || '-'}
                          </td>
                          <td className="px-3 py-2">
                            {doc.file_path ? (
                              <button
                                onClick={() => window.open(getImageUrl(doc.file_path), '_blank')}
                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                              >
                                View
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">No file</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Lead Documents Tab */}
          {activeTab === 'leadDocs' && (
            <div>
              {loadingLeadDocs ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading lead documents...</span>
                </div>
              ) : (!leadDocuments || (leadDocuments.images?.length === 0 && leadDocuments.documents?.length === 0 && leadDocuments.videos?.length === 0)) ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faFolderOpen} className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-lg font-medium text-gray-600">No Lead Documents Found</p>
                  <p className="text-sm text-gray-500 mt-1">No documents have been attached to this lead.</p>
                </div>
              ) : (
                <div>
                  {/* Images Section */}
                  {leadDocuments.images?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faImage} className="h-4 w-4 text-blue-500" />
                        Images ({leadDocuments.images.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {leadDocuments.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url}
                              alt={image.document_name}
                              className="w-full h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = EMPTY_IMAGE;
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <a
                                href={image.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                              >
                                View
                              </a>
                              {image.remark && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg">
                                  {image.remark}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents Section */}
                  {leadDocuments.documents?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4 text-green-500" />
                        Documents ({leadDocuments.documents.length})
                      </h4>
                      <div className="space-y-2">
                        {leadDocuments.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="text-xl">{getFileIcon(doc.file_extension)}</div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                  {doc.document_name}
                                </div>
                          
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.uploaded_at && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(doc.uploaded_at).toLocaleDateString()}
                                </span>
                              )}
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                              >
                                Open
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos Section */}
                  {leadDocuments.videos?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faVideo} className="h-4 w-4 text-purple-500" />
                        Videos ({leadDocuments.videos.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {leadDocuments.videos.map((video, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="aspect-video bg-black">
                              <video controls className="w-full h-full">
                                <source src={video.url} type="video/mp4" />
                              </video>
                            </div>
                            <div className="p-3">
                              <div className="flex justify-between items-start">
                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                  Video {index + 1}
                                </div>
                                <a href={video.url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded">
                                  Download
                                </a>
                              </div>

                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Checklist Tab */}
          {activeTab === 'checklist' && (
            <div>
              {checklistLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="mt-3 text-gray-500">Loading checklist...</p>
                </div>
              ) : selectedChecklistDetails.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-lg font-medium text-gray-600">No Items Selected</p>
                  <p className="text-sm text-gray-500 mt-1">No checklist items have been selected for this client.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {checklistItems.map(checklist => {
                    const checklistSelectedItems = checklist.items.filter(
                      item => selectedChecklistItems.includes(item.item_id)
                    );
                    
                    if (checklistSelectedItems.length === 0) return null;
                    
                    return (
                      <div key={checklist.checklist_id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                          {checklist.checklist_name}
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full ml-2">
                            {checklistSelectedItems.length} selected
                          </span>
                        </h3>
                        
                        <div className="space-y-2">
                          {checklistSelectedItems.map(item => (
                            <div 
                              key={item.item_id} 
                              className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{item.item_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Selected Items:</span>
                      <span className="text-lg font-bold text-indigo-600">
                        {selectedChecklistDetails.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};





// ============================================================
// ACTION BUTTON COMPONENT WITH VIEW ALL
// ============================================================
// ============================================================
// ACTION BUTTON COMPONENT - Simplified with 2 icons
// ============================================================
const ActionButton = ({ 
  onViewAll,  // This will open the unified modal with Details tab
  onUpload, 
  viewCount = 0,
  className = ""
}: { 
  onViewAll: () => void;
  onUpload: () => void; 
  viewCount?: number;
  className?: string;
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* VIEW ALL / DETAILS BUTTON - Opens unified modal with Details tab */}
      <button
        onClick={onViewAll}
        className="relative w-9 h-9 flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        title="View Lead Details (Documents, Quotation, Checklist)"
      >
        <FaEye className="text-base" />
        {viewCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">
            {viewCount}
          </span>
        )}
      </button>

      {/* UPLOAD BUTTON */}
      <button
        onClick={onUpload}
        className="w-9 h-9 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        title="Upload Images & Add Remark"
      >
        <FontAwesomeIcon icon={faUploadSolid} className="text-base" />
      </button>
    </div>
  );
};


// ============================================================
// LEAD DETAILS MODAL (EYE ICON)
// ============================================================

// ============================================================
// LEAD DETAILS MODAL WITH DOCUMENTS TAB
// ============================================================
const LeadDetailsModal = ({ lead, onClose }: { lead: MyProcess | null; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [documentsData, setDocumentsData] = useState({
    images: [],
    documents: [],
    videos: [],
  });
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsFetched, setDocsFetched] = useState(false);
  

  if (!lead) return null;

  const formatValue = (value: any) => {
    if (!value || value === '' || value === 'null' || value === 'undefined') return '—';
    return String(value);
  };

  const openLocation = (link: string | null | undefined) => {
    if (link && link !== 'null' && link !== 'undefined') {
      window.open(link, '_blank');
    } else {
      alert('No location link available');
    }
  };

  // Fetch documents for the lead
  const fetchDocuments = async (master_id: number) => {
    if (!master_id || docsFetched) return;
    
    setLoadingDocs(true);
    try {
      const response = await axios.get(
        `${BASE_URL}api/documents/${master_id}`,
        { withCredentials: true }
      );
      
      const images: any[] = [];
      const documents: any[] = [];
      const videos: any[] = [];
      
      response.data.documents?.forEach((doc: any) => {
        let filePath = doc.document_path
          .replace(/^server\//, '')
          .replace(/\\/g, '/');
        
        if (!filePath.startsWith('uploads/')) 
          filePath = `uploads/${filePath}`;
        
        const fullUrl = `${BASE_URL}${filePath}`;
        
        const obj = {
          ...doc,
          url: fullUrl,
          document_name: doc.document_name || `Document ${doc.doc_id}`,
          file_extension: doc.file_extension || '',
        };
        
        if (doc.document_type === 'image') images.push(obj);
        else if (doc.document_type === 'video') videos.push(obj);
        else documents.push(obj);
      });
      
      setDocumentsData({ images, documents, videos });
      setDocsFetched(true);
    } catch (e) {
      console.error('Error fetching documents:', e);
      setDocumentsData({ images: [], documents: [], videos: [] });
    } finally {
      setLoadingDocs(false);
    }
  };

  // Fetch documents when switching to documents tab
  useEffect(() => {
    if (activeTab === 'documents' && lead.lead_id) {
      fetchDocuments(lead.lead_id);
    }
  }, [activeTab, lead.lead_id]);

  const getFileIcon = (extension: string) => {
    const ext = extension?.toLowerCase() || '';
    if (ext.includes('pdf')) return '📕';
    if (ext.includes('doc')) return '📄';
    if (ext.includes('xls')) return '📊';
    if (ext.includes('ppt')) return '📽️';
    if (ext.includes('txt')) return '📝';
    return '📎';
  };

  const EMPTY_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNlNWU3ZWIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+SW1hZ2U8L3RleHQ+PC9zdmc+';

  const detailGroups = [
    { label: "Lead Info", items: [
      { label: "Name", value: lead.lead_name },
      { label: "Phone", value: lead.lead_number || lead.number },
      { label: "City", value: lead.lead_city || lead.city },
      { label: "Location", value: lead.location_link ? (
        <button onClick={() => openLocation(lead.location_link)} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1">
          <FaMapMarkerAlt className="h-2.5 w-2.5" /> Open Map
        </button>
      ) : "—" }
    ]},
    { label: "Architect Details", items: [
      { label: "Architect", value: lead.architect_name },
      { label: "AR Number", value: lead.ar_number },
      { label: "CA Number", value: lead.ca_number }
    ]},
    { label: "Contact Numbers", items: [
      { label: "E Number", value: lead.e_number },
      { label: "SM Number", value: lead.sm_number },
      { label: "POP Number", value: lead.pop_number },
      { label: "Other", value: lead.other_number }
    ]},
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[10000] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {lead.lead_name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white truncate">
                    {formatValue(lead.lead_name)}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                      ID: #{lead.lead_id}
                    </span>
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                      {formatValue(lead.lead_city || lead.city)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="mt-4 flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'details'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'documents'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faFile} className="h-4 w-4" />
              Documents
              {documentsData.images.length + documentsData.documents.length + documentsData.videos.length > 0 && (
                <span className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {documentsData.images.length + documentsData.documents.length + documentsData.videos.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
          {activeTab === 'details' ? (
            // Details Tab Content
            <div className="p-6">
              <div className="space-y-4">
                {detailGroups.map((group, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">{group.label}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {group.items.map((item, itemIdx) => (
                        <div key={itemIdx}>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wide">{item.label}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white mt-1 break-words">
                            {typeof item.value === 'string' ? formatValue(item.value) : item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Documents Tab Content
            <div className="p-6">
              {loadingDocs ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading documents...</span>
                </div>
              ) : (
                <>
                  {/* Total Count */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">Documents Summary</h3>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {documentsData.images.length + documentsData.documents.length + documentsData.videos.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700/30">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{documentsData.images.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Images</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700/30">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{documentsData.documents.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700/30">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{documentsData.videos.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Videos</div>
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  {documentsData.images.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faImage} className="h-4 w-4 text-blue-500" />
                        Images ({documentsData.images.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {documentsData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url}
                              alt={image.document_name}
                              className="w-full h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = EMPTY_IMAGE;
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <a
                                href={image.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm mr-2"
                              >
                                View
                              </a>
                             
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents Section */}
                  {documentsData.documents.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4 text-green-500" />
                        Documents ({documentsData.documents.length})
                      </h4>
                      <div className="space-y-2">
                        {documentsData.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-xl">{getFileIcon(doc.file_extension)}</div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                  {doc.document_name}
                                </div>
                              
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.uploaded_at && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(doc.uploaded_at).toLocaleDateString()}
                                </span>
                              )}
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                              >
                                Open
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Documents Message */}
                  {documentsData.images.length === 0 && documentsData.documents.length === 0 && documentsData.videos.length === 0 && (
                    <div className="text-center py-12">
                      <FontAwesomeIcon icon={faFile} className="text-4xl text-gray-400 dark:text-gray-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">No Documents Found</h3>
                      <p className="text-gray-500 dark:text-gray-500 mt-1">No documents have been uploaded for this client.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// ============================================================
// PAGINATION COMPONENT
// ============================================================
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

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
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
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 px-4 py-3 sm:px-6 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-white ${
            currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/10'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-white ${
            currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/10'
          }`}
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium mx-1 text-gray-900 dark:text-white">{showingStart}</span>
            to <span className="font-medium mx-1 text-gray-900 dark:text-white">{showingEnd}</span>
            of <span className="font-medium mx-1 text-gray-900 dark:text-white">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-300 ring-1 ring-gray-300 dark:ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <span className="sr-only">Previous</span>
              <FaChevronDown className="h-5 w-5 rotate-90" />
            </button>

            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`dots-${index}`} className="relative inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-gray-300 dark:ring-gray-700">
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
                      : 'text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-300 ring-1 ring-gray-300 dark:ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/5'
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

// ============================================================
// DOCUMENT HISTORY LOGS MODAL
// ============================================================
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

  useEffect(() => {
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
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
      'approved': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'needs_revision': 'bg-orange-100 text-orange-700',
      'pending': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  if (!process) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[9999] pt-20">
        <div className="bg-white dark:bg-boxdark w-full max-w-3xl rounded-lg shadow-lg">
          <div className="flex justify-between items-center border-b px-4 py-3">
            <div>
              <h3 className="font-medium text-gray-800 text-sm">Document History - {process.process_name}</h3>
              <p className="text-xs text-gray-500">Lead: {process.lead_name} #{process.lead_id}</p>
            </div>
            <button onClick={onClose} className="text-xl hover:bg-gray-100 rounded-lg px-2 py-1">×</button>
          </div>

          <div className="px-4 py-3 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div></div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8"><FaFileAlt className="h-10 w-10 mx-auto mb-2 text-gray-300" /><p className="text-xs text-gray-500">No documents uploaded yet</p></div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const fileName = doc.file_path.split('/').pop() || 'Unknown file';
                  const isImage = doc.file_path.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                  return (
                    <div key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {isImage ? (
                            <img src={`${BASE_URL}uploads/${doc.file_path}`} alt={fileName} className="h-12 w-12 object-cover rounded cursor-pointer border" onClick={() => setImageViewer(`${BASE_URL}uploads/${doc.file_path}`)} />
                          ) : getFileIcon(doc.file_path)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate max-w-md">{fileName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadge(doc.manager_status)}`}>
                              {doc.manager_status?.replace('_', ' ') || 'pending'}
                            </span>
                            <p className="text-[10px] text-gray-500">by {doc.uploaded_by_name || 'Unknown'} • {formatDateTime(doc.created_at)}</p>
                          </div>
                          {doc.remark && <div className="mt-2 bg-blue-50 p-2 rounded"><p className="text-[10px] text-blue-700"><span className="font-medium">Remark:</span> {doc.remark}</p></div>}
                          {doc.manager_remark && <div className="mt-1 bg-purple-50 p-2 rounded"><p className="text-[10px] text-purple-700"><span className="font-medium">Manager Remark:</span> {doc.manager_remark}</p></div>}
                        </div>
                        {isImage && (
                          <button onClick={() => setImageViewer(`${BASE_URL}uploads/${doc.file_path}`)} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg">
                            <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end border-t px-4 py-3">
            <button onClick={onClose} className="px-3 py-1 text-xs border rounded text-gray-700 hover:bg-gray-50">Close</button>
          </div>
        </div>
      </div>

      {imageViewer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] p-4">
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={imageViewer} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button onClick={() => setImageViewer(null)} className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-lg"><FaTimes className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================
// UPLOAD MODAL
// ============================================================

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
  const [loading, setLoading] = useState(false);

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString('en-GB', { hour12: false });
    return { date, time };
  };

  useEffect(() => {
    if (process?.execution_id && process?.process_id) fetchImages();
  }, [process]);

  const fetchImages = async () => {
    if (!process?.execution_id || !process?.process_id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}api/daily-execution/upload/${process.execution_id}/${process.process_id}`, { withCredentials: true });
      if (res.data?.success) setUploadedImages(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeSelectedFile = (index: number) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (!process?.execution_id || !process?.process_id || !process?.lead_id) { 
      alert("Missing required data"); 
      return; 
    }
    if (!selectedFiles.length && !newRemark) { 
      alert("Please select files or add a remark"); 
      return; 
    }

    try {
      setUploading(true);
      const formData = new FormData();
      selectedFiles.forEach(f => formData.append("files", f));
      formData.append("remark", newRemark || "");
      formData.append("lead_id", String(process.lead_id));
      
      const { date, time } = getCurrentDateTime();
      formData.append("start_date", date);
      formData.append("start_time", time);
      formData.append("end_time", time);

      await axios.post(`${BASE_URL}api/daily-execution/upload/${process.execution_id}/${process.process_id}`, formData, { withCredentials: true });
      await fetchImages();
      setSelectedFiles([]);
      setNewRemark("");
      onUploadComplete();
    } catch (err) { 
      console.error(err); 
      alert("Failed to upload"); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Delete this image?")) return;
    try { 
      await axios.delete(`${BASE_URL}api/daily-execution/images/${imageId}`, { withCredentials: true }); 
      await fetchImages(); 
    } catch (err) { console.error(err); }
  };

  if (!process) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[10001] pt-20">
      <div className="bg-white dark:bg-boxdark w-full max-w-2xl rounded-lg shadow-lg">
        <div className="flex justify-between items-center border-b px-4 py-3">
          <div>
            <h3 className="font-medium text-gray-800 text-sm">{process.process_name}</h3>
            <p className="text-xs text-gray-500">Lead: {process.lead_name} #{process.lead_id}</p>
          </div>
          <button onClick={onClose} className="text-xl hover:bg-gray-100 rounded-lg px-2 py-1">×</button>
        </div>

        <div className="px-4 py-3 space-y-3 max-h-[55vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Add Remark</label>
            <textarea 
              value={newRemark} 
              onChange={(e) => setNewRemark(e.target.value)} 
              placeholder="Enter your remark..." 
              className="w-full p-2 text-xs border rounded" 
              rows={2} 
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Upload Images</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center py-2">
                <FaUpload className="w-5 h-5 mb-1 text-gray-400" />
                <p className="text-xs text-gray-500"><span className="font-semibold">Click to upload</span></p>
                <p className="text-[10px] text-gray-500">PNG, JPG, GIF</p>
              </div>
              <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
          
          {selectedFiles.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Selected ({selectedFiles.length})</p>
              <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto p-1 border rounded">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img src={URL.createObjectURL(file)} alt="preview" className="h-16 w-full object-cover rounded border" />
                    <button 
                      onClick={() => removeSelectedFile(idx)} 
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100"
                    >
                      <FaTrash className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {uploadedImages.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Uploaded ({uploadedImages.length})</p>
              <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto p-1 border rounded">
                {uploadedImages.map(img => (
                  <div key={img.id} className="relative group">
                    <img src={`${BASE_URL}uploads/${img.file_path}`} alt="Uploaded" className="h-16 w-full object-cover rounded border" />
                    <button 
                      onClick={() => handleDeleteImage(img.id)} 
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100"
                    >
                      <FaTrash className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <button 
            onClick={onClose} 
            className="px-3 py-1 text-xs border rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload} 
            disabled={uploading || (selectedFiles.length === 0 && !newRemark)} 
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-1"
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
        </div>
      </div>
    </div>
  );
};


// ============================================================
// DATE RANGE FILTER COMPONENT
// ============================================================
const DateRangeFilter = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange, 
  onClear 
}: { 
  startDate: string; 
  endDate: string; 
  onStartDateChange: (date: string) => void; 
  onEndDateChange: (date: string) => void; 
  onClear: () => void;
}) => {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5">
      <FaCalendarAlt className="h-4 w-4 text-gray-400" />
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="text-xs bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300"
        placeholder="Start Date"
      />
      <span className="text-gray-400">—</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="text-xs bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300"
        placeholder="End Date"
      />
      {(startDate || endDate) && (
        <button onClick={onClear} className="text-gray-400 hover:text-red-500">
          <FaTimes className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

// ============================================================
// STATUS CHECKBOX FILTER COMPONENT
// ============================================================
const StatusCheckboxFilter = ({ 
  selectedStatuses, 
  onStatusChange,
  statusOptions
}: { 
  selectedStatuses: string[]; 
  onStatusChange: (status: string, checked: boolean) => void;
  statusOptions: { value: string; label: string }[];
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status:</span>
      {statusOptions.map(option => (
        <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedStatuses.includes(option.value)}
            onChange={(e) => onStatusChange(option.value, e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

// ============================================================
// MAIN ASSIGN PROCESS COMPONENT
// ============================================================
const AssignProcess = ({ onViewAll, managerReportRef }: AssignProcessProps) => {

  const [processes, setProcesses] = useState<MyProcess[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<MyProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalProcesses, setTotalProcesses] = useState(0);
  
  // Modal states
  const [uploadModal, setUploadModal] = useState<MyProcess | null>(null);
  const [logsModal, setLogsModal] = useState<MyProcess | null>(null);
  const [detailsModal, setDetailsModal] = useState<MyProcess | null>(null);
  
  // Unified View Modal state
  const [showUnifiedViewModal, setShowUnifiedViewModal] = useState(false);
  const [selectedUnifiedLead, setSelectedUnifiedLead] = useState(null);
  const [unifiedQuotationData, setUnifiedQuotationData] = useState(null);
  const [unifiedQuotationLoading, setUnifiedQuotationLoading] = useState(false);
  const [unifiedDocuments, setUnifiedDocuments] = useState([]);
  const [unifiedDocumentsLoading, setUnifiedDocumentsLoading] = useState(false);
  const [unifiedChecklistItems, setUnifiedChecklistItems] = useState([]);
  const [unifiedSelectedChecklistItems, setUnifiedSelectedChecklistItems] = useState([]);
  const [unifiedChecklistLoading, setUnifiedChecklistLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending', 'in_progress']);
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [customRecordCount, setCustomRecordCount] = useState<number | ''>('');
  
  // Refs
  const statusFilterRef = useRef<HTMLDivElement>(null);

  // Status options for filter
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "hold_by_client", label: "Hold by Client" },
    { value: "hold_by_avcore", label: "Hold by Avcore" },
    { value: "completed", label: "Completed" }
  ];


  // Add new state for lead documents
const [unifiedLeadDocuments, setUnifiedLeadDocuments] = useState({
  images: [],
  documents: [],
  videos: [],
});
const [unifiedLeadDocsLoading, setUnifiedLeadDocsLoading] = useState(false);

// Update the fetchUnifiedViewData function
const fetchUnifiedViewData = async (lead) => {
  if (!lead) return;
  
  setSelectedUnifiedLead(lead);
  setShowUnifiedViewModal(true);
  
  // Fetch Quotation
  setUnifiedQuotationLoading(true);
  try {
    const quotationRes = await axios.get(
      `${BASE_URL}api/quotation/latest/${lead.lead_id}`,
      { withCredentials: true }
    );
    setUnifiedQuotationData(quotationRes.data);
  } catch (err) {
    console.error("Error fetching quotation:", err);
    setUnifiedQuotationData(null);
  } finally {
    setUnifiedQuotationLoading(false);
  }
  
  // Fetch Execution Documents (from daily-execution)
  setUnifiedDocumentsLoading(true);
  try {
    const docsRes = await axios.get(
      `${BASE_URL}api/daily-execution/manager-processes/${lead.lead_id}`,
      { withCredentials: true }
    );
    setUnifiedDocuments(docsRes.data.success ? docsRes.data.data : []);
  } catch (err) {
    console.error("Error fetching execution documents:", err);
    setUnifiedDocuments([]);
  } finally {
    setUnifiedDocumentsLoading(false);
  }
  
  // Fetch Lead Documents (from api/documents)
  setUnifiedLeadDocsLoading(true);
  try {
    const response = await axios.get(
      `${BASE_URL}api/documents/${lead.lead_id}`,
      { withCredentials: true }
    );
    
    const images: any[] = [];
    const documents: any[] = [];
    const videos: any[] = [];
    
    response.data.documents?.forEach((doc: any) => {
      let filePath = doc.document_path
        .replace(/^server\//, '')
        .replace(/\\/g, '/');
      
      if (!filePath.startsWith('uploads/')) 
        filePath = `uploads/${filePath}`;
      
      const fullUrl = `${BASE_URL}${filePath}`;
      
      const obj = {
        ...doc,
        url: fullUrl,
        document_name: doc.document_name || `Document ${doc.doc_id}`,
        file_extension: doc.file_extension || '',
      };
      
      if (doc.document_type === 'image') images.push(obj);
      else if (doc.document_type === 'video') videos.push(obj);
      else documents.push(obj);
    });
    
    setUnifiedLeadDocuments({ images, documents, videos });
  } catch (err) {
    console.error("Error fetching lead documents:", err);
    setUnifiedLeadDocuments({ images: [], documents: [], videos: [] });
  } finally {
    setUnifiedLeadDocsLoading(false);
  }
  
  // Fetch Checklist
  setUnifiedChecklistLoading(true);
  try {
    const checklistRes = await axios.get(
      `${BASE_URL}api/execution/checklists`,
      { withCredentials: true }
    );
    
    const selectedRes = await axios.get(
      `${BASE_URL}api/execution/get-checklist/${lead.lead_id}`,
      { withCredentials: true }
    );
    
    if (checklistRes.data.success) {
      setUnifiedChecklistItems(checklistRes.data.data);
    }
    if (selectedRes.data.success) {
      setUnifiedSelectedChecklistItems(selectedRes.data.selected_items || []);
    }
  } catch (err) {
    console.error("Error fetching checklist:", err);
    setUnifiedChecklistItems([]);
    setUnifiedSelectedChecklistItems([]);
  } finally {
    setUnifiedChecklistLoading(false);
  }
};


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
        const formatted: MyProcess[] = raw.map((p: any) => ({
          ...p,
          assigned_to: p.assigned_to ? p.assigned_to.split(",").map((n: string) => n.trim()) : [],
          manager_status: p.manager_status || null,
          manager_remark: p.manager_remark || null,
          location_link: p.location_link || null,
          lead_city: p.city || p.lead_city,
          lead_number: p.number || p.lead_number,
          architect_name: p.architect_name,
          ar_number: p.ar_number,
          ca_number: p.ca_number,
          e_number: p.e_number,
          sm_number: p.sm_number,
          pop_number: p.pop_number,
          other_number: p.other_number,
          area_name: p.area_name,
          completion_percentage: p.completion_percentage,
        }));
        setProcesses(formatted);
        setTotalProcesses(response.data.total || formatted.length);
      } else {
        setProcesses([]);
        setTotalProcesses(0);
      }
    } catch (error) {
      console.error("Error fetching my processes:", error);
      setProcesses([]);
      setTotalProcesses(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProcesses();
  }, [currentPage, itemsPerPage]);

  // Apply all filters
  useEffect(() => {
    let filtered = [...processes];
    
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
    
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(p => selectedStatuses.includes(p.status));
    }
    
    if (startDateFilter) {
      filtered = filtered.filter(p => {
        if (!p.start_date) return false;
        const processDate = new Date(p.start_date).toISOString().split('T')[0];
        return processDate >= startDateFilter;
      });
    }
    if (endDateFilter) {
      filtered = filtered.filter(p => {
        if (!p.start_date) return false;
        const processDate = new Date(p.start_date).toISOString().split('T')[0];
        return processDate <= endDateFilter;
      });
    }
    
    setFilteredProcesses(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedStatuses, startDateFilter, endDateFilter, processes]);

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
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getManagerStatusColor = (status: string | null | undefined) => {
    const colors = {
      'approved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'needs_revision': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const handleStatusCheckboxChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses(prev => [...prev, status]);
    } else {
      setSelectedStatuses(prev => prev.filter(s => s !== status));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatuses(['pending', 'in_progress']);
    setStartDateFilter('');
    setEndDateFilter('');
    setCustomRecordCount('');
    setItemsPerPage(50);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) setCurrentPage(page);
  };

  const handleCustomRecordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') { setCustomRecordCount(''); setItemsPerPage(50); return; }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) { setCustomRecordCount(numValue); setItemsPerPage(numValue); setCurrentPage(1); }
  };

  const openLocation = (link: string | null | undefined) => {
    if (link && link !== 'null' && link !== 'undefined') window.open(link, '_blank');
    else alert('No location link available');
  };

  const totalFiltered = filteredProcesses.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage);
  const showingStart = totalFiltered === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalFiltered);
  const paginatedProcesses = filteredProcesses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4">
      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">  
        <div className="px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30">
                  <FaClock className="w-4 h-4 mr-1" />
                  {totalFiltered} For All Processes Apply below filter
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-48">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaFileAlt className="h-4 w-4 text-gray-400" /></div>
                    <input type="number" className="w-full pl-10 pr-10 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" placeholder="Show N records" value={customRecordCount} onChange={handleCustomRecordInput} min="1" />
                    {customRecordCount && (<button onClick={() => { setCustomRecordCount(''); setItemsPerPage(50); }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"><FaTimes className="h-4 w-4" /></button>)}
                  </div>
                </div>

                <div className="w-full sm:w-72">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="h-4 w-4 text-gray-400" /></div>
                    <input type="text" className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" placeholder="Search lead, process, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <StatusCheckboxFilter 
                selectedStatuses={selectedStatuses}
                onStatusChange={handleStatusCheckboxChange}
                statusOptions={statusOptions}
              />
              
              <DateRangeFilter
                startDate={startDateFilter}
                endDate={endDateFilter}
                onStartDateChange={setStartDateFilter}
                onEndDateChange={setEndDateFilter}
                onClear={() => { setStartDateFilter(''); setEndDateFilter(''); }}
              />
              
              <button onClick={clearFilters} className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap">
                <FaTimes className="h-3.5 w-3.5" />Reset All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || selectedStatuses.length !== 2 || startDateFilter || endDateFilter) && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] bg-blue-100 text-blue-800">Search: {searchTerm}<button onClick={() => setSearchTerm('')} className="ml-1 text-blue-600">×</button></span>)}
            {selectedStatuses.length > 0 && selectedStatuses.length !== 2 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] bg-purple-100 text-purple-800">
                Status: {selectedStatuses.map(s => s.replace(/_/g, ' ')).join(', ')}
                <button onClick={() => setSelectedStatuses(['pending', 'in_progress'])} className="ml-1 text-purple-600">×</button>
              </span>
            )}
            {startDateFilter && (<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] bg-green-100 text-green-800">From: {startDateFilter}<button onClick={() => setStartDateFilter('')} className="ml-1 text-green-600">×</button></span>)}
            {endDateFilter && (<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] bg-green-100 text-green-800">To: {endDateFilter}<button onClick={() => setEndDateFilter('')} className="ml-1 text-green-600">×</button></span>)}
            <button onClick={clearFilters} className="ml-2 text-xs text-red-600 hover:text-red-800 font-medium">Clear all filters</button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3 text-left bg-gray-50 dark:bg-gray-800 sticky top-0"><span className="text-[10px] font-extrabold uppercase tracking-wider">Assigned To</span></th>
                  <th className="py-3 px-3 text-left bg-gray-50 dark:bg-gray-800 sticky top-0"><span className="text-[10px] font-extrabold uppercase tracking-wider">Lead Details</span></th>
                  <th className="py-3 px-3 text-left bg-gray-50 dark:bg-gray-800 sticky top-0"><span className="text-[10px] font-extrabold uppercase tracking-wider">Stage (Type Name)</span></th>
                  <th className="py-3 px-3 text-left bg-gray-50 dark:bg-gray-800 sticky top-0"><span className="text-[10px] font-extrabold uppercase tracking-wider">Process</span></th>
                  <th className="py-3 px-3 text-center bg-gray-50 dark:bg-gray-800 sticky top-0"><span className="text-[10px] font-extrabold uppercase tracking-wider">Status</span></th>
                  <th className="py-3 px-3 text-center bg-gray-50 dark:bg-gray-800 sticky top-0"><span className="text-[10px] font-extrabold uppercase tracking-wider">Manager Status</span></th>
                  <th className="py-3 px-3 text-left bg-gray-50 dark:bg-gray-800 sticky top-0"><span className="text-[10px] font-extrabold uppercase tracking-wider">Manager Remark</span></th>
                  <th className="py-3 px-3 text-center bg-gray-50 dark:bg-gray-800 sticky top-0"><span className="text-[10px] font-extrabold uppercase tracking-wider">Start Date</span></th>
                  <th className="py-3 px-3 text-center bg-gray-50 dark:bg-gray-800 sticky top-0"><span className="text-[10px] font-extrabold uppercase tracking-wider">End Date</span></th>
                  <th className="py-3 px-3 text-center bg-gray-50 dark:bg-gray-800 sticky top-0"><span className="text-[10px] font-extrabold uppercase tracking-wider">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedProcesses.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-12 text-center"><div className="text-gray-500"><FaFileAlt className="h-12 w-12 mx-auto mb-4 opacity-50" /><p className="text-xs font-medium">No processes found</p></div></td></tr>
                ) : (
                  paginatedProcesses.map((process) => (
                    <tr key={`${process.execution_id}-${process.process_id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {process.assigned_to?.length ? process.assigned_to.map((name, idx) => (<span key={idx} className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700">{name}</span>)) : <span className="text-gray-400 text-[10px]">—</span>}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-gray-900 dark:text-white text-xs flex items-center gap-2">
                            {process.lead_name || `Lead #${process.lead_id}`}
                            {process.location_link && process.location_link !== 'null' && (
                              <button onClick={() => openLocation(process.location_link)} className="text-blue-500 hover:text-blue-600">
                                <FaMapMarkerAlt className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-500">
                            {process.lead_number && <span>📞 {process.lead_number}</span>}
                            {(process.lead_city || process.city) && <span>📍 {process.lead_city || process.city}</span>}
                          </div>
                        </div>
                       </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-1 text-[10px] font-medium bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                          {process.type_name || process.execution_type || "-"}
                        </span>
                       </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs">{process.process_name}</div>
                        {process.description && <div className="text-[10px] text-gray-500 mt-0.5 max-w-xs truncate">{process.description}</div>}
                       </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${getStatusColor(process.status)}`}>
                          {process.status?.replace(/_/g, ' ') || 'pending'}
                        </span>
                       </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getManagerStatusColor(process.manager_status)}`}>
                          {process.manager_status?.replace(/_/g, ' ') || 'pending'}
                        </span>
                       </td>

                      <td className="py-3 px-3">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 max-w-xs truncate" title={process.manager_remark || ''}>
                          {process.manager_remark || '—'}
                        </div>
                       </td>

                      <td className="py-3 px-3 text-center">
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 px-2 py-1 rounded text-[10px] whitespace-nowrap">{formatDate(process.start_date)}</span>
                       </td>

                      <td className="py-3 px-3 text-center">
                        <span className="bg-green-50 dark:bg-green-900/30 text-green-700 px-2 py-1 rounded text-[10px] whitespace-nowrap">{formatDate(process.end_date)}</span>
                       </td>

                     <td className="py-3 px-3 text-center">
  <ActionButton
    onViewAll={() => fetchUnifiedViewData(process)}
    onUpload={() => setUploadModal(process)}
    viewCount={0} // You can add checklist count here if needed
  />
</td>
                     </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalFiltered}
              itemsPerPage={itemsPerPage}
              showingStart={showingStart}
              showingEnd={showingEnd}
            />
          )}
        </>
      )}

      {/* Modals */}
      {uploadModal && <UploadModal process={uploadModal} onClose={() => setUploadModal(null)} onUploadComplete={fetchMyProcesses} />}
      {logsModal && <LogsModal process={logsModal} onClose={() => setLogsModal(null)} onStatusUpdate={fetchMyProcesses} />}
      {detailsModal && <LeadDetailsModal lead={detailsModal} onClose={() => setDetailsModal(null)} />}
      
    {/* Unified View Modal */}
{showUnifiedViewModal && selectedUnifiedLead && (
  <UnifiedViewModal
    show={showUnifiedViewModal}
    onClose={() => {
      setShowUnifiedViewModal(false);
      setSelectedUnifiedLead(null);
      setUnifiedQuotationData(null);
      setUnifiedDocuments([]);
      setUnifiedLeadDocuments({ images: [], documents: [], videos: [] });
      setUnifiedChecklistItems([]);
      setUnifiedSelectedChecklistItems([]);
    }}
    lead={selectedUnifiedLead}
    executionDocuments={unifiedDocuments}
    loadingExecutionDocs={unifiedDocumentsLoading}
    leadDocuments={unifiedLeadDocuments}
    loadingLeadDocs={unifiedLeadDocsLoading}
    quotationData={unifiedQuotationData}
    quotationLoading={unifiedQuotationLoading}
    checklistItems={unifiedChecklistItems}
    selectedChecklistItems={unifiedSelectedChecklistItems}
    checklistLoading={unifiedChecklistLoading}
    BASE_URL={BASE_URL}
  />
)}
    </div>
  );
};

export default AssignProcess;