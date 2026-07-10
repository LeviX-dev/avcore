import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";

const ProcessExecution = () => {
  const [showModal, setShowModal] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [types, setTypes] = useState([]);
  const [newProcess, setNewProcess] = useState({
    process_name: '',
    type_ids: []
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProcessId, setCurrentProcessId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchProcesses();
    fetchTypes();
  }, []);

  const fetchProcesses = async () => {
    try {
      const response = await axios.get(BASE_URL + 'api/process/process-execution', {
        withCredentials: true
      });
      setProcesses(response.data);
    } catch (error) {
      console.error('Error fetching processes:', error);
      setErrorMessage('Failed to load processes');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await axios.get(BASE_URL + 'api/type/execution-type', {
        withCredentials: true
      });
      setTypes(response.data.filter(type => type.status === 'active'));
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const handleSubmit = async () => {
    if (!newProcess.process_name.trim()) {
      setErrorMessage('Process name is required');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (newProcess.type_ids.length === 0) {
      setErrorMessage('Please select at least one type');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const processData = {
        process_name: newProcess.process_name,
        type_ids: newProcess.type_ids,
        status: 'active' // Always active when creating/updating
      };

      if (editMode) {
        await axios.put(
          `${BASE_URL}api/process-execution/${currentProcessId}`,
          processData,
          { withCredentials: true }
        );
        setSuccessMessage('Process updated successfully');
      } else {
        await axios.post(
          BASE_URL + 'api/process-execution',
          processData,
          { withCredentials: true }
        );
        setSuccessMessage('Process added successfully');
      }
      
      setShowModal(false);
      setNewProcess({
        process_name: '',
        type_ids: []
      });
      setEditMode(false);
      setCurrentProcessId(null);
      fetchProcesses();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving process:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to save process');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (process) => {
    setNewProcess({
      process_name: process.process_name,
      type_ids: process.type_ids || []
    });
    setCurrentProcessId(process.process_id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this process?')) return;

    try {
      await axios.delete(`${BASE_URL}api/process-execution/${id}`, {
        withCredentials: true
      });
      setSuccessMessage('Process deleted successfully');
      fetchProcesses();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting process:', error);
      setErrorMessage('Failed to delete process');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const toggleTypeSelection = (typeId) => {
    setNewProcess(prev => ({
      ...prev,
      type_ids: prev.type_ids.includes(typeId)
        ? prev.type_ids.filter(id => id !== typeId)
        : [...prev.type_ids, typeId]
    }));
  };

  const toggleSelectAllTypes = () => {
    if (newProcess.type_ids.length === types.length) {
      setNewProcess(prev => ({ ...prev, type_ids: [] }));
    } else {
      setNewProcess(prev => ({ 
        ...prev, 
        type_ids: types.map(type => type.type_id) 
      }));
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  
  try {
    await axios.put(
      `${BASE_URL}api/process-execution/${id}/toggle-status`,
      {},
      { withCredentials: true }
    );
    setSuccessMessage(`Status changed to ${newStatus}`);
    fetchProcesses();
    setTimeout(() => setSuccessMessage(''), 3000);
  } catch (error) {
    console.error('Error updating status:', error);
    setErrorMessage('Failed to update status');
    setTimeout(() => setErrorMessage(''), 3000);
  }
};

  // Filter processes
  const filteredProcesses = processes.filter(process => {
    const matchesSearch = 
      process.process_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSearch = () => {
    // Already filtered by useEffect dependency
  };

  return (
    <div className="w-full px-2 sm:px-4 dark:bg-boxdark">
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Add Process Button */}
        <button
          onClick={() => {
            setNewProcess({
              process_name: '',
              type_ids: []
            });
            setEditMode(false);
            setCurrentProcessId(null);
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Process
        </button>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyUp={handleSearch}
              className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-4 py-2 pl-10"
              placeholder="Search processes..."
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-3 text-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 dark:bg-meta-4 text-left">
              <th className="py-3 px-4 font-medium text-black dark:text-white">#</th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">Process Name</th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">Types</th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">Status</th>
                                <th className="py-3 px-4 font-medium text-black dark:text-white">Created By</th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">Created At</th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcesses.length > 0 ? (
              filteredProcesses.map((process, index) => (
                <tr key={process.process_id} className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4">
                  <td className="py-3 px-4 text-black dark:text-white">{index + 1}</td>
                  <td className="py-3 px-4 text-black dark:text-white font-medium">{process.process_name}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {process.type_names && process.type_names.length > 0 ? (
                        process.type_names.map((name, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-meta-4 text-gray-800 dark:text-gray-300 rounded text-xs"
                          >
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">No types</span>
                      )}
                    </div>
                  </td>
                  <td 
                    className="py-3 px-4 cursor-pointer"
                    onClick={() => handleStatusToggle(process.process_id, process.status)}
                    title={`Click to change status from ${process.status} to ${process.status === 'active' ? 'inactive' : 'active'}`}
                  >
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:opacity-80 ${
                        process.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                    </span>
                  </td>
                                    <td className="py-3 px-4 text-black dark:text-white">{process.created_by_name || 'System'}</td>


                  <td className="py-3 px-4 text-black dark:text-white">
                    {new Date(process.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(process)}
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 transition-colors"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(process.process_id)}
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 transition-colors"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-5 text-black dark:text-white">
                  No processes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Simplified */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-boxdark rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
                {editMode ? 'Edit Process' : 'Add New Process'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Process Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter process name"
                    value={newProcess.process_name}
                    onChange={(e) => setNewProcess({...newProcess, process_name: e.target.value})}
                    className="w-full p-2 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Execution Types *
                    </label>
                    {types.length > 0 && (
                      <button
                        type="button"
                        onClick={toggleSelectAllTypes}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {newProcess.type_ids.length === types.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>
                  
                  {types.length === 0 ? (
                    <div className="text-center p-4 border border-stroke dark:border-strokedark rounded bg-gray-50 dark:bg-meta-4">
                      <p className="text-gray-500 dark:text-gray-400">No active execution types available.</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Please add execution types first
                      </p>
                    </div>
                  ) : (
                    <div className="border border-stroke dark:border-strokedark rounded p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {types.map(type => (
                          <div key={type.type_id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`type-${type.type_id}`}
                              checked={newProcess.type_ids.includes(type.type_id)}
                              onChange={() => toggleTypeSelection(type.type_id)}
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label 
                              htmlFor={`type-${type.type_id}`}
                              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                              {type.type_name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {newProcess.type_ids.length === 0 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      Please select at least one execution type
                    </p>
                  )}
                </div>
              </div>

             

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stroke dark:border-strokedark">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNewProcess({
                      process_name: '',
                      type_ids: []
                    });
                    setEditMode(false);
                  }}
                  className="px-4 py-2 border border-stroke dark:border-strokedark text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || newProcess.type_ids.length === 0}
                >
                  {loading ? 'Saving...' : editMode ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessExecution;