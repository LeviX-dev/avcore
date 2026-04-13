import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSpinner,
  faTruck,
  faIdCard,
  faBoxOpen,
  faClipboardCheck,
  faExclamationTriangle,
  faBox,
  faUser,
  faMapMarkerAlt,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from '../../../public/config.js';

interface IssueItem {
  mpm_id: number;
  prod_id: number;
  model_id: number;
  brand_id: number;
  brand_name: string;
  model_no: string;
  requested_qty: number;
  verified_qty: number;
  approval_qty: number;
  issued_qty: string;
  remaining_qty: string;
  issue_status: string;
}

interface IssueMRNData {
  mrn_id: number;
  mrn_number: string;
  mrn_status: string;
  created_at: string;
  client_name: string;
  city: string;
  items: IssueItem[];
}

interface MaterialIssueModalProps {
  data: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const MaterialIssueModal = ({ data, onClose, onSave }: MaterialIssueModalProps) => {
  const [issueNotes, setIssueNotes] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [issuedQuantities, setIssuedQuantities] = useState<Record<number, string>>({});
  const [selectedAction, setSelectedAction] = useState<"issue" | "partial" | null>(null);

  if (!data) return null;

  const mrnData: IssueMRNData = data;

  const handleQtyChange = (mpmId: number, value: string, maxQty: number) => {
    let qty = parseInt(value) || 0;
    if (qty > maxQty) qty = maxQty;
    if (qty < 0) qty = 0;
    
    setIssuedQuantities({
      ...issuedQuantities,
      [mpmId]: qty.toString(),
    });
  };

  const calculateRemainingQty = (item: IssueItem, issuedQty: number) => {
    const approvalQty = item.approval_qty;
    return Math.max(approvalQty - issuedQty, 0);
  };

  const calculateTotalIssued = () => {
    let total = 0;
    mrnData?.items?.forEach((item: IssueItem) => {
      const issued = parseInt(issuedQuantities[item.mpm_id]) || 0;
      total += issued;
    });
    return total;
  };

  const calculateTotalApproved = () => {
    return mrnData?.items?.reduce((total, item) => total + item.approval_qty, 0) || 0;
  };

  const calculateTotalRequested = () => {
    return mrnData?.items?.reduce((total, item) => total + item.requested_qty, 0) || 0;
  };

  const handleIssueMaterial = async () => {
    setSelectedAction("issue");

    const confirmAction = window.confirm(
      "Are you sure you want to issue these materials?"
    );
    if (!confirmAction) return;

    try {
      setIsIssuing(true);

      const itemsPayload: any[] = [];

      mrnData?.items?.forEach((item: IssueItem) => {
        const qty = parseInt(issuedQuantities[item.mpm_id]) || 0;

        if (qty > 0) {
          itemsPayload.push({
            mpm_id: item.mpm_id,
            model_id: item.model_id,
            prod_id: item.prod_id,
            brand_id: item.brand_id,
            issue_qty: qty,
          });
        }
      });

      if (itemsPayload.length === 0) {
        alert("Please enter at least one quantity to issue");
        setIsIssuing(false);
        return;
      }

      const payload = {
        mrn_id: mrnData.mrn_id,
        mrn_number: mrnData.mrn_number,
        issued_by: "Current User",
        issue_notes: issueNotes,
        items: itemsPayload,
        action: "issued"
      };

      const response = await axios.post(`${BASE_URL}api/issue-mrn`, payload, {
        withCredentials: true
      });

      if (response.data?.success) {
        alert(response.data.message || "Items issued successfully");
        onSave(response.data);
        onClose();
      } else {
        throw new Error(response.data?.message || "Issue failed");
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Issue failed. Please try again.");
    } finally {
      setIsIssuing(false);
    }
  };

  const handlePartialIssue = async () => {
    setSelectedAction("partial");

    const confirmAction = window.confirm(
      "Are you sure you want to issue partial materials?"
    );
    if (!confirmAction) return;

    try {
      setIsIssuing(true);

      const itemsPayload: any[] = [];

      mrnData?.items?.forEach((item: IssueItem) => {
        const qty = parseInt(issuedQuantities[item.mpm_id]) || 0;

        if (qty > 0) {
          itemsPayload.push({
            mpm_id: item.mpm_id,
            model_id: item.model_id,
            prod_id: item.prod_id,
            brand_id: item.brand_id,
            issue_qty: qty,
          });
        }
      });

      if (itemsPayload.length === 0) {
        alert("Please enter at least one quantity to issue");
        setIsIssuing(false);
        return;
      }

      const payload = {
        mrn_id: mrnData.mrn_id,
        mrn_number: mrnData.mrn_number,
        issued_by: "Current User",
        issue_notes: issueNotes,
        items: itemsPayload,
        action: "partial"
      };

      const response = await axios.post(`${BASE_URL}api/issue-mrn`, payload, {
        withCredentials: true
      });

      if (response.data?.success) {
        alert(response.data.message || "Partial issue successful");
        onSave(response.data);
        onClose();
      } else {
        throw new Error(response.data?.message || "Partial issue failed");
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Partial issue failed. Please try again.");
    } finally {
      setIsIssuing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const InfoBox = ({ label, value, highlight = false, icon }: any) => (
    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border dark:border-gray-600">
      <div className="flex items-center gap-1 mb-0.5">
        {icon && <FontAwesomeIcon icon={icon} className="text-purple-500 text-xs" />}
        <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className={`text-sm font-semibold ${highlight ? "text-purple-600 font-mono" : "dark:text-white"}`}>
        {value || "-"}
      </p>
    </div>
  );

  const getIssueStatusBadge = (status: string) => {
    switch (status) {
      case 'Issued':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Issued</span>;
      case 'Partially Issued':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Partial</span>;
      case 'Not Issued':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Not Issued</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Check if any quantities have been entered
  const hasIssuedQuantities = Object.values(issuedQuantities).some(qty => parseInt(qty) > 0);
  const totalIssued = calculateTotalIssued();
  const totalApproved = calculateTotalApproved();
  const totalRequested = calculateTotalRequested();

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 w-full ml-60 mt-10 max-w-4xl max-h-[85vh] rounded-lg shadow-lg flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon icon={faTruck} className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Issue Material</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Issue materials against approved MRN</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isIssuing}
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-3 overflow-y-auto flex-1">

          {/* Client Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <InfoBox label="MRN Number" value={mrnData.mrn_number} highlight icon={faBox} />
            <InfoBox label="Client Name" value={mrnData.client_name} icon={faUser} />
            <InfoBox label="City" value={mrnData.city} icon={faMapMarkerAlt} />
            <InfoBox label="Created Date" value={formatDate(mrnData.created_at)} icon={faCalendar} />
          </div>

          {/* Material Issue Details Header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
              <FontAwesomeIcon icon={faBoxOpen} className="text-purple-500 text-xs" />
              Material Issue Details
            </h3>
            <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
              {mrnData.items?.length || 0} Item(s)
            </span>
          </div>

          {/* Scrollable Table */}
          <div className="border dark:border-gray-700 rounded-lg overflow-hidden mb-3">
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr className="text-xs">
                    <th className="p-2 text-left text-gray-700 dark:text-gray-300 font-semibold">Product</th>
                    <th className="p-2 text-left text-gray-700 dark:text-gray-300 font-semibold">Brand</th>
                    <th className="p-2 text-center text-gray-700 dark:text-gray-300 font-semibold w-16">Requested</th>
                    <th className="p-2 text-center text-gray-700 dark:text-gray-300 font-semibold w-16">Approved</th>
                    <th className="p-2 text-center text-gray-700 dark:text-gray-300 font-semibold w-20">Issued</th>
                    <th className="p-2 text-center text-gray-700 dark:text-gray-300 font-semibold w-16">Remaining</th>
                    <th className="p-2 text-center text-gray-700 dark:text-gray-300 font-semibold w-20">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y dark:divide-gray-700">
                  {mrnData?.items?.map((item: IssueItem) => {
                    const issuedQty = issuedQuantities[item.mpm_id] || "";
                    const approvedQty = item.approval_qty;
                    const requestedQty = item.requested_qty;
                    const remainingQty = calculateRemainingQty(item, parseInt(issuedQty) || 0);
                    
                    return (
                      <tr key={item.mpm_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-2">
                          <div className="font-medium dark:text-white text-xs">
                            {item.model_no}
                          </div>
                        </td>
                        <td className="p-2 dark:text-gray-300 text-xs">
                          {item.brand_name}
                        </td>
                        <td className="p-2 text-center font-medium dark:text-white">
                          {requestedQty}
                        </td>
                        <td className="p-2 text-center font-semibold text-green-600 dark:text-green-400">
                          {approvedQty}
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max={approvedQty}
                            value={issuedQty}
                            onChange={(e) => handleQtyChange(item.mpm_id, e.target.value, approvedQty)}
                            className="w-16 text-center border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-purple-500 dark:text-white text-xs"
                            placeholder="0"
                            disabled={isIssuing}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <span className={`font-semibold text-xs ${
                            remainingQty > 0 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {remainingQty}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          {getIssueStatusBadge(item.issue_status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Issue Notes */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Issue Notes
            </label>
            <textarea
              rows={2}
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Enter issue notes (optional)..."
              disabled={isIssuing}
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
              <p className="text-[10px] text-blue-600 dark:text-blue-400">Total Requested</p>
              <p className="text-base font-bold text-blue-800 dark:text-blue-300">
                {totalRequested}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2">
              <p className="text-[10px] text-green-600 dark:text-green-400">Total Approved</p>
              <p className="text-base font-bold text-green-800 dark:text-green-300">
                {totalApproved}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-2">
              <p className="text-[10px] text-purple-600 dark:text-purple-400">Total Issuing</p>
              <p className="text-base font-bold text-purple-800 dark:text-purple-300">
                {totalIssued}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors"
            disabled={isIssuing}
          >
            Cancel
          </button>

          {/* <button
            onClick={handlePartialIssue}
            disabled={isIssuing || !hasIssuedQuantities}
            className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-xs flex items-center gap-1 hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
          >
            {isIssuing && selectedAction === "partial" ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin h-3 w-3" />
                Processing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faBoxOpen} className="h-3 w-3" />
                Partial Issue
              </>
            )}
          </button> */}

          <button
            onClick={handleIssueMaterial}
            disabled={isIssuing || !hasIssuedQuantities}
            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs flex items-center gap-1 hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
          >
            {isIssuing && selectedAction === "issue" ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin h-3 w-3" />
                Issuing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTruck} className="h-3 w-3" />
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