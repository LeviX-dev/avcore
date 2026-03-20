import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Chart from 'react-apexcharts';
import { 
  BarChart3, 
  PieChart, 
  Filter, 
  Layers, 
  Users, 
  Activity,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';
import { BASE_URL } from '../../../public/config.js';

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
  
  // Chart data states
  const [chartData, setChartData] = useState<Record<string, number> | null>(null);
  const [categoryChartData, setCategoryChartData] = useState<Record<string, number> | null>(null);
  const [referenceChartData, setReferenceChartData] = useState<Record<string, number> | null>(null);
  const [budgetRangeChartData, setBudgetRangeChartData] = useState<Record<string, number> | null>(null);

  const navigate = useNavigate();

  const ADMIN_AND_SUB_ADMIN_ROLES = ['admin', 'sub_admin'];
  const isAdminOrSubAdmin = ADMIN_AND_SUB_ADMIN_ROLES.includes(role);
  const isProjectManager = role === 'project_manager';

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

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);

      const fetchWithSession = (url: string, options: RequestInit = {}) =>
        fetch(url, { ...options, credentials: 'include' });

      // Load all chart data
      await Promise.allSettled([
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
        (isAdminOrSubAdmin || isProjectManager)
          ? fetchWithSession(`${BASE_URL}api/dashboard/budget-range-summary`)
              .then(res => res.json())
              .then(data => setBudgetRangeChartData(normalizeChartData(data.summary || {})))
          : Promise.resolve(),
      ]);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, normalizeChartData, isAdminOrSubAdmin, isProjectManager]);

  // Initial fetch
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const handleRefresh = () => {
    fetchChartData();
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
      toolbar: { show: true },
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
    },
    colors: normalizedLeadChartData.map(([stage]) => leadStageColors[stage] || '#3B82F6'),
    tooltip: {
      y: { formatter: (val: number) => `${val} leads` },
    },
    states: {
      hover: { filter: { type: 'darken', value: 0.85 } },
      active: { filter: { type: 'darken', value: 0.7 } },
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
  ): ApexCharts.ApexOptions => {
    const categories = data ? Object.keys(data).map((key) => formatDisplayValue(key)) : [];
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
        : '#3B82F6';
    });

    return {
      chart: {
        type: 'bar',
        toolbar: { show: true },
        events: {
          dataPointSelection: function (event, chartContext, config) {
            const category = categories[config.dataPointIndex];
            if (category) {
              if (title.includes('Category')) handleGoToCategoryLeads(category);
              else if (title.includes('Reference')) handleGoToReferenceLeads(category);
              else if (title.includes('Budget')) handleGoToBudgetRangeLeads(category);
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
      },
      plotOptions: {
        bar: { borderRadius: 4, horizontal: false, columnWidth: '60%', distributed: false },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) { return val > 0 ? val.toString() : ''; },
        style: { fontSize: '11px', fontWeight: 'bold' },
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
    };
  };

  // Get filtered chart data
  const filteredCategoryData = filterChartData(categoryChartData, showZeroValues);
  const filteredBudgetRangeData = filterChartData(budgetRangeChartData, showZeroValues);
  const filteredReferenceData = filterChartData(referenceChartData, showZeroValues);

  const hasChartData = chartData && Object.keys(chartData).length > 0;
  const hasCategoryData = filteredCategoryData && Object.keys(filteredCategoryData).length > 0;
  const hasBudgetRangeData = filteredBudgetRangeData && Object.keys(filteredBudgetRangeData).length > 0;
  const hasReferenceData = filteredReferenceData && Object.keys(filteredReferenceData).length > 0;

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
   
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Lead Stage Summary Chart - MOVED FROM ECOMMERCE */}
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

          {/* Charts Section - MOVED FROM ECOMMERCE */}
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
                      <Chart options={buildBarOptions(filteredCategoryData, 'Category')} series={buildBarSeries(filteredCategoryData)} type="bar" height={350} />
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
                      <Chart options={buildBarOptions(filteredReferenceData, 'Reference')} series={buildBarSeries(filteredReferenceData)} type="bar" height={350} />
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

                {/* BUDGET RANGE BAR CHART – ADMIN / SUB-ADMIN ONLY */}
                {isAdminOrSubAdmin && showCharts && hasBudgetRangeData && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="col-span-12 mt-6"
                  >
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
                      <Chart options={buildBarOptions(filteredBudgetRangeData, 'Budget')} series={buildBarSeries(filteredBudgetRangeData)} type="bar" height={360} />
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                        <span className="inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                          Click on any budget range bar to view leads in that range
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default StatisticsDashboard;