import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { BASE_URL } from '../../../public/config';

const cell = 'px-4 py-4 align-middle text-base';

const Inword = () => {
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);

  const [selectedType, setSelectedType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const [loading, setLoading] = useState(false);
  const [activeModels, setActiveModels] = useState<any[]>([]);

  const [customRecordCount, setCustomRecordCount] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClients, setSelectedClients] = useState<number[]>([]);

  /** 🔹 Vendor Modal State */
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [inwordHistory, setInwordHistory] = useState<any[]>([]);

  const navigate = useNavigate();

  /** 🔹 Vendor Form */
  const [vendorForm, setVendorForm] = useState({
    name: '',
    phone: '',
    address: '',
    invoice: '',
    remark: '',
    companyName: '',
    gstNo: '',
    invoiceFile: null as File | null,
    receivedDate: '',
  });

  /* ================= API CALLS ================= */

  useEffect(() => {
    axios
      .get(`${BASE_URL}api/product/types`)
      .then((res) => setProductTypes(res.data.data))
      .catch((err) => console.error(err));
  }, []);
  // Load history from localStorage on mount
  useEffect(() => {
    const storedHistory = JSON.parse(
      sessionStorage.getItem('inwordHistory') || '[]',
    );
    setInwordHistory(storedHistory);
  }, []);

  useEffect(() => {
    if (!selectedType) return;
    setBrands([]);
    setSelectedBrand('');

    axios
      .get(`${BASE_URL}api/product/brands/${selectedType}`)
      .then((res) => setBrands(res.data.data))
      .catch((err) => console.error(err));
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
          const existingIds = prev.map((p) => p.model_id);
          const filteredNew = newModels.filter(
            (nm) => !existingIds.includes(nm.model_id),
          );
          return [...prev, ...filteredNew];
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedBrand]);

  /* ================= HANDLERS ================= */

  const clearFilters = () => {
    setCustomRecordCount('');
    setSearchTerm('');
  };

  const handleBulkDelete = () => {
    alert('Delete Selected: ' + selectedClients.length);
  };

  const handleVendorChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setVendorForm({ ...vendorForm, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVendorForm({ ...vendorForm, invoiceFile: e.target.files[0] });
    }
  };

  // const handleVendorSubmit = () => {
  //   console.log('Vendor Submitted:', vendorForm);
  //   alert('Vendor Submitted!');
  //   setShowVendorModal(false);
  // };

  const handleVendorSubmit = () => {
    const existingVendors = JSON.parse(localStorage.getItem('vendors') || '[]');

    const updatedVendors = [...existingVendors, vendorForm.name];

    localStorage.setItem('vendors', JSON.stringify(updatedVendors));

    setShowVendorModal(false);
  };

  /* ================= UI ================= */

  return (
    <div className="bg-gradient-to-br min-h-screen p-6">
      {/* 🔹 Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-lg border-b mb-4">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Inword Data</h2>

          <div className="flex flex-wrap gap-2">
            {selectedClients.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete Selected ({selectedClients.length})
              </button>
            )}

            <button
              onClick={() => setShowVendorModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Add Vendor
            </button>

            <button
              onClick={() => {
                clearFilters();
                navigate('/add-vendor');
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Add Inword
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Inword History</h3>

        <table className="w-full border border-gray-300 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className={cell}>#</th>
              <th className={cell}>Invoice Number</th>
              {/* <th className={cell}>Bill No</th>
              <th className={cell}>Entry Date</th> */}
              <th className={cell}>Received Date</th>
              <th className={cell}>Vendor</th>
              <th className={cell}>Description</th>
              <th className={cell}>Model</th>
              <th className={cell}>Description</th>
              <th className={cell}>Quantity</th>
            </tr>
          </thead>

          <tbody>
            {inwordHistory.length ? (
              inwordHistory.flatMap((record, i) =>
                record.products.map((p: any, idx: number) => (
                  <tr key={`${record.id}-${idx}`} className="text-center">
                    <td className={cell}>{i + 1}</td>
                    <td className={cell}>{record.invoiceNo}</td>
                    {/* <td className={cell}>{record.billNo}</td>
                    <td className={cell}>{record.entryDate}</td> */}
                    <td className={cell}>{record.receivedDate}</td>
                    <td className={cell}>{record.vendor}</td>
                    <td className={cell}>{record.description}</td>
                    <td className={cell}>{p.model_nameInput}</td>
                    <td className={cell}>{p.descriptionInput}</td>
                    <td className={cell}>{p.quentityInput}</td>
                  </tr>
                )),
              )
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  No History Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= ADD VENDOR MODAL ================= */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700">
              Add Vendor
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="name"
                placeholder="Vendor Name"
                value={vendorForm.name}
                onChange={handleVendorChange}
                className="border px-4 py-2 rounded-lg"
              />
              <input
                name="phone"
                placeholder="Phone No"
                value={vendorForm.phone}
                onChange={handleVendorChange}
                className="border px-4 py-2 rounded-lg"
              />
              <input
                name="address"
                placeholder="Address"
                value={vendorForm.address}
                onChange={handleVendorChange}
                className="border px-4 py-2 rounded-lg"
              />
              <input
                name="invoice"
                placeholder="Invoice No"
                value={vendorForm.invoice}
                onChange={handleVendorChange}
                className="border px-4 py-2 rounded-lg"
              />
              <input
                name="companyName"
                placeholder="Company Name"
                value={vendorForm.companyName}
                onChange={handleVendorChange}
                className="border px-4 py-2 rounded-lg"
              />
              {/* <label className="block text-sm mb-1">
                Upload Invoice File
                <input
                  type="file"
                  name="invoiceFile"
                  onChange={handleFileChange}
                  className="border px-4 py-2 rounded-lg w-full"
                />
              </label> */}

              <input
                name="gstNo"
                placeholder="GST No"
                value={vendorForm.gstNo}
                onChange={handleVendorChange}
                className="border px-4 py-2 rounded-lg"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowVendorModal(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleVendorSubmit}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inword;