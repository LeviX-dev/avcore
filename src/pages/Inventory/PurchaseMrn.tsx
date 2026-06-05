// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faSearch,
//   faTimes,
//   faFilter,
//   faCheckCircle,
//   faTimesCircle,
//   faSpinner,
//   faFileAlt,
//   faMapMarkerAlt,
//   faBox,
//   faShoppingCart,
//   faEye,
//   faTruck,
//   faFileInvoice,
// } from '@fortawesome/free-solid-svg-icons';
// import { BASE_URL } from '../../../public/config.js';
// import PurchaseRequest from './PurchaseRequest.js';
// import GeneratePO from './GeneratePo.js';

// interface PurchaseItem {
//   mrn_id: number;
//   mrn_number: string;
//   client_name: string;
//   city: string;
//   execution_id: number;
//   schedule_name: string;
//   mpm_id: number;
//   model_id: number;
//   brand_id: number;
//   purchase_qty: number;
//   purchase_status: string;
//   brand_name: string;
//   model_no: string;
//   pr_id?: number;
//   po_id?: number;
//   po_status?: string;
//   pr_status?: string;
// }

// interface PaginationProps {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
//   totalItems: number;
//   itemsPerPage: number;
//   showingStart: number;
//   showingEnd: number;
// }

// const Pagination: React.FC<PaginationProps> = ({
//   currentPage,
//   totalPages,
//   onPageChange,
//   totalItems,
//   itemsPerPage,
//   showingStart,
//   showingEnd,
// }) => {
//   const renderPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisible = 5;
//     let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
//     let end = Math.min(totalPages, start + maxVisible - 1);

//     if (end - start + 1 < maxVisible) {
//       start = Math.max(1, end - maxVisible + 1);
//     }

//     for (let i = start; i <= end; i++) {
//       pageNumbers.push(
//         <button
//           key={i}
//           onClick={() => onPageChange(i)}
//           className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
//             currentPage === i
//               ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
//               : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//           }`}
//         >
//           {i}
//         </button>,
//       );
//     }
//     return pageNumbers;
//   };

//   return (
//     <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
//       <div className="text-sm text-gray-600 dark:text-gray-400">
//         Showing{' '}
//         <span className="font-semibold text-gray-900 dark:text-white">
//           {showingStart}
//         </span>{' '}
//         to{' '}
//         <span className="font-semibold text-gray-900 dark:text-white">
//           {showingEnd}
//         </span>{' '}
//         of{' '}
//         <span className="font-semibold text-gray-900 dark:text-white">
//           {totalItems}
//         </span>{' '}
//         results
//       </div>
//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//         >
//           Previous
//         </button>
//         <div className="flex items-center gap-1">{renderPageNumbers()}</div>
//         <button
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// const PurchaseMrn: React.FC = () => {
//   // State management
//   const [data, setData] = useState<PurchaseItem[]>([]);
//   const [filteredData, setFilteredData] = useState<PurchaseItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Filter states
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCities, setSelectedCities] = useState<string[]>([]);
//   const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
//   const [selectedPurchaseStatus, setSelectedPurchaseStatus] = useState<
//     string[]
//   >([]);

//   // Available filter options
//   const [availableCities, setAvailableCities] = useState<string[]>([]);
//   const [availableSchedules, setAvailableSchedules] = useState<string[]>([]);
//   const [availablePurchaseStatuses, setAvailablePurchaseStatuses] = useState<
//     string[]
//   >([]);

//   // UI states
//   const [showCityFilter, setShowCityFilter] = useState(false);
//   const [showScheduleFilter, setShowScheduleFilter] = useState(false);
//   const [showStatusFilter, setShowStatusFilter] = useState(false);
//   const [customRecordCount, setCustomRecordCount] = useState('');
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [processingItem, setProcessingItem] = useState<string | null>(null);

//   // Modal states
// const navigate = useNavigate();

//   const [selectedPurchaseItem, setSelectedPurchaseItem] =
//     useState<PurchaseItem | null>(null);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);

//   // Refs for dropdowns
//   const cityFilterRef = useRef<HTMLTableHeaderCellElement>(null);
//   const scheduleFilterRef = useRef<HTMLTableHeaderCellElement>(null);
//   const statusFilterRef = useRef<HTMLTableHeaderCellElement>(null);

//   const [showPOModal, setShowPOModal] = useState(false);
//   const [selectedPOItem, setSelectedPOItem] = useState<PurchaseItem | null>(
//     null,
//   );

//   // Fetch purchase items from API
//   const fetchPurchaseItems = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await axios.get(`${BASE_URL}api/purchase/items`, {
//         withCredentials: true,
//       });

//       if (response.data?.success && response.data?.data) {
//         const purchaseItems = response.data.data;
//         setData(purchaseItems);
//         setFilteredData(purchaseItems);

//         // Extract unique values for filters
//         const cities: string[] = Array.from(
//           new Set(
//             purchaseItems
//               .map((item: PurchaseItem) => item.city)
//               .filter(Boolean),
//           ),
//         );

//         const schedules: string[] = Array.from(
//           new Set(
//             purchaseItems
//               .map((item: PurchaseItem) => item.schedule_name)
//               .filter(Boolean),
//           ),
//         );

//         const statuses: string[] = Array.from(
//           new Set(
//             purchaseItems
//               .map((item: PurchaseItem) => item.purchase_status)
//               .filter(Boolean),
//           ),
//         );

//         setAvailableCities(cities.sort());
//         setAvailableSchedules(schedules.sort());
//         setAvailablePurchaseStatuses(statuses.sort());
//       } else {
//         setError('Failed to fetch purchase items');
//       }
//     } catch (err: any) {
//       console.error('Error fetching purchase items:', err);
//       setError(
//         err.response?.data?.message ||
//           'Failed to fetch purchase items. Please try again.',
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPurchaseItems();
//   }, []);

//   // Handle search and filters
//   useEffect(() => {
//     let filtered = [...data];

//     // Apply search
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (item) =>
//           item.client_name?.toLowerCase().includes(term) ||
//           item.mrn_number?.toLowerCase().includes(term) ||
//           item.city?.toLowerCase().includes(term) ||
//           item.model_no?.toLowerCase().includes(term) ||
//           item.brand_name?.toLowerCase().includes(term),
//       );
//     }

//     // Apply city filter
//     if (selectedCities.length > 0) {
//       filtered = filtered.filter((item) => selectedCities.includes(item.city));
//     }

//     // Apply schedule filter
//     if (selectedSchedules.length > 0) {
//       filtered = filtered.filter((item) =>
//         selectedSchedules.includes(item.schedule_name),
//       );
//     }

//     // Apply status filter
//     if (selectedPurchaseStatus.length > 0) {
//       filtered = filtered.filter((item) =>
//         selectedPurchaseStatus.includes(item.purchase_status),
//       );
//     }

//     setFilteredData(filtered);
//     setCurrentPage(1);
//   }, [
//     data,
//     searchTerm,
//     selectedCities,
//     selectedSchedules,
//     selectedPurchaseStatus,
//   ]);

//   // Close all dropdowns
//   const closeAllDropdowns = () => {
//     setShowCityFilter(false);
//     setShowScheduleFilter(false);
//     setShowStatusFilter(false);
//   };

//   // Handle click outside
//   // Handle click outside - Updated to work with HTMLTableHeaderCellElement
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         cityFilterRef.current &&
//         !cityFilterRef.current.contains(event.target as Node)
//       ) {
//         setShowCityFilter(false);
//       }
//       if (
//         scheduleFilterRef.current &&
//         !scheduleFilterRef.current.contains(event.target as Node)
//       ) {
//         setShowScheduleFilter(false);
//       }
//       if (
//         statusFilterRef.current &&
//         !statusFilterRef.current.contains(event.target as Node)
//       ) {
//         setShowStatusFilter(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Clear all filters
//   const clearFilters = () => {
//     setSearchTerm('');
//     setSelectedCities([]);
//     setSelectedSchedules([]);
//     setSelectedPurchaseStatus([]);
//     setCustomRecordCount('');
//     setItemsPerPage(10);
//     setCurrentPage(1);
//   };

//   // Handle custom record count
//   const handleCustomRecordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setCustomRecordCount(value);
//     if (value && !isNaN(Number(value)) && Number(value) > 0) {
//       setItemsPerPage(Number(value));
//       setCurrentPage(1);
//     }
//   };

//   // Handle purchase button click
//   const handlePurchaseClick = async (item: PurchaseItem) => {
//     setProcessingItem(`${item.mrn_id}-${item.mpm_id}`);
//     try {
//       setSelectedPurchaseItem(item);
//       setShowPOModal(true);
//     } finally {
//       setProcessingItem(null);
//     }
//   };

//   // Handle Generate PO button click
//   const handleGeneratePOClick = async (item: PurchaseItem) => {
//     setProcessingItem(`${item.mrn_id}-${item.mpm_id}-po`);
//     try {
//       setSelectedPOItem(item);
//       setShowPOModal(true);
//     } finally {
//       setProcessingItem(null);
//     }
//   };
//   // Handle view details click
//   const handleViewMRN = (mrnNumber) => {
//     navigate(`/mrn/view/${mrnNumber}`);
//   };

//   // Get purchase status badge
//   const getPurchaseStatusBadge = (status: string) => {
//     const statusClasses: { [key: string]: string } = {
//       Pending:
//         'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       Requested:
//         'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//       Purchased:
//         'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       'Partially Purchased':
//         'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
//       'Not Requested':
//         'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
//     };

//     return (
//       <span
//         className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border border-opacity-30 ${
//           statusClasses[status] ||
//           'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
//         }`}
//       >
//         {status}
//       </span>
//     );
//   };

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const showingStart = filteredData.length === 0 ? 0 : indexOfFirstItem + 1;
//   const showingEnd = Math.min(indexOfLastItem, filteredData.length);

//   return (
//     <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
//       {/* Sticky Header with Filters */}
//       <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4 rounded-lg">
//         <div className="px-4 py-3">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
//             <div className="flex items-center gap-3">
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30">
//                 <FontAwesomeIcon
//                   icon={faShoppingCart}
//                   className="w-4 h-4 mr-1"
//                 />
//                 Purchase Items - {filteredData.length} Records
//               </span>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//               {/* Custom Record Count Input */}
//               <div className="w-full sm:w-48">
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FontAwesomeIcon
//                       icon={faFileAlt}
//                       className="h-4 w-4 text-gray-400"
//                     />
//                   </div>
//                   <input
//                     type="number"
//                     className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                     placeholder="Show N records"
//                     value={customRecordCount}
//                     onChange={handleCustomRecordInput}
//                     min="1"
//                   />
//                   {customRecordCount && (
//                     <button
//                       onClick={() => {
//                         setCustomRecordCount('');
//                         setItemsPerPage(10);
//                         setCurrentPage(1);
//                       }}
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                     >
//                       <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Search Input */}
//               <div className="w-full sm:w-72">
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FontAwesomeIcon
//                       icon={faSearch}
//                       className="h-4 w-4 text-gray-400"
//                     />
//                   </div>
//                   <input
//                     type="text"
//                     className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                     placeholder="Search MRN, client, city, product..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* Reset Filter Button */}
//               <button
//                 onClick={clearFilters}
//                 className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
//               >
//                 <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
//                 Reset Filter
//               </button>

//               {/* Refresh Button */}
//               <button
//                 onClick={fetchPurchaseItems}
//                 className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
//               >
//                 <svg
//                   className="h-4 w-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                   />
//                 </svg>
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Active Filters Display */}
//       {(selectedCities.length > 0 ||
//         selectedSchedules.length > 0 ||
//         selectedPurchaseStatus.length > 0) && (
//         <div className="flex items-center gap-2 mb-4 p-3 bg-white dark:bg-boxdark rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
//           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//             Active filters:
//           </span>
//           <div className="flex flex-wrap gap-2">
//             {selectedCities.map((city) => (
//               <span
//                 key={city}
//                 className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
//               >
//                 <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
//                 {city}
//                 <button
//                   onClick={() =>
//                     setSelectedCities((prev) => prev.filter((c) => c !== city))
//                   }
//                   className="ml-1 text-teal-600 hover:text-teal-800 dark:text-teal-400"
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//             {selectedSchedules.map((schedule) => (
//               <span
//                 key={schedule}
//                 className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
//               >
//                 {schedule}
//                 <button
//                   onClick={() =>
//                     setSelectedSchedules((prev) =>
//                       prev.filter((s) => s !== schedule),
//                     )
//                   }
//                   className="ml-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//             {selectedPurchaseStatus.map((status) => (
//               <span
//                 key={status}
//                 className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
//               >
//                 {status}
//                 <button
//                   onClick={() =>
//                     setSelectedPurchaseStatus((prev) =>
//                       prev.filter((s) => s !== status),
//                     )
//                   }
//                   className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//             <button
//               onClick={clearFilters}
//               className="ml-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
//             >
//               Clear all
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
//         </div>
//       ) : error ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="text-center text-red-600 dark:text-red-400">
//             <FontAwesomeIcon
//               icon={faTimesCircle}
//               className="h-12 w-12 mx-auto mb-4"
//             />
//             <p className="text-lg font-medium">{error}</p>
//             <button
//               onClick={fetchPurchaseItems}
//               className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Table */}
//           <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
//               <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
//                 <tr>
//                   <th className="py-3 px-4 text-left">
//                     <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Client Details
//                     </div>
//                   </th>

//                   <th className="py-3 px-4 text-left relative">
//                     <div ref={cityFilterRef}>
//                       {' '}
//                       {/* Put ref on a div inside th */}
//                       <div className="flex items-center justify-between gap-2">
//                         <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                           City
//                         </span>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             closeAllDropdowns();
//                             setShowCityFilter(!showCityFilter);
//                           }}
//                           className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors"
//                         >
//                           <FontAwesomeIcon
//                             icon={faFilter}
//                             className={`h-3 w-3 transition-colors duration-200 ${
//                               selectedCities.length > 0 ? 'text-purple-600' : ''
//                             } ${showCityFilter ? 'text-purple-600' : ''}`}
//                           />
//                         </button>
//                       </div>
//                       {/* City Filter Dropdown */}
//                       {showCityFilter && (
//                         <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
//                           {/* Dropdown content remains the same */}
//                         </div>
//                       )}
//                     </div>
//                   </th>

//                   <th
//                     className="py-3 px-4 text-left relative"
//                     ref={scheduleFilterRef}
//                   >
//                     <div className="flex items-center justify-between gap-2">
//                       <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                         Schedule
//                       </span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           closeAllDropdowns();
//                           setShowScheduleFilter(!showScheduleFilter);
//                         }}
//                         className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors"
//                       >
//                         <FontAwesomeIcon
//                           icon={faFilter}
//                           className={`h-3 w-3 transition-colors duration-200 ${
//                             selectedSchedules.length > 0
//                               ? 'text-purple-600'
//                               : ''
//                           } ${showScheduleFilter ? 'text-purple-600' : ''}`}
//                         />
//                       </button>
//                     </div>

//                     {/* Schedule Filter Dropdown */}
//                     {showScheduleFilter && (
//                       <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
//                         <div className="flex justify-between items-center mb-3">
//                           <span className="font-semibold text-sm dark:text-white">
//                             Filter Schedules
//                           </span>
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => setSelectedSchedules([])}
//                               className="text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400"
//                             >
//                               Clear All
//                             </button>
//                             <button
//                               onClick={() => setShowScheduleFilter(false)}
//                               className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         </div>

//                         {availableSchedules.map((schedule) => (
//                           <div
//                             key={schedule}
//                             className="flex items-center mb-2"
//                           >
//                             <input
//                               type="checkbox"
//                               id={`schedule-${schedule}`}
//                               checked={selectedSchedules.includes(schedule)}
//                               onChange={() => {
//                                 setSelectedSchedules((prev) =>
//                                   prev.includes(schedule)
//                                     ? prev.filter((s) => s !== schedule)
//                                     : [...prev, schedule],
//                                 );
//                               }}
//                               className="h-3.5 w-3.5 mr-2.5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500"
//                             />
//                             <label
//                               htmlFor={`schedule-${schedule}`}
//                               className="text-sm font-medium dark:text-white cursor-pointer"
//                             >
//                               {schedule}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </th>

//                   <th className="py-3 px-4 text-left">
//                     <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       MRN Number
//                     </div>
//                   </th>

//                   <th className="py-3 px-4 text-left">
//                     <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Purchase Qty
//                     </div>
//                   </th>

//                   <th
//                     className="py-3 px-4 text-left relative"
//                     ref={statusFilterRef}
//                   >
//                     <div className="flex items-center justify-between gap-2">
//                       <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                         Purchase Status
//                       </span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           closeAllDropdowns();
//                           setShowStatusFilter(!showStatusFilter);
//                         }}
//                         className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors"
//                       >
//                         <FontAwesomeIcon
//                           icon={faFilter}
//                           className={`h-3 w-3 transition-colors duration-200 ${
//                             selectedPurchaseStatus.length > 0
//                               ? 'text-purple-600'
//                               : ''
//                           } ${showStatusFilter ? 'text-purple-600' : ''}`}
//                         />
//                       </button>
//                     </div>

//                     {/* Status Filter Dropdown */}
//                     {showStatusFilter && (
//                       <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
//                         <div className="flex justify-between items-center mb-3">
//                           <span className="font-semibold text-sm dark:text-white">
//                             Filter Status
//                           </span>
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => setSelectedPurchaseStatus([])}
//                               className="text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400"
//                             >
//                               Clear All
//                             </button>
//                             <button
//                               onClick={() => setShowStatusFilter(false)}
//                               className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         </div>

//                         {availablePurchaseStatuses.map((status) => (
//                           <div key={status} className="flex items-center mb-2">
//                             <input
//                               type="checkbox"
//                               id={`status-${status}`}
//                               checked={selectedPurchaseStatus.includes(status)}
//                               onChange={() => {
//                                 setSelectedPurchaseStatus((prev) =>
//                                   prev.includes(status)
//                                     ? prev.filter((s) => s !== status)
//                                     : [...prev, status],
//                                 );
//                               }}
//                               className="h-3.5 w-3.5 mr-2.5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500"
//                             />
//                             <label
//                               htmlFor={`status-${status}`}
//                               className="text-sm font-medium dark:text-white cursor-pointer"
//                             >
//                               {status}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </th>

//                   <th className="py-3 px-4 text-left">
//                     <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Actions
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
//                 {currentItems.length === 0 ? (
//                   <tr>
//                     <td colSpan={7} className="px-6 py-12 text-center">
//                       <div className="text-gray-500 dark:text-gray-400">
//                         <FontAwesomeIcon
//                           icon={faCheckCircle}
//                           className="h-12 w-12 mx-auto mb-4 opacity-50"
//                         />
//                         <p className="text-lg font-medium">
//                           No purchase items found
//                         </p>
//                         <p className="text-sm mt-2">
//                           All purchase items will appear here
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   currentItems.map((item, index) => (
//                     <tr
//                       key={`${item.mrn_id}-${item.mpm_id}-${index}`}
//                       className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
//                     >
//                       {/* Client Details */}
//                       <td className="py-4 px-4">
//                         <div className="group">
//                           <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
//                             {item.client_name || 'N/A'}
//                           </div>
//                         </div>
//                       </td>

//                       {/* City */}
//                       <td className="py-4 px-4">
//                         <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
//                           <FontAwesomeIcon
//                             icon={faMapMarkerAlt}
//                             className="text-gray-400 text-xs"
//                           />
//                           {item.city || '—'}
//                         </div>
//                       </td>

//                       {/* Schedule */}
//                       <td className="py-4 px-4">
//                         <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
//                           {item.schedule_name || 'N/A'}
//                         </div>
//                       </td>

//                       {/* MRN Number */}
//                       <td className="py-4 px-4">
//                         <div className="flex items-center gap-2">
//                           <span className="text-sm font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
//                             {item.mrn_number || '—'}
//                           </span>
//                         </div>
//                       </td>

//                       {/* Purchase Qty */}
//                       <td className="py-4 px-4">
//                         <div className="text-center">
//                           <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
//                             <FontAwesomeIcon
//                               icon={faBox}
//                               className="h-3 w-3 mr-1"
//                             />
//                             {item.purchase_qty || 0}
//                           </span>
//                         </div>
//                       </td>

//                       {/* Purchase Status */}
//                       <td className="py-4 px-4">
//                         {getPurchaseStatusBadge(item.purchase_status)}
//                       </td>

//                       {/* Actions */}
//                       <td className="py-4 px-4">
//                         <div className="flex items-center gap-2">
//                           {/* Generate PR Button */}
//                           <button
//                             onClick={() => handlePurchaseClick(item)}
//                             disabled={
//                               processingItem ===
//                                 `${item.mrn_id}-${item.mpm_id}` ||
//                               item.purchase_status !== 'Pending'
//                             }
//                             className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg ${
//                               item.purchase_status !== 'Pending'
//                                 ? 'bg-gray-400 cursor-not-allowed opacity-60'
//                                 : 'bg-gradient-to-r from-purple-500 to-indigo-600'
//                             }`}
//                           >
//                             Generate PR
//                           </button>

//                           {/* Generate PO Button - Only show if PR exists */}
//                           <button
//                             onClick={() => handleGeneratePOClick(item)}
//                             disabled={
//                               processingItem ===
//                                 `${item.mrn_id}-${item.mpm_id}-po` ||
//                               item.purchase_status !== 'Approved'
//                             }
//                             className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg ${
//                               item.purchase_status !== 'Approved'
//                                 ? 'bg-gray-400 cursor-not-allowed opacity-60'
//                                 : 'bg-gradient-to-r from-blue-500 to-cyan-600'
//                             }`}
//                           >
//                             Generate PO
//                           </button>

//                           {/* View Button */}
//                           <button
//                             onClick={() => handleViewMRN(item.mrn_number)}
//                             className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
//                             title="View MRN Details"
//                           >
//                             <FontAwesomeIcon
//                               icon={faEye}
//                               className="h-3.5 w-3.5"
//                             />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Generate PO Modal */}
//           {showPOModal && selectedPurchaseItem && (
//             <PurchaseRequest
//               item={selectedPurchaseItem}
//               onClose={() => {
//                 setShowPOModal(false);
//                 setSelectedPurchaseItem(null);
//               }}
//               onSuccess={() => {
//                 fetchPurchaseItems(); // Refresh the list
//               }}
//             />
//           )}

//           {/* Generate PO Modal */}
//           {showPOModal && selectedPOItem && (
//             <GeneratePO
//               item={selectedPOItem}
//               onClose={() => {
//                 setShowPOModal(false);
//                 setSelectedPOItem(null);
//               }}
//               onSuccess={() => {
//                 fetchPurchaseItems(); // Refresh the list
//               }}
//             />
//           )}

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//               totalItems={filteredData.length}
//               itemsPerPage={itemsPerPage}
//               showingStart={showingStart}
//               showingEnd={showingEnd}
//             />
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default PurchaseMrn;





// //new code
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faSearch,
//   faTimes,
//   faFileAlt,
//   faMapMarkerAlt,
//   faShoppingCart,
//   faEye,
//   faCheckCircle,
//   faTimesCircle,
//   faChevronDown,
//   faChevronUp,
//   faBoxOpen,
//   faTruck,
//   faFileInvoice,
// } from '@fortawesome/free-solid-svg-icons';
// import { BASE_URL } from '../../../public/config.js';
// import PurchaseRequestModal from './PurchaseRequest.js';
// import GeneratePO from './GeneratePo.js';

// interface MrnItem {
//   mpm_id: number;
//   pr_id?: number;
//   po_id?: number;
//   model_id: number;
//   brand_id: number;
//   brand_name: string;
//   model_no: string;
//   purchase_qty: number;
//   purchase_status: string;
//   pr_status?: string;
//   po_status?: string;
// }

// interface MrnRow {
//   mrn_id: number;
//   mrn_number: string;
//   client_name: string;
//   city: string;
//   items: MrnItem[];
// }

// interface PaginationProps {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
//   totalItems: number;
//   itemsPerPage: number;
//   showingStart: number;
//   showingEnd: number;
// }

// const Pagination: React.FC<PaginationProps> = ({
//   currentPage,
//   totalPages,
//   onPageChange,
//   totalItems,
//   showingStart,
//   showingEnd,
// }) => {
//   const pages: number[] = [];
//   const maxVisible = 5;
//   let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
//   let end = Math.min(totalPages, start + maxVisible - 1);
//   if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
//   for (let i = start; i <= end; i++) pages.push(i);

//   return (
//     <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
//       <div className="text-sm text-gray-600 dark:text-gray-400">
//         Showing{' '}
//         <span className="font-semibold text-gray-900 dark:text-white">
//           {showingStart}
//         </span>{' '}
//         to{' '}
//         <span className="font-semibold text-gray-900 dark:text-white">
//           {showingEnd}
//         </span>{' '}
//         of{' '}
//         <span className="font-semibold text-gray-900 dark:text-white">
//           {totalItems}
//         </span>{' '}
//         MRNs
//       </div>
//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           Previous
//         </button>
//         <div className="flex items-center gap-1">
//           {pages.map((p) => (
//             <button
//               key={p}
//               onClick={() => onPageChange(p)}
//               className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
//                 currentPage === p
//                   ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
//                   : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//               }`}
//             >
//               {p}
//             </button>
//           ))}
//         </div>
//         <button
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────
// //  STATUS BADGE
// // ─────────────────────────────────────────────
// const getPurchaseStatusBadge = (status: string) => {
//   const map: Record<string, string> = {
//     Pending:
//       'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//     Approved:
//       'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//     Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//     Ordered: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//     Purchased:
//       'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
//     'Not Requested':
//       'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
//   };
//   return (
//     <span
//       className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
//         map[status] || 'bg-gray-100 text-gray-600'
//       }`}
//     >
//       {status}
//     </span>
//   );
// };

// const MrnTableRow: React.FC<{
//   mrn: MrnRow;
//   onGeneratePR: (mrn: MrnRow) => void;
//   onGeneratePO: (mrn: MrnRow) => void;
//   onViewMRN: (mrnNumber: string) => void;
// }> = ({ mrn, onGeneratePR, onGeneratePO, onViewMRN }) => {
//   const [expanded, setExpanded] = useState(false);

//   // Check if PR is already generated for any item in this MRN
//   const isPRGenerated = () => {
//     return mrn.items.some((item) => item.pr_id && item.pr_id > 0);
//   };

//   // Check if PO is already generated for any item in this MRN
//   const isPOGenerated = () => {
//     return mrn.items.some((item) => item.po_id && item.po_id > 0);
//   };

//   // Get PR status for the MRN
//   const getMRNPRStatus = () => {
//     const allApproved = mrn.items.every(
//       (item) => item.pr_status === 'Approved',
//     );
//     const anyPending = mrn.items.some(
//       (item) => item.pr_status === 'Pending' || item.pr_status === 'Pending',
//     );
//     const anyGenerated = isPRGenerated();

//     if (allApproved) return 'PR Approved';
//     if (anyPending) return 'PR Pending';
//     if (anyGenerated) return 'PR Generated';
//     return 'Generate PR';
//   };

//   // Get PO status for the MRN
//   const getMRNPOStatus = () => {
//     const allOrdered = mrn.items.every((item) => item.po_status === 'Ordered');
//     const anyPending = mrn.items.some((item) => item.po_status === 'Pending');
//     const anyGenerated = isPOGenerated();

//     if (allOrdered) return 'PO Ordered';
//     if (anyPending) return 'PO Pending';
//     if (anyGenerated) return 'PO Generated';
//     return 'Generate PO';
//   };

//   // Check if PR button should be disabled
//   const isPRButtonDisabled = () => {
//     return (
//       isPRGenerated() ||
//       mrn.items.some(
//         (item) => item.pr_status === 'Approved' || item.pr_status === 'Pending',
//       )
//     );
//   };

//   // Check if PO button should be disabled
//   const isPOButtonDisabled = () => {
//     const hasPR = mrn.items.some((item) => item.pr_id && item.pr_id > 0);
//     return (
//       isPOGenerated() ||
//       !hasPR ||
//       mrn.items.some(
//         (item) => item.po_status === 'Ordered' || item.po_status === 'Pending',
//       )
//     );
//   };

//   const totalPurchaseQty = mrn.items.reduce(
//     (s, i) => s + (i.purchase_qty || 0),
//     0,
//   );

//   // Handle PR click
//   const handlePRClick = () => {
//     if (!isPRButtonDisabled()) {
//       onGeneratePR(mrn);
//     }
//   };

//   // Handle PO click
//   const handlePOClick = () => {
//     if (!isPOButtonDisabled()) {
//       onGeneratePO(mrn);
//     }
//   };

//   return (
//     <>
//       {/* ── MAIN MRN ROW ── */}
//       <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
//         {/* Expand toggle */}
//         <td className="px-3 py-3 w-10">
//           <button
//             onClick={() => setExpanded((p) => !p)}
//             className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
//             title={expanded ? 'Collapse items' : 'Expand items'}
//           >
//             <FontAwesomeIcon
//               icon={expanded ? faChevronUp : faChevronDown}
//               className="h-3.5 w-3.5"
//             />
//           </button>
//         </td>

//         {/* MRN Number */}
//         <td className="px-4 py-3">
//           <div className="font-semibold text-sm text-purple-700 dark:text-purple-400 font-mono">
//             {mrn.mrn_number}
//           </div>
//         </td>

//         {/* Client */}
//         <td className="px-4 py-3">
//           <div className="text-sm font-medium text-gray-900 dark:text-white">
//             {mrn.client_name}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
//             <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
//             {mrn.city}
//           </div>
//         </td>

//         {/* Items count */}
//         <td className="px-4 py-3 text-center">
//           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/30">
//             <FontAwesomeIcon icon={faBoxOpen} className="h-3 w-3" />
//             {mrn.items.length} {mrn.items.length === 1 ? 'product' : 'products'}
//           </span>
//         </td>

//         {/* Total Purchase Qty */}
//         <td className="px-4 py-3 text-center">
//           <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
//             {totalPurchaseQty}
//           </span>
//         </td>

//         {/* Generate PR Button */}
//         <td className="px-4 py-3">
//           <button
//             onClick={handlePRClick}
//             disabled={isPRButtonDisabled()}
//             className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
//               isPRButtonDisabled()
//                 ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed opacity-60'
//                 : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-700/30 hover:bg-green-100 dark:hover:bg-green-900/40'
//             }`}
//             title={
//               isPRButtonDisabled()
//                 ? getMRNPRStatus()
//                 : 'Generate Purchase Request'
//             }
//           >
//             <FontAwesomeIcon icon={faFileInvoice} className="h-3 w-3" />
//             {getMRNPRStatus()}
//           </button>
//         </td>

//         {/* Generate PO Button */}
//         <td className="px-4 py-3">
//           <button
//             onClick={handlePOClick}
//             disabled={isPOButtonDisabled()}
//             className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
//               isPOButtonDisabled()
//                 ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed opacity-60'
//                 : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-700/30 hover:bg-blue-100 dark:hover:bg-blue-900/40'
//             }`}
//             title={
//               isPOButtonDisabled()
//                 ? getMRNPOStatus()
//                 : 'Generate Purchase Order'
//             }
//           >
//             <FontAwesomeIcon icon={faTruck} className="h-3 w-3" />
//             {getMRNPOStatus()}
//           </button>
//         </td>

//         {/* View Button */}
//         <td className="px-4 py-3">
//           <button
//             onClick={() => onViewMRN(mrn.mrn_number)}
//             className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
//             title="View MRN"
//           >
//             <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
//             View
//           </button>
//         </td>
//       </tr>

//       {/* ── EXPANDED ITEMS PREVIEW ── */}
//       {expanded && (
//         <tr className="bg-indigo-50/40 dark:bg-indigo-900/10">
//           <td colSpan={8} className="px-6 py-3">
//             <div className="rounded-lg border border-indigo-100 dark:border-indigo-800/30 overflow-hidden">
//               <table className="w-full text-xs">
//                 <thead className="bg-indigo-100/60 dark:bg-indigo-900/20">
//                   <tr>
//                     <th className="px-3 py-2 text-left font-medium text-indigo-700 dark:text-indigo-300">
//                       Product
//                     </th>
//                     <th className="px-3 py-2 text-left font-medium text-indigo-700 dark:text-indigo-300">
//                       Brand
//                     </th>
//                     <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
//                       Purchase Qty
//                     </th>
//                     <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
//                       Purchase Status
//                     </th>
//                     <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
//                       PR ID
//                     </th>
//                     <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
//                       PR Status
//                     </th>
//                     <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
//                       PO ID
//                     </th>
//                     <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
//                       PO Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-indigo-100 dark:divide-indigo-800/30">
//                   {mrn.items.map((item) => (
//                     <tr
//                       key={item.mpm_id}
//                       className="bg-white dark:bg-gray-800/60"
//                     >
//                       <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
//                         {item.model_no}
//                       </td>
//                       <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
//                         {item.brand_name}
//                       </td>
//                       <td className="px-3 py-2 text-center font-semibold text-gray-800 dark:text-gray-200">
//                         {item.purchase_qty}
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         {getPurchaseStatusBadge(item.purchase_status)}
//                       </td>
//                       <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 font-mono">
//                         {item.pr_id || '—'}
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         {item.pr_status ? (
//                           getPurchaseStatusBadge(item.pr_status)
//                         ) : (
//                           <span className="text-gray-400">—</span>
//                         )}
//                       </td>
//                       <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 font-mono">
//                         {item.po_id || '—'}
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         {item.po_status ? (
//                           getPurchaseStatusBadge(item.po_status)
//                         ) : (
//                           <span className="text-gray-400">—</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </td>
//         </tr>
//       )}
//     </>
//   );
// };

// // ─────────────────────────────────────────────
// //  MAIN COMPONENT
// // ─────────────────────────────────────────────
// const PurchaseMrn: React.FC = () => {
//   const navigate = useNavigate();

//   const [data, setData] = useState<MrnRow[]>([]);
//   const [filteredData, setFilteredData] = useState<MrnRow[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Filters
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCities, setSelectedCities] = useState<string[]>([]);
//   const [selectedPurchaseStatus, setSelectedPurchaseStatus] = useState<
//     string[]
//   >([]);
//   const [availableCities, setAvailableCities] = useState<string[]>([]);
//   const [availablePurchaseStatuses, setAvailablePurchaseStatuses] = useState<
//     string[]
//   >([]);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [customRecordCount, setCustomRecordCount] = useState('');

//   // Modal states
//   const [selectedMrn, setSelectedMrn] = useState<MrnRow | null>(null);
//   const [showPRModal, setShowPRModal] = useState(false);
//   const [showPOModal, setShowPOModal] = useState(false);

//   // ── FETCH ──
//   const fetchPurchaseItems = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await axios.get(`${BASE_URL}api/purchase/items`, {
//         withCredentials: true,
//       });

//       if (response.data?.success && response.data?.data) {
//         const grouped: MrnRow[] = response.data.data;
//         setData(grouped);
//         setFilteredData(grouped);

//         const cities = Array.from(
//           new Set(grouped.map((m) => m.city).filter(Boolean)),
//         ).sort() as string[];
//         const statuses = Array.from(
//           new Set(
//             grouped
//               .flatMap((m) => m.items.map((i) => i.purchase_status))
//               .filter(Boolean),
//           ),
//         ).sort() as string[];

//         setAvailableCities(cities);
//         setAvailablePurchaseStatuses(statuses);
//       } else {
//         setError('Failed to fetch purchase items');
//       }
//     } catch (err: any) {
//       setError(
//         err.response?.data?.message || 'Failed to fetch purchase items.',
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPurchaseItems();
//   }, []);

//   // ── FILTER ──
//   useEffect(() => {
//     let filtered = [...data];

//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (mrn) =>
//           mrn.client_name?.toLowerCase().includes(term) ||
//           mrn.mrn_number?.toLowerCase().includes(term) ||
//           mrn.city?.toLowerCase().includes(term) ||
//           mrn.items.some(
//             (i) =>
//               i.model_no?.toLowerCase().includes(term) ||
//               i.brand_name?.toLowerCase().includes(term),
//           ),
//       );
//     }

//     if (selectedCities.length > 0) {
//       filtered = filtered.filter((mrn) => selectedCities.includes(mrn.city));
//     }

//     if (selectedPurchaseStatus.length > 0) {
//       filtered = filtered.filter((mrn) =>
//         mrn.items.some((i) =>
//           selectedPurchaseStatus.includes(i.purchase_status),
//         ),
//       );
//     }

//     setFilteredData(filtered);
//     setCurrentPage(1);
//   }, [data, searchTerm, selectedCities, selectedPurchaseStatus]);

//   // ── CLEAR FILTERS ──
//   const clearFilters = () => {
//     setSearchTerm('');
//     setSelectedCities([]);
//     setSelectedPurchaseStatus([]);
//     setCustomRecordCount('');
//     setItemsPerPage(10);
//     setCurrentPage(1);
//   };

//   const handleCustomRecordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setCustomRecordCount(value);
//     if (value && !isNaN(Number(value)) && Number(value) > 0) {
//       setItemsPerPage(Number(value));
//       setCurrentPage(1);
//     }
//   };

//   // ── MODAL HANDLERS ──
//   const handleGeneratePR = (mrn: MrnRow) => {
//     setSelectedMrn(mrn);
//     setShowPRModal(true);
//   };

//   const handleGeneratePO = (mrn: MrnRow) => {
//     setSelectedMrn(mrn);
//     setShowPOModal(true);
//   };

//   const handleViewMRN = (mrnNumber: string) => {
//     navigate(`/mrn/view/${mrnNumber}`);
//   };

//   // ── PAGINATION CALC ──
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const showingStart = filteredData.length === 0 ? 0 : indexOfFirstItem + 1;
//   const showingEnd = Math.min(indexOfLastItem, filteredData.length);

//   return (
//     <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
//       {/* ── TOOLBAR ── */}
//       <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4 rounded-lg">
//         <div className="px-4 py-3">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30">
//               <FontAwesomeIcon
//                 icon={faShoppingCart}
//                 className="w-4 h-4 mr-1.5"
//               />
//               Purchase MRNs — {filteredData.length} Records
//             </span>

//             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//               {/* Show N records */}
//               <div className="relative w-full sm:w-44">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FontAwesomeIcon
//                     icon={faFileAlt}
//                     className="h-4 w-4 text-gray-400"
//                   />
//                 </div>
//                 <input
//                   type="number"
//                   className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="Show N records"
//                   value={customRecordCount}
//                   onChange={handleCustomRecordInput}
//                   min="1"
//                 />
//                 {customRecordCount && (
//                   <button
//                     onClick={() => {
//                       setCustomRecordCount('');
//                       setItemsPerPage(10);
//                       setCurrentPage(1);
//                     }}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
//                   >
//                     <FontAwesomeIcon icon={faTimes} className="h-3.5 w-3.5" />
//                   </button>
//                 )}
//               </div>

//               {/* Search */}
//               <div className="relative w-full sm:w-72">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FontAwesomeIcon
//                     icon={faSearch}
//                     className="h-4 w-4 text-gray-400"
//                   />
//                 </div>
//                 <input
//                   type="text"
//                   className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="Search MRN, client, city, product..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>

//               {/* Status filter */}
//               <select
//                 value=""
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (val && !selectedPurchaseStatus.includes(val))
//                     setSelectedPurchaseStatus((p) => [...p, val]);
//                 }}
//                 className="py-2 px-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
//               >
//                 <option value="">Filter by Status</option>
//                 {availablePurchaseStatuses.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>

//               {/* City filter */}
//               <select
//                 value=""
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (val && !selectedCities.includes(val))
//                     setSelectedCities((p) => [...p, val]);
//                 }}
//                 className="py-2 px-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
//               >
//                 <option value="">Filter by City</option>
//                 {availableCities.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>

//               {/* Reset */}
//               <button
//                 onClick={clearFilters}
//                 className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap"
//               >
//                 <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
//                 Reset
//               </button>

//               {/* Refresh */}
//               <button
//                 onClick={fetchPurchaseItems}
//                 className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 whitespace-nowrap"
//               >
//                 <svg
//                   className="h-4 w-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                   />
//                 </svg>
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── ACTIVE FILTERS ── */}
//       {(selectedCities.length > 0 || selectedPurchaseStatus.length > 0) && (
//         <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-white dark:bg-boxdark rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
//           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//             Active filters:
//           </span>
//           {selectedCities.map((city) => (
//             <span
//               key={city}
//               className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
//             >
//               <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
//               {city}
//               <button
//                 onClick={() =>
//                   setSelectedCities((p) => p.filter((c) => c !== city))
//                 }
//                 className="ml-1"
//               >
//                 ×
//               </button>
//             </span>
//           ))}
//           {selectedPurchaseStatus.map((status) => (
//             <span
//               key={status}
//               className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
//             >
//               {status}
//               <button
//                 onClick={() =>
//                   setSelectedPurchaseStatus((p) =>
//                     p.filter((s) => s !== status),
//                   )
//                 }
//                 className="ml-1"
//               >
//                 ×
//               </button>
//             </span>
//           ))}
//           <button
//             onClick={clearFilters}
//             className="ml-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 font-medium"
//           >
//             Clear all
//           </button>
//         </div>
//       )}

//       {/* ── STATES ── */}
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
//         </div>
//       ) : error ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="text-center text-red-600 dark:text-red-400">
//             <FontAwesomeIcon
//               icon={faTimesCircle}
//               className="h-12 w-12 mx-auto mb-4"
//             />
//             <p className="text-lg font-medium">{error}</p>
//             <button
//               onClick={fetchPurchaseItems}
//               className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* ── TABLE ── */}
//           <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
//             <table className="min-w-full">
//               <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
//                 <tr>
//                   <th className="w-10 px-3 py-3" />
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     MRN Number
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     Client / City
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     Products
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     Total Qty
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     Generate PR
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     Generate PO
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
//                 {currentItems.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={8}
//                       className="text-center py-16 text-gray-400 dark:text-gray-500"
//                     >
//                       <FontAwesomeIcon
//                         icon={faBoxOpen}
//                         className="h-10 w-10 mb-3 opacity-40"
//                       />
//                       <p className="text-sm">No purchase MRNs found</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   currentItems.map((mrn) => (
//                     <MrnTableRow
//                       key={mrn.mrn_id}
//                       mrn={mrn}
//                       onGeneratePR={handleGeneratePR}
//                       onGeneratePO={handleGeneratePO}
//                       onViewMRN={handleViewMRN}
//                     />
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* ── PAGINATION ── */}
//           {totalPages > 1 && (
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//               totalItems={filteredData.length}
//               itemsPerPage={itemsPerPage}
//               showingStart={showingStart}
//               showingEnd={showingEnd}
//             />
//           )}
//         </>
//       )}

//       {/* ── PR GENERATION MODAL ── */}
//       {showPRModal && selectedMrn && (
//         <PurchaseRequestModal
//           mrn={selectedMrn}
//           onClose={() => {
//             setShowPRModal(false);
//             setSelectedMrn(null);
//           }}
//           onSuccess={() => {
//             fetchPurchaseItems();
//             setShowPRModal(false);
//             setSelectedMrn(null);
//           }}
//         />
//       )}

//       {/* ── PO GENERATION MODAL ── */}
//       {showPOModal && selectedMrn && (
//         <GeneratePO
//           item={selectedMrn}
//           onClose={() => {
//             setShowPOModal(false);
//             setSelectedMrn(null);
//           }}
//           onSuccess={() => {
//             fetchPurchaseItems();
//             setShowPOModal(false);
//             setSelectedMrn(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default PurchaseMrn;









import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faTimes,
  faFileAlt,
  faMapMarkerAlt,
  faShoppingCart,
  faEye,
  faCheckCircle,
  faTimesCircle,
  faChevronDown,
  faChevronUp,
  faBoxOpen,
  faTruck,
  faFileInvoice,
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';
import PurchaseRequestModal from './PurchaseRequest.js';
import GeneratePO from './GeneratePo.js';

interface MrnItem {
  mpm_id: number;
  pr_id?: number;
  po_id?: number;
  model_id: number;
  brand_id: number;
  brand_name: string;
  model_no: string;
  purchase_qty: number;
  purchase_status: string;
  pr_status?: string;
  po_status?: string;
  execution_id?: number;
  schedule_name?: string;
}

interface MrnRow {
  mrn_id: number;
  mrn_number: string;
  client_name: string;
  city: string;
  items: MrnItem[];
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

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  showingStart,
  showingEnd,
}) => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);

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
        MRNs
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                currentPage === p
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  STATUS BADGE
// ─────────────────────────────────────────────
const getPurchaseStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    Pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Approved:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    Ordered: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Purchased:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Not Requested':
      'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
        map[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  );
};

