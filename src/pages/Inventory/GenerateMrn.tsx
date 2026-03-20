// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   FaSearch,
//   FaHistory,
//   FaUser,
//   FaPhone,
//   FaBuilding,
//   FaChevronDown,
//   FaChevronUp,
//   FaEye,
//   FaFilter,
//   FaTimes,
//   FaClock,
//   FaFileAlt,
//   FaCalendarAlt,
//   FaMapMarkerAlt,
// } from 'react-icons/fa';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faClock,
//   faFileAlt,
//   faSearch,
//   faTimes,
//   faChevronDown,
//   faFilter,
//   faEye,
//   faCalendar,
//   faLayerGroup,
// } from '@fortawesome/free-solid-svg-icons';
// import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
// import { BASE_URL } from '../../../public/config.js';
// import axios from 'axios';
// import GenerateMRNModal from './GenerateMRNModal';
// import ViewLeadDetails from './ViewLeadDetails';



// const GenerateMrn = () => {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showMRN, setShowMRN] = useState(false);
//   const [mrnData, setMrnData] = useState(null);

//   // Filter states
//   const [selectedStartFromDate, setSelectedStartFromDate] = useState('');
//   const [selectedStartToDate, setSelectedStartToDate] = useState('');
//   const [selectedEndFromDate, setSelectedEndFromDate] = useState('');
//   const [selectedEndToDate, setSelectedEndToDate] = useState('');
//   const [selectedCities, setSelectedCities] = useState([]);
//   const [availableCities, setAvailableCities] = useState([]);
//   const [selectedUsersFilter, setSelectedUsersFilter] = useState([]);
//   const [availableUsers, setAvailableUsers] = useState([]);
//   const [selectedSchedules, setSelectedSchedules] = useState([]);
//   const [availableSchedules, setAvailableSchedules] = useState([]);

//   // Dropdown states
//   const [showStartCalendar, setShowStartCalendar] = useState(false);
//   const [showEndCalendar, setShowEndCalendar] = useState(false);
//   const [showCityFilter, setShowCityFilter] = useState(false);
//   const [showUserFilter, setShowUserFilter] = useState(false);
//   const [showScheduleFilter, setShowScheduleFilter] = useState(false);

//   // Refs for dropdowns
//   const startDateRef = useRef(null);
//   const endDateRef = useRef(null);
//   const cityFilterRef = useRef(null);
//   const userFilterRef = useRef(null);
//   const scheduleFilterRef = useRef(null);

//   // Custom record count
//   const [customRecordCount, setCustomRecordCount] = useState('');

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(25);
//   const [totalLeads, setTotalLeads] = useState(0);

//   const [showMRNModal, setShowMRNModal] = useState(false);
//   const [selectedLeadData, setSelectedLeadData] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);

//   const staticMRNData = {
//     master_id: 1,
//     lead: {
//       name: 'Yogesh Jaju',
//       number: '9876543210',
//       city: 'Pune',
//     },
//     quotations: [
//       {
//         qt_id: 101,
//         qt_number: 'QT-0002',
//         total_price: 285230, // Grand Total
//         kits: [
//           {
//             kit_name: 'XTZ E-IW8 SPEAKER LCR (Made in Sweden)',
//             items: [
//               {
//                 model: '3-Way In-Wall Speaker',
//                 brand_name: 'XTZ',
//                 description:
//                   'Aluminum-magnesium tweeter, 5-inch fiberglass mid & woofer, Frequency 100–30KHz',
//                 prod_qty: 3,
//                 prod_price: 69200,
//                 total: 207600,
//               },
//             ],
//           },
//           {
//             kit_name: 'XTZ Cinema S2 Atmos Surround Speaker',
//             items: [
//               {
//                 model: 'Atmos Surround Speaker',
//                 brand_name: 'XTZ',
//                 description:
//                   '16mm soft dome tweeter, 5.25-inch woofer, 8 Ohm, 86dB, 75W continuous',
//                 prod_qty: 1,
//                 prod_price: 61730,
//                 total: 61730,
//               },
//             ],
//           },
//           {
//             kit_name: 'Dolby Atmos Ceiling Speaker',
//             items: [
//               {
//                 model: 'Ceiling Speaker',
//                 brand_name: 'Dolby',
//                 description:
//                   '0.75" soft dome tweeter, 6.5" coaxial woofer, Sensitivity 87dB',
//                 prod_qty: 1,
//                 prod_price: 15900,
//                 total: 15900,
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   };

//   useEffect(() => {
//     fetchOutwardLeads();
//   }, []);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         startDateRef.current &&
//         !startDateRef.current.contains(event.target)
//       ) {
//         setShowStartCalendar(false);
//       }
//       if (endDateRef.current && !endDateRef.current.contains(event.target)) {
//         setShowEndCalendar(false);
//       }
//       if (
//         cityFilterRef.current &&
//         !cityFilterRef.current.contains(event.target)
//       ) {
//         setShowCityFilter(false);
//       }
//       if (
//         userFilterRef.current &&
//         !userFilterRef.current.contains(event.target)
//       ) {
//         setShowUserFilter(false);
//       }
//       if (
//         scheduleFilterRef.current &&
//         !scheduleFilterRef.current.contains(event.target)
//       ) {
//         setShowScheduleFilter(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const closeAllDropdowns = () => {
//     setShowStartCalendar(false);
//     setShowEndCalendar(false);
//     setShowCityFilter(false);
//     setShowUserFilter(false);
//     setShowScheduleFilter(false);
//   };

//   const fetchOutwardLeads = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await axios.get(`${BASE_URL}api/execution/getleads`);

//       // console.log("response", response)

//       const leads: any[] = Array.isArray(response.data)
//         ? response.data
//         : Array.isArray(response.data?.data)
//         ? response.data.data
//         : [];

//       setData(leads);
//       setTotalLeads(leads.length);

//       // ---- Extract unique values safely (ES5 compatible) ----
//       const cities: string[] = Array.from(
//         new Set(leads.map((item: any) => item.city).filter(Boolean)),
//       );

//       const users: string[] = Array.from(
//         new Set(leads.map((item: any) => item.assigned_to).filter(Boolean)),
//       );

//       const schedules: string[] = Array.from(
//         new Set(leads.map((item: any) => item.schedule_name).filter(Boolean)),
//       );

//       setAvailableCities(cities);
//       setAvailableUsers(users);
//       setAvailableSchedules(schedules);
//     } catch (err: any) {
//       console.error('Error fetching outward leads:', err);

//       setError(
//         err?.response?.data?.message ||
//           'Failed to fetch outward leads. Please try again.',
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCustomRecordInput = (e) => {
//     const value = e.target.value;
//     setCustomRecordCount(value);
//     if (value && parseInt(value) > 0) {
//       setItemsPerPage(parseInt(value));
//       setCurrentPage(1);
//     } else {
//       setItemsPerPage(25);
//     }
//   };

//   const clearCustomRecordCount = () => {
//     setCustomRecordCount('');
//     setItemsPerPage(25);
//     setCurrentPage(1);
//   };

//   const clearFilters = () => {
//     setSelectedStartFromDate('');
//     setSelectedStartToDate('');
//     setSelectedEndFromDate('');
//     setSelectedEndToDate('');
//     setSelectedCities([]);
//     setSelectedUsersFilter([]);
//     setSelectedSchedules([]);
//     setSearchTerm('');
//     setCurrentPage(1);
//   };

//   const handleCitySelect = (city) => {
//     setSelectedCities((prev) =>
//       prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
//     );
//     setCurrentPage(1);
//   };

//   const handleUserSelect = (user) => {
//     setSelectedUsersFilter((prev) =>
//       prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user],
//     );
//     setCurrentPage(1);
//   };

//   const handleScheduleSelect = (schedule) => {
//     setSelectedSchedules((prev) =>
//       prev.includes(schedule)
//         ? prev.filter((s) => s !== schedule)
//         : [...prev, schedule],
//     );
//     setCurrentPage(1);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString || dateString === 'Not Available' || dateString === 'N/A')
//       return 'N/A';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return dateString;
//       return date.toLocaleDateString('en-GB', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric',
//       });
//     } catch {
//       return dateString;
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return 'NA';
//     return name
//       .split(' ')
//       .map((word) => word[0])
//       .join('')
//       .toUpperCase()
//       .substring(0, 2);
//   };
  
  
//   // const handleGenerateClick = () => {
//   //   setShowMRNModal(true);
//   //   console.log('button clicked');
//   // };

//   const handleGenerateClick = () => {
//   setSelectedLeadData(staticMRNData); // store static data
//   setShowMRNModal(true);
//   console.log("Generate MRN clicked");
// };

// const handleSaveMRN = (mrnData) => {
//   console.log("MRN Generated:", mrnData);

//   // static flow for now
//   setShowMRNModal(false);
//   setSelectedLeadData(null);
// };

//   const handleViewDetails = (lead) => {
//     setSelectedLead(lead);
//     setShowDetailsModal(true);
//   };

//   // Filter logic
//   const filteredData = data.filter((item) => {
//     // Search filter
//     const matchesSearch =
//       !searchTerm ||
//       item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.number?.includes(searchTerm) ||
//       item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.schedule_name?.toLowerCase().includes(searchTerm.toLowerCase());

//     // Start date filter
//     const itemStartDate = item.execution_start_date
//       ? new Date(item.execution_start_date)
//       : null;
//     const matchesStartDate =
//       (!selectedStartFromDate ||
//         (itemStartDate && itemStartDate >= new Date(selectedStartFromDate))) &&
//       (!selectedStartToDate ||
//         (itemStartDate && itemStartDate <= new Date(selectedStartToDate)));

//     // End date filter
//     const itemEndDate = item.execution_end_date
//       ? new Date(item.execution_end_date)
//       : null;
//     const matchesEndDate =
//       (!selectedEndFromDate ||
//         (itemEndDate && itemEndDate >= new Date(selectedEndFromDate))) &&
//       (!selectedEndToDate ||
//         (itemEndDate && itemEndDate <= new Date(selectedEndToDate)));

//     // City filter
//     const matchesCity =
//       selectedCities.length === 0 || selectedCities.includes(item.city);

//     // User filter
//     const matchesUser =
//       selectedUsersFilter.length === 0 ||
//       selectedUsersFilter.includes(item.assigned_to);

//     // Schedule filter
//     const matchesSchedule =
//       selectedSchedules.length === 0 ||
//       selectedSchedules.includes(item.schedule_name);

//     return (
//       matchesSearch &&
//       matchesStartDate &&
//       matchesEndDate &&
//       matchesCity &&
//       matchesUser &&
//       matchesSchedule
//     );
//   });

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const showingStart = filteredData.length > 0 ? indexOfFirstItem + 1 : 0;
//   const showingEnd = Math.min(indexOfLastItem, filteredData.length);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   // Pagination Component
//   const Pagination = ({
//     currentPage,
//     totalPages,
//     onPageChange,
//     totalItems,
//     itemsPerPage,
//     showingStart,
//     showingEnd,
//   }) => {
//     const pageNumbers = [];
//     for (let i = 1; i <= totalPages; i++) {
//       pageNumbers.push(i);
//     }

//     const renderPageNumbers = () => {
//       if (totalPages <= 7) {
//         return pageNumbers.map((number) => (
//           <button
//             key={number}
//             onClick={() => onPageChange(number)}
//             className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
//               currentPage === number
//                 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
//                 : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//             }`}
//           >
//             {number}
//           </button>
//         ));
//       }

//       let pages = [];
//       if (currentPage <= 3) {
//         pages = [1, 2, 3, 4, '...', totalPages];
//       } else if (currentPage >= totalPages - 2) {
//         pages = [
//           1,
//           '...',
//           totalPages - 3,
//           totalPages - 2,
//           totalPages - 1,
//           totalPages,
//         ];
//       } else {
//         pages = [
//           1,
//           '...',
//           currentPage - 1,
//           currentPage,
//           currentPage + 1,
//           '...',
//           totalPages,
//         ];
//       }

//       return pages.map((page, index) => {
//         if (page === '...') {
//           return (
//             <span
//               key={`ellipsis-${index}`}
//               className="px-2 text-gray-500 dark:text-gray-400"
//             >
//               ...
//             </span>
//           );
//         }
//         return (
//           <button
//             key={page}
//             onClick={() => onPageChange(page)}
//             className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
//               currentPage === page
//                 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
//                 : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//             }`}
//           >
//             {page}
//           </button>
//         );
//       });
//     };

//     return (
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
//         <div className="text-sm text-gray-600 dark:text-gray-400">
//           Showing{' '}
//           <span className="font-semibold text-gray-900 dark:text-white">
//             {showingStart}
//           </span>{' '}
//           to{' '}
//           <span className="font-semibold text-gray-900 dark:text-white">
//             {showingEnd}
//           </span>{' '}
//           of{' '}
//           <span className="font-semibold text-gray-900 dark:text-white">
//             {totalItems}
//           </span>{' '}
//           results
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => onPageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//           >
//             Previous
//           </button>
//           <div className="flex items-center gap-1">{renderPageNumbers()}</div>
//           <button
//             onClick={() => onPageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="p-4">
//       {/* Sticky Header with Filters */}
//       <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">
//         <div className="px-4 py-3">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
//             <div className="flex items-center gap-3">
//               {/* <h2 className="text-lg font-medium text-gray-800 dark:text-white">
//                 Outward Leads
//               </h2> */}
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30">
//                 <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-1" />
//                 {filteredData.length} Records
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
//                     className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     placeholder="Show N records"
//                     value={customRecordCount}
//                     onChange={handleCustomRecordInput}
//                     min="1"
//                   />
//                   {customRecordCount && (
//                     <button
//                       onClick={clearCustomRecordCount}
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                       title="Clear limit"
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
//                     className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     placeholder="Search name, phone, city, schedule..."
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
//                 onClick={fetchOutwardLeads}
//                 className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
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
//       {(selectedStartFromDate ||
//         selectedStartToDate ||
//         selectedEndFromDate ||
//         selectedEndToDate ||
//         selectedUsersFilter.length > 0 ||
//         selectedCities.length > 0 ||
//         selectedSchedules.length > 0) && (
//         <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
//           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//             Active filters:
//           </span>
//           <div className="flex flex-wrap gap-2">
//             {(selectedStartFromDate || selectedStartToDate) && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
//                 Start Date: {formatDate(selectedStartFromDate) || 'Any'} to{' '}
//                 {formatDate(selectedStartToDate) || 'Any'}
//                 <button
//                   onClick={() => {
//                     setSelectedStartFromDate('');
//                     setSelectedStartToDate('');
//                   }}
//                   className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
//                 >
//                   ×
//                 </button>
//               </span>
//             )}
//             {(selectedEndFromDate || selectedEndToDate) && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
//                 End Date: {formatDate(selectedEndFromDate) || 'Any'} to{' '}
//                 {formatDate(selectedEndToDate) || 'Any'}
//                 <button
//                   onClick={() => {
//                     setSelectedEndFromDate('');
//                     setSelectedEndToDate('');
//                   }}
//                   className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400"
//                 >
//                   ×
//                 </button>
//               </span>
//             )}
//             {selectedUsersFilter.map((user) => (
//               <span
//                 key={user}
//                 className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
//               >
//                 User: {user}
//                 <button
//                   onClick={() => handleUserSelect(user)}
//                   className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//             {selectedCities.map((city) => (
//               <span
//                 key={city}
//                 className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
//               >
//                 City: {city}
//                 <button
//                   onClick={() => handleCitySelect(city)}
//                   className="ml-1 text-teal-600 hover:text-teal-800 dark:text-teal-400"
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//             {selectedSchedules.map((schedule) => (
//               <span
//                 key={schedule}
//                 className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
//               >
//                 Schedule: {schedule}
//                 <button
//                   onClick={() => handleScheduleSelect(schedule)}
//                   className="ml-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//             <button
//               onClick={clearFilters}
//               className="ml-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
//             >
//               Clear all filters
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//         </div>
//       ) : (
//         <>
//           {/* Table */}
//           <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
//               <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
//                 <tr>
//                   {/* Start Date Column with Filter */}
//                   <th className="py-3 px-4 relative">
//                     <div
//                       ref={startDateRef}
//                       className="flex items-center justify-between gap-2"
//                     >
//                       <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                         Start Date
//                       </span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           closeAllDropdowns();
//                           setShowStartCalendar(!showStartCalendar);
//                         }}
//                         className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
//                       >
//                         <FontAwesomeIcon
//                           icon={faChevronDown}
//                           className={`h-3 w-3 transition-transform duration-200 ${
//                             showStartCalendar ? 'rotate-180' : ''
//                           }`}
//                         />
//                       </button>
//                     </div>

//                     {/* Start Date Calendar Dropdown */}
//                     {showStartCalendar && (
//                       <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
//                         <div className="flex justify-between items-center mb-3">
//                           <span className="font-semibold text-sm dark:text-white">
//                             Select Start Date Range
//                           </span>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setSelectedStartFromDate('');
//                               setSelectedStartToDate('');
//                               setShowStartCalendar(false);
//                             }}
//                             className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
//                           >
//                             Clear
//                           </button>
//                         </div>

//                         <div className="space-y-3">
//                           <div>
//                             <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                               From Date
//                             </label>
//                             <input
//                               type="date"
//                               value={selectedStartFromDate}
//                               onChange={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedStartFromDate(e.target.value);
//                               }}
//                               onClick={(e) => e.stopPropagation()}
//                               className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             />
//                           </div>

//                           <div>
//                             <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                               To Date
//                             </label>
//                             <input
//                               type="date"
//                               value={selectedStartToDate}
//                               onChange={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedStartToDate(e.target.value);
//                               }}
//                               onClick={(e) => e.stopPropagation()}
//                               className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             />
//                           </div>
//                         </div>

//                         <div className="mt-4">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setShowStartCalendar(false);
//                             }}
//                             className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
//                           >
//                             Apply Filter
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </th>

//                   {/* End Date Column with Filter */}
//                   <th className="py-3 px-4 relative">
//                     <div
//                       ref={endDateRef}
//                       className="flex items-center justify-between gap-2"
//                     >
//                       <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                         End Date
//                       </span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           closeAllDropdowns();
//                           setShowEndCalendar(!showEndCalendar);
//                         }}
//                         className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
//                       >
//                         <FontAwesomeIcon
//                           icon={faChevronDown}
//                           className={`h-3 w-3 transition-transform duration-200 ${
//                             showEndCalendar ? 'rotate-180' : ''
//                           }`}
//                         />
//                       </button>
//                     </div>

//                     {/* End Date Calendar Dropdown */}
//                     {showEndCalendar && (
//                       <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
//                         <div className="flex justify-between items-center mb-3">
//                           <span className="font-semibold text-sm dark:text-white">
//                             Select End Date Range
//                           </span>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setSelectedEndFromDate('');
//                               setSelectedEndToDate('');
//                               setShowEndCalendar(false);
//                             }}
//                             className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
//                           >
//                             Clear
//                           </button>
//                         </div>

//                         <div className="space-y-3">
//                           <div>
//                             <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                               From Date
//                             </label>
//                             <input
//                               type="date"
//                               value={selectedEndFromDate}
//                               onChange={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedEndFromDate(e.target.value);
//                               }}
//                               onClick={(e) => e.stopPropagation()}
//                               className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             />
//                           </div>

//                           <div>
//                             <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                               To Date
//                             </label>
//                             <input
//                               type="date"
//                               value={selectedEndToDate}
//                               onChange={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedEndToDate(e.target.value);
//                               }}
//                               onClick={(e) => e.stopPropagation()}
//                               className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             />
//                           </div>
//                         </div>

//                         <div className="mt-4">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setShowEndCalendar(false);
//                             }}
//                             className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
//                           >
//                             Apply Filter
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </th>

//                   {/* Client Name */}
//                   <th className="py-3 px-4">
//                     <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Client Name
//                     </div>
//                   </th>

//                   {/* City Column with Filter */}
//                   <th className="py-3 px-4 relative">
//                     <div
//                       ref={cityFilterRef}
//                       className="flex items-center justify-between gap-2"
//                     >
//                       <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                         City
//                       </span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           closeAllDropdowns();
//                           setShowCityFilter(!showCityFilter);
//                         }}
//                         className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
//                       >
//                         <FontAwesomeIcon
//                           icon={faFilter}
//                           className={`h-3 w-3 transition-colors duration-200 ${
//                             selectedCities.length > 0 ? 'text-blue-600' : ''
//                           } ${showCityFilter ? 'text-blue-600' : ''}`}
//                         />
//                       </button>
//                     </div>

//                     {/* City Filter Dropdown */}
//                     {showCityFilter && (
//                       <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
//                         <div className="flex justify-between items-center mb-3">
//                           <span className="font-semibold text-sm dark:text-white">
//                             Filter Cities
//                           </span>
//                           <div className="flex gap-2">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedCities([]);
//                               }}
//                               className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
//                             >
//                               Clear All
//                             </button>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setShowCityFilter(false);
//                               }}
//                               className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         </div>

//                         {availableCities.length > 0 ? (
//                           <>
//                             {availableCities.map((city) => (
//                               <div
//                                 key={city}
//                                 className="flex items-center mb-2"
//                               >
//                                 <input
//                                   type="checkbox"
//                                   id={`city-${city}`}
//                                   checked={selectedCities.includes(city)}
//                                   onChange={(e) => {
//                                     e.stopPropagation();
//                                     handleCitySelect(city);
//                                   }}
//                                   onClick={(e) => e.stopPropagation()}
//                                   className="h-3.5 w-3.5 mr-2.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
//                                 />
//                                 <label
//                                   htmlFor={`city-${city}`}
//                                   className="text-sm font-medium dark:text-white cursor-pointer truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                                 >
//                                   {city}
//                                 </label>
//                               </div>
//                             ))}
//                           </>
//                         ) : (
//                           <div className="text-sm font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
//                             No cities available
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </th>

//                   {/* Schedule Name with Filter */}
//                   <th className="py-3 px-4 relative">
//                     <div
//                       ref={scheduleFilterRef}
//                       className="flex items-center justify-between gap-2"
//                     >
//                       <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                         Schedule
//                       </span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           closeAllDropdowns();
//                           setShowScheduleFilter(!showScheduleFilter);
//                         }}
//                         className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
//                       >
//                         <FontAwesomeIcon
//                           icon={faFilter}
//                           className={`h-3 w-3 transition-colors duration-200 ${
//                             selectedSchedules.length > 0 ? 'text-blue-600' : ''
//                           } ${showScheduleFilter ? 'text-blue-600' : ''}`}
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
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedSchedules([]);
//                               }}
//                               className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
//                             >
//                               Clear All
//                             </button>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setShowScheduleFilter(false);
//                               }}
//                               className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         </div>

//                         {availableSchedules.length > 0 ? (
//                           <>
//                             {availableSchedules.map((schedule) => (
//                               <div
//                                 key={schedule}
//                                 className="flex items-center mb-2"
//                               >
//                                 <input
//                                   type="checkbox"
//                                   id={`schedule-${schedule}`}
//                                   checked={selectedSchedules.includes(schedule)}
//                                   onChange={(e) => {
//                                     e.stopPropagation();
//                                     handleScheduleSelect(schedule);
//                                   }}
//                                   onClick={(e) => e.stopPropagation()}
//                                   className="h-3.5 w-3.5 mr-2.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
//                                 />
//                                 <label
//                                   htmlFor={`schedule-${schedule}`}
//                                   className="text-sm font-medium dark:text-white cursor-pointer truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                                 >
//                                   {schedule}
//                                 </label>
//                               </div>
//                             ))}
//                           </>
//                         ) : (
//                           <div className="text-sm font-medium text-gray-500 dark:text-gray-400 italic py-3 text-center">
//                             No schedules available
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </th>

//                   {/* Action Column */}
//                   <th className="py-3 px-4">
//                     <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Action
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
//                           icon={faFileAlt}
//                           className="h-12 w-12 mx-auto mb-4 opacity-50"
//                         />
//                         <p className="text-lg font-medium">
//                           No outward leads found
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   currentItems.map((lead) => (
//                     <tr
//                       key={lead.master_id}
//                       className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
//                     >
//                       {/* Execution Start Date */}
//                       <td className="py-4 px-4">
//                         <div className="font-semibold text-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
//                           {formatDate(lead.execution_start_date)}
//                         </div>
//                       </td>

//                       {/* Execution End Date */}
//                       <td className="py-4 px-4">
//                         <div className="font-semibold text-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800/30 shadow-sm">
//                           {formatDate(lead.execution_end_date)}
//                         </div>
//                       </td>

//                       {/* Client Name - Clickable */}
//                       <td className="py-4 px-4">
//                         <div
//                           onClick={() => handleViewDetails(lead)}
//                           className="group cursor-pointer"
//                         >
//                           <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
//                             {lead.name || 'N/A'}
//                           </div>
//                           <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                             {lead.number || '—'}
//                           </div>
//                         </div>
//                       </td>

//                       {/* City */}
//                       <td className="py-4 px-4">
//                         <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
//                           <FaMapMarkerAlt className="text-gray-400 text-xs" />
//                           {lead.city || '—'}
//                         </div>
//                       </td>

//                       {/* Schedule Name */}
//                       <td className="py-4 px-4">
//                         <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
//                           {lead.schedule_name || 'N/A'}
//                         </div>
//                       </td>

//                       {/* Action Buttons */}
//                       <td className="py-4 px-4">
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => handleGenerateClick()}
//                             className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1"
//                           >
//                             <FontAwesomeIcon
//                               icon={faFileAlt}
//                               className="h-3 w-3"
//                             />
//                             Generate MRN
//                           </button>

//                           <button
//                             onClick={() => handleViewDetails(lead)}
//                             className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg hover:scale-105 transition-transform relative"
//                             title="View Details"
//                           >
//                             <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={handlePageChange}
//               totalItems={filteredData.length}
//               itemsPerPage={itemsPerPage}
//               showingStart={showingStart}
//               showingEnd={showingEnd}
//             />
//           )}

//           {/* {showMRNModal && (
//   <GenerateMRNModal
//     data={selectedLeadData}
//     onClose={() => setShowMRNModal(false)}
//     // onSave={handleSaveMRN}
   
//   />
// )} */}
//        {showMRNModal && selectedLeadData && (
//   <GenerateMRNModal
//     data={selectedLeadData}
//     onClose={() => {
//       setShowMRNModal(false);
//       setSelectedLeadData(null);
//     }}
//     onSave={handleSaveMRN}   
//   />
// )}

//           {showDetailsModal && selectedLead && (
//             <ViewLeadDetails
//               lead={selectedLead}
//               onClose={() => setShowDetailsModal(false)}
//             />
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default GenerateMrn;





import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faFileAlt,
  faTimes,
  faSearch,
  faChevronDown,
  faFilter,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { FaMapMarkerAlt } from "react-icons/fa";
import GenerateMRNModal from "./GenerateMRNModal";
import ViewLeadDetails from "./ViewLeadDetails";
// import Pagination from "./Pagination";/

const GenerateMrn = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customRecordCount, setCustomRecordCount] = useState("");
  
  // Filter states
  const [selectedStartFromDate, setSelectedStartFromDate] = useState("");
  const [selectedStartToDate, setSelectedStartToDate] = useState("");
  const [selectedEndFromDate, setSelectedEndFromDate] = useState("");
  const [selectedEndToDate, setSelectedEndToDate] = useState("");
  const [selectedUsersFilter, setSelectedUsersFilter] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  
  // Dropdown visibility states
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [showScheduleFilter, setShowScheduleFilter] = useState(false);
  
  // Modal states
  const [showMRNModal, setShowMRNModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeadData, setSelectedLeadData] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Refs for dropdowns
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const cityFilterRef = useRef(null);
  const scheduleFilterRef = useRef(null);

  // Static data for demonstration
  const staticMRNData = {
    master_id: 1,
    lead: {
      name: 'Yogesh Jaju',
      number: '9876543210',
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
                description: 'Aluminum-magnesium tweeter, 5-inch fiberglass mid & woofer, Frequency 100–30KHz',
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
                description: '16mm soft dome tweeter, 5.25-inch woofer, 8 Ohm, 86dB, 75W continuous',
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
                description: '0.75" soft dome tweeter, 6.5" coaxial woofer, Sensitivity 87dB',
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

  // Sample data with MRN status
  const [outwardLeads, setOutwardLeads] = useState([
    {
      master_id: 1,
      name: 'Yogesh Jaju',
      number: '9876543210',
      city: 'Pune',
      schedule_name: 'Home Theater',
      execution_start_date: '2024-01-15',
      execution_end_date: '2024-01-20',
      mrn_generated: false,
      mrn_number: null
    },
    {
      master_id: 2,
      name: 'Rahul Sharma',
      number: '9876543211',
      city: 'Mumbai',
      schedule_name: 'Evening Schedule',
      execution_start_date: '2024-01-16',
      execution_end_date: '2024-01-21',
      mrn_generated: true,
      mrn_number: 'MRN001'
    },
    {
      master_id: 3,
      name: 'Priya Patel',
      number: '9876543212',
      city: 'Delhi',
      schedule_name: 'phase1',
      execution_start_date: '2024-01-17',
      execution_end_date: '2024-01-22',
      mrn_generated: false,
      mrn_number: null
    },
  ]);

  // Filter out MRN generated leads from display
  const getDisplayLeads = () => {
    return outwardLeads.filter(lead => !lead.mrn_generated);
  };

  useEffect(() => {
    setOriginalData(getDisplayLeads());
    setFilteredData(getDisplayLeads());
  }, [outwardLeads]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const showingStart = indexOfFirstItem + 1;
  const showingEnd = Math.min(indexOfLastItem, filteredData.length);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).split('/').join('/');
  };

  // Handle search
  useEffect(() => {
    let filtered = originalData;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.number?.includes(searchTerm) ||
        lead.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.schedule_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, originalData]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedStartFromDate('');
    setSelectedStartToDate('');
    setSelectedEndFromDate('');
    setSelectedEndToDate('');
    setSelectedUsersFilter([]);
    setSelectedCities([]);
    setSelectedSchedules([]);
    setSearchTerm('');
    setCustomRecordCount('');
    setFilteredData(originalData);
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowStartCalendar(false);
    setShowEndCalendar(false);
    setShowCityFilter(false);
    setShowScheduleFilter(false);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startDateRef.current && !startDateRef.current.contains(event.target)) {
        setShowStartCalendar(false);
      }
      if (endDateRef.current && !endDateRef.current.contains(event.target)) {
        setShowEndCalendar(false);
      }
      if (cityFilterRef.current && !cityFilterRef.current.contains(event.target)) {
        setShowCityFilter(false);
      }
      if (scheduleFilterRef.current && !scheduleFilterRef.current.contains(event.target)) {
        setShowScheduleFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle city selection
  const handleCitySelect = (city) => {
    setSelectedCities(prev => {
      if (prev.includes(city)) {
        return prev.filter(c => c !== city);
      } else {
        return [...prev, city];
      }
    });
  };

  // Handle schedule selection
  const handleScheduleSelect = (schedule) => {
    setSelectedSchedules(prev => {
      if (prev.includes(schedule)) {
        return prev.filter(s => s !== schedule);
      } else {
        return [...prev, schedule];
      }
    });
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUsersFilter(prev => {
      if (prev.includes(user)) {
        return prev.filter(u => u !== user);
      } else {
        return [...prev, user];
      }
    });
  };

  // Handle custom record input
  const handleCustomRecordInput = (e) => {
    const value = e.target.value;
    setCustomRecordCount(value);
  };

  const clearCustomRecordCount = () => {
    setCustomRecordCount('');
  };

  // Fetch outward leads
  const fetchOutwardLeads = () => {
    setLoading(true);
    setTimeout(() => {
      setOriginalData(getDisplayLeads());
      setFilteredData(getDisplayLeads());
      setLoading(false);
    }, 500);
  };

  // Handle generate click
  const handleGenerateClick = (lead) => {
    setSelectedLeadData({
      ...staticMRNData,
      master_id: lead.master_id,
      lead: {
        name: lead.name,
        number: lead.number,
        city: lead.city
      }
    });
    setShowMRNModal(true);
  };

  // Handle view details
  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle save MRN
  const handleSaveMRN = (generatedMRN) => {
    // Update the outwardLeads state to mark MRN as generated
    setOutwardLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.master_id === generatedMRN.master_id
          ? { ...lead, mrn_generated: true, mrn_number: generatedMRN.mrn_number }
          : lead
      )
    );
    
    // Close the modal
    setShowMRNModal(false);
    setSelectedLeadData(null);
  };

  // Get available cities for filter
  const availableCities = [...new Set(originalData.map(lead => lead.city).filter(Boolean))];
  
  // Get available schedules for filter
  const availableSchedules = [...new Set(originalData.map(lead => lead.schedule_name).filter(Boolean))];

  return (
    <div className="p-4">
      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30">
                <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-1" />
                {filteredData.length} Records
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
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Search name, phone, city, schedule..."
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
        selectedUsersFilter.length > 0 ||
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
            {selectedUsersFilter.map((user) => (
              <span
                key={user}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              >
                User: {user}
                <button
                  onClick={() => handleUserSelect(user)}
                  className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                >
                  ×
                </button>
              </span>
            ))}
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
                        <FontAwesomeIcon
                          icon={faChevronDown}
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
                        <FontAwesomeIcon
                          icon={faFilter}
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
                        <FontAwesomeIcon
                          icon={faFilter}
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
                        <FontAwesomeIcon
                          icon={faFileAlt}
                          className="h-12 w-12 mx-auto mb-4 opacity-50"
                        />
                        <p className="text-lg font-medium">
                          No outward leads found
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

                      {/* Execution End Date */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800/30 shadow-sm">
                          {formatDate(lead.execution_end_date)}
                        </div>
                      </td>

                      {/* Client Name - Clickable */}
                      <td className="py-4 px-4">
                        <div
                          onClick={() => handleViewDetails(lead)}
                          className="group cursor-pointer"
                        >
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
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
                          <FaMapMarkerAlt className="text-gray-400 text-xs" />
                          {lead.city || '—'}
                        </div>
                      </td>

                      {/* Schedule Name */}
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {lead.schedule_name || 'N/A'}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGenerateClick(lead)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1"
                          >
                            <FontAwesomeIcon
                              icon={faFileAlt}
                              className="h-3 w-3"
                            />
                            Generate MRN
                          </button>

                          <button
                            onClick={() => handleViewDetails(lead)}
                            className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg hover:scale-105 transition-transform relative"
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
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
          {/* {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              showingStart={showingStart}
              showingEnd={showingEnd}
            />
          )} */}

          {/* MRN Generation Modal */}
          {showMRNModal && selectedLeadData && (
            <GenerateMRNModal
              data={selectedLeadData}
              onClose={() => {
                setShowMRNModal(false);
                setSelectedLeadData(null);
              }}
              onSave={handleSaveMRN}
            />
          )}

          {/* View Details Modal */}
          {showDetailsModal && selectedLead && (
            <ViewLeadDetails
              lead={selectedLead}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GenerateMrn;