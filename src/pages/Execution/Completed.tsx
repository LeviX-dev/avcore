import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faSearch,
  faFilter,
  faTimes,
  faFileAlt,
  faChevronDown,
  faLayerGroup,
  faPlay,
  faCalendarAlt,
  faUser,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faInfoCircle,
  faFile,
  faImage,
  faVideo,
  faBuilding,
  faEye,
  faFileText,
  faSave,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';

// ============================================
// TYPES
// ============================================

interface QuotationItem {
  model: string;
  brand_name: string;
  qty: number;
  price: number;
}

interface QuotationKit {
  items: QuotationItem[];
}

interface QuotationRevision {
  revision: number;
}

interface QuotationData {
  qt_number: string;
  type: string;
  total_price: number;
  acoustic_terms: string;
  items: QuotationKit[];
  additional_prices: Array<{ add_price_name: string; price: number }>;
  totals?: {
    total_with_gst: number;
  };
  revisions?: QuotationRevision[];
}

interface QuotationResponse {
  quotations: QuotationData[];
  lead: Lead;
}

interface Lead {
  master_id: number;
  name: string;
  number?: string;
  alternate_number?: string;
  email?: string;
  address?: string;
  city?: string;
  area_name?: string;
  p_type?: string;
  budget_range?: string;
  time_to_complete?: string;
  room_length?: string;
  room_width?: string;
  room_height?: string;
  execution_schedule_name?: string;
  execution_process_count?: number;
  execution_status?: string;
  execution_remark?: string;
  execution_start_date?: string;
  execution_end_date?: string;
  created_at?: string;
  assign_date?: string;
  latest_reassignment_date?: string;
  quick_remark?: string;
  detailed_remark?: string;
  latest_remark?: string;
  assigned_to?: string;
  telecaller_name?: string;
  lead_stage?: string;
  lead_status?: string;
  cat_name?: string;
  reference_name?: string;
  architect_name?: string;
  ar_number?: string;
  ca_number?: string;
  e_number?: string;
  sm_number?: string;
  pop_number?: string;
  other_number?: string;
  location_link?: string;
}

interface ChecklistItem {
  item_id: number;
  item_name: string;
}

interface Checklist {
  checklist_id: number;
  checklist_name: string;
  items: ChecklistItem[];
}

interface ChecklistResponse {
  success: boolean;
  selected_items: number[];
  data?: Checklist[];
  error?: string;
}

interface ApiResponse {
  success: boolean;
  data: Lead[];
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// ============================================
// QUOTATION VIEW MODAL
// ============================================

interface QuotationViewModalProps {
  show: boolean;
  onClose: () => void;
  master_id: number;
  lead?: Lead;
}

const QuotationViewModal: React.FC<QuotationViewModalProps> = ({
  show,
  onClose,
  master_id,
  lead
}) => {
  const [data, setData] = useState<QuotationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRevision, setSelectedRevision] = useState<number>(1);

  useEffect(() => {
    if (show && master_id) {
      fetchQuotation();
    }
  }, [show, master_id, selectedRevision]);

  const fetchQuotation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<QuotationResponse>(
        `${BASE_URL}api/quotation/${master_id}/${selectedRevision}`
      );
      setData(response.data);
    } catch (err) {
      console.error('Error fetching quotation:', err);
      setError('Failed to load quotation data');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const quotationData: Partial<QuotationData> = data?.quotations?.[0] || {};
  const leadInfo: Lead | {} = data?.lead || lead || {};

  // Calculate totals
  const isGST = quotationData.type === 'with_gst';
  const subtotal = Number(quotationData.total_price || 0);
  
  const additionalPrices = (quotationData.additional_prices || []).filter(
    (additional: { add_price_name: string; price: number }) => 
      additional.add_price_name && additional.add_price_name.trim() !== ''
  );
  
  let additionalTotal = 0;
  additionalPrices.forEach((additional: { add_price_name: string; price: number }) => {
    additionalTotal += Number(additional.price) || 0;
  });

  let gstAmount = 0;
  let projectTotal = subtotal + additionalTotal;
  
  if (isGST) {
    projectTotal = Number(quotationData.totals?.total_with_gst || 0) + additionalTotal;
  } else {
    gstAmount = subtotal * 0.18;
    projectTotal = subtotal + gstAmount + additionalTotal;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex justify-center items-start pt-32 px-3 overflow-y-auto">
      <div className="bg-white dark:bg-boxdark w-full max-w-3xl rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b dark:border-gray-700">
          <div>
            <div className="font-semibold">Quotation</div>
           
          </div>

          <div className="flex items-center gap-2">
            {data?.quotations?.[0]?.revisions && data.quotations[0].revisions.length > 0 && (
              <select
                value={selectedRevision}
                onChange={(e) => setSelectedRevision(Number(e.target.value))}
                className="border px-2 py-1 rounded text-xs dark:bg-gray-700"
              >
                {data.quotations[0].revisions.map((rev: QuotationRevision) => (
                  <option key={rev.revision} value={rev.revision}>
                    V{rev.revision}
                  </option>
                ))}
              </select>
            )}
            <button onClick={onClose} className="text-lg px-2">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center py-6">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-6">{error}</div>
          ) : !quotationData.qt_number ? (
            <div className="text-center py-6 text-gray-500">
              No quotation found
            </div>
          ) : (
            <>
              {/* QT Number */}
              <div className="flex justify-between items-center border p-2 rounded">
                <div>
                  <div className="text-xs text-gray-500">QT No</div>
                  <div className="font-semibold">{quotationData.qt_number}</div>
                </div>
                <div className="text-xs font-medium">
                  {isGST ? "GST Included" : "GST Extra"}
                </div>
              </div>

              {/* Items */}
              <table className="w-full text-xs border">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-2 py-1 text-left">Model</th>
                    <th className="px-2 py-1 text-right">Qty</th>
                    <th className="px-2 py-1 text-right">Rate</th>
                    <th className="px-2 py-1 text-right">Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationData.items?.flatMap((kit: QuotationKit) =>
                    kit.items?.map((item: QuotationItem, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="px-2 py-1">
                          <div className="font-medium">{item.model}</div>
                          <div className="text-[10px] text-gray-500">{item.brand_name}</div>
                        </td>
                        <td className="px-2 py-1 text-right">{item.qty}</td>
                        <td className="px-2 py-1 text-right">
                          ₹{Number(item.price / (parseInt(String(item.qty)) || 1)).toLocaleString('en-IN')}
                        </td>
                        <td className="px-2 py-1 text-right font-medium">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Summary */}
              <div className="border rounded p-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {additionalPrices.map((add: { add_price_name: string; price: number }, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{add.add_price_name}</span>
                    <span>₹{Number(add.price).toLocaleString('en-IN')}</span>
                  </div>
                ))}

                {!isGST && gstAmount > 0 && (
                  <div className="flex justify-between">
                    <span>GST 18%</span>
                    <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                  <span>Total</span>
                  <span>₹{projectTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Terms */}
              {quotationData.acoustic_terms && (
                <div className="border rounded p-2 text-xs">
                  <div className="font-medium mb-1">Terms</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {quotationData.acoustic_terms}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-4 py-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CHECKLIST VIEW MODAL
// ============================================

interface ChecklistViewModalProps {
  lead: Lead | null;
  items: Checklist[];
  selectedItems: number[];
  onClose: () => void;
}

const ChecklistViewModal: React.FC<ChecklistViewModalProps> = ({ 
  lead, 
  items, 
  selectedItems, 
  onClose 
}) => {
  if (!lead) return null;

  // Filter to show only selected items
  const getSelectedItemsWithDetails = (): Array<ChecklistItem & { checklist_name: string }> => {
    const result: Array<ChecklistItem & { checklist_name: string }> = [];
    
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

// ============================================
// ACTION BUTTON
// ============================================

interface ActionButtonProps {
  onViewQuotation: () => void;
  onViewChecklist: () => void;
  viewCount?: number;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  onViewQuotation,
  onViewChecklist,
  viewCount = 0,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* VIEW QUOTATION BUTTON */}
      <button
        onClick={onViewQuotation}
        className="p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        title="View Quotation"
      >
        <FontAwesomeIcon icon={faFileText} className="h-3.5 w-3.5" />
      </button>

      {/* VIEW CHECKLIST BUTTON */}
      <button
        onClick={onViewChecklist}
        className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md relative"
        title="View Selected Checklist Items"
      >
        <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
        {viewCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
            {viewCount}
          </span>
        )}
      </button>
    </div>
  );
};

// ============================================
// PAGINATION COMPONENT
// ============================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  showingStart: number;
  showingEnd: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showingStart,
  showingEnd,
}) => {
  const getPageNumbers = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

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

// ============================================
// ID DISPLAY MODAL
// ============================================

interface IdDisplayModalProps {
  lead: Lead | null;
  onClose: () => void;
}

const IdDisplayModal: React.FC<IdDisplayModalProps> = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faPlay} className="h-4 w-4" />
              Lead ID Information
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Client Name</div>
            <div className="font-medium text-black dark:text-white text-lg">{lead.name || 'N/A'}</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-lg border border-green-100 dark:border-green-800/30">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lead ID</div>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 text-center">
              #{lead.master_id}
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-400 text-center">
            Click the play button again to view this ID
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CLIENT DETAILS MODAL
// ============================================

interface ClientDetailsModalProps {
  lead: Lead | null;
  onClose: () => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ lead, onClose }) => {
  if (!lead) return null;

  const formatDate = (dateString?: string): string => {
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

  const formatValue = (value?: string | number): string => {
    if (!value || value === '' || value === 'Not Available' || value === 'N/A') {
      return 'N/A';
    }
    return String(value);
  };

  const hasField = (fieldName: keyof Lead): boolean => {
    const value = lead[fieldName];
    return !!value && value !== '' && value !== 'Not Available';
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
          {/* Execution Details Section */}
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

// ============================================
// MAIN EXECUTION COMPLETED COMPONENT
// ============================================

const ExecutionCompleted: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showIdModal, setShowIdModal] = useState(false);
  const [selectedIdLead, setSelectedIdLead] = useState<Lead | null>(null);
  
  // Client details modal state
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
  const [selectedClientDetails, setSelectedClientDetails] = useState<Lead | null>(null);
  
  // Quotation modal state
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedQuotationLead, setSelectedQuotationLead] = useState<Lead | null>(null);
  
  // Checklist modal states
  const [showChecklistViewModal, setShowChecklistViewModal] = useState(false);
  const [selectedChecklistLead, setSelectedChecklistLead] = useState<Lead | null>(null);
  const [checklistItems, setChecklistItems] = useState<Checklist[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  
  // Item counts for checklist badge
  const [itemCounts, setItemCounts] = useState<Record<number, number>>({});
  
  // Filter states
  const [showExecutionStartCalendar, setShowExecutionStartCalendar] = useState(false);
  const [showExecutionEndCalendar, setShowExecutionEndCalendar] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  
  const [selectedExecutionStartFromDate, setSelectedExecutionStartFromDate] = useState('');
  const [selectedExecutionStartToDate, setSelectedExecutionStartToDate] = useState('');
  const [selectedExecutionEndFromDate, setSelectedExecutionEndFromDate] = useState('');
  const [selectedExecutionEndToDate, setSelectedExecutionEndToDate] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [customRecordCount, setCustomRecordCount] = useState<number | ''>('');
  
  // Refs
  const executionStartRef = useRef<HTMLDivElement>(null);
  const executionEndRef = useRef<HTMLDivElement>(null);
  const cityFilterRef = useRef<HTMLDivElement>(null);

  // Fetch item counts for all leads
  const fetchItemCounts = async (leadsData: Lead[]) => {
    try {
      const counts: Record<number, number> = {};
      for (const lead of leadsData) {
        const response = await axios.get<ChecklistResponse>(
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

  // Fetch completed execution leads
  const fetchCompletedExecutionLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `${BASE_URL}api/complete/closed-leads`,
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
        setTotalPages(response.data.pagination?.totalPages || 1);
        
        // Extract unique cities
        const cities = leadsData
          .map(lead => lead.city?.trim())
          .filter((city): city is string => 
            !!city && city !== '' && city !== 'Not Available' && city !== 'N/A'
          )
          .filter((city, index, self) => self.indexOf(city) === index)
          .sort();
        setAvailableCities(cities);
        
        // Fetch item counts for these leads
        fetchItemCounts(leadsData);
      }
    } catch (error) {
      console.error('Error fetching completed execution leads:', error);
      setLeads([]);
      setFilteredLeads([]);
      setTotalLeads(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Format date function
  const formatDate = (dateString?: string): string => {
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

  // Handle play button click - show ID modal
  const handlePlayClick = (lead: Lead) => {
    setSelectedIdLead(lead);
    setShowIdModal(true);
  };

  // Handle client name click - show details modal
  const handleClientNameClick = (lead: Lead) => {
    setSelectedClientDetails(lead);
    setShowClientDetailsModal(true);
  };

  // Handle View Quotation
  const handleViewQuotation = (lead: Lead) => {
    setSelectedQuotationLead(lead);
    setShowQuotationModal(true);
  };

  // Handle View Checklist (shows only selected items)
  const handleViewChecklist = async (lead: Lead) => {
    try {
      setLoadingChecklist(true);
      setSelectedChecklistLead(lead);
      
      const response = await axios.get<ChecklistResponse>(
        `${BASE_URL}api/execution/get-checklist/${lead.master_id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setSelectedItems(response.data.selected_items || []);
        
        // Fetch all checklists to show item names
        const checklistRes = await axios.get<{ success: boolean; data: Checklist[] }>(
          `${BASE_URL}api/sujit/execution-checklists`,
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
      alert("Failed to load checklist: " + ((error as any).response?.data?.error || (error as Error).message));
    } finally {
      setLoadingChecklist(false);
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
          lead.detailed_remark?.toLowerCase() || '',
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
    selectedCities,
    leads
  ]);

  useEffect(() => {
    if (customRecordCount && typeof customRecordCount === 'number' && customRecordCount > 0) {
      setItemsPerPage(customRecordCount);
      setCurrentPage(1);
    }
  }, [customRecordCount]);

  useEffect(() => {
    fetchCompletedExecutionLeads();
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
      if (cityFilterRef.current && !cityFilterRef.current.contains(event.target as Node)) {
        setShowCityFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter handlers
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
    setSelectedCities([]);
    setSearchTerm('');
    setCustomRecordCount('');
    setItemsPerPage(10);
    
    setShowExecutionStartCalendar(false);
    setShowExecutionEndCalendar(false);
    setShowCityFilter(false);
    
    setFilteredLeads(leads);
  };

  const closeAllDropdowns = () => {
    setShowExecutionStartCalendar(false);
    setShowExecutionEndCalendar(false);
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const showingStart = totalLeads === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalLeads);

  return (
    <div className="p-4">
      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">  
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700/30">
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
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
                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Search name, phone, ID, city..."
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
                onClick={() => fetchCompletedExecutionLeads()}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
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
        selectedCities.length > 0) && (
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
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
                        className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 focus:outline-none transition-colors"
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
                            className="text-xs font-medium text-green-600 hover:text-green-800 dark:text-green-400 transition-colors"
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
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowExecutionStartCalendar(false);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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
                        className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 focus:outline-none transition-colors"
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
                            className="text-xs font-medium text-green-600 hover:text-green-800 dark:text-green-400 transition-colors"
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
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowExecutionEndCalendar(false);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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
                        className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 focus:outline-none transition-colors"
                      >
                        <FontAwesomeIcon 
                          icon={faFilter} 
                          className={`h-3 w-3 transition-colors duration-200 ${selectedCities.length > 0 ? 'text-green-600' : ''} ${showCityFilter ? 'text-green-600' : ''}`}
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
                              className="text-xs font-medium text-green-600 hover:text-green-800 dark:text-green-400 transition-colors"
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
                                  className="h-3.5 w-3.5 mr-2.5 text-green-600 rounded border-gray-300 focus:ring-2 focus:ring-green-500"
                                />
                                <label 
                                  htmlFor={`city-${city}`}
                                  className="text-sm font-medium dark:text-white cursor-pointer truncate hover:text-green-600 dark:hover:text-green-400 transition-colors"
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
                  
                  {/* Schedule Name + Process Count */}
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
                  
                  {/* Action Column */}
                  {/* <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Action
                    </div>
                  </th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <FontAwesomeIcon icon={faFileAlt} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No completed execution leads found</p>
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
                          onClick={() => handleClientNameClick(lead)}
                          className="group cursor-pointer"
                        >
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
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

                      {/* Schedule Name + Process Count */}
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

                      {/* Status */}
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30 shadow-sm">
                            <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                            Completed
                          </span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      {/* <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <ActionButton
                            onViewQuotation={() => handleViewQuotation(lead)}
                            onViewChecklist={() => handleViewChecklist(lead)}
                            viewCount={itemCounts[lead.master_id] || 0}
                          />
                        </div>
                      </td> */}
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

      {/* ID Display Modal */}
      {showIdModal && selectedIdLead && (
        <IdDisplayModal
          lead={selectedIdLead}
          onClose={() => {
            setShowIdModal(false);
            setSelectedIdLead(null);
          }}
        />
      )}

      {/* Client Details Modal */}
      {showClientDetailsModal && selectedClientDetails && (
        <ClientDetailsModal
          lead={selectedClientDetails}
          onClose={() => {
            setShowClientDetailsModal(false);
            setSelectedClientDetails(null);
          }}
        />
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

      {/* Loading Indicator for Checklist */}
      {loadingChecklist && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9998]">
          <div className="bg-white dark:bg-boxdark p-4 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
            <span className="text-sm dark:text-white">Loading checklist...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionCompleted;