// import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faCheckCircle,
//   faSpinner,
//   faUserCheck,
//   faIdCard,
//   faClock,
//   faCalendarCheck,
//   faTimes,
// } from "@fortawesome/free-solid-svg-icons";

// interface ApproveMRNModalProps {
//   data: any;
//   onClose: () => void;
//   onSave: (data: any) => void;
// }

// const ApproveMRNModal = ({ data, onClose, onSave }: ApproveMRNModalProps) => {
//   const [approvalNotes, setApprovalNotes] = useState("");
//   const [isApproving, setIsApproving] = useState(false);
//   const [approvalStatus, setApprovalStatus] = useState<"pending" | "success" | "error">("pending");
//   const [selectedAction, setSelectedAction] = useState<"approve" | "reject" | null>(null);

//   if (!data) return null;

//   const quotation = data.quotations?.[0];

//   const handleApprove = () => {
//     setSelectedAction("approve");
//     const confirmAction = window.confirm(
//       "Are you sure you want to approve this MRN?"
//     );
//     if (!confirmAction) return;

//     setIsApproving(true);
//     setApprovalStatus("pending");

//     setTimeout(() => {
//       setApprovalStatus("success");

//       const approvedMRN = {
//         master_id: data.master_id,
//         mrn_number: data.mrn_number,
//         approved_date: new Date().toISOString(),
//         approved_by: "Current User",
//         approval_notes: approvalNotes,
//         status: "approved",
//         lead_details: data.lead,
//         action: "approved"
//       };

//       onSave(approvedMRN);
//       setIsApproving(false);
//     }, 1000);
//   };

//   const handleReject = () => {
//     setSelectedAction("reject");
//     const confirmAction = window.confirm(
//       "Are you sure you want to reject this MRN? This action cannot be undone."
//     );
//     if (!confirmAction) return;

//     setIsApproving(true);
//     setApprovalStatus("pending");

//     setTimeout(() => {
//       setApprovalStatus("success");

//       const rejectedMRN = {
//         master_id: data.master_id,
//         mrn_number: data.mrn_number,
//         rejected_date: new Date().toISOString(),
//         rejected_by: "Current User",
//         rejection_notes: approvalNotes,
//         status: "rejected",
//         lead_details: data.lead,
//         action: "rejected"
//       };

//       onSave(rejectedMRN);
//       setIsApproving(false);
//     }, 1000);
//   };

//   const calculateTotal = () => {
//     let total = 0;
//     quotation?.kits?.forEach((kit: any) => {
//       kit.items?.forEach((item: any) => {
//         total += (item.prod_price * item.prod_qty) || 0;
//       });
//     });
//     return total;
//   };

//   const InfoBox = ({ label, value, highlight = false }: any) => (
//     <div className="bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600">
//       <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
//       <p
//         className={`text-sm font-medium ${
//           highlight ? "text-purple-600 font-mono" : "dark:text-white"
//         }`}
//       >
//         {value || "-"}
//       </p>
//     </div>
//   );

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
//       {/* Modal Container */}
//       <div className="bg-white dark:bg-gray-800 w-full max-w-5xl max-h-[90vh] mt-20 ml-60 rounded-xl shadow-lg flex flex-col">

//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
//               <FontAwesomeIcon
//                 icon={faCalendarCheck}
//                 className="h-5 w-5 text-purple-600 dark:text-purple-400"
//               />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                 Approve MRN
//               </h2>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Review and approve/reject MRN items
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-2xl dark:text-gray-400 dark:hover:text-gray-200"
//             disabled={isApproving}
//           >
//             ×
//           </button>
//         </div>

//         {/* Scrollable Content */}
//         <div className="p-4 overflow-y-auto flex-1">

//           {/* Client Info */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
//             <InfoBox label="MRN No" value={data.mrn_number} highlight />
//             <InfoBox label="Client" value={data.lead?.name} />
//             <InfoBox label="Mobile" value={data.lead?.number} />
//             <InfoBox label="City" value={data.lead?.city} />
//           </div>

//           {/* Quotation Header */}
//           <div className="flex justify-between items-center mb-2">
//             <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
//               MRN Items
//             </h3>
//             <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
//               QT: {quotation?.qt_number || "N/A"}
//             </span>
//           </div>

