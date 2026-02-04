// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams, useNavigate } from 'react-router-dom';
// import { FaDownload, FaArrowLeft } from 'react-icons/fa';
// import { BASE_URL } from '../../../public/config';
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
// import logo from '../../../src/images/logo/AV Core Logo.png';

// pdfMake.addVirtualFileSystem(pdfFonts);

// const ViewQuotation = () => {
//   const { master_id, revision } = useParams();
//   const navigate = useNavigate();

//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   const fetchData = async () => {
//     try {
//       const res = await axios.get(
//         `${BASE_URL}api/quotation/${master_id}/${revision}`,
//       );
//       setData(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (master_id && revision) fetchData();
//   }, [master_id, revision]);

//   if (loading) return <div className="p-4">Loading...</div>;

//   const lead = data?.lead || {};
//   const quotations = data?.quotations || [];

//   const urlToBase64 = (url: string): Promise<string> => {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.crossOrigin = "Anonymous";
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext("2d")!;
//       ctx.drawImage(img, 0, 0);
//       resolve(canvas.toDataURL("image/png"));
//     };
//     img.onerror = () => resolve("");
//     img.src = url;
//   });
// };

// const handleDownloadPDF = async () => {
//   if (!quotations || !quotations.length) return;

//   const q = quotations[0]; // assuming first quotation selected
//   const logoBase64 = await urlToBase64(logo);

//   let productRows: any[] = [];
//   let counter = 1;

//   for (const kit of q.items) {
//     for (const item of kit.items) {
//       const imgUrl = item.image_path
//         ? `${BASE_URL}${item.image_path.replace(/^\//, "")}`
//         : null;

//       const imgBase64 = imgUrl ? await urlToBase64(imgUrl) : null;

//       const qty = Number(item.qty);
//       const total = Number(item.price);
//       const unit = qty > 0 ? total / qty : 0;

//       productRows.push([
//         {
//           text: counter,
//           alignment: "center",
//           fontSize: 9,
//         },

//         {
//           stack: [
//             { text: item.model, bold: true, fontSize: 10, margin: [0, 0, 0, 1] },
//             item.description
//               ? {
//                   text: item.description,
//                   fontSize: 8,
//                   margin: [0, 1, 0, 1],
//                   opacity: 0.7,
//                 }
//               : null,
//             {
//               text: `Rs.${unit.toLocaleString()}/- EACH`,
//               fontSize: 9,
//               bold: true,
//               margin: [0, 2, 0, 0],
//             },
//           ].filter(Boolean),
//         },

//         {
//           stack: [
//             {
//               text: `${qty} NOS.`,
//               fontSize: 9,
//               bold: true,
//               alignment: "center",
//             },
//             {
//               text: `Rs.${total.toLocaleString()}/-`,
//               fontSize: 8,
//               margin: [0, 2, 0, 0],
//               alignment: "center",
//             },
//           ],
//         },

//         imgBase64
//           ? { image: imgBase64, width: 70, height: 70, alignment: "center" }
//           : { text: "No Image", alignment: "center", fontSize: 7 },
//       ]);

//       counter++;
//     }
//   }

//   const isGST = q.type === "with_gst";
//   const subtotal = Number(q.total_price);
//   const gstAmount = isGST ? Number(q.totals.total_with_gst) - Number(q.totals.total_without_gst) : 0;
//   const finalTotal = isGST
//     ? Number(q.totals.total_with_gst)
//     : Number(q.totals.total_without_gst);

//   const docDefinition: any = {
//     pageSize: "A4",
//     pageMargins: [25, 25, 25, 25],

//     content: [
//       // HEADER (Company Left + Logo/Date Right)
//       {
//         columns: [
//           {
//             width: "*",
//             stack: [
//               { text: "AV CORE", fontSize: 18, bold: true, color: "#6B21A8" },
//               { text: "Home Automation & AUDIO VIDEO CONSULTANT", fontSize: 10, bold: true },
//               { text: "SHOP NO 1 & 2, 1ST FLOOR GAYATRI BUILDING, BESIDE JUPITER HOSPITAL,", fontSize: 9 },
//               { text: "BANER 411045, PUNE.", fontSize: 9 },
//               { text: "CO.NO: 8329728210", fontSize: 9 },
//             ],
//           },
//           {
//             width: "auto",
//             stack: [
//               logoBase64
//                 ? { image: logoBase64, width: 80, alignment: "right", margin: [0, 0, 0, 4] }
//                 : null,
//               {
//                 text: `DATE: ${new Date().toLocaleDateString("en-GB")}`,
//                 fontSize: 10,
//                 alignment: "right",
//               },
//             ].filter(Boolean),
//           },
//         ],
//         margin: [0, 0, 0, 10],
//       },

//       // CLIENT BLOCK
//       {
//         margin: [0, 5, 0, 10],
//         stack: [
//           { text: `QUOTATION FOR: ${lead.name}`, fontSize: 10 },
//           { text: `CONTACT: ${lead.number}`, fontSize: 10 },
//           { text: `ADDRESS: ${lead.city}`, fontSize: 10 },
//         ],
//       },

//       // SUBJECT
//       {
//         text: `SUB – ${q.items[0]?.items[0]?.cat_name || ""}`,
//         alignment: "center",
//         fontSize: 12,
//         bold: true,
//         decoration: "underline",
//         margin: [0, 0, 0, 8],
//       },

//       // THANK YOU LINE
//       {
//         text: "I’M THANKFUL FOR THE OPPORTUNITY TO WORK TOGETHER ON THIS PROJECT. EXCITED TO BEGIN.",
//         fontSize: 9,
//         italics: true,
//         alignment: "center",
//         margin: [0, 0, 0, 10],
//       },

//       // OPTION + BRAND
//       {
//         text: `OPTION 1`,
//         alignment: "center",
//         bold: true,
//         color: "#15803D",
//         decoration: "underline",
//         margin: [0, 0, 0, 4],
//       },
//       {
//         text: (q.items[0]?.items[0]?.brand_name || "").toUpperCase(),
//         alignment: "center",
//         bold: true,
//         fontSize: 12,
//         margin: [0, 0, 0, 10],
//       },

//       // PRODUCT TABLE
//       {
//         table: {
//           widths: [25, "*", 45, 75],
//           body: [
//             [
//               { text: "NO", bold: true, alignment: "center", fontSize: 9 },
//               { text: "PRODUCT DESCRIPTION", bold: true, alignment: "center", fontSize: 9 },
//               { text: "QTY", bold: true, alignment: "center", fontSize: 9 },
//               { text: "PICTURE", bold: true, alignment: "center", fontSize: 9 },
//             ],
//             ...productRows,
//           ],
//         },
//         layout: {
//           fillColor: (i) => (i === 0 ? "#E5E7EB" : null),
//         },
//         margin: [0, 0, 0, 10],
//       },

//       // TOTALS
//       {
//         text: `TOTAL COST IN Rs. ${subtotal.toLocaleString()}/-`,
//         alignment: "right",
//         bold: true,
//         fontSize: 10,
//         margin: [0, 0, 0, 4],
//       },

//       ...(isGST
//         ? [
//             // {
//             //   text: `GST (18%): Rs.${gstAmount.toLocaleString()}/-`,
//             //   alignment: "right",
//             //   fontSize: 9,
//             //   margin: [0, 0, 0, 4],
//             // },
//             {
//               text: `TOTAL COST OF PROJECT IN Rs. ${finalTotal.toLocaleString()}/-`,
//               alignment: "right",
//               bold: true,
//               fontSize: 11,
//               margin: [0, 4, 0, 0],
//             },
//           ]
//         : [
//             {
//               text: `TOTAL COST OF PROJECT IN Rs. ${finalTotal.toLocaleString()}/-`,
//               alignment: "right",
//               bold: true,
//               fontSize: 11,
//             },
//           ]),
//     ],
//   };

//   pdfMake.createPdf(docDefinition).download(`quotation-${q.qt_number}.pdf`);
// };

//   /* ================= UI ================= */

//   return (
//     <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded">
//       {/* BUTTONS */}
//       <div className="flex justify-between mb-4">
//         <button
//           onClick={() => navigate(-1)}
//           className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
//         >
//           <FaArrowLeft /> Back
//         </button>

//         <button
//           onClick={handleDownloadPDF}
//           className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
//         >
//           <FaDownload /> Download PDF
//         </button>
//       </div>

//       {/* COMPANY HEADER */}
//       {/* COMPANY HEADER + LOGO + DATE */}
//       <div className="flex justify-between items-start mb-3">
//         {/* LEFT — COMPANY INFO */}
//         <div className="text-left">
//           <h1 className="text-2xl font-bold text-purple-700">AV CORE</h1>
//           <p className="font-semibold">
//             Home Automation & AUDIO VIDEO CONSULTANT
//           </p>
//           <p>
//             SHOP NO 1 & 2, 1ST FLOOR GAYATRI BUILDING, BESIDE JUPITER HOSPITAL,
//           </p>
//           <p>BANER 411045, PUNE.</p>
//           <p>CO.NO: 8329728210</p>
//         </div>

//         {/* RIGHT — LOGO + DATE */}
//         <div className="text-right flex flex-col items-end gap-1">
//           <img src={logo} className="w-28 h-auto" alt="Company Logo" />
//           <div className="font-semibold">
//             <b>DATE:</b> {new Date().toLocaleDateString()}
//           </div>
//         </div>
//       </div>

//       {quotations.map((q, qi) => (
//         <div key={qi} className="mt-6 pt-4">
//           {/* DATE + LOGO + CLIENT BLOCK */}
//           <div className="flex justify-between mb-4">
//             <div>
//               <b>QUOTATION FOR:</b> {lead.name}
//               <br />
//               <b>CONTACT:</b> {lead.number}
//               <br />
//               <b>ADDRESS:</b> {lead.city}
//             </div>
//           </div>

//           {/* SUBJECT */}
//           <div className="text-center font-semibold underline mb-3">
//             SUB –  {q.items[0]?.items[0]?.cat_name}
//           </div>

//           {/* THANK YOU LINE */}
//           <p className="text-center italic mb-4">
//             I’M THANKFUL FOR THE OPPORTUNITY TO WORK TOGETHER ON THIS PROJECT.
//             EXCITED TO BEGIN.
//           </p>

//           {/* OPTION + BRAND */}
//           <div className="text-center font-bold text-green-700 underline mb-2">
//             OPTION {qi + 1}
//           </div>
//           <div className="text-center font-bold mb-3">
//             {q.items[0]?.items[0]?.brand_name?.toUpperCase()}
//           </div>

//           {/* TABLE */}
//           <table className="w-full border text-xs mb-4">
//             <thead className="bg-gray-200">
//               <tr>
//                 <th className="border p-2 w-10">NO</th>
//                 <th className="border p-2">PRODUCT DESCRIPTION</th>
//                 <th className="border p-2 w-24">QTY</th>
//                 <th className="border p-2 w-28">PICTURE</th>
//               </tr>
//             </thead>

//             <tbody>
//               {q.items.flatMap((kit, ki) =>
//                 kit.items.map((item, idx) => {
//                   const unit = Number(item.price) / Number(item.qty || 1);
//                   return (
//                     <tr key={idx}>
//                       <td className="border p-2 text-center">{idx + 1}</td>
//                       <td className="border p-2">
//                         <div className="font-semibold">{item.model}</div>
//                         {/* {item.brand_name && <div>({item.brand_name})</div>} */}
//                         {/* {item.product_type_name && (
//                           <div>{item.product_type_name}</div>
//                         )} */}

//                         {/* DESCRIPTION ADDED */}
//                         {item.description && (
//                           <div className="text-[10px] mt-1 opacity-80 leading-tight">
//                             {item.description}
//                           </div>
//                         )}

//                         <div className="font-medium mt-1">
//                           Rs.{unit.toLocaleString()}/- EACH
//                         </div>
//                       </td>

//                       <td className="border p-2 text-center">
//                         {item.qty} NOS.
//                         <div className="text-xs">
//                           Rs.{Number(item.price).toLocaleString()}/-
//                         </div>
//                       </td>

//                       <td className="border p-2 text-center">
//                         <img
//                           src={
//                             item.image_path
//                               ? `${BASE_URL}${item.image_path.replace(
//                                   /^\//,
//                                   '',
//                                 )}`
//                               : 'https://via.placeholder.com/80'
//                           }
//                           className="h-20 mx-auto"
//                         />
//                       </td>
//                     </tr>
//                   );
//                 }),
//               )}
//             </tbody>
//           </table>

//           {/* TOTAL PRICE BLOCK */}
//           <div className="text-right text-sm font-semibold">
//            TOTAL COST
//             {Number(q.total_price).toLocaleString()}/-
//           </div>

//           {/* FINAL QUOTATION TOTAL */}
//           <div className="text-right font-bold mt-1">
//             TOTAL COST OF PROJECT IN Rs.
//             {Number(
//               q.type === 'with_gst'
//                 ? q.totals.total_with_gst
//                 : q.totals.total_without_gst,
//             ).toLocaleString()}
//             /-
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ViewQuotation;




import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaDownload, FaArrowLeft } from 'react-icons/fa';
import { BASE_URL } from '../../../public/config';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../../src/images/logo/AVCoreLogo.png';

pdfMake.addVirtualFileSystem(pdfFonts);

const ViewQuotation = () => {
  const { master_id, revision } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}api/quotation/${master_id}/${revision}`,
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (master_id && revision) fetchData();
  }, [master_id, revision]);

  if (loading) return <div className="p-4">Loading...</div>;

  const lead = data?.lead || {};
  const quotations = data?.quotations || [];

  const urlToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve('');
      img.src = url;
    });
  };

  const handleDownloadPDF = async () => {
    if (!quotations || !quotations.length) return;

    const q = quotations[0];
    const logoBase64 = await urlToBase64(logo);

    let productRows: any[] = [];
    let counter = 1;

    for (const kit of q.items) {
      for (const item of kit.items) {
        const imgUrl = item.image_path
          ? `${BASE_URL}${item.image_path.replace(/^\//, '')}`
          : null;

        const imgBase64 = imgUrl ? await urlToBase64(imgUrl) : null;

        const qty = Number(item.qty);
        const total = Number(item.price);
        const unit = qty > 0 ? total / qty : 0;

        productRows.push([
          {
            text: counter.toString(),
            alignment: 'center',
            fontSize: 10,
            bold: true,
            color: '#7e22ce',
            border: [true, true, true, true],
            margin: [0, 8, 0, 8],
          },
          {
            stack: [
              { 
                text: item.model, 
                bold: true, 
                fontSize: 11,
                color: '#1d4ed8',
                decoration: 'underline',
                margin: [0, 0, 0, 2]
              },
              item.description
                ? {
                    text: item.description.split(',').map((desc: string) => '• ' + desc.trim()).join('\n'),
                    fontSize: 9,
                    color: '#374151',
                    margin: [0, 4, 0, 0],
                  }
                : null,
              {
                text: `• Rs.${unit.toLocaleString()}/- EACH PAIR`,
                fontSize: 10,
                bold: true,
                color: '#2563eb',
                margin: [0, 6, 0, 0],
              },
            ].filter(Boolean),
            border: [true, true, true, true],
          },
          {
            stack: [
              {
                text: `${qty}`,
                fontSize: 10,
                bold: true,
                alignment: 'center',
              },
              {
                text: `Rs.${total.toLocaleString()}/-`,
                fontSize: 10,
                bold: true,
                color: '#2563eb',
                alignment: 'center',
              },
            ],
            border: [true, true, true, true],
          },
          imgBase64
            ? { image: imgBase64, width: 70, alignment: 'center' }
            : { text: 'No Image', alignment: 'center', fontSize: 9 },
        ]);

        counter++;
      }
    }

    const isGST = q.type === 'with_gst';
    const subtotal = Number(q.total_price);
    const finalTotal = isGST
      ? Number(q.totals.total_with_gst)
      : Number(q.totals.total_without_gst);

    // Calculate additional prices from API - FILTER OUT EMPTY ONES
    const additionalPrices = q.additional_prices || [];
    let additionalTotal = 0;
    
    // Prepare rows for additional prices - ONLY NON-EMPTY
    const additionalRows = additionalPrices
      .filter((additional: any) => additional.add_price_name && additional.add_price_name.trim() !== '')
      .map((additional: any) => {
        const price = Number(additional.price) || 0;
        additionalTotal += price;
        
        return [
          { 
            text: additional.add_price_name, 
            fontSize: 9,
            border: [true, true, false, true]
          },
          { 
            text: `Rs.${price.toLocaleString()}/-`, 
            bold: true, 
            color: '#db2777',
            alignment: 'center',
            border: [false, true, true, true]
          }
        ];
      });

    // Calculate GST if needed
    let gstRow = null;
    let gstAmount = 0;
    let projectTotal = subtotal + additionalTotal;
    
    if (isGST) {
      // If type is with_gst, the GST is already included in the final total
      projectTotal = finalTotal + additionalTotal;
    } else {
      // If type is without_gst, calculate 18% GST on subtotal
      gstAmount = subtotal * 0.18;
      projectTotal = subtotal + gstAmount + additionalTotal;
      
      gstRow = [
        [
          { 
            text: '18% GST ON Rs. ' + subtotal.toLocaleString() + '/-', 
            bold: true, 
            alignment: 'center',
            border: [true, true, false, true]
          },
          { 
            text: `Rs.${gstAmount.toLocaleString()}/-`, 
            bold: true, 
            color: '#db2777',
            alignment: 'center',
            border: [false, true, true, true]
          }
        ]
      ];
    }

    // Build PDF content
    const pdfContent: any[] = [
      // HEADER
      {
        columns: [
          {
            width: '*',
            stack: [
              { 
                text: 'AV CORE', 
                fontSize: 36, 
                bold: true, 
                color: '#7e22ce',
                margin: [0, 0, 0, 2]
              },
              { 
                text: 'AUDIO VIDEO CONSULTANT', 
                fontSize: 11, 
                bold: true,
                margin: [0, 0, 0, 4]
              },
              {
                text: 'SHOP NO 1 & 2, 1ST FLOOR GAYATRI BUILDING, BESIDE JUPITER HOSPITAL, BANER\n411045, PUNE.',
                fontSize: 9,
                color: '#1e40af',
                bold: true,
                margin: [0, 0, 0, 2]
              },
              { 
                text: 'CO.NO: 8329728210 / 8766786026', 
                fontSize: 9, 
                bold: true,
                color: '#1e40af'
              },
            ],
          },
          logoBase64 ? { image: logoBase64, width: 80 } : {},
        ],
      },

      // CLIENT INFO
      {
        columns: [
          {
            width: '*',
            stack: [
              { 
                text: `QUOTATION FOR: ${lead.name}`, 
                fontSize: 10,
                bold: true,
                margin: [0, 10, 0, 1]
              },
              { 
                text: `CONTACT: ${lead.number}`, 
                fontSize: 10,
                bold: true,
                margin: [0, 0, 0, 1]
              },
              { 
                text: `ADDRESS: ${lead.city}`, 
                fontSize: 10,
                bold: true,
                margin: [0, 0, 0, 0]
              },
            ],
          },
          {
            width: 'auto',
            text: `DATE: ${new Date().toLocaleDateString('en-GB')}`,
            fontSize: 10,
            bold: true,
            alignment: 'right',
            margin: [0, 10, 0, 0]
          }
        ],
      },

      // SUBJECT
      {
        text: `SUB - ${q.items[0]?.items[0]?.cat_name || 'CUSTOMIZED AUDIO-VIDEO QUOTATION'}`,
        fontSize: 12,
        bold: true,
        color: '#1e40af',
        alignment: 'center',
        decoration: 'underline',
        margin: [0, 10, 0, 10]
      },

      // THANK YOU MESSAGE
      {
        text: "I'M THANKFUL FOR THE OPPORTUNITY TO WORK TOGETHER ON THIS PROJECT. EXCITED TO BEGIN.",
        fontSize: 9,
        bold: true,
        alignment: 'center',
        background: 'black',
        color: 'white',
        margin: [0, 0, 0, 10]
      },

      // BRAND BOX
      {
        text: q.items[0]?.items[0]?.product_type_name || 'DAVIS ACOUSTIC 7.2.4 (FRENCH BRAND)',
        fontSize: 10,
        bold: true,
        color: '#1e40af',
        alignment: 'center',
        border: [true, true, true, true],
        margin: [0, 0, 0, 0]
      },

      // MAIN TABLE
      {
        table: {
          headerRows: 1,
          widths: [30, '*', 60, 80],
          body: [
            [
              { 
                text: 'NO', 
                alignment: 'center', 
                bold: true, 
                color: '#7e22ce', 
                border: [true, true, true, true]
              },
              { 
                text: 'PRODUCT DESCRIPTION', 
                alignment: 'center', 
                bold: true, 
                color: '#7e22ce',
                border: [true, true, true, true]
              },
              { 
                text: 'QUANTITY', 
                alignment: 'center', 
                bold: true, 
                color: '#7e22ce',
                border: [true, true, true, true]
              },
              { 
                text: 'PICTURE', 
                alignment: 'center', 
                bold: true, 
                color: '#7e22ce',
                border: [true, true, true, true]
              }
            ],
            ...productRows,
          ],
        },
        margin: [0, 0, 0, 20],
      },

      // SUMMARY SECTION - DYNAMIC FROM API
      {
        table: {
          widths: ['*', 100],
          body: [
            // TOTAL COST ROW
            [
              { 
                text: 'TOTAL COST', 
                bold: true, 
                alignment: 'center',
                border: [true, true, false, true]
              },
              { 
                text: `Rs.${subtotal.toLocaleString()}/-`, 
                bold: true, 
                color: '#db2777',
                alignment: 'center',
                border: [false, true, true, true]
              }
            ],
            // ADDITIONAL PRICES ROWS (only if they exist)
            ...additionalRows,
            // GST ROW (only if without_gst type)
            ...(gstRow || []),
            // GRAND TOTAL ROW
            [
              { 
                text: 'TOTAL COST OF PROJECT IN Rs.', 
                bold: true, 
                alignment: 'center',
                color: '#059669',
                fontSize: 11,
                border: [true, true, false, true]
              },
              { 
                text: `Rs.${projectTotal.toLocaleString()}/-`, 
                bold: true, 
                color: '#059669',
                fontSize: 11,
                alignment: 'center',
                border: [false, true, true, true]
              }
            ],
          ],
        },
        margin: [0, 0, 0, 20],
      },
    ];

    // ADD ACOUSTIC TERMS SECTION IF EXISTS
    if (q.acoustic_terms) {
      pdfContent.push(
        // Spacing before acoustic terms
        {
          text: '',
          margin: [0, 10, 0, 0]
        },
        // Acoustic Terms Section
        {
          table: {
            widths: ['*'],
            body: [
              [
                { 
                  text: 'ACOUSTIC SPECIAL TERMS', 
                  bold: true, 
                  alignment: 'center',
                  color: '#92400e',
                  fontSize: 11,
                  fillColor: '#fef3c7',
                  border: [true, true, true, true],
                  margin: [2, 4, 2, 4]
                }
              ],
              [
                { 
                  text: q.acoustic_terms, 
                  fontSize: 10,
                  lineHeight: 1.2,
                  fillColor: '#fef3c7',
                  border: [true, true, true, true],
                  margin: [10, 8, 10, 8]
                }
              ]
            ]
          },
          margin: [0, 0, 0, 30],
          layout: {
            hLineWidth: (i: number) => (i === 0 || i === 2) ? 1 : 0,
            vLineWidth: () => 1,
            hLineColor: (i: number) => i === 0 ? '#92400e' : '#92400e',
            vLineColor: () => '#92400e',
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#fef3c7' : '#fef3c7',
          }
        }
      );
    }

    // Add remaining content
    pdfContent.push(
      { text: '', pageBreak: 'before' },
      
      // BANK DETAILS TABLE WITH TOP MARGIN
      {
        table: {
          widths: [120, '*'],
          body: [
            [{ text: 'BANK DETAILS', colSpan: 2, alignment: 'center', bold: true, color: 'white', fillColor: 'black' }, {}],
            [{ text: 'Account Name:', bold: true, fillColor: '#f3f4f6' }, 'AV Core'],
            [{ text: 'Account Type:', bold: true }, 'Current'],
            [{ text: 'Account Number:', bold: true, fillColor: '#e5e7eb' }, '5412214649'],
            [{ text: 'Bank Name:', bold: true }, 'Kotak Mahindra Bank'],
            [{ text: 'IFSC Code:', bold: true, fillColor: '#e5e7eb' }, 'KKBK0001767'],
            [{ text: 'Branch:', bold: true }, 'Baner Pune'],
          ]
        },
        margin: [0, 40, 0, 20], // Added top margin here (40)
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => 'black',
          vLineColor: () => 'black',
        }
      },

      { text: 'TERMS & CONDITIONS: -', bold: true, fontSize: 14, color: '#1d4ed8', decoration: 'underline', margin: [0, 0, 0, 10] },
      {
        ul: [
          'Light work, Light accessories, Door fixing, AC, Painting, Door lock, AV rack, Watersupply, Tiles, Poster, Door, Carpet, POP false ceiling, Recliner, Switch boards, other electrical work and apart from seating arrangement are from customer side only.',
          'Door and AV rack will be done by in-house carpenter.',
          {
            text: isGST ? '18% GST applicable INCLUDED.' : '18% GST applicable Extra.',
            fontSize: 10,
            bold: true,
          },
          'Warranty covers as per the brand norms.',
          'Cable is sold as per actual requirement on site, i.e., Speaker cable, HDMI cable & Sub-woofer cable.',
          'Delivery of materials will take maximum 7 working days from the date of approval along with 50% of advance payment, 40% before dispatch of materials and 10% after the installation.',
          'Carpet /Sanitary / Hardware and Electric electrician goods will be provided by Client Side.',
          'Transport and Flight charges will be charged by client Side.',
          'Supply of framing and fabric installation of 12mm gripper onto ply batons will be provided by client. (Additional carpenter work in client\'s scope)',
          'Supply and installation of Acoustic infill and foam between the batons will be provided by AV CORE.',
          'The prices quoted are based on ex-site basis.',
          'All the civil, carpenter, electrical and air conditioning work will be in client\'s scope.',
          'In-case of any variations in the order quantities/measurements, we may have to re-quote the prices.',
          'Safe and secure storage space for materials to be provided by client.',
          'Scaffolding with the planks/ladder to be provided by client.',
          'Uninterrupted electricity, water, lighting, wiring points to be provided on the location without any cost.',
          'All wet work should be completed before handing over the site.',
          'Isolated dumping rubber should be provided from client side.',
          'No returns/ claims shall be entertained',
          'Prices are subject to change due to volatility in Forex Market & Valid only for 15 Days from the date of Quotation',
          'Quotation may change later if non-Availability of Stock with Company or Out-dated Modes from Company.',
          'UPS Supply / voltage stabilizer with surge suppressor is strongly recommended to prevent problems due to Voltage fluctuations, power failure etc. In scope of client.',
        ],
        fontSize: 8,
        lineHeight: 1.2,
        margin: [0, 0, 0, 20],
      }
    );

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [30, 30, 30, 30],
      content: pdfContent,
    };

    pdfMake.createPdf(docDefinition).download(`quotation-${q.qt_number}.pdf`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded">
      {/* BUTTONS */}
      <div className="flex justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-700 transition-colors"
        >
          <FaArrowLeft /> Back
        </button>

        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <FaDownload /> Download PDF
        </button>
      </div>

      {/* HEADER SECTION - PRECISE MATCH */}
      <div className="flex justify-between items-start mb-10">
        <div className="text-left">
          <h1 className="text-4xl font-bold text-[#7d20a0] leading-none mb-1">AV CORE</h1>
          <p className="font-bold text-[13px] text-black uppercase mb-3">AUDIO VIDEO CONSULTANT</p>
          <div className="text-[12px] text-black font-bold space-y-0.5 uppercase">
            <p>SHOP NO 1 & 2, 1ST FLOOR GAYATRI BUILDING, BESIDE JUPITER HOSPITAL, BANER</p>
            <p>411045, PUNE.</p>
            <p>CO.NO: 8329728210/8766786026</p>
          </div>
        </div>
        <div className="text-right">
          <img src={logo} className="w-28 h-auto border-2 border-black" alt="Logo" />
        </div>
      </div>

      {quotations.map((q: any, qi: number) => {
        // Calculate values for display
        const isGST = q.type === 'with_gst';
        const subtotal = Number(q.total_price);
        
        // Filter out empty additional prices for display
        const additionalPrices = (q.additional_prices || []).filter(
          (additional: any) => additional.add_price_name && additional.add_price_name.trim() !== ''
        );
        
        let additionalTotal = 0;
        additionalPrices.forEach((additional: any) => {
          additionalTotal += Number(additional.price) || 0;
        });

        let gstAmount = 0;
        let projectTotal = subtotal + additionalTotal;
        
        if (isGST) {
          projectTotal = Number(q.totals.total_with_gst) + additionalTotal;
        } else {
          gstAmount = subtotal * 0.18;
          projectTotal = subtotal + gstAmount + additionalTotal;
        }

        return (
          <div key={qi} className="mt-4">
            {/* CLIENT & DATE INFO SECTION */}
            <div className="flex justify-between items-start mb-1 text-[14px] leading-tight">
              <div className="space-y-0 leading-tight">
                <p className="leading-tight">
                  <span className="font-bold">QUOTATION FOR:</span> {lead.name}
                </p>
                <p className="leading-tight">
                  <span className="font-bold">CONTACT:</span> {lead.number}
                </p>
                <p className="leading-tight">
                  <span className="font-bold">ADDRESS:</span> {lead.city}
                </p>
              </div>

              <div className="font-bold whitespace-nowrap leading-tight">
                DATE: {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>

            {/* SUBJECT */}
            <div className="text-center mb-1">
              <h2 className="text-[14px] font-extrabold text-blue-800 underline uppercase tracking-tight">
                SUB - {q.items[0]?.items[0]?.cat_name || 'CUSTOMIZED AUDIO-VIDEO QUOTATION'}
              </h2>
            </div>

            {/* THANK YOU MSG */}
            <div className="text-center mb-1">
              <p className="text-sm md:text-base font-black text-gray-800 px-2 uppercase tracking-tight">
                I'M THANKFUL FOR THE OPPORTUNITY TO WORK TOGETHER ON THIS PROJECT. EXCITED TO BEGIN.
              </p>
            </div>

            {/* BRAND BOX */}
            <div className="border-2 border-black bg-white text-center py-1 mb-0 border-b-0">
               <p className="text-[11px] font-bold text-blue-700 tracking-widest uppercase">
                 {q.items[0]?.items[0]?.product_type_name || 'DAVIS ACOUSTIC 7.2.4 (FRENCH BRAND)'}
               </p>
            </div>

            {/* MAIN ITEMS TABLE */}
            <table className="w-full border-collapse border-2 border-black text-[10px]">
              <thead>
                <tr className="bg-white">
                  <th className="border-2 border-black p-1 w-8 text-purple-700 font-black">NO</th>
                  <th className="border-2 border-black p-1 text-purple-700 font-black">PRODUCT DESCRIPTION</th>
                  <th className="border-2 border-black p-1 w-24 text-purple-700 font-black">QUANTITY</th>
                  <th className="border-2 border-black p-1 w-24 text-purple-700 font-black">PICTURE</th>
                </tr>
              </thead>
              <tbody>
                {q.items.flatMap((kit: any) =>
                  kit.items.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b-2 border-black">
                      <td className="border-2 border-black p-1.5 text-center font-black align-top">{idx + 1}</td>
                      <td className="border-2 border-black p-1.5 align-top">
                        <div className="font-black text-blue-700 underline mb-1 uppercase text-[11px]">
                          {item.model}
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 font-bold text-gray-800 leading-tight">
                          {item.description && item.description.split(',').map((desc: string, i: number) => (
                            <li key={i}>{desc.trim()}</li>
                          ))}
                        </ul>
                        <div className="font-black text-blue-600 mt-2 text-[11px]">
                          • Rs.{Number(item.price / (parseInt(item.qty) || 1)).toLocaleString()}/- EACH PAIR
                        </div>
                      </td>
                      <td className="border-2 border-black p-1.5 text-center align-middle">
                        <div className="font-black mb-1 uppercase">{item.qty}</div>
                        <div className="font-black text-blue-700">Rs.{Number(item.price).toLocaleString()}/-</div>
                      </td>
                      <td className="border-2 border-black p-1.5 text-center align-middle">
                        <img
                          src={item.image_path ? `${BASE_URL}${item.image_path.replace(/^\//, '')}` : 'https://via.placeholder.com/80'}
                          className="w-20 mx-auto object-contain"
                          alt="Product"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* SUMMARY SECTION - DYNAMIC FROM API */}
         {/* SUMMARY SECTION - DYNAMIC FROM API */}
<div className="w-full border-x-2 border-b-2 border-black text-[11px] font-black">

  {/* TOTAL COST */}
  <div className="flex border-b-2 border-black">
    <div className="flex-1 p-1.5 text-center border-r-2 border-black uppercase tracking-widest">
      TOTAL COST
    </div>
    <div className="w-48 p-1.5 text-center text-pink-600">
      Rs.{Number(subtotal).toLocaleString()}/-
    </div>
  </div>

  {/* ADDITIONAL PRICES */}
  {additionalPrices.map((additional: any, index: number) => (
    <div key={index} className="flex border-b-2 border-black text-[10px]">
      <div className="flex-1 p-1.5 text-center border-r-2 border-black">
        {additional.add_price_name}
      </div>
      <div className="w-48 p-1.5 text-center text-pink-600">
        Rs.{Number(additional.price || 0).toLocaleString()}/-
      </div>
    </div>
  ))}

  {/* GST ROW — ALWAYS SHOW WHEN WITHOUT GST */}
  {!isGST && (
    <div className="flex border-b-2 border-black">
      <div className="flex-1 p-1.5 text-center border-r-2 border-black uppercase">
        18% GST ON Rs. {Number(subtotal).toLocaleString()}/-
      </div>
      <div className="w-48 p-1.5 text-center text-pink-600">
        Rs.{Number(gstAmount).toLocaleString()}/-
      </div>
    </div>
  )}

  {/* GRAND TOTAL */}
  <div className="flex bg-white">
    <div className="flex-1 p-2 text-center border-r-2 border-black uppercase text-emerald-600 text-[13px]">
      TOTAL COST OF PROJECT IN Rs.
    </div>
    <div className="w-48 p-2 text-center text-emerald-600 text-[13px]">
      Rs.{Number(projectTotal).toLocaleString()}/-
    </div>
  </div>

</div>


            {/* SEPARATE ACOUSTIC TERMS TABLE - ONLY SHOW IF DATA EXISTS */}
            {q.acoustic_terms && (
              <div className="mt-8 border-2 border-black rounded overflow-hidden">
                <div className="w-full text-[11px] font-black">
                  {/* Acoustic Terms Header */}
                  <div className="flex bg-yellow-100 border-b-2 border-black">
                    <div className="flex-1 p-2 text-center uppercase font-bold text-gray-800 text-[13px]">
                      ACOUSTIC SPECIAL TERMS & CONDITIONS
                    </div>
                  </div>
                  
                  {/* Acoustic Terms Content */}
                  <div className="p-4 bg-yellow-50">
                    <div className="text-[11px] font-medium text-gray-800 whitespace-pre-line leading-relaxed">
                      {q.acoustic_terms}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* IDENTICAL FOOTER UI SECTION START */}
            <div className="mt-12">
              {/* BANK DETAILS TABLE WITH TOP MARGIN */}
<div className="max-w-md border-2 border-black rounded-sm mb-10 overflow-hidden mt-48">
                <div className="bg-black text-white text-center py-1 font-bold text-sm tracking-wider uppercase">
                  BANK DETAILS
                </div>
                <table className="w-full text-[13px] border-collapse">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-1.5 px-3 border-r border-black font-bold bg-gray-100 w-1/3">Account Name:</td>
                      <td className="p-1.5 px-3">AV Core</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 px-3 border-r border-black font-bold bg-white w-1/3">Account Type:</td>
                      <td className="p-1.5 px-3">Current</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 px-3 border-r border-black font-bold bg-gray-200 w-1/3">Account Number:</td>
                      <td className="p-1.5 px-3">5412214649</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 px-3 border-r border-black font-bold bg-white w-1/3">Bank Name:</td>
                      <td className="p-1.5 px-3">Kotak Mahindra Bank</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 px-3 border-r border-black font-bold bg-gray-200 w-1/3">IFSC Code:</td>
                      <td className="p-1.5 px-3 font-bold">KKBK0001767</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 px-3 border-r border-black font-bold bg-white w-1/3">Branch:</td>
                      <td className="p-1.5 px-3 font-bold">Baner Pune</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TERMS & CONDITIONS HEADER */}
              <h3 className="text-xl font-bold text-blue-600 underline mb-4 decoration-2 underline-offset-4">
                TERMS & CONDITIONS: -
              </h3>
              
              {/* T&C LIST */}
              <div className="text-left text-[11px] leading-tight text-black space-y-2">
                <ul className="list-disc pl-5 space-y-1 font-medium">
                  <li>Light work, Light accessories, Door fixing, AC, Painting, Door lock, AV rack, Water supply, Tiles, Poster, Door, Carpet, POP false ceiling, Recliner, Switch boards, other electrical work and apart from seating arrangement are from customer side only.</li>
                  <li>Door and AV rack will be done by in-house carpenter.</li>
                  <li>
                    <span className="font-black text-[12px] text-black">
                      18% GST applicable {isGST ? 'INCLUDED.' : 'Extra.'}
                    </span>
                  </li>
                  <li>Warranty covers as per the brand norms.</li>
                  <li>Cable is sold as per actual requirement on site, i.e., Speaker cable, HDMI cable & Sub-woofer cable.</li>
                  <li>Delivery of materials will take maximum 7 working days from the date of approval along with 50% of advance payment, 40% before dispatch of materials and 10% after the installation.</li>
                  <li>Carpet /Sanitary / Hardware and Electric electrician goods will be provided by Client Side.</li>
                  <li>Transport and Flight charges will be charged by client Side.</li>
                  <li>Supply of framing and fabric installation of 12mm gripper onto ply batons will be provided by client. (Additional carpenter work in client's scope)</li>
                  <li>Supply and installation of Acoustic infill and foam between the batons will be provided by AV CORE.</li>
                  <li>The prices quoted are based on ex-site basis.</li>
                  <li>All the civil, carpenter, electrical and air conditioning work will be in client's scope.</li>
                  <li>In-case of any variations in the order quantities/measurements, we may have to re-quote the prices.</li>
                  <li>Safe and secure storage space for materials to be provided by client.</li>
                  <li>Scaffolding with the planks/ladder to be provided by client.</li>
                  <li>Uninterrupted electricity, water, lighting, wiring points to be provided on the location without any cost.</li>
                  <li>All wet work should be completed before handing over the site.</li>
                  <li>Isolated dumping rubber should be provided from client side.</li>
                  <li>No returns/ claims shall be entertained</li>
                  <li>Prices are subject to change due to volatility in Forex Market & Valid only for 15 Days from the date of Quotation</li>
                  <li>Quotation may change later if non-Availability of Stock with Company or Out-dated Modes from Company.</li>
                  <li>UPS Supply / voltage stabilizer with surge suppressor is strongly recommended to prevent problems due to Voltage fluctuations, power failure etc. In scope of client.</li>
                </ul>
              </div>
            </div>
            {/* FOOTER SECTION END */}
          </div>
        );
      })}
    </div>
  );
};

export default ViewQuotation;