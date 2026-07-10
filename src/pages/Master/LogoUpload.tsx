import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faImage,
  faTrashAlt,
  faTimes,
  faCheckCircle,
  faEye,
  faPlus,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';

interface Logo {
  id: number;
  logo_url: string;
  logo_name: string;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_at: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_by: number;
  updated_by_name: string;
  updated_at: string;
  deleted_by: number;
  deleted_by_name: string;
  is_active: boolean;
  is_deleted: boolean;
}

const LogoUpload: React.FC = () => {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all logos
  const fetchLogos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}api/logo/list`, {
        withCredentials: true
      });

      if (response.data.success) {
        setLogos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching logos:', error);
      setMessage({ type: 'error', text: 'Failed to load logos' });
    } finally {
      setLoading(false);
    }
  };

  // Upload logo
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload' });
      return;
    }

    if (!logoName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a logo name' });
      return;
    }

    const formData = new FormData();
    formData.append('logo', selectedFile);
    formData.append('logo_name', logoName);

    setUploading(true);
    setMessage(null);

    try {
      const response = await axios.post(`${BASE_URL}api/logo/upload`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
        resetForm();
        fetchLogos();
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Upload failed' });
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  // Set active logo
  const handleSetActive = async (logoId: number) => {
    try {
      const response = await axios.post(`${BASE_URL}api/logo/set-active/${logoId}`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Active logo updated successfully!' });
        fetchLogos();
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update active logo' });
      }
    } catch (error) {
      console.error('Error setting active logo:', error);
      setMessage({ type: 'error', text: 'Failed to update active logo' });
    }
  };

  // Delete logo
  const handleDelete = async (logoId: number, logoName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${logoName}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}api/logo/delete/${logoId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Logo deleted successfully!' });
        fetchLogos();
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Delete failed' });
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      setMessage({ type: 'error', text: 'Failed to delete logo' });
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setLogoName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setLogoName(nameWithoutExt);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    fetchLogos();

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Logo Management
        </h1>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <FontAwesomeIcon
            icon={message.type === 'success' ? faCheckCircle : faTimes}
          />
          <span className="flex-1">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="hover:opacity-70"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faUpload} className="text-blue-500" />
            Upload New Logo
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo Image <span className="text-red-500">*</span>
              </label>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
                  ${
                    previewUrl
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                  }
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded-lg shadow-md object-contain"
                    />

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click or drag to change image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="h-12 w-12 text-gray-400"
                    />

                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Click to select an image
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Supported: JPEG, PNG, WEBP, SVG (Max 2MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logo Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={logoName}
                onChange={(e) => setLogoName(e.target.value)}
                placeholder="e.g., Company Logo, Dark Theme Logo"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <FontAwesomeIcon
                        icon={faRefresh}
                        className="animate-spin"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUpload} />
                      Upload Logo
                    </>
                  )}
                </button>

                {selectedFile && (
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logos Table */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faImage} />
            Logo Gallery

            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {logos.length} logos
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FontAwesomeIcon
                icon={faRefresh}
                className="h-8 w-8 animate-spin text-blue-500"
              />
            </div>
          ) : logos.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faImage}
                className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50"
              />

              <p className="text-gray-600 dark:text-gray-400">
                No logos uploaded yet
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Upload your first logo using the form above
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SR No.
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Preview
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Logo Name
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Uploaded By
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created By
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Uploaded At
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logos.map((logo, index) => (
                  <tr
                    key={logo.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      <img
                        src={`${BASE_URL}${logo.logo_url}`}
                        alt={logo.logo_name}
                        className="w-12 h-12 object-contain rounded border border-gray-200 dark:border-gray-600 bg-white p-1"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
                        }}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {logo.logo_name}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {logo.uploaded_by_name || '-'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {logo.created_by_name || '-'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(logo.uploaded_at)}
                    </td>

                    <td className="px-4 py-3">
                      {logo.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-1 h-3 w-3"
                          />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <a
                          href={`${BASE_URL}${logo.logo_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          title="View Logo"
                        >
                          <FontAwesomeIcon
                            icon={faEye}
                            className="h-4 w-4"
                          />
                        </a>

                        {/* Set Active Button */}
                        {!logo.is_active && (
                          <button
                            onClick={() => handleSetActive(logo.id)}
                            className="p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                            title="Set as Active"
                          >
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="h-4 w-4"
                            />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            handleDelete(logo.id, logo.logo_name)
                          }
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          title="Delete Logo"
                        >
                          <FontAwesomeIcon
                            icon={faTrashAlt}
                            className="h-4 w-4"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;