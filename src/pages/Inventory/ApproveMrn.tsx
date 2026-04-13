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
  faCalendarCheck,
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';
import ApproveMRNModal from './ApproveMRNModal.js';
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

interface MRNItem {
  mpm_id: number;
  prod_id: number;
  model_id: number;
  brand_id: number;
  requested_qty: number;
  verified_qty: number;
  approval_qty: number;
  pending_qty: number;
  status: string;
}

interface Execution {
  execution_id: number;
  schedule_name: string;
}

interface MRNData {
  mrn_id: number;
  mrn_number: string;
  master_id: number;
  qt_id: number;
  expected_date: string | null;
  created_at: string;
  mrn_status: string;
  client_name: string;
  city: string;
  execution: Execution;
  items: MRNItem[];
}

const ApproveMrn = () => {
  // State management
  const [data, setData] = useState<MRNData[]>([]);
  const [filteredData, setFilteredData] = useState<MRNData[]>([]);
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
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMRNData, setEditingMRNData] = useState<any>(null);
  const [approvingMRN, setApprovingMRN] = useState<string | null>(null);
  const [selectedApproveData, setSelectedApproveData] = useState<any>(null);

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

  // Filter out approved/rejected MRNs from display (show only waiting for approval)
  const getDisplayLeads = (allLeads: MRNData[]) => {
    return allLeads.filter(
      (lead) => lead.mrn_status === 'Verified' || lead.mrn_status === 'Approval Pending',
    );
  };

  // Fetch verified MRNs
  const fetchVerifiedMRNs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BASE_URL}api/verified/leads`);
      
      console.log('API Response:', response.data);

      // Handle response structure
      let leads: MRNData[] = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        // Response format: { message: "...", data: [...] }
        leads = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Response format: direct array
        leads = response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Invalid data format received from server');
        setLoading(false);
        return;
      }

      // Transform data to match the expected format
      const transformedLeads = leads.map((lead) => ({
        ...lead,
        // Ensure execution object exists
        execution: lead.execution || { execution_id: 0, schedule_name: 'N/A' },
        // Calculate pending items count
        pending_items: lead.items?.filter(item => item.pending_qty > 0).length || 0,
        total_items: lead.items?.length || 0,
      }));

      setData(transformedLeads);

      // Only show verified leads in filtered data (ready for approval)
      const verifiedLeads = getDisplayLeads(transformedLeads);
      setFilteredData(verifiedLeads);

      // Extract unique values for filters
      const cities: string[] = Array.from(
        new Set(verifiedLeads.map((item) => item.city).filter(Boolean)),
      );

      const schedules: string[] = Array.from(
        new Set(
          verifiedLeads.map((item) => item.execution?.schedule_name).filter(Boolean),
        ),
      );

      setAvailableCities(cities);
      setAvailableSchedules(schedules);
      
    } catch (err: any) {
      console.error('Error fetching verified MRNs:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to fetch verified MRNs. Please try again.',
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
    fetchVerifiedMRNs();
    fetchCategories();
    fetchArea();
  }, []);

  // Handle search and filters
  useEffect(() => {
    // Start with verified leads only
    let filtered = getDisplayLeads(data);

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.mrn_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.city?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCities.length > 0) {
      filtered = filtered.filter((item) => selectedCities.includes(item.city));
    }

    if (selectedSchedules.length > 0) {
      filtered = filtered.filter((item) =>
        selectedSchedules.includes(item.execution?.schedule_name),
      );
    }

    if (selectedStartFromDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.created_at) >= new Date(selectedStartFromDate),
      );
    }
    if (selectedStartToDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.created_at) <= new Date(selectedStartToDate),
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


  // Handle approve click
  const handleApproveClick = (lead: any) => {
    setApprovingMRN(lead.mrn_number);
    
    // Prepare data for approval modal
    const approveData = {
      master_id: lead.master_id,
      mrn_id: lead.mrn_id,
      mrn_number: lead.mrn_number,
      lead: {
        name: lead.client_name,
        city: lead.city,
      },
      items: lead.items || [],
      created_at: lead.created_at,
    };
    
    setSelectedApproveData(approveData);
    setShowApproveModal(true);
    setApprovingMRN(null);
  };

  // Handle save approval
  const handleSaveApproval = async (approvedMRN: any) => {
    try {
      // Call API to approve/reject MRN
      const endpoint = approvedMRN.action === "approved" 
        ? `${BASE_URL}api/approve-mrn/${approvedMRN.mrn_id}`
        : `${BASE_URL}api/reject-mrn/${approvedMRN.mrn_id}`;
      
      await axios.post(endpoint, {
        approval_notes: approvedMRN.approval_notes || approvedMRN.rejection_notes,
        approved_by: approvedMRN.approved_by || "Current User",
      });

      // Update local state
      setData((prevData) => {
        const updatedData = prevData.map((item) =>
          item.mrn_id === approvedMRN.mrn_id
            ? {
                ...item,
                mrn_status: approvedMRN.action === "approved" ? "Approved" : "Rejected",
                approval_date: new Date().toISOString(),
                approved_by: approvedMRN.approved_by || "Current User",
                approval_notes: approvedMRN.approval_notes || approvedMRN.rejection_notes,
              }
            : item
        );

        // Update filtered data based on latest state
        const updatedFilteredData = getDisplayLeads(updatedData);
        setFilteredData(updatedFilteredData);

        // Update filter options
        const cities = Array.from(
          new Set(updatedFilteredData.map((item) => item.city).filter(Boolean))
        );
        const schedules = Array.from(
          new Set(
            updatedFilteredData.map((item) => item.execution?.schedule_name).filter(Boolean)
          )
        );

        setAvailableCities(cities);
        setAvailableSchedules(schedules);

        return updatedData;
      });

      // Close modal
      setShowApproveModal(false);
      setSelectedApproveData(null);
      
      alert(
        `MRN ${approvedMRN.action === "approved" ? "Approved" : "Rejected"} Successfully!\nMRN No: ${approvedMRN.mrn_number}`
      );
      
    } catch (err) {
      console.error('Error updating MRN:', err);
      alert('Failed to update MRN. Please try again.');
    }
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get MRN status badge
  const getMRNStatusBadge = (lead: any) => {
    if (lead.mrn_status === 'Approved') {
      return (
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/30">
          <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1.5" />
          Approved
        </div>
      );
    }

    if (lead.mrn_status === 'Rejected') {
      return (
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800/30">
          <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3 mr-1.5" />
          Rejected
        </div>
      );
    }

    if (lead.mrn_status === 'Verified') {
      return (
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
          <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1.5" />
          Verified - Ready for Approval
        </div>
      );
    }

    if (lead.mrn_status === 'Approval Pending') {
      return (
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/30">
          <FontAwesomeIcon icon={faClock} className="w-3 h-3 mr-1.5" />
          Approval Pending
        </div>
      );
    }

    return (
      <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        <FontAwesomeIcon icon={faClock} className="w-3 h-3 mr-1.5" />
        {lead.mrn_status || 'Pending'}
      </div>
    );
  };

  // Get item status summary
  const getItemStatusSummary = (items: MRNItem[]) => {
    if (!items || items.length === 0) return null;
    
    const pendingApproval = items.filter(item => item.status === 'Approval Pending').length;
    const verified = items.filter(item => item.verified_qty > 0).length;
    const total = items.length;
    
    if (pendingApproval === total) {
      return <span className="text-xs text-yellow-600">All items pending approval</span>;
    } else if (verified === total) {
      return <span className="text-xs text-green-600">All items verified</span>;
    } else {
      return <span className="text-xs text-blue-600">{verified}/{total} items verified</span>;
    }
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
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="w-4 h-4 mr-1"
                />
                MRN Approval - {filteredData.length} Pending Records
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
                    placeholder="Search MRN, name, city..."
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
            <button
              onClick={fetchVerifiedMRNs}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
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
                        Created Date
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
                            Select Created Date Range
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
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="h-12 w-12 mx-auto mb-4 opacity-50"
                        />
                        <p className="text-lg font-medium">
                          No pending MRN records found
                        </p>
                        <p className="text-sm mt-2">
                          All MRNs have been processed
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((lead) => (
                    <tr
                      key={lead.mrn_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Created Date */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                          {formatDate(lead.created_at)}
                        </div>
                      </td>

                      {/* Client Details */}
                      <td className="py-4 px-4">
                        <div className="group cursor-pointer">
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                            {lead.client_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            ID: {lead.master_id || '—'}
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
                          {lead.execution?.schedule_name || 'N/A'}
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
                          {/* Approve Button - Show only for Verified MRNs */}
                          {(lead.mrn_status === 'Verified' || lead.mrn_status === 'Approval Pending') && (
                            <button
                              onClick={() => handleApproveClick(lead)}
                              disabled={approvingMRN === lead.mrn_number}
                              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1 disabled:opacity-50"
                            >
                              {approvingMRN === lead.mrn_number ? (
                                <>
                                  <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="h-3 w-3 animate-spin"
                                  />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="h-3 w-3"
                                  />
                                  Approve
                                </>
                              )}
                            </button>
                          )}

                        
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

          {/* Approve MRN Modal */}
          {showApproveModal && selectedApproveData && (
            <ApproveMRNModal
              data={selectedApproveData}
              onClose={() => {
                setShowApproveModal(false);
                setSelectedApproveData(null);
                setApprovingMRN(null);
              }}
              onSave={fetchVerifiedMRNs}
            />
          )}

    
        </>
      )}
    </div>
  );
};

export default ApproveMrn;