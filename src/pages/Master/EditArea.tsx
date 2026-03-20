import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';

const EditArea = ({ AreaToEdit, onClose, onAreaUpdated }) => {
  const [areaName, setAreaName] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (AreaToEdit) {
      setAreaName(AreaToEdit.area_name);
    }
  }, [AreaToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      area_name: areaName,
      created_by_user: 1,
    };

    try {
      await axios.put(
        `${BASE_URL}api/area/${AreaToEdit.area_id}`,
        data,
      );

      alert('Area updated successfully!');

      onAreaUpdated(); // refresh list in parent
      onClose(); // close modal
    } catch (error) {
      console.error('Error updating Area:', error);
      alert('Failed to update Area.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-boxdark p-5 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Edit City</h2>
       
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            placeholder="Area Name"
            className="w-full p-3 mb-4 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg"
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArea;