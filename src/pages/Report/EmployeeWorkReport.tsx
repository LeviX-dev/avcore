import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import * as XLSX from 'xlsx';
import { FiFilter, FiDownload, FiX } from 'react-icons/fi';

interface EmployeeWork {
  master_id: number;
  client_name: string;
  number: string;
  city: string;
  current_stage: string;
  category: string;
  reference_name: string;
  assigned_by: string;
  assigned_to: string;
  reassigned_stage: string;
  remark: string;
  created_at: string;
}

interface FilterState {
  fromDate: string;
  toDate: string;
  searchTerm: string;
  city: string;
  assigned_to: string;
  reassigned_stage: string;
}

interface DropdownData {
  cities: string[];
  assigned_to: string[];
  reassigned_stages: string[];
}

const PAGE_SIZE = 50;

// Memoized table row component to prevent unnecessary re-renders
const TableRow = memo(({ row, index, onCityClick, onRemarkClick, onClientClick }: { 
  row: EmployeeWork; 
  index: number;
  onCityClick: (city: string) => void;
  onRemarkClick: (remark: string) => void;
  onClientClick: (client: string) => void;
}) => {
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCity = (city: string): string => {
    if (!city) return '-';
    if (city.length <= 8) return city;
    return `${city.substring(0, 8)}...`;
  };

  const formatField = (value: string | null | undefined): string => {
    return value && value.trim() !== '' ? value : '-';
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="p-2 text-gray-600 dark:text-gray-400 whitespace-nowrap text-center">
        {index + 1}
      </td>
      <td className="p-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {formatDate(row.created_at)}
      </td>
      <td className="p-2 font-medium whitespace-nowrap">
        {formatField(row.assigned_to)}
      </td>
      
      <td className="p-2 max-w-[160px]">
  {row.client_name ? (
    <button
      onClick={() => onClientClick(row.client_name)}
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline text-left truncate block w-full"
    >
      {row.client_name.length > 25 
        ? `${row.client_name.substring(0, 25)}...` 
        : row.client_name}
    </button>
  ) : '-'}
</td>

      <td className="p-2 whitespace-nowrap">{formatField(row.number)}</td>
      <td className="p-2">
        {row.city ? (
          <button
            onClick={() => onCityClick(row.city)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          >
            {formatCity(row.city)}
          </button>
        ) : '-'}
      </td>
      <td className="p-2 whitespace-nowrap">
        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-[10px] inline-block">
          {formatField(row.reassigned_stage || row.current_stage)}
        </span>
      </td>
      <td className="p-2 whitespace-nowrap">{formatField(row.category)}</td>
      <td className="p-2 whitespace-nowrap">{formatField(row.reference_name)}</td>
      <td className="p-2 whitespace-nowrap">{formatField(row.assigned_by)}</td>
      <td className="p-2 max-w-[150px]">
        {row.remark ? (
          <button
            onClick={() => onRemarkClick(row.remark)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left truncate block w-full"
          >
            {row.remark.length > 30 ? `${row.remark.substring(0, 30)}...` : row.remark}
          </button>
        ) : '-'}
      </td>
    </tr>
  );
});

TableRow.displayName = 'TableRow';

const EmployeeWorkReport: React.FC = () => {
  const [data, setData] = useState<EmployeeWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [dropdownData, setDropdownData] = useState<DropdownData>({
    cities: [],
    assigned_to: [],
    reassigned_stages: []
  });
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; content: string }>({
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
    searchTerm: '',
    city: '',
    assigned_to: '',
    reassigned_stage: ''
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>(filters);

  // Fetch dropdown data - only once
  useEffect(() => {
    let mounted = true;
    
    const fetchDropdownData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}api/employee-work-report/filters`, { 
          withCredentials: true 
        });
        if (mounted) {
          setDropdownData(res.data);
        }
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };

    fetchDropdownData();
    
    return () => {
      mounted = false;
    };
  }, []);


  const fetchEmployeeWork = useCallback(async (isExport = false) => {
  if (!isExport) setLoading(true);
  try {
    const params = new URLSearchParams();
    
    // Only add page and limit for non-export requests
    if (!isExport) {
      params.append('page', page.toString());
      params.append('limit', PAGE_SIZE.toString());
    }
    
    // Add all filters if they have values
    if (appliedFilters.fromDate) params.append('fromDate', appliedFilters.fromDate);
    if (appliedFilters.toDate) params.append('toDate', appliedFilters.toDate);
    if (appliedFilters.searchTerm) params.append('search', appliedFilters.searchTerm);
    if (appliedFilters.city) params.append('city', appliedFilters.city);
    if (appliedFilters.assigned_to) params.append('assigned_to', appliedFilters.assigned_to);
    if (appliedFilters.reassigned_stage) params.append('reassigned_stage', appliedFilters.reassigned_stage);

    const res = await axios.get(`${BASE_URL}api/employee-work-report?${params.toString()}`, { 
      withCredentials: true 
    });
    
    if (isExport) return res.data.data || [];
    
    requestAnimationFrame(() => {
      setData(res.data.data || []);
      setTotalRecords(res.data.total || 0);
    });
  } catch (err) {
    console.error('Error fetching employee work:', err);
    return [];
  } finally {
    if (!isExport) {
      requestAnimationFrame(() => setLoading(false));
    }
  }
}, [page, appliedFilters]);


  useEffect(() => {
    fetchEmployeeWork();
  }, [fetchEmployeeWork]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setPage(1);
  }, [filters]);

  const resetFilters = useCallback(() => {
    const resetValues = {
      fromDate: thirtyDaysAgo,
      toDate: today,
      searchTerm: '',
      city: '',
      assigned_to: '',
      reassigned_stage: ''
    };
    setFilters(resetValues);
    setAppliedFilters(resetValues);
    setPage(1);
  }, [thirtyDaysAgo, today]);

  const clearFilter = useCallback((filterName: keyof FilterState) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: '' };
      setAppliedFilters(newFilters);
      return newFilters;
    });
    setPage(1);
  }, []);

  const openModal = useCallback((title: string, content: string) => {
    if (content?.trim()) {
      // Use setTimeout to prevent event bubbling issues
      setTimeout(() => {
        setModal({ isOpen: true, title, content });
      }, 0);
    }
  }, []);

  const handleClientClick = useCallback((client: string) => {
  openModal('Client Details', client);
}, [openModal]);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, title: '', content: '' });
  }, []);

  const handleCityClick = useCallback((city: string) => {
    openModal('City Details', city);
  }, [openModal]);

  const handleRemarkClick = useCallback((remark: string) => {
    openModal('Remark Details', remark);
  }, [openModal]);

  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const exportData = await fetchEmployeeWork(true);
      if (!exportData?.length) {
        alert('No data found to export');
        return;
      }

      // Use web worker for large data processing? 
      // For now, we'll process in chunks to avoid blocking
      const formattedData = [];
      for (let i = 0; i < exportData.length; i += 100) {
        const chunk = exportData.slice(i, i + 100);
        const processed = chunk.map((item: EmployeeWork, index: number) => ({
          'S.No': i + index + 1,
          'Date': new Date(item.created_at).toLocaleDateString('en-IN'),
          'Employee Name': item.assigned_to || '-',
          'Client Name': item.client_name || '-',
          'Number': item.number || '-',
          'City': item.city || '-',
          'Stage': item.reassigned_stage || item.current_stage || '-',
          'Category': item.category || '-',
          'Reference': item.reference_name || '-',
          'Assigned By': item.assigned_by || '-',
          'Remark': item.remark || '-'
        }));
        formattedData.push(...processed);
        
        // Yield to event loop every 100 records
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Employee Work Report');
      
      XLSX.writeFile(wb, `employee_work_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data');
    } finally {
      setExportLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

  // Memoize active filter count
  const activeFilterCount = useMemo(() => {
    return Object.entries(appliedFilters).filter(([key, value]) => 
      value && key !== 'fromDate' && key !== 'toDate'
    ).length + (appliedFilters.fromDate !== thirtyDaysAgo || appliedFilters.toDate !== today ? 1 : 0);
  }, [appliedFilters, thirtyDaysAgo, today]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-boxdark p-3">
      <div className="max-w-7xl mx-auto">
        {/* Simple Header */}
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            Work Report
          </h1>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total: {totalRecords}
          </div>
        </div>

        {/* Compact Filters Section */}
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

            <div className="lg:col-span-2">
              <input
                type="text"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search..."
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
              name="reassigned_stage"
              value={filters.reassigned_stage}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs border rounded bg-white dark:bg-gray-700"
            >
              <option value="">All Stages</option>
              {dropdownData.reassigned_stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
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
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left font-semibold w-12">S.No</th>
                  <th className="p-2 text-left font-semibold">Work Date</th>
                  <th className="p-2 text-left font-semibold">Employee</th>
                  <th className="p-2 text-left font-semibold">Client</th>
                  <th className="p-2 text-left font-semibold">Number</th>
                  <th className="p-2 text-left font-semibold">City</th>
                  <th className="p-2 text-left font-semibold">Stage</th>
                  <th className="p-2 text-left font-semibold">Category</th>
                  <th className="p-2 text-left font-semibold">Reference</th>
                  <th className="p-2 text-left font-semibold">Assigned By</th>
                  <th className="p-2 text-left font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={11} className="p-8 text-center">Loading...</td></tr>
                ) : !data.length ? (
                  <tr><td colSpan={11} className="p-8 text-center">No records found</td></tr>
                ) : (
                  data.map((row, index) => (
                <TableRow
  key={row.master_id}
  row={row}
  index={index}
  onCityClick={handleCityClick}
  onRemarkClick={handleRemarkClick}
  onClientClick={handleClientClick}
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

        {/* Simple Modal */}
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

export default EmployeeWorkReport;