// src/pages/DownloadCenter/AddDownloadItemForm.jsx
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

const AddDownloadItemForm = ({ onClose, onItemAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title) {
      setFeedback("Title is required");
      return;
    }
    
    if (!file) {
      setFeedback("Please select an APK file to upload");
      return;
    }

    // Validate file extension
    if (!file.name.endsWith('.apk')) {
      setFeedback("Only APK files are allowed");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      // ✅ ADD /apk/ to the URL
      const response = await axios.post(`${BASE_URL}api/apk/download-center`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setFeedback(`Success! New version ${response.data.version} uploaded successfully!`);

      setTimeout(() => {
        setFeedback("");
        onItemAdded();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error adding item:", error);
      setFeedback(error.response?.data?.error || "Failed to upload APK");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
      <div className="bg-white dark:bg-boxdark p-6 rounded-lg w-full max-w-md mt-20 mb-8">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Upload New APK Version</h2>
        
        {feedback && (
          <div className={`mb-4 text-sm text-center p-3 rounded ${
            feedback.includes("Success") 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {feedback}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-black dark:text-white mb-2 font-medium">Version Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AVCore Mobile App v1"
              className="w-full p-3 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Version number will be auto-generated (v0, v1, v2...)</p>
          </div>

          <div className="mb-4">
            <label className="block text-black dark:text-white mb-2 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="What's new in this version?"
              className="w-full p-3 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-black dark:text-white mb-2 font-medium">APK File *</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".apk"
              className="w-full p-2 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Only .apk files are allowed. Max size: 100MB</p>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload APK"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDownloadItemForm;