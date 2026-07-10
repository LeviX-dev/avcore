import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

interface AddProductFullFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface BrandModel {
  brand_name: string;
  models: {
    model_no: string;
    price: string;
    description: string;
    image?: File;
  }[];
}

const AddProductFullForm: React.FC<AddProductFullFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    product_type_name: "",
  });

  const [quotationType, setQuotationType] = useState<string>("");
  const [customQuotationType, setCustomQuotationType] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const [brands, setBrands] = useState<BrandModel[]>([
    { brand_name: "", models: [{ model_no: "", price: "", description: "" }] },
  ]);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });

  const quotationTypes = [
    "Audio Video",
    "Acoustic",
    "Recliner",
    "Automation",
    "Other",
  ];

  const handleQuotationTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setQuotationType(value);
    setShowCustomInput(value === "Other");
  };

  const handleCustomQuotationTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomQuotationType(e.target.value);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrandNameChange = (index: number, value: string) => {
    const updatedBrands = [...brands];
    updatedBrands[index].brand_name = value;
    setBrands(updatedBrands);
  };

  const handleModelChange = (
    brandIndex: number,
    modelIndex: number,
    field: keyof BrandModel["models"][0],
    value: string
  ) => {
    const updatedBrands = [...brands];
    updatedBrands[brandIndex].models[modelIndex][field] = value;
    setBrands(updatedBrands);
  };

  const handleImageChange = (
    brandIndex: number,
    modelIndex: number,
    file: File | null
  ) => {
    const updatedBrands = [...brands];
    if (file) {
      updatedBrands[brandIndex].models[modelIndex].image = file;
    } else {
      delete updatedBrands[brandIndex].models[modelIndex].image;
    }
    setBrands(updatedBrands);
  };

  const addBrand = () => {
    setBrands([
      ...brands,
      { brand_name: "", models: [{ model_no: "", price: "", description: "" }] },
    ]);
  };

  const removeBrand = (index: number) => {
    if (brands.length > 1) {
      setBrands(brands.filter((_, i) => i !== index));
    }
  };

  const addModel = (brandIndex: number) => {
    const updatedBrands = [...brands];
    updatedBrands[brandIndex].models.push({
      model_no: "",
      price: "",
      description: "",
    });
    setBrands(updatedBrands);
  };

  const removeModel = (brandIndex: number, modelIndex: number) => {
    const updatedBrands = [...brands];
    if (updatedBrands[brandIndex].models.length > 1) {
      updatedBrands[brandIndex].models.splice(modelIndex, 1);
      setBrands(updatedBrands);
    }
  };

  const validateForm = (): boolean => {
    if (!quotationType) {
      setFeedback({ type: "error", message: "Products Type is required" });
      return false;
    }

    if (quotationType === "Other" && !customQuotationType.trim()) {
      setFeedback({
        type: "error",
        message: "Please enter custom products type",
      });
      return false;
    }

    if (!formData.product_type_name.trim()) {
      setFeedback({
        type: "error",
        message: "Product Type Name is required",
      });
      return false;
    }

    for (const brand of brands) {
      if (!brand.brand_name.trim()) {
        setFeedback({ type: "error", message: "Brand name is required" });
        return false;
      }

      for (const model of brand.models) {
        if (!model.model_no.trim()) {
          setFeedback({ type: "error", message: "Model number is required" });
          return false;
        }
        if (!model.price.trim()) {
          setFeedback({ type: "error", message: "Price is required" });
          return false;
        }
      }
    }

    return true;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate form first
  if (!validateForm()) return;

  try {
    setLoading(true);

    const formDataToSend = new FormData();

    // Quotation type
    formDataToSend.append(
      "quotation_type",
      quotationType === "Other" ? customQuotationType : quotationType
    );

    // Product type
    formDataToSend.append(
      "product_type_name",
      formData.product_type_name.trim()
    );

    // Brands + models JSON
    formDataToSend.append(
      "brands",
      JSON.stringify(
        brands.map((brand) => ({
          brand_name: brand.brand_name,
          models: brand.models.map((model) => ({
            model_no: model.model_no,
            price: model.price,
            description: model.description,
          })),
        }))
      )
    );

    // Attach model images
    brands.forEach((brand) => {
      brand.models.forEach((model) => {
        if (model.image) {
          formDataToSend.append("model_images[]", model.image);
        }
      });
    });

    // API call
    const response = await axios.post(
      `${BASE_URL}api/product`,
      formDataToSend,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    // SUCCESS
    if (response.data.success) {
      // 🚨 Show success alert
      alert(response.data.message || "Product added successfully!");

      // Reset form fields
      setFormData({ product_type_name: "" });
      setQuotationType("");
      setCustomQuotationType("");
      setShowCustomInput(false);
      setBrands([
        {
          brand_name: "",
          models: [{ model_no: "", price: "", description: "" }],
        },
      ]);

      // Trigger parent callbacks
      if (onSuccess) onSuccess();
      if (onClose) onClose();

      return;
    }
  } catch (error: any) {
    console.error("Error adding product:", error);

    // 🚨 Show error alert
    alert(
      error?.response?.data?.error ||
        "Failed to add product. Please try again."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[85vh] overflow-y-auto mt-10">
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b px-5 py-3 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-800">
              Add Product Type
            </h2>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        </div>

        {feedback.message && (
          <div
            className={`mx-4 mt-3 px-3 py-2 rounded-md text-sm border ${
              feedback.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
             Product Type*
            </label>
            <select
              value={quotationType}
              onChange={handleQuotationTypeChange}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Select products type</option>
              {quotationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {showCustomInput && (
              <input
                type="text"
                value={customQuotationType}
                onChange={handleCustomQuotationTypeChange}
                className="mt-2 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter custom product type"
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

          {/* Brands & Models */}
            {/* Brands */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">
              Brands & Models
            </h3>
            <button
              type="button"
              onClick={addBrand}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
              disabled={loading}
            >
              + Add Brand
            </button>
          </div>

          {brands.map((brand, brandIndex) => (
            <div key={brandIndex} className="p-3 border rounded-xl bg-gray-50 space-y-3">

              {/* Brand Header */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Brand {brandIndex + 1}
                </span>
                {brands.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBrand(brandIndex)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Brand Name */}
              <input
                type="text"
                value={brand.brand_name}
                onChange={(e) => handleBrandNameChange(brandIndex, e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Brand Name *"
              />

              {/* Models */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-700">Models</span>
                  <button
                    type="button"
                    onClick={() => addModel(brandIndex)}
                    className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs"
                  >
                    + Add Model
                  </button>
                </div>

                {brand.models.map((model, modelIndex) => (
                  <div key={modelIndex} className="p-3 rounded-xl border bg-white space-y-2">

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">
                        Model {modelIndex + 1}
                      </span>

                      {brand.models.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModel(brandIndex, modelIndex)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* 🔥 Model No + Price + File ON ONE LINE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <input
                        type="text"
                        value={model.model_no}
                        onChange={(e) =>
                          handleModelChange(brandIndex, modelIndex, "model_no", e.target.value)
                        }
                        className="border rounded-lg px-3 py-2 text-sm"
                        placeholder="Model Number *"
                      />

                      <input
                        type="text"
                        value={model.price}
                        onChange={(e) =>
                          handleModelChange(brandIndex, modelIndex, "price", e.target.value)
                        }
                        className="border rounded-lg px-3 py-2 text-sm"
                        placeholder="Price *"
                      />

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="text-xs text-gray-600"
                        onChange={(e) =>
                          handleImageChange(brandIndex, modelIndex, e.target.files?.[0] || null)
                        }
                      />
                    </div>

                    {/* 🔥 WIDER & TALLER DESCRIPTION */}
                    <textarea
                      value={model.description}
                      onChange={(e) =>
                        handleModelChange(brandIndex, modelIndex, "description", e.target.value)
                      }
                      className="border rounded-lg px-3 py-2 text-sm w-full h-20"
                      placeholder="Description (optional)"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>


          {/* Footer */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t -mx-5 px-5 py-3 rounded-b-2xl">
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductFullForm;
