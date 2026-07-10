import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faTimes,
  faEye,
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
  faDownload,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight
} from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';

interface Document {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  remark: string;
  uploaded_by_name: string;
  uploaded_by_role: string;
  created_at: string;
  file_url: string;
  preview_url: string;
  status: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const AVCorePriceList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remark, setRemark] = useState('');
  const [uploadStatus, setUploadStatus] = useState('active');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [statusFilter, setStatusFilter] = useState('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Truncate filename function
  const truncateFileName = (fileName: string, maxLength: number = 50) => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop() || '';
    const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 3);
    
    return `${truncatedName}...${extension}`;
  };

  // ================= FETCH =================
  const fetchDocuments = useCallback(async (page: number = 1, status: string = 'all') => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}api/av/avcore-pricelist`, {
        params: { page, limit: pagination.itemsPerPage, status },
        withCredentials: true
      });

      if (res.data.success) {
        setDocuments(res.data.documents);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.itemsPerPage]);

  useEffect(() => {
    fetchDocuments(pagination.currentPage, statusFilter);
  }, [fetchDocuments, pagination.currentPage, statusFilter]);

  // ================= REFRESH =================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments(pagination.currentPage, statusFilter);
    setRefreshing(false);
  };

  // ================= PAGE CHANGE =================
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchDocuments(page, statusFilter);
    }
  };

  // ================= STATUS FILTER CHANGE =================
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchDocuments(1, status);
  };

  // ================= STATUS UPDATE =================
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await axios.put(
        `${BASE_URL}api/avcore-pricelist/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      fetchDocuments(pagination.currentPage, statusFilter);
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  // ================= FILE SELECT =================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (!selectedFile) return alert('Select file');

    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('remark', remark);
    formData.append('status', uploadStatus);

    try {
      const res = await axios.post(
        `${BASE_URL}api/avcore-pricelist/upload`,
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        fetchDocuments(pagination.currentPage, statusFilter);
        resetModal();
        alert('Uploaded successfully');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ================= OPEN IN NEW TAB =================
  const handleOpenInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  // ================= PREVIEW OR OPEN =================
  const handlePreviewOrOpen = (doc: Document) => {
    if (doc.preview_url) {
      setExpandedImage(doc.preview_url);
    } else {
      handleOpenInNewTab(doc.file_url);
    }
  };

  const resetModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setRemark('');
    setUploadStatus('active');
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this file?')) return;

    try {
      await axios.delete(`${BASE_URL}api/avcore-pricelist/${id}`, {
        withCredentials: true
      });
      fetchDocuments(pagination.currentPage, statusFilter);
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  // ================= DOWNLOAD =================
  const handleDownload = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  // ================= ICON =================
  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf': return faFilePdf;
      case 'doc':
      case 'docx': return faFileWord;
      case 'xls':
      case 'xlsx': return faFileExcel;
      case 'jpg':
      case 'png':
      case 'jpeg': return faFileImage;
      case 'dwg':
      case 'dxf': return faFile;
      default: return faFile;
    }
  };

  const formatSize = (b: number) => {
    if (!b) return '-';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  };

  // ================= PAGINATION UI =================
  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
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
                : 'hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        </button>

        <span className="ml-4 text-sm text-gray-600">
          Page {currentPage} of {totalPages} | Total: {pagination.totalItems} items
        </span>
      </div>
    );
  };

  // ================= UI =================
  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">AVCORE PriceList</h1>

        <div className="flex gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button onClick={handleRefresh} className="btn bg-gray-600 text-white px-3 py-2 rounded">
            <FontAwesomeIcon icon={faSync} spin={refreshing} /> Refresh
          </button>

          <button onClick={() => setShowUploadModal(true)} className="btn bg-blue-600 text-white px-3 py-2 rounded">
            <FontAwesomeIcon icon={faUpload} /> Upload
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-10">
          <FontAwesomeIcon icon={faDatabase} size="2x" />
          <p>No files</p>
        </div>
      ) : (
        <>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-2">Preview</th>
                <th>Name</th>
                <th>Remark</th>
                <th>User</th>
                <th>Date</th>
                <th>Status</th>
               </tr>
            </thead>

            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="p-2">
                    <button
                      onClick={() => handlePreviewOrOpen(doc)}
                      className="hover:opacity-75"
                    >
                      {doc.preview_url ? (
                        <img
                          src={doc.preview_url}
                          className="w-10 h-10 object-cover cursor-pointer"
                          alt="preview"
                        />
                      ) : (
                        <FontAwesomeIcon icon={getFileIcon(doc.file_name)} size="lg" />
                      )}
                    </button>
                   </td>

                  <td>
                    <button
                      onClick={() => handleOpenInNewTab(doc.file_url)}
                      className="text-blue-600 hover:underline text-left"
                      title={doc.file_name}
                    >
                      {truncateFileName(doc.file_name, 50)}
                    </button>
                   </td>

                  <td>{doc.remark}</td>

                  <td>
                    {doc.uploaded_by_name}
                    <div className="text-xs text-gray-500">{doc.uploaded_by_role}</div>
                  </td>

                  <td>{new Date(doc.created_at).toLocaleString()}</td>

                  <td>
                    <select
                      value={doc.status || 'active'}
                      onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                      className={`border rounded px-2 py-1 text-sm ${
                        (doc.status || 'active') === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
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

          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-96 max-h-[90vh] overflow-y-auto">

            <h2 className="text-lg font-bold mb-3">Upload File</h2>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="*"
              className="mb-3 w-full"
            />

            {previewUrl && (
              <img src={previewUrl} className="h-40 mx-auto mb-3 object-contain" alt="preview" />
            )}

            <textarea
              placeholder="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full border p-2 mb-3"
              rows={3}
            />

            <div className="mb-3">
              <label className="block mb-1 font-medium">Status</label>
              <select
                value={uploadStatus}
                onChange={(e) => setUploadStatus(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={resetModal} className="flex-1 bg-gray-300 p-2 rounded">
                Cancel
              </button>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-blue-600 text-white p-2 rounded disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50">
          <img src={expandedImage} className="max-h-[90vh] max-w-[90vw]" alt="expanded" />
          <button
            className="absolute top-5 right-5 text-white text-2xl hover:text-gray-300"
            onClick={() => setExpandedImage(null)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

    </div>
  );
};

export default AVCorePriceList;