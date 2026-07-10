import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTimes,
  faEdit,
  faIdCard,
  faUser,
  faPhone,
  faMapMarkerAlt,
  faBoxes,
  faPencilAlt,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

interface EditVerifyModalProps {
  data: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const EditVerifyModal = ({ data, onClose, onSave }: EditVerifyModalProps) => {
  const [editedData, setEditedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [verifiedData, setVerifiedData] = useState<Record<string, string>>({});

  // Initialize editedData when data prop changes
  useEffect(() => {
    if (data) {
      console.log("Received data in modal:", data);
      setEditedData(data);
      
      // Initialize verifiedData from existing data if available
      const initialVerifiedData: Record<string, string> = {};
      data.quotations?.[0]?.kits?.forEach((kit: any, kIndex: number) => {
        kit.items?.forEach((item: any, iIndex: number) => {
          const key = `${kIndex}-${iIndex}`;
          initialVerifiedData[key] = item.verified_qty?.toString() || "";
        });
      });
      setVerifiedData(initialVerifiedData);
    }
  }, [data]);

  // Track changes
  useEffect(() => {
    if (data && editedData) {
      setHasChanges(JSON.stringify(data) !== JSON.stringify(editedData));
    }
  }, [editedData, data]);

  if (!data || !editedData) return null;

  const quotation = editedData.quotations?.[0];

  // Handle lead field changes
  const handleLeadChange = (field: string, value: string) => {
    setEditedData({
      ...editedData,
      lead: {
        ...editedData.lead,
        [field]: value,
      },
    });
  };

  // Handle kit item changes for editable fields (only brand and description now)
  const handleKitItemChange = (
    kitIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => {
    const updatedQuotation = { ...quotation };
    const item = updatedQuotation.kits[kitIndex].items[itemIndex];
    
    // Only allow editing of description and brand_name
    if (field === 'description' || field === 'brand_name') {
      item[field] = value;
    }

    setEditedData({
      ...editedData,
      quotations: [updatedQuotation],
    });
  };

  // Handle verified quantity changes
  const handleVerifiedQtyChange = (key: string, value: string, kitIndex: number, itemIndex: number) => {
    setVerifiedData({
      ...verifiedData,
      [key]: value,
    });

    // Also update the item in editedData
    const updatedQuotation = { ...quotation };
    const item = updatedQuotation.kits[kitIndex].items[itemIndex];
    item.verified_qty = Number(value) || 0;
    
    setEditedData({
      ...editedData,
      quotations: [updatedQuotation],
    });
  };

  // Calculate pending quantity
  const calculatePendingQty = (requestedQty: number, verifiedQty: string) => {
    const verified = parseInt(verifiedQty) || 0;
    return Math.max(requestedQty - verified, 0);
  };

  const handleSave = () => {
    if (!hasChanges) {
      alert("No changes to save!");
      return;
    }

    const confirmSave = window.confirm(
      "Are you sure you want to save these changes?"
    );
    if (!confirmSave) return;

    setIsSaving(true);

    // Prepare the updated MRN data with verification data
    const updatedMRN = {
      ...editedData,
      master_id: editedData.master_id,
      mrn_number: editedData.mrn_number,
      updated_date: new Date().toISOString(),
      updated_by: "Current User",
      status: "pending_verification",
      lead: editedData.lead,
      quotations: editedData.quotations,
      verified_quantities: verifiedData,
      verification_notes: editedData.verification_notes || "Details updated",
      edit_history: [
        ...(editedData.edit_history || []),
        {
          edited_at: new Date().toISOString(),
          edited_by: "Current User",
          changes: "MRN details and verification quantities updated"
        }
      ]
    };

    // Simulate API call
    setTimeout(() => {
      onSave(updatedMRN);
      setIsSaving(false);
      onClose();
    }, 1000);
  };

  // If no quotation or kits, show message
  if (!quotation || !quotation.kits || quotation.kits.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">No Items Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">This MRN has no items to edit.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] mt-16 ml-60 rounded-xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon
                icon={faEdit}
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit & Verify MRN
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Modify MRN items and verify quantities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isSaving}
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1">

          {/* Client Info - Editable fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faIdCard} className="h-3 w-3" />
                MRN No
              </p>
              <p className="text-sm font-medium text-purple-600 font-mono">
                {editedData.mrn_number}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                Client Name
              </p>
              <input
                type="text"
                value={editedData.lead?.name || ''}
                onChange={(e) => handleLeadChange('name', e.target.value)}
                className="w-full text-sm font-medium bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:outline-none px-0 py-0 dark:text-white"
                placeholder="Enter name"
              />
            </div>

            <div className="bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faPhone} className="h-3 w-3" />
                Mobile
              </p>
              <input
                type="text"
                value={editedData.lead?.number || ''}
                onChange={(e) => handleLeadChange('number', e.target.value)}
                className="w-full text-sm font-medium bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:outline-none px-0 py-0 dark:text-white"
                placeholder="Enter number"
              />
            </div>

            <div className="bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
                City
              </p>
              <input
                type="text"
                value={editedData.lead?.city || ''}
                onChange={(e) => handleLeadChange('city', e.target.value)}
                className="w-full text-sm font-medium bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:outline-none px-0 py-0 dark:text-white"
                placeholder="Enter city"
              />
            </div>
          </div>

          {/* Quotation Header */}
          <div className="flex justify-between items-center mb-2">
           
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded flex items-center gap-1">
              <FontAwesomeIcon icon={faPencilAlt} className="h-3 w-3" />
              QT: {quotation?.qt_number || "N/A"}
            </span>
          </div>

          {/* Scrollable Editable Table with Verification Fields */}
          <div className="border dark:border-gray-700 rounded-lg max-h-[400px] overflow-y-auto mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="p-2 text-left text-gray-600 dark:text-gray-300 font-medium">Product</th>
                  <th className="p-2 text-left text-gray-600 dark:text-gray-300 font-medium">Brand</th>
                  <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium">Requested Qty</th>
                  <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium">Verified Qty</th>
                  <th className="p-2 text-center text-gray-600 dark:text-gray-300 font-medium">Pending Qty</th>
                </tr>
              </thead>

              <tbody className="divide-y dark:divide-gray-700">
                {quotation?.kits?.map((kit: any, kIndex: number) =>
                  kit.items?.map((item: any, iIndex: number) => {
                    const key = `${kIndex}-${iIndex}`;
                    const verifiedQty = verifiedData[key] || "";
                    const pendingQty = calculatePendingQty(item.prod_qty, verifiedQty);
                    
                    return (
                      <tr key={`${kIndex}-${iIndex}-${item.id || iIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-2">
                          <div className="font-medium dark:text-white">{kit.kit_name}</div>
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleKitItemChange(kIndex, iIndex, 'description', e.target.value)}
                            className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 mt-1 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-purple-500 dark:text-white"
                            placeholder="Description"
                          />
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.model}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.brand_name || ''}
                            onChange={(e) => handleKitItemChange(kIndex, iIndex, 'brand_name', e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-600 rounded px-1 py-1 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-purple-500 dark:text-white"
                            placeholder="Brand"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <span className="font-medium dark:text-white">
                            {item.prod_qty}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max={item.prod_qty}
                            value={verifiedQty}
                            onChange={(e) => handleVerifiedQtyChange(key, e.target.value, kIndex, iIndex)}
                            className="w-16 text-center border border-gray-200 dark:border-gray-600 rounded px-1 py-1 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-purple-500 dark:text-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <span className={`font-medium ${
                            pendingQty > 0 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {pendingQty}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        

        
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            disabled={isSaving}
          >
            <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded flex items-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                {hasChanges ? 'Save Changes' : 'No Changes'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVerifyModal;