// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faIdCard,
//   faBarcode,
//   faCalendarAlt,
//   faUser,
//   faBox,
//   faSpinner,
//   faTimes,
//   faTruck,
//   faShoppingCart,
//   faFileInvoice,
//   faCheckCircle,
//   faRupeeSign,
//   faBuilding,
//   faTag,
// } from '@fortawesome/free-solid-svg-icons';

// import { BASE_URL } from '../../../public/config.js';

// interface GeneratePOModalProps {
//   item: PurchaseItem;
//   onClose: () => void;
//   onSuccess?: () => void;
// }

// const InfoBox = ({ label, value, highlight = false, icon }: any) => (
//   <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
//     <div className="flex items-center gap-1 mb-1">
//       {icon && (
//         <FontAwesomeIcon icon={icon} className="text-blue-500 text-xs" />
//       )}
//       <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
//     </div>
//     <p
//       className={`text-sm font-semibold ${
//         highlight ? 'text-blue-600 font-mono' : 'dark:text-white'
//       }`}
//     >
//       {value || '-'}
//     </p>
//   </div>
// );

// const GeneratePO = ({ item, onClose, onSuccess }: GeneratePOModalProps) => {
//   const [poQty, setPoQty] = useState<number>(item.purchase_qty || 0);
//   const [unitPrice, setUnitPrice] = useState<string>(''); // Changed to string
//   const [loading, setLoading] = useState(false);
//   const [poDetails, setPoDetails] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [vendors, setVendors] = useState<any[]>([]);
//   const [vendorId, setVendorId] = useState<number | null>(null);

//   const formatDate = (dateString: string) => {
//     if (!dateString) return '—';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = parseInt(e.target.value) || 0;
//     const maxQty = item.purchase_qty;
//     if (value <= maxQty && value >= 0) {
//       setPoQty(value);
//     }
//   };

//   const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     // Allow empty string or valid positive numbers
//     if (value === '') {
//       setUnitPrice('');
//     } else {
//       const numValue = parseFloat(value);
//       if (!isNaN(numValue) && numValue >= 0) {
//         setUnitPrice(value);
//       }
//     }
//   };

//   const totalAmount = poQty * (parseFloat(unitPrice) || 0);

//   useEffect(() => {
//     const fetchVendors = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}api/get/vendors`, {
//           withCredentials: true,
//         });
//         setVendors(res.data.data || []);
//       } catch (err) {
//         console.error('Error fetching vendors', err);
//       }
//     };

//     fetchVendors();
//   }, []);

//   const handleGeneratePO = async () => {
//     if (!item.pr_id) {
//       setError('PR ID not found. Please generate PR first.');
//       return;
//     }

//     if (!vendorId) {
//       setError('Please select a vendor');
//       return;
//     }

//     if (poQty <= 0) {
//       setError('Please enter valid PO quantity');
//       return;
//     }

//     if (!unitPrice || parseFloat(unitPrice) <= 0) {
//       setError('Please enter valid unit price');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const payload = {
//         mrn_id: item.mrn_id,
//         vendor_id: vendorId,
//         items: [
//           {
//             pr_id: item.pr_id,
//             qty: poQty,
//             unit_price: parseFloat(unitPrice),
//           },
//         ],
//       };

//       const response = await axios.post(
//         `${BASE_URL}api/purchase-order/create`,
//         payload,
//         {
//           withCredentials: true,
//         },
//       );

//       if (response.data?.success) {
//         alert('Purchase Order generated successfully!');

//         setPoDetails({
//           po_id: response.data.po_id,
//           po_number: response.data.po_number,
//           status: 'Ordered',
//           created_at: new Date(),
//         });

//         setTimeout(() => {
//           onSuccess?.();
//           onClose();
//         }, 1200);
//       } else {
//         setError(response.data?.message || 'Failed to generate PO');
//       }
//     } catch (err: any) {
//       console.error('Error generating PO:', err);

//       setError(
//         err.response?.data?.message ||
//           'Failed to generate PO. Please try again.',
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 flex items-center ml-60 justify-center p-4">
//       <div className="bg-white dark:bg-gray-800 w-full max-w-5xl max-h-[90vh] rounded-lg shadow-lg flex flex-col">
//         {/* Header */}
//         <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-t-lg">
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//               <FontAwesomeIcon
//                 icon={faFileInvoice}
//                 className="h-4 w-4 text-blue-600 dark:text-blue-400"
//               />
//             </div>
//             <div>
//               <h2 className="text-base font-semibold text-gray-900 dark:text-white">
//                 Generate Purchase Order
//               </h2>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Create PO for selected material
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-xl"
//             disabled={loading}
//           >
//             ×
//           </button>
//         </div>

//         {/* Scrollable Content */}
//         <div className="p-4 overflow-y-auto flex-1">
//           {/* Header Information */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
//             <InfoBox
//               label="MRN Number"
//               value={item.mrn_number}
//               highlight
//               icon={faBarcode}
//             />
//             <InfoBox
//               label="PR ID"
//               value={item.pr_id || 'Not Generated'}
//               highlight={!!item.pr_id}
//               icon={faIdCard}
//             />
//             <InfoBox
//               label="Client Name"
//               value={item.client_name}
//               icon={faUser}
//             />
//             <InfoBox label="City" value={item.city} icon={faBuilding} />
//           </div>

//           {/* Products Table */}
//           <div className="mb-4">
//             <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
//               <FontAwesomeIcon icon={faBox} className="h-3 w-3" />
//               Product & Purchase Details
//             </h3>

//             <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
//               <div className="max-h-[400px] overflow-y-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
//                     <tr className="text-xs">
//                       <th className="p-3 text-left text-gray-600 dark:text-gray-300 font-medium">
//                         Product Details
//                       </th>
//                       <th className="p-3 text-center text-gray-600 dark:text-gray-300 font-medium w-28">
//                         Required Qty
//                       </th>
//                       <th className="p-3 text-center text-gray-600 dark:text-gray-300 font-medium w-28">
//                         Status
//                       </th>
//                       <th className="p-3 text-center text-gray-600 dark:text-gray-300 font-medium w-28">
//                         PO Qty
//                       </th>
//                       <th className="p-3 text-center text-gray-600 dark:text-gray-300 font-medium w-32">
//                         Unit Price (₹)
//                       </th>
//                       <th className="p-3 text-center text-gray-600 dark:text-gray-300 font-medium w-32">
//                         Vendor
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y dark:divide-gray-700">
//                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
//                       <td className="p-3">
//                         <div className="font-medium text-sm text-gray-900 dark:text-white">
//                           {item.model_no}
//                         </div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                           Brand: {item.brand_name}
//                         </div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">
//                           Schedule: {item.schedule_name}
//                         </div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">
//                           Execution ID: {item.execution_id}
//                         </div>
//                       </td>
//                       <td className="p-3 text-center font-medium text-sm text-gray-900 dark:text-white">
//                         {item.purchase_qty}
//                       </td>
//                       <td className="p-3 text-center">
//                         <span
//                           className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
//                             item.purchase_status === 'Pending'
//                               ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
//                               : item.purchase_status === 'Approved'
//                               ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
//                               : item.purchase_status === 'Rejected'
//                               ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
//                               : item.purchase_status === 'Ordered'
//                               ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
//                               : item.purchase_status === 'Purchased'
//                               ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
//                               : 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
//                           }`}
//                         >
//                           {item.purchase_status}
//                         </span>
//                       </td>
//                       <td className="p-3 text-center">
//                         <input
//                           type="number"
//                           value={poQty}
//                           onChange={handleQtyChange}
//                           min="0"
//                           max={item.purchase_qty}
//                           className="w-24 text-center border dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="0"
//                           disabled={loading || !!poDetails}
//                         />
//                       </td>
//                       <td className="p-3 text-center">
//                         <div className="relative">
//                           <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
//                             <FontAwesomeIcon
//                               icon={faRupeeSign}
//                               className="h-3 w-3 text-gray-400"
//                             />
//                           </div>
//                           <input
//                             type="number"
//                             value={unitPrice}
//                             onChange={handleUnitPriceChange}
//                             min="0"
//                             step="0.01"
//                             placeholder="Enter price"
//                             className="w-28 pl-6 text-center border dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             disabled={loading || !!poDetails}
//                           />
//                         </div>
//                       </td>
//                       <td className="p-3 text-center">
//                         <select
//                           value={vendorId || ''}
//                           onChange={(e) => setVendorId(Number(e.target.value))}
//                           className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
//                           disabled={loading || !!poDetails}
//                         >
//                           <option value="">Select Vendor</option>
//                           {vendors.map((v) => (
//                             <option key={v.vendor_id} value={v.vendor_id}>
//                               {v.company_name} ({v.vendor_name})
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           {/* PO Details Section (after generation) */}
//           {poDetails && (
//             <div className="mb-4">
//               <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
//                 <FontAwesomeIcon icon={faShoppingCart} className="h-3 w-3" />
//                 Purchase Order Details
//               </h3>
//               <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       PO ID
//                     </p>
//                     <p className="font-semibold dark:text-white">
//                       {poDetails.po_id}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       PO Number
//                     </p>
//                     <p className="font-semibold font-mono text-blue-600 dark:text-blue-400">
//                       {poDetails.po_number}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       Status
//                     </p>
//                     <p className="font-semibold text-green-600 dark:text-green-400">
//                       {poDetails.status}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       Created
//                     </p>
//                     <p className="font-semibold dark:text-white">
//                       {formatDate(poDetails.created_at)}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Error Message */}
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//               <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
//                 <FontAwesomeIcon icon={faTimes} />
//                 {error}
//               </p>
//             </div>
//           )}

//           {/* Summary Section */}
//           <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4">
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//               <div className="text-center">
//                 <div className="text-xs text-gray-500 dark:text-gray-400">
//                   PO Quantity
//                 </div>
//                 <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
//                   {poQty}
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-xs text-gray-500 dark:text-gray-400">
//                   Unit Price
//                 </div>
//                 <div className="text-lg font-bold text-green-600 dark:text-green-400">
//                   {unitPrice ? `₹${parseFloat(unitPrice).toFixed(2)}` : '₹0.00'}
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-xs text-gray-500 dark:text-gray-400">
//                   Total Amount
//                 </div>
//                 <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
//                   ₹{totalAmount.toFixed(2)}
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-xs text-gray-500 dark:text-gray-400">
//                   Max Allowed
//                 </div>
//                 <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
//                   {item.purchase_qty}
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-xs text-gray-500 dark:text-gray-400">
//                   Unit
//                 </div>
//                 <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
//                   Units
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer with Actions */}
//         <div className="flex justify-end gap-3 px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//             disabled={loading}
//           >
//             Cancel
//           </button>

//           {!poDetails ? (
//             <button
//               onClick={handleGeneratePO}
//               disabled={
//                 loading ||
//                 poQty <= 0 ||
//                 !unitPrice ||
//                 unitPrice === '' ||
//                 parseFloat(unitPrice) <= 0 ||
//                 !item.pr_id ||
//                 !vendorId
//               }
//               className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <>
//                   <FontAwesomeIcon
//                     icon={faSpinner}
//                     className="h-4 w-4 animate-spin"
//                   />
//                   Generating...
//                 </>
//               ) : (
//                 <>
//                   <FontAwesomeIcon icon={faFileInvoice} className="h-4 w-4" />
//                   Generate PO
//                 </>
//               )}
//             </button>
//           ) : (
//             <button
//               onClick={onClose}
//               className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
//             >
//               <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
//               Close
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GeneratePO;

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faBox,
  faTimesCircle,
  faSpinner,
  faFileInvoice,
  faUser,
  faLocationDot,
  faHashtag,
  faClipboardList,
  faRupeeSign,
  faBuilding,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

import { BASE_URL } from '../../../public/config.js';

