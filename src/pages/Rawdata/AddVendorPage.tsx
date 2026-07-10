import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';

const cell = 'px-4 py-4 align-middle text-base';

const AddInwordPage = () => {
  /* ================= PRODUCT STATE ================= */
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);

  const [selectedType, setSelectedType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const [loading, setLoading] = useState(false);

  // ✅ stable table rows
  const [activeModels, setActiveModels] = useState<any[]>([]);

  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    invoiceNo: '',
    billNo: '',
    entryDate: '',
    receivedDate: '',
    description: '',
    vendor: '',
  });

  const [vendors, setVendors] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const filteredModels = activeModels;

  /* ================= API ================= */
  useEffect(() => {
    axios
      .get(`${BASE_URL}api/product/types`)
      .then((res) => setProductTypes(res.data.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const storedVendors = JSON.parse(localStorage.getItem('vendors') || '[]');
    setVendors(storedVendors);
  }, []);

  useEffect(() => {
    if (!selectedType) return;
    setBrands([]);
    setSelectedBrand('');

    axios
      .get(`${BASE_URL}api/product/brands/${selectedType}`)
      .then((res) => setBrands(res.data.data))
      .catch(console.error);
  }, [selectedType]);

  useEffect(() => {
    if (!selectedBrand) return;
    setLoading(true);
    setSelectedModel('');

    axios
      .get(`${BASE_URL}api/product/models/${selectedBrand}`)
      .then((res) => {
        const newModels = res.data.data.map((m: any) => ({
          ...m,
          quentityInput: 0,
          model_nameInput: m.model_name,
          descriptionInput: m.description || '',
        }));

        setModels((prev) => {
          const ids = prev.map((p) => p.model_id);
          return [
            ...prev,
            ...newModels.filter((n) => !ids.includes(n.model_id)),
          ];
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedBrand]);

  /* ================= TABLE HANDLERS ================= */
  const handleQuantityChange = (id: any, value: string) => {
    setActiveModels((prev) =>
      prev.map((m) => (m.model_id === id ? { ...m, quentityInput: value } : m)),
    );
  };

  const handleModelChange = (id: any, value: string) => {
    setActiveModels((prev) =>
      prev.map((m) =>
        m.model_id === id ? { ...m, model_nameInput: value } : m,
      ),
    );
  };

  const handleDescriptionChange = (id: any, value: string) => {
    setActiveModels((prev) =>
      prev.map((m) =>
        m.model_id === id ? { ...m, descriptionInput: value } : m,
      ),
    );
  };
  // const handleSubmit = () => {
  //   console.log('Inword Form Data:', formData);
  //   alert('Form Submitted!');
  // };

  const handleSubmit = () => {
    const historyRecord = {
      id: Date.now(),
      invoiceNo: formData.invoiceNo,
      billNo: formData.billNo,
      entryDate: formData.entryDate,
      receivedDate: formData.receivedDate,
      vendor: formData.vendor,
      description: formData.description,
      products: activeModels,
    };

    const existingHistory = JSON.parse(
      sessionStorage.getItem('inwordHistory') || '[]',
    );

    sessionStorage.setItem(
      'inwordHistory',
      JSON.stringify([...existingHistory, historyRecord]),
    );

    alert('Inword Saved Successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-20x2 mx-auto bg-white rounded-lg shadow">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Add Inword</h2>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleChange}
                placeholder="Enter Invoice Number"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Bill No
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill No
              </label>
              <input
                type="text"
                name="billNo"
                value={formData.billNo}
                onChange={handleChange}
                placeholder="Enter Bill No"
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div> */}

            {/* Entry Date */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Date
              </label>
              <input
                type="date"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div> */}

            {/* Received Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received Date
              </label>
              <input
                type="date"
                name="receivedDate"
                value={formData.receivedDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>

            {/* Select Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Vendor
              </label>
              <select
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2 bg-white"
              >
                <option value="">Select Vendor</option>

                {vendors.map((v, i) => (
                  <option key={i} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter Description"
                rows={3}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>
          </div>

          {/* Save Button */}
          {/* <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-medium"
            >
              Save Inword
            </button>
          </div> */}

          {/* ================= TABLE (AS IT IS) ================= */}
          <div className="bg-gradient-to-br  p-1 rounded-lg shadow mt-5">
            {/* PRODUCT FILTERS */}
            <div className="bg-white shadow-xl p-8 space-y-8">
              <div className="flex gap-4 mb-6 flex-wrap">
                <select
                  className="border px-4 py-2 rounded-lg bg-blue-50 text-blue-800 font-medium"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Product Type</option>
                  {productTypes.map((pt) => (
                    <option key={pt.product_type_id} value={pt.product_type_id}>
                      {pt.product_type_name}
                    </option>
                  ))}
                </select>

                <select
                  className="border px-4 py-2 rounded-lg bg-purple-50 text-purple-800 font-medium"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  disabled={!brands.length}
                >
                  <option value="">Brand</option>
                  {brands.map((b) => (
                    <option key={b.brand_id} value={b.brand_id}>
                      {b.brand_name}
                    </option>
                  ))}
                </select>

                <select
                  className="border px-4 py-2 rounded-lg bg-pink-50 text-pink-800 font-medium"
                  value={selectedModel}
                  onChange={(e) => {
                    const modelId = e.target.value;
                    setSelectedModel(modelId);

                    const modelObj = models.find((m) => m.model_id == modelId);
                    if (!modelObj) return;

                    const alreadyAdded = activeModels.some(
                      (m) => m.model_id === modelObj.model_id,
                    );
                    if (alreadyAdded) return;

                    setActiveModels((prev) => [...prev, modelObj]);
                  }}
                  disabled={!models.length}
                >
                  <option value="">Model</option>
                  {models.map((m) => (
                    <option key={m.model_id} value={m.model_id}>
                      {m.model_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* TABLE */}
              <table className="w-full border border-gray-300 border-collapse">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr className="border-b-2 border-gray-200 font-semibold">
                    <th className="px-4 py-3 border-b-2 border-gray-300 text-center">
                      #
                    </th>
                    <th className="px-4 py-3 border-b-2 border-gray-300">
                      Model
                    </th>
                    <th className="px-4 py-3 border-b-2 border-gray-300">
                      Model Description
                    </th>
                    <th className="px-4 py-3 border-b-2 border-gray-300">
                      Quantity
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-6 text-indigo-600"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : filteredModels.length ? (
                    filteredModels.map((m, index) => (
                      <tr key={m.model_id} className="text-center">
                        <td className={cell + ' font-semibold text-indigo-700'}>
                          {index + 1}
                        </td>

                        <td className={cell}>
                          <input
                            className="border px-2 py-1 rounded-lg text-center w-32 bg-blue-50 text-blue-700 font-medium"
                            value={m.model_nameInput}
                            onChange={(e) =>
                              handleModelChange(m.model_id, e.target.value)
                            }
                          />
                        </td>

                        <td className={cell}>
                          <input
                            className="border px-2 py-1 rounded-lg text-center w-48 bg-purple-50 text-purple-700 font-medium"
                            value={m.descriptionInput}
                            onChange={(e) =>
                              handleDescriptionChange(
                                m.model_id,
                                e.target.value,
                              )
                            }
                          />
                        </td>

                        <td className={cell}>
                          <input
                            className="border px-2 py-1 rounded-lg text-center w-24 bg-green-50 text-green-700 font-medium"
                            value={m.quentityInput}
                            onChange={(e) =>
                              handleQuantityChange(m.model_id, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-6 text-gray-400"
                      >
                        No Data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInwordPage;