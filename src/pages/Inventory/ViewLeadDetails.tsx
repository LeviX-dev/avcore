// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import {
//   FaEye,
//   FaFileInvoice,
//   FaArrowLeft,
//   FaInfoCircle,
// } from 'react-icons/fa';
// import { MdDateRange } from 'react-icons/md';
// import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
// import axios from 'axios';
// import { BASE_URL } from '../../../public/config';

// const ViewLeadDetails = () => {
//   const navigate = useNavigate();
//   const { master_id } = useParams();
//   const [mrnList, setMrnList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedMRN, setSelectedMRN] = useState(null);
//   const [issueData, setIssueData] = useState([]);


//   const handleViewMRN = (mrnNumber) => {
//     navigate(`/mrn/view/${mrnNumber}`);
//   };

//   const handleIssueMRN = async (mrn_id) => {
//     try {
//       const res = await axios.get(`${BASE_URL}api/mrn-details-by-id/${mrn_id}`);

//       // console.log("res",res)

//       if (res.data.success) {
//         setSelectedMRN(res.data.data);

//         // prepare issue qty array
//         const formatted = res.data.data.products.map((p) => ({
//           mpm_id: p.mpm_id,
//           model_id: p.model_id,
//           model_no: p.model_no,
//           required_qty: p.required_qty,
//           available_qty: p.available_qty,
//           issued_qty: p.issued_qty,
//           pending_qty: p.pending_qty,
//           is_fully_issued: p.is_fully_issued,
//           status: p.status || 'Pending',
//           issue_qty: 0,
//         }));
//         setIssueData(formatted);
//         setShowModal(true);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleQtyChange = (index, value) => {
//     const updated = [...issueData];

//     updated[index].issue_qty = value === '' ? 0 : Number(value);
//     setIssueData(updated);
//   };

//   const handleSubmitIssue = async () => {
//     for (let item of issueData) {
//       if (item.issue_qty > item.available_qty) {
//         alert(`Issue qty cannot exceed available stock for ${item.model_no}`);
//         return;
//       }
//     }

//     try {
//       await axios.post(`${BASE_URL}api/issue-items`, {
//         mrn_id: selectedMRN.mrn_id,
//         items: issueData,
//       });

//       alert('Items issued successfully');
//       setShowModal(false);
//       fetchMRNList();
//     } catch (err) {
//       console.error(err);
//       alert('Error issuing items');
//     }
//   };

//   const handleSendForPurchase = async (items) => {
//     try {
//       const payload = items
//         .filter((item) => item.purchase_qty > 0)
//         .map((item) => {
//           /* =========================
//            ✅ CALCULATE REAL PENDING
//         ========================== */
//           const actualPending =
//             item.required_qty -
//             (item.issued_qty || 0) -
//             (item.requested_qty || 0);

//           if (item.purchase_qty > actualPending) {
//             throw new Error(`${item.model_no} exceeds available qty`);
//           }

//           return {
//             mpm_id: item.mpm_id,
//             purchase_qty: item.purchase_qty,
//           };
//         });

//       if (payload.length === 0) {
//         alert('Please enter purchase qty');
//         return;
//       }

//       const res = await axios.post(`${BASE_URL}api/send-for-purchase`, {
//         items: payload,
//       });

//       console.log('payload', payload);
//       /* =========================
//        ✅ UPDATE UI STATE (CORRECT)
//     ========================== */

//       const updatedData = issueData.map((item) => {
//         const matched = payload.find((p) => p.mpm_id === item.mpm_id);

//         if (!matched) return item;

//         const newRequestedQty =
//           (item.requested_qty || 0) + matched.purchase_qty;

//         const newPendingQty =
//           item.required_qty - (item.issued_qty || 0) - newRequestedQty;

//         return {
//           ...item,
//           requested_qty: newRequestedQty,
//           pending_qty: newPendingQty > 0 ? newPendingQty : 0,
//           purchase_qty: 0,

//           purchase_status:
//             newPendingQty === 0 ? 'Fully Requested' : 'Partial Requested',
//         };
//       });

//       setIssueData(updatedData);

//       /* =========================
//        RESPONSE HANDLING
//     ========================== */

//       if (res.data.alreadyRequestedItems.length > 0) {
//         alert('Some items already fully requested');
//       }

//       if (res.data.successItems.length > 0) {
//         alert('Items sent for purchase successfully');
//       }
//     } catch (err) {
//       console.error(err);
//       alert(err.message || 'Error sending for purchase');
//     }
//   };

//   const handlePurchaseQtyChange = (index, value) => {
//     const updatedData = [...issueData];

//     let qty = parseInt(value);
//     if (isNaN(qty) || qty < 0) qty = 0;

//     const item = updatedData[index];

//     const actualPending =
//       item.required_qty - (item.issued_qty || 0) - (item.requested_qty || 0);

//     if (qty > actualPending) qty = actualPending;

//     updatedData[index].purchase_qty = qty;

//     setIssueData(updatedData);
//   };

//   const formatMRNDate = (mrnNumber) => {
//     // Extract timestamp from MRN number (MRN1773726384899)
//     const timestamp = mrnNumber.replace('MRN', '');
//     if (timestamp && timestamp.length > 0) {
//       const date = new Date(parseInt(timestamp));
//       return date.toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       });
//     }
//     return 'N/A';
//   };

//   if (loading) {
//     return (
//       <div className="p-4 md:p-6 bg-gray-50 dark:bg-boxdark min-h-screen">
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6 bg-gray-50 dark:bg-boxdark min-h-screen">
//       {/* TOP BAR */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
//         >
//           <FaArrowLeft />
//           <span className="font-medium">Back</span>
//         </button>

//         {/* Header Info Card */}
//         <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex-1 max-w-2xl">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//               <FaFileInvoice className="text-blue-600 dark:text-blue-400 text-xl" />
//             </div>
//             <div>
//               <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//                 Material Receipt Notes
//               </h3>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Master ID: {master_id} • {mrnList.length} MRN
//                 {mrnList.length !== 1 ? 's' : ''} found
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Breadcrumb pageName="MRN List" />

//       {/* MRN LIST TABLE */}
//       <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
//         {error && (
//           <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
//             <p className="text-red-600 dark:text-red-400">{error}</p>
//           </div>
//         )}

//         {mrnList.length === 0 ? (
//           <div className="text-center py-16 px-4">
//             <div className="mb-4">
//               <FaFileInvoice className="mx-auto text-gray-400 text-5xl" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//               No MRNs Found
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-6">
//               There are no Material Receipt Notes for this master ID.
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
//                     <th className="py-4 px-6 text-left">
//                       <div className="flex items-center gap-2">
//                         <span className="font-semibold text-gray-900 dark:text-white">
//                           S.No
//                         </span>
//                       </div>
//                     </th>
//                     <th className="py-4 px-6 text-left">
//                       <div className="flex items-center gap-2">
//                         <FaFileInvoice className="text-gray-600 dark:text-gray-400" />
//                         <span className="font-semibold text-gray-900 dark:text-white">
//                           MRN Number
//                         </span>
//                       </div>
//                     </th>
//                     <th className="py-4 px-6 text-left">
//                       <div className="flex items-center gap-2">
//                         <MdDateRange className="text-gray-600 dark:text-gray-400" />
//                         <span className="font-semibold text-gray-900 dark:text-white">
//                           Created Date
//                         </span>
//                       </div>
//                     </th>
//                     {/* <th className="py-4 px-6 text-left">
//                       <div className="flex items-center gap-2">
//                         <FaInfoCircle className="text-gray-600 dark:text-gray-400" />
//                         <span className="font-semibold text-gray-900 dark:text-white">
//                           MRN ID
//                         </span>
//                       </div>
//                     </th> */}
//                     <th className="py-4 px-6 text-left">
//                       <span className="font-semibold text-gray-900 dark:text-white">
//                         Actions
//                       </span>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//                   {mrnList.map((mrn, index) => (
//                     <tr
//                       key={mrn.mrn_id}
//                       className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 group"
//                     >
//                       {/* Serial Number */}
//                       <td className="py-4 px-6">
//                         <span className="text-sm font-medium text-gray-900 dark:text-white">
//                           {(index + 1).toString().padStart(2, '0')}
//                         </span>
//                       </td>

//                       {/* MRN Number */}
//                       <td className="py-4 px-6">
//                         <div className="flex flex-col">
//                           <span className="font-medium text-gray-900 dark:text-white">
//                             {mrn.mrn_number}
//                           </span>
//                         </div>
//                       </td>

//                       {/* Created Date */}
//                       <td className="py-4 px-6">
//                         <div className="flex items-center gap-2">
//                           <span className="text-sm text-gray-600 dark:text-gray-400">
//                             {formatMRNDate(mrn.mrn_number)}
//                           </span>
//                         </div>
//                       </td>

//                       {/* MRN ID */}
//                       {/* <td className="py-4 px-6">
//                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
//                           ID: {mrn.mrn_id}
//                         </span>
//                       </td> */}

//                       {/* Actions */}
//                       <td className="py-4 px-6">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleIssueMRN(mrn.mrn_id)}
//                             className="bg-green-600 text-white px-3 py-1 rounded"
//                           >
//                             Issue MRN
//                           </button>
//                           <button
//                             onClick={() => handleViewMRN(mrn.mrn_number)}
//                             className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
//                             title="View MRN Details"
//                           >
//                             <FaEye className="text-sm" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {showModal && selectedMRN && (
//               <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
//                 <div className="bg-white rounded-xl shadow-xl ml-20  w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
//                   {/* Header */}
//                   <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
//                     <div>
//                       <h2 className="text-xl font-semibold text-gray-800">
//                         Issue Materials
//                       </h2>
//                       <p className="text-sm text-gray-500 mt-0.5">
//                         MRN:{' '}
//                         <span className="font-medium text-blue-600">
//                           {selectedMRN.mrn_number}
//                         </span>
//                       </p>
//                     </div>
//                     <button
//                       onClick={() => setShowModal(false)}
//                       className="text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                     </button>
//                   </div>

//                   {/* Table Section */}
//                   <div className="flex-1 overflow-auto p-6">
//                     <table className="w-full border border-gray-200 rounded-lg  overflow-hidden">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Model
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Required
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             In Stock
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Issue Qty
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                             Pending
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                             Purchase Qty
//                           </th>
//                           <th>Status</th>
//                         </tr>
//                       </thead>

//                       <tbody className="divide-y divide-gray-200">
//                         {issueData.map((item, index) => {
//                           const isCompleted = item.is_fully_issued === 1;
//                           const isOutOfStock = item.available_qty === 0;

//                           return (
//                             <tr key={item.mpm_id}>
//                               <td>{item.model_no}</td>

//                               <td>{item.required_qty}</td>

//                               <td
//                                 className={
//                                   isOutOfStock
//                                     ? 'text-red-600'
//                                     : 'text-green-600'
//                                 }
//                               >
//                                 {item.available_qty}
//                               </td>

//                               <td>
//                                 <input
//                                   type="number"
//                                   value={
//                                     item.issue_qty === 0 ? '' : item.issue_qty
//                                   }
//                                   disabled={isOutOfStock || isCompleted}
//                                   onChange={(e) =>
//                                     handleQtyChange(index, e.target.value)
//                                   }
//                                   className={`border p-1 w-20 no-spinner ${
//                                     isCompleted ? 'bg-green-100' : ''
//                                   }`}
//                                   placeholder="0"
//                                 />
//                               </td>

//                               <td
//                                 className={
//                                   item.pending_qty > 0
//                                     ? 'text-orange-600 font-semibold'
//                                     : 'text-green-600 font-semibold'
//                                 }
//                               >
//                                 {item.required_qty -
//                                   (item.issued_qty || 0) -
//                                   (item.requested_qty || 0)}
//                               </td>

//                               <td>
//                                 <input
//                                   type="number"
//                                   value={item.purchase_qty || ''}
//                                   min="0"
//                                   max={item.pending_qty}
//                                   onChange={(e) =>
//                                     handlePurchaseQtyChange(
//                                       index,
//                                       e.target.value,
//                                     )
//                                   }
//                                   className="border p-1 w-20 no-spinner"
//                                   placeholder="0"
//                                   disabled={item.pending_qty === 0}
//                                 />
//                               </td>

//                               {/* ✅ STATUS */}
//                               <td>
//                                 {item.status === 'Issued' ? (
//                                   <span className="text-green-600 font-semibold">
//                                     Issued
//                                   </span>
//                                 ) : item.status === 'Approval Pending' ? (
//                                   <span className="text-blue-600 font-semibold">
//                                     Approval Pending
//                                   </span>
//                                 ) : item.status === 'Out of Stock' ? (
//                                   <span className="text-red-600 font-semibold">
//                                     Out of Stock
//                                   </span>
//                                 ) : item.status === 'Purchased' ? (
//                                   <span className="text-purple-600 font-semibold">
//                                     Purchased
//                                   </span>
//                                 ) : (
//                                   <span className="text-yellow-600 font-semibold">
//                                     Pending
//                                   </span>
//                                 )}
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Footer with Actions */}
//                   <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
//                     <div className="flex justify-end gap-3">
//                       <button
//                         onClick={() => setShowModal(false)}
//                         className="px-4 py-2 bg-gray-300 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
//                       >
//                         Cancel
//                       </button>

//                       <button
//                         onClick={() => handleSendForPurchase(issueData)}
//                         className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center"
//                       >
//                         <svg
//                           className="w-4 h-4 mr-2"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
//                           />
//                         </svg>
//                         Send for Purchase
//                       </button>

//                       <button
//                         onClick={handleSubmitIssue}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
//                       >
//                         <svg
//                           className="w-4 h-4 mr-2"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M5 13l4 4L19 7"
//                           />
//                         </svg>
//                         Issue Items
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             {/* Summary Footer */}
//             <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
//               <div className="flex items-center justify-between">
//                 <div className="text-sm text-gray-600 dark:text-gray-400">
//                   Showing{' '}
//                   <span className="font-semibold">{mrnList.length}</span> MRN
//                   records
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
//                     Total: {mrnList.length} MRN{mrnList.length !== 1 ? 's' : ''}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewLeadDetails;


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaEye,
  FaFileInvoice,
  FaArrowLeft,
  FaInfoCircle,
} from 'react-icons/fa';
import { MdDateRange } from 'react-icons/md';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';

// MRN Item (product)
type MRNItem = {
  mpm_id: number;
  model_no: string;
  brand_name?: string;

  required_qty: number;
  available_qty: number;

  issued_qty?: number;
  requested_qty?: number;

  issue_qty?: number;
  purchase_qty?: number;

  pending_qty: number;

  status?: string;
  purchase_status?: string;

  is_fully_issued?: boolean;
};

// MRN
type MRN = {
  mrn_id: number;
  mrn_number: string;
  mrn_status?: string;
  products: MRNItem[];
};

const ViewLeadDetails = () => {
  const navigate = useNavigate();
  const { master_id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [mrnList, setMrnList] = useState<MRN[]>([]);
const [selectedMRN, setSelectedMRN] = useState<MRN | null>(null);
const [issueData, setIssueData] = useState<MRNItem[]>([]);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState<boolean>(false);
  // Add this useEffect to fetch MRN list when component mounts
  useEffect(() => {
    fetchMRNList();
  }, [master_id]);

  // Add this function to fetch MRN list
  const fetchMRNList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}api/mrn-list/${master_id}`);
      if (response.data.success) {
        setMrnList(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch MRN list');
      }
    } catch (err: any) {
  console.error(err);
  setError(err?.response?.data?.message || 'Error fetching MRN list');
}
    finally {
      setLoading(false);
    }
  };
const handleViewMRN = (mrnNumber: string) => {
  navigate(`/mrn/view/${mrnNumber}`);
};


  const handleIssueMRN = async (mrn_id: number) => {
    try {
      const res = await axios.get(`${BASE_URL}api/mrn-details-by-id/${mrn_id}`);

      if (res.data.success) {
        setSelectedMRN(res.data.data);

        // prepare issue qty array
        const formatted: MRNItem[] = res.data.data.products.map((p: any) => ({
  mpm_id: p.mpm_id,
  model_id: p.model_id,
  model_no: p.model_no,

  required_qty: Number(p.required_qty),
  available_qty: Number(p.available_qty),
  issued_qty: Number(p.issued_qty),
  pending_qty: Number(p.pending_qty),

  requested_qty: Number(p.requested_qty || 0),
  purchase_qty: 0,
  issue_qty: 0,

  is_fully_issued: p.is_fully_issued,
  status: p.status || 'Pending',
}));
        setIssueData(formatted);
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching MRN details');
    }
  };

const handleQtyChange = (index: number, value: string) => {
  const updated = [...issueData];
  updated[index].issue_qty = value === '' ? 0 : Number(value);
  setIssueData(updated);
};

  const handleSubmitIssue = async () => {
    for (let item of issueData) {
      if ((item.issue_qty || 0) > item.available_qty) {
        alert(`Issue qty cannot exceed available stock for ${item.model_no}`);
        return;
      }
    }

    try {
      await axios.post(`${BASE_URL}api/issue-items`, {
         mrn_id: selectedMRN?.mrn_id,
        items: issueData,
      });

      alert('Items issued successfully');
      setShowModal(false);
      fetchMRNList(); // This will now work
    } catch (err) {
      console.error(err);
      alert('Error issuing items');
    }
  };

const handleSendForPurchase = async (items: MRNItem[]) => {
    try {
      const payload = items
        .filter((item) => item.purchase_qty > 0)
        .map((item) => {
          const actualPending =
            item.required_qty -
            (item.issued_qty || 0) -
            (item.requested_qty || 0);

          if (item.purchase_qty > actualPending) {
            throw new Error(`${item.model_no} exceeds available qty`);
          }

          return {
            mpm_id: item.mpm_id,
            purchase_qty: item.purchase_qty,
          };
        });

      if (payload.length === 0) {
        alert('Please enter purchase qty');
        return;
      }

      const res = await axios.post(`${BASE_URL}api/send-for-purchase`, {
        items: payload,
      });

      const updatedData = issueData.map((item) => {
        const matched = payload.find((p) => p.mpm_id === item.mpm_id);

        if (!matched) return item;

     

          const newRequestedQty =
  (item.requested_qty || 0) + (matched.purchase_qty || 0);

        const newPendingQty =
          item.required_qty - (item.issued_qty || 0) - newRequestedQty;

        return {
          ...item,
          requested_qty: newRequestedQty,
          pending_qty: newPendingQty > 0 ? newPendingQty : 0,
          purchase_qty: 0,
          purchase_status:
            newPendingQty === 0 ? 'Fully Requested' : 'Partial Requested',
        };
      });

      setIssueData(updatedData);

      if (res.data.alreadyRequestedItems?.length > 0) {
        alert('Some items already fully requested');
      }

      if (res.data.successItems?.length > 0) {
        alert('Items sent for purchase successfully');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error sending for purchase');
    }
  };

 const handlePurchaseQtyChange = (index: number, value: string) => {
  const updatedData = [...issueData];

  let qty = parseInt(value);
  if (isNaN(qty) || qty < 0) qty = 0;

  const item = updatedData[index];

  const actualPending =
    item.required_qty -
    (item.issued_qty || 0) -
    (item.requested_qty || 0);

  if (qty > actualPending) qty = actualPending;

  updatedData[index].purchase_qty = qty;

  setIssueData(updatedData);
};

  const formatMRNDate = (mrnNumber:string) => {
    // Extract timestamp from MRN number (MRN1773726384899)
    const timestamp = mrnNumber.replace('MRN', '');
    if (timestamp && timestamp.length > 0) {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return 'N/A';
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 dark:bg-boxdark min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-boxdark min-h-screen">
      {/* TOP BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <FaArrowLeft />
          <span className="font-medium">Back</span>
        </button>

        {/* Header Info Card */}
        <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex-1 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaFileInvoice className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Material Receipt Notes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Master ID: {master_id} • {mrnList.length} MRN
                {mrnList.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>
      </div>

      <Breadcrumb pageName="MRN List" />

      {/* MRN LIST TABLE */}
      <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {mrnList.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mb-4">
              <FaFileInvoice className="mx-auto text-gray-400 text-5xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No MRNs Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There are no Material Receipt Notes for this master ID.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-4 px-6 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          S.No
                        </span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <div className="flex items-center gap-2">
                        <FaFileInvoice className="text-gray-600 dark:text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          MRN Number
                        </span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <div className="flex items-center gap-2">
                        <MdDateRange className="text-gray-600 dark:text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Created Date
                        </span>
                      </div>
                    </th>
                     <th className="py-4 px-6 text-left">
                      <div className="flex items-center gap-2">
                        {/* <MdDateRange className="text-gray-600 dark:text-gray-400" /> */}
                        <span className="font-semibold text-gray-900 dark:text-white">
                         Status
                        </span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {mrnList.map((mrn, index) => (
                    <tr
                      key={mrn.mrn_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {mrn.mrn_number}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatMRNDate(mrn.mrn_number)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {mrn.mrn_status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          {/* <button
                            onClick={() => handleIssueMRN(mrn.mrn_id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            Issue MRN
                          </button> */}
                          <button
                            onClick={() => handleViewMRN(mrn.mrn_number)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            title="View MRN Details"
                          >
                            <FaEye className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal remains the same */}
            {showModal && selectedMRN && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="bg-white rounded-xl shadow-xl ml-20 w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        Issue Materials
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        MRN:{' '}
                        <span className="font-medium text-blue-600">
                          {selectedMRN.mrn_number}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Table Section */}
                  <div className="flex-1 overflow-auto p-6">
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Required
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            In Stock
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Pending
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Purchase Qty
                          </th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {issueData.map((item, index) => {
                          const isCompleted = item.is_fully_issued === 1;
                          const isOutOfStock = item.available_qty === 0;

                          return (
                            <tr key={item.mpm_id}>
                              <td className="px-4 py-2">{item.model_no}</td>
                              <td className="px-4 py-2">{item.required_qty}</td>
                              <td
                                className={`px-4 py-2 ${
                                  isOutOfStock
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {item.available_qty}
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={item.issue_qty === 0 ? '' : item.issue_qty || ''}
                                  disabled={isOutOfStock || isCompleted}
                                  onChange={(e) =>
                                    handleQtyChange(index, e.target.value)
                                  }
                                  className={`border p-1 w-20 no-spinner ${
                                    isCompleted ? 'bg-green-100' : ''
                                  }`}
                                  placeholder="0"
                                />
                              </td>
                              <td
                                className={`px-4 py-2 ${
                                  item.pending_qty > 0
                                    ? 'text-orange-600 font-semibold'
                                    : 'text-green-600 font-semibold'
                                }`}
                              >
                                {item.required_qty -
                                  (item.issued_qty || 0) -
                                  (item.requested_qty || 0)}
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={item.purchase_qty || ''}
                                  min="0"
                                  max={item.pending_qty}
                                  onChange={(e) =>
                                    handlePurchaseQtyChange(index, e.target.value)
                                  }
                                  className="border p-1 w-20 no-spinner"
                                  placeholder="0"
                                  disabled={item.pending_qty === 0}
                                />
                              </td>
                              <td className="px-4 py-2">
                                {item.status === 'Issued' ? (
                                  <span className="text-green-600 font-semibold">
                                    Issued
                                  </span>
                                ) : item.status === 'Approval Pending' ? (
                                  <span className="text-blue-600 font-semibold">
                                    Approval Pending
                                  </span>
                                ) : item.status === 'Out of Stock' ? (
                                  <span className="text-red-600 font-semibold">
                                    Out of Stock
                                  </span>
                                ) : item.status === 'Purchased' ? (
                                  <span className="text-purple-600 font-semibold">
                                    Purchased
                                  </span>
                                ) : (
                                  <span className="text-yellow-600 font-semibold">
                                    Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer with Actions */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-300 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => handleSendForPurchase(issueData)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Send for Purchase
                      </button>

                      <button
                        onClick={handleSubmitIssue}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Issue Items
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Summary Footer */}
            <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing{' '}
                  <span className="font-semibold">{mrnList.length}</span> MRN
                  records
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                    Total: {mrnList.length} MRN{mrnList.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewLeadDetails;