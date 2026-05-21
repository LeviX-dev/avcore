import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaDownload, FaArrowLeft, FaWhatsapp } from 'react-icons/fa';
import { BASE_URL } from '../../../public/config';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// ✅ Fix: Properly initialize pdfmake with fonts
pdfMake.vfs = pdfFonts.vfs || pdfFonts;

import logo from '../../../src/images/logo/AVCoreLogo.png';

// ─── Helper: Indian number formatting (lakhs/crores) ────────────────
const formatIndianNumber = (num) => {
  if (num === undefined || num === null) return '0';
  let numStr = Math.floor(Number(num)).toString();
  let lastThree = numStr.slice(-3);
  let otherNumbers = numStr.slice(0, -3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  let formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return formatted;
};

// ─── helpers ────────────────────────────────────────────────
const urlToBase64 = (url) =>
  new Promise((resolve) => {
    if (!url) {
      resolve('');
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxWidth = 300;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) { 
          resolve(''); 
          return; 
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error('Error converting image to base64:', error);
        resolve('');
      }
    };
    
    img.onerror = () => {
      console.warn('Failed to load image:', url);
      resolve('');
    };
    
    img.src = url;
  });

const getOptionTotalCost = (opt) => {
  const rev = opt.revision_details || {};
  const totalWithGST = Number(rev.total_with_gst || 0);
  const finalOfferAmount = opt.final_offer_amount || 0;
  const finalizedTotal = opt.finalized_total || 0;
  if (finalizedTotal > 0) return finalizedTotal;
  if (finalOfferAmount > 0) return finalOfferAmount;
  return totalWithGST;
};

// ─── component ──────────────────────────────────────────────
const ViewQuotation = () => {
  const { master_id, revision } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);


  // Helper function to check if option should hide the "OPTION X" label
const shouldHideOptionLabel = (opt) => {
  // Get the subject from the option
  const subject = opt.subject || '';
  
  // Define categories that should hide the "OPTION X" label
  const hideForCategories = [
    'Customised Acoustic Quotation',
    'Customised Recliners Quotation', 
    'Customised Optic Lights Quotation'
  ];
  
  // Check if the subject matches any of the categories (case insensitive)
  return hideForCategories.some(category => 
    subject.toLowerCase().includes(category.toLowerCase())
  );
};


  
  useEffect(() => {
    if (master_id && revision) fetchData();
  }, [master_id, revision]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/quotation/${master_id}/${revision}`);
      setLead(res.data.lead);
      setQuotation(res.data.quotation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!quotation) return <div className="p-4">No quotation found.</div>;

  const leadData = lead || {};


const handleDownloadPDF = async () => {
  if (!quotation) return;
  
   const shouldHideOptionLabel = (opt) => {
    const subject = opt.subject || '';
    const hideForCategories = [
      'Customised Acoustic Quotation',
      'Customised Recliners Quotation', 
      'Customised Optic Lights Quotation'
    ];
    return hideForCategories.some(category => 
      subject.toLowerCase().includes(category.toLowerCase())
    );
  };
  


  try {
    const logoBase64 = await urlToBase64(logo);
    const allOptions = quotation.options || [];

    // FOR MAIN CONTENT: Show ALL options
const optionsForContent = allOptions;

// Selected combinations
const selectedCombinations =
  quotation.selected_options_for_summary || [];

// ══════════════════════════════════════════════════════
// COMBINATION SUMMARY BLOCKS
// ══════════════════════════════════════════════════════
const combinationBlocks = [];

selectedCombinations.forEach((combo, comboIdx) => {

  const comboOptions = combo.map(i => allOptions[i]);

  const comboRows = comboOptions.map((opt, idx) => {

    const kitNames =
      (opt.items || [])
        .map(k => k.kit_name)
        .filter(Boolean)
        .join(', ') || 'Single Products';

    return [
      {
        text: (idx + 1).toString(),
        alignment: 'center',
        fontSize: 8,
      },

      {
        text: opt.option_name || '',
        fontSize: 8,
        bold: true,
      },

      {
        text: kitNames,
        fontSize: 7,
      },

      {
        text: `₹${formatIndianNumber(
          getOptionTotalCost(opt)
        )}`,
        alignment: 'right',
        bold: true,
        fontSize: 8,
        color: '#15803d',
      },
    ];
  });

  const comboTotal = comboOptions.reduce(
    (sum, opt) => sum + getOptionTotalCost(opt),
    0
  );

  combinationBlocks.push({
    margin: [0, 10, 0, 10],

    stack: [

      {
        table: {
          widths: ['*'],
          body: [[{
            text: `Option Summary ${comboIdx + 1}`,
            alignment: 'center',
            bold: true,
            fillColor: '#dbeafe',
            fontSize: 10,
            margin: [0, 4, 0, 4],
          }]],
        },
      },

      {
        table: {
          widths: ['8%', '32%', '40%', '20%'],

          body: [

            [
              {
                text: 'SR',
                bold: true,
                fillColor: '#f3f4f6',
                alignment: 'center',
                fontSize: 8,
              },

              {
                text: 'OPTION',
                bold: true,
                fillColor: '#f3f4f6',
                fontSize: 8,
              },

              {
                text: 'PRODUCTS',
                bold: true,
                fillColor: '#f3f4f6',
                fontSize: 8,
              },

              {
                text: 'COST',
                bold: true,
                fillColor: '#f3f4f6',
                alignment: 'right',
                fontSize: 8,
              },
            ],

            ...comboRows,

            [
              {
                text: 'Overall TOTAL',
                colSpan: 3,
                alignment: 'right',
                bold: true,
                fillColor: '#dcfce7',
                fontSize: 9,
              },
              {},
              {},

              {
                text: `₹${formatIndianNumber(comboTotal)}`,
                alignment: 'right',
                bold: true,
                fillColor: '#dcfce7',
                color: '#166534',
                fontSize: 9,
              },
            ],
          ],
        },
      },
    ],
  });
});

    // ══════════════════════════════════════════════════════
    // BUILD EACH OPTION BLOCK (FOR ALL OPTIONS)
    // ══════════════════════════════════════════════════════
    const optionContentBlocks = [];

    for (let optIdx = 0; optIdx < optionsForContent.length; optIdx++) {
      const opt = optionsForContent[optIdx];
      const rev = opt.revision_details || {};
      const totalWithoutGST   = Number(rev.total_without_gst || 0);
      const totalWithGST      = Number(rev.total_with_gst || 0);
      const gstBase           = Number(rev.gst_app_amt || 0);
      const gstPercent        = Number(rev.gst_percent || 18);
      const gstCalc           = Number(rev.gst_calculated_amount || 0);
      const showGST           = gstBase > 0;
      const additional_prices = opt.additional_prices || [];
      const finalOffer        = opt.final_offer;
      const finalOfferAmount  = opt.final_offer_amount || 0;
      const finalizedTotal    = opt.finalized_total || 0;
      const showFinalOffer    = finalOffer && finalOfferAmount > 0;
      const kitName           = opt.items?.[0]?.kit_name || '';
      const floorName         = opt.floor_name || '';
      const roomName          = opt.room_name || '';

      // ── SUBJECT BLOCK (shows option's individual subject) ──
      if (opt.subject) {
        optionContentBlocks.push({
          table: {
            widths: ['*'],
            body: [[{ 
              text: `SUB: ${opt.subject}`,
              alignment: 'center', 
              bold: true, 
              fontSize: 12,
              fillColor: '#ffffff',
              margin: [0, 8, 0, 8],
            }]],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },
          margin: [0, optIdx === 0 ? 0 : 20, 0, 5],
        });
      }

// OPTION + KIT BOX
const optionHeaderBody = [];

/* OPTION + KIT */
optionHeaderBody.push([
  {
    stack: [

      !shouldHideOptionLabel(opt)
        ? {
            text: (opt.option_name || `OPTION ${optIdx + 1}`).toUpperCase(),
            alignment: 'center',
            bold: true,
            fontSize: 13,
            decoration: 'underline',
            characterSpacing: 2,
            margin: [0, 0, 0, 4],
          }
        : {},

      {
        text: (kitName || '-').toUpperCase(),
        alignment: 'center',
        bold: true,
        fontSize: 11,
        characterSpacing: 2,
      },

    ],
    fillColor: '#dfefda',
    margin: [0, 8, 0, 8],
  }
]);

optionContentBlocks.push({
  table: {
    widths: ['*'],
    body: optionHeaderBody,
  },

  layout: {
    hLineWidth: () => 2,
    vLineWidth: () => 2,
    hLineColor: () => 'black',
    vLineColor: () => 'black',
  },

  margin: [0, opt.subject ? 0 : (optIdx === 0 ? 0 : 20), 0, 6],
});


// FLOOR BOX
if (floorName) {
  optionContentBlocks.push({
    table: {
      widths: ['*'],
      body: [[{
        text: floorName.toUpperCase(),
        alignment: 'center',
        bold: true,
        fontSize: 11,
        margin: [0, 7, 0, 7],
        fillColor: '#fdf2f8', // Light pink color (pink-50)
      }]],
    },

    layout: {
      hLineWidth: () => 2,
      vLineWidth: () => 2,
      hLineColor: () => 'black',
      vLineColor: () => 'black',
      fillColor: (rowIndex, node, columnIndex) => {
        return '#fdf2f8'; // Light pink background for all cells
      },
    },

    margin: [0, 0, 0, 6],
  });
}

// ROOM BOX
if (roomName) {
  optionContentBlocks.push({
    table: {
      widths: ['*'],
      body: [[{
        text: roomName.toUpperCase(),
        alignment: 'center',
        bold: true,
        fontSize: 11,
        margin: [0, 7, 0, 7],
        fillColor: '#fdf2f8', // Light pink color (pink-50)
      }]],
    },

    layout: {
      hLineWidth: () => 2,
      vLineWidth: () => 2,
      hLineColor: () => 'black',
      vLineColor: () => 'black',
      fillColor: (rowIndex, node, columnIndex) => {
        return '#fdf2f8'; // Light pink background for all cells
      },
    },

    margin: [0, 0, 0, 8],
  });
}

      // ── Products table
      const productRows = [];
      let counter = 1;
      
      for (const kit of opt.items || []) {
        for (const item of kit.items || []) {
          const imgUrl    = item.image_path ? `${BASE_URL}${item.image_path.replace(/^\//, '')}` : null;
          const imgBase64 = imgUrl ? await urlToBase64(imgUrl) : null;
          const qty       = Number(item.qty || 0);
          const total     = Number(item.price || 0);
          const unit      = qty > 0 ? total * qty : 0;
          
          const descItems = item.description
            ? item.description.split(',').map(d => d.trim()).filter(Boolean)
            : [];

          productRows.push([
            { text: counter.toString(), alignment: 'center', bold: true, fontSize: 10, margin: [0, 6, 0, 0] },
            {
              stack: [
                { text: (item.model || '').toUpperCase(), bold: true, decoration: 'underline', fontSize: 11, margin: [0, 0, 0, 2] },
                { ul: descItems, fontSize: 9, color: '#374151' },
                { text: `• Rs.${formatIndianNumber(item.price)}/- EACH`, bold: true, color: '#2563eb', fontSize: 10, margin: [0, 3, 0, 0] },
              ],
              margin: [4, 3, 4, 3],
            },
            {
              stack: [
                { text: `${qty} NOS.`, bold: true, fontSize: 10, alignment: 'center' },
                { text: `Rs.${formatIndianNumber(unit)}/-`, bold: true, fontSize: 10, alignment: 'center' },
              ],
              alignment: 'center',
              margin: [2, 6, 2, 3],
            },
            imgBase64
              ? { image: imgBase64, width: 60, height: 60, alignment: 'center', margin: [2, 3, 2, 3] }
              : { text: 'No Image', alignment: 'center', fontSize: 8, margin: [2, 6, 2, 3] },
          ]);
          counter++;
        }
      }

      if (productRows.length > 0) {
        optionContentBlocks.push({
          table: {
            headerRows: 1,
            widths: [30, '*', 80, 80],
            body: [
              [
                { text: 'NO', bold: true, alignment: 'center', fillColor: '#daeaf6', fontSize: 9, margin: [0, 4, 0, 4] },
                { text: 'PRODUCT DESCRIPTION', bold: true, alignment: 'center', fillColor: '#daeaf6', fontSize: 9, margin: [0, 4, 0, 4] },
                { text: 'QTY/PRICE', bold: true, alignment: 'center', fillColor: '#daeaf6', fontSize: 9, margin: [0, 4, 0, 4] },
                { text: 'PICTURE', bold: true, alignment: 'center', fillColor: '#daeaf6', fontSize: 9, margin: [0, 4, 0, 4] },
              ],
              ...productRows,
            ],
          },
          layout: {
            hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 2 : 1),
            vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 2 : 1),
            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },
          margin: [0, 0, 0, 0],
        });
      }

      // ── Summary section for this option
      const summaryBody = [];

      summaryBody.push([
        { text: 'TOTAL COST', alignment: 'center', bold: true, fontSize: 15, fillColor: '#f2f2f2', color: '#16a34a', margin: [0, 4, 0, 4] },
        { text: `Rs.${formatIndianNumber(totalWithoutGST)}/-`, alignment: 'center', bold: true, fontSize: 15, color: '#16a34a', margin: [0, 4, 0, 4] },
      ]);

      additional_prices.filter(a => Number(a.price) > 0).forEach(add => {
        summaryBody.push([
          { text: add.add_price_name.toUpperCase(), alignment: 'center', bold: true, fontSize: 10, color: '#000000', margin: [4, 3, 4, 3] },
          { text: `Rs.${formatIndianNumber(add.price)}/-`, alignment: 'center', bold: true, fontSize: 10, color: '#000000', margin: [0, 3, 0, 3] },
        ]);
      });

      if (showGST) {
        summaryBody.push([
          { text: `${gstPercent}% GST ON ${formatIndianNumber(gstBase)}`, alignment: 'center', bold: true, fontSize: 15, color: '#000000', margin: [0, 4, 0, 4] },
          { text: formatIndianNumber(gstCalc), alignment: 'center', bold: true, fontSize: 15, color: '#000000', margin: [0, 4, 0, 4] },
        ]);
      }

      summaryBody.push([
        { text: 'TOTAL COST OF PROJECT IN RS.', alignment: 'center', bold: true, fontSize: 16, fillColor: '#f2f2f2', color: '#1e3a8a', margin: [0, 5, 0, 5] },
        { text: `Rs.${formatIndianNumber(totalWithGST > 0 ? totalWithGST : totalWithoutGST)}/-`, alignment: 'center', bold: true, fontSize: 16, color: '#1e3a8a', margin: [0, 5, 0, 5] },
      ]);

      if (showFinalOffer) {
        summaryBody.push([
          { text: (finalOffer.description || 'FINAL BEST OFFER').toUpperCase(), alignment: 'center', bold: true, fontSize: 15, fillColor: '#e2f0d9', color: '#b45f06', margin: [0, 4, 0, 4] },
          { text: `Rs.${formatIndianNumber(finalOfferAmount)}/-`, alignment: 'center', bold: true, fontSize: 15, color: '#b45f06', fillColor: '#e2f0d9', margin: [0, 4, 0, 4] },
        ]);
        summaryBody.push([
          { text: 'FINALIZED TOTAL COST OF PROJECT', alignment: 'center', bold: true, fontSize: 16, fillColor: '#f0fdf4', color: '#15803d', margin: [0, 5, 0, 5] },
          { text: `Rs.${formatIndianNumber(finalizedTotal)}/-`, alignment: 'center', bold: true, fontSize: 16, fillColor: '#f0fdf4', color: '#15803d', margin: [0, 5, 0, 5] },
        ]);
      }

      optionContentBlocks.push({
        table: { widths: ['*', 150], body: summaryBody },
        layout: {
          hLineWidth: () => 2,
          vLineWidth: () => 2,
          hLineColor: () => 'black',
          vLineColor: () => 'black',
        },
        margin: [0, 0, 0, optIdx < optionsForContent.length - 1 ? 20 : 10],
      });
    }

    // ══════════════════════════════════════════════════════
    // OPTIONS SUMMARY TABLE (ONLY SELECTED OPTIONS)
    // ══════════════════════════════════════════════════════
    const summaryRows = optionsSummaryData.map((o, idx) => [
      { text: (idx + 1).toString(), alignment: 'center', fontSize: 9, bold: true },
      { text: o.option_name, alignment: 'left', fontSize: 9, bold: true },
      { text: o.kit_names.length > 80 ? o.kit_names.substring(0, 80) + '...' : o.kit_names, alignment: 'left', fontSize: 8, color: '#4b5563' },
      { text: `₹${formatIndianNumber(o.final_cost)}`, alignment: 'right', fontSize: 9, bold: true, color: '#15803d' },
    ]);

    const optionsSummaryBlock = {
      margin: [0, 10, 0, 20],
      stack: [
        {
          table: {
            widths: ['*'],
            body: [[{ 
              text: 'OPTIONS SUMMARY', 
              alignment: 'center', 
              bold: true, 
              fontSize: 10, 
              color: '#000000', 
              margin: [0, 4, 0, 4] 
            }]],
          },
        },
        {
          table: {
            widths: ['8%', '50%', '27%', '15%'],
            headerRows: 1,
            body: [
              [
                { text: 'SR NO', bold: true, alignment: 'center', fillColor: '#f3f4f6', fontSize: 8, margin: [0, 4, 0, 4] },
                { text: 'SUBJECT', bold: true, alignment: 'left', fillColor: '#f3f4f6', fontSize: 8, margin: [0, 4, 0, 4] },
                { text: 'PRODUCTS', bold: true, alignment: 'left', fillColor: '#f3f4f6', fontSize: 8, margin: [0, 4, 0, 4] },
                { text: 'COST (₹)', bold: true, alignment: 'right', fillColor: '#f3f4f6', fontSize: 8, margin: [0, 4, 0, 4] },
              ],
              ...summaryRows,
              [
                { text: 'OVERALL TOTAL:', colSpan: 3, alignment: 'right', bold: true, fontSize: 10, fillColor: '#e5e7eb', margin: [0, 3, 4, 3] },
                {}, {},
                { text: `₹${formatIndianNumber(overallTotal)}`, alignment: 'right', bold: true, fontSize: 10, fillColor: '#e5e7eb', color: '#14532d', margin: [0, 3, 0, 3] },
              ],
            ],
          },
        },
      ],
    };

    // ══════════════════════════════════════════════════════
    // BANK DETAILS
    // ══════════════════════════════════════════════════════
    const bankRows = [
      ['Account Name:', 'AV Core'],
      ['Account Type:', 'Current'],
      ['Account Number:', '5412214649'],
      ['Bank Name:', 'Kotak Mahindra Bank'],
      ['IFSC Code:', 'KKBK0001767'],
      ['Branch:', 'Baner Pune'],
    ];

    const bankTableDef = {
      stack: [
        {
          table: {
            widths: ['*'],
            body: [[{ text: 'BANK DETAILS', alignment: 'center', bold: true, color: 'white', fillColor: 'black', fontSize: 10, margin: [0, 4, 0, 4] }]],
          },
        },
        {
          table: {
            widths: ['40%', '*'],
            body: bankRows.map(([label, value], i) => [
              { text: label, bold: true, fillColor: i % 2 === 0 ? '#e5e7eb' : null, margin: [4, 3, 0, 3], fontSize: 9 },
              { text: value, bold: true, fillColor: i % 2 === 0 ? '#e5e7eb' : null, margin: [4, 3, 0, 3], fontSize: 9 },
            ]),
          },
        },
      ],
    };

    // ══════════════════════════════════════════════════════
    // INSTALLMENTS (ONLY FOR SELECTED OPTIONS)
    // ══════════════════════════════════════════════════════
const allInstallments = optionsForContent
  .filter(opt => opt.installments && opt.installments.length > 0)
  .map(opt => ({ option_name: opt.option_name, installments: opt.installments }));

// In handleDownloadPDF function, update the installments table definition:

const installmentsTableDef = allInstallments.length > 0
  ? {
      stack: [
        {
          table: {
            widths: ['*'],
            body: [[{ text: 'PAYMENT INSTALLMENTS', alignment: 'center', bold: true, color: 'white', fillColor: 'black', fontSize: 10, margin: [0, 4, 0, 4] }]],
          },
        },
        ...allInstallments.map(optInst => ({
          table: {
            widths: ['*', 60, 80],  // Added width for Payment Mode column
            body: [
              [{ text: optInst.option_name, bold: true, alignment: 'center', fillColor: '#fef3c7', colSpan: 3, fontSize: 8, margin: [0, 2, 0, 2] }, {}, {}],
              [
                { text: 'DESCRIPTION', bold: true, alignment: 'left', fillColor: '#e5e7eb', fontSize: 8, margin: [0, 2, 0, 2] },
                { text: 'PERCENT (%)', bold: true, alignment: 'center', fillColor: '#e5e7eb', fontSize: 8, margin: [0, 2, 0, 2] },
                { text: 'PAYMENT MODE', bold: true, alignment: 'center', fillColor: '#e5e7eb', fontSize: 8, margin: [0, 2, 0, 2] },
              ],
              ...optInst.installments.map((inst, i) => [
                { text: inst.description || '-', margin: [3, 2, 0, 2], fontSize: 8, fillColor: i % 2 === 0 ? '#ffffff' : '#f3f4f6' },
                { text: `${inst.percentage}%`, alignment: 'center', bold: true, fontSize: 8, fillColor: i % 2 === 0 ? '#ffffff' : '#f3f4f6' },
                { 
                  text: inst.payment_mode || 'Online', 
                  alignment: 'center', 
                  bold: true, 
                  fontSize: 8, 
                  fillColor: i % 2 === 0 ? '#ffffff' : '#f3f4f6',
                  color: (inst.payment_mode || 'Online') === 'DD' ? '#d97706' : '#059669'
                },
              ]),
            ],
          },
          margin: [0, 4, 0, 0],
        })),
      ],
    }
  : null;

// ══════════════════════════════════════════════════════
// ACOUSTIC TERMS
// ══════════════════════════════════════════════════════
const acousticBlock = quotation.acoustic_terms
  ? [{
      margin: [0, 16, 0, 10],
      table: {
        widths: ['*'],
        body: [
          // Split each line into separate bordered rows
          ...quotation.acoustic_terms
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => ([
              {
                text: line,
                fontSize: 9,
                margin: [6, 5, 6, 5],
                fillColor: '#ffffff',
              }
            ])),
        ],
      },

      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => 'black',
        vLineColor: () => 'black',
      },
    }]
  : [];

    // ══════════════════════════════════════════════════════
    // TERMS LIST
    // ══════════════════════════════════════════════════════
    const termsList = [
      'Light work, Light accessories, Door fixing, AC, Painting, Door lock, AV rack, Water supply, Tiles, Poster, Door, Carpet, POP false ceiling, Recliner, Switch boards, other electrical work and apart from seating arrangement are from customer side only.',
      'Door and AV rack will be done by in-house carpenter.',
      `18% GST applicable ${quotation.type === 'with_gst' ? 'INCLUDED.' : 'Extra.'}`,
      'Warranty covers as per the brand norms.',
      'Cable is sold as per actual requirement on site, i.e., Speaker cable, HDMI cable & Sub-woofer cable.',
      'Delivery of materials will take maximum 7 working days from the date of approval along with 50% of advance payment, 40% before dispatch of materials and 10% after the installation.',
      'Carpet /Sanitary / Hardware and Electric electrician goods will be provided by Client Side.',
      'Transport and Flight charges will be charged by client Side.',
      'Supply of framing and fabric installation of 12mm gripper onto ply batons will be provided by client.',
      'Supply and installation of Acoustic infill and foam between the batons will be provided by AV CORE.',
      'The prices quoted are based on ex-site basis.',
      "All the civil, carpenter, electrical and air conditioning work will be in client's scope.",
      'In-case of any variations in the order quantities/measurements, we may have to re-quote the prices.',
      'Safe and secure storage space for materials to be provided by client.',
      'Scaffolding with the planks/ladder to be provided by client.',
      'Uninterrupted electricity, water, lighting, wiring points to be provided on the location without any cost.',
      'All wet work should be completed before handing over the site.',
      'Isolated dumping rubber should be provided from client side.',
      'No returns/ claims shall be entertained.',
      'Prices are subject to change due to volatility in Forex Market & Valid only for 15 Days from the date of Quotation.',
      'Quotation may change later if non-Availability of Stock with Company or Out-dated Models from Company.',
      'UPS Supply / voltage stabilizer with surge suppressor is strongly recommended to prevent problems due to Voltage fluctuations.',
    ];

    // ══════════════════════════════════════════════════════
    // COMPLETE DOC DEFINITION
    // ══════════════════════════════════════════════════════
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [28, 28, 28, 28],
      content: [
        // 1. Company Header
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'AV CORE', fontSize: 44, bold: true, color: '#5d3a9e', margin: [0, 0, 0, 3] },
                { text: 'ALL ABOUT AUDIO VIDEO', bold: true, fontSize: 13, margin: [0, 0, 0, 3], color: '#000000' },
                { text: '1st FLOOR GAYATRI BUILDING BESIDE JUPITER HOSPITAL, BANER 411045, PUNE.', fontSize: 11, bold: true, margin: [0, 0, 0, 2], color: '#000000' },
                { text: [{ text: 'Email: ', bold: true, fontSize: 11 }, { text: 'avcoreindia@gmail.com', color: '#2563eb', bold: true, fontSize: 11 }], margin: [0, 0, 0, 2] },
                { text: [{ text: 'Website: ', bold: true, fontSize: 11 }, { text: 'www.avcore.in', color: '#2563eb', bold: true, fontSize: 11 }], margin: [0, 0, 0, 2] },
                { text: 'CO.NO: 8329728210 / 8766786026', fontSize: 11, bold: true, color: '#000000' },
              ],
            },
            logoBase64
              ? {
                  width: 96,
                  image: logoBase64,
                  width: 90,
                  alignment: 'right',
                  margin: [0, 0, 0, 0],
                }
              : { width: 96, text: '' },
          ],
          margin: [0, 0, 0, 14],
        },

        // 2. CLIENT INFORMATION
        {
          table: { widths: ['*'], body: [[{ text: 'CLIENT INFORMATION', alignment: 'center', bold: true, fillColor: '#dfefda', fontSize: 10, margin: [0, 3, 0, 3] }]] },
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: [{ text: 'NAME: ', bold: true, fontSize: 10 }, { text: lead?.name || '', bold: true, fontSize: 10 }], margin: [4, 3, 4, 2] },
                { text: [{ text: 'CONTACT: ', bold: true, fontSize: 10 }, { text: lead?.number || '', bold: true, fontSize: 10 }], alignment: 'right', margin: [4, 3, 4, 2] },
              ],
              [
                { text: [{ text: 'ADDRESS: ', bold: true, fontSize: 10 }, { text: lead?.city || '', bold: true, fontSize: 10 }], margin: [4, 2, 4, 3] },
                {
                  text: [
                    { text: 'DATE: ', bold: true, fontSize: 10 },
                    { text: quotation.created_at ? new Date(quotation.created_at).toLocaleDateString('en-GB') : '', bold: true, fontSize: 10 },
                  ],
                  alignment: 'right', margin: [4, 2, 4, 3],
                },
              ],
            ],
          },
          layout: {
            fillColor: () => '#eff6ff',
            hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 2 : 0),
            vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 2 : 0),
            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },
          margin: [0, 0, 0, 12],
        },

        // 3. Main Quotation Subject (Global)
        ...(quotation.subject ? [{
          table: {
            widths: ['*'],
            body: [[{
              text: `SUB – ${quotation.subject}`,
              alignment: 'center', bold: true, decoration: 'underline', fillColor: '#f2f2f2', fontSize: 10, margin: [0, 3, 0, 3],
            }]],
          },
          margin: [0, 0, 0, 12],
        }] : []),

        // 4. All option blocks (ALL OPTIONS)
        ...optionContentBlocks,

        // 5. Acoustic terms
        ...acousticBlock,

        // 6. Options Summary table (ONLY SELECTED OPTIONS)
...combinationBlocks,
        // 7. Bank + Installments side by side
        {
          columns: [
            { width: '48%', ...bankTableDef },
            installmentsTableDef
              ? { width: '48%', ...installmentsTableDef }
              : { width: '48%', text: '' },
          ],
          columnGap: 12,
          margin: [0, 16, 0, 20],
        },

        // 8. Terms & Conditions
        { text: 'TERMS & CONDITIONS: -', fontSize: 16, bold: true, color: '#2563eb', decoration: 'underline', margin: [0, 0, 0, 6] },
        {
          ul: termsList.map((t, i) =>
            i === 2 ? { text: t, bold: true, fontSize: 9 } : { text: t, fontSize: 9 }
          ),
          margin: [0, 0, 0, 20],
        },
      ],
      defaultStyle: { fontSize: 9 },
    };

    pdfMake.createPdf(docDefinition).download(`quotation-${quotation.qt_number || 'download'}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};


  // ─── HTML VIEW ───────────────────────────────────────────
  const options = quotation?.options || [];

  const optionsSummaryData = options.map((opt, idx) => {
    const rev = opt.revision_details || {};
    const totalWithGST     = Number(rev.total_with_gst || 0);
    const finalOfferAmount = opt.final_offer_amount || 0;
    const finalizedTotal   = opt.finalized_total || 0;
    const kitNames = (opt.items || []).map(kit => kit.kit_name).filter(Boolean).join(', ') || 'Single Products';
    const subjectName = quotation.options?.[0]?.items?.[0]?.items?.[0]?.cat_name || '';
    return {
      option_name: subjectName
        ? `${subjectName} ( ${opt.option_name || `OPTION ${idx + 1}`} )`
        : (opt.option_name || `OPTION ${idx + 1}`),
      kit_names: kitNames,
      original_total: totalWithGST,
      discount_amount: finalOfferAmount,
      finalized_total: finalizedTotal,
      final_cost: getOptionTotalCost(opt),
      has_installments: opt.installments && opt.installments.length > 0,
      floor_name: opt.floor_name || '',
      room_name: opt.room_name || '',
    };
  });

  const overallTotal = optionsSummaryData.reduce((sum, opt) => sum + opt.final_cost, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded">

      {/* buttons */}
      <div className="flex justify-between mb-6">
        <button onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-700">
          <FaArrowLeft /> Back
        </button>
        <button onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
          <FaDownload /> Download PDF
        </button>
      </div>

      {/* company header - exact match to reference - NO CHANGES */}
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col text-left">
          <h1 className="text-5xl font-bold mb-1" style={{
            background: 'linear-gradient(90deg, #431043, #d34681)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Libre Baskerville, serif'
          }}>AV CORE</h1>
          <p className="font-extrabold text-[13px] text-black uppercase tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
            ALL ABOUT AUDIO VIDEO
          </p>
          <p className="text-[12px] font-bold text-black leading-relaxed mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            📞 1st FLOOR GAYATRI BUILDING BESIDE JUPITER HOSPITAL,<br />
            BANER 411045, PUNE
          </p>
          <p className="text-[13px] font-bold text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            📧 Email: <span className="text-blue-600">avcoreindia@gmail.com</span>
          </p>
          <p className="text-[13px] font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
            🌐 Website: <span className="text-blue-600">www.avcore.in</span>
          </p>
          <p className="text-[12px] font-extrabold !text-black uppercase mt-1 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#000' }}>
            <FaWhatsapp style={{ color: "#25D366" }} />
            CO.NO: 8329728210 / 8766786026
          </p>
        </div>
        <div className="bg-black p-1 ml-4 flex-shrink-0">
          <img src={logo} className="w-24 h-auto border border-black" alt="Logo" />
        </div>
      </div>

      {/* client info */}
      <div className="border-2 border-black bg-[#dfefda] font-extrabold text-black text-center">
        <p>CLIENT INFORMATION</p>
      </div>
      <div className="border-2 border-black bg-blue-50 p-2 mb-6">
        <div className="flex justify-between items-start text-[14px] leading-tight">
          <div className="space-y-1">
            <p><span className="font-extrabold text-black">NAME:</span> <span className="font-extrabold">{leadData.name}</span></p>
            <p><span className="font-extrabold text-black">ADDRESS:</span> <span className="font-extrabold">{leadData.city}</span></p>
          </div>
          <div className="space-y-1 whitespace-nowrap">
            <p><span className="font-extrabold text-black">CONTACT:</span> <span className="font-extrabold">{leadData.number}</span></p>
            <p><span className="font-extrabold text-black">DATE:</span> <span className="font-extrabold">{new Date(quotation.created_at).toLocaleDateString('en-GB')}</span></p>
          </div>
        </div>
      </div>



      {/* ── Render each option ── */}
      {options.map((opt, optIdx) => {
        const rev = opt.revision_details || {};
        const totalWithoutGST  = Number(rev.total_without_gst || 0);
        const totalWithGST     = Number(rev.total_with_gst || 0);
        const gstBase          = Number(rev.gst_app_amt || 0);
        const gstPercent       = Number(rev.gst_percent || 18);
        const gstCalc          = Number(rev.gst_calculated_amount || 0);
        const showGST          = gstBase > 0;
        const finalOffer       = opt.final_offer;
        const finalOfferAmount = opt.final_offer_amount || 0;
        const finalizedTotal   = opt.finalized_total || 0;
        const showFinalOffer   = finalOffer && finalOfferAmount > 0;
        const floorName        = opt.floor_name || '';
        const roomName         = opt.room_name || '';

        return (
          <div key={optIdx} className={optIdx > 0 ? 'mt-10' : ''}>
{opt.subject && (
  <div className="border border-black bg-white text-center py-2 mb-3">
    <p className="text-lg font-bold text-black">
      SUB: {opt.subject}
      {opt.subject_type === 'custom' && (
        <span className="ml-2 text-black"></span>
      )}
      {opt.subject_type === 'master' && (
        <span className="ml-2 text-black"></span>
      )}
    </p>
  </div>
)}
      
{/* Option Header Section */}
<div className="space-y-2 mb-2">

  {/* ROW 1 : OPTION + KIT NAME */}
  <div className="border-2 border-black bg-[#dfefda] text-center py-3">

    {!shouldHideOptionLabel(opt) && (
      <p className="text-[16px] font-bold tracking-widest uppercase text-black underline">
        {opt.option_name || `OPTION ${optIdx + 1}`}
      </p>
    )}

    <p className="text-[14px] font-bold tracking-widest uppercase text-black mt-1">
      {opt.items?.[0]?.kit_name || '-'}
    </p>

  </div>

{/* ROW 2 : FLOOR */}
{floorName && (
  <div className="border-2 border-black bg-pink-50 text-center py-2">
    <p className="text-[14px] font-bold uppercase text-black">
      {floorName}
    </p>
  </div>
)}

{/* ROW 3 : ROOM */}
{roomName && (
  <div className="border-2 border-black bg-pink-50 text-center py-2">
    <p className="text-[14px] font-bold uppercase text-black">
      {roomName}
    </p>
  </div>
)}



</div>

            <table className="w-full border-collapse border-2 border-black text-[12px]">
              <thead>
                <tr className="bg-[#daeaf6]">
                  <th className="border-2 border-black p-1 w-8 font-extrabold">NO</th>
                  <th className="border-2 border-black p-1 font-extrabold">PRODUCT DESCRIPTION</th>
                  <th className="border-2 border-black p-1 w-24 font-extrabold">QTY/PRICE</th>
                  <th className="border-2 border-black p-1 w-24 font-extrabold">PICTURE</th>
                </tr>
              </thead>
              <tbody>
                {(opt.items || []).flatMap((kit, ki) =>
                  (kit.items || []).map((item, idx) => {
                    const globalIdx = (opt.items || []).slice(0, ki).reduce((s, k) => s + (k.items || []).length, 0) + idx;
                    return (
                      <tr key={`${ki}-${idx}`} className="border-b-2 border-black">
                        <td className="border-2 border-black p-1.5 text-center font-black align-top">{globalIdx + 1}</td>
                        <td className="border-2 border-black p-1.5 align-top">
                          <div className="text-black font-extrabold underline mb-1 uppercase text-[13px]">{item.model}</div>
                          <ul className="list-disc pl-4 space-y-0.5 font-bold text-gray-800 leading-tight">
                            {item.description && item.description.split(',').map((desc, i) => (
                              <li key={i}>{desc.trim()}</li>
                            ))}
                          </ul>
                          <div className="font-black text-blue-600 mt-2 text-[12px]">
                            • Rs.{formatIndianNumber(Number(item.price ))}/- EACH
                          </div>
                        </td>
                        <td className="border-2 border-black p-1.5 text-center align-middle">
                          <div className="text-black font-extrabold mb-1 uppercase">{item.qty} NOS.</div>
                          <div className="text-black font-extrabold"> • Rs.{formatIndianNumber(Number(item.price * (parseInt(item.qty) || 1)))}</div>
                        </td>
                        <td className="border-2 border-black p-1.5 text-center align-middle">
                          <img
                            src={item.image_path ? `${BASE_URL}${item.image_path.replace(/^\//, '')}` : 'https://via.placeholder.com/80'}
                            className="w-20 mx-auto object-contain" alt="Product"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="w-full border-x-2 border-b-2 border-black text-[11px] font-black">
              <div className="flex border-b-2 border-black">
                <div className="flex-1 p-1.5 text-center border-r-2 border-black uppercase tracking-widest bg-[#f2f2f2] font-extrabold text-green-600 text-[18px]">TOTAL COST</div>
                <div className="w-48 p-1.5 text-center font-extrabold text-green-600 text-[18px]">Rs.{formatIndianNumber(totalWithoutGST)}/-</div>
              </div>
              {(opt.additional_prices || []).filter(a => Number(a.price) > 0).map((add, idx) => (
                <div key={idx} className="flex border-b-2 border-black">
                  <div className="flex-1 p-1.5 text-center border-r-2 border-black uppercase text-black font-extrabold text-[14px]">{add.add_price_name}</div>
                  <div className="w-48 p-1.5 text-center text-black font-extrabold text-[14px]">Rs.{formatIndianNumber(add.price)}/-</div>
                </div>
              ))}
              {showGST && (
                <div className="flex border-b-2 border-black">
                  <div className="flex-1 p-1.5 text-center border-r-2 border-black uppercase font-extrabold text-black text-[18px]">
                    {gstPercent}% GST ON {formatIndianNumber(gstBase)}
                  </div>
                  <div className="w-48 p-1.5 text-center font-extrabold text-black text-[18px]">{formatIndianNumber(gstCalc)}</div>
                </div>
              )}
              <div className="flex border-b-2 border-black">
                <div className="flex-1 p-2 text-center border-r-2 border-black uppercase font-extrabold text-blue-900 text-[20px] bg-[#f2f2f2]">TOTAL COST OF PROJECT IN Rs.</div>
                <div className="w-48 p-2 text-center font-extrabold text-blue-900 text-[20px]">
                  Rs.{formatIndianNumber(totalWithGST > 0 ? totalWithGST : totalWithoutGST)}/-
                </div>
              </div>
              {showFinalOffer && (
                <div className="flex border-b-2 border-black bg-[#e2f0d9]">
                  <div className="flex-1 p-2 text-center border-r-2 border-black uppercase font-extrabold text-[#b45f06] text-[18px]">
                    {finalOffer.description || 'FINAL BEST OFFER'}
                  </div>
                  <div className="w-48 p-2 text-center font-extrabold text-[#b45f06] text-[18px]">Rs.{formatIndianNumber(finalOfferAmount)}/-</div>
                </div>
              )}
              {showFinalOffer && (
                <div className="flex bg-green-50">
                  <div className="flex-1 p-2 text-center border-r-2 border-black uppercase font-extrabold text-green-700 text-[20px] bg-[#f2f2f2]">FINALIZED TOTAL COST OF PROJECT</div>
                  <div className="w-48 p-2 text-center font-extrabold text-green-700 text-[20px]">Rs.{formatIndianNumber(finalizedTotal)}/-</div>
                </div>
              )}
            </div>
          </div>
        );
      })}

{/* Acoustic Terms - Tabular Format */}
{quotation.acoustic_terms && (
  <div className="mt-6">
    <table className="w-full border border-black border-collapse text-xs">
      <tbody>
        {quotation.acoustic_terms
          .split("\n")
          .filter(line => line.trim() !== "")
          .map((line, index) => (
            <tr key={index}>
              <td className="border border-black px-3 py-2 leading-relaxed">
                {line}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
)}


{/* Combination Summary */}
<div className="mt-8 space-y-6">

  {(quotation.selected_options_for_summary || []).map((combo, comboIdx) => {

    const comboOptions = combo.map(i => optionsSummaryData[i]);

    const comboTotal = comboOptions.reduce(
      (sum, opt) => sum + opt.final_cost,
      0
    );

    return (
      <div
        key={comboIdx}
        className="border-2 border-gray-300 rounded-lg overflow-hidden"
      >

        <div className="bg-blue-100 px-4 py-3 text-center">
          <h4 className="font-bold text-blue-800">
            Options Summary {comboIdx + 1}
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">

            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-center w-16">
                  SR NO
                </th>

                <th className="border p-2 text-left">
                  OPTION
                </th>

                <th className="border p-2 text-left">
                  PRODUCTS
                </th>

                <th className="border p-2 text-right w-32">
                  COST (₹)
                </th>
              </tr>
            </thead>

            <tbody>

              {comboOptions.map((opt, idx) => (

                <tr key={idx}>

                  <td className="border p-2 text-center font-medium">
                    {idx + 1}
                  </td>

                  <td className="border p-2 font-medium">
                    {opt.option_name}
                  </td>

                  <td className="border p-2 text-xs text-gray-600">
                    {opt.kit_names}
                  </td>

                  <td className="border p-2 text-right font-bold text-green-700">
                    ₹{formatIndianNumber(opt.final_cost)}
                  </td>

                </tr>

              ))}

              <tr className="bg-green-100 font-bold">

                <td
                  colSpan={3}
                  className="border p-2 text-right"
                >
                  Overall Total
                </td>

                <td className="border p-2 text-right text-green-800">
                  ₹{formatIndianNumber(comboTotal)}
                </td>

              </tr>

            </tbody>

          </table>
        </div>
      </div>
    );
  })}
</div>


      {/* footer */}
      <div className="mt-8">
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="border-2 border-black overflow-hidden">
            <div className="bg-black text-white text-center py-2 font-bold text-sm tracking-wider uppercase">BANK DETAILS</div>
            <table className="w-full text-[13px] border-collapse">
              <tbody>
                {[
                  ['Account Name:', 'AV Core'],
                  ['Account Type:', 'Current'],
                  ['Account Number:', '5412214649'],
                  ['Bank Name:', 'Kotak Mahindra Bank'],
                  ['IFSC Code:', 'KKBK0001767'],
                  ['Branch:', 'Baner Pune'],
                ].map((item, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className={`px-3 py-2 border-r border-black font-bold ${idx % 2 === 0 ? 'bg-gray-100' : 'bg-white'} w-2/5`}>{item[0]}</td>
                    <td className={`px-3 py-2 font-semibold ${idx % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>{item[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
{/* Payment Installments Section - Updated with Payment Mode */}
{options.filter(opt => opt.installments && opt.installments.length > 0).length > 0 && (
  <div className="border-2 border-black overflow-hidden">
    <div className="bg-black text-white text-center py-2 font-bold text-sm tracking-wider uppercase">PAYMENT INSTALLMENTS</div>
    <div className="max-h-64 overflow-y-auto">
      {options.map((opt, optIdx) => {
        if (!opt.installments || opt.installments.length === 0) return null;
        return (
          <div key={optIdx} className="mb-2">
            <div className="bg-yellow-100 px-2 py-1 font-bold text-xs text-center border-b border-black">{opt.option_name}</div>
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-2 py-1 border-r border-black font-bold text-left">DESCRIPTION</th>
                  <th className="px-2 py-1 border-r border-black font-bold text-center w-20">PERCENT (%)</th>
                  <th className="px-2 py-1 font-bold text-center w-28">PAYMENT MODE</th>
                </tr>
              </thead>
              <tbody>
                {opt.installments.map((inst, idx) => (
                  <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'} border-b border-black`}>
                    <td className="px-2 py-1 border-r border-black text-left text-xs">{inst.description || '-'}</td>
                    <td className="px-2 py-1 border-r border-black text-center font-semibold text-xs">{inst.percentage}%</td>
                    <td className={`px-2 py-1 text-center font-semibold text-xs ${(inst.payment_mode || 'Online') === 'DD' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {inst.payment_mode || 'Online'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  </div>
)}
        </div>
        <h3 className="text-xl font-bold text-blue-600 underline mb-4 decoration-2 underline-offset-4">TERMS & CONDITIONS: -</h3>
        <div className="text-left text-[12px] leading-tight text-black space-y-2">
          <ul className="list-disc pl-5 space-y-1 font-medium">
            {[
              'Light work, Light accessories, Door fixing, AC, Painting, Door lock, AV rack, Water supply, Tiles, Poster, Door, Carpet, POP false ceiling, Recliner, Switch boards, other electrical work and apart from seating arrangement are from customer side only.',
              'Door and AV rack will be done by in-house carpenter.',
              `18% GST applicable ${quotation.type === 'with_gst' ? 'INCLUDED.' : 'Extra.'}`,
              'Warranty covers as per the brand norms.',
              'Cable is sold as per actual requirement on site, i.e., Speaker cable, HDMI cable & Sub-woofer cable.',
              'Delivery of materials will take maximum 7 working days from the date of approval along with 50% of advance payment, 40% before dispatch of materials and 10% after the installation.',
              'Carpet /Sanitary / Hardware and Electric electrician goods will be provided by Client Side.',
              'Transport and Flight charges will be charged by client Side.',
              'Supply of framing and fabric installation of 12mm gripper onto ply batons will be provided by client.',
              'Supply and installation of Acoustic infill and foam between the batons will be provided by AV CORE.',
              'The prices quoted are based on ex-site basis.',
              "All the civil, carpenter, electrical and air conditioning work will be in client's scope.",
              'In-case of any variations in the order quantities/measurements, we may have to re-quote the prices.',
              'Safe and secure storage space for materials to be provided by client.',
              'Scaffolding with the planks/ladder to be provided by client.',
              'Uninterrupted electricity, water, lighting, wiring points to be provided on the location without any cost.',
              'All wet work should be completed before handing over the site.',
              'Isolated dumping rubber should be provided from client side.',
              'No returns/ claims shall be entertained.',
              'Prices are subject to change due to volatility in Forex Market & Valid only for 15 Days from the date of Quotation.',
              'Quotation may change later if non-Availability of Stock with Company or Out-dated Models from Company.',
              'UPS Supply / voltage stabilizer with surge suppressor is strongly recommended to prevent problems due to Voltage fluctuations.',
            ].map((t, i) => <li key={i} className={i === 2 ? 'font-black text-[12px]' : ''}>{t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ViewQuotation;