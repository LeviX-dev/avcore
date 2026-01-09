import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../public/config.js";

const PreviewPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(state || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({
    campaign_name: "",
    platform: "",
    start_date: "",
    end_date: "",
    description: "",
  });

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

  const handleBack = () => navigate("/followup/view-campaign");

  const handleEdit = () => {
    setEditData({
      campaign_name: campaign.campaign_name,
      platform: campaign.platform,
      start_date: campaign.start_date.split("T")[0],
      end_date: campaign.end_date.split("T")[0],
      description: campaign.description,
    });
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}api/campaign/update/${campaign.id}`,
        editData
      );
      alert(response.data.message || "Campaign updated successfully!");
      setCampaign((prev) => ({ ...prev, ...editData }));
      setShowModal(false);
    } catch (err) {
      console.error("Error updating campaign:", err);
      alert("Error while updating campaign. Please try again.");
    }
  };

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
    return <div className="p-6 text-center text-gray-600">Loading...</div>;
  if (error)
    return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!campaign)
    return <div className="p-6 text-center text-gray-600">No campaign found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            ← Back
          </button>

          <button
            onClick={handleEdit}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            ✏️ Edit Campaign
          </button>
        </div>

        {/* Campaign Details */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {campaign.campaign_name || campaign.name}
          </h2>

          <div className="space-y-3">
            <p>
              <strong className="text-gray-700">Platform:</strong>{" "}
              {campaign.platform}
            </p>
            <p>
              <strong className="text-gray-700">Start Date:</strong>{" "}
              {new Date(campaign.start_date).toLocaleDateString()}
            </p>
            <p>
              <strong className="text-gray-700">End Date:</strong>{" "}
              {new Date(campaign.end_date).toLocaleDateString()}
            </p>
            <p>
              <strong className="text-gray-700">Description:</strong>{" "}
              {campaign.description}
            </p>
          </div>
        </div>

        {/* Student Form */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            🧍 Student Form
          </h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full Name"
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Phone Number"
              />
              <input
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Education Details"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="area_id"
                value={formData.area_id}
                onChange={handleChange}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Area</option>
                {areas.map((a) => (
                  <option key={a.area_id} value={a.area_id}>
                    {a.area_name}
                  </option>
                ))}
              </select>

              <select
                name="cat_id"
                value={formData.cat_id}
                onChange={handleChange}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.cat_id} value={c.cat_id}>
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
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>

            {/* ✅ Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-4 rounded-lg text-white font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Submitting..." : "Submit Form"}
            </button>
          </form>
        </div>
      </div>

      {/* ✅ Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Edit Campaign
            </h2>

            <input
              type="text"
              name="campaign_name"
              value={editData.campaign_name}
              onChange={handleModalChange}
              placeholder="Campaign Name"
              className="border border-gray-300 p-2 w-full mb-3 rounded"
            />
            <input
              type="text"
              name="platform"
              value={editData.platform}
              onChange={handleModalChange}
              placeholder="Platform"
              className="border border-gray-300 p-2 w-full mb-3 rounded"
            />
            <input
              type="date"
              name="start_date"
              value={editData.start_date}
              onChange={handleModalChange}
              className="border border-gray-300 p-2 w-full mb-3 rounded"
            />
            <input
              type="date"
              name="end_date"
              value={editData.end_date}
              onChange={handleModalChange}
              className="border border-gray-300 p-2 w-full mb-3 rounded"
            />
            <textarea
              name="description"
              value={editData.description}
              onChange={handleModalChange}
              placeholder="Description"
              className="border border-gray-300 p-2 w-full mb-3 rounded"
            ></textarea>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPage;
