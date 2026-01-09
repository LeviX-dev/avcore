import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import { useParams } from 'react-router-dom';

type CallDataType = {
  tc_call_duration?: string;
  tc_remark?: string;
};

const CallReport = () => {
  const [report, setReport] = useState([]);
  const [filteredReport, setFilteredReport] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [callerSearch, setCallerSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [dateSearch, setDateSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [callData, setCallData] = useState<CallDataType>({});
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${BASE_URL}api/report/data`);

        const dataArray = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
        setReport(dataArray);
        setFilteredReport(dataArray);
      } catch (err) {
        console.error('Error fetching report:', err);
      }
    };
    fetchReport();
  }, []);

  const fetchReportView = async (masterId) => {
    try {
      const res = await axios.get(`${BASE_URL}api/report/${masterId}`);
      setCallData(res.data);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/category`);
        const activeCategories = response.data.filter(
          (cat) => cat.status === 'active',
        );
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);


  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const lowerCaller = callerSearch.toLowerCase();
    const lowerCategory = categorySearch.toLowerCase();

    const results = report.filter((item) => {
      // Format assign_date to local YYYY-MM-DD
      const formattedAssignDate = item.assign_date
        ? new Date(item.assign_date).toLocaleDateString('en-CA')
        : '';

      const matchesDateRange =
        (!fromDate || formattedAssignDate >= fromDate) &&
        (!toDate || formattedAssignDate <= toDate);

      return (
        (!searchTerm ||
          item.assign_id?.toString().includes(searchTerm) ||
          item.client_name?.toLowerCase().includes(lowerSearch) ||
          item.category_name?.toLowerCase().includes(lowerSearch) ||
          item.product_name?.toLowerCase().includes(lowerSearch) ||
          item.call_status?.toLowerCase().includes(lowerSearch) ||
          item.lead_status?.toLowerCase().includes(lowerSearch)) &&
        (!callerSearch ||
          item.caller_name?.toLowerCase().includes(lowerCaller)) &&
        (!categorySearch ||
          item.category_name?.toLowerCase().includes(lowerCategory)) &&
        matchesDateRange
      );
    });

    setFilteredReport(results);
  }, [searchTerm, callerSearch, categorySearch, fromDate, toDate, report]);


const exportToExcel = () => {
  // Generate keys in the same format as selectedRows
  const selectedData = filteredReport.filter((item, index) =>
    selectedRows.includes(`${item.assign_id}-${index}`)
  );

  if (selectedData.length === 0) {
    alert("No rows selected");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(selectedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SelectedData');

  XLSX.writeFile(workbook, 'CallReport.xlsx');
};





  return (
    <div className="p-4">
      <Breadcrumb pageName="Report List" />

      <div className="flex justify-end mb-4">
        <button
          className="p-3 rounded bg-blue-700 text-white"
          onClick={exportToExcel}
          disabled={selectedRows.length === 0}
        >
          Export to Excel
        </button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Search by any field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.cat_id} value={cat.cat_name}>
                {cat.cat_name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium mb-1">From Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium mb-1">To Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto min-w-[700px]">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="py-4 px-4 font-medium text-black">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(
                        filteredReport.map(
                          (item, idx) => `${item.assign_id}-${idx}`,
                        ),
                      );
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                  checked={
                    filteredReport.length > 0 &&
                    selectedRows.length === filteredReport.length
                  }
                />
              </th>
              <th className="py-4 px-4 font-medium text-black">Assign Date</th>
              <th className="py-4 px-4 font-medium text-black">Assign ID</th>
              <th className="py-4 px-4 font-medium text-black">Client Name</th>
              <th className="py-4 px-4 font-medium text-black">Category</th>
              <th className="py-4 px-4 font-medium text-black">Product</th>
              <th className="py-4 px-4 font-medium text-black">Call Status</th>
              <th className="py-4 px-4 font-medium text-black">Lead Status</th>
              <th className="py-4 px-4 font-medium text-black">Caller</th>
              <th className="py-4 px-4 font-medium text-black">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReport.length > 0 ? (
              filteredReport.map((item, index) => {
                const rowKey = `${item.assign_id}-${index}`;
                return (
                  <tr key={rowKey} className="border-b">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(rowKey)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows((prev) => [...prev, rowKey]);
                          } else {
                            setSelectedRows((prev) =>
                              prev.filter((id) => id !== rowKey),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      {item.assign_date
                        ? new Date(item.assign_date).toLocaleDateString('en-GB')
                        : ''}
                    </td>
                    <td className="py-3 px-4">{item.assign_id}</td>
                    <td className="py-3 px-4">{item.client_name}</td>
                    <td className="py-3 px-4">{item.category_name}</td>
                    <td className="py-3 px-4">{item.product_name}</td>
                    <td className="py-3 px-4">{item.call_status}</td>
                    <td className="py-3 px-4">{item.lead_status}</td>
                    <td className="py-3 px-4">{item.caller_name}</td>
                    <td className="py-3 px-4">
                      <button
                        className="inline-flex items-center justify-center rounded-md py-1 px-3 text-white bg-blue-600 hover:bg-blue-700"
                        title="View Details"
                        onClick={() => fetchReportView(item.master_id)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-4">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
              <h2 className="text-lg font-semibold mb-2">Call Details</h2>
              <p>
                <strong>Call Duration:</strong>{' '}
                {callData.tc_call_duration || 'N/A'} sec
              </p>
              <p>
                <strong>Remark:</strong>{' '}
                {callData.tc_remark || 'No remark available'}
              </p>
              <button
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallReport;
