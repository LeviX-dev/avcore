import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config';
import logo from '../../images/logo/AVCoreLogo.png';

const EditQuotation = () => {
  const { qt_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const revision = location.state?.revision;

  const [installments, setInstallments] = useState([]);
  const [showInstallments, setShowInstallments] = useState(false);
  const [isEditLoaded, setIsEditLoaded] = useState(false);

  /* ================= STATE ================= */
  const [qtNumber, setQtNumber] = useState('');
  const [quoteType, setQuoteType] = useState('');
  const [queuedCategories, setQueuedCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [kits, setKits] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedKit, setSelectedKit] = useState('');
  const [selectedKitData, setSelectedKitData] = useState<any>(null);
  const [kitQty, setKitQty] = useState(1);

  const [additionalPrices, setAdditionalPrices] = useState([
    { add_price_name: '', price: '' },
  ]);
  const [leadName, setLeadName] = useState('');
  const [showInlineKit, setShowInlineKit] = useState(false);

  // Single Product Popup
  const [openSingleProductPopup, setOpenSingleProductPopup] = useState(false);
  const [spCategory, setSpCategory] = useState('');
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [spType, setSpType] = useState('');
  const [selectedPT, setSelectedPT] = useState<any>(null);
  const [spBrand, setSpBrand] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [spModel, setSpModel] = useState('');
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedSingleModel, setSelectedSingleModel] = useState<any>(null);
  const [spQty, setSpQty] = useState(1);
  const [spPrice, setSpPrice] = useState(0);
  const [gstBaseAmount, setGstBaseAmount] = useState<number>(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [acousticTerms, setAcousticTerms] = useState('');
  const [framingBy, setFramingBy] = useState('AV CORE');
  const [fabricBy, setFabricBy] = useState('THE CLIENT');
  const [ceilingBy, setCeilingBy] = useState('THE CLIENT');

  /* ================= TOTAL CALCULATION ================= */
  // MOVE THIS BEFORE ANY FUNCTION THAT USES IT
  const totalQuotationPrice =
    queuedCategories.reduce((sum, c) => sum + c.category_total, 0) +
    additionalPrices.reduce((sum, a) => sum + Number(a.price || 0), 0);
  
  const totalWithGST =
    quoteType === 'with_gst' ? totalQuotationPrice * 1.18 : totalQuotationPrice;

  /* ================= INSTALLMENT HANDLERS ================= */
  const initializeDefaultInstallment = () => {
    setShowInstallments(true);
    setInstallments([
      { description: 'Full Payment', percentage: 100, amount: Number(totalWithGST || 0) },
    ]);
  };

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
      0
    );

    if (totalPercent > 100) {
      alert('Total percentage cannot exceed 100%');
      return;
    }

    setInstallments(updated);
  };

  const addInstallment = () => {
    const totalPercent = installments.reduce(
      (sum, i) => sum + Number(i.percentage || 0),
      0
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

  const removeInstallment = (index) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  const removeAllInstallments = () => {
    setShowInstallments(false);
    setInstallments([]);
  };

  // Update installment amounts when total changes (only if installments exist)
  useEffect(() => {
    if (installments.length > 0 && totalWithGST > 0 && isEditLoaded) {
      const updatedInstallments = installments.map(inst => ({
        ...inst,
        amount: (totalWithGST * (inst.percentage / 100))
      }));
      setInstallments(updatedInstallments);
    }
  }, [totalWithGST, isEditLoaded]);

  /* ================= FETCH EXISTING QUOTATION ================= */
  useEffect(() => {
    fetchQuotationForEdit();
    fetchCategories();
  }, []);

  const fetchQuotationForEdit = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}api/quotation/${qt_id}/revision/${revision}`,
      );
      const q = res.data;

      if (!q) {
        console.error('No data found for this quotation', q);
        return;
      }

      // Check if installments exist in the database
      if (q.installments && q.installments.length > 0) {
        setInstallments(
          q.installments.map((i) => ({
            description: i.description || '',
            percentage: Number(i.percentage || 0),
            amount: Number(i.amount || 0),
          }))
        );
        setShowInstallments(true);
      } else {
        setInstallments([]);
        setShowInstallments(false);
      }
      
      setIsEditLoaded(true);

      setQtNumber(q.qt_number || '');
      setQuoteType(q.type || '');
      setLeadName(q.lead?.name || '');
      setAcousticTerms(q.acoustic_terms || '');

      const revToEdit = revision
        ? q.revisions.find((r: any) => r.revision === Number(revision))
        : q.revisions[q.revisions.length - 1];

      if (!revToEdit) {
        console.warn('Revision not found, defaulting to latest');
        return;
      }

      setGstBaseAmount(Number(revToEdit.gst_app_amt || 0));

      const prefilled: any[] = [];
      revToEdit.kits.forEach((kit: any) => {
        prefilled.push({
          cat_id: kit.cat_id || null,
          cat_name: kit.kit_name || 'Single Products',
          kit_id: kit.kit_id || null,
          kit_name: kit.kit_name || null,
          kit_qty: kit.kit_qty || 1,

          products: kit.items.map((p: any) => ({
            model_id: p.model_id,
            model: p.model,
            brand_name: p.brand_name,
            product_type_name: p.product_type_name,
            model_qty: Number(p.model_qty),
            model_price: Number(p.model_price),
            model_description: p.model_description,
          })),
          category_total: kit.items.reduce(
            (sum: number, p: any) =>
              sum + p.model_qty * p.model_price * (kit.kit_qty || 1),
            0,
          ),
        });
      });

      setQueuedCategories(prefilled);

      setAdditionalPrices(
        revToEdit.additional_prices?.length
          ? revToEdit.additional_prices.map((a: any) => ({
              add_price_name: a.add_price_name,
              price: Number(a.price || 0),
            }))
          : [{ add_price_name: '', price: 0 }],
      );
    } catch (error) {
      console.error('Failed to load quotation for edit', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/customised-categories`);
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  // Helper function to get category name
  const getCategoryName = (catId: string) => {
    const category = categories.find((c) => c.cat_id == catId);
    return category?.cat_name || '';
  };

  /* ================= HANDLERS ================= */
  const updateProduct = (
    catIdx: number,
    prodIdx: number,
    field: string,
    value: number,
  ) => {
    const copy = [...queuedCategories];
    copy[catIdx].products[prodIdx][field] = Number(value);
    recalcCategoryTotal(catIdx, copy);
    setQueuedCategories(copy);
  };

  const recalcCategoryTotal = (catIdx: number, data: any[]) => {
    data[catIdx].category_total = data[catIdx].products.reduce(
      (sum, p) => sum + p.model_qty * p.model_price * data[catIdx].kit_qty,
      0,
    );
  };

  const updateAdditionalPrice = (idx: number, field: string, value: any) => {
    const copy = [...additionalPrices];
    copy[idx][field] = value;
    setAdditionalPrices(copy);
  };

  const addAdditionalPriceRow = () =>
    setAdditionalPrices([
      ...additionalPrices,
      { add_price_name: '', price: '' },
    ]);

  const removeAdditionalPriceRow = (idx: number) =>
    setAdditionalPrices(additionalPrices.filter((_, i) => i !== idx));

  const toggleExpand = (idx: number) =>
    setExpandedIndex(expandedIndex === idx ? null : idx);

  const removeCategory = (idx: number) =>
    setQueuedCategories(queuedCategories.filter((_, i) => i !== idx));

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate installments only if they exist
    if (showInstallments && installments.length > 0) {
      const totalPercentage = installments.reduce(
        (sum, inst) => sum + Number(inst.percentage || 0),
        0
      );
      
      if (Math.abs(totalPercentage - 100) > 0.01) {
        alert(`Payment installment total must be 100%. Current total: ${totalPercentage.toFixed(2)}%`);
        return;
      }
      
      const hasEmptyDescription = installments.some(
        inst => !inst.description || inst.description.trim() === ''
      );
      
      if (hasEmptyDescription) {
        alert('Please enter description for all payment installments');
        return;
      }
    }

    const isAcoustic = queuedCategories.some(
      (q) => q.cat_name?.toLowerCase() === 'customised acoustic quotation',
    );

    const finalAcousticTerms = isAcoustic
      ? `ALL FRAMING WILL BE DONE BY ${framingBy}.
• FABRIC & FLOOR CARPET WILL BE PROVIDED BY ${fabricBy}.
• ALL CEILING-RELATED WORK WILL BE PROVIDED BY ${ceilingBy}.
• FABRIC STITCHING CHARGES WILL BE EXTRA AS PER THE DESIGN`
      : null;

    const payload = {
      type: quoteType,
      categories: queuedCategories,
      additional_prices: additionalPrices,
      gst_app_amt: quoteType === 'with_gst' ? gstBaseAmount : 0,
      gst_percent: 18,
      acoustic_terms: finalAcousticTerms,
      installments: showInstallments ? installments : [],
    };

    try {
      await axios.put(`${BASE_URL}api/quotation/${qt_id}`, payload);
      alert('Quotation updated successfully');
      navigate(-1);
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  /* ================= KIT LOGIC ================= */
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

  useEffect(() => {
    if (!selectedKit) {
      setSelectedKitData(null);
      return;
    }

    const kit = kits.find((k) => k.kit_id === Number(selectedKit));
    if (kit) {
      const mappedItems = kit.items.map((item: any) => ({
        ...item,
        prod_qty: item.qty,
        prod_price: item.price,
      }));
      setSelectedKitData({ ...kit, items: mappedItems });
    }
  }, [selectedKit, kits]);

  const handleAddKitToQuotation = () => {
    if (!selectedCategory || !selectedKitData) {
      alert('Please select a category and kit');
      return;
    }

    const products = selectedKitData.items.map((item: any) => ({
      model_id: item.model_id,
      model: item.model,
      brand_name: item.brand_name,
      product_type_name: item.product_type_name,
      model_description: item.model_description,
      model_qty: Number(item.prod_qty ?? item.qty),
      model_price: Number(item.prod_price ?? item.price),
    }));

    const newKit = {
      cat_id: selectedCategory,
      cat_name: getCategoryName(selectedCategory),
      kit_id: selectedKitData.kit_id,
      kit_name: selectedKitData.kit_name,
      kit_qty: Number(kitQty ?? 1),
      products,
      category_total:
        products.reduce((sum, p) => sum + p.model_qty * p.model_price, 0) *
        Number(kitQty ?? 1),
    };

    setQueuedCategories((prev) => [...prev, newKit]);
    resetInlineKit();
  };

  const resetInlineKit = () => {
    setSelectedCategory('');
    setSelectedKit('');
    setSelectedKitData(null);
    setKitQty(1);
    setShowInlineKit(false);
  };

  /* ================= SINGLE PRODUCT LOGIC ================= */
  const fetchProductsByCategory = async (cat_id: string) => {
    if (!cat_id) return;

    const res = await axios.get(`${BASE_URL}api/products/category/${cat_id}`);
    setProductTypes(res.data || []);

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

  const handleProductTypeChange = (ptId: string) => {
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

  const handleBrandChange = (brandId: string) => {
    const b = selectedPT?.brands?.find((b) => b.brand_id == brandId);
    setSelectedBrand(b || null);
    setSpBrand(brandId);
    setSpModel('');
    setSelectedModel(null);
    setSelectedSingleModel(null);
    setSpPrice(0);
  };

  const handleModelChange = (modelId: string) => {
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

  return (
    <div>
      <Breadcrumb pageName="Edit Quotation" />
      <div className="bg-white rounded shadow p-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        {/* HEADER SECTION */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
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
              Email: <span className="text-blue-600">avcoreindia@gmail.com</span>
            </p>
            <p className="text-[16px] font-bold text-black">
              Website: <span className="text-blue-600">www.avcore.in</span>
            </p>
            <p className="text-[12px] font-bold text-black uppercase">
              CO.NO: 8329728210 / 8766786026
            </p>
          </div>

          <div className="bg-black p-1">
            <img
              src={logo}
              className="w-28 h-auto border border-black"
              alt="Logo"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6 mt-6">
          {/* Quotation Type + Actions */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
            <div>
              <label className="font-medium block mb-1">Quotation Type</label>
              <select
                value={quoteType}
                onChange={(e) => setQuoteType(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">Select</option>
                <option value="with_gst">With GST</option>
                <option value="without_gst">Without GST</option>
              </select>
            </div>

            <div>
              <label className="font-medium block mb-1">
                GST Applicable Amount
              </label>
              <input
                type="number"
                value={gstBaseAmount}
                onChange={(e) => setGstBaseAmount(Number(e.target.value))}
                className="border px-3 py-2 rounded w-full"
                placeholder="Enter GST applicable amount"
                disabled={quoteType !== 'with_gst'}
              />
            </div>

            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded h-[42px]"
              onClick={() => setShowInlineKit(true)}
            >
              + Add Kit
            </button>

            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded h-[42px]"
              onClick={() => setOpenSingleProductPopup(true)}
            >
              + Add Product
            </button>
          </div>

          {/* KIT MODAL UNDER BUTTONS */}
          {showInlineKit && (
            <div className="border rounded bg-gray-50 p-4 space-y-4">
              <h4 className="font-semibold">Add New Kit</h4>

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

              {selectedCategory && getCategoryName(selectedCategory) === 'Customised Acoustic Quotation' && (
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
                      <option value="AV CORE">BY AV CORE</option>
                      <option value="THE CLIENT">BY THE CLIENT</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedCategory && (
                <div>
                  <label className="block mb-1 font-medium">Kit</label>
                  <select
                    className="w-full border px-4 py-2 rounded"
                    value={selectedKit}
                    onChange={(e) => setSelectedKit(e.target.value)}
                    disabled={!kits.length}
                  >
                    <option value="">Select kit</option>
                    {kits.map((k) => (
                      <option key={k.kit_id} value={k.kit_id}>
                        {k.kit_name} (₹{k.kit_price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedKit && (
                <div>
                  <label className="block mb-1 font-medium">Kit Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={kitQty}
                    onChange={(e) => setKitQty(Number(e.target.value))}
                    placeholder="Qty"
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
              )}

              {selectedKitData && (
                <div className="bg-yellow-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Kit Items</h4>
                  {selectedKitData.items.map((item: any, idx: number) => (
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
                      <div>
                        <b>Qty in Kit:</b> {item.prod_qty ?? item.qty}
                      </div>
                      <div>
                        <b>Unit Price:</b> ₹{item.prod_price ?? item.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInlineKit(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddKitToQuotation}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={!selectedKitData}
                >
                  Add to Quotation
                </button>
              </div>
            </div>
          )}

          {/* Quotation Items */}
          <div className="bg-gray-100 p-4 rounded">
            <h4 className="font-semibold mb-3">Quotation Items</h4>
            {queuedCategories.length === 0 ? (
              <div className="text-gray-500 italic text-sm">
                No items added yet
              </div>
            ) : (
              queuedCategories.map((cat, cIdx) => (
                <div key={cIdx} className="bg-white border rounded p-3 mb-3">
                  <div
                    className="flex justify-between items-center mb-2 cursor-pointer"
                    onClick={() => toggleExpand(cIdx)}
                  >
                    <div>
                      <b>{cat.kit_name || 'Single Product'}</b> | Qty:{' '}
                      {cat.kit_qty} | Total: ₹{cat.category_total.toFixed(2)}
                    </div>
                    <span
                      className={`transition-transform ${
                        expandedIndex === cIdx ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </div>

                  {expandedIndex === cIdx && (
                    <div className="mt-3 border-t pt-3 space-y-3">
                      {cat.products.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className="bg-gray-50 border rounded p-3 text-sm"
                        >
                          <div className="font-semibold">{p.model}</div>
                          <div>
                            <b>Brand:</b> {p.brand_name}
                          </div>
                          <div>
                            <b>Type:</b> {p.product_type_name}
                          </div>
                          {p.model_description && (
                            <div className="text-gray-600 whitespace-pre-line mt-1">
                              {p.model_description}
                            </div>
                          )}
                          <div className="mt-1">
                            <b>Qty in Kit:</b> {p.model_qty}
                          </div>
                          <div className="mt-1">
                            <b>Unit Price:</b> ₹{p.model_price}
                          </div>
                          <div className="mt-1">
                            <b>Kit Qty:</b> {cat.kit_qty}
                          </div>
                          <div className="text-green-700 font-semibold mt-2">
                            Total: ₹
                            {(
                              p.model_qty *
                              p.model_price *
                              cat.kit_qty
                            ).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeCategory(cIdx)}
                      className="text-red-500 font-bold text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Additional Charges */}
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-semibold mb-3">Additional Charges</h4>
            {additionalPrices.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2"
              >
                <input
                  className="border px-2 py-1 rounded"
                  placeholder="Name"
                  value={row.add_price_name}
                  onChange={(e) =>
                    updateAdditionalPrice(idx, 'add_price_name', e.target.value)
                  }
                />
                <input
                  type="number"
                  className="border px-2 py-1 rounded"
                  placeholder="Price"
                  value={row.price}
                  onChange={(e) =>
                    updateAdditionalPrice(idx, 'price', e.target.value)
                  }
                />
                <div className="flex gap-1">
                  {idx === additionalPrices.length - 1 && (
                    <button
                      type="button"
                      onClick={addAdditionalPriceRow}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      +
                    </button>
                  )}
                  {additionalPrices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAdditionalPriceRow(idx)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Single Product Popup */}
          {openSingleProductPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-[600px] max-w-full max-h-[90vh] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4">
                  Add Single Product
                </h3>

                <div className="mb-3">
                  <label className="block mb-1 font-medium">Subject</label>
                  <select
                    className="border px-3 py-2 rounded w-full"
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
                </div>

                {spCategory && getCategoryName(spCategory) === 'Customised Acoustic Quotation' && (
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
                        <option value="AV CORE">BY AV CORE</option>
                        <option value="THE CLIENT">BY THE CLIENT</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="block mb-1 font-medium">Product Type</label>
                  <select
                    className="border px-3 py-2 rounded w-full"
                    value={spType}
                    disabled={!productTypes.length}
                    onChange={(e) => handleProductTypeChange(e.target.value)}
                  >
                    <option value="">Select Product Type</option>
                    {productTypes.map((pt) => (
                      <option
                        key={pt.product_type_id}
                        value={pt.product_type_id}
                      >
                        {pt.product_type_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block mb-1 font-medium">Brand</label>
                  <select
                    className="border px-3 py-2 rounded w-full"
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
                </div>

                <div className="mb-3">
                  <label className="block mb-1 font-medium">Model</label>
                  <select
                    className="border px-3 py-2 rounded w-full"
                    value={spModel}
                    disabled={!selectedBrand?.models?.length}
                    onChange={(e) => handleModelChange(e.target.value)}
                  >
                    <option value="">Select Model</option>
                    {selectedBrand?.models?.map((m) => (
                      <option key={m.model_id} value={m.model_id}>
                        {m.model_no}
                      </option>
                    ))}
                  </select>
                </div>

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

                {selectedSingleModel?.description && (
                  <div className="mb-3 text-sm text-gray-600 whitespace-pre-line border p-2 rounded bg-gray-50">
                    <span className="font-medium">Description:</span>{' '}
                    {selectedSingleModel.description}
                  </div>
                )}

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
                    disabled={!spCategory || !selectedSingleModel}
                  >
                    Add Product
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="text-right bg-green-100 p-3 rounded font-semibold text-lg">
            TOTAL: ₹{totalWithGST.toFixed(2)}
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
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 mb-2 font-semibold text-gray-700">
                  <div>Description</div>
                  <div>Percent %</div>
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

                <div className="text-right text-sm text-gray-600 mt-2">
                  Total:{" "}
                  {installments.reduce(
                    (sum, i) => sum + Number(i.percentage || 0),
                    0
                  ).toFixed(2)}%
                </div>

                <div className="text-right mt-3">
                  <button
                    type="button"
                    onClick={removeAllInstallments}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove All Installments
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => navigate('/quatation-pending')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Update Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuotation;