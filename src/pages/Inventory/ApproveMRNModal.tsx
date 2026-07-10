import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faSpinner,
  faClock,
  faCalendarCheck,
  faTimes,
  faBox,
  faFileInvoice,
  faUser,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';

interface ApprovalItem {
  mrn_id: number;
  mrn_number: string;
  mrn_status: string;
  client_name: string;
  mpm_id: number;
  model_id: number;
  brand_id: number;
  verified_qty: number;
  approval_qty: number;
  pending_qty: number;
  brand_name: string;
  model_no: string;
  approve_qty: number;
}

interface ApproveMRNModalProps {
  data: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ApproveMRNModal = ({ data, onClose, onSave }: ApproveMRNModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    'approve' | 'reject' | null
  >(null);

  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [approvalQuantities, setApprovalQuantities] = useState<{
    [key: number]: number;
  }>({});

  // Fetch approval items for this MRN
  useEffect(() => {
    const fetchApprovalItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all approval items
        const response = await axios.get(`${BASE_URL}api/approval/items`, {
          withCredentials: true,
        });

        if (response.data?.success && response.data?.data) {
          // Filter items for this specific MRN
          const itemsForMRN = response.data.data.filter(
            (item: ApprovalItem) => item.mrn_id === data.mrn_id,
          );

          setApprovalItems(itemsForMRN);

          // Initialize approval quantities with verified_qty
          const initialQuantities: { [key: number]: number } = {};
          itemsForMRN.forEach((item: ApprovalItem) => {
            initialQuantities[item.mpm_id] = item.verified_qty || 0;
          });
          setApprovalQuantities(initialQuantities);
        } else {
          setError('Failed to fetch approval items');
        }
      } catch (err: any) {
        console.error('Error fetching approval items:', err);
        setError(
          err.response?.data?.message || 'Failed to fetch approval items',
        );
      } finally {
        setLoading(false);
      }
    };

    if (data.mrn_id) {
      fetchApprovalItems();
    }
  }, [data.mrn_id]);

  const handleApproveQtyChange = (mpm_id: number, value: string) => {
    let qty = value === '' ? 0 : Number(value);
    if (isNaN(qty) || qty < 0) return;

    const item = approvalItems.find((i) => i.mpm_id === mpm_id);
    if (!item) return;

    const pending = Number(item.pending_qty || 0);

    if (qty > pending) qty = pending;

    setApprovalQuantities((prev) => ({
      ...prev,
      [mpm_id]: qty,
    }));
  };

  const handleApproveSubmit = async () => {
  try {
    const payloadProducts: any[] = [];

    approvalItems.forEach((item) => {
      const approveQty = Number(approvalQuantities[item.mpm_id] || 0);
      const pending = Number(item.pending_qty || 0);

      if (approveQty > pending) {
        throw new Error(
          `${item.model_no}: Cannot approve more than pending (${pending})`
        );
      }

      if (approveQty > 0) {
        payloadProducts.push({
          mpm_id: item.mpm_id,
          approval_qty: approveQty,
        });
      }
    });

    if (payloadProducts.length === 0) {
      alert('Please enter at least one approval quantity');
      return;
    }

    setLoading(true);

    const res = await axios.post(
      `${BASE_URL}api/approve-mrn`,
      {
        mrn_id: data.mrn_id,
        products: payloadProducts,
      },
      { withCredentials: true }
    );

    if (res.data?.success) {
      alert('MRN Approved Successfully');
      onClose();
       if (onSave) {
    onSave(res.data);   // ✅ ADD THIS LINE
  }
    }

  } catch (err: any) {
    console.error('Approval error:', err);
    alert(err.message);
  } finally {
    setLoading(false);
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

  const getStatusBadge = (approvalQty: number, pendingQty: number) => {
    if (approvalQty === pendingQty && pendingQty > 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Ready
        </span>
      );
    }
    if (approvalQty > 0 && approvalQty < pendingQty) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
          Partial
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        Pending
      </span>
    );
  };

  const InfoBox = ({ label, value, highlight = false, icon }: any) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
      <div className="flex items-center gap-1 mb-0.5">
        {icon && (
          <FontAwesomeIcon icon={icon} className="text-purple-500 text-xs" />
        )}
        <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p
        className={`text-sm font-semibold ${
          highlight ? 'text-purple-600 font-mono' : 'dark:text-white'
        }`}
      >
        {value || '-'}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center gap-3">
            <FontAwesomeIcon
              icon={faSpinner}
              className="h-6 w-6 text-purple-600 animate-spin"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading approval items...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 max-w-md">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faTimes}
              className="h-10 w-10 text-red-500 mb-3"
            />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Error
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (approvalItems.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 max-w-md">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faBox}
              className="h-10 w-10 text-gray-400 mb-3"
            />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              No Items Found
            </h3>
            <p className="text-md text-black-900 dark:text-gray-700 mb-4">
              Waiting for Purchase Approval for this MRN.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const firstItem = approvalItems[0];
  const totalPending = approvalItems.reduce(
    (sum, item) => sum + item.pending_qty,
    0,
  );
  const totalApproving = approvalItems.reduce(
    (sum, item) => sum + (approvalQuantities[item.mpm_id] || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full ml-40 mt-10 max-w-4xl max-h-[85vh] rounded-lg shadow-lg flex flex-col">
        {/* Header - Compact */}
        <div className="flex justify-between items-center p-3 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon
                icon={faCalendarCheck}
                className="h-4 w-4 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Approve MRN Items
              </h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Review and approve pending items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isApproving}
          >
            ×
          </button>
        </div>

        {/* Content - Compact */}
        <div className="p-3 overflow-y-auto flex-1">
          {/* Info Cards - Compact Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <InfoBox
              label="MRN Number"
              value={firstItem.mrn_number}
              highlight
              icon={faFileInvoice}
            />
            <InfoBox
              label="Client Name"
              value={firstItem.client_name}
              icon={faUser}
            />
            <InfoBox
              label="MRN Status"
              value={firstItem.mrn_status}
              icon={faBox}
            />
            <InfoBox
              label="Total Items"
              value={approvalItems.length}
              icon={faBuilding}
            />
          </div>

          {/* Products Table - Compact */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                <FontAwesomeIcon
                  icon={faBox}
                  className="text-purple-500 text-xs"
                />
                Pending Approval Items
              </h3>
              <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                {approvalItems.length} Item(s)
              </span>
            </div>

            <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2 text-left">Brand</th>
                      <th className="p-2 text-center w-16">Verified</th>
                      <th className="p-2 text-center w-16">Pending</th>
                      <th className="p-2 text-center w-20">Approve Qty</th>
                      <th className="p-2 text-center w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {approvalItems.map((item) => {
                      const approvalQty = approvalQuantities[item.mpm_id] || 0;
                      const remainingPending = item.pending_qty - approvalQty;

                      return (
                        <tr
                          key={item.mpm_id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="p-2">
                            <div className="font-medium dark:text-white text-xs">
                              {item.model_no}
                            </div>
                          </td>
                          <td className="p-2 dark:text-gray-300 text-xs">
                            {item.brand_name}
                          </td>
                          <td className="p-2 text-center font-semibold dark:text-white">
                            {item.verified_qty}
                          </td>
                          <td className="p-2 text-center">
                            <span className="font-semibold text-xs text-orange-600">
                              {item.pending_qty}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max={item.pending_qty}
                              value={approvalQuantities[item.mpm_id] || 0}
                              onChange={(e) =>
                                handleApproveQtyChange(
                                  item.mpm_id,
                                  e.target.value,
                                )
                              }
                              className="w-16 border rounded px-1 py-0.5 text-center text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                              disabled={isApproving}
                              placeholder="0"
                            />
                          </td>
                          <td className="p-2 text-center">
                            {getStatusBadge(approvalQty, item.pending_qty)}
                            {remainingPending > 0 && (
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                {remainingPending} left
                              </div>
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

          {/* Notes - Compact */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Approval Notes
            </label>
            <textarea
              rows={2}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Enter approval/rejection notes..."
              disabled={isApproving}
            />
          </div>

          {/* Summary - Compact */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  Items
                </div>
                <div className="text-sm font-semibold dark:text-white">
                  {approvalItems.length}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  Total Pending
                </div>
                <div className="text-sm font-semibold text-orange-600">
                  {totalPending}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  Approving Now
                </div>
                <div className="text-sm font-semibold text-green-600">
                  {totalApproving}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="flex justify-end gap-2 p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors"
            disabled={isApproving}
          >
            Cancel
          </button>

          <button
            onClick={handleApproveSubmit}
            disabled={isApproving || totalApproving === 0}
            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs flex items-center gap-1 hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
          >
            {isApproving && selectedAction === 'approve' ? (
              <>
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin h-3 w-3"
                />
                Approving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                Approve Selected
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveMRNModal;
