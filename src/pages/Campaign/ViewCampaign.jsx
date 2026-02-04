import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faCopy, faMessage } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../../public/config.js";

const ViewCampaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/campaign/all`);
        setCampaigns(response.data);
      } catch (err) {
        setError("Failed to load campaigns.");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handlePreview = (campaign) => {
    navigate(`/followup/campaign/preview/${campaign.id}`, { state: campaign });
  };

  const handleResponses = (campaign) => {
    navigate(`/followup/campaign/responses/${campaign.id}`, { state: campaign });
  };

  const handleCopyLink = (campaign) => {
    const link = `${window.location.origin}/followup/campaign/student/${campaign.id}`;
    navigator.clipboard.writeText(link);
    alert("✅ Link copied!");
  };

  const filteredCampaigns = campaigns.filter((c) =>
    c.campaign_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <div className="p-6 text-center text-gray-600 dark:text-gray-300">⏳ Loading campaigns...</div>;

  if (error)
    return <div className="p-6 text-center text-red-500 dark:text-red-400">{error}</div>;

  return (
    <div className="p-4 bg-white dark:bg-boxdark rounded-lg shadow-md border dark:border-strokedark">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          View Campaigns
        </h2>

        {/* Search Box */}
        <input
          type="text"
          placeholder="🔍 Search campaign..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-200 dark:border-strokedark">
          <thead className="bg-gray-100 dark:bg-meta-4">
            <tr>
              <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">#</th>
              <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">Campaign</th>
              <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">Platform</th>
              <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">Start</th>
              <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">End</th>
              <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">Description</th>
              <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b dark:border-strokedark">
                <td className="border border-stroke dark:border-strokedark p-2 text-center text-black dark:text-white">{index + 1}</td>
                <td className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">{item.campaign_name}</td>
                <td className="border border-stroke dark:border-strokedark p-2 text-center text-black dark:text-white">{item.platform}</td>
                <td className="border border-stroke dark:border-strokedark p-2 text-center text-black dark:text-white">
                  {new Date(item.start_date).toLocaleDateString()}
                </td>
                <td className="border border-stroke dark:border-strokedark p-2 text-center text-black dark:text-white">
                  {new Date(item.end_date).toLocaleDateString()}
                </td>
                <td className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">{item.description}</td>
                <td className="border border-stroke dark:border-strokedark p-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handlePreview(item)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>

                    <button
                      onClick={() => handleResponses(item)}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <FontAwesomeIcon icon={faMessage} />
                    </button>

                    <button
                      onClick={() => handleCopyLink(item)}
                      className="p-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredCampaigns.map((item) => (
          <div
            key={item.id}
            className="border border-stroke dark:border-strokedark rounded-lg p-4 shadow-sm bg-gray-50 dark:bg-gray-800"
          >
            <h3 className="font-semibold text-lg text-black dark:text-white">
              {item.campaign_name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{item.platform}</p>

            <p className="text-sm mt-1 text-black dark:text-gray-300">
              📅 {new Date(item.start_date).toLocaleDateString()} –{" "}
              {new Date(item.end_date).toLocaleDateString()}
            </p>

            <p className="text-sm mt-2 text-black dark:text-gray-300">{item.description}</p>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => handlePreview(item)}
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Preview
              </button>
              <button
                onClick={() => handleResponses(item)}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Responses
              </button>
              <button
                onClick={() => handleCopyLink(item)}
                className="flex-1 bg-gray-500 dark:bg-gray-600 text-white py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
          No campaigns found.
        </p>
      )}
    </div>
  );
};

export default ViewCampaign;