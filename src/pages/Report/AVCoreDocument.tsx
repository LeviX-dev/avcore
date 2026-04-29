import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faTimes,
  faDownload,
  faEye,
  faTrash,
  faFile,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage,
  faImage,
  faExpand,
  faCompress,
  faSpinner,
  faUser,
  faCalendar,
  faSync,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';
import axios from 'axios';

interface Document {
  id: number;
  file_name: string;
  file_path: string;
  file_type: 'image' | 'document';
  file_size: number;
  remark: string;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_by_role: string;
  created_at: string;
  file_url: string;
  preview_url: string;
}

const AVCoreDocument: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remark, setRemark] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents with cache busting
  const fetchDocuments = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await axios.get(`${BASE_URL}api/av-core-documents?t=${timestamp}`, {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.data.success) {
        console.log('Documents fetched:', response.data.documents.length);
        setDocuments(response.data.documents);
        
        // Store in sessionStorage for backup
        sessionStorage.setItem('av_core_documents', JSON.stringify(response.data.documents));
        sessionStorage.setItem('av_core_last_fetch', timestamp.toString());
      } else {
        setError(response.data.message || 'Failed to fetch documents');
      }
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      setError(error.response?.data?.message || 'Error loading documents');
      
      // Try to load from sessionStorage as fallback
      const cachedDocs = sessionStorage.getItem('av_core_documents');
      if (cachedDocs) {
        console.log('Loading from cache');
        setDocuments(JSON.parse(cachedDocs));
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Initial load and refresh on mount
  useEffect(() => {
    fetchDocuments(true);
    
    // Set up interval to refresh data every 30 seconds (optional)
    const interval = setInterval(() => {
      if (!showUploadModal) {
        fetchDocuments(false);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDocuments, showUploadModal]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments(true);
    setRefreshing(false);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (remark.trim()) {
      formData.append('remark', remark);
    }

    try {
      const response = await axios.post(`${BASE_URL}api/av-core-documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (response.data.success) {
        // Add new document to the beginning of the list
        setDocuments(prev => [response.data.document, ...prev]);
        
        // Update sessionStorage
        const updatedDocs = [response.data.document, ...documents];
        sessionStorage.setItem('av_core_documents', JSON.stringify(updatedDocs));
        
        resetUploadModal();
        alert('Document uploaded successfully!');
      } else {
        alert('Upload failed: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  // Reset upload modal
  const resetUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setRemark('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle delete
  const handleDelete = async (id: number, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      try {
        const response = await axios.delete(`${BASE_URL}api/av-core-documents/${id}`, {
          withCredentials: true
        });
        if (response.data.success) {
          // Remove from state
          setDocuments(prev => prev.filter(doc => doc.id !== id));
          
          // Update sessionStorage
          const updatedDocs = documents.filter(doc => doc.id !== id);
          sessionStorage.setItem('av_core_documents', JSON.stringify(updatedDocs));
          
          alert('Document deleted successfully!');
        } else {
          alert('Failed to delete document');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting document');
      }
    }
  };

  // Handle download
  const handleDownload = (url: string, fileName: string) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0 || !bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return faFilePdf;
      case 'doc':
      case 'docx':
        return faFileWord;
      case 'xls':
      case 'xlsx':
        return faFileExcel;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return faFileImage;
      default:
        return faFile;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AV Core Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all AV Core related documents and images ({documents.length} total)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all"
          >
            <FontAwesomeIcon icon={faSync} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faUpload} />
            Upload Document
          </button>
        </div>
      </div>


      {/* Documents Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading documents...</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <FontAwesomeIcon icon={faDatabase} className="text-5xl text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            No Documents Found
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mt-1">
            Click the "Upload Document" button to add files
          </p>
          <p className="text-gray-400 dark:text-gray-600 text-[12px] mt-2">
            Uploaded documents will appear here instantly
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-4 text-left text-[12px] font-bold uppercase text-gray-600 dark:text-gray-400">
                  Preview
                </th>
                <th className="py-4 px-4 text-left text-[12px] font-bold uppercase text-gray-600 dark:text-gray-400">
                  Document Name
                </th>
                <th className="py-4 px-4 text-left text-[12px] font-bold uppercase text-gray-600 dark:text-gray-400">
                  Size
                </th>
                <th className="py-4 px-4 text-left text-[12px] font-bold uppercase text-gray-600 dark:text-gray-400">
                  Remark
                </th>
                <th className="py-4 px-4 text-left text-[12px] font-bold uppercase text-gray-600 dark:text-gray-400">
                  Uploaded By
                </th>
                <th className="py-4 px-4 text-left text-[12px] font-bold uppercase text-gray-600 dark:text-gray-400">
                  Uploaded At
                </th>
             
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* Preview Column */}
                  <td className="py-3 px-4">
                    {doc.file_type === 'image' && doc.file_url ? (
                      <div className="relative group">
                        <img
                          src={doc.file_url}
                          alt={doc.file_name}
                          className="w-12 h-12 object-cover rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            console.error('Image failed to load:', doc.file_url);
                            e.currentTarget.style.display = 'none';
                          }}
                          onClick={() => setExpandedImage(doc.file_url)}
                        />
                        <button
                          onClick={() => setExpandedImage(doc.file_url)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-white text-sm" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon 
                          icon={getFileIcon(doc.file_name)} 
                          className="text-2xl text-gray-500 dark:text-gray-400"
                        />
                      </div>
                    )}
                  </td>

                  {/* Document Name */}
                  <td className="py-3 px-4">
                    <div className="text-[13px] font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={doc.file_name}>
                      {doc.file_name}
                    </div>
                   </td>

                  {/* File Size */}
                  <td className="py-3 px-4">
                    <div className="text-[13px] text-gray-600 dark:text-gray-400">
                      {formatFileSize(doc.file_size)}
                    </div>
                   </td>

                  {/* Remark */}
                  <td className="py-3 px-4">
                    <div className="text-[13px] text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={doc.remark || ''}>
                      {doc.remark || '—'}
                    </div>
                   </td>

                  {/* Uploaded By */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-blue-500 text-xs" />
                      <div>
                        <div className="text-[13px] font-medium text-gray-900 dark:text-white">
                          {doc.uploaded_by_name || 'Unknown'}
                        </div>
                        {doc.uploaded_by_role && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {doc.uploaded_by_role}
                          </div>
                        )}
                      </div>
                    </div>
                   </td>

                  {/* Uploaded At */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                      <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                      {formatDate(doc.created_at)}
                    </div>
                   </td>

          
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal (same as before) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[9999] p-4">
          <div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-boxdark p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upload Document
                </h2>
                <p className="text-[13px] text-gray-600 dark:text-gray-400">
                  Upload images, PDFs, or any document
                </p>
              </div>
              <button
                onClick={resetUploadModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* File Input */}
              <div>
                <label className="block mb-2 text-[13px] font-bold text-gray-700 dark:text-gray-300">
                  Select File *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-[13px] dark:bg-gray-800 dark:text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                />
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <label className="block mb-2 text-[13px] font-bold text-gray-700 dark:text-gray-300">
                    Preview
                  </label>
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full h-auto max-h-64 mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>
              )}

              {/* File Info for non-images */}
              {selectedFile && !previewUrl && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon 
                      icon={getFileIcon(selectedFile.name)} 
                      className="text-3xl text-gray-500"
                    />
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </div>
                      <div className="text-[12px] text-gray-500 dark:text-gray-400">
                        {formatFileSize(selectedFile.size)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remark Input */}
              <div>
                <label className="block mb-2 text-[13px] font-bold text-gray-700 dark:text-gray-300">
                  Remark (Optional)
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={3}
                  placeholder="Enter any remarks about this document..."
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-[13px] dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-boxdark p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={resetUploadModal}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  selectedFile && !uploading
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUpload} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[10000] p-4">
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl p-2"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <img
              src={expandedImage}
              alt="Expanded view"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              onError={(e) => {
                console.error('Failed to load expanded image');
                setExpandedImage(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AVCoreDocument;