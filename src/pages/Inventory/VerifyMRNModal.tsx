// import React, { useState } from "react";

// const VerifyMRNModal = ({ data, onClose }) => {
//   const quotation = data.quotations?.[0];

//   const [verifiedData, setVerifiedData] = useState({});

//   const handleQtyChange = (key, value) => {
//     setVerifiedData({
//       ...verifiedData,
//       [key]: value,
//     });
//   };

//   const handleSubmit = () => {
//     console.log("Verified Data:", verifiedData);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center ml-40">
//       <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">

//         {/* Header */}
//         <div className="flex justify-between mb-4">
//           <h2 className="text-lg font-semibold">Verify MRN</h2>
//           <button onClick={onClose} className="text-xl">×</button>
//         </div>

//         {/* Customer */}
//         <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
//           <b>{data.lead.name}</b> | {data.lead.number} | {data.lead.city}
//         </div>

//         {/* Product Table */}
//         <div className="border rounded-lg">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-2 text-left">Product</th>
//                 <th className="p-2 text-left">Brand</th>
//                 <th className="p-2 text-center">Requested</th>
//                 <th className="p-2 text-center">Verified</th>
//                 <th className="p-2 text-center">Pending Qty</th>
//               </tr>
//             </thead>

//             <tbody>
//               {quotation.kits.map((kit, kIndex) =>
//                 kit.items.map((item, iIndex) => {
//                   const key = `${kIndex}-${iIndex}`;
//                   const verifiedQty = verifiedData[key] || "";

//                   return (
//                     <tr key={key} className="border-t">
//                       <td className="p-2">
//                         {kit.kit_name}
//                         <div className="text-xs text-gray-500">
//                           {item.model}
//                         </div>
//                       </td>

//                       <td className="p-2">{item.brand_name}</td>

//                       {/* Requested */}
//                       <td className="p-2 text-center font-semibold">
//                         {item.prod_qty}
//                       </td>

//                       {/* Verified */}
//                       <td className="p-2 text-center">
//                         <input
//                           type="number"
//                           min="0"
//                           value={verifiedQty}
//                           onChange={(e) =>
//                             handleQtyChange(key, e.target.value)
//                           }
//                           className="w-16 border rounded px-2 py-1 text-center"
//                         />
//                       </td>

                     
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end mt-4 gap-2">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-300 rounded"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleSubmit}
//             className="px-4 py-2 bg-purple-600 text-white rounded"
//           >
//             Confirm Verification
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default VerifyMRNModal;



import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSpinner,
  faUserCheck,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";

interface VerifyMRNModalProps {
  data: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const VerifyMRNModal = ({ data, onClose, onSave }: VerifyMRNModalProps) => {
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState<Record<string, string>>({});

  if (!data) return null;

  const quotation = data.quotations?.[0];

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

  const handleVerify = () => {
    const confirmAction = window.confirm(
      "Are you sure you want to verify this MRN?"
    );
    if (!confirmAction) return;

    setIsVerifying(true);

    setTimeout(() => {
      const verifiedMRN = {
        master_id: data.master_id,
        mrn_number: data.mrn_number,
        verified_date: new Date().toISOString(),
        verified_by: "Current User",
        verification_notes: verificationNotes,
        status: "verified",
        lead_details: data.lead,
        verified_quantities: verifiedData,
      };

      onSave(verifiedMRN);
      setIsVerifying(false);
    }, 1000);
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
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-xl mt-20 ml-70 shadow-lg flex flex-col">

        {/* Header (Fixed) */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon
                icon={faIdCard}
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Verify MRN
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Review details before verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isVerifying}
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
                          <div className="font-medium dark:text-white">{kit.kit_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.model}
                            {item.description && <span> - {item.description}</span>}
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
                            disabled={isVerifying}
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

        </div>

        {/* Footer (Fixed) */}
        <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            disabled={isVerifying}
          >
            Cancel
          </button>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded flex items-center gap-2 disabled:opacity-50 hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            {isVerifying ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheckCircle} />
                Verify MRN
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyMRNModal;