import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faUser, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

interface EditContactNumbersModalProps {
  show: boolean;
  onClose: () => void;
  client: {
    master_id: number;
    ar_number?: string;
    architect_name?: string;
    ca_number?: string;
    e_number?: string;
    sm_number?: string;
    pop_number?: string;
    other_number?: string;
  } | null;
  onSuccess: () => void;
}

const EditContactNumbersModal: React.FC<EditContactNumbersModalProps> = ({
  show,
  onClose,
  client,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    ar_number: '',
    architect_name: '',
    ca_number: '',
    e_number: '',
    sm_number: '',
    pop_number: '',
    other_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    if (client && show) {
      setFormData({
        ar_number: client.ar_number || '',
        architect_name: client.architect_name || '',
        ca_number: client.ca_number || '',
        e_number: client.e_number || '',
        sm_number: client.sm_number || '',
        pop_number: client.pop_number || '',
        other_number: client.other_number || '',
      });
    }
  }, [client, show]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(
        `${BASE_URL}api/master-data/${client?.master_id}/contact-numbers`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        showToast('Contact numbers updated successfully!', 'success');
        onSuccess(); // Refresh the parent data
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error updating contact numbers:', error);
      showToast(error.response?.data?.message || 'Failed to update contact numbers', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!show || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[10000] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faPhone} className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white">
                  Edit Contact Numbers
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Client ID: #{client.master_id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Architect Name */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-blue-500" />
                Architect Name
              </label>
              <input
                type="text"
                name="architect_name"
                value={formData.architect_name}
                onChange={handleInputChange}
                pattern="^[A-Za-z\s]+$"
                title="Only alphabets and spaces allowed"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter architect name"
              />
            </div>

            {/* Architect Number */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-green-500" />
                Architect Number
              </label>
              <input
                type="tel"
                name="ar_number"
                value={formData.ar_number}
                onChange={handleInputChange}
                pattern="^[0-9]{10}$"
                maxLength={10}
                title="Enter valid 10 digit number"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter 10 digit number"
              />
            </div>

            {/* Carpenter Number */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-yellow-500" />
                Carpenter Number
              </label>
              <input
                type="tel"
                name="ca_number"
                value={formData.ca_number}
                onChange={handleInputChange}
                pattern="^[0-9]{10}$"
                maxLength={10}
                title="Enter valid 10 digit number"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter 10 digit number"
              />
            </div>

            {/* Electrician Number */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-red-500" />
                Electrician Number
              </label>
              <input
                type="tel"
                name="e_number"
                value={formData.e_number}
                onChange={handleInputChange}
                pattern="^[0-9]{10}$"
                maxLength={10}
                title="Enter valid 10 digit number"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter 10 digit number"
              />
            </div>

            {/* Site Manager Number */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-purple-500" />
                Site Manager Number
              </label>
              <input
                type="tel"
                name="sm_number"
                value={formData.sm_number}
                onChange={handleInputChange}
                pattern="^[0-9]{10}$"
                maxLength={10}
                title="Enter valid 10 digit number"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter 10 digit number"
              />
            </div>

            {/* POP Number */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-orange-500" />
                POP Number
              </label>
              <input
                type="tel"
                name="pop_number"
                value={formData.pop_number}
                onChange={handleInputChange}
                pattern="^[0-9]{10}$"
                maxLength={10}
                title="Enter valid 10 digit number"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter 10 digit number"
              />
            </div>

            {/* Other Number */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-gray-500" />
                Other Number
              </label>
              <input
                type="tel"
                name="other_number"
                value={formData.other_number}
                onChange={handleInputChange}
                pattern="^[0-9]{10}$"
                maxLength={10}
                title="Enter valid 10 digit number"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter 10 digit number"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-4 right-4 z-[10001]">
            <div className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
              toast.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditContactNumbersModal;