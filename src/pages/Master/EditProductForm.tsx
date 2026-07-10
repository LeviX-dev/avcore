import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPlus,
  faTag,
  faCube,
  faDollarSign,
  faImage,
  faChevronRight,
  faTrash,
  faBuilding,
  faSave,
  faIndianRupeeSign,
} from '@fortawesome/free-solid-svg-icons';

interface Model {
  model_id?: number;
  model_no: string;
  description: string;
  price: string;
  image_path?: string;
  image?: File | null;
  imageError?: boolean;
}

interface Brand {
  brand_id?: number;
  brand_name: string;
  models: Model[];
}

interface ProductType {
  product_type_id: number;
  product_type_name: string;
  quotation_type?: string;
  cat_id: number;
  brands: Brand[];
}

interface Category {
  cat_id: number;
  cat_name: string;
}

interface EditProductFormProps {
  productType: ProductType;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const EditProductForm = ({ productType, categories, onClose, onSuccess }: EditProductFormProps) => {
  const [productTypeName] = useState(productType.product_type_name || '');
  const [quotationType, setQuotationType] = useState(productType.quotation_type || '');
  const [brands, setBrands] = useState<Brand[]>(() => {
    return (productType.brands || []).map(brand => ({
      ...brand,
      models: brand.models.map(model => ({
        ...model,
        imageError: false
      }))
    }));
  });
  const [customQuotationType, setCustomQuotationType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(quotationType === 'Other');
  const [loading, setLoading] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState<number[]>([]);
  const [catId, setCatId] = useState<number>(productType.cat_id);

  useEffect(() => {
    setExpandedBrands(brands.map((_, index) => index));
  }, [brands.length]);

  const handleQuotationChange = (value: string) => {
    setQuotationType(value);
    setShowCustomInput(value === 'Other');
  };

  const toggleBrandExpansion = (index: number) => {
    setExpandedBrands(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleAddBrand = () => {
    const newBrand: Brand = {
      brand_name: '',
      models: [{ model_no: '', description: '', price: '', image: null, imageError: false }]
    };
    setBrands([...brands, newBrand]);
    setExpandedBrands([...expandedBrands, brands.length]);
  };

  const handleBrandChange = (index: number, value: string) => {
    const updated = [...brands];
    updated[index].brand_name = value;
    setBrands(updated);
  };

  const handleAddModel = (brandIndex: number) => {
    const updated = [...brands];
    updated[brandIndex].models.push({ 
      model_no: '', 
      description: '', 
      price: '', 
      image: null,
      imageError: false 
    });
    setBrands(updated);
  };

  const handleModelChange = (
    brandIndex: number,
    modelIndex: number,
    field: keyof Model,
    value: any
  ) => {
    const updated = [...brands];
    updated[brandIndex].models[modelIndex][field] = value;
    setBrands(updated);
  };

  const handleRemoveBrand = (index: number) => {
    if (window.confirm('Are you sure you want to remove this brand and all its models?')) {
      const updated = [...brands];
      updated.splice(index, 1);
      setBrands(updated);
      setExpandedBrands(expandedBrands.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    }
  };

  const handleRemoveModel = (brandIndex: number, modelIndex: number) => {
    const updated = [...brands];
    if (updated[brandIndex].models.length > 1) {
      updated[brandIndex].models.splice(modelIndex, 1);
      setBrands(updated);
    } else {
      alert('At least one model is required per brand');
    }
  };

  const handleImageError = (brandIndex: number, modelIndex: number) => {
    const updated = [...brands];
    updated[brandIndex].models[modelIndex].imageError = true;
    setBrands(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('product_type_name', productTypeName);
      formData.append('quotation_type', quotationType);
      formData.append('cat_id', String(catId));
      
      if (quotationType === 'Other' && customQuotationType) {
        formData.append('other_quotation_type', customQuotationType);
      }

      const brandsData = brands.map((brand, bIndex) => ({
        brand_name: brand.brand_name,
        brand_id: brand.brand_id,
        brand_index: bIndex,
        models: brand.models.map((model, mIndex) => ({
          model_id: model.model_id,
          model_no: model.model_no,
          description: model.description,
          price: model.price,
          image_path: model.image_path,
          model_index: mIndex
        }))
      }));

      formData.append('brands', JSON.stringify(brandsData));

      const modelPositions = [];
      
      brands.forEach((brand, bIndex) => {
        brand.models.forEach((model, mIndex) => {
          if (model.image && model.image instanceof File) {
            formData.append('model_images[]', model.image);
            modelPositions.push({
              brandIndex: bIndex,
              modelIndex: mIndex
            });
          }
        });
      });
      
      if (modelPositions.length > 0) {
        formData.append('model_positions', JSON.stringify(modelPositions));
      }

      const response = await axios.put(
        `${BASE_URL}api/product/${productType.product_type_id}`,
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true 
        }
      );

      if (response.data.success) {
        alert(response.data.message || 'Product updated successfully!');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Update error:', err);
      alert(err?.response?.data?.error || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${BASE_URL}${cleanPath}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] overflow-y-auto pt-1">
      <div className="flex justify-end min-h-full p-2 sm:p-6">
<div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full sm:max-w-[840px] max-h-[94vh] overflow-y-auto mt-0 sm:mr-[10%] z-[10000]">
            {/* Header - Reduced size */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 text-white rounded-t-xl py-2 px-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1 rounded-lg">
                <FontAwesomeIcon icon={faCube} className="text-sm" />
              </div>
              <div>
                <h2 className="text-base font-bold">Edit Product Type</h2>
                <p className="text-[10px] text-blue-100 dark:text-gray-400">Update product details and specifications</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-all duration-200">
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {/* Basic Info - Reduced padding */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-gray-700 rounded-xl p-3 space-y-2">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Category Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Product Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(Number(e.target.value))}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-boxdark dark:text-white rounded-lg py-1.5 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Select Subject</option>
                    {categories.map(cat => (
                      <option key={cat.cat_id} value={cat.cat_id}>
                        {cat.cat_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quotation Type Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Quotation Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={quotationType}
                    onChange={(e) => handleQuotationChange(e.target.value)}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-boxdark dark:text-white rounded-lg py-1.5 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Select Type</option>
                    <option value="Audio Video">Audio Video</option>
                    <option value="Acoustic">Acoustic</option>
                    <option value="Recliner">Recliner</option>
                    <option value="Automation">Automation</option>
                    <option value="Other">Other</option>
                  </select>
                  {showCustomInput && (
                    <input
                      value={customQuotationType}
                      onChange={(e) => setCustomQuotationType(e.target.value)}
                      className="w-full mt-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-boxdark dark:text-white rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="Enter custom type"
                    />
                  )}
                </div>

                {/* Product Type Name (Read-only) */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Product Type Name
                  </label>
                  <input
                    value={productTypeName}
                    readOnly
                    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Brands Section - Reduced spacing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-2.5 rounded-xl border-2 border-green-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  
                  <div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">Brands & Models</h3>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400">
                      {brands.length} brand(s) • {brands.reduce((acc, b) => acc + b.models.length, 0)} model(s) total
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddBrand}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-1.5 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add Brand
                </button>
              </div>

              {brands.map((brand, bIndex) => (
                <div key={bIndex} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200">
                  {/* Brand Header - Reduced padding */}
                  <div
                    className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-3 py-2 cursor-pointer flex justify-between items-center border-b-2 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => toggleBrandExpansion(bIndex)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className={`text-gray-500 transition-transform duration-300 text-xs ${expandedBrands.includes(bIndex) ? 'rotate-90' : ''}`}
                      />
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-lg">
                        <FontAwesomeIcon icon={faBuilding} className="text-blue-600 dark:text-blue-400 text-xs" />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={brand.brand_name}
                          onChange={(e) => handleBrandChange(bIndex, e.target.value)}
                          placeholder="Enter brand name..."
                          className="bg-transparent text-sm font-bold text-gray-800 dark:text-white px-2 py-0.5 rounded border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all w-full max-w-md"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        {brand.models.length} {brand.models.length === 1 ? 'Model' : 'Models'}
                      </span>
                    </div>
                  </div>

                  {/* Models - VERTICAL LAYOUT with reduced spacing */}
                  {expandedBrands.includes(bIndex) && (
                    <div className="p-3 bg-white dark:bg-gray-900 space-y-2">
                      {brand.models.map((model, mIndex) => (
                        <div key={mIndex} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-3 hover:border-blue-400 dark:hover:border-blue-600 transition-all bg-gray-50 dark:bg-gray-800/50">
                          {/* Model Header with Remove Button */}
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Model #{mIndex + 1}
                            </h4>
                          </div>

                          {/* Model No */}
                          <div className="mb-1.5">
                            <label className="text-[10px] font-medium text-gray-700 dark:text-gray-300 block mb-0.5">
                              Model No. <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={model.model_no}
                              onChange={(e) => handleModelChange(bIndex, mIndex, 'model_no', e.target.value)}
                              placeholder="Enter model number (e.g., XR-100)"
                              className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-boxdark dark:text-white rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                              required
                            />
                          </div>

<div className="mb-1.5">
  <label className="text-[10px] font-medium text-gray-700 dark:text-gray-300 block mb-0.5">
    Description
  </label>
  <textarea
    value={model.description}
    onChange={(e) => handleModelChange(bIndex, mIndex, 'description', e.target.value)}
    placeholder="Enter model description"
    rows={4}
    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-boxdark dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
  />
</div>


                          {/* Price */}
                          <div className="mb-1.5">
                            <label className="text-[10px] font-medium text-gray-700 dark:text-gray-300 block mb-0.5">
                              Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faIndianRupeeSign} className="text-gray-400 text-xs" />
                              </div>
                              <input
                                type="number"
                                value={model.price}
                                onChange={(e) => handleModelChange(bIndex, mIndex, 'price', e.target.value)}
                                placeholder="0.00"
                                className="pl-8 w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-boxdark dark:text-white rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                min="0"
                                step="0.01"
                                required
                              />
                            </div>
                          </div>

                          {/* Product Image - Fixed alignment with left shift and top margin */}
                          <div className="mb-0 mt-2">
                            <label className="text-[10px] font-medium text-gray-700 dark:text-gray-300 block mb-0.5">
                              Product Image
                            </label>
                            <div className="flex items-start gap-3">
                              <label className="flex-1 flex items-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all bg-white dark:bg-boxdark">
                                <FontAwesomeIcon icon={faImage} className="text-gray-400 text-xs" />
                                <span className="truncate text-gray-600 dark:text-gray-300 text-xs">
                                  {model.image ? model.image.name : model.image_path ? 'Change Image' : 'Choose Image'}
                                </span>
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleModelChange(bIndex, mIndex, 'image', file);
                                    // Immediately shift previous images left when new image is uploaded
                                  }}
                                  className="hidden"
                                  accept="image/*"
                                />
                              </label>
                              
                              {/* Image Preview - shifted left with top margin */}
                              {model.image_path && !model.image && !model.imageError ? (
                                <div className="relative group flex-shrink-0 ml-[-4px] mt-1">
                                  <img
                                    src={getImageUrl(model.image_path) || ''}
                                    alt={model.model_no || 'Model'}
                                    className="h-12 w-12 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                    onError={() => handleImageError(bIndex, mIndex)}
                                  />
                                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-[8px]">Preview</span>
                                  </div>
                                </div>
                              ) : model.image && model.image instanceof File ? (
                                <div className="relative group flex-shrink-0 ml-[-4px] mt-1">
                                  <img
                                    src={URL.createObjectURL(model.image)}
                                    alt="New upload"
                                    className="h-12 w-12 object-cover rounded-lg border-2 border-green-500"
                                  />
                                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-[8px]">New</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 flex-shrink-0 ml-[-4px] mt-1">
                                  <FontAwesomeIcon icon={faImage} className="text-gray-400 text-lg" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Model Button - Reduced size */}
                      <button
                        type="button"
                        onClick={() => handleAddModel(bIndex)}
                        className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-[1.02] text-xs"
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add New Model
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Empty State - Reduced size */}
              {brands.length === 0 && (
                <div className="text-center py-6 border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <FontAwesomeIcon icon={faTag} className="text-gray-400 dark:text-gray-500 text-xl" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-0.5">No brands added yet</p>
                  <p className="text-gray-500 dark:text-gray-500 text-[10px] mb-2">Start by adding your first brand</p>
                  <button
                    type="button"
                    onClick={handleAddBrand}
                    className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-1.5 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 text-xs"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add First Brand
                  </button>
                </div>
              )}
            </div>

            {/* Footer - Reduced spacing */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t-2 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-xs font-medium flex items-center gap-1.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⟳</span> Updating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="text-xs" /> Update Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductForm;