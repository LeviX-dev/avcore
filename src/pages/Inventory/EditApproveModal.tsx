import React, { useState } from "react";

const EditApproveModal = ({ data, onClose }) => {
  const [formData, setFormData] = useState(data);
  const [approvedData, setApprovedData] = useState({});

  // Handle lead field change
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Handle approved qty change
  const handleApprovedQtyChange = (key, value) => {
    setApprovedData({
      ...approvedData,
      [key]: value,
    });
  };

  const handleSave = () => {
    console.log("Updated Approval Data:", {
      leadInfo: formData,
      approvedQuantities: approvedData
    });
    onClose();
  };

  // Flatten products from quotation structure
  const getAllItems = () => {
    const items = [];
    if (data.quotations?.[0]?.kits) {
      data.quotations[0].kits.forEach((kit, kIndex) => {
        kit.items.forEach((item, iIndex) => {
          items.push({
            ...item,
            key: `${kIndex}-${iIndex}`,
            kit_name: kit.kit_name
          });
        });
      });
    }
    return items;
  };

  const allItems = getAllItems();

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center ml-40">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Approval</h2>
          <button onClick={onClose} className="text-xl">×</button>
        </div>

        {/* Lead Info */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={formData.lead?.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Mobile</label>
            <input
              type="text"
              value={formData.lead?.number || ""}
              onChange={(e) => handleChange("number", e.target.value)}
              className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">City</label>
            <input
              type="text"
              value={formData.lead?.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* MRN Info */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
          <span className="font-medium">MRN Number: </span>
          <span className="font-mono">{data.mrn_number || '—'}</span>
        </div>

        {/* Products */}
        <div className="border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Brand</th>
                <th className="p-2 text-center">Requested</th>
                <th className="p-2 text-center">Verified</th>
                <th className="p-2 text-center">Approved Qty</th>
              </tr>
            </thead>

            <tbody>
              {allItems.map((item) => {
                const verifiedQty = data.verifiedData?.[item.key] || item.prod_qty;
                
                return (
                  <tr key={item.key} className="border-t">
                    <td className="p-2">
                      {item.kit_name}
                      <div className="text-xs text-gray-500">
                        {item.model}
                      </div>
                    </td>

                    <td className="p-2">{item.brand_name}</td>

                    <td className="p-2 text-center font-medium">
                      {item.prod_qty}
                    </td>

                    <td className="p-2 text-center text-green-600 font-medium">
                      {verifiedQty}
                    </td>

                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max={verifiedQty}
                        value={approvedData[item.key] || ""}
                        onChange={(e) =>
                          handleApprovedQtyChange(item.key, e.target.value)
                        }
                        className="w-16 border rounded px-2 py-1 text-center focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditApproveModal;