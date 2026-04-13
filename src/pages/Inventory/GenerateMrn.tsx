import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import {
  Eye,
  Search,
  X,
  Filter,
  ChevronDown,
  Clock,
  FileText,
} from 'lucide-react';
import { BASE_URL } from '../../../public/config';
import GenerateMRNModal from './GenerateMRNModal';
// import ViewLeadDetails from './ViewLeadDetails'; 
import { useNavigate } from 'react-router-dom';


type LeadData = {
  client_name?: string;
  city?: string;
  schedule?: string;
  start_date?: string;
  end_date?: string;
  master_id?: number;
  
};


const GenerateMrn = () => {


  const [data, setData] = useState<LeadData[]>([]);
const [filteredData, setFilteredData] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [customRecordCount, setCustomRecordCount] = useState('');
  const [selectedStartFromDate, setSelectedStartFromDate] = useState('');
  const [selectedStartToDate, setSelectedStartToDate] = useState('');
  const [selectedEndFromDate, setSelectedEndFromDate] = useState('');
  const [selectedEndToDate, setSelectedEndToDate] = useState('');
  

  // Dropdown visibility states
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [showScheduleFilter, setShowScheduleFilter] = useState(false);
const [selectedCities, setSelectedCities] = useState<string[]>([]);
const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  // Refs for dropdowns
  const startDateRef = useRef<HTMLDivElement | null>(null);
const endDateRef = useRef<HTMLDivElement | null>(null);
const cityFilterRef = useRef<HTMLDivElement | null>(null);
const scheduleFilterRef = useRef<HTMLDivElement | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  
  const navigate = useNavigate();

  useEffect(() => {
    fetchExecutedLeads();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter states change
    applyFilters();
  }, [
    data,
    searchTerm,
    selectedStartFromDate,
    selectedStartToDate,
    selectedEndFromDate,
    selectedEndToDate,
    selectedCities,
    selectedSchedules,
  ]);

  useEffect(() => {
    // Handle click outside to close dropdowns
   const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;

  if (startDateRef.current && !startDateRef.current.contains(target)) {
    setShowStartCalendar(false);
  }
  if (endDateRef.current && !endDateRef.current.contains(target)) {
    setShowEndCalendar(false);
  }
  if (cityFilterRef.current && !cityFilterRef.current.contains(target)) {
    setShowCityFilter(false);
  }
  if (scheduleFilterRef.current && !scheduleFilterRef.current.contains(target)) {
    setShowScheduleFilter(false);
  }
};

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchExecutedLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}api/exectuted/leads`);
      setData(res.data.data || []);
      setFilteredData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching executed leads:', error);
    } finally {
      setLoading(false);
    }
  };

const applyFilters = () => {
  let filtered: LeadData[] = [...data];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.client_name?.toLowerCase().includes(term) ||
        item.city?.toLowerCase().includes(term) ||
        item.schedule?.toLowerCase().includes(term),
    );
  }

  if (selectedStartFromDate) {
    filtered = filtered.filter(
      (item) =>
        item.start_date &&
        new Date(item.start_date) >= new Date(selectedStartFromDate),
    );
  }

  if (selectedStartToDate) {
    filtered = filtered.filter(
      (item) =>
        item.start_date &&
        new Date(item.start_date) <= new Date(selectedStartToDate),
    );
  }

  if (selectedEndFromDate) {
    filtered = filtered.filter(
      (item) =>
        item.end_date &&
        new Date(item.end_date) >= new Date(selectedEndFromDate),
    );
  }

  if (selectedEndToDate) {
    filtered = filtered.filter(
      (item) =>
        item.end_date &&
        new Date(item.end_date) <= new Date(selectedEndToDate),
    );
  }

  if (selectedCities.length > 0) {
    filtered = filtered.filter((item) =>
      selectedCities.includes(item.city || ''),
    );
  }

  if (selectedSchedules.length > 0) {
    filtered = filtered.filter((item) =>
      selectedSchedules.includes(item.schedule || ''),
    );
  }

  setFilteredData(filtered);
  setCurrentPage(1);
};

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStartFromDate('');
    setSelectedStartToDate('');
    setSelectedEndFromDate('');
    setSelectedEndToDate('');
    setSelectedCities([]);
    setSelectedSchedules([]);
    setCustomRecordCount('');
  };

  const closeAllDropdowns = () => {
    setShowStartCalendar(false);
    setShowEndCalendar(false);
    setShowCityFilter(false);
    setShowScheduleFilter(false);
  };

 const handleCitySelect = (city: string) => {
  setSelectedCities((prev) =>
    prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
  );
};

const handleScheduleSelect = (schedule: string) => {
  setSelectedSchedules((prev) =>
    prev.includes(schedule)
      ? prev.filter((s) => s !== schedule)
      : [...prev, schedule],
  );
};
  
const handleCustomRecordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setCustomRecordCount(value);

  if (value && !isNaN(Number(value)) && parseInt(value) > 0) {
    setItemsPerPage(parseInt(value));
  } else {
    setItemsPerPage(10);
  }
};

  const clearCustomRecordCount = () => {
    setCustomRecordCount('');
    setItemsPerPage(10);
  };

const handleGenerateMRN = (row: LeadData) => {
  setSelectedLead(row);
  setShowModal(true);
};



const handleViewDetails = (row: LeadData) => {
  navigate(`/mrn-list/${row.master_id}`);
};

 const handleSaveMRN = (_mrnData: any) => {
  alert('MRN Generated Successfully');
  setShowModal(false);
};

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

  // Get unique values for filters
  const availableCities = useMemo(() => {
    return [...new Set(data.map((item) => item.city).filter(Boolean))];
  }, [data]);

  const availableSchedules = useMemo(() => {
    return [...new Set(data.map((item) => item.schedule).filter(Boolean))];
  }, [data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const showingStart = (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, filteredData.length);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

 const handlePageChange = (page: number) => {
  setCurrentPage(page);
};

  return (
    <div className="p-4">
      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30">
                <Clock className="w-4 h-4 mr-1" />
                {filteredData.length} Records
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Custom Record Count Input */}
              <div className="w-full sm:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-gray-400" />
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
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Input */}
              <div className="w-full sm:w-72">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Search name, city, schedule..."
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
                <X className="h-4 w-4" />
                Reset Filter
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchExecutedLeads}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
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
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedStartFromDate ||
        selectedStartToDate ||
        selectedEndFromDate ||
        selectedEndToDate ||
        selectedCities.length > 0 ||
        selectedSchedules.length > 0) && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active filters:
          </span>
          <div className="flex flex-wrap gap-2">
            {(selectedStartFromDate || selectedStartToDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Start Date: {formatDate(selectedStartFromDate) || 'Any'} to{' '}
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
            {(selectedEndFromDate || selectedEndToDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                End Date: {formatDate(selectedEndFromDate) || 'Any'} to{' '}
                {formatDate(selectedEndToDate) || 'Any'}
                <button
                  onClick={() => {
                    setSelectedEndFromDate('');
                    setSelectedEndToDate('');
                  }}
                  className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400"
                >
                  ×
                </button>
              </span>
            )}
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
            {selectedSchedules.map((schedule) => (
              <span
                key={schedule}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
              >
                Schedule: {schedule}
                <button
                  onClick={() => handleScheduleSelect(schedule)}
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
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <tr>
                  {/* Start Date Column with Filter */}
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
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                      >
                        <ChevronDown
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
                              value={selectedStartFromDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedStartFromDate(e.target.value);
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
                              value={selectedStartToDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedStartToDate(e.target.value);
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
                              setShowStartCalendar(false);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Apply Filter
                          </button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* End Date Column with Filter */}
                  <th className="py-3 px-4 relative">
                    <div
                      ref={endDateRef}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        End Date
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAllDropdowns();
                          setShowEndCalendar(!showEndCalendar);
                        }}
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                      >
                        <ChevronDown
                          className={`h-3 w-3 transition-transform duration-200 ${
                            showEndCalendar ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* End Date Calendar Dropdown */}
                    {showEndCalendar && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm dark:text-white">
                            Select End Date Range
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEndFromDate('');
                              setSelectedEndToDate('');
                              setShowEndCalendar(false);
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
                              value={selectedEndFromDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedEndFromDate(e.target.value);
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
                              value={selectedEndToDate}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedEndToDate(e.target.value);
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
                              setShowEndCalendar(false);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Apply Filter
                          </button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Client Name */}
                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Client Name
                    </div>
                  </th>

                  {/* City Column with Filter */}
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
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                      >
                        <Filter
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
    {availableCities
      .filter((city): city is string => !!city)
      .map((city) => (
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
            className="h-3.5 w-3.5 mr-2.5 text-blue-600 rounded border-gray-300"
          />

          <label
            htmlFor={`city-${city}`}
            className="text-sm font-medium cursor-pointer"
          >
            {city}
          </label>
        </div>
      ))}
  </>
) : (
  <div>No cities available</div>
)}
                      </div>
                    )}
                  </th>

                  {/* Schedule Name with Filter */}
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
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                      >
                        <Filter
                          className={`h-3 w-3 transition-colors duration-200 ${
                            selectedSchedules.length > 0 ? 'text-blue-600' : ''
                          } ${showScheduleFilter ? 'text-blue-600' : ''}`}
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
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
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
                          <>
                            {availableSchedules.map((schedule) => (
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
                                    handleScheduleSelect(schedule);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-3.5 w-3.5 mr-2.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                                />
                                <label
                                  htmlFor={`schedule-${schedule}`}
                                  className="text-sm font-medium dark:text-white cursor-pointer truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {schedule}
                                </label>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
                            No schedules available
                          </div>
                        )}
                      </div>
                    )}
                  </th>

                  {/* Action Column */}
                  <th className="py-3 px-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Action
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">
                          No executed leads found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((row) => (
                    <tr
                      key={row.master_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Start Date */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                          {formatDate(row.start_date)}
                        </div>
                      </td>

                      {/* End Date */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800/30 shadow-sm">
                          {formatDate(row.end_date)}
                        </div>
                      </td>

                      {/* Client Name */}
                      <td className="py-4 px-4">
                        <div
                          // onClick={() => handleViewDetails(row)}
                          className="group cursor-pointer"
                        >
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                            {row.client_name || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {row.city || '—'}
                        </div>
                      </td>

                      {/* Schedule Name */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {row.schedule || 'N/A'}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGenerateMRN(row)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            Generate MRN
                          </button>
                          <button
                            onClick={() => handleViewDetails(row)}
                            className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg hover:scale-105 transition-transform relative flex items-center justify-center"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
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
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {showingStart} to {showingEnd} of {filteredData.length}{' '}
                results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-500 text-white rounded">
                  {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* MRN Generation Modal */}
          {showModal && selectedLead && (
            <GenerateMRNModal
              master_id={selectedLead.master_id}
              onClose={() => setShowModal(false)}
              onSave={handleSaveMRN}
            />
          )}

          {/* View Details Modal */}
          {/* {showDetailsModal && selectedLead && (
            <ViewLeadDetails
              lead={selectedLead}
              onClose={() => setShowDetailsModal(false)}
            />
          )} */}
        </>
      )}
    </div>
  );
};

export default GenerateMrn;
