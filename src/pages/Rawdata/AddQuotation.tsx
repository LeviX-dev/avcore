import { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
} from 'react-icons/fa';
import logo from '../../images/logo/AVCoreLogo.png'; 

const AddQuotation = () => {
  const { master_id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const leadName = state?.name || master_id;
  const leadContact = state?.number || state?.contact || 'N/A';
  const leadCity = state?.city || state?.address || 'N/A';
  const leadAddress = state?.address || '';

const [installments, setInstallments] = useState([]); // Start with empty array
const [showInstallments, setShowInstallments] = useState(false); // New state to control visibility 


  /* ---------------- STATES ---------------- */
  const [quotationName, setQuotationName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [kits, setKits] = useState([]);
  const [selectedKit, setSelectedKit] = useState('');
  const [selectedKitData, setSelectedKitData] = useState(null);
  const [kitQty, setKitQty] = useState(1);
  const [qtNumber, setQtNumber] = useState('');
  const [quoteType, setQuoteType] = useState('with_gst');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [queuedCategories, setQueuedCategories] = useState([]);
  const [openSingleProductPopup, setOpenSingleProductPopup] = useState(false);
  const [spCategory, setSpCategory] = useState('');
  const [productTypes, setProductTypes] = useState([]);
  const [spType, setSpType] = useState('');
  const [selectedPT, setSelectedPT] = useState(null);
  const [spBrand, setSpBrand] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [spModel, setSpModel] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedSingleModel, setSelectedSingleModel] = useState(null);
  const [spQty, setSpQty] = useState(1);
  const [spPrice, setSpPrice] = useState(0);
  const [framingBy, setFramingBy] = useState('');
  const [fabricBy, setFabricBy] = useState('');
  const [ceilingBy, setCeilingBy] = useState('');
  const [gstBaseAmount, setGstBaseAmount] = useState('');

  /* Global additional prices */
  const [additionalPrices, setAdditionalPrices] = useState([
    { add_price_name: '', price: '' },
  ]);

 
const updateInstallment = (index, field, value) => {
  const updated = [...installments];
  const total = Number(totalWithGST || 0);

  if (value === '') {
    updated[index][field] = '';
    setInstallments(updated);
    return;
  }

  if (field === 'percentage') {
    const percent = Number(value);
    updated[index].percentage = percent;
    updated[index].amount = (total * percent) / 100;
  }

  if (field === 'amount') {
    const amt = Number(value);
    updated[index].amount = amt;
    updated[index].percentage = total ? (amt / total) * 100 : 0;
  }

  if (field === 'description') {
    updated[index].description = value;
  }

  const totalPercent = updated.reduce(
    (sum, i) => sum + Number(i.percentage || 0),
    0,
  );

  if (totalPercent > 100) {
    alert('Total percentage cannot exceed 100%');
  }

  setInstallments(updated);
};

// Update addInstallment function
const addInstallment = () => {
  const totalPercent = installments.reduce(
    (sum, i) => sum + Number(i.percentage || 0),
    0,
  );

  if (totalPercent >= 100) {
    alert('Already reached 100%');
    return;
  }

  setInstallments([
    ...installments,
    { description: '', percentage: 0, amount: 0 },
  ]);
};

// Update removeInstallment function
const removeInstallment = (index) => {
  const updated = installments.filter((_, i) => i !== index);
  setInstallments(updated);
};

// Add function to initialize default installment
const initializeDefaultInstallment = () => {
  setShowInstallments(true);
  setInstallments([
    { description: 'Full Payment', percentage: 100, amount: Number(totalWithGST || 0) },
  ]);
};

// Update validateInstallments - now only validates if installments exist
const validateInstallments = () => {
  // If no installments, it's valid (optional)
  if (installments.length === 0) {
    return true;
  }
  
  const totalPercentage = installments.reduce(
    (sum, installment) => sum + Number(installment.percentage || 0),
    0
  );
  
  if (Math.abs(totalPercentage - 100) > 0.01) {
    alert(`Payment installment total must be 100%. Current total: ${totalPercentage.toFixed(2)}%`);
    return false;
  }
  
  const hasEmptyDescription = installments.some(
    installment => !installment.description || installment.description.trim() === ''
  );
  
  if (hasEmptyDescription) {
    alert('Please enter description for all payment installments');
    return false;
  }
  
  const hasZeroPercentage = installments.some(
    installment => Number(installment.percentage || 0) === 0
  );
  
  if (hasZeroPercentage && installments.length > 1) {
    alert('Each installment must have a percentage greater than 0%');
    return false;
  }
  
  return true;
};


  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    axios.get(`${BASE_URL}api/customised-categories`).then((res) => {
      setCategories(res.data || []);
    });
  }, []);

  /* ---------------- FETCH KITS BY CATEGORY ---------------- */
  useEffect(() => {
    if (!selectedCategory) return;

    axios
      .get(`${BASE_URL}api/category-products-kits/${selectedCategory}`)
      .then((res) => {
        setKits(res.data.kits || []);
        setSelectedKit('');
        setSelectedKitData(null);
        setKitQty(1);
      });
  }, [selectedCategory]);

  /* ---------------- SET SELECTED KIT DATA ---------------- */
  useEffect(() => {
    if (!selectedKit) {
      setSelectedKitData(null);
      return;
    }

    const kit = kits.find((k) => k.kit_id === Number(selectedKit));
    if (kit) {
      const mappedItems = kit.items.map((item) => ({
        ...item,
        prod_qty: item.qty,
        prod_price: item.price,
      }));
      setSelectedKitData({ ...kit, items: mappedItems });
    }
  }, [selectedKit, kits]);

  /* ---------------- UPDATE ITEM ---------------- */
  const updateItem = (idx, field, value) => {
    const updated = { ...selectedKitData };
    updated.items[idx][field] = Number(value);
    setSelectedKitData(updated);
  };

  /* ---------------- KIT QTY CHANGE ---------------- */
  const handleKitQtyChange = (value) => {
    if (value === '') {
      setKitQty('');
      return;
    }
    const qty = Math.max(1, Number(value));
    setKitQty(qty);
  };

  /* ---------------- ADDITIONAL PRICE HANDLERS ---------------- */
  const addAdditionalPriceRow = () => {
    setAdditionalPrices([
      ...additionalPrices,
      { add_price_name: '', price: '' },
    ]);
  };

  const removeAdditionalPriceRow = (index) => {
    const updated = additionalPrices.filter((_, i) => i !== index);
    setAdditionalPrices(
      updated.length ? updated : [{ add_price_name: '', price: '' }],
    );
  };

  const updateAdditionalPrice = (index, field, value) => {
    const updated = [...additionalPrices];
    updated[index][field] = value;
    setAdditionalPrices(updated);
  };

  const handleAddCategory = () => {
    if (!selectedCategory || !selectedKit || !selectedKitData) {
      alert('Please select category and kit');
      return;
    }

    const kitItemsTotal = selectedKitData.items.reduce(
      (sum, item) => sum + item.prod_qty * item.prod_price,
      0,
    );

    const categoryTotal = kitItemsTotal * Number(kitQty);

    const categoryObj = {
      cat_id: selectedCategory,
      cat_name:
        categories.find((c) => c.cat_id === Number(selectedCategory))
          ?.cat_name || '',
      kit_id: selectedKit,
      kit_name: selectedKitData.kit_name,
      kit_qty: kitQty,

      products: selectedKitData.items.map((i) => ({
        model_id: i.model_id,
        model: i.model,
        brand_name: i.brand_name,
        product_type_name: i.product_type_name,
        model_description: i.model_description,
        model_qty: Number(i.prod_qty),
        model_price: Number(i.prod_price),
      })),

      category_total: categoryTotal,
    };

    setQueuedCategories((prev) => [...prev, categoryObj]);

    // reset state
    setSelectedCategory('');
    setSelectedKit('');
    setSelectedKitData(null);
    setKitQty(1);
  };

  const removeCategory = (index) => {
    const updated = queuedCategories.filter((_, i) => i !== index);
    setQueuedCategories(updated);
  };

  // ✅ SUBTOTAL (use stored category_total)
  const subtotal = queuedCategories.reduce((sum, category) => {
    return sum + Number(category.category_total || 0);
  }, 0);

  // ✅ ADDITIONAL TOTAL
  const additionalTotal = additionalPrices.reduce((sum, row) => {
    return sum + (Number(row.price) || 0);
  }, 0);

  // ✅ TOTAL BEFORE GST
  const totalWithoutGST = subtotal + additionalTotal;

  // ✅ GST ONLY ON ENTERED BASE
  const gstAmount =
    quoteType === 'with_gst' && Number(gstBaseAmount) > 0
      ? Number(gstBaseAmount) * 0.18
      : 0;

  // ✅ FINAL TOTAL
  const totalWithGST = totalWithoutGST + gstAmount;

  /* ---------------- SUBMIT ---------------- */

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!queuedCategories.length) {
    alert('Please add at least one category to quotation');
    return;
  }

  if (!validateInstallments()) {
    return;
  }


  // Check if ACOUSTIC category exists
  const isAcoustic = queuedCategories.some(
    (q) => q.cat_name?.toLowerCase() === 'customised acoustic quotation',
  );

  // Validate acoustic dropdowns
  if (isAcoustic && (!framingBy || !fabricBy || !ceilingBy)) {
    alert('Please select all Acoustic options');
    return;
  }

  // Build acoustic full text
  const acousticTerms =
    framingBy && fabricBy && ceilingBy
      ? `ALL FRAMING WILL BE DONE BY ${framingBy}.
• FABRIC & FLOOR CARPET WILL BE PROVIDED BY ${fabricBy}
• ALL CEILING-RELATED WORK WILL BE PROVIDED BY ${ceilingBy}.
• FABRIC STITCHING CHARGES WILL BE EXTRA AS PER THE DESIGN`
      : null;

  const payload = {
    type: quoteType,
    master_id,
    acoustic_terms: acousticTerms,
    installments: installments, // This will be empty array if no installments added
    gst_app_amt: quoteType === 'with_gst' ? Number(gstBaseAmount || 0) : 0,

    items: queuedCategories.map((item) => ({
      cat_id: item.cat_id,
      kit_id: item.kit_id || null,
      kit_qty: item.kit_id ? Number(item.kit_qty || 1) : 1,
      products: item.products.map((p) => ({
        model_id: p.model_id,
        model_qty: Number(p.model_qty || 1),
        model_price: Number(p.model_price || 0),
      })),
    })),

    additional_prices: additionalPrices.filter(
      (a) => a.add_price_name && a.price,
    ),
  };

  console.log('payload', payload);

  try {
    await axios.post(`${BASE_URL}api/quotation`, payload, {
      withCredentials: true,
    });

    alert('Quotation created successfully ✅');
    navigate('/quatation-pending');
  } catch (err) {
    console.error(err);
    alert('Failed to create quotation ❌');
  }
};


useEffect(() => {
  if (installments.length > 0 && totalWithGST > 0) {
    const updatedInstallments = installments.map(inst => ({
      ...inst,
      amount: (totalWithGST * (inst.percentage / 100))
    }));
    setInstallments(updatedInstallments);
  }
}, [totalWithGST]);

const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const fetchProductsByCategory = async (cat_id) => {
    if (!cat_id) return;

    const res = await axios.get(`${BASE_URL}api/products/category/${cat_id}`);
    setProductTypes(res.data || []);

    // Reset downstream selections
    setSelectedPT(null);
    setSpType('');
    setSelectedBrand(null);
    setSpBrand('');
    setSelectedModel(null);
    setSpModel('');
    setSelectedSingleModel(null);
    setSpPrice(0);
    setSpQty(1);
  };

  const handleProductTypeChange = (ptId) => {
    const pt = productTypes.find((p) => p.product_type_id == ptId);
    setSelectedPT(pt || null);
    setSpType(ptId);
    setSpBrand('');
    setSelectedBrand(null);
    setSpModel('');
    setSelectedModel(null);
    setSelectedSingleModel(null);
    setSpPrice(0);
  };

  const handleBrandChange = (brandId) => {
    const b = selectedPT?.brands?.find((b) => b.brand_id == brandId);
    setSelectedBrand(b || null);
    setSpBrand(brandId);
    setSpModel('');
    setSelectedModel(null);
    setSelectedSingleModel(null);
    setSpPrice(0);
  };

  const handleModelChange = (modelId) => {
    const m = selectedBrand?.models?.find((m) => m.model_id == modelId);
    setSelectedModel(m || null);
    setSelectedSingleModel(m || null);
    setSpModel(modelId);
    setSpPrice(m?.price || 0);
    setSpQty(1);
  };

  const handleAddSingleProduct = () => {
    if (!spCategory || !selectedSingleModel) {
      alert('Please select a category and product model');
      return;
    }

    const category = categories.find((c) => c.cat_id == spCategory);

    const productObj = {
      cat_id: spCategory,
      cat_name: category?.cat_name || '',
      kit_id: null,
      kit_name: null,
      kit_qty: 1,
      products: [
        {
          model_id: selectedSingleModel.model_id,
          model: selectedSingleModel.model_no,
          brand_name: selectedBrand?.brand_name || '',
          product_type_name: selectedPT?.product_type_name || '',
          model_description: selectedSingleModel.description,
          model_qty: Number(spQty),
          model_price: Number(spPrice || selectedSingleModel.price),
        },
      ],
      category_total:
        Number(spQty) * Number(spPrice || selectedSingleModel.price),
    };

    setQueuedCategories((prev) => [...prev, productObj]);
    setOpenSingleProductPopup(false);

    // Reset popup selections
    setSpCategory('');
    setSpType('');
    setSelectedPT(null);
    setSpBrand('');
    setSelectedBrand(null);
    setSpModel('');
    setSelectedModel(null);
    setSelectedSingleModel(null);
    setSpQty(1);
    setSpPrice(0);
  };

  // Get selected category name for display
  const getSelectedCategoryName = () => {
    const category = categories.find((c) => c.cat_id == selectedCategory);
    return category?.cat_name || '';
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div>
      <Breadcrumb pageName="Create Quotation" />

      <div className="bg-white rounded shadow p-6 max-w-5xl mx-auto">
        {/* BACK BUTTON */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate('/quatation-pending')}
            className="bg-gray-400 px-4 py-2 rounded text-white flex items-center gap-2 hover:bg-gray-500 transition"
          >
            <FaArrowLeft />
            Back
          </button>
        </div>

        {/* HEADER SECTION */}
        <div className="flex justify-between items-start mb-8 border-b pb-4">
          {/* LEFT SIDE */}
          <div className="flex flex-col text-left leading-tight">
            <h1 className="text-4xl font-bold text-[#7d20a0] underline decoration-[#7d20a0] decoration-4 underline-offset-4 mb-2">
              AV CORE
            </h1>

            <p className="font-bold text-[13px] text-black uppercase mb-1">
              ALL ABOUT AUDIO VIDEO
            </p>

            <p className="text-[12px] font-bold text-black uppercase">
              1ST FLOOR GAYATRI BUILDING, BESIDE JUPITER HOSPITAL, BANER 411045,
              PUNE.
            </p>

            <p className="text-[16px] font-bold text-black">
              Email:{' '}
              <span className="text-blue-600">avcoreindia@gmail.com</span>
            </p>

            <p className="text-[16px] font-bold text-black">
              Website: <span className="text-blue-600">www.avcore.in</span>
            </p>

            <p className="text-[12px] font-bold text-black uppercase">
              CO.NO: 8329728210 / 8766786026
            </p>
          </div>

          {/* RIGHT SIDE LOGO */}
          <div className="bg-black p-1">
           <img
  src={logo}
  className="w-28 h-auto border border-black"
  alt="Logo"
/>
          </div>
        </div>


      {/* CLIENT INFORMATION */}
<div className="border-2 border-black mt-4 text-[14px]">

  {/* ROW 1 */}
  <div className="flex justify-between px-4 py-2 border-b border-black">
    <p>
      <span className="font-bold text-black">NAME :</span>{' '}
      <span className="text-gray-800">{leadName}</span>
    </p>

    <p>
      <span className="font-bold text-black">CONTACT :</span>{' '}
      <span className="text-gray-800">{leadContact}</span>
    </p>
  </div>

  {/* ROW 2 */}
  <div className="flex justify-between px-4 py-2">
    <p>
      <span className="font-bold text-black">DATE :</span>{' '}
      <span className="text-gray-800">{formattedDate}</span>
    </p>

    <p>
      <span className="font-bold text-black">ADDRESS :</span>{' '}
      <span className="text-gray-800">
        {leadAddress ? `${leadAddress}, ${leadCity}` : leadCity}
      </span>
    </p>
  </div>

</div>


        <form onSubmit={handleSubmit} className="space-y-5 mt-9">
          {/* CATEGORY & KIT SELECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 font-medium">Subject</label>
              <select
                className="w-full border px-4 py-2 rounded"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Subject</option>
                {categories.map((c) => (
                  <option key={c.cat_id} value={c.cat_id}>
                    {c.cat_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Kit</label>
              <select
                className="w-full border px-4 py-2 rounded"
                value={selectedKit}
                onChange={(e) => setSelectedKit(e.target.value)}
              >
                <option value="">Select kit</option>
                {kits.map((k) => (
                  <option key={k.kit_id} value={k.kit_id}>
                    {k.kit_name} (₹{k.kit_price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ACOUSTIC SPECIAL TERMS - ONLY SHOW FOR "Customised Acoustic Quotation" */}
          {selectedCategory &&
            getSelectedCategoryName() === 'Customised Acoustic Quotation' && (
              <div className="border rounded bg-gray-50 p-4 space-y-3 mb-4">
                <h2 className="font-semibold text-blue-600">
                  Acoustic Special Terms
                </h2>

                <div>
                  <label className="text-base font-semibold text-gray-500">
                    All Framing Will Be Done By
                  </label>
                  <select
                    className="border px-3 py-2 rounded w-full mt-1"
                    value={framingBy}
                    onChange={(e) => setFramingBy(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="AV CORE">BY AV CORE</option>
                    <option value="THE CLIENT">BY THE CLIENT</option>
                  </select>
                </div>

                <div>
                  <label className="text-base font-semibold text-gray-500">
                    Fabric & Floor Carpet Provided By
                  </label>
                  <select
                    className="border px-3 py-2 rounded w-full mt-1"
                    value={fabricBy}
                    onChange={(e) => setFabricBy(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="AV CORE">BY AV CORE</option>
                    <option value="THE CLIENT">BY THE CLIENT</option>
                  </select>
                </div>

                <div>
                  <label className="text-base font-semibold text-gray-500">
                    Ceiling Related Work Provided By
                  </label>
                  <select
                    className="border px-3 py-2 rounded w-full mt-1"
                    value={ceilingBy}
                    onChange={(e) => setCeilingBy(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="AV CORE">BY AV CORE</option>
                    <option value="THE CLIENT">BY THE CLIENT</option>
                  </select>
                </div>
              </div>
            )}

          {/* QUOTE TYPE + KIT QTY - MOVED AFTER ACOUSTIC SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col">
              <label className="font-medium text-sm">Quotation Type</label>
              <select
                className="border px-3 py-2 rounded"
                value={quoteType}
                onChange={(e) => {
                  setQuoteType(e.target.value);
                  if (e.target.value === 'without_gst') {
                    setGstBaseAmount(0);
                  }
                }}
              >
                <option value="">Select</option>
                <option value="with_gst">With GST</option>
                <option value="without_gst">Without GST</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-medium text-sm">Kit Quantity</label>
              <input
                type="number"
                min={1}
                value={kitQty}
                onChange={(e) => handleKitQtyChange(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            {/* ✅ GST BASE AMOUNT FIELD */}
            {quoteType === 'with_gst' && (
              <div className="flex flex-col">
                <label className="font-medium text-sm">
                  GST Applicable Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gstBaseAmount}
                  onChange={(e) => setGstBaseAmount(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                  placeholder="Enter amount on which GST applies"
                />
              </div>
            )}
          </div>

          {/* SELECTED KIT ITEMS */}
          {selectedKitData && (
            <div className="bg-yellow-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Kit Items</h4>
              {selectedKitData.items.map((item, idx) => (
                <div
                  key={item.kmap_id}
                  className="bg-white p-3 mb-2 border rounded text-sm"
                >
                  <div>
                    <b>Product:</b> {item.product_type_name}
                  </div>
                  <div>
                    <b>Brand:</b> {item.brand_name}
                  </div>
                  <div>
                    <b>Model:</b> {item.model}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <b>Qty in Kit:</b>
                    <input
                      type="number"
                      min={1}
                      value={item.prod_qty ?? item.qty}
                      className="border px-2 py-1 rounded w-20"
                      onChange={(e) =>
                        updateItem(idx, 'prod_qty', e.target.value)
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <b>Unit Price:</b>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.prod_price ?? item.price}
                      className="border px-2 py-1 rounded w-28"
                      onChange={(e) =>
                        updateItem(idx, 'prod_price', e.target.value)
                      }
                    />
                  </div>

                  <div className="text-green-700 font-semibold mt-1">
                    Total: ₹
                    {(
                      (item.prod_qty ?? item.qty) *
                      (item.prod_price ?? item.price)
                    ).toFixed(2)}
                  </div>

                  {item.model_description && (
                    <div className="text-gray-600 mt-1">
                      {item.model_description}
                    </div>
                  )}
                </div>
              ))}

              <div className="text-right font-semibold text-lg bg-green-100 text-green-800 px-4 py-2 rounded">
                Kit Cost (x{kitQty}): ₹
                {(
                  selectedKitData.items.reduce(
                    (sum, item) => sum + item.prod_qty * item.prod_price,
                    0,
                  ) * kitQty
                ).toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {selectedKitData && (
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Kit to Quotation
              </button>
            )}

            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => setOpenSingleProductPopup(true)}
            >
              Add Single Product
            </button>
          </div>

          {queuedCategories.length > 0 && (
            <div className="bg-gray-100 p-4 rounded mt-4">
              <h4 className="font-semibold mb-2">Queued Categories</h4>

              {queuedCategories.map((item, i) => (
                <div key={i} className="p-3 border rounded bg-white mb-2">
                  {/* SUMMARY ROW */}
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpand(i)}
                  >
                    <div>
                      <b>Category:</b> {item.cat_name} | <b>Kit:</b>{' '}
                      {item.kit_name} | <b>Qty:</b> {item.kit_qty} |{' '}
                      <b>Total:</b> ₹{item.category_total.toFixed(2)}
                    </div>

                    {/* Arrow */}
                    <span
                      className={`transition-transform ${
                        expandedIndex === i ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </div>

                  {/* EXPANDED PRODUCT LIST */}
                  {expandedIndex === i && (
                    <div className="mt-3 border-t pt-3 space-y-3">
                      {item.products.map((prod, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 border rounded p-3 text-sm"
                        >
                          <div className="font-semibold text-gray-800">
                            {prod.model}
                          </div>
                          <div>
                            <b>Brand:</b> {prod.brand_name}
                          </div>
                          <div>
                            <b>Type:</b> {prod.product_type_name}
                          </div>

                          {prod.model_description && (
                            <div className="text-gray-600 whitespace-pre-line mt-1">
                              {prod.model_description}
                            </div>
                          )}

                          <div className="mt-1">
                            <b>Qty in Kit:</b> {prod.model_qty}
                          </div>
                          <div className="mt-1">
                            <b>Unit Price:</b> ₹{prod.model_price}
                          </div>
                          <div className="mt-1">
                            <b>Kit Qty:</b> {item.kit_qty}
                          </div>

                          <div className="text-green-700 font-semibold mt-2">
                            Total: ₹
                            {(
                              prod.model_qty *
                              prod.model_price *
                              item.kit_qty
                            ).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* REMOVE BUTTON */}
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => removeCategory(i)}
                      className="text-red-500 font-bold text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* GLOBAL ADDITIONAL PRICES */}
          <div className="bg-blue-50 p-4 rounded mt-4">
            <h4 className="font-semibold mb-2">
              Additional Charges (applied to entire quotation)
            </h4>

            {additionalPrices.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_1fr] gap-2 mb-2 items-center"
              >
                <input
                  className="border px-2 py-1 rounded w-full"
                  placeholder="Name"
                  value={row.add_price_name || ''}
                  onChange={(e) =>
                    updateAdditionalPrice(idx, 'add_price_name', e.target.value)
                  }
                />

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="border px-2 py-1 rounded w-full"
                    placeholder="Price"
                    value={row.price || ''}
                    onChange={(e) =>
                      updateAdditionalPrice(idx, 'price', e.target.value)
                    }
                  />

                  <div className="flex gap-1">
                    {idx === additionalPrices.length - 1 && (
                      <button
                        type="button"
                        onClick={addAdditionalPriceRow}
                        className="bg-green-500 text-white px-2 rounded"
                      >
                        +
                      </button>
                    )}

                    {additionalPrices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAdditionalPriceRow(idx)}
                        className="bg-red-500 text-white px-2 rounded"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* GRAND TOTAL */}
          <div className="text-right font-semibold text-lg bg-green-100 text-green-800 px-4 py-2 rounded mt-4">
            TOTAL COST OF PROJECT IN Rs: ₹
            {Number(totalWithoutGST || 0).toFixed(2)}
            {quoteType === 'with_gst' && (
              <span className="text-sm font-normal block">
                GST (18%) on ₹{Number(gstBaseAmount || 0).toFixed(2)} = ₹
                {Number(gstAmount || 0).toFixed(2)}
              </span>
            )}
          </div>

          {/* TOTAL AMOUNT INCLUDING GST */}
          <div className="text-right font-bold text-xl bg-blue-100 text-blue-800 px-4 py-2 rounded mt-2">
            TOTAL AMOUNT: ₹{Number(totalWithGST || 0).toFixed(2)}
          </div>

        {/* INSTALLMENTS SECTION - OPTIONAL */}
<div className="bg-yellow-50 p-4 rounded mt-4">
  <div className="flex justify-between items-center mb-3">
    <h4 className="font-semibold">Payment Installments (Optional)</h4>
    {!showInstallments && (
      <button
        type="button"
        onClick={initializeDefaultInstallment}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
      >
        + Add Installment Details
      </button>
    )}
  </div>

  {showInstallments && (
    <>
      {/* HEADER */}
      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 mb-2 font-semibold text-gray-700">
        <div>Description</div>
        <div>Percent%</div>
        <div>Amount (₹)</div>
        <div></div>
      </div>

      {installments.map((row, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 mb-2 items-center"
        >
          <input
            className="border px-2 py-1 rounded"
            placeholder="Advance / Final"
            value={row.description}
            onChange={(e) =>
              updateInstallment(idx, 'description', e.target.value)
            }
          />

          <input
            type="number"
            className="border px-2 py-1 rounded"
            placeholder="%"
            value={row.percentage === 0 ? '' : row.percentage}
            onChange={(e) =>
              updateInstallment(idx, 'percentage', e.target.value)
            }
          />

          <input
            type="number"
            className="border px-2 py-1 rounded"
            placeholder="₹"
            value={row.amount === 0 ? '' : row.amount}
            onChange={(e) =>
              updateInstallment(idx, 'amount', e.target.value)
            }
          />

          <div className="flex gap-1">
            {idx === installments.length - 1 && (
              <button
                type="button"
                onClick={addInstallment}
                className="bg-green-500 text-white px-2 rounded"
              >
                +
              </button>
            )}

            {installments.length > 1 && (
              <button
                type="button"
                onClick={() => removeInstallment(idx)}
                className="bg-red-500 text-white px-2 rounded"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}

      {/* TOTAL */}
      <div className="text-right text-sm text-gray-600 mt-2">
        Total:{' '}
        {installments
          .reduce((sum, i) => sum + Number(i.percentage || 0), 0)
          .toFixed(2)}
        %
      </div>

      {/* Remove Installments Button */}
      <div className="text-right mt-3">
        <button
          type="button"
          onClick={() => {
            setShowInstallments(false);
            setInstallments([]);
          }}
          className="text-red-500 text-sm hover:text-red-700"
        >
          Remove All Installments
        </button>
      </div>
    </>
  )}
</div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => navigate('/quatation-pending')}
              className="bg-gray-400 px-4 py-2 rounded text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Create Quotation
            </button>
          </div>
        </form>

        {openSingleProductPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-[600px] max-w-full max-h-[90vh] overflow-y-auto">
              <h3 className="font-semibold text-lg mb-4">Add Single Product</h3>

              {/* Category */}
              <select
                className="border px-3 py-2 rounded w-full mb-3"
                value={spCategory}
                onChange={(e) => {
                  setSpCategory(e.target.value);
                  fetchProductsByCategory(e.target.value);
                  setSpType('');
                  setSpBrand('');
                  setSpModel('');
                  setSpPrice(0);
                }}
              >
                <option value="">Select Subject</option>
                {categories.map((c) => (
                  <option key={c.cat_id} value={c.cat_id}>
                    {c.cat_name}
                  </option>
                ))}
              </select>

              {/* ACOUSTIC SPECIAL TERMS - ONLY FOR "Customised Acoustic Quotation" */}
              {spCategory &&
                categories.find((c) => c.cat_id == spCategory)?.cat_name ===
                  'Customised Acoustic Quotation' && (
                  <div className="border rounded bg-gray-50 p-4 space-y-3 mb-4">
                    <h2 className="font-semibold text-blue-600">
                      Acoustic Special Terms
                    </h2>

                    <div>
                      <label className="text-base font-semibold text-gray-500">
                        All Framing Will Be Done By
                      </label>
                      <select
                        className="border px-3 py-2 rounded w-full mt-1"
                        value={framingBy}
                        onChange={(e) => setFramingBy(e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="AV CORE">BY AV CORE</option>
                        <option value="THE CLIENT">BY THE CLIENT</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-gray-500">
                        Fabric & Floor Carpet Provided By
                      </label>
                      <select
                        className="border px-3 py-2 rounded w-full mt-1"
                        value={fabricBy}
                        onChange={(e) => setFabricBy(e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="AV CORE">BY AV CORE</option>
                        <option value="THE CLIENT">BY THE CLIENT</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-gray-500">
                        Ceiling Related Work Provided By
                      </label>
                      <select
                        className="border px-3 py-2 rounded w-full mt-1"
                        value={ceilingBy}
                        onChange={(e) => setCeilingBy(e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="AV CORE">BY AV CORE</option>
                        <option value="THE CLIENT">BY THE CLIENT</option>
                      </select>
                    </div>
                  </div>
                )}

              {/* Product Type */}
              <select
                className="border px-3 py-2 rounded w-full mb-3"
                value={spType}
                disabled={!productTypes.length}
                onChange={(e) => handleProductTypeChange(e.target.value)}
              >
                <option value="">Select Product Type</option>
                {productTypes.map((pt) => (
                  <option key={pt.product_type_id} value={pt.product_type_id}>
                    {pt.product_type_name}
                  </option>
                ))}
              </select>

              {/* Brand */}
              <select
                className="border px-3 py-2 rounded w-full mb-3"
                value={spBrand}
                disabled={!selectedPT?.brands?.length}
                onChange={(e) => handleBrandChange(e.target.value)}
              >
                <option value="">Select Brand</option>
                {selectedPT?.brands?.map((b) => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.brand_name}
                  </option>
                ))}
              </select>

              {/* Model */}
              <select
                className="border px-3 py-2 rounded w-full mb-3"
                value={spModel}
                disabled={!selectedBrand?.models?.length}
                onChange={(e) => handleModelChange(e.target.value)}
              >
                <option value="">Select Model</option>
                {(selectedBrand?.models || []).map((m) => (
                  <option key={m.model_id} value={m.model_id}>
                    {m.model_no}
                  </option>
                ))}
              </select>

              {/* Qty & Price */}
              {selectedSingleModel && (
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex flex-col">
                    <label className="font-medium text-sm">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      className="border px-3 py-2 rounded w-full"
                      value={spQty}
                      onChange={(e) => setSpQty(Number(e.target.value))}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-medium text-sm">Unit Price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="border px-3 py-2 rounded w-full"
                      value={spPrice}
                      onChange={(e) => setSpPrice(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedSingleModel?.description && (
                <div className="mb-3 text-sm text-gray-600 whitespace-pre-line">
                  {selectedSingleModel.description}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setOpenSingleProductPopup(false)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSingleProduct}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddQuotation;