const MrnTableRow: React.FC<{
  mrn: MrnRow;
  onGeneratePR: (mrn: MrnRow) => void;
  onGeneratePO: (mrn: MrnRow, item: MrnItem) => void;
  onViewMRN: (mrnNumber: string) => void;
}> = ({ mrn, onGeneratePR, onGeneratePO, onViewMRN }) => {
  const [expanded, setExpanded] = useState(false);

  // Check if PR is already generated for any item in this MRN
  const isPRGenerated = () => {
    return mrn.items.some((item) => item.pr_id && item.pr_id > 0);
  };

  // Check if PO is already generated for any item in this MRN
  const isPOGenerated = () => {
    return mrn.items.some((item) => item.po_id && item.po_id > 0);
  };

  // Get PR status for the MRN
  const getMRNPRStatus = () => {
    const allApproved = mrn.items.every(
      (item) => item.pr_status === 'Approved',
    );
    const anyPending = mrn.items.some(
      (item) => item.pr_status === 'Pending',
    );
    const anyGenerated = isPRGenerated();

    if (allApproved) return 'PR Approved';
    if (anyPending) return 'PR Pending';
    if (anyGenerated) return 'PR Generated';
    return 'Generate PR';
  };

  // Get PO status for the MRN
  const getMRNPOStatus = () => {
    const allOrdered = mrn.items.every((item) => item.po_status === 'Ordered');
    const anyPending = mrn.items.some((item) => item.po_status === 'Pending');
    const anyGenerated = isPOGenerated();

    if (allOrdered) return 'PO Ordered';
    if (anyPending) return 'PO Pending';
    if (anyGenerated) return 'PO Generated';
    return 'Generate PO';
  };

  // Check if PR button should be disabled
  const isPRButtonDisabled = () => {
    return (
      isPRGenerated() ||
      mrn.items.some(
        (item) => item.pr_status === 'Approved' || item.pr_status === 'Pending',
      )
    );
  };

  // Check if PO button should be disabled
  const isPOButtonDisabled = () => {
    const hasPR = mrn.items.some((item) => item.pr_id && item.pr_id > 0);
    return (
      isPOGenerated() ||
      !hasPR ||
      mrn.items.some(
        (item) => item.po_status === 'Ordered' || item.po_status === 'Pending',
      )
    );
  };

  const totalPurchaseQty = mrn.items.reduce(
    (s, i) => s + (i.purchase_qty || 0),
    0,
  );

  // Handle PR click
  const handlePRClick = () => {
    if (!isPRButtonDisabled()) {
      onGeneratePR(mrn);
    }
  };

  // Handle PO click - gets the first item from MRN
  const handlePOClick = () => {
    if (!isPOButtonDisabled() && mrn.items.length > 0) {
      onGeneratePO(mrn, mrn.items[0]);
    }
  };

  return (
    <>
      {/* ── MAIN MRN ROW ── */}
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
        {/* Expand toggle */}
        <td className="px-3 py-3 w-10">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
            title={expanded ? 'Collapse items' : 'Expand items'}
          >
            <FontAwesomeIcon
              icon={expanded ? faChevronUp : faChevronDown}
              className="h-3.5 w-3.5"
            />
          </button>
        </td>

        {/* MRN Number */}
        <td className="px-4 py-3">
          <div className="font-semibold text-sm text-purple-700 dark:text-purple-400 font-mono">
            {mrn.mrn_number}
          </div>
        </td>

        {/* Client */}
        <td className="px-4 py-3">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {mrn.client_name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
            {mrn.city}
          </div>
        </td>

        {/* Items count */}
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/30">
            <FontAwesomeIcon icon={faBoxOpen} className="h-3 w-3" />
            {mrn.items.length} {mrn.items.length === 1 ? 'product' : 'products'}
          </span>
        </td>

        {/* Total Purchase Qty */}
        <td className="px-4 py-3 text-center">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {totalPurchaseQty}
          </span>
        </td>

        {/* Generate PR Button */}
        <td className="px-4 py-3">
          <button
            onClick={handlePRClick}
            disabled={isPRButtonDisabled()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              isPRButtonDisabled()
                ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed opacity-60'
                : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-700/30 hover:bg-green-100 dark:hover:bg-green-900/40'
            }`}
            title={
              isPRButtonDisabled()
                ? getMRNPRStatus()
                : 'Generate Purchase Request'
            }
          >
            <FontAwesomeIcon icon={faFileInvoice} className="h-3 w-3" />
            {getMRNPRStatus()}
          </button>
        </td>

        {/* Generate PO Button */}
        <td className="px-4 py-3">
          <button
            onClick={handlePOClick}
            disabled={isPOButtonDisabled()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              isPOButtonDisabled()
                ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed opacity-60'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-700/30 hover:bg-blue-100 dark:hover:bg-blue-900/40'
            }`}
            title={
              isPOButtonDisabled()
                ? getMRNPOStatus()
                : 'Generate Purchase Order'
            }
          >
            <FontAwesomeIcon icon={faTruck} className="h-3 w-3" />
            {getMRNPOStatus()}
          </button>
        </td>

        {/* View Button */}
        <td className="px-4 py-3">
          <button
            onClick={() => onViewMRN(mrn.mrn_number)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            title="View MRN"
          >
            <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
            View
          </button>
        </td>
      </tr>

      {/* ── EXPANDED ITEMS PREVIEW ── */}
      {expanded && (
        <tr className="bg-indigo-50/40 dark:bg-indigo-900/10">
          <td colSpan={8} className="px-6 py-3">
            <div className="rounded-lg border border-indigo-100 dark:border-indigo-800/30 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-indigo-100/60 dark:bg-indigo-900/20">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-indigo-700 dark:text-indigo-300">
                      Product
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-indigo-700 dark:text-indigo-300">
                      Brand
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
                      Purchase Qty
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
                      Purchase Status
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
                      PR ID
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
                      PR Status
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
                      PO ID
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-indigo-700 dark:text-indigo-300">
                      PO Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 dark:divide-indigo-800/30">
                  {mrn.items.map((item) => (
                    <tr
                      key={item.mpm_id}
                      className="bg-white dark:bg-gray-800/60"
                    >
                      <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
                        {item.model_no}
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                        {item.brand_name}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-gray-800 dark:text-gray-200">
                        {item.purchase_qty}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {getPurchaseStatusBadge(item.purchase_status)}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 font-mono">
                        {item.pr_id || '—'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.pr_status ? (
                          getPurchaseStatusBadge(item.pr_status)
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 font-mono">
                        {item.po_id || '—'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.po_status ? (
                          getPurchaseStatusBadge(item.po_status)
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
const PurchaseMrn: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<MrnRow[]>([]);
  const [filteredData, setFilteredData] = useState<MrnRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedPurchaseStatus, setSelectedPurchaseStatus] = useState<
    string[]
  >([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availablePurchaseStatuses, setAvailablePurchaseStatuses] = useState<
    string[]
  >([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [customRecordCount, setCustomRecordCount] = useState('');

  // Modal states
  const [selectedMrn, setSelectedMrn] = useState<MrnRow | null>(null);
  const [selectedItem, setSelectedItem] = useState<MrnItem | null>(null);
  const [showPRModal, setShowPRModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);

  // ── FETCH ──
  const fetchPurchaseItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}api/purchase/items`, {
        withCredentials: true,
      });

      if (response.data?.success && response.data?.data) {
        const grouped: MrnRow[] = response.data.data;
        setData(grouped);
        setFilteredData(grouped);

        const cities = Array.from(
          new Set(grouped.map((m) => m.city).filter(Boolean)),
        ).sort() as string[];
        const statuses = Array.from(
          new Set(
            grouped
              .flatMap((m) => m.items.map((i) => i.purchase_status))
              .filter(Boolean),
          ),
        ).sort() as string[];

        setAvailableCities(cities);
        setAvailablePurchaseStatuses(statuses);
      } else {
        setError('Failed to fetch purchase items');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to fetch purchase items.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseItems();
  }, []);

  // ── FILTER ──
  useEffect(() => {
    let filtered = [...data];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (mrn) =>
          mrn.client_name?.toLowerCase().includes(term) ||
          mrn.mrn_number?.toLowerCase().includes(term) ||
          mrn.city?.toLowerCase().includes(term) ||
          mrn.items.some(
            (i) =>
              i.model_no?.toLowerCase().includes(term) ||
              i.brand_name?.toLowerCase().includes(term),
          ),
      );
    }

    if (selectedCities.length > 0) {
      filtered = filtered.filter((mrn) => selectedCities.includes(mrn.city));
    }

    if (selectedPurchaseStatus.length > 0) {
      filtered = filtered.filter((mrn) =>
        mrn.items.some((i) =>
          selectedPurchaseStatus.includes(i.purchase_status),
        ),
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, searchTerm, selectedCities, selectedPurchaseStatus]);

  // ── CLEAR FILTERS ──
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCities([]);
    setSelectedPurchaseStatus([]);
    setCustomRecordCount('');
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  const handleCustomRecordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomRecordCount(value);
    if (value && !isNaN(Number(value)) && Number(value) > 0) {
      setItemsPerPage(Number(value));
      setCurrentPage(1);
    }
  };

  // ── MODAL HANDLERS ──
  const handleGeneratePR = (mrn: MrnRow) => {
    setSelectedMrn(mrn);
    setShowPRModal(true);
  };

  const handleGeneratePO = (mrn: MrnRow, item: MrnItem) => {
    setSelectedMrn(mrn);
    setSelectedItem(item);
    setShowPOModal(true);
  };

  const handleViewMRN = (mrnNumber: string) => {
    navigate(`/mrn/view/${mrnNumber}`);
  };

  // ── PAGINATION CALC ──
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const showingStart = filteredData.length === 0 ? 0 : indexOfFirstItem + 1;
  const showingEnd = Math.min(indexOfLastItem, filteredData.length);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* ── TOOLBAR ── */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4 rounded-lg">
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30">
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="w-4 h-4 mr-1.5"
              />
              Purchase MRNs — {filteredData.length} Records
            </span>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Show N records */}
              <div className="relative w-full sm:w-44">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faFileAlt}
                    className="h-4 w-4 text-gray-400"
                  />
                </div>
                <input
                  type="number"
                  className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      setCurrentPage(1);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

             

              {/* Status filter */}
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !selectedPurchaseStatus.includes(val))
                    setSelectedPurchaseStatus((p) => [...p, val]);
                }}
                className="py-2 px-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Filter by Status</option>
                {availablePurchaseStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* City filter */}
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !selectedCities.includes(val))
                    setSelectedCities((p) => [...p, val]);
                }}
                className="py-2 px-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Filter by City</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Reset */}
              <button
                onClick={clearFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                Reset
              </button>

              {/* Refresh */}
              <button
                onClick={fetchPurchaseItems}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 whitespace-nowrap"
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

      {/* ── ACTIVE FILTERS ── */}
      {(selectedCities.length > 0 || selectedPurchaseStatus.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-white dark:bg-boxdark rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active filters:
          </span>
          {selectedCities.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
              {city}
              <button
                onClick={() =>
                  setSelectedCities((p) => p.filter((c) => c !== city))
                }
                className="ml-1"
              >
                ×
              </button>
            </span>
          ))}
          {selectedPurchaseStatus.map((status) => (
            <span
              key={status}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
            >
              {status}
              <button
                onClick={() =>
                  setSelectedPurchaseStatus((p) =>
                    p.filter((s) => s !== status),
                  )
                }
                className="ml-1"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={clearFilters}
            className="ml-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── STATES ── */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
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
              onClick={fetchPurchaseItems}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── TABLE ── */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="w-10 px-3 py-3" />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    MRN Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Client / City
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Total Qty
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Generate PR
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Generate PO
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-gray-400 dark:text-gray-500"
                    >
                      <FontAwesomeIcon
                        icon={faBoxOpen}
                        className="h-10 w-10 mb-3 opacity-40"
                      />
                      <p className="text-sm">No purchase MRNs found</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((mrn) => (
                    <MrnTableRow
                      key={mrn.mrn_id}
                      mrn={mrn}
                      onGeneratePR={handleGeneratePR}
                      onGeneratePO={handleGeneratePO}
                      onViewMRN={handleViewMRN}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION ── */}
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

      {/* ── PR GENERATION MODAL ── */}
      {showPRModal && selectedMrn && (
        <PurchaseRequestModal
          mrn={selectedMrn}
          onClose={() => {
            setShowPRModal(false);
            setSelectedMrn(null);
          }}
          onSuccess={() => {
            fetchPurchaseItems();
            setShowPRModal(false);
            setSelectedMrn(null);
          }}
        />
      )}

{/* ── PO GENERATION MODAL ── */}
{showPOModal && selectedMrn && (
  <GeneratePO
    mrn={selectedMrn}
    onClose={() => {
      setShowPOModal(false);
      setSelectedMrn(null);
      setSelectedItem(null);
    }}
    onSuccess={() => {
      fetchPurchaseItems();

      setShowPOModal(false);
      setSelectedMrn(null);
      setSelectedItem(null);
    }}
  />
)}
    </div>
  );
};

export default PurchaseMrn;