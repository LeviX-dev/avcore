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
  faUser
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

interface MissedLead {
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
  editingClient: MissedLead | null;
  setEditingClient: React.Dispatch<React.SetStateAction<MissedLead | null>>;
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
  url: string;
  link?: string | null;
  remark?: string | null;
}

// ActionButton Component
const ActionButton = ({ 
  children, 
  onClick, 
  title, 
  className = "",
  variant = "view",
  badgeCount = null
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  title: string; 
  className?: string;
  variant?: "call" | "edit" | "document" | "view";
  badgeCount?: number | null;
}) => {
  const baseStyles = "relative inline-flex items-center justify-center rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl";
  
  const variantStyles = {
    call: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white",
    edit: "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white",
    document: "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white",
    view: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
  };

  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${className}`;
  
  return (
    <button
      onClick={onClick}
      className={buttonStyles}
      title={title}
    >
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
  'Demo': 50,
  'Quotation Pending': 60,
  'Quotation Follow-up': 70,
  'Post Site Visit': 80,
  'Projection List': 90,
  'Drop': -1,
  'Closed Deal': 100
};

// BatteryStatus Component
const BatteryStatus: React.FC<{ 
  stage: string; 
  status_percentage?: number;
  is_drop_stage?: boolean;
  previous_stage?: string;
}> = ({ stage, status_percentage = 0, is_drop_stage = false, previous_stage = '' }) => {
  
  const cleanStage = stage ? stage.trim() : '';
  const percentage = status_percentage;
  
  const getBatteryColor = (percent: number) => {
    if (percent <= 20) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (percent <= 50) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (percent <= 80) return 'bg-gradient-to-r from-blue-500 to-blue-600';
    return 'bg-gradient-to-r from-green-500 to-green-600';
  };

  const getTextColor = (_percent?: number) => {
    return 'text-black dark:text-white';
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-5 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center p-0.5 bg-gray-50 dark:bg-gray-800">
        <div 
          className={`h-3 rounded-md ${getBatteryColor(percentage)} transition-all duration-300`}
          style={{ width: `${Math.max(10, percentage)}%` }}
        />
        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-2 bg-gray-400 dark:bg-gray-600 rounded-r" />
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold z-10 ${getTextColor()}`}>
          {is_drop_stage ? `❌ ${percentage}%` : `${percentage}%`}
        </span>
      </div>
      <div className="text-[10px] mt-0.5 text-gray-500 dark:text-gray-400 truncate max-w-[70px] text-center">
        <div className="truncate" title={cleanStage || 'N/A'}>
          {cleanStage || 'N/A'}
        </div>
        {is_drop_stage && previous_stage && (
          <div className="text-[8px] text-gray-400 italic" title={`Was previously: ${previous_stage}`}>
            (was {previous_stage})
          </div>
        )}
      </div>
    </div>
  );
};

const Followup: React.FC = () => {
  // State declarations
  const [missedLeads, setMissedLeads] = useState<MissedLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<MissedLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<MissedLead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<MissedLead | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [area, setArea] = useState<Area[]>([]);
  
  // Document upload/view states
  const [docsClient, setDocsClient] = useState<MissedLead | null>(null);
  const [docsData, setDocsData] = useState<DocumentData>({ 
    images: [], 
    documents: [], 
    videos: [] 
  });
  const [showDocsPopup, setShowDocsPopup] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState<'image' | 'documents' | 'video'>('documents');
  const [locationLink, setLocationLink] = useState('');
  const [remark, setRemark] = useState("");
  const [followupDate, setFollowupDate] = useState('');
  const [leadStage, setLeadStage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [leadStages, setLeadStages] = useState<string[]>([]);
  
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
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<MissedLead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Add refreshTrigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Refs for click outside detection
  const entryDateRef = useRef<HTMLDivElement>(null);
  const followupDateRef = useRef<HTMLDivElement>(null);
  const stageFilterRef = useRef<HTMLDivElement>(null);
  const userFilterRef = useRef<HTMLDivElement>(null);
  const cityFilterRef = useRef<HTMLDivElement>(null); 


  // Add these state variables near your other state declarations (around line ~200)
const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
const [selectedMasterIds, setSelectedMasterIds] = useState<number[]>([]);
const [showAssignPopup, setShowAssignPopup] = useState(false);
const [assignData, setAssignData] = useState({
  assignedTo: [] as string[],
  leadStage: '',
  remark: '',
  reassignmentDate: new Date().toISOString().split('T')[0],
});


const handleAssignChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
) => {
  const { name, value } = e.target;
  setAssignData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  // Fetch missed leads
  const fetchMissedLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/dashboard/miss-assign-fulldata`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
          withCredentials: true,
        }
      );

      const data = response.data;

      if (data.success) {
        const missedLeadsArray = data.missedLeads || [];
        
        // Create an object to track the last non-Drop stage for each client
        const lastNonDropStages: Record<number, string> = {};
        
        // First pass: Identify and store last non-Drop stages for all clients
        missedLeadsArray.forEach((item: any) => {
          const clientId = item.master_id;
          const currentStage = item.lead_stage || item.latest_leadStage || item.current_stage || '';
          const cleanStage = currentStage ? currentStage.trim() : '';
          
          if (cleanStage && cleanStage !== 'Drop') {
            lastNonDropStages[clientId] = cleanStage;
          }
        });

        const parseValue = (value: any) => {
          if (value === 'Not Available' || value === null || value === undefined || value === '') {
            return '';
          }
          return value;
        };

        const parseIdValue = (value: any) => {
          if (value === 'Not Available' || value === null || value === undefined) {
            return '';
          }
          return isNaN(value) ? value : Number(value);
        };

        const processedData = missedLeadsArray.map((item: any) => {
          const currentStage = parseValue(item.lead_stage || item.latest_leadStage || item.current_stage);
          const cleanStage = currentStage ? currentStage.trim() : '';
          
          // Get the last non-Drop stage for this client
          let previousStage = lastNonDropStages[item.master_id] || '';
          
          // Special handling for Drop stage
          if (cleanStage === 'Drop' && !previousStage) {
            // Try to infer from other fields
            if (item.quotation_date || item.site_visit_date) {
              previousStage = 'Quotation Pending';
            } else if (item.demo_date) {
              previousStage = 'Demo';
            } else {
              previousStage = 'Positive Lead';
            }
          }
          
          // Calculate percentage based on stage (for Drop, use previous stage)
          const stageForPercentage = cleanStage === 'Drop' ? previousStage : cleanStage;
          const status_percentage = stageForPercentage ? 
            (STAGE_PERCENTAGE_MAP[stageForPercentage] || 0) : 0;

          // Process reassignment_remarks
          let reassignmentRemarks = [];
          if (item.reassignment_remarks) {
            if (Array.isArray(item.reassignment_remarks)) {
              reassignmentRemarks = item.reassignment_remarks.map((remark: any) => {
                if (typeof remark === 'string') {
                  return remark;
                } else if (remark && typeof remark === 'object') {
                  return {
                    remark: remark.remark || '',
                    created_by_user: remark.created_by_user || 0,
                    created_at: remark.created_at || '',
                    name: remark.name || '',
                    role: remark.role || '',
                    assignedTo: remark.assignedTo || '',
                    leadStage: remark.leadStage || '',
                    reassignment_date: remark.reassignment_date || ''
                  };
                }
                return '';
              });
            } else if (typeof item.reassignment_remarks === 'string') {
              try {
                const parsedRemarks = JSON.parse(item.reassignment_remarks);
                if (Array.isArray(parsedRemarks)) {
                  reassignmentRemarks = parsedRemarks;
                }
              } catch (e) {
                reassignmentRemarks = [item.reassignment_remarks];
              }
            }
          }

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
            followup_date: parseValue(item.followup_date),
            assign_date: parseValue(item.assign_date),
            assigned_to: parseValue(item.reassigned_to || item.assigned_user_name),
            assigned_user_name: parseValue(item.reassigned_to || item.assigned_user_name),
            reassignment_id: parseIdValue(item.reassignment_id),
            reassignment_date: parseValue(item.reassignment_date),
            reassigned_to: parseValue(item.reassigned_to),
            telecaller_name: parseValue(item.reassigned_to || item.assigned_user_name),
            document_count: item.document_count || 0,
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
            is_drop_stage: cleanStage === 'Drop',
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
          (a: MissedLead, b: MissedLead) => b.master_id - a.master_id,
        );

        setMissedLeads(sortedData);
        setFilteredLeads(sortedData);
        setTotalLeads(data.total || 0);
        
        // Extract unique cities
        const cities = sortedData
          .map(lead => lead.city?.trim())
          .filter(city => city && city !== '' && city !== 'Not Available' && city !== 'N/A')
          .filter((city, index, self) => self.indexOf(city) === index)
          .sort() as string[];
        setAvailableCities(cities);
        
      } else {
        console.error('Error fetching missed leads:', data);
        setMissedLeads([]);
        setFilteredLeads([]);
        setTotalLeads(0);
      }
    } catch (error) {
      console.error('Error fetching missed leads:', error);
      setMissedLeads([]);
      setFilteredLeads([]);
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

  // Apply filters function
  const applyFilters = () => {
    let filtered = [...missedLeads];
    const lowerSearch = searchTerm.toLowerCase();

    // Apply Search Term Filter
    if (searchTerm) {
      filtered = filtered.filter((lead) => {
        const searchFields = [
          lead.name?.toLowerCase() || '',
          lead.number?.toString() || '',
          lead.email?.toLowerCase() || '',
          lead.address?.toLowerCase() || '',
          lead.area?.toLowerCase() || '',
          lead.cat_name?.toLowerCase() || '',
          lead.master_id?.toString() || '',
          lead.status?.toLowerCase() || '',
          lead.assigned_to?.toLowerCase() || '',
          lead.city?.toLowerCase() || '',
          lead.lead_stage?.toLowerCase() || '',
          lead.telecaller_name?.toLowerCase() || '',
        ];
        return searchFields.some(field => field.includes(lowerSearch));
      });
    }

    // Apply Entry Date Range Filter
    if (selectedEntryFromDate || selectedEntryToDate) {
      filtered = filtered.filter(lead => {
        if (!lead.assign_date) return false;
        
        const leadDate = new Date(lead.assign_date);
        
        if (isNaN(leadDate.getTime())) return false;
        
        let fromDateValid = true;
        let toDateValid = true;
        
        if (selectedEntryFromDate) {
          const fromDate = new Date(selectedEntryFromDate);
          fromDateValid = leadDate >= fromDate;
        }
        
        if (selectedEntryToDate) {
          const toDate = new Date(selectedEntryToDate);
          toDateValid = leadDate <= toDate;
        }
        
        return fromDateValid && toDateValid;
      });
    }

    // Apply Followup Date Range Filter
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

    // Apply Stage Filter
    if (selectedStages.length > 0) {
      filtered = filtered.filter(lead => 
        lead.lead_stage && selectedStages.includes(lead.lead_stage)
      );
    }

    // Apply Assigned User Filter
    if (selectedUsersFilter.length > 0) {
      filtered = filtered.filter(lead => 
        lead.assigned_to && selectedUsersFilter.includes(lead.assigned_to)
      );
    }

    // Apply City Filter
    if (selectedCities.length > 0) {
      filtered = filtered.filter(lead => 
        lead.city && selectedCities.includes(lead.city)
      );
    }

    setFilteredLeads(filtered);
    setCurrentPage(1);
  };

  // Apply filters when any filter changes
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
    missedLeads
  ]);

  // Handle custom record count
  useEffect(() => {
    if (customRecordCount && typeof customRecordCount === 'number' && customRecordCount > 0) {
      const limitedLeads = missedLeads.slice(0, customRecordCount);
      setFilteredLeads(limitedLeads);
      setCurrentPage(1);
      setItemsPerPage(customRecordCount);
    } else {
      applyFilters();
      setItemsPerPage(10);
    }
  }, [customRecordCount, missedLeads]);

  // Filter user search
  useEffect(() => {
    if (searchUserTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchUserTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(term) || 
        (user.role && user.role.toLowerCase().includes(term))
      );
      setFilteredUsers(filtered);
    }
  }, [searchUserTerm, users]);

  // Filter handlers
  const handleStageSelect = (stage: string) => {
    setSelectedStages(prev => 
      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
    );
  };

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
    setSelectedEntryFromDate('');
    setSelectedEntryToDate('');
    setSelectedFollowupFromDate('');
    setSelectedFollowupToDate('');
    setSelectedStages([]);
    setSelectedUsersFilter([]);
    setSelectedCities([]);
    
    setShowEntryDateCalendar(false);
    setShowFollowupDateCalendar(false);
    setShowStageFilter(false);
    setShowUserFilter(false);
    setShowCityFilter(false);
    
    setFilteredLeads(missedLeads);
    setCurrentPage(1);
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
  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

  const showingStart = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const showingEnd = Math.min(indexOfLastItem, totalItems);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchMissedLeads();
    fetchCategories();
    fetchReferences();
    fetchArea();
    fetchUsers();
    fetchLeadStages();
  }, [refreshTrigger, currentPage]);

  // Call functionality
  const handleEdit = (lead: MissedLead) => {
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
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Edit functionality
  const handleEditClick = (lead: MissedLead) => {
    setEditingClient(lead);
    setShowEditPopup(true);
  };

  const closeEditPopup = () => {
    setEditingClient(null);
    setShowEditPopup(false);
  };

  const fetchDataAgain = async () => {
    await fetchMissedLeads();
  };

  // File upload/view functionality
  const handleFileIconClick = async (lead: MissedLead) => {
    setDocsClient(lead);
    
    // Reset form fields
    setFollowupDate("");
    setSelectedUsers([]);
    setLeadStage("");
    setLocationLink("");
    setRemark("");

    try {
      const response = await axios.get(
        `${BASE_URL}api/documents/${lead.master_id}`,
        { withCredentials: true }
      );

      const images: DocItem[] = [];
      const documents: DocItem[] = [];
      const videos: DocItem[] = [];

      response.data.documents.forEach((doc: any) => {
        let filePath = doc.document_path;
        filePath = filePath.replace(/^server\//, '').replace(/\\/g, '/');
        if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;
        
        const fullUrl = `${BASE_URL}${filePath}`;
        
        const docObj = {
          url: fullUrl,
          link: doc.location_link,
          remark: doc.remark
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
    const validFiles = selectedFiles.filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return ['pdf','jpg','jpeg','png','dwg','doc','docx','xls','xlsx','mp4','mov','avi','mkv'].includes(ext);
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
    
    // Add files
    uploadFiles.forEach((file) => {
      formData.append('files', file);
    });
    
    // Add additional fields
    if (locationLink) formData.append("location_link", locationLink);
    if (remark) formData.append("remark", remark);
    if (followupDate) formData.append("followup_date", followupDate);
    if (leadStage) formData.append("leadStage", leadStage);
    
    // CRITICAL FIX: Ensure assignedTo is always sent, even if empty array
    if (selectedUsers && selectedUsers.length > 0) {
      selectedUsers.forEach(userId => {
        formData.append("assignedTo[]", userId);
      });
    } else {
      // Send empty array to avoid undefined
      formData.append("assignedTo[]", "");
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
        if (fields.followup_date) successMsg += '• Follow-up date updated\n';
        if (fields.lead_stage) successMsg += '• Lead stage updated\n';
        if (fields.detailed_remark) successMsg += '• Remarks updated\n';
        if (fields.reassignment_count > 0) {
          successMsg += `• Reassigned to ${fields.reassignment_count} user(s)\n`;
        } else {
          successMsg += '• No reassignments added (check if users were selected)\n';
        }
      }

      alert(successMsg);

      // Refresh document list
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
        const docObj = {
          url: processFilePath(doc.document_path),
          link: doc.location_link,
          remark: doc.remark
        };

        if (doc.document_type === "image") images.push(docObj);
        else if (doc.document_type === "video") videos.push(docObj);
        else documents.push(docObj);
      });

      // Update state
      setDocsData({ images, documents, videos });
      
      // Clear the form
      setUploadFiles([]);
      setLocationLink("");
      setRemark("");
      setFollowupDate("");
      setSelectedUsers([]);
      setLeadStage("");

      // Refresh the main table data
      setRefreshTrigger(prev => prev + 1);

    } catch (error: any) {
      console.error("❌ Upload error:", error);
      
      if (error.response?.data?.message) {
        alert(`❌ Upload failed: ${error.response.data.message}`);
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
        return <FontAwesomeIcon icon={faFileExcel} className="text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FontAwesomeIcon icon={faFileImage} className="text-purple-500" />;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return <FontAwesomeIcon icon={faVideo} className="text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faFile} className="text-gray-500" />;
    }
  };

  // Detail modal render function
  const renderDetailsModal = () => {
    if (!selectedLeadDetails) return null;

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
                      {selectedLeadDetails.name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1 flex-wrap">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        ID: {selectedLeadDetails.master_id}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
                        {selectedLeadDetails.assign_date}
                      </span>
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
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-blue-500" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                    <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                      {selectedLeadDetails.number || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
                    <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                      {selectedLeadDetails.email || 'N/A'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</div>
                    <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                      {selectedLeadDetails.address || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead & Stage Info */}
              <div className="grid grid-cols-2 gap-4">
                {/* Lead Details */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-blue-500" />
                    Lead Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Category</div>
                      <div className="font-medium text-black dark:text-white truncate">
                        {selectedLeadDetails.cat_name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Reference</div>
                      <div className="font-medium text-black dark:text-white truncate">
                        {selectedLeadDetails.reference_name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Area</div>
                      <div className="font-medium text-black dark:text-white truncate">
                        {selectedLeadDetails.area || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage & Assignment */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-purple-500" />
                    Stage & Assignment
                  </h3>
                  <div className="space-y-2"> 
                    
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Current Stage</div>
                      <div className="font-medium text-black dark:text-white">
                        {selectedLeadDetails.lead_stage || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Assigned To</div>
                      <div className="font-medium text-black dark:text-white truncate">
                        {selectedLeadDetails.assigned_to || selectedLeadDetails.telecaller_name || 'Unassigned'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Call Status</div>
                      <div className="font-medium text-black dark:text-white">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedLeadDetails.quick_remark === "Interested" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                          selectedLeadDetails.quick_remark === "Not Interested" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                          selectedLeadDetails.quick_remark === "Not Reachable" ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" :
                          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}>
                          {selectedLeadDetails.quick_remark || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-green-500" />
                    Entry Date
                  </h3>
                  <div className="font-medium text-lg text-black dark:text-white text-center">
                    {selectedLeadDetails.assign_date || 'N/A'}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-orange-500" />
                    Follow-up Date
                  </h3>
                  <div className={`font-medium text-lg text-center ${
                    selectedLeadDetails.followup_date && new Date(selectedLeadDetails.followup_date) < new Date()
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {selectedLeadDetails.followup_date || 'N/A'}
                  </div>
                </div>
              </div>

              {/* City & Location */}
              {selectedLeadDetails.city && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-3 rounded-lg border border-teal-100 dark:border-teal-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-teal-500" />
                    Location
                  </h3>
                  <div className="text-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">City</div>
                        <div className="font-medium text-black dark:text-white">
                          {selectedLeadDetails.city}
                        </div>
                      </div>
                      {selectedLeadDetails.location_link && (
                        <a
                          href={selectedLeadDetails.location_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
                          View on Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {(selectedLeadDetails.detailed_remark || selectedLeadDetails.quick_remark) && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-gray-500" />
                    Remarks
                  </h3>
                  <div className="text-sm text-black dark:text-white bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                    {selectedLeadDetails.detailed_remark || selectedLeadDetails.quick_remark}
                  </div>
                </div>
              )}

              {/* Project Details (if any) */}
              {(selectedLeadDetails.room_length || selectedLeadDetails.p_type || selectedLeadDetails.budget_range) && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFile} className="h-4 w-4 text-amber-500" />
                    Project Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedLeadDetails.room_length && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Room Size</div>
                        <div className="font-medium text-black dark:text-white">
                          {selectedLeadDetails.room_length} × {selectedLeadDetails.room_width || 'N/A'}
                        </div>
                      </div>
                    )}
                    {selectedLeadDetails.p_type && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
                        <div className="font-medium text-black dark:text-white truncate">
                          {selectedLeadDetails.p_type}
                        </div>
                      </div>
                    )}
                    {selectedLeadDetails.budget_range && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Budget Range</div>
                        <div className="font-medium text-black dark:text-white">
                          {selectedLeadDetails.budget_range}
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
                    <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-yellow-500" />
                    Reassignments ({selectedLeadDetails.reassignment_remarks.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(() => {
                      const remarks = selectedLeadDetails.reassignment_remarks;
                      if (remarks.length > 0 && typeof remarks[0] === 'object' && 'remark' in remarks[0]) {
                        // Array of objects (full reassignment data)
                        return (remarks as any[]).slice(0, 4).map((remarkObj, index) => (
                          <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm mb-1">
                                  <span className="text-blue-600">{remarkObj.name || 'Unknown'}</span>
                                  <span className="mx-2 text-gray-400">→</span>
                                  <span className="text-green-600">{remarkObj.assignedTo || 'Unknown'}</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-1">
                                  {remarkObj.created_at} • {remarkObj.leadStage || 'Cold Lead'}
                                </div>
                              </div>
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">#{index + 1}</span>
                            </div>
                            
                            {remarkObj.remark && (
                              <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 pt-2 border-t">
                                {remarkObj.remark}
                              </div>
                            )}
                          </div>
                        ));
                      } else if (remarks.length > 0 && typeof remarks[0] === 'string') {
                        // Array of strings (legacy format)
                        return (remarks as string[]).slice(0, 4).map((remark, index) => (
                          <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm mb-1">
                                  <span className="text-gray-700 dark:text-gray-300">Remark #{index + 1}</span>
                                </div>
                              </div>
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">#{index + 1}</span>
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
                setLocationLink("");
                setRemark("");
                setFollowupDate("");
                setSelectedUsers([]);
                setLeadStage("");
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
                  <FontAwesomeIcon icon={faFileUpload} className="text-blue-500" />
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
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    
                    {/* Checkbox Selection Area - 3 Columns */}
                    <div className="border border-gray-300 dark:border-gray-600 rounded p-3 max-h-40 overflow-y-auto">
                      {/* Select All Filtered Button */}
                      <div className="mb-2 pb-2 border-b dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => {
                            // Handle select all filtered users
                            const allFilteredSelected = filteredUsers.every(user => 
                              selectedUsers.includes(user.user_id || user.id)
                            );
                            
                            if (allFilteredSelected) {
                              // Deselect all filtered users
                              setSelectedUsers(prev => 
                                prev.filter(userId => 
                                  !filteredUsers.some(user => user.user_id === userId || user.id === userId)
                                )
                              );
                            } else {
                              // Add all filtered users
                              const filteredUserIds = filteredUsers.map(user => user.user_id || user.id);
                              setSelectedUsers(prev => [...new Set([...prev, ...filteredUserIds])]);
                            }
                          }}
                          className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          {filteredUsers.length > 0 && 
                          filteredUsers.every(user => 
                            selectedUsers.includes(user.user_id || user.id)
                          ) 
                            ? 'Deselect All Filtered' 
                            : 'Select All Filtered'}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {selectedUsers.length} selected
                        </span>
                      </div>
                      
                      {/* Users List - 3 Columns */}
                      {filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {filteredUsers.map((user) => {
                            const isSelected = selectedUsers.includes(user.user_id || user.id);
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
                                      setSelectedUsers(prev => prev.filter(id => id !== userId));
                                    } else {
                                      setSelectedUsers(prev => [...prev, userId]);
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 mt-1"
                                />
                                <label 
                                  htmlFor={`user-${user.user_id || user.id}`}
                                  className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                                >
                                  <div className="font-medium line-clamp-1">{user.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {user.role || 'No role'}
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
                          <p className="text-xs mt-1">Try a different search term</p>
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
                          {selectedUsers.map(userId => {
                            const user = users.find(u => u.user_id === userId || u.id === userId);
                            return user ? `${user.name}${user.role ? ` (${user.role})` : ''}` : userId;
                          }).join(', ')}
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

                  {/* Remark */}
                  <div>
                    <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Remark
                    </label>
                    <textarea
                      placeholder="Add a note..."
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                    ></textarea>
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
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <FontAwesomeIcon icon={faFileUpload} className="text-2xl text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Click to browse files</p>
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
                          <div key={i} className="text-[11px] truncate dark:text-gray-300 flex justify-between">
                            <span>{f.name}</span>
                            <button 
                              onClick={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))} 
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
                    <FontAwesomeIcon icon={faImages} className="text-purple-500" /> Images
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {docsData.images.map((doc, index) => (
                      <div key={index} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl transition-all">
                        <div className="aspect-video bg-gray-100 dark:bg-black/20 relative">
                          <img src={doc.url} alt="img" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform">
                              <FontAwesomeIcon icon={faEye} />
                            </a>
                            <a href={doc.url} download className="p-2 bg-white rounded-full text-green-600 hover:scale-110 transition-transform">
                              <FontAwesomeIcon icon={faDownload} />
                            </a>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium truncate dark:text-gray-200 mb-2">{doc.url.split('/').pop()}</p>
                          <div className="space-y-2">
                            {doc.link && (
                              <a href={doc.link} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-blue-500 hover:underline truncate bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded">
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
                    <FontAwesomeIcon icon={faFile} className="text-blue-500" /> Documents
                  </h3>
                  <div className="space-y-3">
                    {docsData.documents.map((doc, index) => (
                      <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-2xl mt-1">{getFileIcon(doc.url)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm dark:text-white truncate">{doc.url.split('/').pop()}</p>
                              {doc.remark && <p className="text-xs text-gray-500 mt-1">Remark: <span className="italic">{doc.remark}</span></p>}
                              {doc.link && (
                                <a href={doc.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                  <FontAwesomeIcon icon={faEye} className="mr-1" /> View Location Link
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-500">
                              <FontAwesomeIcon icon={faEye} />
                            </a>
                            <a href={doc.url} download className="p-2 text-gray-400 hover:text-green-500">
                              <FontAwesomeIcon icon={faDownload} />
                            </a>
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
                    <FontAwesomeIcon icon={faVideo} className="text-red-500" /> Videos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {docsData.videos.map((doc, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <video controls className="w-full h-40 bg-black">
                          <source src={doc.url} type="video/mp4" />
                        </video>
                        <div className="p-3">
                          <p className="text-xs font-bold truncate dark:text-gray-200 mb-2">{doc.url.split('/').pop()}</p>
                          {doc.link && (
                            <a href={doc.link} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-blue-500 hover:underline mb-2 truncate">
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
              {docsData.images.length === 0 && docsData.documents.length === 0 && docsData.videos.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                  <FontAwesomeIcon icon={faFile} className="text-5xl text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">No files uploaded yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Upload files using the form on the left</p>
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
          {/* Header with Breadcrumb and Compact Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
              <h2 className="text-lg font-medium">
  Missed Assignments
</h2>



            
            {/* Compact Search Input and Custom Record Count */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Custom Record Count Input */}
              <div className="w-full sm:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {customRecordCount && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-1">
                    Showing first {customRecordCount} records
                  </div>
                )}
              </div>
              
              {/* Compact Search Input */}
              <div className="w-full sm:w-72">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                          <button
    onClick={() => {
      if (selectedMasterIds.length === 0) {
        alert('Please select at least one record to assign/reassign');
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
      {(selectedEntryFromDate || selectedEntryToDate || selectedFollowupFromDate || selectedFollowupToDate || selectedStages.length > 0 || selectedUsersFilter.length > 0 || selectedCities.length > 0) && (
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
            {selectedStages.map(stage => (
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <>

          <div className="max-w-full overflow-auto rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
  <div className="overflow-x-auto">
    <table className="w-full table-auto">
      <thead>
        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-meta-4 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">

                {/* Add Checkbox Column */}
    <th className="py-5 px-4">
      <input
        type="checkbox"
        checked={(() => {
          const currentEntries = filteredLeads.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage,
          );
          return (
            currentEntries.length > 0 &&
            currentEntries.every((lead) =>
              selectedLeads.includes(lead.master_id),
            )
          );
        })()}
        onChange={(e) => {
          const isChecked = e.target.checked;
          const currentEntries = filteredLeads.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage,
          );
          const currentIds = currentEntries.map((lead) => lead.master_id);
          
          if (isChecked) {
            setSelectedLeads((prev) => {
              const combined = [...prev, ...currentIds];
              return combined.filter((id, index) => combined.indexOf(id) === index);
            });
            setSelectedMasterIds((prev) => {
              const combined = [...prev, ...currentIds];
              return combined.filter((id, index) => combined.indexOf(id) === index);
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

          <th className="py-5 px-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Actions
            </div>
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
          

          
          <th className="py-5 px-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Status
            </div>
          </th>

          {/* User Assign Column with Filter */}
          <th className="py-5 px-4 relative">
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
          
          {/* Stage Column with Filter */}
          <th className="py-5 px-4 relative">
            <div ref={stageFilterRef} className="flex items-center justify-between gap-2">
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
                  className={`h-3 w-3 transition-colors duration-200 ${selectedStages.length > 0 ? 'text-blue-600' : ''} ${showStageFilter ? 'text-blue-600' : ''}`}
                />
              </button>
            </div>
            
            {/* Stage Filter Dropdown */}
            {showStageFilter && (
              <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[220px] max-h-[300px] overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-sm dark:text-white">Filter Stages</span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStages([]);
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
                      <div key={stage} className="flex items-center mb-2">
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
                      {selectedStages.map(stage => (
                        <span 
                          key={stage} 
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30 shadow-sm truncate max-w-[100px]"
                        >
                          {stage}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </th> 

            {/* Entry Date Column with Filter */}
          <th className="py-5 px-4 relative">
            <div ref={entryDateRef} className="flex items-center justify-between gap-2">
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
            <div ref={followupDateRef} className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                FollowUp Date
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeAllDropdowns();
                  setShowFollowupDateCalendar(!showFollowupDateCalendar);
                }}
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
              >
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`h-3 w-3 transition-transform duration-200 ${showFollowupDateCalendar ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            
            {/* FollowUp Date Calendar Dropdown */}
            {showFollowupDateCalendar && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-sm dark:text-white">Select Followup Date Range</span>
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
              Remark
            </div>
          </th>
          
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
        {currentItems.map((lead, index) => (
          <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 last:border-b-0">
           {/* Select Checkbox */}
      <td className="py-4 px-4">
        <input
          type="checkbox"
          checked={selectedLeads.includes(lead.master_id)}
          onChange={() => {
            const leadId = lead.master_id;
            // Update selected leads for UI
            setSelectedLeads((prev) =>
              prev.includes(leadId)
                ? prev.filter((id) => id !== leadId)
                : [...prev, leadId],
            );
            // Also update selected master IDs
            setSelectedMasterIds((prev) =>
              prev.includes(leadId)
                ? prev.filter((id) => id !== leadId)
                : [...prev, leadId],
            );
          }}
          className="h-4.5 w-4.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-boxdark"
        />
      </td>


          {/* Action Buttons */}
<td className="py-4 px-4">
  <div className="flex justify-center gap-1"> {/* Same reduced gap */}
    
    {/* Eye/View Details Button */}
    <ActionButton
      onClick={() => {
        setSelectedLeadDetails(lead);
        setShowDetailsModal(true);
      }}
      title="View Details"
      variant="view"
      className="w-8 h-8 hover:scale-105 transition-transform"
    >
      <FontAwesomeIcon icon={faEye} className="text-xs" />
    </ActionButton>

    {/* Call Button */}
    <ActionButton
      onClick={() =>
        handleEdit({ 
          ...lead, 
          master_id: lead.master_id,
          assigned_to: lead.assigned_to || lead.telecaller_name || ''
        })
      }
      title="Make Call"
      variant="call"
      className="w-8 h-8 hover:scale-105 transition-transform"
    >
      <FontAwesomeIcon icon={faPhone} className="text-xs" />
    </ActionButton>

    {/* Edit Button */}
    <ActionButton
      onClick={() => handleEditClick(lead)}
      title="Edit"
      variant="edit"
      className="w-8 h-8 hover:scale-105 transition-transform"
    >
      <FontAwesomeIcon icon={faEdit} className="text-xs" />
    </ActionButton>

    {/* Documents Button */}
    <ActionButton
      onClick={() => handleFileIconClick(lead)}
      title="Upload/View Files"
      variant="document"
      badgeCount={lead.document_count}
      className="w-8 h-8 hover:scale-105 transition-transform relative"
    >
      <FontAwesomeIcon icon={faFileUpload} className="text-xs" />
    </ActionButton>

  </div>
</td>



            {/* Client Name */}
            <td className="py-4 px-4">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {lead.name}
              </div>
            </td>

            {/* Contact */}
            <td className="py-4 px-4">
              <div className="text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                {lead.number || "—"}
              </div>
            </td>

            {/* City with Location Link */}
            <td className="py-4 px-4">
              <div className="flex flex-col gap-1.5">
                {/* City Name */}
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {lead.city || "—"}
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
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                      <span>Location</span>
                    </a>
                  </div>
                )}
              </div>
            </td>

           

            {/* Battery Status */}
            <td className="py-4 px-2">
              <BatteryStatus 
                stage={lead.lead_stage || lead.latest_leadStage}
                status_percentage={lead.status_percentage}
                is_drop_stage={lead.is_drop_stage}
                previous_stage={lead.previous_stage}
              />
            </td>

            {/* Assigned User */}
            <td className="py-4 px-4">
              <div className="text-sm font-semibold bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-700/30 shadow-sm text-center">
                {lead.telecaller_name || "—"}
              </div>
            </td>

            {/* Stage */}
            <td className="py-4 px-4">
              <div className="text-xs font-semibold bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 text-orange-800 dark:text-orange-300 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-700/30 shadow-sm text-center">
                {lead.lead_stage || 'N/A'}
              </div>
            </td> 

              {/* Entry Date */}
            <td className="py-4 px-4">
              <div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                {lead.assign_date
                  ? new Date(lead.assign_date).toLocaleDateString("en-GB")
                  : "—"}
              </div>
            </td>

            {/* FollowUp Date */}
            <td className="py-4 px-4">
              <div
                className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm border shadow-sm ${
                  lead.followup_date && new Date(lead.followup_date) < new Date()
                    ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/30'
                    : 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30'
                }`}
              >
                {lead.followup_date
                  ? new Date(lead.followup_date).toLocaleDateString("en-GB")
                  : "—"}
              </div>
            </td>

 {/* Remark */}
            <td className="py-4 px-4">
              <span
                className={`inline-flex rounded-full py-1.5 px-3.5 text-sm font-semibold border shadow-sm
                  ${
                    lead.quick_remark === "Interested"
                      ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700/30"
                      : lead.quick_remark === "Not Interested"
                      ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700/30"
                      : lead.quick_remark === "Not Received"
                      ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/30"
                      : lead.quick_remark === "Call Cut"
                      ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700/30"
                      : lead.quick_remark === "Not Reachable"
                      ? "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600/30"
                      : lead.quick_remark === "Busy"
                      ? "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700/30"
                      : "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/20 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-600/30"
                  }`}
              >
                {lead.detailed_remark?.substring(0, 20) || "—"}
                {lead.detailed_remark && lead.detailed_remark.length > 20 && "..."}
              </span>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


          {/* Pagination */}
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              showingStart={showingStart}
              showingEnd={showingEnd}
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
              fetchRawData={fetchMissedLeads}
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
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto border-2 dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 pb-2 mb-3 dark:border-strokedark">
        <h2 className="text-2xl font-bold dark:text-white text-black">
          Assign Selected Records ({selectedMasterIds.length})
        </h2>
        <button
          onClick={() => setShowAssignPopup(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
        >
          ×
        </button>
      </div>

      {/* Show selected records summary */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <h3 className="font-medium mb-2 dark:text-white text-black">
          Selected Records:{' '}
          <span className="text-blue-600">{selectedMasterIds.length}</span>
        </h3>
        <div className="max-h-32 overflow-y-auto">
          {filteredLeads
            .filter((lead) => selectedMasterIds.includes(lead.master_id))
            .slice(0, 10)
            .map((lead) => (
              <div key={lead.master_id} className="flex items-center gap-2 p-1 text-sm">
                <span className="font-medium">{lead.name}</span>
                <span className="text-gray-500">(ID: {lead.master_id})</span>
                <span className="text-gray-500">- {lead.number}</span>
              </div>
            ))}
          {selectedMasterIds.length > 10 && (
            <div className="text-gray-500 text-sm italic p-1">
              ... and {selectedMasterIds.length - 10} more records
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={async (e) => {
        e.preventDefault();

        if (!assignData.assignedTo.length || !assignData.leadStage) {
          alert('Please select at least one user and a lead stage');
          return;
        }

        try {
          const assignments = [];

          selectedMasterIds.forEach((masterId) => {
            assignData.assignedTo.forEach((user) => {
              assignments.push({
                master_id: masterId,
                assignedTo: user,
                leadStage: assignData.leadStage,
                remark: assignData.remark,
                reassignment_date: assignData.reassignmentDate,
              });
            });
          });

          // Send all assignments
          const responses = await Promise.all(
            assignments.map((assignment) =>
              fetch(`${BASE_URL}api/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(assignment),
              }),
            ),
          );

          const results = await Promise.all(responses.map((r) => r.json()));

          let totalInserted = 0;
          let skippedDetails: string[] = [];

          results.forEach((result) => {
            if (result.success) {
              if (result.inserted?.length) totalInserted += result.inserted.length;
              if (result.skipped?.length) {
                result.skipped.forEach((s) => {
                  skippedDetails.push(
                    `"${s.finalName}" for stage "${assignData.leadStage}"`,
                  );
                });
              }
            } else {
              skippedDetails.push(result.message || 'Unknown error');
            }
          });

          if (totalInserted > 0) {
            alert(
              `✅ ${totalInserted} reassignment(s) created successfully!` +
                (skippedDetails.length > 0
                  ? `\n⚠ Skipped duplicates:\n- ${skippedDetails.join('\n- ')}`
                  : ''),
            );
          } else if (skippedDetails.length > 0) {
            alert(
              `⚠ All assignments were skipped as duplicates:\n- ${skippedDetails.join(
                '\n- ',
              )}`,
            );
          }

          // Reset
          setAssignData({
            assignedTo: [],
            leadStage: '',
            remark: '',
            reassignmentDate: new Date().toISOString().split('T')[0],
          });
          setSelectedMasterIds([]);
          setSelectedLeads([]);
          setShowAssignPopup(false);
          setRefreshTrigger(prev => prev + 1); // Refresh data
        } catch (error) {
          console.error('Network error:', error);
          alert('❌ Something went wrong while submitting reassignments');
        }
      }}>
        {/* Assign To - CHECKBOXES */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <label className="block font-medium dark:text-white text-black">
              Assign To
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const allUsers = users.map(
                    (user) => `${user.name} (${user.role})`,
                  );
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

          {/* User List */}
          <div className="max-h-48 overflow-y-auto border-2 rounded p-3 dark:border-form-strokedark dark:bg-form-input">
            {users.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No users available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {users.map((user) => {
                  const userValue = user.name;
                  const isSelected = assignData.assignedTo.includes(userValue);

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setAssignData({
                            ...assignData,
                            assignedTo: assignData.assignedTo.filter(
                              (u) => u !== userValue,
                            ),
                          });
                        } else {
                          setAssignData({
                            ...assignData,
                            assignedTo: [...assignData.assignedTo, userValue],
                          });
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignData({
                              ...assignData,
                              assignedTo: [...assignData.assignedTo, userValue],
                            });
                          } else {
                            setAssignData({
                              ...assignData,
                              assignedTo: assignData.assignedTo.filter(
                                (u) => u !== userValue,
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                      />
                      <label
                        htmlFor={`user-${user.id}`}
                        className="ml-2 cursor-pointer dark:text-white text-black flex-1"
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.role}
                        </div>
                      </label>
                      <div className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {user.id}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Count */}
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            ✅ Selected: <strong>{assignData.assignedTo.length}</strong> user(s)
          </div>
        </div>

        {/* Lead Stage Dropdown */}
        <div className="mb-4">
          <label className="block mb-1 font-medium dark:text-white text-black">
            Lead Stage *
          </label>
          <select
            name="leadStage"
            value={assignData.leadStage}
            onChange={handleAssignChange}
            required
            className="border-2 p-2 w-full rounded dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
          >
            <option value="">Select Lead Stage</option>
            {leadStages.map((stage, index) => (
              <option key={index} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        {/* Reassignment Date */}
        <div className="mb-4">
          <label className="block mb-1 font-medium dark:text-white text-black">
            Followup Date *
          </label>
          <div className="flex items-center gap-3">
            <input
              type="date"
              name="reassignmentDate"
              value={assignData.reassignmentDate || ''}
              onChange={handleAssignChange}
              required
              className="border-2 p-2 rounded dark:border-form-strokedark dark:bg-form-input dark:text-white text-black flex-1"
              min="2020-01-01"
              max="2030-12-31"
            />
            <button
              type="button"
              onClick={() => {
                setAssignData({
                  ...assignData,
                  reassignmentDate: new Date().toISOString().split('T')[0],
                });
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap"
            >
              Set to Today
            </button>
          </div>
        </div>

        {/* Remark */}
        <div className="mb-4">
          <label className="block mb-1 font-medium dark:text-white text-black">
            Remark (Optional)
          </label>
          <textarea
            name="remark"
            value={assignData.remark}
            onChange={handleAssignChange}
            placeholder="Enter Remark"
            className="w-full border-2 rounded px-2 py-1 dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
            rows={3}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-strokedark">
          <button
            type="button"
            onClick={() => setShowAssignPopup(false)}
            className="px-6 py-2.5 rounded-lg font-medium border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!assignData.assignedTo.length || !assignData.leadStage || !assignData.reassignmentDate}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Create {selectedMasterIds.length * assignData.assignedTo.length} Assignments
            </div>
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default Followup;