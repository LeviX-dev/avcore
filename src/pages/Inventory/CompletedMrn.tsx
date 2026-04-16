// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import { Eye } from "lucide-react";
// // import { BASE_URL } from '../../../public/config'

// // interface MRNItem {
// //   mpm_id: number;
// //   model_no: string;
// //   issued_qty: number | string;
// // }

// // interface MRN {
// //   mrn_id: number;
// //   mrn_number: string;
// //   created_at: string;
// //   mrn_status: string;
// //   client_name: string;
// //   city: string;
// //   execution: {
// //     schedule_name: string;
// //   };
// //   items: MRNItem[];
// // }

// // /* =========================
// //    ✅ COMPONENT
// // ========================= */

// // const CompletedMRNs: React.FC = () => {
// //   const [data, setData] = useState<MRN[]>([]);
// //   const [loading, setLoading] = useState(true);
// // const [selectedMRN, setSelectedMRN] = useState<MRN | null>(null);
// // const [isModalOpen, setIsModalOpen] = useState(false);

// //   useEffect(() => {
// //     fetchCompletedMRNs();
// //   }, []);

// //   const fetchCompletedMRNs = async () => {
// //     try {
// //       const res = await axios.get<{ data: MRN[] }>(
// //         `${BASE_URL}api/completed/mrns`
// //       );
// //       setData(res.data.data || []);
// //     } catch (err) {
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// // const handleView = (mrn: MRN) => {
// //   setSelectedMRN(mrn);
// //   setIsModalOpen(true);
// // };

// //   /* =========================
// //      ✅ SUMMARY DATA
// //   ========================== */

// //   const totalMRNs = data.length;

// //   const totalItems = data.reduce(
// //     (sum, mrn) => sum + mrn.items.length,
// //     0
// //   );

// //   const totalQty = data.reduce(
// //     (sum, mrn) =>
// //       sum +
// //       mrn.items.reduce(
// //         (s, i) => s + Number(i.issued_qty || 0),
// //         0
// //       ),
// //     0
// //   );

// //   if (loading) {
// //     return <div className="p-6">Loading...</div>;
// //   }

// //   return (
// //     <div className="p-6 bg-gray-50 min-h-screen">
// //       {/* =========================
// //           HEADER
// //       ========================== */}
// //       <h1 className="text-2xl font-bold mb-6 text-gray-800">
// //         Completed MRNs
// //       </h1>

// //       {/* =========================
// //           SUMMARY CARDS
// //       ========================== */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
// //         <div className="bg-white shadow rounded-xl p-4">
// //           <p className="text-gray-500 text-sm">Total MRNs</p>
// //           <h2 className="text-2xl font-bold">{totalMRNs}</h2>
// //         </div>

// //         <div className="bg-white shadow rounded-xl p-4">
// //           <p className="text-gray-500 text-sm">Total Items</p>
// //           <h2 className="text-2xl font-bold">{totalItems}</h2>
// //         </div>

// //         <div className="bg-white shadow rounded-xl p-4">
// //           <p className="text-gray-500 text-sm">Total Issued Qty</p>
// //           <h2 className="text-2xl font-bold">{totalQty}</h2>
// //         </div>
// //       </div>

// //       {/* =========================
// //           TABLE
// //       ========================== */}
// //       <div className="bg-white shadow rounded-xl overflow-hidden">
// //         <table className="min-w-full text-sm">
// //           <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
// //             <tr>
// //               <th className="p-3 text-left">MRN</th>
// //               <th className="p-3 text-left">Client</th>
// //               <th className="p-3 text-left">City</th>
// //               <th className="p-3 text-left">Execution</th>
// //               <th className="p-3 text-center">Items</th>
// //               <th className="p-3 text-center">Qty</th>
// //               <th className="p-3 text-center">Date</th>
// //               <th className="p-3 text-center">Status</th>
// //               <th className="p-3 text-center">Action</th>
// //             </tr>
// //           </thead>

// //           <tbody>
// //             {data.length > 0 ? (
// //               data.map((mrn) => {
// //                 const totalItems = mrn.items.length;

// //                 const totalQty = mrn.items.reduce(
// //                   (sum, item) =>
// //                     sum + Number(item.issued_qty || 0),
// //                   0
// //                 );

// //                 return (
// //                   <tr
// //                     key={mrn.mrn_id}
// //                     className="border-t hover:bg-gray-50 transition"
// //                   >
// //                     <td className="p-3 font-medium text-blue-600">
// //                       {mrn.mrn_number}
// //                     </td>

// //                     <td className="p-3">
// //                       {mrn.client_name}
// //                     </td>

// //                     <td className="p-3">{mrn.city}</td>

// //                     <td className="p-3">
// //                       {mrn.execution?.schedule_name || "-"}
// //                     </td>

// //                     <td className="p-3 text-center">
// //                       {totalItems}
// //                     </td>

// //                     <td className="p-3 text-center">
// //                       {totalQty}
// //                     </td>

// //                     <td className="p-3 text-center">
// //                       {new Date(
// //                         mrn.created_at
// //                       ).toLocaleDateString()}
// //                     </td>

// //                     {/* STATUS BADGE */}
// //                     <td className="p-3 text-center">
// //                       <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
// //                         Completed
// //                       </span>
// //                     </td>

// //                     {/* ACTION */}
// //                     <td className="p-3 text-center">
// //                       <button
// //                         onClick={() => handleView(mrn)}
// //                         className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mx-auto"
// //                       >
// //                         <Eye size={16} />
// //                         View
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 );
// //               })
// //             ) : (
// //               <tr>
// //                 <td
// //                   colSpan={9}
// //                   className="text-center p-6 text-gray-500"
// //                 >
// //                   No Completed MRNs Found
// //                 </td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>

// //         {isModalOpen && selectedMRN && (
// //   <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

// //     {/* MODAL BOX */}
// //     <div className="bg-white w-[90%] max-w-5xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">

// //       {/* HEADER */}
// //       <div className="flex justify-between items-center mb-4">
// //         <h2 className="text-xl font-semibold">
// //           MRN Details
// //         </h2>
// //         <button
// //           onClick={() => setIsModalOpen(false)}
// //           className="text-gray-500 hover:text-red-500 text-lg"
// //         >
// //           ✕
// //         </button>
// //       </div>

// //       {/* =========================
// //           MRN INFO
// //       ========================== */}
// //       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
// //         <div>
// //           <p className="text-gray-500">MRN No</p>
// //           <p className="font-medium">{selectedMRN.mrn_number}</p>
// //         </div>

// //         <div>
// //           <p className="text-gray-500">Client</p>
// //           <p className="font-medium">{selectedMRN.client_name}</p>
// //         </div>

// //         <div>
// //           <p className="text-gray-500">City</p>
// //           <p className="font-medium">{selectedMRN.city}</p>
// //         </div>

// //         <div>
// //           <p className="text-gray-500">Execution</p>
// //           <p className="font-medium">
// //             {selectedMRN.execution?.schedule_name || "-"}
// //           </p>
// //         </div>

// //         <div>
// //           <p className="text-gray-500">Date</p>
// //           <p className="font-medium">
// //             {new Date(selectedMRN.created_at).toLocaleDateString()}
// //           </p>
// //         </div>

// //         <div>
// //           <p className="text-gray-500">Status</p>
// //           <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
// //             Completed
// //           </span>
// //         </div>
// //       </div>

// //       {/* =========================
// //           PRODUCT TABLE
// //       ========================== */}
// //       <div className="overflow-x-auto">
// //         <table className="min-w-full text-sm border">
// //           <thead className="bg-gray-100 text-gray-600">
// //             <tr>
// //               <th className="p-2 border">Model</th>
// //               <th className="p-2 border">Brand</th>
// //               <th className="p-2 border">Requested</th>
// //               <th className="p-2 border">Verified</th>
// //               <th className="p-2 border">Approved</th>
// //               <th className="p-2 border">Purchased</th>
// //               <th className="p-2 border">Issued</th>
// //               <th className="p-2 border">Status</th>
// //             </tr>
// //           </thead>

