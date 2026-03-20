import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faFileCirclePlus
} from "@fortawesome/free-solid-svg-icons";

interface GenerateMRNModalProps {
  data: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const GenerateMRNModal = ({ data, onClose, onSave }: GenerateMRNModalProps) => {
  const [mrnNumber, setMrnNumber] = useState("");

  if (!data) return null;

  const quotation = data.quotations?.[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const generatedMRN = {
      master_id: data.master_id,
      mrn_number:
        mrnNumber || `MRN${Math.floor(1000 + Math.random() * 9000)}`,
      qt_id: quotation?.qt_id,
    };

    alert(`MRN Generated Successfully!\nMRN No: ${generatedMRN.mrn_number}`);

    onSave(generatedMRN);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] mt-20 ml-40 rounded-xl shadow-lg flex flex-col">

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
                Generate MRN
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Review quotation and generate MRN
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl dark:text-gray-400"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1">

          {/* Client Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <InfoBox label="Client" value={data.lead?.name} />
            <InfoBox label="Mobile" value={data.lead?.number} />
            <InfoBox label="City" value={data.lead?.city} />
            <InfoBox label="QT No" value={quotation?.qt_number} highlight />
          </div>

          
          {/* MRN Input */}
          <form onSubmit={handleSubmit} className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              MRN Number
            </label>
            <input
              type="text"
              value={mrnNumber}
              onChange={(e) => setMrnNumber(e.target.value)}
              placeholder="Leave blank for auto generation"
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </form>

          {/* Products Header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Quotation Items
            </h3>
          </div>

          {/* Scrollable Table */}
          <div className="border dark:border-gray-700 rounded-lg max-h-[280px] overflow-y-auto mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="p-2 text-left font-medium text-gray-600 dark:text-gray-300">Kit</th>
                  <th className="p-2 text-left font-medium text-gray-600 dark:text-gray-300">Product</th>
                  <th className="p-2 text-left font-medium text-gray-600 dark:text-gray-300">Brand</th>
                  <th className="p-2 text-center font-medium text-gray-600 dark:text-gray-300">Qty</th>
                  <th className="p-2 text-right font-medium text-gray-600 dark:text-gray-300">Price</th>
                </tr>
              </thead>

              <tbody className="divide-y dark:divide-gray-700">
                {quotation?.kits?.map((kit: any, kIndex: number) =>
                  kit.items.map((item: any, iIndex: number) => (
                    <tr key={`${kIndex}-${iIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-2 dark:text-white">{kit.kit_name}</td>
                      <td className="p-2">
                        <div className="font-medium dark:text-white">{item.model}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="p-2 dark:text-gray-300">{item.brand_name}</td>
                      <td className="p-2 text-center font-medium dark:text-white">
                        {item.prod_qty}
                      </td>
                      <td className="p-2 text-right dark:text-white">
                        ₹ {item.prod_price?.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>


          {/* Info Box */}
          {/* <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-sm">
            <p className="text-purple-800 dark:text-purple-300">
              MRN will be generated for the above quotation items. This will be used for material verification.
            </p>
          </div> */}
        </div>

        {/* Footer (Fixed) */}
        <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded flex items-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <FontAwesomeIcon icon={faFileCirclePlus} />
            Generate MRN
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, highlight = false }: any) => (
  <div className="bg-white dark:bg-gray-700 p-2 rounded border">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-sm font-medium ${highlight ? "text-purple-600 font-mono" : ""}`}>
      {value || "-"}
    </p>
  </div>
);

export default GenerateMRNModal;