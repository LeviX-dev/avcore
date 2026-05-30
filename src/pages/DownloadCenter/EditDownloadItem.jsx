// src/pages/DownloadCenter/EditDownloadItem.jsx
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

const EditDownloadItem = ({ itemToEdit, onClose, onItemUpdated }) => {
  const [title, setTitle] = useState(itemToEdit.title);
  const [description, setDescription] = useState(itemToEdit.description || "");
  const [fileType, setFileType] = useState(itemToEdit.file_type);
  const [version, setVersion] = useState(itemToEdit.version || "1.0.0");
  const [status, setStatus] = useState(itemToEdit.status);
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title) {
      setFeedback("Title is required");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file_type", fileType);
    formData.append("version", version);
    formData.append("status", status);
    if (file) {
      formData.append("file", file);
    }

    try {
      await axios.put(`${BASE_URL}api/apk/download-center/${itemToEdit.id}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFeedback("Item updated successfully!");

      setTimeout(() => {
        setFeedback("");
        onItemUpdated();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error updating item:", error);
      setFeedback(error.response?.data?.error || "Failed to update item");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-boxdark p-5 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Edit Download Item</h2>
        {feedback && (
          <div className={`mb-3 text-sm text-center ${feedback.includes("successfully") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {feedback}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-black dark:text-white mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-black dark:text-white mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full p-3 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-black dark:text-white mb-2">File Type</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full p-3 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg"
            >
              <option value="apk">APK (Android App)</option>
              <option value="pdf">PDF Document</option>
              <option value="doc">Word Document</option>
              <option value="xls">Excel Document</option>
              <option value="zip">ZIP Archive</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-black dark:text-white mb-2">Version</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full p-3 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-black dark:text-white mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-black dark:text-white mb-2">
              File {!file && "(Leave empty to keep current file)"}
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".apk,.pdf,.doc,.docx,.xls,.xlsx,.zip"
              className="w-full p-2 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg"
            />
            {itemToEdit.file_name && (
              <p className="text-sm text-gray-500 mt-1">
                Current file: {itemToEdit.file_name}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDownloadItem;