// import React, { useEffect, useState } from 'react';
// import { FaPlus, FaEye, FaHistory } from 'react-icons/fa';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
// import { BASE_URL } from '../../../public/config';

// const QuotationPending = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     fetchQuotationPending();
//   }, []);

//   const fetchQuotationPending = async () => {
//     try {
//       // Backend should return "created_flag" for each master_id
//       const res = await axios.get(`${BASE_URL}api/quotation-pending`);
//       setData(res.data);
//     } catch (error) {
//       console.error('Error fetching quotation pending leads', error);
//     }
//   };

//   const filteredData = data.filter(
//     (item) =>
//       item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.number?.includes(searchTerm),
//   );

//   return (
//     <div>
//       <Breadcrumb pageName="Quotation Pending" />

//       {/* Top Bar */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
//         <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="border rounded px-4 py-2 w-full sm:w-64"
//             placeholder="Search leads..."
//           />
//           <button className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto">
//             Search
//           </button>
//         </div>
//       </div>

//       <div className="max-w-full mt-2 overflow-x-auto rounded-sm border bg-white shadow-default">
//         <table className="w-full table-auto">
//           <thead>
//             <tr className="bg-gray-200 text-left">
//               <th className="py-4 px-4">Sr No.</th>
//               <th className="py-4 px-4">Name</th>
//               <th className="py-4 px-4">Contact</th>
//               <th className="py-4 px-4">Lead Stage</th>
//               <th className="py-4 px-4">Assigned To</th>
//               <th className="py-4 px-4">Category</th>
//               <th className="py-4 px-4">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredData.length > 0 ? (
//               filteredData.map((row, index) => (
//                 <tr key={row.master_id}>
//                   <td className="py-3 px-4">{index + 1}</td>
//                   <td className="py-3 px-4 font-medium">{row.name}</td>
//                   <td className="py-3 px-4">{row.number || 'N/A'}</td>
//                   <td className="py-3 px-4">
//                     {row.created_flag ? (
//                       <span className="inline-flex rounded-full py-1 px-3 text-sm font-medium bg-green-600 bg-opacity-10 text-green-600">
//                         Quotation Created
//                       </span>
//                     ) : (
//                       <span className="inline-flex rounded-full py-1 px-3 text-sm font-medium bg-yellow-500 bg-opacity-10 text-yellow-600">
//                         {row.lead_stage}
//                       </span>
//                     )}
//                   </td>

//                   <td className="py-3 px-4">
//                     {row.latest_assignedTo || row.assigned_to}
//                   </td>
//                   <td className="py-3 px-4">{row.cat_name}</td>

//                   <td className="py-3 px-4">
//                     <div className="flex flex-wrap gap-2">
//                       {/* ADD QUOTATION BUTTON */}
//                       <button
//                         className={`px-3 py-1 rounded text-white ${
//                           row.created_flag
//                             ? 'bg-gray-400 cursor-not-allowed'
//                             : 'bg-blue-600'
//                         }`}
//                         title={
//                           row.created_flag
//                             ? 'Quotation already created'
//                             : 'Add Quotation'
//                         }
//                         onClick={() =>
//                           !row.created_flag &&
//                           navigate(`/quotation/add/${row.master_id}`, {
//                             state: { name: row.name },
//                           })
//                         }
//                         disabled={row.created_flag}
//                       >
//                         <FaPlus />
//                       </button>

//                       {/* <button
//                         className="bg-green-600 border border-white-600 text-white px-3 py-1 rounded"
//                         title="View Lead"
//                         onClick={() => navigate(`/lead/view/${row.master_id}`)}
//                       >
//                         <FaEye />
//                       </button> */}

//                       <button
//                         className="bg-gray-600 text-white px-3 py-1 rounded"
//                         title="View Logs"
//                         onClick={() =>
//                           navigate(`/quotation/revisions/${row.master_id}`)
//                         }
//                       >
//                         <FaEye />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={8} className="text-center py-5">
//                   No quotation pending leads found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default QuotationPending;



import React, { useEffect, useState } from 'react';
import { FaPlus, FaEye, FaHistory, FaSearch, FaFilter } from 'react-icons/fa';
import { MdPerson, MdPhone, MdCategory } from 'react-icons/md';
import { HiDocumentText } from 'react-icons/hi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config';

const QuotationPending = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotationPending();
  }, []);

  const fetchQuotationPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}api/quotation-pending`);
      setData(res.data);
    } catch (error) {
      console.error('Error fetching quotation pending leads', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.number?.includes(searchTerm) ||
      item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cat_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-boxdark min-h-screen">
      <Breadcrumb pageName="Quotation Pending" />

      {/* Top Bar with Search */}
      <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Section */}
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="Search by name, contact, city or category..."
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total:</span>
              <span className="font-bold text-gray-900 dark:text-white px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">
                {data.length} leads
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Filtered:</span>
              <span className="font-bold text-gray-900 dark:text-white px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded">
                {filteredData.length} leads
              </span>
            </div>
            <button 
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              onClick={fetchQuotationPending}
            >
              <FaHistory className="text-sm" />
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-left">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Sr No.</span>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <MdPerson className="text-gray-600 dark:text-gray-400 text-sm" />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Client Details</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <MdPhone className="text-gray-600 dark:text-gray-400 text-sm" />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Contact</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-left">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Lead Stage</span>
                </th>
                <th className="py-3 px-4 text-left">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Assigned To</span>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <MdCategory className="text-gray-600 dark:text-gray-400 text-sm" />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Category</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <HiDocumentText className="text-gray-600 dark:text-gray-400 text-sm" />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Loading leads...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr 
                    key={row.master_id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                  >
                    {/* Serial Number */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {index + 1}
                        </span>
                      </div>
                    </td>

                    {/* Client Details */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <div className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                          {row.name}
                        </div>
                        {row.city && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                            {row.city}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        {row.number || 'N/A'}
                      </div>
                    </td>

                    {/* Lead Stage */}
                    <td className="py-3 px-4">
                      {row.created_flag ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border border-green-200 dark:border-green-700/30">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-semibold text-green-700 dark:text-green-300 text-xs">
                            Quotation Created
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700/30">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="font-semibold text-yellow-700 dark:text-yellow-300 text-xs">
                            {row.lead_stage || 'Pending'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Assigned To */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white text-sm bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800/30">
                        {row.latest_assignedTo || row.assigned_to || 'Unassigned'}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white text-sm bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-800/30">
                        {row.cat_name || 'N/A'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {/* ADD QUOTATION BUTTON */}
                        <button
                          className={`flex items-center justify-center p-2 rounded-lg font-medium transition-all duration-200 ${
                            row.created_flag
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
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
                          <FaPlus className="text-sm" />
                        </button>

                        {/* VIEW REVISIONS BUTTON */}
                        <button
                          className="flex items-center justify-center p-2 rounded-lg font-medium bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          title="View Quotation Logs"
                          onClick={() =>
                            navigate(`/quotation/revisions/${row.master_id}`)
                          }
                        >
                          <FaEye className="text-sm" />
                        </button>
                        
                        {/* VIEW LEAD BUTTON (Optional - uncomment if needed) */}
                        {/* <button
                          className="flex items-center justify-center p-2 rounded-lg font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          title="View Lead"
                          onClick={() => navigate(`/lead/view/${row.master_id}`)}
                        >
                          <FaEye className="text-sm" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                        <FaSearch className="text-gray-400 dark:text-gray-500 text-xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        No leads found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {searchTerm 
                          ? `No results for "${searchTerm}"` 
                          : 'No quotation pending leads available'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold">{filteredData.length}</span> of{' '}
              <span className="font-bold">{data.length}</span> leads
            </div>
            
            {filteredData.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Quotations Created:</span>
                  <span className="ml-2 font-bold text-green-600 dark:text-green-400">
                    {data.filter(item => item.created_flag).length}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                  <span className="ml-2 font-bold text-yellow-600 dark:text-yellow-400">
                    {data.filter(item => !item.created_flag).length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPending;