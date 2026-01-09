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

  //   const handleSubmit = (e) => {
  //   e.preventDefault();
  //   alert("Test alert");
  // };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-5 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Area</h2>
       
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            placeholder="Area Name"
            className="w-full p-2 mb-3 border rounded"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
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