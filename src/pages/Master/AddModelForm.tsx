import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

interface Brand {
  brand_id: number;
  brand_name: string;
}

interface AddModelFormProps {
  brands: Brand[];
  onClose: () => void;
  onSuccess: () => void;
}

const AddModelForm: React.FC<AddModelFormProps> = ({
  brands,
  onClose,
  onSuccess,
}) => {
  const [brandId, setBrandId] = useState<number | "">("");
  const [formData, setFormData] = useState({
    model_no: "",
    description: "",
    price: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- INPUT HANDLERS ---------------- */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandId) {
      setError("Please select a brand");
      return;
    }

    if (!formData.model_no.trim()) {
      setError("Model number is required");
      return;
    }

    if (!formData.price.trim()) {
      setError("Price is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const fd = new FormData();
      fd.append("model_no", formData.model_no.trim());
      fd.append("description", formData.description.trim());
      fd.append("price", formData.price.trim());

      if (image) {
        fd.append("model_image", image);
      }

      const res = await axios.post(
        `${BASE_URL}api/product/brand/${brandId}/model`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert(res.data.message || "Model added successfully");

        // reset
        setBrandId("");
        setFormData({ model_no: "", description: "", price: "" });
        setImage(null);
        setImagePreview("");

        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to add model");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl border dark:border-strokedark w-full max-w-lg max-h-[85vh] overflow-y-auto mt-19">
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 border-b dark:border-strokedark px-6 py-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Add New Model
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center transition-colors"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* BRAND */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              Brand 
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(Number(e.target.value))}
              className="mt-1 w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={loading}
            >
              <option value="" className="text-gray-400">Select Brand</option>
              {brands.map((b) => (
                <option key={b.brand_id} value={b.brand_id}>
                  {b.brand_name}
                </option>
              ))}
            </select>
          </div>

          {/* MODEL NO */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              Model Number 
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="model_no"
              value={formData.model_no}
              onChange={handleInputChange}
              className="mt-1 w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter model number"
              disabled={loading}
            />
          </div>

          {/* PRICE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              Price 
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              placeholder="Enter model description..."
              disabled={loading}
            />
          </div>

          {/* IMAGE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Model Image (Optional)
            </label>

            <div className="mt-2">
              {!imagePreview ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 dark:border-strokedark rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800 transition-all group">
                    <div className="flex flex-col items-center">
                      <svg className="w-10 h-10 text-gray-400 group-hover:text-purple-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-400 mb-1">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={loading}
                    />
                  </div>
                </label>
              ) : (
                <div className="relative">
                  <div className="border dark:border-strokedark rounded-xl p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded-lg border"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-white">
                          Image selected
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          Ready to upload
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview("");
                        }}
                        className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800 transition-colors ml-auto"
                        disabled={loading}
                      >
                        <span className="text-sm">×</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-6 border-t dark:border-strokedark">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-gray-300 dark:border-strokedark dark:text-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </>
              ) : (
                "Add Model"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModelForm;