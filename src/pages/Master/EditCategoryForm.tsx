import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

const EditCategoryForm = ({ category, onClose, onCategoryUpdated }) => {
  const [catName, setCatName] = useState(category.cat_name);
  const [status, setStatus] = useState(category.status);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}api/category/${category.cat_id}`, {
        cat_name: catName,
        status,
      });
      alert("Category updated successfully");
      onCategoryUpdated();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update category");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Category</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Category Name</label>
          <input
            type="text"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            className="border w-full p-2 mb-4"
          />

          <label className="block mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border w-full p-2 mb-4"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryForm;