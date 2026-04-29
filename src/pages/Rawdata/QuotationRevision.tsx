import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft,
  FaEdit,
  FaEye,
  FaFileInvoiceDollar,
  FaInfoCircle,
} from 'react-icons/fa';
import { MdAttachMoney, MdDateRange } from 'react-icons/md';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config';

const QuotationRevisionPage = () => {
  const { master_id, revision } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [leadDetails, setLeadDetails] = useState(null);

  useEffect(() => {
    fetchRevisions();
  }, []);

  const fetchRevisions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/revisions/${master_id}`);
      setData(res.data);
      if (res.data.lead) {
        setLeadDetails(res.data.lead);
      }
    } catch (error) {
      console.error('Error fetching quotation revisions', error);
    }
  };

  if (!data) return null;

  const quotation = data.quotations[0];
  const latestRevisionNumber =
    quotation.revisions[quotation.revisions.length - 1]?.revision;

  const calculateRevisionTotal = (rev) => {
    let total = 0;
    rev.kits.forEach((kit) => {
      kit.items.forEach((item) => {
        total +=
          Number(item.model_qty) *
          Number(item.model_price) *
          Number(kit.kit_qty || 1);
      });
    });
    return total.toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-boxdark min-h-screen">
      {/* TOP BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/quatation-pending')}
          className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <FaArrowLeft />
          <span className="font-medium">Back to Quotations</span>
        </button>

        {/* Lead Info Card */}
        {leadDetails && (
          <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex-1 max-w-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" />
                  {leadDetails.name}
                </h3>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Contact:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {leadDetails.number}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      City:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {leadDetails.city}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800/30 rounded-lg px-3 py-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Quotation No.
                </div>
                <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {quotation.qt_number}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Breadcrumb pageName="Quotation Versions" />

      {/* QUOTATION REVISIONS TABLE */}
      <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <FaFileInvoiceDollar className="text-gray-600 dark:text-gray-400 text-sm" />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      Version
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4 text-left">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    Kits
                  </span>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <MdAttachMoney className="text-gray-600 dark:text-gray-400 text-sm" />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      Total
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4 text-left">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    Created By
                  </span>
                </th>
                <th className="py-3 px-4 text-left">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    Updated By
                  </span>
                </th>
                <th className="py-3 px-4 text-left">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {quotation.revisions.map((rev) => (
                <tr
                  key={rev.revision}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                >
                  {/* Version */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col items-start">
                      <div
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-lg font-bold text-xs mb-1 ${
                          rev.revision === latestRevisionNumber
                            ? 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700/30 shadow-sm'
                            : 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30 shadow-sm'
                        }`}
                      >
                        V{rev.revision}
                        {rev.revision === latestRevisionNumber && (
                          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-300 rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-400">
                        <MdDateRange className="w-2.5 h-2.5" />
                        {formatDate(rev.created_at)}
                      </div>
                    </div>
                  </td>

                  {/* Products & Kits */}
                  <td className="py-3 px-4">
                    <div className="space-y-2 max-w-xs">
                      {rev.kits.map((kit) => (
                        <div
                          key={kit.kit_id || `single_${kit.cat_id}`}
                          className="bg-gray-50 dark:bg-gray-800/50 rounded p-2 border border-gray-100 dark:border-gray-700"
                        >
                          {/* Kit Header */}
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                                {kit.kit_name || 'Individual Products'}
                              </h4>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[11px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                  {kit.cat_name}
                                </span>
                                {kit.kit_qty > 1 && (
                                  <span className="text-[11px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">
                                    Qty: {kit.kit_qty}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                {/* Total - shows finalized total like ViewQuotation */}
<td className="py-3 px-4">
  <div className="flex flex-col items-start">

    {/* ✅ Show finalized total (after discount) if available */}
    <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-0.5">
      ₹{' '}
      {rev.finalized_total != null && rev.finalized_total > 0
        ? Number(rev.finalized_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })
        : rev.totals
          ? Number(
              rev.totals.with_gst && rev.totals.with_gst !== '0.00'
                ? rev.totals.with_gst
                : rev.totals.without_gst
            ).toLocaleString('en-IN', { minimumFractionDigits: 2 })
          : calculateRevisionTotal(rev)}
    </div>

    {/* ✅ Show discount badge if final offer was applied */}
    {rev.final_offer_amount > 0 && (
      <div className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">
        Discount: ₹{Number(rev.final_offer_amount).toLocaleString('en-IN')}
      </div>
    )}

    <div className="text-[11px] text-gray-600 dark:text-gray-400">
      {rev.totals?.with_gst && rev.totals.with_gst !== '0.00'
        ? 'Incl. GST'
        : 'Excl. GST'}
    </div>

  </div>
</td>

                  {/* Created Info */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {quotation.created_by_name || '-'}
                      </div>
                      <div className="text-[11px] text-gray-600 dark:text-gray-400">
                        {formatDate(quotation.created_at)}
                      </div>
                    </div>
                  </td>

                  {/* Updated Info */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {quotation.updated_by_name || '-'}
                      </div>
                      <div className="text-[11px] text-gray-600 dark:text-gray-400">
                        {formatDate(quotation.updated_at)}
                      </div>
                    </div>
                  </td>

                  {/* Actions - Both buttons in one line */}
                  <td className="py-3 px-4">
                    <div className="flex flex-row gap-1.5">
                      <button
                        className={`flex items-center justify-center p-2 rounded-lg font-medium transition-all duration-200 ${
                          rev.revision !== latestRevisionNumber
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                        }`}
                        title="Edit Quotation"
                        disabled={rev.revision !== latestRevisionNumber}
                        onClick={() =>
                          navigate(`/quotation/edit/${quotation.qt_id}`, {
                            state: { revision: rev.revision },
                          })
                        }
                      >
                        <FaEdit className="text-sm" />
                      </button>

                      <button
                        className="flex items-center justify-center p-2 rounded-lg font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        title="View Lead"
                        onClick={() =>
                          navigate(`/lead/view/${master_id}/${rev.revision}`)
                          
                        }
                      >
                        <FaEye className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing{' '}
              <span className="font-semibold">
                {quotation.revisions.length}
              </span>{' '}
              versions
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Latest Version:
                </span>
                <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                  Version {latestRevisionNumber}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Quotation Type:
                </span>
                <span className="ml-2 font-bold text-purple-600 dark:text-purple-400">
                  {quotation.type === 'with_gst' ? 'With GST' : 'Without GST'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationRevisionPage;