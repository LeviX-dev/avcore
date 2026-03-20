import { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
// import AddKitForm from "./AddKitForm";
// import EditKitForm from "./EditKitForm";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faEye,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';
import AddKitForm from './AddKit';
import EditKitForm from './EditKitForm';
import { useNavigate } from 'react-router-dom';

const KitManagement = () => {
  const [kits, setKits] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editKit, setEditKit] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewKit, setViewKit] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchKits();
  }, []);

  const fetchKits = async () => {
    const res = await axios.get(`${BASE_URL}api/allkit`);
    setKits(res.data);
    setFilteredData(res.data);
  };

  const handleSearch = () => {
    const filtered = kits.filter((kit) =>
      kit.kit_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredData(filtered);
  };

  const handleToggleStatus = async (kit_id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      await axios.put(`${BASE_URL}api/kit/${kit_id}/status`, {
        status: newStatus,
      });

      // Refresh kit list
      fetchKits();

      alert(`Kit status updated to ${newStatus}`);
    } catch (error) {
      console.error('❌ Toggle Status Error:', error);
      alert('Failed to update kit status');
    }
  };

  return (
    <div>
      <Breadcrumb pageName="Manage Package" />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <button
            onClick={() => navigate('/master/add-kit')}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto"
          >
            Add Package
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-4 py-2 w-full sm:w-64"
            placeholder="Search kits..."
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            Search
          </button>
        </div>
      </div>

      {/* 
      {showPopup && (
        <AddKitForm
          onClose={() => setShowPopup(false)}
          onKitAdded={fetchKits}
        />
      )} */}

      {showEditPopup && editKit && (
        <EditKitForm
          kit={editKit}
          onClose={() => {
            setShowEditPopup(false);
            setEditKit(null);
          }}
          onKitUpdated={fetchKits}
        />
      )}

      {/* Table */}
      <div className="max-w-full mt-2 overflow-x-auto rounded-sm border bg-white shadow-default">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="py-4 px-4">Sr No.</th>
              <th className="py-4 px-4">Package Name</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4">Package Price</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((kit, index) => (
                <tr key={kit.kit_id}>
                  <td className="py-3 px-4">{index + 1}</td>

                  <td className="py-3 px-4 font-medium">{kit.kit_name}</td>

                  <td className="py-3 px-4 font-medium">{kit.cat_name}</td>

                  <td className="py-3 px-4">
                    ₹{Number(kit.kit_price).toFixed(2)}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                        kit.status === 'active'
                          ? 'bg-success bg-opacity-10 text-success'
                          : 'bg-danger bg-opacity-10 text-danger'
                      }`}
                    >
                      {kit.status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      {/* View Kit */}
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={() => {
                          setViewKit(kit);
                          setShowViewModal(true);
                        }}
                        title="View Kit"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>

                      {/* Edit Kit */}
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded"
                        onClick={() => {
                          setEditKit(kit);
                          setShowEditPopup(true);
                        }}
                        title="Edit Kit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className={`px-3 py-1 rounded text-white ${
                          kit.status === 'active'
                            ? 'bg-red-600'
                            : 'bg-green-600'
                        }`}
                        onClick={() =>
                          handleToggleStatus(kit.kit_id, kit.status)
                        }
                      >
                        {kit.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  No kits found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW KIT MODAL (INLINE) */}
      {showViewModal && viewKit && (
        <div className="fixed inset-0 bg-black/50 flex items-center ml-40 mt-5 justify-center z-50 p-3">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg max-h-[85vh] overflow-hidden">
            {/* HEADER */}
            <div className="flex justify-between items-center px-5 py-4 border-b">
              <h2 className="text-lg font-semibold">Kit Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewKit(null);
                }}
                className="text-gray-500 hover:text-black"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-5 overflow-y-auto max-h-[75vh]">
              {/* BASIC INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-500">Kit Name</p>
                  <p className="font-medium">{viewKit.kit_name}</p>
                </div>

                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{viewKit.cat_name}</p>
                </div>

                <div>
                  <p className="text-gray-500">Total Kit Price</p>
                  <p className="font-semibold text-green-700">
                    ₹
                    {viewKit.items
                      ?.reduce(
                        (sum, item) =>
                          sum + Number(item.qty) * Number(item.model_price),
                        0,
                      )
                      .toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Status</p>
                  <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    {viewKit.status}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-gray-500">Description</p>
                  <p className="text-sm">{viewKit.description || '-'}</p>
                </div>
              </div>

              {/* PRODUCTS */}
              <h3 className="font-semibold mb-3">Kit Products</h3>

              {/* TABLE FOR DESKTOP */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-2">#</th>
                      <th className="border px-2 py-2">Product</th>
                      <th className="border px-2 py-2">Brand</th>
                      <th className="border px-2 py-2">Model</th>
                      <th className="border px-2 py-2">Qty</th>
                      <th className="border px-2 py-2">Unit</th>
                      <th className="border px-2 py-2">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {viewKit.items?.map((item, index) => (
                      <tr key={item.kmap_id}>
                        <td className="border px-2 py-2 text-center">
                          {index + 1}
                        </td>
                        <td className="border px-2 py-2">
                          {item.product_type_name}
                        </td>
                        <td className="border px-2 py-2">{item.brand_name}</td>
                        <td className="border px-2 py-2">{item.model_no}</td>
                        <td className="border px-2 py-2 text-center">
                          {item.qty}
                        </td>
                        <td className="border px-2 py-2">
                          ₹{Number(item.model_price).toFixed(2)}
                        </td>
                        <td className="border px-2 py-2 font-medium">
                          ₹{(item.qty * item.model_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CARDS FOR MOBILE */}
              <div className="md:hidden space-y-3">
                {viewKit.items?.map((item, index) => (
                  <div
                    key={item.kmap_id}
                    className="border rounded-lg p-3 text-sm bg-gray-50"
                  >
                    <p className="font-medium">
                      {index + 1}. {item.product_type_name}
                    </p>
                    <p>Brand: {item.brand_name}</p>
                    <p>Model: {item.model_no}</p>
                    <p>Qty: {item.qty}</p>
                    <p>Unit Price: ₹{Number(item.model_price).toFixed(2)}</p>
                    <p className="font-semibold text-green-700">
                      Total: ₹{(item.qty * item.model_price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-5 py-4 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewKit(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitManagement;