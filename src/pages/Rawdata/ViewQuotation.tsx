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

  // ── PDF download ────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!quotation) return;
    
    try {
      const logoBase64 = await urlToBase64(logo);
      const options = quotation.options || [];

      // ── Options summary data (same logic as HTML) ──
      const subjectName = quotation.options?.[0]?.items?.[0]?.items?.[0]?.cat_name || '';
      const optionsSummaryData = options.map((opt, idx) => {
        const kitNames = (opt.items || []).map(kit => kit.kit_name).filter(Boolean).join(', ') || 'Single Products';
        return {
          option_name: subjectName
            ? `${subjectName} ( ${opt.option_name || `OPTION ${idx + 1}`} )`
            : (opt.option_name || `OPTION ${idx + 1}`),
          kit_names: kitNames,
          final_cost: getOptionTotalCost(opt),
        };
      });
      const overallTotal = optionsSummaryData.reduce((sum, o) => sum + o.final_cost, 0);

      // ══════════════════════════════════════════════════════
      // BUILD EACH OPTION BLOCK  (matches HTML view exactly)
      // ══════════════════════════════════════════════════════
      const optionContentBlocks = [];

      for (let optIdx = 0; optIdx < options.length; optIdx++) {
        const opt = options[optIdx];
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

        // ── Option header: green bg, OPTION NAME underlined + kit name ──
        const headerStack = [
          {
            text: (opt.option_name || `OPTION ${optIdx + 1}`).toUpperCase(),
            alignment: 'center',
            bold: true,
            fontSize: 13,
            decoration: 'underline',
            characterSpacing: 2,
            color: '#000000',
            margin: [0, 2, 0, kitName ? 2 : 0],
          },
        ];
        if (kitName) {
          headerStack.push({
            text: kitName.toUpperCase(),
            alignment: 'center',
            bold: true,
            fontSize: 11,
            characterSpacing: 2,
            color: '#000000',
            margin: [0, 0, 0, 0],
          });
        }

        optionContentBlocks.push({
          table: {
            widths: ['*'],
            body: [[{ stack: headerStack, fillColor: '#dfefda', margin: [0, 5, 0, 5] }]],
          },
          layout: {
            hLineWidth: () => 2,
            vLineWidth: () => 2,
            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },
          margin: [0, optIdx === 0 ? 0 : 20, 0, 0],
        });

        // ── Products table: NO | PRODUCT DESCRIPTION | QTY/PRICE | PICTURE ──
        const productRows = [];
        let counter = 1;
        for (const kit of opt.items || []) {
          for (const item of kit.items || []) {
            const imgUrl    = item.image_path ? `${BASE_URL}${item.image_path.replace(/^\//, '')}` : null;
            const imgBase64 = imgUrl ? await urlToBase64(imgUrl) : null;
            const qty       = Number(item.qty || 0);
            const total     = Number(item.price || 0);
            const unit      = qty > 0 ? total / qty : 0;
            // split by comma — same as HTML
            const descItems = item.description
              ? item.description.split(',').map(d => d.trim()).filter(Boolean)
              : [];

            productRows.push([
              { text: counter.toString(), alignment: 'center', bold: true, fontSize: 10, margin: [0, 6, 0, 0] },
              {
                stack: [
                  { text: (item.model || '').toUpperCase(), bold: true, decoration: 'underline', fontSize: 11, margin: [0, 0, 0, 2] },
                  { ul: descItems, fontSize: 9, color: '#374151' },
                  { text: `• Rs.${unit.toLocaleString()}/- EACH PAIR`, bold: true, color: '#2563eb', fontSize: 10, margin: [0, 3, 0, 0] },
                ],
                margin: [4, 3, 4, 3],
              },
              {
                stack: [
                  { text: `${qty} NOS.`, bold: true, fontSize: 10, alignment: 'center' },
                  { text: `Rs.${total.toLocaleString()}/-`, bold: true, fontSize: 10, alignment: 'center' },
                ],
                alignment: 'center',
                margin: [2, 6, 2, 3],
              },
              imgBase64
                ? { image: imgBase64, fit: [65, 65], alignment: 'center', margin: [2, 3, 2, 3] }
                : { text: 'No Image', alignment: 'center', fontSize: 8, margin: [2, 6, 2, 3] },
            ]);
            counter++;
          }
        }

        optionContentBlocks.push({
          table: {
            headerRows: 1,
            widths: [26, '*', 68, 78],
            body: [
              [
                { text: 'NO',                  bold: true, alignment: 'center', fillColor: '#daeaf6', fontSize: 9 },
                { text: 'PRODUCT DESCRIPTION', bold: true, alignment: 'center', fillColor: '#daeaf6', fontSize: 9 },
                { text: 'QTY/PRICE',           bold: true, alignment: 'center', fillColor: '#daeaf6', fontSize: 9 },
                { text: 'PICTURE',             bold: true, alignment: 'center', fillColor: '#daeaf6', fontSize: 9 },
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

        // ── Summary section — mirrors HTML flex rows exactly ──
        const summaryBody = [];

        // TOTAL COST — green text, grey bg left cell
        summaryBody.push([
          { text: 'TOTAL COST', alignment: 'center', bold: true, fontSize: 15, fillColor: '#f2f2f2', color: '#16a34a', margin: [0, 4, 0, 4] },
          { text: `Rs.${totalWithoutGST.toLocaleString()}/-`, alignment: 'center', bold: true, fontSize: 15, color: '#16a34a', margin: [0, 4, 0, 4] },
        ]);

        // Additional charges
        additional_prices.filter(a => Number(a.price) > 0).forEach(add => {
          summaryBody.push([
            { text: add.add_price_name.toUpperCase(), alignment: 'center', bold: true, fontSize: 10, color: '#000000', margin: [4, 3, 4, 3] },
            { text: `Rs.${Number(add.price).toLocaleString()}/-`, alignment: 'center', bold: true, fontSize: 10, color: '#000000', margin: [0, 3, 0, 3] },
          ]);
        });

        // GST row
        if (showGST) {
          summaryBody.push([
            { text: `${gstPercent}% GST ON ${gstBase.toLocaleString()}`, alignment: 'center', bold: true, fontSize: 15, color: '#000000', margin: [0, 4, 0, 4] },
            { text: gstCalc.toLocaleString(), alignment: 'center', bold: true, fontSize: 15, color: '#000000', margin: [0, 4, 0, 4] },
          ]);
        }

        // TOTAL COST OF PROJECT — blue text, grey bg left cell
        summaryBody.push([
          { text: 'TOTAL COST OF PROJECT IN RS.', alignment: 'center', bold: true, fontSize: 16, fillColor: '#f2f2f2', color: '#1e3a8a', margin: [0, 5, 0, 5] },
          { text: `Rs.${(totalWithGST > 0 ? totalWithGST : totalWithoutGST).toLocaleString()}/-`, alignment: 'center', bold: true, fontSize: 16, color: '#1e3a8a', margin: [0, 5, 0, 5] },
        ]);

        // FINAL BEST OFFER — orange text, green bg
        if (showFinalOffer) {
          summaryBody.push([
            { text: (finalOffer.description || 'FINAL BEST OFFER').toUpperCase(), alignment: 'center', bold: true, fontSize: 15, fillColor: '#e2f0d9', color: '#b45f06', margin: [0, 4, 0, 4] },
            { text: `Rs.${finalOfferAmount.toLocaleString()}/-`, alignment: 'center', bold: true, fontSize: 15, color: '#b45f06', fillColor: '#e2f0d9', margin: [0, 4, 0, 4] },
          ]);
          // FINALIZED TOTAL — green text, light green bg
          summaryBody.push([
            { text: 'FINALIZED TOTAL COST OF PROJECT', alignment: 'center', bold: true, fontSize: 16, fillColor: '#f0fdf4', color: '#15803d', margin: [0, 5, 0, 5] },
            { text: `Rs.${finalizedTotal.toLocaleString()}/-`, alignment: 'center', bold: true, fontSize: 16, fillColor: '#f0fdf4', color: '#15803d', margin: [0, 5, 0, 5] },
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
          margin: [0, 0, 0, optIdx < options.length - 1 ? 20 : 10],
        });
      }

      // ══════════════════════════════════════════════════════
      // OPTIONS SUMMARY TABLE  (after options, same as HTML)
      // ══════════════════════════════════════════════════════
      const summaryRows = optionsSummaryData.map((o, idx) => [
        { text: (idx + 1).toString(), alignment: 'center', fontSize: 9, bold: true },
        { text: o.option_name, alignment: 'left', fontSize: 9, bold: true },
        { text: o.kit_names.length > 80 ? o.kit_names.substring(0, 80) + '...' : o.kit_names, alignment: 'left', fontSize: 8, color: '#4b5563' },
        { text: `₹${o.final_cost.toLocaleString()}`, alignment: 'right', fontSize: 9, bold: true, color: '#15803d' },
      ]);

      const optionsSummaryBlock = {
        margin: [0, 10, 0, 20],
        stack: [
          {
            table: {
              widths: ['*'],
              body: [[{ text: 'OPTIONS SUMMARY', alignment: 'center', bold: true, fontSize: 10, color: '#000000', margin: [0, 4, 0, 4] }]],
            },
            layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#d1d5db', vLineColor: () => '#d1d5db' },
          },
          {
            table: {
              widths: ['8%', '32%', '*', '18%'],
              headerRows: 1,
              body: [
                [
                  { text: 'SR NO',               bold: true, alignment: 'center', fillColor: '#f3f4f6', fontSize: 8 },
                  { text: 'TITLE',               bold: true, alignment: 'left',   fillColor: '#f3f4f6', fontSize: 8 },
                  { text: 'KIT / PRODUCT NAMES', bold: true, alignment: 'left',   fillColor: '#f3f4f6', fontSize: 8 },
                  { text: 'COST (₹)',            bold: true, alignment: 'right',  fillColor: '#f3f4f6', fontSize: 8 },
                ],
                ...summaryRows,
                [
                  { text: 'OVERALL TOTAL:', colSpan: 3, alignment: 'right', bold: true, fontSize: 10, fillColor: '#e5e7eb', margin: [0, 3, 4, 3] },
                  {}, {},
                  { text: `₹${overallTotal.toLocaleString()}`, alignment: 'right', bold: true, fontSize: 10, fillColor: '#e5e7eb', color: '#14532d', margin: [0, 3, 0, 3] },
                ],
              ],
            },
            layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#d1d5db', vLineColor: () => '#d1d5db' },
          },
        ],
      };

      // ══════════════════════════════════════════════════════
      // BANK DETAILS table
      // ══════════════════════════════════════════════════════
      const bankRows = [
        ['Account Name:',   'AV Core'],
        ['Account Type:',   'Current'],
        ['Account Number:', '5412214649'],
        ['Bank Name:',      'Kotak Mahindra Bank'],
        ['IFSC Code:',      'KKBK0001767'],
        ['Branch:',         'Baner Pune'],
      ];

      const bankTableDef = {
        stack: [
          {
            table: {
              widths: ['*'],
              body: [[{ text: 'BANK DETAILS', alignment: 'center', bold: true, color: 'white', fillColor: 'black', fontSize: 10, margin: [0, 4, 0, 4] }]],
            },
            layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => 'black', vLineColor: () => 'black' },
          },
          {
            table: {
              widths: ['42%', '*'],
              body: bankRows.map(([label, value], i) => [
                { text: label, bold: true, fillColor: i % 2 === 0 ? '#e5e7eb' : null, margin: [4, 3, 0, 3], fontSize: 9 },
                { text: value, bold: true, fillColor: i % 2 === 0 ? '#e5e7eb' : null, margin: [4, 3, 0, 3], fontSize: 9 },
              ]),
            },
            layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => 'black', vLineColor: () => 'black' },
          },
        ],
      };

      // ══════════════════════════════════════════════════════
      // INSTALLMENTS table (right column)
      // ══════════════════════════════════════════════════════
      const allInstallments = options
        .filter(opt => opt.installments && opt.installments.length > 0)
        .map(opt => ({ option_name: opt.option_name, installments: opt.installments }));

      const installmentsTableDef = allInstallments.length > 0
        ? {
            stack: [
              {
                table: {
                  widths: ['*'],
                  body: [[{ text: 'PAYMENT INSTALLMENTS', alignment: 'center', bold: true, color: 'white', fillColor: 'black', fontSize: 10, margin: [0, 4, 0, 4] }]],
                },
                layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => 'black', vLineColor: () => 'black' },
              },
              ...allInstallments.map(optInst => ({
                table: {
                  widths: ['*', 55],
                  body: [
                    [{ text: optInst.option_name, bold: true, alignment: 'center', fillColor: '#fef3c7', colSpan: 2, fontSize: 8, margin: [0, 2, 0, 2] }, {}],
                    [
                      { text: 'DESCRIPTION',  bold: true, alignment: 'left',   fillColor: '#e5e7eb', fontSize: 8 },
                      { text: 'PERCENT (%)',  bold: true, alignment: 'center', fillColor: '#e5e7eb', fontSize: 8 },
                    ],
                    ...optInst.installments.map((inst, i) => [
                      { text: inst.description || '-', margin: [3, 2, 0, 2], fontSize: 8, fillColor: i % 2 === 0 ? '#ffffff' : '#f3f4f6' },
                      { text: `${inst.percentage}%`, alignment: 'center', bold: true, fontSize: 8, fillColor: i % 2 === 0 ? '#ffffff' : '#f3f4f6' },
                    ]),
                  ],
                },
                layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => 'black', vLineColor: () => 'black' },
                margin: [0, 4, 0, 0],
              })),
            ],
          }
        : null;

      // Bank + Installments side by side (grid cols-2)
      const footerColumns = {
        columns: [
          { width: '48%', ...bankTableDef },
          installmentsTableDef
            ? { width: '48%', ...installmentsTableDef }
            : { width: '48%', text: '' },
        ],
        columnGap: 12,
        margin: [0, 16, 0, 20],
      };

      // ══════════════════════════════════════════════════════
      // ACOUSTIC TERMS (if any)
      // ══════════════════════════════════════════════════════
      const acousticBlock = quotation.acoustic_terms
        ? [{
            table: {
              widths: ['*'],
              body: [
                [{ text: 'ACOUSTIC SPECIAL TERMS & CONDITIONS', alignment: 'center', bold: true, fillColor: '#fef9c3', fontSize: 10, margin: [0, 4, 0, 4] }],
                [{ text: quotation.acoustic_terms, fillColor: '#fefce8', fontSize: 9, margin: [6, 5, 6, 5] }],
              ],
            },
            layout: { hLineWidth: () => 2, vLineWidth: () => 2, hLineColor: () => 'black', vLineColor: () => 'black' },
            margin: [0, 16, 0, 10],
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
      // DOC DEFINITION — EXACT MATCH COMPANY HEADER
      // ══════════════════════════════════════════════════════
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [28, 28, 28, 28],
        content: [

          // 1. Company Header - EXACT MATCH to HTML component (no changes)
          {
            columns: [
              {
                width: '*',
                stack: [
                  // AV CORE with gradient text effect (simulated with color #d34681)
                  { text: 'AV CORE', fontSize: 44, bold: true, color: '#5d3a9e', margin: [0, 0, 0, 3] },
                  { text: 'ALL ABOUT AUDIO VIDEO', bold: true, fontSize: 13, margin: [0, 0, 0, 3], color: '#000000' },
                  { text: ' 1st FLOOR GAYATRI BUILDING BESIDE JUPITER HOSPITAL, BANER 411045, PUNE.', fontSize: 11, bold: true, margin: [0, 0, 0, 2], color: '#000000' },
                  { text: [{ text: 'Email: ', bold: true, fontSize: 11 }, { text: 'avcoreindia@gmail.com', color: '#2563eb', bold: true, fontSize: 11 }], margin: [0, 0, 0, 2] },
                  { text: [{ text: 'Website: ', bold: true, fontSize: 11 }, { text: 'www.avcore.in', color: '#2563eb', bold: true, fontSize: 11 }], margin: [0, 0, 0, 2] },
                  { text: 'CO.NO: 8329728210 / 8766786026', fontSize: 11, bold: true, color: '#000000' },
                ],
              },
              logoBase64
                ? {
                    width: 96,
                    table: { 
                      widths: ['*'], 
                      body: [[{ 
                        image: logoBase64, 
                        width: 90, 
                        alignment: 'center', 
                        margin: [3, 3, 3, 3], 
                        fillColor: 'black' 
                      }]] 
                    },
                    layout: 'noBorders',
                  }
                : { width: 96, text: '' },
            ],
            margin: [0, 0, 0, 14],
          },

          // 2. CLIENT INFORMATION label
          {
            table: { widths: ['*'], body: [[{ text: 'CLIENT INFORMATION', alignment: 'center', bold: true, fillColor: '#dfefda', fontSize: 10, margin: [0, 3, 0, 3] }]] },
            layout: { hLineWidth: () => 2, vLineWidth: () => 2, hLineColor: () => 'black', vLineColor: () => 'black' },
          },

          // 3. Client info body
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

          // 4. Subject line
          {
            table: {
              widths: ['*'],
              body: [[{
                text: `SUB – ${quotation.subject || options?.[0]?.items?.[0]?.items?.[0]?.cat_name || 'CUSTOMIZED AUDIO-VIDEO QUOTATION'}`,
                alignment: 'center', bold: true, decoration: 'underline', fillColor: '#f2f2f2', fontSize: 10, margin: [0, 3, 0, 3],
              }]],
            },
            layout: { hLineWidth: () => 2, vLineWidth: () => 2, hLineColor: () => 'black', vLineColor: () => 'black' },
            margin: [0, 0, 0, 12],
          },

          // 5. All option blocks (header + products + summary)
          ...optionContentBlocks,

          // 6. Acoustic terms
          ...acousticBlock,

          // 7. Options Summary table
          optionsSummaryBlock,

          // 8. Bank + Installments side by side
          footerColumns,

          // 9. Terms & Conditions
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

  // ─── HTML VIEW (100% unchanged) ───────────────────────────
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

      {/* subject */}
      <div className="border-2 border-black bg-[#f2f2f2] py-1 mb-6 text-center">
        <h2 className="text-[14px] font-extrabold text-black underline uppercase">
          SUB – {quotation.subject || options?.[0]?.items?.[0]?.items?.[0]?.cat_name || 'CUSTOMIZED AUDIO-VIDEO QUOTATION'}
        </h2>
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

        return (
          <div key={optIdx} className={optIdx > 0 ? 'mt-10' : ''}>
            <div className="border-2 border-black bg-[#dfefda] text-center py-2 mb-0 border-b-0">
              <p className="text-[16px] font-bold tracking-widest uppercase text-black underline">
                {opt.option_name || `OPTION ${optIdx + 1}`}
              </p>
              {opt.items?.[0]?.kit_name && (
                <p className="text-[14px] font-bold tracking-widest uppercase text-black">
                  {opt.items[0].kit_name}
                </p>
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
                            • Rs.{Number(item.price / (parseInt(item.qty) || 1)).toLocaleString()}/- EACH PAIR
                          </div>
                        </td>
                        <td className="border-2 border-black p-1.5 text-center align-middle">
                          <div className="text-black font-extrabold mb-1 uppercase">{item.qty} NOS.</div>
                          <div className="text-black font-extrabold">Rs.{Number(item.price).toLocaleString()}/-</div>
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
                <div className="w-48 p-1.5 text-center font-extrabold text-green-600 text-[18px]">Rs.{totalWithoutGST.toLocaleString()}/-</div>
              </div>
              {(opt.additional_prices || []).filter(a => Number(a.price) > 0).map((add, idx) => (
                <div key={idx} className="flex border-b-2 border-black">
                  <div className="flex-1 p-1.5 text-center border-r-2 border-black uppercase text-black font-extrabold text-[14px]">{add.add_price_name}</div>
                  <div className="w-48 p-1.5 text-center text-black font-extrabold text-[14px]">Rs.{Number(add.price).toLocaleString()}/-</div>
                </div>
              ))}
              {showGST && (
                <div className="flex border-b-2 border-black">
                  <div className="flex-1 p-1.5 text-center border-r-2 border-black uppercase font-extrabold text-black text-[18px]">
                    {gstPercent}% GST ON {gstBase.toLocaleString()}
                  </div>
                  <div className="w-48 p-1.5 text-center font-extrabold text-black text-[18px]">{gstCalc.toLocaleString()}</div>
                </div>
              )}
              <div className="flex border-b-2 border-black">
                <div className="flex-1 p-2 text-center border-r-2 border-black uppercase font-extrabold text-blue-900 text-[20px] bg-[#f2f2f2]">TOTAL COST OF PROJECT IN Rs.</div>
                <div className="w-48 p-2 text-center font-extrabold text-blue-900 text-[20px]">
                  Rs.{(totalWithGST > 0 ? totalWithGST : totalWithoutGST).toLocaleString()}/-
                </div>
              </div>
              {showFinalOffer && (
                <div className="flex border-b-2 border-black bg-[#e2f0d9]">
                  <div className="flex-1 p-2 text-center border-r-2 border-black uppercase font-extrabold text-[#b45f06] text-[18px]">
                    {finalOffer.description || 'FINAL BEST OFFER'}
                  </div>
                  <div className="w-48 p-2 text-center font-extrabold text-[#b45f06] text-[18px]">Rs.{finalOfferAmount.toLocaleString()}/-</div>
                </div>
              )}
              {showFinalOffer && (
                <div className="flex bg-green-50">
                  <div className="flex-1 p-2 text-center border-r-2 border-black uppercase font-extrabold text-green-700 text-[20px] bg-[#f2f2f2]">FINALIZED TOTAL COST OF PROJECT</div>
                  <div className="w-48 p-2 text-center font-extrabold text-green-700 text-[20px]">Rs.{finalizedTotal.toLocaleString()}/-</div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* acoustic terms */}
      {quotation.acoustic_terms && (
        <div className="mt-8 border-2 border-black rounded overflow-hidden">
          <div className="flex bg-yellow-100 border-b-2 border-black">
            <div className="flex-1 p-2 text-center uppercase font-bold text-gray-800 text-[13px]">ACOUSTIC SPECIAL TERMS & CONDITIONS</div>
          </div>
          <div className="p-4 bg-yellow-50">
            <div className="text-[11px] font-medium text-gray-800 whitespace-pre-line leading-relaxed">{quotation.acoustic_terms}</div>
          </div>
        </div>
      )}

      {/* Options Summary */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden mt-6">
        <div className="bg-white text-black px-4 py-3 text-center">
          <h4 className="font-semibold">OPTIONS SUMMARY</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-center w-16">SR NO</th>
                <th className="border p-2 text-left">TITLE</th>
                <th className="border p-2 text-left">KIT / PRODUCT NAMES</th>
                <th className="border p-2 text-right w-32">COST (₹)</th>
              </tr>
            </thead>
            <tbody>
              {optionsSummaryData.map((opt, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border p-2 text-center font-medium">{idx + 1}</td>
                  <td className="border p-2 font-medium">{opt.option_name}</td>
                  <td className="border p-2 text-gray-600 text-xs">{opt.kit_names.substring(0, 80)}{opt.kit_names.length > 80 ? '...' : ''}</td>
                  <td className="border p-2 text-right font-bold text-green-700">₹{opt.final_cost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-200 font-bold">
              <tr>
                <td colSpan={3} className="border p-2 text-right text-base">OVERALL TOTAL:</td>
                <td className="border p-2 text-right text-base text-green-800">₹{overallTotal.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
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
                            <th className="px-2 py-1 font-bold text-center w-20">PERCENT (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {opt.installments.map((inst, idx) => (
                            <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'} border-b border-black`}>
                              <td className="px-2 py-1 border-r border-black text-left text-xs">{inst.description || '-'}</td>
                              <td className="px-2 py-1 text-center font-semibold text-xs">{inst.percentage}%</td>
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