// import React, { useState, useEffect } from 'react';
// import {
//   Users,
//   UserCheck,
//   ClipboardList,
//   CalendarCheck,
//   Layers,
//   Package,
//   Megaphone,
//   Hourglass,
//   BarChart3,
//   PieChart,
//   Filter,
//   CheckSquare,
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import CardDataStats from '../../components/CardDataStats';
// import { BASE_URL } from '../../../public/config.js';
// import { useNavigate } from 'react-router-dom';
// import Chart from "react-apexcharts";

// const ECommerce: React.FC = () => {
//   const [totalLeads, setTotalLeads] = useState<number | null>(null);
//   const [assignedLeads, setAssignedLeads] = useState<number | null>(null);
//   const [totalfollowups, setfollowups] = useState<number | null>(null);
//   const [meetingScheduled, setMeetingScheduled] = useState<number | null>(null);
//   const [totalProducts, setTotalProducts] = useState<number | null>(null);
//   const [totalcategory, settotalcategory] = useState<number | null>(null);
//   const [convertedLeads, setConvertedLeads] = useState<number | null>(null);
//   const [pendingLeads, setpendingLeads] = useState<number | null>(null);
//   const [totalCampaigns, setTotalCampaigns] = useState(0);
//   const [inactiveLeads, setInactiveLeads] = useState(0);
//   const [role, setRole] = useState<string>('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const [dropLeads, setDropLeads] = useState<number | null>(null);
//   const [closedLeads, setClosedLeads] = useState<number | null>(null);
//   const [chartData, setChartData] = useState<Record<string, number> | null>(null);
//   const [todaysAssignedLeads, setTodaysAssignedLeads] = useState<number | null>(null);
//   const [upcomingAssigned, setUpcomingAssigned] = useState<number | null>(null);
//   const [categoryChartData, setCategoryChartData] = useState<Record<string, number> | null>(null);
//   const [referenceChartData, setReferenceChartData] = useState<Record<string, number> | null>(null);
//   const [showCharts, setShowCharts] = useState(true);
//   const [showZeroValues, setShowZeroValues] = useState(true);

//   const [quotationPending, setQuotationPending] = useState<number | null>(null);
// const [quotationFollowup, setQuotationFollowup] = useState<number | null>(null);
// const [demoLeads, setDemoLeads] = useState<number | null>(null);

// const [projectionLeads, setProjectionLeads] = useState<number | null>(null);

//   const [budgetRangeChartData, setBudgetRangeChartData] =
//   useState<Record<string, number> | null>(null);

//   const ADMIN_LIKE_ROLES = ['admin', 'sub_admin'];
//   const ADMIN_AND_SUB_ADMIN_ROLES = ['admin', 'sub_admin'];

//   const TELECALLER_LIKE_ROLES = [
//     'tele-caller',
//     'tele_caller',
//     'digital-marketing',
//     'digital_marketing',
//     'field-marketing-executive',
//     'field_marketing_executive',
//     'tech-sale-sound-engineer',
//     'tech_sale_sound_engineer',
//     'junior-autocad-designer',
//     'junior_autocad_designer',
//     'senior-autocad-designer',
//     'senior_autocad_designer',
//     'technical_head',
//   ];

//   const isAdminOrSubAdmin = ADMIN_AND_SUB_ADMIN_ROLES.includes(role);

// const totalLeadsForCard = totalLeads;

// const leadStageColors: Record<string, string> = {
//   'Fresh Lead': '#E5E7EB',        // light gray (VISIBLE)
//   'Cold Lead': '#9CA3AF',
//   'On Hold': '#FDE68A',
//   'Positive Lead': '#93C5FD',
//   'Pre Site Visit': '#C4B5FD',
//   'Demo': '#F9A8D4',
//   'Quotation Pending': '#F59E0B',
//     'Post Site Visit': '#6D28D9',
//   'Quotation Follow-up': '#92400E',
//   'Projection List': '#86EFAC',
//   'Drop': '#EF4444',
//   'Closed Deal': '#166534',
//   'Others': '#CBD5E1',
// };

//   // Function to filter out zero values if needed
//   const filterChartData = (data: Record<string, number> | null, showZero: boolean) => {
//     if (!data) return null;

//     if (!showZero) {
//       const filtered: Record<string, number> = {};
//       Object.entries(data).forEach(([key, value]) => {
//         if (value > 0) {
//           filtered[key] = value;
//         }
//       });
//       return filtered;
//     }

//     return data;
//   };

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch(`${BASE_URL}auth/check-session`, {
//           credentials: 'include',
//         });
//         const data = await response.json();

//         if (data.isAuthenticated) {
//           setIsAuthenticated(true);
//           setRole(data.role);
//         } else {
//           setIsAuthenticated(false);
//           navigate('/login');
//         }
//       } catch (err) {
//         console.error('Error checking session:', err);
//         setIsAuthenticated(false);
//       }
//     };

//     checkAuth();
//   }, [navigate]);

//   useEffect(() => {
//   if (!isAuthenticated) return;

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true);

//       // ========== COMMON ENDPOINTS FOR ALL ROLES ==========
//       const fetchWithSession = (url: string, options: RequestInit = {}) =>
//         fetch(url, { ...options, credentials: 'include' });

//       // Lead Stage Summary
//       const summaryRes = await fetchWithSession(`${BASE_URL}api/dashboard/lead-summary`);
//       const summaryData = await summaryRes.json();
//       setChartData(summaryData.summary || {});

//       // Category Summary
//       const categorySummaryRes = await fetchWithSession(`${BASE_URL}api/dashboard/category-summary`);
//       const categorySummaryData = await categorySummaryRes.json();
//       setCategoryChartData(categorySummaryData.summary || {});

//       // Reference Summary
//       const referenceSummaryRes = await fetchWithSession(`${BASE_URL}api/dashboard/reference-summary`);
//       const referenceSummaryData = await referenceSummaryRes.json();
//       setReferenceChartData(referenceSummaryData.summary || {});

//       // Assigned Leads Count
//       const assignedRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/assigned-count`);
//       const assignedData = await assignedRes.json();
//       setAssignedLeads(assignedData.assigned_count || 0);

//       // Today's To-Do List
//       const todayAssignedRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/todays-assigned-count`);
//       const todayAssignedData = await todayAssignedRes.json();
//       setTodaysAssignedLeads(todayAssignedData.total || 0);

//       // Upcoming Followups
//       const upcomingRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/upcoming-assigned-count`);
//       const upcomingData = await upcomingRes.json();
//       setUpcomingAssigned(upcomingData.upcoming || 0);

//       // Missed Followups
//       const followupsRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/missed-assigned-count`);
//       const partsData = await followupsRes.json();
//       setfollowups(partsData.missed || 0);

//         const response = await fetchWithSession(`${BASE_URL}api/master-data`);
//         const rawData = await response.json();
//         setTotalLeads(rawData.length || 0);

//       // ========== ADMIN/SUB-ADMIN ONLY ENDPOINTS ==========
//       if (ADMIN_AND_SUB_ADMIN_ROLES.includes(role)) {
//         // Total Leads

//               // Budget Range Summary (ADMIN / SUB-ADMIN ONLY)
// const budgetRes = await fetchWithSession(
//   `${BASE_URL}api/dashboard/budget-range-summary`
// );
// const budgetData = await budgetRes.json();
// setBudgetRangeChartData(budgetData.summary || {});

//         // Drop Leads
//         const dropRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/drop`);
//         const dropData = await dropRes.json();
//         setDropLeads(dropData.total || 0);

//         // Closed Leads
//         const closedRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/closed`);
//         const closedData = await closedRes.json();
//         setClosedLeads(closedData.total || 0);

//         // Categories Count
//         const categoryRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/category`);
//         const categoryData = await categoryRes.json();
//         settotalcategory(categoryData.category_count || 0);

//         // Products Count
//         const productRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/product`);
//         const productData = await productRes.json();
//         setTotalProducts(productData.product_count || 0);

//         // Campaigns Count
//         const campaignRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/campaign-count`);
//         const campaignData = await campaignRes.json();
//         setTotalCampaigns(campaignData.campaign_count || 0);

//         // Converted Leads
//         const convertedRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/converted-leads`);
//         const convertedData = await convertedRes.json();
//         setConvertedLeads(convertedData.converted_count || 0);

//         // Inactive Leads
//         const inactiveRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/inactive-count`);
//         const inactiveData = await inactiveRes.json();
//         setInactiveLeads(inactiveData.inactive_count || 0);
//       }

//       // ========== COMMON FOR ALL ROLES ==========
//       const meetingRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/meeting-scheduled`);
//       const meetingData = await meetingRes.json();
//       setMeetingScheduled(meetingData.meeting_count || 0);

//       // Quotation Pending
// const qpRes = await fetchWithSession(
//   `${BASE_URL}api/dashboard/leads/quotation-pending`
// );
// const qpData = await qpRes.json();
// setQuotationPending(qpData.total || 0);

// // Projection List Leads
// const projectionRes = await fetchWithSession(
//   `${BASE_URL}api/dashboard/leads/projectionlist`
// );
// const projectionData = await projectionRes.json();
// setProjectionLeads(projectionData.total || 0);

//       // Pending Leads (optional)
//       // const pendingRes = await fetchWithSession(`${BASE_URL}api/pending-leads`);
//       // const pendingData = await pendingRes.json();
//       // setpendingLeads(pendingData.pending_count || 0);

//     } catch (err) {
//       console.error('Error fetching dashboard data:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   fetchDashboardData();
// }, [isAuthenticated, role]);

//  const ALL_LEAD_STAGES = Object.keys(leadStageColors);

// const normalizedLeadChartData = ALL_LEAD_STAGES.map(stage => [
//   stage,
//   chartData?.[stage] ?? 0,
// ] as [string, number]);

// const chartSeries = [
//   {
//     name: 'Leads',
//     data: normalizedLeadChartData.map(([_, value]) => value),
//   },
// ];

// const chartOptions: ApexCharts.ApexOptions = {
//   chart: {
//     type: 'bar',
//     toolbar: { show: false },
//   },
//   xaxis: {
//     categories: normalizedLeadChartData.map(([stage]) => stage),
//     labels: {
//       rotate: -45,
//       style: {
//         fontSize: '11px',
//       },
//     },
//   },
//   plotOptions: {
//     bar: {
//       borderRadius: 6,
//       distributed: true,
//       columnWidth: '55%',
//     },
//   },
//   dataLabels: {
//     enabled: true,
//     formatter: (val: number) => val.toString(), // show 0 also
//     style: {
//       fontSize: '12px',
//       fontWeight: 'bold',
//       colors: ['#000'],
//     },
//   },
//   colors: normalizedLeadChartData.map(
//     ([stage]) => leadStageColors[stage] || '#3B82F6'
//   ),
//   tooltip: {
//     y: {
//       formatter: (val: number) => `${val} leads`,
//     },
//   },
// };

//   // Bar chart builder for categories/references
//   const buildBarSeries = (data: Record<string, number> | null) => [
//     {
//       name: 'Leads',
//       data: data ? Object.values(data).map(Number) : [],
//     },
//   ];

//   const buildBarOptions = (
//     data: Record<string, number> | null,
//     title: string,
//   ): ApexCharts.ApexOptions => ({
//     chart: {
//       type: 'bar',
//       toolbar: { show: false },
//     },
//     xaxis: {
//       categories: data ? Object.keys(data) : [],
//       labels: {
//         rotate: -45,
//         style: {
//           fontSize: '11px',
//           fontWeight: 400,
//         },
//       },
//     },
//     yaxis: {
//       title: {
//         text: 'Number of Leads',
//         style: {
//           fontSize: '12px',
//         },
//       },
//       min: 0,
//     },
//     plotOptions: {
//       bar: {
//         borderRadius: 4,
//         horizontal: false,
//         columnWidth: '60%',
//         distributed: false,
//       },
//     },
//     dataLabels: {
//       enabled: true,
//       formatter: function(val: number) {
//         return val > 0 ? val.toString() : '';
//       },
//       style: {
//         fontSize: '11px',
//         fontWeight: 'bold',
//       },
//     },
//     tooltip: {
//       y: {
//         formatter: function(val: number) {
//           return val + ' leads';
//         }
//       }
//     },
//     colors: title.includes('Category') ? ['#8B5CF6'] : ['#10B981'],
//   });

//   // Pie chart builder
//   const buildPieSeries = (data: Record<string, number> | null) => {
//     if (!data) return [];
//     return Object.values(data).map(Number);
//   };

//   const buildPieOptions = (
//     data: Record<string, number> | null,
//     title: string,
//   ): ApexCharts.ApexOptions => ({
//     chart: {
//       type: 'pie' as const,
//     },
//     labels: data ? Object.keys(data) : [],
//     legend: {
//       position: 'bottom' as const,
//     },
//     dataLabels: {
//       enabled: true,
//       formatter: function(val: number) {
//         return val > 0 ? val.toFixed(0) + '%' : '';
//       },
//     },
//     colors: [
//       '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
//       '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#8B5CF6'
//     ],
//     tooltip: {
//       y: {
//         formatter: function(val: number, { seriesIndex }) {
//           const label = data ? Object.keys(data)[seriesIndex] : '';
//           return `${label}: ${val} leads`;
//         }
//       }
//     },
//   });

//   // const handleGoToTotalLeads = () => navigate('/master-data');

//   const handleGoToTotalLeads = (stage?: string) => {
//   navigate('/master-data', {
//     state: stage ? { lead_stage: stage } : undefined,
//   });
// };

//   const handleGoToAssignedLeads = () => navigate('/call');
//   const handleGoToFollowups = () => navigate('/followup/followup-list');
//   const handleGoToMeetingScheduled = () => navigate('/followup/meeting-scheduled');
//   const handleGoToCategory = () => navigate('/master/category');
//   const handleGoToProducts = () => navigate('/master/product');
//   const handleGoToConvertedLeads = () => navigate('/followup/view-campaign');
//   const handleGoToPendingLeads = () => navigate('/inactiveleadlist');
//   const handleToggleCharts = () => setShowCharts(!showCharts);
//   const handleToggleZeroValues = () => setShowZeroValues(!showZeroValues);

//   // Card data configuration - ALL ROLES
//   const commonCards = [
//     {
//       title: 'Assigned Leads',
//       value: assignedLeads,
//       icon: UserCheck,
//       color: 'text-green-500',
//       bgGradient: 'from-green-500/10 to-green-600/5',
//       borderColor: 'border-green-200/50',
//       animation: { y: [0, -2, 0], scale: [1, 1.02, 1] },
//       onClick: handleGoToAssignedLeads,
//       clickable: true,
//     },
//     {
//       title: 'To-Do List',
//       value: todaysAssignedLeads,
//       icon: CheckSquare,
//       color: 'text-blue-500',
//       bgGradient: 'from-blue-500/10 to-blue-600/5',
//       borderColor: 'border-blue-200/50',
//       animation: { y: [0, 2, 0], scale: [1, 1.02, 1] },
//       onClick: () => navigate('/todays-todo'),
//       clickable: true,
//     },
//      {
//       title: 'Missed Followups',
//       value: totalfollowups,
//       icon: ClipboardList,
//       color: 'text-yellow-500',
//       bgGradient: 'from-yellow-500/10 to-yellow-600/5',
//       borderColor: 'border-yellow-200/50',
//       animation: { x: [0, 2, 0], scale: [1, 1.03, 1] },
//       onClick: handleGoToFollowups,
//       clickable: true,
//     },

//     {
//       title: 'Upcoming Followups',
//       value: upcomingAssigned,
//       icon: CalendarCheck,
//       color: 'text-purple-500',
//       bgGradient: 'from-purple-500/10 to-purple-600/5',
//       borderColor: 'border-purple-200/50',
//       animation: { rotate: [0, 180, 0], scale: [1, 1.02, 1] },
//       onClick: () => navigate('/upcoming-followups'),
//       clickable: true,
//     },
//   ];

// const adminOnlyCards = [

//   {
//   title: 'Total Leads',
//   value: totalLeadsForCard,
//   icon: Users,
//   color: 'text-blue-500',
//   bgGradient: 'from-blue-500/10 to-blue-600/5',
//   borderColor: 'border-blue-200/50',
//   animation: { rotate: [0, -5, 0], scale: [1, 1.05, 1] },
//   onClick: isAdminOrSubAdmin ? handleGoToTotalLeads : undefined,
//   clickable: isAdminOrSubAdmin,
// },
//   ...(isAdminOrSubAdmin
//     ? [
//         {
//           title: 'Categories',
//           value: totalcategory,
//           icon: Layers,
//           color: 'text-indigo-500',
//           bgGradient: 'from-indigo-500/10 to-indigo-600/5',
//           borderColor: 'border-indigo-200/50',
//           onClick: handleGoToCategory,
//           clickable: true,
//         },

//         {
//           title: 'Campaigns',
//           value: totalCampaigns,
//           icon: Megaphone,
//           color: 'text-emerald-500',
//           bgGradient: 'from-emerald-500/10 to-emerald-600/5',
//           borderColor: 'border-emerald-200/50',
//           onClick: handleGoToConvertedLeads,
//           clickable: true,
//         },
//         {
//           title: 'Drop Leads',
//           value: dropLeads,
//           icon: Hourglass,
//           color: 'text-red-600',
//           bgGradient: 'from-red-500/10 to-red-600/5',
//           borderColor: 'border-red-300/50',
//           onClick: () => navigate('/drop-leads'),
//           clickable: true,
//         },
//         {
//           title: 'Closed Leads',
//           value: closedLeads,
//           icon: UserCheck,
//           color: 'text-green-600',
//           bgGradient: 'from-green-500/10 to-green-600/5',
//           borderColor: 'border-green-300/50',
//           onClick: () => navigate('/closed-leads'),
//           clickable: true,
//         },
// {
//   title: 'Quotation Pending',
//   value: quotationPending,
//   icon: Hourglass,
//   color: 'text-amber-600',
//   bgGradient: 'from-amber-500/10 to-amber-600/5',
//   borderColor: 'border-amber-300/50',
//   onClick: () => navigate('/quatation-pending'),
//   clickable: true,
// },

// {
//   title: 'Projection List',
//   value: projectionLeads,
//   icon: BarChart3,
//   color: 'text-green-600',
//   bgGradient: 'from-green-500/10 to-green-600/5',
//   borderColor: 'border-green-300/50',
//   onClick: () => handleGoToTotalLeads('Projection List'),
//   clickable: true,
// },

//       ]
//     : []),
// ];

// const cardData = isAdminOrSubAdmin
//   ? [
//       // 1️⃣ Total Leads
//       adminOnlyCards.find(c => c.title === 'Total Leads'),

//       // 2️⃣ Assigned Leads
//       commonCards.find(c => c.title === 'Assigned Leads'),

//       // 3️⃣ To-Do
//       commonCards.find(c => c.title === 'To-Do List'),

//             // 5️⃣ Missed
//       commonCards.find(c => c.title === 'Missed Followups'),

//       // 4️⃣ Upcoming
//       commonCards.find(c => c.title === 'Upcoming Followups'),

//       // 6️⃣ Drop
//       adminOnlyCards.find(c => c.title === 'Drop Leads'),

//       // 7️⃣ Closed
//       adminOnlyCards.find(c => c.title === 'Closed Leads'),

// // 🆕 8️⃣ Quotation Pending
// adminOnlyCards.find(c => c.title === 'Quotation Pending'),

// // 🆕 8️⃣ Projection List
// adminOnlyCards.find(c => c.title === 'Projection List'),

//       // 8️⃣ Categories
//       adminOnlyCards.find(c => c.title === 'Categories'),

//       // 🔟 Campaigns
//       adminOnlyCards.find(c => c.title === 'Campaigns'),
//     ].filter(Boolean) // <-- VERY IMPORTANT (removes undefined)
//   : [
//       // NON-ADMIN → keep existing behavior untouched
//       ...adminOnlyCards,
//       ...commonCards,
//     ];

//   // Get filtered chart data based on toggle
//   const filteredCategoryData = filterChartData(categoryChartData, showZeroValues);
//   const filteredBudgetRangeData = filterChartData(
//   budgetRangeChartData,
//   showZeroValues
// );

//   const filteredReferenceData = filterChartData(referenceChartData, showZeroValues);

//   // Check if there's any chart data to show
//   const hasChartData = chartData && Object.keys(chartData).length > 0;
//   const hasCategoryData = filteredCategoryData && Object.keys(filteredCategoryData).length > 0;
//   const hasBudgetRangeData =
//   filteredBudgetRangeData &&
//   Object.keys(filteredBudgetRangeData).length > 0;

//   const hasReferenceData = filteredReferenceData && Object.keys(filteredReferenceData).length > 0;

//   // Loading skeleton
//   if (isLoading) {
//     const totalCards = cardData.length;
//     return (
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
//         {Array.from({ length: totalCards }).map((_, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border border-white/20 shadow-lg rounded-2xl p-6"
//           >
//             <div className="animate-pulse">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="h-6 bg-gray-300 rounded w-24"></div>
//                 <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
//               </div>
//               <div className="h-8 bg-gray-400 rounded w-16"></div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Main Cards Section */}
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
//         <AnimatePresence>
//           {cardData.map((card, index) => (
//             <motion.div
//               key={card.title}
// onClick={card.clickable ? () => card.onClick?.() : undefined}
//               initial={{ opacity: 0, y: 20, scale: 0.9 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               whileHover={{
//                 y: -4,
//                 transition: { type: 'spring', stiffness: 400, damping: 17 },
//               }}
//               transition={{
//                 delay: index * 0.1,
//                 type: 'spring',
//                 stiffness: 300,
//                 damping: 25,
//               }}
//               className={`
//                 relative p-6 bg-gradient-to-br ${card.bgGradient}
//                 rounded-2xl shadow-lg border-l-4 ${card.borderColor}
//                 hover:shadow-2xl hover:scale-105 hover:-translate-y-1
//                 transform transition-all duration-300 ease-out
//                 cursor-pointer overflow-hidden
//               `}
//             >
//               <div className="absolute inset-0 bg-white dark:bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>

//               <div className="relative z-10">
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
//                     {card.title}
//                   </h3>
//                   <motion.div
//                     animate={card.animation}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       repeatType: 'reverse',
//                       ease: 'easeInOut',
//                     }}
//                     className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 shadow-sm ${card.color}`}
//                   >
//                     <card.icon className="w-5 h-5" />
//                   </motion.div>
//                 </div>

//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={card.value}
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 1.2 }}
//                     transition={{ type: 'spring', stiffness: 400, damping: 25 }}
//                     className="text-2xl font-bold text-gray-900 dark:text-white"
//                   >
//                     {card.value?.toLocaleString() || (
//                       <motion.span
//                         animate={{ opacity: [0.5, 1, 0.5] }}
//                         transition={{ duration: 1.5, repeat: Infinity }}
//                         className="text-gray-400"
//                       >
//                         0
//                       </motion.span>
//                     )}
//                   </motion.div>
//                 </AnimatePresence>

