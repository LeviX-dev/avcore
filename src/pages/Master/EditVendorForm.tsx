import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

const EditVendorForm = ({ vendor, onClose, onVendorUpdated }) => {
  const [cityOptions, setCityOptions] = useState<Array<{ area_id: number; area_name: string }>>([]);
  const [formData, setFormData] = useState({
    company_name: vendor.company_name || "",
    vendor_name: vendor.vendor_name || "",
    contact_number: vendor.contact_number || "",
    company_email: vendor.company_email || "",
    office_address: vendor.office_address || "",
    city: vendor.city || "",
    state_province: vendor.state_province || "",
    invoice_gst_number: vendor.invoice_gst_number || "",
    remarks: vendor.remarks || "",
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(BASE_URL + "api/area", { withCredentials: true });
        setCityOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCityOptions([]);
      }
    };

    fetchCities();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}api/vendors/${vendor.vendor_id}`, formData, {
        withCredentials: true,
      });
      alert("Vendor updated successfully");
      onVendorUpdated();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update vendor");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 px-2 pt-24 pb-6">
      <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[calc(100vh-7rem)] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Edit Vendor</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-black dark:text-white">Company Name</label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" required />
            </div>
            <div>
              <label className="block mb-2 text-black dark:text-white">Vendor Name</label>
              <input type="text" name="vendor_name" value={formData.vendor_name} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>
            <div>
              <label className="block mb-2 text-black dark:text-white">Contact Number</label>
              <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" required />
            </div>
            <div>
              <label className="block mb-2 text-black dark:text-white">Company Email</label>
              <input type="email" name="company_email" value={formData.company_email} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>
            <div>
              <label className="block mb-2 text-black dark:text-white">Office Address</label>
              <input type="text" name="office_address" value={formData.office_address} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>

            <div>
              <label className="block mb-2 text-black dark:text-white">City</label>
              <select name="city" value={formData.city} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white">
                <option value="">Select city</option>
                {cityOptions.map((city) => (
                  <option key={city.area_id} value={city.area_name}>
                    {city.area_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-black dark:text-white">State / Province</label>
              <input type="text" name="state_province" value={formData.state_province} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>
            <div>
              <label className="block mb-2 text-black dark:text-white">Invoice GST Number</label>
              <input type="text" name="invoice_gst_number" value={formData.invoice_gst_number} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-2 text-black dark:text-white">Remarks</label>
              <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-5 py-2.5 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVendorForm;