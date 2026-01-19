import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import { BASE_URL } from '../../../public/config';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.addVirtualFileSystem(pdfFonts);

const ViewQuotation = () => {
  const { master_id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/quotation/${master_id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (master_id) fetchData();
  }, [master_id]);

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
    const q = quotations[0];

    let productRows: any[] = [];
    let counter = 1;

    for (const kit of q.kits) {
      for (const item of kit.items) {
        const imgUrl = item.image_path
          ? `${BASE_URL}${item.image_path.replace(/^\//, '')}`
          : null;

        const imgBase64 = imgUrl ? await urlToBase64(imgUrl) : null;

        const qty = parseFloat(item.prod_qty);
        const total = parseFloat(item.prod_price);
        const unit = qty > 0 ? total / qty : 0;

        productRows.push([
          { text: counter, alignment: 'center', fontSize: 10 },

          {
            stack: [
              {
                text: item.model,
                bold: true,
                fontSize: 10,
                margin: [0, 0, 0, 2],
              },
              item.brand_name
                ? {
                    text: `Brand: ${item.brand_name}`,
                    fontSize: 8,
                    margin: [0, 1, 0, 0],
                  }
                : null,
              item.product_type_name
                ? {
                    text: `Type: ${item.product_type_name}`,
                    fontSize: 8,
                    margin: [0, 1, 0, 0],
                  }
                : null,
              item.model_description
                ? {
                    text: item.model_description,
                    fontSize: 8,
                    margin: [0, 2, 0, 2],
                  }
                : null,
              {
                text: `Rs.${unit.toLocaleString()}/- EACH`,
                bold: true,
                fontSize: 9,
              },
            ].filter(Boolean),
          },

          {
            stack: [
              {
                text: qty.toString(),
                bold: true,
                alignment: 'center',
                fontSize: 10,
              },
              {
                text: `Rs.${total.toLocaleString()}/-`,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 2, 0, 0],
              },
            ],
          },

          imgBase64
            ? { image: imgBase64, width: 70, height: 70, alignment: 'center' }
            : { text: 'No Image', alignment: 'center', fontSize: 7 },
        ]);

        counter++;
      }
    }

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [25, 25, 25, 25],

      content: [
        {
          stack: [
            { text: 'AV CORE', fontSize: 16, bold: true },
            { text: 'Home Automation & AUDIO VIDEO CONSULTANT', fontSize: 9 },
            {
              text: 'SHOP NO 1 & 2, 1ST FLOOR GAYATRI BUILDING, BESIDE JUPITER HOSPITAL,',
              fontSize: 9,
            },
            { text: 'BANER 411045, PUNE.', fontSize: 9 },
            { text: 'CO.NO: 8329728210', fontSize: 9 },
          ],
          margin: [0, 0, 0, 12],
        },

        {
          table: {
            widths: ['*', 120],
            body: [
              [
                {
                  stack: [
                    {
                      text: `QUOTATION FOR: ${lead.name}`,
                      fontSize: 10,
                      margin: [0, 2, 0, 0],
                    },
                    {
                      text: `CONTACT: ${lead.number}`,
                      fontSize: 10,
                      margin: [0, 2, 0, 0],
                    },
                    {
                      text: `ADDRESS: ${lead.city}`,
                      fontSize: 10,
                      margin: [0, 2, 0, 2],
                    },
                  ],
                },
                {
                  text: `DATE: ${new Date(q.created_at).toLocaleDateString(
                    'en-GB',
                  )}`,
                  fontSize: 10,
                  alignment: 'right',
                  margin: [0, 2, 0, 0],
                },
              ],
            ],
          },

          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? '#e5e7eb' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#ccc',
            vLineColor: () => '#ccc',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
          margin: [0, 0, 0, 10],
        },

        {
          text: `SUB — ${q.kits[0].kit_name}`,
          alignment: 'center',
          bold: true,
          margin: [0, 2, 0, 4],
        },

        {
          text: 'I’M THANKFUL FOR THE OPPORTUNITY TO WORK TOGETHER ON THIS PROJECT. EXCITED TO BEGIN.',
          alignment: 'center',
          fontSize: 9,
          margin: [0, 0, 0, 10],
        },

        {
          table: {
            widths: [25, '*', 45, 75],
            body: [
              [
                { text: 'NO', style: 'thead' },
                { text: 'PRODUCT DESCRIPTION', style: 'thead' },
                { text: 'QTY', style: 'thead' },
                { text: 'PICTURE', style: 'thead' },
              ],
              ...productRows,
            ],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? '#e5e7eb' : null),
          },
          margin: [0, 0, 0, 10],
        },

        ...(q.additional_prices?.length
          ? q.additional_prices.map((ap) => ({
              columns: [
                { text: ap.add_price_name, fontSize: 10 },
                {
                  text: `Rs.${parseFloat(ap.price).toLocaleString()}/-`,
                  fontSize: 10,
                  alignment: 'right',
                },
              ],
              margin: [0, 2, 0, 2],
            }))
          : []),

        {
          text: `TOTAL COST OF PROJECT IN Rs. ${parseFloat(
            q.total_price,
          ).toLocaleString()}/-`,
          bold: true,
          fontSize: 11,
          alignment: 'right',
          margin: [0, 6, 0, 2],
        },

        ...(q.type === 'with_gst'
          ? [
              {
                text: `GST (18%): Rs.${(
                  parseFloat(q.with_gst_total) - parseFloat(q.total_price)
                ).toLocaleString()}/-`,
                fontSize: 9,
                alignment: 'right',
                margin: [0, 0, 0, 3],
              },
            ]
          : []),
      ],

      styles: {
        thead: { bold: true, alignment: 'center', fontSize: 9 },
      },
    };

    pdfMake.createPdf(docDefinition).download(`quotation-${q.qt_number}.pdf`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow rounded">
      {/* Top Buttons */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => navigate('/quatation-pending')}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>

        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          Download PDF
        </button>
      </div>

      {/* Company Info */}
      <div className="mb-6 text-left">
        <h2 className="text-xl font-bold">AV CORE</h2>
        <p>Home Automation & AUDIO VIDEO CONSULTANT</p>
        <p>
          SHOP NO 1 & 2, 1ST FLOOR GAYATRI BUILDING, BESIDE JUPITER HOSPITAL,
        </p>
        <p>BANER 411045, PUNE.</p>
        <p>CO.NO: 8329728210</p>
      </div>

      {/* Quotations */}
      {quotations.map((q, qIndex) => (
        <div key={qIndex}>
          {/* Lead + Date */}
          <div className="flex justify-between items-start border p-4 rounded bg-gray-100 mb-4">
            <div>
              <div>
                <b>QUOTATION FOR:</b> {lead.name || 'Not Found'}
              </div>
              <div>
                <b>CONTACT:</b> {lead.number || '-'}
              </div>
              <div>
                <b>ADDRESS:</b> {lead.city || '-'}
              </div>
            </div>
            <div className="text-right">
              <b>DATE:</b> {new Date(q.created_at).toLocaleDateString('en-GB')}
            </div>
          </div>

          {/* Category */}
          <div className="mb-2 font-semibold text-center">
            SUB – {q.kits?.[0]?.kit_name?.toUpperCase() || ''}
          </div>

          {/* Note */}
          <p className="mb-4 text-center">
            I’M THANKFUL FOR THE OPPORTUNITY TO WORK TOGETHER ON THIS PROJECT.
            EXCITED TO BEGIN.
          </p>

          {/* Items Table */}
          <div className="border p-4 rounded mb-6">
            <table className="w-full border text-sm mb-4">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2 w-12">NO</th>
                  <th className="border p-2">PRODUCT DESCRIPTION</th>
                  <th className="border p-2 w-20">QTY</th>
                  <th className="border p-2 w-32">PICTURE</th>
                </tr>
              </thead>

              <tbody>
                {q.kits?.flatMap((kit, kitIndex) =>
                  kit.items.map((item, itemIndex) => {
                    const index = itemIndex + 1;
                    const unitPrice =
                      parseFloat(item.prod_price) / parseFloat(item.prod_qty);

                    return (
                      <tr key={item.model_id}>
                        <td className="border p-2 text-center">{index}</td>

                        <td className="border p-2">
                          <div className="font-semibold">{item.model}</div>

                          {item.brand_name && (
                            <div className="text-xs mt-1">
                              <b>Brand:</b> {item.brand_name}
                            </div>
                          )}

                          {item.product_type_name && (
                            <div className="text-xs">
                              <b>Type:</b> {item.product_type_name}
                            </div>
                          )}

                          <div className="text-xs whitespace-pre-line mt-1">
                            {item.model_description}
                          </div>

                          <div className="mt-1 font-medium">
                            Rs.{unitPrice.toLocaleString()}/- EACH
                          </div>
                        </td>

                        <td className="border p-2 text-center">
                          <div className="font-semibold">{item.prod_qty}</div>
                          <div className="text-xs">
                            Rs.{parseFloat(item.prod_price).toLocaleString()}/-
                          </div>
                        </td>

                        <td className="border p-2 text-center">
                          <img
                            src={
                              item.image_path
                                ? `${BASE_URL}${item.image_path.replace(
                                    /^\//,
                                    '',
                                  )}`
                                : 'https://via.placeholder.com/80x80'
                            }
                            alt={item.model}
                            className="h-20 w-24 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://via.placeholder.com/80x80';
                            }}
                          />
                        </td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>

            {/* Additional Charges */}
            {q.additional_prices?.length > 0 && (
              <div className="mb-4">
                {q.additional_prices.map((ap, idx) => (
                  <div key={idx} className="flex justify-between border-b py-1">
                    <span>{ap.add_price_name}</span>
                    <span>Rs.{parseFloat(ap.price).toLocaleString()}/-</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total Price */}
            <div className="text-right font-bold text-lg">
              TOTAL COST OF PROJECT IN Rs.{' '}
              {q.type === 'with_gst'
                ? parseFloat(q.with_gst_total).toLocaleString()
                : parseFloat(q.without_gst_total).toLocaleString()}
              /-
            </div>

            {/* GST Display */}
            {q.type === 'with_gst' && (
              <div className="text-right text-sm mt-1">
                GST (18%): Rs.{' '}
                {(
                  parseFloat(q.with_gst_total) - parseFloat(q.total_price)
                ).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewQuotation;