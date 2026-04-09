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

  // State for lead and quotation
  const [lead, setLead] = useState<any>(null);
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}api/quotation/${master_id}/${revision}`,
      );

      setLead(res.data.lead); // set lead statef
      setQuotation(res.data.quotation); // set single quotation state
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (master_id && revision) {
      fetchData();
    }
  }, [master_id, revision]);

  useEffect(() => {
    console.log('Revision changed:', revision);
  }, [revision]);

  if (loading) return <div className="p-4">Loading...</div>;

  // Safe defaults
  const leadData = lead || {};
  const quotations = quotation ? [quotation] : [];

  const urlToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();

      img.setAttribute('crossOrigin', 'anonymous');

      img.onload = () => {
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
      };

      img.onerror = () => resolve('');

      img.src = url;
    });
  };

  const handleDownloadPDF = async () => {
    if (!quotation) return;

    const logoBase64 = await urlToBase64(logo);

    let productRows: any[] = [];
    let counter = 1;

    for (const kit of quotation.items || []) {
      for (const item of kit.items || []) {
        const imgUrl = item.image_path
          ? `${BASE_URL}${item.image_path.replace(/^\//, '')}`
          : null;

        const imgBase64 = imgUrl ? await urlToBase64(imgUrl) : null;

        const qty = Number(item.qty || 0);
        const total = Number(item.price || 0);
        const unit = qty > 0 ? total / qty : 0;
        const descriptionItems = item.description
          ? item.description
              .split(/\n|•|,/)
              .map((d: string) => d.trim())
              .filter(Boolean)
          : [];

        productRows.push([
          {
            text: counter.toString(),
            alignment: 'center',
            bold: true,
            fontSize: 11,
            margin: [0, 10, 0, 0],
          },
          {
            stack: [
              {
                text: item.model || '',
                bold: true,
                decoration: 'underline',
                fontSize: 12,
                margin: [0, 0, 0, 3],
              },
              {
                ul: descriptionItems,
                fontSize: 10,
              },
              {
                text: `Rs.${unit.toLocaleString()}/- EACH PAIR`,
                bold: true,
                color: '#2563eb',
                fontSize: 11,
                margin: [0, 3, 0, 0],
              },
            ],
            margin: [5, 3, 5, 3],
          },
          {
            stack: [
              {
                text: `${qty} NOS.`,
                bold: true,
              },
              {
                text: `Rs.${total.toLocaleString()}/-`,
                bold: true,
              },
            ],
            alignment: 'center',
            valign: 'middle',
          },
          imgBase64
            ? {
                image: imgBase64,
                fit: [70, 70],
                alignment: 'center',
                valign: 'middle',
              }
            : {
                text: 'No Image',
                alignment: 'center',
                valign: 'middle',
              },
        ]);
        counter++;
      }
    }

    const revision = quotation.revision_details || {};

    const totalWithoutGST = Number(revision.total_without_gst || 0);
    const totalWithGST = Number(revision.total_with_gst || 0);
    const gstApplicableAmount = Number(revision.gst_app_amt || 0);
    const gstPercent = Number(revision.gst_percent || 18);
    const gstCalculatedAmount = Number(revision.gst_calculated_amount || 0);

    const additionalPrices = quotation.additional_prices || [];

    const summaryBody: any[] = [];

    summaryBody.push([
      {
        text: 'TOTAL COST',
        alignment: 'center',
        bold: true,
        fontSize: 17,
        fillColor: '#f2f2f2',
        color: '#16a34a',
      },
      {
        text: `Rs.${totalWithoutGST.toLocaleString()}/-`,
        alignment: 'center',
        bold: true,
        fontSize: 17,
        color: '#16a34a',
        colSpan: 2,
      },
      {},
    ]);

    additionalPrices.forEach((add: any) => {
      summaryBody.push([
        {
          text: add.add_price_name,
          alignment: 'center',
          bold: true,
          fillColor: '#f2f2f2',
        },
        {
          text: `Rs.${Number(add.price).toLocaleString()}/-`,
          alignment: 'center',
          bold: true,
          colSpan: 2,
        },
        {},
      ]);
    });

    if (gstApplicableAmount > 0) {
      summaryBody.push([
        {
          text: `${gstPercent}% GST ON`,
          alignment: 'center',
          bold: true,
        },
        {
          text: `${gstApplicableAmount.toLocaleString()}`,
          alignment: 'center',
          bold: true,
        },
        {
          text: `${gstCalculatedAmount.toLocaleString()}`,
          alignment: 'center',
          bold: true,
        },
      ]);
    }

    summaryBody.push([
      {
        text: 'TOTAL COST OF PROJECT IN Rs.',
        alignment: 'center',
        bold: true,
        fontSize: 19,
        fillColor: '#f2f2f2',
        color: '#1e3a8a',
      },
      {
        text: `Rs.${(totalWithGST > 0
          ? totalWithGST
          : totalWithoutGST
        ).toLocaleString()}/-`,
        alignment: 'center',
        bold: true,
        fontSize: 19,
        color: '#1e3a8a',
        colSpan: 2,
      },
      {},
    ]);

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [30, 30, 30, 30],

      content: [
        /* HEADER */

        {
          columns: [
            {
              width: '*',
              stack: [
                {
                  text: 'AV CORE',
                  fontSize: 36,
                  bold: true,
                  color: '#7d20a0',
                  decoration: 'underline',
                  alignment: 'center',
                },
                {
                  text: 'AUDIO VIDEO CONSULTANT',
                  bold: true,
                  fontSize: 13,
                  alignment: 'center',
                },
                {
                  text: 'SHOP NO 1 & 2, 1ST FLOOR GAYATRI BUILDING, BESIDE JUPITER HOSPITAL, BANER 411045, PUNE.',
                  fontSize: 11,
                  bold: true,
                  alignment: 'center',
                },
                {
                  text: 'CO.NO: 8329728210 / 8766786026',
                  fontSize: 11,
                  bold: true,
                  alignment: 'center',
                },
              ],
            },

            logoBase64
              ? {
                  width: 110,
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        {
                          image: logoBase64,
                          width: 90,
                          alignment: 'center',
                          margin: [5, 5, 5, 5],
                          fillColor: 'black',
                        },
                      ],
                    ],
                  },
                  layout: 'noBorders',
                }
              : {},
          ],
          margin: [0, 0, 0, 20],
        },
        /* CLIENT INFORMATION HEADER */

        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: 'CLIENT INFORMATION',
                  alignment: 'center',
                  bold: true,
                  fillColor: '#dfefda',
                  margin: [0, 4, 0, 4],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 2,
            vLineWidth: () => 2,
            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },
        },

        /* CLIENT INFORMATION BODY (OUTSIDE BORDER ONLY) */

        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  text: [
                    { text: 'Name: ', bold: true },
                    { text: lead.name || '' },
                  ],
                  margin: [5, 4, 5, 4],
                },
                {
                  text: [
                    { text: 'CONTACT: ', bold: true },
                    { text: lead.number || '' },
                  ],
                  alignment: 'right',
                  margin: [5, 4, 5, 4],
                },
              ],
              [
                {
                  text: [
                    { text: 'ADDRESS: ', bold: true },
                    { text: lead.city || '' },
                  ],
                  margin: [5, 4, 5, 4],
                },
                {
                  text: [
                    { text: 'DATE: ', bold: true },
                    {
                      text: quotation.created_at
                        ? new Date(quotation.created_at).toLocaleDateString(
                            'en-GB',
                          )
                        : '',
                    },
                  ],
                  alignment: 'right',
                  margin: [5, 4, 5, 4],
                },
              ],
            ],
          },
          layout: {
            fillColor: () => '#eff6ff',

            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 2 : 0;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 2 : 0;
            },

            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },
          margin: [0, 0, 0, 15],
        },

        /* SUBJECT */

        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: `SUB - ${
                    quotation.items[0]?.items[0]?.cat_name ||
                    'CUSTOMIZED AUDIO-VIDEO QUOTATION'
                  }`,
                  alignment: 'center',
                  bold: true,
                  decoration: 'underline',
                  fillColor: '#f2f2f2',
                },
              ],
            ],
          },
          margin: [0, 0, 0, 15],
        },

        /* BRAND */

        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    {
                      text: quotation.items?.[0]?.kit_name || '',
                      alignment: 'center',
                      bold: true,
                    },
                    {
                      text: quotation.items?.[0]?.items?.[0]?.brand_name || '',
                      alignment: 'center',
                      bold: true,
                    },
                  ],
                  fillColor: '#dfefda',
                },
              ],
            ],
          },
        },

        /* PRODUCTS TABLE */

        {
          table: {
            headerRows: 1,
            widths: [30, '*', 70, 80],
            body: [
              [
                {
                  text: 'NO',
                  bold: true,
                  alignment: 'center',
                  fillColor: '#daeaf6',
                },
                {
                  text: 'PRODUCT DESCRIPTION',
                  bold: true,
                  alignment: 'center',
                  fillColor: '#daeaf6',
                },
                {
                  text: 'QUANTITY',
                  bold: true,
                  alignment: 'center',
                  fillColor: '#daeaf6',
                },
                {
                  text: 'PICTURE',
                  bold: true,
                  alignment: 'center',
                  fillColor: '#daeaf6',
                },
              ],
              ...productRows,
            ],
          },
        },

        /* SUMMARY */

        {
          table: {
            widths: ['*', 100, 100],
            body: summaryBody,
          },
          layout: {
            hLineWidth: () => 2,
            vLineWidth: () => 2,
          },
          margin: [0, 0, 0, 20],
        },

        /* ACOUSTIC TERMS */

        ...(quotation.acoustic_terms
          ? [
              {
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: 'ACOUSTIC SPECIAL TERMS & CONDITIONS',
                        alignment: 'center',
                        bold: true,
                        fillColor: '#fef9c3',
                      },
                    ],
                    [
                      {
                        text: quotation.acoustic_terms,
                        fillColor: '#fefce8',
                      },
                    ],
                  ],
                },
                margin: [0, 20, 0, 30],
              },
            ]
          : []),

        /* BANK DETAILS */

        {
          margin: [0, 30, 0, 20],
          table: {
            widths: ['35%', '*'],
            body: [
              [
                {
                  text: 'BANK DETAILS',
                  colSpan: 2,
                  alignment: 'center',
                  bold: true,
                  color: 'white',
                  fillColor: 'black',
                  fontSize: 12,
                  margin: [0, 4, 0, 4],
                },
                {},
              ],

              [
                {
                  text: 'Account Name:',
                  bold: true,
                  fillColor: '#e5e7eb',
                  margin: [5, 3, 0, 3],
                },
                {
                  text: 'AV Core',
                  bold: true,
                  fillColor: '#e5e7eb',
                  margin: [5, 3, 0, 3],
                },
              ],

              [
                {
                  text: 'Account Type:',
                  bold: true,
                  margin: [5, 3, 0, 3],
                },
                {
                  text: 'Current',
                  bold: true,
                  margin: [5, 3, 0, 3],
                },
              ],

              [
                {
                  text: 'Account Number:',
                  bold: true,
                  fillColor: '#e5e7eb',
                  margin: [5, 3, 0, 3],
                },
                {
                  text: '5412214649',
                  bold: true,
                  fillColor: '#e5e7eb',
                  margin: [5, 3, 0, 3],
                },
              ],

              [
                {
                  text: 'Bank Name:',
                  bold: true,
                  margin: [5, 3, 0, 3],
                },
                {
                  text: 'Kotak Mahindra Bank',
                  bold: true,
                  margin: [5, 3, 0, 3],
                },
              ],

              [
                {
                  text: 'IFSC Code:',
                  bold: true,
                  fillColor: '#e5e7eb',
                  margin: [5, 3, 0, 3],
                },
                {
                  text: 'KKBK0001767',
                  bold: true,
                  fillColor: '#e5e7eb',
                  margin: [5, 3, 0, 3],
                },
              ],

              [
                {
                  text: 'Branch:',
                  bold: true,
                  margin: [5, 3, 0, 3],
                },
                {
                  text: 'Baner Pune',
                  bold: true,
                  margin: [5, 3, 0, 3],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },
        },

        /* TERMS */

        {
          text: 'TERMS & CONDITIONS: -',
          fontSize: 20,
          bold: true,
          color: '#2563eb',
          decoration: 'underline',
          margin: [0, 20, 0, 10],
        },

        {
          ul: [
            'Light work, Light accessories, Door fixing, AC, Painting, Door lock, AV rack, Water supply, Tiles, Poster, Door, Carpet, POP false ceiling, Recliner, Switch boards, other electrical work and apart from seating arrangement are from customer side only.',
            'Door and AV rack will be done by in-house carpenter.',
            {
              text: `18% GST applicable ${
                quotation.type === 'with_gst' ? 'INCLUDED.' : 'Extra.'
              }`,
              bold: true,
            },
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
          ],
          fontSize: 10,
          margin: [0, 0, 0, 20],
        },
      ],

      defaultStyle: {
        fontSize: 10,
      },
    };

    pdfMake
      .createPdf(docDefinition)
      .download(`quotation-${quotation.qt_number || 'download'}.pdf`);
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

     {/* HEADER SECTION */}
<div className="flex justify-between items-start mb-10">
  {/* LEFT SIDE - COMPANY INFO */}
  <div className="flex flex-col text-left leading-tight">
    <h1 className="text-5xl font-bold text-[#7d20a0] underline decoration-[#7d20a0] decoration-4 underline-offset-4 mb-2">
      AV CORE
    </h1>

    <p className="font-bold text-[15px] text-black uppercase mb-1">
      ALL ABOUT AUDIO VIDEO
    </p>

    <p className="text-[15px] font-bold text-black uppercase">
      1ST FLOOR GAYATRI BUILDING, BESIDE JUPITER HOSPITAL,
      BANER 411045, PUNE.
    </p>

<p className="text-[16px] font-bold text-black">
  Email: <span className="text-blue-600">avcoreindia@gmail.com</span>
</p>

<p className="text-[16px] font-bold text-black">
  Website: <span className="text-blue-600">www.avcore.in</span>
</p>

    <p className="text-[14px] font-bold text-black uppercase">
      CO.NO: 8329728210 / 8766786026
    </p>
  </div>

  {/* RIGHT SIDE - LOGO */}
  <div className="bg-black p-1">
    <img
      src={logo}
      className="w-26 h-auto border border-black"
      alt="Logo"
    />
  </div>
</div>

      {/* FIXED: render single quotation */}
      {quotation && (
        <div className="mt-4">
          <div className="border-2 border-black bg-[#dfefda] font-extrabold text-black text-center">
            <p>CLIENT INFORMATION</p>
          </div>

          <div className="border-2 border-black bg-blue-50 p-2 mb-6">
            <div className="flex justify-between items-start text-[14px] leading-tight">
              <div className="space-y-1 leading-tight">
                <p>
                  <span className="font-extrabold text-black ">
                    NAME:
                  </span>{' '}
                  <span className="text-black font-extrabold">{lead.name}</span>
                </p>
                <p>
                  <span className="font-extrabold text-black">ADDRESS:</span>{' '}
                  <span className="text-black font-extrabold">{lead.city}</span>
                </p>
              </div>

              <div className="space-y-1 font-bold whitespace-nowrap">
                <p>
                  <span className="font-extrabold text-black">CONTACT:</span>{' '}
                  <span className="text-black font-extrabold">
                    {' '}
                    {lead.number}
                  </span>
                </p>
                <p>
                  <span className="font-extrabold text-black">DATE:</span>{' '}
                  <span className="text-black font-extrabold">
                    {new Date(quotation.created_at).toLocaleDateString('en-GB')}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* SUBJECT BOX */}
          <div className="border-2 border-black bg-[#f2f2f2]  py-1 mb-6 text-center">
            <h2 className="text-[14px] font-extrabold text-black  underline uppercase tracking-tight">
              SUB -{' '}
              {quotation.items[0]?.items[0]?.cat_name ||
                'CUSTOMIZED AUDIO-VIDEO QUOTATION'}
            </h2>
          </div>

          {/* THANK YOU MESSAGE BOX */}
          {/* <div className="border-2 border-black bg-yellow-50 py-1 mb-2 text-center">
            <p className="text-sm md:text-base font-black text-gray-800 px-2 uppercase tracking-tight">
              I'M THANKFUL FOR THE OPPORTUNITY TO WORK TOGETHER ON THIS PROJECT.
              EXCITED TO BEGIN.
            </p>
          </div> */}

          {/* BRAND BOX */}
          <div className="border-2 border-black bg-[#dfefda] text-center py-1 mb-0 border-b-0">
            <p className="text-[15px] font-bold tracking-widest uppercase text-black mb-1">
              {quotation.items?.[0]?.kit_name}
            </p>

            <p className="text-[15px] font-extrabold text-black tracking-widest uppercase">
              {quotation.items?.[0]?.items?.[0]?.brand_name}
            </p>
          </div>

          {/* MAIN ITEMS TABLE */}
          <table className="w-full border-collapse border-2 border-black text-[12px]">
            <thead>
              <tr className="bg-[#daeaf6]">
                <th className="border-2 border-black p-1 w-8  text-black  font-extrabold ">
                  NO
                </th>
                <th className="border-2 border-black p-1  text-black  font-extrabold ">
                  PRODUCT DESCRIPTION
                </th>
                <th className="border-2 border-black p-1 w-24  text-black font-extrabold ">
                  QUANTITY
                </th>
                <th className="border-2 border-black p-1 w-24  text-black font-extrabold ">
                  PICTURE
                </th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.flatMap((kit: any) =>
                kit.items.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b-2 border-black">
                    <td className="border-2 border-black p-1.5 text-center font-black align-top">
                      {idx + 1}
                    </td>
                    <td className="border-2 border-black p-1.5 align-top">
                      <div className=" text-black font-extrabold underline mb-1 uppercase text-[13px]">
                        {item.model}
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 font-bold text-gray-800 leading-tight">
                        {item.description &&
                          item.description
                            .split(',')
                            .map((desc: string, i: number) => (
                              <li key={i}>{desc.trim()}</li>
                            ))}
                      </ul>
                      <div className="font-black text-blue-600 mt-2 text-[12px]">
                        • Rs.
                        {Number(
                          item.price / (parseInt(item.qty) || 1),
                        ).toLocaleString()}
                        /- EACH PAIR
                      </div>
                    </td>
                    <td className="border-2 border-black p-1.5 text-center align-middle">
                      <div className="text-black font-extrabold mb-1 uppercase">
                        {item.qty} NOS.
                      </div>
                      <div className="text-black font-extrabold">
                        Rs.{Number(item.price).toLocaleString()}/-
                      </div>
                    </td>
                    <td className="border-2 border-black p-1.5 text-center align-middle">
                      <img
                        src={
                          item.image_path
                            ? `${BASE_URL}${item.image_path.replace(/^\//, '')}`
                            : 'https://via.placeholder.com/80'
                        }
                        className="w-20 mx-auto object-contain"
                        alt="Product"
                      />
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>

          {/* SUMMARY SECTION */}
          <div className="w-full border-x-2 border-b-2 border-black text-[11px] font-black">
            {(() => {
              const revision = quotation.revision_details || {};

              const totalWithoutGST = Number(revision.total_without_gst || 0);
              const totalWithGST = Number(revision.total_with_gst || 0);
              const gstApplicableAmount = Number(revision.gst_app_amt || 0);
              const gstPercent = Number(revision.gst_percent || 18);
              const gstCalculatedAmount = Number(
                revision.gst_calculated_amount || 0,
              );

              // show GST row only if applicable
              const showGST = gstApplicableAmount > 0;

              return (
                <>
                  {/* TOTAL COST (Without GST) */}
                  <div className="flex border-b-2 border-black">
                    <div className="flex-1 p-1.5 text-center border-r-2 border-black uppercase tracking-widest bg-[#f2f2f2] font-extrabold text-green-600 text-[18px]">
                      TOTAL COST
                    </div>
                    <div className="w-48 p-1.5 text-center font-extrabold text-green-600 text-[18px]">
                      Rs.{totalWithoutGST.toLocaleString()}/-
                    </div>
                  </div>

                  {/* ADDITIONAL CHARGES */}
                  {quotation.additional_prices &&
                    quotation.additional_prices.length > 0 &&
                    quotation.additional_prices.map((add: any, idx: number) => (
                      <div key={idx} className="flex border-b-2 border-black">
                        <div className="flex-1 p-1.5 text-center border-r-2 border-black uppercase text-black font-extrabold text-[14px]">
                          {add.add_price_name}
                        </div>
                        <div className="w-48 p-1.5 text-center text-black font-extrabold  text-[14px]">
                          Rs.{Number(add.price).toLocaleString()}/-
                        </div>
                      </div>
                    ))}

                  {/* GST ROW */}
                  {showGST && (
                    <div className="flex border-b-2 border-black">
                      <div className="flex-1 p-1.5 text-center border-r-2 border-black uppercase font-extrabold text-black text-[18px]">
                        {gstPercent}% GST ON
                      </div>
                      <div className="w-24 p-1.5 text-center border-r-2 border-black text-black font-extrabold  text-[18px]">
                        {gstApplicableAmount.toLocaleString()}
                      </div>
                      <div className="w-24 p-1.5 text-center text-black font-extrabold  text-[18px]">
                        {gstCalculatedAmount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* TOTAL COST OF PROJECT */}
                  <div className="flex bg-white">
                    <div className="flex-1 p-2 text-center border-r-2 border-black uppercase font-extrabold text-blue-900 text-[20px] bg-[#f2f2f2]">
                      TOTAL COST OF PROJECT IN Rs.
                    </div>
                    <div className="w-48 p-2 text-center font-extrabold text-blue-900 text-[20px]">
                      Rs.
                      {totalWithGST > 0
                        ? totalWithGST.toLocaleString()
                        : totalWithoutGST.toLocaleString()}
                      /-
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* ACOUSTIC TERMS */}
          {quotation.acoustic_terms && (
            <div className="mt-8 border-2 border-black rounded overflow-hidden">
              <div className="w-full text-[11px] font-black">
                <div className="flex bg-yellow-100 border-b-2 border-black">
                  <div className="flex-1 p-2 text-center uppercase font-bold text-gray-800 text-[13px]">
                    ACOUSTIC SPECIAL TERMS & CONDITIONS
                  </div>
                </div>
                <div className="p-4 bg-yellow-50">
                  <div className="text-[11px] font-medium text-gray-800 whitespace-pre-line leading-relaxed">
                    {quotation.acoustic_terms}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-12">
            <div className="max-w-md border-2 border-black rounded-sm mb-10 overflow-hidden mt-48">
              <div className="bg-black text-white text-center py-1 font-bold text-sm tracking-wider uppercase">
                BANK DETAILS
              </div>
              <table className="w-full text-[13px] border-collapse">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black text-black font-bold bg-gray-200 w-1/3">
                      Account Name:
                    </td>
                    <td className="p-1.5 px-3 text-black font-bold bg-gray-200">
                      AV Core
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black text-black font-bold bg-white w-1/3">
                      Account Type:
                    </td>
                    <td className="p-1.5 px-3 text-black font-bold">Current</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black text-black font-bold bg-gray-200 w-1/3">
                      Account Number:
                    </td>
                    <td className="p-1.5 px-3 text-black font-bold bg-gray-200">
                      5412214649
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black text-black font-bold bg-white w-1/3">
                      Bank Name:
                    </td>
                    <td className="p-1.5 px-3 text-black font-bold">
                      Kotak Mahindra Bank
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 px-3 border-r border-black text-black font-bold bg-gray-200 w-1/3">
                      IFSC Code:
                    </td>
                    <td className="p-1.5 px-3 text-black font-bold bg-gray-200">
                      KKBK0001767
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 px-3 border-r border-black text-black font-bold bg-white w-1/3">
                      Branch:
                    </td>
                    <td className="p-1.5 px-3 text-black font-bold">
                      Baner Pune
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TERMS & CONDITIONS HEADER */}
            <h3 className="text-xl font-bold text-blue-600 underline mb-4 decoration-2 underline-offset-4">
              TERMS & CONDITIONS: -
            </h3>

            {/* T&C LIST */}
            <div className="text-left text-[11px] leading-tight text-black space-y-2  text-[12px]">
              <ul className="list-disc pl-5 space-y-1 font-medium">
                <li>
                  Light work, Light accessories, Door fixing, AC, Painting, Door
                  lock, AV rack, Water supply, Tiles, Poster, Door, Carpet, POP
                  false ceiling, Recliner, Switch boards, other electrical work
                  and apart from seating arrangement are from customer side
                  only.
                </li>
                <li>Door and AV rack will be done by in-house carpenter.</li>
                <li>
                  <span className="font-black text-[12px] text-black">
                    18% GST applicable{' '}
                    {quotation.type === 'with_gst' ? 'INCLUDED.' : 'Extra.'}
                  </span>
                </li>
                <li>Warranty covers as per the brand norms.</li>
                <li>
                  Cable is sold as per actual requirement on site, i.e., Speaker
                  cable, HDMI cable & Sub-woofer cable.
                </li>
                <li>
                  Delivery of materials will take maximum 7 working days from
                  the date of approval along with 50% of advance payment, 40%
                  before dispatch of materials and 10% after the installation.
                </li>
                <li>
                  Carpet /Sanitary / Hardware and Electric electrician goods
                  will be provided by Client Side.
                </li>
                <li>
                  Transport and Flight charges will be charged by client Side.
                </li>
                <li>
                  Supply of framing and fabric installation of 12mm gripper onto
                  ply batons will be provided by client. (Additional carpenter
                  work in client's scope)
                </li>
                <li>
                  Supply and installation of Acoustic infill and foam between
                  the batons will be provided by AV CORE.
                </li>
                <li>The prices quoted are based on ex-site basis.</li>
                <li>
                  All the civil, carpenter, electrical and air conditioning work
                  will be in client's scope.
                </li>
                <li>
                  In-case of any variations in the order
                  quantities/measurements, we may have to re-quote the prices.
                </li>
                <li>
                  Safe and secure storage space for materials to be provided by
                  client.
                </li>
                <li>
                  Scaffolding with the planks/ladder to be provided by client.
                </li>
                <li>
                  Uninterrupted electricity, water, lighting, wiring points to
                  be provided on the location without any cost.
                </li>
                <li>
                  All wet work should be completed before handing over the site.
                </li>
                <li>
                  Isolated dumping rubber should be provided from client side.
                </li>
                <li>No returns/ claims shall be entertained</li>
                <li>
                  Prices are subject to change due to volatility in Forex Market
                  & Valid only for 15 Days from the date of Quotation
                </li>
                <li>
                  Quotation may change later if non-Availability of Stock with
                  Company or Out-dated Modes from Company.
                </li>
                <li>
                  UPS Supply / voltage stabilizer with surge suppressor is
                  strongly recommended to prevent problems due to Voltage
                  fluctuations, power failure etc. In scope of client.
                </li>
              </ul>
            </div>
          </div>
          {/* FOOTER SECTION END */}
        </div>
      )}
    </div>
  );
};

export default ViewQuotation;