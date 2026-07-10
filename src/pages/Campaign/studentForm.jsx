import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../public/config.js";

const StudentForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(state || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    area_id: "",
    cat_id: "",
    address: "",
    campaign_id: campaign?.id || "",
  });

  // Fetch campaigns if not passed
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}api/campaign/all`);
        if (response.data && response.data.length > 0) {
          setCampaign(response.data[0]);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to load campaigns. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (!state) fetchCampaigns();
  }, [state]);

  // Fetch dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, areaRes] = await Promise.all([
          axios.get(`${BASE_URL}api/category`),
          axios.get(`${BASE_URL}api/area`),
        ]);
        setCategories(catRes.data || []);
        setAreas(areaRes.data || []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to load dropdown data.");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit student form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campaign?.id) {
      alert("⚠️ Campaign ID missing!");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}api/campaign/create-form`, {
        ...formData,
        campaign_id: campaign.id, // ✅ send campaign id
      });
      alert(response.data.message || "Student record created successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        education: "",
        area_id: "",
        cat_id: "",
        address: "",
        campaign_id: campaign.id,
      });
    } catch (error) {
      console.error("Error submitting student form:", error);
      alert("❌ Failed to submit student form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading...</div>;
  if (error)
    return <div className="p-6 text-center text-red-500 dark:text-red-400">{error}</div>;
  if (!campaign)
    return <div className="p-6 text-center text-gray-600 dark:text-gray-300">No campaign found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-boxdark p-6">
      <div className="max-w-4xl mx-auto">
        {/* Campaign Details */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md border border-gray-200 dark:border-strokedark p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {campaign.campaign_name || campaign.name}
          </h2>

          <div className="space-y-3">
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-700 dark:text-gray-300">Platform:</strong>{" "}
              {campaign.platform}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-700 dark:text-gray-300">Start Date:</strong>{" "}
              {new Date(campaign.start_date).toLocaleDateString()}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-700 dark:text-gray-300">End Date:</strong>{" "}
              {new Date(campaign.end_date).toLocaleDateString()}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-700 dark:text-gray-300">Description:</strong>{" "}
              {campaign.description}
            </p>
          </div>
        </div>

        {/* Student Form */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md border border-gray-200 dark:border-strokedark p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            🧍 Student Form
          </h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full Name"
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone Number"
              />
              <input
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Education Details"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="area_id"
                value={formData.area_id}
                onChange={handleChange}
                className="border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Area</option>
                {areas.map((a) => (
                  <option key={a.area_id} value={a.area_id} className="dark:bg-boxdark">
                    {a.area_name}
                  </option>
                ))}
              </select>

              <select
                name="cat_id"
                value={formData.cat_id}
                onChange={handleChange}
                className="border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.cat_id} value={c.cat_id} className="dark:bg-boxdark">
                    {c.cat_name}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              rows="3"
              className="border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>

            {/* ✅ Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-4 rounded-lg text-white font-medium ${
                loading
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Submitting..." : "Submit Form"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;