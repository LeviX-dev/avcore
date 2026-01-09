import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';

interface Meeting {
  meeting_id: number;
  client_name: string;
  client_contact: number;
  meeting_date: string;
  next_meeting_date: string;
  meeting_remark: string;
  meeting_status: string;
  categories: string;
  products: string;
}

interface ViewMeetingPopupProps {
  meetingId: number | null;
  onClose: () => void;
}

const ViewMeetingPopup: React.FC<ViewMeetingPopupProps> = ({
  meetingId,
  onClose,
}) => {
  const [details, setDetails] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  

  useEffect(() => {
    if (!meetingId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${BASE_URL}api/meeting/${meetingId}`);
        setDetails(response.data.data);
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError('Failed to load meeting details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [meetingId]);

  if (!meetingId) return null;

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
          Meeting Details
        </h2>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {details && (
          <div className="space-y-3 text-black dark:text-white">
            <p><strong>Client Name:</strong> {details.client_name}</p>
            <p><strong>Client Contact:</strong> {details.client_contact}</p>
            <p>
              <strong>Meeting Date:</strong>{' '}
              {new Date(details.next_meeting_date).toLocaleDateString('en-GB')}
            </p>
            {/* <p>
              <strong>Next Meeting Date:</strong>{' '}
              {new Date(details.next_meeting_date).toLocaleDateString('en-GB')}
            </p> */}
            <p><strong>Remark:</strong> {details.meeting_remark}</p>
            <p>
              <strong>Status:</strong>{' '}
              {details.meeting_status?.charAt(0).toUpperCase() + details.meeting_status?.slice(1)}
            </p>
            <p><strong>Category:</strong> {details.categories}</p>
            <p><strong>Products:</strong> {details.products}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMeetingPopup;