//                 <motion.div
//                   className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden"
//                   initial={{ width: 0 }}
//                   animate={{ width: '100%' }}
//                   transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
//                 >
//                   <motion.div
//                     className={`h-full ${card.color.replace('text-', 'bg-')}`}
//                     initial={{ width: 0 }}
//                     animate={{
//                       width: `${Math.min(
//                         ((card.value || 0) / 100) * 100,
//                         100,
//                       )}%`,
//                     }}
//                     transition={{
//                       delay: index * 0.1 + 1,
//                       duration: 1,
//                       type: 'spring',
//                     }}
//                   />
//                 </motion.div>
//               </div>

//               <div
//                 className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.color.replace(
//                   'text-',
//                   'bg-',
//                 )} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-300`}
//               />
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>

//       {/* Lead Stage Summary Chart - SHOW FOR ALL ROLES */}
//       {hasChartData && (
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.8 }}
//           className="mt-10"
//         >
//           <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                   {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                     ? 'Active Lead Stage Summary'
//                     : 'Your Lead Stage Summary'}
//                 </h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                     ? 'Summary of all lead stages'
//                     : 'Summary of your assigned leads by stage'}
//                 </p>
//               </div>
//               <BarChart3 className="w-5 h-5 text-blue-500" />
//             </div>
//             <Chart
//               options={chartOptions}
//               series={chartSeries}
//               type="bar"
//               height={380}
//             />
//           </div>
//         </motion.div>
//       )}

//       {/* Charts Section - SHOW FOR ALL ROLES */}
//       {(hasCategoryData || hasReferenceData) && (
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 1 }}
//           className="mt-10"
//         >
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                 ? 'Lead Distribution Analytics'
//                 : 'Your Lead Distribution'}
//             </h2>

//             <div className="flex flex-wrap gap-3">
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) && (
//                 <button
//                   onClick={handleToggleZeroValues}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                     showZeroValues
//                       ? 'bg-indigo-500 text-white hover:bg-indigo-600'
//                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
//                   }`}
//                 >
//                   <Filter className="w-4 h-4" />
//                   {showZeroValues ? 'Hide Zero Values' : 'Show Zero Values'}
//                 </button>
//               )}

//               <button
//                 onClick={handleToggleCharts}
//                 className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
//               >
//                 {showCharts ? (
//                   <>
//                     <PieChart className="w-4 h-4" />
//                     Hide Charts
//                   </>
//                 ) : (
//                   <>
//                     <BarChart3 className="w-4 h-4" />
//                     Show Charts
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {showCharts && (
//             <div className="grid grid-cols-12 gap-6">
//               {/* CATEGORY CHART - For assigned leads */}
//               <div className="col-span-12 xl:col-span-6">
//                 {hasCategoryData ? (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="flex justify-between items-center mb-4">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? 'Category-wise Active Leads'
//                             : 'Your Leads by Category'}
//                         </h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? `Showing ${Object.keys(filteredCategoryData).length} categories`
//                             : `Your leads across ${Object.keys(filteredCategoryData).length} categories`}
//                         </p>
//                       </div>
//                       <Layers className="w-5 h-5 text-indigo-500" />
//                     </div>

//                     <Chart
//                       options={buildBarOptions(filteredCategoryData, 'Category')}
//                       series={buildBarSeries(filteredCategoryData)}
//                       type="bar"
//                       height={350}
//                     />
//                   </div>
//                 ) : (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="text-center py-8">
//                       <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                       <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         No Category Data
//                       </h3>
//                       <p className="text-gray-500 dark:text-gray-400">
//                         No leads assigned in any category yet
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* REFERENCE CHART - For assigned leads */}
//               <div className="col-span-12 xl:col-span-6">
//                 {hasReferenceData ? (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="flex justify-between items-center mb-4">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? 'Sources-wise Active Leads'
//                             : 'Your Leads by Source'}
//                         </h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? `Showing ${Object.keys(filteredReferenceData).length} references`
//                             : `Your leads from ${Object.keys(filteredReferenceData).length} sources`}
//                         </p>
//                       </div>
//                       <Users className="w-5 h-5 text-green-500" />
//                     </div>

//                     <Chart
//                       options={buildBarOptions(filteredReferenceData, 'Reference')}
//                       series={buildBarSeries(filteredReferenceData)}
//                       type="bar"
//                       height={350}
//                     />
//                   </div>
//                 ) : (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="text-center py-8">
//                       <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                       <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         No Reference Data
//                       </h3>
//                       <p className="text-gray-500 dark:text-gray-400">
//                         No leads assigned from any reference yet
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

// {/* 🔥 BUDGET RANGE BAR CHART – ADMIN / SUB-ADMIN ONLY */}
// {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) &&
//   showCharts &&
//   hasBudgetRangeData && (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 1.3 }}
//       className="col-span-12 mt-6"
//     >
//       <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//         <div className="flex justify-between items-center mb-4">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//               Budget Range-wise Leads
//             </h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Distribution of leads by budget range
//             </p>
//           </div>
//           <BarChart3 className="w-5 h-5 text-emerald-500" />
//         </div>

//         <Chart
//           options={buildBarOptions(
//             filteredBudgetRangeData,
//             'Budget'
//           )}
//           series={buildBarSeries(filteredBudgetRangeData)}
//           type="bar"
//           height={360}
//         />
//       </div>
//     </motion.div>
// )}

//             </div>
//           )}
//         </motion.div>
//       )}
//     </>
//   );
// };

// export default ECommerce;

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Users,
//   UserCheck,
//   ClipboardList,
//   CalendarCheck,
//   Layers,
//   Package,
//   Megaphone,
//   Hourglass,
//   BarChart3,
//   PieChart,
//   Filter,
//   CheckSquare,
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import CardDataStats from '../../components/CardDataStats';
// import { BASE_URL } from '../../../public/config.js';
// import { useNavigate } from 'react-router-dom';
// import Chart from "react-apexcharts";

// // Display configuration
// const DISPLAY_CONFIG = {
//   naValues: ['', null, undefined, 'null', 'undefined', 'not available', 'na', 'n/a', 'notapplicable'],
//   othersValues: ['others', 'other', 'misc', 'miscellaneous'],
//   specialColors: {
//     'N/A': '#CBD5E1',
//     'Others': '#94A3B8',
//     'Unknown': '#64748B'
//   }
// };

// const ECommerce: React.FC = () => {
//   // State declarations
//   const [totalLeads, setTotalLeads] = useState<number | null>(null);
//   const [assignedLeads, setAssignedLeads] = useState<number | null>(null);
//   const [totalfollowups, setfollowups] = useState<number | null>(null);
//   const [meetingScheduled, setMeetingScheduled] = useState<number | null>(null);
//   const [totalProducts, setTotalProducts] = useState<number | null>(null);
//   const [totalcategory, settotalcategory] = useState<number | null>(null);
//   const [convertedLeads, setConvertedLeads] = useState<number | null>(null);
//   const [pendingLeads, setpendingLeads] = useState<number | null>(null);
//   const [totalCampaigns, setTotalCampaigns] = useState(0);
//   const [inactiveLeads, setInactiveLeads] = useState(0);
//   const [role, setRole] = useState<string>('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const [dropLeads, setDropLeads] = useState<number | null>(null);
//   const [closedLeads, setClosedLeads] = useState<number | null>(null);
//   const [chartData, setChartData] = useState<Record<string, number> | null>(null);
//   const [todaysAssignedLeads, setTodaysAssignedLeads] = useState<number | null>(null);
//   const [upcomingAssigned, setUpcomingAssigned] = useState<number | null>(null);
//   const [categoryChartData, setCategoryChartData] = useState<Record<string, number> | null>(null);
//   const [referenceChartData, setReferenceChartData] = useState<Record<string, number> | null>(null);
//   const [showCharts, setShowCharts] = useState(true);
//   const [showZeroValues, setShowZeroValues] = useState(true);
//   const [quotationPending, setQuotationPending] = useState<number | null>(null);
//   const [quotationFollowup, setQuotationFollowup] = useState<number | null>(null);
//   const [demoLeads, setDemoLeads] = useState<number | null>(null);
//   const [projectionLeads, setProjectionLeads] = useState<number | null>(null);
//   const [budgetRangeChartData, setBudgetRangeChartData] = useState<Record<string, number> | null>(null);

//   const ADMIN_LIKE_ROLES = ['admin', 'sub_admin'];
//   const ADMIN_AND_SUB_ADMIN_ROLES = ['admin', 'sub_admin'];

//   const TELECALLER_LIKE_ROLES = [
//     'tele-caller',
//     'tele_caller',
//     'digital-marketing',
//     'digital_marketing',
//     'field-marketing-executive',
//     'field_marketing_executive',
//     'tech-sale-sound-engineer',
//     'tech_sale_sound_engineer',
//     'junior-autocad-designer',
//     'junior_autocad_designer',
//     'senior-autocad-designer',
//     'senior_autocad_designer',
//     'technical_head',
//   ];

//   const isAdminOrSubAdmin = ADMIN_AND_SUB_ADMIN_ROLES.includes(role);
//   const totalLeadsForCard = totalLeads;

//   // Lead stage colors
//   const leadStageColors: Record<string, string> = {
//     'Fresh Lead': '#E5E7EB',
//     'Cold Lead': '#9CA3AF',
//     'On Hold': '#FDE68A',
//     'Positive Lead': '#93C5FD',
//     'Pre Site Visit': '#C4B5FD',
//     'Demo': '#F9A8D4',
//     'Quotation Pending': '#F59E0B',
//     'Post Site Visit': '#6D28D9',
//     'Quotation Follow-up': '#92400E',
//     'Projection List': '#86EFAC',
//     'Drop': '#EF4444',
//     'Closed Deal': '#166534',
//   };

// // Update formatDisplayValue function to handle stage "Others" properly
// const formatDisplayValue = useCallback((value: any): string => {
//   if (value === null || value === undefined || value === '') {
//     return 'N/A';
//   }

//   if (typeof value === 'string') {
//     const trimmed = value.trim();

//     // Check if it's empty or N/A
//     if (trimmed === '' || DISPLAY_CONFIG.naValues.includes(trimmed.toLowerCase())) {
//       return 'N/A';
//     }

//     // For stage filtering: if it's "other" or "others", return "Others"
//     const lowerTrimmed = trimmed.toLowerCase();
//     if (lowerTrimmed === 'other' || lowerTrimmed === 'others') {
//       return 'Others'; // Use "Others" for consistency
//     }

//     return trimmed;
//   }

//   if (typeof value === 'number') {
//     return value.toLocaleString();
//   }

//   return String(value);
// }, []);

// const normalizeChartData = useCallback((data: Record<string, number> | null) => {
//   if (!data) return {};

//   const normalized: Record<string, number> = {};

//   Object.entries(data).forEach(([key, value]) => {
//     // 🚫 Skip "Not Specified" completely
//     if (key?.toLowerCase?.().includes('not specified')) return;

//     const cleanKey = formatDisplayValue(key);

//     // also guard if it becomes N/A after formatting
//     if (cleanKey === 'N/A') return;

//     normalized[cleanKey] = (normalized[cleanKey] || 0) + value;
//   });

//   return normalized;
// }, [formatDisplayValue]);

//   const filterChartData = useCallback((data: Record<string, number> | null, showZero: boolean) => {
//     if (!data) return null;

//     const normalized = normalizeChartData(data);

//     if (!showZero) {
//       const filtered: Record<string, number> = {};
//       Object.entries(normalized).forEach(([key, value]) => {
//         if (value > 0) {
//           filtered[key] = value;
//         }
//       });
//       return filtered;
//     }

//     return normalized;
//   }, [normalizeChartData]);

//   // Authentication
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch(`${BASE_URL}auth/check-session`, {
//           credentials: 'include',
//         });
//         const data = await response.json();

//         if (data.isAuthenticated) {
//           setIsAuthenticated(true);
//           setRole(data.role);
//         } else {
//           setIsAuthenticated(false);
//           navigate('/login');
//         }
//       } catch (err) {
//         console.error('Error checking session:', err);
//         setIsAuthenticated(false);
//       }
//     };

//     checkAuth();
//   }, [navigate]);

//   // Fetch dashboard data
//   useEffect(() => {
//     if (!isAuthenticated) return;

//     const fetchDashboardData = async () => {
//       try {
//         setIsLoading(true);

//         const fetchWithSession = (url: string, options: RequestInit = {}) =>
//           fetch(url, { ...options, credentials: 'include' });

//         // Lead Stage Summary
//         const summaryRes = await fetchWithSession(`${BASE_URL}api/dashboard/lead-summary`);
//         const summaryData = await summaryRes.json();
//         setChartData(normalizeChartData(summaryData.summary || {}));

//         // Category Summary
//         const categorySummaryRes = await fetchWithSession(`${BASE_URL}api/dashboard/category-summary`);
//         const categorySummaryData = await categorySummaryRes.json();
//         setCategoryChartData(normalizeChartData(categorySummaryData.summary || {}));

//         // Reference Summary
//         const referenceSummaryRes = await fetchWithSession(`${BASE_URL}api/dashboard/reference-summary`);
//         const referenceSummaryData = await referenceSummaryRes.json();
//         setReferenceChartData(normalizeChartData(referenceSummaryData.summary || {}));

//         // Assigned Leads Count
//         const assignedRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/assigned-count`);
//         const assignedData = await assignedRes.json();
//         setAssignedLeads(assignedData.assigned_count || 0);

//         // Today's To-Do List
//         const todayAssignedRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/todays-assigned-count`);
//         const todayAssignedData = await todayAssignedRes.json();
//         setTodaysAssignedLeads(todayAssignedData.total || 0);

//         // Upcoming Followups
//         const upcomingRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/upcoming-assigned-count`);
//         const upcomingData = await upcomingRes.json();
//         setUpcomingAssigned(upcomingData.upcoming || 0);

//         // Missed Followups
//         const followupsRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/missed-assigned-count`);
//         const partsData = await followupsRes.json();
//         setfollowups(partsData.missed || 0);

//         // Total Leads
//         const response = await fetchWithSession(`${BASE_URL}api/master-data`);
//         const rawData = await response.json();
//         setTotalLeads(rawData.length || 0);

//         // ADMIN/SUB-ADMIN ONLY ENDPOINTS
//         if (ADMIN_AND_SUB_ADMIN_ROLES.includes(role)) {
//           // Budget Range Summary
//           const budgetRes = await fetchWithSession(`${BASE_URL}api/dashboard/budget-range-summary`);
//           const budgetData = await budgetRes.json();
//           setBudgetRangeChartData(normalizeChartData(budgetData.summary || {}));

//           // Drop Leads
//           const dropRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/drop`);
//           const dropData = await dropRes.json();
//           setDropLeads(dropData.total || 0);

//           // Closed Leads
//           const closedRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/closed`);
//           const closedData = await closedRes.json();
//           setClosedLeads(closedData.total || 0);

//           // Categories Count
//           const categoryRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/category`);
//           const categoryData = await categoryRes.json();
//           settotalcategory(categoryData.category_count || 0);

//           // Products Count
//           const productRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/product`);
//           const productData = await productRes.json();
//           setTotalProducts(productData.product_count || 0);

//           // Campaigns Count
//           const campaignRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/campaign-count`);
//           const campaignData = await campaignRes.json();
//           setTotalCampaigns(campaignData.campaign_count || 0);

//           // Converted Leads
//           const convertedRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/converted-leads`);
//           const convertedData = await convertedRes.json();
//           setConvertedLeads(convertedData.converted_count || 0);

//           // Inactive Leads
//           const inactiveRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/inactive-count`);
//           const inactiveData = await inactiveRes.json();
//           setInactiveLeads(inactiveData.inactive_count || 0);
//         }

//         // COMMON FOR ALL ROLES
//         const meetingRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/meeting-scheduled`);
//         const meetingData = await meetingRes.json();
//         setMeetingScheduled(meetingData.meeting_count || 0);

//         // Quotation Pending
//         const qpRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/quotation-pending`);
//         const qpData = await qpRes.json();
//         setQuotationPending(qpData.total || 0);

//         // Projection List Leads
//         const projectionRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/projectionlist`);
//         const projectionData = await projectionRes.json();
//         setProjectionLeads(projectionData.total || 0);

//       } catch (err) {
//         console.error('Error fetching dashboard data:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [isAuthenticated, role, normalizeChartData]);

//   // Lead stages for chart
//   const ALL_LEAD_STAGES = Object.keys(leadStageColors);
//   const normalizedLeadChartData = ALL_LEAD_STAGES.map(stage => [
//     stage,
//     chartData?.[stage] ?? 0,
//   ] as [string, number]);

//   const chartSeries = [
//     {
//       name: 'Leads',
//       data: normalizedLeadChartData.map(([_, value]) => value),
//     },
//   ];

//   // Clickable chart options
//   const chartOptions: ApexCharts.ApexOptions = {
//     chart: {
//       type: 'bar',
//       toolbar: { show: false },
//       events: {
//         dataPointSelection: function (event, chartContext, config) {
//           const stage = normalizedLeadChartData[config.dataPointIndex][0];
//           if (stage) {
//             handleGoToTotalLeads(stage);
//           }
//         },
//       },
//     },
//     xaxis: {
//       categories: normalizedLeadChartData.map(([stage]) => stage),
//       labels: {
//         rotate: -45,
//         style: {
//           fontSize: '11px',
//         },
//         formatter: function (value) {
//           return formatDisplayValue(value);
//         }
//       },
//     },
//     plotOptions: {
//       bar: {
//         borderRadius: 6,
//         distributed: true,
//         columnWidth: '55%',
//       },
//     },
//     dataLabels: {
//       enabled: true,
//       formatter: (val: number) => val.toString(),
//       style: {
//         fontSize: '12px',
//         fontWeight: 'bold',
//         colors: ['#000'],
//       },
//     },
//     colors: normalizedLeadChartData.map(
//       ([stage]) => leadStageColors[stage] || '#3B82F6'
//     ),
//     tooltip: {
//       y: {
//         formatter: (val: number) => `${val} leads`,
//       },
//     },
//     states: {
//       hover: {
//         filter: {
//           type: 'darken',
//           value: 0.85,
//         }
//       },
//       active: {
//         filter: {
//           type: 'darken',
//           value: 0.7,
//         }
//       }
//     },
//   };

//   // Bar chart builder
//   const buildBarSeries = (data: Record<string, number> | null) => [
//     {
//       name: 'Leads',
//       data: data ? Object.values(data).map(Number) : [],
//     },
//   ];

//   // In ECommerce component - Update the buildBarOptions function

//   const buildBarOptions = (
//     data: Record<string, number> | null,
//     title: string,
//   ): ApexCharts.ApexOptions => {
//     const categories = data ? Object.keys(data).map(key =>
//       formatDisplayValue(key)
//     ) : [];

//     const colors = categories.map(category => {
//       if (category === 'N/A' || category === 'Others') {
//         return DISPLAY_CONFIG.specialColors[category] || '#CBD5E1';
//       }
//       return title.includes('Category') ? '#8B5CF6' :
//         title.includes('Reference') ? '#10B981' :
//           title.includes('Budget') ? '#3B82F6' : '#3B82F6';
//     });

//     return {
//       chart: {
//         type: 'bar',
//         toolbar: { show: false },
//         events: {
//           dataPointSelection: function (event, chartContext, config) {
//             const category = categories[config.dataPointIndex];
//             if (category) {
//               if (title.includes('Category')) {
//                 handleGoToCategoryLeads(category);
//               } else if (title.includes('Reference')) {
//                 handleGoToReferenceLeads(category);
//               } else if (title.includes('Budget')) {
//                 handleGoToBudgetRangeLeads(category);
//               }
//             }
//           },
//         },
//       },
//       xaxis: {
//         categories: categories,
//         labels: {
//           rotate: -45,
//           style: {
//             fontSize: '11px',
//             fontWeight: 400,
//           },
//           formatter: function (value) {
//             if (value.length > 15) {
//               return value.substring(0, 12) + '...';
//             }
//             return formatDisplayValue(value);
//           }
//         },
//       },
//       yaxis: {
//         title: {
//           text: 'Number of Leads',
//           style: { fontSize: '12px' },
//         },
//         min: 0,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 4,
//           horizontal: false,
//           columnWidth: '60%',
//           distributed: false,
//         },
//       },
//       dataLabels: {
//         enabled: true,
//         formatter: function (val: number) {
//           return val > 0 ? val.toString() : '';
//         },
//         style: { fontSize: '11px', fontWeight: 'bold' },
//       },
//       tooltip: {
//         y: {
//           formatter: function (val: number, { seriesIndex, w }) {
//             const category = w.config.xaxis.categories[seriesIndex];
//             return `${category}: ${val} leads`;
//           }
//         }
//       },
//       colors: colors,
//     };
//   };

//   // In ECommerce component, update all navigation handlers
// const handleGoToCategoryLeads = (category?: string) => {
//   if (!category) {
//     navigate('/master-data');
//     return;
//   }

//   const formattedCategory = formatDisplayValue(category);
//   console.log(`Navigating to master data with category: "${formattedCategory}"`);

//   navigate('/master-data', {
//     state: {
//       category_name: formattedCategory,
//       from_dashboard: true
//     },
//   });
// };

// const handleGoToReferenceLeads = (reference?: string) => {
//   if (!reference) {
//     navigate('/master-data');
//     return;
//   }

//   const formattedReference = formatDisplayValue(reference);
//   console.log(`Navigating to master data with reference: "${formattedReference}"`);

//   // If it's "other" in any case, normalize to "Others"
//   const finalReference = formattedReference.toLowerCase() === 'other' ? 'Others' : formattedReference;

//   navigate('/master-data', {
//     state: {
//       reference_name: finalReference,
//       from_dashboard: true
//     },
//   });
// };

// // In ECommerce component
// const handleGoToBudgetRangeLeads = (budgetRange?: string) => {
//   if (!budgetRange) {
//     navigate('/master-data');
//     return;
//   }

//   const formattedBudgetRange = formatDisplayValue(budgetRange);
//   console.log(`Navigating to master data with budget range: "${formattedBudgetRange}"`);

//   navigate('/master-data', {
//     state: {
//       budget_range: formattedBudgetRange,
//       from_dashboard: true
//     },
//   });
// };

//   // Pie chart builder
//   const buildPieSeries = (data: Record<string, number> | null) => {
//     if (!data) return [];
//     return Object.values(data).map(Number);
//   };

//   const buildPieOptions = (
//     data: Record<string, number> | null,
//     title: string,
//   ): ApexCharts.ApexOptions => {
//     const labels = data ? Object.keys(data).map(key =>
//       formatDisplayValue(key)
//     ) : [];

//     return {
//       chart: {
//         type: 'pie' as const,
//       },
//       labels: labels,
//       legend: {
//         position: 'bottom' as const,
//       },
//       dataLabels: {
//         enabled: true,
//         formatter: function (val: number) {
//           return val > 0 ? val.toFixed(0) + '%' : '';
//         },
//       },
//       colors: [
//         '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
//         '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#8B5CF6'
//       ],
//       tooltip: {
//         y: {
//           formatter: function (val: number, { seriesIndex }) {
//             const label = labels[seriesIndex];
//             return `${label}: ${val} leads`;
//           }
//         }
//       },
//     };
//   };

// // Navigation handlers - update handleGoToTotalLeads
// const handleGoToTotalLeads = (stage?: string) => {
//   if (!stage) {
//     navigate('/master-data');
//     return;
//   }

//   const formattedStage = formatDisplayValue(stage);
//   console.log(`Navigating to master data with stage: "${formattedStage}" (original: "${stage}")`);

//   navigate('/master-data', {
//     state: {
//       lead_stage: formattedStage,
//       from_dashboard: true
//     },
//   });
// };

//   const handleGoToAssignedLeads = () => navigate('/call');
//   const handleGoToFollowups = () => navigate('/followup/followup-list');
//   const handleGoToMeetingScheduled = () => navigate('/followup/meeting-scheduled');
//   const handleGoToCategory = () => navigate('/master/category');
//   const handleGoToProducts = () => navigate('/master/product');
//   const handleGoToConvertedLeads = () => navigate('/followup/view-campaign');
//   const handleGoToPendingLeads = () => navigate('/inactiveleadlist');
//   const handleToggleCharts = () => setShowCharts(!showCharts);
//   const handleToggleZeroValues = () => setShowZeroValues(!showZeroValues);

//   // Card data configuration
//   const commonCards = [
//     {
//       title: 'Assigned Leads',
//       value: formatDisplayValue(assignedLeads),
//       icon: UserCheck,
//       color: 'text-green-500',
//       bgGradient: 'from-green-500/10 to-green-600/5',
//       borderColor: 'border-green-200/50',
//       animation: { y: [0, -2, 0], scale: [1, 1.02, 1] },
//       onClick: handleGoToAssignedLeads,
//       clickable: true,
//     },
//     {
//       title: 'To-Do List',
//       value: formatDisplayValue(todaysAssignedLeads),
//       icon: CheckSquare,
//       color: 'text-blue-500',
//       bgGradient: 'from-blue-500/10 to-blue-600/5',
//       borderColor: 'border-blue-200/50',
//       animation: { y: [0, 2, 0], scale: [1, 1.02, 1] },
//       onClick: () => navigate('/todays-todo'),
//       clickable: true,
//     },
//     {
//       title: 'Missed Followups',
//       value: formatDisplayValue(totalfollowups),
//       icon: ClipboardList,
//       color: 'text-yellow-500',
//       bgGradient: 'from-yellow-500/10 to-yellow-600/5',
//       borderColor: 'border-yellow-200/50',
//       animation: { x: [0, 2, 0], scale: [1, 1.03, 1] },
//       onClick: handleGoToFollowups,
//       clickable: true,
//     },
//     {
//       title: 'Upcoming Followups',
//       value: formatDisplayValue(upcomingAssigned),
//       icon: CalendarCheck,
//       color: 'text-purple-500',
//       bgGradient: 'from-purple-500/10 to-purple-600/5',
//       borderColor: 'border-purple-200/50',
//       animation: { rotate: [0, 180, 0], scale: [1, 1.02, 1] },
//       onClick: () => navigate('/upcoming-followups'),
//       clickable: true,
//     },
//   ];

//   const adminOnlyCards = [
//     {
//       title: 'Total Leads',
//       value: formatDisplayValue(totalLeadsForCard),
//       icon: Users,
//       color: 'text-blue-500',
//       bgGradient: 'from-blue-500/10 to-blue-600/5',
//       borderColor: 'border-blue-200/50',
//       animation: { rotate: [0, -5, 0], scale: [1, 1.05, 1] },
//       onClick: isAdminOrSubAdmin ? handleGoToTotalLeads : undefined,
//       clickable: isAdminOrSubAdmin,
//     },
//     ...(isAdminOrSubAdmin
//       ? [
//         {
//           title: 'Categories',
//           value: formatDisplayValue(totalcategory),
//           icon: Layers,
//           color: 'text-indigo-500',
//           bgGradient: 'from-indigo-500/10 to-indigo-600/5',
//           borderColor: 'border-indigo-200/50',
//           onClick: handleGoToCategory,
//           clickable: true,
//         },
//         {
//           title: 'Campaigns',
//           value: formatDisplayValue(totalCampaigns),
//           icon: Megaphone,
//           color: 'text-emerald-500',
//           bgGradient: 'from-emerald-500/10 to-emerald-600/5',
//           borderColor: 'border-emerald-200/50',
//           onClick: handleGoToConvertedLeads,
//           clickable: true,
//         },
//         {
//           title: 'Drop Leads',
//           value: formatDisplayValue(dropLeads),
//           icon: Hourglass,
//           color: 'text-red-600',
//           bgGradient: 'from-red-500/10 to-red-600/5',
//           borderColor: 'border-red-300/50',
//           onClick: () => navigate('/drop-leads'),
//           clickable: true,
//         },
//         {
//           title: 'Closed Leads',
//           value: formatDisplayValue(closedLeads),
//           icon: UserCheck,
//           color: 'text-green-600',
//           bgGradient: 'from-green-500/10 to-green-600/5',
//           borderColor: 'border-green-300/50',
//           onClick: () => navigate('/closed-leads'),
//           clickable: true,
//         },
//         {
//           title: 'Quotation Pending',
//           value: formatDisplayValue(quotationPending),
//           icon: Hourglass,
//           color: 'text-amber-600',
//           bgGradient: 'from-amber-500/10 to-amber-600/5',
//           borderColor: 'border-amber-300/50',
//           onClick: () => navigate('/quatation-pending'),
//           clickable: true,
//         },
//         {
//           title: 'Projection List',
//           value: formatDisplayValue(projectionLeads),
//           icon: BarChart3,
//           color: 'text-green-600',
//           bgGradient: 'from-green-500/10 to-green-600/5',
//           borderColor: 'border-green-300/50',
//           onClick: () => handleGoToTotalLeads('Projection List'),
//           clickable: true,
//         },
//       ]
//       : []),
//   ];

//   const cardData = isAdminOrSubAdmin
//     ? [
//       adminOnlyCards.find(c => c.title === 'Total Leads'),
//       commonCards.find(c => c.title === 'Assigned Leads'),
//       commonCards.find(c => c.title === 'To-Do List'),
//       commonCards.find(c => c.title === 'Missed Followups'),
//       commonCards.find(c => c.title === 'Upcoming Followups'),
//       adminOnlyCards.find(c => c.title === 'Drop Leads'),
//       adminOnlyCards.find(c => c.title === 'Closed Leads'),
//       adminOnlyCards.find(c => c.title === 'Quotation Pending'),
//       adminOnlyCards.find(c => c.title === 'Projection List'),
//       adminOnlyCards.find(c => c.title === 'Categories'),
//       adminOnlyCards.find(c => c.title === 'Campaigns'),
//     ].filter(Boolean)
//     : [...adminOnlyCards, ...commonCards];

//   // Get filtered chart data
//   const filteredCategoryData = filterChartData(categoryChartData, showZeroValues);
//   const filteredBudgetRangeData = filterChartData(budgetRangeChartData, showZeroValues);
//   const filteredReferenceData = filterChartData(referenceChartData, showZeroValues);

//   // Check if there's any chart data to show
//   const hasChartData = chartData && Object.keys(chartData).length > 0;
//   const hasCategoryData = filteredCategoryData && Object.keys(filteredCategoryData).length > 0;
//   const hasBudgetRangeData = filteredBudgetRangeData && Object.keys(filteredBudgetRangeData).length > 0;
//   const hasReferenceData = filteredReferenceData && Object.keys(filteredReferenceData).length > 0;

//   // Loading skeleton
//   if (isLoading) {
//     const totalCards = cardData.length;
//     return (
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
//         {Array.from({ length: totalCards }).map((_, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border border-white/20 shadow-lg rounded-2xl p-6"
//           >
//             <div className="animate-pulse">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="h-6 bg-gray-300 rounded w-24"></div>
//                 <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
//               </div>
//               <div className="h-8 bg-gray-400 rounded w-16"></div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Main Cards Section */}
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
//         <AnimatePresence>
//           {cardData.map((card, index) => (
//             <motion.div
//               key={card.title}
//               onClick={card.clickable ? () => card.onClick?.() : undefined}
//               initial={{ opacity: 0, y: 20, scale: 0.9 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               whileHover={{
//                 y: -4,
//                 transition: { type: 'spring', stiffness: 400, damping: 17 },
//               }}
//               transition={{
//                 delay: index * 0.1,
//                 type: 'spring',
//                 stiffness: 300,
//                 damping: 25,
//               }}
//               className={`
//                 relative p-6 bg-gradient-to-br ${card.bgGradient}
//                 rounded-2xl shadow-lg border-l-4 ${card.borderColor}
//                 hover:shadow-2xl hover:scale-105 hover:-translate-y-1
//                 transform transition-all duration-300 ease-out
//                 cursor-pointer overflow-hidden
//                 ${card.clickable ? '' : 'cursor-default hover:shadow-lg hover:scale-100 hover:-translate-y-0'}
//               `}
//             >
//               <div className="absolute inset-0 bg-white dark:bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>

//               <div className="relative z-10">
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
//                     {card.title}
//                   </h3>
//                   <motion.div
//                     animate={card.animation}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       repeatType: 'reverse',
//                       ease: 'easeInOut',
//                     }}
//                     className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 shadow-sm ${card.color}`}
//                   >
//                     <card.icon className="w-5 h-5" />
//                   </motion.div>
//                 </div>

//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={card.value}
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 1.2 }}
//                     transition={{ type: 'spring', stiffness: 400, damping: 25 }}
//                     className="text-2xl font-bold text-gray-900 dark:text-white"
//                   >
//                     {card.value === 'N/A' ? (
//                       <motion.span
//                         animate={{ opacity: [0.5, 1, 0.5] }}
//                         transition={{ duration: 1.5, repeat: Infinity }}
//                         className="text-gray-400"
//                       >
//                         {card.value}
//                       </motion.span>
//                     ) : (
//                       card.value
//                     )}
//                   </motion.div>
//                 </AnimatePresence>

//                 <motion.div
//                   className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden"
//                   initial={{ width: 0 }}
//                   animate={{ width: '100%' }}
//                   transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
//                 >
//                   <motion.div
//                     className={`h-full ${card.color.replace('text-', 'bg-')}`}
//                     initial={{ width: 0 }}
//                     animate={{
//                       width: `${Math.min(
//                         ((parseInt(card.value?.replace(/,/g, '') || '0') || 0) / 100) * 100,
//                         100,
//                       )}%`,
//                     }}
//                     transition={{
//                       delay: index * 0.1 + 1,
//                       duration: 1,
//                       type: 'spring',
//                     }}
//                   />
//                 </motion.div>
//               </div>

//               <div
//                 className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.color.replace(
//                   'text-',
//                   'bg-',
//                 )} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-300`}
//               />
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>

//       {/* Lead Stage Summary Chart - CLICKABLE */}
//       {hasChartData && (
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.8 }}
//           className="mt-10"
//         >
//           <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                   {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                     ? 'Active Lead Stage Summary'
//                     : 'Your Lead Stage Summary'}
//                 </h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                     ? 'Summary of all lead stages - Click any bar to view leads in that stage'
//                     : 'Summary of your assigned leads by stage - Click any bar to view leads'}
//                 </p>
//               </div>
//               <BarChart3 className="w-5 h-5 text-blue-500" />
//             </div>
//             <div className="cursor-pointer">
//               <Chart
//                 options={chartOptions}
//                 series={chartSeries}
//                 type="bar"
//                 height={380}
//               />
//             </div>
//             <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//               <span className="inline-flex items-center">
//                 <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
//                 </svg>
//                 Click on any stage bar to view leads in that stage
//               </span>
//             </div>
//           </div>
//         </motion.div>
//       )}

//       {/* Charts Section */}
//       {(hasCategoryData || hasReferenceData) && (
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 1 }}
//           className="mt-10"
//         >
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                 ? 'Lead Distribution Analytics'
//                 : 'Your Lead Distribution'}
//             </h2>

//             <div className="flex flex-wrap gap-3">
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) && (
//                 <button
//                   onClick={handleToggleZeroValues}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showZeroValues
//                       ? 'bg-indigo-500 text-white hover:bg-indigo-600'
//                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
//                     }`}
//                 >
//                   <Filter className="w-4 h-4" />
//                   {showZeroValues ? 'Hide Zero Values' : 'Show Zero Values'}
//                 </button>
//               )}

//               <button
//                 onClick={handleToggleCharts}
//                 className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
//               >
//                 {showCharts ? (
//                   <>
//                     <PieChart className="w-4 h-4" />
//                     Hide Charts
//                   </>
//                 ) : (
//                   <>
//                     <BarChart3 className="w-4 h-4" />
//                     Show Charts
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {showCharts && (
//             <div className="grid grid-cols-12 gap-6">
//               {/* CATEGORY CHART */}
//               {/* CATEGORY CHART */}
//               <div className="col-span-12 xl:col-span-6">
//                 {hasCategoryData ? (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="flex justify-between items-center mb-4">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? 'Category-wise Active Leads'
//                             : 'Your Leads by Category'}
//                         </h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? `Showing ${Object.keys(filteredCategoryData).length} categories - Click any bar to view leads in that category`
//                             : `Your leads across ${Object.keys(filteredCategoryData).length} categories - Click to view`}
//                         </p>
//                       </div>
//                       <Layers className="w-5 h-5 text-indigo-500" />
//                     </div>

//                     <Chart
//                       options={buildBarOptions(filteredCategoryData, 'Category')}
//                       series={buildBarSeries(filteredCategoryData)}
//                       type="bar"
//                       height={350}
//                     />

//                     {/* Add click instruction */}
//                     <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//                       <span className="inline-flex items-center">
//                         <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
//                         </svg>
//                         Click on any category bar to view leads in that category
//                       </span>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="text-center py-8">
//                       <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                       <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         No Category Data
//                       </h3>
//                       <p className="text-gray-500 dark:text-gray-400">
//                         No leads assigned in any category yet
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* REFERENCE CHART */}
//               {/* REFERENCE CHART */}
//               <div className="col-span-12 xl:col-span-6">
//                 {hasReferenceData ? (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="flex justify-between items-center mb-4">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? 'Sources-wise Active Leads'
//                             : 'Your Leads by Source'}
//                         </h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? `Showing ${Object.keys(filteredReferenceData).length} references - Click any bar to view leads from that source`
//                             : `Your leads from ${Object.keys(filteredReferenceData).length} sources - Click to view`}
//                         </p>
//                       </div>
//                       <Users className="w-5 h-5 text-green-500" />
//                     </div>

//                     <Chart
//                       options={buildBarOptions(filteredReferenceData, 'Reference')}
//                       series={buildBarSeries(filteredReferenceData)}
//                       type="bar"
//                       height={350}
//                     />

//                     {/* Add click instruction */}
//                     <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//                       <span className="inline-flex items-center">
//                         <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
//                         </svg>
//                         Click on any source bar to view leads from that source
//                       </span>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="text-center py-8">
//                       <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                       <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         No Reference Data
//                       </h3>
//                       <p className="text-gray-500 dark:text-gray-400">
//                         No leads assigned from any reference yet
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* BUDGET RANGE BAR CHART – ADMIN / SUB-ADMIN ONLY */}
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) &&
//                 showCharts &&
//                 hasBudgetRangeData && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 30 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 1.3 }}
//                     className="col-span-12 mt-6"
//                   >
//                     <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                       <div className="flex justify-between items-center mb-4">
//                         <div>
//                           <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                             Budget Range-wise Leads
//                           </h2>
//                           <p className="text-sm text-gray-500 dark:text-gray-400">
//                             Distribution of leads by budget range - Click any bar to view leads in that range
//                           </p>
//                         </div>
//                         <BarChart3 className="w-5 h-5 text-emerald-500" />
//                       </div>

//                       <Chart
//                         options={buildBarOptions(filteredBudgetRangeData, 'Budget')}
//                         series={buildBarSeries(filteredBudgetRangeData)}
//                         type="bar"
//                         height={360}
//                       />

//                       {/* Add click instruction */}
//                       <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//                         <span className="inline-flex items-center">
//                           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
//                           </svg>
//                           Click on any budget range bar to view leads in that range
//                         </span>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//             </div>
//           )}
//         </motion.div>
//       )}
//     </>
//   );
// };

// export default ECommerce;



// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Users,
//   UserCheck,
//   ClipboardList,
//   CalendarCheck,
//   Layers,
//   Package,
//   Megaphone,
//   Hourglass,
//   BarChart3,
//   PieChart,
//   Filter,
//   CheckSquare,
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import CardDataStats from '../../components/CardDataStats';
// import { BASE_URL } from '../../../public/config.js';
// import { useNavigate } from 'react-router-dom';
// import Chart from 'react-apexcharts';

// // Display configuration
// const DISPLAY_CONFIG = {
//   naValues: [
//     '',
//     null,
//     undefined,
//     'null',
//     'undefined',
//     'not available',
//     'na',
//     'n/a',
//     'notapplicable',
//   ],
//   othersValues: ['others', 'other', 'misc', 'miscellaneous'],
//   specialColors: {
//     'N/A': '#CBD5E1',
//     Others: '#94A3B8',
//     Unknown: '#64748B',
//   },
// };

// const ECommerce: React.FC = () => {
//   // State declarations
//   const [totalLeads, setTotalLeads] = useState<number | null>(null);
//   const [assignedLeads, setAssignedLeads] = useState<number | null>(null);
//   const [totalfollowups, setfollowups] = useState<number | null>(null);
//   const [meetingScheduled, setMeetingScheduled] = useState<number | null>(null);
//   const [totalProducts, setTotalProducts] = useState<number | null>(null);
//   const [totalcategory, settotalcategory] = useState<number | null>(null);
//   const [convertedLeads, setConvertedLeads] = useState<number | null>(null);
//   const [pendingLeads, setpendingLeads] = useState<number | null>(null);
//   const [totalCampaigns, setTotalCampaigns] = useState(0);
//   const [inactiveLeads, setInactiveLeads] = useState(0);
//   const [role, setRole] = useState<string>('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const [dropLeads, setDropLeads] = useState<number | null>(null);
//   const [closedLeads, setClosedLeads] = useState<number | null>(null);
//   const [chartData, setChartData] = useState<Record<string, number> | null>(
//     null,
//   );
//   const [todaysAssignedLeads, setTodaysAssignedLeads] = useState<number | null>(
//     null,
//   );
//   const [upcomingAssigned, setUpcomingAssigned] = useState<number | null>(null);
//   const [categoryChartData, setCategoryChartData] = useState<Record<
//     string,
//     number
//   > | null>(null);
//   const [referenceChartData, setReferenceChartData] = useState<Record<
//     string,
//     number
//   > | null>(null);
//   const [showCharts, setShowCharts] = useState(true);
//   const [showZeroValues, setShowZeroValues] = useState(true);
//   const [quotationPending, setQuotationPending] = useState<number | null>(null);
//   const [quotationFollowup, setQuotationFollowup] = useState<number | null>(
//     null,
//   );
//   const [demoLeads, setDemoLeads] = useState<number | null>(null);
//   const [projectionLeads, setProjectionLeads] = useState<number | null>(null);
//   const [budgetRangeChartData, setBudgetRangeChartData] = useState<Record<
//     string,
//     number
//   > | null>(null);
//   // ADDED: New state for combined today's and missed followups
//   const [todaysMissedCombined, setTodaysMissedCombined] = useState<
//     number | null
//   >(null);

