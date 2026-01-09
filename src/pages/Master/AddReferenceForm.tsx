import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

const AddReferenceForm = ({ onClose, onReferenceAdded }) => {
  const [referenceName, setReferenceName] = useState("");
  const [status, setStatus] = useState("active");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      reference_name: referenceName,
      status,
      created_by_user: 1, // Replace with session user ID in future
    };

    try {
      await axios.post(`${BASE_URL}api/reference`, data,
        {
          withCredentials:true
        }
      );
      setFeedback("Reference added successfully!");

      setTimeout(() => {
        setFeedback("");
        onReferenceAdded(); // Trigger parent refresh
        onClose();          // Close modal
      }, 2000);
    } catch (error) {
      console.error("Error adding reference:", error);
      setFeedback("Failed to add reference");
    }
  };
// const handleSubmit = (e) => {
//   e.preventDefault();
//   alert("Test alert");
// };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-5 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Reference</h2>
        {feedback && (
          <div className="mb-3 text-sm text-center text-green-600">{feedback}</div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={referenceName}
            onChange={(e) => setReferenceName(e.target.value)}
            placeholder="Reference Name"
            className="w-full p-2 mb-3 border rounded"
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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

export default AddReferenceForm;