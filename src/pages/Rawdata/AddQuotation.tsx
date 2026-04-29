import { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaCopy } from 'react-icons/fa';
import logo from '../../images/logo/AVCoreLogo.png';

// ─── helpers ────────────────────────────────────────────────
const emptyOption = (index = 0) => ({
  option_name: `OPTION ${index + 1}`,
  items: [],
  additional_prices: [{ add_price_name: '', price: '' }],
  gst_app_amt: '',
  final_offer: { description: 'FINAL BEST OFFER', percentage: 0, amount: 0 },
  show_final_offer: false,
});

const calcOptionTotals = (option, quoteType) => {
  const subtotal = option.items.reduce((s, c) => s + Number(c.category_total || 0), 0);
  const additionalTotal = option.additional_prices.reduce((s, a) => s + (Number(a.price) || 0), 0);
  const totalWithoutGST = subtotal + additionalTotal;
  const gstAmount =
    quoteType === 'with_gst' && Number(option.gst_app_amt) > 0
      ? Number(option.gst_app_amt) * 0.18
      : 0;
  const totalWithGST = totalWithoutGST + gstAmount;
  const discountAmount =
    option.show_final_offer && option.final_offer.percentage > 0
      ? (totalWithGST * option.final_offer.percentage) / 100
      : 0;
  const discountedTotal = totalWithGST - discountAmount;
  return { subtotal, additionalTotal, totalWithoutGST, gstAmount, totalWithGST, discountAmount, discountedTotal };
};

// ─── main component ─────────────────────────────────────────
const AddQuotation = () => {
  const { master_id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const leadName    = state?.name    || master_id;
  const leadContact = state?.number  || state?.contact || 'N/A';
  const leadCity    = state?.city    || state?.address  || 'N/A';
  const leadAddress = state?.address || '';

  // ── global states ──
  const [quoteType, setQuoteType] = useState('with_gst');
  
  // ── installments with option selection ──
  const [installmentsConfig, setInstallmentsConfig] = useState([]);
  const [showInstallmentsPanel, setShowInstallmentsPanel] = useState(false);
  const [globalInstallmentRows, setGlobalInstallmentRows] = useState([]);

  // ── options state ──
  const [options, setOptions]           = useState([emptyOption(0)]);
  const [activeOptionIdx, setActiveOptionIdx] = useState(0);

  // ── kit/product selection (per active option) ──
  const [categories, setCategories]         = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [kits, setKits]                     = useState([]);
  const [selectedKit, setSelectedKit]       = useState('');
  const [selectedKitData, setSelectedKitData] = useState(null);
  const [kitQty, setKitQty]                 = useState(1);
  const [expandedIndex, setExpandedIndex]   = useState(null);

  // kit edit mode
  const [editKitMode, setEditKitMode]         = useState(false);
  const [tempKitItems, setTempKitItems]       = useState([]);
  const [replaceProductIndex, setReplaceProductIndex] = useState(null);
  const [isReplaceMode, setIsReplaceMode]     = useState(false);

  // acoustic
  const [framingBy, setFramingBy] = useState('');
  const [fabricBy, setFabricBy]   = useState('');
  const [ceilingBy, setCeilingBy] = useState('');

  // single product popup
  const [openSingleProductPopup, setOpenSingleProductPopup] = useState(false);
  const [spCategory, setSpCategory]   = useState('');
  const [productTypes, setProductTypes] = useState([]);
  const [spType, setSpType]           = useState('');
  const [selectedPT, setSelectedPT]   = useState(null);
  const [spBrand, setSpBrand]         = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [spModel, setSpModel]         = useState('');
  const [selectedSingleModel, setSelectedSingleModel] = useState(null);
  const [spQty, setSpQty]             = useState(1);
  const [spPrice, setSpPrice]         = useState(0);

  // master additional charges
  const [masterAdditionalCharges, setMasterAdditionalCharges] = useState([]);
  const [selectedMasterCharges, setSelectedMasterCharges]     = useState({});

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const [subject, setSubject] = useState('');



  // ── fetch data ──
  useEffect(() => {
    axios.get(`${BASE_URL}api/customised-categories`).then(r => setCategories(r.data || []));
    axios.get(`${BASE_URL}api/additional-charges`).then(r => {
      setMasterAdditionalCharges((r.data || []).filter(c => c.status === 'active'));
    });
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    axios.get(`${BASE_URL}api/category-products-kits/${selectedCategory}`).then(r => {
      setKits(r.data.kits || []);
      setSelectedKit(''); setSelectedKitData(null); setKitQty(1);
    });
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedKit) { setSelectedKitData(null); return; }
    const kit = kits.find(k => k.kit_id === Number(selectedKit));
    if (kit) {
      setSelectedKitData({ ...kit, items: kit.items.map(i => ({ ...i, prod_qty: i.qty, prod_price: i.price })) });
    }
  }, [selectedKit, kits]);

  // ── option helpers ──
  const updateOption = (idx, updater) => {
    setOptions(prev => {
      const copy = [...prev];
      copy[idx] = typeof updater === 'function' ? updater(copy[idx]) : { ...copy[idx], ...updater };
      return copy;
    });
  };

  const addOption = () => {
    const newOpt = emptyOption(options.length);
    setOptions(prev => [...prev, newOpt]);
    setActiveOptionIdx(options.length);
    resetKitSelection();
  };

  const duplicateOption = (idx) => {
    const clone = JSON.parse(JSON.stringify(options[idx]));
    clone.option_name = `OPTION ${options.length + 1}`;
    setOptions(prev => [...prev, clone]);
    setActiveOptionIdx(options.length);
  };

  const removeOption = (idx) => {
    if (options.length === 1) { alert('At least one option is required'); return; }
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    setActiveOptionIdx(Math.min(activeOptionIdx, updated.length - 1));
  };

  const resetKitSelection = () => {
    setSelectedCategory(''); setSelectedKit(''); setSelectedKitData(null); setKitQty(1);
    setEditKitMode(false); setTempKitItems([]);
  };

  // ── kit edit ──
  const enableKitEdit = () => {
    if (selectedKitData) { setTempKitItems([...selectedKitData.items]); setEditKitMode(true); }
  };
  const saveKitChanges = () => {
    setSelectedKitData(prev => ({ ...prev, items: tempKitItems }));
    setEditKitMode(false); setTempKitItems([]);
  };
  const cancelKitEdit = () => { setEditKitMode(false); setTempKitItems([]); };
  const removeKitItem = (i) => setTempKitItems(prev => prev.filter((_, j) => j !== i));
  const openReplaceProductPopup = (i) => { setReplaceProductIndex(i); setIsReplaceMode(true); setOpenSingleProductPopup(true); };

  // ── add kit to active option ──
  const handleAddCategory = () => {
    if (!selectedCategory || !selectedKitData) { alert('Please select category and kit'); return; }
    const kitItems = editKitMode ? tempKitItems : selectedKitData.items;
    const kitTotal = kitItems.reduce((s, i) => s + (i.prod_qty ?? i.qty) * (i.prod_price ?? i.price), 0);
    const catObj = {
      cat_id: selectedCategory,
      cat_name: categories.find(c => c.cat_id === Number(selectedCategory))?.cat_name || '',
      kit_id: selectedKit,
      kit_name: selectedKitData.kit_name,
      kit_qty: kitQty,
      products: kitItems.map(i => ({
        model_id: i.model_id, model: i.model,
        brand_name: i.brand_name, product_type_name: i.product_type_name,
        model_description: i.model_description,
        model_qty: Number(i.prod_qty ?? i.qty),
        model_price: Number(i.prod_price ?? i.price),
      })),
      category_total: kitTotal * Number(kitQty),
    };
    updateOption(activeOptionIdx, opt => ({ ...opt, items: [...opt.items, catObj] }));
    resetKitSelection();
  };

  // ── additional prices ──
  const addAdditionalPriceRow = (optIdx) =>
    updateOption(optIdx, opt => ({ ...opt, additional_prices: [...opt.additional_prices, { add_price_name: '', price: '' }] }));

  const removeAdditionalPriceRow = (optIdx, rowIdx) =>
    updateOption(optIdx, opt => ({
      ...opt,
      additional_prices: opt.additional_prices.length > 1
        ? opt.additional_prices.filter((_, i) => i !== rowIdx)
        : [{ add_price_name: '', price: '' }],
    }));

  const updateAdditionalPrice = (optIdx, rowIdx, field, value) =>
    updateOption(optIdx, opt => {
      const copy = [...opt.additional_prices];
      copy[rowIdx] = { ...copy[rowIdx], [field]: value };
      return { ...opt, additional_prices: copy };
    });

  // ── master charge toggle per option ──
  const handleMasterChargeToggle = (optIdx, charge) => {
    const key = `${optIdx}`;
    const current = selectedMasterCharges[key] || [];
    const exists = current.find(c => c.charge_id === charge.charge_id);
    let updated;
    if (exists) {
      updated = current.filter(c => c.charge_id !== charge.charge_id);
      updateOption(optIdx, opt => ({
        ...opt, additional_prices: opt.additional_prices.filter(p => p.add_price_name !== charge.charge_name),
      }));
    } else {
      updated = [...current, charge];
      updateOption(optIdx, opt => {
        if (opt.additional_prices.some(p => p.add_price_name === charge.charge_name)) return opt;
        return { ...opt, additional_prices: [...opt.additional_prices, { add_price_name: charge.charge_name, price: charge.price }] };
      });
    }
    setSelectedMasterCharges(prev => ({ ...prev, [key]: updated }));
  };

  const isMasterChargeSelected = (optIdx, chargeId) =>
    (selectedMasterCharges[`${optIdx}`] || []).some(c => c.charge_id === chargeId);

  // ── final offer ──
  const updateFinalOffer = (optIdx, field, value) => {
    updateOption(optIdx, opt => {
      const totals = calcOptionTotals(opt, quoteType);
      let fo = { ...opt.final_offer };
      if (field === 'percentage') {
        let p = Math.min(100, Math.max(0, Number(value) || 0));
        fo = { ...fo, percentage: p, amount: Math.round((totals.totalWithGST * p) / 100) };
      } else if (field === 'amount') {
        let a = Math.min(totals.totalWithGST, Math.max(0, Number(value) || 0));
        fo = { ...fo, amount: a, percentage: totals.totalWithGST ? Math.round((a / totals.totalWithGST) * 100) : 0 };
      } else {
        fo = { ...fo, [field]: value };
      }
      return { ...opt, final_offer: fo };
    });
  };

  // ── INSTALLMENTS with option checkboxes ──
  const initializeInstallments = () => {
    const baseInstallmentRows = [{ description: 'Full Payment', percentage: 100, amount: 0 }];
    setGlobalInstallmentRows(baseInstallmentRows);
    
    // Initialize config for all options
    const config = options.map((opt, idx) => ({
      option_index: idx,
      option_name: opt.option_name,
      selected: idx === 0, // Default select first option
      installments: JSON.parse(JSON.stringify(baseInstallmentRows))
    }));
    setInstallmentsConfig(config);
    setShowInstallmentsPanel(true);
  };

  const updateGlobalInstallmentRow = (idx, field, value) => {
    const updatedRows = [...globalInstallmentRows];
    const totals = calcOptionTotals(options[activeOptionIdx], quoteType);
    const base = totals.discountedTotal;
    
    if (field === 'percentage') {
      const p = Number(value);
      updatedRows[idx] = { ...updatedRows[idx], percentage: p, amount: Math.round((base * p) / 100) };
    } else if (field === 'amount') {
      const a = Number(value);
      updatedRows[idx] = { ...updatedRows[idx], amount: a, percentage: base ? Math.round((a / base) * 100) : 0 };
    } else {
      updatedRows[idx] = { ...updatedRows[idx], [field]: value };
    }
    
    // Validate total percentage
    const totalPercent = updatedRows.reduce((s, i) => s + Number(i.percentage || 0), 0);
    if (totalPercent > 100) {
      alert('Total percentage cannot exceed 100%');
      return;
    }
    
    setGlobalInstallmentRows(updatedRows);
    
    // Update all selected options with the new installment structure
    setInstallmentsConfig(prev => prev.map(cfg => ({
      ...cfg,
      installments: updatedRows.map(row => ({ ...row }))
    })));
  };

  const addGlobalInstallmentRow = () => {
    if (globalInstallmentRows.reduce((s, i) => s + Number(i.percentage || 0), 0) >= 100) {
      alert('Already reached 100%');
      return;
    }
    const newRow = { description: '', percentage: 0, amount: 0 };
    const updatedRows = [...globalInstallmentRows, newRow];
    setGlobalInstallmentRows(updatedRows);
    
    // Update all selected options
    setInstallmentsConfig(prev => prev.map(cfg => ({
      ...cfg,
      installments: updatedRows.map(row => ({ ...row }))
    })));
  };

  const removeGlobalInstallmentRow = (idx) => {
    if (globalInstallmentRows.length <= 1) {
      alert('At least one installment is required');
      return;
    }
    const updatedRows = globalInstallmentRows.filter((_, i) => i !== idx);
    setGlobalInstallmentRows(updatedRows);
    
    setInstallmentsConfig(prev => prev.map(cfg => ({
      ...cfg,
      installments: updatedRows.map(row => ({ ...row }))
    })));
  };

  const toggleOptionInstallment = (optionIdx) => {
    setInstallmentsConfig(prev => prev.map(cfg => 
      cfg.option_index === optionIdx 
        ? { ...cfg, selected: !cfg.selected }
        : cfg
    ));
  };

  const selectAllOptionsForInstallments = () => {
    setInstallmentsConfig(prev => prev.map(cfg => ({ ...cfg, selected: true })));
  };

  const deselectAllOptionsForInstallments = () => {
    setInstallmentsConfig(prev => prev.map(cfg => ({ ...cfg, selected: false })));
  };

  // ── single product popup ──
  const fetchProductsByCategory = async (catId) => {
    if (!catId) return;
    const res = await axios.get(`${BASE_URL}api/products/category/${catId}`);
    setProductTypes(res.data || []);
    setSelectedPT(null); setSpType(''); setSelectedBrand(null);
    setSpBrand(''); setSpModel(''); setSelectedSingleModel(null); setSpPrice(0); setSpQty(1);
  };

  const handleAddSingleProduct = () => {
    if (isReplaceMode && replaceProductIndex !== null) {
      const updated = [...tempKitItems];
      updated[replaceProductIndex] = {
        ...updated[replaceProductIndex],
        model_id: selectedSingleModel.model_id,
        model: selectedSingleModel.model_no,
        brand_name: selectedBrand?.brand_name || '',
        product_type_name: selectedPT?.product_type_name || '',
        model_description: selectedSingleModel.description,
        prod_qty: spQty,
        prod_price: spPrice || selectedSingleModel.price,
      };
      setTempKitItems(updated);
      setIsReplaceMode(false); setReplaceProductIndex(null); setOpenSingleProductPopup(false);
      resetSpSelections(); return;
    }
    if (!spCategory || !selectedSingleModel) { alert('Please select a category and product model'); return; }
    const category = categories.find(c => c.cat_id == spCategory);
    const productObj = {
      cat_id: spCategory, cat_name: category?.cat_name || '',
      kit_id: null, kit_name: null, kit_qty: 1,
      products: [{
        model_id: selectedSingleModel.model_id, model: selectedSingleModel.model_no,
        brand_name: selectedBrand?.brand_name || '', product_type_name: selectedPT?.product_type_name || '',
        model_description: selectedSingleModel.description,
        model_qty: Number(spQty), model_price: Number(spPrice || selectedSingleModel.price),
      }],
      category_total: Number(spQty) * Number(spPrice || selectedSingleModel.price),
    };
    updateOption(activeOptionIdx, opt => ({ ...opt, items: [...opt.items, productObj] }));
    setOpenSingleProductPopup(false); resetSpSelections();
  };

  const resetSpSelections = () => {
    setSpCategory(''); setSpType(''); setSelectedPT(null); setSpBrand('');
    setSelectedBrand(null); setSpModel(''); setSelectedSingleModel(null); setSpQty(1); setSpPrice(0);
  };

  // ── submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const opt of options) {
      if (!opt.items.length) { alert(`${opt.option_name} has no items. Please add at least one kit or product.`); return; }
    }
    
    // Validate installments if enabled
    if (showInstallmentsPanel && installmentsConfig.length > 0) {
      const selectedOptions = installmentsConfig.filter(cfg => cfg.selected);
      if (selectedOptions.length === 0) {
        alert('Please select at least one option for payment installments');
        return;
      }
      
      // Validate each selected option's installments
      for (const cfg of selectedOptions) {
        const total = cfg.installments.reduce((s, i) => s + Number(i.percentage || 0), 0);
        if (Math.abs(total - 100) > 0.01) {
          alert(`${cfg.option_name}: Installment total must be 100%. Current: ${total.toFixed(0)}%`);
          return;
        }
        if (cfg.installments.some(i => !i.description?.trim())) {
          alert(`${cfg.option_name}: All installments need a description`);
          return;
        }
      }
    }
    
    const isAcoustic = options.some(o => o.items.some(i => i.cat_name?.toLowerCase() === 'customised acoustic quotation'));
    if (isAcoustic && (!framingBy || !fabricBy || !ceilingBy)) { alert('Please select all Acoustic options'); return; }
    const acousticTerms = framingBy && fabricBy && ceilingBy
      ? `ALL FRAMING WILL BE DONE BY ${framingBy}.\n• FABRIC & FLOOR CARPET WILL BE PROVIDED BY ${fabricBy}\n• ALL CEILING-RELATED WORK WILL BE PROVIDED BY ${ceilingBy}.\n• FABRIC STITCHING CHARGES WILL BE EXTRA AS PER THE DESIGN`
      : null;

    const payload = {
      type: quoteType,
      master_id,
        subject: subject,  // Add this line
      acoustic_terms: acousticTerms,
      installments_config: showInstallmentsPanel ? installmentsConfig.map(cfg => ({
        option_index: cfg.option_index,
        option_name: cfg.option_name,
        selected: cfg.selected,
        installments: cfg.selected ? cfg.installments : []
      })) : [],
      options: options.map(opt => ({
        option_name: opt.option_name,
        items: opt.items.map(item => ({
          cat_id: item.cat_id,
          kit_id: item.kit_id || null,
          kit_qty: item.kit_id ? Number(item.kit_qty || 1) : 1,
          products: item.products.map(p => ({
            model_id: p.model_id, model_qty: Number(p.model_qty || 1), model_price: Number(p.model_price || 0),
          })),
        })),
        additional_prices: opt.additional_prices.filter(a => a.add_price_name && a.price),
        gst_percent: 18,
        gst_app_amt: quoteType === 'with_gst' ? Number(opt.gst_app_amt || 0) : 0,
        final_offer: opt.show_final_offer && opt.final_offer.percentage > 0 ? {
          description: opt.final_offer.description,
          percentage: Number(opt.final_offer.percentage || 0),
          amount: Number(opt.final_offer.amount || 0),
          is_default: 0,
        } : null,
      })),
    };

    try {
      await axios.post(`${BASE_URL}api/quotation`, payload, { withCredentials: true });
      alert('Quotation created successfully ✅');
      navigate('/quatation-pending');
    } catch (err) {
      console.error(err); alert('Failed to create quotation ❌');
    }
  };

  const activeOption = options[activeOptionIdx] || emptyOption(0);
  const activeTotals = calcOptionTotals(activeOption, quoteType);

  // Options summary for the tabular display
  const optionsSummary = options.map((opt, idx) => {
    const totals = calcOptionTotals(opt, quoteType);
    const finalPrice = opt.show_final_offer && opt.final_offer.percentage > 0 
      ? totals.discountedTotal 
      : totals.totalWithGST;
    const kitNames = opt.items.map(item => item.kit_name).filter(Boolean).join(', ') || 'Single Products';
    return {
      option_index: idx,
      option_name: opt.option_name,
      kit_names: kitNames,
      original_total: totals.totalWithGST,
      discount_amount: totals.discountAmount,
      finalized_total: finalPrice,
      has_installments: showInstallmentsPanel && installmentsConfig.find(c => c.option_index === idx)?.selected || false
    };
  });

  const overallFinalizedTotal = optionsSummary.reduce((sum, opt) => sum + opt.finalized_total, 0);

  return (
    <div>
      <Breadcrumb pageName="Create Quotation" />
      <div className="bg-white rounded shadow p-6 max-w-5xl mx-auto">

        {/* back */}
        <div className="mb-4">
          <button type="button" onClick={() => navigate('/quatation-pending')}
            className="bg-gray-400 px-4 py-2 rounded text-white flex items-center gap-2 hover:bg-gray-500 transition">
            <FaArrowLeft /> Back
          </button>
        </div>

        {/* company header */}
        <div className="flex justify-between items-start mb-8 border-b pb-4">
          <div className="flex flex-col text-left leading-tight">
            <h1 className="text-4xl font-bold text-[#7d20a0] underline decoration-[#7d20a0] decoration-4 underline-offset-4 mb-2">AV CORE</h1>
            <p className="font-bold text-[13px] text-black uppercase mb-1">ALL ABOUT AUDIO VIDEO</p>
            <p className="text-[12px] font-bold text-black uppercase">1ST FLOOR GAYATRI BUILDING, BESIDE JUPITER HOSPITAL, BANER 411045, PUNE.</p>
            <p className="text-[16px] font-bold text-black">Email: <span className="text-blue-600">avcoreindia@gmail.com</span></p>
            <p className="text-[16px] font-bold text-black">Website: <span className="text-blue-600">www.avcore.in</span></p>
            <p className="text-[12px] font-bold text-black uppercase">CO.NO: 8329728210 / 8766786026</p>
          </div>
          <div className="bg-black p-1"><img src={logo} className="w-28 h-auto border border-black" alt="Logo" /></div>
        </div>

        {/* client info */}
        <div className="border-2 border-black mt-4 text-[14px]">
          <div className="flex justify-between px-4 py-2 border-b border-black">
            <p><span className="font-bold text-black">NAME :</span> <span className="text-gray-800">{leadName}</span></p>
            <p><span className="font-bold text-black">CONTACT :</span> <span className="text-gray-800">{leadContact}</span></p>
          </div>
          <div className="flex justify-between px-4 py-2">
            <p><span className="font-bold text-black">DATE :</span> <span className="text-gray-800">{formattedDate}</span></p>
            <p><span className="font-bold text-black">ADDRESS :</span> <span className="text-gray-800">{leadAddress ? `${leadAddress}, ${leadCity}` : leadCity}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-9">

          {/* ═══════════════════════════════════════════
              QUOTATION TYPE & GST APPLICABLE AMOUNT IN ONE LINE
          ═══════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Quotation Type</label>
              <select className="w-full border px-4 py-2 rounded" value={quoteType}
                onChange={e => { setQuoteType(e.target.value); }}>
                <option value="with_gst">With GST</option>
                <option value="without_gst">Without GST</option>
              </select>
            </div>
            {quoteType === 'with_gst' && (
              <div>
                <label className="block mb-1 font-medium">GST Applicable Amount (for {activeOption.option_name})</label>
                <input type="number" min="0" step="0.01"
                  value={activeOption.gst_app_amt}
                  onChange={e => updateOption(activeOptionIdx, { gst_app_amt: e.target.value })}
                  className="border px-4 py-2 rounded w-full"
                  placeholder="Enter GST applicable amount" />
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════
              OPTION TABS
          ═══════════════════════════════════════════ */}
          <div className="mt-6">
            <div className="flex items-center gap-2 border-b-2 border-gray-200 mb-4 flex-wrap">
              {options.map((opt, idx) => (
                <button key={idx} type="button"
                  onClick={() => { setActiveOptionIdx(idx); resetKitSelection(); setExpandedIndex(null); }}
                  className={`px-4 py-2 rounded-t-lg text-sm font-semibold border-t-2 border-l-2 border-r-2 transition-all ${
                    activeOptionIdx === idx
                      ? 'bg-white border-blue-500 text-blue-700 -mb-[2px]'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {opt.option_name}
                </button>
              ))}
              <button type="button" onClick={addOption}
                className="px-3 py-2 rounded-t-lg text-sm font-semibold bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200 flex items-center gap-1">
                <FaPlus size={10} /> Add Option
              </button>
            </div>

            {/* active option panel */}
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">

              {/* option header controls */}
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={activeOption.option_name}
                    onChange={e => updateOption(activeOptionIdx, { option_name: e.target.value })}
                    className="border px-3 py-1.5 rounded font-semibold text-blue-800 bg-white w-60"
                    placeholder="Option name"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => duplicateOption(activeOptionIdx)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200">
                    <FaCopy size={11} /> Duplicate
                  </button>
                  {options.length > 1 && (
                    <button type="button" onClick={() => removeOption(activeOptionIdx)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200">
                      <FaTrash size={11} /> Remove Option
                    </button>
                  )}
                </div>
              </div>

              {/* ── kit / category selection (Add Products to OPTION X) ── */}
              <div className="bg-white border rounded p-4 mb-4">
                <h4 className="font-semibold mb-3 text-gray-700">Add Products to {activeOption.option_name}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Subject From Master</label>
                    <select className="w-full border px-3 py-2 rounded" value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}>
                      <option value="">Select Subject</option>
                      {categories.map(c => <option key={c.cat_id} value={c.cat_id}>{c.cat_name}</option>)}
                    </select>
                  </div> 
                  <div className="mb-4">
  <label className="block mb-1 font-medium text-sm">Subject</label>
  <input 
    type="text" 
    className="w-full border px-4 py-2 rounded" 
    placeholder="Enter quotation subject for view "
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
  />
</div>

                  <div>
                    <label className="block mb-1 font-medium text-sm">Kit</label>
                    <select className="w-full border px-3 py-2 rounded" value={selectedKit}
                      onChange={e => setSelectedKit(e.target.value)}>
                      <option value="">Select kit</option>
                      {kits.map(k => <option key={k.kit_id} value={k.kit_id}>{k.kit_name} (₹{k.kit_price})</option>)}
                    </select>
                  </div>
                </div>

                {/* acoustic terms */}
                {selectedCategory && categories.find(c => c.cat_id === Number(selectedCategory))?.cat_name === 'Customised Acoustic Quotation' && (
                  <div className="border rounded bg-gray-50 p-4 space-y-3 mb-3">
                    <h2 className="font-semibold text-blue-600">Acoustic Special Terms</h2>
                    {[
                      { label: 'Framing By', value: framingBy, setter: setFramingBy },
                      { label: 'Fabric & Floor Carpet By', value: fabricBy, setter: setFabricBy },
                      { label: 'Ceiling Work By', value: ceilingBy, setter: setCeilingBy }
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="text-sm font-semibold text-gray-500">{label}</label>
                        <select 
                          className="border px-3 py-2 rounded w-full mt-1" 
                          value={value} 
                          onChange={e => setter(e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="AV CORE">BY AV CORE</option>
                          <option value="THE CLIENT">BY THE CLIENT</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="font-medium text-sm block mb-1">Kit Quantity</label>
                    <input type="number" min={1} value={kitQty}
                      onChange={e => setKitQty(Math.max(1, Number(e.target.value)))}
                      className="border px-3 py-2 rounded w-full" />
                  </div>
                  <div>
                    <button type="button"
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm mt-6"
                      onClick={() => { setIsReplaceMode(false); setOpenSingleProductPopup(true); }}>
                      Add Single Product
                    </button>
                  </div>
                </div>

                {/* kit items preview */}
                {selectedKitData && (
                  <div className="bg-yellow-50 p-3 rounded mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Kit Items Preview</h4>
                      {!editKitMode && (
                        <button type="button" onClick={enableKitEdit}
                          className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600">
                          Edit Kit Products
                        </button>
                      )}
                    </div>
                    {(editKitMode ? tempKitItems : selectedKitData.items).map((item, idx) => (
                      <div key={idx} className="bg-white p-2 mb-2 border rounded text-xs">
                        <div><b>Product:</b> {item.product_type_name} | <b>Brand:</b> {item.brand_name} | <b>Model:</b> {item.model}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span><b>Qty:</b></span>
                          <input type="number" min={1} value={editKitMode ? item.prod_qty : (item.prod_qty ?? item.qty)}
                            className="border px-2 py-0.5 rounded w-16 text-xs"
                            onChange={e => {
                              if (editKitMode) { const u = [...tempKitItems]; u[idx].prod_qty = Number(e.target.value); setTempKitItems(u); }
                              else { const u = { ...selectedKitData }; u.items[idx].prod_qty = Number(e.target.value); setSelectedKitData(u); }
                            }} />
                          <span><b>Price:</b></span>
                          <input type="number" min={0} step="0.01" value={editKitMode ? item.prod_price : (item.prod_price ?? item.price)}
                            className="border px-2 py-0.5 rounded w-24 text-xs"
                            onChange={e => {
                              if (editKitMode) { const u = [...tempKitItems]; u[idx].prod_price = Number(e.target.value); setTempKitItems(u); }
                              else { const u = { ...selectedKitData }; u.items[idx].prod_price = Number(e.target.value); setSelectedKitData(u); }
                            }} />
                        </div>
                        {editKitMode && (
                          <div className="flex gap-2 mt-1">
                            <button type="button" onClick={() => removeKitItem(idx)} className="text-red-500 text-xs">🗑️ Remove</button>
                            <button type="button" onClick={() => openReplaceProductPopup(idx)} className="text-blue-500 text-xs">🔄 Replace</button>
                          </div>
                        )}
                      </div>
                    ))}
                    {editKitMode && (
                      <div className="flex gap-2 mt-2">
                        <button type="button" onClick={saveKitChanges} className="bg-green-600 text-white px-3 py-1 rounded text-sm">✓ Save</button>
                        <button type="button" onClick={cancelKitEdit} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">✗ Cancel</button>
                      </div>
                    )}
                    <div className="text-right font-semibold text-sm bg-green-100 text-green-800 px-3 py-1 rounded mt-2">
                      Kit Cost (×{kitQty}): ₹{Math.round(
                        (editKitMode ? tempKitItems : selectedKitData.items).reduce(
                          (s, i) => s + (i.prod_qty ?? i.qty) * (i.prod_price ?? i.price), 0
                        ) * kitQty
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {selectedKitData && (
                    <button type="button" onClick={handleAddCategory}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                      Add Kit to {activeOption.option_name}
                    </button>
                  )}
                </div>
              </div>

              {/* ── queued items for this option ── */}
              {activeOption.items.length > 0 && (
                <div className="bg-gray-100 p-3 rounded mb-4">
                  <h4 className="font-semibold mb-2 text-sm">Items in {activeOption.option_name}</h4>
                  {activeOption.items.map((item, i) => (
                    <div key={i} className="p-2 border rounded bg-white mb-2">
                      <div className="flex justify-between items-center cursor-pointer"
                        onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}>
                        <div className="text-sm">
                          <b>Kit:</b> {item.kit_name || 'Single Product'} | <b>Qty:</b> {item.kit_qty} | <b>Total:</b> ₹{Math.round(item.category_total || 0)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`transition-transform text-xs ${expandedIndex === i ? 'rotate-180' : ''}`}>▼</span>
                          <button type="button" onClick={ev => { ev.stopPropagation(); updateOption(activeOptionIdx, opt => ({ ...opt, items: opt.items.filter((_, j) => j !== i) })); }}
                            className="text-red-500 text-xs font-bold">✕ Remove</button>
                        </div>
                      </div>
                      {expandedIndex === i && (
                        <div className="mt-2 border-t pt-2 space-y-2">
                          {item.products.map((p, pi) => (
                            <div key={pi} className="bg-gray-50 border rounded p-2 text-xs">
                              <div className="font-semibold">{p.model}</div>
                              <div><b>Brand:</b> {p.brand_name} | <b>Type:</b> {p.product_type_name}</div>
                              <div><b>Qty:</b> {p.model_qty} | <b>Unit Price:</b> ₹{p.model_price} | <b>Kit Qty:</b> {item.kit_qty}</div>
                              <div className="text-green-700 font-semibold">Total: ₹{Math.round(p.model_qty * p.model_price * item.kit_qty)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── additional charges ── */}
              <div className="bg-blue-50 p-3 rounded mb-4">
                <h4 className="font-semibold mb-2 text-sm">Additional Charges — {activeOption.option_name}</h4>
                {masterAdditionalCharges.length > 0 && (
                  <div className="mb-3 p-2 bg-white rounded border border-blue-200">
                    <label className="font-medium text-xs text-gray-700 block mb-2">Select from Master List:</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {masterAdditionalCharges.map(charge => (
                        <label key={charge.charge_id} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox"
                            checked={isMasterChargeSelected(activeOptionIdx, charge.charge_id)}
                            onChange={() => handleMasterChargeToggle(activeOptionIdx, charge)}
                            className="w-4 h-4 text-blue-600 rounded" />
                          <span className="text-xs font-medium text-gray-700">{charge.charge_name}</span>
                          <span className="text-xs font-semibold text-green-600">(₹{Number(charge.price).toLocaleString()})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <label className="font-medium text-xs text-gray-700 block mb-2">Manual Additional Charges:</label>
                {activeOption.additional_prices.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                    <input className="border px-2 py-1 rounded text-sm" placeholder="Name"
                      value={row.add_price_name}
                      onChange={e => updateAdditionalPrice(activeOptionIdx, idx, 'add_price_name', e.target.value)} />
                    <input type="number" min="0" step="0.01" className="border px-2 py-1 rounded text-sm" placeholder="Price"
                      value={row.price}
                      onChange={e => updateAdditionalPrice(activeOptionIdx, idx, 'price', e.target.value)} />
                    <div className="flex gap-1">
                      {idx === activeOption.additional_prices.length - 1 && (
                        <button type="button" onClick={() => addAdditionalPriceRow(activeOptionIdx)}
                          className="bg-green-500 text-white px-2 rounded text-sm">+</button>
                      )}
                      {activeOption.additional_prices.length > 1 && (
                        <button type="button" onClick={() => removeAdditionalPriceRow(activeOptionIdx, idx)}
                          className="bg-red-500 text-white px-2 rounded text-sm">✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── option totals ── */}
              <div className="text-right font-semibold bg-green-100 text-green-800 px-4 py-2 rounded">
                TOTAL COST: ₹{Math.round(activeTotals.totalWithoutGST)}
                {quoteType === 'with_gst' && (
                  <span className="text-sm font-normal block">
                    GST (18%) on ₹{Math.round(Number(activeOption.gst_app_amt || 0))} = ₹{Math.round(activeTotals.gstAmount)}
                  </span>
                )}
              </div>

              <div className="text-right font-bold text-xl bg-blue-100 text-blue-800 px-4 py-2 rounded mt-2">
                {activeOption.show_final_offer && activeOption.final_offer.percentage > 0 ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Original:</span>
                      <span className="line-through text-gray-500">₹{Math.round(activeTotals.totalWithGST)}</span>
                    </div>
                    <div className="flex justify-between items-center text-green-600 mt-1">
                      <span>Offer ({activeOption.final_offer.percentage}% OFF):</span>
                      <span>- ₹{Math.round(activeTotals.discountAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-blue-200">
                      <span>TOTAL AFTER OFFER:</span>
                      <span className="text-2xl">₹{Math.round(activeTotals.discountedTotal)}</span>
                    </div>
                  </>
                ) : (
                  <span>TOTAL AMOUNT: ₹{Math.round(activeTotals.totalWithGST)}</span>
                )}
              </div>

              {/* ── final offer per option ── */}
              <div className="bg-purple-50 p-3 rounded mt-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-purple-700 text-sm">Final Best Offer — {activeOption.option_name}</h4>
                  <button type="button"
                    onClick={() => updateOption(activeOptionIdx, opt => ({
                      ...opt,
                      show_final_offer: !opt.show_final_offer,
                      final_offer: !opt.show_final_offer ? opt.final_offer : { description: 'FINAL BEST OFFER', percentage: 0, amount: 0 }
                    }))}
                    className="text-purple-600 text-xs hover:text-purple-800">
                    {activeOption.show_final_offer ? 'Hide' : 'Show'} Final Offer
                  </button>
                </div>
                {activeOption.show_final_offer && (
                  <div className="grid grid-cols-[2fr_1fr_1fr] gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">Description</label>
                      <input className="border px-2 py-1 rounded w-full text-sm"
                        value={activeOption.final_offer.description}
                        onChange={e => updateFinalOffer(activeOptionIdx, 'description', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">Discount %</label>
                      <input type="number" step="0.01" className="border px-2 py-1 rounded w-full text-sm"
                        value={activeOption.final_offer.percentage === 0 ? '' : activeOption.final_offer.percentage}
                        onChange={e => updateFinalOffer(activeOptionIdx, 'percentage', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">Discount ₹</label>
                      <input type="number" step="0.01" className="border px-2 py-1 rounded w-full text-sm"
                        value={activeOption.final_offer.amount === 0 ? '' : activeOption.final_offer.amount}
                        onChange={e => updateFinalOffer(activeOptionIdx, 'amount', e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </div>{/* end active option panel */}
          </div>

          {/* ═══════════════════════════════════════════
              OPTIONS SUMMARY TABLE (Before Bank Details & Installments)
          ═══════════════════════════════════════════ */}
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden mt-6">
            <div className="bg-white text-black px-4 py-3">
              <h4 className="font-semibold">OPTIONS SUMMARY</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Option</th>
                    <th className="border p-2 text-left">Kit / Product Names</th>
                    <th className="border p-2 text-right">Original Total (₹)</th>
                    <th className="border p-2 text-right">Discount (₹)</th>
                    <th className="border p-2 text-right bg-green-50">Finalized Total (₹)</th>
                    <th className="border p-2 text-center">Installments</th>
                  </tr>
                </thead>
                <tbody>
                  {optionsSummary.map((opt, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border p-2 font-medium">{opt.option_name}</td>
                      <td className="border p-2 text-gray-600">{opt.kit_names.substring(0, 60)}{opt.kit_names.length > 60 ? '...' : ''}</td>
                      <td className="border p-2 text-right">₹{opt.original_total.toLocaleString()}</td>
                      <td className="border p-2 text-right text-red-600">₹{opt.discount_amount.toLocaleString()}</td>
                      <td className="border p-2 text-right font-bold text-green-700 bg-green-50">₹{opt.finalized_total.toLocaleString()}</td>
                      <td className="border p-2 text-center">
                        {opt.has_installments ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">✓ Selected</span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-200 font-bold">
                  <tr>
                    <td colSpan={4} className="border p-2 text-right text-lg">OVERALL TOTAL:</td>
                    <td className="border p-2 text-right text-lg text-green-800">₹{overallFinalizedTotal.toLocaleString()}</td>
                    <td className="border p-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              PAYMENT INSTALLMENTS (with Option Selection Checkboxes)
          ═══════════════════════════════════════════ */}
          <div className="bg-yellow-50 p-4 rounded mt-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="font-semibold">Payment Installments</h4>
                <p className="text-xs text-gray-500">Select which options this installment plan applies to</p>
              </div>
              {!showInstallmentsPanel && (
                <button type="button" onClick={initializeInstallments}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                  + Add Installment Details
                </button>
              )}
            </div>
            
            {showInstallmentsPanel && (
              <>
                {/* Option Selection Checkboxes */}
                <div className="mb-4 p-3 bg-white rounded border border-yellow-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-semibold text-sm text-gray-700">Apply Installments To:</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={selectAllOptionsForInstallments}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                        Select All
                      </button>
                      <button type="button" onClick={deselectAllOptionsForInstallments}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {installmentsConfig.map((cfg) => (
                      <label key={cfg.option_index} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cfg.selected}
                          onChange={() => toggleOptionInstallment(cfg.option_index)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">{cfg.option_name}</span>
                        <span className="text-xs text-gray-500">
                          (₹{optionsSummary.find(o => o.option_index === cfg.option_index)?.finalized_total.toLocaleString()})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Installment Rows */}
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 mb-2 font-semibold text-gray-700 text-sm">
                  <div>Description</div><div>Percent (%)</div><div>Amount (₹)</div><div></div>
                </div>
                {globalInstallmentRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 mb-2 items-center">
                    <input className="border px-2 py-1 rounded text-sm" placeholder="e.g., Advance Payment / Final Payment"
                      value={row.description} onChange={e => updateGlobalInstallmentRow(idx, 'description', e.target.value)} />
                    <input type="number" className="border px-2 py-1 rounded text-sm" placeholder="%"
                      value={row.percentage === 0 ? '' : row.percentage}
                      onChange={e => updateGlobalInstallmentRow(idx, 'percentage', e.target.value)} />
                    <input type="number" className="border px-2 py-1 rounded text-sm" placeholder="₹"
                      value={row.amount === 0 ? '' : row.amount}
                      onChange={e => updateGlobalInstallmentRow(idx, 'amount', e.target.value)} />
                    <div className="flex gap-1">
                      {idx === globalInstallmentRows.length - 1 && (
                        <button type="button" onClick={addGlobalInstallmentRow} className="bg-green-500 text-white px-2 rounded text-sm">+</button>
                      )}
                      {globalInstallmentRows.length > 1 && (
                        <button type="button" onClick={() => removeGlobalInstallmentRow(idx)}
                          className="bg-red-500 text-white px-2 rounded text-sm">✕</button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-right text-sm text-gray-600 mt-2">
                  Total: {globalInstallmentRows.reduce((s, i) => s + Number(i.percentage || 0), 0).toFixed(0)}%
                </div>
                <div className="text-right mt-2">
                  <button type="button" onClick={() => { setShowInstallmentsPanel(false); setInstallmentsConfig([]); setGlobalInstallmentRows([]); }}
                    className="text-red-500 text-sm hover:text-red-700">Remove All Installments</button>
                </div>

                {/* Selected Options Preview */}
                {installmentsConfig.filter(c => c.selected).length > 0 && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
                    <span className="font-semibold">✓ Installments will be applied to: </span>
                    {installmentsConfig.filter(c => c.selected).map(c => c.option_name).join(', ')}
                  </div>
                )}
              </>
            )}
          </div>

          {/* actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={() => navigate('/quatation-pending')}
              className="bg-gray-400 px-4 py-2 rounded text-white">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
              Create Quotation ({options.length} Option{options.length > 1 ? 's' : ''})
            </button>
          </div>
        </form>

        {/* ── single product popup ── */}
        {openSingleProductPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-[600px] max-w-full max-h-[90vh] overflow-y-auto">
              <h3 className="font-semibold text-lg mb-4">{isReplaceMode ? 'Replace Product in Kit' : `Add Single Product to ${activeOption.option_name}`}</h3>
              <select className="border px-3 py-2 rounded w-full mb-3" value={spCategory}
                onChange={e => { setSpCategory(e.target.value); fetchProductsByCategory(e.target.value); }}>
                <option value="">Select Subject</option>
                {categories.map(c => <option key={c.cat_id} value={c.cat_id}>{c.cat_name}</option>)}
              </select>

                   <div className="mb-4">
  <label className="block mb-1 font-medium text-sm">Subject From Master</label>
  <input 
    type="text" 
    className="w-full border px-4 py-2 rounded" 
    placeholder="Enter quotation subject for view "
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
  />
</div>
              <select className="border px-3 py-2 rounded w-full mb-3" value={spType}
                disabled={!productTypes.length}
                onChange={e => { const pt = productTypes.find(p => p.product_type_id == e.target.value); setSelectedPT(pt || null); setSpType(e.target.value); setSelectedBrand(null); setSpBrand(''); setSpModel(''); setSelectedSingleModel(null); setSpPrice(0); }}>
                <option value="">Select Product Type</option>
                {productTypes.map(pt => <option key={pt.product_type_id} value={pt.product_type_id}>{pt.product_type_name}</option>)}
              </select>
              <select className="border px-3 py-2 rounded w-full mb-3" value={spBrand}
                disabled={!selectedPT?.brands?.length}
                onChange={e => { const b = selectedPT?.brands?.find(b => b.brand_id == e.target.value); setSelectedBrand(b || null); setSpBrand(e.target.value); setSpModel(''); setSelectedSingleModel(null); setSpPrice(0); }}>
                <option value="">Select Brand</option>
                {selectedPT?.brands?.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
              </select>
              <select className="border px-3 py-2 rounded w-full mb-3" value={spModel}
                disabled={!selectedBrand?.models?.length}
                onChange={e => { const m = selectedBrand?.models?.find(m => m.model_id == e.target.value); setSelectedSingleModel(m || null); setSpModel(e.target.value); setSpPrice(m?.price || 0); setSpQty(1); }}>
                <option value="">Select Model</option>
                {selectedBrand?.models?.map(m => <option key={m.model_id} value={m.model_id}>{m.model_no}</option>)}
              </select>
              {selectedSingleModel && (
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div><label className="font-medium text-sm">Quantity</label>
                    <input type="number" min={1} className="border px-3 py-2 rounded w-full" value={spQty} onChange={e => setSpQty(Number(e.target.value))} /></div>
                  <div><label className="font-medium text-sm">Unit Price</label>
                    <input type="number" min={0} step="0.01" className="border px-3 py-2 rounded w-full" value={spPrice} onChange={e => setSpPrice(Number(e.target.value))} /></div>
                </div>
              )}
              {selectedSingleModel?.description && (
                <div className="mb-3 text-sm text-gray-600 whitespace-pre-line">{selectedSingleModel.description}</div>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => { setOpenSingleProductPopup(false); setIsReplaceMode(false); setReplaceProductIndex(null); resetSpSelections(); }}
                  className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                <button onClick={handleAddSingleProduct} className="bg-blue-600 text-white px-3 py-1 rounded">
                  {isReplaceMode ? 'Replace Product' : 'Add Product'}
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