//   const ADMIN_LIKE_ROLES = ['admin', 'sub_admin'];
//   const ADMIN_AND_SUB_ADMIN_ROLES = ['admin', 'sub_admin'];

//   const TELECALLER_LIKE_ROLES = [
//     'tele-caller',
//     'tele_caller',
//     'digital-marketing',
//     'digital_marketing',
//     'field-marketing-executive',
//     'field_marketing_executive',
//     'tech-sale-sound-engineer',
//     'tech_sale_sound_engineer',
//     'junior-autocad-designer',
//     'junior_autocad_designer',
//     'senior-autocad-designer',
//     'senior_autocad_designer',
//     'technical_head',
//   ];

//   // ADDED: Roles that should see Quotation Pending and Projection List cards
//   const ROLES_WITH_QUOTATION_PROJECTION = [
//     'admin',
//     'sub_admin',
//     'tech-sale-sound-engineer',
//     'tech_sale_sound_engineer',
//   ];

//   const isAdminOrSubAdmin = ADMIN_AND_SUB_ADMIN_ROLES.includes(role);
//   const totalLeadsForCard = totalLeads;

//   // ADDED: Check if role should see Quotation Pending and Projection List
//   const shouldShowQuotationProjection =
//     ROLES_WITH_QUOTATION_PROJECTION.includes(role);

//   // Lead stage colors
//   const leadStageColors: Record<string, string> = {
//     'Fresh Lead': '#E5E7EB',
//     'Cold Lead': '#9CA3AF',
//     'On Hold': '#FDE68A',
//     'Positive Lead': '#93C5FD',
//     'Pre Site Visit': '#C4B5FD',
//     Demo: '#F9A8D4',
//     'Quotation Pending': '#F59E0B',
//     'Post Site Visit': '#6D28D9',
//     'Quotation Follow-up': '#92400E',
//     'Projection List': '#86EFAC',
//     Drop: '#EF4444',
//     'Closed Deal': '#166534',
//   };

//   // Update formatDisplayValue function to handle stage "Others" properly
//   const formatDisplayValue = useCallback((value: any): string => {
//     if (value === null || value === undefined || value === '') {
//       return 'N/A';
//     }

//     if (typeof value === 'string') {
//       const trimmed = value.trim();

//       // Check if it's empty or N/A
//       if (
//         trimmed === '' ||
//         DISPLAY_CONFIG.naValues.includes(trimmed.toLowerCase())
//       ) {
//         return 'N/A';
//       }

//       // For stage filtering: if it's "other" or "others", return "Others"
//       const lowerTrimmed = trimmed.toLowerCase();
//       if (lowerTrimmed === 'other' || lowerTrimmed === 'others') {
//         return 'Others'; // Use "Others" for consistency
//       }

//       return trimmed;
//     }

//     if (typeof value === 'number') {
//       return value.toLocaleString();
//     }

//     return String(value);
//   }, []);

//   const normalizeChartData = useCallback(
//     (data: Record<string, number> | null) => {
//       if (!data) return {};

//       const normalized: Record<string, number> = {};

//       Object.entries(data).forEach(([key, value]) => {
//         // 🚫 Skip "Not Specified" completely
//         if (key?.toLowerCase?.().includes('not specified')) return;

//         const cleanKey = formatDisplayValue(key);

//         // also guard if it becomes N/A after formatting
//         if (cleanKey === 'N/A') return;

//         normalized[cleanKey] = (normalized[cleanKey] || 0) + value;
//       });

//       return normalized;
//     },
//     [formatDisplayValue],
//   );

//   const filterChartData = useCallback(
//     (data: Record<string, number> | null, showZero: boolean) => {
//       if (!data) return null;

//       const normalized = normalizeChartData(data);

//       if (!showZero) {
//         const filtered: Record<string, number> = {};
//         Object.entries(normalized).forEach(([key, value]) => {
//           if (value > 0) {
//             filtered[key] = value;
//           }
//         });
//         return filtered;
//       }

//       return normalized;
//     },
//     [normalizeChartData],
//   );

//   // Authentication
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch(`${BASE_URL}auth/check-session`, {
//           credentials: 'include',
//         });
//         const data = await response.json();

//         if (data.isAuthenticated) {
//           setIsAuthenticated(true);
//           setRole(data.role);
//         } else {
//           setIsAuthenticated(false);
//           navigate('/login');
//         }
//       } catch (err) {
//         console.error('Error checking session:', err);
//         setIsAuthenticated(false);
//       }
//     };

//     checkAuth();
//   }, [navigate]);

//   // Fetch dashboard data
//   useEffect(() => {
//     if (!isAuthenticated) return;

//     const fetchDashboardData = async () => {
//       try {
//         setIsLoading(true);

//         const fetchWithSession = (url: string, options: RequestInit = {}) =>
//           fetch(url, { ...options, credentials: 'include' });

//         // Lead Stage Summary
//         const summaryRes = await fetchWithSession(
//           `${BASE_URL}api/dashboard/lead-summary`,
//         );
//         const summaryData = await summaryRes.json();
//         setChartData(normalizeChartData(summaryData.summary || {}));

//         // Category Summary
//         const categorySummaryRes = await fetchWithSession(
//           `${BASE_URL}api/dashboard/category-summary`,
//         );
//         const categorySummaryData = await categorySummaryRes.json();
//         setCategoryChartData(
//           normalizeChartData(categorySummaryData.summary || {}),
//         );

//         // Reference Summary
//         const referenceSummaryRes = await fetchWithSession(
//           `${BASE_URL}api/dashboard/reference-summary`,
//         );
//         const referenceSummaryData = await referenceSummaryRes.json();
//         setReferenceChartData(
//           normalizeChartData(referenceSummaryData.summary || {}),
//         );

//         // Assigned Leads Count
//         const assignedRes = await fetchWithSession(
//           `${BASE_URL}api/dashboard/master-data/assigned-count`,
//         );
//         const assignedData = await assignedRes.json();
//         setAssignedLeads(assignedData.assigned_count || 0);

//         // Today's To-Do List
//         const todayAssignedRes = await fetchWithSession(
//           `${BASE_URL}api/dashboard/master-data/todays-assigned-count`,
//         );
//         const todayAssignedData = await todayAssignedRes.json();
//         setTodaysAssignedLeads(todayAssignedData.total || 0);

//         // Upcoming Followups
//         const upcomingRes = await fetchWithSession(
//           `${BASE_URL}api/dashboard/master-data/upcoming-assigned-count`,
//         );
//         const upcomingData = await upcomingRes.json();
//         setUpcomingAssigned(upcomingData.upcoming || 0);

//         // Missed Followups
//         const followupsRes = await fetchWithSession(
//           `${BASE_URL}api/dashboard/master-data/missed-assigned-count`,
//         );
//         const partsData = await followupsRes.json();
//         setfollowups(partsData.missed || 0);

//         // ADDED: Fetch combined today's and missed followups
//         const todaysMissedCombinedRes = await fetchWithSession(
//           `${BASE_URL}api/dashboard/master-data/todays-missed-combined`,
//         );
//         const todaysMissedCombinedData = await todaysMissedCombinedRes.json();
//         setTodaysMissedCombined(todaysMissedCombinedData.total || 0);

//         // Total Leads
//         const response = await fetchWithSession(`${BASE_URL}api/master-data`);
//         const rawData = await response.json();
//         setTotalLeads(rawData.length || 0);

//         // ADMIN/SUB-ADMIN ONLY ENDPOINTS
//         if (ADMIN_AND_SUB_ADMIN_ROLES.includes(role)) {
//           // Budget Range Summary
//           const budgetRes = await fetchWithSession(
//             `${BASE_URL}api/dashboard/budget-range-summary`,
//           );
//           const budgetData = await budgetRes.json();
//           setBudgetRangeChartData(normalizeChartData(budgetData.summary || {}));

//           // Drop Leads
//           const dropRes = await fetchWithSession(
//             `${BASE_URL}api/dashboard/leads/drop`,
//           );
//           const dropData = await dropRes.json();
//           setDropLeads(dropData.count || 0); // ✅ FIXED

//           // Closed Leads
//           const closedRes = await fetchWithSession(
//             `${BASE_URL}api/dashboard/leads/closed`,
//           );
//           const closedData = await closedRes.json();
//           setClosedLeads(closedData.count || 0); // ✅ FIXED
//         }

//         // Quotation Pending - FETCH FOR SPECIFIED ROLES
//         if (shouldShowQuotationProjection) {
//           const qpRes = await fetchWithSession(
//             `${BASE_URL}api/dashboard/leads/quotation-pending`,
//           );
//           const qpData = await qpRes.json();
//           setQuotationPending(qpData.total || 0);

//           // Projection List Leads - FETCH FOR SPECIFIED ROLES
//           const projectionRes = await fetchWithSession(
//             `${BASE_URL}api/dashboard/leads/projectionlist`,
//           );
//           const projectionData = await projectionRes.json();
//           setProjectionLeads(projectionData.total || 0);
//         }
//       } catch (err) {
//         console.error('Error fetching dashboard data:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [
//     isAuthenticated,
//     role,
//     normalizeChartData,
//     shouldShowQuotationProjection,
//   ]);

//   // Lead stages for chart
//   const ALL_LEAD_STAGES = Object.keys(leadStageColors);
//   const normalizedLeadChartData = ALL_LEAD_STAGES.map(
//     (stage) => [stage, chartData?.[stage] ?? 0] as [string, number],
//   );

//   const chartSeries = [
//     {
//       name: 'Leads',
//       data: normalizedLeadChartData.map(([_, value]) => value),
//     },
//   ];

//   // Clickable chart options
//   const chartOptions: ApexCharts.ApexOptions = {
//     chart: {
//       type: 'bar',
//       toolbar: { show: false },
//       events: {
//         dataPointSelection: function (event, chartContext, config) {
//           const stage = normalizedLeadChartData[config.dataPointIndex][0];
//           if (stage) {
//             handleGoToTotalLeads(stage);
//           }
//         },
//       },
//     },
//     xaxis: {
//       categories: normalizedLeadChartData.map(([stage]) => stage),
//       labels: {
//         rotate: -45,
//         style: {
//           fontSize: '11px',
//         },
//         formatter: function (value) {
//           return formatDisplayValue(value);
//         },
//       },
//     },
//     plotOptions: {
//       bar: {
//         borderRadius: 6,
//         distributed: true,
//         columnWidth: '55%',
//       },
//     },
//     dataLabels: {
//       enabled: true,
//       formatter: (val: number) => val.toString(),
//       style: {
//         fontSize: '12px',
//         fontWeight: 'bold',
//         colors: ['#000'],
//       },
//     },
//     colors: normalizedLeadChartData.map(
//       ([stage]) => leadStageColors[stage] || '#3B82F6',
//     ),
//     tooltip: {
//       y: {
//         formatter: (val: number) => `${val} leads`,
//       },
//     },
//     states: {
//       hover: {
//         filter: {
//           type: 'darken',
//           value: 0.85,
//         },
//       },
//       active: {
//         filter: {
//           type: 'darken',
//           value: 0.7,
//         },
//       },
//     },
//   };

//   // Bar chart builder
//   const buildBarSeries = (data: Record<string, number> | null) => [
//     {
//       name: 'Leads',
//       data: data ? Object.values(data).map(Number) : [],
//     },
//   ];

//   // In ECommerce component - Update the buildBarOptions function

//   const buildBarOptions = (
//     data: Record<string, number> | null,
//     title: string,
//   ): ApexCharts.ApexOptions => {
//     const categories = data
//       ? Object.keys(data).map((key) => formatDisplayValue(key))
//       : [];

//     const colors = categories.map((category) => {
//       if (category === 'N/A' || category === 'Others') {
//         return DISPLAY_CONFIG.specialColors[category] || '#CBD5E1';
//       }
//       return title.includes('Category')
//         ? '#8B5CF6'
//         : title.includes('Reference')
//         ? '#10B981'
//         : title.includes('Budget')
//         ? '#3B82F6'
//         : '#3B82F6';
//     });

//     return {
//       chart: {
//         type: 'bar',
//         toolbar: { show: false },
//         events: {
//           dataPointSelection: function (event, chartContext, config) {
//             const category = categories[config.dataPointIndex];
//             if (category) {
//               if (title.includes('Category')) {
//                 handleGoToCategoryLeads(category);
//               } else if (title.includes('Reference')) {
//                 handleGoToReferenceLeads(category);
//               } else if (title.includes('Budget')) {
//                 handleGoToBudgetRangeLeads(category);
//               }
//             }
//           },
//         },
//       },
//       xaxis: {
//         categories: categories,
//         labels: {
//           rotate: -45,
//           style: {
//             fontSize: '11px',
//             fontWeight: 400,
//           },
//           formatter: function (value) {
//             if (value.length > 15) {
//               return value.substring(0, 12) + '...';
//             }
//             return formatDisplayValue(value);
//           },
//         },
//       },
//       yaxis: {
//         title: {
//           text: 'Number of Leads',
//           style: { fontSize: '12px' },
//         },
//         min: 0,
//       },
//       plotOptions: {
//         bar: {
//           borderRadius: 4,
//           horizontal: false,
//           columnWidth: '60%',
//           distributed: false,
//         },
//       },
//       dataLabels: {
//         enabled: true,
//         formatter: function (val: number) {
//           return val > 0 ? val.toString() : '';
//         },
//         style: { fontSize: '11px', fontWeight: 'bold' },
//       },
//       tooltip: {
//         y: {
//           formatter: function (val: number, { seriesIndex, w }) {
//             const category = w.config.xaxis.categories[seriesIndex];
//             return `${category}: ${val} leads`;
//           },
//         },
//       },
//       colors: colors,
//     };
//   };

//   // In ECommerce component, update all navigation handlers
//   const handleGoToCategoryLeads = (category?: string) => {
//     if (!category) {
//       navigate('/master-data');
//       return;
//     }

//     const formattedCategory = formatDisplayValue(category);
//     console.log(
//       `Navigating to master data with category: "${formattedCategory}"`,
//     );

//     navigate('/master-data', {
//       state: {
//         category_name: formattedCategory,
//         from_dashboard: true,
//       },
//     });
//   };

//   const handleGoToReferenceLeads = (reference?: string) => {
//     if (!reference) {
//       navigate('/master-data');
//       return;
//     }

//     const formattedReference = formatDisplayValue(reference);
//     console.log(
//       `Navigating to master data with reference: "${formattedReference}"`,
//     );

//     // If it's "other" in any case, normalize to "Others"
//     const finalReference =
//       formattedReference.toLowerCase() === 'other'
//         ? 'Others'
//         : formattedReference;

//     navigate('/master-data', {
//       state: {
//         reference_name: finalReference,
//         from_dashboard: true,
//       },
//     });
//   };

//   // In ECommerce component
//   const handleGoToBudgetRangeLeads = (budgetRange?: string) => {
//     if (!budgetRange) {
//       navigate('/master-data');
//       return;
//     }

//     const formattedBudgetRange = formatDisplayValue(budgetRange);
//     console.log(
//       `Navigating to master data with budget range: "${formattedBudgetRange}"`,
//     );

//     navigate('/master-data', {
//       state: {
//         budget_range: formattedBudgetRange,
//         from_dashboard: true,
//       },
//     });
//   };

//   // Pie chart builder
//   const buildPieSeries = (data: Record<string, number> | null) => {
//     if (!data) return [];
//     return Object.values(data).map(Number);
//   };

//   const buildPieOptions = (
//     data: Record<string, number> | null,
//     title: string,
//   ): ApexCharts.ApexOptions => {
//     const labels = data
//       ? Object.keys(data).map((key) => formatDisplayValue(key))
//       : [];

//     return {
//       chart: {
//         type: 'pie' as const,
//       },
//       labels: labels,
//       legend: {
//         position: 'bottom' as const,
//       },
//       dataLabels: {
//         enabled: true,
//         formatter: function (val: number) {
//           return val > 0 ? val.toFixed(0) + '%' : '';
//         },
//       },
//       colors: [
//         '#8B5CF6',
//         '#10B981',
//         '#3B82F6',
//         '#F59E0B',
//         '#EF4444',
//         '#EC4899',
//         '#06B6D4',
//         '#84CC16',
//         '#F97316',
//         '#8B5CF6',
//       ],
//       tooltip: {
//         y: {
//           formatter: function (val: number, { seriesIndex }) {
//             const label = labels[seriesIndex];
//             return `${label}: ${val} leads`;
//           },
//         },
//       },
//     };
//   };

//   // Navigation handlers - update handleGoToTotalLeads
//   const handleGoToTotalLeads = (stage?: string) => {
//     if (!stage) {
//       navigate('/master-data');
//       return;
//     }

//     const formattedStage = formatDisplayValue(stage);
//     console.log(
//       `Navigating to master data with stage: "${formattedStage}" (original: "${stage}")`,
//     );

//     navigate('/master-data', {
//       state: {
//         lead_stage: formattedStage,
//         from_dashboard: true,
//       },
//     });
//   };

//   // ADDED: Navigation handler for combined today's and missed followups
//   const handleGoToTodaysMissedCombined = () => {
//     navigate('/todays-todo'); // Navigate to the same page as To-Do List
//   };

//   const handleGoToAssignedLeads = () => navigate('/call');

//   const handleToggleCharts = () => setShowCharts(!showCharts);
//   const handleToggleZeroValues = () => setShowZeroValues(!showZeroValues);

//   // Card data configuration
//   // MODIFIED: Replaced To-Do List and Missed Followups with a single combined card
//   const commonCards = [
//     {
//       title: 'Assigned Leads',
//       value: formatDisplayValue(assignedLeads),
//       icon: UserCheck,
//       color: 'text-green-500',
//       bgGradient: 'from-green-500/10 to-green-600/5',
//       borderColor: 'border-green-200/50',
//       animation: { y: [0, -2, 0], scale: [1, 1.02, 1] },
//       onClick: handleGoToAssignedLeads,
//       clickable: true,
//     },
//     {
//       title: "Today's Task",
//       value: formatDisplayValue(todaysMissedCombined),
//       icon: ClipboardList,
//       color: 'text-yellow-500',
//       bgGradient: 'from-yellow-500/10 to-yellow-600/5',
//       borderColor: 'border-yellow-200/50',
//       animation: { x: [0, 2, 0], scale: [1, 1.03, 1] },
//       onClick: handleGoToTodaysMissedCombined,
//       clickable: true,
//     },
//     {
//       title: 'Upcoming Followups',
//       value: formatDisplayValue(upcomingAssigned),
//       icon: CalendarCheck,
//       color: 'text-purple-500',
//       bgGradient: 'from-purple-500/10 to-purple-600/5',
//       borderColor: 'border-purple-200/50',
//       animation: { rotate: [0, 180, 0], scale: [1, 1.02, 1] },
//       onClick: () => navigate('/upcoming-followups'),
//       clickable: true,
//     },
//   ];

//   // ADDED: Quotation Pending and Projection List cards for specified roles
//   const quotationProjectionCards = shouldShowQuotationProjection
//     ? [
//         {
//           title: 'Quotation Pending',
//           value: formatDisplayValue(quotationPending),
//           icon: Hourglass,
//           color: 'text-amber-600',
//           bgGradient: 'from-amber-500/10 to-amber-600/5',
//           borderColor: 'border-amber-300/50',
//           onClick: () => navigate('/quatation-pending'),
//           clickable: true,
//         },
//         {
//           title: 'Projection List',
//           value: formatDisplayValue(projectionLeads),
//           icon: BarChart3,
//           color: 'text-green-600',
//           bgGradient: 'from-green-500/10 to-green-600/5',
//           borderColor: 'border-green-300/50',
//           onClick: () => handleGoToTotalLeads('Projection List'),
//           clickable: true,
//         },
//       ]
//     : [];

//   const adminOnlyCards = [
//     {
//       title: 'Total Leads',
//       value: formatDisplayValue(totalLeadsForCard),
//       icon: Users,
//       color: 'text-blue-500',
//       bgGradient: 'from-blue-500/10 to-blue-600/5',
//       borderColor: 'border-blue-200/50',
//       animation: { rotate: [0, -5, 0], scale: [1, 1.05, 1] },
//       onClick: isAdminOrSubAdmin ? handleGoToTotalLeads : undefined,
//       clickable: isAdminOrSubAdmin,
//     },
//     ...(isAdminOrSubAdmin
//       ? [
//           {
//             title: 'Drop Leads',
//             value: formatDisplayValue(dropLeads),
//             icon: Hourglass,
//             color: 'text-red-600',
//             bgGradient: 'from-red-500/10 to-red-600/5',
//             borderColor: 'border-red-300/50',
//             onClick: () => navigate('/drop-leads'),
//             clickable: true,
//           },
//           {
//             title: 'Closed Leads',
//             value: formatDisplayValue(closedLeads),
//             icon: UserCheck,
//             color: 'text-green-600',
//             bgGradient: 'from-green-500/10 to-green-600/5',
//             borderColor: 'border-green-300/50',
//             onClick: () => navigate('/closed-leads'),
//             clickable: true,
//           },
//           // Note: Quotation Pending and Projection List are now in quotationProjectionCards
//         ]
//       : []),
//   ];

//   // Combine cards based on role
//   let cardData;

//   if (isAdminOrSubAdmin) {
//     // Admin/Sub-Admin: Show all cards including quotation/projection
//     cardData = [
//       adminOnlyCards.find((c) => c.title === 'Total Leads'),
//       commonCards.find((c) => c.title === 'Assigned Leads'),
//       commonCards.find((c) => c.title === "Today's Task"), // MODIFIED: Using combined card
//       commonCards.find((c) => c.title === 'Upcoming Followups'),
//       adminOnlyCards.find((c) => c.title === 'Drop Leads'),
//       adminOnlyCards.find((c) => c.title === 'Closed Leads'),
//       ...quotationProjectionCards, // ADDED: Include for admin/sub-admin
//     ].filter(Boolean);
//   } else if (shouldShowQuotationProjection) {
//     // Tech-sale-sound-engineer roles: Show common cards + quotation/projection
//     cardData = [
//       ...commonCards,
//       ...quotationProjectionCards, // ADDED: Include for tech-sale-sound-engineer roles
//     ];
//   } else {
//     // Other roles: Only show common cards
//     cardData = [...commonCards];
//   }

//   // Get filtered chart data
//   const filteredCategoryData = filterChartData(
//     categoryChartData,
//     showZeroValues,
//   );
//   const filteredBudgetRangeData = filterChartData(
//     budgetRangeChartData,
//     showZeroValues,
//   );
//   const filteredReferenceData = filterChartData(
//     referenceChartData,
//     showZeroValues,
//   );

//   // Check if there's any chart data to show
//   const hasChartData = chartData && Object.keys(chartData).length > 0;
//   const hasCategoryData =
//     filteredCategoryData && Object.keys(filteredCategoryData).length > 0;
//   const hasBudgetRangeData =
//     filteredBudgetRangeData && Object.keys(filteredBudgetRangeData).length > 0;
//   const hasReferenceData =
//     filteredReferenceData && Object.keys(filteredReferenceData).length > 0;

//   // Loading skeleton
//   if (isLoading) {
//     const totalCards = cardData.length;
//     return (
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
//         {Array.from({ length: totalCards }).map((_, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border border-white/20 shadow-lg rounded-2xl p-6"
//           >
//             <div className="animate-pulse">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="h-6 bg-gray-300 rounded w-24"></div>
//                 <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
//               </div>
//               <div className="h-8 bg-gray-400 rounded w-16"></div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Main Cards Section */}
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
//         <AnimatePresence>
//           {cardData.map((card, index) => (
//             <motion.div
//               key={card.title}
//               onClick={card.clickable ? () => card.onClick?.() : undefined}
//               initial={{ opacity: 0, y: 20, scale: 0.9 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               whileHover={{
//                 y: -4,
//                 transition: { type: 'spring', stiffness: 400, damping: 17 },
//               }}
//               transition={{
//                 delay: index * 0.1,
//                 type: 'spring',
//                 stiffness: 300,
//                 damping: 25,
//               }}
//               className={`
//                 relative p-6 bg-gradient-to-br ${card.bgGradient} 
//                 rounded-2xl shadow-lg border-l-4 ${card.borderColor}
//                 hover:shadow-2xl hover:scale-105 hover:-translate-y-1
//                 transform transition-all duration-300 ease-out
//                 cursor-pointer overflow-hidden
//                 ${
//                   card.clickable
//                     ? ''
//                     : 'cursor-default hover:shadow-lg hover:scale-100 hover:-translate-y-0'
//                 }
//               `}
//             >
//               <div className="absolute inset-0 bg-white dark:bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>

//               <div className="relative z-10">
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
//                     {card.title}
//                   </h3>
//                   <motion.div
//                     animate={card.animation}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       repeatType: 'reverse',
//                       ease: 'easeInOut',
//                     }}
//                     className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 shadow-sm ${card.color}`}
//                   >
//                     <card.icon className="w-5 h-5" />
//                   </motion.div>
//                 </div>

//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={card.value}
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 1.2 }}
//                     transition={{ type: 'spring', stiffness: 400, damping: 25 }}
//                     className="text-2xl font-bold text-gray-900 dark:text-white"
//                   >
//                     {card.value === 'N/A' ? (
//                       <motion.span
//                         animate={{ opacity: [0.5, 1, 0.5] }}
//                         transition={{ duration: 1.5, repeat: Infinity }}
//                         className="text-gray-400"
//                       >
//                         {card.value}
//                       </motion.span>
//                     ) : (
//                       card.value
//                     )}
//                   </motion.div>
//                 </AnimatePresence>

//                 <motion.div
//                   className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden"
//                   initial={{ width: 0 }}
//                   animate={{ width: '100%' }}
//                   transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
//                 >
//                   <motion.div
//                     className={`h-full ${card.color.replace('text-', 'bg-')}`}
//                     initial={{ width: 0 }}
//                     animate={{
//                       width: `${Math.min(
//                         ((parseInt(card.value?.replace(/,/g, '') || '0') || 0) /
//                           100) *
//                           100,
//                         100,
//                       )}%`,
//                     }}
//                     transition={{
//                       delay: index * 0.1 + 1,
//                       duration: 1,
//                       type: 'spring',
//                     }}
//                   />
//                 </motion.div>
//               </div>

//               <div
//                 className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.color.replace(
//                   'text-',
//                   'bg-',
//                 )} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-300`}
//               />
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>

//       {/* Lead Stage Summary Chart - CLICKABLE */}
//       {hasChartData && (
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.8 }}
//           className="mt-10"
//         >
//           <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                   {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                     ? 'Active Lead Stage Summary'
//                     : 'Your Lead Stage Summary'}
//                 </h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                     ? 'Summary of all lead stages - Click any bar to view leads in that stage'
//                     : 'Summary of your assigned leads by stage - Click any bar to view leads'}
//                 </p>
//               </div>
//               <BarChart3 className="w-5 h-5 text-blue-500" />
//             </div>
//             <div className="cursor-pointer">
//               <Chart
//                 options={chartOptions}
//                 series={chartSeries}
//                 type="bar"
//                 height={380}
//               />
//             </div>
//             <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//               <span className="inline-flex items-center">
//                 <svg
//                   className="w-3 h-3 mr-1"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
//                   />
//                 </svg>
//                 Click on any stage bar to view leads in that stage
//               </span>
//             </div>
//           </div>
//         </motion.div>
//       )}

//       {/* Charts Section */}
//       {(hasCategoryData || hasReferenceData) && (
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 1 }}
//           className="mt-10"
//         >
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                 ? 'Lead Distribution Analytics'
//                 : 'Your Lead Distribution'}
//             </h2>

//             <div className="flex flex-wrap gap-3">
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) && (
//                 <button
//                   onClick={handleToggleZeroValues}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                     showZeroValues
//                       ? 'bg-indigo-500 text-white hover:bg-indigo-600'
//                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
//                   }`}
//                 >
//                   <Filter className="w-4 h-4" />
//                   {showZeroValues ? 'Hide Zero Values' : 'Show Zero Values'}
//                 </button>
//               )}

//               <button
//                 onClick={handleToggleCharts}
//                 className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
//               >
//                 {showCharts ? (
//                   <>
//                     <PieChart className="w-4 h-4" />
//                     Hide Charts
//                   </>
//                 ) : (
//                   <>
//                     <BarChart3 className="w-4 h-4" />
//                     Show Charts
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {showCharts && (
//             <div className="grid grid-cols-12 gap-6">
//               {/* CATEGORY CHART */}
//               <div className="col-span-12 xl:col-span-6">
//                 {hasCategoryData ? (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="flex justify-between items-center mb-4">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? 'Category-wise Active Leads'
//                             : 'Your Leads by Category'}
//                         </h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? `Showing ${
//                                 Object.keys(filteredCategoryData).length
//                               } categories - Click any bar to view leads in that category`
//                             : `Your leads across ${
//                                 Object.keys(filteredCategoryData).length
//                               } categories - Click to view`}
//                         </p>
//                       </div>
//                       <Layers className="w-5 h-5 text-indigo-500" />
//                     </div>

//                     <Chart
//                       options={buildBarOptions(
//                         filteredCategoryData,
//                         'Category',
//                       )}
//                       series={buildBarSeries(filteredCategoryData)}
//                       type="bar"
//                       height={350}
//                     />

//                     {/* Add click instruction */}
//                     <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//                       <span className="inline-flex items-center">
//                         <svg
//                           className="w-3 h-3 mr-1"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
//                           />
//                         </svg>
//                         Click on any category bar to view leads in that category
//                       </span>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="text-center py-8">
//                       <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                       <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         No Category Data
//                       </h3>
//                       <p className="text-gray-500 dark:text-gray-400">
//                         No leads assigned in any category yet
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* REFERENCE CHART */}
//               {/* REFERENCE CHART */}
//               <div className="col-span-12 xl:col-span-6">
//                 {hasReferenceData ? (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="flex justify-between items-center mb-4">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? 'Sources-wise Active Leads'
//                             : 'Your Leads by Source'}
//                         </h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? `Showing ${
//                                 Object.keys(filteredReferenceData).length
//                               } references - Click any bar to view leads from that source`
//                             : `Your leads from ${
//                                 Object.keys(filteredReferenceData).length
//                               } sources - Click to view`}
//                         </p>
//                       </div>
//                       <Users className="w-5 h-5 text-green-500" />
//                     </div>

//                     <Chart
//                       options={buildBarOptions(
//                         filteredReferenceData,
//                         'Reference',
//                       )}
//                       series={buildBarSeries(filteredReferenceData)}
//                       type="bar"
//                       height={350}
//                     />

//                     {/* Add click instruction */}
//                     <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//                       <span className="inline-flex items-center">
//                         <svg
//                           className="w-3 h-3 mr-1"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
//                           />
//                         </svg>
//                         Click on any source bar to view leads from that source
//                       </span>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="text-center py-8">
//                       <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                       <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         No Reference Data
//                       </h3>
//                       <p className="text-gray-500 dark:text-gray-400">
//                         No leads assigned from any reference yet
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* BUDGET RANGE BAR CHART – ADMIN / SUB-ADMIN ONLY */}
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) &&
//                 showCharts &&
//                 hasBudgetRangeData && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 30 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 1.3 }}
//                     className="col-span-12 mt-6"
//                   >
//                     <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                       <div className="flex justify-between items-center mb-4">
//                         <div>
//                           <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                             Budget Range-wise Leads
//                           </h2>
//                           <p className="text-sm text-gray-500 dark:text-gray-400">
//                             Distribution of leads by budget range - Click any
//                             bar to view leads in that range
//                           </p>
//                         </div>
//                         <BarChart3 className="w-5 h-5 text-emerald-500" />
//                       </div>

//                       <Chart
//                         options={buildBarOptions(
//                           filteredBudgetRangeData,
//                           'Budget',
//                         )}
//                         series={buildBarSeries(filteredBudgetRangeData)}
//                         type="bar"
//                         height={360}
//                       />

//                       {/* Add click instruction */}
//                       <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//                         <span className="inline-flex items-center">
//                           <svg
//                             className="w-3 h-3 mr-1"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
//                             />
//                           </svg>
//                           Click on any budget range bar to view leads in that
//                           range
//                         </span>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//             </div>
//           )}
//         </motion.div>
//       )}
//     </>
//   );
// };

// export default ECommerce;



// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Users,
//   UserCheck,
//   ClipboardList,
//   CalendarCheck,
//   Layers,
//   Package,
//   Megaphone,
//   Hourglass,
//   BarChart3,
//   PieChart,
//   Filter,
//   CheckSquare,
//   Activity,
//   PlayCircle,
//   Settings,
//   ListChecks,
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import CardDataStats from '../../components/CardDataStats';
// import { BASE_URL } from '../../../public/config.js';
// import { useNavigate } from 'react-router-dom';
// import Chart from 'react-apexcharts';

// // Display configuration
// const DISPLAY_CONFIG = {
//   naValues: [
//     '',
//     null,
//     undefined,
//     'null',
//     'undefined',
//     'not available',
//     'na',
//     'n/a',
//     'notapplicable',
//   ],
//   othersValues: ['others', 'other', 'misc', 'miscellaneous'],
//   specialColors: {
//     'N/A': '#CBD5E1',
//     Others: '#94A3B8',
//     Unknown: '#64748B',
//   },
// };

// const ECommerce: React.FC = () => {
//   // State declarations
//   const [totalLeads, setTotalLeads] = useState<number | null>(null);
//   const [assignedLeads, setAssignedLeads] = useState<number | null>(null);
//   const [totalfollowups, setfollowups] = useState<number | null>(null);
//   const [meetingScheduled, setMeetingScheduled] = useState<number | null>(null);
//   const [totalProducts, setTotalProducts] = useState<number | null>(null);
//   const [totalcategory, settotalcategory] = useState<number | null>(null);
//   const [convertedLeads, setConvertedLeads] = useState<number | null>(null);
//   const [pendingLeads, setpendingLeads] = useState<number | null>(null);
//   const [totalCampaigns, setTotalCampaigns] = useState(0);
//   const [inactiveLeads, setInactiveLeads] = useState(0);
//   const [role, setRole] = useState<string>('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const [dropLeads, setDropLeads] = useState<number | null>(null);
//   const [closedLeads, setClosedLeads] = useState<number | null>(null);
//   const [chartData, setChartData] = useState<Record<string, number> | null>(null);
//   const [todaysAssignedLeads, setTodaysAssignedLeads] = useState<number | null>(null);
//   const [upcomingAssigned, setUpcomingAssigned] = useState<number | null>(null);
//   const [categoryChartData, setCategoryChartData] = useState<Record<string, number> | null>(null);
//   const [referenceChartData, setReferenceChartData] = useState<Record<string, number> | null>(null);
//   const [showCharts, setShowCharts] = useState(true);
//   const [showZeroValues, setShowZeroValues] = useState(true);
//   const [quotationPending, setQuotationPending] = useState<number | null>(null);
//   const [quotationFollowup, setQuotationFollowup] = useState<number | null>(null);
//   const [demoLeads, setDemoLeads] = useState<number | null>(null);
//   const [projectionLeads, setProjectionLeads] = useState<number | null>(null);
//   const [budgetRangeChartData, setBudgetRangeChartData] = useState<Record<string, number> | null>(null);
//   const [todaysMissedCombined, setTodaysMissedCombined] = useState<number | null>(null);

//   // NEW: Admin-only operation card states
//   const [dailyOperationCount, setDailyOperationCount] = useState<number | null>(null);
//   const [preExecutionCount, setPreExecutionCount] = useState<number | null>(null);
//   const [executionCount, setExecutionCount] = useState<number | null>(null);
//   const [assignedProcessCount, setAssignedProcessCount] = useState<number | null>(null);

//   const ADMIN_LIKE_ROLES = ['admin', 'sub_admin'];
//   const ADMIN_AND_SUB_ADMIN_ROLES = ['admin', 'sub_admin'];

//   const isProjectManager = role === 'project_manager';


//   const TELECALLER_LIKE_ROLES = [
//     'tele-caller',
//     'tele_caller',
//     'digital-marketing',
//     'digital_marketing',
//     'field-marketing-executive',
//     'field_marketing_executive',
//     'tech-sale-sound-engineer',
//     'tech_sale_sound_engineer',
//     'junior-autocad-designer',
//     'junior_autocad_designer',
//     'senior-autocad-designer',
//     'senior_autocad_designer',
//     'technical_head',
//   ];

//   const ROLES_WITH_QUOTATION_PROJECTION = [
//     'admin',
//     'sub_admin',
//     'tech-sale-sound-engineer',
//     'tech_sale_sound_engineer',
//   ];

//   const isAdminOrSubAdmin = ADMIN_AND_SUB_ADMIN_ROLES.includes(role);
//   const totalLeadsForCard = totalLeads;

//   const shouldShowQuotationProjection = ROLES_WITH_QUOTATION_PROJECTION.includes(role);

//   // Lead stage colors
//   const leadStageColors: Record<string, string> = {
//     'Fresh Lead': '#E5E7EB',
//     'Cold Lead': '#9CA3AF',
//     'On Hold': '#FDE68A',
//     'Positive Lead': '#93C5FD',
//     'Pre Site Visit': '#C4B5FD',
//     Demo: '#F9A8D4',
//     'Quotation Pending': '#F59E0B',
//     'Post Site Visit': '#6D28D9',
//     'Quotation Follow-up': '#92400E',
//     'Projection List': '#86EFAC',
//     Drop: '#EF4444',
//     'Closed Deal': '#166534',
//   };

//   const formatDisplayValue = useCallback((value: any): string => {
//     if (value === null || value === undefined || value === '') {
//       return 'N/A';
//     }
//     if (typeof value === 'string') {
//       const trimmed = value.trim();
//       if (trimmed === '' || DISPLAY_CONFIG.naValues.includes(trimmed.toLowerCase())) {
//         return 'N/A';
//       }
//       const lowerTrimmed = trimmed.toLowerCase();
//       if (lowerTrimmed === 'other' || lowerTrimmed === 'others') {
//         return 'Others';
//       }
//       return trimmed;
//     }
//     if (typeof value === 'number') {
//       return value.toLocaleString();
//     }
//     return String(value);
//   }, []);

//   const normalizeChartData = useCallback(
//     (data: Record<string, number> | null) => {
//       if (!data) return {};
//       const normalized: Record<string, number> = {};
//       Object.entries(data).forEach(([key, value]) => {
//         if (key?.toLowerCase?.().includes('not specified')) return;
//         const cleanKey = formatDisplayValue(key);
//         if (cleanKey === 'N/A') return;
//         normalized[cleanKey] = (normalized[cleanKey] || 0) + value;
//       });
//       return normalized;
//     },
//     [formatDisplayValue],
//   );

//   const filterChartData = useCallback(
//     (data: Record<string, number> | null, showZero: boolean) => {
//       if (!data) return null;
//       const normalized = normalizeChartData(data);
//       if (!showZero) {
//         const filtered: Record<string, number> = {};
//         Object.entries(normalized).forEach(([key, value]) => {
//           if (value > 0) {
//             filtered[key] = value;
//           }
//         });
//         return filtered;
//       }
//       return normalized;
//     },
//     [normalizeChartData],
//   );

//   // Authentication
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch(`${BASE_URL}auth/check-session`, {
//           credentials: 'include',
//         });
//         const data = await response.json();
//         if (data.isAuthenticated) {
//           setIsAuthenticated(true);
//           setRole(data.role);
//         } else {
//           setIsAuthenticated(false);
//           navigate('/login');
//         }
//       } catch (err) {
//         console.error('Error checking session:', err);
//         setIsAuthenticated(false);
//       }
//     };
//     checkAuth();
//   }, [navigate]);

//   // Fetch dashboard data
// //   useEffect(() => {
// //     if (!isAuthenticated) return;

// //     const fetchDashboardData = async () => {
// //       try {
// //         setIsLoading(true);

// //         const fetchWithSession = (url: string, options: RequestInit = {}) =>
// //           fetch(url, { ...options, credentials: 'include' });

// //         // Lead Stage Summary
// //         const summaryRes = await fetchWithSession(`${BASE_URL}api/dashboard/lead-summary`);
// //         const summaryData = await summaryRes.json();
// //         setChartData(normalizeChartData(summaryData.summary || {}));

// //         // Category Summary
// //         const categorySummaryRes = await fetchWithSession(`${BASE_URL}api/dashboard/category-summary`);
// //         const categorySummaryData = await categorySummaryRes.json();
// //         setCategoryChartData(normalizeChartData(categorySummaryData.summary || {}));

// //         // Reference Summary
// //         const referenceSummaryRes = await fetchWithSession(`${BASE_URL}api/dashboard/reference-summary`);
// //         const referenceSummaryData = await referenceSummaryRes.json();
// //         setReferenceChartData(normalizeChartData(referenceSummaryData.summary || {}));

// //         // Assigned Leads Count
// //         const assignedRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/assigned-count`);
// //         const assignedData = await assignedRes.json();
// //         setAssignedLeads(assignedData.assigned_count || 0);

// //         // Today's To-Do List
// //         const todayAssignedRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/todays-assigned-count`);
// //         const todayAssignedData = await todayAssignedRes.json();
// //         setTodaysAssignedLeads(todayAssignedData.total || 0);

// //         // Upcoming Followups
// //         const upcomingRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/upcoming-assigned-count`);
// //         const upcomingData = await upcomingRes.json();
// //         setUpcomingAssigned(upcomingData.upcoming || 0);

// //         // Missed Followups
// //         const followupsRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/missed-assigned-count`);
// //         const partsData = await followupsRes.json();
// //         setfollowups(partsData.missed || 0);

// //         // Combined today's and missed followups
// //         const todaysMissedCombinedRes = await fetchWithSession(`${BASE_URL}api/dashboard/master-data/todays-missed-combined`);
// //         const todaysMissedCombinedData = await todaysMissedCombinedRes.json();
// //         setTodaysMissedCombined(todaysMissedCombinedData.total || 0);

// //         // Total Leads
// //         const response = await fetchWithSession(`${BASE_URL}api/dashboard/dashboard/lead-count`);
// //     const data = await response.json();
// //     setTotalLeads(data.count || 0); 

// //         // ADMIN/SUB-ADMIN ONLY ENDPOINTS
// // if (ADMIN_AND_SUB_ADMIN_ROLES.includes(role) || isProjectManager) {          // Budget Range Summary
// //           const budgetRes = await fetchWithSession(`${BASE_URL}api/dashboard/budget-range-summary`);
// //           const budgetData = await budgetRes.json();
// //           setBudgetRangeChartData(normalizeChartData(budgetData.summary || {}));

// //           // Drop Leads
// //           const dropRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/drop`);
// //           const dropData = await dropRes.json();
// //           setDropLeads(dropData.count || 0);

// //           // Closed Leads
// //           const closedRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/closed`);
// //           const closedData = await closedRes.json();
// //           setClosedLeads(closedData.count || 0);

// //           // NEW: Daily Operation count
// //           const dailyOpRes = await fetchWithSession(`${BASE_URL}api/dashboard/manager-processes-count`);
// //           const dailyOpData = await dailyOpRes.json();
// //           setDailyOperationCount(dailyOpData.count || 0);

// //           // NEW: Pre Execution count
// //           const preExecRes = await fetchWithSession(`${BASE_URL}api/dashboard/closed-leads-count`);
// //           const preExecData = await preExecRes.json();
// //           setPreExecutionCount(preExecData.count || 0);

// //           // NEW: Execution count
// //           const execRes = await fetchWithSession(`${BASE_URL}api/dashboard/closed-execution-leads-count`);
// //           const execData = await execRes.json();
// //           setExecutionCount(execData.count || 0);

// //           // NEW: Assigned Process count
// //           const assignedProcRes = await fetchWithSession(`${BASE_URL}api/dashboard/daily-execution-processes-count`);
// //           const assignedProcData = await assignedProcRes.json();
// //           setAssignedProcessCount(assignedProcData.count || 0);
// //         }

// //         // Quotation Pending - FETCH FOR SPECIFIED ROLES
// //         if (shouldShowQuotationProjection) {
// //           const qpRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/quotation-pending`);
// //           const qpData = await qpRes.json();
// //           setQuotationPending(qpData.total || 0);

// //           // Projection List Leads
// //           const projectionRes = await fetchWithSession(`${BASE_URL}api/dashboard/leads/projectionlist`);
// //           const projectionData = await projectionRes.json();
// //           setProjectionLeads(projectionData.total || 0);
// //         }
// //       } catch (err) {
// //         console.error('Error fetching dashboard data:', err);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchDashboardData();
// //   }, [isAuthenticated, role, normalizeChartData, shouldShowQuotationProjection]);


// // Fetch dashboard data



// // Fetch dashboard data
// useEffect(() => {
//   if (!isAuthenticated) return;

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true);

//       const fetchWithSession = (url: string, options: RequestInit = {}) =>
//         fetch(url, { ...options, credentials: 'include' });

//       // FIRST: Load all card counts immediately (fast) - DON'T AWAIT
//       // Use Promise.allSettled for parallel execution without blocking
//       Promise.allSettled([
//         // Lead counts API
//         fetchWithSession(`${BASE_URL}api/dashboard/dashboard/lead-counts`)
//           .then(res => res.json())
//           .then(data => {
//             if (data.success) {
//               setTotalLeads(data.total || 0);
//               setAssignedLeads(data.assigned || 0);
//               setDropLeads(data.drop || 0);
//               setClosedLeads(data.closed || 0);
//               setProjectionLeads(data.projection || 0);
//               setQuotationPending(data.quotation_pending || 0);
//               setTodaysAssignedLeads(data.today || 0);
//               setfollowups(data.missed || 0);
//               setUpcomingAssigned(data.upcoming || 0);
//               setTodaysMissedCombined(data.today_missed_total || 0);
//             }
//           }),
        
//         // Execution counts (if applicable)
//         (ADMIN_AND_SUB_ADMIN_ROLES.includes(role) || isProjectManager) 
//           ? fetchWithSession(`${BASE_URL}api/dashboard/execution-dashboard-counts`)
//               .then(res => res.json())
//               .then(data => {
//                 if (data.success) {
//                   setPreExecutionCount(data.pre_execution || 0);
//                   setExecutionCount(data.execution || 0);
//                   setAssignedProcessCount(data.assigned_process || 0);
//                   setDailyOperationCount(data.daily_operation || 0);
//                 }
//               })
//           : Promise.resolve(),
//       ]).then(() => {
//         // CARDS ARE NOW LOADED - HIDE LOADING IMMEDIATELY
//         setIsLoading(false);
//       });

//       // SECOND: Load chart data in background (slow) - don't block UI
//       // These will continue loading after cards are shown
//       setTimeout(() => {
//         Promise.allSettled([
//           // Lead Stage Summary
//           fetchWithSession(`${BASE_URL}api/dashboard/lead-summary`)
//             .then(res => res.json())
//             .then(data => setChartData(normalizeChartData(data.summary || {}))),
          
//           // Category Summary
//           fetchWithSession(`${BASE_URL}api/dashboard/category-summary`)
//             .then(res => res.json())
//             .then(data => setCategoryChartData(normalizeChartData(data.summary || {}))),
          
//           // Reference Summary
//           fetchWithSession(`${BASE_URL}api/dashboard/reference-summary`)
//             .then(res => res.json())
//             .then(data => setReferenceChartData(normalizeChartData(data.summary || {}))),
          
//           // Budget Range Summary (if admin)
//           (ADMIN_AND_SUB_ADMIN_ROLES.includes(role) || isProjectManager)
//             ? fetchWithSession(`${BASE_URL}api/dashboard/budget-range-summary`)
//                 .then(res => res.json())
//                 .then(data => setBudgetRangeChartData(normalizeChartData(data.summary || {})))
//             : Promise.resolve(),
//         ]).catch(err => console.error('Error loading chart data:', err));
//       }, 100); // Small delay to ensure UI renders first

//     } catch (err) {
//       console.error('Error fetching dashboard data:', err);
//       setIsLoading(false); // Ensure loading is hidden even on error
//     }
//   };

//   fetchDashboardData();
// }, [isAuthenticated, role, normalizeChartData, shouldShowQuotationProjection]);




//   // Lead stages for chart
//   const ALL_LEAD_STAGES = Object.keys(leadStageColors);
//   const normalizedLeadChartData = ALL_LEAD_STAGES.map(
//     (stage) => [stage, chartData?.[stage] ?? 0] as [string, number],
//   );

//   const chartSeries = [
//     {
//       name: 'Leads',
//       data: normalizedLeadChartData.map(([_, value]) => value),
//     },
//   ];

//   const chartOptions: ApexCharts.ApexOptions = {
//     chart: {
//       type: 'bar',
//       toolbar: { show: false },
//       events: {
//         dataPointSelection: function (event, chartContext, config) {
//           const stage = normalizedLeadChartData[config.dataPointIndex][0];
//           if (stage) {
//             handleGoToTotalLeads(stage);
//           }
//         },
//       },
//     },
//     xaxis: {
//       categories: normalizedLeadChartData.map(([stage]) => stage),
//       labels: {
//         rotate: -45,
//         style: { fontSize: '11px' },
//         formatter: function (value) {
//           return formatDisplayValue(value);
//         },
//       },
//     },
//     plotOptions: {
//       bar: {
//         borderRadius: 6,
//         distributed: true,
//         columnWidth: '55%',
//       },
//     },
//     dataLabels: {
//       enabled: true,
//       formatter: (val: number) => val.toString(),
//       style: {
//         fontSize: '12px',
//         fontWeight: 'bold',
//         colors: ['#000'],
//       },
//     },
//     colors: normalizedLeadChartData.map(([stage]) => leadStageColors[stage] || '#3B82F6'),
//     tooltip: {
//       y: { formatter: (val: number) => `${val} leads` },
//     },
//     states: {
//       hover: { filter: { type: 'darken', value: 0.85 } },
//       active: { filter: { type: 'darken', value: 0.7 } },
//     },
//   };

//   const buildBarSeries = (data: Record<string, number> | null) => [
//     {
//       name: 'Leads',
//       data: data ? Object.values(data).map(Number) : [],
//     },
//   ];

//   const buildBarOptions = (
//     data: Record<string, number> | null,
//     title: string,
//   ): ApexCharts.ApexOptions => {
//     const categories = data ? Object.keys(data).map((key) => formatDisplayValue(key)) : [];
//     const colors = categories.map((category) => {
//       if (category === 'N/A' || category === 'Others') {
//         return DISPLAY_CONFIG.specialColors[category] || '#CBD5E1';
//       }
//       return title.includes('Category')
//         ? '#8B5CF6'
//         : title.includes('Reference')
//         ? '#10B981'
//         : title.includes('Budget')
//         ? '#3B82F6'
//         : '#3B82F6';
//     });

//     return {
//       chart: {
//         type: 'bar',
//         toolbar: { show: false },
//         events: {
//           dataPointSelection: function (event, chartContext, config) {
//             const category = categories[config.dataPointIndex];
//             if (category) {
//               if (title.includes('Category')) handleGoToCategoryLeads(category);
//               else if (title.includes('Reference')) handleGoToReferenceLeads(category);
//               else if (title.includes('Budget')) handleGoToBudgetRangeLeads(category);
//             }
//           },
//         },
//       },
//       xaxis: {
//         categories: categories,
//         labels: {
//           rotate: -45,
//           style: { fontSize: '11px', fontWeight: 400 },
//           formatter: function (value) {
//             if (value.length > 15) return value.substring(0, 12) + '...';
//             return formatDisplayValue(value);
//           },
//         },
//       },
//       yaxis: {
//         title: { text: 'Number of Leads', style: { fontSize: '12px' } },
//         min: 0,
//       },
//       plotOptions: {
//         bar: { borderRadius: 4, horizontal: false, columnWidth: '60%', distributed: false },
//       },
//       dataLabels: {
//         enabled: true,
//         formatter: function (val: number) { return val > 0 ? val.toString() : ''; },
//         style: { fontSize: '11px', fontWeight: 'bold' },
//       },
//       tooltip: {
//         y: {
//           formatter: function (val: number, { seriesIndex, w }) {
//             const category = w.config.xaxis.categories[seriesIndex];
//             return `${category}: ${val} leads`;
//           },
//         },
//       },
//       colors: colors,
//     };
//   };

//   const handleGoToCategoryLeads = (category?: string) => {
//     if (!category) { navigate('/master-data'); return; }
//     navigate('/master-data', { state: { category_name: formatDisplayValue(category), from_dashboard: true } });
//   };

//   const handleGoToReferenceLeads = (reference?: string) => {
//     if (!reference) { navigate('/master-data'); return; }
//     const formattedReference = formatDisplayValue(reference);
//     const finalReference = formattedReference.toLowerCase() === 'other' ? 'Others' : formattedReference;
//     navigate('/master-data', { state: { reference_name: finalReference, from_dashboard: true } });
//   };

//   const handleGoToBudgetRangeLeads = (budgetRange?: string) => {
//     if (!budgetRange) { navigate('/master-data'); return; }
//     navigate('/master-data', { state: { budget_range: formatDisplayValue(budgetRange), from_dashboard: true } });
//   };

//   const buildPieSeries = (data: Record<string, number> | null) => {
//     if (!data) return [];
//     return Object.values(data).map(Number);
//   };

//   const buildPieOptions = (data: Record<string, number> | null, title: string): ApexCharts.ApexOptions => {
//     const labels = data ? Object.keys(data).map((key) => formatDisplayValue(key)) : [];
//     return {
//       chart: { type: 'pie' as const },
//       labels: labels,
//       legend: { position: 'bottom' as const },
//       dataLabels: {
//         enabled: true,
//         formatter: function (val: number) { return val > 0 ? val.toFixed(0) + '%' : ''; },
//       },
//       colors: ['#8B5CF6','#10B981','#3B82F6','#F59E0B','#EF4444','#EC4899','#06B6D4','#84CC16','#F97316','#8B5CF6'],
//       tooltip: {
//         y: {
//           formatter: function (val: number, { seriesIndex }) {
//             const label = labels[seriesIndex];
//             return `${label}: ${val} leads`;
//           },
//         },
//       },
//     };
//   };

//   const handleGoToTotalLeads = (stage?: string) => {
//     if (!stage) { navigate('/master-data'); return; }
//     navigate('/master-data', { state: { lead_stage: formatDisplayValue(stage), from_dashboard: true } });
//   };

//   const handleGoToTodaysMissedCombined = () => navigate('/todays-todo');
//   const handleGoToAssignedLeads = () => navigate('/call');
//   const handleToggleCharts = () => setShowCharts(!showCharts);
//   const handleToggleZeroValues = () => setShowZeroValues(!showZeroValues);

//   // Card data configuration
//   const commonCards = [
//     {
//       title: 'Assigned Leads',
//       value: formatDisplayValue(assignedLeads),
//       icon: UserCheck,
//       color: 'text-green-500',
//       bgGradient: 'from-green-500/10 to-green-600/5',
//       borderColor: 'border-green-200/50',
//       animation: { y: [0, -2, 0], scale: [1, 1.02, 1] },
//       onClick: handleGoToAssignedLeads,
//       clickable: true,
//     },
//     {
//       title: "Today's Task",
//       value: formatDisplayValue(todaysMissedCombined),
//       icon: ClipboardList,
//       color: 'text-yellow-500',
//       bgGradient: 'from-yellow-500/10 to-yellow-600/5',
//       borderColor: 'border-yellow-200/50',
//       animation: { x: [0, 2, 0], scale: [1, 1.03, 1] },
//       onClick: handleGoToTodaysMissedCombined,
//       clickable: true,
//     },
//     {
//       title: 'Upcoming Followups',
//       value: formatDisplayValue(upcomingAssigned),
//       icon: CalendarCheck,
//       color: 'text-purple-500',
//       bgGradient: 'from-purple-500/10 to-purple-600/5',
//       borderColor: 'border-purple-200/50',
//       animation: { rotate: [0, 180, 0], scale: [1, 1.02, 1] },
//       onClick: () => navigate('/upcoming-followups'),
//       clickable: true,
//     },
//   ];

//   const quotationProjectionCards = shouldShowQuotationProjection
//     ? [
//         {
//           title: 'Quotation Pending',
//           value: formatDisplayValue(quotationPending),
//           icon: Hourglass,
//           color: 'text-amber-600',
//           bgGradient: 'from-amber-500/10 to-amber-600/5',
//           borderColor: 'border-amber-300/50',
//           onClick: () => navigate('/quatation-pending'),
//           clickable: true,
//         },
//         {
//           title: 'Projection List',
//           value: formatDisplayValue(projectionLeads),
//           icon: BarChart3,
//           color: 'text-green-600',
//           bgGradient: 'from-green-500/10 to-green-600/5',
//           borderColor: 'border-green-300/50',
//           onClick: () => handleGoToTotalLeads('Projection List'),
//           clickable: true,
//         },
//       ]
//     : [];

//   // NEW: Admin-only operation cards
// const adminOperationCards = (isAdminOrSubAdmin || isProjectManager)
//     ? [
        
//         {
//           title: 'Pre Execution',
//           value: formatDisplayValue(preExecutionCount),
//           icon: Settings,
//           color: 'text-violet-600',
//           bgGradient: 'from-violet-500/10 to-violet-600/5',
//           borderColor: 'border-violet-300/50',
//           animation: { rotate: [0, -5, 0], scale: [1, 1.02, 1] },
//   onClick: () => navigate('/execution/pre-execution'), // Updated path
//           clickable: true,
//         },
//         {
//           title: 'Execution',
//           value: formatDisplayValue(executionCount),
//           icon: PlayCircle,
//           color: 'text-emerald-600',
//           bgGradient: 'from-emerald-500/10 to-emerald-600/5',
//           borderColor: 'border-emerald-300/50',
//           animation: { scale: [1, 1.05, 1] },
//           onClick: () => navigate('/execution/pending'),
//           clickable: true,
//         },
//         {
//           title: 'Assigned Process',
//           value: formatDisplayValue(assignedProcessCount),
//           icon: ListChecks,
//           color: 'text-orange-600',
//           bgGradient: 'from-orange-500/10 to-orange-600/5',
//           borderColor: 'border-orange-300/50',
//           animation: { x: [0, 2, 0], scale: [1, 1.02, 1] },
//           onClick: () => navigate('/execution/daily'),
//           clickable: true,
//         },
//         {
//           title: 'Daily Operation',
//           value: formatDisplayValue(dailyOperationCount),
//           icon: Activity,
//           color: 'text-cyan-600',
//           bgGradient: 'from-cyan-500/10 to-cyan-600/5',
//           borderColor: 'border-cyan-300/50',
//           animation: { y: [0, -2, 0], scale: [1, 1.02, 1] },
//           onClick: () => navigate('/execution/manage'),
//           clickable: true,
//         },

//       ]
//     : [];

//   const adminOnlyCards = [
//     {
//       title: 'Total Leads',
//       value: formatDisplayValue(totalLeadsForCard),
//       icon: Users,
//       color: 'text-blue-500',
//       bgGradient: 'from-blue-500/10 to-blue-600/5',
//       borderColor: 'border-blue-200/50',
//       animation: { rotate: [0, -5, 0], scale: [1, 1.05, 1] },
//       onClick: isAdminOrSubAdmin ? handleGoToTotalLeads : undefined,
//       clickable: isAdminOrSubAdmin,
//     },
//     ...(isAdminOrSubAdmin
//       ? [
//           {
//             title: 'Drop Leads',
//             value: formatDisplayValue(dropLeads),
//             icon: Hourglass,
//             color: 'text-red-600',
//             bgGradient: 'from-red-500/10 to-red-600/5',
//             borderColor: 'border-red-300/50',
//             onClick: () => navigate('/drop-leads'),
//             clickable: true,
//           },
//           {
//             title: 'Closed Leads',
//             value: formatDisplayValue(closedLeads),
//             icon: UserCheck,
//             color: 'text-green-600',
//             bgGradient: 'from-green-500/10 to-green-600/5',
//             borderColor: 'border-green-300/50',
//             onClick: () => navigate('/closed-leads'),
//             clickable: true,
//           },
//         ]
//       : []),
//   ];

//   // Combine cards based on role
//   let cardData;

// if (isAdminOrSubAdmin) {
//   // ADMIN → all cards
//   cardData = [
//     adminOnlyCards.find((c) => c.title === 'Total Leads'),
//     commonCards.find((c) => c.title === 'Assigned Leads'),
//     commonCards.find((c) => c.title === "Today's Task"),
//     commonCards.find((c) => c.title === 'Upcoming Followups'),
//         ...quotationProjectionCards,
//         adminOnlyCards.find((c) => c.title === 'Closed Leads'),    
//     adminOnlyCards.find((c) => c.title === 'Drop Leads'),
//     ...adminOperationCards,
//   ].filter(Boolean);

// } else if (isProjectManager) {
//   // ✅ PROJECT MANAGER → only 4 operation cards
//   cardData = [...adminOperationCards];

// } else if (shouldShowQuotationProjection) {
//   cardData = [...commonCards, ...quotationProjectionCards];

// } else {
//   cardData = [...commonCards];
// }


//   // Get filtered chart data
//   const filteredCategoryData = filterChartData(categoryChartData, showZeroValues);
//   const filteredBudgetRangeData = filterChartData(budgetRangeChartData, showZeroValues);
//   const filteredReferenceData = filterChartData(referenceChartData, showZeroValues);

//   const hasChartData = chartData && Object.keys(chartData).length > 0;
//   const hasCategoryData = filteredCategoryData && Object.keys(filteredCategoryData).length > 0;
//   const hasBudgetRangeData = filteredBudgetRangeData && Object.keys(filteredBudgetRangeData).length > 0;
//   const hasReferenceData = filteredReferenceData && Object.keys(filteredReferenceData).length > 0;

//   // Loading skeleton
//   if (isLoading) {
//     const totalCards = cardData.length;
//     return (
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
//         {Array.from({ length: totalCards }).map((_, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border border-white/20 shadow-lg rounded-2xl p-6"
//           >
//             <div className="animate-pulse">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="h-6 bg-gray-300 rounded w-24"></div>
//                 <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
//               </div>
//               <div className="h-8 bg-gray-400 rounded w-16"></div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Main Cards Section */}
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
//         <AnimatePresence>
//           {cardData.map((card, index) => (
//             <motion.div
//               key={card.title}
//               onClick={card.clickable ? () => card.onClick?.() : undefined}
//               initial={{ opacity: 0, y: 20, scale: 0.9 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               whileHover={{
//                 y: -4,
//                 transition: { type: 'spring', stiffness: 400, damping: 17 },
//               }}
//               transition={{
//                 delay: index * 0.1,
//                 type: 'spring',
//                 stiffness: 300,
//                 damping: 25,
//               }}
//               className={`
//                 relative p-6 bg-gradient-to-br ${card.bgGradient} 
//                 rounded-2xl shadow-lg border-l-4 ${card.borderColor}
//                 hover:shadow-2xl hover:scale-105 hover:-translate-y-1
//                 transform transition-all duration-300 ease-out
//                 cursor-pointer overflow-hidden
//                 ${card.clickable ? '' : 'cursor-default hover:shadow-lg hover:scale-100 hover:-translate-y-0'}
//               `}
//             >
//               <div className="absolute inset-0 bg-white dark:bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>

//               <div className="relative z-10">
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
//                     {card.title}
//                   </h3>
//                   <motion.div
//                     animate={card.animation}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       repeatType: 'reverse',
//                       ease: 'easeInOut',
//                     }}
//                     className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 shadow-sm ${card.color}`}
//                   >
//                     <card.icon className="w-5 h-5" />
//                   </motion.div>
//                 </div>

//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={card.value}
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 1.2 }}
//                     transition={{ type: 'spring', stiffness: 400, damping: 25 }}
//                     className="text-2xl font-bold text-gray-900 dark:text-white"
//                   >
//                     {card.value === 'N/A' ? (
//                       <motion.span
//                         animate={{ opacity: [0.5, 1, 0.5] }}
//                         transition={{ duration: 1.5, repeat: Infinity }}
//                         className="text-gray-400"
//                       >
//                         {card.value}
//                       </motion.span>
//                     ) : (
//                       card.value
//                     )}
//                   </motion.div>
//                 </AnimatePresence>

//                 <motion.div
//                   className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden"
//                   initial={{ width: 0 }}
//                   animate={{ width: '100%' }}
//                   transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
//                 >
//                   <motion.div
//                     className={`h-full ${card.color.replace('text-', 'bg-')}`}
//                     initial={{ width: 0 }}
//                     animate={{
//                       width: `${Math.min(
//                         ((parseInt(card.value?.replace(/,/g, '') || '0') || 0) / 100) * 100,
//                         100,
//                       )}%`,
//                     }}
//                     transition={{ delay: index * 0.1 + 1, duration: 1, type: 'spring' }}
//                   />
//                 </motion.div>
//               </div>

//               <div
//                 className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.color.replace('text-', 'bg-')} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-300`}
//               />
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>

//       {/* Lead Stage Summary Chart - CLICKABLE */}
// {hasChartData && !isProjectManager && (       
//    <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.8 }}
//           className="mt-10"
//         >
//           <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                   {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) ? 'Active Lead Stage Summary' : 'Your Lead Stage Summary'}
//                 </h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                     ? 'Summary of all lead stages - Click any bar to view leads in that stage'
//                     : 'Summary of your assigned leads by stage - Click any bar to view leads'}
//                 </p>
//               </div>
//               <BarChart3 className="w-5 h-5 text-blue-500" />
//             </div>
//             <div className="cursor-pointer">
//               <Chart options={chartOptions} series={chartSeries} type="bar" height={380} />
//             </div>
//             <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//               <span className="inline-flex items-center">
//                 <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
//                 </svg>
//                 Click on any stage bar to view leads in that stage
//               </span>
//             </div>
//           </div>
//         </motion.div>
//       )}

//       {/* Charts Section */}
// {!isProjectManager && (hasCategoryData || hasReferenceData) && (  
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 1 }}
//           className="mt-10"
//         >
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) ? 'Lead Distribution Analytics' : 'Your Lead Distribution'}
//             </h2>

//             <div className="flex flex-wrap gap-3">
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) && (
//                 <button
//                   onClick={handleToggleZeroValues}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                     showZeroValues
//                       ? 'bg-indigo-500 text-white hover:bg-indigo-600'
//                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
//                   }`}
//                 >
//                   <Filter className="w-4 h-4" />
//                   {showZeroValues ? 'Hide Zero Values' : 'Show Zero Values'}
//                 </button>
//               )}
//               <button
//                 onClick={handleToggleCharts}
//                 className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
//               >
//                 {showCharts ? (
//                   <><PieChart className="w-4 h-4" />Hide Charts</>
//                 ) : (
//                   <><BarChart3 className="w-4 h-4" />Show Charts</>
//                 )}
//               </button>
//             </div>
//           </div>

//           {showCharts && (
//             <div className="grid grid-cols-12 gap-6">
//               {/* CATEGORY CHART */}
//               <div className="col-span-12 xl:col-span-6">
//                 {hasCategoryData ? (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="flex justify-between items-center mb-4">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) ? 'Category-wise Active Leads' : 'Your Leads by Category'}
//                         </h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? `Showing ${Object.keys(filteredCategoryData).length} categories - Click any bar to view leads in that category`
//                             : `Your leads across ${Object.keys(filteredCategoryData).length} categories - Click to view`}
//                         </p>
//                       </div>
//                       <Layers className="w-5 h-5 text-indigo-500" />
//                     </div>
//                     <Chart options={buildBarOptions(filteredCategoryData, 'Category')} series={buildBarSeries(filteredCategoryData)} type="bar" height={350} />
//                     <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//                       <span className="inline-flex items-center">
//                         <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
//                         </svg>
//                         Click on any category bar to view leads in that category
//                       </span>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="text-center py-8">
//                       <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                       <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Category Data</h3>
//                       <p className="text-gray-500 dark:text-gray-400">No leads assigned in any category yet</p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* REFERENCE CHART */}
//               <div className="col-span-12 xl:col-span-6">
//                 {hasReferenceData ? (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="flex justify-between items-center mb-4">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) ? 'Sources-wise Active Leads' : 'Your Leads by Source'}
//                         </h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {ADMIN_AND_SUB_ADMIN_ROLES.includes(role)
//                             ? `Showing ${Object.keys(filteredReferenceData).length} references - Click any bar to view leads from that source`
//                             : `Your leads from ${Object.keys(filteredReferenceData).length} sources - Click to view`}
//                         </p>
//                       </div>
//                       <Users className="w-5 h-5 text-green-500" />
//                     </div>
//                     <Chart options={buildBarOptions(filteredReferenceData, 'Reference')} series={buildBarSeries(filteredReferenceData)} type="bar" height={350} />
//                     <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//                       <span className="inline-flex items-center">
//                         <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
//                         </svg>
//                         Click on any source bar to view leads from that source
//                       </span>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="text-center py-8">
//                       <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                       <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Reference Data</h3>
//                       <p className="text-gray-500 dark:text-gray-400">No leads assigned from any reference yet</p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* BUDGET RANGE BAR CHART – ADMIN / SUB-ADMIN ONLY */}
//               {ADMIN_AND_SUB_ADMIN_ROLES.includes(role) && showCharts && hasBudgetRangeData && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 1.3 }}
//                   className="col-span-12 mt-6"
//                 >
//                   <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     <div className="flex justify-between items-center mb-4">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Budget Range-wise Leads</h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           Distribution of leads by budget range - Click any bar to view leads in that range
//                         </p>
//                       </div>
//                       <BarChart3 className="w-5 h-5 text-emerald-500" />
//                     </div>
//                     <Chart options={buildBarOptions(filteredBudgetRangeData, 'Budget')} series={buildBarSeries(filteredBudgetRangeData)} type="bar" height={360} />
//                     <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
//                       <span className="inline-flex items-center">
//                         <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
//                         </svg>
//                         Click on any budget range bar to view leads in that range
//                       </span>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </div>
//           )}
//         </motion.div>
//       )}
//     </>
//   );
// };

// export default ECommerce;


// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Users,
//   UserCheck,
//   ClipboardList,
//   CalendarCheck,
//   Layers,
//   Package,
//   Megaphone,
//   Hourglass,
//   BarChart3,
//   PieChart,
//   Filter,
//   CheckSquare,
//   Activity,
//   PlayCircle,
//   Settings,
//   ListChecks,
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import CardDataStats from '../../components/CardDataStats';
// import { BASE_URL } from '../../../public/config.js';
// import { useNavigate } from 'react-router-dom';
// import Chart from 'react-apexcharts';

// // Display configuration
// const DISPLAY_CONFIG = {
//   naValues: [
//     '',
//     null,
//     undefined,
//     'null',
//     'undefined',
//     'not available',
//     'na',
//     'n/a',
//     'notapplicable',
//   ],
//   othersValues: ['others', 'other', 'misc', 'miscellaneous'],
//   specialColors: {
//     'N/A': '#CBD5E1',
//     Others: '#94A3B8',
//     Unknown: '#64748B',
//   },
// };

// const ECommerce: React.FC = () => {
//   // State declarations
//   const [totalLeads, setTotalLeads] = useState<number | null>(null);
//   const [assignedLeads, setAssignedLeads] = useState<number | null>(null);
//   const [totalfollowups, setfollowups] = useState<number | null>(null);
//   const [meetingScheduled, setMeetingScheduled] = useState<number | null>(null);
//   const [totalProducts, setTotalProducts] = useState<number | null>(null);
//   const [totalcategory, settotalcategory] = useState<number | null>(null);
//   const [convertedLeads, setConvertedLeads] = useState<number | null>(null);
//   const [pendingLeads, setpendingLeads] = useState<number | null>(null);
//   const [totalCampaigns, setTotalCampaigns] = useState(0);
//   const [inactiveLeads, setInactiveLeads] = useState(0);
//   const [role, setRole] = useState<string>('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const [dropLeads, setDropLeads] = useState<number | null>(null);
//   const [closedLeads, setClosedLeads] = useState<number | null>(null);
//   const [chartData, setChartData] = useState<Record<string, number> | null>(null);
//   const [todaysAssignedLeads, setTodaysAssignedLeads] = useState<number | null>(null);
//   const [upcomingAssigned, setUpcomingAssigned] = useState<number | null>(null);
//   const [categoryChartData, setCategoryChartData] = useState<Record<string, number> | null>(null);
//   const [referenceChartData, setReferenceChartData] = useState<Record<string, number> | null>(null);
//   const [showCharts, setShowCharts] = useState(true);
//   const [showZeroValues, setShowZeroValues] = useState(true);
//   const [quotationPending, setQuotationPending] = useState<number | null>(null);
//   const [quotationFollowup, setQuotationFollowup] = useState<number | null>(null);
//   const [demoLeads, setDemoLeads] = useState<number | null>(null);
//   const [projectionLeads, setProjectionLeads] = useState<number | null>(null);
//   const [budgetRangeChartData, setBudgetRangeChartData] = useState<Record<string, number> | null>(null);
//   const [todaysMissedCombined, setTodaysMissedCombined] = useState<number | null>(null);

//   const [showAttendanceModal, setShowAttendanceModal] = useState(false);
// const [attendanceLoading, setAttendanceLoading] = useState(true);
// const [attendanceMarked, setAttendanceMarked] = useState(false);


// useEffect(() => {
//   const checkAttendance = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}api/attendance/status`, {
//         credentials: 'include',
//       });

//       const data = await res.json();

//       // ❌ NOT CHECKED IN → SHOW MODAL
//       if (!data.checkedIn) {
//         setShowAttendanceModal(true);
//       }

//     } catch (err) {
//       console.error("Attendance check failed");
//     } finally {
//       setAttendanceLoading(false);
//     }
//   };

//   checkAttendance();
// }, []);

//   const ADMIN_LIKE_ROLES = ['admin', 'sub_admin'];
//   const ADMIN_AND_SUB_ADMIN_ROLES = ['admin', 'sub_admin'];

//   const isProjectManager = role === 'project_manager';

//   const TELECALLER_LIKE_ROLES = [
//     'tele-caller',
//     'tele_caller',
//     'digital-marketing',
//     'digital_marketing',
//     'field-marketing-executive',
//     'field_marketing_executive',
//     'tech-sale-sound-engineer',
//     'tech_sale_sound_engineer',
//     'junior-autocad-designer',
//     'junior_autocad_designer',
//     'senior-autocad-designer',
//     'senior_autocad_designer',
//     'technical_head',
//   ];

//   const ROLES_WITH_QUOTATION_PROJECTION = [
//     'admin',
//     'sub_admin',
//     'tech-sale-sound-engineer',
//     'tech_sale_sound_engineer',
//   ];

//   const isAdminOrSubAdmin = ADMIN_AND_SUB_ADMIN_ROLES.includes(role);
//   const totalLeadsForCard = totalLeads;

//   const shouldShowQuotationProjection = ROLES_WITH_QUOTATION_PROJECTION.includes(role);

//   // Lead stage colors
//   const leadStageColors: Record<string, string> = {
//     'Fresh Lead': '#E5E7EB',
//     'Cold Lead': '#9CA3AF',
//     'On Hold': '#FDE68A',
//     'Positive Lead': '#93C5FD',
//     'Pre Site Visit': '#C4B5FD',
//     Demo: '#F9A8D4',
//     'Quotation Pending': '#F59E0B',
//     'Post Site Visit': '#6D28D9',
//     'Quotation Follow-up': '#92400E',
//     'Projection List': '#86EFAC',
//     Drop: '#EF4444',
//     'Closed Deal': '#166534',
//   };

//   const formatDisplayValue = useCallback((value: any): string => {
//     if (value === null || value === undefined || value === '') {
//       return 'N/A';
//     }
//     if (typeof value === 'string') {
//       const trimmed = value.trim();
//       if (trimmed === '' || DISPLAY_CONFIG.naValues.includes(trimmed.toLowerCase())) {
//         return 'N/A';
//       }
//       const lowerTrimmed = trimmed.toLowerCase();
//       if (lowerTrimmed === 'other' || lowerTrimmed === 'others') {
//         return 'Others';
//       }
//       return trimmed;
//     }
//     if (typeof value === 'number') {
//       return value.toLocaleString();
//     }
//     return String(value);
//   }, []);

//   const normalizeChartData = useCallback(
//     (data: Record<string, number> | null) => {
//       if (!data) return {};
//       const normalized: Record<string, number> = {};
//       Object.entries(data).forEach(([key, value]) => {
//         if (key?.toLowerCase?.().includes('not specified')) return;
//         const cleanKey = formatDisplayValue(key);
//         if (cleanKey === 'N/A') return;
//         normalized[cleanKey] = (normalized[cleanKey] || 0) + value;
//       });
//       return normalized;
//     },
//     [formatDisplayValue],
//   );

//   const filterChartData = useCallback(
//     (data: Record<string, number> | null, showZero: boolean) => {
//       if (!data) return null;
//       const normalized = normalizeChartData(data);
//       if (!showZero) {
//         const filtered: Record<string, number> = {};
//         Object.entries(normalized).forEach(([key, value]) => {
//           if (value > 0) {
//             filtered[key] = value;
//           }
//         });
//         return filtered;
//       }
//       return normalized;
//     },
//     [normalizeChartData],
//   );

//   // Authentication
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch(`${BASE_URL}auth/check-session`, {
//           credentials: 'include',
//         });
//         const data = await response.json();
//         if (data.isAuthenticated) {
//           setIsAuthenticated(true);
//           setRole(data.role);
//         } else {
//           setIsAuthenticated(false);
//           navigate('/login');
//         }
//       } catch (err) {
//         console.error('Error checking session:', err);
//         setIsAuthenticated(false);
//       }
//     };
//     checkAuth();
//   }, [navigate]);

//   // Fetch dashboard data
//   useEffect(() => {
//     if (!isAuthenticated) return;

//     const fetchDashboardData = async () => {
//       try {
//         setIsLoading(true);

//         const fetchWithSession = (url: string, options: RequestInit = {}) =>
//           fetch(url, { ...options, credentials: 'include' });

//         // FIRST: Load all card counts immediately (fast) - DON'T AWAIT
//         // Use Promise.allSettled for parallel execution without blocking
//         Promise.allSettled([
//           // Lead counts API
//           fetchWithSession(`${BASE_URL}api/dashboard/dashboard/lead-counts`)
//             .then(res => res.json())
//             .then(data => {
//               if (data.success) {
//                 setTotalLeads(data.total || 0);
//                 setAssignedLeads(data.assigned || 0);
//                 setDropLeads(data.drop || 0);
//                 setClosedLeads(data.closed || 0);
//                 setProjectionLeads(data.projection || 0);
//                 setQuotationPending(data.quotation_pending || 0);
//                 setTodaysAssignedLeads(data.today || 0);
//                 setfollowups(data.missed || 0);
//                 setUpcomingAssigned(data.upcoming || 0);
//                 setTodaysMissedCombined(data.today_missed_total || 0);
//               }
//             }),
//         ]).then(() => {
//           // CARDS ARE NOW LOADED - HIDE LOADING IMMEDIATELY
//           setIsLoading(false);
//         });

//         // SECOND: Load chart data in background (slow) - don't block UI
//         // These will continue loading after cards are shown
//         setTimeout(() => {
//           Promise.allSettled([
//             // Lead Stage Summary
//             fetchWithSession(`${BASE_URL}api/dashboard/lead-summary`)
//               .then(res => res.json())
//               .then(data => setChartData(normalizeChartData(data.summary || {}))),
            
//             // Category Summary
//             fetchWithSession(`${BASE_URL}api/dashboard/category-summary`)
//               .then(res => res.json())
//               .then(data => setCategoryChartData(normalizeChartData(data.summary || {}))),
            
//             // Reference Summary
//             fetchWithSession(`${BASE_URL}api/dashboard/reference-summary`)
//               .then(res => res.json())
//               .then(data => setReferenceChartData(normalizeChartData(data.summary || {}))),
            
//             // Budget Range Summary (if admin)
//             (ADMIN_AND_SUB_ADMIN_ROLES.includes(role) || isProjectManager)
//               ? fetchWithSession(`${BASE_URL}api/dashboard/budget-range-summary`)
//                   .then(res => res.json())
//                   .then(data => setBudgetRangeChartData(normalizeChartData(data.summary || {})))
//               : Promise.resolve(),
//           ]).catch(err => console.error('Error loading chart data:', err));
//         }, 100); // Small delay to ensure UI renders first

//       } catch (err) {
//         console.error('Error fetching dashboard data:', err);
//         setIsLoading(false); // Ensure loading is hidden even on error
//       }
//     };

//     fetchDashboardData();
//   }, [isAuthenticated, role, normalizeChartData, shouldShowQuotationProjection]);

//   const handleGoToTotalLeads = (stage?: string) => {
//     if (!stage) { navigate('/master-data'); return; }
//     navigate('/master-data', { state: { lead_stage: formatDisplayValue(stage), from_dashboard: true } });
//   };

//   const handleGoToTodaysMissedCombined = () => navigate('/todays-todo');
//   const handleGoToAssignedLeads = () => navigate('/call');

//   // Card data configuration
//   const commonCards = [
//     {
//       title: 'Assigned Leads',
//       value: formatDisplayValue(assignedLeads),
//       icon: UserCheck,
//       color: 'text-green-500',
//       bgGradient: 'from-green-500/10 to-green-600/5',
//       borderColor: 'border-green-200/50',
//       animation: { y: [0, -2, 0], scale: [1, 1.02, 1] },
//       onClick: handleGoToAssignedLeads,
//       clickable: true,
//     },
//     {
//       title: "Today's Task",
//       value: formatDisplayValue(todaysMissedCombined),
//       icon: ClipboardList,
//       color: 'text-yellow-500',
//       bgGradient: 'from-yellow-500/10 to-yellow-600/5',
//       borderColor: 'border-yellow-200/50',
//       animation: { x: [0, 2, 0], scale: [1, 1.03, 1] },
//       onClick: handleGoToTodaysMissedCombined,
//       clickable: true,
//     },
//     {
//       title: 'Upcoming Followups',
//       value: formatDisplayValue(upcomingAssigned),
//       icon: CalendarCheck,
//       color: 'text-purple-500',
//       bgGradient: 'from-purple-500/10 to-purple-600/5',
//       borderColor: 'border-purple-200/50',
//       animation: { rotate: [0, 180, 0], scale: [1, 1.02, 1] },
//       onClick: () => navigate('/upcoming-followups'),
//       clickable: true,
//     },
//   ];

//   const quotationProjectionCards = shouldShowQuotationProjection
//     ? [
//         {
//           title: 'Quotation Pending',
//           value: formatDisplayValue(quotationPending),
//           icon: Hourglass,
//           color: 'text-amber-600',
//           bgGradient: 'from-amber-500/10 to-amber-600/5',
//           borderColor: 'border-amber-300/50',
//           onClick: () => navigate('/quatation-pending'),
//           clickable: true,
//         },
//         {
//           title: 'Projection List',
//           value: formatDisplayValue(projectionLeads),
//           icon: BarChart3,
//           color: 'text-green-600',
//           bgGradient: 'from-green-500/10 to-green-600/5',
//           borderColor: 'border-green-300/50',
//           onClick: () => handleGoToTotalLeads('Projection List'),
//           clickable: true,
//         },
//       ]
//     : [];

//   const adminOnlyCards = [
//     {
//       title: 'Total Leads',
//       value: formatDisplayValue(totalLeadsForCard),
//       icon: Users,
//       color: 'text-blue-500',
//       bgGradient: 'from-blue-500/10 to-blue-600/5',
//       borderColor: 'border-blue-200/50',
//       animation: { rotate: [0, -5, 0], scale: [1, 1.05, 1] },
//       onClick: isAdminOrSubAdmin ? handleGoToTotalLeads : undefined,
//       clickable: isAdminOrSubAdmin,
//     },
//     ...(isAdminOrSubAdmin
//       ? [
//           {
//             title: 'Drop Leads',
//             value: formatDisplayValue(dropLeads),
//             icon: Hourglass,
//             color: 'text-red-600',
//             bgGradient: 'from-red-500/10 to-red-600/5',
//             borderColor: 'border-red-300/50',
//             onClick: () => navigate('/drop-leads'),
//             clickable: true,
//           },
//           {
//             title: 'Closed Leads',
//             value: formatDisplayValue(closedLeads),
//             icon: UserCheck,
//             color: 'text-green-600',
//             bgGradient: 'from-green-500/10 to-green-600/5',
//             borderColor: 'border-green-300/50',
//             onClick: () => navigate('/closed-leads'),
//             clickable: true,
//           },
//         ]
//       : []),
//   ];

//   // Combine cards based on role
//   let cardData;

//   if (isAdminOrSubAdmin) {
//     // ADMIN → all cards
//     cardData = [
//       adminOnlyCards.find((c) => c.title === 'Total Leads'),
//       commonCards.find((c) => c.title === 'Assigned Leads'),
//       commonCards.find((c) => c.title === "Today's Task"),
//       commonCards.find((c) => c.title === 'Upcoming Followups'),
//       ...quotationProjectionCards,
//       adminOnlyCards.find((c) => c.title === 'Closed Leads'),    
//       adminOnlyCards.find((c) => c.title === 'Drop Leads'),
//     ].filter(Boolean);

//   } else if (isProjectManager) {
//     // PROJECT MANAGER → common cards
//     cardData = [...commonCards];

//   } else if (shouldShowQuotationProjection) {
//     cardData = [...commonCards, ...quotationProjectionCards];

//   } else {
//     cardData = [...commonCards];
//   }

//   // Loading skeleton
//   if (isLoading) {
//     const totalCards = cardData.length;
//     return (
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
//         {Array.from({ length: totalCards }).map((_, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border border-white/20 shadow-lg rounded-2xl p-6"
//           >
//             <div className="animate-pulse">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="h-6 bg-gray-300 rounded w-24"></div>
//                 <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
//               </div>
//               <div className="h-8 bg-gray-400 rounded w-16"></div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Main Cards Section - ONLY CARDS, NO CHARTS */}
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
//         <AnimatePresence>
//           {cardData.map((card, index) => (
//             <motion.div
//               key={card.title}
//               onClick={card.clickable ? () => card.onClick?.() : undefined}
//               initial={{ opacity: 0, y: 20, scale: 0.9 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               whileHover={{
//                 y: -4,
//                 transition: { type: 'spring', stiffness: 400, damping: 17 },
//               }}
//               transition={{
//                 delay: index * 0.1,
//                 type: 'spring',
//                 stiffness: 300,
//                 damping: 25,
//               }}
//               className={`
//                 relative p-6 bg-gradient-to-br ${card.bgGradient} 
//                 rounded-2xl shadow-lg border-l-4 ${card.borderColor}
//                 hover:shadow-2xl hover:scale-105 hover:-translate-y-1
//                 transform transition-all duration-300 ease-out
//                 cursor-pointer overflow-hidden
//                 ${card.clickable ? '' : 'cursor-default hover:shadow-lg hover:scale-100 hover:-translate-y-0'}
//               `}
//             >
//               <div className="absolute inset-0 bg-white dark:bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>

//               <div className="relative z-10">
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
//                     {card.title}
//                   </h3>
//                   <motion.div
//                     animate={card.animation}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       repeatType: 'reverse',
//                       ease: 'easeInOut',
//                     }}
//                     className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 shadow-sm ${card.color}`}
//                   >
//                     <card.icon className="w-5 h-5" />
//                   </motion.div>
//                 </div>

//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={card.value}
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 1.2 }}
//                     transition={{ type: 'spring', stiffness: 400, damping: 25 }}
//                     className="text-2xl font-bold text-gray-900 dark:text-white"
//                   >
//                     {card.value === 'N/A' ? (
//                       <motion.span
//                         animate={{ opacity: [0.5, 1, 0.5] }}
//                         transition={{ duration: 1.5, repeat: Infinity }}
//                         className="text-gray-400"
//                       >
//                         {card.value}
//                       </motion.span>
//                     ) : (
//                       card.value
//                     )}
//                   </motion.div>
//                 </AnimatePresence>

//                 <motion.div
//                   className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden"
//                   initial={{ width: 0 }}
//                   animate={{ width: '100%' }}
//                   transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
//                 >
//                   <motion.div
//                     className={`h-full ${card.color.replace('text-', 'bg-')}`}
//                     initial={{ width: 0 }}
//                     animate={{
//                       width: `${Math.min(
//                         ((parseInt(card.value?.replace(/,/g, '') || '0') || 0) / 100) * 100,
//                         100,
//                       )}%`,
//                     }}
//                     transition={{ delay: index * 0.1 + 1, duration: 1, type: 'spring' }}
//                   />
//                 </motion.div>
//               </div>

//               <div
//                 className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.color.replace('text-', 'bg-')} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-300`}
//               />
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>

//           {showAttendanceModal && (
//   <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50">
//     <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md text-center">
      
//       <h2 className="text-xl font-bold mb-4">
//         Mark Your Attendance
//       </h2>

//       <p className="mb-6 text-gray-600">
//         Please mark your attendance to continue
//       </p>

//       <button
//         onClick={async () => {
//           try {
//             const res = await fetch(`${BASE_URL}api/attendance/check-in`, {
//               method: 'POST',
//               credentials: 'include',
//             });

//             const data = await res.json();

//             if (data.success) {
//               alert("Checked In Successfully");
//               setShowAttendanceModal(false);

//               // 🔥 optional: refresh page or update state
//               window.location.reload();

//             } else {
//               alert(data.message);
//             }
//           } catch (err) {
//             alert("Check-in failed");
//           }
//         }}
//         className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
//       >
//         Login (Mark Attendance)
//       </button>

//     </div>
//   </div>
// )}
//     </>
//   );
// };

// export default ECommerce;


import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  ClipboardList,
  CalendarCheck,
  Layers,
  Package,
  Megaphone,
  Hourglass,
  BarChart3,
  PieChart,
  Filter,
  CheckSquare,
  Activity,
  PlayCircle,
  Settings,
  ListChecks,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CardDataStats from '../../components/CardDataStats';
import { BASE_URL } from '../../../public/config.js';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Display configuration
const DISPLAY_CONFIG = {
  naValues: [
    '',
    null,
    undefined,
    'null',
    'undefined',
    'not available',
    'na',
    'n/a',
    'notapplicable',
  ],
  othersValues: ['others', 'other', 'misc', 'miscellaneous'],
  specialColors: {
    'N/A': '#CBD5E1',
    Others: '#94A3B8',
    Unknown: '#64748B',
  },
};

const ECommerce: React.FC = () => {
  // State declarations
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [assignedLeads, setAssignedLeads] = useState<number | null>(null);
  const [totalfollowups, setfollowups] = useState<number | null>(null);
  const [meetingScheduled, setMeetingScheduled] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalcategory, settotalcategory] = useState<number | null>(null);
  const [convertedLeads, setConvertedLeads] = useState<number | null>(null);
  const [pendingLeads, setpendingLeads] = useState<number | null>(null);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [inactiveLeads, setInactiveLeads] = useState(0);
  const [role, setRole] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [dropLeads, setDropLeads] = useState<number | null>(null);
  const [closedLeads, setClosedLeads] = useState<number | null>(null);
  const [chartData, setChartData] = useState<Record<string, number> | null>(null);
  const [todaysAssignedLeads, setTodaysAssignedLeads] = useState<number | null>(null);
  const [upcomingAssigned, setUpcomingAssigned] = useState<number | null>(null);
  const [categoryChartData, setCategoryChartData] = useState<Record<string, number> | null>(null);
  const [referenceChartData, setReferenceChartData] = useState<Record<string, number> | null>(null);
  const [showCharts, setShowCharts] = useState(true);
  const [showZeroValues, setShowZeroValues] = useState(true);
  const [quotationPending, setQuotationPending] = useState<number | null>(null);
  const [quotationFollowup, setQuotationFollowup] = useState<number | null>(null);
  const [demoLeads, setDemoLeads] = useState<number | null>(null);
  const [projectionLeads, setProjectionLeads] = useState<number | null>(null);
  const [budgetRangeChartData, setBudgetRangeChartData] = useState<Record<string, number> | null>(null);
  const [todaysMissedCombined, setTodaysMissedCombined] = useState<number | null>(null);

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [attendanceCheckCompleted, setAttendanceCheckCompleted] = useState(false);

  const ADMIN_LIKE_ROLES = ['admin', 'sub_admin'];
  const ADMIN_AND_SUB_ADMIN_ROLES = ['admin', 'sub_admin'];

  const isProjectManager = role === 'project_manager';
  const isAdmin = ADMIN_AND_SUB_ADMIN_ROLES.includes(role);

  const TELECALLER_LIKE_ROLES = [
    'tele-caller',
    'tele_caller',
    'digital-marketing',
    'digital_marketing',
    'field-marketing-executive',
    'field_marketing_executive',
    'tech-sale-sound-engineer',
    'tech_sale_sound_engineer',
    'junior-autocad-designer',
    'junior_autocad_designer',
    'senior-autocad-designer',
    'senior_autocad_designer',
    'technical_head',
  ];

  const ROLES_WITH_QUOTATION_PROJECTION = [
    'admin',
    'sub_admin',
    'tech-sale-sound-engineer',
    'tech_sale_sound_engineer',
  ];

  const isAdminOrSubAdmin = ADMIN_AND_SUB_ADMIN_ROLES.includes(role);
  const totalLeadsForCard = totalLeads;

  const shouldShowQuotationProjection = ROLES_WITH_QUOTATION_PROJECTION.includes(role);

  // Lead stage colors
  const leadStageColors: Record<string, string> = {
    'Fresh Lead': '#E5E7EB',
    'Cold Lead': '#9CA3AF',
    'On Hold': '#FDE68A',
    'Positive Lead': '#93C5FD',
    'Pre Site Visit': '#C4B5FD',
    Demo: '#F9A8D4',
    'Quotation Pending': '#F59E0B',
    'Post Site Visit': '#6D28D9',
    'Quotation Follow-up': '#92400E',
    'Projection List': '#86EFAC',
    Drop: '#EF4444',
    'Closed Deal': '#166534',
  };

  const formatDisplayValue = useCallback((value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || DISPLAY_CONFIG.naValues.includes(trimmed.toLowerCase())) {
        return 'N/A';
      }
      const lowerTrimmed = trimmed.toLowerCase();
      if (lowerTrimmed === 'other' || lowerTrimmed === 'others') {
        return 'Others';
      }
      return trimmed;
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  }, []);

  const normalizeChartData = useCallback(
    (data: Record<string, number> | null) => {
      if (!data) return {};
      const normalized: Record<string, number> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key?.toLowerCase?.().includes('not specified')) return;
        const cleanKey = formatDisplayValue(key);
        if (cleanKey === 'N/A') return;
        normalized[cleanKey] = (normalized[cleanKey] || 0) + value;
      });
      return normalized;
    },
    [formatDisplayValue],
  );

  const filterChartData = useCallback(
    (data: Record<string, number> | null, showZero: boolean) => {
      if (!data) return null;
      const normalized = normalizeChartData(data);
      if (!showZero) {
        const filtered: Record<string, number> = {};
        Object.entries(normalized).forEach(([key, value]) => {
          if (value > 0) {
            filtered[key] = value;
          }
        });
        return filtered;
      }
      return normalized;
    },
    [normalizeChartData],
  );

  // Authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BASE_URL}auth/check-session`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          setRole(data.role);
        } else {
          setIsAuthenticated(false);
          navigate('/login');
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // ATTENDANCE CHECK - COMPLETELY SKIP FOR ADMIN
  useEffect(() => {
    // Don't check attendance for admin users at all
    if (isAdmin) {
      console.log('Admin user - attendance check skipped completely');
      setAttendanceLoading(false);
      setAttendanceCheckCompleted(true);
      setShowAttendanceModal(false);
      return;
    }

    // For non-admin users, check attendance
    const checkAttendance = async () => {
      if (attendanceMarked || attendanceCheckCompleted) return;
      
      try {
        console.log('Checking attendance for role:', role);
        const res = await fetch(`${BASE_URL}api/attendance/status`, {
          credentials: 'include',
        });

        console.log('Attendance API response status:', res.status);
        
        // Handle different status codes
        if (res.status === 404) {
          // Attendance endpoint not found - maybe feature not enabled
          console.log('Attendance API not available');
          setShowAttendanceModal(false);
          setAttendanceMarked(true);
          setAttendanceCheckCompleted(true);
          setAttendanceLoading(false);
          return;
        }
        
        if (!res.ok) {
          console.error('Attendance API error:', res.status);
          setShowAttendanceModal(false);
          setAttendanceCheckCompleted(true);
          setAttendanceLoading(false);
          return;
        }

        const data = await res.json();
        console.log('Attendance data:', data);
        
      if (!data.checkedIn && !attendanceMarked) {
  setShowAttendanceModal(true);
}

         else {
          setShowAttendanceModal(false);
          setAttendanceMarked(true);
        }

      } catch (err) {
        console.error("Attendance check failed:", err);
        // Don't show modal on error for non-admin users
        setShowAttendanceModal(false);
        setAttendanceMarked(true);
      } finally {
        setAttendanceLoading(false);
        setAttendanceCheckCompleted(true);
      }
    };

    // Only check attendance if authenticated and role is set and user is not admin
    if (isAuthenticated && role && !isAdmin) {
      checkAttendance();
    }
  }, [isAuthenticated, role, isAdmin, attendanceMarked, attendanceCheckCompleted]);

  // Fetch dashboard data
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const fetchWithSession = (url: string, options: RequestInit = {}) =>
          fetch(url, { ...options, credentials: 'include' });

        // FIRST: Load all card counts immediately (fast) - DON'T AWAIT
        // Use Promise.allSettled for parallel execution without blocking
        Promise.allSettled([
          // Lead counts API
          fetchWithSession(`${BASE_URL}api/dashboard/dashboard/lead-counts`)
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setTotalLeads(data.total || 0);
                setAssignedLeads(data.assigned || 0);
                setDropLeads(data.drop || 0);
                setClosedLeads(data.closed || 0);
                setProjectionLeads(data.projection || 0);
                setQuotationPending(data.quotation_pending || 0);
                setTodaysAssignedLeads(data.today || 0);
                setfollowups(data.missed || 0);
                setUpcomingAssigned(data.upcoming || 0);
                setTodaysMissedCombined(data.today_missed_total || 0);
              }
            }),
        ]).then(() => {
          // CARDS ARE NOW LOADED - HIDE LOADING IMMEDIATELY
          setIsLoading(false);
        });

        // SECOND: Load chart data in background (slow) - don't block UI
        // These will continue loading after cards are shown
        setTimeout(() => {
          Promise.allSettled([
            // Lead Stage Summary
            fetchWithSession(`${BASE_URL}api/dashboard/lead-summary`)
              .then(res => res.json())
              .then(data => setChartData(normalizeChartData(data.summary || {}))),
            
            // Category Summary
            fetchWithSession(`${BASE_URL}api/dashboard/category-summary`)
              .then(res => res.json())
              .then(data => setCategoryChartData(normalizeChartData(data.summary || {}))),
            
            // Reference Summary
            fetchWithSession(`${BASE_URL}api/dashboard/reference-summary`)
              .then(res => res.json())
              .then(data => setReferenceChartData(normalizeChartData(data.summary || {}))),
            
            // Budget Range Summary (if admin)
            (ADMIN_AND_SUB_ADMIN_ROLES.includes(role) || isProjectManager)
              ? fetchWithSession(`${BASE_URL}api/dashboard/budget-range-summary`)
                  .then(res => res.json())
                  .then(data => setBudgetRangeChartData(normalizeChartData(data.summary || {})))
              : Promise.resolve(),
          ]).catch(err => console.error('Error loading chart data:', err));
        }, 100); // Small delay to ensure UI renders first

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setIsLoading(false); // Ensure loading is hidden even on error
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, role, normalizeChartData, shouldShowQuotationProjection]);

  const handleGoToTotalLeads = (stage?: string) => {
    if (!stage) { navigate('/master-data'); return; }
    navigate('/master-data', { state: { lead_stage: formatDisplayValue(stage), from_dashboard: true } });
  };

  const handleGoToTodaysMissedCombined = () => navigate('/todays-todo');
  const handleGoToAssignedLeads = () => navigate('/call');

  // Card data configuration
  const commonCards = [
    {
      title: 'Assigned Leads',
      value: formatDisplayValue(assignedLeads),
      icon: UserCheck,
      color: 'text-green-500',
      bgGradient: 'from-green-500/10 to-green-600/5',
      borderColor: 'border-green-200/50',
      animation: { y: [0, -2, 0], scale: [1, 1.02, 1] },
      onClick: handleGoToAssignedLeads,
      clickable: true,
    },
    {
      title: "Today's Task",
      value: formatDisplayValue(todaysMissedCombined),
      icon: ClipboardList,
      color: 'text-yellow-500',
      bgGradient: 'from-yellow-500/10 to-yellow-600/5',
      borderColor: 'border-yellow-200/50',
      animation: { x: [0, 2, 0], scale: [1, 1.03, 1] },
      onClick: handleGoToTodaysMissedCombined,
      clickable: true,
    },
    {
      title: 'Upcoming Followups',
      value: formatDisplayValue(upcomingAssigned),
      icon: CalendarCheck,
      color: 'text-purple-500',
      bgGradient: 'from-purple-500/10 to-purple-600/5',
      borderColor: 'border-purple-200/50',
      animation: { rotate: [0, 180, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/upcoming-followups'),
      clickable: true,
    },
  ];

  const quotationProjectionCards = shouldShowQuotationProjection
    ? [
        {
          title: 'Quotation Pending',
          value: formatDisplayValue(quotationPending),
          icon: Hourglass,
          color: 'text-amber-600',
          bgGradient: 'from-amber-500/10 to-amber-600/5',
          borderColor: 'border-amber-300/50',
          onClick: () => navigate('/quatation-pending'),
          clickable: true,
        },
        {
          title: 'Projection List',
          value: formatDisplayValue(projectionLeads),
          icon: BarChart3,
          color: 'text-green-600',
          bgGradient: 'from-green-500/10 to-green-600/5',
          borderColor: 'border-green-300/50',
          onClick: () => handleGoToTotalLeads('Projection List'),
          clickable: true,
        },
      ]
    : [];

  const adminOnlyCards = [
    {
      title: 'Total Leads',
      value: formatDisplayValue(totalLeadsForCard),
      icon: Users,
      color: 'text-blue-500',
      bgGradient: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-200/50',
      animation: { rotate: [0, -5, 0], scale: [1, 1.05, 1] },
      onClick: isAdminOrSubAdmin ? handleGoToTotalLeads : undefined,
      clickable: isAdminOrSubAdmin,
    },
    ...(isAdminOrSubAdmin
      ? [
          {
            title: 'Drop Leads',
            value: formatDisplayValue(dropLeads),
            icon: Hourglass,
            color: 'text-red-600',
            bgGradient: 'from-red-500/10 to-red-600/5',
            borderColor: 'border-red-300/50',
            onClick: () => navigate('/drop-leads'),
            clickable: true,
          },
          {
            title: 'Closed Leads',
            value: formatDisplayValue(closedLeads),
            icon: UserCheck,
            color: 'text-green-600',
            bgGradient: 'from-green-500/10 to-green-600/5',
            borderColor: 'border-green-300/50',
            onClick: () => navigate('/closed-leads'),
            clickable: true,
          },
        ]
      : []),
  ];

  // Combine cards based on role
  let cardData;

  if (isAdminOrSubAdmin) {
    // ADMIN → all cards
    cardData = [
      adminOnlyCards.find((c) => c.title === 'Total Leads'),
      commonCards.find((c) => c.title === 'Assigned Leads'),
      commonCards.find((c) => c.title === "Today's Task"),
      commonCards.find((c) => c.title === 'Upcoming Followups'),
      ...quotationProjectionCards,
      adminOnlyCards.find((c) => c.title === 'Closed Leads'),    
      adminOnlyCards.find((c) => c.title === 'Drop Leads'),
    ].filter(Boolean);

  } else if (isProjectManager) {
    // PROJECT MANAGER → common cards
    cardData = [...commonCards];

  } else if (shouldShowQuotationProjection) {
    cardData = [...commonCards, ...quotationProjectionCards];

  } else {
    cardData = [...commonCards];
  }

  // Loading skeleton
  if (isLoading) {
    const totalCards = cardData.length;
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
        {Array.from({ length: totalCards }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border border-white/20 shadow-lg rounded-2xl p-6"
          >
            <div className="animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-300 rounded w-24"></div>
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              </div>
              <div className="h-8 bg-gray-400 rounded w-16"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Cards Section - ONLY CARDS, NO CHARTS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
        <AnimatePresence>
          {cardData.map((card, index) => (
            <motion.div
              key={card.title}
              onClick={card.clickable ? () => card.onClick?.() : undefined}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{
                y: -4,
                transition: { type: 'spring', stiffness: 400, damping: 17 },
              }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className={`
                relative p-6 bg-gradient-to-br ${card.bgGradient} 
                rounded-2xl shadow-lg border-l-4 ${card.borderColor}
                hover:shadow-2xl hover:scale-105 hover:-translate-y-1
                transform transition-all duration-300 ease-out
                cursor-pointer overflow-hidden
                ${card.clickable ? '' : 'cursor-default hover:shadow-lg hover:scale-100 hover:-translate-y-0'}
              `}
            >
              <div className="absolute inset-0 bg-white dark:bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
                    {card.title}
                  </h3>
                  <motion.div
                    animate={card.animation}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }}
                    className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 shadow-sm ${card.color}`}
                  >
                    <card.icon className="w-5 h-5" />
                  </motion.div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={card.value}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {card.value === 'N/A' ? (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-gray-400"
                      >
                        {card.value}
                      </motion.span>
                    ) : (
                      card.value
                    )}
                  </motion.div>
                </AnimatePresence>

                <motion.div
                  className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                >
                  <motion.div
                    className={`h-full ${card.color.replace('text-', 'bg-')}`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        ((parseInt(card.value?.replace(/,/g, '') || '0') || 0) / 100) * 100,
                        100,
                      )}%`,
                    }}
                    transition={{ delay: index * 0.1 + 1, duration: 1, type: 'spring' }}
                  />
                </motion.div>
              </div>

              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.color.replace('text-', 'bg-')} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-300`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Attendance Modal - ONLY SHOW FOR NON-ADMIN USERS */}
      {showAttendanceModal && !isAdmin && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">
              Mark Your Attendance
            </h2>

            <p className="mb-6 text-gray-600">
              Please mark your attendance to continue
            </p>

            <button
              onClick={async () => {
                if (isCheckingIn) return;
                setIsCheckingIn(true);
                
                try {
                  const res = await fetch(`${BASE_URL}api/attendance/check-in`, {
                    method: 'POST',
                    credentials: 'include',
                  });

                  const data = await res.json();

                  if (data.success) {
                    toast.success("Checked In Successfully!");
                    setAttendanceMarked(true);
                    setShowAttendanceModal(false);
                    
                    // Refresh dashboard data
                    const refreshDashboard = async () => {
                      try {
                        const response = await fetch(`${BASE_URL}api/dashboard/dashboard/lead-counts`, {
                          credentials: 'include',
                        });
                        const dashboardData = await response.json();
                        if (dashboardData.success) {
                          setTotalLeads(dashboardData.total || 0);
                          setAssignedLeads(dashboardData.assigned || 0);
                          setDropLeads(dashboardData.drop || 0);
                          setClosedLeads(dashboardData.closed || 0);
                          setProjectionLeads(dashboardData.projection || 0);
                          setQuotationPending(dashboardData.quotation_pending || 0);
                          setTodaysAssignedLeads(dashboardData.today || 0);
                          setfollowups(dashboardData.missed || 0);
                          setUpcomingAssigned(dashboardData.upcoming || 0);
                          setTodaysMissedCombined(dashboardData.today_missed_total || 0);
                        }
                      } catch (err) {
                        console.error('Error refreshing dashboard:', err);
                      }
                    };
                    
                    refreshDashboard();
                  } else {
                    toast.error(data.message || "Check-in failed");
                  }
                } catch (err) {
                  console.error("Check-in failed:", err);
                  toast.error("Check-in failed. Please try again.");
                } finally {
                  setIsCheckingIn(false);
                }
              }}
              disabled={isCheckingIn}
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingIn ? "Checking In..." : "Mark Attendance"}
            </button>
          </div>
        </div>
      )}
      
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default ECommerce;