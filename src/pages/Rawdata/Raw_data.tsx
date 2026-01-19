import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, // ✅ Edit button
  faTrash, // ✅ Delete button
  faDownload, // ✅ For download sample file
  faPlus, // ✅ Add New button
  faFileImport, // ✅ Import button
  faEye, // ✅ View Details button
  faUser, // ✅ User-related icons
  faMapMarker, // ✅ City filter icon
  faListAlt, // ✅ Stage filter icon
  faUsers, // ✅ User filter/Reassign icon

  // Optional icons (if you want them):
  faFileUpload, // ⚠️ Only if adding documents button
  faPhone, // ⚠️ Only if adding call button
  faCloudUploadAlt,
  faFile,
  faInfoCircle,
  faCalendarAlt,
  faComment,
  faHistory,
  faMapMarkerAlt,
  faTasks, // Alternative for import button
} from '@fortawesome/free-solid-svg-icons';

import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config.js';
import axios from 'axios';
import InsertDataModal from '../Rawdata/InsertDataModal';
import UpdateRawData from '../Rawdata/UpdateRawData';
import {
  faCalendar,
  faFilter,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

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
    <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-6">
      {/* Mobile pagination */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 ${
            currentPage === 1
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-white/10'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 ${
            currentPage === totalPages
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-white/10'
          }`}
        >
          Next
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-300">
            Showing
            <span className="font-medium mx-1">{showingStart}</span>
            to
            <span className="font-medium mx-1">{showingEnd}</span>
            of
            <span className="font-medium mx-1">{totalItems}</span>
            results
          </p>
        </div>
        <div>
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md"
          >
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-white/5'
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
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                />
              </svg>
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 inset-ring inset-ring-gray-700 focus:outline-offset-0"
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
                      ? 'z-10 bg-indigo-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
                      : 'text-gray-200 inset-ring inset-ring-gray-700 hover:bg-white/5'
                  } ${pageNumber > 9 ? 'px-3' : 'px-4'}`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-white/5'
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
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const RawData = () => {
  // Add this ActionButton component (copy from CallList)
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
    variant?: 'call' | 'edit' | 'document' | 'view' | 'delete'; // Added delete variant
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
      delete:
        'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white',
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

  type Data = {
    latest_leadStage: string;
    telecaller_name(telecaller_name: any): React.ReactNode;
    // Basic info
    id: number;
    master_id: number;
    name: string;
    number: string;
    email: string;
    address: string;

    // Optional fields - add "?" to make them optional
    alternate_number?: string;
    city?: string;
    area?: string;
    area_id?: string | number;

    // Category and reference
    cat_name?: string;
    cat_id?: string | number;
    category_other?: string;
    reference_name?: string;
    reference_id?: string | number;
    reference_other?: string;

    // Status and stage
    status?: string;
    stage?: string;
    lead_stage?: string;
    current_stage?: string;
    lead_status?: string;
    lead_activity?: string | number;
    previous_stage?: string;
    status_percentage?: number;
    is_drop_stage?: boolean;

    // Project details
    room_length?: any;
    room_width?: any;
    room_height?: any;
    p_type?: any;
    budget_range?: any;
    time_to_complete?: any;
    room_ready?: any;

    // Dates
    assign_date?: string;
    followup_date?: string;
    site_visit_date?: any;
    demo_date?: any;
    target_date?: any;

    // Assignment
    assigned_to?: any;
    assigned_to_user_id?: string | number;
    assign_id?: string | number;
    assign_type?: string;
    mode?: string;
    created_by_user?: string | number;
    assignment_remark?: any;

    // Contact numbers
    ar_number?: any;
    architect_name?: any;
    ca_number?: any;
    e_number?: any;
    sm_number?: any;
    pop_number?: any;
    other_number?: any;

    // Links
    location_link?: any;
    document_location_link?: string;

    // Remarks
    quick_remark?: any;
    detailed_remark?: any;

    // Reassignment
    reassignment_remarks?: Array<{
      remark: string;
      assignedTo: string;
      leadStage: string;
      created_by_user: number;
      created_at: string;
      reassignment_date: string;
      name: string;
      role: string;
    }>;
  };

  type Client = {
    id: number;
    master_id: number;
    name: string;
    number: string;
    email: string;
    address: string;
    area: string;
    area_id: string;
    status: string;
    cat_name: string;
    cat_id: number;
    reference_name: string;
    assign_id?: string | number;
  };

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

  type User = {
    id: number;
    name: string;
    contact: string;
    email: string;
    address: string;
    role: string;
    status: string;
    category: string;
  };

  interface Props {
    assignData: { assignedTo: string };
    handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }

  interface BatteryStatusProps {
    stage: string;
    percentage?: number;
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    cat_id: '',
    reference: '',
    area_id: '',
  });
  const [rawData, setRawData] = useState<Data[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [area, setArea] = useState<Area[]>([]);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filteredClients, setFilteredClients] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableOptions, setAvailableOptions] = useState<
    { cat_id: number; area_id: number }[]
  >([]);
  const [errorDetails, setErrorDetails] = useState<any[]>([]);

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateEntries, setDuplicateEntries] = useState<any[]>([]);
  const [openRemark, setOpenRemark] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [singleFormData, setSingleFormData] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    cat_id: '',
    reference: '',
    area_id: '',
  });

  const [itemsPerPage, setItemsPerPage] = useState(5);



  const [importErrors, setImportErrors] = useState([]);


  
  // Filter states
  const [showEntryDateCalendar, setShowEntryDateCalendar] = useState(false);
  const [showFollowupDateCalendar, setShowFollowupDateCalendar] =
    useState(false);
  const [showStageFilter, setShowStageFilter] = useState(false);
  const [selectedEntryDate, setSelectedEntryDate] = useState('');
  const [selectedFollowupDate, setSelectedFollowupDate] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserFilter, setShowUserFilter] = useState(false);
  const userFilterRef = useRef<HTMLDivElement>(null);

  // Dynamic lead stages from API

  // Refs for click outside detection
  const entryDateRef = useRef<HTMLDivElement>(null);
  const followupDateRef = useRef<HTMLDivElement>(null);
  const stageFilterRef = useRef<HTMLDivElement>(null);

  const [showAllRecords, setShowAllRecords] = useState(false);
  // const [customRecordCount, setCustomRecordCount] = useState(10);
  const [customRecordCount, setCustomRecordCount] = useState<number | ''>('');

  const [selectedMasterIds, setSelectedMasterIds] = useState<number[]>([]);

  // Add these to your existing state declarations
  const [selectedEntryFromDate, setSelectedEntryFromDate] = useState('');
  const [selectedEntryToDate, setSelectedEntryToDate] = useState('');

  // Add to your existing filter states (around line 195-220)
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const cityFilterRef = useRef<HTMLDivElement>(null);

  // Add to your existing state declarations
  const [selectedFollowupFromDate, setSelectedFollowupFromDate] = useState('');
  const [selectedFollowupToDate, setSelectedFollowupToDate] = useState('');

  const [selectedClientDetails, setSelectedClientDetails] =
    useState<Data | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);


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

  // Function to check if a field exists and is not empty
  const hasField = (fieldName) => {
    return (
      selectedClientDetails[fieldName] &&
      !isEmpty(selectedClientDetails[fieldName])
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
    hasField('reference_other');

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
    hasField('stage') ||
    hasField('lead_stage') ||
    hasField('current_stage') ||
    hasField('lead_status') ||
    hasField('status') ||
    hasField('lead_activity') ||
    hasField('status_percentage');

  // Check for dates
  const hasDates =
    hasField('assign_date') ||
    hasField('followup_date') ||
    hasField('site_visit_date') ||
    hasField('demo_date');

  // Check for assignment info
  const hasAssignmentInfo =
    hasField('assigned_to') || hasField('telecaller_name');

  // Check for links
  const hasLinks = hasField('document_location_link');

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
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                      Created: {selectedClientDetails.assign_date || 'N/A'}
                    </span>
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
        </div>

        {/* Compact Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
          <div className="p-4 space-y-4">
            {/* Contact Info - Always show if client exists */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faUser}
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
                      {formatValue(selectedClientDetails.name)}
                    </div>
                  </div>
                )}
                {hasField('number') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Phone
                    </div>
                    <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                      {formatValue(selectedClientDetails.number)}
                    </div>
                  </div>
                )}
                {hasField('email') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </div>
                    <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                      {formatValue(selectedClientDetails.email)}
                    </div>
                  </div>
                )}
                {hasField('alternate_number') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Alternate Phone
                    </div>
                    <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                      {formatValue(selectedClientDetails.alternate_number)}
                    </div>
                  </div>
                )}
                {hasField('address') && (
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Address
                    </div>
                    <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                      {formatValue(selectedClientDetails.address)}
                    </div>
                  </div>
                )}
                {hasField('city') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      City
                    </div>
                    <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                      {formatValue(selectedClientDetails.city)}
                    </div>
                  </div>
                )}
                {hasField('area') && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Area
                    </div>
                    <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                      {formatValue(selectedClientDetails.area)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Contact Numbers - Only show if exists */}
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
                        {formatValue(selectedClientDetails.architect_name)}
                      </div>
                    </div>
                  )}

                  {hasField('ar_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Architect Number
                      </div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(selectedClientDetails.ar_number)}
                      </div>
                    </div>
                  )}

                  {hasField('ca_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        CA Number
                      </div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(selectedClientDetails.ca_number)}
                      </div>
                    </div>
                  )}

                  {hasField('e_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Electrician
                      </div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(selectedClientDetails.e_number)}
                      </div>
                    </div>
                  )}

                  {hasField('sm_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Site Manager
                      </div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(selectedClientDetails.sm_number)}
                      </div>
                    </div>
                  )}

                  {hasField('pop_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        POP Number
                      </div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(selectedClientDetails.pop_number)}
                      </div>
                    </div>
                  )}

                  {hasField('other_number') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Other Number
                      </div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(selectedClientDetails.other_number)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lead & Category Information - Only show if exists */}
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
                        {formatValue(selectedClientDetails.cat_name)}
                        {hasField('category_other') && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                            ({selectedClientDetails.category_other})
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
                        {formatValue(selectedClientDetails.reference_name)}
                        {hasField('reference_other') && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                            ({selectedClientDetails.reference_other})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stage & Assignment - Only show if exists */}
            {(hasLeadStages || hasAssignmentInfo) && (
              <div className="grid grid-cols-2 gap-4">
                {/* Lead Stages */}
                {hasLeadStages && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="h-4 w-4 text-purple-500"
                      />
                      Lead Stages
                    </h3>
                    <div className="space-y-2">
                      {hasField('stage') && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Stage
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClientDetails.stage)}
                          </div>
                        </div>
                      )}
                      {hasField('lead_stage') && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Lead Stage
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClientDetails.lead_stage)}
                          </div>
                        </div>
                      )}
                      {hasField('current_stage') && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Current Stage
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClientDetails.current_stage)}
                          </div>
                        </div>
                      )}
                      {hasField('lead_activity') && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Lead Activity
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClientDetails.lead_activity)}
                          </div>
                        </div>
                      )}
                  {hasField('status_percentage') && (
  <div>
    <div className="text-xs text-gray-500 dark:text-gray-400">Progress</div>
    <div className="mt-0.5">
      <ProgressStatus
        stage={selectedClientDetails.lead_stage || selectedClientDetails.latest_leadStage}
        status_percentage={selectedClientDetails.status_percentage}
        is_drop_stage={selectedClientDetails.is_drop_stage}
        previous_stage={selectedClientDetails.previous_stage}
      />
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
                      <FontAwesomeIcon
                        icon={faTasks}
                        className="h-4 w-4 text-teal-500"
                      />
                      Assignment
                    </h3>
                    <div className="space-y-2">
                      {hasField('assigned_to') && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Assigned To
                          </div>
                          <div className="font-medium text-black dark:text-white truncate">
                            {formatValue(selectedClientDetails.assigned_to)}
                          </div>
                        </div>
                      )}
                      {hasField('telecaller_name') && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Telecaller
                          </div>
                          <div className="font-medium text-black dark:text-white truncate">
                            {formatValue(
                              selectedClientDetails.telecaller_name,
                            )}
                          </div>
                        </div>
                      )}
                      {hasField('status') && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Status
                          </div>
                          <div
                            className={`font-medium ${
                              selectedClientDetails.status === 'Assigned'
                                ? 'text-green-600 dark:text-green-400'
                                : selectedClientDetails.status === 'Unassigned'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {formatValue(selectedClientDetails.status)}
                          </div>
                        </div>
                      )}
                      {hasField('lead_status') && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Lead Status
                          </div>
                          <div
                            className={`font-medium ${
                              selectedClientDetails.lead_status === 'Active'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {formatValue(selectedClientDetails.lead_status)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dates Information - Only show if exists */}
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
                        {formatValue(selectedClientDetails.assign_date)}
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
                          selectedClientDetails.followup_date &&
                          new Date(selectedClientDetails.followup_date) <
                            new Date()
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {formatValue(selectedClientDetails.followup_date)}
                      </div>
                    </div>
                  )}
                  {hasField('site_visit_date') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Site Visit
                      </div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(selectedClientDetails.site_visit_date)}
                      </div>
                    </div>
                  )}
                  {hasField('demo_date') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Demo Date
                      </div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(selectedClientDetails.demo_date)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project Details - Only show if exists */}
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
                        {formatValue(selectedClientDetails.room_length)} ×{' '}
                        {formatValue(selectedClientDetails.room_width)}
                        {hasField('room_height') &&
                          ` × ${formatValue(
                            selectedClientDetails.room_height,
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
                        {formatValue(selectedClientDetails.p_type)}
                      </div>
                    </div>
                  )}
                  {hasField('budget_range') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Budget Range
                      </div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(selectedClientDetails.budget_range)}
                      </div>
                    </div>
                  )}
                  {hasField('time_to_complete') &&
                    selectedClientDetails.time_to_complete !==
                      'Not Available' && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Time to Complete
                        </div>
                        <div className="font-medium text-black dark:text-white">
                          {formatValue(
                            selectedClientDetails.time_to_complete,
                          )}
                        </div>
                      </div>
                    )}
                  {hasField('room_ready') && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Room Ready
                      </div>
                      <div className="font-medium text-black dark:text-white">
                        {formatValue(selectedClientDetails.room_ready)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Links - Only show if exists */}
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
                      href={selectedClientDetails.document_location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors border border-blue-200 dark:border-blue-700"
                    >
                      <FontAwesomeIcon icon={faFile} className="h-3 w-3" />
                      Document Location Link
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Remarks - Only show if exists */}
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
                            selectedClientDetails.quick_remark === 'Interested'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : selectedClientDetails.quick_remark ===
                                'Not Interested'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : selectedClientDetails.quick_remark ===
                                'Not Reachable'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}
                        >
                          {formatValue(selectedClientDetails.quick_remark)}
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
                        {formatValue(selectedClientDetails.detailed_remark)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reassignment History - Only show if exists */}
            {selectedClientDetails.reassignment_remarks &&
              Array.isArray(selectedClientDetails.reassignment_remarks) &&
              selectedClientDetails.reassignment_remarks.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faHistory}
                      className="h-4 w-4 text-purple-500"
                    />
                    Reassignment History (
                    {selectedClientDetails.reassignment_remarks.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedClientDetails.reassignment_remarks
                      .slice(0, 3)
                      .map((remark, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          {typeof remark === 'object' ? (
                            <>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-medium text-blue-600 dark:text-blue-400">
                                    {remark.name || 'Unknown'}
                                  </span>
                                  <span className="mx-2 text-gray-400">→</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    {remark.assignedTo || 'Unknown'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {remark.created_at}
                                </span>
                              </div>
                              {remark.remark && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                  {remark.remark}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {remark}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};



  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();

    const results = rawData.filter((client) => {
      const name = client.name?.toLowerCase() || '';
      const number = client.number?.toString() || '';
      const email = client.email?.toLowerCase() || '';
      const address = client.address?.toLowerCase() || '';
      const areaName = client.area?.toLowerCase() || '';
      const catName = client.cat_name?.toLowerCase() || '';
      const masterIdStr = client.master_id?.toString() || '';

      // NEW FIELDS
      const status = client.status?.toLowerCase() || '';
      const assignedTo = client.assigned_to?.toLowerCase() || '';

      return (
        name.includes(lowerSearch) ||
        number.includes(lowerSearch) ||
        email.includes(lowerSearch) ||
        address.includes(lowerSearch) ||
        areaName.includes(lowerSearch) ||
        catName.includes(lowerSearch) ||
        masterIdStr.includes(lowerSearch) ||
        status.includes(lowerSearch) ||
        assignedTo.includes(lowerSearch)
      );
    });

    setFilteredClients(results);
    setCurrentPage(1);
  }, [searchTerm, rawData]);

  // Update Date Handlers
  const handleEntryDateChange = (date: string) => {
    setSelectedEntryDate(date);
    setShowEntryDateCalendar(false);
    // Filtering will happen automatically via useEffect
  };

  const handleFollowupDateChange = (date: string) => {
    setSelectedFollowupDate(date);
    setShowFollowupDateCalendar(false);
    // Filtering will happen automatically via useEffect
  };

  // Update Stage Handler
  const handleStageSelect = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage],
    );
    // Filtering will happen automatically via useEffect
  };

  // Update User Handler
  const handleUserSelect = (userName: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userName)
        ? prev.filter((u) => u !== userName)
        : [...prev, userName],
    );
    // Filtering will happen automatically via useEffect
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, rawData, selectedStages, selectedUsers, selectedCities]);



  const clearFilters = () => {
  // Clear all date filters
  setSelectedEntryDate('');
  setSelectedFollowupDate('');
  setSelectedEntryFromDate('');
  setSelectedEntryToDate('');
  setSelectedFollowupFromDate('');
  setSelectedFollowupToDate('');
  
  // Clear all stage filters
  setSelectedStages([]);
  
  // Clear all user filters
  setSelectedUsers([]);
  
  // Clear all city filters
  setSelectedCities([]);
  
  // Clear search term
  setSearchTerm('');
  
  // Clear custom record count
  setCustomRecordCount('');
  setItemsPerPage(5);
  
  // Close all dropdowns
  setShowEntryDateCalendar(false);
  setShowFollowupDateCalendar(false);
  setShowStageFilter(false);
  setShowUserFilter(false);
  setShowCityFilter(false);

  // Reset to show all data
  setFilteredClients(rawData);
  setCurrentPage(1);
};

  const closeAllDropdowns = () => {
    setShowEntryDateCalendar(false);
    setShowFollowupDateCalendar(false);
    setShowStageFilter(false);
    setShowUserFilter(false);
    setShowCityFilter(false);

    // Prevent event bubbling
    if (typeof event !== 'undefined') {
      event?.stopPropagation();
    }
  };

  // Add this function to extract unique cities from rawData
  const getUniqueCities = (data: Data[]): string[] => {
    const cities = data
      .map((client) => client.city?.trim())
      .filter(
        (city) =>
          city && city !== '' && city !== 'Not Available' && city !== 'N/A',
      )
      .filter((city, index, self) => self.indexOf(city) === index) // Remove duplicates
      .sort(); // Sort alphabetically

    return cities;
  };

  // Use it in your component
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Update cities whenever rawData changes
  useEffect(() => {
    const uniqueCities = getUniqueCities(rawData);
    setAvailableCities(uniqueCities);
  }, [rawData]);

  // Add city filter handler
  const handleCitySelect = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
    // Filtering will happen automatically via useEffect
  };

  // const fetchClients = async () => {
  //   try {
  //     const response = await axios.get(`${BASE_URL}api/clients`);
  //     setFilteredClients(response.data);
  //     setCurrentPage(1); // Reset to first page when data changes
  //   } catch (error) {
  //     console.error('Failed to fetch clients:', error);
  //   }
  // };
  // useEffect(() => {
  //   fetchClients();
  // }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const currentEntries = filteredClients.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
    const currentIds = currentEntries.map((client) => client.id);
    const currentMasterIds = currentEntries.map((client) => client.master_id);

    if (isChecked) {
      setSelectedClients((prev) => {
        const combined = [...prev, ...currentIds];
        return combined.filter((id, index) => combined.indexOf(id) === index);
      });

      setSelectedMasterIds((prev) => {
        const combined = [...prev, ...currentMasterIds];
        return combined.filter((id, index) => combined.indexOf(id) === index);
      });
    } else {
      setSelectedClients((prev) =>
        prev.filter((id) => !currentIds.includes(id)),
      );
      setSelectedMasterIds((prev) =>
        prev.filter((id) => !currentMasterIds.includes(id)),
      );
    }
  };

  // const handleSelect = (clientId: number) => {
  //   setSelectedClients((prev) =>
  //     prev.includes(clientId)
  //       ? prev.filter((id) => id !== clientId)
  //       : [...prev, clientId],
  //   );
  // };

  const handleSelect = (clientId: number, masterId: number) => {
    // Update selected clients for UI
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId],
    );

    // Also update selected master IDs
    setSelectedMasterIds((prev) =>
      prev.includes(masterId)
        ? prev.filter((id) => id !== masterId)
        : [...prev, masterId],
    );
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setShowEditPopup(true);
  };

  const closeEditPopup = () => {
    setEditingClient(null);
    setShowEditPopup(false);
  };

  interface AssignData {
    assignedTo: string[];
    leadStage: string;
    remark: string;
    reassignmentDate?: string; // Add this new field
  }

  const [assignData, setAssignData] = useState({
    assignedTo: [] as string[], // Array of selected user values
    leadStage: '',
    remark: '',
    reassignmentDate: new Date().toISOString().split('T')[0],
  });

  // Pagination calculations
  const totalItems = filteredClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Your existing handleChange for other fields remains the same
  const handleChange = (
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





  const handleSubmit = async (event) => {
  event.preventDefault();

  if (!file) {
    alert('Please select a file');
    return;
  }

  const formData1 = new FormData();
  formData1.append('file', file);

  try {
    const response = await axios.post(
      `${BASE_URL}api/master-data/import`,
      formData1,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      },
    );

    console.log('📥 Import response:', response.data);

    // Show summary in alert
    const summary = response.data.summary;
    const successMsg = summary.success > 0 ? 
      `✅ ${summary.success} records imported successfully.\n` : 
      '';
    
    if (summary.success > 0) {
      alert(`${successMsg}Please check below for any issues.`);
    }

    // 🔥 HANDLE ERRORS
    if (response.data.errors && response.data.errors.length > 0) {
      setImportErrors(response.data.errors);
      // Don't close import popup yet
    } else {
      setShowImportPopup(false);
    }

    // 🔥 HANDLE DUPLICATES
    if (response.data.duplicates && response.data.duplicates.length > 0) {
      setDuplicateEntries(response.data.duplicates);
      setShowDuplicateModal(true);
    }

    // Refresh data if any success
    if (summary.success > 0) {
      fetchRawData();
    }

  } catch (err) {
    console.log('Import Error:', err);
    console.log('Error response:', err.response?.data);
    
    let errorMessage = 'Import failed. ';
    
    if (err.response?.status === 409) {
      errorMessage = `❌ Contact number already exists: ${err.response.data.duplicate.contact}`;
    } else if (err.response?.data?.message) {
      errorMessage += err.response.data.message;
    } else if (err.message) {
      errorMessage += err.message;
    }
    
    alert(errorMessage);
  }
};




const handleDuplicateModalClose = () => {
  // setShowDuplicateModal(false);
  // setDuplicateEntries([]);
  // setError(''); 
  setShowDuplicateModal(false);
  setDuplicateEntries([]);
  setError('');

  setShowImportPopup(false); // Add this to ensure import popup stays closed
};

  const handleForceImport = async () => {
    if (!file) return;

    const formData1 = new FormData();
    formData1.append('file', file);
    formData1.append('cat_id', formData.cat_id);
    formData1.append('reference', formData.reference);
    formData1.append('area_id', formData.area_id);
    formData1.append('force_import', 'true');

    try {
      const response = await axios.post(
        `${BASE_URL}api/master-data/import`,
        formData1,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        alert('Data imported successfully (duplicates skipped).');
        setShowDuplicateModal(false);
        setDuplicateEntries([]);
        setError('');
        setFile(null);
        setFormData({ cat_id: '', reference: '', area_id: '' });
        setShowImportPopup(false);
        fetchRawData();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to import file.';
      setError(errorMessage);
    }
  };

  // Function to cancel and close everything
  const handleCancelImport = () => {
    setShowDuplicateModal(false);
    setDuplicateEntries([]);
    setShowImportPopup(false);
    setFile(null);
    setFormData({ cat_id: '', reference: '', area_id: '' });
    setError('');
  };

  // Add function to proceed with import despite duplicates
  const handleProceedWithImport = async () => {
    setShowDuplicateModal(false);
    setDuplicateEntries([]);
    setShowImportPopup(false);

    // Optionally clear the form
    setFile(null);
    setFormData({ cat_id: '', reference: '', area_id: '' });

    alert(
      'Please review the duplicate entries and try again with corrected data.',
    );
  };

  //fetch master data

  // const fetchRawData = async () => {
  //   try {
  //     const response = await fetch(`${BASE_URL}api/master-data`);
  //     if (!response.ok) throw new Error('Network response was not ok');
  //     const data = await response.json();

  //     // Map the API response to your frontend structure with ALL fields
  //     const formattedData = data.map((item: any) => ({
  //       id: item.master_id,
  //       master_id: item.master_id,
  //       name: item.name,
  //       number: item.number,
  //       email: item.email,
  //       address: item.address,
  //       area: item.area_name,
  //       area_id: item.area_id,
  //       status: item.status,
  //       cat_name: item.cat_name,
  //       cat_id: item.cat_id,
  //       reference_name: item.reference_name || 'N/A',
  //       reference_id: item.reference_id,

  //       // Additional fields
  //       city: item.city || '',
  //       location_link: item.location_link || '',
  //       room_length: item.room_length || '',
  //       room_width: item.room_width || '',
  //       room_height: item.room_height || '',
  //       p_type: item.p_type || '',
  //       budget_range: item.budget_range || '',
  //       current_stage: item.current_stage || '',
  //       room_ready: item.room_ready || '',
  //       time_to_complete: item.time_to_complete || '',
  //       site_visit_date: item.site_visit_date || '',
  //       demo_date: item.demo_date || '',
  //       ar_number: item.ar_number || '',
  //       ca_number: item.ca_number || '',
  //       e_number: item.e_number || '',
  //       sm_number: item.sm_number || '',
  //       pop_number: item.pop_number || '',
  //       other_number: item.other_number || '',
  //       lead_stage: item.lead_stage || '',
  //       quick_remark: item.quick_remark || '',
  //       detailed_remark: item.detailed_remark || '',
  //     }));

  //     setRawData(formattedData);
  //     setFilteredClients(formattedData);
  //   } catch (error) {
  //     console.error('Error fetching Master Data:', error);
  //   }
  // };

  const fetchRawData = async () => {
    try {
      const response = await fetch(`${BASE_URL}api/master-data`);
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const parseValue = (value) => {
        if (
          value === 'Not Available' ||
          value === null ||
          value === undefined
        ) {
          return '';
        }
        return value;
      };

      const parseIdValue = (value) => {
        if (
          value === 'Not Available' ||
          value === null ||
          value === undefined
        ) {
          return '';
        }
        return isNaN(value) ? value : Number(value);
      };

      // STAGE MAPPING FOR PERCENTAGE CALCULATION
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

      // Create an object to track the last non-Drop stage for each client
      const lastNonDropStages: Record<number, string> = {};

      // First pass: Identify and store last non-Drop stages for all clients
      data.forEach((item: any) => {
        const clientId = item.master_id;
        const currentStage = parseValue(
          item.stage || item.lead_stage || item.current_stage,
        );
        const cleanStage = currentStage ? currentStage.trim() : '';

        // If this is not a Drop stage, store it as the last non-Drop stage
        if (cleanStage && cleanStage !== 'Drop') {
          lastNonDropStages[clientId] = cleanStage;
        }
      });

      // Second pass: Process data and include previous_stage field
      const formattedData = data.map((item: any) => {
        const currentStage = parseValue(
          item.stage || item.lead_stage || item.current_stage,
        );
        const cleanStage = currentStage ? currentStage.trim() : '';

        // Get the last non-Drop stage for this client
        let previousStage = lastNonDropStages[item.master_id] || '';

        // Special handling: If current is Drop and we don't have a previous stage
        if (cleanStage === 'Drop' && !previousStage) {
          if (item.quotation_date || item.site_visit_date) {
            previousStage = 'Quotation Pending';
          } else if (item.demo_date) {
            previousStage = 'Demo';
          } else {
            previousStage = 'Positive Lead';
          }
        }

        // Calculate percentage based on stage (for Drop, use previous stage)
        const stageForPercentage =
          cleanStage === 'Drop' ? previousStage : cleanStage;
        const status_percentage = stageForPercentage
          ? STAGE_PERCENTAGE_MAP[stageForPercentage] || 0
          : 0;

        return {
          id: item.master_id,
          master_id: item.master_id,
          name: parseValue(item.name),
          number: parseValue(item.number),
          alternate_number: parseValue(item.alternate_number),
          email: parseValue(item.email),
          address: parseValue(item.address),

          // Master data
          area: parseValue(item.area_name),
          area_id: parseIdValue(item.area_id),
          cat_name: parseValue(item.cat_name),
          cat_id: parseIdValue(item.cat_id),
          reference_name: parseValue(item.reference_name),
          reference_id: parseIdValue(item.reference_id),
          status: parseValue(item.status),

          // Other inputs - ADD THESE TWO LINES
          category_other: item.category_other || '',
          reference_other: item.reference_other || '',

          // Location and room details
          city: parseValue(item.city),
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

          // Contact numbers
          ar_number: parseValue(item.ar_number),
          architect_name: parseValue(item.architect_name),
          ca_number: parseValue(item.ca_number),
          e_number: parseValue(item.e_number),
          sm_number: parseValue(item.sm_number),
          pop_number: parseValue(item.pop_number),
          other_number: parseValue(item.other_number),

          // Lead information
          lead_stage: parseValue(item.lead_stage),
          quick_remark: parseValue(item.quick_remark),
          detailed_remark: parseValue(item.detailed_remark),

          // Assignment fields
          assign_date: parseValue(item.assign_date),
          followup_date: parseValue(item.followup_date),
          assignment_remark: parseValue(item.assignment_remark),
          assigned_to: parseValue(item.assigned_to),
          assigned_to_user_id: parseIdValue(item.assigned_to_user_id),
          stage: cleanStage,
          assign_type: parseValue(item.assign_type),

          reassignment_remarks: Array.isArray(item.reassignment_remarks)
            ? item.reassignment_remarks.map((remark: any) => {
                if (typeof remark === 'string') {
                  return remark;
                } else if (remark && typeof remark === 'object') {
                  return {
                    remark: remark.remark || '',
                    assignedTo: remark.assignedTo || '',
                    leadStage: remark.leadStage || '',
                    reassignment_date: remark.reassignment_date || '',
                    created_by_user: remark.created_by_user || 0,
                    created_at: remark.created_at || '',
                    name: remark.name || '',
                    role: remark.role || '',
                  };
                }
                return '';
              })
            : [],
          previous_stage: previousStage,

          // Calculated percentage for battery display
          status_percentage: status_percentage,

          // Flag to indicate if this is a Drop stage
          is_drop_stage: cleanStage === 'Drop',

          assign_id: parseIdValue(item.assign_id),

          document_location_link: parseValue(item.document_location_link),
        };
      });

      console.log('Processed data with other inputs:', {
        totalClients: formattedData.length,
        sampleClient: formattedData[0],
        hasCategoryOther: formattedData[0]?.category_other,
        hasReferenceOther: formattedData[0]?.reference_other,
      });

      setRawData(formattedData);
      setFilteredClients(formattedData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching Master Data:', error);
    }
  };

  // Call this in useEffect
  useEffect(() => {
    fetchRawData();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/category`);
        setCategories(response.data);
      } catch (error) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/reference`);
        setReferences(response.data);
      } catch (err) {
        setError('Failed to load references.');
      }
    };
    fetchReferences();
  }, []);

  useEffect(() => {
    const fetchArea = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/area`);
        setArea(response.data);
      } catch (error) {
        console.error('Error fetching Area:', error);
      }
    };
    fetchArea();
  }, []);

  const [selectedMasterId, setSelectedMasterId] = useState(null);

  // Updated handleAssignSubmit

  // Updated handleAssignSubmit
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignData.assignedTo.length || !assignData.leadStage) {
      alert('Please select at least one user and a lead stage');
      return;
    }

    try {
      const firstClient = rawData.find((client) =>
        selectedMasterIds.includes(client.master_id),
      );
      const assign_id = firstClient?.assign_id || null;

      const assignments = [];

      selectedMasterIds.forEach((masterId) => {
        assignData.assignedTo.forEach((user) => {
          const client = rawData.find((c) => c.master_id === masterId);
          assignments.push({
            master_id: masterId,
            assignedTo: user,
            leadStage: assignData.leadStage,
            remark: assignData.remark,
            reassignment_date: assignData.reassignmentDate, // Add date here
            assign_id: client?.assign_id || assign_id,
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

      // Collect inserted and skipped items
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

      // Show alert messages
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
        reassignmentDate: new Date().toISOString().split('T')[0], // Reset to today
      });
      setSelectedMasterIds([]);
      setSelectedClients([]);
      setShowAssignPopup(false);
      fetchRawData();
    } catch (error) {
      console.error('Network error:', error);
      alert('❌ Something went wrong while submitting reassignments');
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm('Are you sure you want to delete selected clients?')) {
      try {
        await axios.post(`${BASE_URL}api/master-data/delete-multiple`, {
          ids: selectedClients,
        });
        setSelectedClients([]);
        alert('Selected Entry deleted successfully.');
        fetchRawData();
      } catch (error) {
        console.error(error);
        alert('Failed to delete selected entry.');
      }
    }
  };



const handleSingleDelete = async (master_id) => {
  if (window.confirm('Are you sure you want to delete this entry?')) {
    try {
      // Send as array with single ID to the :master_id route
      const res = await axios.post(
        `${BASE_URL}api/master-data/${master_id}`,
        { ids: [master_id] } // Add this
      );

      alert(res.data.message || 'Entry deleted successfully');
      setSelectedClients([]);
      fetchRawData();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || 'Failed to delete entry'
      );
    }
  }
};



  const handleSingleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSingleFormData({ ...singleFormData, [name]: value });
  };

  useEffect(() => {
    const fetchAvailableOptions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/available-cat-area`);
        setAvailableOptions(response.data);
      } catch (error) {
        console.error('Error fetching available category/area:', error);
      }
    };
    fetchAvailableOptions();
  }, []);

  const handleShowRemark = (text) => {
    setOpenRemark(text);
  };

  // Updated STAGE_PERCENTAGE_MAP with better Drop handling
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
    Drop: -1, // Special marker for Drop
    'Closed Deal': 100,
  };

  // Helper to determine what percentage Drop should show
  const getPercentageForStage = (
    currentStage: string,
    allStages: string[],
  ): number => {
    const cleanStage = currentStage ? currentStage.trim() : '';

    if (!cleanStage) return 0;

    // If it's Drop, we need to determine what it would be based on typical progression
    if (cleanStage === 'Drop') {
      // Look for clues in other fields to guess what stage it would be
      // For now, return a default or calculate based on position in stage list
      const dropIndex = allStages.indexOf('Drop');
      if (dropIndex > 0) {
        // Return percentage of the stage before Drop in the list
        const previousStage = allStages[dropIndex - 1];
        return STAGE_PERCENTAGE_MAP[previousStage] || 50; // Default to 50% if unknown
      }
      return 50; // Default for Drop
    }

    // For non-Drop stages, return the mapped percentage
    return STAGE_PERCENTAGE_MAP[cleanStage] || 0;
  };

  // We need to track the last non-drop percentage for each client
  const useClientPercentages = () => {
    const [lastNonDropPercentages, setLastNonDropPercentages] = useState<
      Record<number, number>
    >({});

    const updatePercentage = (clientId: number, stage: string) => {
      const cleanStage = stage ? stage.trim() : '';

      if (!cleanStage) return 0;

      const stagePercentage =
        STAGE_PERCENTAGE_MAP[cleanStage] !== undefined
          ? STAGE_PERCENTAGE_MAP[cleanStage]
          : 0;

      // If it's Drop stage, return the last known percentage
      if (cleanStage === 'Drop') {
        return lastNonDropPercentages[clientId] || 0;
      }

      // For non-drop stages, update the last known percentage
      if (stagePercentage >= 0) {
        // Not Drop
        setLastNonDropPercentages((prev) => ({
          ...prev,
          [clientId]: stagePercentage,
        }));
        return stagePercentage;
      }

      return 0;
    };

    return { lastNonDropPercentages, updatePercentage };
  };

// ProgressStatus Component - Compact with smaller percentage
const ProgressStatus: React.FC<{ 
  stage: string; 
  status_percentage?: number;
  is_drop_stage?: boolean;
  previous_stage?: string;
}> = ({ stage, status_percentage = 0, is_drop_stage = false, previous_stage = '' }) => {
  
  const cleanStage = stage ? stage.trim() : '';
  const percentage = status_percentage;
  
  // Get progress bar color based on exact stage-to-color mapping
  const getProgressColor = (stage: string) => {
    const stageLower = stage.toLowerCase().trim();
    
    // Exact mapping from color table
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
    
    // Fallback
    return 'bg-[#A9A9A9]';
  };

  return (
    <div className="flex flex-col items-center w-16">
      {/* Percentage Display - Medium size */}
      <div className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
        {percentage}%
      </div>
      
      {/* Progress Bar Container - Very thin */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-0.5">
        {/* Progress Fill with exact color */}
        <div 
          className={`h-full rounded-full ${getProgressColor(cleanStage)} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Stage Name - Smaller text */}
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
  // Helper function to get percentage from stage
  const getPercentageFromStage = (stage: string): number => {
    return STAGE_PERCENTAGE_MAP[stage] || 0;
  };

  // Helper function with the 60% lock logic
  const getFinalPercentageFromStage = (stage: string): number => {
    if (!stage) return 0;

    const currentPercentage = STAGE_PERCENTAGE_MAP[stage] || 0;

    // Apply the rule: Once at 60% or above, stay at that level
    if (currentPercentage >= 60) {
      return currentPercentage;
    }

    return currentPercentage;
  };

  // const [leadStages, setLeadStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [leadStages, setLeadStages] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLeadStages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/leadstage`);
        setLeadStages(response.data);
      } catch (error) {
        console.error('Error fetching lead stages:', error);
      }
    };

    fetchLeadStages();
  }, []);

  // Remove all filter-related useEffects and replace with this single one
  useEffect(() => {
    let filtered = [...rawData];

    // Apply search term filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
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
        ];
        return searchFields.some((field) => field.includes(lowerSearch));
      });
    }

    // Apply entry date filter
    if (selectedEntryDate) {
      filtered = filtered.filter(
        (client) =>
          client.assign_date && client.assign_date.includes(selectedEntryDate),
      );
    }

    // Apply followup date filter
    if (selectedFollowupDate) {
      filtered = filtered.filter(
        (client) =>
          client.followup_date &&
          client.followup_date.includes(selectedFollowupDate),
      );
    }

    // Apply stage filter
    if (selectedStages.length > 0) {
      filtered = filtered.filter(
        (client) => client.stage && selectedStages.includes(client.stage),
      );
    }

    // Apply user filter
    if (selectedUsers.length > 0) {
      filtered = filtered.filter(
        (client) =>
          client.assigned_to && selectedUsers.includes(client.assigned_to),
      );
    }

    setFilteredClients(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedEntryDate,
    selectedFollowupDate,
    selectedStages,
    selectedUsers,
    rawData,
  ]);

  const applyFilters = (
    currentRawData: Data[] = rawData,
    entryFromDate: string = selectedEntryFromDate,
    entryToDate: string = selectedEntryToDate,
    stages: string[] = selectedStages,
    users: string[] = selectedUsers,
    cities: string[] = selectedCities,
    followupFromDate: string = selectedFollowupFromDate,
    followupToDate: string = selectedFollowupToDate,
  ) => {
    let filtered = currentRawData;
    const lowerSearch = searchTerm.toLowerCase();

    // 1. Apply Search Term Filter
    filtered = filtered.filter((client) => {
      const name = client.name?.toLowerCase() || '';
      const number = client.number?.toString() || '';
      const email = client.email?.toLowerCase() || '';
      const address = client.address?.toLowerCase() || '';
      const areaName = client.area?.toLowerCase() || '';
      const catName = client.cat_name?.toLowerCase() || '';
      const masterIdStr = client.master_id?.toString() || '';
      const status = client.status?.toLowerCase() || '';
      const assignedTo = client.assigned_to?.toLowerCase() || '';

      return (
        name.includes(lowerSearch) ||
        number.includes(lowerSearch) ||
        email.includes(lowerSearch) ||
        address.includes(lowerSearch) ||
        areaName.includes(lowerSearch) ||
        catName.includes(lowerSearch) ||
        masterIdStr.includes(lowerSearch) ||
        status.includes(lowerSearch) ||
        assignedTo.includes(lowerSearch)
      );
    });

    // 2. Apply Entry Date Range Filter
    if (entryFromDate || entryToDate) {
      filtered = filtered.filter((client) => {
        if (!client.assign_date) return false;

        const clientDate = new Date(client.assign_date);

        // Check if date is valid
        if (isNaN(clientDate.getTime())) return false;

        let fromDateValid = true;
        let toDateValid = true;

        // Check from date
        if (entryFromDate) {
          const fromDate = new Date(entryFromDate);
          fromDateValid = clientDate >= fromDate;
        }

        // Check to date
        if (entryToDate) {
          const toDate = new Date(entryToDate);
          toDateValid = clientDate <= toDate;
        }

        return fromDateValid && toDateValid;
      });
    }

    // 3. Apply Followup Date Range Filter
    if (followupFromDate || followupToDate) {
      filtered = filtered.filter((client) => {
        if (!client.followup_date) return false;

        const clientDate = new Date(client.followup_date);

        // Check if date is valid
        if (isNaN(clientDate.getTime())) return false;

        let fromDateValid = true;
        let toDateValid = true;

        // Check from date
        if (followupFromDate) {
          const fromDate = new Date(followupFromDate);
          fromDateValid = clientDate >= fromDate;
        }

        // Check to date
        if (followupToDate) {
          const toDate = new Date(followupToDate);
          toDateValid = clientDate <= toDate;
        }

        return fromDateValid && toDateValid;
      });
    }

    // 4. Apply Stage Filter
    if (stages.length > 0) {
      filtered = filtered.filter(
        (client) => client.stage && stages.includes(client.stage),
      );
    }

    // 5. Apply Assigned User Filter
    if (users.length > 0) {
      filtered = filtered.filter(
        (client) => client.assigned_to && users.includes(client.assigned_to),
      );
    }

    // 6. Apply City Filter
    if (cities.length > 0) {
      filtered = filtered.filter(
        (client) => client.city && cities.includes(client.city),
      );
    }

    setFilteredClients(filtered);
    setCurrentPage(1);
  };

  // Update existing useEffect for search to call the new function
  // Update useEffect (around line 600-610)
  useEffect(() => {
    applyFilters();
  }, [
    searchTerm,
    rawData,
    selectedEntryDate,
    selectedFollowupDate,
    selectedStages,
    selectedUsers,
    selectedCities,
  ]); // Add selectedCities

  // Add this useEffect to debug filter states
  useEffect(() => {
    console.log('Filter States:', {
      searchTerm,
      selectedEntryDate,
      selectedFollowupDate,
      selectedStages,
      selectedUsers,
      filteredClientsCount: filteredClients.length,
      rawDataCount: rawData.length,
    });
  }, [
    searchTerm,
    selectedEntryDate,
    selectedFollowupDate,
    selectedStages,
    selectedUsers,
    filteredClients,
    rawData,
  ]);

  const handleCustomRecordCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setCustomRecordCount(value);
      setShowAllRecords(true);
      setCurrentPage(1); // Reset to first page
    } else {
      setShowAllRecords(false);
      setCustomRecordCount(10); // Reset to default
    }
  };

