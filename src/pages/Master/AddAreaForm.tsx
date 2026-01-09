import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

const AddAreaForm = ({ onClose, onAreaAdded }) => {
  const [areaName, setAreaName] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      area_name: areaName,
      created_by_user: 1, // Replace with session user ID in future
    };

    try {
      await axios.post(`${BASE_URL}api/area`, data,{
        withCredentials: true,
      });
      setFeedback("Area added successfully!");

      setTimeout(() => {
        setFeedback("");
        onAreaAdded(); // Trigger parent refresh
        onClose();          // Close modal
      }, 2000);
    } catch (error) {
      console.error("Error adding Area:", error);
      setFeedback("Failed to add Area");
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-5 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Area</h2>
        {feedback && (
          <div className="mb-3 text-sm text-center text-green-600">{feedback}</div>
        )}
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
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAreaForm;