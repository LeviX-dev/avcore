import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faTimes,
  faChevronDown,
  faFilter,
  faEdit,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faClock,
  faFileAlt,
  faMapMarkerAlt,
  faIdCard,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';
import VerifyMRNModal from './VerifyMRNModal.js';
import EditVerifyModal from './EditVerifyModal.js';

// Define interfaces
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
  assign_id: any;
  id: number;
  master_id: number;
  name: string;
  number: string;
  alternate_number?: string;
  email: string;
  address: string;
  area: string;
  area_id: string;
  status: string;
  cat_name: string;
  cat_id: number;
  reference_name: string;
  reference_id: number;
  reference?: string | number;
  city?: string;
  location_link?: string;
  room_length: string;
  room_width: string;
  room_height: string;
  p_type?: string;
  budget_range?: string;
  current_stage?: string;
  time_to_complete?: string;
  site_visit_date?: string;
  demo_date?: string;
  ar_number?: string;
  architect_name?: string;
  ca_number?: string;
  e_number?: string;
  sm_number?: string;
  pop_number?: string;
  other_number?: string;
  lead_stage?: string;
  quick_remark?: string;
  detailed_remark?: string;
  followup_date?: string;
  assign_date?: string;
  assigned_to: string[];
  reassignment_date?: string;
  category_other?: string;
  reference_other?: string;
  reassignment_remarks?: ReassignmentRemark[];
}

interface ReassignmentRemark {
  assignedTo?: string;
  leadStage?: string;
  reassignment_date?: string;
  remark?: string;
  created_by_user?: number;
  created_at?: string;
  name?: string;
  role?: string;
}

const VerifyMrn = () => {
  // State management
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [selectedStartFromDate, setSelectedStartFromDate] = useState('');
  const [selectedStartToDate, setSelectedStartToDate] = useState('');

  // Available filter options
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableSchedules, setAvailableSchedules] = useState<string[]>([]);

  // UI states
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [showScheduleFilter, setShowScheduleFilter] = useState(false);
  const [customRecordCount, setCustomRecordCount] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMRNData, setEditingMRNData] = useState<any>(null);
  const [verifyingMRN, setVerifyingMRN] = useState<string | null>(null);
  const [selectedVerifyData, setSelectedVerifyData] = useState<any>(null);

  // NEW: States for UpdateRawData modal
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Refs for dropdowns
  const startDateRef = useRef<HTMLDivElement>(null);
  const cityFilterRef = useRef<HTMLDivElement>(null);
  const scheduleFilterRef = useRef<HTMLDivElement>(null);

  // States for categories, references, area
  const [categories, setCategories] = useState<Category[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [area, setArea] = useState<Area[]>([]);

  // Static MRN data for verification modal
  const staticMRNData = {
    master_id: 4806,
    mrn_number: 'MRN-0001',
    lead: {
      name: 'Yogesh Jaju',
      number: '9545527123',
      city: 'Pune',
    },
    quotations: [
      {
        qt_id: 101,
        qt_number: 'QT-0002',
        total_price: 285230,
        kits: [
          {
            kit_name: 'XTZ E-IW8 SPEAKER LCR (Made in Sweden)',
            items: [
              {
                model: '3-Way In-Wall Speaker',
                brand_name: 'XTZ',
                description:
                  'Aluminum-magnesium tweeter, 5-inch fiberglass mid & woofer',
                prod_qty: 3,
                prod_price: 69200,
                total: 207600,
              },
            ],
          },
          {
            kit_name: 'XTZ Cinema S2 Atmos Surround Speaker',
            items: [
              {
                model: 'Atmos Surround Speaker',
                brand_name: 'XTZ',
                description:
                  '16mm soft dome tweeter, 5.25-inch woofer, 75W continuous',
                prod_qty: 1,
                prod_price: 61730,
                total: 61730,
              },
            ],
          },
          {
            kit_name: 'Dolby Atmos Ceiling Speaker',
            items: [
              {
                model: 'Ceiling Speaker',
                brand_name: 'Dolby',
                description: '0.75 inch tweeter, 6.5 inch coaxial woofer',
                prod_qty: 1,
                prod_price: 15900,
                total: 15900,
              },
            ],
          },
        ],
      },
    ],
  };

  // Filter out verified MRNs from display
  const getDisplayLeads = (allLeads: any[]) => {
    return allLeads.filter(lead => lead.mrn_verified !== true && lead.status !== 'verified');
  };

  // Fetch outward leads
  const fetchOutwardLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BASE_URL}api/sujit/execution/getleads`);

      const leads: any[] = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      // Add MRN data for demo
      const leadsWithMRN = leads.map((lead, index) => ({
        ...lead,
        mrn_number:
          lead.mrn_number || `MRN${String(index + 1).padStart(6, '0')}`,
        mrn_verified: index % 3 === 0 ? true : false, // Set some as verified for demo
        status: index % 3 === 0 ? 'verified' : 'pending',
      }));

      setData(leadsWithMRN);
      
      // Only show unverified leads in filtered data
      const unverifiedLeads = getDisplayLeads(leadsWithMRN);
      setFilteredData(unverifiedLeads);

      // Extract unique values for filters
      const cities: string[] = Array.from(
        new Set(unverifiedLeads.map((item: any) => item.city).filter(Boolean)),
      );

      const schedules: string[] = Array.from(
        new Set(
          unverifiedLeads.map((item: any) => item.schedule_name).filter(Boolean),
        ),
      );

      setAvailableCities(cities);
      setAvailableSchedules(schedules);
    } catch (err: any) {
      console.error('Error fetching outward leads:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to fetch outward leads. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories, references, area
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };



  const fetchArea = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/area`);
      setArea(response.data);
    } catch (error) {
      console.error('Error fetching area:', error);
    }
  };

  useEffect(() => {
    fetchOutwardLeads();
    fetchCategories();
    fetchArea();
  }, []);

  // Handle search and filters
  useEffect(() => {
    // Start with unverified leads only
    let filtered = getDisplayLeads(data);

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.number?.includes(searchTerm) ||
          item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.mrn_number?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCities.length > 0) {
      filtered = filtered.filter((item) => selectedCities.includes(item.city));
    }

    if (selectedSchedules.length > 0) {
      filtered = filtered.filter((item) =>
        selectedSchedules.includes(item.schedule_name),
      );
    }

    if (selectedStartFromDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.execution_start_date) >=
          new Date(selectedStartFromDate),
      );
    }
    if (selectedStartToDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.execution_start_date) <= new Date(selectedStartToDate),
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [
    data,
    searchTerm,
    selectedCities,
    selectedSchedules,
    selectedStartFromDate,
    selectedStartToDate,
  ]);

  // Handle edit click
// In VerifyMrn.tsx - Update the handleEditClick function
const handleEditClick = (lead: any) => {
  // Check if lead has quotations data
  if (lead.quotations && lead.quotations.length > 0) {
    // Use existing quotations data
    setEditingMRNData({
      master_id: lead.master_id,
      mrn_number: lead.mrn_number,
      lead: {
        name: lead.name || '',
        number: lead.number || '',
        city: lead.city || '',
      },
      quotations: lead.quotations,
      verification_notes: lead.verification_notes || '',
    });
  } else {
    // Create sample quotations data if none exists
    // This is just for demo - in production, you'd fetch actual quotations
    setEditingMRNData({
      master_id: lead.master_id,
      mrn_number: lead.mrn_number,
      lead: {
        name: lead.name || '',
        number: lead.number || '',
        city: lead.city || '',
      },
      quotations: [
        {
          qt_id: 101,
          qt_number: 'QT-00' + (lead.master_id || '1'),
          kits: [
            {
              kit_name: 'Sample Kit',
              items: [
                {
                  id: 1,
                  model: 'Sample Product',
                  brand_name: 'Sample Brand',
                  prod_price: 1000,
                  prod_qty: 1,
                  description: 'Sample description',
                }
              ]
            }
          ]
        }
      ],
      verification_notes: lead.verification_notes || '',
    });
  }
  
  setShowEditModal(true);
};

  // Handle verify click
  const handleVerifyClick = (lead: any) => {
    // Prepare data for verification modal
    const verifyData = {
      ...staticMRNData,
      master_id: lead.master_id,
      mrn_number: lead.mrn_number,
      lead: {
        name: lead.name,
        number: lead.number,
        city: lead.city
      }
    };
    setSelectedVerifyData(verifyData);
    setShowVerifyModal(true);
  };

  // Handle save verification
  const handleSaveVerification = (verifiedMRN: any) => {
    // Update the data state to mark MRN as verified
    setData(prevData =>
      prevData.map(item =>
        item.master_id === verifiedMRN.master_id
          ? { 
              ...item, 
              mrn_verified: true, 
              status: 'verified',
              verified_date: new Date().toISOString(),
              verified_by: verifiedMRN.verified_by || 'Current User'
            }
          : item
      )
    );

    // Update available filters based on new data
    const updatedUnverifiedLeads = getDisplayLeads(
      data.map(item =>
        item.master_id === verifiedMRN.master_id
          ? { ...item, mrn_verified: true, status: 'verified' }
          : item
      )
    );

    // Update filter options
    const cities: string[] = Array.from(
      new Set(updatedUnverifiedLeads.map((item: any) => item.city).filter(Boolean)),
    );
    const schedules: string[] = Array.from(
      new Set(
        updatedUnverifiedLeads.map((item: any) => item.schedule_name).filter(Boolean),
      ),
    );

    setAvailableCities(cities);
    setAvailableSchedules(schedules);

    // Close the modal
    setShowVerifyModal(false);
    setSelectedVerifyData(null);
    
    // Show success message
    alert(`MRN Verified Successfully!\nMRN No: ${verifiedMRN.mrn_number}`);
  };

  // Close edit popup
  const closeEditPopup = () => {
    setShowEditPopup(false);
    setEditingClient(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCities([]);
    setSelectedSchedules([]);
    setSelectedStartFromDate('');
    setSelectedStartToDate('');
    setCustomRecordCount('');
    setItemsPerPage(10);
  };

  // Handle custom record count
  const handleCustomRecordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomRecordCount(value);
    if (value && !isNaN(Number(value)) && Number(value) > 0) {
      setItemsPerPage(Number(value));
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get MRN status badge
  const getMRNStatusBadge = (lead) => {
    const isVerified = lead.mrn_verified === true || lead.status === 'verified';

    if (isVerified) {
      return (
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/30">
          <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1.5" />
          Verified
        </div>
      );
    }

    return (
      <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/30">
        <FontAwesomeIcon icon={faClock} className="w-3 h-3 mr-1.5" />
        Pending Verification
      </div>
    );
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowStartCalendar(false);
    setShowCityFilter(false);
    setShowScheduleFilter(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        startDateRef.current &&
        !startDateRef.current.contains(event.target as Node)
      ) {
        setShowStartCalendar(false);
      }
      if (
        cityFilterRef.current &&
        !cityFilterRef.current.contains(event.target as Node)
      ) {
        setShowCityFilter(false);
      }
      if (
        scheduleFilterRef.current &&
        !scheduleFilterRef.current.contains(event.target as Node)
      ) {
        setShowScheduleFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    showingStart,
    showingEnd,
  }: any) => {
    const renderPageNumbers = () => {
      const pageNumbers = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              currentPage === i
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {i}
          </button>,
        );
      }
      return pageNumbers;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {showingStart}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {showingEnd}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalItems}
          </span>{' '}
          results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">{renderPageNumbers()}</div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const showingStart = filteredData.length === 0 ? 0 : indexOfFirstItem + 1;
  const showingEnd = Math.min(indexOfLastItem, filteredData.length);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4 rounded-lg">
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30">
                <FontAwesomeIcon icon={faIdCard} className="w-4 h-4 mr-1" />
                MRN Verification - {filteredData.length} Pending Records
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Custom Record Count Input */}
              <div className="w-full sm:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className="h-4 w-4 text-gray-400"
                    />
                  </div>
                  <input
                    type="number"
                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                      <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Input */}
              <div className="w-full sm:w-72">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="h-4 w-4 text-gray-400"
                    />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Search MRN, name, phone, city..."
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
                onClick={fetchOutwardLeads}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
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
                
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedStartFromDate ||
        selectedStartToDate ||
        selectedCities.length > 0 ||
        selectedSchedules.length > 0) && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-white dark:bg-boxdark rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active filters:
          </span>
          <div className="flex flex-wrap gap-2">
            {(selectedStartFromDate || selectedStartToDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Start: {formatDate(selectedStartFromDate) || 'Any'} to{' '}
                {formatDate(selectedStartToDate) || 'Any'}
                <button
                  onClick={() => {
                    setSelectedStartFromDate('');
                    setSelectedStartToDate('');
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCities.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
                {city}
                <button
                  onClick={() =>
                    setSelectedCities((prev) => prev.filter((c) => c !== city))
                  }
                  className="ml-1 text-teal-600 hover:text-teal-800 dark:text-teal-400"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedSchedules.map((schedule) => (
              <span
                key={schedule}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
              >
                {schedule}
                <button
                  onClick={() =>
                    setSelectedSchedules((prev) =>
                      prev.filter((s) => s !== schedule),
                    )
                  }
                  className="ml-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="ml-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-red-600 dark:text-red-400">
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="h-12 w-12 mx-auto mb-4"
            />
            <p className="text-lg font-medium">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <tr>
                  <th className="py-3 px-4 relative">
                    <div
                      ref={startDateRef}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Start Date
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAllDropdowns();
                          setShowStartCalendar(!showStartCalendar);
                        }}
                        className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`h-3 w-3 transition-transform duration-200 ${
                            showStartCalendar ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Start Date Calendar Dropdown */}
                    {showStartCalendar && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">
                            Select Start Date Range
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStartFromDate('');
                              setSelectedStartToDate('');
                              setShowStartCalendar(false);
                            }}
                            className="text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 transition-colors"
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
                              value={selectedStartFromDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedStartFromDate(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              To Date
                            </label>
                            <input
                              type="date"
                              value={selectedStartToDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedStartToDate(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowStartCalendar(false);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Apply Filter
                          </button>
                        </div>
                      </div>
                    )}
                  </th>

                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Client Details
                    </div>
                  </th>

                  <th className="py-3 px-4 relative">
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
                        className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faFilter}
                          className={`h-3 w-3 transition-colors duration-200 ${
                            selectedCities.length > 0 ? 'text-purple-600' : ''
                          } ${showCityFilter ? 'text-purple-600' : ''}`}
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
                              }}
                              className="text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 transition-colors"
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
                          availableCities.map((city) => (
                            <div key={city} className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                id={`city-${city}`}
                                checked={selectedCities.includes(city)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setSelectedCities((prev) =>
                                    prev.includes(city)
                                      ? prev.filter((c) => c !== city)
                                      : [...prev, city],
                                  );
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-3.5 w-3.5 mr-2.5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500"
                              />
                              <label
                                htmlFor={`city-${city}`}
                                className="text-sm font-medium dark:text-white cursor-pointer truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              >
                                {city}
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
                            No cities available
                          </div>
                        )}
                      </div>
                    )}
                  </th>

                  <th className="py-3 px-4 relative">
                    <div
                      ref={scheduleFilterRef}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Schedule
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAllDropdowns();
                          setShowScheduleFilter(!showScheduleFilter);
                        }}
                        className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faFilter}
                          className={`h-3 w-3 transition-colors duration-200 ${
                            selectedSchedules.length > 0
                              ? 'text-purple-600'
                              : ''
                          } ${showScheduleFilter ? 'text-purple-600' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Schedule Filter Dropdown */}
                    {showScheduleFilter && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">
                            Filter Schedules
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSchedules([]);
                              }}
                              className="text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 transition-colors"
                            >
                              Clear All
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowScheduleFilter(false);
                              }}
                              className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        {availableSchedules.length > 0 ? (
                          availableSchedules.map((schedule) => (
                            <div
                              key={schedule}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                id={`schedule-${schedule}`}
                                checked={selectedSchedules.includes(schedule)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setSelectedSchedules((prev) =>
                                    prev.includes(schedule)
                                      ? prev.filter((s) => s !== schedule)
                                      : [...prev, schedule],
                                  );
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-3.5 w-3.5 mr-2.5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500"
                              />
                              <label
                                htmlFor={`schedule-${schedule}`}
                                className="text-sm font-medium dark:text-white cursor-pointer truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              >
                                {schedule}
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
                            No schedules available
                          </div>
                        )}
                      </div>
                    )}
                  </th>

                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      MRN Number
                    </div>
                  </th>

                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </div>
                  </th>

                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="h-12 w-12 mx-auto mb-4 opacity-50"
                        />
                        <p className="text-lg font-medium">
                          No pending MRN records found
                        </p>
                        <p className="text-sm mt-2">
                          All MRNs have been verified
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((lead) => (
                    <tr
                      key={lead.master_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Execution Start Date */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                          {formatDate(lead.execution_start_date)}
                        </div>
                      </td>

                      {/* Client Details */}
                      <td className="py-4 px-4">
                        <div
                          className="group cursor-pointer"
                          onClick={() => {/* Handle view details */}}
                        >
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                            {lead.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {lead.number || '—'}
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-gray-400 text-xs"
                          />
                          {lead.city || '—'}
                        </div>
                      </td>

                      {/* Schedule Name */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {lead.schedule_name || 'N/A'}
                        </div>
                      </td>

                      {/* MRN Number */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                            {lead.mrn_number || '—'}
                          </span>
                        </div>
                      </td>

                      {/* MRN Status */}
                      <td className="py-4 px-4">{getMRNStatusBadge(lead)}</td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {/* Verify Button */}
                          <button
                            onClick={() => handleVerifyClick(lead)}
                            disabled={verifyingMRN === lead.mrn_number}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1 disabled:opacity-50"
                          >
                            {verifyingMRN === lead.mrn_number ? (
                              <>
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  className="h-3 w-3 animate-spin"
                                />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="h-3 w-3"
                                />
                                Verify
                              </>
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(lead)}
                            className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-colors duration-200"
                            title="Edit MRN"
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="h-3.5 w-3.5"
                            />
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
              onPageChange={setCurrentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              showingStart={showingStart}
              showingEnd={showingEnd}
            />
          )}

          {/* Verify MRN Modal */}
          {showVerifyModal && selectedVerifyData && (
            <VerifyMRNModal
              data={selectedVerifyData}
              onClose={() => {
                setShowVerifyModal(false);
                setSelectedVerifyData(null);
              }}
              onSave={handleSaveVerification}
            />
          )}

          {/* Edit MRN Modal */}
          {showEditModal && editingMRNData && (
            <EditVerifyModal
              data={editingMRNData}
              onClose={() => {
                setShowEditModal(false);
                setEditingMRNData(null);
              }}
              onSave={(updatedData) => {
                console.log('Saved data:', updatedData);
                fetchOutwardLeads();
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default VerifyMrn;