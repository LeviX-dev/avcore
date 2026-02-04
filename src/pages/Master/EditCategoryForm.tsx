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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
          Edit Category
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-black dark:text-white">
            Category Name
          </label>
          <input
            type="text"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg mb-4 bg-transparent text-black dark:text-white"
            required
          />

          <label className="block mb-2 text-black dark:text-white">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg mb-6 bg-transparent text-black dark:text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-5 py-2.5 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition"
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