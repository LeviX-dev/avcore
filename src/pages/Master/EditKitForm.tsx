import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const emptyProduct = {
  product_type_id: null,
  ptype: '',
  brand_id: null,
  brand: '',
  model_id: null,
  model: '',
  qty: 1,
  price: 0,
  model_description: '',
  brands: [],
  models: [],
  kit_name: '',
};

const EditKitForm = ({ kit, onClose, onKitUpdated }) => {
  const [kitName, setKitName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [items, setItems] = useState([]);
  const [kitPrice, setKitPrice] = useState(0);

  const [categories, setCategories] = useState([]);
  const [catId, setCatId] = useState('');
  const [productTypes, setProductTypes] = useState([]);
  const [selectedPT, setSelectedPT] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentProduct, setCurrentProduct] = useState({ ...emptyProduct });
  const [showAddProduct, setShowAddProduct] = useState(false);

  // ---------------- FETCH CATEGORIES ----------------
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get(`${BASE_URL}api/category`);
      setCategories(res.data);
    };
    fetchCategories();
  }, []);

  // ---------------- FETCH KIT DETAILS ----------------
  useEffect(() => {
    if (!kit?.kit_id) return;

    const fetchKitDetails = async () => {
      const res = await axios.get(`${BASE_URL}api/kit/${kit.kit_id}`);
      const data = res.data;

      setKitName(data.kit_name);
      setDescription(data.description || '');
      setStatus(data.status);
      setItems(
        data.items.map((i) => ({
          product_type_id: i.product_type_id,
          product_type_name: i.product_type_name,
          brand_id: i.brand_id,
          brand_name: i.brand_name,
          model_id: i.model_id,
          model: i.model_no,
          price: Number(i.price) || 0,
          qty: i.qty,
        })),
      );
    };
    fetchKitDetails();
  }, [kit]);

  const fetchProductsByCategory = async (cat_id) => {
    if (!cat_id) return;
    const res = await axios.get(`${BASE_URL}api/products/category/${cat_id}`);
    setProductTypes(res.data || []);

    setSelectedPT(null);
    setSelectedBrand(null);
    setSelectedModel(null);
    setCurrentProduct({ ...emptyProduct });
  };

  const handleProductTypeChange = (ptId) => {
    const pt = productTypes.find((p) => p.product_type_id == ptId);
    if (!pt) return;

    setSelectedPT(pt);
    setSelectedBrand(null);
    setSelectedModel(null);

    setCurrentProduct({
      ...emptyProduct,
      product_type_id: pt.product_type_id,
      ptype: pt.product_type_name,
      brands: pt.brands || [],
      models: pt.brands?.length ? [] : pt.models || [],
    });
  };

  const handleBrandChange = (brandId) => {
    const brandObj = selectedPT?.brands?.find((b) => b.brand_id == brandId);
    if (!brandObj) return;

    setSelectedBrand(brandObj);
    setSelectedModel(null);

    setCurrentProduct((prev) => ({
      ...prev,
      brand_id: brandObj.brand_id,
      brand: brandObj.brand_name,
      models: brandObj.models || [],
      price: 0,
      model_id: null,
      model: '',
    }));
  };

  const handleModelChange = (modelId) => {
    const modelObj = (selectedBrand?.models || selectedPT?.models || []).find(
      (m) => m.model_id == modelId,
    );
    if (!modelObj) return;

    setSelectedModel(modelObj);

    setCurrentProduct((prev) => ({
      ...prev,
      model_id: modelObj.model_id,
      model: modelObj.model_no,
      model_description: modelObj.description || 'No description',
      price: Number(modelObj.price) || 0,
      qty: 1,
    }));
  };

  const handleAddProductToKit = () => {
    if (!selectedPT || !selectedModel) {
      alert('Please select product type and model.');
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        product_type_id: currentProduct.product_type_id,
        product_type_name: currentProduct.ptype,
        brand_id: currentProduct.brand_id,
        brand_name: currentProduct.brand,
        model_id: currentProduct.model_id,
        model: currentProduct.model,
        qty: Number(currentProduct.qty || 1),
        price: Number(currentProduct.price || 0),
      },
    ]);

    // Reset add product form
    setSelectedPT(null);
    setSelectedBrand(null);
    setSelectedModel(null);
    setCurrentProduct({ ...emptyProduct });
    setShowAddProduct(false);
  };

  const updateItemQty = (idx, val) => {
    const updated = [...items];
    updated[idx].qty = val < 1 ? 1 : val;
    setItems(updated);
  };

  useEffect(() => {
    const total = items.reduce(
      (sum, i) => sum + (i.price || 0) * (i.qty || 1),
      0,
    );
    setKitPrice(total);
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.put(`${BASE_URL}api/kit/${kit.kit_id}`, {
      kit_name: kitName,
      description,
      cat_id: Number(catId), // ✅ REQUIRED
      status,
      items: items.map((i) => ({
        product_type_id: i.product_type_id,
        brand_id: i.brand_id || null,
        model_id: i.model_id || null,
        qty: Number(i.qty || 1),
      })),
    });

    onKitUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 mt-10 ml-40 flex items-start justify-center z-50 pt-12 px-2 sm:px-4 overflow-auto">
      <div className="bg-white w-full max-w-4xl rounded shadow-lg p-5 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Kit</h2>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kit Name */}
          <input
            className="border px-3 py-2 rounded w-full"
            placeholder="Kit Name"
            value={kitName}
            onChange={(e) => setKitName(e.target.value)}
            required
          />

          {/* Description */}
          <textarea
            className="border px-3 py-2 rounded w-full"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Products Header */}
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg">Kit Products</span>
            {/* <span className="text-green-700 font-semibold text-lg">
              Total: ₹ {kitPrice.toFixed(2)}
            </span> */}
            <button
              type="button"
              onClick={() => setShowAddProduct(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              + Add Product
            </button>
          </div>

          {/* ADD PRODUCT UI */}
          {showAddProduct && (
            <>
              {/* Category dropdown */}
              <select
                className="border px-3 py-2 rounded w-full mb-3"
                value={catId}
                onChange={(e) => {
                  setCatId(e.target.value);
                  fetchProductsByCategory(e.target.value);
                }}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.cat_id} value={c.cat_id}>
                    {c.cat_name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={selectedPT?.product_type_id || ''}
                  onChange={(e) => handleProductTypeChange(e.target.value)}
                >
                  <option value="">Product Type</option>
                  {productTypes.map((pt) => (
                    <option key={pt.product_type_id} value={pt.product_type_id}>
                      {pt.product_type_name}
                    </option>
                  ))}
                </select>
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={selectedBrand?.brand_id || ''}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  disabled={!selectedPT}
                >
                  <option value="">Brand</option>
                  {selectedPT?.brands?.map((b) => (
                    <option key={b.brand_id} value={b.brand_id}>
                      {b.brand_name}
                    </option>
                  ))}
                </select>
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={selectedModel?.model_id || ''}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!selectedBrand}
                >
                  <option value="">Model</option>
                  {(selectedBrand?.models || selectedPT?.models || []).map(
                    (m) => (
                      <option key={m.model_id} value={m.model_id}>
                        {m.model_no}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Selected Product Details */}
              {selectedPT && selectedModel && (
                <div className="mb-4 p-4 border rounded bg-yellow-50">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Selected Product Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Product Type:</span>{' '}
                      {currentProduct.ptype}
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        className="border px-2 py-1 rounded w-20 ml-2"
                        value={currentProduct.qty}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setCurrentProduct((prev) => ({ ...prev, qty: '' }));
                            return;
                          }
                          setCurrentProduct((prev) => ({
                            ...prev,
                            qty: Number(value),
                          }));
                        }}
                        onBlur={() => {
                          if (
                            !currentProduct.qty ||
                            Number(currentProduct.qty) < 1
                          ) {
                            setCurrentProduct((prev) => ({ ...prev, qty: 1 }));
                          }
                        }}
                      />
                    </div>

                    <div>
                      <span className="font-medium">Model:</span>{' '}
                      {currentProduct.model}
                    </div>
                    <div>
                      <span className="font-medium">Unit Price:</span> ₹
                      {Number(currentProduct.price).toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Brand:</span>{' '}
                      {currentProduct.brand}
                    </div>

                    <div>
                      <span className="font-medium">Total Price:</span>{' '}
                      <span className="font-semibold text-green-700">
                        ₹
                        {(currentProduct.qty * currentProduct.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium">Description:</span>
                      <p className="text-gray-600 mt-1">
                        {currentProduct.model_description}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="px-3 py-1 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddProductToKit}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Add Product
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Added Products */}
          {items.map((item, idx) => (
            <div
              key={idx}
              className="relative border rounded p-3 mb-3 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <button
                type="button"
                onClick={() => setItems(items.filter((_, i) => i !== idx))}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <div>
                  <span className="font-medium">Product Type:</span>{' '}
                  {item.product_type_name}
                </div>
                <div>
                  <span className="font-medium">Brand:</span> {item.brand_name}
                </div>
                <div>
                  <span className="font-medium">Model:</span> {item.model}
                </div>
                <div>
                  <span className="font-medium">Quantity:</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="border ml-2 px-2 py-1 rounded w-20"
                    value={item.qty}
                    onChange={(e) => updateItemQty(idx, Number(e.target.value))}
                  />
                </div>
                <div>
                  <span className="font-medium">Unit Price:</span> ₹
                  {Number(item.price).toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Total:</span>{' '}
                  <span className="font-semibold text-green-700">
                    ₹ {(item.qty * item.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Update Kit Button & Total */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-green-700 font-semibold text-lg">
              Kit Total: ₹ {kitPrice.toFixed(2)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Update Kit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditKitForm;