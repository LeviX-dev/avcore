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
  faSpinner,
  faUser,
  faCalendar,
  faSync,
  faDatabase,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';
import axios from 'axios';

interface Document {
  id: number;
  file_name: string;
  file_path: string;
  file_type: 'image' | 'document';
  file_size: number;
  remark: string | null;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_by_role: string;
  created_at: string;
  file_url: string;
  preview_url: string | null;
  status: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ApiResponse {
  success: boolean;
  documents: Document[];
  pagination: PaginationData;
  message?: string;
}

const AVCoreDocument: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remark, setRemark] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('active');
  const [uploading, setUploading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Truncate filename function
  const truncateFileName = (fileName: string, maxLength: number = 50): string => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop() || '';
    const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 3);
    
    return `${truncatedName}...${extension}`;
  };

// Updated fetchDocuments function - remove custom headers
const fetchDocuments = useCallback(async (page: number = 1, status: string = 'all', showLoading: boolean = true): Promise<void> => {
  try {
    if (showLoading) setLoading(true);
    setError(null);
    
    const timestamp = Date.now();
    const response = await axios.get<ApiResponse>(`${BASE_URL}api/av/av-core-documents`, {
      params: { page, limit: pagination.itemsPerPage, status, t: timestamp },
      withCredentials: true
      // Remove the headers section - this was causing the CORS issue
    });
    
    if (response.data.success) {
      console.log('Documents fetched:', response.data.documents.length);
      setDocuments(response.data.documents);
      setPagination(response.data.pagination);
      
      // Store in sessionStorage for backup
      sessionStorage.setItem('av_core_documents', JSON.stringify(response.data.documents));
      sessionStorage.setItem('av_core_pagination', JSON.stringify(response.data.pagination));
      sessionStorage.setItem('av_core_last_fetch', timestamp.toString());
    } else {
      setError(response.data.message || 'Failed to fetch documents');
    }
  } catch (err: unknown) {
    console.error('Error fetching documents:', err);
    const errorMessage = err instanceof Error ? err.message : 'Error loading documents';
    setError(errorMessage);
    
    // Try to load from sessionStorage as fallback
    const cachedDocs = sessionStorage.getItem('av_core_documents');
    const cachedPagination = sessionStorage.getItem('av_core_pagination');
    if (cachedDocs) {
      console.log('Loading from cache');
      setDocuments(JSON.parse(cachedDocs));
      if (cachedPagination) {
        setPagination(JSON.parse(cachedPagination));
      }
    }
  } finally {
    if (showLoading) setLoading(false);
  }
}, [pagination.itemsPerPage]);
  // Initial load and refresh on mount
  useEffect(() => {
    fetchDocuments(pagination.currentPage, statusFilter, true);
    
    const interval = setInterval(() => {
      if (!showUploadModal) {
        fetchDocuments(pagination.currentPage, statusFilter, false);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDocuments, showUploadModal, pagination.currentPage, statusFilter]);

  // Manual refresh
  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchDocuments(pagination.currentPage, statusFilter, true);
    setRefreshing(false);
  };

  // Page change handler
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchDocuments(page, statusFilter, true);
    }
  };

  // Status filter change handler
  const handleStatusFilterChange = (status: string): void => {
    setStatusFilter(status);
    fetchDocuments(1, status, true);
  };

  // Update document status
  const handleStatusChange = async (id: number, newStatus: string): Promise<void> => {
    try {
      const response = await axios.put<{ success: boolean; message: string }>(
        `${BASE_URL}api/av-core-documents/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        await fetchDocuments(pagination.currentPage, statusFilter, true);
        alert('Status updated successfully');
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update status');
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
  const handleUpload = async (): Promise<void> => {
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
    formData.append('status', uploadStatus);

    try {
      const response = await axios.post<{ success: boolean; message: string; document?: Document }>(
        `${BASE_URL}api/av-core-documents/upload`, 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        resetUploadModal();
        await fetchDocuments(1, statusFilter, true);
        alert('Document uploaded successfully!');
      } else {
        alert('Upload failed: ' + response.data.message);
      }
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error uploading document';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Open in new tab
  const handleOpenInNewTab = (url: string): void => {
    window.open(url, '_blank');
  };

  // Handle preview or open
  const handlePreviewOrOpen = (doc: Document): void => {
    if (doc.preview_url) {
      setExpandedImage(doc.file_url);
    } else {
      handleOpenInNewTab(doc.file_url);
    }
  };

  // Reset upload modal
  const resetUploadModal = (): void => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setRemark('');
    setUploadStatus('active');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle delete
  const handleDelete = async (id: number, fileName: string): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      try {
        const response = await axios.delete<{ success: boolean; message: string }>(
          `${BASE_URL}api/av-core-documents/${id}`, 
          { withCredentials: true }
        );
        if (response.data.success) {
          await fetchDocuments(pagination.currentPage, statusFilter, true);
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
  const handleDownload = (url: string, fileName: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0 || !bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get file icon based on extension
  const getFileIcon = (fileName: string): any => {
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

  // Pagination UI
  const renderPagination = (): JSX.Element => {
    const { currentPage, totalPages } = pagination;
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        </button>

        <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages} | Total: {pagination.totalItems} items
        </span>
      </div>
    );
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
            Manage all AV Core related documents and images ({pagination.totalItems} total)
          </p>
        </div>
        <div className="flex gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="border rounded-lg px-3 py-2.5 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

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
        </div>
      ) : (
        <>
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
                  <th className="py-4 px-4 text-left text-[12px] font-bold uppercase text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Preview Column */}
                    <td className="py-3 px-4">
                      <button onClick={() => handlePreviewOrOpen(doc)} className="hover:opacity-75">
                        {doc.file_type === 'image' && doc.file_url ? (
                          <div className="relative group">
                            <img
                              src={doc.file_url}
                              alt={doc.file_name}
                              className="w-12 h-12 object-cover rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                console.error('Image failed to load:', doc.file_url);
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon 
                              icon={getFileIcon(doc.file_name)} 
                              className="text-2xl text-gray-500 dark:text-gray-400"
                            />
                          </div>
                        )}
                      </button>
                    </td>

                    {/* Document Name */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenInNewTab(doc.file_url)}
                        className="text-blue-600 hover:underline text-left"
                        title={doc.file_name}
                      >
                        <div className="text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:underline max-w-[200px]">
                          {truncateFileName(doc.file_name, 50)}
                        </div>
                      </button>
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

                    {/* Status Column */}
                    <td className="py-3 px-4">
                      <select
                        value={doc.status || 'active'}
                        onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                        className={`border rounded px-2 py-1 text-sm ${
                          (doc.status || 'active') === 'active'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>

                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Upload Modal */}
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

              {/* Status Selection */}
              <div>
                <label className="block mb-2 text-[13px] font-bold text-gray-700 dark:text-gray-300">
                  Status *
                </label>
                <select
                  value={uploadStatus}
                  onChange={(e) => setUploadStatus(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-[13px] dark:bg-gray-800 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

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