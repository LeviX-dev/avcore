import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import * as XLSX from 'xlsx';
import { FiFilter, FiDownload, FiCalendar, FiX } from 'react-icons/fi';

interface MetaLead {
  meta_id: number;
  full_name: string;
  mobile: string;
  email: string;
  city: string;
  created_time: string;
  imported_at: string;
  crm_master_id?: number | null;
  assign_id?: number | null;
  is_duplicate: number;
}

interface MetaSummary {
  total_leads: number;
  unique_leads: number;
  duplicate_leads: number;
  assigned_leads: number;
  unassigned_leads: number;
  crm_mapped: number;
}

interface FilterState {
  fromDate: string;
  toDate: string;
  city: string;
  isDuplicate: string;
  searchTerm: string;
  assignStatus: string;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  content: string;
}

const PAGE_SIZE = 50;

// Helper function to format date as DD/MM/YYYY
const formatDateDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

// Memoized table row component
const TableRow = memo(({ row, index, onCityClick, onNameClick }: { 
  row: MetaLead; 
  index: number;
  onCityClick: (city: string) => void;
  onNameClick: (name: string) => void;
}) => {
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

  const formatField = (value: string | null | undefined): string => {
    return value && value.trim() !== '' ? value : '-';
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="p-2 text-gray-600 dark:text-gray-400 whitespace-nowrap text-center">
        {index + 1}
      </td>
      <td className="p-2 font-medium max-w-[200px]">
        {row.full_name ? (
          <button
            onClick={() => onNameClick(row.full_name)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
            title={row.full_name}
          >
            {formatName(row.full_name)}
          </button>
        ) : '-'}
      </td>
      <td className="p-2 whitespace-nowrap">{formatField(row.mobile)}</td>
      <td className="p-2 truncate max-w-[200px]">{formatField(row.email)}</td>
      <td className="p-2 max-w-[150px]">
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
      <td className="p-2 whitespace-nowrap">{formatDateDDMMYYYY(row.created_time)}</td>
    </tr>
  );
});

TableRow.displayName = 'TableRow';

const MetaReports: React.FC = () => {
  const [data, setData] = useState<MetaLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [cities, setCities] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<MetaSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // Modal state
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    content: ''
  });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const thirtyDaysAgo = useMemo(() => 
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
  []);
  
  const [filters, setFilters] = useState<FilterState>({
    fromDate: thirtyDaysAgo,
    toDate: today,
    city: '',
    isDuplicate: '',
    searchTerm: '',
    assignStatus: ''
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>(filters);

  // Fetch cities
  const fetchCities = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/report/sujit/meta-cities`, { withCredentials: true });
      setCities(res.data.cities || []);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // Fetch meta leads
  const fetchMetaLeads = useCallback(async (isExport = false) => {
    if (!isExport) setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (!isExport) {
        params.append('page', page.toString());
        params.append('limit', PAGE_SIZE.toString());
      }
      
      if (appliedFilters.fromDate) params.append('fromDate', appliedFilters.fromDate);
      if (appliedFilters.toDate) params.append('toDate', appliedFilters.toDate);
      if (appliedFilters.city) params.append('city', appliedFilters.city);
      if (appliedFilters.isDuplicate) params.append('isDuplicate', appliedFilters.isDuplicate);
      if (appliedFilters.searchTerm) params.append('search', appliedFilters.searchTerm);
      if (appliedFilters.assignStatus) params.append('assignStatus', appliedFilters.assignStatus);

      const res = await axios.get(`${BASE_URL}api/report/sujit/meta-leads?${params.toString()}`, { withCredentials: true });
      
      if (isExport) return res.data.leads || [];
      
      requestAnimationFrame(() => {
        setData(res.data.leads || []);
        setTotalRecords(res.data.total || 0);
      });
    } catch (err) {
      console.error('Error fetching meta leads:', err);
      return [];
    } finally {
      if (!isExport) {
        requestAnimationFrame(() => setLoading(false));
      }
    }
  }, [page, appliedFilters]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const params = new URLSearchParams();
      if (appliedFilters.fromDate) params.append('fromDate', appliedFilters.fromDate);
      if (appliedFilters.toDate) params.append('toDate', appliedFilters.toDate);
      if (appliedFilters.city) params.append('city', appliedFilters.city);

      const res = await axios.get(`${BASE_URL}api/report/sujit/meta-summary?${params.toString()}`, { withCredentials: true });
      setSummary(res.data.summary);
      setShowSummary(true);
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchMetaLeads();
  }, [fetchMetaLeads]);

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
      city: '',
      isDuplicate: '',
      searchTerm: '',
      assignStatus: ''
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
  const openModal = useCallback((title: string, content: string) => {
    if (content?.trim()) {
      setTimeout(() => {
        setModal({ isOpen: true, title, content });
      }, 0);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, title: '', content: '' });
  }, []);

  const handleCityClick = useCallback((city: string) => {
    openModal('City Details', city);
  }, [openModal]);

  const handleNameClick = useCallback((name: string) => {
    openModal('Full Name', name);
  }, [openModal]);

  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const exportData = await fetchMetaLeads(true);
      if (!exportData?.length) {
        alert('No data found');
        return;
      }

      const formattedData = exportData.map((item: MetaLead, index: number) => ({
        'S.No': index + 1,
        'Name': item.full_name || '-',
        'Mobile': item.mobile || '-',
        'Email': item.email || '-',
        'City': item.city || '-',
        'Created': formatDateDDMMYYYY(item.created_time),
        'Duplicate': item.is_duplicate ? 'Yes' : 'No',
        'CRM ID': item.crm_master_id || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Meta Leads');
      XLSX.writeFile(wb, `meta_leads_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting');
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
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            Meta Leads Report
          </h1>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total: {totalRecords}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
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

            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <div className="lg:col-span-2">
              <input
                type="text"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search by name, mobile, email..."
                className="w-full px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
              />
            </div>

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
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left font-semibold w-12">S.No</th>
                  <th className="p-2 text-left font-semibold">Name</th>
                  <th className="p-2 text-left font-semibold">Mobile</th>
                  <th className="p-2 text-left font-semibold">Email</th>
                  <th className="p-2 text-left font-semibold">City</th>
                  <th className="p-2 text-left font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
                ) : !data.length ? (
                  <tr><td colSpan={6} className="p-8 text-center">No records found</td></tr>
                ) : (
                  data.map((row, index) => (
                    <TableRow
                      key={row.meta_id}
                      row={row}
                      index={index}
                      onCityClick={handleCityClick}
                      onNameClick={handleNameClick}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.length > 0 && (
            <div className="px-3 py-2 border-t">
              <div className="flex justify-between items-center text-xs">
                <span>
                  Showing {(page-1)*PAGE_SIZE+1} to {Math.min(page*PAGE_SIZE, totalRecords)} of {totalRecords}
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
                  >←</button>
                  <span className="px-2 py-1">{page}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
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

export default MetaReports;