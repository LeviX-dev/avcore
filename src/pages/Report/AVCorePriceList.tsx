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
  faTrash
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
}

const AVCorePriceList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remark, setRemark] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ================= FETCH =================
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}api/av/avcore-pricelist`, {
        withCredentials: true
      });

      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // ================= REFRESH =================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
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

    try {
      const res = await axios.post(
        `${BASE_URL}api/avcore-pricelist/upload`,
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        fetchDocuments();
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

  const resetModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setRemark('');
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this file?')) return;

    await axios.delete(`${BASE_URL}api/avcore-pricelist/${id}`, {
      withCredentials: true
    });

    fetchDocuments();
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
      case 'dxf': return faFile; // CAD
      default: return faFile;
    }
  };

  const formatSize = (b: number) => {
    if (!b) return '-';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  };

  // ================= UI =================
  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">AVCORE PriceList</h1>

        <div className="flex gap-3">
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
        <div>Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-10">
          <FontAwesomeIcon icon={faDatabase} size="2x" />
          <p>No files</p>
        </div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left text-sm">
              <th className="p-2">Preview</th>
              <th>Name</th>
              <th>Size</th>
              <th>Remark</th>
              <th>User</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="p-2">
                  {doc.preview_url ? (
                    <img
                      src={doc.preview_url}
                      className="w-10 h-10 object-cover cursor-pointer"
                      onClick={() => setExpandedImage(doc.preview_url)}
                    />
                  ) : (
                    <FontAwesomeIcon icon={getFileIcon(doc.file_name)} size="lg" />
                  )}
                </td>

                <td>{doc.file_name}</td>
                <td>{formatSize(doc.file_size)}</td>
                <td>{doc.remark}</td>

                <td>
                  {doc.uploaded_by_name}
                  <div className="text-xs text-gray-500">{doc.uploaded_by_role}</div>
                </td>

                <td>{new Date(doc.created_at).toLocaleString()}</td>

               
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">

            <h2 className="text-lg font-bold mb-3">Upload File</h2>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="*"
              className="mb-3"
            />

            {previewUrl && <img src={previewUrl} className="h-40 mx-auto" />}

            <textarea
              placeholder="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full border p-2 mb-3"
            />

            <div className="flex gap-2">
              <button onClick={resetModal} className="flex-1 bg-gray-300 p-2 rounded">
                Cancel
              </button>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-blue-600 text-white p-2 rounded"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center">
          <img src={expandedImage} className="max-h-[90vh]" />
          <button
            className="absolute top-5 right-5 text-white text-xl"
            onClick={() => setExpandedImage(null)}
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
};

export default AVCorePriceList;