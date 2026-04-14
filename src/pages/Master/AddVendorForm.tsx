import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

interface AddVendorFormProps {
  onClose: () => void;
  onVendorAdded: () => void;
}

const AddVendorForm: React.FC<AddVendorFormProps> = ({ onClose, onVendorAdded }) => {
  const [cityOptions, setCityOptions] = useState<Array<{ area_id: number; area_name: string }>>([]);
  const [formData, setFormData] = useState({
    company_name: "",
    vendor_name: "",
    contact_number: "",
    company_email: "",
    office_address: "",
    city: "",
    state_province: "",
    invoice_gst_number: "",
    remarks: "",
  });
  const [feedback, setFeedback] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(BASE_URL + "api/vendors", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setFeedback("Vendor added successfully!");
      setTimeout(() => {
        setFeedback("");
        onClose();
        onVendorAdded();
      }, 3000);
    } catch (error: any) {
      console.error("Error adding vendor:", error.response?.data || error.message);
      setFeedback("Error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 px-2 pt-24 pb-6">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-[90%] sm:w-[70%] lg:w-1/2 p-6 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-center sm:text-left text-black dark:text-white">
          Add Vendor
        </h3>

        {feedback && (
          <p className={`mb-3 text-sm text-center sm:text-left ${feedback.includes("successfully") ? "text-green-500" : "text-red-500"}`}>
            {feedback}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Company Name</label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Vendor Name</label>
              <input type="text" name="vendor_name" value={formData.vendor_name} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Contact Number</label>
              <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Company Email</label>
              <input type="email" name="company_email" value={formData.company_email} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Office Address</label>
              <input type="text" name="office_address" value={formData.office_address} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white"
              >
                <option value="">Select city</option>
                {cityOptions.map((city) => (
                  <option key={city.area_id} value={city.area_name}>
                    {city.area_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">State / Province</label>
              <input type="text" name="state_province" value={formData.state_province} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Invoice GST Number</label>
              <input type="text" name="invoice_gst_number" value={formData.invoice_gst_number} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Remarks</label>
              <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg bg-transparent text-black dark:text-white" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition">
              Cancel
            </button>
            <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorForm;