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
  faChevronRight
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
  brands: Brand[];
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('product_type_name', productTypeName);
      formData.append('quotation_type', quotationType);
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

      const res = await axios.put(
        `${BASE_URL}api/product/${productType.product_type_id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true }
      );

      if (res.data.success) {
        alert(res.data.message || 'Product updated successfully!');
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-end min-h-full p-2 sm:p-6">
        <div className="bg-white rounded-xl shadow-2xl w-full sm:max-w-2xl mt-10 sm:mr-[20%]">

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
            <div className="bg-blue-50 border rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Product Category Type</label>
                <select
                  value={quotationType}
                  onChange={(e) => handleQuotationChange(e.target.value)}
                  className="w-full border rounded-lg py-2 px-2 text-sm"
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
                    className="w-full mt-2 border rounded-lg px-2 py-2 text-sm"
                    placeholder="Enter custom type"
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Product Type Name</label>
                <input
                  value={productTypeName}
                  readOnly
                  className="w-full border rounded-lg px-2 py-2 text-sm bg-gray-100"
                />
              </div>
            </div>

            {/* Brands */}
            {brands.map((brand, bIndex) => (
              <div key={bIndex} className="border rounded-lg overflow-hidden">
                <div
                  className="bg-gray-50 px-3 py-2 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleBrandExpansion(bIndex)}
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className={`transition-transform ${expandedBrands.includes(bIndex) ? 'rotate-90' : ''}`}
                    />
                    <span className="font-semibold text-sm">{brand.brand_name}</span>
                  </div>
                  <span className="text-xs">{brand.models.length} model(s)</span>
                </div>

                {expandedBrands.includes(bIndex) && (
                  <div className="p-3 space-y-3">
                    {brand.models.map((model, mIndex) => (
                      <div
                        key={mIndex}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <input
                          value={model.model_no}
                          onChange={(e) =>
                            handleModelChange(bIndex, mIndex, 'model_no', e.target.value)
                          }
                          placeholder="Model No"
                          className="sm:col-span-3 border rounded px-2 py-1 text-sm"
                        />
                        <input
                          value={model.description}
                          onChange={(e) =>
                            handleModelChange(bIndex, mIndex, 'description', e.target.value)
                          }
                          placeholder="Description"
                          className="sm:col-span-4 border rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="number"
                          value={model.price}
                          onChange={(e) =>
                            handleModelChange(bIndex, mIndex, 'price', e.target.value)
                          }
                          placeholder="Price"
                          className="sm:col-span-2 border rounded px-2 py-1 text-sm"
                        />

                        <label className="sm:col-span-3 flex items-center gap-2 border rounded px-2 py-1 text-sm cursor-pointer">
                          <FontAwesomeIcon icon={faImage} />
                          <span className="truncate">
                            {model.image ? model.image.name : 'Upload'}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              handleModelChange(
                                bIndex,
                                mIndex,
                                'image',
                                e.target.files?.[0] || null
                              )
                            }
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
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