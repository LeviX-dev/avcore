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
  faCalendarAlt,
  faTasks,
  faTrashAlt,
  faPlus,
  faFolderOpen,
  faImage,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import EditTeleCallerForm from './EditCall.js';
import EditRawDataForm from '../Rawdata/UpdateRawData.js';
import InsertDataModal from '../Rawdata/InsertDataModal';

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

interface Client {
  original_area: any;
  original_city: any;
  lead_activity(lead_activity: any): React.ReactNode;
  master_id: number;
  name: string;
  number?: string;
  city?: string;
  assign_date?: string;
  telecaller_name?: string;
  quick_remark?: string;
  detailed_remark?: string;
  document_count?: number;
  cat_id?: number;
  client_name?: string;
  category?: string;
  stage?: string;
  followup_date?: string;
  assigned_to?: string;
  email?: string;
  address?: string;
  area?: string;
  cat_name?: string;
  reference_name?: string;
  status?: string;
  lead_status?: string;
  reassignment_remarks?: string[] | ReassignmentRemark[] | any[];
  reference_id?: number;
  area_id?: number;
  location_link?: string;
  room_length?: string;
  room_width?: string;
  room_height?: string;
  p_type?: string;
  budget_range?: string;
  current_stage?: string;
  room_ready?: string;
  time_to_complete?: string;
  site_visit_date?: string;
  demo_date?: string;
  ar_number?: string;
  ca_number?: string;
  e_number?: string;
  sm_number?: string;
  pop_number?: string;
  other_number?: string;
  lead_stage?: string;
  assigned_to_list?: string[];
  status_percentage?: number;
  is_drop_stage?: boolean;
  previous_stage?: string;
  category_other?: string;
  reference_other?: string;
  architect_name?: string;
  alternate_number?: string;
  document_location_link?: string;
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

interface DocItem {
  doc_id: number;
  url: string;
  link?: string | null;
  remark?: string | null;
  document_type?: string;
}

interface DocumentData {
  images: DocItem[];
  documents: DocItem[];
  videos: DocItem[];
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
  variant?: 'call' | 'edit' | 'document' | 'view' | 'viewDocs';
  badgeCount?: number | null;
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl';

  const variantStyles = {
    call: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white',
    edit: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white',
    document: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white',
    view: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white',
    viewDocs: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white',
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
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/10'
            }`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/10'
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
          <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-300 inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
            >
              <span className="sr-only">Previous</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" fillRule="evenodd" />
              </svg>
            </button>

            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`dots-${index}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 focus:outline-offset-0">
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
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${isCurrent
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
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-300 inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
            >
              <span className="sr-only">Next</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

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
      <div className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{percentage}%</div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-0.5">
        <div className={`h-full rounded-full ${getProgressColor(cleanStage)} transition-all duration-300`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="w-full text-center">
        <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">
          {is_drop_stage ? previous_stage || cleanStage : cleanStage || 'N/A'}
        </div>
        {is_drop_stage && <div className="text-[8px] text-red-500 font-medium mt-0.5">DROPPED</div>}
      </div>
    </div>
  );
};

const CallList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ADD THIS

  const [topPaginationKey, setTopPaginationKey] = useState(0);

  const [locationLink, setLocationLink] = useState('');
  const [remark, setRemark] = useState('');

  // Add these new state variables for Documents modal
  const [docsUsers, setDocsUsers] = useState<any[]>([]);
  const [docsFilteredUsers, setDocsFilteredUsers] = useState<any[]>([]);
  const [docsSearchTerm, setDocsSearchTerm] = useState('');
  const [docsCurrentUserRole, setDocsCurrentUserRole] = useState('');
  const [docsRolePermissions, setDocsRolePermissions] = useState<any>(null);

  // Add these new state variables
  const [assignUsers, setAssignUsers] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [rolePermissions, setRolePermissions] = useState<any>(null);

  const [docsClient, setDocsClient] = useState<Client | null>(null);
  const [docsData, setDocsData] = useState<DocumentData>({
    images: [],
    documents: [],
    videos: [],
  });

  const [showViewDocsPopup, setShowViewDocsPopup] = useState(false);
  const [viewDocsClient, setViewDocsClient] = useState<Client | null>(null);
  const [viewDocsData, setViewDocsData] = useState<DocumentData>({
    images: [],
    documents: [],
    videos: [],
  });

  const [openRemark, setOpenRemark] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [documentsData, setDocumentsData] = useState({
    images: [],
    documents: [],
    videos: [],
  });
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsFetched, setDocsFetched] = useState(false);

  // Add these state variables
  const [viewOnlyDocsClient, setViewOnlyDocsClient] = useState<Client | null>(null);
  const [viewOnlyDocsData, setViewOnlyDocsData] = useState<DocumentData>({
    images: [],
    documents: [],
    videos: [],
  });
  const [showViewOnlyDocsPopup, setShowViewOnlyDocsPopup] = useState(false);

  const [showDocsPopup, setShowDocsPopup] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState<'image' | 'documents' | 'video'>('documents');
  const [categories, setCategories] = useState<Category[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [area, setArea] = useState<Area[]>([]);

  // NEW: Filter states like RawData
  const [showEntryDateCalendar, setShowEntryDateCalendar] = useState(false);
  const [showFollowupDateCalendar, setShowFollowupDateCalendar] = useState(false);
  const [showStageFilter, setShowStageFilter] = useState(false);
  const [showUserFilter, setShowUserFilter] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);

  const [selectedEntryFromDate, setSelectedEntryFromDate] = useState('');
  const [selectedEntryToDate, setSelectedEntryToDate] = useState('');
  const [selectedFollowupFromDate, setSelectedFollowupFromDate] = useState('');
  const [selectedFollowupToDate, setSelectedFollowupToDate] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const [customRecordCount, setCustomRecordCount] = useState<number | ''>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [leadStages, setLeadStages] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Refs for click outside detection
  const entryDateRef = useRef<HTMLDivElement>(null);
  const followupDateRef = useRef<HTMLDivElement>(null);
  const stageFilterRef = useRef<HTMLDivElement>(null);
  const userFilterRef = useRef<HTMLDivElement>(null);
  const cityFilterRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [followupDate, setFollowupDate] = useState('');
  const [leadStage, setLeadStage] = useState('');
  const [selectedClientDetails, setSelectedClientDetails] = useState<Client | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [detailedRemark, setDetailedRemark] = useState('');

  // Add these state variables
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectedMasterIds, setSelectedMasterIds] = useState<number[]>([]);
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [assignData, setAssignData] = useState({
    assignedTo: [] as string[],
    leadStage: '',
    remark: '',
    reassignmentDate: new Date().toISOString().split('T')[0],
  });

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [singleFormData, setSingleFormData] = useState({
    name: '',
    number: '',
    email: '',
    address: '',
    cat_id: '',
    reference_id: '',
    area_id: '',
  });

  const [error, setError] = useState('');
  const [duplicateEntries, setDuplicateEntries] = useState<any[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // STAGE_PERCENTAGE_MAP
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
        <div className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{percentage}%</div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-0.5">
          <div className={`h-full rounded-full ${getProgressColor(cleanStage)} transition-all duration-300`} style={{ width: `${percentage}%` }} />
        </div>
        <div className="w-full text-center">
          <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">
            {is_drop_stage ? previous_stage || cleanStage : cleanStage || 'N/A'}
          </div>
          {is_drop_stage && <div className="text-[8px] text-red-500 font-medium mt-0.5">DROPPED</div>}
        </div>
      </div>
    );
  };

  // ============ MAIN FETCH FUNCTION - MODIFIED TO NOT RESET PAGE ============
  const fetchTaleCallerData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}api/getcompleterawdata`, {
        withCredentials: true,
      });

      // Create an object to track the last non-Drop stage for each client
      const lastNonDropStages: Record<number, string> = {};

      response.data.forEach((item: any) => {
        const clientId = item.master_id;
        const currentStage = item.stage || item.lead_stage || item.current_stage || '';
        const cleanStage = currentStage ? currentStage.trim() : '';
        if (cleanStage && cleanStage !== 'Drop') {
          lastNonDropStages[clientId] = cleanStage;
        }
      });

      const parseValue = (value: any) => {
        if (value === 'Not Available' || value === null || value === undefined) return '';
        return value;
      };

      const parseIdValue = (value: any) => {
        if (value === 'Not Available' || value === null || value === undefined) return '';
        return isNaN(value) ? value : Number(value);
      };

      const processedData = response.data.map((item: any) => {
        const currentStage = parseValue(item.stage || item.lead_stage || item.current_stage);
        const cleanStage = currentStage ? currentStage.trim() : '';

        let previousStage = lastNonDropStages[item.master_id] || '';
        if (cleanStage === 'Drop' && !previousStage) {
          if (item.quotation_date || item.site_visit_date) previousStage = 'Quotation Pending';
          else if (item.demo_date) previousStage = 'Demo';
          else previousStage = 'Positive Lead';
        }

        const stageForPercentage = cleanStage === 'Drop' ? previousStage : cleanStage;
        const status_percentage = stageForPercentage ? STAGE_PERCENTAGE_MAP[stageForPercentage] || 0 : 0;

        let displayCity = '';
        const areaName = parseValue(item.area_name);
        const cityName = parseValue(item.city);

        if (areaName && areaName !== '' && areaName !== 'Not Available') {
          displayCity = areaName;
        } else if (cityName && cityName !== '' && cityName !== 'Not Available') {
          displayCity = cityName;
        } else {
          displayCity = '';
        }

        let reassignmentRemarks = [];
        if (item.reassignment_remarks) {
          if (Array.isArray(item.reassignment_remarks)) {
            reassignmentRemarks = item.reassignment_remarks.map((remark: any) => {
              if (typeof remark === 'string') return remark;
              else if (remark && typeof remark === 'object') return remark;
              return '';
            });
          } else if (typeof item.reassignment_remarks === 'string') {
            try {
              const parsedRemarks = JSON.parse(item.reassignment_remarks);
              if (Array.isArray(parsedRemarks)) reassignmentRemarks = parsedRemarks;
            } catch (e) {
              reassignmentRemarks = [item.reassignment_remarks];
            }
          }
        }

        return {
          master_id: item.master_id,
          id: item.master_id,
          name: parseValue(item.name),
          number: parseValue(item.number),
          email: parseValue(item.email),
          address: parseValue(item.address),
          city: displayCity,
          original_city: parseValue(item.city),
          original_area: parseValue(item.area_name),
          area: parseValue(item.area_name),
          cat_name: parseValue(item.cat_name),
          reference_name: parseValue(item.reference_name),
          status: parseValue(item.status),
          stage: cleanStage,
          assign_date: parseValue(item.assign_date),
          followup_date: parseValue(item.followup_date),
          assigned_to: parseValue(item.reassigned_to || item.assigned_to),
          telecaller_name: parseValue(item.reassigned_to || item.assigned_to),
          quick_remark: parseValue(item.quick_remark),
          detailed_remark: parseValue(item.detailed_remark),
          document_count: item.document_count || 0,
          cat_id: parseIdValue(item.cat_id),
          client_name: parseValue(item.name),
          category: parseValue(item.cat_name),
          status_percentage: status_percentage,
          is_drop_stage: cleanStage === 'Drop',
          previous_stage: previousStage,
          reassignment_remarks: reassignmentRemarks,
          category_other: parseValue(item.category_other),
          reference_other: parseValue(item.reference_other),
          reference_id: parseIdValue(item.reference_id),
          area_id: parseIdValue(item.area_id),
          location_link: parseValue(item.location_link),
          room_length: parseValue(item.room_length),
          room_width: parseValue(item.room_width),
          room_height: parseValue(item.room_height),
          p_type: parseValue(item.p_type),
          budget_range: parseValue(item.budget_range),
          current_stage: parseValue(item.current_stage),
          room_ready: parseValue(item.room_ready),
          time_to_complete: parseValue(item.time_to_complete),
          site_visit_date: parseValue(item.site_visit_date),
          demo_date: parseValue(item.demo_date),
          ar_number: parseValue(item.ar_number),
          architect_name: parseValue(item.architect_name),
          ca_number: parseValue(item.ca_number),
          e_number: parseValue(item.e_number),
          sm_number: parseValue(item.sm_number),
          pop_number: parseValue(item.pop_number),
          other_number: parseValue(item.other_number),
          lead_stage: parseValue(item.lead_stage),
          assigned_to_list: Array.isArray(item.assigned_to) ? item.assigned_to : [],
          assign_id: parseIdValue(item.assign_id),
          alternate_number: parseValue(item.alternate_number),
          document_location_link: parseValue(item.document_location_link),
        };
      });

      const uniqueClientsMap = new Map<number, Client>();
      processedData.forEach((client: Client) => {
        if (!uniqueClientsMap.has(client.master_id)) {
          uniqueClientsMap.set(client.master_id, client);
        }
      });
      const uniqueClients = Array.from(uniqueClientsMap.values());

      setClients(uniqueClients);
      
      // Extract unique cities
      const cities = uniqueClients
        .map((client) => client.city?.trim())
        .filter((city) => city && city !== '' && city !== 'Not Available' && city !== 'N/A')
        .filter((city, index, self) => self.indexOf(city) === index)
        .sort() as string[];
      setAvailableCities(cities);

      // IMPORTANT: Do NOT reset currentPage here
      // Just set clients and let the filter useEffect handle filteredClients
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============ APPLY FILTERS - MODIFIED TO NOT RESET PAGE ============
  const applyFilters = () => {
    let filtered = [...clients];
    const lowerSearch = searchTerm.toLowerCase();

    if (searchTerm) {
      filtered = filtered.filter((client) => {
        const searchFields = [
          client.name?.toLowerCase() || '',
          client.number?.toString() || '',
          client.email?.toLowerCase() || '',
          client.address?.toLowerCase() || '',
          client.area?.toLowerCase() || '',
          client.cat_name?.toLowerCase() || '',
          client.master_id?.toString() || '',
          client.status?.toLowerCase() || '',
          client.assigned_to?.toLowerCase() || '',
          client.city?.toLowerCase() || '',
          client.stage?.toLowerCase() || '',
          client.telecaller_name?.toLowerCase() || '',
        ];
        return searchFields.some((field) => field.includes(lowerSearch));
      });
    }

    if (selectedEntryFromDate || selectedEntryToDate) {
      filtered = filtered.filter((client) => {
        if (!client.assign_date) return false;
        const clientDate = new Date(client.assign_date);
        if (isNaN(clientDate.getTime())) return false;
        let fromDateValid = true;
        let toDateValid = true;
        if (selectedEntryFromDate) {
          const fromDate = new Date(selectedEntryFromDate);
          fromDateValid = clientDate >= fromDate;
        }
        if (selectedEntryToDate) {
          const toDate = new Date(selectedEntryToDate);
          toDateValid = clientDate <= toDate;
        }
        return fromDateValid && toDateValid;
      });
    }

    if (selectedFollowupFromDate || selectedFollowupToDate) {
      filtered = filtered.filter((client) => {
        if (!client.followup_date) return false;
        const clientDate = new Date(client.followup_date);
        if (isNaN(clientDate.getTime())) return false;
        let fromDateValid = true;
        let toDateValid = true;
        if (selectedFollowupFromDate) {
          const fromDate = new Date(selectedFollowupFromDate);
          fromDateValid = clientDate >= fromDate;
        }
        if (selectedFollowupToDate) {
          const toDate = new Date(selectedFollowupToDate);
          toDateValid = clientDate <= toDate;
        }
        return fromDateValid && toDateValid;
      });
    }

    if (selectedStages.length > 0) {
      filtered = filtered.filter((client) => client.stage && selectedStages.includes(client.stage));
    }

    if (selectedUsers.length > 0) {
      filtered = filtered.filter((client) => client.assigned_to && selectedUsers.includes(client.assigned_to));
    }

    if (selectedCities.length > 0) {
      filtered = filtered.filter((client) => client.city && selectedCities.includes(client.city));
    }

    setFilteredClients(filtered);
    // IMPORTANT: Do NOT reset currentPage here
  };

  // ============ REFRESH FUNCTION THAT PRESERVES PAGE ============
  const refreshDataWithPagePreservation = () => {
    // Save current page before refresh
    sessionStorage.setItem('callList_savedPage', currentPage.toString());
    // Trigger refresh
    setRefreshTrigger(prev => prev + 1);
  };

  // ============ RESTORE PAGE AFTER DATA LOAD ============
  useEffect(() => {
    if (!isLoading && refreshTrigger > 0) {
      const savedPage = sessionStorage.getItem('callList_savedPage');
      if (savedPage) {
        const pageToRestore = parseInt(savedPage);
        const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
        if (pageToRestore <= totalPages && pageToRestore >= 1) {
          setCurrentPage(pageToRestore);
        }
        sessionStorage.removeItem('callList_savedPage');
      }
    }
  }, [isLoading, filteredClients.length, refreshTrigger]);

  // ============ EFFECTS ============
  // Initial load and refresh trigger
  useEffect(() => {
    fetchTaleCallerData();
    // Fetch other data
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/users`, { withCredentials: true });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    const fetchLeadStages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/leadstage`, { withCredentials: true });
        setLeadStages(response.data);
      } catch (error) {
        console.error('Error fetching lead stages:', error);
      }
    };
    fetchUsers();
    fetchLeadStages();
  }, [refreshTrigger]);

  // Apply filters when dependencies change - but preserve page
  useEffect(() => {
    if (clients.length > 0) {
      applyFilters();
    }
  }, [searchTerm, selectedEntryFromDate, selectedEntryToDate, selectedFollowupFromDate, selectedFollowupToDate, selectedStages, selectedUsers, selectedCities, clients]);

  // Custom record count effect
  useEffect(() => {
    if (customRecordCount && typeof customRecordCount === 'number' && customRecordCount > 0) {
      let tempFiltered = [...clients];
      // Apply all active filters
      const lowerSearch = searchTerm.toLowerCase();
      if (searchTerm) {
        tempFiltered = tempFiltered.filter((client) => {
          const searchFields = [
            client.name?.toLowerCase() || '',
            client.number?.toString() || '',
            client.email?.toLowerCase() || '',
            client.address?.toLowerCase() || '',
            client.area?.toLowerCase() || '',
            client.cat_name?.toLowerCase() || '',
            client.master_id?.toString() || '',
            client.status?.toLowerCase() || '',
            client.assigned_to?.toLowerCase() || '',
            client.city?.toLowerCase() || '',
            client.stage?.toLowerCase() || '',
            client.telecaller_name?.toLowerCase() || '',
          ];
          return searchFields.some((field) => field.includes(lowerSearch));
        });
      }
      if (selectedEntryFromDate || selectedEntryToDate) {
        tempFiltered = tempFiltered.filter((client) => {
          if (!client.assign_date) return false;
          const clientDate = new Date(client.assign_date);
          if (isNaN(clientDate.getTime())) return false;
          let fromDateValid = true;
          let toDateValid = true;
          if (selectedEntryFromDate) {
            const fromDate = new Date(selectedEntryFromDate);
            fromDateValid = clientDate >= fromDate;
          }
          if (selectedEntryToDate) {
            const toDate = new Date(selectedEntryToDate);
            toDateValid = clientDate <= toDate;
          }
          return fromDateValid && toDateValid;
        });
      }
      if (selectedFollowupFromDate || selectedFollowupToDate) {
        tempFiltered = tempFiltered.filter((client) => {
          if (!client.followup_date) return false;
          const clientDate = new Date(client.followup_date);
          if (isNaN(clientDate.getTime())) return false;
          let fromDateValid = true;
          let toDateValid = true;
          if (selectedFollowupFromDate) {
            const fromDate = new Date(selectedFollowupFromDate);
            fromDateValid = clientDate >= fromDate;
          }
          if (selectedFollowupToDate) {
            const toDate = new Date(selectedFollowupToDate);
            toDateValid = clientDate <= toDate;
          }
          return fromDateValid && toDateValid;
        });
      }
      if (selectedStages.length > 0) {
        tempFiltered = tempFiltered.filter((client) => client.stage && selectedStages.includes(client.stage));
      }
      if (selectedUsers.length > 0) {
        tempFiltered = tempFiltered.filter((client) => client.assigned_to && selectedUsers.includes(client.assigned_to));
      }
      if (selectedCities.length > 0) {
        tempFiltered = tempFiltered.filter((client) => client.city && selectedCities.includes(client.city));
      }
      const limitedFilteredClients = tempFiltered.slice(0, customRecordCount);
      setFilteredClients(limitedFilteredClients);
      setItemsPerPage(customRecordCount);
      setCurrentPage(1);
    } else {
      applyFilters();
      setItemsPerPage(10);
    }
  }, [customRecordCount]);

  // User search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter((user) => user.name.toLowerCase().includes(term) || (user.role && user.role.toLowerCase().includes(term)));
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Fetch categories, references, area
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/category`, { withCredentials: true });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    const fetchReferences = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/reference`, { withCredentials: true });
        setReferences(response.data);
      } catch (error) {
        console.error('Error fetching references:', error);
        setReferences([]);
      }
    };
    const fetchArea = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/area`, { withCredentials: true });
        setArea(response.data);
      } catch (error) {
        console.error('Error fetching area:', error);
        setArea([]);
      }
    };
    fetchCategories();
    fetchReferences();
    fetchArea();
  }, []);

  // Fetch assign users when popup opens
  useEffect(() => {
    const fetchAssignUsers = async () => {
      if (!showAssignPopup) return;
      try {
        const response = await axios.get(`${BASE_URL}api/users/by-role`, { withCredentials: true });
        if (response.data.success) {
          setAssignUsers(response.data.users || []);
          setCurrentUserRole(response.data.currentUserRole || '');
          setRolePermissions(response.data.permissions || null);
        } else {
          setAssignUsers([]);
        }
      } catch (error) {
        console.error('Failed to fetch assign users:', error);
        setAssignUsers([]);
      }
    };
    fetchAssignUsers();
  }, [showAssignPopup]);

  // Fetch docs users when modal opens
  useEffect(() => {
    const fetchDocsUsers = async () => {
      if (!showDocsPopup) return;
      try {
        const response = await axios.get(`${BASE_URL}api/users/by-role`, { withCredentials: true });
        if (response.data.success) {
          setDocsUsers(response.data.users || []);
          setDocsFilteredUsers(response.data.users || []);
          setDocsCurrentUserRole(response.data.currentUserRole || '');
          setDocsRolePermissions(response.data.permissions || null);
        } else {
          setDocsUsers([]);
          setDocsFilteredUsers([]);
        }
      } catch (error) {
        console.error('Failed to fetch docs users:', error);
        setDocsUsers([]);
        setDocsFilteredUsers([]);
      }
    };
    fetchDocsUsers();
  }, [showDocsPopup]);

  // Reset when client changes for modal
  useEffect(() => {
    if (selectedClientDetails) {
      setActiveTab('details');
      setDocsFetched(false);
      setDocumentsData({ images: [], documents: [], videos: [] });
    }
  }, [selectedClientDetails?.master_id]);

  // Fetch documents when switching to documents tab
  useEffect(() => {
    if (activeTab === 'documents' && selectedClientDetails?.master_id && !docsFetched) {
      fetchDocumentsForModal();
    }
  }, [activeTab, selectedClientDetails?.master_id]);

  // ============ HELPER FUNCTIONS ============
  const fetchDocumentsForModal = async () => {
    if (!selectedClientDetails?.master_id || docsFetched) return;
    setLoadingDocs(true);
    try {
      const response = await axios.get(`${BASE_URL}api/documents/${selectedClientDetails.master_id}`, { withCredentials: true });
      const images = [];
      const documents: any[] = [];
      const videos: any[] = [];
      response.data.documents.forEach((doc) => {
        let filePath = doc.document_path.replace(/^server\//, '').replace(/\\/g, '/');
        if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;
        const fullUrl = `${BASE_URL}${filePath}`;
        const obj = { ...doc, url: fullUrl, document_name: doc.document_name || `Document ${doc.doc_id}`, file_extension: doc.file_extension || '' };
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignData((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewOnlyDocuments = async (client: Client) => {
    setViewOnlyDocsClient(client);
    try {
      const response = await axios.get(`${BASE_URL}api/documents/${client.master_id}`, { withCredentials: true });
      const images: DocItem[] = [];
      const documents: DocItem[] = [];
      const videos: DocItem[] = [];
      response.data.documents.forEach((doc: any) => {
        let filePath = doc.document_path.replace(/^server\//, '').replace(/\\/g, '/');
        if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;
        const fullUrl = `${BASE_URL}${filePath}`;
        const docObj: DocItem = { doc_id: doc.doc_id, url: fullUrl, link: doc.location_link, remark: doc.remark, document_type: doc.document_type };
        if (doc.document_type === 'image') images.push(docObj);
        else if (doc.document_type === 'video') videos.push(docObj);
        else documents.push(docObj);
      });
      setViewOnlyDocsData({ images, documents, videos });
      setShowViewOnlyDocsPopup(true);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setViewOnlyDocsData({ images: [], documents: [], videos: [] });
      setShowViewOnlyDocsPopup(true);
    }
  };

  const handleShowRemark = (text) => {
    if (!text) return;
    setOpenRemark(text);
  };

  // Filter handlers - MODIFIED to NOT reset page
  const handleStageSelect = (stage: string) => {
    setSelectedStages((prev) => (prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]));
    setShowStageFilter(false);
  };

  const handleUserSelect = (userName: string) => {
    setSelectedUsers((prev) => (prev.includes(userName) ? prev.filter((u) => u !== userName) : [...prev, userName]));
    setShowUserFilter(false);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]));
    setShowCityFilter(false);
  };

  const clearFilters = () => {
    setSelectedEntryFromDate('');
    setSelectedEntryToDate('');
    setSelectedFollowupFromDate('');
    setSelectedFollowupToDate('');
    setSelectedStages([]);
    setSelectedUsers([]);
    setSelectedCities([]);
    setSearchTerm('');
    setCustomRecordCount('');
    setItemsPerPage(10);
    setShowEntryDateCalendar(false);
    setShowFollowupDateCalendar(false);
    setShowStageFilter(false);
    setShowUserFilter(false);
    setShowCityFilter(false);
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

  // Pagination calculations
  const totalItems = filteredClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const showingStart = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const showingEnd = Math.min(indexOfLastItem, totalItems);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient({ ...client, master_id: client.master_id, cat_id: client.cat_id });
    setIsModalOpen(true);
  };

  const handleModalClose = (refresh = false) => {
    setIsModalOpen(false);
    setSelectedClient(null);
    if (refresh) {
      refreshDataWithPagePreservation();
    }
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setShowEditPopup(true);
  };

  const closeEditPopup = () => {
    setEditingClient(null);
    setShowEditPopup(false);
    refreshDataWithPagePreservation();
  };

  const handleFileIconClick = async (client: Client) => {
    setDocsClient(client);
    setFollowupDate(client.followup_date || '');
    setLeadStage(client.lead_stage || client.stage || '');
    setLocationLink(client.location_link || client.document_location_link || '');
    setRemark(client.detailed_remark || '');
    
    const initialSelectedUsers = [];
    if (client.telecaller_name || client.assigned_to) {
      const assignedUser = users.find(user => user.name === client.telecaller_name || user.name === client.assigned_to);
      if (assignedUser) {
        initialSelectedUsers.push(assignedUser.user_id || assignedUser.id);
      } else if (client.assigned_to && typeof client.assigned_to === 'number') {
        const userById = users.find(user => user.user_id === client.assigned_to || user.id === client.assigned_to);
        if (userById) {
          initialSelectedUsers.push(userById.user_id || userById.id);
        }
      }
    }
    setSelectedUsers(initialSelectedUsers);
    
    try {
      const response = await axios.get(`${BASE_URL}api/documents/${client.master_id}`, { withCredentials: true });
      const images: DocItem[] = [];
      const documents: DocItem[] = [];
      const videos: DocItem[] = [];
      response.data.documents.forEach((doc: any) => {
        let filePath = doc.document_path.replace(/^server\//, '').replace(/\\/g, '/');
        if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;
        const fullUrl = `${BASE_URL}${filePath}`;
        const docObj: DocItem = { doc_id: doc.doc_id, url: fullUrl, link: doc.location_link, remark: doc.remark, document_type: doc.document_type };
        if (doc.document_type === 'image') images.push(docObj);
        else if (doc.document_type === 'video') videos.push(docObj);
        else documents.push(docObj);
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
    const validFiles = selectedFiles.filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return ['pdf', 'jpg', 'jpeg', 'png', 'dwg', 'doc', 'docx', 'xls', 'xlsx', 'mp4', 'mov', 'avi', 'mkv'].includes(ext);
    });
    if (validFiles.length !== selectedFiles.length) {
      alert('Only PDF, JPG, JPEG, PNG, DWG, DOC, DOCX, XLS, XLSX, MP4, MOV, AVI, MKV files are allowed!');
    }
    setUploadFiles(validFiles);
  };

  const handleUploadSubmit = async () => {
    if (!docsClient || uploadFiles.length === 0) {
      alert('Please select files to upload.');
      return;
    }
    const formData = new FormData();
    uploadFiles.forEach((file) => formData.append('files', file));
    if (locationLink) formData.append('location_link', locationLink);
    if (remark) formData.append('remark', remark);
    if (followupDate) formData.append('followup_date', followupDate);
    if (leadStage) formData.append('leadStage', leadStage);
    if (detailedRemark) formData.append('detailed_remark', detailedRemark);
    if (selectedUsers && selectedUsers.length > 0) {
      const assignedToString = selectedUsers.join(',');
      formData.append('assignedTo', assignedToString);
      selectedUsers.forEach((userId) => formData.append('assignedTo[]', userId));
    } else {
      formData.append('assignedTo', '');
    }
    
    try {
      const response = await axios.post(`${BASE_URL}api/upload/${docsClient.master_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      let successMsg = '✅ Files uploaded successfully!\n\n';
      if (response.data.summary) {
        const { summary } = response.data;
        successMsg += `📁 Files Uploaded: ${summary.files_uploaded}\n👥 Reassignments Added: ${summary.reassignments_added}\n`;
        if (summary.duplicates_skipped > 0) successMsg += `⚠️ Duplicates Skipped: ${summary.duplicates_skipped}\n`;
      }
      if (response.data.updated_fields) {
        const fields = response.data.updated_fields;
        successMsg += '\n📊 Updates:\n';
        if (fields.raw_data_followup_date) successMsg += '• Follow-up date updated\n';
        if (fields.raw_data_lead_stage) successMsg += '• Lead stage updated\n';
        if (fields.raw_data_detailed_remark) successMsg += '• Detailed remark updated\n';
        successMsg += fields.reassignments_created > 0 ? `• ${fields.reassignments_created} reassignment(s) created\n` : '• No reassignments created\n';
      }
      alert(successMsg);
      
      const refreshResponse = await axios.get(`${BASE_URL}api/documents/${docsClient.master_id}`, { withCredentials: true });
      const processFilePath = (filePath: string) => {
        filePath = filePath.replace(/^server\//, '').replace(/\\/g, '/');
        if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;
        return `${BASE_URL}${filePath}`;
      };
      const images: DocItem[] = [];
      const documents: DocItem[] = [];
      const videos: DocItem[] = [];
      refreshResponse.data.documents.forEach((doc: any) => {
        const docObj: DocItem = { doc_id: doc.doc_id, url: processFilePath(doc.document_path), link: doc.location_link, remark: doc.remark, document_type: doc.document_type };
        if (doc.document_type === 'image') images.push(docObj);
        else if (doc.document_type === 'video') videos.push(docObj);
        else documents.push(docObj);
      });
      setDocsData({ images, documents, videos });
      setUploadFiles([]);
      setLocationLink('');
      setRemark('');
      setDetailedRemark('');
      setFollowupDate('');
      setSelectedUsers([]);
      setLeadStage('');
      refreshDataWithPagePreservation();
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      alert(error.response?.data?.message || '❌ Error uploading files. Please check console for details.');
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return <FontAwesomeIcon icon={faFilePdf} className="text-red-500" />;
      case 'doc': case 'docx': return <FontAwesomeIcon icon={faFileWord} className="text-blue-500" />;
      case 'xls': case 'xlsx': return <FontAwesomeIcon icon={faFileExcel} className="text-green-500" />;
      case 'jpg': case 'jpeg': case 'png': case 'gif': return <FontAwesomeIcon icon={faFileImage} className="text-purple-500" />;
      case 'mp4': case 'mov': case 'avi': case 'mkv': return <FontAwesomeIcon icon={faVideo} className="text-red-500" />;
      default: return <FontAwesomeIcon icon={faFile} className="text-gray-500" />;
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
    try {
      const response = await axios.delete(`${BASE_URL}api/document/${docId}`, { withCredentials: true });
      if (response.data.success) {
        alert('✅ Document deleted successfully!');
        if (docsClient) {
          const refreshResponse = await axios.get(`${BASE_URL}api/documents/${docsClient.master_id}`, { withCredentials: true });
          const processFilePath = (filePath: string) => {
            filePath = filePath.replace(/^server\//, '').replace(/\\/g, '/');
            if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;
            return `${BASE_URL}${filePath}`;
          };
          const images: DocItem[] = [];
          const documents: DocItem[] = [];
          const videos: DocItem[] = [];
          refreshResponse.data.documents.forEach((doc: any) => {
            const docObj: DocItem = { doc_id: doc.doc_id, url: processFilePath(doc.document_path), link: doc.location_link, remark: doc.remark, document_type: doc.document_type };
            if (doc.document_type === 'image') images.push(docObj);
            else if (doc.document_type === 'video') videos.push(docObj);
            else documents.push(docObj);
          });
          setDocsData({ images, documents, videos });
        }
      } else {
        alert('❌ Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('❌ Error deleting document. Please try again.');
    }
  };

  const Loader = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium text-lg">Loading call list data...</p>
    </div>
  );


  // Simplified renderDetailsModal (you can keep your full implementation)
  const renderDetailsModal = () => {
    if (!selectedClientDetails) return null;
    // Your existing renderDetailsModal implementation here
    return null;
  };

  // JSX Return (your existing JSX structure)
  return (
    <div className="p-4">
      {/* Your existing JSX here - make sure all fetchTaleCallerData() calls are replaced with refreshDataWithPagePreservation() */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-32">
              <input
                type="number"
                className="w-full pl-8 pr-7 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Show N"
                value={customRecordCount}
                onChange={handleCustomRecordInput}
                min="1"
              />
              {customRecordCount && (
                <button onClick={clearCustomRecordCount} className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="relative w-64">
              <input
                type="text"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Search name, category, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={clearFilters} className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap min-w-[100px] justify-center">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filter
              </button>

              <button onClick={() => setShowAddPopup(true)} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap min-w-[100px] justify-center">
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                Add New
              </button>

              <button
                onClick={() => {
                  if (selectedMasterIds.length === 0) {
                    alert('Please select at least one record to assign/reassign');
                    return;
                  }
                  setShowAssignPopup(true);
                }}
                disabled={selectedMasterIds.length === 0}
                className={`bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap min-w-[120px] justify-center ${selectedMasterIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-green-800'
                  }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-6a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
                </svg>
                {selectedMasterIds.length > 1 ? `Reassign (${selectedMasterIds.length})` : 'ReAssign'}
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* ✅ TOP PAGINATION - Added here below header */}
      {!isLoading && totalItems > 0 && (
        <div className="mb-4" key={topPaginationKey}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              handlePageChange(page);
              setTopPaginationKey(prev => prev + 1);
            }}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            showingStart={showingStart}
            showingEnd={showingEnd}
          />
        </div>
      )}
      
      {/* Table and other JSX content - keep your existing table structure */}
      <div className="max-w-full overflow-auto rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-meta-4 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="py-5 px-4">
                    <input
                      type="checkbox"
                      checked={(() => {
                        const currentEntries = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                        return currentEntries.length > 0 && currentEntries.every((client) => selectedClients.includes(client.master_id));
                      })()}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const currentEntries = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                        const currentIds = currentEntries.map((client) => client.master_id);
                        if (isChecked) {
                          setSelectedClients((prev) => {
                            const combined = [...prev, ...currentIds];
                            return combined.filter((id, index) => combined.indexOf(id) === index);
                          });
                          setSelectedMasterIds((prev) => {
                            const combined = [...prev, ...currentIds];
                            return combined.filter((id, index) => combined.indexOf(id) === index);
                          });
                        } else {
                          setSelectedClients((prev) => prev.filter((id) => !currentIds.includes(id)));
                          setSelectedMasterIds((prev) => prev.filter((id) => !currentIds.includes(id)));
                        }
                      }}
                      className="h-4.5 w-4.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-boxdark"
                    />
                  </th>
                  <th className="py-5 px-4 relative">
                    <div ref={entryDateRef} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Entry Date</span>
                      <button onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowEntryDateCalendar(!showEntryDateCalendar); }} className="text-gray-500 hover:text-blue-600">
                        <FontAwesomeIcon icon={faChevronDown} className={`h-3 w-3 transition-transform duration-200 ${showEntryDateCalendar ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {showEntryDateCalendar && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">Select Entry Date Range</span>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedEntryFromDate(''); setSelectedEntryToDate(''); applyFilters(); setShowEntryDateCalendar(false); }} className="text-xs font-medium text-blue-600 hover:text-blue-800">Clear</button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">From Date</label>
                            <input type="date" value={selectedEntryFromDate} onChange={(e) => setSelectedEntryFromDate(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">To Date</label>
                            <input type="date" value={selectedEntryToDate} onChange={(e) => setSelectedEntryToDate(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <button onClick={(e) => { e.stopPropagation(); applyFilters(); setShowEntryDateCalendar(false); }} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg">Apply Filter</button>
                        </div>
                      </div>
                    )}
                  </th>
                  <th className="py-5 px-4 relative">
                    <div ref={followupDateRef} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">FollowUp Date</span>
                      <button onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowFollowupDateCalendar(!showFollowupDateCalendar); }} className="text-gray-500 hover:text-blue-600">
                        <FontAwesomeIcon icon={faChevronDown} className={`h-3 w-3 transition-transform duration-200 ${showFollowupDateCalendar ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {showFollowupDateCalendar && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">Select Followup Date Range</span>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedFollowupFromDate(''); setSelectedFollowupToDate(''); applyFilters(); setShowFollowupDateCalendar(false); }} className="text-xs font-medium text-blue-600 hover:text-blue-800">Clear</button>
                        </div>
                        <div className="space-y-3">
                          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">From Date</label><input type="date" value={selectedFollowupFromDate} onChange={(e) => setSelectedFollowupFromDate(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white" /></div>
                          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">To Date</label><input type="date" value={selectedFollowupToDate} onChange={(e) => setSelectedFollowupToDate(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white" /></div>
                        </div>
                        <div className="mt-4"><button onClick={(e) => { e.stopPropagation(); applyFilters(); setShowFollowupDateCalendar(false); }} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg">Apply Filter</button></div>
                      </div>
                    )}
                  </th>
                  <th className="py-5 px-4"><div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Client Name</div></th>
                  <th className="py-5 px-4"><div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Contact</div></th>
                  <th className="py-5 px-4 relative">
                    <div ref={cityFilterRef} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">City</span>
                      <button onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowCityFilter(!showCityFilter); }} className="text-gray-500 hover:text-blue-600">
                        <FontAwesomeIcon icon={faFilter} className={`h-3 w-3 transition-colors duration-200 ${selectedCities.length > 0 ? 'text-blue-600' : ''}`} />
                      </button>
                    </div>
                    {showCityFilter && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3"><span className="font-semibold text-sm dark:text-white">Filter Cities</span><button onClick={() => { setSelectedCities([]); setShowCityFilter(false); }} className="text-xs font-medium text-blue-600">Clear All</button></div>
                        {availableCities.map((city) => (<div key={city} className="flex items-center mb-2"><input type="checkbox" id={`city-${city}`} checked={selectedCities.includes(city)} onChange={() => handleCitySelect(city)} className="h-3.5 w-3.5 mr-2.5 text-blue-600 rounded" /><label htmlFor={`city-${city}`} className="text-sm font-medium dark:text-white cursor-pointer">{city}</label></div>))}
                      </div>
                    )}
                  </th>
                  <th className="py-5 px-2"><div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Status</div></th>
                  <th className="py-5 px-4 relative">
                    <div ref={userFilterRef} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">User Assign</span>
                      <button onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowUserFilter(!showUserFilter); }} className="text-gray-500 hover:text-blue-600">
                        <FontAwesomeIcon icon={faFilter} className={`h-3 w-3 transition-colors duration-200 ${selectedUsers.length > 0 ? 'text-blue-600' : ''}`} />
                      </button>
                    </div>
                    {showUserFilter && (
                      <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[220px] max-h-[300px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3"><span className="font-semibold text-sm dark:text-white">Filter Users</span><button onClick={() => { setSelectedUsers([]); setShowUserFilter(false); }} className="text-xs font-medium text-blue-600">Clear All</button></div>
                        {users.map((user) => (<div key={user.id} className="flex items-center mb-2"><input type="checkbox" id={`user-${user.id}`} checked={selectedUsers.includes(user.name)} onChange={() => handleUserSelect(user.name)} className="h-3.5 w-3.5 mr-2.5 text-blue-600 rounded" /><label htmlFor={`user-${user.id}`} className="text-sm font-medium dark:text-white cursor-pointer">{user.name} ({user.role})</label></div>))}
                      </div>
                    )}
                  </th>
                  <th className="py-5 px-4 relative">
                    <div ref={stageFilterRef} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Stage</span>
                      <button onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowStageFilter(!showStageFilter); }} className="text-gray-500 hover:text-blue-600">
                        <FontAwesomeIcon icon={faFilter} className={`h-3 w-3 transition-colors duration-200 ${selectedStages.length > 0 ? 'text-blue-600' : ''}`} />
                      </button>
                    </div>
                    {showStageFilter && (
                      <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[220px] max-h-[300px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3"><span className="font-semibold text-sm dark:text-white">Filter Stages</span><button onClick={() => { setSelectedStages([]); setShowStageFilter(false); }} className="text-xs font-medium text-blue-600">Clear All</button></div>
                        {leadStages.map((stage) => (<div key={stage} className="flex items-center mb-2"><input type="checkbox" id={`stage-${stage}`} checked={selectedStages.includes(stage)} onChange={() => handleStageSelect(stage)} className="h-3.5 w-3.5 mr-2.5 text-blue-600 rounded" /><label htmlFor={`stage-${stage}`} className="text-sm font-medium dark:text-white cursor-pointer">{stage}</label></div>))}
                      </div>
                    )}
                  </th>
                  <th className="py-5 px-4"><div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Remark</div></th>
                  <th className="py-5 px-4"><div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Actions</div></th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((client, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <input type="checkbox" checked={selectedClients.includes(client.master_id)} onChange={() => { const clientId = client.master_id; setSelectedClients(prev => prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]); setSelectedMasterIds(prev => prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]); }} className="h-4.5 w-4.5 text-blue-600 rounded" />
                    </td>
                    <td className="py-4 px-4"><div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg">{client.assign_date ? new Date(client.assign_date).toLocaleDateString('en-GB') : '—'}</div></td>
                    <td className="py-4 px-4"><div className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm border shadow-sm ${client.followup_date && new Date(client.followup_date) < new Date() ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 text-red-800 dark:text-red-300' : 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 text-green-800 dark:text-green-300'}`}>{client.followup_date ? new Date(client.followup_date).toLocaleDateString('en-GB') : '—'}</div></td>
                    <td className="py-4 px-4"><div onClick={() => { setSelectedClientDetails(client); setShowDetailsModal(true); }} className="group cursor-pointer"><div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600">{client.name}</div></div></td>
                    <td className="py-4 px-4"><div className="text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-300 px-3 py-1.5 rounded-lg font-mono">{client.number || '—'}</div></td>
                    <td className="py-4 px-4"><div className="text-sm font-bold text-gray-900 dark:text-gray-100">{client.city || '—'}</div></td>
                    <td className="py-4 px-2"><ProgressStatus stage={client.stage || client.lead_stage} status_percentage={client.status_percentage} is_drop_stage={client.is_drop_stage} previous_stage={client.previous_stage} /></td>
                    <td className="py-4 px-4"><div className="text-sm font-semibold bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-lg text-center">{client.telecaller_name || '—'}</div></td>
                    <td className="py-4 px-4"><div className="text-xs font-semibold bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 text-orange-800 dark:text-orange-300 px-3 py-1.5 rounded-lg text-center">{client.stage || 'N/A'}</div></td>
                    <td className="py-4 px-4"><span onClick={() => handleShowRemark(client.detailed_remark)} className="inline-flex cursor-pointer rounded-full py-1.5 px-3.5 text-sm font-semibold border shadow-sm truncate max-w-[220px] bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/20 text-slate-800 dark:text-slate-300">{client.detailed_remark?.substring(0, 20) || '—'}{client.detailed_remark && client.detailed_remark.length > 20 && '...'}</span></td>
                    <td className="py-4 px-4"><div className="flex justify-center gap-1"><ActionButton onClick={() => handleEditClick(client)} title="Edit" variant="edit" className="w-8 h-8"><FontAwesomeIcon icon={faEdit} className="text-xs" /></ActionButton><ActionButton onClick={() => handleFileIconClick(client)} title="Upload/View Files" variant="document" badgeCount={client.document_count} className="w-8 h-8"><FontAwesomeIcon icon={faFileUpload} className="text-xs" /></ActionButton><ActionButton onClick={() => handleViewOnlyDocuments(client)} title="View Documents" variant="viewDocs" badgeCount={client.document_count} className="w-8 h-8"><FontAwesomeIcon icon={faFolderOpen} className="text-xs" /></ActionButton></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* Modals - keep your existing modal implementations */}
      {showDetailsModal && renderDetailsModal()}
      
      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-2xl mt-20 max-h-[85vh] overflow-y-auto dark:border-strokedark dark:bg-boxdark">
            <EditTeleCallerForm data={selectedClient} onClose={handleModalClose} onUpdate={refreshDataWithPagePreservation} />
          </div>
        </div>
      )}

      {showEditPopup && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-2xl mt-20 max-h-[85vh] overflow-y-auto dark:border-strokedark dark:bg-boxdark">
            <EditRawDataForm showEditPopup={showEditPopup} editingClient={editingClient} setEditingClient={setEditingClient} closeEditPopup={closeEditPopup} fetchRawData={refreshDataWithPagePreservation} categories={categories} references={references} area={area} />
          </div>
        </div>
      )}

      {/* <InsertDataModal showAddPopup={showAddPopup} setShowAddPopup={setShowAddPopup} singleFormData={singleFormData} setSingleFormData={setSingleFormData} categories={categories} references={references} area={area} fetchRawData={refreshDataWithPagePreservation} setError={setError} setDuplicateEntries={setDuplicateEntries} setShowDuplicateModal={setShowDuplicateModal} /> */}


<InsertDataModal
  showAddPopup={showAddPopup}
  setShowAddPopup={setShowAddPopup}
  singleFormData={singleFormData}
  setSingleFormData={setSingleFormData}
  categories={categories}
  references={references}
  area={area}
  fetchRawData={refreshDataWithPagePreservation} // ← CHANGE THIS LINE
  setError={setError}
  setDuplicateEntries={setDuplicateEntries}
  setShowDuplicateModal={setShowDuplicateModal}
/>



      {showAssignPopup && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex justify-center items-center">
          <div className="bg-white dark:bg-boxdark p-3 rounded-lg shadow-lg w-full max-w-2xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4"><h2 className="text-lg font-semibold text-black dark:text-white">Assign Selected Records ({selectedMasterIds.length})</h2><button onClick={() => setShowAssignPopup(false)} className="text-xl text-gray-500 hover:text-red-500">×</button></div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!assignData.assignedTo.length || !assignData.leadStage || !assignData.reassignmentDate) { alert('Please fill all required fields'); return; }
              try {
                const requests = selectedMasterIds.map((master_id) => fetch(`${BASE_URL}api/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ master_id, assignedTo: assignData.assignedTo, leadStage: assignData.leadStage, remark: assignData.remark, reassignment_date: assignData.reassignmentDate, followup_date: assignData.reassignmentDate }) }));
                const responses = await Promise.all(requests);
                const results = await Promise.all(responses.map(r => r.json()));
                let inserted = 0, skipped = 0;
                results.forEach(r => { inserted += r.inserted_count || 0; skipped += r.skipped_count || 0; });
                alert(`✅ Assignment completed\nInserted: ${inserted}\nSkipped: ${skipped}`);
                setAssignData({ assignedTo: [], leadStage: '', remark: '', reassignmentDate: new Date().toISOString().split('T')[0] });
                setSelectedMasterIds([]); setSelectedClients([]); setShowAssignPopup(false);
                refreshDataWithPagePreservation();
              } catch (err) { console.error(err); alert('❌ Submission failed'); }
            }} className="space-y-4">
              <div><label className="block font-semibold text-green-600 mb-2">Assign To</label>
                <div className="border rounded p-2 max-h-48 overflow-y-auto">
                  {assignUsers.map((user) => (<label key={user.user_id || user.id} className="flex gap-2 p-2 rounded cursor-pointer"><input type="checkbox" checked={assignData.assignedTo.includes(user.name)} onChange={() => setAssignData(prev => ({ ...prev, assignedTo: prev.assignedTo.includes(user.name) ? prev.assignedTo.filter(u => u !== user.name) : [...prev.assignedTo, user.name] }))} /><div className="text-xs"><div className="font-medium">{user.name}</div><div className="text-gray-500 text-[10px]">{user.role_label || user.role}</div></div></label>))}
                </div>
                <p className="text-sm text-blue-600 mt-1">Selected: {assignData.assignedTo.length}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block mb-1 text-sm font-medium">Lead Stage *</label><select name="leadStage" value={assignData.leadStage} onChange={handleChange} required className="w-full border rounded p-2"><option value="">Select Lead Stage</option>{leadStages.map((stage, i) => (<option key={i} value={stage}>{stage}</option>))}</select></div>
                <div><label className="block mb-1 text-sm font-medium">Followup Date *</label><input type="date" name="reassignmentDate" value={assignData.reassignmentDate} onChange={handleChange} required className="w-full border rounded p-2" /></div>
              </div>
              <div><label className="block font-medium mb-1">Remark</label><textarea rows={3} value={assignData.remark} onChange={(e) => setAssignData({ ...assignData, remark: e.target.value })} className="w-full border rounded p-2" /></div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowAssignPopup(false)} className="px-4 py-2 rounded border">Cancel</button><button type="submit" disabled={!assignData.assignedTo.length || !assignData.leadStage || !assignData.reassignmentDate} className="px-5 py-2 rounded bg-green-600 text-white disabled:opacity-50">Assign</button></div>
            </form>
          </div>
        </div>
      )}

      {openRemark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow-lg max-w-lg w-full"><h2 className="text-lg font-bold mb-3">Full Remark</h2><p className="text-gray-800 dark:text-gray-300 whitespace-pre-line">{openRemark}</p><button className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" onClick={() => setOpenRemark(null)}>Close</button></div>
        </div>
      )}
    </div>
  );
};

export default CallList;