//           {/* Scrollable Table */}
//           <div className="border dark:border-gray-700 rounded-lg max-h-[280px] overflow-y-auto mb-4">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
//                 <tr>
                
//                   <th className="p-2 text-left text-gray-600 dark:text-gray-300 font-medium">Product</th>
//                   <th className="p-2 text-left text-gray-600 dark:text-gray-300 font-medium">Brand</th>
//                   <th className="p-2 text-right text-gray-600 dark:text-gray-300 font-medium">Qty</th>
//                   <th className="p-2 text-right text-gray-600 dark:text-gray-300 font-medium">Price</th>
//                   <th className="p-2 text-right text-gray-600 dark:text-gray-300 font-medium">Total</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y dark:divide-gray-700">
//                 {quotation?.kits?.map((kit: any, kIndex: number) =>
//                   kit.items.map((item: any, iIndex: number) => (
//                     <tr key={`${kIndex}-${iIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                     
//                       <td className="p-2">
//                         <div className="font-medium dark:text-white">{item.model}</div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">
//                           {item.description || "No description"}
//                         </div>
//                       </td>
//                       <td className="p-2 dark:text-gray-300">{item.brand_name}</td>
//                       <td className="p-2 text-right font-medium dark:text-white">
//                         {item.prod_qty}
//                       </td>
//                       <td className="p-2 text-right dark:text-gray-300">
//                         ₹ {item.prod_price?.toLocaleString()}
//                       </td>
//                       <td className="p-2 text-right font-medium dark:text-white">
//                         ₹ {(item.prod_price * item.prod_qty)?.toLocaleString()}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Grand Total */}
//           <div className="flex justify-end mb-4">
//             <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
//               Grand Total: ₹ {calculateTotal().toLocaleString()}
//             </div>
//           </div>

//           {/* Approval Notes */}
//           <div className="mb-4">
//             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
//               Approval/Rejection Notes
//             </label>
//             <textarea
//               rows={2}
//               value={approvalNotes}
//               onChange={(e) => setApprovalNotes(e.target.value)}
//               className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//               placeholder="Add notes for approval or rejection..."
//               disabled={isApproving}
//             />
//           </div>

//           {/* Summary */}
//           <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-sm">
//             <div className="flex items-start gap-2">
//               <FontAwesomeIcon
//                 icon={faUserCheck}
//                 className="text-purple-600 dark:text-purple-400 mt-1"
//               />
//               <p className="text-purple-800 dark:text-purple-300">
//                 By approving, you confirm that all MRN items are correct and ready for processing.
//                 Rejection will send the MRN back for revision.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//             disabled={isApproving}
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleReject}
//             disabled={isApproving}
//             className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50"
//           >
//             {isApproving && selectedAction === "reject" ? (
//               <>
//                 <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
//                 Rejecting...
//               </>
//             ) : (
//               <>
//                 <FontAwesomeIcon icon={faTimes} />
//                 Reject
//               </>
//             )}
//           </button>

//           <button
//             onClick={handleApprove}
//             disabled={isApproving}
//             className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
//           >
//             {isApproving && selectedAction === "approve" ? (
//               <>
//                 <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
//                 Approving...
//               </>
//             ) : (
//               <>
//                 <FontAwesomeIcon icon={faCheckCircle} />
//                 Approve
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApproveMRNModal;


import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSpinner,
  faUserCheck,
  faIdCard,
  faClock,
  faCalendarCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface ApproveMRNModalProps {
  data: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ApproveMRNModal = ({ data, onClose, onSave }: ApproveMRNModalProps) => {
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "success" | "error">("pending");
  const [selectedAction, setSelectedAction] = useState<"approve" | "reject" | null>(null);
  const [verifiedData, setVerifiedData] = useState<Record<string, string>>({});

  if (!data) return null;

  const quotation = data.quotations?.[0];

  const handleApprove = () => {
    setSelectedAction("approve");
    const confirmAction = window.confirm(
      "Are you sure you want to approve this MRN?"
    );
    if (!confirmAction) return;

    setIsApproving(true);
    setApprovalStatus("pending");

    setTimeout(() => {
      setApprovalStatus("success");

      const approvedMRN = {
        master_id: data.master_id,
        mrn_number: data.mrn_number,
        approved_date: new Date().toISOString(),
        approved_by: "Current User",
        approval_notes: approvalNotes,
        status: "approved",
        lead_details: data.lead,
        action: "approved"
      };

      onSave(approvedMRN);
      setIsApproving(false);
    }, 1000);
  };

  const handleReject = () => {
    setSelectedAction("reject");
    const confirmAction = window.confirm(
      "Are you sure you want to reject this MRN? This action cannot be undone."
    );
    if (!confirmAction) return;

    setIsApproving(true);
    setApprovalStatus("pending");

    setTimeout(() => {
      setApprovalStatus("success");

      const rejectedMRN = {
        master_id: data.master_id,
        mrn_number: data.mrn_number,
        rejected_date: new Date().toISOString(),
        rejected_by: "Current User",
        rejection_notes: approvalNotes,
        status: "rejected",
        lead_details: data.lead,
        action: "rejected"
      };

      onSave(rejectedMRN);
      setIsApproving(false);
    }, 1000);
  };

  const handleQtyChange = (key: string, value: string) => {
    setVerifiedData({
      ...verifiedData,
      [key]: value,
    });
  };

  const calculatePendingQty = (requestedQty: number, verifiedQty: string) => {
    const verified = parseInt(verifiedQty) || 0;
    return Math.max(requestedQty - verified, 0);
  };

  const calculateTotal = () => {
    let total = 0;
    quotation?.kits?.forEach((kit: any) => {
      kit.items?.forEach((item: any) => {
        total += (item.prod_price * item.prod_qty) || 0;
      });
    });
    return total;
  };

  const InfoBox = ({ label, value, highlight = false }: any) => (
    <div className="bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`text-sm font-medium ${
          highlight ? "text-purple-600 font-mono" : "dark:text-white"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-5xl max-h-[90vh] mt-20 ml-60 rounded-xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon
                icon={faCalendarCheck}
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Approve MRN
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Review and approve/reject MRN items
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isApproving}
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1">

          {/* Client Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <InfoBox label="MRN No" value={data.mrn_number} highlight />
            <InfoBox label="Client" value={data.lead?.name} />
            <InfoBox label="Mobile" value={data.lead?.number} />
            <InfoBox label="City" value={data.lead?.city} />
          </div>

          {/* Quotation Header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              MRN Items
            </h3>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
              QT: {quotation?.qt_number || "N/A"}
            </span>
          </div>

          {/* Scrollable Table */}
          <div className="border dark:border-gray-700 rounded-lg max-h-[280px] overflow-y-auto mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="p-2 text-left text-gray-600 dark:text-gray-300 font-medium">Product</th>
                  <th className="p-2 text-left text-gray-600 dark:text-gray-300 font-medium">Brand</th>
                  <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium">Requested Qty</th>
                  <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium">Verified Qty</th>
                  <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium">Pending Qty</th>
                </tr>
              </thead>

              <tbody className="divide-y dark:divide-gray-700">
                {quotation?.kits?.map((kit: any, kIndex: number) =>
                  kit.items.map((item: any, iIndex: number) => {
                    const key = `${kIndex}-${iIndex}`;
                    const verifiedQty = verifiedData[key] || "";
                    const pendingQty = calculatePendingQty(item.prod_qty, verifiedQty);
                    
                    return (
                      <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-2">
                          <div className="font-medium dark:text-white">{item.model}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description || "No description"}
                          </div>
                        </td>
                        <td className="p-2 dark:text-gray-300">{item.brand_name}</td>
                        <td className="p-2 text-center font-medium dark:text-white">
                          {item.prod_qty}
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max={item.prod_qty}
                            value={verifiedQty}
                            onChange={(e) => handleQtyChange(key, e.target.value)}
                            className="w-16 border rounded px-2 py-1 text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isApproving}
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <span className={`font-medium ${
                            pendingQty > 0 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {pendingQty}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total */}
          <div className="flex justify-end mb-4">
            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              Grand Total: ₹ {calculateTotal().toLocaleString()}
            </div>
          </div>

      
       
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            disabled={isApproving}
          >
            Cancel
          </button>


          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
          >
            {isApproving && selectedAction === "approve" ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheckCircle} />
                Approve
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveMRNModal;