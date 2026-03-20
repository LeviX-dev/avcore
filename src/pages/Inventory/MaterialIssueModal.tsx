// MaterialIssueModal.tsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSpinner,
  faTruck,
  faIdCard,
  faBoxOpen,
  faClipboardCheck,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

interface MaterialIssueModalProps {
  data: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const MaterialIssueModal = ({ data, onClose, onSave }: MaterialIssueModalProps) => {
  const [issueNotes, setIssueNotes] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [issuedQuantities, setIssuedQuantities] = useState<Record<string, string>>({});
  const [selectedAction, setSelectedAction] = useState<"issue" | "partial" | null>(null);

  if (!data) return null;

  const quotation = data.quotations?.[0];

  const handleQtyChange = (key: string, value: string) => {
    setIssuedQuantities({
      ...issuedQuantities,
      [key]: value,
    });
  };

  const calculatePendingQty = (requestedQty: number, approvedQty: number, issuedQty: string) => {
    const issued = parseInt(issuedQty) || 0;
    return Math.max(approvedQty - issued, 0);
  };

  const calculateTotalIssued = () => {
    let total = 0;
    quotation?.kits?.forEach((kit: any, kIndex: number) => {
      kit.items?.forEach((item: any, iIndex: number) => {
        const key = `${kIndex}-${iIndex}`;
        const issued = parseInt(issuedQuantities[key]) || 0;
        total += issued;
      });
    });
    return total;
  };

  const handleIssueMaterial = () => {
    setSelectedAction("issue");
    const confirmAction = window.confirm(
      "Are you sure you want to issue these materials?"
    );
    if (!confirmAction) return;

    setIsIssuing(true);

    setTimeout(() => {
      const issuedMRN = {
        master_id: data.master_id,
        mrn_number: data.mrn_number,
        issue_date: new Date().toISOString(),
        issued_by: "Current User",
        issue_notes: issueNotes,
        status: "material_issued",
        lead_details: data.lead,
        action: "issued",
        issued_quantities: issuedQuantities,
        total_items_issued: calculateTotalIssued(),
      };

      onSave(issuedMRN);
      setIsIssuing(false);
    }, 1000);
  };

  const handlePartialIssue = () => {
    setSelectedAction("partial");
    const confirmAction = window.confirm(
      "Are you sure you want to issue partial materials?"
    );
    if (!confirmAction) return;

    setIsIssuing(true);

    setTimeout(() => {
      const issuedMRN = {
        master_id: data.master_id,
        mrn_number: data.mrn_number,
        issue_date: new Date().toISOString(),
        issued_by: "Current User",
        issue_notes: issueNotes,
        status: "partially_issued",
        lead_details: data.lead,
        action: "partial",
        issued_quantities: issuedQuantities,
        total_items_issued: calculateTotalIssued(),
      };

      onSave(issuedMRN);
      setIsIssuing(false);
    }, 1000);
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

  // Check if any quantities have been entered
  const hasIssuedQuantities = Object.values(issuedQuantities).some(qty => parseInt(qty) > 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-5xl max-h-[90vh] mt-20 ml-70 rounded-xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon
                icon={faTruck}
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Issue Material
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Issue materials against approved MRN
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isIssuing}
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
              Material Issue Details
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
                  <th className="p-2 text-right text-gray-600 dark:text-gray-300 font-medium">Requested</th>
                  <th className="p-2 text-right text-gray-600 dark:text-gray-300 font-medium">Approved</th>
                  <th className="p-2 text-right text-gray-600 dark:text-gray-300 font-medium">Issued</th>
                  <th className="p-2 text-right text-gray-600 dark:text-gray-300 font-medium">Pending</th>
                </tr>
              </thead>

              <tbody className="divide-y dark:divide-gray-700">
                {quotation?.kits?.map((kit: any, kIndex: number) =>
                  kit.items.map((item: any, iIndex: number) => {
                    const key = `${kIndex}-${iIndex}`;
                    const issuedQty = issuedQuantities[key] || "";
                    const approvedQty = item.prod_qty; 
                    const requestedQty = item.prod_qty;
                    const pendingQty = calculatePendingQty(requestedQty, approvedQty, issuedQty);
                    
                    return (
                      <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-2">
                          <div className="font-medium dark:text-white">{kit.kit_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.model}
                          </div>
                        </td>
                        <td className="p-2 dark:text-gray-300">{item.brand_name}</td>
                        <td className="p-2 text-right font-medium dark:text-white">
                          {requestedQty}
                        </td>
                        <td className="p-2 text-right font-medium text-green-600 dark:text-green-400">
                          {approvedQty}
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            min="0"
                            max={approvedQty}
                            value={issuedQty}
                            onChange={(e) => handleQtyChange(key, e.target.value)}
                            className="w-16 text-right border border-gray-200 dark:border-gray-600 rounded px-1 py-1 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-purple-500 dark:text-white"
                            placeholder="0"
                            disabled={isIssuing}
                          />
                        </td>
                        <td className="p-2 text-right">
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-600 dark:text-blue-400">Total Requested Items</p>
              <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                {quotation?.kits?.reduce((total: number, kit: any) => 
                  total + kit.items.reduce((sum: number, item: any) => sum + item.prod_qty, 0), 0
                )}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-xs text-green-600 dark:text-green-400">Total Issued</p>
              <p className="text-lg font-bold text-green-800 dark:text-green-300">
                {calculateTotalIssued()}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <p className="text-xs text-purple-600 dark:text-purple-400">Grand Total</p>
              <p className="text-lg font-bold text-purple-800 dark:text-purple-300">
                ₹ {calculateTotal().toLocaleString()}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            disabled={isIssuing}
          >
            Cancel
          </button>

          <button
            onClick={handleIssueMaterial}
            disabled={isIssuing || !hasIssuedQuantities}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
          >
            {isIssuing && selectedAction === "issue" ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Issuing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTruck} />
                Issue Material
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialIssueModal;