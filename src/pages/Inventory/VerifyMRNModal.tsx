
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
