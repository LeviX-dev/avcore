import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

interface AddProductTypeFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Category {
  cat_id: number;
  cat_name: string;
}


const AddProductTypeForm: React.FC<AddProductTypeFormProps> = ({ onClose, onSuccess }) => {
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


  const [categories, setCategories] = useState<Category[]>([]);
const [catId, setCatId] = useState<number | "">("");
useEffect(() => {
  fetchCategories();
}, []);

const fetchCategories = async () => {
  try {
    const res = await axios.get(`${BASE_URL}api/category`);
    setCategories(res.data);
  } catch (err) {
    console.error("Failed to fetch categories");
  }
};



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
      
      const requestData = {
        product_type_name: formData.product_type_name.trim(),
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b px-5 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Add Product Type</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
         <label className="text-sm font-medium text-gray-700">
  Product Category *
</label>

<select
  value={catId}
  onChange={(e) => setCatId(Number(e.target.value))}
  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
>
  <option value="">Select Category</option>
  {categories.map(cat => (
    <option key={cat.cat_id} value={cat.cat_id}>
      {cat.cat_name}
    </option>
  ))}
</select>


            {showCustomInput && (
              <input
                type="text"
                value={customQuotationType}
                onChange={(e) => setCustomQuotationType(e.target.value)}
                className="mt-2 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter custom Products type"
                disabled={loading}
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Product Type Name *
            </label>
            <input
              type="text"
              name="product_type_name"
              value={formData.product_type_name}
              onChange={handleInput}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product category or type"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Product "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductTypeForm;