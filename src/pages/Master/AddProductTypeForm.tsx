import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

interface AddProductTypeFormProps {
  categories: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const AddProductTypeForm: React.FC<AddProductTypeFormProps> = ({ categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    product_type_name: "",
  });

  const [quotationType, setQuotationType] = useState<string>("");
  const [customQuotationType, setCustomQuotationType] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const quotationTypes = [
    "Audio Video",
    "Acoustic",
    "Recliner",
    "Automation",
    "Other",
  ];

  const [catId, setCatId] = useState<number | "">("");
  
  const handleQuotationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setQuotationType(value);
    setShowCustomInput(value === "Other");
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!catId) {
      setError("Category is required");
      return false;
    }

    if (!quotationType) {
      setError("Quotation Type is required");
      return false;
    }

    if (quotationType === "Other" && !customQuotationType.trim()) {
      setError("Please enter custom quotation type");
      return false;
    }

    if (!formData.product_type_name.trim()) {
      setError("Product Type Name is required");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const finalQuotationType = quotationType === "Other" ? customQuotationType : quotationType;
      
      const requestData = {
        product_type_name: formData.product_type_name.trim(),
        quotation_type: finalQuotationType,
        cat_id: catId
      };

      const response = await axios.post(`${BASE_URL}api/product/type`, requestData);

      if (response.data.success) {
        alert(response.data.message || "Product type created successfully!");
        
        // Reset form
        setFormData({ product_type_name: "" });
        setQuotationType("");
        setCustomQuotationType("");
        setShowCustomInput(false);
        setCatId("");
        
        // Call success callback
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (error: any) {
      console.error("Error adding product type:", error);
      setError(error?.response?.data?.error || "Failed to add product type. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-2">
      <div className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-gray-100 dark:border-strokedark w-full max-w-md">
        <div className="sticky top-0 bg-white/90 dark:bg-boxdark backdrop-blur border-b dark:border-strokedark px-5 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Add Product Type</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Subject *
            </label>
            <select
              value={catId}
              onChange={(e) => setCatId(Number(e.target.value))}
              className="mt-1 w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {categories.map((cat: any) => (
                <option key={cat.cat_id} value={cat.cat_id}>
                  {cat.cat_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quotation Type *
            </label>
            <select
              value={quotationType}
              onChange={handleQuotationTypeChange}
              className="mt-1 w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Quotation Type</option>
              {quotationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {showCustomInput && (
              <input
                type="text"
                value={customQuotationType}
                onChange={(e) => setCustomQuotationType(e.target.value)}
                className="mt-2 w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter custom quotation type"
                disabled={loading}
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Type Name *
            </label>
            <input
              type="text"
              name="product_type_name"
              value={formData.product_type_name}
              onChange={handleInput}
              className="mt-1 w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product category or type"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-strokedark dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductTypeForm;