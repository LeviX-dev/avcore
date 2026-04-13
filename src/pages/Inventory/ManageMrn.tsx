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
  faTruck,
  faBoxOpen,
  faClipboardList,
  faCheckDouble,
} from '@fortawesome/free-solid-svg-icons';
import MaterialIssueModal from './MaterialIssueModal.js';
import MrnHistoryLogs from './MrnHistoryLogs.js';
import { BASE_URL } from '../../../public/config.js';
import { useNavigate } from 'react-router-dom';

interface MRNItem {
  mpm_id: number;
  prod_id: number;
  model_id: number;
  brand_id: number;
  brand_name: string;
  model_no: string;
  requested_qty: number;
  verified_qty: number;
  approval_qty: number;
  purchase_qty: number;
  issued_qty: number;
  remaining_qty: number;
  item_status: string;
}

interface MRNData {
  mrn_id: number;
  mrn_number: string;
  mrn_status: string;
  master_id: number;
  qt_id: number;
  created_at: string;
  client_name: string;
  city: string;
  items: MRNItem[];
}

const ManageMrn = () => {
  // State management
  const [data, setData] = useState<MRNData[]>([]);
  const [filteredData, setFilteredData] = useState<MRNData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedStartFromDate, setSelectedStartFromDate] = useState('');
  const [selectedStartToDate, setSelectedStartToDate] = useState('');

  // Available filter options
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // UI states
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [customRecordCount, setCustomRecordCount] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [issuingMRN, setIssuingMRN] = useState<string | null>(null);
  const [selectedIssueData, setSelectedIssueData] = useState<any>(null);
  const [selectedHistoryLead, setSelectedHistoryLead] = useState<any>(null);
  const navigate = useNavigate();
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Refs for dropdowns
  const startDateRef = useRef<HTMLDivElement>(null);
  const cityFilterRef = useRef<HTMLDivElement>(null);

  // Fetch issuable MRNs from API
  const fetchIssuableMRNs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BASE_URL}api/issuable/mrn`, {
        withCredentials: true,
      });

      if (response.data?.success && response.data?.data) {
        const issuableMRNs = response.data.data;
        setData(issuableMRNs);
        setFilteredData(issuableMRNs);

        // Extract unique values for filters
        const cities: string[] = Array.from(
          new Set(
            issuableMRNs.map((item: MRNData) => item.city).filter(Boolean),
          ),
        );

        setAvailableCities(cities);
      } else {
        setError('Failed to fetch issuable MRNs');
      }
    } catch (err: any) {
      console.error('Error fetching issuable MRNs:', err);
      setError(
        err.response?.data?.message ||
          'Failed to fetch issuable MRNs. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuableMRNs();
  }, []);

  // Handle search and filters
  useEffect(() => {
    let filtered = [...data];

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

    if (selectedStartFromDate) {
      filtered = filtered.filter(
        (item) => new Date(item.created_at) >= new Date(selectedStartFromDate),
      );
    }
    if (selectedStartToDate) {
      filtered = filtered.filter(
        (item) => new Date(item.created_at) <= new Date(selectedStartToDate),
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [
    data,
    searchTerm,
    selectedCities,
    selectedStartFromDate,
    selectedStartToDate,
  ]);

  const handleViewClick = (lead: MRNData) => {
    setSelectedHistoryLead(lead);
    setShowHistoryModal(true);
  };

  const handleViewMRN = (mrnNumber) => {
    navigate(`/mrn/view/${mrnNumber}`);
  };

  // Handle material issue click - using the data from the API
  const handleIssueClick = (lead: MRNData) => {
    // Prepare data for material issue modal
    const issueData = {
      mrn_id: lead.mrn_id,
      mrn_number: lead.mrn_number,
      mrn_status: lead.mrn_status,
      created_at: lead.created_at,
      master_id: lead.master_id,
      client_name: lead.client_name,
      city: lead.city,
      items: lead.items.map((item) => ({
        ...item,
        issue_status:
          item.item_status === 'Ready to Issue'
            ? 'Not Issued'
            : item.item_status,
      })),
    };
    setSelectedIssueData(issueData);
    setIssuingMRN(lead.mrn_number);
    setShowIssueModal(true);
  };

  // Handle save material issue
  const handleSaveIssue = (issuedMRN: any) => {
    // Refresh the list after issuing
    fetchIssuableMRNs();
    setShowIssueModal(false);
    setSelectedIssueData(null);
    setIssuingMRN(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCities([]);
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
  const getMRNStatusBadge = (lead: MRNData) => {
    if (lead.mrn_status === 'Approved') {
      return (
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/30">
          <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1.5" />
          Approved
        </div>
      );
    }

    if (lead.mrn_status === 'Partially Issued') {
      return (
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800/30">
          <FontAwesomeIcon icon={faBoxOpen} className="w-3 h-3 mr-1.5" />
          Partially Issued
        </div>
      );
    }

    return (
      <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
        <FontAwesomeIcon icon={faClock} className="w-3 h-3 mr-1.5" />
        {lead.mrn_status || 'Pending'}
      </div>
    );
  };

  // Get item status summary for display
  const getItemStatusSummary = (items: MRNItem[]) => {
    const readyToIssue = items.filter(
      (item) => item.item_status === 'Ready to Issue',
    ).length;
    const waitingPurchase = items.filter(
      (item) => item.item_status === 'Waiting Purchase',
    ).length;
    const partiallyIssued = items.filter(
      (item) => item.item_status === 'Partially Issued',
    ).length;
    const issued = items.filter((item) => item.item_status === 'Issued').length;

    if (readyToIssue > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          {readyToIssue} Ready to Issue
        </span>
      );
    }
    if (waitingPurchase > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          {waitingPurchase} Waiting Purchase
        </span>
      );
    }
    if (partiallyIssued > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
          {partiallyIssued} Partially Issued
        </span>
      );
    }
    if (issued > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {issued} Issued
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        {items.length} Items
      </span>
    );
  };

  // Check if MRN is issuable (has any items ready to issue)
  const isIssuable = (lead: MRNData) => {
    return lead.items.some((item) => item.item_status === 'Ready to Issue');
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowStartCalendar(false);
    setShowCityFilter(false);
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
                  icon={faClipboardList}
                  className="w-4 h-4 mr-1"
                />
                Manage MRN - Issuable
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
        selectedCities.length > 0) && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-white dark:bg-boxdark rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active filters:
          </span>
          <div className="flex flex-wrap gap-2">
            {(selectedStartFromDate || selectedStartToDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Created: {formatDate(selectedStartFromDate) || 'Any'} to{' '}
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

                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      MRN Number
                    </div>
                  </th>

                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Items
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
                          No issuable MRN records found
                        </p>
                        <p className="text-sm mt-2">
                          All issuable MRNs will appear here
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
                        <div className="group">
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

                      {/* MRN Number */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                            {lead.mrn_number || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Items Summary */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {lead.items?.length || 0}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                              item(s)
                            </span>
                          </div>
                          <div>{getItemStatusSummary(lead.items)}</div>
                        </div>
                      </td>

                      {/* MRN Status */}
                      <td className="py-4 px-4">{getMRNStatusBadge(lead)}</td>

                    
                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {/* Issue Material Button */}
                          <button
                            onClick={() => handleIssueClick(lead)}
                            disabled={
                              issuingMRN === lead.mrn_number ||
                              !isIssuable(lead)
                            }
                            className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm flex items-center gap-1 disabled:opacity-50 ${
                              isIssuable(lead)
                                ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-md'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            title={
                              isIssuable(lead)
                                ? 'Issue Material'
                                : 'No items ready to issue'
                            }
                          >
                            {issuingMRN === lead.mrn_number ? (
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
                                  icon={faTruck}
                                  className="h-3 w-3"
                                />
                                Issue Material
                              </>
                            )}
                          </button>

                          {/* History Logs Button */}
                          <button
                            onClick={() => handleViewClick(lead)}
                            className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                            title="View History Logs"
                          >
                            <FontAwesomeIcon
                              icon={faClock}
                              className="h-3.5 w-3.5"
                            />
                          </button>

                          {/* View Details Button - Navigate to MRN Details Page */}
                          <button
                            onClick={() => handleViewMRN(lead.mrn_number)}
                            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                            title="View MRN Details"
                          >
                            <FontAwesomeIcon
                              icon={faEye}
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
        </>
      )}

      {/* Material Issue Modal */}
      {showIssueModal && selectedIssueData && (
        <MaterialIssueModal
          data={selectedIssueData}
          onClose={() => {
            setShowIssueModal(false);
            setSelectedIssueData(null);
            setIssuingMRN(null);
          }}
          onSave={handleSaveIssue}
        />
      )}

      {/* MRN History Logs Modal */}
      {showHistoryModal && selectedHistoryLead && (
        <MrnHistoryLogs
          lead={selectedHistoryLead}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedHistoryLead(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageMrn;
