import React, { useEffect, useState, useRef } from 'react';
import { BASE_URL } from '../../../public/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faEdit,
  faFileUpload,
  faImages,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage,
  faTimes,
  faDownload,
  faEye,
  faFile,
  faVideo,
  faFilter,
  faChevronDown,
  faCalendar,
  faMapMarkerAlt,
  faInfoCircle,
  faUser,
  faUsers,
  faTasks,
  faCalendarAlt,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb.js';
import axios from 'axios';
import EditTeleCallerForm from '../../pages/Call/EditCall.js';
import EditRawDataForm from '../Rawdata/UpdateRawData.js';

// Interfaces
interface Category {
  cat_id: number;
  cat_name: string;
}

interface Reference {
  reference_id: number;
  reference_name: string;
}

interface Area {
  area_id: number;
  area_name: string;
}

interface DropLead {
  area_name: string;
  master_id: number;
  name: string;
  number?: string;
  email?: string;
  address?: string;
  city?: string;
  cat_id?: number;
  status?: string;
  lead_status?: string;
  lead_stage?: string;
  created_at?: string;
  quick_remark?: string | null;
  detailed_remark?: string | null;
  followup_date?: string | null;
  assign_date?: string;
  assigned_to?: string;
  assigned_user_name?: string;
  reassignment_id?: number | null;
  reassignment_date?: string | null;
  reassigned_to?: string | null;
  telecaller_name?: string;
  document_count?: number;
  area?: string;
  cat_name?: string;
  reference_name?: string;
  room_length?: string | null;
  room_width?: string | null;
  room_height?: string | null;
  location_link?: string | null;
  p_type?: string | null;
  budget_range?: string | null;
  current_stage?: string | null;
  room_ready?: string | null;
  time_to_complete?: string | null;
  site_visit_date?: string | null;
  demo_date?: string | null;
  ar_number?: string | null;
  ca_number?: string | null;
  e_number?: string | null;
  sm_number?: string | null;
  pop_number?: string | null;
  other_number?: string | null;
  reassignment_remarks?: ReassignmentRemark[] | string[];
  latest_assignedTo?: string;
  latest_leadStage?: string;

  // Battery-related fields
  status_percentage?: number;
  is_drop_stage?: boolean;
  previous_stage?: string;

  // Additional fields for EditRawData
  category_other?: string;
  reference_other?: string;
  architect_name?: string;
  alternate_number?: string;
  reference_id?: number;
  area_id?: number;
  assign_id?: number;
  document_location_link?: string | null;
}

interface ReassignmentRemark {
  remark?: string;
  created_by_user?: number;
  created_at?: string;
  name?: string;
  role?: string;
  assignedTo?: string;
  leadStage?: string;
  reassignment_date?: string;
  [key: string]: any;
}

interface UpdateDataModalProps {
  showEditPopup: boolean;
  editingClient: DropLead | null;
  setEditingClient: React.Dispatch<React.SetStateAction<DropLead | null>>;
  closeEditPopup: () => void;
  fetchRawData: () => void;
  categories: Category[];
  references: Reference[];
  area: Area[];
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  showingStart: number;
  showingEnd: number;
}

interface DocumentData {
  images: DocItem[];
  documents: DocItem[];
  videos: DocItem[];
}

interface DocItem {
  doc_id: number;
  url: string;
  link?: string | null;
  remark?: string | null;
  document_type?: string;
}

// ActionButton Component
const ActionButton = ({
  children,
  onClick,
  title,
  className = '',
  variant = 'view',
  badgeCount = null,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  className?: string;
  variant?: 'call' | 'edit' | 'document' | 'view';
  badgeCount?: number | null;
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl';

  const variantStyles = {
    call: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white',
    edit: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white',
    document:
      'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white',
    view: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white',
  };

  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <button onClick={onClick} className={buttonStyles} title={title}>
      <div className="relative">
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
const Pagination: React.FC<PaginationProps> = ({
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
            <span className="font-medium mx-1 text-gray-900 dark:text-white">
              {showingStart}
            </span>
            to
            <span className="font-medium mx-1 text-gray-900 dark:text-white">
              {showingEnd}
            </span>
            of
            <span className="font-medium mx-1 text-gray-900 dark:text-white">
              {totalItems}
            </span>
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
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                data-slot="icon"
                aria-hidden="true"
                className="size-5"
              >
                <path
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                  fillRule="evenodd"
                />
              </svg>
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
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                data-slot="icon"
                aria-hidden="true"
                className="size-5"
              >
                <path
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                  fillRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// STAGE_PERCENTAGE_MAP for battery calculation
const STAGE_PERCENTAGE_MAP: Record<string, number> = {
  'Fresh Lead': 0,
  'Cold Lead': 10,
  'On Hold': 20,
  'Positive Lead': 30,
  'Pre Site Visit': 40,
  Demo: 50,
  'Quotation Pending': 60,
  'Quotation Follow-up': 70,
  'Post Site Visit': 80,
  'Projection List': 90,
  Drop: -1,
  'Closed Deal': 100,
};

// ProgressStatus Component
const ProgressStatus: React.FC<{
  stage: string;
  status_percentage?: number;
  is_drop_stage?: boolean;
  previous_stage?: string;
}> = ({
  stage,
  status_percentage = 0,
  is_drop_stage = false,
  previous_stage = '',
}) => {
  const cleanStage = stage ? stage.trim() : '';
  const percentage = status_percentage;

  const getProgressColor = (stage: string) => {
    const stageLower = stage.toLowerCase().trim();

    if (stageLower.includes('fresh'))
      return 'bg-[#FFFFFF] border border-gray-300';
    if (stageLower.includes('cold')) return 'bg-[#A9A9A9]';
    if (stageLower.includes('on hold')) return 'bg-[#FDFD96]';
    if (stageLower.includes('positive')) return 'bg-[#ADD8E6]';
    if (stageLower.includes('pre site')) return 'bg-[#E0B0FF]';
    if (stageLower.includes('past site') || stageLower.includes('post site'))
      return 'bg-[#593E67]';
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
          className={`h-full rounded-full ${getProgressColor(
            cleanStage,
          )} transition-all duration-300`}
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

const DropLeadsPage: React.FC = () => {
  // State declarations
  const [dropLeads, setDropLeads] = useState<DropLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<DropLead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<DropLead | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [area, setArea] = useState<Area[]>([]);

  // Document upload/view states
  const [docsClient, setDocsClient] = useState<DropLead | null>(null);
  const [docsData, setDocsData] = useState<DocumentData>({
    images: [],
    documents: [],
    videos: [],
  });
  const [showDocsPopup, setShowDocsPopup] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState<'image' | 'documents' | 'video'>(
    'documents',
  );
  const [locationLink, setLocationLink] = useState('');
  const [remark, setRemark] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [leadStage, setLeadStage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [leadStages, setLeadStages] = useState<string[]>([]);

  // Filter states
  const [showEntryDateCalendar, setShowEntryDateCalendar] = useState(false);
  const [showFollowupDateCalendar, setShowFollowupDateCalendar] =
    useState(false);
  const [showStageFilter, setShowStageFilter] = useState(false);
  const [showUserFilter, setShowUserFilter] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);

  const [selectedEntryFromDate, setSelectedEntryFromDate] = useState('');
  const [selectedEntryToDate, setSelectedEntryToDate] = useState('');
  const [selectedFollowupFromDate, setSelectedFollowupFromDate] = useState('');
  const [selectedFollowupToDate, setSelectedFollowupToDate] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedUsersFilter, setSelectedUsersFilter] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const [customRecordCount, setCustomRecordCount] = useState<number | ''>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchUserTerm, setSearchUserTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Detail modal state
  const [selectedLeadDetails, setSelectedLeadDetails] =
    useState<DropLead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Add refreshTrigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refs for click outside detection
  const entryDateRef = useRef<HTMLDivElement>(null);
  const followupDateRef = useRef<HTMLDivElement>(null);
  const stageFilterRef = useRef<HTMLDivElement>(null);
  const userFilterRef = useRef<HTMLDivElement>(null);
  const cityFilterRef = useRef<HTMLDivElement>(null);

  // Batch selection state
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [selectedMasterIds, setSelectedMasterIds] = useState<number[]>([]);
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [assignData, setAssignData] = useState({
    assignedTo: [] as string[],
    leadStage: '',
    remark: '',
    reassignmentDate: new Date().toISOString().split('T')[0],
  });

  const [openRemark, setOpenRemark] = useState<any>(null);
  const [detailedRemark, setDetailedRemark] = useState('');

  // Handle remark display
  const handleShowRemark = (text: string) => {
    if (!text) return;
    setOpenRemark(text);
  };

  // Handle assign form changes
  const handleAssignChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setAssignData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Parse value helper function
  const parseValue = (value: any) => {
    if (
      value === 'Not Available' ||
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'Not Found'
    ) {
      return '';
    }
    return value;
  };

  // Parse ID value helper function
  const parseIdValue = (value: any) => {
    if (
      value === 'Not Available' ||
      value === null ||
      value === undefined ||
      value === 'Not Found'
    ) {
      return '';
    }
    return isNaN(value) ? value : Number(value);
  };

  // Parse date value helper function
  const parseDateValue = (value: any) => {
    if (
      value === 'Not Available' ||
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'Not Found'
    ) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    if (typeof value === 'string') {
      const dateStr = value.split('T')[0];
      const date = new Date(dateStr);

      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }

    return '';
  };

  // Process reassignment remarks
  const processReassignmentRemarks = (remarks: any[]) => {
    if (!remarks || !Array.isArray(remarks)) return [];

    return remarks.map((remark: any) => ({
      remark: remark.remark || '',
      created_by_user: remark.created_by_user || 0,
      created_at: remark.created_at || '',
      name: remark.name || '',
      role: remark.role || '',
      assignedTo: remark.assignedTo || '',
      leadStage: remark.leadStage || '',
      reassignment_date: remark.reassignment_date || '',
    }));
  };

// Fetch drop leads with server-side pagination and filtering
const fetchDropLeads = async () => {
  try {
    setLoading(true);
    
    // Build filter parameters
    const filterParams: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add search term if exists
    if (searchTerm.trim()) {
      filterParams.search = searchTerm;
    }

    // Add date filters
    if (selectedEntryFromDate) filterParams.entryFromDate = selectedEntryFromDate;
    if (selectedEntryToDate) filterParams.entryToDate = selectedEntryToDate;
    if (selectedFollowupFromDate) filterParams.followupFromDate = selectedFollowupFromDate;
    if (selectedFollowupToDate) filterParams.followupToDate = selectedFollowupToDate;
    
    // Add array filters
    if (selectedStages.length > 0) filterParams.stages = selectedStages.join(',');
    if (selectedUsersFilter.length > 0) filterParams.users = selectedUsersFilter.join(',');
    if (selectedCities.length > 0) filterParams.cities = selectedCities.join(',');

    const response = await axios.get(
      `${BASE_URL}api/dashboard/drop-leads-fulldata`,
      {
        params: filterParams,
        withCredentials: true,
      }
    );

    const data = response.data;

    if (data.success) {
      const dropLeadsArray = data.dropLeads || [];
      
      const processedData = dropLeadsArray.map((item: any) => {
        // For drop leads, the current stage is always "Drop"
        const currentStage = 'Drop';
        const cleanStage = 'Drop';

        // Find previous stage from reassignment remarks
        let previousStage = '';
        const reassignmentRemarks = processReassignmentRemarks(
          item.reassignment_remarks,
        );

        // Find the most recent non-drop stage from reassignment remarks
        if (reassignmentRemarks.length > 0) {
          const nonDropRemarks = reassignmentRemarks.filter(
            (remark: any) =>
              remark.leadStage && remark.leadStage.trim() !== 'Drop',
          );

          if (nonDropRemarks.length > 0) {
            // Sort by date to get most recent
            const sorted = nonDropRemarks.sort((a: any, b: any) => {
              const dateA = a.reassignment_date
                ? new Date(a.reassignment_date).getTime()
                : 0;
              const dateB = b.reassignment_date
                ? new Date(b.reassignment_date).getTime()
                : 0;
              return dateB - dateA; // Most recent first
            });
            previousStage = sorted[0]?.leadStage?.trim() || '';
          }
        }

        // If no previous stage found, use default
        if (!previousStage) {
          previousStage = 'Positive Lead'; // Default for drop leads
        }

        // Calculate percentage based on previous stage
        const status_percentage = previousStage
          ? STAGE_PERCENTAGE_MAP[previousStage] || 0
          : 0;

        // Get assigned user info
        const assignedTo = parseValue(
          item.reassigned_to ||
            item.telecaller_name ||
            item.latest_assignedTo ||
            item.assigned_to,
        );

        const assignDate = parseDateValue(
          item.assign_date ||
            item.reassignment_date ||
            item.created_at,
        );

        const followupDate = parseValue(item.followup_date);

        // 🔥 IMPORTANT: Determine display city with priority: area_name first, then city
        let displayCity = '';
        const areaName = parseValue(item.area_name);
        const cityName = parseValue(item.city);
        
        if (areaName && areaName !== '' && areaName !== 'Not Available') {
          displayCity = areaName; // Use area_name if available
        } else if (cityName && cityName !== '' && cityName !== 'Not Available') {
          displayCity = cityName; // Fallback to city if area_name not available
        } else {
          displayCity = ''; // Empty if neither available
        }

        return {
          master_id: item.master_id,
          name: parseValue(item.name),
          number: parseValue(item.number),
          email: parseValue(item.email),
          address: parseValue(item.address),
          city: displayCity, // 🔥 THIS IS THE KEY CHANGE - Use the prioritized display city
          original_city: parseValue(item.city), // Keep original if needed elsewhere
          original_area: parseValue(item.area_name), // Keep original if needed elsewhere
          cat_id: parseIdValue(item.cat_id),
          status: parseValue(item.status),
          lead_status: parseValue(item.lead_status),
          lead_stage: cleanStage,
          created_at: parseValue(item.created_at),
          quick_remark: parseValue(item.quick_remark),
          detailed_remark: parseValue(item.detailed_remark),
          followup_date: followupDate,
          assign_date: assignDate,
          assigned_to: assignedTo,
          assigned_user_name: assignedTo,
          reassignment_id: parseIdValue(item.reassignment_id),
          reassignment_date: parseValue(item.reassignment_date),
          reassigned_to: parseValue(item.reassigned_to),
          telecaller_name: assignedTo,
          document_count: item.document_count || 0,
          area_name: parseValue(item.area_name),
          area: parseValue(item.area_name),
          cat_name: parseValue(item.cat_name),
          reference_name: parseValue(item.reference_name),
          room_length: parseValue(item.room_length),
          room_width: parseValue(item.room_width),
          room_height: parseValue(item.room_height),
          location_link: parseValue(item.location_link),
          p_type: parseValue(item.p_type),
          budget_range: parseValue(item.budget_range),
          current_stage: parseValue(item.current_stage),
          room_ready: parseValue(item.room_ready),
          time_to_complete: parseValue(item.time_to_complete),
          site_visit_date: parseValue(item.site_visit_date),
          demo_date: parseValue(item.demo_date),
          ar_number: parseValue(item.ar_number),
          ca_number: parseValue(item.ca_number),
          e_number: parseValue(item.e_number),
          sm_number: parseValue(item.sm_number),
          pop_number: parseValue(item.pop_number),
          other_number: parseValue(item.other_number),
          reassignment_remarks: reassignmentRemarks,
          latest_assignedTo: parseValue(item.latest_assignedTo),
          latest_leadStage: parseValue(item.latest_leadStage),

          // Battery-related fields
          status_percentage: status_percentage,
          is_drop_stage: true,
          previous_stage: previousStage,

          // Additional fields for EditRawData
          category_other: parseValue(item.category_other),
          reference_other: parseValue(item.reference_other),
          architect_name: parseValue(item.architect_name),
          alternate_number: parseValue(item.alternate_number),
          reference_id: parseIdValue(item.reference_id),
          area_id: parseIdValue(item.area_id),
          assign_id: parseIdValue(item.assign_id),
          document_location_link: parseValue(item.document_location_link),
        };
      });

      const sortedData = processedData.sort(
        (a: DropLead, b: DropLead) => b.master_id - a.master_id,
      );

      // Update total leads from backend response
      setTotalLeads(data.total || 0);
      
      // Set the data
      setDropLeads(sortedData);
      
      // 🔥 UPDATED: Extract unique cities from the prioritized displayCity field
      const cities = sortedData
        .map(lead => lead.city?.trim()) // This now uses the prioritized displayCity
        .filter(city => city && city !== '' && city !== 'Not Available' && city !== 'N/A')
        .filter((city, index, self) => self.indexOf(city) === index)
        .sort() as string[];
      setAvailableCities(cities);

      // Debug log to verify the changes
      console.log('📊 Drop Leads Processed:', {
        totalLeads: sortedData.length,
        sampleLead: sortedData[0],
        city: sortedData[0]?.city, // Should show area_name first
        original_city: sortedData[0]?.original_city,
        original_area: sortedData[0]?.original_area,
      });
      
    } else {
      console.error('Error fetching drop leads:', data);
      setDropLeads([]);
      setTotalLeads(0);
    }
  } catch (error) {
    console.error('Error fetching drop leads:', error);
    setDropLeads([]);
    setTotalLeads(0);
  } finally {
    setLoading(false);
  }
};


  // Apply filters function (server-side)
  const applyFilters = async () => {
    try {
      setLoading(true);
      
      // Build filter parameters for server-side
      const filterParams: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      // Add search term if exists
      if (searchTerm.trim()) {
        filterParams.search = searchTerm;
      }

      // Add date filters
      if (selectedEntryFromDate) filterParams.entryFromDate = selectedEntryFromDate;
      if (selectedEntryToDate) filterParams.entryToDate = selectedEntryToDate;
      if (selectedFollowupFromDate) filterParams.followupFromDate = selectedFollowupFromDate;
      if (selectedFollowupToDate) filterParams.followupToDate = selectedFollowupToDate;
      
      // Add array filters
      if (selectedStages.length > 0) filterParams.stages = selectedStages.join(',');
      if (selectedUsersFilter.length > 0) filterParams.users = selectedUsersFilter.join(',');
      if (selectedCities.length > 0) filterParams.cities = selectedCities.join(',');
      
      // Call API with filters
      const response = await axios.get(
        `${BASE_URL}api/dashboard/drop-leads-fulldata`,
        {
          params: filterParams,
          withCredentials: true,
        }
      );

      const data = response.data;

      if (data.success) {
        const dropLeadsArray = data.dropLeads || [];
        
        const processedData = dropLeadsArray.map((item: any) => {
          // For drop leads, the current stage is always "Drop"
          const currentStage = 'Drop';
          const cleanStage = 'Drop';

          // Find previous stage from reassignment remarks
          let previousStage = '';
          const reassignmentRemarks = processReassignmentRemarks(
            item.reassignment_remarks,
          );

          // Find the most recent non-drop stage from reassignment remarks
          if (reassignmentRemarks.length > 0) {
            const nonDropRemarks = reassignmentRemarks.filter(
              (remark: any) =>
                remark.leadStage && remark.leadStage.trim() !== 'Drop',
            );

            if (nonDropRemarks.length > 0) {
              // Sort by date to get most recent
              const sorted = nonDropRemarks.sort((a: any, b: any) => {
                const dateA = a.reassignment_date
                  ? new Date(a.reassignment_date).getTime()
                  : 0;
                const dateB = b.reassignment_date
                  ? new Date(b.reassignment_date).getTime()
                  : 0;
                return dateB - dateA;
              });
              previousStage = sorted[0]?.leadStage?.trim() || '';
            }
          }

          if (!previousStage) {
            previousStage = 'Positive Lead';
          }

          const status_percentage = previousStage
            ? STAGE_PERCENTAGE_MAP[previousStage] || 0
            : 0;

          const assignedTo = parseValue(
            item.reassigned_to ||
              item.telecaller_name ||
              item.latest_assignedTo ||
              item.assigned_to,
          );

          const assignDate = parseDateValue(
            item.assign_date ||
              item.reassignment_date ||
              item.created_at,
          );

          const followupDate = parseValue(item.followup_date);

          return {
            master_id: item.master_id,
            name: parseValue(item.name),
            number: parseValue(item.number),
            email: parseValue(item.email),
            address: parseValue(item.address),
            city: parseValue(item.city),
            cat_id: parseIdValue(item.cat_id),
            status: parseValue(item.status),
            lead_status: parseValue(item.lead_status),
            lead_stage: cleanStage,
            created_at: parseValue(item.created_at),
            quick_remark: parseValue(item.quick_remark),
            detailed_remark: parseValue(item.detailed_remark),
            followup_date: followupDate,
            assign_date: assignDate,
            assigned_to: assignedTo,
            assigned_user_name: assignedTo,
            reassignment_id: parseIdValue(item.reassignment_id),
            reassignment_date: parseValue(item.reassignment_date),
            reassigned_to: parseValue(item.reassigned_to),
            telecaller_name: assignedTo,
            document_count: item.document_count || 0,
            area_name: parseValue(item.area_name),
            area: parseValue(item.area_name),
            cat_name: parseValue(item.cat_name),
            reference_name: parseValue(item.reference_name),
            room_length: parseValue(item.room_length),
            room_width: parseValue(item.room_width),
            room_height: parseValue(item.room_height),
            location_link: parseValue(item.location_link),
            p_type: parseValue(item.p_type),
            budget_range: parseValue(item.budget_range),
            current_stage: parseValue(item.current_stage),
            room_ready: parseValue(item.room_ready),
            time_to_complete: parseValue(item.time_to_complete),
            site_visit_date: parseValue(item.site_visit_date),
            demo_date: parseValue(item.demo_date),
            ar_number: parseValue(item.ar_number),
            ca_number: parseValue(item.ca_number),
            e_number: parseValue(item.e_number),
            sm_number: parseValue(item.sm_number),
            pop_number: parseValue(item.pop_number),
            other_number: parseValue(item.other_number),
            reassignment_remarks: reassignmentRemarks,
            latest_assignedTo: parseValue(item.latest_assignedTo),
            latest_leadStage: parseValue(item.latest_leadStage),

            status_percentage: status_percentage,
            is_drop_stage: true,
            previous_stage: previousStage,

            category_other: parseValue(item.category_other),
            reference_other: parseValue(item.reference_other),
            architect_name: parseValue(item.architect_name),
            alternate_number: parseValue(item.alternate_number),
            reference_id: parseIdValue(item.reference_id),
            area_id: parseIdValue(item.area_id),
            assign_id: parseIdValue(item.assign_id),
            document_location_link: parseValue(item.document_location_link),
          };
        });

        const sortedData = processedData.sort(
          (a: DropLead, b: DropLead) => b.master_id - a.master_id,
        );

        // Set the data from server response
        setDropLeads(sortedData);
        setTotalLeads(data.total || 0);
        
        // Extract unique cities for filter dropdown
        const cities = sortedData
          .map(lead => lead.city?.trim())
          .filter(city => city && city !== '' && city !== 'Not Available' && city !== 'N/A')
          .filter((city, index, self) => self.indexOf(city) === index)
          .sort() as string[];
        setAvailableCities(cities);
        
      } else {
        console.error('Error fetching filtered drop leads:', data);
        setDropLeads([]);
        setTotalLeads(0);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      setDropLeads([]);
      setTotalLeads(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch other data
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/category`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchReferences = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/reference`);
      setReferences(response.data);
    } catch (error) {
      console.error('Error fetching references:', error);
      setReferences([]);
    }
  };

  const fetchArea = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/area`);
      setArea(response.data);
    } catch (error) {
      console.error('Error fetching area:', error);
      setArea([]);
    }
  };

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

  // Apply filters when filter criteria change
useEffect(() => {
  applyFilters();
}, [
  currentPage,
  searchTerm,
  selectedEntryFromDate,
  selectedEntryToDate,
  selectedFollowupFromDate,
  selectedFollowupToDate,
  selectedStages,
  selectedUsersFilter,
  selectedCities
]); 

// Handle itemsPerPage changes - refetch data when itemsPerPage changes
useEffect(() => {
  if (currentPage === 1) {
    // If we're on page 1, just refetch
    fetchDropLeads();
  } else {
    // If we're not on page 1, reset to page 1 which will trigger fetchDropLeads
    setCurrentPage(1);
  }
}, [itemsPerPage]); // Only run when itemsPerPage changes 


  // Filter user search
useEffect(() => {
  if (searchUserTerm.trim() === '') {
    setFilteredUsers(users);
  } else {
    const term = searchUserTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        (user.role && user.role.toLowerCase().includes(term)),
    );
    setFilteredUsers(filtered);
  }
}, [searchUserTerm, users]); 


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

  const clearFilters = async () => {
    // Clear all date filters
    setSelectedEntryFromDate('');
    setSelectedEntryToDate('');
    setSelectedFollowupFromDate('');
    setSelectedFollowupToDate('');

    // Clear all selection filters
    setSelectedStages([]);
    setSelectedUsersFilter([]);
    setSelectedCities([]);

    // Clear search term
    setSearchTerm('');

    // Clear custom record count
    setCustomRecordCount('');
    setItemsPerPage(10);

    // Close all dropdowns
    setShowEntryDateCalendar(false);
    setShowFollowupDateCalendar(false);
    setShowStageFilter(false);
    setShowUserFilter(false);
    setShowCityFilter(false);

    // Reset to page 1
    setCurrentPage(1);
    
    // Refetch data without filters
    await fetchDropLeads();
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
    setItemsPerPage(10);
    setCurrentPage(1);
    // Trigger refetch when clearing
    setRefreshTrigger(prev => prev + 1);
    return;
  }

  const numValue = parseInt(value);
  if (!isNaN(numValue) && numValue > 0) {
    setCustomRecordCount(numValue);
    setItemsPerPage(numValue);
    setCurrentPage(1); // Reset to page 1
    // Trigger immediate refetch
    setRefreshTrigger(prev => prev + 1);
  }
};


const clearCustomRecordCount = () => {
  setCustomRecordCount('');
  setItemsPerPage(10);
  setCurrentPage(1);
  // Trigger refetch
  setRefreshTrigger(prev => prev + 1);
};


  // Pagination handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= Math.ceil(totalLeads / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDropLeads();
    fetchCategories();
    fetchReferences();
    fetchArea();
    fetchUsers();
    fetchLeadStages();
  }, [refreshTrigger]);

  // Call functionality
  const handleEdit = (lead: DropLead) => {
    setSelectedClient({
      ...lead,
      master_id: lead.master_id,
      cat_id: lead.cat_id,
      telecaller_name: lead.assigned_user_name,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = (refresh = false) => {
    setIsModalOpen(false);
    setSelectedClient(null);
    if (refresh) {
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  // Edit functionality
  const handleEditClick = (lead: DropLead) => {
    setEditingClient(lead);
    setShowEditPopup(true);
  };

  const closeEditPopup = () => {
    setEditingClient(null);
    setShowEditPopup(false);
  };

  const fetchDataAgain = async () => {
    await fetchDropLeads();
  };

  // Document functionality
  const handleFileIconClick = async (lead: DropLead) => {
    setDocsClient(lead);

    // Reset form fields
    setFollowupDate('');
    setSelectedUsers([]);
    setLeadStage('');
    setLocationLink('');
    setRemark('');
    setDetailedRemark('');

    try {
      const response = await axios.get(
        `${BASE_URL}api/documents/${lead.master_id}`,
        { withCredentials: true },
      );

      const images: DocItem[] = [];
      const documents: DocItem[] = [];
      const videos: DocItem[] = [];

      response.data.documents.forEach((doc: any) => {
        let filePath = doc.document_path;
        filePath = filePath.replace(/^server\//, '').replace(/\\/g, '/');
        if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;

        const fullUrl = `${BASE_URL}${filePath}`;

        const docObj: DocItem = {
          doc_id: doc.doc_id,
          url: fullUrl,
          link: doc.location_link,
          remark: doc.remark,
          document_type: doc.document_type,
        };

        if (doc.document_type === 'image') {
          images.push(docObj);
        } else if (doc.document_type === 'video') {
          videos.push(docObj);
        } else {
          documents.push(docObj);
        }
      });

      setDocsData({ images, documents, videos });
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocsData({ images: [], documents: [], videos: [] });
    }

    setShowDocsPopup(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files);
    setUploadFiles(selectedFiles);
  };

  const handleUploadSubmit = async () => {
    if (!docsClient || uploadFiles.length === 0) {
      alert('Please select files to upload.');
      return;
    }

    const formData = new FormData();
    
    // Add files
    uploadFiles.forEach((file) => {
      formData.append('files', file);
    });
    
    // Add additional fields
    if (locationLink) formData.append("location_link", locationLink);
    if (remark) formData.append("remark", remark);
    if (followupDate) formData.append("followup_date", followupDate);
    if (leadStage) formData.append("leadStage", leadStage);
    
    // Add detailed remark field
    if (detailedRemark) {
      formData.append('detailed_remark', detailedRemark);
    }

    // Enhanced assignedTo handling
    if (selectedUsers && selectedUsers.length > 0) {
      const assignedToString = selectedUsers.join(',');
      formData.append('assignedTo', assignedToString);
      
      selectedUsers.forEach((userId) => {
        formData.append('assignedTo[]', userId);
      });
    } else {
      formData.append('assignedTo', '');
    }

    try {
      const response = await axios.post(
        `${BASE_URL}api/upload/${docsClient.master_id}`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,    
        }
      );

      let successMsg = '✅ Files uploaded successfully!\n\n';
      
      if (response.data.summary) {
        const { summary } = response.data;
        successMsg += `📁 Files Uploaded: ${summary.files_uploaded}\n`;
        successMsg += `👥 Reassignments Added: ${summary.reassignments_added}\n`;
        if (summary.duplicates_skipped > 0) {
          successMsg += `⚠️ Duplicates Skipped: ${summary.duplicates_skipped}\n`;
        }
      }

      if (response.data.updated_fields) {
        const fields = response.data.updated_fields;
        successMsg += '\n📊 Updates:\n';
        if (fields.raw_data_followup_date || fields.followup_date) successMsg += '• Follow-up date updated\n';
        if (fields.raw_data_lead_stage || fields.lead_stage) successMsg += '• Lead stage updated\n';
        if (fields.raw_data_detailed_remark || fields.detailed_remark) successMsg += '• Detailed remark updated\n';
        if (fields.reassignments_created > 0 || fields.reassignment_count > 0) {
          const count = fields.reassignments_created || fields.reassignment_count;
          successMsg += `• ${count} reassignment(s) created\n`;
        } else {
          successMsg += '• No reassignments created\n';
        }
      }

      alert(successMsg);

      // Wait a moment for the server to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh the document list
      await refreshDocumentList();
      
      // Clear the form
      setUploadFiles([]);
      setLocationLink("");
      setRemark("");
      setDetailedRemark("");
      setFollowupDate("");
      setSelectedUsers([]);
      setLeadStage("");

      // Refresh the main table data
      setRefreshTrigger(prev => prev + 1);

    } catch (error: any) {
      console.error("❌ Upload error:", error);
      
      if (error.response?.data?.message) {
        alert(`❌ Upload failed: ${error.response.data.message}`);
        if (error.response.data.error) {
          console.error('Server error details:', error.response.data.error);
        }
      } else {
        alert("❌ Error uploading files. Please check console for details.");
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return <FontAwesomeIcon icon={faFilePdf} className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FontAwesomeIcon icon={faFileWord} className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return (
          <FontAwesomeIcon icon={faFileExcel} className="text-green-500" />
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <FontAwesomeIcon icon={faFileImage} className="text-purple-500" />
        );
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return <FontAwesomeIcon icon={faVideo} className="text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faFile} className="text-gray-500" />;
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!docId || isNaN(docId)) {
      alert('❌ Invalid document ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${BASE_URL}api/document/${docId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        alert('✅ Document deleted successfully!');
        
        // Refresh the document list
        if (docsClient) {
          await refreshDocumentList();
        }
      } else {
        alert('❌ Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('❌ Error deleting document. Please try again.');
    }
  };

  const refreshDocumentList = async () => {
    if (!docsClient) return;

    try {
      const refreshResponse = await axios.get(
        `${BASE_URL}api/documents/${docsClient.master_id}`,
        { withCredentials: true }
      );

      const processFilePath = (filePath: string) => {
        filePath = filePath.replace(/^server\//, '').replace(/\\/g, '/');
        if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;
        return `${BASE_URL}${filePath}`;
      };

      const images: DocItem[] = [];
      const documents: DocItem[] = [];
      const videos: DocItem[] = [];

      refreshResponse.data.documents.forEach((doc: any) => {
        const docObj: DocItem = {
          doc_id: doc.doc_id,
          url: processFilePath(doc.document_path),
          link: doc.location_link,
          remark: doc.remark,
          document_type: doc.document_type
        };

        if (doc.document_type === "image") images.push(docObj);
        else if (doc.document_type === "video") videos.push(docObj);
        else documents.push(docObj);
      });

      setDocsData({ images, documents, videos });
    } catch (error) {
      console.error('Error refreshing document list:', error);
    }
  };

  // Detail modal render function
  const renderDetailsModal = () => {
    if (!selectedLeadDetails) return null;

    const isEmpty = (value: any) => {
      return (
        !value ||
        value === '' ||
        value === 'Not Available' ||
        value === 'N/A' ||
        value === 'null' ||
        value === null ||
        value === undefined ||
        value === 'Not Found'
      );
    };

    const formatValue = (value: any) => {
      if (isEmpty(value)) return 'N/A';
      return value;
    };

    const hasField = (fieldName: keyof DropLead) => {
      return (
        selectedLeadDetails[fieldName] &&
        !isEmpty(selectedLeadDetails[fieldName])
      );
    };

    // Check for various contact numbers
    const hasContactNumbers =
      hasField('ar_number') ||
      hasField('ca_number') ||
      hasField('e_number') ||
      hasField('sm_number') ||
      hasField('pop_number') ||
      hasField('other_number') ||
      hasField('architect_name') ||
      hasField('alternate_number');

    // Check for lead info
    const hasLeadInfo =
      hasField('cat_name') ||
      hasField('category_other') ||
      hasField('reference_name') ||
      hasField('reference_other') ||
      hasField('area_name');

    // Check for project details
    const hasProjectDetails =
      hasField('room_length') ||
      hasField('room_width') ||
      hasField('room_height') ||
      hasField('p_type') ||
      hasField('budget_range') ||
      hasField('time_to_complete') ||
      hasField('room_ready');

    // Check for lead stages
    const hasLeadStages =
      hasField('lead_stage') ||
      hasField('current_stage') ||
      hasField('lead_status') ||
      hasField('status') ||
      hasField('status_percentage') ||
      hasField('latest_leadStage');

    // Check for dates
    const hasDates =
      hasField('assign_date') ||
      hasField('followup_date') ||
      hasField('site_visit_date') ||
      hasField('demo_date');

    // Check for assignment info
    const hasAssignmentInfo =
      hasField('assigned_to') ||
      hasField('telecaller_name') ||
      hasField('latest_assignedTo') ||
      hasField('reassigned_to') ||
      hasField('assigned_user_name');

    // Check for links
    const hasLinks =
      hasField('document_location_link') || hasField('location_link');

    // Check for remarks
    const hasRemarks = hasField('quick_remark') || hasField('detailed_remark');

    return (
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800">
          {/* Compact Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {selectedLeadDetails.name?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black dark:text-white truncate max-w-xs">
                      {formatValue(selectedLeadDetails.name)}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1 flex-wrap">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Created: {formatValue(selectedLeadDetails.assign_date)}
                      </span>
                      {hasField('latest_assignedTo') && (
                        <>
                          <span>•</span>
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                            Latest:{' '}
                            {formatValue(
                              selectedLeadDetails.latest_assignedTo ||
                                selectedLeadDetails.assigned_user_name,
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLeadDetails(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Compact Content - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
            <div className="p-4 space-y-4">
              {/* Contact Info */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="h-4 w-4 text-blue-500"
                  />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {hasField('name') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Name
                      </div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(selectedLeadDetails.name)}
                      </div>
                    </div>
                  )}
                  {hasField('number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Phone
                      </div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(selectedLeadDetails.number)}
                      </div>
                    </div>
                  )}
                  {hasField('email') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Email
                      </div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(selectedLeadDetails.email)}
                      </div>
                    </div>
                  )}
                  {hasField('alternate_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Alternate Phone
                      </div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(selectedLeadDetails.alternate_number)}
                      </div>
                    </div>
                  )}
                  {hasField('address') && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Address
                      </div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(selectedLeadDetails.address)}
                      </div>
                    </div>
                  )}
                  {hasField('city') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        City
                      </div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(selectedLeadDetails.city)}
                      </div>
                    </div>
                  )}
                  {hasField('area_name') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Area
                      </div>
                      <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {formatValue(
                          selectedLeadDetails.area_name ||
                            selectedLeadDetails.area,
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Contact Numbers */}
              {hasContactNumbers && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="h-4 w-4 text-indigo-500"
                    />
                    Additional Contacts
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    {hasField('architect_name') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Architect
                        </div>
                        <div className="font-medium text-black dark:text-white truncate">
                          {formatValue(selectedLeadDetails.architect_name)}
                        </div>
                      </div>
                    )}
                    {hasField('ar_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Architect Number
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.ar_number)}
                        </div>
                      </div>
                    )}
                    {hasField('ca_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          CA Number
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.ca_number)}
                        </div>
                      </div>
                    )}
                    {hasField('e_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Electrician
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.e_number)}
                        </div>
                      </div>
                    )}
                    {hasField('sm_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Site Manager
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.sm_number)}
                        </div>
                      </div>
                    )}
                    {hasField('pop_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          POP Number
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.pop_number)}
                        </div>
                      </div>
                    )}
                    {hasField('other_number') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Other Number
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.other_number)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lead & Category Information */}
              {hasLeadInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="h-4 w-4 text-blue-500"
                    />
                    Lead Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hasField('cat_name') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Category
                        </div>
                        <div className="font-medium text-black dark:text-white truncate">
                          {formatValue(selectedLeadDetails.cat_name)}
                          {hasField('category_other') && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                              ({formatValue(selectedLeadDetails.category_other)}
                              )
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {hasField('reference_name') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Reference
                        </div>
                        <div className="font-medium text-black dark:text-white truncate">
                          {formatValue(selectedLeadDetails.reference_name)}
                          {hasField('reference_other') && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                              (
                              {formatValue(selectedLeadDetails.reference_other)}
                              )
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {hasField('area_name') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Area
                        </div>
                        <div className="font-medium text-black dark:text-white truncate">
                          {formatValue(selectedLeadDetails.area_name)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

          

              {/* Dates Information */}
              {hasDates && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="h-4 w-4 text-emerald-500"
                    />
                    Dates
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {hasField('assign_date') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Entry Date
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.assign_date)}
                        </div>
                      </div>
                    )}
                    {hasField('followup_date') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Follow-up Date
                        </div>
                        <div
                          className={`font-medium ${
                            selectedLeadDetails.followup_date &&
                            new Date(selectedLeadDetails.followup_date) <
                              new Date()
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {formatValue(selectedLeadDetails.followup_date)}
                        </div>
                      </div>
                    )}
                    {hasField('site_visit_date') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Site Visit
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.site_visit_date)}
                        </div>
                      </div>
                    )}
                    {hasField('demo_date') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Demo Date
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.demo_date)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Details */}
              {hasProjectDetails && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faFile}
                      className="h-4 w-4 text-amber-500"
                    />
                    Project Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {(hasField('room_length') || hasField('room_width')) && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Room Size
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.room_length)} ×{' '}
                          {formatValue(selectedLeadDetails.room_width)}
                          {hasField('room_height') &&
                            ` × ${formatValue(
                              selectedLeadDetails.room_height,
                            )}`}
                        </div>
                      </div>
                    )}
                    {hasField('p_type') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Type
                        </div>
                        <div className="font-medium text-black dark:text-white truncate">
                          {formatValue(selectedLeadDetails.p_type)}
                        </div>
                      </div>
                    )}
                    {hasField('budget_range') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Budget Range
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.budget_range)}
                        </div>
                      </div>
                    )}
                    {hasField('time_to_complete') &&
                      selectedLeadDetails.time_to_complete !==
                        'Not Available' && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Time to Complete
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedLeadDetails.time_to_complete)}
                          </div>
                        </div>
                      )}
                    {hasField('room_ready') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Room Ready
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(selectedLeadDetails.room_ready)}
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
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="h-4 w-4 text-blue-500"
                    />
                    Links
                  </h3>
                  <div className="space-y-2">
                    {hasField('document_location_link') && (
                      <a
                        href={selectedLeadDetails.document_location_link}
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
                        href={selectedLeadDetails.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors border border-green-200 dark:border-green-700"
                      >
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="h-3 w-3"
                        />
                        Location Link
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {hasRemarks && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="h-4 w-4 text-gray-500"
                    />
                    Remarks
                  </h3>
                  <div className="text-sm">
                    {hasField('quick_remark') && (
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Quick Remark
                        </div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              selectedLeadDetails.quick_remark === 'Interested'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : selectedLeadDetails.quick_remark ===
                                  'Not Interested'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : selectedLeadDetails.quick_remark ===
                                  'Not Reachable'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}
                          >
                            {formatValue(selectedLeadDetails.quick_remark)}
                          </span>
                        </div>
                      </div>
                    )}
                    {hasField('detailed_remark') && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Detailed Remark
                        </div>
                        <div className="text-black dark:text-white bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-line">
                          {formatValue(selectedLeadDetails.detailed_remark)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reassignment History */}
              {selectedLeadDetails.reassignment_remarks &&
                Array.isArray(selectedLeadDetails.reassignment_remarks) &&
                selectedLeadDetails.reassignment_remarks.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-3 dark:text-white flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="h-4 w-4 text-yellow-500"
                      />
                      Reassignments (
                      {selectedLeadDetails.reassignment_remarks.length})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(() => {
                        const remarks =
                          selectedLeadDetails.reassignment_remarks;
                        if (
                          remarks.length > 0 &&
                          typeof remarks[0] === 'object' &&
                          'remark' in remarks[0]
                        ) {
                          return (remarks as any[])
                            .slice(0, 4)
                            .map((remarkObj, index) => (
                              <div
                                key={index}
                                className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-sm mb-1">
                                      <span className="text-blue-600">
                                        {remarkObj.name || 'Unknown'}
                                      </span>
                                      <span className="mx-2 text-gray-400">
                                        →
                                      </span>
                                      <span className="text-green-600">
                                        {remarkObj.assignedTo || 'Unknown'}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      {remarkObj.created_at} •{' '}
                                      {remarkObj.leadStage || 'Cold Lead'}
                                    </div>
                                  </div>
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    #{index + 1}
                                  </span>
                                </div>

                                {remarkObj.remark && (
                                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 pt-2 border-t">
                                    {remarkObj.remark}
                                  </div>
                                )}
                              </div>
                            ));
                        } else if (
                          remarks.length > 0 &&
                          typeof remarks[0] === 'string'
                        ) {
                          return (remarks as string[])
                            .slice(0, 4)
                            .map((remark, index) => (
                              <div
                                key={index}
                                className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-sm mb-1">
                                      <span className="text-gray-700 dark:text-gray-300">
                                        Remark #{index + 1}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    #{index + 1}
                                  </span>
                                </div>

                                <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                  {remark}
                                </div>
                              </div>
                            ));
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Combined Documents/Upload Modal
  const renderDocsModal = () => {
    if (!showDocsPopup || !docsClient) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex justify-center items-start z-[9999] overflow-y-auto p-4 sm:p-10">
        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-6 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                📁 Files for {docsClient.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage documents, links, and remarks in one place
              </p>
            </div>
            <button
              onClick={() => {
                setShowDocsPopup(false);
                setUploadFiles([]);
                setLocationLink('');
                setRemark('');
                setDetailedRemark('');
                setFollowupDate('');
                setSelectedUsers([]);
                setLeadStage('');
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload Section */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-0">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faFileUpload}
                    className="text-blue-500"
                  />
                  Upload New
                </h3>

                <div className="space-y-4">
                  {/* File Type */}
                  <div>
                    <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Type
                    </label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as any)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="documents">📄 Document</option>
                      <option value="image">🖼️ Image</option>
                      <option value="video">🎥 Video</option>
                    </select>
                  </div>

                  {/* Follow-up Date Field */}
                  <div>
                    <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={followupDate}
                      onChange={(e) => setFollowupDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Reassign To (Multiple) Users */}
                  <div>
                    <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Reassign To (Multiple Users)
                    </label>

                    {/* Search Box */}
                    <div className="mb-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={searchUserTerm}
                          onChange={(e) => setSearchUserTerm(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Search users by name or role..."
                        />
                        {searchUserTerm && (
                          <button
                            type="button"
                            onClick={() => setSearchUserTerm('')}
                            className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      {searchUserTerm && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Showing {filteredUsers.length} of {users.length} users
                        </p>
                      )}
                    </div>

                    {/* Checkbox Selection Area */}
                    <div className="border border-gray-300 dark:border-gray-600 rounded p-3 max-h-40 overflow-y-auto">
                      {/* Select All Filtered Button */}
                      <div className="mb-2 pb-2 border-b dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => {
                            const allFilteredSelected = filteredUsers.every(
                              (user) =>
                                selectedUsers.includes(
                                  user.user_id || user.id,
                                ),
                            );

                            if (allFilteredSelected) {
                              setSelectedUsers((prev) =>
                                prev.filter(
                                  (userId) =>
                                    !filteredUsers.some(
                                      (user) =>
                                        user.user_id === userId ||
                                        user.id === userId,
                                    ),
                                ),
                              );
                            } else {
                              const filteredUserIds = filteredUsers.map(
                                (user) => user.user_id || user.id,
                              );
                              setSelectedUsers((prev) => [
                                ...new Set([...prev, ...filteredUserIds]),
                              ]);
                            }
                          }}
                          className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          {filteredUsers.length > 0 &&
                          filteredUsers.every((user) =>
                            selectedUsers.includes(user.user_id || user.id),
                          )
                            ? 'Deselect All Filtered'
                            : 'Select All Filtered'}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {selectedUsers.length} selected
                        </span>
                      </div>

                      {/* Users List */}
                      {filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {filteredUsers.map((user) => {
                            const isSelected = selectedUsers.includes(
                              user.user_id || user.id,
                            );
                            return (
                              <div
                                key={user.user_id || user.id}
                                className={`flex items-start p-2 rounded transition-colors ${
                                  isSelected
                                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                                    : 'border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  id={`user-${user.user_id || user.id}`}
                                  checked={isSelected}
                                  onChange={() => {
                                    const userId = user.user_id || user.id;
                                    if (selectedUsers.includes(userId)) {
                                      setSelectedUsers((prev) =>
                                        prev.filter((id) => id !== userId),
                                      );
                                    } else {
                                      setSelectedUsers((prev) => [
                                        ...prev,
                                        userId,
                                      ]);
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 mt-1"
                                />
                                <label
                                  htmlFor={`user-${user.user_id || user.id}`}
                                  className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                                >
                                  <div className="font-medium line-clamp-1">
                                    {user.name}
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <div className="text-2xl mb-2">🔍</div>
                          <p className="text-sm">No users found</p>
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Selected Users Preview */}
                    {selectedUsers.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
                        <div className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-medium">
                          Selected Users ({selectedUsers.length}):
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {selectedUsers
                            .map((userId) => {
                              const user = users.find(
                                (u) => u.user_id === userId || u.id === userId,
                              );
                              return user
                                ? `${user.name}${
                                    user.role ? ` (${user.role})` : ''
                                  }`
                                : userId;
                            })
                            .join(', ')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lead Stage */}
                  <div>
                    <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Lead Stage
                    </label>
                    <select
                      value={leadStage}
                      onChange={(e) => setLeadStage(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Lead Stage</option>
                      {leadStages.map((stage, index) => (
                        <option key={index} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Link */}
                  <div>
                    <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Location Link
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={locationLink}
                      onChange={(e) => setLocationLink(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Detailed Remark Field */}
                  <div>
                    <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Detailed Remark
                    </label>
                    <textarea
                      placeholder="Enter detailed remark for this update..."
                      value={detailedRemark}
                      onChange={(e) => setDetailedRemark(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                    />
                  </div>

                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors bg-white dark:bg-gray-800/50">
                    <input
                      type="file"
                      multiple
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer block"
                    >
                      <FontAwesomeIcon
                        icon={faFileUpload}
                        className="text-2xl text-gray-400 mb-1"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        Click to browse files
                      </p>
                    </label>
                  </div>

                  {/* Selected Files Preview */}
                  {uploadFiles.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
                        Selected ({uploadFiles.length})
                      </p>
                      <div className="max-h-20 overflow-y-auto space-y-1">
                        {uploadFiles.map((f, i) => (
                          <div
                            key={i}
                            className="text-[11px] truncate dark:text-gray-300 flex justify-between"
                          >
                            <span>{f.name}</span>
                            <button
                              onClick={() =>
                                setUploadFiles((prev) =>
                                  prev.filter((_, idx) => idx !== i),
                                )
                              }
                              className="text-red-500 ml-1 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleUploadSubmit}
                    disabled={uploadFiles.length === 0}
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-md ${
                      uploadFiles.length > 0
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white active:scale-95'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    UPLOAD & UPDATE
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Gallery View */}
            <div className="lg:col-span-2 space-y-8">
              {/* Images Section */}
              {docsData.images.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faImages}
                      className="text-purple-500"
                    />{' '}
                    Images
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {docsData.images.map((doc, index) => (
                      <div
                        key={index}
                        className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl transition-all"
                      >
                        <div className="aspect-video bg-gray-100 dark:bg-black/20 relative">
                          <img
                            src={doc.url}
                            alt="img"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform"
                              title="View"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </a>
                            <a
                              href={doc.url}
                              download
                              className="p-2 bg-white rounded-full text-green-600 hover:scale-110 transition-transform"
                              title="Download"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(doc.doc_id)}
                              className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
                              title="Delete"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium truncate dark:text-gray-200 mb-2">
                            {doc.url.split('/').pop()}
                          </p>
                          <div className="space-y-2">
                            {doc.link && (
                              <a
                                href={doc.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[11px] text-blue-500 hover:underline truncate bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded"
                              >
                                🔗 {doc.link}
                              </a>
                            )}
                            {doc.remark && (
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded">
                                💬 {doc.remark}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Documents Section */}
              {docsData.documents.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFile} className="text-blue-500" />{' '}
                    Documents
                  </h3>
                  <div className="space-y-3">
                    {docsData.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-2xl mt-1">
                              {getFileIcon(doc.url)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm dark:text-white truncate">
                                {doc.url.split('/').pop()}
                              </p>
                              {doc.remark && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Remark:{' '}
                                  <span className="italic">{doc.remark}</span>
                                </p>
                              )}
                              {doc.link && (
                                <a
                                  href={doc.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                                >
                                  <FontAwesomeIcon
                                    icon={faEye}
                                    className="mr-1"
                                  />{' '}
                                  View Location Link
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-blue-500"
                              title="View"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </a>
                            <a
                              href={doc.url}
                              download
                              className="p-2 text-gray-400 hover:text-green-500"
                              title="Download"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(doc.doc_id)}
                              className="p-2 text-gray-400 hover:text-red-500"
                              title="Delete"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Videos Section */}
              {docsData.videos.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faVideo} className="text-red-500" />{' '}
                    Videos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {docsData.videos.map((doc, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                      >
                        <video controls className="w-full h-40 bg-black">
                          <source src={doc.url} type="video/mp4" />
                        </video>
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-bold truncate dark:text-gray-200">
                              {doc.url.split('/').pop()}
                            </p>
                            <div className="flex gap-2">
                              <a
                                href={doc.url}
                                download
                                className="p-1 text-gray-400 hover:text-green-500"
                                title="Download"
                              >
                                <FontAwesomeIcon
                                  icon={faDownload}
                                  className="text-xs"
                                />
                              </a>
                              <button
                                onClick={() => handleDeleteDocument(doc.doc_id)}
                                className="p-1 text-gray-400 hover:text-red-500"
                                title="Delete"
                              >
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  className="text-xs"
                                />
                              </button>
                            </div>
                          </div>
                          {doc.link && (
                            <a
                              href={doc.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-[11px] text-blue-500 hover:underline mb-2 truncate"
                            >
                              🔗 Map/Source Link
                            </a>
                          )}
                          {doc.remark && (
                            <p className="text-[11px] text-gray-500 italic border-t border-gray-100 dark:border-gray-700 pt-2 mt-1">
                              {doc.remark}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {docsData.images.length === 0 &&
                docsData.documents.length === 0 &&
                docsData.videos.length === 0 && (
                  <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <FontAwesomeIcon
                      icon={faFile}
                      className="text-5xl text-gray-300 mb-4"
                    />
                    <p className="text-gray-500 font-medium">
                      No files uploaded yet.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Upload files using the form on the left
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">

      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {totalLeads} Leads
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Custom Record Count Input */}
<div className="w-full sm:w-48">
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg
        className="h-4 w-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <input
      type="number"
      className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      placeholder="Records per page"
      value={customRecordCount}
      onChange={handleCustomRecordInput}
      min="1"
      max="1000"
    />
    {customRecordCount && (
      <button
        onClick={clearCustomRecordCount}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        title="Clear limit"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    )}
  </div>

</div>

              {/* Search Input */}
              <div className="w-full sm:w-72">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Search name, category, status..."
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
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Filter
              </button>

              {/* Reassign Button */}
              <button
                onClick={() => {
                  if (selectedMasterIds.length === 0) {
                    alert(
                      'Please select at least one record to assign/reassign',
                    );
                    return;
                  }
                  setShowAssignPopup(true);
                }}
                disabled={selectedMasterIds.length === 0}
                className={`bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg ${
                  selectedMasterIds.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-green-700 hover:to-green-800'
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-6a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"
                  />
                </svg>
                {selectedMasterIds.length > 1
                  ? `Reassign (${selectedMasterIds.length})`
                  : 'ReAssign'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedEntryFromDate ||
        selectedEntryToDate ||
        selectedFollowupFromDate ||
        selectedFollowupToDate ||
        selectedStages.length > 0 ||
        selectedUsersFilter.length > 0 ||
        selectedCities.length > 0) && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active filters:
          </span>
          <div className="flex flex-wrap gap-2">
            {(selectedEntryFromDate || selectedEntryToDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Entry: {selectedEntryFromDate || 'Any'} to{' '}
                {selectedEntryToDate || 'Any'}
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
                Followup: {selectedFollowupFromDate || 'Any'} to{' '}
                {selectedFollowupToDate || 'Any'}
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
            {selectedStages.map((stage) => (
              <span
                key={stage}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              >
                Stage: {stage}
                <button
                  onClick={() => handleStageSelect(stage)}
                  className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedUsersFilter.map((user) => (
              <span
                key={user}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
              >
                User: {user}
                <button
                  onClick={() => handleUserSelect(user)}
                  className="ml-1 text-orange-600 hover:text-orange-800 dark:text-orange-400"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedCities.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
              >
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <>
<div className="max-w-full overflow-auto rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
  <div className="overflow-x-auto">
    <table className="w-full table-auto" key={`table-${itemsPerPage}-${currentPage}`}>
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-meta-4 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                    {/* Checkbox Column */}
                    <th className="py-5 px-4">
                      <input
                        type="checkbox"
                        checked={(() => {
                          return (
                            dropLeads.length > 0 &&
                            dropLeads.every((lead) =>
                              selectedLeads.includes(lead.master_id),
                            )
                          );
                        })()}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const currentIds = dropLeads.map(
                            (lead) => lead.master_id,
                          );

                          if (isChecked) {
                            setSelectedLeads((prev) => {
                              const combined = [...prev, ...currentIds];
                              return combined.filter(
                                (id, index) => combined.indexOf(id) === index,
                              );
                            });
                            setSelectedMasterIds((prev) => {
                              const combined = [...prev, ...currentIds];
                              return combined.filter(
                                (id, index) => combined.indexOf(id) === index,
                              );
                            });
                          } else {
                            setSelectedLeads((prev) =>
                              prev.filter((id) => !currentIds.includes(id)),
                            );
                            setSelectedMasterIds((prev) =>
                              prev.filter((id) => !currentIds.includes(id)),
                            );
                          }
                        }}
                        className="h-4.5 w-4.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-boxdark"
                      />
                    </th>

                    {/* Entry Date Column with Filter */}
                    <th className="py-5 px-4 relative">
                      <div
                        ref={entryDateRef}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Entry Date
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            closeAllDropdowns();
                            setShowEntryDateCalendar(!showEntryDateCalendar);
                          }}
                          className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`h-3 w-3 transition-transform duration-200 ${
                              showEntryDateCalendar ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Entry Date Calendar Dropdown */}
                      {showEntryDateCalendar && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-sm dark:text-white">
                              Select Entry Date Range
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEntryFromDate('');
                                setSelectedEntryToDate('');
                                applyFilters();
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
                                applyFilters();
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

                    {/* FollowUp Date Column with Filter */}
                    <th className="py-5 px-4 relative">
                      <div
                        ref={followupDateRef}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          FollowUp Date
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeAllDropdowns();
                            setShowFollowupDateCalendar(
                              !showFollowupDateCalendar,
                            );
                          }}
                          className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`h-3 w-3 transition-transform duration-200 ${
                              showFollowupDateCalendar ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* FollowUp Date Calendar Dropdown */}
                      {showFollowupDateCalendar && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-sm dark:text-white">
                              Select Followup Date Range
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFollowupFromDate('');
                                setSelectedFollowupToDate('');
                                applyFilters();
                                setShowFollowupDateCalendar(false);
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
                                value={selectedFollowupFromDate}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setSelectedFollowupFromDate(e.target.value);
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
                                value={selectedFollowupToDate}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setSelectedFollowupToDate(e.target.value);
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
                                applyFilters();
                                setShowFollowupDateCalendar(false);
                              }}
                              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              Apply Filter
                            </button>
                          </div>
                        </div>
                      )}
                    </th>

                    <th className="py-5 px-4">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Client Name
                      </div>
                    </th>

                    <th className="py-5 px-4">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Contact
                      </div>
                    </th>

                    {/* City Column with Filter */}
                    <th className="py-5 px-4 relative">
                      <div
                        ref={cityFilterRef}
                        className="flex items-center justify-between gap-2"
                      >
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
                            className={`h-3 w-3 transition-colors duration-200 ${
                              selectedCities.length > 0 ? 'text-blue-600' : ''
                            } ${showCityFilter ? 'text-blue-600' : ''}`}
                          />
                        </button>
                      </div>

                      {/* City Filter Dropdown */}
                      {showCityFilter && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-sm dark:text-white">
                              Filter Cities
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCities([]);
                                  applyFilters();
                                  setShowCityFilter(false);
                                }}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                              >
                                Clear
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
                                <div
                                  key={city}
                                  className="flex items-center mb-2"
                                >
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
                                {selectedCities.map((city) => (
                                  <span
                                    key={city}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700/30 shadow-sm"
                                  >
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

                    <th className="py-5 px-2">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Status
                      </div>
                    </th>

                    {/* User Assign Column with Filter */}
                    <th className="py-5 px-4 relative">
                      <div
                        ref={userFilterRef}
                        className="flex items-center justify-between gap-2"
                      >
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
                            className={`h-3 w-3 transition-colors duration-200 ${
                              selectedUsersFilter.length > 0
                                ? 'text-blue-600'
                                : ''
                            } ${showUserFilter ? 'text-blue-600' : ''}`}
                          />
                        </button>
                      </div>

                      {/* Assigned User Filter Dropdown */}
                      {showUserFilter && (
                        <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[220px] max-h-[300px] overflow-y-auto">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-sm dark:text-white">
                              Filter Users
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUsersFilter([]);
                                  applyFilters();
                                  setShowUserFilter(false);
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
                                <div
                                  key={user.id}
                                  className="flex items-center mb-2"
                                >
                                  <input
                                    type="checkbox"
                                    id={`user-${user.id}`}
                                    checked={selectedUsersFilter.includes(
                                      user.name,
                                    )}
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
                                {selectedUsersFilter.map((user) => (
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

                    {/* Stage Column with Filter */}
                    <th className="py-5 px-4 relative">
                      <div
                        ref={stageFilterRef}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Stage
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeAllDropdowns();
                            setShowStageFilter(!showStageFilter);
                          }}
                          className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faFilter}
                            className={`h-3 w-3 transition-colors duration-200 ${
                              selectedStages.length > 0 ? 'text-blue-600' : ''
                            } ${showStageFilter ? 'text-blue-600' : ''}`}
                          />
                        </button>
                      </div>

                      {/* Stage Filter Dropdown */}
                      {showStageFilter && (
                        <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[220px] max-h-[300px] overflow-y-auto">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-sm dark:text-white">
                              Filter Stages
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStages([]);
                                  applyFilters();
                                  setShowStageFilter(false);
                                }}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                              >
                                Clear All
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowStageFilter(false);
                                }}
                                className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          {leadStages.length > 0 ? (
                            <>
                              {leadStages.map((stage) => (
                                <div
                                  key={stage}
                                  className="flex items-center mb-2"
                                >
                                  <input
                                    type="checkbox"
                                    id={`stage-${stage}`}
                                    checked={selectedStages.includes(stage)}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleStageSelect(stage);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-3.5 w-3.5 mr-2.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                                  />
                                  <label
                                    htmlFor={`stage-${stage}`}
                                    className="text-sm font-medium dark:text-white cursor-pointer truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  >
                                    {stage || 'Unknown'}
                                  </label>
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
                              Loading stages...
                            </div>
                          )}

                          {selectedStages.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                Selected ({selectedStages.length}):
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedStages.map((stage) => (
                                  <span
                                    key={stage}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                  >
                                    Stage: {stage}
                                    <button
                                      onClick={() => {
                                        handleStageSelect(stage);
                                        setShowStageFilter(false);
                                      }}
                                      className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
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

                    <th className="py-5 px-4">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Remark
                      </div>
                    </th>

                    <th className="py-5 px-4">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {dropLeads.map((lead, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 last:border-b-0"
                    >
                      {/* Select Checkbox */}
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.master_id)}
                          onChange={() => {
                            const leadId = lead.master_id;
                            setSelectedLeads((prev) =>
                              prev.includes(leadId)
                                ? prev.filter((id) => id !== leadId)
                                : [...prev, leadId],
                            );
                            setSelectedMasterIds((prev) =>
                              prev.includes(leadId)
                                ? prev.filter((id) => id !== leadId)
                                : [...prev, leadId],
                            );
                          }}
                          className="h-4.5 w-4.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-boxdark"
                        />
                      </td>

                      {/* Entry Date */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                          {lead.assign_date
                            ? new Date(lead.assign_date).toLocaleDateString(
                                'en-GB',
                              )
                            : '—'}
                        </div>
                      </td>

                      {/* FollowUp Date */}
                      <td className="py-4 px-4">
                        <div
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm border shadow-sm ${
                            lead.followup_date &&
                            new Date(lead.followup_date) < new Date()
                              ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/30'
                              : 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30'
                          }`}
                        >
                          {lead.followup_date
                            ? new Date(lead.followup_date).toLocaleDateString(
                                'en-GB',
                              )
                            : '—'}
                        </div>
                      </td>

                      {/* Client Name */}
                      <td className="py-4 px-4">
                        <div
                          onClick={() => {
                            setSelectedLeadDetails(lead);
                            setShowDetailsModal(true);
                          }}
                          className="group cursor-pointer"
                        >
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                            {lead.name}
                          </div>
                          <div className="mt-1 flex items-center">
                            <div className="w-full h-px bg-gradient-to-r from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-800 group-hover:from-blue-400 group-hover:to-blue-200 dark:group-hover:from-blue-500 dark:group-hover:to-blue-300 transition-all duration-300"></div>
                            <div className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                              <FontAwesomeIcon
                                icon={faEye}
                                className="text-xs text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                          {lead.number || '—'}
                        </div>
                      </td>

                      {/* City with Location Link */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          {/* City Name */}
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {lead.city || '—'}
                          </div>

                          {/* Location Link - Only show if available */}
                          {lead.document_location_link && (
                            <div>
                              <a
                                href={lead.document_location_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/30 transition-all duration-200 border border-blue-200 dark:border-blue-700/30 shadow-sm"
                                title="Open location in Google Meet"
                              >
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="w-3 h-3"
                                />
                                <span>Location</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-2">
                        <ProgressStatus
                          stage={lead.lead_stage || lead.latest_leadStage}
                          status_percentage={lead.status_percentage}
                          is_drop_stage={lead.is_drop_stage}
                          previous_stage={lead.previous_stage}
                        />
                      </td>

                      {/* Assigned User */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-semibold bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-700/30 shadow-sm text-center">
                          {lead.telecaller_name || '—'}
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-semibold bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 text-orange-800 dark:text-orange-300 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-700/30 shadow-sm text-center">
                          {lead.lead_stage || 'N/A'}
                        </div>
                      </td>

                      {/* Remark */}
                      <td className="py-4 px-4">
                        <span
                          onClick={() =>
                            handleShowRemark(
                              lead.detailed_remark ||
                                lead.quick_remark ||
                                'No remarks',
                            )
                          }
                          title="Click to view full remark"
                          className={`inline-flex cursor-pointer rounded-full py-1.5 px-3.5 text-sm font-semibold border shadow-sm truncate max-w-[220px]
      ${
        lead.quick_remark === 'Interested'
          ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700/30'
          : lead.quick_remark === 'Not Interested'
          ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700/30'
          : lead.quick_remark === 'Not Received'
          ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/30'
          : lead.quick_remark === 'Call Cut'
          ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700/30'
          : lead.quick_remark === 'Not Reachable'
          ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600/30'
          : lead.quick_remark === 'Busy'
          ? 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700/30'
          : 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/20 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-600/30'
      }`}
                        >
                          {lead.detailed_remark?.substring(0, 20) || '—'}
                          {lead.detailed_remark &&
                            lead.detailed_remark.length > 20 &&
                            '...'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-1">
                          {/* Call Button */}
                          {/* <ActionButton
                            onClick={() =>
                              handleEdit({
                                ...lead,
                                master_id: lead.master_id,
                                assigned_to:
                                  lead.assigned_to ||
                                  lead.telecaller_name ||
                                  '',
                              })
                            }
                            title="Make Call"
                            variant="call"
                            className="w-8 h-8 hover:scale-105 transition-transform"
                          >
                            <FontAwesomeIcon
                              icon={faPhone}
                              className="text-xs"
                            />
                          </ActionButton> */}

                          {/* Edit Button */}
                          <ActionButton
                            onClick={() => handleEditClick(lead)}
                            title="Edit"
                            variant="edit"
                            className="w-8 h-8 hover:scale-105 transition-transform"
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="text-xs"
                            />
                          </ActionButton>

                          {/* Documents Button */}
                          <ActionButton
                            onClick={() => handleFileIconClick(lead)}
                            title="Upload/View Files"
                            variant="document"
                            badgeCount={lead.document_count}
                            className="w-8 h-8 hover:scale-105 transition-transform relative"
                          >
                            <FontAwesomeIcon
                              icon={faFileUpload}
                              className="text-xs"
                            />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalLeads > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalLeads / itemsPerPage)}
              onPageChange={handlePageChange}
              totalItems={totalLeads}
              itemsPerPage={itemsPerPage}
              showingStart={((currentPage - 1) * itemsPerPage) + 1}
              showingEnd={Math.min(currentPage * itemsPerPage, totalLeads)}
            />
          )}
        </>
      )}

      {/* Modals */}
      {showDetailsModal && renderDetailsModal()}
      {renderDocsModal()}

      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-2xl mt-20 max-h-[85vh] overflow-y-auto dark:border-strokedark dark:bg-boxdark">
            <EditTeleCallerForm
              data={selectedClient}
              onClose={handleModalClose}
              onUpdate={fetchDataAgain}
            />
          </div>
        </div>
      )}

      {showEditPopup && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-2xl mt-20 max-h-[85vh] overflow-y-auto dark:border-strokedark dark:bg-boxdark">
            <EditRawDataForm
              showEditPopup={showEditPopup}
              editingClient={editingClient}
              setEditingClient={setEditingClient}
              closeEditPopup={closeEditPopup}
              fetchRawData={fetchDropLeads}
              categories={categories}
              references={references}
              area={area}
            />
          </div>
        </div>
      )}

      {/* Reassign Popup Modal */}
      {showAssignPopup && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex justify-center items-center">
          <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto border dark:border-strokedark">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-strokedark">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Assign Selected Records ({selectedMasterIds.length})
              </h2>
              <button
                onClick={() => setShowAssignPopup(false)}
                className="text-xl text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (
                  !assignData.assignedTo.length ||
                  !assignData.leadStage ||
                  !assignData.reassignmentDate
                ) {
                  alert('Please select users, lead stage, and followup date');
                  return;
                }

                try {
                  // ONE request per master_id (backend loops users)
                  const requests = selectedMasterIds.map((master_id) =>
                    fetch(`${BASE_URL}api/add`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        master_id,
                        assignedTo: assignData.assignedTo,
                        leadStage: assignData.leadStage,
                        remark: assignData.remark,
                        reassignment_date: assignData.reassignmentDate,
                        followup_date: assignData.reassignmentDate,
                      }),
                    }),
                  );

                  const responses = await Promise.all(requests);
                  const results = await Promise.all(
                    responses.map((r) => r.json()),
                  );

                  let totalInserted = 0;
                  let totalSkipped = 0;

                  results.forEach((r) => {
                    totalInserted += r.inserted_count || 0;
                    totalSkipped += r.skipped_count || 0;
                  });

                  alert(
                    `✅ Assignment completed\nInserted: ${totalInserted}\nSkipped: ${totalSkipped}`,
                  );

                  // RESET
                  setAssignData({
                    assignedTo: [],
                    leadStage: '',
                    remark: '',
                    reassignmentDate: new Date().toISOString().split('T')[0],
                  });

                  setSelectedMasterIds([]);
                  setSelectedLeads([]);
                  setShowAssignPopup(false);
                  setRefreshTrigger((prev) => prev + 1);
                } catch (error) {
                  console.error('Network error:', error);
                  alert('❌ Submission failed');
                }
              }}
              className="space-y-4"
            >
              {/* ASSIGN TO - WITH SELECT/CLEAR ALL BUTTONS */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-semibold text-green-600 dark:text-green-400">
                    Assign To
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allUsers = users.map((user) => user.name);
                        setAssignData({
                          ...assignData,
                          assignedTo: allUsers,
                        });
                      }}
                      className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignData({
                          ...assignData,
                          assignedTo: [],
                        });
                      }}
                      className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* USER LIST */}
                <div className="border rounded p-3 max-h-48 overflow-y-auto dark:border-form-strokedark dark:bg-form-input">
                  {users.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No users available
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {users.map((user) => {
                        const checked = assignData.assignedTo.includes(
                          user.name,
                        );

                        return (
                          <label
                            key={user.id}
                            className={`flex gap-2 p-2 rounded cursor-pointer transition-colors ${
                              checked
                                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setAssignData({
                                  ...assignData,
                                  assignedTo: checked
                                    ? assignData.assignedTo.filter(
                                        (u) => u !== user.name,
                                      )
                                    : [...assignData.assignedTo, user.name],
                                })
                              }
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                            />
                            <div className="text-xs flex-1">
                              <div className="font-medium text-black dark:text-white">
                                {user.name}
                              </div>
                            </div>
                            <div className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {user.id}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  Selected: {assignData.assignedTo.length}
                </p>
              </div>

              {/* LEAD DETAILS - STAGE + FOLLOWUP DATE */}
              <div>
                <label className="block font-semibold text-green-600 dark:text-green-400 mb-2">
                  Lead Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Lead Stage */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-black dark:text-white">
                      Lead Stage *
                    </label>
                    <select
                      name="leadStage"
                      value={assignData.leadStage}
                      onChange={(e) =>
                        setAssignData({ ...assignData, leadStage: e.target.value })
                      }
                      required
                      className="w-full border rounded p-2 dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
                    >
                      <option value="">Select Lead Stage</option>
                      {leadStages.map((stage, i) => (
                        <option key={i} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Followup Date */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-black dark:text-white">
                      Followup Date *
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="date"
                        name="reassignmentDate"
                        value={assignData.reassignmentDate || ''}
                        onChange={(e) =>
                          setAssignData({
                            ...assignData,
                            reassignmentDate: e.target.value,
                          })
                        }
                        required
                        className="w-full border rounded p-2 dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
                        min="2020-01-01"
                        max="2030-12-31"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAssignData({
                            ...assignData,
                            reassignmentDate: new Date()
                              .toISOString()
                              .split('T')[0],
                          });
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* REMARK */}
              <div>
                <label className="block font-medium dark:text-white text-black mb-1">
                  Remark (Optional)
                </label>
                <textarea
                  rows={3}
                  value={assignData.remark}
                  onChange={(e) =>
                    setAssignData({ ...assignData, remark: e.target.value })
                  }
                  placeholder="Enter Remark"
                  className="w-full border rounded p-2 dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-strokedark">
                <button
                  type="button"
                  onClick={() => setShowAssignPopup(false)}
                  className="px-4 py-2 rounded border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !assignData.assignedTo.length ||
                    !assignData.leadStage ||
                    !assignData.reassignmentDate
                  }
                  className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create{' '}
                  {selectedMasterIds.length * assignData.assignedTo.length}{' '}
                  Assignments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openRemark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200">
              Full Remark
            </h2>

            <p className="text-gray-800 dark:text-gray-300 whitespace-pre-line">
              {openRemark}
            </p>

            <button
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => setOpenRemark(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropLeadsPage;