// src/pages/DownloadCenter/DownloadCenter.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { BASE_URL } from "../../../public/config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faPlus, faMobileAlt, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import AddDownloadItemForm from "./AddDownloadItemForm";

const DownloadCenter = () => {
  const [downloadItems, setDownloadItems] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Fetch download items
  useEffect(() => {
    fetchDownloadItems();
  }, []);

  const fetchDownloadItems = async () => {
    try {
      // ✅ ADD /apk/ to the URL
      const response = await axios.get(`${BASE_URL}api/apk/download-center`, {
        withCredentials: true
      });
      setDownloadItems(response.data);
    } catch (error) {
      console.error("Error fetching download items:", error);
      setErrorMessage("Failed to fetch download items");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Toggle status (Active/Inactive)
  const handleToggleStatus = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      // ✅ ADD /apk/ to the URL
      const response = await axios.patch(`${BASE_URL}api/apk/download-center/${id}/status`, {}, {
        withCredentials: true
      });
      
      setSuccessMessage(response.data.message);
      fetchDownloadItems();
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error toggling status:", error);
      setErrorMessage(error.response?.data?.error || "Failed to update status");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setTogglingId(null);
    }
  };

  // Handle file download
  const handleDownload = async (id, version) => {
    setDownloading(true);
    try {
      // ✅ ADD /apk/ to the URL
      const response = await axios.get(`${BASE_URL}api/apk/download-center/download/${id}`, {
        responseType: 'blob',
        withCredentials: true
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AVCoreApp_${version}.apk`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage("Download started!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error downloading file:", error);
      setErrorMessage(error.response?.data?.error || "Failed to download file");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setDownloading(false);
    }
  };

  // Handle latest APK download
  const handleApkDownload = async () => {
    setDownloading(true);
    try {
      // ✅ ADD /apk/ to the URL
      const response = await axios.get(`${BASE_URL}api/apk/download-center/apk/latest`, {
        responseType: 'blob',
        withCredentials: true
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'AVCoreApp_Latest.apk');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage("Latest APK download started!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error downloading APK:", error);
      setErrorMessage(error.response?.data?.error || "Failed to download APK");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setDownloading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  return (
    <div className="px-2 sm:px-4 dark:bg-boxdark">
      <Breadcrumb pageName="Download Center - APK Versions" />

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowPopup(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 transition-colors"
            disabled={downloading}
          >
            <FontAwesomeIcon icon={faPlus} />
            Upload New APK Version
          </button>
          
          <button
            onClick={handleApkDownload}
            disabled={downloading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faMobileAlt} />
            {downloading ? "Downloading..." : "Download Latest APK"}
          </button>
        </div>
      </div>

      {/* Add APK Form Popup */}
      {showPopup && (
        <AddDownloadItemForm
          onClose={() => setShowPopup(false)}
          onItemAdded={() => {
            fetchDownloadItems();
            setSuccessMessage("New APK version uploaded successfully!");
            setTimeout(() => setSuccessMessage(""), 2000);
          }}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left dark:bg-meta-4">
              <th className="py-4 px-4 font-medium text-black dark:text-white">Version</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Title</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Description</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">File Size</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Downloads</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Status</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Uploaded By</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Uploaded At</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>

          <tbody>
            {downloadItems.length > 0 ? (
              downloadItems.map((item) => (
                <tr key={item.id} className="dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      {item.display_version || item.version}
                    </span>
                   </td>
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 text-black dark:text-white font-medium">
                    {item.title}
                   </td>
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 text-black dark:text-white max-w-xs truncate">
                    {item.description || '-'}
                   </td>
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 text-black dark:text-white">
                    {(item.file_size / (1024 * 1024)).toFixed(2)} MB
                   </td>
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-black dark:text-white">
                      <FontAwesomeIcon icon={faDownload} className="text-blue-500" />
                      {item.download_count || 0}
                    </span>
                   </td>
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(item.status)}`}>
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                   </td>
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 text-black dark:text-white">
                    {item.created_by_name || item.created_by || '-'}
                   </td>
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 text-black dark:text-white text-sm">
                    {new Date(item.created_at).toLocaleString()}
                   </td>
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <div className="flex items-center gap-2">
                     

                      <button
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
                        onClick={() => handleDownload(item.id, item.version)}
                        disabled={downloading || item.status !== 'active'}
                        title={item.status === 'active' ? 'Download' : 'Only active versions can be downloaded'}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                        <span className="text-xs">Download</span>
                      </button>
                    </div>
                   </td>
                 </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-8 text-black dark:text-white">
                  No APK versions available. Click "Upload New APK Version" to get started.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default DownloadCenter;