useEffect(() => {
  if (
    customRecordCount &&
    typeof customRecordCount === 'number' &&
    customRecordCount > 0
  ) {
    // First, apply all active filters to get filtered data
    let tempFiltered = [...rawData];
    const lowerSearch = searchTerm.toLowerCase();
    
    // Apply search filter
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
        ];
        return searchFields.some((field) => field.includes(lowerSearch));
      });
    }
    
    // Apply entry date filter
    if (selectedEntryDate) {
      tempFiltered = tempFiltered.filter(
        (client) =>
          client.assign_date && client.assign_date.includes(selectedEntryDate),
      );
    }
    
    // Apply followup date filter
    if (selectedFollowupDate) {
      tempFiltered = tempFiltered.filter(
        (client) =>
          client.followup_date &&
          client.followup_date.includes(selectedFollowupDate),
      );
    }
    
    // Apply stage filter
    if (selectedStages.length > 0) {
      tempFiltered = tempFiltered.filter(
        (client) => client.stage && selectedStages.includes(client.stage),
      );
    }
    
    // Apply user filter
    if (selectedUsers.length > 0) {
      tempFiltered = tempFiltered.filter(
        (client) =>
          client.assigned_to && selectedUsers.includes(client.assigned_to),
      );
    }
    
    // Apply city filter
    if (selectedCities.length > 0) {
      tempFiltered = tempFiltered.filter(
        (client) => client.city && selectedCities.includes(client.city),
      );
    }
    
    // Apply entry date range filter
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
    
    // Apply followup date range filter
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
    
    // Now limit the FILTERED results, not the original rawData
    const limitedClients = tempFiltered.slice(0, customRecordCount);
    setFilteredClients(limitedClients);
    setCurrentPage(1);
    setItemsPerPage(customRecordCount);
  } else {
    // Reset to normal pagination - apply filters first
    applyFilters();
    setItemsPerPage(5); // Reset to default
  }
}, [customRecordCount, rawData, searchTerm, selectedEntryDate, selectedFollowupDate, 
    selectedStages, selectedUsers, selectedCities, selectedEntryFromDate, 
    selectedEntryToDate, selectedFollowupFromDate, selectedFollowupToDate]); 



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

  // Add this function to clear the custom record count
  const clearCustomRecordCount = () => {
    setCustomRecordCount('');
    setItemsPerPage(5); // Reset to default
  };

  // Handle "Select All" and "Clear All"
  const handleSelectAllUsers = () => {
    const allUserValues = users.map((user) => `${user.name} (${user.role})`);
    setAssignData((prev) => ({
      ...prev,
      assignedTo: allUserValues,
    }));
  };

  const handleClearAllUsers = () => {
    setAssignData((prev) => ({
      ...prev,
      assignedTo: [],
    }));
  };

  const handleEntryDateRangeChange = (fromDate: string, toDate: string) => {
    setSelectedEntryFromDate(fromDate);
    setSelectedEntryToDate(toDate);
    setShowEntryDateCalendar(false);
  };

  return (
    <div>
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800">
        <div className="px-4 py-3">
          {/* Header with Breadcrumb and Compact Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="min-w-0">
              <Breadcrumb pageName="Master Data" />
            </div>

            {/* Compact Search Input and Custom Record Count */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* NEW: Custom Record Count Input */}
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
            </div>
          </div>

          {/* Action Buttons - Compact Layout */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              {selectedClients.length > 0 && (
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                  onClick={handleBulkDelete}
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Selected ({selectedClients.length})
                </button>
              )}
            </div>

             
<div className="flex flex-wrap items-center gap-2">

   {/* NEW: Reset Filter Button */}
  <button
    onClick={clearFilters}
    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
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
  
  {/* Add New Button */}
  <button
    onClick={() => setShowAddPopup(true)}
    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
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
        d="M12 4v16m8-8H4"
      />
    </svg>
    Add New
  </button>



  {/* Import Button */}
  <button
    onClick={() => setShowImportPopup(true)}
    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
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
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
      />
    </svg>
    Import
  </button>

  {/* Reassign Button */}
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

      {showAssignPopup && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex justify-center items-center">
          <div className="bg-white dark:bg-boxdark p-3 rounded-lg shadow-lg w-full max-w-2xl max-h-[70vh] overflow-y-auto border dark:border-strokedark">
            {/* HEADER */}
            <div className="flex items-center justify-between gap-4 border-b pb-3 mb-4 dark:border-strokedark">
              <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-white">
                Assign Selected Records ({selectedMasterIds.length})
              </h2>

              <button
                onClick={() => setShowAssignPopup(false)}
                className="text-xl text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {/* ASSIGN TO */}
              <div>
                <label className="block font-semibold text-green-600 mb-2">
                  Assign To
                </label>

                <div className="border rounded p-3 max-h-48 overflow-y-auto dark:border-form-strokedark dark:bg-form-input">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {users.map((user) => {
                      const checked = assignData.assignedTo.includes(user.name);

                      return (
                        <label
                          key={user.id}
                          className="flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
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
                            className="mt-1"
                          />

                          <div className="text-sm">
                            <div className="font-medium text-black dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.role}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <p className="text-sm mt-1 text-blue-600">
                  Selected: {assignData.assignedTo.length}
                </p>
              </div>

              {/* LEAD STAGE + FOLLOWUP DATE */}
              <div>
                <label className="block font-semibold text-green-600 mb-2">
                  Lead Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lead Stage */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-black dark:text-white">
                      Lead Stage *
                    </label>
                    <select
                      name="leadStage"
                      value={assignData.leadStage}
                      onChange={handleChange}
                      required
                      className="w-full border rounded p-2 dark:border-form-strokedark dark:bg-form-input dark:text-white"
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
                    <input
                      type="date"
                      name="reassignmentDate"
                      value={assignData.reassignmentDate}
                      onChange={handleChange}
                      required
                      className="w-full border rounded p-2 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* REMARK */}
              <div>
                <label className="block mb-1 font-medium text-black dark:text-white">
                  Remark
                </label>
                <textarea
                  name="remark"
                  value={assignData.remark}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border rounded p-2 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-strokedark">
                <button
                  type="button"
                  onClick={() => setShowAssignPopup(false)}
                  className="px-5 py-2 rounded border text-gray-700 dark:text-gray-300"
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
                  className="px-6 py-2 rounded bg-green-600 text-white disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Data Modal Component */}
      <UpdateRawData
        showEditPopup={showEditPopup}
        editingClient={editingClient}
        setEditingClient={setEditingClient}
        closeEditPopup={closeEditPopup}
        fetchRawData={fetchRawData}
        categories={categories}
        references={references}
        area={area}
      />


{/* Update the duplicate modal in your RawData component */}


{showDuplicateModal && (
  <div className="fixed inset-0 z-[99999] bg-black bg-opacity-75 flex justify-center items-center px-4">
    <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-auto border dark:border-strokedark">
      {/* Header */}
      <div className="flex justify-between items-center border-b mb-4 pb-3 dark:border-strokedark">
        <h2 className="text-xl font-bold dark:text-white text-black">
          Duplicate Contacts Found ({duplicateEntries.length})
        </h2>
        <button
          onClick={handleDuplicateModalClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
        >
          ×
        </button>
      </div>

      {/* Warning Message */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
              {duplicateEntries.length} duplicate contact(s) found
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              These contacts already exist in the system and were skipped.
            </p>
          </div>
        </div>
      </div>

      {/* Duplicates List */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">
          Duplicate Entries:
        </h4>
        
        <div className="overflow-y-auto max-h-[300px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-2 text-left">Row</th>
                <th className="p-2 text-left">New Name</th>
                <th className="p-2 text-left">Number</th>
                <th className="p-2 text-left">Existing Name</th>
                <th className="p-2 text-left">Existing ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {duplicateEntries.slice(0, 10).map((dup, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-2 font-medium">{dup.row}</td>
                  <td className="p-2">{dup.name}</td>
                  <td className="p-2 font-mono text-red-600 dark:text-red-400">{dup.number}</td>
                  <td className="p-2">{dup.existingName}</td>
                  <td className="p-2">{dup.existingId}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {duplicateEntries.length > 10 && (
            <div className="text-center p-2 text-sm text-gray-500 dark:text-gray-400">
              + {duplicateEntries.length - 10} more duplicates...
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => {
            // Option to download duplicate list as CSV
            const csvContent = "data:text/csv;charset=utf-8," 
              + "Row,New Name,Number,Existing Name,Existing ID\n"
              + duplicateEntries.map(d => 
                  `${d.row},"${d.name}","${d.number}","${d.existingName}",${d.existingId}`
                ).join("\n");
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "duplicates.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Duplicates List
        </button>
        
        <button
          onClick={handleDuplicateModalClose}
          className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
        >
          Close & Continue
        </button>
      </div>
    </div>
  </div>
)}

      {/* Main Data Table */}

      {/* Main Data Table */}
      <div className="h-[calc(100vh-180px)] overflow-y-auto mt-2">
        <div className="max-w-full overflow-auto rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-meta-4 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                  {/* Checkbox Column */}
                  <th className="py-5 px-4">
                    <input
                      type="checkbox"
                      checked={(() => {
                        const currentEntries = filteredClients.slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage,
                        );
                        return (
                          currentEntries.length > 0 &&
                          currentEntries.every((client) =>
                            selectedClients.includes(client.id),
                          )
                        );
                      })()}
                      onChange={handleSelectAll}
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

                  {/* Name Column */}
                  <th className="py-5 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Name
                    </div>
                  </th>

                  {/* Contact Column */}
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
                                                      className={`h-3 w-3 transition-colors duration-200 ${selectedUsers.length > 0 ? 'text-blue-600' : ''} ${showUserFilter ? 'text-blue-600' : ''}`}
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
                                                            setSelectedUsers([]);
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
                                                              checked={selectedUsers.includes(user.name)}
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
                                                    
                                                    {selectedUsers.length > 0 && (
                                                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                                          Selected ({selectedUsers.length}):
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                          {selectedUsers.map(user => (
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

                  {/* Status Column */}
                  <th className="py-5 px-2">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </div>
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


                  {/* Remark Column */}
                  <th className="py-5 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Remark
                    </div>
                  </th>

                  {/* Actions Column */}
                  <th className="py-5 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentItems.map((client, index) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    {/* Select Checkbox */}
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() =>
                          handleSelect(client.id, client.master_id)
                        }
                        className="h-4.5 w-4.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-boxdark"
                      />
                    </td>

                    {/* Entry Date */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 px-3 py-1.5 rounded-lg text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 shadow-sm">
                        {client.assign_date}
                      </div>
                    </td>

                    {/* FollowUp Date */}
                    <td className="py-4 px-4">
                      <div
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm border shadow-sm ${
                          new Date(client.followup_date) < new Date()
                            ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/30'
                            : 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30'
                        }`}
                      >
                        {client.followup_date}
                      </div>
                    </td>

                                   {/* Client Name - Now with enhanced styling */}
                   <td className="py-4 px-4">
                     <div 
                       onClick={() => {
                         setSelectedClientDetails(client);
                         setShowDetailsModal(true);
                       }}
                       className="group cursor-pointer"
                     >
                       <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                         {client.name}
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
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-300 px-3 py-1.5 rounded-lg font-medium text-sm border border-gray-200 dark:border-gray-600 shadow-sm">
                        {client.number}
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                          {client.city || '—'}
                        </div>
                        {client.document_location_link && (
                          <div>
                            <a
                              href={client.document_location_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/30 transition-all duration-200 border border-blue-200 dark:border-blue-700/30 shadow-sm"
                              title="Open location link"
                            >
                              <FontAwesomeIcon
                                icon={faMapMarker}
                                className="w-3 h-3"
                              />
                              <span>Location</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* User Assign */}
                    <td className="py-4 px-4">
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-lg font-semibold text-sm border border-purple-200 dark:border-purple-800/30 shadow-sm text-center">
                        {client.assigned_to}
                      </div>
                    </td>

                  {/* Status Column (Progress Bar) */}
<td className="py-4 px-2">
  <ProgressStatus
    stage={client.stage || client.lead_stage}
    status_percentage={client.status_percentage}
    is_drop_stage={client.is_drop_stage}
    previous_stage={client.previous_stage}
  />
</td>

                    {/* Stage Column */}
                    <td className="py-4 px-4">
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 text-orange-800 dark:text-orange-300 px-3 py-1.5 rounded-lg font-semibold text-sm border border-orange-200 dark:border-orange-800/30 shadow-sm text-center">
                        {client.stage || client.lead_stage || 'N/A'}
                      </div>
                    </td>

                    {/* Remark */}
                    <td className="py-4 px-4">
                      <div className="group relative">
                        <div className="font-medium text-gray-700 dark:text-gray-300 text-sm truncate max-w-[200px]">
                          {client.detailed_remark ||
                            client.detailed_remark ||
                            'N/A'}
                        </div>
                        <button
                          className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-xs transition-colors"
                          onClick={() =>
                            handleShowRemark(
                              client.detailed_remark || client.detailed_remark,
                            )
                          }
                        >
                          More
                        </button>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-1">
                
                        <ActionButton
                          onClick={() => handleEditClick(client)}
                          title="Edit"
                          variant="edit"
                          className="w-8 h-8 hover:scale-105 transition-transform"
                        >
                          <FontAwesomeIcon icon={faEdit} className="text-xs" />
                        </ActionButton>
                      <ActionButton
  onClick={() => handleSingleDelete(client.master_id)}
  title="Delete"
  variant="delete"
  className="w-8 h-8 hover:scale-105 transition-transform"
>
  <FontAwesomeIcon icon={faTrash} className="text-xs" />
</ActionButton>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination (remains unchanged) */}
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
        </div>
      </div>

      {/* Add this after your search input */}
      {(selectedEntryDate ||
        selectedFollowupDate ||
        selectedStages.length > 0 ||
        selectedUsers.length > 0) && (
        <div className="flex items-center gap-2 mt-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active filters:
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedEntryDate && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Entry Date: {selectedEntryDate}
                <button
                  onClick={() => {
                    setSelectedEntryDate('');
                    handleEntryDateChange(''); // This now triggers applyFilters via useEffect
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  ×
                </button>
              </span>
            )}
            {selectedFollowupDate && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Followup: {selectedFollowupDate}
                <button
                  onClick={() => {
                    setSelectedFollowupDate('');
                    handleFollowupDateChange(''); // This now triggers applyFilters via useEffect
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
                  onClick={() => handleStageSelect(stage)} // This removes the stage and triggers applyFilters
                  className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                >
                  ×
                </button>
              </span>
            ))}
            {/* ADDED: User Assigned Active Filters */}
            {selectedUsers.map((user) => (
              <span
                key={user}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
              >
                User: {user}
                <button
                  onClick={() => handleUserSelect(user)} // This removes the user and triggers applyFilters
                  className="ml-1 text-orange-600 hover:text-orange-800 dark:text-orange-400"
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

      {openRemark && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-lg font-bold mb-3">Full Remark</h2>
            <p className="text-gray-800 whitespace-pre-line">{openRemark}</p>

            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setOpenRemark(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}


{openRemark && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg max-w-lg w-full mx-4 my-4 mt-16">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Full Remark</h2>
        <button
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setOpenRemark(null)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        <p className="text-gray-800 dark:text-gray-300 whitespace-pre-line">
          {openRemark || 'No remarks available'}
        </p>
      </div>
      <button
        className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        onClick={() => setOpenRemark(null)}
      >
        Close
      </button>
    </div>
  </div>
)}

      {showImportPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2 sm:px-4">
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-md w-full max-w-lg p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3 mb-4 dark:border-strokedark">
              <h2 className="text-lg sm:text-2xl font-bold dark:text-white">
                Import Bulk Data
              </h2>

              {/* Download Button */}
              <a
                href="/documents/data_import_format.xlsx"
                download
                className="inline-flex items-center gap-2 border px-3 py-2 rounded bg-blue-500 text-white text-sm w-fit"
              >
                <FontAwesomeIcon icon={faDownload} />
                Download Sample
              </a>
            </div>

            {/* Error */}
            {error && !showDuplicateModal && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Input */}
              <input
                type="file"
                accept=".xlsx, .csv"
                onChange={handleFileChange}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={() => setShowImportPopup(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Single Data Popup */}
      <InsertDataModal
        showAddPopup={showAddPopup}
        setShowAddPopup={setShowAddPopup}
        singleFormData={singleFormData}
        setSingleFormData={setSingleFormData}
        categories={categories}
        references={references}
        area={area}
        fetchRawData={fetchRawData}
        setError={setError}
        setDuplicateEntries={setDuplicateEntries}
        setShowDuplicateModal={setShowDuplicateModal}
      />

      {showDetailsModal && renderDetailsModal()} 


      {importErrors.length > 0 && (
  <div className="fixed inset-0 z-[99999] bg-black bg-opacity-75 flex justify-center items-center px-4">
    <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-auto border dark:border-strokedark">
      {/* Header */}
      <div className="flex justify-between items-center border-b mb-4 pb-3 dark:border-strokedark">
        <h2 className="text-xl font-bold dark:text-white text-black">
          Import Errors ({importErrors.length})
        </h2>
        <button
          onClick={() => setImportErrors([])}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
        >
          ×
        </button>
      </div>

      {/* Error Message */}
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">
              {importErrors.length} error(s) found during import
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              Please fix these errors and try again.
            </p>
          </div>
        </div>
      </div>

      {/* Errors List */}
      <div className="space-y-4 mb-6">
        <div className="overflow-y-auto max-h-[300px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
              <tr>
                <th className="p-2 text-left">Row</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Number</th>
                <th className="p-2 text-left">Error Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {importErrors.slice(0, 20).map((error, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-2 font-medium">{error.row}</td>
                  <td className="p-2">{error.name}</td>
                  <td className="p-2 font-mono">{error.number}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {error.reason.includes('Telecaller') ? (
                        <>
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {error.reason}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">
                          {error.reason}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {importErrors.length > 20 && (
            <div className="text-center p-2 text-sm text-gray-500 dark:text-gray-400">
              + {importErrors.length - 20} more errors...
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => {
            // Download errors as CSV
            const csvContent = "data:text/csv;charset=utf-8," 
              + "Row,Name,Number,Error Reason\n"
              + importErrors.map(e => 
                  `${e.row},"${e.name}","${e.number}","${e.reason}"`
                ).join("\n");
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "import_errors.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Error Report
        </button>
        
        <button
          onClick={() => setImportErrors([])}
          className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default RawData;