// //           <tbody>
// //             {selectedMRN.items.map((item) => (
// //               <tr key={item.mpm_id} className="text-center border-t">
// //                 <td className="p-2 border">{item.model_no}</td>
// //                 <td className="p-2 border">{item.brand_name}</td>
// //                 <td className="p-2 border">{item.requested_qty}</td>
// //                 <td className="p-2 border">{item.verified_qty}</td>
// //                 <td className="p-2 border">{item.approval_qty}</td>
// //                 <td className="p-2 border">{item.purchase_qty}</td>
// //                 <td className="p-2 border">{item.issued_qty}</td>

// //                 <td className="p-2 border">
// //                   <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
// //                     {item.status}
// //                   </span>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* FOOTER */}
// //       <div className="mt-6 text-right">
// //         <button
// //           onClick={() => setIsModalOpen(false)}
// //           className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
// //         >
// //           Close
// //         </button>
// //       </div>
// //     </div>
// //   </div>
// // )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default CompletedMRNs;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import {
//   Eye,
//   Package,
//   ClipboardList,
//   TrendingUp,
//   X,
//   Calendar,
//   MapPin,
//   Building2,
//   Hash,
// } from 'lucide-react';
// import { BASE_URL } from '../../../public/config';

// interface MRNItem {
//   mpm_id: number;
//   model_no: string;
//   issued_qty: number | string;
//   requested_qty: number | string;
//   verified_qty: number | string;
//   approval_qty: number | string;
//   purchase_qty: number | string;
//   remaining_qty: number | string;
//   status: string;
// }

// interface MRN {
//   mrn_id: number;
//   mrn_number: string;
//   created_at: string;
//   mrn_status: string;
//   client_name: string;
//   city: string;
//   execution: {
//     schedule_name: string;
//   };
//   items: MRNItem[];
// }

// /* =========================
//    ✅ COMPONENT
// ========================= */

// const CompletedMRNs: React.FC = () => {
//   const [data, setData] = useState<MRN[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMRN, setSelectedMRN] = useState<MRN | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     fetchCompletedMRNs();
//   }, []);

//   const fetchCompletedMRNs = async () => {
//     try {
//       const res = await axios.get<{ data: MRN[] }>(
//         `${BASE_URL}api/completed/mrns`,
//       );
//       setData(res.data.data || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleView = (mrn: MRN) => {
//     setSelectedMRN(mrn);
//     setIsModalOpen(true);
//   };

//   /* =========================
//      ✅ SUMMARY DATA
//   ========================== */

//   const totalMRNs = data.length;

//   const totalItems = data.reduce((sum, mrn) => sum + mrn.items.length, 0);

//   const totalQty = data.reduce(
//     (sum, mrn) =>
//       sum + mrn.items.reduce((s, i) => s + Number(i.issued_qty || 0), 0),
//     0,
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600 text-lg">Loading MRNs...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
//       {/* =========================
//           HEADER
//       ========================== */}
//       <div className="mb-8">
//         <div className="flex items-center gap-3 mb-2">
//           <div className="h-10 w-1 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
//             Completed MRNs
//           </h1>
//         </div>
//         <p className="text-gray-500 ml-4">
//           View and manage all completed Material Requisition Notes
//         </p>
//       </div>

//       {/* =========================
//           TABLE
//       ========================== */}
//       <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm ">
//             <thead>
//               <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
//                 <th className="p-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
//                   MRN
//                 </th>
//                 <th className="p-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
//                   Client
//                 </th>
//                 <th className="p-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
//                   City
//                 </th>
//                 <th className="p-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
//                   Execution
//                 </th>
//                 <th className="p-4 text-center text-xs font-semibold text-black uppercase tracking-wider">
//                   Items
//                 </th>
//                 <th className="p-4 text-center text-xs font-semibold text-black uppercase tracking-wider">
//                   Qty
//                 </th>
//                 <th className="p-4 text-center text-xs font-semibold text-black uppercase tracking-wider">
//                   Date
//                 </th>
//                 <th className="p-4 text-center text-xs font-semibold text-black uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="p-4 text-center text-xs font-semibold text-black uppercase tracking-wider">
//                   Action
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-gray-100">
//               {data.length > 0 ? (
//                 data.map((mrn, index) => {
//                   const totalItems = mrn.items.length;
//                   const totalQty = mrn.items.reduce(
//                     (sum, item) => sum + Number(item.issued_qty || 0),
//                     0,
//                   );

//                   return (
//                     <tr
//                       key={mrn.mrn_id}
//                       className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group"
//                     >
//                       <td className="p-4">
//                         <div className="flex items-center gap-2">
//                           {/* <Hash className="w-4 h-4 text-gray-400" /> */}
//                           <span className="font-semibold text-blue-600">
//                             {mrn.mrn_number}
//                           </span>
//                         </div>
//                       </td>

//                       <td className="p-4">
//                         <div className="flex items-center gap-2">
//                           <Building2 className="w-4 h-4 text-black" />
//                           <span className="text-black">{mrn.client_name}</span>
//                         </div>
//                       </td>

//                       <td className="p-4">
//                         <div className="flex items-center gap-2">
//                           <MapPin className="w-4 h-4 text-black" />
//                           <span className="text-black">{mrn.city}</span>
//                         </div>
//                       </td>

//                       <td className="p-4">
//                         <span className="text-black">
//                           {mrn.execution?.schedule_name || '-'}
//                         </span>
//                       </td>

//                       <td className="p-4 text-center">
//                         <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 min-w-[40px]">
//                           {totalItems}
//                         </span>
//                       </td>

//                       <td className="p-4 text-center">
//                         <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 min-w-[40px]">
//                           {totalQty}
//                         </span>
//                       </td>

//                       <td className="p-4 text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           <Calendar className="w-3 h-3 text-gray-400" />
//                           <span className="text-black text-xs">
//                             {new Date(mrn.created_at).toLocaleDateString()}
//                           </span>
//                         </div>
//                       </td>

//                       {/* STATUS BADGE */}
//                       <td className="p-4 text-center">
//                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
//                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
//                           Completed
//                         </span>
//                       </td>

//                       {/* ACTION */}
//                       <td className="p-4 text-center">
//                         <button
//                           onClick={() => handleView(mrn)}
//                           className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
//                         >
//                           <Eye size={15} />
//                           <span className="text-sm">View</span>
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan={9} className="text-center py-16 text-gray-500">
//                     <div className="flex flex-col items-center gap-3">
//                       <Package className="w-16 h-16 text-gray-300" />
//                       <p className="text-lg font-medium">
//                         No Completed MRNs Found
//                       </p>
//                       <p className="text-sm">
//                         All completed MRNs will appear here
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {isModalOpen && selectedMRN && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
//             {/* MODAL BOX */}
//             <div className="bg-white w-[70%] max-w-6xl ml-40 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
//               {/* HEADER with Gradient */}
//               <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex justify-between items-center">
//                 <div>
//                   <h2 className="text-xl font-semibold text-white">
//                     Material Requisition Note
//                   </h2>
//                   <p className="text-gray-300 text-sm mt-0.5">
//                     Complete details and item breakdown
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>

//               {/* =========================
//                   MRN INFO - Cards Grid
//               ========================== */}
//               <div className="p-6 bg-gray-50 border-b border-gray-200">
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//                   <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
//                     <p className="text-xs text-gray-500 mb-1">MRN Number</p>
//                     <p className="font-semibold text-gray-800 text-sm">
//                       {selectedMRN.mrn_number}
//                     </p>
//                   </div>

//                   <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
//                     <p className="text-xs text-gray-500 mb-1">Client</p>
//                     <p className="font-semibold text-gray-800 text-sm">
//                       {selectedMRN.client_name}
//                     </p>
//                   </div>

//                   <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
//                     <p className="text-xs text-gray-500 mb-1">City</p>
//                     <p className="font-semibold text-gray-800 text-sm">
//                       {selectedMRN.city}
//                     </p>
//                   </div>

//                   <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
//                     <p className="text-xs text-gray-500 mb-1">Date</p>
//                     <p className="font-semibold text-gray-800 text-sm">
//                       {new Date(selectedMRN.created_at).toLocaleDateString()}
//                     </p>
//                   </div>

//                   <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
//                     <p className="text-xs text-gray-500 mb-1">Status</p>
//                     <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
//                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
//                       Completed
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* =========================
//                   PRODUCT TABLE
//               ========================== */}
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-gray-800">
//                     Item Details
//                   </h3>
//                   <span className="text-sm text-gray-500">
//                     {selectedMRN.items.length} items
//                   </span>
//                 </div>

//                 <div className="overflow-x-auto rounded-xl border border-gray-200">
//                   <table className="min-w-full text-sm">
//                     {/* HEADER */}
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">
//                           Model
//                         </th>
//                         <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                           Requested
//                         </th>
//                         <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                           Verified
//                         </th>
//                         <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                           Approved
//                         </th>
//                         {/* <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                           Purchased
//                         </th> */}
//                         <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                           Issued
//                         </th>
//                         {/* <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                           Remaining
//                         </th> */}
//                         <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                           Status
//                         </th>
//                       </tr>
//                     </thead>

//                     {/* BODY */}
//                     <tbody className="divide-y divide-gray-100">
//                       {selectedMRN.items.map((item) => (
//                         <tr
//                           key={item.mpm_id}
//                           className="hover:bg-gray-50 transition"
//                         >
//                           <td className="p-3 text-gray-700 font-medium">
//                             {item.model_no}
//                           </td>

//                           <td className="p-3 text-center">
//                             {item.requested_qty}
//                           </td>

//                           <td className="p-3 text-center">
//                             {item.verified_qty}
//                           </td>

//                           <td className="p-3 text-center">
//                             {item.approval_qty}
//                           </td>

//                           {/* <td className="p-3 text-center">
//                             <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
//                               {item.purchase_qty}
//                             </span>
//                           </td> */}

//                           <td className="p-3 text-center">
//                             <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
//                               {item.issued_qty}
//                             </span>
//                           </td>

//                           {/* <td className="p-3 text-center">
//                             <span className="text-red-500 font-medium">
//                               {item.remaining_qty}
//                             </span>
//                           </td> */}

//                           <td className="p-3 text-center">
//                             <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
//                               {item.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>

//                     {/* =========================
//           TOTAL ROW 🔥
//       ========================== */}
//                     <tfoot className="bg-gray-100 font-semibold">
//                       <tr>
//                         <td className="p-3 text-right">Total</td>

//                         <td className="p-3 text-center">
//                           {selectedMRN.items.reduce(
//                             (sum, i) => sum + Number(i.requested_qty || 0),
//                             0,
//                           )}
//                         </td>

//                         <td className="p-3 text-center">
//                           {selectedMRN.items.reduce(
//                             (sum, i) => sum + Number(i.verified_qty || 0),
//                             0,
//                           )}
//                         </td>

//                         <td className="p-3 text-center">
//                           {selectedMRN.items.reduce(
//                             (sum, i) => sum + Number(i.approval_qty || 0),
//                             0,
//                           )}
//                         </td>

//                         <td className="p-3 text-center">
//                           {selectedMRN.items.reduce(
//                             (sum, i) => sum + Number(i.purchase_qty || 0),
//                             0,
//                           )}
//                         </td>

//                         <td className="p-3 text-center text-green-700">
//                           {selectedMRN.items.reduce(
//                             (sum, i) => sum + Number(i.issued_qty || 0),
//                             0,
//                           )}
//                         </td>

//                         <td className="p-3 text-center text-red-500">
//                           {selectedMRN.items.reduce(
//                             (sum, i) => sum + Number(i.remaining_qty || 0),
//                             0,
//                           )}
//                         </td>

//                         <td></td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </div>

//               {/* FOOTER */}
//               <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CompletedMRNs;



import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, Package, X, Calendar, MapPin, Building2 } from 'lucide-react';
import { BASE_URL } from '../../../public/config';


interface Bill {
  bill_id: number;
  bill_number: string;
  bill_date: string;
  total_amount: number | null;
  images: string[];
}

interface PurchaseOrder {
  po_id: number;
  po_number: string;
  qty: number;
  unit_price: string;
  total_price: string;
  status: string;
  received_qty: number;
  bill_status: string;
  bills: Bill[];
}

interface MRNItem {
  mpm_id: number;
  model_id: number;
  brand_id: number;
  brand_name: string;
  model_no: string;
  requested_qty: number;
  verified_qty: number;
  approval_qty: number;
  purchase_qty: number;
  purchase_status: string;
  issued_qty: string | number;
  remaining_qty: number;
  status: string;
  purchase_orders: PurchaseOrder[];
}

interface MRN {
  mrn_id: number;
  mrn_number: string;
  master_id: number;
  qt_id: number;
  expected_date: string | null;
  created_at: string;
  mrn_status: string;
  client_name: string;
  city: string;
  execution: {
    execution_id: number;
    schedule_name: string;
  };
  items: MRNItem[];
}

/* =========================
   ✅ COMPONENT
========================= */

const CompletedMRNs: React.FC = () => {
  const [data, setData] = useState<MRN[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMRN, setSelectedMRN] = useState<MRN | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedMRNs();
  }, []);

  const fetchCompletedMRNs = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${BASE_URL}api/completed/mrns`, {
        withCredentials: true,
      });

      if (response.data?.success) {
        setData(response.data.data || []);
      } else {
        setError(response.data?.message || 'Failed to fetch completed MRNs');
      }
    } catch (err: any) {
      console.error('Error fetching MRNs:', err);

      setError(err.response?.data?.message || 'Failed to fetch completed MRNs');
    } finally {
      setLoading(false);
    }
  };
  
  const handleView = (mrn: MRN) => {
    setSelectedMRN(mrn);
    setIsModalOpen(true);
  };

  /* =========================
     ✅ SUMMARY DATA
  ========================== */

  const totalMRNs = data.length;

  const totalItems = data.reduce((sum, mrn) => sum + mrn.items.length, 0);

  const totalQty = data.reduce(
    (sum, mrn) =>
      sum + mrn.items.reduce((s, i) => s + Number(i.issued_qty || 0), 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading MRNs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      {/* =========================
          HEADER
      ========================== */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-1 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Completed MRNs
          </h1>
        </div>
        <p className="text-gray-500 ml-4">
          View and manage all completed Material Requisition Notes
        </p>
      </div>

      {/* =========================
          TABLE
      ========================== */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm ">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="p-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  MRN
                </th>
                <th className="p-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  Client
                </th>
                <th className="p-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  City
                </th>
                <th className="p-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  Execution
                </th>
                <th className="p-4 text-center text-xs font-semibold text-black uppercase tracking-wider">
                  Items
                </th>
                <th className="p-4 text-center text-xs font-semibold text-black uppercase tracking-wider">
                  Qty
                </th>
                <th className="p-4 text-center text-xs font-semibold text-black uppercase tracking-wider">
                  Date
                </th>
                <th className="p-4 text-center text-xs font-semibold text-black uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-center text-xs font-semibold text-black uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {data.length > 0 ? (
                data.map((mrn) => {
                  const totalItemsCount = mrn.items.length;
                  const totalIssuedQty = mrn.items.reduce(
                    (sum, item) => sum + Number(item.issued_qty || 0),
                    0,
                  );

                  return (
                    <tr
                      key={mrn.mrn_id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-600">
                            {mrn.mrn_number}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-black" />
                          <span className="text-black">{mrn.client_name}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-black" />
                          <span className="text-black">{mrn.city}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-black">
                          {mrn.execution?.schedule_name || '-'}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 min-w-[40px]">
                          {totalItemsCount}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 min-w-[40px]">
                          {totalIssuedQty}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-black text-xs">
                            {new Date(mrn.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* STATUS BADGE */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                          {mrn.mrn_status}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleView(mrn)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <Eye size={15} />
                          <span className="text-sm">View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="w-16 h-16 text-gray-300" />
                      <p className="text-lg font-medium">
                        No Completed MRNs Found
                      </p>
                      <p className="text-sm">
                        All completed MRNs will appear here
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && selectedMRN && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm ml-40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            {/* MODAL BOX */}
            <div className="bg-white w-[75%] max-w-6xl rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 max-h-[80vh] flex flex-col">
              {/* HEADER with Gradient */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Material Requisition Note
                  </h2>
                  <p className="text-gray-300 text-sm mt-0.5">
                    Complete details and item breakdown
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* =========================
                  MRN INFO - Cards Grid
              ========================== */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">MRN Number</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedMRN.mrn_number}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Client</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedMRN.client_name}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">City</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedMRN.city}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {new Date(selectedMRN.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                      {selectedMRN.mrn_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* =========================
                  PRODUCT TABLE
              ========================== */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Item Details
                  </h3>
                  <span className="text-sm text-gray-500">
                    {selectedMRN.items.length} items
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full text-sm">
                    {/* HEADER */}
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Brand / Model
                        </th>
                        <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Requested
                        </th>
                        <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Verified
                        </th>
                        <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Approved
                        </th>
                        <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Purchased
                        </th>
                        <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">   
                          Issued
                        </th>
                        <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Remaining
                        </th>
                        <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          PO / Bill
                        </th>
                      </tr>
                    </thead>

                    {/* BODY */}
                    <tbody className="divide-y divide-gray-100">
                      {selectedMRN.items.map((item) => (
                        <tr
                          key={item.mpm_id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-gray-800">
                                {item.brand_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.model_no}
                              </p>
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            {item.requested_qty}
                          </td>

                          <td className="p-3 text-center">
                            {item.verified_qty}
                          </td>

                          <td className="p-3 text-center">
                            {item.approval_qty}
                          </td>

                          <td className="p-3 text-center">
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                              {item.purchase_qty}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                              {item.issued_qty}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <span className="text-red-500 font-medium">
                              {item.remaining_qty}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              {item.status}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            {item.purchase_orders?.map((po) => (
                              <div key={po.po_id} className="text-xs">
                                <p className="font-medium text-blue-600">
                                  {po.po_number}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {po.status}
                                </p>
                                {po.bills?.map((bill) => (
                                  <div key={bill.bill_id} className="mt-1">
                                    <p className="text-green-600">
                                      Bill: {bill.bill_number}
                                    </p>
                                    {bill.images?.map((img, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className="text-blue-500 text-xs underline hover:text-blue-700"
                                      >
                                        View Bill
                                      </button>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    {/* TOTAL ROW */}
                    <tfoot className="bg-gray-100 font-semibold">
                      <tr>
                        <td className="p-3 text-right">Total</td>
                        <td className="p-3 text-center">
                          {selectedMRN.items.reduce(
                            (sum, i) => sum + Number(i.requested_qty || 0),
                            0,
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {selectedMRN.items.reduce(
                            (sum, i) => sum + Number(i.verified_qty || 0),
                            0,
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {selectedMRN.items.reduce(
                            (sum, i) => sum + Number(i.approval_qty || 0),
                            0,
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {selectedMRN.items.reduce(
                            (sum, i) => sum + Number(i.purchase_qty || 0),
                            0,
                          )}
                        </td>
                        <td className="p-3 text-center text-green-700">
                          {selectedMRN.items.reduce(
                            (sum, i) => sum + Number(i.issued_qty || 0),
                            0,
                          )}
                        </td>
                        <td className="p-3 text-center text-red-500">
                          {selectedMRN.items.reduce(
                            (sum, i) => sum + Number(i.remaining_qty || 0),
                            0,
                          )}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* FOOTER */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end sticky bottom-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-[50] p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-3xl max-h-[70vh] bg-white rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 z-10"
              >
                <X size={20} />
              </button>
              <img
                src={selectedImage}
                alt="Bill"
                className="max-w-full max-h-[90vh] object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/no-image.png'; // local fallback
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedMRNs;

