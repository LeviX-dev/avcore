import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';

interface Followup {
  followup_id: number;
  client_name: string;
  client_contact: number;
  followup_date: string;
  next_followup_date: string;
  remark: string;
  status: string;
  categories: string;
  products: string;
  followup_status: string;
}

interface ViewDetailsPopupProps {
  followupId: number | null;
  onClose: () => void;
}

const ViewDetailsPopup: React.FC<ViewDetailsPopupProps> = ({
  followupId,
  onClose,
}) => {
  const [details, setDetails] = useState<Followup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!followupId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${BASE_URL}api/${followupId}`);
        // console.log('Fetched followup details:', response.data);
        setDetails(response.data.data);
      } catch (err) {
        console.error('Error fetching followup:', err);
        setError('Failed to load followup details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [followupId]);

  if (!followupId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
          Followup Details
        </h2>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {details && (
          <div className="space-y-3 text-black dark:text-white">
            <p>
              <strong>Client Name:</strong> {details.client_name}
            </p>
            <p>
              <strong>Client Contact:</strong> {details.client_contact}
            </p>
            <p>
              <strong>Followup Date:</strong>{' '}
              {new Date(details.next_followup_date).toLocaleDateString('en-GB')}
            </p>
            {/* <p>
              <strong>Next Followup Date:</strong>{' '}
              {new Date(details.next_followup_date).toLocaleDateString('en-GB')}
            </p> */}

            <p>
              <strong>Remark:</strong> {details.remark}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              {details.followup_status?.charAt(0).toUpperCase() +
                details.followup_status?.slice(1)}
            </p>
            <p>
              <strong>Category:</strong> {details.categories}
            </p>
            <p>
              <strong>Products:</strong> {details.products}
            </p>

            {/* Add more fields here if needed */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDetailsPopup;
