import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Search,
  X,
  Eye,
  Phone,
  Mail,
  Calendar,
  User,
  MapPin,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
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
  faCalendarAlt,
  faTasks,
  faUsers,
  faTrashAlt,
  faImage,
  faFileAlt,
  faStar as faStarSolid ,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { BASE_URL } from '../../../public/config.js';
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

interface Lead {
  master_id: number;
  name: string;
  number: string;
  email: string;
  address: string;
  city: string;
  cat_id: number;
  status: string;
  lead_status: string;
  lead_stage: string;
  created_at: string;
  quick_remark: string | null;
  detailed_remark: string | null;
  followup_date: string | null;
  followup_time: string | null;
  assign_date: string;
  assigned_to: string;
  assigned_user_name: string;
  reassignment_id: number | null;
  reassignment_date: string | null;
  reassigned_to: string | null;
  telecaller_name?: string;
  document_count?: number;
  area?: string;
  cat_name?: string;
  reference_name?: string;
  room_length?: number | null;
  room_width?: number | null;
  room_height?: number | null;
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
  reassignment_remarks?: any[];
  status_percentage?: number;
  is_drop_stage?: boolean;
  previous_stage?: string;
  latest_leadStage?: string;
  latest_assignedTo?: string;
  category_other?: string;
  reference_other?: string;
  architect_name?: string;
  alternate_number?: string;
  reference_id?: number;
  area_id?: number;
  assign_id?: number;
  document_location_link?: string | null;
  documents?: DocItem[];
  action_date?: string | null;
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

// Helper Functions for Time Display
const getTimeColorClass = (time: string | null, date: string | null) => {
  if (!time || time === 'Not Available')
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

  const [hours, minutes] = time.split(':');
  const timeMinutes = parseInt(hours) * 60 + parseInt(minutes);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = date === new Date().toISOString().slice(0, 10);
  
  const hourNum = parseInt(hours); // Convert hours to number

  if (isToday && timeMinutes < currentMinutes) {
    return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 animate-pulse';
  } else if (
    isToday &&
    timeMinutes - currentMinutes <= 60 &&
    timeMinutes - currentMinutes > 0
  ) {
    return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
  } else if (hourNum < 12) {  // Use hourNum here
    return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
  } else if (hourNum < 17) {  // And here
    return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
  } else {
    return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
  }
};

const isTimeOverdue = (time: string | null, date: string | null) => {
  if (!time || !date || time === 'Not Available') return false;

  const [hours, minutes] = time.split(':');
  const timeDate = new Date(date);
  timeDate.setHours(parseInt(hours), parseInt(minutes), 0);
  const now = new Date();
  const isToday = date === new Date().toISOString().slice(0, 10);
  return isToday && timeDate < now;
};

const getRemainingTimeText = (time: string | null, date: string | null) => {
  if (!time || !date || time === 'Not Available') return 'No time set';

  const [hours, minutes] = time.split(':');
  const followupDateTime = new Date(date);
  followupDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
  const now = new Date();

  if (followupDateTime < now) {
    return '⏰ Overdue - Time has passed';
  }

  const diffMs = followupDateTime.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) {
    return `⏰ Due in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    if (remainingMins > 0) {
      return `⏰ Due in ${diffHours} hour${
        diffHours !== 1 ? 's' : ''
      } and ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
    }
    return `⏰ Due in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  }
};

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
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 px-3 py-1.5 sm:px-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1 text-[13px] font-medium text-gray-700 dark:text-white ${
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
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1 text-[13px] font-medium text-gray-700 dark:text-white ${
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
          <p className="text-[12px] text-gray-700 dark:text-gray-300">
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
              className={`relative inline-flex items-center rounded-l-md px-1.5 py-1 text-gray-400 dark:text-gray-300 inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
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
                className="size-4"
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
                    className="relative inline-flex items-center px-2 py-1 text-[12px] font-semibold text-gray-700 dark:text-gray-300 inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 focus:outline-offset-0"
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
                  className={`relative inline-flex items-center px-2.5 py-1 text-[12px] font-semibold focus:z-20 focus:outline-offset-0 ${
                    isCurrent
                      ? 'z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900 dark:text-white inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'
                  } ${pageNumber > 9 ? 'px-2' : 'px-2.5'}`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-1.5 py-1 text-gray-400 dark:text-gray-300 inset-ring inset-ring-gray-300 dark:inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
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
                className="size-4"
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
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[12px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-md">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </div>
    </button>
  );
};

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
      <div className="text-[13px] font-bold text-gray-900 dark:text-white mb-0.5">
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

const TodaysTodoPage: React.FC = () => {
  // State declarations
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Lead | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [area, setArea] = useState<Area[]>([]);

  const [topPaginationKey, setTopPaginationKey] = useState(0);

  // Document upload/view states
  const [docsClient, setDocsClient] = useState<Lead | null>(null);
  const [docsData, setDocsData] = useState<DocumentData>({
    images: [],
    documents: [],
    videos: [],
  });

  const [activeTab, setActiveTab] = useState('details');
  const [documentsData, setDocumentsData] = useState({
    images: [],
    documents: [],
    videos: [],
  });
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsFetched, setDocsFetched] = useState(false);

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

  const [assignUsers, setAssignUsers] = useState<any[]>([]);
  const [assignCurrentUserRole, setAssignCurrentUserRole] = useState('');
  const [assignRolePermissions, setAssignRolePermissions] = useState<any>(null);

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

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refs for click outside detection
  const entryDateRef = useRef<HTMLDivElement>(null);
  const followupDateRef = useRef<HTMLDivElement>(null);
  const stageFilterRef = useRef<HTMLDivElement>(null);
  const userFilterRef = useRef<HTMLDivElement>(null);
  const cityFilterRef = useRef<HTMLDivElement>(null);
  const timeFilterRef = useRef<HTMLDivElement>(null);

  const [selectedLeadDetails, setSelectedLeadDetails] = useState<Lead | null>(
    null,
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Time filter states
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedSpecificTime, setSelectedSpecificTime] = useState('');
  const [sortByTime, setSortByTime] = useState(false);
  const [timeStats, setTimeStats] = useState({
    morning: 0,
    afternoon: 0,
    evening: 0,
    overdue: 0,
    urgent: 0,
  });

  // Add these with your other useState declarations
  const [favoriteStatus, setFavoriteStatus] = useState({});
  const [favoritesLoading, setFavoritesLoading] = useState({});
  const lastFetchedIdsRef = useRef('');

  // Fetch favorite statuses for multiple leads (batch)
  const fetchFavoriteStatuses = async (masterIds) => {
    if (!masterIds || masterIds.length === 0) return;

    try {
      const response = await axios.post(
        `${BASE_URL}api/favorites/batch`,
        { master_ids: masterIds },
        { withCredentials: true },
      );

      if (response.data.success) {
        setFavoriteStatus((prev) => ({
          ...prev,
          ...response.data.favorites,
        }));
      }
    } catch (error) {
      console.error('Error fetching favorite statuses:', error);
    }
  };

  // Toggle favorite status for a single lead
  const toggleFavorite = async (master_id, event) => {
    event.stopPropagation(); // Prevent row click event

    setFavoritesLoading((prev) => ({ ...prev, [master_id]: true }));

    try {
      const response = await axios.post(
        `${BASE_URL}api/favorites/toggle/${master_id}`,
        {},
        { withCredentials: true },
      );

      if (response.data.success) {
        setFavoriteStatus((prev) => ({
          ...prev,
          [master_id]: response.data.is_favorite,
        }));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoritesLoading((prev) => ({ ...prev, [master_id]: false }));
    }
  };

  // Star Icon Component
  const StarIcon = ({ isFavorite, isLoading, onClick }) => {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`transition-all duration-200 transform hover:scale-110 focus:outline-none ${
          isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'
        }`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <FontAwesomeIcon
          icon={isFavorite ? faStarSolid : faStarRegular}
          className={`text-base ${
            isFavorite
              ? 'text-yellow-400'
              : 'text-gray-400 hover:text-yellow-300'
          }`}
        />
      </button>
    );
  };

  const getPriorityInfo = (lead: Lead) => {
    if (!lead.followup_date)
      return { level: 0, label: '', color: '', icon: '' };

    const now = new Date();
    const followDate = new Date(lead.followup_date);
    const isToday = followDate.toDateString() === now.toDateString();

    if (isToday && lead.followup_time) {
      const [hours, minutes] = lead.followup_time.split(':');
      const followDateTime = new Date(followDate);
      followDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

      if (followDateTime <= now) {
        return {
          level: 1,
          label: 'OVERDUE',
          color: 'bg-red-500 text-white animate-pulse',
          icon: '🔴',
        };
      }

      const timeDiff = Math.floor(
        (followDateTime.getTime() - now.getTime()) / 60000,
      );
      if (timeDiff <= 60) {
        return {
          level: 2,
          label: `URGENT (in ${timeDiff} min)`,
          color: 'bg-orange-500 text-white',
          icon: '⚠️',
        };
      }

      return {
        level: 3,
        label: `Today at ${lead.followup_time.slice(0, 5)}`,
        color:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: '⏰',
      };
    }

    if (followDate < now && !isToday) {
      return {
        level: 4,
        label: 'MISSED',
        color: 'bg-gray-500 text-white',
        icon: '❌',
      };
    }

    return {
      level: 5,
      label: `Due ${lead.followup_date}`,
      color:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: '📅',
    };
  };

  const [openRemark, setOpenRemark] = useState(null);

  const handleShowRemark = (text) => {
    if (!text) return;
    setOpenRemark(text);
  };

  const renderDetailsModal = () => {
    if (!selectedLeadDetails) return null;

    const EMPTY_POSTER =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMjUiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSIyMDAiIHk9IjExMiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+VmlkZW88L3RleHQ+PC9zdmc+';
    const EMPTY_IMAGE =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSI3NSIgeT0iNzUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';

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
        selectedLeadDetails[fieldName] &&
        !isEmpty(selectedLeadDetails[fieldName])
      );
    };

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
      hasField('demo_date');
    const hasLinks =
      hasField('document_location_link') || hasField('location_link');
    const hasRemarks = hasField('quick_remark') || hasField('detailed_remark');

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
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
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
                    <div className="flex items-center gap-3 text-[12px] text-gray-600 dark:text-gray-400 mt-1 flex-wrap">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        ID: {selectedLeadDetails.master_id}
                      </span>
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Created: {selectedLeadDetails.assign_date || 'N/A'}
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
            <div className="mt-4 flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 font-medium text-[13px] transition-colors flex items-center gap-2 ${
                  activeTab === 'details'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />{' '}
                Details
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2 font-medium text-[13px] transition-colors flex items-center gap-2 ${
                  activeTab === 'documents'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faFile} className="h-4 w-4" /> Documents
                {documentsData.images.length +
                  documentsData.documents.length +
                  documentsData.videos.length >
                  0 && (
                  <span className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-[12px] font-semibold px-2 py-0.5 rounded-full">
                    {documentsData.images.length +
                      documentsData.documents.length +
                      documentsData.videos.length}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
            {activeTab === 'details' ? (
              <div className="p-4 space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="h-4 w-4 text-blue-500"
                    />{' '}
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-[13px]">
                    {hasField('name') && (
                      <div>
                        <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                          Name
                        </div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedLeadDetails.name)}
                        </div>
                      </div>
                    )}
                    {hasField('number') && (
                      <div>
                        <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                          Phone
                        </div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedLeadDetails.number)}
                        </div>
                      </div>
                    )}
                    {hasField('email') && (
                      <div>
                        <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                          Email
                        </div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedLeadDetails.email)}
                        </div>
                      </div>
                    )}
                    {hasField('alternate_number') && (
                      <div>
                        <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                          Alternate Phone
                        </div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedLeadDetails.alternate_number)}
                        </div>
                      </div>
                    )}
                    {hasField('address') && (
                      <div className="col-span-2">
                        <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                          Address
                        </div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedLeadDetails.address)}
                        </div>
                      </div>
                    )}
                    {hasField('city') && (
                      <div>
                        <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                          City
                        </div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedLeadDetails.city)}
                        </div>
                      </div>
                    )}
                    {hasField('area') && (
                      <div>
                        <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                          Area
                        </div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedLeadDetails.area)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {hasContactNumbers && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                    <h3 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="h-4 w-4 text-indigo-500"
                      />{' '}
                      Additional Contacts
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[13px]">
                      {hasField('architect_name') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                            Architect
                          </div>
                          <div className="font-medium text-black dark:text-white truncate">
                            {formatValue(selectedLeadDetails.architect_name)}
                          </div>
                        </div>
                      )}
                      {hasField('ar_number') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                            Architect Number
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedLeadDetails.ar_number)}
                          </div>
                        </div>
                      )}
                      {hasField('ca_number') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                            CA Number
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedLeadDetails.ca_number)}
                          </div>
                        </div>
                      )}
                      {hasField('e_number') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                            Electrician
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedLeadDetails.e_number)}
                          </div>
                        </div>
                      )}
                      {hasField('sm_number') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                            Site Manager
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedLeadDetails.sm_number)}
                          </div>
                        </div>
                      )}
                      {hasField('pop_number') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
                            POP Number
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedLeadDetails.pop_number)}
                          </div>
                        </div>
                      )}
                      {hasField('other_number') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
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
                {hasLeadInfo && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="h-4 w-4 text-blue-500"
                      />{' '}
                      Lead Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hasField('cat_name') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400">
                            Category
                          </div>
                          <div className="font-medium text-black dark:text-white truncate">
                            {formatValue(selectedLeadDetails.cat_name)}
                            {hasField('category_other') && (
                              <span className="text-[12px] text-blue-600 dark:text-blue-400 ml-2">
                                ({selectedLeadDetails.category_other})
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {hasField('reference_name') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400">
                            Reference
                          </div>
                          <div className="font-medium text-black dark:text-white truncate">
                            {formatValue(selectedLeadDetails.reference_name)}
                            {hasField('reference_other') && (
                              <span className="text-[12px] text-blue-600 dark:text-blue-400 ml-2">
                                ({selectedLeadDetails.reference_other})
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {hasDates && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                    <h3 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="h-4 w-4 text-emerald-500"
                      />{' '}
                      Dates
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-[13px]">
                      {hasField('assign_date') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400">
                            Entry Date
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedLeadDetails.assign_date)}
                          </div>
                        </div>
                      )}
                      {hasField('followup_date') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400">
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
                          <div className="text-[12px] text-gray-500 dark:text-gray-400">
                            Site Visit
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedLeadDetails.site_visit_date)}
                          </div>
                        </div>
                      )}
                      {hasField('demo_date') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400">
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
                {hasProjectDetails && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                    <h3 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faFile}
                        className="h-4 w-4 text-amber-500"
                      />{' '}
                      Project Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-[13px]">
                      {(hasField('room_length') || hasField('room_width')) && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400">
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
                          <div className="text-[12px] text-gray-500 dark:text-gray-400">
                            Type
                          </div>
                          <div className="font-medium text-black dark:text-white truncate">
                            {formatValue(selectedLeadDetails.p_type)}
                          </div>
                        </div>
                      )}
                      {hasField('budget_range') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400">
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
                            <div className="text-[12px] text-gray-500 dark:text-gray-400">
                              Time to Complete
                            </div>
                            <div className="font-medium text-black dark:text-white">
                              {formatValue(
                                selectedLeadDetails.time_to_complete,
                              )}
                            </div>
                          </div>
                        )}
                      {hasField('room_ready') && (
                        <div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400">
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
                {hasLinks && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="h-4 w-4 text-blue-500"
                      />{' '}
                      Links
                    </h3>
                    <div className="space-y-2">
                      {hasField('document_location_link') && (
                        <a
                          href={selectedLeadDetails.document_location_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 text-[13px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors border border-blue-200 dark:border-blue-700"
                        >
                          <FontAwesomeIcon icon={faFile} className="h-3 w-3" />{' '}
                          Document Location Link
                        </a>
                      )}
                      {hasField('location_link') && (
                        <a
                          href={selectedLeadDetails.location_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 text-[13px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors border border-green-200 dark:border-green-700"
                        >
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="h-3 w-3"
                          />{' '}
                          Location Link
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {hasRemarks && (
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    {/* Reassignment History */}
{/* Reassignment History - Using ONLY created_at */}
{selectedLeadDetails.reassignment_remarks &&
  Array.isArray(selectedLeadDetails.reassignment_remarks) &&
  selectedLeadDetails.reassignment_remarks.length > 0 && (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30">
      <h3 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
        <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-purple-500" />
        Remark History ({selectedLeadDetails.reassignment_remarks.length})
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {selectedLeadDetails.reassignment_remarks.map((remark, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            {typeof remark === 'object' && remark !== null ? (
              <>
                <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                  <div className="flex items-center flex-wrap gap-1">
                    <span className="font-medium text-blue-600 dark:text-blue-400 text-[12px]">
                      {remark.name || 'Unknown'}
                    </span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="font-medium text-green-600 dark:text-green-400 text-[12px]">
                      {remark.assignedTo || 'Unknown'}
                    </span>
                    {remark.leadStage && (
                      <span className="ml-1 text-[11px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                        {remark.leadStage}
                      </span>
                    )}
                  </div>
                  {/* 🔥 USING ONLY created_at DATE - NO fallback to reassignment_date */}
                  <span className="text-[11px] text-gray-500 whitespace-nowrap bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
                    {remark.created_at || 'Date not available'}
                  </span>
                </div>
                {remark.remark && (
                  <p className="text-[12px] text-gray-600 dark:text-gray-300 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="font-medium text-gray-500">Remark:</span> {remark.remark}
                  </p>
                )}
              </>
            ) : (
              <div className="flex justify-between items-start">
                <p className="text-[12px] text-gray-600 dark:text-gray-300 flex-1">{remark}</p>
                <span className="text-[11px] text-gray-500">No date</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )}
                  </div>
                )}
              </div>
            ) : (
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
                          <div className="text-[13px] text-gray-600 dark:text-gray-400">
                            Images
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700/30">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {documentsData.documents.length}
                          </div>
                          <div className="text-[13px] text-gray-600 dark:text-gray-400">
                            Documents
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700/30">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {documentsData.videos.length}
                          </div>
                          <div className="text-[13px] text-gray-600 dark:text-gray-400">
                            Videos
                          </div>
                        </div>
                      </div>
                    </div>
                    {documentsData.images.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faImage}
                            className="h-4 w-4 text-blue-500"
                          />{' '}
                          Images ({documentsData.images.length})
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {documentsData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image.url}
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
                                  className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-[13px] mr-2"
                                >
                                  View
                                </a>
                                {image.remark && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[12px] p-2 rounded-b-lg">
                                    {image.remark}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {documentsData.documents.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faFileAlt}
                            className="h-4 w-4 text-green-500"
                          />{' '}
                          Documents ({documentsData.documents.length})
                        </h4>
                        <div className="space-y-2">
                          {documentsData.documents.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-xl">
                                  {getFileIcon(doc.file_extension)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                    {doc.document_name}
                                  </div>
                                  {doc.remark && (
                                    <div className="text-[13px] text-gray-600 dark:text-gray-400 truncate">
                                      {doc.remark}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {doc.uploaded_at && (
                                  <span className="text-[12px] text-gray-500 dark:text-gray-400">
                                    {new Date(
                                      doc.uploaded_at,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-[13px] rounded transition-colors"
                                >
                                  Open
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {documentsData.videos.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faVideo}
                            className="h-4 w-4 text-purple-500"
                          />{' '}
                          Videos ({documentsData.videos.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {documentsData.videos.map((video, index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                              <div className="aspect-video bg-black">
                                <video
                                  controls
                                  className="w-full h-full"
                                  poster={EMPTY_POSTER}
                                >
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
                                    className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-[12px] rounded transition-colors"
                                  >
                                    Download
                                  </a>
                                </div>
                                {video.remark && (
                                  <div className="mt-2 text-[13px] text-gray-600 dark:text-gray-400">
                                    {video.remark}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {documentsData.images.length === 0 &&
                      documentsData.documents.length === 0 &&
                      documentsData.videos.length === 0 && (
                        <div className="text-center py-12">
                          <FontAwesomeIcon
                            icon={faFile}
                            className="text-4xl text-gray-400 dark:text-gray-600 mb-3"
                          />
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

  useEffect(() => {
    if (selectedLeadDetails) {
      setActiveTab('details');
      setDocsFetched(false);
      setDocumentsData({ images: [], documents: [], videos: [] });
    }
  }, [selectedLeadDetails?.master_id]);

  useEffect(() => {
    if (
      activeTab === 'documents' &&
      selectedLeadDetails?.master_id &&
      !docsFetched
    ) {
      fetchDocumentsForModal();
    }
  }, [activeTab, selectedLeadDetails?.master_id]);

  const fetchDocumentsForModal = async () => {
    if (!selectedLeadDetails?.master_id || docsFetched) return;
    setLoadingDocs(true);
    try {
      const response = await axios.get(
        `${BASE_URL}api/documents/${selectedLeadDetails.master_id}`,
        { withCredentials: true },
      );
      const images = [],
        documents = [],
        videos = [];
      response.data.documents.forEach((doc) => {
        let filePath = doc.document_path
          .replace(/^server\//, '')
          .replace(/\\/g, '/');
        if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setAssignData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchTodaysLeads = async () => {
    try {
      setLoading(true);
      const filterParams: any = { page: currentPage, limit: itemsPerPage };
      if (searchTerm.trim()) filterParams.search = searchTerm;
      if (selectedEntryFromDate)
        filterParams.entryFromDate = selectedEntryFromDate;
      if (selectedEntryToDate) filterParams.entryToDate = selectedEntryToDate;
      if (selectedFollowupFromDate)
        filterParams.followupFromDate = selectedFollowupFromDate;
      if (selectedFollowupToDate)
        filterParams.followupToDate = selectedFollowupToDate;
      if (selectedStages.length > 0)
        filterParams.stages = selectedStages.join(',');
      if (selectedUsersFilter.length > 0)
        filterParams.users = selectedUsersFilter.join(',');
      if (selectedCities.length > 0)
        filterParams.cities = selectedCities.join(',');
      if (selectedTimeSlot) filterParams.timeSlot = selectedTimeSlot;
      if (selectedSpecificTime)
        filterParams.followupTime = selectedSpecificTime;
      if (sortByTime) filterParams.sortByTime = 'true';

      const response = await axios.get(
        `${BASE_URL}api/dashboard/assigned-miss-todays-leads-fulldata`,
        { params: filterParams, withCredentials: true },
      );
      const data = response.data;

      if (data.success) {
        const missedLeads = data.missed?.leads || [];
        const todaysLeads = data.today?.leads || [];
        const leadsArray = [...missedLeads, ...todaysLeads];
        const missedTotal = data.missed?.total || 0;
        const todayTotal = data.today?.total || 0;

        const lastNonDropStages: Record<number, string> = {};
        leadsArray.forEach((item: any) => {
          const clientId = item.master_id;
          const currentStage =
            item.lead_stage ||
            item.latest_leadStage ||
            item.current_stage ||
            '';
          const cleanStage = currentStage ? currentStage.trim() : '';
          if (cleanStage && cleanStage !== 'Drop') {
            lastNonDropStages[clientId] = cleanStage;
          }
        });

        const parseValue = (value: any) => {
          if (
            value === 'Not Available' ||
            value === null ||
            value === undefined ||
            value === ''
          )
            return '';
          return value;
        };

        if (data.timeStats) {
          setTimeStats(data.timeStats);
        }

        const parseIdValue = (value: any) => {
          if (
            value === 'Not Available' ||
            value === null ||
            value === undefined
          )
            return '';
          return isNaN(value) ? value : Number(value);
        };

        const processedData = leadsArray.map((item: any) => {
          const currentStage = parseValue(
            item.lead_stage || item.latest_leadStage || item.current_stage,
          );
          const cleanStage = currentStage ? currentStage.trim() : '';
          let previousStage = lastNonDropStages[item.master_id] || '';
          if (cleanStage === 'Drop' && !previousStage) {
            if (item.quotation_date || item.site_visit_date)
              previousStage = 'Quotation Pending';
            else if (item.demo_date) previousStage = 'Demo';
            else previousStage = 'Positive Lead';
          }
          const stageForPercentage =
            cleanStage === 'Drop' ? previousStage : cleanStage;
          const status_percentage = stageForPercentage
            ? STAGE_PERCENTAGE_MAP[stageForPercentage] || 0
            : 0;
          let reassignmentRemarks = [];
          if (Array.isArray(item.reassignment_remarks)) {
            reassignmentRemarks = item.reassignment_remarks;
          }
          let displayCity = '';
          const areaName = parseValue(item.area_name);
          const cityName = parseValue(item.city);
          if (areaName && areaName !== '' && areaName !== 'Not Available') {
            displayCity = areaName;
          } else if (
            cityName &&
            cityName !== '' &&
            cityName !== 'Not Available'
          ) {
            displayCity = cityName;
          } else {
            displayCity = '';
          }
          return {
            master_id: item.master_id,
            name: parseValue(item.name),
            number: parseValue(item.number),
            alternate_number: parseValue(item.alternate_number),
            email: parseValue(item.email),
            address: parseValue(item.address),
            city: displayCity,
            original_city: parseValue(item.city),
            original_area: parseValue(item.area_name),
            status: parseValue(item.status),
            lead_status: parseValue(item.lead_status),
            lead_stage: cleanStage,
            cat_id: parseIdValue(item.cat_id),
            cat_name: parseValue(item.cat_name),
            reference_id: parseIdValue(item.reference_id),
            reference_name: parseValue(item.reference_name),
            area_id: parseValue(item.area_id),
            area_name: parseValue(item.area_name),
            assign_date: parseValue(item.assign_date),
            followup_date: parseValue(item.followup_date),
            followup_time: parseValue(item.followup_time),
            reassignment_date: parseValue(item.reassignment_date),
            room_length: parseIdValue(item.room_length),
            room_width: parseIdValue(item.room_width),
            room_height: parseIdValue(item.room_height),
            p_type: parseValue(item.p_type),
            budget_range: parseValue(item.budget_range),
            current_stage: parseValue(item.current_stage),
            site_visit_date: parseValue(item.site_visit_date),
            demo_date: parseValue(item.demo_date),
            ar_number: parseValue(item.ar_number),
            architect_name: parseValue(item.architect_name),
            ca_number: parseValue(item.ca_number),
            e_number: parseValue(item.e_number),
            sm_number: parseValue(item.sm_number),
            pop_number: parseValue(item.pop_number),
            other_number: parseValue(item.other_number),
            quick_remark: parseValue(item.quick_remark),
            detailed_remark: parseValue(item.detailed_remark),
            action_date: parseValue(
              item.reassignment_date || item.followup_date || '',
            ),
            assigned_to: parseValue(
              item.reassigned_to || item.assigned_user_name,
            ),
            telecaller_name: parseValue(
              item.telecaller_name || item.reassigned_to,
            ),
            category_other: parseValue(item.category_other),
            reference_other: parseValue(item.reference_other),
            reassignment_remarks: reassignmentRemarks,
            latest_assignedTo: parseValue(item.latest_assignedTo),
            latest_leadStage: parseValue(item.latest_leadStage),
            status_percentage,
            is_drop_stage: cleanStage === 'Drop',
            previous_stage: previousStage,
            document_location_link: parseValue(item.document_location_link),
            location_link: parseValue(item.location_link),
            data_type: item.data_type || 'todays',
          };
        });

        setLeads(processedData);
        setFilteredLeads(processedData);
        setTotalLeads(missedTotal + todayTotal);

        const cities = processedData
          .map((lead) => lead.city?.trim())
          .filter(
            (city) =>
              city && city !== '' && city !== 'Not Available' && city !== 'N/A',
          )
          .filter((city, index, self) => self.indexOf(city) === index)
          .sort() as string[];
        setAvailableCities(cities);
      } else {
        console.error('Error fetching leads:', data);
        setLeads([]);
        setFilteredLeads([]);
        setTotalLeads(0);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
      setFilteredLeads([]);
      setTotalLeads(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorites for current page
  useEffect(() => {
    if (leads.length > 0) {
      const masterIds = leads.map((item) => item.master_id);
      const idsKey = masterIds.sort().join(',');

      // Only fetch if the IDs have changed
      if (lastFetchedIdsRef.current !== idsKey) {
        lastFetchedIdsRef.current = idsKey;
        fetchFavoriteStatuses(masterIds);
      }
    }
  }, [leads]); // Runs when leads data changes (after filtering/pagination)

  useEffect(() => {
    const fetchAssignUsers = async () => {
      if (!showAssignPopup) return;
      try {
        const response = await axios.get(`${BASE_URL}api/users/by-role`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setAssignUsers(response.data.users || []);
          setAssignCurrentUserRole(response.data.currentUserRole || '');
          setAssignRolePermissions(response.data.permissions || null);
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

  const applyFilters = () => {
    let filtered = [...leads];
    const lowerSearch = searchTerm.toLowerCase();
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
        return searchFields.some((field) => field.includes(lowerSearch));
      });
    }
    if (selectedEntryFromDate || selectedEntryToDate) {
      filtered = filtered.filter((lead) => {
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
    if (selectedFollowupFromDate || selectedFollowupToDate) {
      filtered = filtered.filter((lead) => {
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
    if (selectedStages.length > 0) {
      filtered = filtered.filter(
        (lead) => lead.lead_stage && selectedStages.includes(lead.lead_stage),
      );
    }
    if (selectedUsersFilter.length > 0) {
      filtered = filtered.filter(
        (lead) =>
          lead.assigned_to && selectedUsersFilter.includes(lead.assigned_to),
      );
    }
    if (selectedCities.length > 0) {
      filtered = filtered.filter(
        (lead) => lead.city && selectedCities.includes(lead.city),
      );
    }
    setFilteredLeads(filtered);
    setCurrentPage(1);
  };

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

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handleStageSelect = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage],
    );
    setShowStageFilter(false);
    setCurrentPage(1);
  };

  const handleUserSelect = (userName: string) => {
    setSelectedUsersFilter((prev) =>
      prev.includes(userName)
        ? prev.filter((u) => u !== userName)
        : [...prev, userName],
    );
    setShowUserFilter(false);
    setCurrentPage(1);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
    setShowCityFilter(false);
    setCurrentPage(1);
  };

  const handleDateFilterApply = () => {
    applyFilters();
    setShowEntryDateCalendar(false);
    setCurrentPage(1);
  };

  const clearFilters = async () => {
    setSelectedEntryFromDate('');
    setSelectedEntryToDate('');
    setSelectedFollowupFromDate('');
    setSelectedFollowupToDate('');
    setSelectedStages([]);
    setSelectedUsersFilter([]);
    setSelectedCities([]);
    setSelectedTimeSlot('');
    setSelectedSpecificTime('');
    setSortByTime(false);
    setSearchTerm('');
    setCustomRecordCount('');
    setItemsPerPage(5);
    setShowEntryDateCalendar(false);
    setShowFollowupDateCalendar(false);
    setShowStageFilter(false);
    setShowUserFilter(false);
    setShowCityFilter(false);
    setShowTimeFilter(false);
    setCurrentPage(1);
  };

  const closeAllDropdowns = () => {
    setShowEntryDateCalendar(false);
    setShowFollowupDateCalendar(false);
    setShowStageFilter(false);
    setShowUserFilter(false);
    setShowCityFilter(false);
    setShowTimeFilter(false);
  };

  const handleCustomRecordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setCustomRecordCount('');
      setItemsPerPage(5);
      setCurrentPage(1);
      setRefreshTrigger((prev) => prev + 1);
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setCustomRecordCount(numValue);
      setItemsPerPage(numValue);
      setCurrentPage(1);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const clearCustomRecordCount = () => {
    setCustomRecordCount('');
    setItemsPerPage(5);
    setCurrentPage(1);
    setRefreshTrigger((prev) => prev + 1);
  };

  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const showingStart =
    totalLeads === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalLeads);

  const handlePageChange = (page: number) => {
    const maxPages = Math.ceil(totalLeads / itemsPerPage);
    if (page >= 1 && page <= maxPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchTodaysLeads();
    fetchCategories();
    fetchReferences();
    fetchArea();
    fetchUsers();
    fetchLeadStages();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchTodaysLeads();
  }, [currentPage]);

  const handleEdit = (lead: Lead) => {
    setSelectedClient({
      ...lead,
      master_id: lead.master_id,
      cat_id: lead.cat_id,
      telecaller_name: lead.assigned_user_name,
      assigned_user_name: lead.telecaller_name || lead.assigned_to || '',
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

  const handleEditClick = (lead: Lead) => {
    setEditingClient(lead);
    setShowEditPopup(true);
  };

  const closeEditPopup = () => {
    setEditingClient(null);
    setShowEditPopup(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTodaysLeads();
    };
    fetchData();
  }, [
    currentPage,
    searchTerm,
    selectedEntryFromDate,
    selectedEntryToDate,
    selectedFollowupFromDate,
    selectedFollowupToDate,
    selectedStages,
    selectedUsersFilter,
    selectedCities,
    customRecordCount,
    refreshTrigger,
    selectedTimeSlot,
    selectedSpecificTime,
    sortByTime,
  ]);

  const handleFileIconClick = async (lead: Lead) => {
    setDocsClient(lead);
    setFollowupDate('');
    setSelectedUsers([]);
    setLeadStage('');
    setLocationLink('');
    setRemark('');
    try {
      const response = await axios.get(
        `${BASE_URL}api/documents/${lead.master_id}`,
        { withCredentials: true },
      );
      const images: DocItem[] = [];
      const documents: DocItem[] = [];
      const videos: DocItem[] = [];
      response.data.documents.forEach((doc: any) => {
        let filePath = doc.document_path
          .replace(/^server\//, '')
          .replace(/\\/g, '/');
        if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;
        const fullUrl = `${BASE_URL}${filePath}`;
        const docObj: DocItem = {
          doc_id: doc.doc_id,
          url: fullUrl,
          link: doc.location_link,
          remark: doc.remark,
          document_type: doc.document_type,
        };
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
    setUploadFiles(selectedFiles);
    console.log(
      '📁 Selected files:',
      selectedFiles.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    );
  };

  const fetchDataAgain = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const [detailedRemark, setDetailedRemark] = useState('');

  const handleUploadSubmit = async () => {
    if (!docsClient || uploadFiles.length === 0) {
      alert('Please select files to upload.');
      return;
    }
    const formData = new FormData();
    uploadFiles.forEach((file) => {
      formData.append('files', file);
    });
    if (locationLink) formData.append('location_link', locationLink);
    if (remark) formData.append('remark', remark);
    if (followupDate) formData.append('followup_date', followupDate);
    if (leadStage) formData.append('leadStage', leadStage);
    if (detailedRemark) {
      formData.append('detailed_remark', detailedRemark);
      console.log('📝 Sending detailed_remark:', detailedRemark);
    }
    if (selectedUsers && selectedUsers.length > 0) {
      const assignedToString = selectedUsers.join(',');
      formData.append('assignedTo', assignedToString);
      selectedUsers.forEach((userId) => {
        formData.append('assignedTo[]', userId);
      });
      console.log(`📤 Sending assignedTo as: ${assignedToString}`);
    } else {
      formData.append('assignedTo', '');
    }
    try {
      const response = await axios.post(
        `${BASE_URL}api/upload/${docsClient.master_id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        },
      );
      let successMsg = '✅ Files uploaded successfully!\n\n';
      if (response.data.summary) {
        const { summary } = response.data;
        successMsg += `📁 Files Uploaded: ${summary.files_uploaded}\n`;
        successMsg += `👥 Reassignments Added: ${summary.reassignments_added}\n`;
        if (summary.duplicates_skipped > 0)
          successMsg += `⚠️ Duplicates Skipped: ${summary.duplicates_skipped}\n`;
      }
      if (response.data.updated_fields) {
        const fields = response.data.updated_fields;
        successMsg += '\n📊 Updates:\n';
        if (fields.raw_data_followup_date || fields.followup_date)
          successMsg += '• Follow-up date updated\n';
        if (fields.raw_data_lead_stage || fields.lead_stage)
          successMsg += '• Lead stage updated\n';
        if (fields.raw_data_detailed_remark || fields.detailed_remark)
          successMsg += '• Detailed remark updated\n';
        if (fields.reassignments_created > 0 || fields.reassignment_count > 0) {
          const count =
            fields.reassignments_created || fields.reassignment_count;
          successMsg += `• ${count} reassignment(s) created\n`;
        } else {
          successMsg += '• No reassignments created\n';
        }
      }
      alert(successMsg);
      const refreshResponse = await axios.get(
        `${BASE_URL}api/documents/${docsClient.master_id}`,
        { withCredentials: true },
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
          document_type: doc.document_type,
        };
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
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      if (error.response?.data?.message) {
        alert(`❌ Upload failed: ${error.response.data.message}`);
        if (error.response.data.error)
          console.error('Server error details:', error.response.data.error);
      } else {
        alert('❌ Error uploading files. Please check console for details.');
      }
    }
  };

  const [showUpdateLocationPopup, setShowUpdateLocationPopup] = useState(false);
  const [updateLocationClient, setUpdateLocationClient] = useState<Lead | null>(null);
  const [newLocationLink, setNewLocationLink] = useState('');

  const handleUpdateLocation = async () => {
    if (!updateLocationClient || !newLocationLink) {
      alert('Please enter a location link');
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}api/update-location/${updateLocationClient.master_id}`,
        { location_link: newLocationLink },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert('✅ Location link updated successfully!');
        setShowUpdateLocationPopup(false);
        setUpdateLocationClient(null);
        setNewLocationLink('');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        alert('❌ Failed to update location link');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      alert('❌ Error updating location link');
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
    if (
      !window.confirm(
        'Are you sure you want to delete this document? This action cannot be undone.',
      )
    )
      return;
    try {
      const response = await axios.delete(`${BASE_URL}api/document/${docId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        alert('✅ Document deleted successfully!');
        if (docsClient) {
          const refreshResponse = await axios.get(
            `${BASE_URL}api/documents/${docsClient.master_id}`,
            { withCredentials: true },
          );
          const processFilePath = (filePath: string) => {
            filePath = filePath.replace(/^server\//, '').replace(/\\/g, '/');
            if (!filePath.startsWith('uploads/'))
              filePath = `uploads/${filePath}`;
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
              document_type: doc.document_type,
            };
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

  const renderDocsModal = () => {
    if (!showDocsPopup || !docsClient) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex justify-center items-start z-[9999] overflow-y-auto p-4 sm:p-10">
        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
          <div className="flex justify-between items-center border-b pb-4 mb-6 dark:border-gray-700">
            <div className="flex items-start justify-between gap-4 flex-wrap w-full">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  📁 Files for {docsClient.name}
                </h2>
                <p className="text-[13px] text-gray-600 dark:text-gray-400">
                  Manage documents, links, and remarks in one place
                </p>
              </div>
              <div className="flex flex-col items-end">
                <button
                  onClick={() => {
                    setUpdateLocationClient(docsClient);
                    setNewLocationLink(
                      docsClient?.document_location_link || 
                      docsClient?.location_link || 
                      ''
                    );
                    setShowUpdateLocationPopup(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-medium text-[13px] transition-all shadow-md hover:shadow-lg"
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4" />
                  Update Location Only
                </button>
              </div>
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
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ml-4"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-0">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faFileUpload}
                    className="text-blue-500"
                  />{' '}
                  Upload New
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1.5 text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Type
                    </label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as any)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-[13px] dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="documents">📄 Document</option>
                      <option value="image">🖼️ Image</option>
                      <option value="video">🎥 Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={followupDate || docsClient?.followup_date || ''}
                      onChange={(e) => setFollowupDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-[13px] dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Reassign To (Multiple Users)
                    </label>
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
                          className="w-full pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded text-[13px] dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
                          Showing {filteredUsers.length} of {users.length} users
                        </p>
                      )}
                    </div>
                    <div className="border border-gray-300 dark:border-gray-600 rounded p-3 max-h-40 overflow-y-auto">
                      <div className="mb-2 pb-2 border-b dark:border-gray-700 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const allFilteredSelected = filteredUsers.every(
                              (user) =>
                                selectedUsers.includes(user.user_id || user.id),
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
                          className="text-[12px] px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          {filteredUsers.length > 0 &&
                          filteredUsers.every((user) =>
                            selectedUsers.includes(user.user_id || user.id),
                          )
                            ? 'Deselect All Filtered'
                            : 'Select All Filtered'}
                        </button>
                        <span className="text-[12px] text-gray-500 dark:text-gray-400">
                          {selectedUsers.length} selected
                        </span>
                      </div>
                      {filteredUsers.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {filteredUsers.map((user) => {
                            const isSelected = selectedUsers.includes(
                              user.user_id || user.id,
                            );
                            return (
                              <div
                                key={user.user_id || user.id}
                                className={`flex items-start p-2 rounded transition-colors min-h-[60px] ${
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
                                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 mt-1 flex-shrink-0"
                                />
                                <label
                                  htmlFor={`user-${user.user_id || user.id}`}
                                  className="ml-2 text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer flex-1 min-w-0"
                                >
                                  <div className="font-semibold text-[13px]">
                                    {user.name}
                                  </div>
                                  {user.role && (
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                      {user.role}
                                    </div>
                                  )}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <div className="text-2xl mb-2">🔍</div>
                          <p className="text-[13px]">No users found</p>
                          <p className="text-[12px] mt-1">
                            Try a different search term
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedUsers.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
                        <div className="text-[12px] text-blue-700 dark:text-blue-300 mb-1 font-medium">
                          Selected Users ({selectedUsers.length}):
                        </div>
                        <div className="text-[12px] text-gray-600 dark:text-gray-400 break-words">
                          {selectedUsers
                            .map((userId) => {
                              const user = users.find(
                                (u) => u.user_id === userId || u.id === userId,
                              );
                              return user
                                ? `${user.name}${user.role ? ` (${user.role})` : ''}`
                                : userId;
                            })
                            .join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Lead Stage
                    </label>
                    <select
                      value={
                        leadStage ||
                        docsClient?.lead_stage ||
                        docsClient?.stage ||
                        ''
                      }
                      onChange={(e) => setLeadStage(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-[13px] dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Lead Stage</option>
                      {leadStages.map((stage, index) => (
                        <option key={index} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Location Link
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={
                        locationLink ||
                        docsClient?.location_link ||
                        docsClient?.document_location_link ||
                        ''
                      }
                      onChange={(e) => setLocationLink(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-[13px] dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Detailed Remark
                    </label>
                    <textarea
                      placeholder="Enter detailed remark for this update..."
                      value={detailedRemark}
                      onChange={(e) => setDetailedRemark(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-[13px] dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                    />
                  </div>
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
                      <p className="text-[12px] text-gray-600 dark:text-gray-400 font-medium">
                        Click to browse files
                      </p>
                    </label>
                  </div>
                  {uploadFiles.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                      <p className="text-[12px] font-bold text-blue-700 dark:text-blue-400 mb-1">
                        Selected ({uploadFiles.length})
                      </p>
                      <div className="max-h-20 overflow-y-auto space-y-1">
                        {uploadFiles.map((f, i) => (
                          <div
                            key={i}
                            className="text-[12px] truncate dark:text-gray-300 flex justify-between"
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
                  <button
                    onClick={handleUploadSubmit}
                    disabled={uploadFiles.length === 0}
                    className={`w-full py-3 rounded-lg font-bold text-[13px] transition-all shadow-md ${
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
            <div className="lg:col-span-2 space-y-8">
              {docsData.images.length > 0 && (
                <section>
                  <h3 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
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
                          <p className="text-[12px] font-medium truncate dark:text-gray-200 mb-2">
                            {doc.url.split('/').pop()}
                          </p>
                          <div className="space-y-2">
                            {doc.link && (
                              <a
                                href={doc.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[12px] text-blue-500 hover:underline truncate bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded"
                              >
                                🔗 {doc.link}
                              </a>
                            )}
                            {doc.remark && (
                              <p className="text-[12px] text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded">
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
              {docsData.documents.length > 0 && (
                <section>
                  <h3 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
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
                              <p className="font-semibold text-[13px] dark:text-white truncate">
                                {doc.url.split('/').pop()}
                              </p>
                              {doc.remark && (
                                <p className="text-[12px] text-gray-500 mt-1">
                                  Remark:{' '}
                                  <span className="italic">{doc.remark}</span>
                                </p>
                              )}
                              {doc.link && (
                                <a
                                  href={doc.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block mt-2 text-[12px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
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
              {docsData.videos.length > 0 && (
                <section>
                  <h3 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
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
                            <p className="text-[12px] font-bold truncate dark:text-gray-200">
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
                                  className="text-[12px]"
                                />
                              </a>
                              <button
                                onClick={() => handleDeleteDocument(doc.doc_id)}
                                className="p-1 text-gray-400 hover:text-red-500"
                                title="Delete"
                              >
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  className="text-[12px]"
                                />
                              </button>
                            </div>
                          </div>
                          {doc.link && (
                            <a
                              href={doc.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-[12px] text-blue-500 hover:underline mb-2 truncate"
                            >
                              🔗 Map/Source Link
                            </a>
                          )}
                          {doc.remark && (
                            <p className="text-[12px] text-gray-500 italic border-t border-gray-100 dark:border-gray-700 pt-2 mt-1">
                              {doc.remark}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
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
                    <p className="text-[13px] text-gray-400 mt-2">
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
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30 whitespace-nowrap">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {totalLeads} Leads
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-28">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  className="w-full pl-7 pr-7 py-1.5 text-[12px] border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Rows"
                  value={customRecordCount}
                  onChange={handleCustomRecordInput}
                  min="1"
                  max="1000"
                />
                {customRecordCount && (
                  <button
                    onClick={clearCustomRecordCount}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="relative w-56">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-7 pr-2 py-1.5 text-[12px] border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
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
                  className={`bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg whitespace-nowrap ${
                    selectedMasterIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-green-800'
                  }`}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-6a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
                  </svg>
                  {selectedMasterIds.length > 1 ? `Reassign (${selectedMasterIds.length})` : 'Reassign'}
                </button>
                <div className="relative" ref={timeFilterRef}>
                  <button
                    onClick={() => setShowTimeFilter(!showTimeFilter)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg whitespace-nowrap ${
                      selectedTimeSlot || selectedSpecificTime || sortByTime
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Time</span>
                    <svg className={`w-2.5 h-2.5 transition-transform duration-200 ${showTimeFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showTimeFilter && (
                    <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl p-2 min-w-[220px]">
                      <div className="mb-2">
                        <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 px-2">TIME SLOTS</div>
                        <button
                          onClick={() => {
                            setSelectedTimeSlot(selectedTimeSlot === 'overdue' ? '' : 'overdue');
                            setSelectedSpecificTime('');
                            setShowTimeFilter(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition-all ${
                            selectedTimeSlot === 'overdue'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px]">🔴</span>
                            <span>Overdue</span>
                          </div>
                          {timeStats.overdue > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              selectedTimeSlot === 'overdue' 
                                ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                                : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                            }`}>
                              {timeStats.overdue}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTimeSlot(selectedTimeSlot === 'morning' ? '' : 'morning');
                            setSelectedSpecificTime('');
                            setShowTimeFilter(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition-all ${
                            selectedTimeSlot === 'morning'
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px]">🌅</span>
                            <span>Morning</span>
                          </div>
                          {timeStats.morning > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              selectedTimeSlot === 'morning'
                                ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
                                : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
                            }`}>
                              {timeStats.morning}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTimeSlot(selectedTimeSlot === 'afternoon' ? '' : 'afternoon');
                            setSelectedSpecificTime('');
                            setShowTimeFilter(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition-all ${
                            selectedTimeSlot === 'afternoon'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px]">☀️</span>
                            <span>Afternoon</span>
                          </div>
                          {timeStats.afternoon > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              selectedTimeSlot === 'afternoon'
                                ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                            }`}>
                              {timeStats.afternoon}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTimeSlot(selectedTimeSlot === 'evening' ? '' : 'evening');
                            setSelectedSpecificTime('');
                            setShowTimeFilter(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition-all ${
                            selectedTimeSlot === 'evening'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px]">🌙</span>
                            <span>Evening</span>
                          </div>
                          {timeStats.evening > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              selectedTimeSlot === 'evening'
                                ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                                : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                            }`}>
                              {timeStats.evening}
                            </span>
                          )}
                        </button>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <div className="mb-2">
                        <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 px-2">SPECIFIC TIME</div>
                        <input
                          type="time"
                          value={selectedSpecificTime}
                          onChange={(e) => {
                            setSelectedSpecificTime(e.target.value);
                            setSelectedTimeSlot('');
                            setShowTimeFilter(false);
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-[12px] dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <div className="mb-1">
                        <button
                          onClick={() => {
                            setSortByTime(!sortByTime);
                            setShowTimeFilter(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition-all ${
                            sortByTime
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <span>Sort by Time</span>
                          </div>
                          {sortByTime && <span className="text-green-600 dark:text-green-400 text-[12px]">✓</span>}
                        </button>
                      </div>
                      {(selectedTimeSlot || selectedSpecificTime || sortByTime) && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                          <button
                            onClick={() => {
                              setSelectedTimeSlot('');
                              setSelectedSpecificTime('');
                              setSortByTime(false);
                              setShowTimeFilter(false);
                            }}
                            className="w-full text-center px-2 py-1.5 rounded text-[12px] font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all"
                          >
                            Clear All
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(selectedEntryFromDate ||
        selectedEntryToDate ||
        selectedFollowupFromDate ||
        selectedFollowupToDate ||
        selectedStages.length > 0 ||
        selectedUsersFilter.length > 0 ||
        selectedCities.length > 0 ||
        selectedTimeSlot ||
        selectedSpecificTime ||
        sortByTime) && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
            Active filters:
          </span>
          <div className="flex flex-wrap gap-2">
            {(selectedEntryFromDate || selectedEntryToDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
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
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
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
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
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
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
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
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
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
            {selectedTimeSlot && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                Time:{' '}
                {selectedTimeSlot === 'morning'
                  ? '🌅 Morning'
                  : selectedTimeSlot === 'afternoon'
                  ? '☀️ Afternoon'
                  : selectedTimeSlot === 'evening'
                  ? '🌙 Evening'
                  : '🔴 Overdue'}
                <button
                  onClick={() => setSelectedTimeSlot('')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSpecificTime && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                Time: {selectedSpecificTime}
                <button
                  onClick={() => setSelectedSpecificTime('')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
            {sortByTime && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                ⏰ Sorted by Time
                <button
                  onClick={() => setSortByTime(false)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="ml-2 text-[13px] text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {!loading && totalLeads > 0 && (
        <div className="mb-4" key={topPaginationKey}>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalLeads / itemsPerPage)}
            onPageChange={(page) => {
              handlePageChange(page);
              setTopPaginationKey((prev) => prev + 1);
            }}
            totalItems={totalLeads}
            itemsPerPage={itemsPerPage}
            showingStart={
              totalLeads === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
            }
            showingEnd={Math.min(currentPage * itemsPerPage, totalLeads)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : (

        // Replace the entire table section (from the table opening to closing) with this corrected version:

<div className="max-w-full overflow-auto rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
  <div className="overflow-x-auto">
    <table className="w-full table-auto">
      <thead>
        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-meta-4 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
          <th className="py-5 px-4">
            <input
              type="checkbox"
              checked={(() => {
                return (
                  leads.length > 0 &&
                  leads.every((lead) =>
                    selectedLeads.includes(lead.master_id),
                  )
                );
              })()}
              onChange={(e) => {
                const isChecked = e.target.checked;
                const currentIds = leads.map((lead) => lead.master_id);
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
          <th className="py-5 px-4 relative">
            <div
              ref={entryDateRef}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
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
            {showEntryDateCalendar && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-[13px] dark:text-white">
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
                    className="text-[12px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1">
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
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-[13px] font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1">
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
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-[13px] font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-[13px] font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </th>
          <th className="py-5 px-4 relative">
            <div
              ref={followupDateRef}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
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
            {showFollowupDateCalendar && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-[13px] dark:text-white">
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
                    className="text-[12px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1">
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
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-[13px] font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1">
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
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-[13px] font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-[13px] font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </th>
          <th className="py-5 px-4">
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Client Name
            </div>
          </th>
          <th className="py-5 px-4">
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Contact
            </div>
          </th>
          <th className="py-5 px-4 relative">
            <div
              ref={cityFilterRef}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
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
            {showCityFilter && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-[13px] dark:text-white">
                    Filter Cities
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCities([]);
                        setShowCityFilter(false);
                      }}
                      className="text-[12px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCityFilter(false);
                      }}
                      className="text-[12px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
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
                          className="text-[13px] font-medium dark:text-white cursor-pointer truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {city}
                        </label>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-[13px] font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
                    No cities available
                  </div>
                )}
                {selectedCities.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-[12px] font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Selected ({selectedCities.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCities.map((city) => (
                        <span
                          key={city}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700/30 shadow-sm"
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
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Status
            </div>
          </th>
          <th className="py-5 px-4 relative">
            <div
              ref={userFilterRef}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
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
            {showUserFilter && (
              <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[220px] max-h-[300px] overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-[13px] dark:text-white">
                    Filter Users
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUsersFilter([]);
                        setShowUserFilter(false);
                      }}
                      className="text-[12px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserFilter(false);
                      }}
                      className="text-[12px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
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
                          className="text-[13px] font-medium dark:text-white cursor-pointer truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {user.name} ({user.role})
                        </label>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-[13px] font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
                    Loading users...
                  </div>
                )}
                {selectedUsersFilter.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-[12px] font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Selected ({selectedUsersFilter.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUsersFilter.map((user) => (
                        <span
                          key={user}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30 shadow-sm truncate max-w-[100px]"
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
          <th className="py-5 px-4 relative">
            <div
              ref={stageFilterRef}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
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
            {showStageFilter && (
              <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[220px] max-h-[300px] overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-[13px] dark:text-white">
                    Filter Stages
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStages([]);
                        setShowStageFilter(false);
                      }}
                      className="text-[12px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStageFilter(false);
                      }}
                      className="text-[12px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
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
                          className="text-[13px] font-medium dark:text-white cursor-pointer truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {stage || 'Unknown'}
                        </label>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-[13px] font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
                    Loading stages...
                  </div>
                )}
                {selectedStages.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-[12px] font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Selected ({selectedStages.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStages.map((stage) => (
                        <span
                          key={stage}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
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
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Remark
            </div>
          </th>
          <th className="py-5 px-4">
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Actions
            </div>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
        {leads.map((lead, index) => (
          <tr
            key={index}
            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 last:border-b-0"
          >
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
            <td className="py-4 px-4">
              <div className="font-semibold text-[13px] bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                {lead.assign_date
                  ? new Date(lead.assign_date).toLocaleDateString(
                      'en-GB',
                    )
                  : '—'}
              </div>
            </td>
            <td className="py-4 px-4">
              <div
                className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-[13px] border shadow-sm ${
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
              {lead.followup_time &&
                lead.followup_time !== 'Not Available' && (
                  <div className="mt-1.5 relative group">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium border shadow-sm transition-all ${getTimeColorClass(
                        lead.followup_time,
                        lead.followup_date,
                      )}`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {lead.followup_time.slice(0, 5)}
                      {isTimeOverdue(
                        lead.followup_time,
                        lead.followup_date,
                      ) && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[12px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {getRemainingTimeText(
                        lead.followup_time,
                        lead.followup_date,
                      )}
                    </div>
                  </div>
                )}
            </td>
            <td className="py-4 px-4">
              <div className="flex items-center gap-2 group">
                <StarIcon
                  isFavorite={favoriteStatus[lead.master_id] || false}
                  isLoading={favoritesLoading[lead.master_id]}
                  onClick={(e) => toggleFavorite(lead.master_id, e)}
                />
                <div
                  onClick={() => {
                    setSelectedLeadDetails(lead);
                    setShowDetailsModal(true);
                  }}
                  className="group cursor-pointer flex-1"
                >
                  <div className="text-[13px] font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {lead.name}
                  </div>
                  <div className="mt-1 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-800 group-hover:from-blue-400 group-hover:to-blue-200 dark:group-hover:from-blue-500 dark:group-hover:to-blue-300 transition-all duration-300"></div>
                    <div className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <FontAwesomeIcon
                        icon={faEye}
                        className="text-[12px] text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td className="py-4 px-4">
              <div className="text-[13px] font-medium bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                {lead.number || '—'}
              </div>
            </td>
            <td className="py-4 px-4">
              <div className="flex flex-col gap-1.5">
                <div className="text-[13px] font-bold text-gray-900 dark:text-white">
                  {lead.city || '—'}
                </div>
                {lead.document_location_link && (
                  <div>
                    <a
                      href={lead.document_location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/30 transition-all duration-200 border border-blue-200 dark:border-blue-700/30 shadow-sm"
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
            <td className="py-4 px-2">
              <ProgressStatus
                stage={lead.lead_stage || lead.latest_leadStage}
                status_percentage={lead.status_percentage}
                is_drop_stage={lead.is_drop_stage}
                previous_stage={lead.previous_stage}
              />
            </td>
            <td className="py-4 px-4">
              <div className="text-[13px] font-semibold bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-700/30 shadow-sm text-center">
                {lead.telecaller_name || '—'}
              </div>
            </td>
            <td className="py-4 px-4">
              <div className="text-[12px] font-semibold bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 text-orange-800 dark:text-orange-300 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-700/30 shadow-sm text-center">
                {lead.lead_stage || 'N/A'}
              </div>
            </td>
            <td className="py-4 px-4">
              <span
                onClick={() => handleShowRemark(lead.detailed_remark)}
                title="Click to view full remark"
                className={`inline-flex cursor-pointer rounded-full py-1.5 px-3.5 text-[13px] font-semibold border shadow-sm truncate max-w-[220px] ${
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
            <td className="py-4 px-4">
              <div className="flex justify-center gap-1">
                <ActionButton
                  onClick={() => handleEditClick(lead)}
                  title="Edit"
                  variant="edit"
                  className="w-8 h-8 hover:scale-105 transition-transform"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-[12px]" />
                </ActionButton>
                <ActionButton
                  onClick={() => handleFileIconClick(lead)}
                  title="Upload/View Files"
                  variant="document"
                  badgeCount={lead.document_count}
                  className="w-8 h-8 hover:scale-105 transition-transform relative"
                >
                  <FontAwesomeIcon
                    icon={faFileUpload}
                    className="text-[12px]"
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
      )}

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
              fetchRawData={fetchTodaysLeads}
              categories={categories}
              references={references}
              area={area}
            />
          </div>
        </div>
      )}
      {showAssignPopup && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex justify-center items-center">
          <div className="bg-white dark:bg-boxdark p-3 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto border dark:border-strokedark">
            <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-strokedark">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Assign Selected Records ({selectedMasterIds.length})
              </h2>
              <button
                onClick={() => setShowAssignPopup(false)}
                className="text-xl text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-[13px]">
              <span className="font-medium dark:text-white">
                Selected Records:
              </span>{' '}
              <span className="text-blue-600 font-semibold">
                {selectedMasterIds.length}
              </span>
            </div>
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
                  let totalInserted = 0,
                    totalSkipped = 0;
                  results.forEach((r) => {
                    totalInserted += r.inserted_count || 0;
                    totalSkipped += r.skipped_count || 0;
                  });
                  alert(
                    `✅ Assignment completed\nInserted: ${totalInserted}\nSkipped: ${totalSkipped}`,
                  );
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
                } catch (err) {
                  console.error(err);
                  alert('❌ Submission failed');
                }
              }}
              className="space-y-4"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-semibold text-green-600 dark:text-green-400 mb-2">
                    Assign To
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allUsers = assignUsers.map((user) => user.name);
                        setAssignData({ ...assignData, assignedTo: allUsers });
                      }}
                      className="text-[12px] px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignData({ ...assignData, assignedTo: [] });
                      }}
                      className="text-[12px] px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="border rounded p-2 max-h-48 overflow-y-auto dark:border-form-strokedark dark:bg-form-input">
                  {assignUsers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <p className="text-[13px]">No users available to assign</p>
                      <p className="text-[12px] mt-1">
                        You don't have permission to assign to any users
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {assignUsers.map((user) => {
                        const checked = assignData.assignedTo.includes(
                          user.name,
                        );
                        return (
                          <label
                            key={user.user_id || user.id}
                            className={`flex gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                              checked
                                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                                : ''
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
                            <div className="text-[12px] flex-1">
                              <div className="font-medium text-black dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                {user.role_label || user.role}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-[13px] text-blue-600 dark:text-blue-400 mt-1">
                  Selected: {assignData.assignedTo.length}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-green-600 dark:text-green-400 mb-2">
                  Lead Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-[13px] font-medium text-black dark:text-white">
                      Lead Stage *
                    </label>
                    <select
                      name="leadStage"
                      value={assignData.leadStage}
                      onChange={(e) =>
                        setAssignData({
                          ...assignData,
                          leadStage: e.target.value,
                        })
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
                  <div>
                    <label className="block mb-1 text-[13px] font-medium text-black dark:text-white">
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
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-[13px] whitespace-nowrap"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                  className="px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
      {showUpdateLocationPopup && updateLocationClient && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[10000] p-4">
          <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-300 dark:border-gray-700">
            <div className="flex justify-between items-center border-b pb-4 mb-4 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Update Location Link
                </h2>
                <p className="text-[13px] text-gray-600 dark:text-gray-400">
                  For: {updateLocationClient.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUpdateLocationPopup(false);
                  setUpdateLocationClient(null);
                  setNewLocationLink('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-[13px] font-bold text-gray-700 dark:text-gray-300">
                  Location Link (Google Maps URL)
                </label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/..."
                  value={newLocationLink}
                  onChange={(e) => setNewLocationLink(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[13px] dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
                  Enter a Google Maps or location URL
                </p>
              </div>
              {(updateLocationClient.document_location_link || updateLocationClient.location_link) && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Current Location:
                  </p>
                  <a
                    href={updateLocationClient.document_location_link || updateLocationClient.location_link || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {updateLocationClient.document_location_link || updateLocationClient.location_link}
                  </a>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowUpdateLocationPopup(false);
                    setUpdateLocationClient(null);
                    setNewLocationLink('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLocation}
                  disabled={!newLocationLink}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    newLocationLink
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Update Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysTodoPage;