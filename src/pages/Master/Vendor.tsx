import { useEffect, useState } from "react";
import axios from "axios";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb.js";
import { BASE_URL } from "../../../public/config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faEye } from "@fortawesome/free-solid-svg-icons";
import AddVendorForm from "./AddVendorForm.js";
import EditVendorForm from "./EditVendorForm.js";

type VendorItem = {
  vendor_id: number;
  company_name: string;
  vendor_name?: string | null;
  contact_number: string;
  company_email?: string | null;
  office_address?: string | null;
  city?: string | null;
  state_province?: string | null;
  invoice_gst_number?: string | null;
  remarks?: string | null;
};

const Vendor = () => {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<VendorItem[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editVendor, setEditVendor] = useState<VendorItem | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [viewVendor, setViewVendor] = useState<VendorItem | null>(null);
  const [showViewPopup, setShowViewPopup] = useState(false);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(BASE_URL + "api/vendors", { withCredentials: true });
      const items = response.data?.data || [];
      setVendors(items);
      setFilteredData(items);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
      setFilteredData([]);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this vendor?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}api/vendors/${id}`, { withCredentials: true });
      const updated = vendors.filter((vendor) => vendor.vendor_id !== id);
      setVendors(updated);
      setFilteredData(updated);
      alert("Vendor deleted successfully!");
    } catch (error) {
      console.error("Error deleting vendor:", error);
      alert("Failed to delete vendor.");
    }
  };

  const handleSearch = () => {
    const filtered = vendors.filter((vendor) =>
      Object.values(vendor).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className="px-2 sm:px-4">
      <Breadcrumb pageName="Manage Vendors" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <button
          onClick={() => setShowPopup(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Vendor
        </button>

        <div className="flex w-full sm:w-auto gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border rounded px-4 py-2"
            placeholder="Search vendors..."
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>

      {showPopup && (
        <AddVendorForm
          onClose={() => setShowPopup(false)}
          onVendorAdded={() => {
            fetchVendors();
          }}
        />
      )}

      {showViewPopup && viewVendor && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 px-2 pt-24 pb-6">
          <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[calc(100vh-7rem)] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Vendor Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="font-semibold text-black dark:text-white">Company Name</p>
                <p className="text-black dark:text-white">{viewVendor.company_name || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-black dark:text-white">Vendor Name</p>
                <p className="text-black dark:text-white">{viewVendor.vendor_name || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-black dark:text-white">Contact Number</p>
                <p className="text-black dark:text-white">{viewVendor.contact_number || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-black dark:text-white">Company Email</p>
                <p className="text-black dark:text-white">{viewVendor.company_email || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-black dark:text-white">Office Address</p>
                <p className="text-black dark:text-white">{viewVendor.office_address || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-black dark:text-white">City</p>
                <p className="text-black dark:text-white">{viewVendor.city || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-black dark:text-white">State / Province</p>
                <p className="text-black dark:text-white">{viewVendor.state_province || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-black dark:text-white">Invoice GST Number</p>
                <p className="text-black dark:text-white">{viewVendor.invoice_gst_number || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-semibold text-black dark:text-white">Remarks</p>
                <p className="text-black dark:text-white">{viewVendor.remarks || "-"}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowViewPopup(false);
                  setViewVendor(null);
                }}
                className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-5 py-2.5 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 dark:bg-meta-4">
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">#</th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">Company Name</th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">Vendor Name</th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">Contact Number</th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">Company Email</th>
              {/* <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">Office Address</th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">City</th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">State / Province</th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">Invoice GST Number</th> */}
              {/* <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">Remarks</th> */}
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>

          <tbody>
            {showEditPopup && editVendor && (
              <EditVendorForm
                vendor={editVendor}
                onClose={() => setShowEditPopup(false)}
                onVendorUpdated={() => {
                  fetchVendors();
                }}
              />
            )}

            {filteredData.length > 0 ? (
              filteredData.map((vendor, index) => (
                <tr key={vendor.vendor_id}>
                  <td className="border-b py-2 px-3 text-sm">{index + 1}</td>
                  <td className="border-b py-2 px-3 text-sm font-medium">{vendor.company_name}</td>
                  <td className="border-b py-2 px-3 text-sm">{vendor.vendor_name || "-"}</td>
                  <td className="border-b py-2 px-3 text-sm">{vendor.contact_number}</td>
                  <td className="border-b py-2 px-3 text-sm">{vendor.company_email || "-"}</td>
                  {/* <td className="border-b py-2 px-3 text-sm">{vendor.office_address || "-"}</td> */}
                  {/* <td className="border-b py-2 px-3 text-sm">{vendor.city || "-"}</td>
                  <td className="border-b py-2 px-3 text-sm">{vendor.state_province || "-"}</td>
                  <td className="border-b py-2 px-3 text-sm">{vendor.invoice_gst_number || "-"}</td> */}
                  {/* <td className="border-b py-2 px-3 text-sm">{vendor.remarks || "-"}</td> */}
                  <td className="border-b py-2 px-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded-md p-2 bg-blue-600 text-white"
                        onClick={() => {
                          setViewVendor(vendor);
                          setShowViewPopup(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>

                      <button
                        className="rounded-md p-2 bg-green-600 text-white"
                        onClick={() => {
                          setEditVendor(vendor);
                          setShowEditPopup(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <button
                        className="rounded-md p-2 bg-black text-white"
                        onClick={() => handleDelete(vendor.vendor_id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Vendor;