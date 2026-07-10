import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPencilAlt, 
  faTrash, 
  faCog, 
  faPlus,
  faSearch,
  faSpinner ,
  faEye ,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import ScheduleDetailsModal from './ScheduleDetailsModal';

interface Schedule {
  schedule_id: number;
  schedule_name: string;
  description: string;
  status: 'active' | 'inactive';
  process_count: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  schedule_name: string;
  description: string;
  status: 'active' | 'inactive';
}

const ScheduleMaster: FC = () => {
  const navigate = useNavigate();
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredData, setFilteredData] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const [newSchedule, setNewSchedule] = useState<FormData>({
    schedule_name: '',
    description: '',
    status: 'active'
  });



  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

// Add this function to handle eye icon click
const handleViewDetails = (scheduleId: number) => {
  setSelectedScheduleId(scheduleId);
  setShowDetailsModal(true);
};


  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, schedules]);

  const loadSchedules = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<{ success: boolean; data: Schedule[] }>(
        `${BASE_URL}api/get/schedules`,
        { withCredentials: true }
      );
      setSchedules(response.data.data || []);
      setFilteredData(response.data.data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      alert('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = schedules.filter((schedule) =>
      Object.values(schedule).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const saveSchedule = async (): Promise<void> => {
    if (!newSchedule.schedule_name.trim()) {
      alert('Please enter schedule name');
      return;
    }

    try {
      if (editMode && currentId) {
        // Update existing schedule
        await axios.put(
          `${BASE_URL}api/schedule/${currentId}`,
          newSchedule,
          { withCredentials: true }
        );
        setSuccessMessage('Schedule updated successfully!');
      } else {
        // Create new schedule
        await axios.post(
          `${BASE_URL}api/schedule`,
          newSchedule,
          { withCredentials: true }
        );
        setSuccessMessage('Schedule added successfully!');
      }
      
      setShowModal(false);
      setNewSchedule({
        schedule_name: '',
        description: '',
        status: 'active'
      });
      loadSchedules();
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule.');
    }
  };

  const handleEdit = (schedule: Schedule): void => {
    setEditMode(true);
    setCurrentId(schedule.schedule_id);
    setNewSchedule({
      schedule_name: schedule.schedule_name,
      description: schedule.description || '',
      status: schedule.status
    });
    setShowModal(true);
  };

  const deleteSchedule = async (scheduleId: number): Promise<void> => {
    const confirmDelete = window.confirm('Are you sure you want to delete this schedule?');
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${BASE_URL}api/schedule/${scheduleId}`,
        { withCredentials: true }
      );
      setSuccessMessage('Schedule deleted successfully!');
      loadSchedules();
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule.');
    }
  };

  const toggleStatus = async (scheduleId: number, status: string): Promise<void> => {
    const newStatus = status === 'active' ? 'inactive' : 'active';
    
    try {
      await axios.put(
        `${BASE_URL}api/schedule/${scheduleId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      loadSchedules();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 dark:bg-boxdark">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 dark:bg-boxdark">
      <Breadcrumb pageName="Schedule Management" />

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded dark:bg-green-900 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Add Schedule Button */}
        <button
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
            setNewSchedule({
              schedule_name: '',
              description: '',
              status: 'active'
            });
          }}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 justify-center"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Schedule
        </button>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-4 py-2"
            placeholder="Search Schedules..."
          />
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto sm:min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 text-left dark:bg-meta-4">
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                #
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Schedule Name
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Description
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Process Count
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Status
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((schedule, index) => (
                <tr key={schedule.schedule_id} className="dark:border-strokedark">
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {index + 1}
                  </td>
                  
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {schedule.schedule_name}
                  </td>
                  
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {schedule.description || '-'}
                  </td>
                  
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {schedule.process_count || 0}
                  </td>
                  
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11">
                    <span
                      onClick={() => toggleStatus(schedule.schedule_id, schedule.status)}
                      className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium cursor-pointer ${
                        schedule.status === 'active'
                          ? 'bg-success text-success'
                          : 'bg-danger text-danger'
                      }`}
                    >
                      {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                    </span>
                  </td>
                  
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <div className="flex items-center gap-2">

                          <button
      onClick={() => handleViewDetails(schedule.schedule_id)}
      className="rounded-md bg-green-600 px-3 py-1 text-white hover:bg-opacity-80"
      title="View Details"
    >
      <FontAwesomeIcon icon={faEye} />
    </button>


                      {/* Settings Button - Navigate to new page */}
                      <button
                        onClick={() => navigate(`/schedule/settings/${schedule.schedule_id}`)}
                        className="rounded-md bg-gray-600 px-3 py-1 text-white hover:bg-opacity-80"
                        title="Settings"
                      >
                        <FontAwesomeIcon icon={faCog} />
                      </button>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-opacity-80"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </button>
                      
                     
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5 text-black dark:text-white">
                  No schedules found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Schedule */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
                {editMode ? 'Edit Schedule' : 'Add Schedule'}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Schedule Name
                </label>
                <input
                  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
                  placeholder="Enter schedule name"
                  value={newSchedule.schedule_name}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, schedule_name: e.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
                  placeholder="Enter description"
                  rows={3}
                  value={newSchedule.description}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, description: e.target.value })
                  }
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Status
                </label>
                <select
                  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
                  value={newSchedule.status}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, status: e.target.value as 'active' | 'inactive' })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-stroke dark:border-strokedark rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4"
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={saveSchedule}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showDetailsModal && selectedScheduleId && (
  <ScheduleDetailsModal
    scheduleId={selectedScheduleId}
    isOpen={showDetailsModal}
    onClose={() => {
      setShowDetailsModal(false);
      setSelectedScheduleId(null);
    }}
  />
)}

    </div>
  );
};

export default ScheduleMaster;