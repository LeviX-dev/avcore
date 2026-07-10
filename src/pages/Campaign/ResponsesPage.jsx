import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../public/config.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ResponsesPage = () => {
  const { state: campaign } = useLocation();
  const navigate = useNavigate();

  const [responses, setResponses] = useState([]);
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  // =========================
  // Fetch responses
  // =========================
useEffect(() => {
  const fetchResponses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/campaign/get-all`, {
        params: { campaign_id: campaign.id }
      });

      setResponses(res.data || []);
    } catch (error) {
      console.error("❌ Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchResponses();
}, [campaign]);

  // =========================
  // Table selection logic
  // =========================
  const toggleSelect = (id) => {
    setSelectedResponses((prev) =>
      prev.includes(id)
        ? prev.filter((resId) => resId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedResponses.length === responses.length) {
      setSelectedResponses([]);
    } else {
      setSelectedResponses(responses.map((r) => r.id));
    }
  };

  // =========================
  // Navigation
  // =========================
  const handleBack = () => navigate("/followup/view-campaign");

  // =========================
  // Export to Excel
  // =========================
  const handleExport = () => {
    if (selectedResponses.length === 0) {
      alert("⚠️ Please select at least one response to export.");
      return;
    }

    const dataToExport = responses
      .filter((res) => selectedResponses.includes(res.id))
      .map((res) => ({
        name: res.name,
        contact: res.phone, // replace with res.contact if needed
        email: res.email,
        address: res.address,
      }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `responses_${today}.xlsx`);
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">Loading responses...</div>
    );

  // =========================
  // Render
  // =========================
  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      {/* Header Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Back
        </button>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          📤 Export Selected
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Responses {campaign?.name ? `for ${campaign.name}` : ""}
      </h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border border-gray-200 p-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedResponses.length === responses.length}
                  onChange={toggleSelectAll}
                />{" "}
                All
              </th>
              <th className="border border-gray-200 p-2">Name</th>
              <th className="border border-gray-200 p-2">Email</th>
              <th className="border border-gray-200 p-2">Phone</th>
              <th className="border border-gray-200 p-2">Education</th>
              <th className="border border-gray-200 p-2">Address</th>
              <th className="border border-gray-200 p-2">Campaign</th>
              <th className="border border-gray-200 p-2">Area</th>
              <th className="border border-gray-200 p-2">Category</th>
              <th className="border border-gray-200 p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {responses.length > 0 ? (
              responses.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedResponses.includes(res.id)}
                      onChange={() => toggleSelect(res.id)}
                    />
                  </td>
                  <td className="border border-gray-200 p-2">{res.name}</td>
                  <td className="border border-gray-200 p-2">{res.email}</td>
                  <td className="border border-gray-200 p-2">{res.phone}</td>
                  <td className="border border-gray-200 p-2">{res.education}</td>
                  <td className="border border-gray-200 p-2 whitespace-pre-line">{res.address}</td>
                  <td className="border border-gray-200 p-2">{res.campaign_name}</td>
                  <td className="border border-gray-200 p-2">{res.area_name}</td>
                  <td className="border border-gray-200 p-2">{res.cat_name}</td>
                  <td className="border border-gray-200 p-2">{new Date(res.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center text-gray-500 p-4 border border-gray-200">
                  No responses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsesPage;