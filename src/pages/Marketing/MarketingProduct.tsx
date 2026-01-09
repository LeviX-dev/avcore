

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye } from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';
import ViewMeetingPopup from './MeetingPopup.js';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const MeetingScheduleTable = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
const [meetingStages, setMeetingStages] = useState<string[]>([]);


  const formatDateLocal = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  };

   useEffect(() => {
  const fetchMeetingStages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/leadstage`);

      const allowed = ["Pre Site Visit", "Post Site Visit", "Demo"];

      const filtered = response.data.filter((stage: string) =>
        allowed.includes(stage)
      );

      setMeetingStages(filtered);
    } catch (error) {
      console.error("Error fetching meeting stages:", error);
    }
  };

  fetchMeetingStages();
}, []);

useEffect(() => {
  const results = schedules.filter((schedule) => {
    const clientMatch =
      !filterName ||
      schedule.client_name
        .toLowerCase()
        .includes(filterName.toLowerCase());

    const meetingDate = schedule.meeting_date
      ? new Date(schedule.meeting_date).toISOString().split("T")[0]
      : "";

    const dateMatch = !filterDate || meetingDate === filterDate;

    return clientMatch && dateMatch;
  });

  setFilteredSchedules(results);
}, [schedules, filterName, filterDate]);


 
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/meeting/schedule`, {
          withCredentials: true,
        });
        const data = response.data.data || [];
        setSchedules(data);

        // Extract unique statuses for dropdown
        const statuses = [...new Set(data.map((item) => item.meeting_status))];
        setUniqueStatuses(statuses);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch meeting schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const openEditPopup = (data) => {
    setEditData(data);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(` ${BASE_URL}api/meeting/update_schedule`, editData, {
        withCredentials: true,
      });
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const openViewPopup = (meetingId) => {
    setSelectedMeetingId(meetingId);
    setShowViewModal(true);
  };


 

return (
    <div className="p-4">
      <Breadcrumb pageName="Meeting Schedules" />

  <div className="mb-6">
  <div className="flex flex-wrap gap-4 items-end">

    {/* CLIENT NAME SEARCH */}
    <div className="w-[360px]">
      <label className="block text-sm font-medium mb-1 text-black dark:text-white">
        Client Name
      </label>
      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded text-black dark:text-white dark:bg-form-input dark:border-strokedark"
        placeholder="Search by client name"
        value={filterName}
        onChange={(e) => setFilterName(e.target.value)}
      />
    </div>

    {/* SINGLE DATE FILTER */}
    <div className="w-[160px]">
      <label className="block text-sm font-medium mb-1 text-black dark:text-white">
        Meeting Date
      </label>
      <input
        type="date"
        className="w-full p-2 border border-gray-300 rounded text-black dark:text-white dark:bg-form-input dark:border-strokedark"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />
    </div>

  </div>
</div>



      {/* Table */}
    <div className="max-w-full overflow-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
  <div className="overflow-x-auto">
   <table className="w-full table-auto">
  <thead>
    <tr className="bg-gray-2 text-left dark:bg-meta-4">
      {[
        'Sr. No',
        'Client Name',
        'Contact',
        'City',
        'Meeting Date',
        'Remark',
        'Status',
        'Actions',
      ].map((heading) => (
        <th
          key={heading}
          className="py-4 px-4 font-bold text-black dark:text-white text-sm whitespace-nowrap"
        >
          {heading}
        </th>
      ))}
    </tr>
  </thead>

  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
    {filteredSchedules.map((schedule, index) => (
      <tr
        key={schedule.meeting_id}
        className="border-b border-stroke dark:border-strokedark"
      >
        {/* Sr. No */}
        <td className="py-4 px-4 text-black dark:text-white text-sm">{index + 1}</td>

        {/* Client Name */}
        <td className="py-4 px-4 text-black dark:text-white text-sm font-medium">
          {schedule.client_name}
        </td>

        {/* Contact */}
        <td className="py-4 px-4 text-black dark:text-white text-sm whitespace-nowrap">
          {schedule.client_contact || '-'}
        </td>

        {/* City */}
        <td className="py-4 px-4 text-black dark:text-white text-sm whitespace-nowrap">
          {schedule.city || '-'}
        </td>

        {/* Meeting Date */}
        <td className="py-4 px-4 text-black dark:text-white text-sm whitespace-nowrap">
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
              new Date(schedule.meeting_date) < new Date()
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}
          >
            {schedule.meeting_date
              ? new Date(schedule.meeting_date).toLocaleDateString('en-GB')
              : '-'}
          </div>
        </td>

        {/* Remark */}
        <td className="py-4 px-4 text-black dark:text-white text-sm truncate max-w-xs">
          {schedule.meeting_remark || 'N/A'}
        </td>

        {/* Status */}
        <td className="py-4 px-4 text-black dark:text-white text-sm">
          <span
            className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
              schedule.meeting_status === 'Meeting Scheduled'
                ? 'bg-gray-300 text-gray-700'
                : schedule.meeting_status === 'Next Follow Up'
                ? 'bg-purple-200 text-purple-700'
                : schedule.meeting_status === 'Lead Converted'
                ? 'bg-green-200 text-green-700'
                : schedule.meeting_status === 'Lead Cancelled'
                ? 'bg-red-200 text-red-700'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {schedule.meeting_status || 'N/A'}
          </span>
        </td>

        {/* Actions */}
        <td className="py-4 px-4 text-center">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => openEditPopup(schedule)}
              className="inline-flex items-center justify-center rounded-md py-2 px-3 text-white bg-meta-3 hover:bg-opacity-90 font-medium text-sm"
              title="Edit"
            >
              <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
            </button>

            <button
              onClick={() => openViewPopup(schedule)}
              className="inline-flex items-center justify-center rounded-md py-2 px-3 text-white bg-blue-600 hover:bg-blue-700 font-medium text-sm"
              title="View Details"
            >
              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

  </div>
</div>


      {/* View Meeting Popup */}
      {showViewModal && selectedMeetingId && (
        <ViewMeetingPopup
          meetingId={selectedMeetingId}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-2xl mt-20 max-h-[85vh] overflow-y-auto dark:border-strokedark dark:bg-boxdark">
            <div className="flex justify-between items-center border-b-2 mb-4 pb-3 dark:border-strokedark">
              <h3 className="text-xl font-bold dark:text-white text-black">Edit Meeting Schedule</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm dark:text-white text-black">Client Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
                    placeholder="Client Name"
                    value={editData.client_name}
                    onChange={(e) =>
                      setEditData({ ...editData, client_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm dark:text-white text-black">Client Contact</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
                    placeholder="Client Contact"
                    value={editData.client_contact}
                    onChange={(e) =>
                      setEditData({ ...editData, client_contact: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm dark:text-white text-black">Meeting Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
                    value={formatDateLocal(editData.meeting_date)}
                    onChange={(e) =>
                      setEditData({ ...editData, meeting_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm dark:text-white text-black">Next Meeting Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
                    value={formatDateLocal(editData.next_meeting_date)}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        next_meeting_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm dark:text-white text-black">Remark</label>
                  <textarea
                    className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
                    placeholder="Remark"
                    rows={3}
                    value={editData.meeting_remark}
                    onChange={(e) =>
                      setEditData({ ...editData, meeting_remark: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
  <label className="block mb-1 text-sm dark:text-white text-black">
    Status
  </label>

  <select
    className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white text-black"
    value={editData.meeting_status}
    onChange={(e) =>
      setEditData({ ...editData, meeting_status: e.target.value })
    }
  >
    <option value="">Select Status</option>

    {meetingStages.map((stage) => (
      <option key={stage} value={stage}>
        {stage}
      </option>
    ))}
  </select>
</div>

              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-strokedark">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingScheduleTable;
