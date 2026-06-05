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

  // const [quotationFollowup, setQuotationFollowup] = useState<number | null>(null);

  const ADMIN_LIKE_ROLES = ['admin', 'sub_admin'];
  const ADMIN_AND_SUB_ADMIN_ROLES = ['admin', 'sub_admin' , 'junior_autocad_designer' , 'senior_autocad_designer'];

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
      'av_engineer',
  'acoustic_engineer',
  'acoustic_designer',
   'hr_executive',
   'carpenter',
   'accountant'
  
  ];

  const ROLES_WITH_QUOTATION_PROJECTION = [
    'admin',
    'sub_admin',
    'tech-sale-sound-engineer',
    'tech_sale_sound_engineer',
    'technical_head',
  ];

const isAdminOrSubAdmin =
  ADMIN_AND_SUB_ADMIN_ROLES.includes(role) ||
  role === 'technical_head'; 
  
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
                setQuotationFollowup(data.quotation_followup || 0);
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
        onClick: () => navigate('/call', { state: { filterStage: 'Quotation Pending' } }),
        clickable: true,
      },
      {
        title: 'Quotation Follow-up',
        value: formatDisplayValue(quotationFollowup),
        icon: Hourglass,
        color: 'text-orange-700',
        bgGradient: 'from-orange-500/10 to-orange-600/5',
        borderColor: 'border-orange-300/50',
        onClick: () => navigate('/call', { state: { filterStage: 'Quotation Follow-up' } }),
        clickable: true,
      },
      {
        title: 'Projection List',
        value: formatDisplayValue(projectionLeads),
        icon: BarChart3,
        color: 'text-green-600',
        bgGradient: 'from-green-500/10 to-green-600/5',
        borderColor: 'border-green-300/50',
        onClick: () => navigate('/call', { state: { filterStage: 'Projection List' } }),
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
          // Hide Drop Leads card for junior_autocad_designer role
          ...(role !== 'junior_autocad_designer' ? [{
            title: 'Drop Leads',
            value: formatDisplayValue(dropLeads),
            icon: Hourglass,
            color: 'text-red-600',
            bgGradient: 'from-red-500/10 to-red-600/5',
            borderColor: 'border-red-300/50',
            onClick: () => navigate('/drop-leads'),
            clickable: true,
          }] : []),
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