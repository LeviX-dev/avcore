import React, { useEffect, useState } from 'react';
import { FaPlus, FaEye, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config';

const QuotationPending = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuotationPending();
  }, []);

  const fetchQuotationPending = async () => {
    try {
      // Backend should return "created_flag" for each master_id
      const res = await axios.get(`${BASE_URL}api/quotation-pending`);
      setData(res.data);
    } catch (error) {
      console.error('Error fetching quotation pending leads', error);
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.number?.includes(searchTerm),
  );

  return (
    <div>
      <Breadcrumb pageName="Quotation Pending" />

      {/* Top Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-4 py-2 w-full sm:w-64"
            placeholder="Search leads..."
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto">
            Search
          </button>
        </div>
      </div>

      <div className="max-w-full mt-2 overflow-x-auto rounded-sm border bg-white shadow-default">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="py-4 px-4">Sr No.</th>
              <th className="py-4 px-4">Name</th>
              <th className="py-4 px-4">Contact</th>
              <th className="py-4 px-4">Lead Stage</th>
              <th className="py-4 px-4">Assigned To</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={row.master_id}>
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{row.name}</td>
                  <td className="py-3 px-4">{row.number || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {row.created_flag ? (
                      <span className="inline-flex rounded-full py-1 px-3 text-sm font-medium bg-green-600 bg-opacity-10 text-green-600">
                        Quotation Created
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full py-1 px-3 text-sm font-medium bg-yellow-500 bg-opacity-10 text-yellow-600">
                        {row.lead_stage}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {row.latest_assignedTo || row.assigned_to}
                  </td>
                  <td className="py-3 px-4">{row.cat_name}</td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      {/* ADD QUOTATION BUTTON */}
                      <button
                        className={`px-3 py-1 rounded text-white ${
                          row.created_flag
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600'
                        }`}
                        title={
                          row.created_flag
                            ? 'Quotation already created'
                            : 'Add Quotation'
                        }
                        onClick={() =>
                          !row.created_flag &&
                          navigate(`/quotation/add/${row.master_id}`, {
                            state: { name: row.name },
                          })
                        }
                        disabled={row.created_flag}
                      >
                        <FaPlus />
                      </button>

                      <button
                        className="bg-green-600 border border-white-600 text-white px-3 py-1 rounded"
                        title="View Lead"
                        onClick={() => navigate(`/lead/view/${row.master_id}`)}
                      >
                        <FaEye />
                      </button>

                      <button
                        className="bg-gray-600 text-white px-3 py-1 rounded"
                        title="View Logs"
                        onClick={() => console.log(row.reassignment_remarks)}
                      >
                        <FaHistory />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-5">
                  No quotation pending leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotationPending;