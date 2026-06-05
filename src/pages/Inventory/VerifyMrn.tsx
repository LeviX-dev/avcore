import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@fortawesome/free-solid-svg-icons';
import { FaEye } from 'react-icons/fa';
import { BASE_URL } from '../../../public/config.js';
import VerifyMRNModal from './VerifyMRNModal.js';
import EditVerifyModal from './EditVerifyModal.js';

// Define interfaces based on API response
interface MRNItem {
  mpm_id: number;
  prod_id: number;
  model_id: number;
  brand_id: number;
  required_qty: number;
  issued_qty: number;
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

const VerifyMrn = () => {
  // State management
  const [data, setData] = useState<MRNData[]>([]);
  const [filteredData, setFilteredData] = useState<MRNData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [selectedDateFrom, setSelectedDateFrom] = useState('');
  const [selectedDateTo, setSelectedDateTo] = useState('');

  // Available filter options
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableSchedules, setAvailableSchedules] = useState<string[]>([]);

  // UI states
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [showScheduleFilter, setShowScheduleFilter] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMRNData, setEditingMRNData] = useState<MRNData | null>(null);
  const [verifyingMRN, setVerifyingMRN] = useState<string | null>(null);
  const [selectedVerifyData, setSelectedVerifyData] = useState<any>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Refs for dropdowns
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const cityFilterRef = useRef<HTMLDivElement>(null);
  const scheduleFilterRef = useRef<HTMLDivElement>(null);

  // Format date - only date without time
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format date for display in filters
  const formatFilterDate = (dateString: string) => {
    if (!dateString) return 'Any';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Fetch MRN data from API
  const fetchMRNData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${BASE_URL}api/verification/pending`);

      if (response.data && response.data.data) {
        const mrnData = response.data.data;
        setData(mrnData);
        setFilteredData(mrnData);

        // Extract unique cities and schedules for filters
        const cities: string[] = Array.from(
          new Set(
            mrnData
              .map((item: MRNData) => item.city)
              .filter(
                (city): city is string =>
                  typeof city === 'string' && city.length > 0,
              ),
          ),
        );

        const schedules: string[] = Array.from(
          new Set(
            mrnData
              .map((item: MRNData) => item.execution?.schedule_name)
              .filter(
                (s): s is string => typeof s === 'string' && s.length > 0,
              ),
          ),
        );
        setAvailableCities(cities);
        setAvailableSchedules(schedules);
      } else {
        setError('No data received from API');
      }
    } catch (err: any) {
      console.error('Error fetching MRN data:', err);
      setError(err.response?.data?.message || 'Failed to fetch MRN data');
    } finally {
      setLoading(false);
    }
  };

  // Handle search and filters
  useEffect(() => {
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.mrn_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.city?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // City filter
    if (selectedCities.length > 0) {
      filtered = filtered.filter((item) => selectedCities.includes(item.city));
    }

    // Schedule filter
    if (selectedSchedules.length > 0) {
      filtered = filtered.filter((item) =>
        selectedSchedules.includes(item.execution?.schedule_name),
      );
    }

    // Date filter (using created_at) - compare only dates without time
    if (selectedDateFrom) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at);
        const fromDate = new Date(selectedDateFrom);
        // Reset time to midnight for comparison
        itemDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        return itemDate >= fromDate;
      });
    }
    if (selectedDateTo) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at);
        const toDate = new Date(selectedDateTo);
        itemDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return itemDate <= toDate;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [
    data,
    searchTerm,
    selectedCities,
    selectedSchedules,
    selectedDateFrom,
    selectedDateTo,
  ]);

  // Handle verify click
  const handleVerifyClick = (mrn: MRNData) => {
    const verifyData = {
      mrn_id: mrn.mrn_id,
      mrn_number: mrn.mrn_number,
      master_id: mrn.master_id,
      client_name: mrn.client_name,
      city: mrn.city,
      execution: mrn.execution,
      items: mrn.items,
    };
    setSelectedVerifyData(verifyData);
    setShowVerifyModal(true);
  };

  // Handle edit click
  const handleEditClick = (mrn: MRNData) => {
    setEditingMRNData(mrn);
    setShowEditModal(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCities([]);
    setSelectedSchedules([]);
    setSelectedDateFrom('');
    setSelectedDateTo('');
    setItemsPerPage(10);
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowDateFilter(false);
    setShowCityFilter(false);
    setShowScheduleFilter(false);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dateFilterRef.current &&
        !dateFilterRef.current.contains(event.target as Node)
      ) {
        setShowDateFilter(false);
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

  // Fetch data on component mount
  useEffect(() => {
    fetchMRNData();
  }, []);

  const handleViewMRN = (mrnNumber) => {
    navigate(`/mrn/view/${mrnNumber}`);
  };

  // Get MRN status badge
  const getMRNStatusBadge = (mrn: MRNData) => {
    if (mrn.mrn_status === 'Verified') {
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
        {mrn.mrn_status || 'Verification Pending'}
      </div>
    );
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
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
              {/* Items Per Page Input */}
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
                    value={itemsPerPage}
                    onChange={(e) =>
                      setItemsPerPage(
                        Math.max(1, parseInt(e.target.value) || 10),
                      )
                    }
                    min="1"
                  />
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
                    placeholder="Search by name, MRN, city..."
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
      {(selectedDateFrom ||
        selectedDateTo ||
        selectedCities.length > 0 ||
        selectedSchedules.length > 0) && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-white dark:bg-boxdark rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active filters:
          </span>
          <div className="flex flex-wrap gap-2">
            {(selectedDateFrom || selectedDateTo) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Date:{' '}
                {selectedDateFrom ? formatFilterDate(selectedDateFrom) : 'Any'}{' '}
                to {selectedDateTo ? formatFilterDate(selectedDateTo) : 'Any'}
                <button
                  onClick={() => {
                    setSelectedDateFrom('');
                    setSelectedDateTo('');
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
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
                  className="ml-1 text-teal-600 hover:text-teal-800"
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
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="ml-2 text-sm text-red-600 hover:text-red-800 font-medium"
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
                      ref={dateFilterRef}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Created Date
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAllDropdowns();
                          setShowDateFilter(!showDateFilter);
                        }}
                        className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`h-3 w-3 transition-transform duration-200 ${
                            showDateFilter ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Date Filter Dropdown */}
                    {showDateFilter && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">
                            Select Date Range
                          </span>
                          <button
                            onClick={() => {
                              setSelectedDateFrom('');
                              setSelectedDateTo('');
                              setShowDateFilter(false);
                            }}
                            className="text-xs font-medium text-purple-600 hover:text-purple-800"
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
                              value={selectedDateFrom}
                              onChange={(e) =>
                                setSelectedDateFrom(e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              To Date
                            </label>
                            <input
                              type="date"
                              value={selectedDateTo}
                              onChange={(e) =>
                                setSelectedDateTo(e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => setShowDateFilter(false)}
                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold rounded-lg transition-all"
                          >
                            Apply Filter
                          </button>
                        </div>
                      </div>
                    )}
                  </th>

                  <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Client Details
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
                          className={`h-3 w-3 ${
                            selectedCities.length > 0 ? 'text-purple-600' : ''
                          }`}
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
                          <button
                            onClick={() => setSelectedCities([])}
                            className="text-xs font-medium text-purple-600 hover:text-purple-800"
                          >
                            Clear All
                          </button>
                        </div>
                        {availableCities.map((city) => (
                          <div key={city} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`city-${city}`}
                              checked={selectedCities.includes(city)}
                              onChange={() => {
                                setSelectedCities((prev) =>
                                  prev.includes(city)
                                    ? prev.filter((c) => c !== city)
                                    : [...prev, city],
                                );
                              }}
                              className="h-3.5 w-3.5 mr-2.5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500"
                            />
                            <label
                              htmlFor={`city-${city}`}
                              className="text-sm font-medium dark:text-white cursor-pointer"
                            >
                              {city}
                            </label>
                          </div>
                        ))}
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
                          className={`h-3 w-3 ${
                            selectedSchedules.length > 0
                              ? 'text-purple-600'
                              : ''
                          }`}
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
                          <button
                            onClick={() => setSelectedSchedules([])}
                            className="text-xs font-medium text-purple-600 hover:text-purple-800"
                          >
                            Clear All
                          </button>
                        </div>
                        {availableSchedules.map((schedule) => (
                          <div
                            key={schedule}
                            className="flex items-center mb-2"
                          >
                            <input
                              type="checkbox"
                              id={`schedule-${schedule}`}
                              checked={selectedSchedules.includes(schedule)}
                              onChange={() => {
                                setSelectedSchedules((prev) =>
                                  prev.includes(schedule)
                                    ? prev.filter((s) => s !== schedule)
                                    : [...prev, schedule],
                                );
                              }}
                              className="h-3.5 w-3.5 mr-2.5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500"
                            />
                            <label
                              htmlFor={`schedule-${schedule}`}
                              className="text-sm font-medium dark:text-white cursor-pointer"
                            >
                              {schedule}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </th>

                  <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    MRN Number
                  </th>

                  <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Status
                  </th>

                  <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Actions
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
                  currentItems.map((mrn) => (
                    <tr
                      key={mrn.mrn_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Created Date - Only date without time */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                          {formatDate(mrn.created_at)}
                        </div>
                      </td>

                      {/* Client Details */}
                      <td className="py-4 px-4">
                        <div className="cursor-pointer">
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                            {mrn.client_name || 'N/A'}
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
                          {mrn.city || '—'}
                        </div>
                      </td>

                      {/* Schedule Name */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {mrn.execution?.schedule_name || 'N/A'}
                        </div>
                      </td>

                      {/* MRN Number */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                            {mrn.mrn_number}
                          </span>
                        </div>
                      </td>

                      {/* MRN Status */}
                      <td className="py-4 px-4">{getMRNStatusBadge(mrn)}</td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {/* Verify Button */}
                          <button
                            onClick={() => handleVerifyClick(mrn)}
                            disabled={verifyingMRN === mrn.mrn_number}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1 disabled:opacity-50"
                          >
                            {verifyingMRN === mrn.mrn_number ? (
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
                          <button
                            onClick={() => handleViewMRN(mrn.mrn_number)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            title="View MRN Details"
                          >
                            <FaEye className="text-sm" />
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold">{showingStart}</span> to{' '}
                <span className="font-semibold">{showingEnd}</span> of{' '}
                <span className="font-semibold">{filteredData.length}</span>{' '}
                results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Verify MRN Modal */}
          {showVerifyModal && selectedVerifyData && (
            <VerifyMRNModal
              data={selectedVerifyData}
              onClose={() => {
                setShowVerifyModal(false);
                setSelectedVerifyData(null);
              }}
              onSave={fetchMRNData}
            />
          )}
        </>
      )}
    </div>
  );
};

export default VerifyMrn;
