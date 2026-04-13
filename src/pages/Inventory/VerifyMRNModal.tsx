// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faIdCard,
//   faSpinner,
//   faCheckCircle,
//   faTimesCircle,
//   faBox,
//   faCalendarAlt,
//   faUser,
//   faBarcode,
// } from '@fortawesome/free-solid-svg-icons';
// import { BASE_URL } from '../../../public/config.js';

// interface Product {
//   mpm_id: number;
//   prod_id: number;
//   model_id: number;
//   brand_id: number;
//   required_qty: number;
//   issued_qty: number;
//   requested_qty: number;
//   pending_qty: number;
//   available_qty: number;
//   brand_name: string;
//   model_no: string;
//   status: string;
//   is_fully_issued: number;
//   purchase_status: string;
// }

// interface MRNData {
//   mrn_id: number;
//   mrn_number: string;
//   master_id: number;
//   qt_id: number;
//   expected_date: string | null;
//   created_by: string | null;
//   created_at: string;
//   mrn_status: string;
//   name: string;
//   products: Product[];
// }

// interface VerifyMRNModalProps {
//   data: {
//     mrn_id: number;
//     mrn_number: string;
//     master_id: number;
//     client_name?: string;
//     city?: string;
//     execution?: any;
//     items?: any[];
//   };
//   onClose: () => void;
//   onSave: (updatedData: any) => void;
// }

// const VerifyMRNModal: React.FC<VerifyMRNModalProps> = ({
//   data,
//   onClose,
//   onSave,
// }) => {
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [mrnDetails, setMrnDetails] = useState<MRNData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [issueData, setIssueData] = useState<any[]>([]);
//   const [selectedMRN, setSelectedMRN] = useState<any>(null);
//   const [verifiedQuantities, setVerifiedQuantities] = useState<{
//     [key: number]: number;
//   }>({});

//   // Fetch MRN details by ID
//   useEffect(() => {
//     const fetchMRNDetails = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `${BASE_URL}api/mrn-details-by-id/${data.mrn_id}`,
//         );

//         if (response.data?.success && response.data?.data) {
//           setMrnDetails(response.data.data);
//           setSelectedMRN(response.data.data);

//           // Initialize issue data with product details
//           const formatted = response.data.data.products.map((p: Product) => ({
//             mpm_id: p.mpm_id,
//             model_id: p.model_id,
//             model_no: p.model_no,
//             required_qty: p.required_qty,
//             available_qty: p.available_qty,
//             issued_qty: p.issued_qty || 0,
//             requested_qty: p.requested_qty || 0,
//             pending_qty:
//               p.pending_qty ||
//               p.required_qty - (p.issued_qty || 0) - (p.requested_qty || 0),
//             is_fully_issued: p.is_fully_issued || 0,
//             status: p.status || 'Pending',
//             purchase_status: p.purchase_status || 'Not Requested',
//             approval_qty : 0,
//             purchase_qty: 0,
//           }));
//           setIssueData(formatted);

//           // Initialize verified quantities with issued_qty
//           const initialQuantities: { [key: number]: number } = {};
//           response.data.data.products.forEach((product: Product) => {
//             initialQuantities[product.mpm_id] = product.issued_qty || 0;
//           });
//           setVerifiedQuantities(initialQuantities);
//         } else {
//           setError('Failed to fetch MRN details');
//         }
//       } catch (err: any) {
//         console.error('Error fetching MRN details:', err);
//         setError(err.response?.data?.message || 'Failed to fetch MRN details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (data.mrn_id) {
//       fetchMRNDetails();
//     }
//   }, [data.mrn_id]);

//   // Handle issue quantity change
//   const handleQtyChange = (index: number, value: string) => {
//     const updated = [...issueData];
//     const qty = value === '' ? 0 : Number(value);

//     const item = updated[index];

//     const actualPending =
//       item.required_qty -
//       Number(item.issued_qty || 0) -
//       Number(item.requested_qty || 0);

//     if (qty <= item.available_qty && qty <= actualPending) {
//       updated[index].approval_qty  = qty;
//       setIssueData(updated);
//     } else {
//       alert(`Invalid issue qty for ${item.model_no}`);
//     }
//   };

//   // Handle purchase quantity change

//   const handlePurchaseQtyChange = (index: number, value: string) => {
//     const updatedData = [...issueData];
//     let qty = parseInt(value);
//     if (isNaN(qty) || qty < 0) qty = 0;

//     const item = updatedData[index];
//     const actualPending =
//       item.required_qty -
//       Number(item.issued_qty || 0) -
//       Number(item.requested_qty || 0);

//     if (qty > actualPending) qty = actualPending;

//     updatedData[index].purchase_qty = qty;
//     setIssueData(updatedData);
//   };

//   // Handle submit issue
// const handleSendApproval = async () => {
//   const payload = issueData.map((item) => ({
//     mpm_id: item.mpm_id,
//   }));

//   try {
//     await axios.post(
//       `${BASE_URL}api/verify-mrn`,
//       {
//         mrn_id: selectedMRN.mrn_id,
//         items: payload,
//       },
//       {
//         withCredentials: true,
//       }
//     );

//     alert('MRN Verified Successfully');

//     onClose();

//   } catch (err) {
//     console.error(err);
//     alert('Error verifying MRN');
//   }
// };

//   // Handle send for purchase
//   const handleSendForPurchase = async () => {
//     try {
//       const payload = issueData
//         .filter((item) => item.purchase_qty > 0)
//         .map((item) => {
//           const actualPending =
//             item.required_qty -
//             Number(item.issued_qty || 0) -
//             Number(item.requested_qty || 0);

//           if (item.purchase_qty > actualPending) {
//             throw new Error(`${item.model_no} exceeds pending qty`);
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

//       await axios.post(
//         `${BASE_URL}api/send-for-purchase`,
//         {
//           mrn_id: selectedMRN.mrn_id,
//           items: payload,
//         },
//         {
//           withCredentials: true,
//         },
//       );

//       alert('Items sent for purchase successfully');

//       // ✅ OPTIONAL: update UI instantly (your existing logic is fine)
//       const updatedData = issueData.map((item) => {
//         const matched = payload.find((p) => p.mpm_id === item.mpm_id);
//         if (!matched) return item;

//         const newRequestedQty =
//           Number(item.requested_qty || 0) + matched.purchase_qty;

//         const newPendingQty =
//           item.required_qty - Number(item.issued_qty || 0) - newRequestedQty;

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

//       onClose();
//     } catch (err: any) {
//       console.error(err);
//       alert(err.message || 'Error sending for purchase');
//     }
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '—';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   // Info Box Component
//   const InfoBox = ({ label, value, highlight = false, icon }: any) => (
//     <div
//       className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 ${
//         highlight ? 'border-l-4 border-purple-500' : ''
//       }`}
//     >
//       <div className="flex items-center gap-1.5 mb-0.5">
//         {icon && (
//           <FontAwesomeIcon icon={icon} className="h-3 w-3 text-gray-400" />
//         )}
//         <span className="text-xs text-gray-500 dark:text-gray-400">
//           {label}
//         </span>
//       </div>
//       <div
//         className={`text-sm font-semibold ${
//           highlight
//             ? 'text-purple-600 dark:text-purple-400'
//             : 'text-gray-900 dark:text-white'
//         }`}
//       >
//         {value || '—'}
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex items-center gap-3">
//           <FontAwesomeIcon
//             icon={faSpinner}
//             className="animate-spin h-5 w-5 text-purple-600"
//           />
//           <span className="text-sm text-gray-700 dark:text-gray-300">
//             Loading MRN details...
//           </span>
//         </div>
//       </div>
//     );
//   }

//   if (error || !mrnDetails) {
//     return (
//       <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-5 max-w-md">
//           <div className="text-center">
//             <FontAwesomeIcon
//               icon={faTimesCircle}
//               className="h-10 w-10 text-red-500 mb-3"
//             />
//             <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
//               Error
//             </h3>
//             <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//               {error || 'Failed to load MRN details'}
//             </p>
//             <button
//               onClick={onClose}
//               className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 flex items-center mt-10 ml-60 justify-center p-4">
//       <div className="bg-white dark:bg-gray-800 w-full max-w-5xl max-h-[90vh] rounded-lg shadow-lg flex flex-col">
//         {/* Header */}
//         <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-t-lg">
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
//               <FontAwesomeIcon
//                 icon={faIdCard}
//                 className="h-4 w-4 text-purple-600 dark:text-purple-400"
//               />
//             </div>
//             <div>
//               <h2 className="text-base font-semibold text-gray-900 dark:text-white">
//                 Verify & Issue MRN
//               </h2>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Review, verify and issue materials
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-xl"
//           >
//             ×
//           </button>
//         </div>

//         {/* Scrollable Content */}
//         <div className="p-4 overflow-y-auto flex-1">
//           {/* Header Information */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
//             <InfoBox
//               label="MRN Number"
//               value={mrnDetails.mrn_number}
//               highlight
//               icon={faBarcode}
//             />
//             <InfoBox
//               label="Created Date"
//               value={formatDate(mrnDetails.created_at)}
//               icon={faCalendarAlt}
//             />
//             <InfoBox
//               label="Client Name"
//               value={mrnDetails.name}
//               icon={faUser}
//             />
//           </div>

//           {/* Products Table */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
//               <FontAwesomeIcon icon={faBox} className="h-3 w-3" />
//               Products & Materials
//             </h3>

//             <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
//               <div className="max-h-[450px] overflow-y-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
//                     <tr className="text-xs">
//                       <th className="p-2 text-left text-gray-600 dark:text-gray-300 font-medium">
//                         Product Details
//                       </th>
//                       <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-16">
//                         Req
//                       </th>
//                       <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-16">
//                         Stock
//                       </th>
//                       <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-20">
//                         Issue Qty
//                       </th>
//                       <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-20">
//                         Pending
//                       </th>
//                       <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-20">
//                         Purchase Qty
//                       </th>
//                       <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-24">
//                         Status
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y dark:divide-gray-700">
//                     {issueData.map((item, index) => {
//                       const actualPending =
//                         item.required_qty -
//                         Number(item.issued_qty || 0) -
//                         Number(item.requested_qty || 0);

//                       const isCompleted = actualPending === 0;
//                       const isOutOfStock = item.available_qty === 0;

//                       return (
//                         <tr
//                           key={item.mpm_id}
//                           className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
//                         >
//                           <td className="p-2">
//                             <div className="font-medium text-sm text-gray-900 dark:text-white">
//                               {item.model_no}
//                             </div>
//                             <div className="text-xs text-gray-500 dark:text-gray-400">
//                               ID: {item.mpm_id}
//                             </div>
//                           </td>
//                           <td className="p-2 text-center font-medium text-sm text-gray-900 dark:text-white">
//                             {item.required_qty}
//                           </td>
//                           <td
//                             className={`p-2 text-center text-sm ${
//                               isOutOfStock ? 'text-red-600' : 'text-green-600'
//                             }`}
//                           >
//                             {item.available_qty}
//                           </td>
//                           <td className="p-2 text-center">
//                             <input
//                               type="number"
//                               value={item.approval_qty  === 0 ? '' : item.approval_qty }
//                               disabled={item.required_qty === item.approval_qty}
//                               onChange={(e) =>
//                                 handleQtyChange(index, e.target.value)
//                               }
//                               className="w-16 border rounded px-1 py-0.5 text-center text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
//                               placeholder="0"
//                             />
//                           </td>
//                           <td
//                             className={`p-2 text-center text-sm font-medium ${
//                               actualPending > 0
//                                 ? 'text-orange-600'
//                                 : 'text-green-600'
//                             }`}
//                           >
//                             {actualPending}
//                           </td>
//                           <td className="p-2 text-center">
//                             <input
//                               type="number"
//                               value={
//                                 item.purchase_qty === 0 ? '' : item.purchase_qty
//                               }
//                               min="0"
//                               max={actualPending}
//                               onChange={(e) =>
//                                 handlePurchaseQtyChange(index, e.target.value)
//                               }
//                               className="w-16 border rounded px-1 py-0.5 text-center text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
//                               placeholder="0"
//                               disabled={actualPending === 0}
//                             />
//                           </td>
//                           <td className="p-2 text-center">
//                             {item.status === 'Issued' ? (
//                               <span className="text-green-600 font-semibold text-xs">
//                                 Issued
//                               </span>
//                             ) : item.status === 'Approval Pending' ? (
//                               <span className="text-blue-600 font-semibold text-xs">
//                                 Approval Pending
//                               </span>
//                             ) : item.status === 'Out of Stock' ? (
//                               <span className="text-red-600 font-semibold text-xs">
//                                 Out of Stock
//                               </span>
//                             ) : item.status === 'Purchased' ? (
//                               <span className="text-purple-600 font-semibold text-xs">
//                                 Purchased
//                               </span>
//                             ) : (
//                               <span className="text-yellow-600 font-semibold text-xs">
//                                 Pending
//                               </span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           {/* Summary Section */}
//           <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
//             <div className="grid grid-cols-4 gap-2">
//               <div className="text-center">
//                 <div className="text-xs text-gray-500 dark:text-gray-400">
//                   Products
//                 </div>
//                 <div className="text-base font-semibold text-gray-900 dark:text-white">
//                   {issueData.length}
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-xs text-gray-500 dark:text-gray-400">
//                   Total Required
//                 </div>
//                 <div className="text-base font-semibold text-gray-900 dark:text-white">
//                   {issueData.reduce((sum, p) => sum + p.required_qty, 0)}
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-xs text-gray-500 dark:text-gray-400">
//                   Total Issued
//                 </div>
//                 <div className="text-base font-semibold text-green-600">
//                   {issueData.reduce((sum, p) => sum + (p.approval_qty  || 0), 0)}
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-xs text-gray-500 dark:text-gray-400">
//                   Total Pending
//                 </div>
//                 <div className="text-base font-semibold text-orange-600">
//                   {issueData.reduce(
//                     (sum, p) =>
//                       sum +
//                       (p.required_qty -
//                         (p.issued_qty || 0) -
//                         (p.requested_qty || 0)),
//                     0,
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer with Actions */}
//         <div className="flex justify-end gap-2 px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
//           <button
//             onClick={onClose}
//             className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleSendForPurchase}
//             disabled={!issueData.some((item) => item.purchase_qty > 0)}
//             className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
//           >
//             Send for Purchase
//           </button>

//           <button
//             onClick={handleSubmitIssue}
//             disabled={!issueData.some((item) => item.approval_qty  > 0)}
//             className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//             Approve Material
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyMRNModal;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIdCard,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faBox,
  faCalendarAlt,
  faUser,
  faBarcode,
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';

interface Product {
  mpm_id: number;
  prod_id: number;
  model_id: number;
  brand_id: number;
  required_qty: number;
  issued_qty: number;
  requested_qty: number;
  pending_qty: number;
  available_qty: number;
  brand_name: string;
  model_no: string;
  status: string;
  is_fully_issued: number;
  purchase_status: string;
}

interface MRNData {
  mrn_id: number;
  mrn_number: string;
  master_id: number;
  qt_id: number;
  expected_date: string | null;
  created_by: string | null;
  created_at: string;
  mrn_status: string;
  name: string;
  products: Product[];
}

interface VerifyMRNModalProps {
  data: {
    mrn_id: number;
    mrn_number: string;
    master_id: number;
    client_name?: string;
    city?: string;
    execution?: any;
    items?: any[];
  };
  onClose: () => void;
  onSave?: (updatedData: any) => void;
}

const VerifyMRNModal: React.FC<VerifyMRNModalProps> = ({
  data,
  onClose,
  onSave,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [mrnDetails, setMrnDetails] = useState<MRNData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issueData, setIssueData] = useState<any[]>([]);
  const [selectedMRN, setSelectedMRN] = useState<any>(null);
  const [verifiedQuantities, setVerifiedQuantities] = useState<{
    [key: number]: number;
  }>({});

  // Fetch MRN details by ID
  useEffect(() => {
    const fetchMRNDetails = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${BASE_URL}api/mrn-details-by-id/${data.mrn_id}`,
        );
        console.log('response', response);
        if (response.data?.success && response.data?.data) {
          const mrnData = response.data.data;

          setMrnDetails(mrnData);
          setSelectedMRN(mrnData);

          /* =========================
           ✅ FORMAT PRODUCTS (FIXED)
        ========================== */
          const formatted = mrnData.products.map((p: any) => {
            const requested = Number(p.requested_qty || 0);
            const stock = Number(p.available_qty || 0);

            let verified = 0;

            if (stock >= requested) {
              verified = requested;
            } else if (stock > 0) {
              verified = stock;
            }

            return {
              mpm_id: p.mpm_id,
              model_id: p.model_id,
              model_no: p.model_no,
              requested_qty: requested,
              available_qty: stock,
              verified_qty: verified, // ✅ auto-filled
              pending_qty: 0,
              status: p.status || 'Verification Pending',
            };
          });

          setIssueData(formatted);
        } else {
          setError('Failed to fetch MRN details');
        }
      } catch (err: any) {
        console.error('Error fetching MRN details:', err);
        setError(err.response?.data?.message || 'Failed to fetch MRN details');
      } finally {
        setLoading(false);
      }
    };

    if (data.mrn_id) {
      fetchMRNDetails();
    }
  }, [data.mrn_id]);

  // const handleVerifyMRN = async () => {
  //   try {
  //     const payload = issueData.map((item) => {
  //       const requested = Number(item.requested_qty || 0);
  //       const stock = Number(item.available_qty || 0);
  //       const verified = Number(item.verified_qty || 0);

  //       /* ✅ VALIDATION */

  //       if (verified < 0) {
  //         throw new Error(`${item.model_no}: Invalid qty`);
  //       }

  //       if (verified > stock) {
  //         throw new Error(
  //           `${item.model_no}: Verified qty cannot exceed stock (${stock})`
  //         );
  //       }

  //       if (verified > requested) {
  //         throw new Error(
  //           `${item.model_no}: Verified qty cannot exceed requested qty`
  //         );
  //       }

  //       return {
  //         mpm_id: item.mpm_id,
  //         verified_qty: verified,
  //       };
  //     });

  //     await axios.post(
  //       `${BASE_URL}api/verify-mrn`,
  //       {
  //         mrn_id: selectedMRN.mrn_id,
  //         products: payload,
  //       },
  //       { withCredentials: true }
  //     );

  //     alert('MRN Verified Successfully');

  //   } catch (err: any) {
  //     console.error(err);
  //     alert(err.message || 'Error verifying MRN');
  //   }
  // };

  const handleVerifyMRN = async () => {
    try {
      // Validate all items
      for (const item of issueData) {
        const requested = Number(item.requested_qty || 0);
        const stock = Number(item.available_qty || 0);
        const verified = Number(item.verified_qty || 0);

        if (verified < 0) {
          throw new Error(`${item.model_no}: Invalid quantity`);
        }

        if (verified > stock) {
          throw new Error(
            `${item.model_no}: Verified quantity cannot exceed stock (${stock})`,
          );
        }

        if (verified > requested) {
          throw new Error(
            `${item.model_no}: Verified quantity cannot exceed requested quantity`,
          );
        }
      }

      // Prepare payload
      const payload = issueData.map((item) => ({
        mpm_id: item.mpm_id,
        verified_qty: Number(item.verified_qty || 0),
      }));

      setIsVerifying(true);

      // Make API call
      const response = await axios.post(
        `${BASE_URL}api/verify-mrn`,
        {
          mrn_id: selectedMRN.mrn_id,
          products: payload,
        },
        { withCredentials: true },
      );

      if (response.data?.success) {
        // Show success message
        alert('MRN Verified Successfully');

        // Close the modal
        onClose();

        // Call onSave if provided to refresh parent data
        if (onSave) {
          onSave(response.data);
        }
      } else {
        throw new Error(response.data?.message || 'Verification failed');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      alert(err.message || 'Error verifying MRN');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifiedQtyChange = (index: number, value: string) => {
    const updated = [...issueData];
    console.log(issueData);
    let qty = value === '' ? 0 : Number(value);
    if (isNaN(qty) || qty < 0) return;

    const item = updated[index];

    const stock = Number(item.available_qty || 0);
    const requested = Number(item.requested_qty || 0);

    /* ✅ USER CONTROL (NOT FORCE AUTO) */
    if (qty > stock) qty = stock;
    if (qty > requested) qty = requested;

    updated[index].verified_qty = qty;

    setIssueData(updated);
  };

  useEffect(() => {
    const updated = issueData.map((item) => {
      const stock = Number(item.available_qty || 0);
      const requested = Number(item.requested_qty || 0);

      let verified = 0;

      if (stock >= requested) {
        verified = requested;
      } else if (stock > 0) {
        verified = stock;
      }

      return {
        ...item,
        verified_qty: verified,
        purchase_qty: requested - verified,
      };
    });

    setIssueData(updated);
  }, [mrnDetails]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Info Box Component
  const InfoBox = ({ label, value, highlight = false, icon }: any) => (
    <div
      className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 ${
        highlight ? 'border-l-4 border-purple-500' : ''
      }`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon && (
          <FontAwesomeIcon icon={icon} className="h-3 w-3 text-gray-400" />
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      <div
        className={`text-sm font-semibold ${
          highlight
            ? 'text-purple-600 dark:text-purple-400'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {value || '—'}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex items-center gap-3">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin h-5 w-5 text-purple-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Loading MRN details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !mrnDetails) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 max-w-md">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="h-10 w-10 text-red-500 mb-3"
            />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Error
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {error || 'Failed to load MRN details'}
            </p>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center mt-10 ml-60 justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-lg shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon
                icon={faIdCard}
                className="h-4 w-4 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Verify & Issue MRN
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Review, verify and issue materials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            <InfoBox
              label="MRN Number"
              value={mrnDetails.mrn_number}
              highlight
              icon={faBarcode}
            />
            <InfoBox
              label="Created Date"
              value={formatDate(mrnDetails.created_at)}
              icon={faCalendarAlt}
            />
            <InfoBox
              label="Client Name"
              value={mrnDetails.name}
              icon={faUser}
            />
          </div>

          {/* Products Table */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBox} className="h-3 w-3" />
              Products & Materials
            </h3>

            <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="max-h-[450px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr className="text-xs">
                      <th className="p-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                        Product Details
                      </th>
                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-16">
                        Req
                      </th>
                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-16">
                        Stock
                      </th>
                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-20">
                        Verified Qty
                      </th>
                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-20">
                        Pending
                      </th>
                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-20">
                        Purchase Qty
                      </th>
                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-24">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {issueData.map((item, index) => {
                      const verified = Number(item.verified_qty || 0);
                      const requested = Number(item.requested_qty || 0);

                      const purchaseQty = requested - verified;
                      const actualPending = requested - verified;

                      const isCompleted = actualPending === 0;
                      const isOutOfStock = item.available_qty === 0;

                      // Determine status based on approval_qty
                      let displayStatus = item.status;

                      if (verified > 0 && verified < requested) {
                        displayStatus = 'Partial';
                      } else if (verified === requested) {
                        displayStatus = 'Ready for Approval';
                      } else if (verified === 0 && requested > 0) {
                        displayStatus = 'Purchase Required';
                      }
                      return (
                        <tr
                          key={item.mpm_id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="p-2">
                            <div className="font-medium text-sm text-gray-900 dark:text-white">
                              {item.model_no}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {item.mpm_id}
                            </div>
                          </td>
                          <td className="p-2 text-center font-medium text-sm text-gray-900 dark:text-white">
                            {item.requested_qty}
                          </td>
                          <td
                            className={`p-2 text-center text-sm ${
                              isOutOfStock ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {item.available_qty}
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={item.verified_qty ?? ''}
                              disabled={requested === 0}
                              onChange={(e) =>
                                handleVerifiedQtyChange(index, e.target.value)
                              }
                              className="w-16 border rounded px-1 py-0.5 text-center text-sm"
                              placeholder="0"
                            />
                          </td>
                          <td
                            className={`p-2 text-center text-sm font-medium ${
                              actualPending > 0
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}
                          >
                            {actualPending}
                          </td>

                          <td className="p-2 text-center text-sm text-purple-600 font-medium">
                            {purchaseQty > 0 ? purchaseQty : 0}
                          </td>

                          <td className="p-2 text-center">
                            {displayStatus === 'Issued' ? (
                              <span className="text-green-600 font-semibold text-xs">
                                Issued
                              </span>
                            ) : displayStatus === 'Approval Pending' ? (
                              <span className="text-blue-600 font-semibold text-xs">
                                Approval Pending
                              </span>
                            ) : displayStatus === 'Partial' ? (
                              <span className="text-orange-600 font-semibold text-xs">
                                Partial
                              </span>
                            ) : displayStatus === 'Out of Stock' ? (
                              <span className="text-red-600 font-semibold text-xs">
                                Out of Stock
                              </span>
                            ) : displayStatus === 'Purchased' ? (
                              <span className="text-purple-600 font-semibold text-xs">
                                Purchased
                              </span>
                            ) : (
                              <span className="text-yellow-600 font-semibold text-xs">
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
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Products
                </div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {issueData.length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Verified
                </div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {issueData.reduce((sum, p) => sum + (p.verified_qty || 0), 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Purchase
                </div>
                <div className="text-base font-semibold text-green-600">
                  {issueData.reduce(
                    (sum, p) =>
                      sum +
                      (Number(p.requested_qty || 0) -
                        Number(p.verified_qty || 0)),
                    0,
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Pending
                </div>
                <div className="text-base font-semibold text-orange-600">
                  {issueData.reduce(
                    (sum, p) =>
                      sum +
                      (Number(p.requested_qty || 0) -
                        Number(p.verified_qty || 0)),
                    0,
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleVerifyMRN}
            disabled={
              isVerifying ||
              !issueData.some((item) => {
                const verified = Number(item.verified_qty || 0);
                const requested = Number(item.requested_qty || 0);

                // ✅ allow verify if:
                // 1. some qty is verified OR
                // 2. purchase is needed (requested > verified)
                return verified > 0 || requested > verified;
              })
            }
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin mr-2"
                />
                Verifying...
              </>
            ) : (
              'Verify MRN'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyMRNModal;
