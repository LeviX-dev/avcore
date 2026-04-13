import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIdCard,
  faBarcode,
  faCalendarAlt,
  faUser,
  faBox,
  faSpinner,
  faTimes,
  faTruck,
  faShoppingCart,
  faFileInvoice,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

import { BASE_URL } from '../../../public/config.js';

interface PurchaseItem {
  mrn_id: number;
  mrn_number: string;
  client_name: string;
  city: string;
  execution_id: number;
  schedule_name: string;
  mpm_id: number;
  model_id: number;
  brand_id: number;
  purchase_qty: number;
  purchase_status: string;
  brand_name: string;
  model_no: string;
  pr_id?: number;
}

interface GeneratePOModalProps {
  item: PurchaseItem;
  onClose: () => void;
  onSuccess?: () => void;
}

const InfoBox = ({ label, value, highlight = false, icon }: any) => (
  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
    <div className="flex items-center gap-1 mb-1">
      {icon && (
        <FontAwesomeIcon icon={icon} className="text-purple-500 text-xs" />
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
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

const PurchaseRequest = ({
  item,
  onClose,
  onSuccess,
}: GeneratePOModalProps) => {
  const [purchaseQty, setPurchaseQty] = useState<number>(
    item.purchase_qty || 0,
  );
  const [prId, setPrId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [prDetails, setPrDetails] = useState<any>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const maxQty = item.purchase_qty;
    if (value <= maxQty && value >= 0) {
      setPurchaseQty(value);
    }
  };

  const handleApprovePR = async (pr_id, status) => {
    try {
      console.log('Sending:', { pr_id, status });
      const res = await axios.post(
        `${BASE_URL}api/purchase-request/approve`,
        {
          pr_id,
          status, // "Approved" or "Rejected"
        },
        {
          withCredentials: true, // if using session
        },
      );
      console.log('ITEM DATA:', item);

      if (res.data.success) {
        alert(res.data.message);

        // 🔄 refresh list
        // fetchPurchaseRequests();
         onSuccess?.();
        onClose?.();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center ml-70 justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-5xl max-h-[90vh] rounded-lg shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon
                icon={faFileInvoice}
                className="h-4 w-4 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Generate Purchase Request
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create PO for selected material
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            disabled={loading}
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
              value={item.mrn_number}
              highlight
              icon={faBarcode}
            />
            <InfoBox
              label="Client Name"
              value={item.client_name}
              icon={faUser}
            />
            <InfoBox label="City" value={item.city} icon={faIdCard} />
          </div>

          {/* Products Table */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBox} className="h-3 w-3" />
              Product & Purchase Details
            </h3>

            <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr className="text-xs">
                      <th className="p-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                        Product Details
                      </th>
                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-24">
                        Required Qty
                      </th>

                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-24">
                        Status
                      </th>
                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-24">
                        Purchase Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-2">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {item.model_no}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Brand: {item.brand_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Execution ID: {item.execution_id}
                        </div>
                      </td>
                      <td className="p-2 text-center font-medium text-sm text-gray-900 dark:text-white">
                        {item.purchase_qty}
                      </td>

                      <td className="p-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            item.purchase_status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : item.purchase_status === 'Requested'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : item.purchase_status === 'Purchased'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                          }`}
                        >
                          {item.purchase_status}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={purchaseQty}
                          onChange={handleQtyChange}
                          min="0"
                          max={item.purchase_qty}
                          className="w-20 text-center border dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                          disabled={loading}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* PR Details Section */}
          {prDetails && (
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faShoppingCart} className="h-3 w-3" />
                Purchase Request Details
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PR ID
                    </p>
                    <p className="font-semibold dark:text-white">
                      {prDetails.pr_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Requested Qty
                    </p>
                    <p className="font-semibold dark:text-white">
                      {prDetails.requested_qty}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {prDetails.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created
                    </p>
                    <p className="font-semibold dark:text-white">
                      {formatDate(prDetails.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  PO Quantity
                </div>
                <div className="text-base font-bold text-purple-600 dark:text-purple-400">
                  {purchaseQty}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Unit
                </div>
                <div className="text-base font-bold text-gray-700 dark:text-gray-300">
                  Units
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Max Allowed
                </div>
                <div className="text-base font-bold text-gray-700 dark:text-gray-300">
                  {item.purchase_qty}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Value
                </div>
                <div className="text-base font-bold text-green-600 dark:text-green-400">
                  ₹{purchaseQty * (prDetails?.unit_price || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        {/* Footer with Actions */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-b-lg shadow-inner">
          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          {/* Reject */}
          {/* <button
            onClick={() => handleApprovePR(item.pr_id, 'Rejected')}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button> */}

          {/* Approve */}
          <button
            onClick={() => {
              if (!item.pr_id) {
                alert('PR ID not found');
                return;
              }
              handleApprovePR(item.pr_id, 'Approved');
            }}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequest;
