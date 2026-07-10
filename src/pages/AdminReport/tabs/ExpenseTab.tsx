import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '/public/config';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import { FaFilePdf } from 'react-icons/fa';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DateWiseReportItem {
  expense_date: string;
  expense_date_formatted: string;
  total_expenses: number;
  total_amount: number | string;
  payment_modes: string;
}

interface EmployeeWiseReportItem {
  employee_name: string;
  employee_id: number;
  total_expense: number;
  no_of_expenses: number;
  average_expense: number;
  min_expense: number;
  max_expense: number;
  wallet_balance: number;
  total_credited: number;
}

interface CategoryWiseReportItem {
  category_name: string;
  total_expenses: number;
  total_amount: number;
  average_amount: number;
  unique_employees?: number;
}

interface VendorWiseReportItem {
  vendor_name: string;
  total_transactions: number;
  total_amount: number;
  average_amount: number;
  min_amount: number;
  max_amount: number;
  unique_employees?: number;
}

interface PaymentModeReportItem {
  payment_mode: string;
  total_transactions: number;
  total_amount: number;
  average_amount: number;
}

interface ReportSummary {
  total_transactions: number;
  total_amount: number;
  average_amount?: number;
  min_amount?: number;
  max_amount?: number;
  unique_employees?: number;
}

type ReportType = 'date_wise' | 'employee_wise' | 'category_wise' | 'vendor_wise' | 'payment_mode';

// ─── Component ───────────────────────────────────────────────────────────────

const ExpenseTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('date_wise');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');

  // Data states
  const [dateWiseData, setDateWiseData] = useState<DateWiseReportItem[]>([]);
  const [employeeWiseData, setEmployeeWiseData] = useState<EmployeeWiseReportItem[]>([]);
  const [categoryWiseData, setCategoryWiseData] = useState<CategoryWiseReportItem[]>([]);
  const [vendorWiseData, setVendorWiseData] = useState<VendorWiseReportItem[]>([]);
  const [paymentModeData, setPaymentModeData] = useState<PaymentModeReportItem[]>([]);

  const [summary, setSummary] = useState<ReportSummary>({
    total_transactions: 0,
    total_amount: 0,
  });

  // Filter options
  const [employees, setEmployees] = useState<{ user_id: number; name: string }[]>([]);
  const [categories, setCategories] = useState<{ category_id: number; category_name: string }[]>([]);
  const [vendors, setVendors] = useState<{ vendor_id: number; company_name: string; vendor_name: string }[]>([]);

  // ─── Helper Functions ──────────────────────────────────────────────────────

  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (value: number): string => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // ─── Fetch Data ────────────────────────────────────────────────────────────

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        from_date: fromDate,
        to_date: toDate,
      };

      // Add filters based on report type
      if (selectedEmployee) params.employee_id = selectedEmployee;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedVendor) params.vendor_id = selectedVendor;

      // Map report type to API endpoint
      const endpointMap: Record<ReportType, string> = {
        date_wise: `${BASE_URL}api/v1/reports/date_wise`,
        employee_wise: `${BASE_URL}api/v1/reports/employee_wise`,
        category_wise: `${BASE_URL}api/v1/reports/category_wise`,
        vendor_wise: `${BASE_URL}api/v1/reports/vendor_wise`,
        payment_mode: `${BASE_URL}api/v1/reports/payment_mode`,
      };

      const response = await axios.get(endpointMap[reportType], {
        params,
        withCredentials: true,
      });

      const data = response.data;

      // Set data based on report type
      switch (reportType) {
        case 'date_wise':
          setDateWiseData(data.data || []);
          break;
        case 'employee_wise':
          setEmployeeWiseData(data.data || []);
          if (data.employees) setEmployees(data.employees);
          break;
        case 'category_wise':
          setCategoryWiseData(data.data || []);
          break;
        case 'vendor_wise':
          setVendorWiseData(data.data || []);
          break;
        case 'payment_mode':
          setPaymentModeData(data.data || []);
          break;
      }

      // Safely set summary - only use fields that exist
      if (data.summary) {
        setSummary({
          total_transactions: safeNumber(data.summary.total_transactions),
          total_amount: safeNumber(data.summary.total_amount),
        });
      }

      // Load filter options from response
      if (data.employees) {
        setEmployees(data.employees);
      }

    } catch (error) {
      console.error('Error fetching expense report:', error);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, reportType, selectedEmployee, selectedCategory, selectedVendor]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch categories
      const categoriesRes = await axios.get(`${BASE_URL}api/v1/expense/categories`, {
        withCredentials: true,
      });
      if (categoriesRes.data?.data) {
        setCategories(categoriesRes.data.data);
      }

      // Fetch options (vendors, employees)
      const optionsRes = await axios.get(`${BASE_URL}api/v1/expense/options`, {
        withCredentials: true,
      });
      if (optionsRes.data?.data) {
        if (optionsRes.data.data.vendors) {
          setVendors(optionsRes.data.data.vendors);
        }
        if (optionsRes.data.data.employees) {
          setEmployees(optionsRes.data.data.employees);
        }
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // ─── Export Functions ──────────────────────────────────────────────────────

  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const params: any = {
        report_type: reportType,
        from_date: fromDate,
        to_date: toDate,
        format: 'excel',
      };
      if (selectedEmployee) params.employee_id = selectedEmployee;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedVendor) params.vendor_id = selectedVendor;

      const response = await axios.get(`${BASE_URL}api/v1/reports/export/excel`, {
        params,
        responseType: 'blob',
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense_report_${reportType}_${fromDate}_to_${toDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      const params: any = {
        report_type: reportType,
        from_date: fromDate,
        to_date: toDate,
      };
      if (selectedEmployee) params.employee_id = selectedEmployee;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedVendor) params.vendor_id = selectedVendor;

      const response = await axios.get(`${BASE_URL}api/v1/reports/export/pdf`, {
        params,
        responseType: 'blob',
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense_report_${reportType}_${fromDate}_to_${toDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // ─── Render Helper Functions ──────────────────────────────────────────────

  const renderSummaryCards = () => {
    const totalAmount = safeNumber(summary.total_amount);
    const totalTransactions = safeNumber(summary.total_transactions);

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-5">
        <div className="rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
          <p className="text-2xl font-bold text-black dark:text-white">{totalTransactions}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalAmount)}
          </p>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="mb-5 rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-black dark:text-white">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full rounded border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-black dark:text-white">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full rounded border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>
        {(reportType === 'employee_wise' || reportType === 'date_wise') && (
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.user_id} value={emp.user_id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {reportType === 'category_wise' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
        )}
        {reportType === 'vendor_wise' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white">Vendor</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full rounded border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            >
              <option value="">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.vendor_id} value={vendor.vendor_id}>
                  {vendor.vendor_name || vendor.company_name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={fetchReportData}
            disabled={loading}
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Apply
          </button>
          <button
            onClick={exportToExcel}
            disabled={exportLoading}
            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <FiDownload />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            disabled={exportLoading}
            className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <FaFilePdf />
            PDF
          </button>
        </div>
      </div>
    </div>
  );

  const renderDateWiseTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 dark:bg-gray-800">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-right">Total Expenses</th>
            <th className="p-3 text-right">Total Amount</th>
            <th className="p-3 text-left">Payment Modes</th>
          </tr>
        </thead>
        <tbody>
          {dateWiseData.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-10 text-center text-gray-500">
                No records found
              </td>
            </tr>
          ) : (
            dateWiseData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium">{item.expense_date_formatted}</td>
                <td className="p-3 text-right">{item.total_expenses}</td>
                <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(safeNumber(item.total_amount))}
                </td>
                <td className="p-3">{item.payment_modes || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderEmployeeWiseTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 dark:bg-gray-800">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Employee</th>
            <th className="p-3 text-right">Total Expense</th>
            <th className="p-3 text-right">No. of Expenses</th>
            <th className="p-3 text-right">Wallet Balance</th>
            <th className="p-3 text-right">Total Credited</th>
          </tr>
        </thead>
        <tbody>
          {employeeWiseData.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-10 text-center text-gray-500">
                No records found
              </td>
            </tr>
          ) : (
            employeeWiseData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium">{item.employee_name}</td>
                <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(safeNumber(item.total_expense))}
                </td>
                <td className="p-3 text-right">{item.no_of_expenses}</td>
                 <td className="p-3 text-right">
                  <span className={safeNumber(item.wallet_balance) < 0 ? 'text-red-600' : 'text-blue-600'}>
                    {formatCurrency(safeNumber(item.wallet_balance))}
                  </span>
                </td>
                <td className="p-3 text-right font-semibold text-purple-600">
                  {formatCurrency(safeNumber(item.total_credited))}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCategoryWiseTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 dark:bg-gray-800">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-right">Total Expenses</th>
            <th className="p-3 text-right">Total Amount</th>
             </tr>
        </thead>
        <tbody>
          {categoryWiseData.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-10 text-center text-gray-500">
                No records found
              </td>
            </tr>
          ) : (
            categoryWiseData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium">{item.category_name}</td>
                <td className="p-3 text-right">{item.total_expenses}</td>
                <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(safeNumber(item.total_amount))}
                </td>
                </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderVendorWiseTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 dark:bg-gray-800">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Vendor</th>
            <th className="p-3 text-right">Transactions</th>
            <th className="p-3 text-right">Total Amount</th>
            </tr>
        </thead>
        <tbody>
          {vendorWiseData.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-10 text-center text-gray-500">
                No records found
              </td>
            </tr>
          ) : (
            vendorWiseData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium">{item.vendor_name}</td>
                <td className="p-3 text-right">{item.total_transactions}</td>
                <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(safeNumber(item.total_amount))}
                </td>
               </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderPaymentModeTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 dark:bg-gray-800">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Payment Mode</th>
            <th className="p-3 text-right">Transactions</th>
            <th className="p-3 text-right">Total Amount</th>
            </tr>
        </thead>
        <tbody>
          {paymentModeData.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-10 text-center text-gray-500">
                No records found
              </td>
            </tr>
          ) : (
            paymentModeData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium capitalize">{item.payment_mode}</td>
                <td className="p-3 text-right">{item.total_transactions}</td>
                <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(safeNumber(item.total_amount))}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTable = () => {
    switch (reportType) {
      case 'date_wise':
        return renderDateWiseTable();
      case 'employee_wise':
        return renderEmployeeWiseTable();
      case 'category_wise':
        return renderCategoryWiseTable();
      case 'vendor_wise':
        return renderVendorWiseTable();
      case 'payment_mode':
        return renderPaymentModeTable();
      default:
        return renderDateWiseTable();
    }
  };

  const getReportTitle = () => {
    const titles: Record<ReportType, string> = {
      date_wise: 'Date Wise Expense Report',
      employee_wise: 'Employee Wise Expense Report',
      category_wise: 'Category Wise Expense Report',
      vendor_wise: 'Vendor Wise Expense Report',
      payment_mode: 'Payment Mode Expense Report',
    };
    return titles[reportType] || 'Expense Report';
  };

  const getDataCount = () => {
    switch (reportType) {
      case 'date_wise':
        return dateWiseData.length;
      case 'employee_wise':
        return employeeWiseData.length;
      case 'category_wise':
        return categoryWiseData.length;
      case 'vendor_wise':
        return vendorWiseData.length;
      case 'payment_mode':
        return paymentModeData.length;
      default:
        return 0;
    }
  };

  // ─── Main Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2 rounded-lg border border-stroke bg-white p-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        {(['date_wise', 'employee_wise', 'category_wise', 'vendor_wise', 'payment_mode'] as ReportType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              setReportType(type);
              setSelectedEmployee('');
              setSelectedCategory('');
              setSelectedVendor('');
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              reportType === type
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Summary Cards */}
      {getDataCount() > 0 && renderSummaryCards()}

      {/* Table */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center justify-between border-b border-stroke px-5 py-4 dark:border-strokedark">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            {getReportTitle()}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Showing {getDataCount()} records</span>
            <span>
              Period: {new Date(fromDate).toLocaleDateString('en-IN')} - {new Date(toDate).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading...</div>
        ) : (
          renderTable()
        )}
      </div>
    </div>
  );
};

export default ExpenseTab;