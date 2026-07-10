import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { 
  BarChart3, 
  Layers, 
  Users, 
  MapPin,
  Calendar,
  Filter,
  X,
  RefreshCw
} from 'lucide-react';
import { BASE_URL } from '../../../public/config';
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

const StatisticsDashboard = () => {
  const [role, setRole] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showZeroValues, setShowZeroValues] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Date filter state
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [currentDateRange, setCurrentDateRange] = useState<string>('Last 7 Days');

  // Chart data states
  const [chartData, setChartData] = useState<Record<string, number> | null>(null);
  const [categoryChartData, setCategoryChartData] = useState<Record<string, number> | null>(null);
  const [referenceChartData, setReferenceChartData] = useState<Record<string, number> | null>(null);
  const [budgetRangeChartData, setBudgetRangeChartData] = useState<Record<string, number> | null>(null);
  const [areaChartData, setAreaChartData] = useState<Record<string, number> | null>(null);

  const navigate = useNavigate();

  const ADMIN_AND_SUB_ADMIN_ROLES = ['admin', 'sub_admin'];
  const isAdminOrSubAdmin = ADMIN_AND_SUB_ADMIN_ROLES.includes(role);
  const isProjectManager = role === 'project_manager';

  const leadStageColors: Record<string, string> = {
    'Fresh Lead': '#E5E7EB',
    'Cold Lead': '#9CA3AF',
    'On Hold': '#FDE68A',
    'Positive Lead': '#93C5FD',
    'Pre Site Visit': '#C4B5FD',
    Demo: '#F9A8D4',
    'Quotation Pending': '#F59E0B',
    'Quotation Created': '#D97706',
    'Quotation Follow-up': '#92400E',
    'Post Site Visit': '#6D28D9',
    'Projection List': '#86EFAC',
    Drop: '#EF4444',
    Closed: '#166534',
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
        // Skip if key contains "not specified" or starts with "Customised"
        if (key?.toLowerCase?.().includes('not specified')) return;
        if (key?.startsWith?.('Customised')) return;
        
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


  // In StatisticsDashboard.tsx - Update fetchChartData

const fetchChartData = useCallback(async (start?: string, end?: string) => {
  if (!isAuthenticated) return;

  try {
    setIsLoading(true);
    setIsFiltering(true);

    const buildUrl = (baseUrl: string) => {
      if (start && end) {
        return `${baseUrl}?startDate=${start}&endDate=${end}`;
      }
      return baseUrl;
    };

    // Load charts sequentially - FAST first, SLOW last
    // 1. Load lead summary (fastest)
    const leadRes = await fetch(buildUrl(`${BASE_URL}api/dashboard/lead-summary`), { credentials: 'include' });
    const leadData = await leadRes.json();
    setChartData(normalizeChartData(leadData.summary || {}));
    setLastUpdated(new Date());

    // 2. Load category and reference in parallel (medium speed)
    const [categoryRes, referenceRes] = await Promise.all([
      fetch(buildUrl(`${BASE_URL}api/dashboard/category-summary`), { credentials: 'include' }),
      fetch(buildUrl(`${BASE_URL}api/dashboard/reference-summary`), { credentials: 'include' })
    ]);
    
    const categoryData = await categoryRes.json();
    const referenceData = await referenceRes.json();
    setCategoryChartData(normalizeChartData(categoryData.summary || {}));
    setReferenceChartData(normalizeChartData(referenceData.summary || {}));

    // 3. Load area summary LAST (slowest - with timeout)
    try {
      const areaPromise = fetch(buildUrl(`${BASE_URL}api/dashboard/area-summary`), { credentials: 'include' });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000) // 8 second timeout
      );
      
      const areaResponse = await Promise.race([areaPromise, timeoutPromise]) as Response;
      if (areaResponse) {
        const areaData = await areaResponse.json();
        setAreaChartData(normalizeChartData(areaData.summary || {}));
      }
    } catch (areaError) {
      console.warn('Area summary timeout:', areaError);
      toast.warning('Area data is taking longer to load. Showing other charts.');
      // Set empty data to show "No Data" message
      setAreaChartData({});
    }

    // 4. Load budget range (if admin)
    if (isAdminOrSubAdmin || isProjectManager) {
      try {
        const budgetRes = await fetch(buildUrl(`${BASE_URL}api/dashboard/budget-range-summary`), { credentials: 'include' });
        const budgetData = await budgetRes.json();
        setBudgetRangeChartData(normalizeChartData(budgetData.summary || {}));
      } catch (budgetError) {
        console.warn('Budget range error:', budgetError);
      }
    }

    // Update date range display
    if (start && end) {
      const startObj = new Date(start);
      const endObj = new Date(end);
      if (startObj.toDateString() === endObj.toDateString()) {
        setCurrentDateRange(`Showing: ${startObj.toLocaleDateString()}`);
      } else {
        setCurrentDateRange(`Showing: ${startObj.toLocaleDateString()} - ${endObj.toLocaleDateString()}`);
      }
    } else {
      setCurrentDateRange('Last 7 Days');
    }

  } catch (err) {
    console.error('Error fetching chart data:', err);
    toast.error('Failed to load some chart data');
  } finally {
    setIsLoading(false);
    setIsFiltering(false);
  }
}, [isAuthenticated, normalizeChartData, isAdminOrSubAdmin, isProjectManager]);


  // Handle date filter application
  const handleApplyFilter = async () => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        toast.error('Start date cannot be after end date');
        return;
      }
      await fetchChartData(startDate, endDate);
      setShowDateFilter(false);
      toast.success(`Showing data from ${startDate} to ${endDate}`);
    }
  };

  // Reset filter to last 7 days
  const handleResetFilter = async () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const start = sevenDaysAgo.toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];
    
    setStartDate(start);
    setEndDate(end);
    await fetchChartData(start, end);
    setShowDateFilter(false);
    toast.success('Showing last 7 days data');
  };

  // Initial fetch with last 7 days
  useEffect(() => {
    const initialFetch = async () => {
      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() - 7);
      const start = defaultStart.toISOString().split('T')[0];
      const end = new Date().toISOString().split('T')[0];
      await fetchChartData(start, end);
    };
    initialFetch();
  }, [fetchChartData]);

  const handleRefresh = () => {
    const start = startDate;
    const end = endDate;
    fetchChartData(start, end);
    toast.info('Refreshing data...');
  };

  const handleToggleZeroValues = () => {
    setShowZeroValues(!showZeroValues);
  };

  const handleToggleCharts = () => {
    setShowCharts(!showCharts);
  };

  const handleGoToTotalLeads = (stage?: string) => {
    if (!stage) { navigate('/master-data'); return; }
    navigate('/master-data', { state: { lead_stage: formatDisplayValue(stage), from_dashboard: true } });
  };

  const handleGoToCategoryLeads = (category?: string) => {
    if (!category) { navigate('/master-data'); return; }
    navigate('/master-data', { state: { category_name: formatDisplayValue(category), from_dashboard: true } });
  };

  const handleGoToReferenceLeads = (reference?: string) => {
    if (!reference) { navigate('/master-data'); return; }
    const formattedReference = formatDisplayValue(reference);
    const finalReference = formattedReference.toLowerCase() === 'other' ? 'Others' : formattedReference;
    navigate('/master-data', { state: { reference_name: finalReference, from_dashboard: true } });
  };

  const handleGoToBudgetRangeLeads = (budgetRange?: string) => {
    if (!budgetRange) { navigate('/master-data'); return; }
    navigate('/master-data', { state: { budget_range: formatDisplayValue(budgetRange), from_dashboard: true } });
  };

  const handleGoToAreaLeads = (area?: string) => {
    if (!area) { navigate('/master-data'); return; }
    navigate('/master-data', { state: { area_name: formatDisplayValue(area), from_dashboard: true } });
  };

  // Lead stages for chart
  const ALL_LEAD_STAGES = Object.keys(leadStageColors);
  const normalizedLeadChartData = ALL_LEAD_STAGES.map(
    (stage) => [stage, chartData?.[stage] ?? 0] as [string, number],
  );

  const chartSeries = [
    {
      name: 'Leads',
      data: normalizedLeadChartData.map(([_, value]) => value),
    },
  ];


  const chartOptions: ApexCharts.ApexOptions = {
  chart: {
    type: 'bar',
    toolbar: { 
      show: true,
      tools: {
        download: false,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true
      }
    },
    events: {
      dataPointSelection: function (event, chartContext, config) {
        const stage = normalizedLeadChartData[config.dataPointIndex][0];
        if (stage) {
          handleGoToTotalLeads(stage);
        }
      },
    },
  },
  xaxis: {
    categories: normalizedLeadChartData.map(([stage]) => stage),
    labels: {
      rotate: -45,
      style: { fontSize: '11px' },
      formatter: function (value) {
        return formatDisplayValue(value);
      },
    },
  },
  yaxis: {
    title: { text: 'Number of Leads', style: { fontSize: '12px' } },
    min: 0,
    // Calculate max from data
    max: (() => {
      const values = normalizedLeadChartData.map(([_, value]) => value);
      const maxVal = Math.max(...values);
      return Math.ceil((maxVal * 1.15) / 10) * 10;
    })(),
  },
  plotOptions: {
    bar: {
      borderRadius: 6,
      distributed: true,
      columnWidth: '55%',
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toString(),
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      colors: ['#000'],
    },
    offsetY: -5,
  },
  colors: normalizedLeadChartData.map(([stage]) => leadStageColors[stage] || '#3B82F6'),
  tooltip: {
    y: { formatter: (val: number) => `${val} leads` },
  },
  states: {
    hover: { filter: { type: 'darken', value: 0.85 } },
    active: { filter: { type: 'darken', value: 0.7 } },
  },
  grid: {
    borderColor: '#e0e0e0',
    row: {
      colors: ['#f8f9fa', 'transparent'],
      opacity: 0.5
    }
  },
};


  const buildBarSeries = (data: Record<string, number> | null) => [
    {
      name: 'Leads',
      data: data ? Object.values(data).map(Number) : [],
    },
  ];
const buildBarOptions = (
  data: Record<string, number> | null,
  title: string,
  onClickHandler?: (category: string) => void
): ApexCharts.ApexOptions => {
  const categories = data ? Object.keys(data).map((key) => formatDisplayValue(key)) : [];
  const values = data ? Object.values(data).map(Number) : [];
  
  // Calculate max value for proper Y-axis scaling
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  // Add 10% padding to the top of the chart
  const yAxisMax = Math.ceil((maxValue * 1.15) / 10) * 10;

  const colors = categories.map((category) => {
    if (category === 'N/A' || category === 'Others') {
      return DISPLAY_CONFIG.specialColors[category] || '#CBD5E1';
    }
    return title.includes('Category')
      ? '#8B5CF6'
      : title.includes('Reference')
      ? '#10B981'
      : title.includes('Budget')
      ? '#3B82F6'
      : title.includes('Area')
      ? '#EC489A'
      : '#3B82F6';
  });

  return {
    chart: {
      type: 'bar',
      toolbar: { 
        show: true,
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const category = categories[config.dataPointIndex];
          if (category && onClickHandler) {
            onClickHandler(category);
          }
        },
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        style: { fontSize: '11px', fontWeight: 400 },
        formatter: function (value) {
          if (value.length > 15) return value.substring(0, 12) + '...';
          return formatDisplayValue(value);
        },
      },
    },
    yaxis: {
      title: { text: 'Number of Leads', style: { fontSize: '12px' } },
      min: 0,
      max: yAxisMax, // Set proper max value
      tickAmount: Math.min(10, Math.ceil(maxValue / 10)), // Dynamic tick amount
    },
    plotOptions: {
      bar: { 
        borderRadius: 4, 
        horizontal: false, 
        columnWidth: '60%', 
        distributed: false 
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) { 
        return val > 0 ? val.toString() : ''; 
      },
      style: { 
        fontSize: '11px', 
        fontWeight: 'bold',
        colors: ['#000']
      },
      offsetY: -5, // Position labels above bars
    },
    tooltip: {
      y: {
        formatter: function (val: number, { seriesIndex, w }) {
          const category = w.config.xaxis.categories[seriesIndex];
          return `${category}: ${val} leads`;
        },
      },
    },
    colors: colors,
    // Add these for better visual
    grid: {
      borderColor: '#e0e0e0',
      row: {
        colors: ['#f8f9fa', 'transparent'],
        opacity: 0.5
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    fill: {
      opacity: 1
    }
  };
};

  // Get filtered chart data
  const filteredCategoryData = filterChartData(categoryChartData, showZeroValues);
  const filteredBudgetRangeData = filterChartData(budgetRangeChartData, showZeroValues);
  const filteredReferenceData = filterChartData(referenceChartData, showZeroValues);
  const filteredAreaData = filterChartData(areaChartData, showZeroValues);

  const hasChartData = chartData && Object.keys(chartData).length > 0;
  const hasCategoryData = filteredCategoryData && Object.keys(filteredCategoryData).length > 0;
  const hasBudgetRangeData = filteredBudgetRangeData && Object.keys(filteredBudgetRangeData).length > 0;
  const hasReferenceData = filteredReferenceData && Object.keys(filteredReferenceData).length > 0;
  const hasAreaData = filteredAreaData && Object.keys(filteredAreaData).length > 0;

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
    <div className="space-y-8">
      {/* Date Filter Control */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-white dark:bg-boxdark p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {currentDateRange}
            </span>
          </div>
          {isFiltering && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter by Date</span>
          </button>
          
          <button
            onClick={handleResetFilter}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Last 7 Days</span>
          </button>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Date Filter Modal/Popup */}
      {showDateFilter && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-boxdark rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Select Date Range</h3>
            <button
              onClick={() => setShowDateFilter(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-4 justify-end">
            <button
              onClick={() => setShowDateFilter(false)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyFilter}
              disabled={isFiltering}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isFiltering ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                'Apply Filter'
              )}
            </button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Lead Stage Summary Chart */}
          {hasChartData && !isProjectManager && (       
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {isAdminOrSubAdmin ? 'Active Lead Stage Summary' : 'Your Lead Stage Summary'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isAdminOrSubAdmin
                        ? 'Summary of all lead stages - Click any bar to view leads in that stage'
                        : 'Summary of your assigned leads by stage - Click any bar to view leads'}
                    </p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                <div className="cursor-pointer">
                  <Chart options={chartOptions} series={chartSeries} type="bar" height={380} />
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  <span className="inline-flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    Click on any stage bar to view leads in that stage
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Charts Section */}
          {!isProjectManager && (hasCategoryData || hasReferenceData) && showCharts && (  
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <div className="grid grid-cols-12 gap-6">
                {/* CATEGORY CHART */}
                <div className="col-span-12 xl:col-span-6">
                  {hasCategoryData ? (
                    <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {isAdminOrSubAdmin ? 'Category-wise Active Leads' : 'Your Leads by Category'}
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isAdminOrSubAdmin
                              ? `Showing ${Object.keys(filteredCategoryData).length} categories - Click any bar to view leads in that category`
                              : `Your leads across ${Object.keys(filteredCategoryData).length} categories - Click to view`}
                          </p>
                        </div>
                        <Layers className="w-5 h-5 text-indigo-500" />
                      </div>
                      <Chart 
                        options={buildBarOptions(filteredCategoryData, 'Category', handleGoToCategoryLeads)} 
                        series={buildBarSeries(filteredCategoryData)} 
                        type="bar" 
                        height={350} 
                      />
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                        <span className="inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                          Click on any category bar to view leads in that category
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-center py-8">
                        <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Category Data</h3>
                        <p className="text-gray-500 dark:text-gray-400">No leads assigned in any category yet</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* REFERENCE CHART */}
                <div className="col-span-12 xl:col-span-6">
                  {hasReferenceData ? (
                    <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {isAdminOrSubAdmin ? 'Sources-wise Active Leads' : 'Your Leads by Source'}
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isAdminOrSubAdmin
                              ? `Showing ${Object.keys(filteredReferenceData).length} references - Click any bar to view leads from that source`
                              : `Your leads from ${Object.keys(filteredReferenceData).length} sources - Click to view`}
                          </p>
                        </div>
                        <Users className="w-5 h-5 text-green-500" />
                      </div>
                      <Chart 
                        options={buildBarOptions(filteredReferenceData, 'Reference', handleGoToReferenceLeads)} 
                        series={buildBarSeries(filteredReferenceData)} 
                        type="bar" 
                        height={350} 
                      />
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                        <span className="inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                          Click on any source bar to view leads from that source
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Reference Data</h3>
                        <p className="text-gray-500 dark:text-gray-400">No leads assigned from any reference yet</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* AREA CHART - FULL WIDTH */}
        {/* AREA CHART - FULL WIDTH WITH LOADING STATE */}
{showCharts && (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="mt-6"
  >
    <div className="col-span-12">
      <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isAdminOrSubAdmin ? 'City-wise Active Leads' : 'Your Leads by Area'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {areaChartData === null 
                ? 'Loading area data...' 
                : hasAreaData 
                  ? `Showing ${Object.keys(filteredAreaData).length} cities - Click any bar to view leads`
                  : 'No area data available'}
            </p>
          </div>
          <MapPin className="w-5 h-5 text-pink-500" />
        </div>
        
        {areaChartData === null ? (
          <div className="flex items-center justify-center h-[450px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading area data...</p>
            </div>
          </div>
        ) : hasAreaData ? (
          <>
            <Chart 
              options={buildBarOptions(filteredAreaData, 'Area', handleGoToAreaLeads)} 
              series={buildBarSeries(filteredAreaData)} 
              type="bar" 
              height={450} 
            />
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              <span className="inline-flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Click on any area bar to view leads in that area
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[450px]">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No area data available for this date range</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </motion.div>
)}


          {/* BUDGET RANGE BAR CHART – ADMIN / SUB-ADMIN ONLY - FULL WIDTH */}
          {isAdminOrSubAdmin && showCharts && hasBudgetRangeData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <div className="col-span-12">
                <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Budget Range-wise Leads</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Distribution of leads by budget range - Click any bar to view leads in that range
                      </p>
                    </div>
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <Chart 
                    options={buildBarOptions(filteredBudgetRangeData, 'Budget', handleGoToBudgetRangeLeads)} 
                    series={buildBarSeries(filteredBudgetRangeData)} 
                    type="bar" 
                    height={360} 
                  />
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                    <span className="inline-flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      Click on any budget range bar to view leads in that range
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default StatisticsDashboard;