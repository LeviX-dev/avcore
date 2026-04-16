import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

const EditExpenseCategoryForm = ({ category, onClose, onCategoryUpdated }) => {
  const [categoryName, setCategoryName] = useState(category.category_name);
  const [categoryDescription, setCategoryDescription] = useState(
    category.category_description || ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}api/v1/expense/categories/${category.category_id}`, {
        category_name: categoryName,
        category_description: categoryDescription,
      });
      alert("Expense category updated successfully");
      onCategoryUpdated();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update expense category");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
          Edit Expense Category
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-black dark:text-white">
            Category Name
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg mb-4 bg-transparent text-black dark:text-white"
            required
          />

          <label className="block mb-2 text-black dark:text-white">
            Description
          </label>
          <input
            type="text"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg mb-6 bg-transparent text-black dark:text-white"
          />

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

export default EditExpenseCategoryForm;