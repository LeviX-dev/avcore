import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import * as XLSX from 'xlsx';
import { FiFilter, FiDownload, FiCalendar, FiX, FiSearch } from 'react-icons/fi';

interface LeadReport {
  master_id: number;
  name: string;
  number: string;
  email: string;
  city: string;
  area_name: string;
  cat_name: string;
  reference_name: string;
  lead_stage: string;
  lead_status: string;
  status: string;
  assigned_to: string;
  assign_date: string;
  followup_date: string;
  created_at: string;
  quick_remark: string | null;
  detailed_remark: string | null;
  lead_activity: number;
  document_count: number;
  latest_reassignment_date: string | null;
  latest_assigned_to: string | null;
}

interface LeadSummary {
  total_leads: number;
  active_leads: number;
  inactive_leads: number;
  assigned_leads: number;
  stage_breakdown: { [key: string]: number };
  category_breakdown: { [key: string]: number };
  area_breakdown: { [key: string]: number };
}

interface FilterState {
  fromDate: string;
  toDate: string;
  searchTerm: string;
  city: string;
  stage: string;
  assigned_to: string;
  lead_status: string;
}

interface DropdownData {
  cities: string[];
  stages: string[];
  assigned_to: string[];
  lead_statuses: string[];
}

const PAGE_SIZE = 50;

// Helper function to format date as DD/MM/YYYY
const formatDateDDMMYYYY = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

// Get stage color for badges
const getStageColor = (stage: string | null): string => {
  if (!stage) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  
  const stageLower = stage.toLowerCase().trim();
  if (stageLower.includes('fresh')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  if (stageLower.includes('cold')) return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  if (stageLower.includes('hold')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  if (stageLower.includes('positive')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
  if (stageLower.includes('site')) return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300';
  if (stageLower.includes('demo')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
  if (stageLower.includes('quotation')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  if (stageLower.includes('projection')) return 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300';
  if (stageLower.includes('drop')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  if (stageLower.includes('closed')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (stageLower.includes('execution')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
  if (stageLower.includes('lost')) return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

// Memoized table row component
const TableRow = memo(({ 
  row, 
  index,
  onCityClick,
  onStageClick,
  onNameClick
}: { 
  row: LeadReport; 
  index: number;
  onCityClick: (city: string) => void;
  onStageClick: (stage: string) => void;
  onNameClick: (name: string) => void;
}) => {
  const formatField = (value: string | null | undefined): string => {
    return value && value.trim() !== '' ? value : '-';
  };

  const formatCity = (city: string): string => {
    if (!city) return '-';
    if (city.length <= 15) return city;
    return `${city.substring(0, 15)}...`;
  };

  const formatName = (name: string): string => {
    if (!name) return '-';
    if (name.length <= 20) return name;
    return `${name.substring(0, 20)}...`;
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="p-2 text-gray-600 dark:text-gray-400 whitespace-nowrap text-center">
        {index + 1}
      </td>
      <td className="p-2 font-medium max-w-[200px]">
        {row.name ? (
          <button
            onClick={() => onNameClick(row.name)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
            title={row.name}
          >
            {formatName(row.name)}
          </button>
        ) : '-'}
      </td>
      <td className="p-2 whitespace-nowrap">{formatField(row.number)}</td>
      <td className="p-2 truncate max-w-[150px]">{formatField(row.email)}</td>
      <td className="p-2 max-w-[120px]">
        {row.city ? (
          <button
            onClick={() => onCityClick(row.city)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
            title={row.city}
          >
            {formatCity(row.city)}
          </button>
        ) : '-'}
      </td>
      <td className="p-2 max-w-[120px]">{formatField(row.area_name)}</td>
      <td className="p-2 max-w-[120px]">{formatField(row.cat_name)}</td>
      <td className="p-2 max-w-[120px]">{formatField(row.reference_name)}</td>
      <td className="p-2">
        {row.lead_stage ? (
          <button
            onClick={() => onStageClick(row.lead_stage)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStageColor(row.lead_stage)} hover:opacity-80 transition-opacity`}
          >
            {row.lead_stage}
          </button>
        ) : '-'}
      </td>
      <td className="p-2 whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
          row.lead_status === 'Active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {formatField(row.lead_status)}
        </span>
      </td>
      <td className="p-2 whitespace-nowrap">{formatField(row.assigned_to)}</td>
      <td className="p-2 whitespace-nowrap">{formatDateDDMMYYYY(row.assign_date)}</td>
      <td className="p-2 whitespace-nowrap">{formatDateDDMMYYYY(row.followup_date)}</td>
      <td className="p-2 whitespace-nowrap text-center">{row.lead_activity || 0}</td>
    </tr>
  );
});

TableRow.displayName = 'TableRow';

// Summary Card Component
const SummaryCard = memo(({ 
  title, 
  value, 
  color, 
  icon 
}: { 
  title: string; 
  value: number | string; 
  color: string; 
  icon: React.ReactNode;
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
          {title}
        </p>
        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </div>
));

SummaryCard.displayName = 'SummaryCard';

const LeadWiseReport: React.FC = () => {
  const [data, setData] = useState<LeadReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<LeadSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [dropdownData, setDropdownData] = useState<DropdownData>({
    cities: [],
    stages: [],
    assigned_to: [],
    lead_statuses: []
  });

  // Modal state
  const [modal, setModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    content: string;
    type: 'city' | 'stage' | 'name';
  }>({
    isOpen: false,
    title: '',
    content: '',
    type: 'name'
  });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const thirtyDaysAgo = useMemo(() => 
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
  []);
  
  const [filters, setFilters] = useState<FilterState>({
    fromDate: thirtyDaysAgo,
    toDate: today,
    searchTerm: '',
    city: '',
    stage: '',
    assigned_to: '',
    lead_status: ''
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>(filters);

  // Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    try {
      // Fetch unique cities
      const [citiesRes, stagesRes, usersRes] = await Promise.all([
        axios.get(`${BASE_URL}api/employee-work-report/filters`, { withCredentials: true }),
        axios.get(`${BASE_URL}api/leadstage`, { withCredentials: true }),
        axios.get(`${BASE_URL}api/users`, { withCredentials: true })
      ]);

      const leadStatuses = ['Active', 'Inactive'];
      
      setDropdownData({
        cities: citiesRes.data?.cities || [],
        stages: stagesRes.data || [],
        assigned_to: usersRes.data?.map((u: any) => u.name).filter(Boolean) || [],
        lead_statuses: leadStatuses
      });
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  }, []);

  // Fetch lead report data
  const fetchLeadReport = useCallback(async (isExport = false) => {
    if (!isExport) setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (!isExport) {
        params.append('page', page.toString());
        params.append('limit', PAGE_SIZE.toString());
      }
      
      if (appliedFilters.fromDate) params.append('fromDate', appliedFilters.fromDate);
      if (appliedFilters.toDate) params.append('toDate', appliedFilters.toDate);
      if (appliedFilters.searchTerm) params.append('search', appliedFilters.searchTerm);
      if (appliedFilters.city) params.append('city', appliedFilters.city);
      if (appliedFilters.stage) params.append('stage', appliedFilters.stage);
      if (appliedFilters.assigned_to) params.append('assigned_to', appliedFilters.assigned_to);
      if (appliedFilters.lead_status) params.append('lead_status', appliedFilters.lead_status);

      const res = await axios.get(`${BASE_URL}api/lead-wise-report?${params.toString()}`, { 
        withCredentials: true 
      });
      
      if (isExport) return res.data.data || [];
      
      requestAnimationFrame(() => {
        setData(res.data.data || []);
        setTotalRecords(res.data.total || 0);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      });
    } catch (err) {
      console.error('Error fetching lead report:', err);
      return [];
    } finally {
      if (!isExport) {
        requestAnimationFrame(() => setLoading(false));
      }
    }
  }, [page, appliedFilters]);

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const params = new URLSearchParams();
      if (appliedFilters.fromDate) params.append('fromDate', appliedFilters.fromDate);
      if (appliedFilters.toDate) params.append('toDate', appliedFilters.toDate);
      if (appliedFilters.city) params.append('city', appliedFilters.city);
      if (appliedFilters.stage) params.append('stage', appliedFilters.stage);
      if (appliedFilters.assigned_to) params.append('assigned_to', appliedFilters.assigned_to);
      if (appliedFilters.lead_status) params.append('lead_status', appliedFilters.lead_status);

      const res = await axios.get(`${BASE_URL}api/lead-wise-report/summary?${params.toString()}`, { 
        withCredentials: true 
      });
      setSummary(res.data.summary);
      setShowSummary(true);
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [appliedFilters]);

  // Initial data fetch
  useEffect(() => {
    fetchDropdownData();
    fetchLeadReport();
    fetchSummary();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchLeadReport();
    fetchSummary();
  }, [appliedFilters, page]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const resetFilters = () => {
    const resetValues = {
      fromDate: thirtyDaysAgo,
      toDate: today,
      searchTerm: '',
      city: '',
      stage: '',
      assigned_to: '',
      lead_status: ''
    };
    setFilters(resetValues);
    setAppliedFilters(resetValues);
    setPage(1);
  };

  const clearFilter = (filterName: keyof FilterState) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: '' };
      setAppliedFilters(newFilters);
      return newFilters;
    });
    setPage(1);
  };

  // Modal functions
  const openModal = useCallback((title: string, content: string, type: 'city' | 'stage' | 'name' = 'name') => {
    if (content?.trim()) {
      setTimeout(() => {
        setModal({ isOpen: true, title, content, type });
      }, 0);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, title: '', content: '', type: 'name' });
  }, []);

  const handleCityClick = useCallback((city: string) => {
    openModal('City Details', city, 'city');
  }, [openModal]);

  const handleStageClick = useCallback((stage: string) => {
    openModal('Stage Details', stage, 'stage');
  }, [openModal]);

  const handleNameClick = useCallback((name: string) => {
    openModal('Lead Name', name, 'name');
  }, [openModal]);

  // Export to Excel
  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const exportData = await fetchLeadReport(true);
      if (!exportData?.length) {
        alert('No data found to export');
        return;
      }

      const formattedData = exportData.map((item: LeadReport, index: number) => ({
        'S.No': index + 1,
        'Lead Name': item.name || '-',
        'Phone': item.number || '-',
        'Email': item.email || '-',
        'City': item.city || '-',
        'Area': item.area_name || '-',
        'Category': item.cat_name || '-',
        'Reference': item.reference_name || '-',
        'Stage': item.lead_stage || '-',
        'Status': item.lead_status || '-',
        'Assigned To': item.assigned_to || '-',
        'Entry Date': formatDateDDMMYYYY(item.assign_date),
        'Follow-up Date': formatDateDDMMYYYY(item.followup_date),
        'Created': formatDateDDMMYYYY(item.created_at),
        'Activities': item.lead_activity || 0,
        'Documents': item.document_count || 0
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Lead Report');
      
      // Auto-size columns
      const colWidths = [
        { wch: 8 },  // S.No
        { wch: 25 }, // Lead Name
        { wch: 15 }, // Phone
        { wch: 25 }, // Email
        { wch: 15 }, // City
        { wch: 15 }, // Area
        { wch: 20 }, // Category
        { wch: 15 }, // Reference
        { wch: 15 }, // Stage
        { wch: 12 }, // Status
        { wch: 20 }, // Assigned To
        { wch: 15 }, // Entry Date
        { wch: 15 }, // Follow-up Date
        { wch: 15 }, // Created
        { wch: 10 }, // Activities
        { wch: 10 }, // Documents
      ];
      ws['!cols'] = colWidths;
      
      XLSX.writeFile(wb, `lead_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data');
    } finally {
      setExportLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return Object.entries(appliedFilters).filter(([key, value]) => 
      value && key !== 'fromDate' && key !== 'toDate'
    ).length + (appliedFilters.fromDate !== thirtyDaysAgo || appliedFilters.toDate !== today ? 1 : 0);
  }, [appliedFilters, thirtyDaysAgo, today]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-boxdark p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <span>📊</span> Lead Wise Report
          </h1>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total: {totalRecords} leads
          </div>
        </div>

        {/* Summary Cards */}
        {showSummary && summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-3">
            <SummaryCard
              title="Total Leads"
              value={summary.total_leads || 0}
              color="bg-blue-100 dark:bg-blue-900/30"
              icon={<span className="text-blue-600 dark:text-blue-400">📋</span>}
            />
            <SummaryCard
              title="Active"
              value={summary.active_leads || 0}
              color="bg-green-100 dark:bg-green-900/30"
              icon={<span className="text-green-600 dark:text-green-400">✅</span>}
            />
            <SummaryCard
              title="Inactive"
              value={summary.inactive_leads || 0}
              color="bg-red-100 dark:bg-red-900/30"
              icon={<span className="text-red-600 dark:text-red-400">⛔</span>}
            />
            <SummaryCard
              title="Assigned"
              value={summary.assigned_leads || 0}
              color="bg-purple-100 dark:bg-purple-900/30"
              icon={<span className="text-purple-600 dark:text-purple-400">👤</span>}
            />
            <SummaryCard
              title="Categories"
              value={Object.keys(summary.category_breakdown || {}).length || 0}
              color="bg-orange-100 dark:bg-orange-900/30"
              icon={<span className="text-orange-600 dark:text-orange-400">🏷️</span>}
            />
            <SummaryCard
              title="Areas"
              value={Object.keys(summary.area_breakdown || {}).length || 0}
              color="bg-teal-100 dark:bg-teal-900/30"
              icon={<span className="text-teal-600 dark:text-teal-400">📍</span>}
            />
          </div>
        )}

        {/* Category & Area Breakdown (optional toggle) */}
        {showSummary && summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-3">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Top Categories</h3>
              <div className="flex flex-wrap gap-1">
                {Object.entries(summary.category_breakdown || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([name, count]) => (
                    <span key={name} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-[10px] text-blue-700 dark:text-blue-300">
                      {name}: {count}
                    </span>
                  ))}
                {Object.keys(summary.category_breakdown || {}).length > 6 && (
                  <span className="px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400">
                    +{Object.keys(summary.category_breakdown).length - 6} more
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-3">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Top Areas</h3>
              <div className="flex flex-wrap gap-1">
                {Object.entries(summary.area_breakdown || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([name, count]) => (
                    <span key={name} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-full text-[10px] text-green-700 dark:text-green-300">
                      {name}: {count}
                    </span>
                  ))}
                {Object.keys(summary.area_breakdown || {}).length > 6 && (
                  <span className="px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400">
                    +{Object.keys(summary.area_breakdown).length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
            />

            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
            />

            <div className="lg:col-span-2">
              <input
                type="text"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search by name, phone, email..."
                className="w-full px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
              />
            </div>

            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
            >
              <option value="">All Cities</option>
              {dropdownData.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              name="stage"
              value={filters.stage}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
            >
              <option value="">All Stages</option>
              {dropdownData.stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>

            <select
              name="assigned_to"
              value={filters.assigned_to}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
            >
              <option value="">All Assignees</option>
              {dropdownData.assigned_to.map(person => (
                <option key={person} value={person}>{person}</option>
              ))}
            </select>

            <select
              name="lead_status"
              value={filters.lead_status}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
            >
              <option value="">All Status</option>
              {dropdownData.lead_statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <div className="flex gap-1 lg:col-span-1">
              <button
                onClick={applyFilters}
                disabled={loading}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium disabled:opacity-50"
              >
                <FiFilter size={12} />
                Apply
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-white text-blue-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
              >
                Reset
              </button>
              <button
                onClick={exportToExcel}
                disabled={exportLoading || !data.length}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs disabled:opacity-50"
              >
                <FiDownload size={12} />
                {exportLoading ? '...' : 'Export'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Pagination on Top */}
          {data.length > 0 && (
            <div className="px-3 py-2 border-b bg-gray-50 dark:bg-gray-700/50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  Showing {(page-1)*PAGE_SIZE+1} to {Math.min(page*PAGE_SIZE, totalRecords)} of {totalRecords}
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 dark:border-gray-600"
                  >←</button>
                  <span className="px-2 py-1 dark:text-gray-300">{page}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 dark:border-gray-600"
                  >→</button>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left font-semibold w-12">#</th>
                  <th className="p-2 text-left font-semibold min-w-[150px]">Lead Name</th>
                  <th className="p-2 text-left font-semibold">Phone</th>
                  <th className="p-2 text-left font-semibold max-w-[150px]">Email</th>
                  <th className="p-2 text-left font-semibold">City</th>
                  <th className="p-2 text-left font-semibold">Area</th>
                  <th className="p-2 text-left font-semibold">Category</th>
                  <th className="p-2 text-left font-semibold">Reference</th>
                  <th className="p-2 text-left font-semibold">Stage</th>
                  <th className="p-2 text-left font-semibold">Status</th>
                  <th className="p-2 text-left font-semibold">Assigned To</th>
                  <th className="p-2 text-left font-semibold">Entry Date</th>
                  <th className="p-2 text-left font-semibold">Follow-up</th>
                  <th className="p-2 text-left font-semibold text-center">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={14} className="p-8 text-center">Loading...</td></tr>
                ) : !data.length ? (
                  <tr><td colSpan={14} className="p-8 text-center">No records found</td></tr>
                ) : (
                  data.map((row, index) => (
                    <TableRow
                      key={row.master_id}
                      row={row}
                      index={index}
                      onCityClick={handleCityClick}
                      onStageClick={handleStageClick}
                      onNameClick={handleNameClick}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination on Bottom */}
          {data.length > 0 && (
            <div className="px-3 py-2 border-t dark:border-gray-700">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  Showing {(page-1)*PAGE_SIZE+1} to {Math.min(page*PAGE_SIZE, totalRecords)} of {totalRecords}
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 dark:border-gray-600"
                  >←</button>
                  <span className="px-2 py-1 dark:text-gray-300">{page}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 dark:border-gray-600"
                  >→</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {modal.isOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />
            <div 
              className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-medium">{modal.title}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <FiX size={20} />
                </button>
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">{modal.content}</p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadWiseReport;