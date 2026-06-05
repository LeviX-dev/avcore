import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIdCard,
  faFileCirclePlus,
  faUser,
  faMobile,
  faCity,
  faFileInvoice,
  faBoxes,
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config';

interface Props {
  master_id: number;
  onClose: () => void;
  onSave: (data: any) => void;
}

const GenerateMRNModal = ({ master_id, onClose, onSave }: Props) => {
  const [data, setData] = useState<any>(null);
  const [mrnNumber, setMrnNumber] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [requiredQty, setRequiredQty] = useState<{
    [key: number]: number | string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ================= AUTO GENERATE MRN ================= */
  useEffect(() => {
    const generateMRNNumber = () => {
      const random = Math.floor(1000 + Math.random() * 9000);
      const today = new Date();
      const datePart = `${today.getFullYear()}${
        today.getMonth() + 1
      }${today.getDate()}`;
      setMrnNumber(`MRN-${datePart}-${random}`);
    };

    generateMRNNumber();
  }, []);

  /* ================= FETCH QUOTATION ================= */
useEffect(() => {
  const fetchQuotation = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}api/getquotationofmrn/${master_id}`,
        { withCredentials: true },
      );

      const apiData = res.data;

      if (!apiData.success) {
        setData({
          lead: apiData.lead || null,
          quotation: null,
        });

        return;
      }

      /* =========================
         BUILD PENDING / GENERATED
      ========================== */

      const pendingKits: any[] = [];
      const generatedKits: any[] = [];

      (apiData.quotation?.options || []).forEach((option: any) => {
        (option.items || []).forEach((kit: any) => {
          const pendingItems: any[] = [];
          const generatedItems: any[] = [];

          (kit.items || []).forEach((item: any) => {
            const formattedItem = {
              qm_id: item.qm_id,

              prod_id: item.prod_id || null,

              model_id: item.model_id,

              brand_id: item.brand_id || null,

              kit_id: item.kit_id || null,

              option_id: option.option_id,

              option_name: option.option_name,

              model: item.model,

              brand_name: item.brand_name,

              total_qty: Number(item.qty || 0),

              already_requested: Number(
                item.total_requested_qty || 0,
              ),

              total_issued_qty: Number(
                item.total_issued_qty || 0,
              ),

              mrn_pending_qty: Number(
                item.mrn_pending_qty || 0,
              ),

              issue_pending_qty: Number(
                item.issue_pending_qty || 0,
              ),

              prod_price: Number(item.price || 0),

              description: item.description || '',

              image_path: item.image_path || '',

              current_revision:
                item.current_revision || apiData.revision,

              product_type_name:
                item.product_type_name || '',

              cat_name: item.cat_name || '',

              is_mrn_generated:
                Number(item.is_mrn_generated || 0),
            };

            /* =========================
               PARTIAL MRN FLOW
            ========================== */

            if (formattedItem.mrn_pending_qty > 0) {
              pendingItems.push(formattedItem);
            } else {
              generatedItems.push(formattedItem);
            }
          });

          /* =========================
             PENDING KIT
          ========================== */

          if (pendingItems.length > 0) {
            pendingKits.push({
              option_id: option.option_id,

              option_name: option.option_name,

              subject: option.subject,

              kit_id: kit.kit_id,

              kit_name: kit.kit_name || 'Individual',

              items: pendingItems,
            });
          }

          /* =========================
             GENERATED KIT
          ========================== */

          if (generatedItems.length > 0) {
            generatedKits.push({
              option_id: option.option_id,

              option_name: option.option_name,

              subject: option.subject,

              kit_id: kit.kit_id,

              kit_name: kit.kit_name || 'Individual',

              items: generatedItems,
            });
          }
        });
      });

      /* =========================
         SET STATE
      ========================== */

      setData({
        master_id: apiData.master_id,

        revision: apiData.revision,

        lead: apiData.lead,

        quotation: {
          ...apiData.quotation,

          qt_id: apiData.quotation?.qt_id,

          qt_number:
            apiData.quotation?.qt_number ||
            `QT-${Date.now()}`,

          options: apiData.quotation?.options || [],

          kits: pendingKits,

          generated_kits: generatedKits,
        },
      });
    } catch (err) {
      console.error(err);

      alert('Failed to load quotation');

      onClose();
    } finally {
      setLoading(false);
    }
  };

  fetchQuotation();
}, [master_id]);

  /* ================= CHECKBOX HANDLERS ================= */
  const toggleItem = (qm_id: number, maxQty: number) => {
    setSelectedItems((prev) => {
      if (prev.includes(qm_id)) {
        const updated = prev.filter((id) => id !== qm_id);
        const updatedRequired = { ...requiredQty };
        delete updatedRequired[qm_id];
        setRequiredQty(updatedRequired);
        return updated;
      } else {
        // Find item to get pending qty
        const item = data?.quotation?.kits
          ?.flatMap((k: any) => k.items)
          ?.find((i: any) => i.qm_id === qm_id);

        const defaultQty = item?.mrn_pending_qty || maxQty;

        setRequiredQty((prev) => ({
          ...prev,
          [qm_id]: defaultQty,
        }));

        return [...prev, qm_id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (!data?.quotation?.kits) return;

    const allItemIds: number[] = [];
    const allRequiredQtys: { [key: number]: number } = {};

    data.quotation.kits.forEach((kit: any) => {
      kit.items.forEach((item: any) => {
        if (item.mrn_pending_qty > 0) {
          allItemIds.push(item.qm_id);
          allRequiredQtys[item.qm_id] = item.mrn_pending_qty;
        }
      });
    });

    if (selectAll) {
      setSelectedItems([]);
      setRequiredQty({});
    } else {
      setSelectedItems(allItemIds);
      setRequiredQty(allRequiredQtys);
    }

    setSelectAll(!selectAll);
  };

  const handleQtyChange = (qm_id: number, value: string, maxQty: number) => {
    if (value === '') {
      setRequiredQty((prev) => ({
        ...prev,
        [qm_id]: '', // ✅ allowed now
      }));
      return;
    }

    if (!/^\d+$/.test(value)) return;

    let numValue = Number(value);

    if (numValue > maxQty) {
      numValue = maxQty;
    }
    if (numValue < 1) {
      numValue = 1;
    }

    setRequiredQty((prev) => ({
      ...prev,
      [qm_id]: numValue, // ✅ number
    }));
  };



  const handleSubmit = async (e: any) => {
  e.preventDefault();

  try {
    setSubmitting(true);

    const selectedProducts: any[] = [];

    /* =========================
       LOOP THROUGH KITS
    ========================== */

    data?.quotation?.kits?.forEach((kit: any) => {
      kit.items?.forEach((item: any) => {
        if (selectedItems.includes(item.qm_id)) {
          const required = Number(
            requiredQty[item.qm_id] || 0,
          );

          /* =========================
             VALIDATION
          ========================== */

          if (!required || required <= 0) {
            throw new Error(
              `Invalid required quantity for ${item.model}`,
            );
          }

          if (required > Number(item.mrn_pending_qty || 0)) {
            throw new Error(
              `Only ${item.mrn_pending_qty} qty allowed for ${item.model}`,
            );
          }

          if (!item.model_id) {
            console.warn(
              'Skipping invalid product:',
              item,
            );
            return;
          }

          /* =========================
             PRODUCT ARRAY
          ========================== */

          selectedProducts.push({
            qm_id: Number(item.qm_id),

            prod_id: item.prod_id
              ? Number(item.prod_id)
              : null,

            model_id: Number(item.model_id),

            brand_id: item.brand_id
              ? Number(item.brand_id)
              : null,

            kit_id: item.kit_id
              ? Number(item.kit_id)
              : null,

            requested_qty: required,

            option_id: item.option_id,

            option_name: item.option_name,

            model: item.model,

            brand_name: item.brand_name,
          });
        }
      });
    });

    /* =========================
       NO PRODUCTS
    ========================== */

    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    /* =========================
       PAYLOAD
    ========================== */

    const payload = {
      master_id,

      qt_id: data?.quotation?.qt_id,

      mrn_number: mrnNumber,

      expected_date: null,

      products: selectedProducts,
    };

    console.log('MRN Payload =>', payload);

    /* =========================
       API CALL
    ========================== */

    const res = await axios.post(
      `${BASE_URL}api/generate-mrn`,
      payload,
      {
        withCredentials: true,
      },
    );

    console.log('MRN Response =>', res.data);

    if (res.data?.success) {
      alert('MRN Generated Successfully');

      onSave(res.data);

      onClose();
    } else {
      alert(
        res.data?.message ||
          'Failed to generate MRN',
      );
    }
  } catch (error: any) {
    console.error(
      'MRN Generation Error:',
      error,
    );

    alert(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to generate MRN',
    );
  } finally {
    setSubmitting(false);
  }
};
 

  const getSelectedCount = () => {
    return selectedItems.length;
  };

  const getTotalItems = () => {
    if (!data?.quotation?.kits) return 0;
    return data.quotation.kits.reduce(
      (acc: number, kit: any) => acc + kit.items.length,
      0,
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalItems = getTotalItems();
  const selectedCount = getSelectedCount();

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 w-full mt-20 ml-40 max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon
                icon={faIdCard}
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Generate MRN
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Review & approve quantities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Client Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <InfoBox icon={faUser} label="Client" value={data?.lead?.name} />
            <InfoBox
              icon={faMobile}
              label="Mobile"
              value={data?.lead?.number}
            />
            <InfoBox icon={faCity} label="City" value={data?.lead?.city} />
            <InfoBox
              icon={faFileInvoice}
              label="QT No"
              value={data?.quotation?.qt_number}
              highlight
            />
          </div>

          {/* MRN Input */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              MRN Number <span className="text-gray-400">(Auto-generated)</span>
            </label>
            <input
              type="text"
              value={mrnNumber}
              onChange={(e) => setMrnNumber(e.target.value)}
              placeholder="Auto-generated"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Products Header with Selection Controls */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Items to Generate
              </h3>
              {selectedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  {selectedCount}/{totalItems}
                </span>
              )}
            </div>

            {totalItems > 0 && (
              <button
                onClick={toggleSelectAll}
                className="px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-1"
              >
                <FontAwesomeIcon
                  icon={selectAll ? faTimesCircle : faCheckCircle}
                  className="h-2.5 w-2.5"
                />
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Pending Items Table */}
          {totalItems > 0 ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-3">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="p-2 text-left w-10">Sel</th>
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2 text-left">Brand</th>
                      <th className="p-2 text-center w-16">Total Qty</th>
                      <th className="p-2 text-center w-16">Req Qty</th>
                      <th className="p-2 text-center w-16">Pending</th>
                      <th className="p-2 text-center w-20">Generate Qty</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.quotation?.kits?.map((kit: any, kIndex: number) => (
                      <React.Fragment key={`kit-${kIndex}`}>
                        {/* Kit Header */}
                        <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                          <td colSpan={7} className="p-1.5 pl-2">
                            <div className="flex items-center gap-1.5">
                              <FontAwesomeIcon
                                icon={faBoxes}
                                className="h-2.5 w-2.5 text-purple-500"
                              />
                              <span className="font-medium text-xs text-purple-700 dark:text-purple-300">
                                {kit.kit_name}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Kit Items */}
                        {kit.items.map((item: any, iIndex: number) => (
                          <tr
                            key={`${kIndex}-${iIndex}`}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              selectedItems.includes(item.qm_id)
                                ? 'bg-purple-50/50 dark:bg-purple-900/10'
                                : ''
                            }`}
                          >
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.qm_id)}
                                onChange={() =>
                                  toggleItem(item.qm_id, item.mrn_pending_qty)
                                }
                                disabled={item.mrn_pending_qty === 0}
                                className="h-3.5 w-3.5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 disabled:opacity-50"
                              />
                            </td>
                            <td className="p-2">
                              <div className="font-medium dark:text-white">
                                {item.model}
                              </div>
                            </td>
                            <td className="p-2">{item.brand_name}</td>
                            <td className="p-2 text-center font-medium">
                              {item.total_qty}
                            </td>
                            <td className="p-2 text-center text-blue-600">
                              {item.already_requested || 0}
                            </td>
                            <td className="p-2 text-center text-green-600 font-semibold">
                              {item.mrn_pending_qty}
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min={1}
                                max={item.mrn_pending_qty}
                                value={requiredQty[item.qm_id] || ''}
                                disabled={
                                  !selectedItems.includes(item.qm_id) ||
                                  item.mrn_pending_qty === 0
                                }
                                onChange={(e) =>
                                  handleQtyChange(
                                    item.qm_id,
                                    e.target.value,
                                    item.mrn_pending_qty,
                                  )
                                }
                                className="w-16 px-1.5 py-1 text-xs border rounded text-center disabled:opacity-50"
                              />
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No pending items to generate MRN
            </div>
          )}

          {/* Already Generated Items */}
          {data?.quotation?.generated_kits?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold text-red-600 uppercase mb-2">
                Already Generated MRN Items
              </h3>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2 text-left">Brand</th>
                      <th className="p-2 text-center">Total Qty</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.quotation.generated_kits.map(
                      (kit: any, kIndex: number) =>
                        kit.items.map((item: any, iIndex: number) => (
                          <tr
                            key={`gen-${kIndex}-${iIndex}`}
                            className="bg-red-50 dark:bg-red-900/10"
                          >
                            <td className="p-2">{item.model}</td>
                            <td className="p-2">{item.brand_name}</td>
                            <td className="p-2 text-center">
                              {item.total_qty}
                            </td>
                          </tr>
                        )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Selection Summary */}
          {selectedCount > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-2 text-xs mt-3">
              <div className="flex items-start gap-2">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="h-3 w-3 text-purple-600 dark:text-purple-300 mt-0.5"
                />
                <p className="text-purple-700 dark:text-purple-300">
                  {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>

          {data.quotation && totalItems > 0 && (
            <button
              onClick={handleSubmit}
              disabled={selectedCount === 0 || submitting}
              className={`px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 ${
                selectedCount === 0 || submitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-purple-700 hover:to-indigo-700'
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faFileCirclePlus}
                    className="h-3.5 w-3.5"
                  />
                  Generate MRN
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Simplified InfoBox
const InfoBox = ({ icon, label, value, highlight }: any) => (
  <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-2 mb-1">
      <FontAwesomeIcon
        icon={icon}
        className="h-3 w-3 text-gray-500 dark:text-gray-400"
      />
      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
        {label}
      </p>
    </div>
    <p
      className={`text-sm font-bold truncate ${
        highlight
          ? 'text-purple-600 dark:text-purple-400'
          : 'text-gray-900 dark:text-white'
      }`}
    >
      {value || '-'}
    </p>
  </div>
);

export default GenerateMRNModal;