interface GeneratePOProps {
  mrn: any;
  onClose: () => void;
  onSuccess?: () => void;
}
const GeneratePO: React.FC<GeneratePOProps> = ({ mrn, onClose, onSuccess }) => {
  const itemData = mrn || {};
  const [loading, setLoading] = useState(false);

  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorIds, setVendorIds] = useState<Record<number, number>>({});

  const [unitPrices, setUnitPrices] = useState<Record<number, number>>({});
  const [poQty, setPoQty] = useState<Record<number, number>>({});

  /* =========================
     FETCH VENDORS
  ========================== */

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/get/vendors`, {
        withCredentials: true,
      });

      setVendors(response.data.data || []);
    } catch (error) {
      console.error('Vendor Fetch Error:', error);
    }
  };

  useEffect(() => {
    if (mrn?.items) {
      const qtyMap: Record<number, number> = {};

      mrn.items.forEach((item: any) => {
        qtyMap[item.pr_id] = item.purchase_qty;
      });

      setPoQty(qtyMap);
    }
  }, [mrn]);

  /* =========================
     TOTAL
  ========================== */

  const totalAmount = useMemo(() => {
    return mrn?.items?.reduce((sum: number, item: any) => {
      return (
        sum +
        Number(poQty[item.pr_id] || 0) * Number(unitPrices[item.pr_id] || 0)
      );
    }, 0);
  }, [mrn, poQty, unitPrices]);

  /* =========================
     GENERATE PO
  ========================== */
const handleGeneratePO = async () => {
  try {
    if (!mrn?.items?.length) {
      alert('No items found');
      return;
    }

    const invalidVendor = mrn.items.some(
      (item: any) => !vendorIds[item.pr_id],
    );

    if (invalidVendor) {
      alert('Please select vendor for all products');
      return;
    }

    const invalidPrice = mrn.items.some(
      (item: any) =>
        !unitPrices[item.pr_id] ||
        Number(unitPrices[item.pr_id]) <= 0,
    );

    if (invalidPrice) {
      alert('Please enter valid unit price for all products');
      return;
    }

    const invalidQty = mrn.items.some(
      (item: any) =>
        !poQty[item.pr_id] ||
        Number(poQty[item.pr_id]) <= 0,
    );

    if (invalidQty) {
      alert('Please enter valid quantity');
      return;
    }

    setLoading(true);

    const payload = {
      mrn_id: mrn.mrn_id,

      items: mrn.items.map((item: any) => ({
        pr_id: item.pr_id,

        mpm_id: item.mpm_id,
        model_id: item.model_id,
        brand_id: item.brand_id,

        vendor_id: Number(vendorIds[item.pr_id]),

        qty: Number(poQty[item.pr_id]),

        unit_price: Number(
          unitPrices[item.pr_id] || 0,
        ),

        total_price:
          Number(poQty[item.pr_id]) *
          Number(unitPrices[item.pr_id] || 0),
      })),
    };

    console.log('PO Payload:', payload);

    const response = await axios.post(
      `${BASE_URL}api/purchase-order/create`,
      payload,
      {
        withCredentials: true,
      },
    );

    if (response.data.success) {
      alert('Purchase Order Generated Successfully');

      onSuccess?.();
      onClose();
    } else {
      alert(
        response.data.message ||
          'Failed to generate PO',
      );
    }
  } catch (error: any) {
    console.error(
      'Generate PO Error:',
      error,
    );

    alert(
      error.response?.data?.message ||
        'Something went wrong',
    );
  } finally {
    setLoading(false);
  }
};

  return (
   <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
  <div className="bg-white dark:bg-gray-800 w-full max-w-3xl h-[75vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
    {/* ================= HEADER ================= */}

    <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-cyan-600">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faFileInvoice}
            className="text-white text-sm"
          />
        </div>

        <div>
          <h2 className="text-base font-bold text-white">
            Generate Purchase Order
          </h2>

          <p className="text-xs text-cyan-100">
            Create PO against approved PR
          </p>
        </div>
      </div>

      <button onClick={onClose}>
        <FontAwesomeIcon
          icon={faTimesCircle}
          className="text-white text-xl"
        />
      </button>
    </div>

    {/* ================= TOP INFO ================= */}

    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
      {/* MRN */}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FontAwesomeIcon icon={faHashtag} className="text-xs" />
          MRN Number
        </div>

        <div className="mt-1 font-semibold text-sm text-blue-600">
          {itemData.mrn_number}
        </div>
      </div>

      {/* CLIENT */}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FontAwesomeIcon icon={faUser} className="text-xs" />
          Client
        </div>

        <div className="mt-1 font-semibold dark:text-white text-sm truncate">
          {itemData.client_name}
        </div>
      </div>

      {/* CITY */}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FontAwesomeIcon icon={faLocationDot} className="text-xs" />
          City
        </div>

        <div className="mt-1 font-semibold dark:text-white text-sm">
          {itemData.city}
        </div>
      </div>

      {/* PR ID */}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FontAwesomeIcon icon={faClipboardList} className="text-xs" />
          PR ID
        </div>

        <div className="mt-1 font-bold text-base text-cyan-600">
          {itemData.pr_id ? `PR-${itemData.pr_id}` : 'Not Available'}
        </div>
      </div>
    </div>

    {/* ================= TABLE ================= */}

    <div className="p-3 overflow-y-auto flex-1">
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-center">Qty</th>
              <th className="px-3 py-2 text-center">Unit Price</th>
              <th className="px-3 py-2 text-left">Vendor</th>
              <th className="px-3 py-2 text-center">Total</th>
            </tr>
          </thead>

          <tbody>
            {mrn?.items?.map((item: any) => (
              <tr
                key={item.pr_id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/40"
              >
                {/* PRODUCT */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faBox}
                        className="text-cyan-600 text-xs"
                      />
                    </div>

                    <div>
                      <div className="font-medium dark:text-white text-xs">
                        {item.model_no}
                      </div>

                      <div className="text-[10px] text-gray-500">
                        Brand : {item.brand_name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* QTY */}
                <td className="px-3 py-3 text-center">
                  <input
                    type="number"
                    value={poQty[item.pr_id] || 0}
                    min={1}
                    max={item.purchase_qty}
                    onChange={(e) =>
                      setPoQty((prev) => ({
                        ...prev,
                        [item.pr_id]: Number(e.target.value),
                      }))
                    }
                    className="w-20 border dark:border-gray-600 rounded-md px-2 py-1.5 text-center text-xs dark:bg-gray-700 dark:text-white"
                  />

                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Max : {item.purchase_qty}
                  </div>
                </td>

                {/* UNIT PRICE */}
                <td className="px-3 py-3 text-center">
                  <div className="relative w-28 mx-auto">
                    <FontAwesomeIcon
                      icon={faRupeeSign}
                      className="absolute left-2 top-2 text-gray-400 text-[10px]"
                    />

                    <input
                      type="number"
                      value={unitPrices[item.pr_id] || ''}
                      onChange={(e) =>
                        setUnitPrices((prev) => ({
                          ...prev,
                          [item.pr_id]: Number(e.target.value),
                        }))
                      }
                      placeholder="0.00"
                      className="w-full border dark:border-gray-600 rounded-md pl-6 pr-2 py-1.5 text-center text-xs dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </td>

                {/* VENDOR */}
                <td className="px-3 py-3">
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="absolute left-2 top-2 text-gray-400 text-[10px]"
                    />

                    <select
                      value={vendorIds[item.pr_id] || ''}
                      onChange={(e) =>
                        setVendorIds((prev) => ({
                          ...prev,
                          [item.pr_id]: Number(e.target.value),
                        }))
                      }
                      className="w-full border dark:border-gray-600 rounded-md pl-7 pr-2 py-1.5 text-xs dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Vendor</option>

                      {vendors.map((vendor) => (
                        <option
                          key={vendor.vendor_id}
                          value={vendor.vendor_id}
                        >
                          {vendor.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* TOTAL */}
                <td className="px-3 py-3 text-center">
                  <div className="font-bold text-sm text-green-600">
                    ₹
                    {(
                      Number(poQty[item.pr_id] || 0) *
                      Number(unitPrices[item.pr_id] || 0)
                    ).toFixed(2)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* TOTAL QTY */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-2">
          <div className="text-[10px] text-gray-500">PO Quantity</div>

          <div className="mt-0.5 text-base font-bold text-blue-600">
            {Object.values(poQty).reduce((a, b) => a + b, 0)}
          </div>
        </div>

        {/* TOTAL AMOUNT */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-2">
          <div className="text-[10px] text-gray-500">Total Amount</div>

          <div className="mt-0.5 text-base font-bold text-purple-600">
            ₹{Number(totalAmount || 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>

    {/* ================= FOOTER ================= */}

    <div className="flex justify-between items-center px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="text-xs text-gray-500">
        Status :{' '}
        <span className="font-semibold text-cyan-600">
          Ready For PO Creation
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-xs font-medium"
        >
          Cancel
        </button>

        <button
          onClick={handleGeneratePO}
          disabled={
            loading ||
            mrn?.items?.some(
              (item: any) =>
                Number(poQty[item.pr_id] || 0) <= 0 ||
                Number(unitPrices[item.pr_id] || 0) <= 0 ||
                Number(vendorIds[item.pr_id] || 0) <= 0,
            )
          }
          className="px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
              Generating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
              Generate PO
            </>
          )}
        </button>
      </div>
    </div>
  </div>
</div>

  );
};

export default GeneratePO;
