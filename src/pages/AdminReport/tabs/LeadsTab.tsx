import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '/public/config.js';
import * as XLSX from 'xlsx';
import { FiDownload } from 'react-icons/fi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverviewReport {
  employee: string;
  fresh: number;
  cold: number;
  on_hold: number;
  positive_leads: number;
  site_visit: number;
  demo: number;
  quotation: number;
  closed: number;
  dropped: number;
}

interface DetailRow {
  master_id: number;
  name: string;
  number: string;
  city: string;
  leadStage: string;
  created_at: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const LeadsTab: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];

  const [reportData, setReportData] = useState<OverviewReport[]>([]);
  const [employeeList, setEmployeeList] = useState<string[]>([]);
  const [details, setDetails] = useState<DetailRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [filters, setFilters] = useState({
    fromDate: today,
    toDate: today,
    employee: '',
  });

  const [summary, setSummary] = useState({

    closed_leads: 0,
    dropped_leads: 0,
  });

  const [modal, setModal] = useState({
    open: false,
    title: '',
  });

  // ─── API Calls ─────────────────────────────────────────────────────────────

  const fetchReport = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}api/report/admin/overview-report`,
        {
          params: filters,
          withCredentials: true,
        },
      );

      const data = res.data;
      setReportData(data.data || []);
      setEmployeeList(data.employees || []);
      
      // Calculate summary from data
      if (data.data && data.data.length > 0) {
        const closedLeads = data.data.reduce((sum:any, item:any) => sum + item.closed, 0);
        const droppedLeads = data.data.reduce((sum:any , item:any) => sum + item.dropped, 0);
        
        setSummary({
          closed_leads: closedLeads,
          dropped_leads: droppedLeads,
        });
      } else {
        setSummary({
          closed_leads: 0,
          dropped_leads: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (employee: string, stage: string) => {
    try {
      setDetailLoading(true);

      const res = await axios.get(
        `${BASE_URL}api/report/admin/overview-report/details`,
        {
          params: {
            employee,
            stage,
            fromDate: filters.fromDate,
            toDate: filters.toDate,
          },
          withCredentials: true,
        },
      );
      console.log('Fetching details for:', { employee, stage, fromDate: filters.fromDate, toDate: filters.toDate });
console.log('Details response:', res.data);
      setDetails(res.data.data || []);
      setModal({
        open: true,
        title: `${employee} - ${stage}`,
      });
    } catch (error) {
      console.error('Error fetching details:', error);
      setDetails([]);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  // ─── Export ────────────────────────────────────────────────────────────────

  const exportToExcel = () => {
    try {
      setExportLoading(true);

      const exportData = reportData.map((item) => ({
        Employee: item.employee,
    
        Fresh: item.fresh,
        Cold: item.cold,
        'On Hold': item.on_hold,
        Positive: item.positive_leads,
        'Site Visit': item.site_visit,
        Demo: item.demo,
        Quotation: item.quotation,
        Closed: item.closed,
        Dropped: item.dropped,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin Overview Report');
      XLSX.writeFile(
        workbook,
        `admin_overview_report_${new Date().toISOString().split('T')[0]}.xlsx`,
      );
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Filters */}
      <div className="mb-5 rounded-lg border bg-white p-4 shadow-default dark:bg-boxdark">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters({
                ...filters,
                fromDate: e.target.value,
              })
            }
            className="rounded border px-3 py-2 dark:border-strokedark dark:bg-form-input dark:text-white"
          />

          <input
            type="date"
            value={filters.toDate}
            onChange={(e) =>
              setFilters({
                ...filters,
                toDate: e.target.value,
              })
            }
            className="rounded border px-3 py-2 dark:border-strokedark dark:bg-form-input dark:text-white"
          />

          <select
            value={filters.employee}
            onChange={(e) =>
              setFilters({
                ...filters,
                employee: e.target.value,
              })
            }
            className="rounded border px-3 py-2 dark:border-strokedark dark:bg-form-input dark:text-white"
          >
            <option value="">All Employees</option>
            {employeeList.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Apply'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Closed Leads', value: summary.closed_leads },
          { title: 'Dropped Leads', value: summary.dropped_leads },
        ].map((stat, index) => (
          <div
            key={index}
            className="rounded-lg border bg-white p-4 shadow-default dark:bg-boxdark"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.title}
            </p>
            <p className="text-2xl font-bold text-black dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke px-5 py-4 dark:border-strokedark">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Employee Performance Overview
          </h2>
          <button
            onClick={exportToExcel}
            disabled={exportLoading || reportData.length === 0}
            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <FiDownload />
            {exportLoading ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="p-3 text-left">Employee</th>
                
                  <th className="p-3 text-center">Fresh</th>
                  <th className="p-3 text-center">Cold</th>
                  <th className="p-3 text-center">On Hold</th>
                  <th className="p-3 text-center">Positive</th>
                  <th className="p-3 text-center">Site Visit</th>
                  <th className="p-3 text-center">Demo</th>
                  <th className="p-3 text-center">Quotation</th>
                  <th className="p-3 text-center">Closed</th>
                  <th className="p-3 text-center">Dropped</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-10 text-center text-gray-500">
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  reportData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-3 font-medium text-black dark:text-white">
                        {item.employee}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchDetails(item.employee, 'Fresh Lead')}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {item.fresh}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchDetails(item.employee, 'Cold Lead')}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {item.cold}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchDetails(item.employee, 'On Hold')}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {item.on_hold}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchDetails(item.employee, 'Positive Lead')}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {item.positive_leads}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchDetails(item.employee, 'Site Visit')}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {item.site_visit}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchDetails(item.employee, 'Demo')}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {item.demo}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchDetails(item.employee, 'Quotation')}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {item.quotation}
                        </button>
                      </td>
                      <td className="p-3 text-center font-semibold text-green-600">
                        <button
                          onClick={() => fetchDetails(item.employee, 'Closed')}
                          className="hover:underline"
                        >
                          {item.closed}
                        </button>
                      </td>
                      <td className="p-3 text-center font-semibold text-red-600">
                        <button
                          onClick={() => fetchDetails(item.employee, 'Dropped')}
                          className="hover:underline"
                        >
                          {item.dropped}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60">
          <div className="w-[95%] max-w-6xl rounded-lg bg-white p-5 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black dark:text-white">
                {modal.title}
              </h2>
              <button
                onClick={() =>
                  setModal({
                    open: false,
                    title: '',
                  })
                }
                className="text-red-600 hover:text-red-700"
              >
                Close
              </button>
            </div>

            {detailLoading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="max-h-[600px] overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="p-2 text-left">Lead ID</th>
                      <th className="p-2 text-left">Client</th>
                      <th className="p-2 text-left">Contact</th>
                      <th className="p-2 text-left">City</th>
                      <th className="p-2 text-left">Stage</th>
                      <th className="p-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-gray-500">
                          No details found
                        </td>
                      </tr>
                    ) : (
                      details.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-2">{row.master_id}</td>
                          <td className="p-2 font-medium">{row.name}</td>
                          <td className="p-2">{row.number}</td>
                          <td className="p-2">{row.city}</td>
                          <td className="p-2">
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              {row.leadStage}
                            </span>
                          </td>
                          <td className="p-2">
                            {new Date(row.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTab;