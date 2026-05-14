import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Eye,
  Calendar,
  User,
  Building,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  Search,
  Filter,
  X,
  Download,
  Eye as EyeIcon,
  Phone as PhoneIcon,
  Mail,
  User as UserIcon,
  Tag,
  Building as BuildingIcon,
  History,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Settings,
  Play
} from 'lucide-react';
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
  faTimes,
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
  faFileText,
  faImage,
  faSave,
  faEllipsisH,
  faBars,
  faEllipsisV,
  faList
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';
import StartExecutionModal from "./StartExecutionModal";
import { useNavigate } from "react-router-dom";




// Add these interfaces
interface ExecutionLog {
  log_id: number;
  execution_id: number;
  action_type: string;
  old_data: string | null;
  new_data: string | null;
  changed_by: number;
  changed_by_name: string;
  changed_at: string;
  remarks: string | null;
}

interface LeadHistory {
  history_id: number;
  lead_id: number;
  execution_id: number;
  action: string;
  old_lead_stage: string;
  new_lead_stage: string;
  changed_by: number;
  changed_at: string;
}

interface ProcessLog {
  log_id: number;
  lead_id: number;
  process_id: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  remark: string | null;
  updated_by: number;
  updated_by_name: string;
  created_at: string;
}

interface LogsData {
  execution_id: number;
  execution_logs: ExecutionLog[];
  lead_history: LeadHistory[];
  process_logs: ProcessLog[];
}


// Update ActionButton component definition
const ActionButton = ({ 
  onView, 
  onEdit,
  onEditExecution,  // NEW
  onSettings,
  onLogs,
  onViewQuotation,
  onViewDocuments,  // ADD THIS LINE - FIXES THE ERROR
  viewCount = 0,
  title = "Actions",
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>

            {/* SETTINGS */}
      <button
        onClick={onSettings}
        className="p-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
        title="Process Settings"
      >
        <FontAwesomeIcon icon={faCog} className="h-3.5 w-3.5" />
      </button>
      
      {/* EDIT EXECUTION BUTTON - NEW */}
      <button
        onClick={onEditExecution}
        className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        title="Edit Execution"
      >
        <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5" />
      </button>
      
<button
  onClick={onViewDocuments}
  className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg"
  title="View Execution Documents"
>
  <FontAwesomeIcon icon={faFileText} className="h-3.5 w-3.5" />
</button>

      {/* VIEW QUOTATION BUTTON */}
      <button
        onClick={onViewQuotation}
        className="p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
        title="View Quotation"
      >
        <FontAwesomeIcon icon={faFileText} className="h-3.5 w-3.5" />
      </button>

      {/* VIEW CHECKLIST BUTTON */}
      <button
        onClick={onView}
        className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        title="View Selected Checklist Items"
      >
        <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
        {viewCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
            {viewCount}
          </span>
        )}
      </button>

      {/* EDIT CHECKLIST BUTTON */}
      <button
        onClick={onEdit}
        className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg"
        title="Edit Checklist Items"
      >
        <FontAwesomeIcon icon={faList} className="h-3.5 w-3.5" />
      </button>

      {/* LOGS BUTTON */}
      {/* <button
        onClick={onLogs}
        className="p-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
        title="Execution Logs"
      >
        <FontAwesomeIcon icon={faHistory} className="h-3.5 w-3.5" />
      </button> */}
    </div>
  );
};


// Add this QuotationViewModal component before your main ExecutionPending component

interface QuotationViewModalProps {
  show: boolean;
  onClose: () => void;
  master_id: number;
  lead?: any;
}


// Checklist View Modal - Shows only selected items
const ChecklistViewModal = ({ lead, items, selectedItems, onClose }) => {
  if (!lead) return null;

  // Filter to show only selected items
  const getSelectedItemsWithDetails = () => {
    const result = [];
    
    items.forEach(checklist => {
      checklist.items.forEach(item => {
        if (selectedItems.includes(item.item_id)) {
          result.push({
            ...item,
            checklist_name: checklist.checklist_name
          });
        }
      });
    });
    
    return result;
  };

  const selectedItemsWithDetails = getSelectedItemsWithDetails();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faEye} className="text-blue-500" />
              Selected Checklist Items
            </h2>
            <p className="text-sm text-gray-500">
              {lead.name} • #{lead.master_id}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-xl px-2 hover:bg-gray-200 rounded-lg p-1"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {selectedItemsWithDetails.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FontAwesomeIcon icon={faEye} className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No items selected</p>
              <p className="text-sm">This lead has no checklist items</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group by checklist */}
              {items.map(checklist => {
                const checklistSelectedItems = checklist.items.filter(
                  item => selectedItems.includes(item.item_id)
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
              
              {/* Summary */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Selected Items:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {selectedItemsWithDetails.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


// Checklist Edit Modal - Shows all items for editing
const ChecklistEditModal = ({ 
  lead, 
  items, 
  selectedItems, 
  onToggle, 
  onSave, 
  onClose,
  saving 
}) => {
  if (!lead) return null;

  const totalItems = items.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50">
          <div>
            <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faEdit} className="text-green-500" />
              Edit Checklist Items 
            </h2>
            <p className="text-sm text-gray-500">
              {lead.name} • #{lead.master_id}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-xl px-2 hover:bg-gray-200 rounded-lg p-1"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">Selection Progress</span>
            <span className="text-xs font-bold text-green-600">
              {selectedItems.length}/{totalItems} items
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedItems.length / totalItems) * 100}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {items.map((checklist) => (
              <div key={checklist.checklist_id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  {checklist.checklist_name}
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2">
                    {checklist.items.length} items
                  </span>
                </h3>
                
                <div className="space-y-2">
                  {checklist.items.map((item) => {
                    const isSelected = selectedItems.includes(item.item_id);
                    
                    return (
                      <label
                        key={item.item_id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                            : 'hover:bg-gray-50 border-gray-200 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggle(item.item_id)}
                          className="mt-1 h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <span className={`text-sm flex-1 ${
                          isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                        }`}>
                          {item.item_name}
                        </span>
                        {isSelected && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Selected
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                Save Changes ({selectedItems.length} items)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuotationViewModal: React.FC<QuotationViewModalProps> = ({
  show,
  onClose,
  master_id,
  lead
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRevision, setCurrentRevision] = useState<number | null>(null);

  useEffect(() => {
    if (show && master_id) {
      fetchLatestQuotation();
    }
  }, [show, master_id]);

  const fetchLatestQuotation = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${BASE_URL}api/quotation/latest/${master_id}`;
      console.log('Fetching latest quotation from:', url);
      
      const response = await axios.get(url, {
        withCredentials: true
      });
      
      console.log('API Response:', response.data);
      
      if (response.data) {
        setData(response.data);
        setCurrentRevision(response.data.revision);
      } else {
        setError('No quotation data found');
      }
      
    } catch (err: any) {
      console.error('Error fetching quotation:', err);
      setError(err.response?.data?.message || 'Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  // Get quotation data
  const quotationsArray = data?.quotations || [];
  const quotationData = quotationsArray[0] || {};
  const leadInfo = data?.lead || lead || {};
  const items = quotationData.items || [];

  // Group items by option/subject from your data structure
  // Since your data doesn't have explicit options, we'll treat each kit as an option
  const options = items.map((kit: any, index: number) => ({
    option_number: index + 1,
    option_name: kit.kit_name,
    items: kit.items || []
  }));

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex justify-center items-center px-4 overflow-y-auto">
  <div className="bg-white dark:bg-boxdark w-full max-w-4xl my-8 max-h-[calc(100vh-4rem)] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
    
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
          <div>
            <div className="font-bold text-xl text-gray-800 dark:text-white">
              Quotation {quotationData.qt_number || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {leadInfo.name} • {leadInfo.city || ''} • #{master_id}
            </div>
            {currentRevision && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                Revision: v{currentRevision}
              </div>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-2xl px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3 text-gray-500">Loading quotation...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4 text-lg">{error}</div>
              <button
                onClick={() => fetchLatestQuotation()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : options.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No options found in this quotation</p>
            </div>
          ) : (
            <div className="space-y-8">
              {options.map((option, optIdx) => (
                <div key={optIdx} className="border rounded-lg overflow-hidden">
                  {/* Subject/Option Header */}
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 px-6 py-3 border-b">
                    <div className="text-center">
                     
                      <div className="text-lg font-bold text-gray-800 dark:text-white mt-1">
                        {option.option_name}
                      </div>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-blue-50 dark:bg-blue-900/20">
                        <tr>
                          <th className="border px-4 py-2 text-left text-sm font-semibold">#</th>
                          <th className="border px-4 py-2 text-left text-sm font-semibold">Product</th>
                          <th className="border px-4 py-2 text-left text-sm font-semibold">Model</th>
                          <th className="border px-4 py-2 text-center text-sm font-semibold w-20">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {option.items.map((item: any, itemIdx: number) => (
                          <tr key={itemIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="border px-4 py-2 text-center text-sm">
                              {itemIdx + 1}
                            </td>
                            <td className="border px-4 py-2 text-sm">
                              {item.product_type_name || item.cat_name || 'Product'}
                              {item.brand_name && (
                                <div className="text-xs text-gray-500 mt-0.5">{item.brand_name}</div>
                              )}
                            </td>
                            <td className="border px-4 py-2 text-sm font-mono">
                              {item.model || '—'}
                            </td>
                            <td className="border px-4 py-2 text-center text-sm">
                              {item.qty || 0}
                            </td>
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

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
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
          className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white ${
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
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white ${
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
          <p className="text-sm text-gray-700 dark:text-gray-300">
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
              <ChevronDown className="h-5 w-5 rotate-90" />
            </button>

            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 focus:outline-offset-0"
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
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
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
              <ChevronDown className="h-5 w-5 -rotate-90" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Lead Details Modal Component
const LeadDetailsModal = ({ lead, onClose }) => {
  if (!lead) return null;

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

  const formatValue = (value) => {
    if (!value || value === '' || value === 'Not Available' || value === 'N/A') {
      return 'N/A';
    }
    return value;
  };

  const hasField = (fieldName) => {
    return lead[fieldName] && lead[fieldName] !== '' && lead[fieldName] !== 'Not Available';
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {lead.name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white truncate">
                    {formatValue(lead.name)}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                      ID: #{lead.master_id}
                    </span>
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                      {formatValue(lead.city)}
                    </span>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
                      {lead.execution_schedule_name || 'Schedule'}
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
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
          {/* Execution Details Section - New */}
          <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faLayerGroup} className="h-4 w-4 text-indigo-500" />
              Execution Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Schedule Name</div>
                <div className="font-medium text-black dark:text-white">{formatValue(lead.execution_schedule_name)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Process Count</div>
                <div className="font-medium text-black dark:text-white">
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md">
                    {lead.execution_process_count || 0} Processes
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Execution Status</div>
                <div className="font-medium text-black dark:text-white">{formatValue(lead.execution_status)}</div>
              </div>
              {hasField('execution_remark') && (
                <div className="col-span-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Execution Remark</div>
                  <div className="font-medium text-black dark:text-white">{formatValue(lead.execution_remark)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-blue-500" />
                  Client Information
                </h3>
                <div className="space-y-3">
                  {hasField('name') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.name)}</div>
                    </div>
                  )}
                  {hasField('number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.number)}</div>
                    </div>
                  )}
                  {hasField('alternate_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Alternate Phone</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.alternate_number)}</div>
                    </div>
                  )}
                  {hasField('email') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.email)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-green-500" />
                  Address
                </h3>
                <div className="space-y-3">
                  {hasField('address') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Full Address</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.address)}</div>
                    </div>
                  )}
                  {hasField('city') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">City</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.city)}</div>
                    </div>
                  )}
                  {hasField('area_name') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Area</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.area_name)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBuilding} className="h-4 w-4 text-purple-500" />
                  Project Details
                </h3>
                <div className="space-y-3">
                  {(hasField('room_length') || hasField('room_width')) && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Room Size</div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(lead.room_length)} × {formatValue(lead.room_width)}
                        {hasField('room_height') && ` × ${formatValue(lead.room_height)}`}
                      </div>
                    </div>
                  )}
                  {hasField('p_type') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Project Type</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.p_type)}</div>
                    </div>
                  )}
                  {hasField('budget_range') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Budget Range</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.budget_range)}</div>
                    </div>
                  )}
                  {hasField('time_to_complete') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time to Complete</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.time_to_complete)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-800/30">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-orange-500" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  {hasField('execution_start_date') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Execution Start Date</div>
                      <div className="font-medium text-black dark:text-white">{formatDate(lead.execution_start_date)}</div>
                    </div>
                  )}
                  {hasField('execution_end_date') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Execution End Date</div>
                      <div className="font-medium text-black dark:text-white">{formatDate(lead.execution_end_date)}</div>
                    </div>
                  )}
                  {hasField('created_at') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created Date</div>
                      <div className="font-medium text-black dark:text-white">{formatDate(lead.created_at)}</div>
                    </div>
                  )}
                  {hasField('assign_date') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned Date</div>
                      <div className="font-medium text-black dark:text-white">{formatDate(lead.assign_date)}</div>
                    </div>
                  )}
                  {hasField('latest_reassignment_date') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Reassignment</div>
                      <div className="font-medium text-black dark:text-white">{formatDate(lead.latest_reassignment_date)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks & Assignment Info (Moved from main table) */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Remarks */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4 text-gray-500" />
                Remarks
              </h3>
              <div className="space-y-3">
                {hasField('quick_remark') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quick Remark</div>
                    <div className="text-sm text-black dark:text-white">{formatValue(lead.quick_remark)}</div>
                  </div>
                )}
                {hasField('detailed_remark') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Detailed Remark</div>
                    <div className="text-sm text-black dark:text-white whitespace-pre-line">{formatValue(lead.detailed_remark)}</div>
                  </div>
                )}
                {hasField('latest_remark') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Latest Remark</div>
                    <div className="text-sm text-black dark:text-white">{formatValue(lead.latest_remark)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Info - Previously in main table */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-indigo-500" />
                Assignment Information
              </h3>
              <div className="space-y-3">
                {hasField('assigned_to') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned To</div>
                    <div className="font-medium text-black dark:text-white">{formatValue(lead.assigned_to)}</div>
                  </div>
                )}
                {hasField('telecaller_name') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Telecaller</div>
                    <div className="font-medium text-black dark:text-white">{formatValue(lead.telecaller_name)}</div>
                  </div>
                )}
                {/* Stage moved here from main table */}
                {hasField('lead_stage') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stage</div>
                    <div className="font-medium text-black dark:text-white">
                      <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-md">
                        {formatValue(lead.lead_stage)}
                      </span>
                    </div>
                  </div>
                )}
                {hasField('lead_status') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lead Status</div>
                    <div className="font-medium text-black dark:text-white">{formatValue(lead.lead_status)}</div>
                  </div>
                )}
                {hasField('cat_name') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</div>
                    <div className="font-medium text-black dark:text-white">{formatValue(lead.cat_name)}</div>
                  </div>
                )}
                {hasField('reference_name') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference</div>
                    <div className="font-medium text-black dark:text-white">{formatValue(lead.reference_name)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Numbers */}
          {(hasField('architect_name') || hasField('ar_number') || hasField('ca_number') || 
            hasField('e_number') || hasField('sm_number') || hasField('pop_number')) && (
            <div className="mt-6">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-teal-100 dark:border-teal-800/30">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-teal-500" />
                  Contact Numbers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hasField('architect_name') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Architect Name</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.architect_name)}</div>
                    </div>
                  )}
                  {hasField('ar_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Architect Number</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.ar_number)}</div>
                    </div>
                  )}
                  {hasField('ca_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CA Number</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.ca_number)}</div>
                    </div>
                  )}
                  {hasField('e_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Electrician</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.e_number)}</div>
                    </div>
                  )}
                  {hasField('sm_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Site Manager</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.sm_number)}</div>
                    </div>
                  )}
                  {hasField('pop_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">POP Number</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.pop_number)}</div>
                    </div>
                  )}
                  {hasField('other_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Other Number</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.other_number)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location Link */}
          {hasField('location_link') && (
            <div className="mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-blue-500" />
                  Location
                </h3>
                <a 
                  href={lead.location_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
                >
                  {lead.location_link}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const SettingsModal = ({ lead, onClose }) => {
  const [processes, setProcesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(null);

  const [logsModal, setLogsModal] = useState(null);
const [logsData, setLogsData] = useState([]);


  useEffect(() => {
    if (lead?.master_id) {
      fetchProcesses();
    }
  }, [lead]);

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchProcesses = async () => {
  try {
    setLoading(true);

    const res = await axios.get(
      `${BASE_URL}api/execution/processes/${lead.master_id}`,
      { withCredentials: true }
    );

    if (res.data.success) {
      console.log('API Response:', res.data.data); // 👈 Add this
      
      const formatted = res.data.data.map((item) => ({
        process_id: item.process_id,
        process_name: item.process_name,
        description: item.description || "",
        start_date: item.start_date ? item.start_date.split("T")[0] : "",
        end_date: item.end_date ? item.end_date.split("T")[0] : "",
        status: item.status || "pending",
        remark: item.remark || "",
        assigned_user_ids: item.assigned_user_ids || [],
        assigned_user_names: item.assigned_user_names || [],
      }));

      console.log('Formatted statuses:', formatted.map(p => p.status)); // 👈 Add this

      setProcesses(formatted);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  const openLogs = async (process) => {
  try {
    const res = await axios.get(
      `${BASE_URL}api/execution/process-logs/${lead.master_id}/${process.process_id}`,
      { withCredentials: true }
    );

    if (res.data.success) {
      setLogsData(res.data.data);
      setLogsModal(process);
    }
  } catch (err) {
    console.error(err);
  }
};


  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/users`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...processes];
    updated[index][field] = value;
    setProcesses(updated);
  };


  const handleSave = async (process) => {
  try {
    await axios.post(
      `${BASE_URL}api/execution/save-process`,
      {
        lead_id: lead.master_id,
        process_id: process.process_id,
        process_name: process.process_name,
        start_date: process.start_date,
        end_date: process.end_date,
        status: process.status,
        assigned_user_ids: process.assigned_user_ids || [], // ✅ fixed
        remark: process.remark,
      },
      { withCredentials: true }
    );

    alert("Saved Successfully ✅");
    fetchProcesses();
  } catch (err) {
    console.error(err);
  }
};


  if (!lead) return null;

  return (
    <>
      {/* MAIN MODAL */}
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
<div className="bg-white dark:bg-boxdark w-full max-w-4xl rounded-lg shadow-lg ml-36 mt-12">
          {/* HEADER */}
          <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold dark:text-white">
                Process Management
              </h2>
              <p className="text-sm text-gray-500">
                {lead.name} • #{lead.master_id}
              </p>
            </div>
            <button onClick={onClose} className="text-xl">×</button>
          </div>

          {/* TABLE */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-6">Loading...</div>
            ) : (
              <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left">Process</th>
                    <th className="px-3 py-2 text-left">Start</th>
                    <th className="px-3 py-2 text-left">End</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>

            <tbody>
  {processes.map((process, index) => (
    <tr 
      key={process.process_id} 
      className="border-t"
      style={{
        backgroundColor: 
          process.status === 'in_progress' ? '#e6f7ff' :    // light blue
          process.status === 'hold_by_avcore' ? '#fff2e6' : // light orange
          process.status === 'hold_by_client' ? '#fff0f0' : // light red
          process.status === 'completed' ? '#e6ffe6' :      // light green
          'transparent',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => {
        if (!process.status.includes('hold')) {
          e.currentTarget.style.backgroundColor = 
            process.status === 'in_progress' ? '#bae7ff' :
            process.status === 'completed' ? '#d9f7d9' : 
            e.currentTarget.style.backgroundColor;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 
          process.status === 'in_progress' ? '#e6f7ff' :
          process.status === 'hold_by_avcore' ? '#fff2e6' :
          process.status === 'hold_by_client' ? '#fff0f0' :
          process.status === 'completed' ? '#e6ffe6' : 
          'transparent';
      }}
    >
      <td className="px-3 py-2">
        <div className="font-semibold">
          {process.process_name}
        </div>
        {process.description && (
          <div className="text-xs text-gray-400">
            {process.description}
          </div>
        )}
      </td>

      <td className="px-3 py-2">
        {process.start_date || "-"}
      </td>

      <td className="px-3 py-2">
        {process.end_date || "-"}
      </td>

      <td className="px-3 py-2 font-medium">
        {process.status.replace(/_/g, ' ')}
      </td>

      <td className="px-3 py-2">
        <div className="flex gap-2 justify-center">
          {/* EDIT ICON */}
          <button
            onClick={() =>
              setEditModal({
                ...process,
                index,
                assigned_user_ids: process.assigned_user_ids || [],
              })
            }
            className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
          >
            <FontAwesomeIcon icon={faEdit} className="h-3 w-3" />
          </button>

          {/* LOGS ICON */}
          <button
            onClick={() => openLogs(process)}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            <FontAwesomeIcon icon={faHistory} className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL WITH USERS + REMARK */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-boxdark p-6 rounded-xl w-[600px] shadow-xl">

            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Edit Process
            </h3>

            {/* TWO COLUMN GRID */}
            <div className="grid grid-cols-2 gap-4 mb-4">

              <div>
                <label className="text-xs text-gray-500">Start Date</label>
                <input
                  type="date"
                  value={editModal.start_date || ""}
                  onChange={(e) =>
                    setEditModal({ ...editModal, start_date: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">End Date</label>
                <input
                  type="date"
                  value={editModal.end_date || ""}
                  onChange={(e) =>
                    setEditModal({ ...editModal, end_date: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-gray-500">Status</label>
                <select
                  value={editModal.status || "pending"}
                  onChange={(e) =>
                    setEditModal({ ...editModal, status: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="hold_by_client">Hold by Client</option>
                <option value="hold_by_avcore">Hold by Avcore</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* USERS CHECKBOXES */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Assign Users</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border p-2 rounded">

                {users.map((user) => {
  const selected = editModal.assigned_user_ids || [];

  return (
    <div key={user.user_id} className="flex items-center">
      <input
        type="checkbox"
        checked={selected.includes(user.user_id)}
        onChange={() => {
          let updated = [...selected];

          if (updated.includes(user.user_id)) {
            updated = updated.filter(id => id !== user.user_id);
          } else {
            updated.push(user.user_id);
          }

          setEditModal({
            ...editModal,
            assigned_user_ids: updated,  // ✅ STORE IDS
          });
        }}
        className="mr-2"
      />
      <span className="text-sm dark:text-white">
        {user.name}
      </span>
    </div>
  );
})}


                </div>
              </div>

              {/* REMARK */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Remark</label>
                <textarea
                  value={editModal.remark || ""}
                  onChange={(e) =>
                    setEditModal({ ...editModal, remark: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-1 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>


<button
  onClick={async () => {
    await handleSave(editModal);   // ✅ call common save function
    setEditModal(null);            // close modal after save
  }}
  className="px-4 py-1 bg-green-600 text-white rounded"
>
  Save Changes
</button>


            </div>

          </div>
        </div>
      )}


{/* LOGS MODAL */}
{logsModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
    <div className="bg-white dark:bg-boxdark p-6 rounded-xl w-[760px] max-h-[80vh] overflow-y-auto shadow-xl">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">
            {lead.name} • #{lead.master_id}
          </h3>
          <p className="text-sm text-gray-500">
            Process: {logsModal.process_name}
          </p>
        </div>

        <button
          onClick={() => setLogsModal(null)}
          className="text-xl px-2"
        >
          ×
        </button>
      </div>

      {/* TABLE */}
      {logsData.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          No logs available
        </div>
      ) : (
        <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
          
          {/* HEADER */}
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left">Start</th>
              <th className="px-3 py-2 text-left">End</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Assigned To</th>
              <th className="px-3 py-2 text-left">Remark</th>
              <th className="px-3 py-2 text-left">Updated By</th>
              <th className="px-3 py-2 text-left">Update Date</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {logsData.map((log) => (
              <tr key={log.log_id} className="border-t">
                
                {/* START */}
                <td className="px-3 py-2">
                  {log.start_date
                    ? new Date(log.start_date).toLocaleDateString("en-GB")
                    : "-"}
                </td>

                {/* END */}
                <td className="px-3 py-2">
                  {log.end_date
                    ? new Date(log.end_date).toLocaleDateString("en-GB")
                    : "-"}
                </td>

                {/* STATUS */}
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold
                    ${
                      log.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : log.status === "in_progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                    {log.status}
                  </span>
                </td>

             {/* ASSIGNED USERS - Shows ONLY users assigned in that specific log */}
<td className="px-3 py-2">
  {log.assigned_to_names?.length > 0 ? (
    <div className="font-medium text-blue-600">
      {log.assigned_to_names.join(", ")}
    </div>
  ) : (
    "-"
  )}
</td>

                {/* REMARK */}
                <td className="px-3 py-2">
                  {log.remark || "-"}
                </td>

                {/* UPDATED BY */}
                <td className="px-3 py-2">
                  {log.updated_by_name || "-"}
                </td>

                {/* DATE */}
                <td className="px-3 py-2">
                  {new Date(log.created_at).toLocaleString("en-GB")}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
)}


    </>
  );
};


const formatVal = (v: any) => {
  if (v === null || v === undefined || v === "") return "—";
  
  // Check if it's a date string (contains date pattern and possibly time)
  if (typeof v === 'string') {
    // Match YYYY-MM-DD format (with or without time)
    const datePattern = /^\d{4}-\d{2}-\d{2}/;
    if (datePattern.test(v)) {
      try {
        // Extract just the date part if it includes time
        const datePart = v.split(' ')[0].split('T')[0];
        if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Format as DD/MM/YYYY
          const [year, month, day] = datePart.split('-');
          return `${day}/${month}/${year}`;
        }
      } catch (e) {
        // If parsing fails, return original
        return v;
      }
    }
  }
  
  return v;
};

const ExecutionLogsModal = ({
  lead,
  logs,
  onClose,
}: {
  lead: any;
  logs: any;
  onClose: () => void;
}) => {
  if (!lead || !logs) return null;

  const formatValue = (v: any) => {
    if (v === null || v === undefined || v === "") return "—";
    
    // Handle date strings
    if (typeof v === 'string') {
      // Check if it's a date string (contains date pattern)
      const datePattern = /^\d{4}-\d{2}-\d{2}/;
      if (datePattern.test(v)) {
        try {
          // Extract just the date part if it includes time
          const datePart = v.split(' ')[0].split('T')[0];
          if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Format as DD/MM/YYYY
            const [year, month, day] = datePart.split('-');
            return `${day}/${month}/${year}`;
          }
        } catch (e) {
          // If parsing fails, return original
          return v;
        }
      }
    }
    
    return v;
  };

  const formatDateTime = (d: string) => {
    if (!d) return "—";
    try {
      const date = new Date(d);
      return date.toLocaleString("en-GB", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return d;
    }
  };

  // Handle both array and { data: [] } formats
  const logsArray = Array.isArray(logs) ? logs : logs.data || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div>
            <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faHistory} className="text-indigo-500" />
              Execution Logs
            </h2>
            <p className="text-sm text-gray-500">
              {lead.name} • #{lead.master_id}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-xl px-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {logsArray.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FontAwesomeIcon icon={faHistory} className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No logs available</p>
            </div>
          ) : (
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Changed Date</th>
                  <th className="px-3 py-2 text-left">Field</th>
                  <th className="px-3 py-2 text-left">Old Value</th>
                  <th className="px-3 py-2 text-left">New Value</th>
                  <th className="px-3 py-2 text-left">Changed By</th>
                </tr>
              </thead>

              <tbody>
                {logsArray.map((log: any, index: number) => (
                  <tr 
                    key={index} 
                    className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatDateTime(log.changed_at)}
                    </td>
                    
                   

                    <td className="px-3 py-2 font-medium">
                      {log.field_name?.replace(/_/g, ' ') || '—'}
                    </td>

                    <td className="px-3 py-2 max-w-xs truncate" title={log.old_value}>
                      {formatValue(log.old_value)}
                    </td>

                    <td className="px-3 py-2 max-w-xs truncate font-semibold text-blue-600 dark:text-blue-400" title={log.new_value}>
                      {formatValue(log.new_value)}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {log.changed_by || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>


      </div>
    </div>
  );
};


// Execution Documents Modal Component
const ExecutionDocumentsModal = ({ lead, documents, loading, onClose }: { 
  lead: any; 
  documents: any[]; 
  loading: boolean; 
  onClose: () => void;
}) => {
  if (!lead) return null;

  const formatDate = (dateString: string) => {
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

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    const colors: Record<string, string> = {
      'approved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'needs_revision': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  // Get unique process names
const processNames = Array.from(new Set(documents.map((doc: any) => doc.process_name).filter(Boolean))); 


  // Get client info from first document
  const clientInfo = documents.length > 0 ? {
    client_name: documents[0].client_name,
    city: documents[0].city,
    master_id: lead.master_id
  } : null;

  const getImageUrl = (filePath: string) => {
    if (!filePath) return null;
    return `${BASE_URL}uploads/${filePath}`;
  };

  return (
<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
  <div className="bg-white dark:bg-boxdark w-full max-w-5xl rounded-lg shadow-lg flex flex-col" 
       style={{ height: '85vh', marginTop: '22' }}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faFileText} className="text-purple-500" />
              Current Projects 
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {lead.name} • #{lead.master_id}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-2xl px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faFileText} className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No documents found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                No execution documents have been uploaded for this client.
              </p>
            </div>
          ) : (
            <div>
          

           

              {/* Documents Table */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faFileText} className="h-4 w-4 text-green-500" />
                  Process History({documents.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Process</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Remark</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Manager Status</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Manager Remark</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Image</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {documents.map((doc: any, idx: number) => (
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
              </div>
            </div>
          )}
        </div>

      
      </div>
    </div>
  );
};


// Main ExecutionPending Component
const ExecutionPending = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Changed to 50 per page
  const [totalLeads, setTotalLeads] = useState(0);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [showExecutionStartCalendar, setShowExecutionStartCalendar] = useState(false);
  const [showExecutionEndCalendar, setShowExecutionEndCalendar] = useState(false);
  const [showUserFilter, setShowUserFilter] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  
  const [selectedExecutionStartFromDate, setSelectedExecutionStartFromDate] = useState('');
  const [selectedExecutionStartToDate, setSelectedExecutionStartToDate] = useState('');
  const [selectedExecutionEndFromDate, setSelectedExecutionEndFromDate] = useState('');
  const [selectedExecutionEndToDate, setSelectedExecutionEndToDate] = useState('');
  const [selectedUsersFilter, setSelectedUsersFilter] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  
  const [availableCities, setAvailableCities] = useState([]);
  const [users, setUsers] = useState([]);
  const [customRecordCount, setCustomRecordCount] = useState<number | ''>('');
  
  // Refs
  const executionStartRef = useRef<HTMLDivElement>(null);
  const executionEndRef = useRef<HTMLDivElement>(null);
  const userFilterRef = useRef<HTMLDivElement>(null);
  const cityFilterRef = useRef<HTMLDivElement>(null);

  const [selectedSettingsLead, setSelectedSettingsLead] = useState(null);

const [showExecutionModal, setShowExecutionModal] = useState(false);
const [selectedExecutionLead, setSelectedExecutionLead] = useState(null);
const [schedules, setSchedules] = useState([]);


// Add these with your other state declarations
const [selectedLogsLead, setSelectedLogsLead] = useState<any>(null);
const [executionLogs, setExecutionLogs] = useState<any>(null);
const [logsLoading, setLogsLoading] = useState<boolean>(false);

const [showQuotationModal, setShowQuotationModal] = useState(false);
const [selectedQuotationLead, setSelectedQuotationLead] = useState<any>(null);


// Add with your other state declarations
const [selectedClientDetails, setSelectedClientDetails] = useState<any>(null);
const [showDetailsModal, setShowDetailsModal] = useState(false);
const [activeTab, setActiveTab] = useState('details');
const [documentsData, setDocumentsData] = useState({
  images: [],
  documents: [],
  videos: [],
});
const [loadingDocs, setLoadingDocs] = useState(false);
const [docsFetched, setDocsFetched] = useState(false);

const EMPTY_POSTER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMjUiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSIyMDAiIHk9IjExMiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+VmlkZW88L3RleHQ+PC9zdmc+';
const EMPTY_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNlNWU3ZWIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+SW1hZ2U8L3RleHQ+PC9zdmc+';


// Add this with your other state declarations
const [showExecutionDocumentsModal, setShowExecutionDocumentsModal] = useState(false);
const [selectedExecutionDocumentsLead, setSelectedExecutionDocumentsLead] = useState(null);
const [executionDocuments, setExecutionDocuments] = useState([]);
const [loadingExecutionDocs, setLoadingExecutionDocs] = useState(false);


// Document fetching function - exactly like in RawData
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
    
    response.data.documents.forEach((doc: any) => {
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


// Fetch execution documents by master_id
const fetchExecutionDocuments = async (master_id) => {
  if (!master_id) return;
  
  setLoadingExecutionDocs(true);
  try {
    const response = await axios.get(
      `${BASE_URL}api/daily-execution/manager-processes/${master_id}`,
      { withCredentials: true }
    );
    
    if (response.data.success) {
      setExecutionDocuments(response.data.data);
    } else {
      setExecutionDocuments([]);
    }
  } catch (error) {
    console.error("Error fetching execution documents:", error);
    setExecutionDocuments([]);
  } finally {
    setLoadingExecutionDocs(false);
  }
}; 


const handleViewExecutionDocuments = async (lead) => {
  setSelectedExecutionDocumentsLead(lead);
  await fetchExecutionDocuments(lead.master_id);
  setShowExecutionDocumentsModal(true);
};



// Add state for item counts
const [itemCounts, setItemCounts] = useState({});

// Fetch item counts for all leads
const fetchItemCounts = async (leads) => {
  try {
    const counts = {};
    for (const lead of leads) {
      const response = await axios.get(
        `${BASE_URL}api/execution/get-checklist/${lead.master_id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        counts[lead.master_id] = response.data.selected_items.length;
      }
    }
    setItemCounts(counts);
  } catch (error) {
    console.error("Error fetching item counts:", error);
  }
};

// Call it after fetching leads
useEffect(() => {
  if (leads.length > 0) {
    fetchItemCounts(leads);
  }
}, [leads]);

// In ExecutionPending.tsx, add this function with your other handlers

const handleEditExecution = (lead) => {
  console.log("Editing execution for lead:", lead.master_id);
  console.log("Execution ID:", lead.execution_id);
  console.log("Execution data:", lead);
  
  // Open the StartExecutionModal with this lead
  setSelectedExecutionLead(lead);
  setShowExecutionModal(true);
};



// Add these states
const [showChecklistViewModal, setShowChecklistViewModal] = useState(false);
const [showChecklistEditModal, setShowChecklistEditModal] = useState(false);
const [selectedChecklistLead, setSelectedChecklistLead] = useState(null);
const [checklistItems, setChecklistItems] = useState([]);
const [selectedItems, setSelectedItems] = useState([]);
const [loadingChecklist, setLoadingChecklist] = useState(false);




// Handle View Checklist (shows only selected items)
const handleViewChecklist = async (lead) => {
  try {
    setLoadingChecklist(true);
    setSelectedChecklistLead(lead);
    
    console.log("Fetching checklist for lead:", lead.master_id);
    
    const response = await axios.get(
      `${BASE_URL}api/execution/get-checklist/${lead.master_id}`,
      { withCredentials: true }
    );
    
    console.log("Checklist response:", response.data);
    
    if (response.data.success) {
      setSelectedItems(response.data.selected_items || []);
      
      // Also fetch all checklists to show item names
      const checklistRes = await axios.get(
        `${BASE_URL}api/execution/checklists`,
        { withCredentials: true }
      );
      
      if (checklistRes.data.success) {
        setChecklistItems(checklistRes.data.data);
      }
      
      setShowChecklistViewModal(true);
    } else {
      alert("Failed to load checklist: " + (response.data.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error fetching checklist:", error);
    console.error("Error response:", error.response?.data);
    alert("Failed to load checklist: " + (error.response?.data?.error || error.message));
  } finally {
    setLoadingChecklist(false);
  }
};

// Handle Edit Checklist (shows all items for editing)
const handleEditChecklist = async (lead) => {
  try {
    setLoadingChecklist(true);
    setSelectedChecklistLead(lead);
    
    // Fetch all checklists
    // const checklistRes = await axios.get(
    //   `${BASE_URL}api/execution/checklists`,
    //   { withCredentials: true }
    // );
    
    const checklistRes = await axios.get(
      `${BASE_URL}api/sujit/execution-checklists`,
      { withCredentials: true }
    );


    if (checklistRes.data.success) {
      setChecklistItems(checklistRes.data.data);
    }
    
    // Fetch selected items
    const selectedRes = await axios.get(
      `${BASE_URL}api/execution/get-checklist/${lead.master_id}`,
      { withCredentials: true }
    );
    
    if (selectedRes.data.success) {
      setSelectedItems(selectedRes.data.selected_items || []);
    }
    
    setShowChecklistEditModal(true);
  } catch (error) {
    console.error("Error fetching checklist for edit:", error);
    console.error("Error response:", error.response?.data);
    alert("Failed to load checklist for editing: " + (error.response?.data?.error || error.message));
  } finally {
    setLoadingChecklist(false);
  }
};

const handleSaveChecklist = async () => {
  if (!selectedChecklistLead) return;
  
  try {
    setLoadingChecklist(true);
    
    const response = await axios.post(
      `${BASE_URL}api/execution/save-checklist/${selectedChecklistLead.master_id}`,
      { selected_items: selectedItems },
      { withCredentials: true }
    );
    
    if (response.data.success) {
      alert(`Checklist updated successfully! ${selectedItems.length} items selected.`);
      setShowChecklistEditModal(false);
      
      // Update the item count for this lead
      setItemCounts(prev => ({
        ...prev,
        [selectedChecklistLead.master_id]: selectedItems.length
      }));
      
      // Refresh data if needed
      fetchPendingExecutionLeads();
    }
  } catch (error) {
    console.error("Error saving checklist:", error);
    alert("Failed to save checklist: " + (error.response?.data?.error || error.message));
  } finally {
    setLoadingChecklist(false);
  }
};


// Toggle item in edit mode
const toggleEditItem = (itemId) => {
  setSelectedItems(prev => 
    prev.includes(itemId) 
      ? prev.filter(id => id !== itemId)
      : [...prev, itemId]
  );
};


// Fetch documents when switching to documents tab
useEffect(() => {
  if (activeTab === 'documents' && selectedClientDetails?.master_id) {
    fetchDocuments(selectedClientDetails.master_id);
  }
}, [activeTab, selectedClientDetails?.master_id]);

// Reset document state when client changes
useEffect(() => {
  setActiveTab('details');
  setDocsFetched(false);
  setDocumentsData({ images: [], documents: [], videos: [] });
}, [selectedClientDetails?.master_id]);


const handleViewQuotation = (lead: any) => {
  setSelectedQuotationLead(lead);
  setShowQuotationModal(true);
};


const handleLogsClick = async (lead: any) => {
  try {
    setLogsLoading(true);
    setSelectedLogsLead(lead);

    const response = await axios.get(
      `${BASE_URL}api/execution/${lead.execution_id}`,
      { withCredentials: true }
    );

    if (response.data.success) {
      // Store the logs array directly
      setExecutionLogs(response.data.data); // Store the array, not wrapped in { data: [] }
    } else {
      setExecutionLogs([]);
    }
  } catch (err) {
    console.error("Error fetching execution logs:", err);
    setExecutionLogs([]);
  } finally {
    setLogsLoading(false);
  }
};



const renderDetailsModal = () => {
  if (!selectedClientDetails) return null;

  const isEmpty = (value) => {
    return (
      !value ||
      value === '' ||
      value === 'Not Available' ||
      value === 'N/A' ||
      value === 'null' ||
      value === null ||
      value === undefined
    );
  };

  const formatValue = (value) => {
    if (isEmpty(value)) return 'N/A';
    return value;
  };

  const hasField = (fieldName) => {
    return (
      selectedClientDetails[fieldName] &&
      !isEmpty(selectedClientDetails[fieldName])
    );
  };

  // Check for various sections
  const hasContactNumbers =
    hasField('ar_number') ||
    hasField('ca_number') ||
    hasField('e_number') ||
    hasField('sm_number') ||
    hasField('pop_number') ||
    hasField('other_number') ||
    hasField('architect_name') ||
    hasField('alternate_number');

  const hasLeadInfo =
    hasField('cat_name') ||
    hasField('category_other') ||
    hasField('reference_name') ||
    hasField('reference_other');

  const hasProjectDetails =
    hasField('room_length') ||
    hasField('room_width') ||
    hasField('room_height') ||
    hasField('p_type') ||
    hasField('budget_range') ||
    hasField('time_to_complete') ||
    hasField('room_ready');

  const hasDates =
    hasField('assign_date') ||
    hasField('followup_date') ||
    hasField('site_visit_date') ||
    hasField('demo_date') ||
    hasField('execution_start_date') ||
    hasField('execution_end_date');

  const hasAssignmentInfo =
    hasField('assigned_to') || hasField('telecaller_name');

  const hasLinks = hasField('document_location_link') || hasField('location_link');

  const hasRemarks = hasField('quick_remark') || hasField('detailed_remark') || hasField('execution_remark');

  const getFileIcon = (extension) => {
    const ext = extension?.toLowerCase() || '';
    if (ext.includes('pdf')) return '📕';
    if (ext.includes('doc')) return '📄';
    if (ext.includes('xls')) return '📊';
    if (ext.includes('ppt')) return '📽️';
    if (ext.includes('txt')) return '📝';
    return '📎';
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Compact Header with Tabs */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {selectedClientDetails.name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white truncate max-w-xs">
                    {selectedClientDetails.name}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1 flex-wrap">
                    {hasField('master_id') && (
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        ID: {selectedClientDetails.master_id}
                      </span>
                    )}
                    {hasField('execution_schedule_name') && (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        {selectedClientDetails.execution_schedule_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedClientDetails(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
              {documentsData.images.length +
                documentsData.documents.length +
                documentsData.videos.length >
                0 && (
                <span className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {documentsData.images.length +
                    documentsData.documents.length +
                    documentsData.videos.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
          {activeTab === 'details' ? (
            // Details Tab Content
            <div className="p-4 space-y-4">
              {/* Contact Info */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-blue-500" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {hasField('name') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(selectedClientDetails.name)}
                      </div>
                    </div>
                  )}
                  {hasField('number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(selectedClientDetails.number)}
                      </div>
                    </div>
                  )}
                  {hasField('alternate_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Alternate</div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(selectedClientDetails.alternate_number)}
                      </div>
                    </div>
                  )}
                  {hasField('email') && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(selectedClientDetails.email)}
                      </div>
                    </div>
                  )}
                  {hasField('address') && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded">
                        {formatValue(selectedClientDetails.address)}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 col-span-2">
                    {hasField('city') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">City</div>
                        <div className="font-medium text-black dark:text-white">{formatValue(selectedClientDetails.city)}</div>
                      </div>
                    )}
                    {hasField('area_name') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Area</div>
                        <div className="font-medium text-black dark:text-white">{formatValue(selectedClientDetails.area_name)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Execution Details */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-indigo-500" />
                  Execution Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {hasField('execution_schedule_name') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Schedule</div>
                      <div className="font-medium text-indigo-600 dark:text-indigo-400">
                        {formatValue(selectedClientDetails.execution_schedule_name)}
                      </div>
                    </div>
                  )}
                  {hasField('execution_process_count') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Processes</div>
                      <div className="font-medium text-black dark:text-white">
                        {selectedClientDetails.execution_process_count}
                      </div>
                    </div>
                  )}
                  {hasField('execution_status') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                      <div className="font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedClientDetails.execution_status === 'in_progress' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : selectedClientDetails.execution_status === 'completed'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {formatValue(selectedClientDetails.execution_status)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details */}
              {hasProjectDetails && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4 text-amber-500" />
                    Project Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {(hasField('room_length') || hasField('room_width')) && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Room Size</div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedClientDetails.room_length)} ×{' '}
                          {formatValue(selectedClientDetails.room_width)}
                          {hasField('room_height') &&
                            ` × ${formatValue(selectedClientDetails.room_height)}`}
                        </div>
                      </div>
                    )}
                    {hasField('p_type') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedClientDetails.p_type)}
                        </div>
                      </div>
                    )}
                    {hasField('budget_range') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Budget</div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedClientDetails.budget_range)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              {hasDates && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4 text-emerald-500" />
                    Timeline
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {hasField('execution_start_date') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</div>
                        <div className="font-medium text-black dark:text-white">
                          {formatDate(selectedClientDetails.execution_start_date)}
                        </div>
                      </div>
                    )}
                    {hasField('execution_end_date') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</div>
                        <div className="font-medium text-black dark:text-white">
                          {formatDate(selectedClientDetails.execution_end_date)}
                        </div>
                      </div>
                    )}
                    {hasField('assign_date') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entry Date</div>
                        <div className="font-medium text-black dark:text-white">
                          {formatDate(selectedClientDetails.assign_date)}
                        </div>
                      </div>
                    )}
                    {hasField('followup_date') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Follow-up</div>
                        <div className="font-medium text-black dark:text-white">
                          {formatDate(selectedClientDetails.followup_date)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assignment Info */}
              {hasAssignmentInfo && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-3 rounded-lg border border-teal-100 dark:border-teal-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-teal-500" />
                    Assignment
                  </h3>
                  <div className="space-y-2">
                    {hasField('assigned_to') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Assigned To</div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedClientDetails.assigned_to)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {hasRemarks && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-gray-500" />
                    Remarks
                  </h3>
                  <div className="space-y-2">
                    {hasField('execution_remark') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Execution Remark</div>
                        <div className="text-sm text-black dark:text-white bg-white dark:bg-gray-800 p-2 rounded border">
                          {formatValue(selectedClientDetails.execution_remark)}
                        </div>
                      </div>
                    )}
                    {hasField('detailed_remark') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Detailed Remark</div>
                        <div className="text-sm text-black dark:text-white bg-white dark:bg-gray-800 p-2 rounded border">
                          {formatValue(selectedClientDetails.detailed_remark)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Links */}
              {hasLinks && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-blue-500" />
                    Links
                  </h3>
                  <div className="space-y-2">
                    {hasField('document_location_link') && (
                      <a
                        href={selectedClientDetails.document_location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors border border-blue-200 dark:border-blue-700"
                      >
                        <FontAwesomeIcon icon={faFile} className="h-3 w-3" />
                        Document Location Link
                      </a>
                    )}
                    {hasField('location_link') && (
                      <a
                        href={selectedClientDetails.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors border border-green-200 dark:border-green-700"
                      >
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
                        Location Link
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Documents Tab Content
            <div className="p-4">
              {loadingDocs ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Loading documents...
                  </span>
                </div>
              ) : (
                <>
                  {/* Total Count */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                        Documents Summary
                      </h3>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {documentsData.images.length +
                          documentsData.documents.length +
                          documentsData.videos.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700/30">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {documentsData.images.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Images</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700/30">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {documentsData.documents.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700/30">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {documentsData.videos.length}
                        </div>
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
                                {doc.remark && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {doc.remark}
                                  </div>
                                )}
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
                  {documentsData.videos.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faVideo} className="h-4 w-4 text-purple-500" />
                        Videos ({documentsData.videos.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {documentsData.videos.map((video, index) => (
                          <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                          >
                            <div className="aspect-video bg-black">
                              <video controls className="w-full h-full" poster={EMPTY_POSTER}>
                                <source src={video.url} type="video/mp4" />
                              </video>
                            </div>
                            <div className="p-3">
                              <div className="flex justify-between items-start">
                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                  Video {index + 1}
                                </div>
                                <a
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-colors"
                                >
                                  Download
                                </a>
                              </div>
                              {video.remark && (
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                  {video.remark}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Documents Message */}
                  {documentsData.images.length === 0 &&
                    documentsData.documents.length === 0 &&
                    documentsData.videos.length === 0 && (
                      <div className="text-center py-12">
                        <FontAwesomeIcon icon={faFile} className="text-4xl text-gray-400 dark:text-gray-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                          No Documents Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-500 mt-1">
                          No documents have been uploaded for this client.
                        </p>
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




// Close logs modal
const closeLogsModal = () => {
  setSelectedLogsLead(null);
  setExecutionLogs(null);
};

  // Fetch pending execution leads
  const fetchPendingExecutionLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/sujit/get/closed-leads`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const leadsData = response.data.data;
        setLeads(leadsData);
        setFilteredLeads(leadsData);
        setTotalLeads(response.data.pagination?.total || 0);
        
        // Extract unique cities
        const cities = leadsData
          .map(lead => lead.city?.trim())
          .filter(city => city && city !== '' && city !== 'Not Available' && city !== 'N/A')
          .filter((city, index, self) => self.indexOf(city) === index)
          .sort() as string[];
        setAvailableCities(cities);
      }
    } catch (error) {
      console.error('Error fetching pending execution leads:', error);
      setLeads([]);
      setFilteredLeads([]);
      setTotalLeads(0);
    } finally {
      setLoading(false);
    }
  };

  // Add function to fetch schedules
const fetchSchedules = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}api/execution/schedules`,
      { withCredentials: true }
    );
    if (response.data.success) {
      setSchedules(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching schedules:', error);
  }
};

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...leads];
    
    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((lead) => {
        const searchFields = [
          lead.name?.toLowerCase() || '',
          lead.number?.toString() || '',
          lead.alternate_number?.toString() || '',
          lead.email?.toLowerCase() || '',
          lead.address?.toLowerCase() || '',
          lead.area_name?.toLowerCase() || '',
          lead.cat_name?.toLowerCase() || '',
          lead.master_id?.toString() || '',
          lead.city?.toLowerCase() || '',
          lead.assigned_to?.toLowerCase() || '',
          lead.execution_schedule_name?.toLowerCase() || '',
        ];
        return searchFields.some(field => field.includes(lowerSearch));
      });
    }

    // Execution Start Date filter
    if (selectedExecutionStartFromDate || selectedExecutionStartToDate) {
      filtered = filtered.filter(lead => {
        if (!lead.execution_start_date) return false;
        
        const date = new Date(lead.execution_start_date);
        if (isNaN(date.getTime())) return false;
        
        let fromDateValid = true;
        let toDateValid = true;
        
        if (selectedExecutionStartFromDate) {
          const fromDate = new Date(selectedExecutionStartFromDate);
          fromDateValid = date >= fromDate;
        }
        
        if (selectedExecutionStartToDate) {
          const toDate = new Date(selectedExecutionStartToDate);
          toDateValid = date <= toDate;
        }
        
        return fromDateValid && toDateValid;
      });
    }

    // Execution End Date filter
    if (selectedExecutionEndFromDate || selectedExecutionEndToDate) {
      filtered = filtered.filter(lead => {
        if (!lead.execution_end_date) return false;
        
        const date = new Date(lead.execution_end_date);
        if (isNaN(date.getTime())) return false;
        
        let fromDateValid = true;
        let toDateValid = true;
        
        if (selectedExecutionEndFromDate) {
          const fromDate = new Date(selectedExecutionEndFromDate);
          fromDateValid = date >= fromDate;
        }
        
        if (selectedExecutionEndToDate) {
          const toDate = new Date(selectedExecutionEndToDate);
          toDateValid = date <= toDate;
        }
        
        return fromDateValid && toDateValid;
      });
    }

    // User filter
    if (selectedUsersFilter.length > 0) {
      filtered = filtered.filter(lead => 
        lead.assigned_to && selectedUsersFilter.includes(lead.assigned_to)
      );
    }

    // City filter
    if (selectedCities.length > 0) {
      filtered = filtered.filter(lead => 
        lead.city && selectedCities.includes(lead.city)
      );
    }

    setFilteredLeads(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [
    searchTerm,
    selectedExecutionStartFromDate,
    selectedExecutionStartToDate,
    selectedExecutionEndFromDate,
    selectedExecutionEndToDate,
    selectedUsersFilter,
    selectedCities,
    leads
  ]);

  useEffect(() => {
    if (customRecordCount && typeof customRecordCount === 'number' && customRecordCount > 0) {
      setItemsPerPage(customRecordCount);
      setCurrentPage(1);
    } else {
      setItemsPerPage(10); // Default to 50
    }
  }, [customRecordCount]);

  
  useEffect(() => {
    fetchPendingExecutionLeads();
    fetchUsers();
      fetchSchedules(); // Add this
  }, [currentPage, itemsPerPage]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (executionStartRef.current && !executionStartRef.current.contains(event.target as Node)) {
        setShowExecutionStartCalendar(false);
      }
      if (executionEndRef.current && !executionEndRef.current.contains(event.target as Node)) {
        setShowExecutionEndCalendar(false);
      }
      if (userFilterRef.current && !userFilterRef.current.contains(event.target as Node)) {
        setShowUserFilter(false);
      }
      if (cityFilterRef.current && !cityFilterRef.current.contains(event.target as Node)) {
        setShowCityFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


const handleStartExecution = (lead) => {
  console.log("Starting execution for lead:", lead.master_id);
  console.log("Lead has execution_id?", lead.execution_id);
  setSelectedExecutionLead(lead);
  setShowExecutionModal(true);
};

const handleExecutionSubmit = (responseData) => {
  console.log('Execution started:', responseData);
  // Refresh data or show success message
  fetchPendingExecutionLeads(); // Refresh the list
};

  // Filter handlers
  const handleUserSelect = (userName: string) => {
    setSelectedUsersFilter(prev =>
      prev.includes(userName) ? prev.filter(u => u !== userName) : [...prev, userName]
    );
  };

  const handleCitySelect = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const clearFilters = () => {
    setSelectedExecutionStartFromDate('');
    setSelectedExecutionStartToDate('');
    setSelectedExecutionEndFromDate('');
    setSelectedExecutionEndToDate('');
    setSelectedUsersFilter([]);
    setSelectedCities([]);
    setSearchTerm('');
    setCustomRecordCount('');
    
    setShowExecutionStartCalendar(false);
    setShowExecutionEndCalendar(false);
    setShowUserFilter(false);
    setShowCityFilter(false);
    
    setFilteredLeads(leads);
  };

  const closeAllDropdowns = () => {
    setShowExecutionStartCalendar(false);
    setShowExecutionEndCalendar(false);
    setShowUserFilter(false);
    setShowCityFilter(false);
  };

  const handleCustomRecordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setCustomRecordCount('');
      return;
    }
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setCustomRecordCount(numValue);
    }
  };

  const clearCustomRecordCount = () => {
    setCustomRecordCount('');
    setItemsPerPage(10);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

const handleViewDetails = (lead) => {
  setSelectedClientDetails(lead);
  setShowDetailsModal(true);
};


// Handle Settings button click
const handleSettingsClick = (lead) => {
  setSelectedSettingsLead(lead);
};


  const totalPages = Math.ceil(totalLeads / itemsPerPage);
  const showingStart = totalLeads === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalLeads);

  return (
    <div className="p-4">
      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">  
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30">
                <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-1" />
                {totalLeads} Records
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Custom Record Count Input */}
              <div className="w-full sm:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Show N records"
                    value={customRecordCount}
                    onChange={handleCustomRecordInput}
                    min="1"
                  />
                  {customRecordCount && (
                    <button
                      onClick={clearCustomRecordCount}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Clear limit"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Input */}
              <div className="w-full sm:w-72">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Search name, phone, ID, city, schedule..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Reset Filter Button */}
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                Reset Filter
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchPendingExecutionLeads}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedExecutionStartFromDate || selectedExecutionStartToDate || 
        selectedExecutionEndFromDate || selectedExecutionEndToDate || 
        selectedUsersFilter.length > 0 || selectedCities.length > 0) && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {(selectedExecutionStartFromDate || selectedExecutionStartToDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Start Date: {selectedExecutionStartFromDate || 'Any'} to {selectedExecutionStartToDate || 'Any'}
                <button
                  onClick={() => {
                    setSelectedExecutionStartFromDate('');
                    setSelectedExecutionStartToDate('');
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  ×
                </button>
              </span>
            )}
            {(selectedExecutionEndFromDate || selectedExecutionEndToDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                End Date: {selectedExecutionEndFromDate || 'Any'} to {selectedExecutionEndToDate || 'Any'}
                <button
                  onClick={() => {
                    setSelectedExecutionEndFromDate('');
                    setSelectedExecutionEndToDate('');
                  }}
                  className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400"
                >
                  ×
                </button>
              </span>
            )}
            {selectedUsersFilter.map(user => (
              <span key={user} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                User: {user}
                <button
                  onClick={() => handleUserSelect(user)}
                  className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedCities.map(city => (
              <span key={city} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                City: {city}
                <button
                  onClick={() => handleCitySelect(city)}
                  className="ml-1 text-teal-600 hover:text-teal-800 dark:text-teal-400"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="ml-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <tr>
                  {/* Execution Start Date Column */}
                  <th className="py-3 px-4 relative">
                    <div ref={executionStartRef} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Start Date
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAllDropdowns();
                          setShowExecutionStartCalendar(!showExecutionStartCalendar);
                        }}
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                      >
                        <FontAwesomeIcon 
                          icon={faChevronDown} 
                          className={`h-3 w-3 transition-transform duration-200 ${showExecutionStartCalendar ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                    
                    {/* Execution Start Date Calendar Dropdown */}
                    {showExecutionStartCalendar && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">Select Start Date Range</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExecutionStartFromDate('');
                              setSelectedExecutionStartToDate('');
                              setShowExecutionStartCalendar(false);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              From Date
                            </label>
                            <input
                              type="date"
                              value={selectedExecutionStartFromDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedExecutionStartFromDate(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              To Date
                            </label>
                            <input
                              type="date"
                              value={selectedExecutionStartToDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedExecutionStartToDate(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowExecutionStartCalendar(false);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Apply Filter
                          </button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Execution End Date Column */}
                  <th className="py-3 px-4 relative">
                    <div ref={executionEndRef} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        End Date
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAllDropdowns();
                          setShowExecutionEndCalendar(!showExecutionEndCalendar);
                        }}
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                      >
                        <FontAwesomeIcon 
                          icon={faChevronDown} 
                          className={`h-3 w-3 transition-transform duration-200 ${showExecutionEndCalendar ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                    
                    {/* Execution End Date Calendar Dropdown */}
                    {showExecutionEndCalendar && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">Select End Date Range</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExecutionEndFromDate('');
                              setSelectedExecutionEndToDate('');
                              setShowExecutionEndCalendar(false);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              From Date
                            </label>
                            <input
                              type="date"
                              value={selectedExecutionEndFromDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedExecutionEndFromDate(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              To Date
                            </label>
                            <input
                              type="date"
                              value={selectedExecutionEndToDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedExecutionEndToDate(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowExecutionEndCalendar(false);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Apply Filter
                          </button>
                        </div>
                      </div>
                    )}
                  </th>



                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Client Name
                    </div>
                  </th>
                  
                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Contact
                    </div>
                  </th>
                  
                  {/* City Column with Filter */}
                  <th className="py-3 px-4 relative">
                    <div ref={cityFilterRef} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        City
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAllDropdowns();
                          setShowCityFilter(!showCityFilter);
                        }}
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                      >
                        <FontAwesomeIcon 
                          icon={faFilter} 
                          className={`h-3 w-3 transition-colors duration-200 ${selectedCities.length > 0 ? 'text-blue-600' : ''} ${showCityFilter ? 'text-blue-600' : ''}`}
                        />
                      </button>
                    </div>
                    
                    {/* City Filter Dropdown */}
                    {showCityFilter && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">Filter Cities</span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCities([]);
                              }}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                            >
                              Clear All
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCityFilter(false);
                              }}
                              className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        
                        {availableCities.length > 0 ? (
                          <>
                            {availableCities.map((city) => (
                              <div key={city} className="flex items-center mb-2">
                                <input
                                  type="checkbox"
                                  id={`city-${city}`}
                                  checked={selectedCities.includes(city)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleCitySelect(city);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-3.5 w-3.5 mr-2.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                                />
                                <label 
                                  htmlFor={`city-${city}`}
                                  className="text-sm font-medium dark:text-white cursor-pointer truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {city}
                                </label>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
                            No cities available
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                  
                 
                                      {/* Schedule Name + Process Count - NEW */}
                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Schedule
                    </div>
                  </th>
<th className="py-3 px-4">
  <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
    Status
  </div>
</th>

<th className="py-3 px-4">
  <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
    Created At
  </div>
</th>

                  
                  {/* Action Column */}
                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Action
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <FontAwesomeIcon icon={faFileAlt} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No execution leads found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.master_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                     
                      {/* Execution Start Date */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                          {formatDate(lead.execution_start_date)}
                        </div>
                      </td>

                      {/* Execution End Date */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800/30 shadow-sm">
                          {formatDate(lead.execution_end_date)}
                        </div>
                      </td>



                      {/* Client Name - Clickable */}
                      <td className="py-4 px-4">
                        <div 
                          onClick={() => handleViewDetails(lead)}
                          className="group cursor-pointer"
                        >
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                            {lead.name || 'N/A'}
                          </div>

                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                          {lead.number || "—"}
                        </div>
                        {lead.alternate_number && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Alt: {lead.alternate_number}
                          </div>
                        )}
                      </td>

                      {/* City */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {lead.city || "—"}
                        </div>
                      </td>

                     
                      {/* Schedule Name + Process Count - NEW */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {lead.execution_schedule_name || 'N/A'}
                          </div>
                          <div className="text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full inline-flex items-center w-fit">
                            <FontAwesomeIcon icon={faLayerGroup} className="h-2.5 w-2.5 mr-1" />
                            {lead.execution_process_count || 0} Processes
                          </div>
                        </div>
                      </td>

                        <td className="py-4 px-4">
  <div className="flex justify-center">
    {lead.execution_status === 'startExecution' ? (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/30 shadow-sm">
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
         In Progress
      </span>
    ) : lead.execution_status === 'in_progress' ? (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30 shadow-sm">
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        In Progress
      </span>
    ) : lead.execution_status === 'completed' ? (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30 shadow-sm">
        <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
        Completed
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">
        {lead.execution_status || 'Pending'}
      </span>
    )}
  </div>
</td>

{/* Execution Created At */}
<td className="py-4 px-4">
  <div className="font-semibold text-sm bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800/30 shadow-sm">
    {formatDate(lead.execution_created_at)}
  </div>
</td>

<td className="py-1 px-2">
  <div className="flex justify-center">
    <ActionButton
      onView={() => handleViewChecklist(lead)}
      onEdit={() => handleEditChecklist(lead)}
        onViewDocuments={() => handleViewExecutionDocuments(lead)}  // ADD THIS LINE
      onEditExecution={() => handleEditExecution(lead)}  // NEW
      onSettings={() => handleSettingsClick(lead)}
      onLogs={() => handleLogsClick(lead)}
      onViewQuotation={() => handleViewQuotation(lead)}
      viewCount={itemCounts[lead.master_id] || 0}
      className="text-xs"
    />
  </div>
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
              totalItems={totalLeads}
              itemsPerPage={itemsPerPage}
              showingStart={showingStart}
              showingEnd={showingEnd}
            />
          )}
        </>
      )}

      {/* Lead Details Modal */}
      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {/* Settings Modal */}
{selectedSettingsLead && (
  <SettingsModal
    lead={selectedSettingsLead}
    onClose={() => setSelectedSettingsLead(null)}
  />
)}

{showExecutionModal && (

<StartExecutionModal
  show={showExecutionModal}
  onClose={() => {
    setShowExecutionModal(false);
    setSelectedExecutionLead(null);
  }}
  lead={selectedExecutionLead}
  schedules={schedules}
  users={users}
  selectedLeads={selectedExecutionLead ? [selectedExecutionLead] : []}
  onStartExecution={handleExecutionSubmit}
  // Remove executionId prop if you don't have it - the prefill will work based on lead
/>

)}



{selectedLogsLead && executionLogs && (
  <ExecutionLogsModal
    lead={selectedLogsLead}
    logs={executionLogs}
    onClose={closeLogsModal}
  />
)}


{/* Logs Loading Indicator */}
{logsLoading && (
  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9998]">
    <div className="bg-white dark:bg-boxdark p-4 rounded-lg shadow-lg flex items-center gap-3">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
      <span className="text-sm dark:text-white">Loading logs...</span>
    </div>
  </div>
)}


{/* Quotation View Modal */}
{showQuotationModal && selectedQuotationLead && (
  <QuotationViewModal
    show={showQuotationModal}
    onClose={() => {
      setShowQuotationModal(false);
      setSelectedQuotationLead(null);
    }}
    master_id={selectedQuotationLead.master_id}
    lead={selectedQuotationLead}
  />
)}

{/* Details Modal with Documents */}
{showDetailsModal && renderDetailsModal()}

{/* Checklist View Modal */}
{showChecklistViewModal && selectedChecklistLead && (
  <ChecklistViewModal
    lead={selectedChecklistLead}
    items={checklistItems}
    selectedItems={selectedItems}
    onClose={() => {
      setShowChecklistViewModal(false);
      setSelectedChecklistLead(null);
    }}
  />
)}

{/* Checklist Edit Modal */}
{showChecklistEditModal && selectedChecklistLead && (
  <ChecklistEditModal
    lead={selectedChecklistLead}
    items={checklistItems}
    selectedItems={selectedItems}
    onToggle={toggleEditItem}
    onSave={handleSaveChecklist}
    onClose={() => {
      setShowChecklistEditModal(false);
      setSelectedChecklistLead(null);
    }}
    saving={loadingChecklist}
  />
)}

{/* Loading Indicator */}
{loadingChecklist && (
  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9998]">
    <div className="bg-white dark:bg-boxdark p-4 rounded-lg shadow-lg flex items-center gap-3">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
      <span className="text-sm dark:text-white">Loading checklist...</span>
    </div>
  </div>
)} 


{/* Execution Documents Modal */}
{showExecutionDocumentsModal && selectedExecutionDocumentsLead && (
  <ExecutionDocumentsModal
    lead={selectedExecutionDocumentsLead}
    documents={executionDocuments}
    loading={loadingExecutionDocs}
    onClose={() => {
      setShowExecutionDocumentsModal(false);
      setSelectedExecutionDocumentsLead(null);
      setExecutionDocuments([]);
    }}
  />
)}



    </div>
  );
};

export default ExecutionPending;