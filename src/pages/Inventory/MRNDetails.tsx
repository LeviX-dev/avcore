import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileInvoice,
  faBoxes,
  faTag,
  faUser,
  faCalendar,
  faArrowLeft,
  faBarcode,
  faClipboardList,
  faShoppingCart,
  faCheckCircle,
  faClock,
  faSpinner,
  faStore,
  faTruck,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config';

const MRNDetails = () => {
  const navigate = useNavigate();
  const { mrn_number } = useParams();
  const [mrnData, setMrnData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusClasses: { [key: string]: string } = {
    'Verification Pending':
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Approval Pending':
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    Approved:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Partial:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    Completed:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const purchaseStatusClasses: { [key: string]: string } = {
    'Not Requested':
      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    Pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Requested:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Purchased:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Partially Purchased':
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  };

  useEffect(() => {
    fetchMRNDetails();
  }, [mrn_number]);

  const fetchMRNDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/mrn-details/${mrn_number}`,
        { withCredentials: true },
      );
      if (response.data.success) {
        setMrnData(response.data.data);
      } else {
        setError('Failed to fetch MRN details');
      }
    } catch (err) {
      setError('Failed to fetch MRN details');
      console.error('Error fetching MRN details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!mrnData?.products)
      return {
        totalItems: 0,
        totalRequested: 0,
        totalVerified: 0,
        totalApproved: 0,
        totalIssued: 0,
        totalPending: 0,
        totalPurchaseRequested: 0,
      };

    const totalRequested = mrnData.products.reduce(
      (sum: number, p: any) => sum + Number(p.requested_qty || 0),
      0,
    );

    const totalVerified = mrnData.products.reduce(
      (sum: number, p: any) => sum + Number(p.verified_qty || 0),
      0,
    );

    const totalApproved = mrnData.products.reduce(
      (sum: number, p: any) => sum + Number(p.approval_qty || 0),
      0,
    );

    const totalIssued = mrnData.products.reduce(
      (sum: number, p: any) => sum + Number(p.issued_qty || 0),
      0,
    );

    const totalPurchaseRequested = mrnData.products.reduce(
      (sum: number, p: any) => sum + Number(p.purchase_requested_qty || 0),
      0,
    );

    const totalPending = mrnData.products.reduce((sum: number, p: any) => {
      const verification = Number(p.verification_pending || 0);
      const approval = Number(p.approval_pending || 0);
      const issue = Number(p.issue_pending || 0);
      return sum + verification + approval + issue;
    }, 0);

    return {
      totalItems: mrnData.products.length,
      totalRequested,
      totalVerified,
      totalApproved,
      totalIssued,
      totalPending,
      totalPurchaseRequested,
    };
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 dark:bg-boxdark min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error || !mrnData) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 dark:bg-boxdark min-h-screen">
        <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-red-600 dark:text-red-400">
            {error || 'MRN not found'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const stats = getSummaryStats();

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-boxdark min-h-screen">
      {/* TOP BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span className="font-medium">Back to MRN List</span>
        </button>

        {/* MRN Header Card */}
        <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex-1 max-w-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon
                icon={faFileInvoice}
                className="text-purple-600 dark:text-purple-400 text-xl"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Material Receipt Note
              </h3>
              <div className="flex flex-wrap gap-3 mt-1">
                <div className="flex items-center gap-1 text-sm">
                  <FontAwesomeIcon
                    icon={faBarcode}
                    className="text-gray-500 h-3 w-3"
                  />
                  <span className="text-gray-600 dark:text-gray-400">MRN:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {mrnData.mrn_number}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="text-gray-500 h-3 w-3"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(mrnData.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Breadcrumb pageName="MRN Details" />

      {/* MRN DETAILS CARD */}
      <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-boxdark rounded-lg shadow-sm">
              <FontAwesomeIcon
                icon={faUser}
                className="text-indigo-600 h-4 w-4"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customer Name
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {mrnData.name || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-boxdark rounded-lg shadow-sm">
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="text-blue-600 h-4 w-4"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Quotation ID
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {mrnData.qt_id}
              </p>
            </div>
          </div>
          {/* <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-boxdark rounded-lg shadow-sm">
              <FontAwesomeIcon
                icon={faTag}
                className="text-purple-600 h-4 w-4"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                MRN ID
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {mrnData.mrn_id}
              </p>
            </div>
          </div> */}
          {/* <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-boxdark rounded-lg shadow-sm">
              <FontAwesomeIcon
                icon={faClock}
                className="text-green-600 h-4 w-4"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Master ID
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {mrnData.master_id}
              </p>
            </div>
          </div> */}
        </div>

        {/* Products Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faBoxes}
                className="text-purple-600 h-5 w-5"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Products in this MRN
              </h3>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                {stats.totalItems} Item{stats.totalItems !== 1 ? 's' : ''}
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                Total: {stats.totalRequested} Units
              </span>
            </div>
          </div>

          {/* Products Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Requested
                    </th>
                    {/* <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Verified
                    </th> */}
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Approved
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Issued
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Pending
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Purchase Qty
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Purchase Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mrnData.products.map((product: any, index: number) => {
                    const pendingTotal =
                      Number(product.verification_pending || 0) +
                      Number(product.approval_pending || 0) +
                      Number(product.issue_pending || 0);

                    return (
                      <tr
                        key={product.mpm_id || index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        {/* Product */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {product.model_no}
                          </div>
                        </td>

                        {/* Requested */}
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold">
                            {product.requested_qty}
                          </span>
                        </td>

                        {/* Approved */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                              {product.approval_qty}
                            </span>

                            {product.approval_pending > 0 && (
                              <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 text-xs">
                                {product.approval_pending} pending
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Issued */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold">
                              {product.issued_qty}
                            </span>

                            {/* {product.issue_pending > 0 && (
                              <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 text-xs">
                                {product.issue_pending} pending
                              </span>
                            )} */}
                          </div>
                        </td>

                        {/* Total Pending */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                              pendingTotal > 0
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            }`}
                          >
                            {pendingTotal}
                          </span>
                        </td>

                        {/* Available (TEAL instead of green ✅) */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-lg font-semibold ${
                              product.available_qty > 0
                                ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}
                          >
                            {product.available_qty}
                          </span>
                        </td>

                        {/* Purchase */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold">
                              {product.purchase_qty || 0}
                            </span>

                            {/* {Number(product.purchase_requested_qty) > 0 && (
                              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs">
                                Req: {product.purchase_requested_qty}
                              </span>
                            )} */}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-lg font-semibold text-sm ${
                              statusClasses[product.status] ||
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {product.status || 'N/A'}
                          </span>
                        </td>

                        {/* Purchase Status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              purchaseStatusClasses[product.purchase_status] ||
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {product.purchase_status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Progress Summary */}
          {stats.totalRequested > 0 && (
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg p-5">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faClipboardList}
                  className="text-purple-500"
                />
                Progress Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-boxdark rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faClipboardList}
                      className="text-blue-500 h-4 w-4"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Requested
                    </span>
                  </div>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {stats.totalRequested}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-boxdark rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 h-4 w-4"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Verified
                    </span>
                  </div>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    {stats.totalVerified}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-boxdark rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-indigo-500 h-4 w-4"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Approved
                    </span>
                  </div>
                  <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                    {stats.totalApproved}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-boxdark rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faTruck}
                      className="text-blue-500 h-4 w-4"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Issued
                    </span>
                  </div>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {stats.totalIssued}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-boxdark rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faStore}
                      className="text-purple-500 h-4 w-4"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Purchase Req
                    </span>
                  </div>
                  <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                    {stats.totalPurchaseRequested}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MRNDetails;
