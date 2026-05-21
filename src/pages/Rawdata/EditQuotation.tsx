import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPlus, FaTrash, FaCopy } from 'react-icons/fa';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config';
import logo from '../../images/logo/AVCoreLogo.png';

// ─── helpers ────────────────────────────────────────────────
const emptyOption = (index = 0) => ({
  option_id: null,
  option_name: `OPTION ${index + 1}`,
  items: [],
  additional_prices: [{ add_price_name: '', price: '' }],
  gst_app_amt: 0,
  final_offer: { description: 'FINAL BEST OFFER', percentage: 0, amount: 0 },
  show_final_offer: false,
  floor_name: '',  // ← NEW: floor name field
  room_name: '',   // ← NEW: room name field
});

const calcOptionTotals = (option, quoteType) => {
  const subtotal = (option.items || []).reduce((s, c) => s + Number(c.category_total || 0), 0);
  const additionalTotal = (option.additional_prices || []).reduce((s, a) => s + (Number(a.price) || 0), 0);
  const totalWithoutGST = subtotal + additionalTotal;
  const gstAmount =
    quoteType === 'with_gst' && Number(option.gst_app_amt) > 0
      ? Number(option.gst_app_amt) * 0.18
      : 0;
  const totalWithGST = totalWithoutGST + gstAmount;
  const discountAmount =
    option.show_final_offer && Number(option.final_offer?.percentage) > 0
      ? (totalWithGST * Number(option.final_offer.percentage)) / 100
      : 0;
  const discountedTotal = totalWithGST - discountAmount;
  return { subtotal, additionalTotal, totalWithoutGST, gstAmount, totalWithGST, discountAmount, discountedTotal };
};

// ─── component ──────────────────────────────────────────────
const EditQuotation = () => {
  const { qt_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const revision = location.state?.revision;

  // ── option subject states ──
  const [optionSubjects, setOptionSubjects] = useState({});
  const [optionSubjectTypes, setOptionSubjectTypes] = useState({});
  const [selectedCategoryForOption, setSelectedCategoryForOption] = useState('');

  // ── Floor and Room states - one per option ──
  const [optionFloorNames, setOptionFloorNames] = useState({});
  const [optionRoomNames, setOptionRoomNames] = useState({});

  // ── global ──
  const [quoteType, setQuoteType]         = useState('with_gst');
  const [qtNumber, setQtNumber]           = useState('');
  const [acousticTerms, setAcousticTerms] = useState('');
  const [framingBy, setFramingBy]         = useState('AV CORE');
  const [fabricBy, setFabricBy]           = useState('THE CLIENT');
  const [ceilingBy, setCeilingBy]         = useState('THE CLIENT');
  const [isEditLoaded, setIsEditLoaded]   = useState(false);
  
  // ── summary combinations state ──
  const [selectedOptionsForSummary, setSelectedOptionsForSummary] = useState([]);
  const [currentSummarySelection, setCurrentSummarySelection] = useState([]);
  
  // ── options ──
  const [options, setOptions]                 = useState([emptyOption(0)]);
  const [activeOptionIdx, setActiveOptionIdx] = useState(0);

  // ── installments with option selection ──
  const [installmentsConfig, setInstallmentsConfig] = useState([]);
  const [showInstallmentsPanel, setShowInstallmentsPanel] = useState(false);
  const [globalInstallmentRows, setGlobalInstallmentRows] = useState([]);

  // ── kit / product selection ──
  const [categories, setCategories]           = useState([]);
  const [kits, setKits]                       = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedKit, setSelectedKit]         = useState('');
  const [selectedKitData, setSelectedKitData] = useState(null);
  const [kitQty, setKitQty]                   = useState(1);
  const [expandedIndex, setExpandedIndex]     = useState(null);
  const [showInlineKit, setShowInlineKit]     = useState(false);

  // kit edit
  const [editKitMode, setEditKitMode]               = useState(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
  const [tempKitItems, setTempKitItems]             = useState([]);
  const [replaceProductIndex, setReplaceProductIndex] = useState(null);
  const [isReplaceMode, setIsReplaceMode]           = useState(false);

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

  const [globalSubject, setGlobalSubject] = useState('');

  const [quotationType, setQuotationType] = useState('demo'); // 'demo' or 'finalized'


  // ── fetch on mount ──
  useEffect(() => {
    fetchCategories();
    fetchMasterCharges();
    fetchQuotationForEdit();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    axios.get(`${BASE_URL}api/category-products-kits/${selectedCategory}`).then(r => {
      setKits(r.data.kits || []);
      setSelectedKit(''); setSelectedKitData(null); setKitQty(1);
    });
  }, [selectedCategory]);

  // ── Summary Combination Handlers ──
  const selectAllOptionsForSummary = () => {
    setSelectedOptionsForSummary(options.map((_, idx) => idx));
  };

  const deselectAllOptionsForSummary = () => {
    setSelectedOptionsForSummary([]);
  };

  const toggleCurrentSummaryOption = (idx) => {
    setCurrentSummarySelection(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      }
      return [...prev, idx];
    });
  };

  const addSummaryCombination = () => {
    if (currentSummarySelection.length === 0) {
      alert('Select at least one option');
      return;
    }

    setSelectedOptionsForSummary(prev => [
      ...prev,
      [...currentSummarySelection]
    ]);

    setCurrentSummarySelection([]);
  };

  const removeSummaryCombination = (combinationIdx) => {
    setSelectedOptionsForSummary(prev =>
      prev.filter((_, idx) => idx !== combinationIdx)
    );
  };

  // Subject handler functions
  const handleMasterSubjectSelect = (optionIdx, catId) => {
    if (catId) {
      const category = categories.find(c => c.cat_id === Number(catId));
      if (category) {
        setOptionSubjects(prev => ({ ...prev, [optionIdx]: category.cat_name }));
        setOptionSubjectTypes(prev => ({ ...prev, [optionIdx]: 'master' }));
        setSelectedCategoryForOption(catId);
      }
    } else {
      setOptionSubjects(prev => ({ ...prev, [optionIdx]: '' }));
      setOptionSubjectTypes(prev => ({ ...prev, [optionIdx]: 'master' }));
      setSelectedCategoryForOption('');
    }
  };

  const handleCustomSubjectChange = (optionIdx, value) => {
    setOptionSubjects(prev => ({ ...prev, [optionIdx]: value }));
    setOptionSubjectTypes(prev => ({ ...prev, [optionIdx]: 'custom' }));
    if (value !== '') {
      setSelectedCategoryForOption('');
    }
  };

  // ── Floor and Room name handlers ──
  const handleFloorNameChange = (optionIdx, value) => {
    setOptionFloorNames(prev => ({ ...prev, [optionIdx]: value }));
    updateOption(optionIdx, { floor_name: value });
  };

  const handleRoomNameChange = (optionIdx, value) => {
    setOptionRoomNames(prev => ({ ...prev, [optionIdx]: value }));
    updateOption(optionIdx, { room_name: value });
  };

  // pre-select master charges when both loaded
  useEffect(() => {
    if (!isEditLoaded || masterAdditionalCharges.length === 0) return;
    const preSelected = {};
    options.forEach((opt, idx) => {
      preSelected[`${idx}`] = masterAdditionalCharges.filter(charge =>
        opt.additional_prices.some(ap => ap.add_price_name === charge.charge_name)
      );
    });
    setSelectedMasterCharges(preSelected);
  }, [isEditLoaded, masterAdditionalCharges]);
  
  useEffect(() => {
    if (!selectedKit) { setSelectedKitData(null); return; }
    const kit = kits.find(k => k.kit_id === Number(selectedKit));
    if (kit) setSelectedKitData({ ...kit, items: kit.items.map(i => ({ ...i, prod_qty: i.qty, prod_price: i.price })) });
  }, [selectedKit, kits]);

  const fetchCategories = async () => {
    try { const r = await axios.get(`${BASE_URL}api/customised-categories`); setCategories(r.data || []); } catch {}
  };

  const fetchMasterCharges = async () => {
    try {
      const r = await axios.get(`${BASE_URL}api/additional-charges`);
      setMasterAdditionalCharges((r.data || []).filter(c => c.status === 'active'));
    } catch {}
  };

  const fetchQuotationForEdit = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/quotation/${qt_id}/revision/${revision}`);
      const q = res.data;
      if (!q) return;

      setQtNumber(q.qt_number || '');
      setQuoteType(q.type || 'with_gst');
      setQuotationType(q.quotation_type || 'demo');
      setAcousticTerms(q.acoustic_terms || ''); 
      setGlobalSubject(q.subject || '');

      // Load selected_options_for_summary
      if (q.selected_options_for_summary && Array.isArray(q.selected_options_for_summary)) {
        setSelectedOptionsForSummary(q.selected_options_for_summary);
      } else if (q.selected_options_for_summary && typeof q.selected_options_for_summary === 'string') {
        try {
          const parsed = JSON.parse(q.selected_options_for_summary);
          if (Array.isArray(parsed)) {
            setSelectedOptionsForSummary(parsed);
          }
        } catch (e) {
          console.error('Error parsing selected_options_for_summary:', e);
        }
      }

      // Load installments config from API response
      if (q.installments_config && q.installments_config.length > 0) {
        const hasAnyInstallments = q.installments_config.some(cfg => cfg.installments && cfg.installments.length > 0);
        if (hasAnyInstallments) {
          const firstWithInstallments = q.installments_config.find(cfg => cfg.installments && cfg.installments.length > 0);
          if (firstWithInstallments && firstWithInstallments.installments) {
            setGlobalInstallmentRows(firstWithInstallments.installments.map(i => ({
              description: i.description || '',
              percentage: Number(i.percentage || 0),
              amount: Number(i.amount || 0),
              payment_mode: i.payment_mode || 'Online',
            })));
          }
          setInstallmentsConfig(q.installments_config.map(cfg => ({
            option_index: cfg.option_index,
            option_name: cfg.option_name,
            selected: cfg.selected !== undefined ? cfg.selected : (cfg.installments && cfg.installments.length > 0),
            installments: cfg.installments && cfg.installments.length > 0 ? cfg.installments.map(i => ({
              description: i.description,
              percentage: Number(i.percentage),
              amount: Number(i.amount),
              payment_mode: i.payment_mode || 'Online',
            })) : [],
          })));
          setShowInstallmentsPanel(true);
        }
      }

      // get revision options
      const revData = q.revisions?.[0];
      if (!revData) return;

      if (revData.options?.length > 0) {
        const loadedOptions = revData.options.map((opt, idx) => {
          // Store subject for this option
          if (opt.subject) {
            setOptionSubjects(prev => ({ ...prev, [idx]: opt.subject }));
            setOptionSubjectTypes(prev => ({ ...prev, [idx]: opt.subject_type || 'master' }));
          }
          
          // Store floor and room names for this option
          if (opt.floor_name) {
            setOptionFloorNames(prev => ({ ...prev, [idx]: opt.floor_name }));
          }
          if (opt.room_name) {
            setOptionRoomNames(prev => ({ ...prev, [idx]: opt.room_name }));
          }
          
          const prefilled = [];
          (opt.kits || []).forEach(kit => {
            prefilled.push({
              cat_id: kit.cat_id || null,
              cat_name: kit.kit_name || 'Single Products',
              kit_id: kit.kit_id || null,
              kit_name: kit.kit_name || null,
              kit_qty: kit.kit_qty || 1,
              products: (kit.items || []).map(p => ({
                model_id: p.model_id, model: p.model,
                brand_name: p.brand_name, product_type_name: p.product_type_name,
                model_description: p.model_description,
                model_qty: Number(p.model_qty), model_price: Number(p.model_price),
              })),
              category_total: (kit.items || []).reduce(
                (s, p) => s + p.model_qty * p.model_price * (kit.kit_qty || 1), 0
              ),
            });
          });

          const hasFinalOffer = opt.final_offer && Number(opt.final_offer.percentage) > 0;
          return {
            option_id: opt.option_id,
            option_name: opt.option_name || `OPTION ${idx + 1}`,
            items: prefilled,
            additional_prices: opt.additional_prices?.length
              ? opt.additional_prices.map(a => ({ add_price_name: a.add_price_name, price: Number(a.price) }))
              : [{ add_price_name: '', price: '' }],
            gst_app_amt: Number(opt.gst_app_amt || revData.gst_app_amt || 0),
            final_offer: hasFinalOffer
              ? { description: opt.final_offer.description, percentage: Number(opt.final_offer.percentage), amount: Number(opt.final_offer.amount) }
              : { description: 'FINAL BEST OFFER', percentage: 0, amount: 0 },
            show_final_offer: hasFinalOffer,
            floor_name: opt.floor_name || '',  // ← NEW
            room_name: opt.room_name || '',    // ← NEW
          };
        });
        setOptions(loadedOptions);
      } else {
        // fallback: old flat format wrapped in single option
        const prefilled = [];
        (revData.kits || []).forEach(kit => {
          prefilled.push({
            cat_id: kit.cat_id || null,
            cat_name: kit.kit_name || 'Single Products',
            kit_id: kit.kit_id || null,
            kit_name: kit.kit_name || null,
            kit_qty: kit.kit_qty || 1,
            products: (kit.items || []).map(p => ({
              model_id: p.model_id, model: p.model,
              brand_name: p.brand_name, product_type_name: p.product_type_name,
              model_description: p.model_description,
              model_qty: Number(p.model_qty), model_price: Number(p.model_price),
            })),
            category_total: (kit.items || []).reduce(
              (s, p) => s + p.model_qty * p.model_price * (kit.kit_qty || 1), 0
            ),
          });
        });
        setOptions([{
          option_id: null,
          option_name: 'OPTION 1',
          items: prefilled,
          additional_prices: revData.additional_prices?.length
            ? revData.additional_prices.map(a => ({ add_price_name: a.add_price_name, price: Number(a.price) }))
            : [{ add_price_name: '', price: '' }],
          gst_app_amt: Number(revData.gst_app_amt || 0),
          final_offer: q.final_offer?.percentage > 0
            ? { description: q.final_offer.description, percentage: Number(q.final_offer.percentage), amount: Number(q.final_offer.amount) }
            : { description: 'FINAL BEST OFFER', percentage: 0, amount: 0 },
          show_final_offer: q.final_offer?.percentage > 0,
          floor_name: '',  // ← NEW
          room_name: '',    // ← NEW
        }]);
      }

      setIsEditLoaded(true);
    } catch (err) {
      console.error('Failed to load quotation for edit', err);
    }
  };

  // ── option helpers ──
  const updateOption = (idx, updater) => {
    setOptions(prev => {
      const copy = [...prev];
      copy[idx] = typeof updater === 'function' ? updater(copy[idx]) : { ...copy[idx], ...updater };
      return copy;
    });
  };

  const addOption = () => {
    const newOption = emptyOption(options.length);
    setOptions(prev => [...prev, newOption]);
    setActiveOptionIdx(options.length);
    resetKitState();
    
    // Initialize subject for new option as empty
    setOptionSubjects(prev => ({ ...prev, [options.length]: '' }));
    setOptionSubjectTypes(prev => ({ ...prev, [options.length]: 'master' }));
    
    // Initialize floor and room names for new option
    setOptionFloorNames(prev => ({ ...prev, [options.length]: '' }));
    setOptionRoomNames(prev => ({ ...prev, [options.length]: '' }));
    
    // Update installments config for new option
    if (showInstallmentsPanel) {
      setInstallmentsConfig(prev => [...prev, {
        option_index: options.length,
        option_name: newOption.option_name,
        selected: false,
        installments: [],
      }]);
    }
  };

  const duplicateOption = (idx) => {
    const clone = JSON.parse(JSON.stringify(options[idx]));
    clone.option_name = `OPTION ${options.length + 1}`;
    clone.option_id = null;
    setOptions(prev => [...prev, clone]);
    setActiveOptionIdx(options.length);
    
    // Copy the subject from the duplicated option
    setOptionSubjects(prev => ({ ...prev, [options.length]: optionSubjects[idx] || '' }));
    setOptionSubjectTypes(prev => ({ ...prev, [options.length]: optionSubjectTypes[idx] || 'master' }));
    
    // Copy floor and room names from the duplicated option
    setOptionFloorNames(prev => ({ ...prev, [options.length]: optionFloorNames[idx] || '' }));
    setOptionRoomNames(prev => ({ ...prev, [options.length]: optionRoomNames[idx] || '' }));
    
    // Update installments config for duplicated option
    if (showInstallmentsPanel) {
      setInstallmentsConfig(prev => [...prev, {
        option_index: options.length,
        option_name: clone.option_name,
        selected: false,
        installments: [],
      }]);
    }
  };

  const removeOption = (idx) => {
    if (options.length === 1) { alert('At least one option is required'); return; }
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    setActiveOptionIdx(Math.min(activeOptionIdx, updated.length - 1));
    
    // Update installments config
    if (showInstallmentsPanel) {
      setInstallmentsConfig(prev => prev.filter(cfg => cfg.option_index !== idx).map((cfg, newIdx) => ({
        ...cfg,
        option_index: newIdx,
      })));
    }
  };

  const resetKitState = () => {
    setSelectedCategory(''); setSelectedKit(''); setSelectedKitData(null); setKitQty(1);
    setShowInlineKit(false); setEditKitMode(false); setTempKitItems([]); setEditingCategoryIndex(null);
  };

  // ── kit edit ──
  const enableKitEdit = (catIdx) => {
    const cat = options[activeOptionIdx].items[catIdx];
    if (!cat?.kit_id) { alert('Only kits can be edited'); return; }
    setEditingCategoryIndex(catIdx);
    setTempKitItems([...cat.products]);
    setEditKitMode(true);
  };

  const saveKitChanges = () => {
    if (editingCategoryIndex === null) return;
    updateOption(activeOptionIdx, opt => {
      const items = [...opt.items];
      const kitQty = items[editingCategoryIndex].kit_qty;
      items[editingCategoryIndex] = {
        ...items[editingCategoryIndex],
        products: [...tempKitItems],
        category_total: tempKitItems.reduce((s, p) => s + p.model_qty * p.model_price * kitQty, 0),
      };
      return { ...opt, items };
    });
    setEditKitMode(false); setTempKitItems([]); setEditingCategoryIndex(null);
  };

  const cancelKitEdit = () => { setEditKitMode(false); setTempKitItems([]); setEditingCategoryIndex(null); };
  const removeKitItem = (i) => setTempKitItems(prev => prev.filter((_, j) => j !== i));
  const openReplaceProductPopup = (i) => { setReplaceProductIndex(i); setIsReplaceMode(true); setOpenSingleProductPopup(true); };
  const updateTempKitItem = (idx, field, value) => {
    const u = [...tempKitItems]; u[idx][field] = Number(value); setTempKitItems(u);
  };

  // ── add kit ──
  const handleAddKitToOption = () => {
    if (!selectedCategory || !selectedKitData) { alert('Please select category and kit'); return; }
    const products = selectedKitData.items.map(i => ({
      model_id: i.model_id, model: i.model,
      brand_name: i.brand_name, product_type_name: i.product_type_name,
      model_description: i.model_description,
      model_qty: Number(i.prod_qty ?? i.qty), model_price: Number(i.prod_price ?? i.price),
    }));
    const newKit = {
      cat_id: selectedCategory,
      cat_name: categories.find(c => c.cat_id == selectedCategory)?.cat_name || '',
      kit_id: selectedKitData.kit_id, kit_name: selectedKitData.kit_name, kit_qty: Number(kitQty || 1),
      products,
      category_total: products.reduce((s, p) => s + p.model_qty * p.model_price, 0) * Number(kitQty || 1),
    };
    updateOption(activeOptionIdx, opt => ({ ...opt, items: [...opt.items, newKit] }));
    resetKitState();
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

  // ── master charges ──
  const handleMasterChargeToggle = (optIdx, charge) => {
    const key = `${optIdx}`;
    const current = selectedMasterCharges[key] || [];
    const exists = current.find(c => c.charge_id === charge.charge_id);
    let updated;
    if (exists) {
      updated = current.filter(c => c.charge_id !== charge.charge_id);
      updateOption(optIdx, opt => ({ ...opt, additional_prices: opt.additional_prices.filter(p => p.add_price_name !== charge.charge_name) }));
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

  const initializeInstallments = () => {
    const baseInstallmentRows = [{ 
      description: 'Full Payment', 
      percentage: 100, 
      amount: 0,
      payment_mode: 'Online'
    }];
    setGlobalInstallmentRows(baseInstallmentRows);
    
    const config = options.map((opt, idx) => ({
      option_index: idx,
      option_name: opt.option_name,
      selected: idx === 0,
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
    
    const totalPercent = updatedRows.reduce((s, i) => s + Number(i.percentage || 0), 0);
    if (totalPercent > 100) {
      alert('Total percentage cannot exceed 100%');
      return;
    }
    
    setGlobalInstallmentRows(updatedRows);
    setInstallmentsConfig(prev => prev.map(cfg => ({
      ...cfg,
      installments: cfg.selected ? updatedRows.map(row => ({ ...row })) : cfg.installments
    })));
  };

  const addGlobalInstallmentRow = () => {
    if (globalInstallmentRows.reduce((s, i) => s + Number(i.percentage || 0), 0) >= 100) {
      alert('Already reached 100%');
      return;
    }
    const newRow = { 
      description: '', 
      percentage: 0, 
      amount: 0,
      payment_mode: 'Online'
    };
    const updatedRows = [...globalInstallmentRows, newRow];
    setGlobalInstallmentRows(updatedRows);
    setInstallmentsConfig(prev => prev.map(cfg => ({
      ...cfg,
      installments: cfg.selected ? updatedRows.map(row => ({ ...row })) : cfg.installments
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
      installments: cfg.selected ? updatedRows.map(row => ({ ...row })) : cfg.installments
    })));
  };

  const toggleOptionInstallment = (optionIdx) => {
    setInstallmentsConfig(prev => prev.map(cfg => 
      cfg.option_index === optionIdx 
        ? { 
            ...cfg, 
            selected: !cfg.selected,
            installments: !cfg.selected ? globalInstallmentRows.map(row => ({ ...row })) : cfg.installments
          }
        : cfg
    ));
  };

  const selectAllOptionsForInstallments = () => {
    setInstallmentsConfig(prev => prev.map(cfg => ({ 
      ...cfg, 
      selected: true,
      installments: globalInstallmentRows.map(row => ({ ...row }))
    })));
  };

  const deselectAllOptionsForInstallments = () => {
    setInstallmentsConfig(prev => prev.map(cfg => ({ ...cfg, selected: false, installments: [] })));
  };

  // ── single product popup ──
  const fetchProductsByCategory = async (catId) => {
    if (!catId) return;
    const res = await axios.get(`${BASE_URL}api/products/category/${catId}`);
    setProductTypes(res.data || []);
    setSelectedPT(null); setSpType(''); setSelectedBrand(null);
    setSpBrand(''); setSpModel(''); setSelectedSingleModel(null); setSpPrice(0); setSpQty(1);
  };

  const resetSpSelections = () => {
    setSpCategory(''); setSpType(''); setSelectedPT(null); setSpBrand('');
    setSelectedBrand(null); setSpModel(''); setSelectedSingleModel(null); setSpQty(1); setSpPrice(0);
  };

  const handleAddSingleProduct = () => {
    if (isReplaceMode && replaceProductIndex !== null) {
      const updated = [...tempKitItems];
      updated[replaceProductIndex] = {
        ...updated[replaceProductIndex],
        model_id: selectedSingleModel.model_id, model: selectedSingleModel.model_no,
        brand_name: selectedBrand?.brand_name || '', product_type_name: selectedPT?.product_type_name || '',
        model_description: selectedSingleModel.description,
        model_qty: Number(spQty), model_price: Number(spPrice || selectedSingleModel.price),
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

  // ── submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (showInstallmentsPanel && installmentsConfig.length > 0) {
      const selectedOptions = installmentsConfig.filter(cfg => cfg.selected);
      if (selectedOptions.length === 0) {
        alert('Please select at least one option for payment installments');
        return;
      }
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
    const finalAcousticTerms = isAcoustic
      ? `ALL FRAMING WILL BE DONE BY ${framingBy}.\n• FABRIC & FLOOR CARPET WILL BE PROVIDED BY ${fabricBy}.\n• ALL CEILING-RELATED WORK WILL BE PROVIDED BY ${ceilingBy}.\n• FABRIC STITCHING CHARGES WILL BE EXTRA AS PER THE DESIGN`
      : null;

const payload = {
  type: quoteType,
  quotation_type: quotationType,  // ← ADD THIS LINE
  acoustic_terms: finalAcousticTerms,
  subject: globalSubject,
  selected_options_for_summary: selectedOptionsForSummary,
  installments_config: showInstallmentsPanel ? installmentsConfig.map(cfg => ({
    option_index: cfg.option_index,
    option_name: cfg.option_name,
    selected: cfg.selected,
    installments: cfg.selected ? cfg.installments.map(inst => ({
      description: inst.description,
      percentage: inst.percentage,
      amount: inst.amount,
      payment_mode: inst.payment_mode || 'Online'
    })) : []
  })) : [],
  options: options.map((opt, idx) => ({ 
    option_name: opt.option_name,
    subject: optionSubjects[idx] || null,
    subject_type: optionSubjectTypes[idx] || 'master',
    floor_name: optionFloorNames[idx] || null,
    room_name: optionRoomNames[idx] || null,
    items: opt.items.map(item => ({
      cat_id: item.cat_id, kit_id: item.kit_id || null,
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
      await axios.put(`${BASE_URL}api/quotation/${qt_id}`, payload);
      alert('Quotation updated successfully ✅');
      navigate(-1);
    } catch (err) {
      console.error('Update failed', err); alert('Failed to update quotation ❌');
    }
  };

  const activeOption = options[activeOptionIdx] || emptyOption(0);
  const activeTotals = calcOptionTotals(activeOption, quoteType);
  const getCategoryName = (catId) => categories.find(c => c.cat_id == catId)?.cat_name || '';

  // Get current values for active option
  const currentSubject = optionSubjects[activeOptionIdx] || '';
  const currentFloorName = optionFloorNames[activeOptionIdx] || '';
  const currentRoomName = optionRoomNames[activeOptionIdx] || '';

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
      subject: optionSubjects[idx] || '',
      subject_type: optionSubjectTypes[idx] || 'master',
      floor_name: optionFloorNames[idx] || '',
      room_name: optionRoomNames[idx] || '',
      kit_names: kitNames,
      original_total: totals.totalWithGST,
      discount_amount: totals.discountAmount,
      finalized_total: finalPrice,
      has_installments: showInstallmentsPanel && installmentsConfig.find(c => c.option_index === idx)?.selected || false
    };
  });

  return (
    <div>
      <Breadcrumb pageName="Edit Quotation" />
      <div className="bg-white rounded shadow p-6 max-w-5xl mx-auto">

        <div className="mb-4">
          <button onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <FaArrowLeft /> Back
          </button>
        </div>

        {/* company header */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
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

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6 mt-6">

{/* Quotation Type Selection - Demo vs Finalized */}
<div className="mb-5 border border-gray-200 rounded-lg p-4 bg-gray-50">
  <h4 className="font-semibold mb-3 text-gray-700">Quotation Type</h4>
  <div className="flex gap-6">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="quotationType"
        value="demo"
        checked={quotationType === 'demo'}
        onChange={(e) => setQuotationType(e.target.value)}
        className="w-4 h-4 text-blue-600"
      />
      <span className="text-gray-700">
        <span className="font-medium">Demo Quotation</span>
      </span>
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="quotationType"
        value="finalized"
        checked={quotationType === 'finalized'}
        onChange={(e) => setQuotationType(e.target.value)}
        className="w-4 h-4 text-green-600"
      />
      <span className="text-gray-700">
        <span className="font-medium">Finalized Quotation</span>
      </span>
    </label>
  </div>
  <p className="text-xs text-gray-500 mt-2">
    {quotationType === 'demo' 
      ? '📝 Demo quotations are for internal reference and client preview.' 
      : '✅ Finalized quotations are ready for client approval and execution.'}
  </p>
</div>


          {/* QUOTATION TYPE & GST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium block mb-1">Quotation Type</label>
              <select value={quoteType} onChange={e => setQuoteType(e.target.value)} className="border px-3 py-2 rounded w-full">
                <option value="with_gst">With GST</option>
                <option value="without_gst">Without GST</option>
              </select>
            </div>
        
            {quoteType === 'with_gst' && (
              <div>
                <label className="font-medium block mb-1">GST Applicable Amount (for {activeOption.option_name})</label>
                <input type="number" min={0} step="0.01" className="border px-3 py-2 rounded w-full"
                  value={activeOption.gst_app_amt}
                  onChange={e => updateOption(activeOptionIdx, { gst_app_amt: Number(e.target.value) })}
                  placeholder="Enter GST applicable amount" />
              </div>
            )}
          </div>

          {/* OPTION TABS */}
          <div>
            <div className="flex items-center gap-2 border-b-2 border-gray-200 mb-4 flex-wrap">
              {options.map((opt, idx) => (
                <button key={idx} type="button"
                  onClick={() => { setActiveOptionIdx(idx); resetKitState(); setExpandedIndex(null); }}
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

              {/* option controls */}
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <input type="text" value={activeOption.option_name}
                  onChange={e => updateOption(activeOptionIdx, { option_name: e.target.value })}
                  className="border px-3 py-1.5 rounded font-semibold text-blue-800 bg-white w-60" />
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

              {/* Subject Selection for this option */}
              <div className="bg-white border rounded p-4 mb-4">
                <h4 className="font-semibold mb-3 text-gray-700">Subject for {activeOption.option_name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Select from Master</label>
                    <select 
                      className="w-full border px-3 py-2 rounded" 
                      value={selectedCategoryForOption}
                      onChange={e => handleMasterSubjectSelect(activeOptionIdx, e.target.value)}
                    >
                      <option value="">Select Subject</option>
                      {categories.map(c => (
                        <option key={c.cat_id} value={c.cat_id}>{c.cat_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium text-sm">OR Custom Subject</label>
                    <input 
                      type="text" 
                      className="w-full border px-3 py-2 rounded" 
                      placeholder="Enter custom subject"
                      value={currentSubject}
                      onChange={e => handleCustomSubjectChange(activeOptionIdx, e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Display current subject for this option */}
                {currentSubject && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <span className="text-sm font-medium text-gray-700">Subject for {activeOption.option_name}: </span>
                    <span className="text-sm font-semibold text-blue-700">{currentSubject}</span>
                  </div>
                )}
              </div>

              {/* ── NEW: Floor Name and Room Name Fields ── */}
              <div className="bg-white border rounded p-4 mb-4">
                <h4 className="font-semibold mb-3 text-gray-700">Location Details for {activeOption.option_name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">
                      Floor Name <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full border px-3 py-2 rounded" 
                      placeholder="e.g., Ground Floor, First Floor, Basement"
                      value={currentFloorName}
                      onChange={e => handleFloorNameChange(activeOptionIdx, e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium text-sm">
                      Room Name <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full border px-3 py-2 rounded" 
                      placeholder="e.g., Living Room, Bedroom, Home Theatre"
                      value={currentRoomName}
                      onChange={e => handleRoomNameChange(activeOptionIdx, e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Display current location details for this option */}
                {(currentFloorName || currentRoomName) && (
                  <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                    <span className="text-sm font-medium text-gray-700">Location: </span>
                    {currentFloorName && <span className="text-sm font-semibold text-green-700">Floor: {currentFloorName}</span>}
                    {currentFloorName && currentRoomName && <span className="text-sm mx-1">•</span>}
                    {currentRoomName && <span className="text-sm font-semibold text-green-700">Room: {currentRoomName}</span>}
                  </div>
                )}
              </div>

              {/* add kit / product buttons */}
              <div className="flex gap-3 mb-4">
                <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                  onClick={() => setShowInlineKit(true)}>+ Add Kit</button>
                <button type="button" className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                  onClick={() => { setIsReplaceMode(false); setOpenSingleProductPopup(true); }}>+ Add Product</button>
              </div>

              {/* inline kit modal */}
              {showInlineKit && (
                <div className="border rounded bg-gray-50 p-4 space-y-3 mb-4">
                  <h4 className="font-semibold text-sm">Add Kit to {activeOption.option_name}</h4>
                  <select className="w-full border px-3 py-2 rounded text-sm" value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.cat_id} value={c.cat_id}>{c.cat_name}</option>)}
                  </select>

                  {selectedCategory && getCategoryName(selectedCategory) === 'Customised Acoustic Quotation' && (
                    <div className="border rounded bg-gray-50 p-3 space-y-2">
                      <h2 className="font-semibold text-sm text-blue-600">Acoustic Special Terms</h2>
                      {[
                        { label: 'Framing By', value: framingBy, setter: setFramingBy },
                        { label: 'Fabric By', value: fabricBy, setter: setFabricBy },
                        { label: 'Ceiling By', value: ceilingBy, setter: setCeilingBy }
                      ].map(({ label, value, setter }) => (
                        <div key={label}>
                          <label className="text-xs font-semibold text-gray-500">{label}</label>
                          <select 
                            className="border px-2 py-1 rounded w-full mt-1 text-sm" 
                            value={value} 
                            onChange={e => setter(e.target.value)}
                          >
                            <option value="AV CORE">BY AV CORE</option>
                            <option value="THE CLIENT">BY THE CLIENT</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedCategory && (
                    <select className="w-full border px-3 py-2 rounded text-sm" value={selectedKit}
                      onChange={e => setSelectedKit(e.target.value)} disabled={!kits.length}>
                      <option value="">Select Kit</option>
                      {kits.map(k => <option key={k.kit_id} value={k.kit_id}>{k.kit_name} (₹{k.kit_price})</option>)}
                    </select>
                  )}
                  {selectedKit && (
                    <div>
                      <label className="text-sm font-medium block mb-1">Kit Quantity</label>
                      <input type="number" min={1} value={kitQty} onChange={e => setKitQty(Number(e.target.value))}
                        className="border px-3 py-2 rounded w-full text-sm" />
                    </div>
                  )}
                  {selectedKitData && (
                    <div className="bg-yellow-50 p-3 rounded">
                      <h5 className="font-semibold text-xs mb-2">Kit Items</h5>
                      {selectedKitData.items.map((item, idx) => (
                        <div key={idx} className="bg-white p-2 mb-1 border rounded text-xs">
                          <div><b>{item.product_type_name}</b> | {item.brand_name} | {item.model}</div>
                          <div>Qty: {item.prod_qty ?? item.qty} | Price: ₹{item.prod_price ?? item.price}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={resetKitState} className="bg-gray-500 text-white px-3 py-1.5 rounded text-sm">Cancel</button>
                    <button type="button" onClick={handleAddKitToOption} disabled={!selectedKitData}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50">Add to Option</button>
                  </div>
                </div>
              )}

              {/* items list */}
              <div className="bg-gray-100 p-3 rounded mb-4">
                <h4 className="font-semibold mb-2 text-sm">Items in {activeOption.option_name}</h4>
                {(activeOption.items || []).length === 0
                  ? <div className="text-gray-400 text-sm italic">No items yet</div>
                  : (activeOption.items || []).map((cat, cIdx) => (
                    <div key={cIdx} className="bg-white border rounded p-3 mb-2">
                      {editKitMode && editingCategoryIndex === cIdx && cat.kit_id ? (
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-sm text-blue-600">Editing: {cat.kit_name}</span>
                            <button type="button" onClick={cancelKitEdit} className="text-red-500 text-xs">Cancel Edit</button>
                          </div>
                          {tempKitItems.map((p, pIdx) => (
                            <div key={pIdx} className="bg-gray-50 border rounded p-2 mb-2 text-xs">
                              <div className="font-semibold">{p.model}</div>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div><label>Qty:</label>
                                  <input type="number" min={1} value={p.model_qty}
                                    onChange={e => updateTempKitItem(pIdx, 'model_qty', e.target.value)}
                                    className="border px-2 py-0.5 rounded w-full" /></div>
                                <div><label>Price:</label>
                                  <input type="number" min={0} step="0.01" value={p.model_price}
                                    onChange={e => updateTempKitItem(pIdx, 'model_price', e.target.value)}
                                    className="border px-2 py-0.5 rounded w-full" /></div>
                              </div>
                              <div className="flex gap-2 mt-1">
                                <button type="button" onClick={() => removeKitItem(pIdx)} className="text-red-500 text-xs">🗑️ Remove</button>
                                <button type="button" onClick={() => openReplaceProductPopup(pIdx)} className="text-blue-500 text-xs">🔄 Replace</button>
                              </div>
                              <div className="text-green-700 font-semibold mt-1">Subtotal: ₹{Math.round(p.model_qty * p.model_price * cat.kit_qty)}</div>
                            </div>
                          ))}
                          <div className="flex justify-end mt-2">
                            <button type="button" onClick={saveKitChanges} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm">✓ Save Changes</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-center cursor-pointer"
                            onClick={() => setExpandedIndex(expandedIndex === cIdx ? null : cIdx)}>
                            <div className="text-sm">
                              <b>{cat.kit_name || 'Single Product'}</b> | Qty: {cat.kit_qty} | Total: ₹{Math.round(cat.category_total || 0)}
                            </div>
                            <div className="flex items-center gap-2">
                              {cat.kit_id && (
                                <button type="button" onClick={e => { e.stopPropagation(); enableKitEdit(cIdx); }}
                                  className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs">✏️ Edit Kit</button>
                              )}
                              <span className={`text-xs transition-transform ${expandedIndex === cIdx ? 'rotate-180' : ''}`}>▼</span>
                            </div>
                          </div>
                          {expandedIndex === cIdx && (
                            <div className="mt-2 border-t pt-2 space-y-2">
                              {cat.products.map((p, pIdx) => (
                                <div key={pIdx} className="bg-gray-50 border rounded p-2 text-xs">
                                  <div className="font-semibold">{p.model}</div>
                                  <div><b>Brand:</b> {p.brand_name} | <b>Type:</b> {p.product_type_name}</div>
                                  {p.model_description && <div className="text-gray-600 mt-1">{p.model_description}</div>}
                                  <div><b>Qty:</b> {p.model_qty} | <b>Price:</b> ₹{p.model_price} | <b>Kit Qty:</b> {cat.kit_qty}</div>
                                  <div className="text-green-700 font-semibold">Total: ₹{Math.round(p.model_qty * p.model_price * cat.kit_qty)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 text-right">
                            <button type="button" onClick={() => updateOption(activeOptionIdx, opt => ({ ...opt, items: opt.items.filter((_, j) => j !== cIdx) }))}
                              className="text-red-500 font-bold text-xs">Remove</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>

              {/* additional charges */}
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
                <label className="font-medium text-xs text-gray-700 block mb-2">Manual Charges:</label>
                {(activeOption.additional_prices || []).map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                    <input className="border px-2 py-1 rounded text-sm" placeholder="Name"
                      value={row.add_price_name}
                      onChange={e => updateAdditionalPrice(activeOptionIdx, idx, 'add_price_name', e.target.value)} />
                    <input type="number" className="border px-2 py-1 rounded text-sm" placeholder="Price"
                      value={row.price}
                      onChange={e => updateAdditionalPrice(activeOptionIdx, idx, 'price', e.target.value)} />
                    <div className="flex gap-1">
                      {idx === activeOption.additional_prices.length - 1 && (
                        <button type="button" onClick={() => addAdditionalPriceRow(activeOptionIdx)}
                          className="bg-green-600 text-white px-2 rounded text-sm">+</button>
                      )}
                      {activeOption.additional_prices.length > 1 && (
                        <button type="button" onClick={() => removeAdditionalPriceRow(activeOptionIdx, idx)}
                          className="bg-red-600 text-white px-2 rounded text-sm">✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* totals */}
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

              {/* final offer */}
              <div className="bg-purple-50 p-3 rounded mt-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-purple-700 text-sm">Final Best Offer — {activeOption.option_name}</h4>
                  <button type="button"
                    onClick={() => updateOption(activeOptionIdx, opt => ({
                      ...opt,
                      show_final_offer: !opt.show_final_offer,
                      final_offer: !opt.show_final_offer ? opt.final_offer : { description: 'FINAL BEST OFFER', percentage: 0, amount: 0 },
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
            </div>
          </div>

          {/* all options summary */}
          {options.length > 1 && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-gray-700">All Options Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {options.map((opt, idx) => {
                  const t = calcOptionTotals(opt, quoteType);
                  return (
                    <div key={idx}
                      className={`bg-white border-2 rounded-lg p-3 cursor-pointer transition-all ${activeOptionIdx === idx ? 'border-blue-400' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => { setActiveOptionIdx(idx); resetKitState(); setExpandedIndex(null); }}>
                      <div className="font-semibold text-sm text-blue-700 mb-1">{opt.option_name}</div>
                      {optionSubjects[idx] && (
                        <div className="text-xs text-gray-600 mb-1">Subject: {optionSubjects[idx]}</div>
                      )}
                      {optionFloorNames[idx] && (
                        <div className="text-xs text-green-600">Floor: {optionFloorNames[idx]}</div>
                      )}
                      {optionRoomNames[idx] && (
                        <div className="text-xs text-green-600">Room: {optionRoomNames[idx]}</div>
                      )}
                      <div className="text-xs text-gray-500">{(opt.items || []).length} item group(s)</div>
                      <div className="text-sm font-bold text-green-700 mt-1">₹{Math.round(t.totalWithGST).toLocaleString()}</div>
                      {opt.show_final_offer && opt.final_offer.percentage > 0 && (
                        <div className="text-xs text-orange-600 font-semibold">After offer: ₹{Math.round(t.discountedTotal).toLocaleString()}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OPTIONS SUMMARY TABLE with Floor and Room Columns */}
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden mt-6">
            <div className="bg-white text-black px-4 py-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="font-semibold">OPTIONS SUMMARY</h4>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllOptionsForSummary}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                    Select All
                  </button>
                  <button type="button" onClick={deselectAllOptionsForSummary}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                    Deselect All
                  </button>
                  <button
                    type="button"
                    onClick={addSummaryCombination}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Add Selected Combination
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">✓ Check the options you want to include in the quotation summary</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-center w-12">SELECT</th>
                    <th className="border p-2 text-left">Option</th>
                    <th className="border p-2 text-left">Subject</th>
                    <th className="border p-2 text-left">Floor</th>
                    <th className="border p-2 text-left">Room</th>
                    <th className="border p-2 text-left">Kit / Product Names</th>
                    <th className="border p-2 text-right">Original Total (₹)</th>
                    <th className="border p-2 text-right">Discount (₹)</th>
                    <th className="border p-2 text-right bg-green-50">Finalized Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {optionsSummary.map((opt, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border p-2 text-center">
                        <input
                          type="checkbox"
                          checked={currentSummarySelection.includes(idx)}
                          onChange={() => toggleCurrentSummaryOption(idx)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="border p-2 font-medium">{opt.option_name}</td>
                      <td className="border p-2">
                        {opt.subject ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-gray-800">{opt.subject}</span>
                            {opt.subject_type === 'master' && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Master</span>
                            )}
                            {opt.subject_type === 'custom' && (
                              <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Custom</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No subject</span>
                        )}
                      </td>
                      <td className="border p-2">
                        {opt.floor_name ? (
                          <span className="text-gray-700">{opt.floor_name}</span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="border p-2">
                        {opt.room_name ? (
                          <span className="text-gray-700">{opt.room_name}</span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="border p-2 text-gray-600 text-xs">
                        {opt.kit_names.substring(0, 60)}{opt.kit_names.length > 60 ? '...' : ''}
                      </td>
                      <td className="border p-2 text-right">₹{Math.round(opt.original_total).toLocaleString()}</td>
                      <td className="border p-2 text-right text-red-600">₹{Math.round(opt.discount_amount).toLocaleString()}</td>
                      <td className="border p-2 text-right font-bold text-green-700 bg-green-50">₹{Math.round(opt.finalized_total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SUMMARY COMBINATIONS with Floor and Room */}
          {selectedOptionsForSummary.length > 0 && (
            <div className="mt-6 border rounded-lg overflow-hidden">
              <div className="bg-blue-100 px-4 py-3">
                <h3 className="font-bold text-blue-800">
                  Selected Options Summary
                </h3>
              </div>

              <div className="p-4 space-y-3">
                {selectedOptionsForSummary.map((combo, comboIdx) => {
                  const comboOptions = combo.map(i => optionsSummary[i]);
                  const total = comboOptions.reduce(
                    (sum, opt) => sum + opt.finalized_total,
                    0
                  );

                  return (
                    <div
                      key={comboIdx}
                      className="border rounded p-3 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-blue-700">
                          Option Summary {comboIdx + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeSummaryCombination(comboIdx)}
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <table className="w-full text-sm border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border p-2 text-left">Option</th>
                            <th className="border p-2 text-left">Subject</th>
                            <th className="border p-2 text-left">Floor</th>
                            <th className="border p-2 text-left">Room</th>
                            <th className="border p-2 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comboOptions.map((opt, idx) => (
                            <tr key={idx}>
                              <td className="border p-2">
                                {opt.option_name}
                              </td>
                              <td className="border p-2">
                                {opt.subject || '-'}
                              </td>
                              <td className="border p-2">
                                {opt.floor_name || '-'}
                              </td>
                              <td className="border p-2">
                                {opt.room_name || '-'}
                              </td>
                              <td className="border p-2 text-right">
                                ₹{Math.round(opt.finalized_total).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-green-50 font-bold">
                          <tr>
                            <td colSpan={4} className="border p-2 text-right">
                              Combination Total
                            </td>
                            <td className="border p-2 text-right text-green-700">
                              ₹{Math.round(total).toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAYMENT INSTALLMENTS */}
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

                <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-2 mb-2 font-semibold text-gray-700 text-sm">
                  <div>Description</div>
                  <div>Percent (%)</div>
                  <div>Amount (₹)</div>
                  <div>Payment Mode</div>
                  <div></div>
                </div>

                {globalInstallmentRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-2 mb-2 items-center">
                    <input 
                      className="border px-2 py-1 rounded text-sm" 
                      placeholder="e.g., Advance Payment / Final Payment"
                      value={row.description} 
                      onChange={e => updateGlobalInstallmentRow(idx, 'description', e.target.value)} 
                    />
                    
                    <input 
                      type="number" 
                      className="border px-2 py-1 rounded text-sm" 
                      placeholder="%"
                      value={row.percentage === 0 ? '' : row.percentage}
                      onChange={e => updateGlobalInstallmentRow(idx, 'percentage', e.target.value)} 
                    />
                    
                    <input 
                      type="number" 
                      className="border px-2 py-1 rounded text-sm" 
                      placeholder="₹"
                      value={row.amount === 0 ? '' : row.amount}
                      onChange={e => updateGlobalInstallmentRow(idx, 'amount', e.target.value)} 
                    />
                    
                    <select 
                      className="border px-2 py-1 rounded text-sm bg-white"
                      value={row.payment_mode || 'Online'}
                      onChange={e => updateGlobalInstallmentRow(idx, 'payment_mode', e.target.value)}
                    >
                      <option value="Online">Online</option>
                      <option value="DD">DD</option>
                    </select>
                    
                    <div className="flex gap-1">
                      {idx === globalInstallmentRows.length - 1 && (
                        <button type="button" onClick={addGlobalInstallmentRow} 
                          className="bg-green-500 text-white px-2 rounded text-sm">+</button>
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

                {installmentsConfig.filter(c => c.selected).length > 0 && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
                    <span className="font-semibold">✓ Installments will be applied to: </span>
                    {installmentsConfig.filter(c => c.selected).map(c => c.option_name).join(', ')}
                  </div>
                )}
              </>
            )}
          </div>

          {/* submit */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => navigate('/quatation-pending')}>Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
              Update Quotation ({options.length} Option{options.length > 1 ? 's' : ''})
            </button>
          </div>
        </form>

        {/* single product popup */}
        {openSingleProductPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-[600px] max-w-full max-h-[90vh] overflow-y-auto">
              <h3 className="font-semibold text-lg mb-4">{isReplaceMode ? 'Replace Product in Kit' : `Add Single Product to ${activeOption.option_name}`}</h3>
              <div className="mb-3">
                <label className="block mb-1 font-medium text-sm">Category</label>
                <select className="border px-3 py-2 rounded w-full" value={spCategory}
                  onChange={e => { setSpCategory(e.target.value); fetchProductsByCategory(e.target.value); }}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.cat_id} value={c.cat_id}>{c.cat_name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium text-sm">Product Type</label>
                <select className="border px-3 py-2 rounded w-full" value={spType} disabled={!productTypes.length}
                  onChange={e => { const pt = productTypes.find(p => p.product_type_id == e.target.value); setSelectedPT(pt || null); setSpType(e.target.value); setSelectedBrand(null); setSpBrand(''); setSpModel(''); setSelectedSingleModel(null); setSpPrice(0); }}>
                  <option value="">Select Product Type</option>
                  {productTypes.map(pt => <option key={pt.product_type_id} value={pt.product_type_id}>{pt.product_type_name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium text-sm">Brand</label>
                <select className="border px-3 py-2 rounded w-full" value={spBrand} disabled={!selectedPT?.brands?.length}
                  onChange={e => { const b = selectedPT?.brands?.find(b => b.brand_id == e.target.value); setSelectedBrand(b || null); setSpBrand(e.target.value); setSpModel(''); setSelectedSingleModel(null); setSpPrice(0); }}>
                  <option value="">Select Brand</option>
                  {selectedPT?.brands?.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium text-sm">Model</label>
                <select className="border px-3 py-2 rounded w-full" value={spModel} disabled={!selectedBrand?.models?.length}
                  onChange={e => { const m = selectedBrand?.models?.find(m => m.model_id == e.target.value); setSelectedSingleModel(m || null); setSpModel(e.target.value); setSpPrice(m?.price || 0); setSpQty(1); }}>
                  <option value="">Select Model</option>
                  {selectedBrand?.models?.map(m => <option key={m.model_id} value={m.model_id}>{m.model_no}</option>)}
                </select>
              </div>
              {selectedSingleModel && (
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div><label className="font-medium text-sm">Quantity</label>
                    <input type="number" min={1} className="border px-3 py-2 rounded w-full" value={spQty} onChange={e => setSpQty(Number(e.target.value))} /></div>
                  <div><label className="font-medium text-sm">Unit Price</label>
                    <input type="number" min={0} step="0.01" className="border px-3 py-2 rounded w-full" value={spPrice} onChange={e => setSpPrice(Number(e.target.value))} /></div>
                </div>
              )}
              {selectedSingleModel?.description && (
                <div className="mb-3 text-sm text-gray-600 whitespace-pre-line border p-2 rounded bg-gray-50">
                  <span className="font-medium">Description:</span> {selectedSingleModel.description}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => { setOpenSingleProductPopup(false); setIsReplaceMode(false); setReplaceProductIndex(null); resetSpSelections(); }}
                  className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                <button onClick={handleAddSingleProduct} className="bg-blue-600 text-white px-3 py-1 rounded"
                  disabled={!spCategory || !selectedSingleModel}>
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

export default EditQuotation;