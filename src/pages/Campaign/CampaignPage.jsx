import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

const CampaignPage = () => {
  const [campaignName, setCampaignName] = useState("");
  const [platform, setPlatform] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${BASE_URL}api/campaign/create`, {
        campaign_name: campaignName,
        platform,
        start_date: startDate,
        end_date: endDate,
        description,
      });

      setMessage(`✅ ${response.data.message || "Campaign created successfully!"}`);

      setCampaignName("");
      setPlatform("");
      setStartDate("");
      setEndDate("");
      setDescription("");
    } catch (error) {
      if (error.response) {
        setMessage(`❌ ${error.response.data.message || "Failed to create campaign."}`);
      } else {
        setMessage("⚠️ Server error. Please try again later.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="px-2 sm:px-4 dark:bg-boxdark min-h-screen py-4">
      {/* 🔹 MOBILE RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 768px) {
          .campaign-container {
            padding: 16px !important;
            margin: 0 10px;
          }

          .campaign-title {
            font-size: 1.25rem;
            text-align: center;
          }

          .date-row {
            flex-direction: column;
            gap: 12px;
          }

          button {
            width: 100%;
          }
        }
      `}</style>

      <div className="p-6 bg-white dark:bg-boxdark rounded-lg shadow-md max-w-2xl mx-auto campaign-container border dark:border-strokedark">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white campaign-title">
          Create Campaign
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 text-center rounded-lg ${
              message.includes("✅")
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campaign Name */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required
              className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">
              Select Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              required
              className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="dark:bg-boxdark">-- Choose Platform --</option>
              <option value="Google" className="dark:bg-boxdark">Google</option>
              <option value="Instagram" className="dark:bg-boxdark">Instagram</option>
              <option value="Facebook" className="dark:bg-boxdark">Facebook</option>
              <option value="LinkedIn" className="dark:bg-boxdark">LinkedIn</option>
              <option value="Twitter" className="dark:bg-boxdark">Twitter</option>
            </select>
          </div>

          {/* Dates */}
          <div className="flex gap-4 date-row">
            <div className="flex-1">
              <label className="block font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1">
              <label className="block font-medium text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              loading
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            }`}
          >
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CampaignPage;