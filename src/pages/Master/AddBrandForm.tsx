import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

interface Brand {
  brand_id: number;
  brand_name: string;
}

interface AddBrandFormProps {
  productTypeId: number;
  brands: Brand[];
  onClose: () => void;
  onSuccess: (productTypeId: number) => void;
}

const AddBrandForm: React.FC<AddBrandFormProps> = ({
  productTypeId,
  brands,
  onClose,
  onSuccess
}) => {
  const [brandName, setBrandName] = useState("");
  const [editBrandId, setEditBrandId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandName.trim()) {
      setError("Brand name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      if (editBrandId) {
        await axios.put(
          `${BASE_URL}api/brand/${editBrandId}`,
          { brand_name: brandName.trim() }
        );
        alert("Brand updated successfully ✅");
      } else {
        await axios.post(
          `${BASE_URL}api/product/${productTypeId}/brand`,
          { brand_name: brandName.trim() }
        );
        alert("Brand added successfully ✅");
      }

      setBrandName("");
      setEditBrandId(null);
      onSuccess(productTypeId);

      // ✅ Auto-hide success message
      setTimeout(() => setSuccessMsg(""), 2000);

    } catch (err: any) {
      setError(err?.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl w-full max-w-md">

        {/* HEADER */}
        <div className="border-b dark:border-strokedark px-5 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            {editBrandId ? "Edit Brand" : "Add Brand"}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white">
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

          {/* ❌ ERROR MESSAGE */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* ✅ SUCCESS MESSAGE */}
          {successMsg && (
            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-2 rounded text-sm">
              {successMsg}
            </div>
          )}

          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
            placeholder="Brand name"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {loading
                ? "Saving..."
                : editBrandId
                ? "Update Brand"
                : "Add Brand"}
            </button>
          </div>
        </form>

        {/* 🔥 EXISTING BRANDS LIST */}
        {brands.length > 0 && (
          <div className="border-t dark:border-strokedark px-5 py-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Existing Brands
            </h4>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {brands.map((brand) => (
                <div
                  key={brand.brand_id}
                  className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded"
                >
                  <span className="text-sm text-black dark:text-white">{brand.brand_name}</span>

                  <button
                    onClick={() => {
                      setBrandName(brand.brand_name);
                      setEditBrandId(brand.brand_id);
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddBrandForm;