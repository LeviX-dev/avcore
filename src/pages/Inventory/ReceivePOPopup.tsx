// import React, { useState } from "react";
// import axios from "axios";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBox, faTruck, faSpinner } from "@fortawesome/free-solid-svg-icons";
// import { BASE_URL } from '../../../public/config.js';

// const ReceivePOPopup = ({ po, onClose, onSuccess }) => {
//   const [items, setItems] = useState([
//     {
//       ...po,
//       receive_qty: po.qty, // default full receive
//     },
//   ]);

//   const [loading, setLoading] = useState(false);

//   /* =========================
//      HANDLE INPUT CHANGE
//   ========================== */
//   const handleQtyChange = (index, value) => {
//     const updated = [...items];
//     updated[index].receive_qty = Number(value);
//     setItems(updated);
//   };

//   /* =========================
//      SUBMIT
//   ========================== */
//   const handleSubmit = async () => {
//     try {
//       setLoading(true);

//       await axios.post(`${BASE_URL}api/purchase-order/receive`, {
//         po_id: po.po_id,
//         items: items.map((i) => ({
//           mpm_id: i.mpm_id,
//           receive_qty: i.receive_qty,
//         })),
//       });

//       alert("✅ Items Received Successfully");

//       onSuccess && onSuccess();
//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to receive items");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 ml-40 flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg flex flex-col">

//         {/* HEADER */}
//         <div className="flex justify-between items-center px-4 py-3 border-b bg-purple-50">
//           <div className="flex items-center gap-2">
//             <FontAwesomeIcon icon={faTruck} className="text-purple-600" />
//             <h2 className="font-semibold text-gray-800">
//               Receive Purchase Order
//             </h2>
//           </div>
//           <button onClick={onClose} className="text-xl">×</button>
//         </div>

//         {/* BODY */}
//         <div className="p-4 overflow-y-auto">

//           {/* PO INFO */}
//           <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
//             <div><b>PO:</b> {po.po_number}</div>
//             <div><b>Vendor:</b> {po.vendor_name}</div>
//             <div><b>MRN:</b> {po.mrn_number}</div>
//           </div>

//           {/* TABLE */}
//           <div className="border rounded overflow-hidden">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="p-2 text-left">Product</th>
//                   <th className="p-2 text-center">Ordered</th>
//                   <th className="p-2 text-center">Receive Qty</th>
//                   <th className="p-2 text-center">Pending</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {items.map((item, index) => {
//                   const pending = item.qty - (item.receive_qty || 0);

//                   return (
//                     <tr key={index}>
//                       <td className="p-2">
//                         <div className="font-medium">
//                           {item.model_no}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {item.brand_name}
//                         </div>
//                       </td>

//                       <td className="p-2 text-center">
//                         {item.qty}
//                       </td>

//                       {/* INPUT */}
//                       <td className="p-2 text-center">
//                         <input
//                           type="number"
//                           value={item.receive_qty}
//                           onChange={(e) =>
//                             handleQtyChange(index, e.target.value)
//                           }
//                           className="w-20 border rounded px-2 py-1 text-center"
//                           min={0}
//                           max={item.qty}
//                         />
//                       </td>

//                       <td className="p-2 text-center text-orange-600">
//                         {pending}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="flex justify-end gap-2 p-3 border-t">
//           <button
//             onClick={onClose}
//             className="px-3 py-1 bg-gray-400 text-white rounded"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-4 py-1 bg-green-600 text-white rounded"
//           >
//             {loading ? (
//               <>
//                 <FontAwesomeIcon icon={faSpinner} spin /> Receiving...
//               </>
//             ) : (
//               "Receive Items"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReceivePOPopup;

import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faTruck,
  faSpinner,
  faFileInvoice,
  faBarcode,
  faUser,
  faBuilding,
  faCalendar,
  faCheckCircle,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';

type ItemType = {
  poi_id: number;
  mpm_id: number;

  qty: number;
  receive_qty: number;

  model_no?: string;
  brand_name?: string;
};

type InfoBoxProps = {
  label: string;
  value: string | number;
  icon: any; // or IconDefinition if using FontAwesome types
  highlight?: boolean;
};

type ReceivePOPopupProps = {
  po: any; // (you can improve later)
  onClose: () => void;
  onSuccess?: () => void;
};

const ReceivePOPopup = ({ po, onClose, onSuccess }: ReceivePOPopupProps) => {
  const [items, setItems] = useState<ItemType[]>(
    po.items.map((item: any) => ({
      poi_id: item.poi_id,
      mpm_id: item.mpm_id,

      qty: Number(item.qty),
      receive_qty: Number(item.qty),

      model_no: item.model_no,
      brand_name: item.brand_name,
    })),
  );

  const [loading, setLoading] = useState(false);
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState('');
  const [billImages, setBillImages] = useState<File[]>([]);
  /* =========================
     HANDLE INPUT CHANGE
  ========================== */
  const handleQtyChange = (index: number, value: string) => {
    const updated = [...items];
    updated[index].receive_qty = Number(value);
    setItems(updated);
  };

  /* =========================
     SUBMIT
  ========================== */
  // const handleSubmit = async () => {
  //   try {
  //     setLoading(true);

  //     await axios.post(`${BASE_URL}api/purchase-order/receive`, {
  //       po_id: po.po_id,
  //       items: items.map((i) => ({
  //         mpm_id: i.mpm_id,
  //         receive_qty: i.receive_qty,
  //       })),
  //     });

  //     alert("✅ Items Received Successfully");

  //     onSuccess && onSuccess();
  //     onClose();
  //   } catch (err) {
  //     console.error(err);
  //     alert("❌ Failed to receive items");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Helper component for Info Box - highlight prop is now optional

const handleSubmit = async () => {
  try {
    setLoading(true);

    if (!billNumber) {
      alert('Bill Number is required');
      return;
    }

    const formData = new FormData();

    formData.append('po_id', String(po.po_id));
    formData.append('bill_number', billNumber);
    formData.append('bill_date', billDate || '');

    // ✅ total amount
    const totalAmount = items.reduce(
      (sum, item: any) =>
        sum +
        Number(item.receive_qty || 0) *
          Number(item.unit_price || 0),
      0,
    );

    formData.append(
      'total_amount',
      String(totalAmount),
    );

    // ✅ SEND ITEMS ARRAY
    formData.append(
      'items',
      JSON.stringify(
        items.map((item: any) => ({
          poi_id: item.poi_id,
          received_qty: item.receive_qty,
        })),
      ),
    );

    // ✅ images
    billImages.forEach((file) => {
      formData.append('bill_images', file);
    });

    await axios.post(
      `${BASE_URL}api/purchase-order/receive`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    alert('✅ Items Received Successfully');

    onSuccess?.();
    onClose();
  } catch (err) {
    console.error(err);
    alert('❌ Failed to receive items');
  } finally {
    setLoading(false);
  }
};

  const handleRemoveFile = (index: number) => {
    setBillImages((prev) => prev.filter((_, i) => i !== index));
  };
  const InfoBox = ({ label, value, icon, highlight = false }: InfoBoxProps) => (
    <div
      className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 ${
        highlight ? 'border-l-4 border-purple-500' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <FontAwesomeIcon
          icon={icon}
          className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p
        className={`text-sm font-semibold dark:text-white ${
          highlight
            ? 'text-purple-700 dark:text-purple-400'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex ml-70 mt-10 items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-lg shadow-lg flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon
                icon={faTruck}
                className="h-4 w-4 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Receive Purchase Order
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Record received items against PO
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

        {/* SCROLLABLE CONTENT */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* PO INFORMATION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <InfoBox
              label="PO Number"
              value={po.po_number}
              highlight={true}
              icon={faFileInvoice}
            />
            <InfoBox
              label="Vendor Name"
              value={po.items?.[0]?.vendor?.vendor_name || '-'}
              icon={faBuilding}
            />

            <InfoBox
              label="MRN Number"
              value={po.mrn?.mrn_number || '-'}
              icon={faBarcode}
            />
          </div>

          {/* BILL DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Bill Number *
              </label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                className="w-full mt-1 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Enter Bill Number"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Bill Date
              </label>
              <input
                type="date"
                value={billDate}
                min={today}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full mt-1 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Upload Bill Images
              </label>

              <input
                type="file"
                multiple
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files;
                  if (!files) return;

                  setBillImages((prev) => [...prev, ...Array.from(files)]);
                }}
                className="w-full mt-1 text-sm"
                accept="image/*,.pdf"
              />

              {/* FILE LIST */}
              {billImages.length > 0 && (
                <div className="mt-2 space-y-1">
                  {billImages.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs"
                    >
                      <span className="truncate">{file.name}</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* IMAGE PREVIEW */}
              <div className="flex flex-wrap gap-2 mt-2">
                {billImages.map((file, index) => {
                  if (!file.type.startsWith('image/')) return null;

                  return (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="h-16 w-16 object-cover rounded border"
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* PRODUCTS TABLE SECTION */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBox} className="h-3 w-3" />
              Product & Receiving Details
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
                        Ordered Qty
                      </th>
                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-28">
                        Receive Qty
                      </th>
                      <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium w-24">
                        Pending
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {items.map((item, index) => {
                      const pending = item.qty - (item.receive_qty || 0);

                      return (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="p-2">
                            <div className="font-medium text-sm text-gray-900 dark:text-white">
                              {item.model_no}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Brand: {item.brand_name}
                            </div>
                          </td>

                          <td className="p-2 text-center font-medium text-sm text-gray-900 dark:text-white">
                            {item.qty}
                          </td>

                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={item.receive_qty}
                              onChange={(e) =>
                                handleQtyChange(index, e.target.value)
                              }
                              className="w-24 text-center border dark:border-gray-600 rounded-lg px-2 py-1 text-sm dark:bg-gray-700 dark:text-white 900  text-gray-900focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              min={0}
                              max={item.qty}
                              disabled={loading}
                            />
                          </td>

                          <td className="p-2 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                              <FontAwesomeIcon
                                icon={faClock}
                                className="h-2.5 w-2.5"
                              />
                              {pending}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SUMMARY SECTION */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Ordered
                </div>
                <div className="text-base font-bold text-purple-600 dark:text-purple-400">
                  {items.reduce((sum, item) => sum + item.qty, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Receiving
                </div>
                <div className="text-base font-bold text-green-600 dark:text-green-400">
                  {items.reduce(
                    (sum, item) => sum + (item.receive_qty || 0),
                    0,
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Pending
                </div>
                <div className="text-base font-bold text-orange-600 dark:text-orange-400">
                  {items.reduce(
                    (sum, item) => sum + (item.qty - (item.receive_qty || 0)),
                    0,
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Status
                </div>
                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {items.every((item) => item.receive_qty === item.qty) ? (
                    <span className="inline-flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="h-3 w-3"
                      />
                      Complete
                    </span>
                  ) : items.some((item) => item.receive_qty > 0) ? (
                    'Partial'
                  ) : (
                    'Pending'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER WITH ACTIONS */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-b-lg shadow-inner">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Receiving...
              </>
            ) : (
              'Receive Items'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceivePOPopup;
