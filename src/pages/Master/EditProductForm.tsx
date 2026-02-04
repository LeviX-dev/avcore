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
  faSave,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

interface Model {
  model_id?: number;
  model_no: string;
  description: string;
  price: string;
  image_path?: string;
  image?: File | null;
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
  onClose: () => void;
  onSuccess: () => void;
}

const EditProductForm = ({ productType, onClose, onSuccess }: EditProductFormProps) => {
  const [productTypeName] = useState(productType.product_type_name || '');
  const [quotationType, setQuotationType] = useState(productType.quotation_type || '');
  const [brands, setBrands] = useState<Brand[]>(productType.brands || []);
  const [customQuotationType, setCustomQuotationType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(quotationType === 'Other');
  const [loading, setLoading] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catId, setCatId] = useState<number>(productType.cat_id);

  useEffect(() => {
    setExpandedBrands(brands.map((_, index) => index));
    fetchCategories();
  }, [brands.length]);

  const fetchCategories = async () => {
    const res = await axios.get(`${BASE_URL}api/category`);
    setCategories(res.data);
  };

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
      models: [{ model_no: '', description: '', price: '', image: null }]
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
    updated[brandIndex].models.push({ model_no: '', description: '', price: '', image: null });
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

      const brandsData = brands.map(brand => ({
        brand_name: brand.brand_name,
        brand_id: brand.brand_id,
        models: brand.models.map(model => ({
          model_id: model.model_id,
          model_no: model.model_no,
          description: model.description,
          price: model.price,
          image_path: model.image_path
        }))
      }));

      formData.append('brands', JSON.stringify(brandsData));

      brands.forEach((brand, bIndex) => {
        brand.models.forEach((model, mIndex) => {
          if (model.image) {
            formData.append('model_images[]', model.image);
            formData.append('model_positions[]', `${bIndex}_${mIndex}`);
          }
        });
      });

      const response = await axios.put(
        `${BASE_URL}api/product/${productType.product_type_id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true }
      );

      if (response.data.success) {
        alert(response.data.message || 'Product updated successfully!');
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-end min-h-full p-2 sm:p-6">
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full sm:max-w-2xl mt-10 sm:mr-[20%]">

          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCube} />
              <h2 className="text-lg font-bold">Edit Product Type</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">

            {/* Basic Info */}
            <div className="bg-blue-50 dark:bg-gray-800 border dark:border-strokedark rounded-lg p-4 space-y-3">
              {/* Category Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Category
                </label>
                <select
                  value={catId}
                  onChange={(e) => setCatId(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg py-2 px-2 text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.cat_id} value={cat.cat_id}>
                      {cat.cat_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quotation Type Dropdown */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Category Type</label>
                <select
                  value={quotationType}
                  onChange={(e) => handleQuotationChange(e.target.value)}
                  className="w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg py-2 px-2 text-sm"
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
                    className="w-full mt-2 border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg px-2 py-2 text-sm"
                    placeholder="Enter custom type"
                  />
                )}
              </div>

              {/* Product Type Name (Read-only) */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Type Name</label>
                <input
                  value={productTypeName}
                  readOnly
                  className="w-full border border-gray-300 dark:border-strokedark dark:bg-gray-700 dark:text-white rounded-lg px-2 py-2 text-sm"
                />
              </div>
            </div>

            {/* Brands Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-800 dark:text-white font-semibold text-lg flex items-center gap-2">
                  <FontAwesomeIcon icon={faTag} className="text-green-600" />
                  Brands & Models
                </h3>
                <button
                  type="button"
                  onClick={handleAddBrand}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add Brand
                </button>
              </div>

              {brands.map((brand, bIndex) => (
                <div key={bIndex} className="border border-gray-200 dark:border-strokedark rounded-lg overflow-hidden ml-4">
                  {/* Brand Header */}
                  <div
                    className="bg-gray-50 dark:bg-gray-800 px-3 py-2 cursor-pointer flex justify-between items-center border-b dark:border-strokedark"
                    onClick={() => toggleBrandExpansion(bIndex)}
                  >
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className={`text-gray-500 transition-transform ${expandedBrands.includes(bIndex) ? 'rotate-90' : ''}`}
                      />
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faTag} className="text-green-600" />
                        <input
                          type="text"
                          value={brand.brand_name}
                          onChange={(e) => handleBrandChange(bIndex, e.target.value)}
                          placeholder="Brand name"
                          className="bg-transparent text-sm font-semibold text-gray-800 dark:text-white px-1 py-1 rounded border dark:border-strokedark dark:bg-gray-700"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-300 ml-2">{brand.models.length} model(s)</span>
                    </div>
             
                  </div>

                  {/* Models */}
                  {expandedBrands.includes(bIndex) && (
                    <div className="pl-6 pr-3 py-3 bg-gray-50 dark:bg-gray-800 space-y-2">
                      {brand.models.map((model, mIndex) => (
                        <div key={mIndex} className="border border-gray-200 dark:border-strokedark rounded p-2 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            value={model.model_no}
                            onChange={(e) => handleModelChange(bIndex, mIndex, 'model_no', e.target.value)}
                            placeholder="Model No"
                            className="sm:col-span-3 border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-2 py-1 text-sm"
                            required
                          />
                          <input
                            type="text"
                            value={model.description}
                            onChange={(e) => handleModelChange(bIndex, mIndex, 'description', e.target.value)}
                            placeholder="Description"
                            className="sm:col-span-4 border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-2 py-1 text-sm"
                          />
                          <div className="relative sm:col-span-2">
                            <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                              <FontAwesomeIcon icon={faDollarSign} className="text-gray-400 text-xs" />
                            </div>
                            <input
                              type="number"
                              value={model.price}
                              onChange={(e) => handleModelChange(bIndex, mIndex, 'price', e.target.value)}
                              placeholder="0.00"
                              className="pl-6 w-full border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-2 py-1 text-sm"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <label className="sm:col-span-3 flex items-center gap-1 border border-gray-300 dark:border-strokedark rounded px-2 py-1 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <FontAwesomeIcon icon={faImage} className="text-gray-400 text-xs" />
                            <span className="truncate text-black dark:text-white">
                              {model.image ? model.image.name : model.image_path ? 'Change' : 'Choose'}
                            </span>
                            <input
                              type="file"
                              onChange={(e) => handleModelChange(bIndex, mIndex, 'image', e.target.files?.[0] || null)}
                              className="hidden"
                              accept="image/*"
                            />
                          </label>
                          {model.image_path && (
                            <img
                              src={`${BASE_URL}${model.image_path.replace(/^\//, '')}`}
                              alt="Current"
                              className="h-6 w-6 object-cover rounded sm:col-span-1"
                              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/24'; }}
                            />
                          )}
                        
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => handleAddModel(bIndex)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add Model
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {brands.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-strokedark rounded-lg">
                  <FontAwesomeIcon icon={faTag} className="text-gray-300 dark:text-gray-600 text-2xl mb-1" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">No brands yet</p>
                  <button
                    type="button"
                    onClick={handleAddBrand}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1 mx-auto"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add First Brand
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-strokedark text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductForm;