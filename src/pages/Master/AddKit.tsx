import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import { useNavigate } from 'react-router-dom';

const emptyProduct = {
  product_type_id: '',
  brand_id: null,
  model_id: '',
  ptype: '',
  brand: '',
  model: '',
  qty: 1,
  price: 0,
  model_description: '',
};

const AddKitForm = ({ onClose, onKitAdded }) => {
  const [categories, setCategories] = useState([]);
  const [catId, setCatId] = useState('');
  const [kitName, setKitName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [productTypes, setProductTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedPT, setSelectedPT] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const navigate = useNavigate();

  const [currentProduct, setCurrentProduct] = useState({ ...emptyProduct });

  // ---------------- FETCH CATEGORIES ----------------
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get(`${BASE_URL}api/customised-categories`);
    setCategories(res.data);
  };

  // ---------------- FETCH PRODUCTS BY CATEGORY ----------------
  const fetchProductsByCategory = async (cat_id) => {
    const res = await axios.get(`${BASE_URL}api/products/category/${cat_id}`);
    setProductTypes(res.data);

    // reset everything
    setProducts([]);
    setSelectedPT(null);
    setSelectedBrand(null);
    setSelectedModel(null);
    setCurrentProduct({ ...emptyProduct });
    setPrice(0);
  };

  // ---------------- DROPDOWN HANDLERS ----------------
  const handleProductTypeChange = (ptId) => {
    const pt = productTypes.find((p) => p.product_type_id == ptId);
    if (!pt) return;

    setCurrentProduct({
      product_type_id: pt.product_type_id,
      ptype: pt.product_type_name,
      brand_id: null,
      brand: '',
      model_id: '',
      model: '',
      qty: 1,
      price: 0,
      brands: pt.brands || [],
      models: pt.brands?.length ? [] : pt.models || [],
    });

    setSelectedPT(pt);
    setSelectedBrand(null);
    setSelectedModel(null);
  };

  const handleBrandChange = (brandId) => {
    const brandObj = selectedPT?.brands?.find((b) => b.brand_id == brandId);
    if (!brandObj) return;

    setSelectedBrand(brandObj);

    setCurrentProduct((prev) => ({
      ...prev,
      brand_id: brandObj.brand_id,
      brand: brandObj.brand_name,
      model_id: '',
      model: '',
      models: brandObj.models || [],
      price: 0,
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
      model_description: modelObj.description || 'No description available',
      price: modelObj.price || 0,
    }));
  };

  const updateCurrentProductQty = (qty) => {
    setCurrentProduct((prev) => ({
      ...prev,
      qty,
    }));
  };

  const calculateKitPrice = (productList, draftProduct = null) => {
    let total = 0;
    productList.forEach((p) => {
      total += (p.price || 0) * (p.qty || 1);
    });
    if (draftProduct?.model_id) {
      total += (draftProduct.price || 0) * (draftProduct.qty || 1);
    }
    setPrice(total);
  };

  // ---------------- ADD PRODUCT ----------------
  const addMoreProduct = () => {
    if (!currentProduct.product_type_id || !currentProduct.model_id) {
      alert('Please complete product selection');
      return;
    }

    setProducts((prev) => {
      const updated = [...prev, { ...currentProduct }];
      calculateKitPrice(updated);
      return updated;
    });

    setCurrentProduct({ ...emptyProduct });
    setSelectedPT(null);
    setSelectedBrand(null);
    setSelectedModel(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalProducts = [...products];

    if (currentProduct?.product_type_id && currentProduct?.model_id) {
      finalProducts.push({ ...currentProduct });
    }

    if (!finalProducts.length) {
      alert('Please add at least one product');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}api/kit`, {
        cat_id: Number(catId),
        kit_name: kitName,
        description,
        kit_price: price,
        items: finalProducts.map((p) => ({
          product_type_id: p.product_type_id,
          brand_id: p.brand_id,
          model_id: p.model_id,
          qty: Number(p.qty),
        })),
      });

navigate('/quotation-template');

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to add kit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateKitPrice(products, currentProduct);
  }, [products, currentProduct]);

  const handleCancel = () => {
  navigate('/quotation-template');
  };

  const totalPrice =
    Number(currentProduct.qty || 0) * Number(currentProduct.price || 0);

  return (
    <div className="max-w-5xl mx-auto mt-6 bg-white rounded shadow-md p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-800">Add Kit</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* KIT BASIC INFO */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            className="border px-3 py-2 rounded"
            placeholder="Kit Name"
            value={kitName}
            onChange={(e) => setKitName(e.target.value)}
          />

          <select
            className="border px-3 py-2 rounded"
            value={catId}
            onChange={(e) => {
              setCatId(e.target.value);
              fetchProductsByCategory(e.target.value);
            }}
          >
            <option value="">Select Subject</option>
            {categories.map((c) => (
              <option key={c.cat_id} value={c.cat_id}>
                {c.cat_name}
              </option>
            ))}
          </select>

          <textarea
            className="border px-3 py-2 rounded col-span-2"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* PRODUCT SELECTION */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <select
            className="border px-3 py-2 rounded"
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
            className="border px-3 py-2 rounded"
            value={selectedBrand?.brand_id || ''}
            disabled={!selectedPT?.brands?.length}
            onChange={(e) => handleBrandChange(e.target.value)}
          >
            <option value="">Brand</option>
            {selectedPT?.brands?.map((b) => (
              <option key={b.brand_id} value={b.brand_id}>
                {b.brand_name}
              </option>
            ))}
          </select>

          <select
            className="border px-3 py-2 rounded"
            value={selectedModel?.model_id || ''}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            <option value="">Model</option>
            {(selectedBrand?.models || selectedPT?.models || []).map((m) => (
              <option key={m.model_id} value={m.model_id}>
                {m.model_no}
              </option>
            ))}
          </select>
        </div>

        {/* SELECTED PRODUCT INFO */}
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

              {/* 🔁 Quantity moved here */}
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
                      updateCurrentProductQty('');
                      return;
                    }
                    updateCurrentProductQty(Number(value));
                  }}
                  onBlur={() => {
                    if (!currentProduct.qty || Number(currentProduct.qty) < 1) {
                      updateCurrentProductQty(1);
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

              {/* 🔁 Brand moved here */}
              <div>
                <span className="font-medium">Brand:</span>{' '}
                {currentProduct.brand}
              </div>

              {/* TOTAL PRICE */}
              <div>
                <span className="font-medium">Total Price:</span>{' '}
                <span className="font-semibold text-green-700">
                  ₹
                  {(
                    Number(currentProduct.qty || 0) *
                    Number(currentProduct.price || 0)
                  ).toFixed(2)}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="font-medium">Description:</span>
                <p className="text-gray-600 mt-1">
                  {currentProduct.model_description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ADDED PRODUCTS */}
        {products.map((p, i) => (
          <div key={i} className="border rounded p-3 mb-3 bg-gray-50 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div>
                <span className="font-medium">Product Type:</span> {p.ptype}
              </div>

              <div>
                <span className="font-medium">Brand:</span> {p.brand}
              </div>

              <div>
                <span className="font-medium">Model:</span> {p.model}
              </div>

              <div>
                <span className="font-medium">Quantity:</span> {p.qty}
              </div>

              <div>
                <span className="font-medium">Unit Price:</span> ₹
                {Number(p.price).toFixed(2)}
              </div>

              <div>
                <span className="font-medium">Total Price:</span>{' '}
                <span className="font-semibold text-green-700">
                  ₹{(Number(p.qty) * Number(p.price)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          {/* ADD PRODUCT BUTTON */}
          <button
            type="button"
            onClick={addMoreProduct}
            disabled={!selectedPT || !selectedModel}
            className="text-blue-600 text-sm font-medium disabled:text-gray-400"
          >
            + Add More Product
          </button>

          {/* TOTAL PRICE */}
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded font-semibold text-right">
            Total: ₹{price.toFixed(2)}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 px-4 py-2 rounded text-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 px-4 py-2 rounded text-white"
          >
            {loading ? 'Saving...' : 'Save Kit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddKitForm;