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
  ChevronDown
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
  faImage
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';
import StartExecutionModal from "./StartExecutionModal";
import { useNavigate } from "react-router-dom";
import EditContactNumbersModal from './EditContactNumbersModal.js'; // Adjust path as needed



// ProgressStatus Component
const ProgressStatus: React.FC<{ 
  stage: string; 
  status_percentage?: number;
  is_drop_stage?: boolean;
  previous_stage?: string;
}> = ({ stage, status_percentage = 0, is_drop_stage = false, previous_stage = '' }) => {
  
  const cleanStage = stage ? stage.trim() : '';
  const percentage = status_percentage;
  
  const getProgressColor = (stage: string) => {
    const stageLower = stage.toLowerCase().trim();
    
    if (stageLower.includes('fresh')) return 'bg-[#FFFFFF] border border-gray-300';
    if (stageLower.includes('cold')) return 'bg-[#A9A9A9]';
    if (stageLower.includes('on hold')) return 'bg-[#FDFD96]';
    if (stageLower.includes('positive')) return 'bg-[#ADD8E6]';
    if (stageLower.includes('pre site')) return 'bg-[#E0B0FF]';
    if (stageLower.includes('past site') || stageLower.includes('post site')) return 'bg-[#593E67]';
    if (stageLower.includes('demo')) return 'bg-[#FFB6C1]';
    if (stageLower.includes('quote pending')) return 'bg-[#FFA500]';
    if (stageLower.includes('quote followup')) return 'bg-[#A52A2A]';
    if (stageLower.includes('projection')) return 'bg-[#90EE90]';
    if (stageLower.includes('drop')) return 'bg-[#FF0000]';
    if (stageLower.includes('closed')) return 'bg-[#006400]';
    
    return 'bg-[#A9A9A9]';
  };

  return (
    <div className="flex flex-col items-center w-16">
      <div className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
        {percentage}%
      </div>
      
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-0.5">
        <div 
          className={`h-full rounded-full ${getProgressColor(cleanStage)} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="w-full text-center">
        <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">
          {is_drop_stage ? previous_stage || cleanStage : cleanStage || 'N/A'}
        </div>
        {is_drop_stage && (
          <div className="text-[8px] text-red-500 font-medium mt-0.5">
            DROPPED
          </div>
        )}
      </div>
    </div>
  );
};


const ActionButton = ({ 
  children, 
  onClick, 
  title, 
  className = "",
  disabled = false, // Add this
  badgeCount = null
}) => {
  const baseStyles = "relative inline-flex items-center justify-center rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl";
  
  // Add disabled styles
  const buttonStyles = disabled 
    ? `${baseStyles} bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed opacity-50 px-4 py-2 ${className}`
    : `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 ${className}`;
  
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={buttonStyles}
      title={disabled ? "Add items to list first" : title}
      disabled={disabled}
    >
      <div className="relative flex items-center gap-2">
        {children}
        {badgeCount && badgeCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-md">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </div>
    </button>
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
        <div className="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {lead.name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white truncate">
                    {formatValue(lead.name)}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
                      Pre Execution
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                      ID: #{lead.master_id}
                    </span>
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                      {formatValue(lead.city)}
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
                  {hasField('created_at') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created Date</div>
                      <div className="font-medium text-black dark:text-white">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {hasField('assign_date') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned Date</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.assign_date)}</div>
                    </div>
                  )}
                  {hasField('latest_reassignment_date') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Reassignment</div>
                      <div className="font-medium text-black dark:text-white">{formatValue(lead.latest_reassignment_date)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks & Additional Info */}
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

            {/* Assignment Info */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-indigo-500" />
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
          {(hasField('architect_name') || hasField('ar_number') || hasField('ca_number')) && (
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Closed Leads Component
const PreExecution = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalLeads, setTotalLeads] = useState(0);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showContactEditModal, setShowContactEditModal] = useState(false);
const [selectedClientForContactEdit, setSelectedClientForContactEdit] = useState<any>(null);


  // Filter states
  const [showEntryDateCalendar, setShowEntryDateCalendar] = useState(false);
  const [showFollowupDateCalendar, setShowFollowupDateCalendar] = useState(false);
  const [showStageFilter, setShowStageFilter] = useState(false);
  const [showUserFilter, setShowUserFilter] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  
  const [selectedEntryFromDate, setSelectedEntryFromDate] = useState('');
  const [selectedEntryToDate, setSelectedEntryToDate] = useState('');
  const [selectedFollowupFromDate, setSelectedFollowupFromDate] = useState('');
  const [selectedFollowupToDate, setSelectedFollowupToDate] = useState('');
  const [selectedStages, setSelectedStages] = useState(['Pre Execution']);
  const [selectedUsersFilter, setSelectedUsersFilter] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  
  const [availableCities, setAvailableCities] = useState([]);
  const [users, setUsers] = useState([]);
  const [leadStages, setLeadStages] = useState([]);
  const [customRecordCount, setCustomRecordCount] = useState<number | ''>('');
  
  // Selection states
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedMasterIds, setSelectedMasterIds] = useState([]);
  
  const navigate = useNavigate();
  
  // Refs
  const entryDateRef = useRef<HTMLDivElement>(null);
  const followupDateRef = useRef<HTMLDivElement>(null);
  const stageFilterRef = useRef<HTMLDivElement>(null);
  const userFilterRef = useRef<HTMLDivElement>(null);
  const cityFilterRef = useRef<HTMLDivElement>(null);

    const [schedules, setSchedules] = useState([]);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [selectedExecutionLead, setSelectedExecutionLead] = useState(null);

  const [lastUpdate, setLastUpdate] = useState(Date.now());

  
// State for tracking refresh
const [refreshKey, setRefreshKey] = useState(0);

const [leadChecklistStatus, setLeadChecklistStatus] = useState({});

const checkLeadChecklistStatus = async (master_id) => {
  try {
const response = await axios.get(
  `${BASE_URL}api/execution/check-items/${master_id}`,
  { withCredentials: true }
);
    
    if (response.data.success) {
      setLeadChecklistStatus(prev => ({
        ...prev,
        [master_id]: response.data.has_items
      }));
    }
  } catch (error) {
    console.error("Error checking checklist status:", error);
  }
};


useEffect(() => {
  if (leads.length > 0) {
    leads.forEach(lead => {
      checkLeadChecklistStatus(lead.master_id);
    });
  }
}, [leads]);




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


// Simplified fetch function
const fetchClosedLeads = async () => {
  try {
    setLoading(true);
    const response = await axios.get(
      `${BASE_URL}api/execution/closed-leads`,
      {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          _t: Date.now(), // Always add timestamp to prevent caching
        },
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      }
    );

    if (response.data.success) {
      const leadsData = response.data.data;
      setLeads(leadsData);
      setFilteredLeads(leadsData);
      setTotalLeads(response.data.pagination?.total || 0);
      
      const cities = leadsData
        .map(lead => lead.city?.trim())
        .filter(city => city && city !== '' && city !== 'Not Available' && city !== 'N/A')
        .filter((city, index, self) => self.indexOf(city) === index)
        .sort() as string[];
      setAvailableCities(cities);
    }
  } catch (error) {
    console.error('Error fetching closed leads:', error);
    setLeads([]);
    setFilteredLeads([]);
    setTotalLeads(0);
  } finally {
    setLoading(false);
  }
};

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



  // Fetch users and lead stages
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchLeadStages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/leadstage`);
      setLeadStages(response.data);
    } catch (error) {
      console.error('Error fetching lead stages:', error);
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
        ];
        return searchFields.some(field => field.includes(lowerSearch));
      });
    }

    // Entry date filter
    if (selectedEntryFromDate || selectedEntryToDate) {
      filtered = filtered.filter(lead => {
        const leadDate = lead.assign_date || lead.created_at;
        if (!leadDate) return false;
        
        const date = new Date(leadDate);
        if (isNaN(date.getTime())) return false;
        
        let fromDateValid = true;
        let toDateValid = true;
        
        if (selectedEntryFromDate) {
          const fromDate = new Date(selectedEntryFromDate);
          fromDateValid = date >= fromDate;
        }
        
        if (selectedEntryToDate) {
          const toDate = new Date(selectedEntryToDate);
          toDateValid = date <= toDate;
        }
        
        return fromDateValid && toDateValid;
      });
    }

    // Followup date filter
    if (selectedFollowupFromDate || selectedFollowupToDate) {
      filtered = filtered.filter(lead => {
        if (!lead.followup_date) return false;
        
        const leadDate = new Date(lead.followup_date);
        if (isNaN(leadDate.getTime())) return false;
        
        let fromDateValid = true;
        let toDateValid = true;
        
        if (selectedFollowupFromDate) {
          const fromDate = new Date(selectedFollowupFromDate);
          fromDateValid = leadDate >= fromDate;
        }
        
        if (selectedFollowupToDate) {
          const toDate = new Date(selectedFollowupToDate);
          toDateValid = leadDate <= toDate;
        }
        
        return fromDateValid && toDateValid;
      });
    }

    // Stage filter
    if (selectedStages.length > 0) {
      filtered = filtered.filter(lead => 
        lead.lead_stage && selectedStages.includes(lead.lead_stage)
      );
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
    selectedEntryFromDate,
    selectedEntryToDate,
    selectedFollowupFromDate,
    selectedFollowupToDate,
    selectedStages,
    selectedUsersFilter,
    selectedCities,
    leads
  ]);


  useEffect(() => {
    if (customRecordCount && typeof customRecordCount === 'number' && customRecordCount > 0) {
      setItemsPerPage(customRecordCount);
      setCurrentPage(1);
    } else {
      setItemsPerPage(10);
    }
  }, [customRecordCount]);

useEffect(() => {
  fetchClosedLeads();
  fetchUsers();
  fetchLeadStages();
  fetchSchedules(); 
}, [currentPage, itemsPerPage]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (entryDateRef.current && !entryDateRef.current.contains(event.target as Node)) {
        setShowEntryDateCalendar(false);
      }
      if (followupDateRef.current && !followupDateRef.current.contains(event.target as Node)) {
        setShowFollowupDateCalendar(false);
      }
      if (stageFilterRef.current && !stageFilterRef.current.contains(event.target as Node)) {
        setShowStageFilter(false);
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

  // Filter handlers
  const handleStageSelect = (stage: string) => {
    setSelectedStages(prev =>
      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
    );
    setShowStageFilter(false);
  };

  const handleUserSelect = (userName: string) => {
    setSelectedUsersFilter(prev =>
      prev.includes(userName) ? prev.filter(u => u !== userName) : [...prev, userName]
    );
    setShowUserFilter(false);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
    setShowCityFilter(false);
  };

  const clearFilters = () => {
    setSelectedEntryFromDate('');
    setSelectedEntryToDate('');
    setSelectedFollowupFromDate('');
    setSelectedFollowupToDate('');
    setSelectedStages(['Pre Execution']);
    setSelectedUsersFilter([]);
    setSelectedCities([]);
    setSearchTerm('');
    setCustomRecordCount('');
    
    setShowEntryDateCalendar(false);
    setShowFollowupDateCalendar(false);
    setShowStageFilter(false);
    setShowUserFilter(false);
    setShowCityFilter(false);
    
    setFilteredLeads(leads);
  };

  const closeAllDropdowns = () => {
    setShowEntryDateCalendar(false);
    setShowFollowupDateCalendar(false);
    setShowStageFilter(false);
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
      setSelectedClients([]);
      setSelectedMasterIds([]);
    }
  };


  const handleViewDetails = (lead) => {
  setSelectedClientDetails(lead);
  setShowDetailsModal(true);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
    hasField('created_at');

  const hasAssignmentInfo =
    hasField('assigned_to') || hasField('telecaller_name');

  const hasLinks = hasField('document_location_link') || hasField('location_link');

  const hasRemarks = hasField('quick_remark') || hasField('detailed_remark') || hasField('latest_remark');

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
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
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
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        ID: {selectedClientDetails.master_id}
                      </span>
                    )}
                    {hasField('city') && (
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        {selectedClientDetails.city}
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
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500'
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
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faFile} className="h-4 w-4" />
              Documents
              {documentsData.images.length +
                documentsData.documents.length +
                documentsData.videos.length >
                0 && (
                <span className="ml-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full">
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

              


           

              {/* Contact Numbers */}
              {hasContactNumbers && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-3 rounded-lg border border-teal-100 dark:border-teal-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-teal-500" />
                    Additional Contacts
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {hasField('architect_name') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Architect</div>
                        <div className="font-medium text-black dark:text-white">{formatValue(selectedClientDetails.architect_name)}</div>
                      </div>
                    )}
                    {hasField('ar_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Architect Number</div>
                        <div className="font-medium text-black dark:text-white">{formatValue(selectedClientDetails.ar_number)}</div>
                      </div>
                    )}
                    {hasField('ca_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CA Number</div>
                        <div className="font-medium text-black dark:text-white">{formatValue(selectedClientDetails.ca_number)}</div>
                      </div>
                    )}
                    {hasField('e_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Electrician</div>
                        <div className="font-medium text-black dark:text-white">{formatValue(selectedClientDetails.e_number)}</div>
                      </div>
                    )}
                    {hasField('sm_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Site Manager</div>
                        <div className="font-medium text-black dark:text-white">{formatValue(selectedClientDetails.sm_number)}</div>
                      </div>
                    )}
                    {hasField('pop_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">POP Number</div>
                        <div className="font-medium text-black dark:text-white">{formatValue(selectedClientDetails.pop_number)}</div>
                      </div>
                    )}
                    {hasField('other_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Other Number</div>
                        <div className="font-medium text-black dark:text-white">{formatValue(selectedClientDetails.other_number)}</div>
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Loading documents...
                  </span>
                </div>
              ) : (
                <>
                  {/* Total Count */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                        Documents Summary
                      </h3>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
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

  // Handle Start Execution
  const handleStartExecution = (lead) => {
    setSelectedExecutionLead(lead);
    setShowExecutionModal(true);
  };

  // Add refreshKey to your useEffect dependencies
useEffect(() => {
  fetchClosedLeads();
  fetchUsers();
  fetchLeadStages();
  fetchSchedules(); 
}, [currentPage, itemsPerPage, refreshKey]); // Add refreshKey here

// Update handleExecutionSubmit to increment refreshKey
const handleExecutionSubmit = async (responseData) => {
  console.log('Execution started:', responseData);
  
  // Close modal
  setShowExecutionModal(false);
  setSelectedExecutionLead(null);
  
  // Increment refresh key to trigger re-fetch
  setRefreshKey(prev => prev + 1);
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700/30">
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
                {totalLeads} Design pipeline
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
                {customRecordCount && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1 ml-1">
                    Showing {customRecordCount} records per page
                  </div>
                )}
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
                onClick={fetchClosedLeads}
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
      {(selectedEntryFromDate || selectedEntryToDate || selectedFollowupFromDate || selectedFollowupToDate || 
        (selectedStages.length > 0 && !selectedStages.includes('Pre Execution')) || selectedUsersFilter.length > 0 || selectedCities.length > 0) && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {(selectedEntryFromDate || selectedEntryToDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Entry: {selectedEntryFromDate || 'Any'} to {selectedEntryToDate || 'Any'}
                <button
                  onClick={() => {
                    setSelectedEntryFromDate('');
                    setSelectedEntryToDate('');
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  ×
                </button>
              </span>
            )}
            {(selectedFollowupFromDate || selectedFollowupToDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Followup: {selectedFollowupFromDate || 'Any'} to {selectedFollowupToDate || 'Any'}
                <button
                  onClick={() => {
                    setSelectedFollowupFromDate('');
                    setSelectedFollowupToDate('');
                  }}
                  className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400"
                >
                  ×
                </button>
              </span>
            )}
            {selectedStages.filter(stage => stage !== 'Pre Execution').map(stage => (
              <span key={stage} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                Stage: {stage}
                <button
                  onClick={() => handleStageSelect(stage)}
                  className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedUsersFilter.map(user => (
              <span key={user} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                User: {user}
                <button
                  onClick={() => handleUserSelect(user)}
                  className="ml-1 text-orange-600 hover:text-orange-800 dark:text-orange-400"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <tr>
                 

                  {/* Entry Date Column with Filter */}
                  <th className="py-3 px-4 relative">
                    <div ref={entryDateRef} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Entry Date
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAllDropdowns();
                          setShowEntryDateCalendar(!showEntryDateCalendar);
                        }}
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                      >
                        <FontAwesomeIcon 
                          icon={faChevronDown} 
                          className={`h-3 w-3 transition-transform duration-200 ${showEntryDateCalendar ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                    
                    {/* Entry Date Calendar Dropdown */}
                    {showEntryDateCalendar && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">Select Entry Date Range</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEntryFromDate('');
                              setSelectedEntryToDate('');
                              setShowEntryDateCalendar(false);
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
                              value={selectedEntryFromDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedEntryFromDate(e.target.value);
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
                              value={selectedEntryToDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedEntryToDate(e.target.value);
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
                              setShowEntryDateCalendar(false);
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
<div ref={cityFilterRef} className="flex items-center gap-2">
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
                        
                        {selectedCities.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              Selected ({selectedCities.length}):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedCities.map(city => (
                                <span key={city} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700/30 shadow-sm">
                                  City: {city}
                                  <button
                                    onClick={() => handleCitySelect(city)}
                                    className="ml-1 text-teal-600 hover:text-teal-800 dark:text-teal-400 transition-colors"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                  
               

                  {/* User Assign Column with Filter */}
                  <th className="py-3 px-4 relative">
                    <div ref={userFilterRef} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        User Assign
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAllDropdowns();
                          setShowUserFilter(!showUserFilter);
                        }}
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faFilter}
                          className={`h-3 w-3 transition-colors duration-200 ${selectedUsersFilter.length > 0 ? 'text-blue-600' : ''} ${showUserFilter ? 'text-blue-600' : ''}`}
                        />
                      </button>
                    </div>
                    
                    {/* Assigned User Filter Dropdown */}
                    {showUserFilter && (
                      <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[220px] max-h-[300px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">Filter Users</span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUsersFilter([]);
                              }}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                            >
                              Clear All
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowUserFilter(false);
                              }}
                              className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        
                        {users.length > 0 ? (
                          <>
                            {users.map((user) => (
                              <div key={user.id} className="flex items-center mb-2">
                                <input
                                  type="checkbox"
                                  id={`user-${user.id}`}
                                  checked={selectedUsersFilter.includes(user.name)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleUserSelect(user.name);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-3.5 w-3.5 mr-2.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                                />
                                <label 
                                  htmlFor={`user-${user.id}`}
                                  className="text-sm font-medium dark:text-white cursor-pointer truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {user.name} ({user.role})
                                </label>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
                            Loading users...
                          </div>
                        )}
                        
                        {selectedUsersFilter.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              Selected ({selectedUsersFilter.length}):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedUsersFilter.map(user => (
                                <span 
                                  key={user} 
                                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30 shadow-sm truncate max-w-[100px]"
                                >
                                  {user}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                  

                  {/* Start Execution Action Button */}
<th className="py-3 pl-1 pr-4 relative">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Action
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <FontAwesomeIcon icon={faFileAlt} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No leads found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.master_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                     

                      {/* Entry Date */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                          {lead.assign_date
                            ? new Date(lead.assign_date).toLocaleDateString("en-GB")
                            : lead.created_at
                            ? new Date(lead.created_at).toLocaleDateString("en-GB")
                            : "—"}
                        </div>
                      </td>

                    
                      {/* Client Name */}
                      <td className="py-4 px-4">
                        <div 
                          onClick={() => handleViewDetails(lead)}
                          className="group cursor-pointer"
                        >
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                            {lead.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {lead.area_name || '—'}
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

                    
                      {/* Assigned User */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-semibold bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-700/30 shadow-sm text-center">
                          {lead.assigned_to || lead.telecaller_name || "—"}
                        </div>
                      </td>

                        <td className="p-0.5">
  <div className="flex gap-0.5 justify-center">
    
    {/* Run Button - Teal/Cyan */}
    <button
      onClick={() => handleStartExecution(lead)}
      title="Start Execution"
      disabled={!leadChecklistStatus[lead.master_id]}
      className="relative inline-flex items-center justify-center rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white text-[9px] px-2 py-1 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FontAwesomeIcon icon={faPlay} className="text-[7px] mr-1" />
      Run
    </button>

    {/* List Button - Blue/Sky */}
    <button
      onClick={() => navigate(`/execution-checklist/${lead.master_id}`)}
      title="Checklist"
      className="relative inline-flex items-center justify-center rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 text-white text-[9px] px-2 py-1 font-semibold"
    >
      <FontAwesomeIcon icon={faTasks} className="text-[7px] mr-1" />
      List
    </button>

    {/* Edit Button - Purple/Indigo */}
    <button
      onClick={() => {
        setSelectedClientForContactEdit(lead);
        setShowContactEditModal(true);
      }}
      title="Edit Contact Numbers"
      className="relative inline-flex items-center justify-center rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white text-[9px] px-2 py-1 font-semibold"
    >
      <FontAwesomeIcon icon={faEdit} className="text-[7px] mr-1" />
      Edit
    </button>

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

            {/* Execution Modal */}
      <StartExecutionModal
        show={showExecutionModal}
        onClose={() => {
          setShowExecutionModal(false);
          setSelectedExecutionLead(null);
        }}
        lead={selectedExecutionLead}
        schedules={schedules}
        users={users} // from your existing users state
        selectedLeads={selectedExecutionLead ? [selectedExecutionLead] : []}
        onStartExecution={handleExecutionSubmit}
      />
      
      {/* Details Modal with Documents */}
{showDetailsModal && renderDetailsModal()}

{/* Edit Contact Numbers Modal */}
<EditContactNumbersModal
  show={showContactEditModal}
  onClose={() => {
    setShowContactEditModal(false);
    setSelectedClientForContactEdit(null);
  }}
  client={selectedClientForContactEdit}
  onSuccess={() => {
    fetchClosedLeads(); // Refresh the leads data
  }}
/>

    </div>
  );
};

export default PreExecution;