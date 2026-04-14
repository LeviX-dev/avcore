import React, { useState } from "react";
import { BASE_URL } from "../../../public/config.js";
import axios from "axios";

interface AddExpenseCategoryFormProps {
  onClose: () => void;
  onCategoryAdded: () => void;
}

const AddExpenseCategoryForm: React.FC<AddExpenseCategoryFormProps> = ({
  onClose,
  onCategoryAdded,
}) => {
  const [formData, setFormData] = useState({
    category_name: "",
    category_description: "",
  });
  const [feedback, setFeedback] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(BASE_URL + "api/expense/categories", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setFeedback("Expense category added successfully!");
      setTimeout(() => {
        setFeedback("");
        onClose();
        onCategoryAdded();
      }, 3000);
      setFormData({ category_name: "", category_description: "" });
    } catch (error: any) {
      console.error(
        "Error adding expense category:",
        error.response?.data || error.message
      );
      setFeedback("Error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-[90%] sm:w-[70%] lg:w-1/3 p-6">
        <h3 className="text-lg font-semibold mb-4 text-center sm:text-left text-black dark:text-white">
          Add Expense Category
        </h3>

        {feedback && (
          <p
            className={`mb-3 text-sm text-center sm:text-left ${
              feedback.includes("successfully") ? "text-green-500" : "text-red-500"
            }`}
          >
            {feedback}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-2 text-black dark:text-white">
            Category Name
          </label>

          <input
            type="text"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            placeholder="Enter category name"
            className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg mb-4 bg-transparent text-black dark:text-white"
            required
          />

          <label className="block text-sm font-medium mb-2 text-black dark:text-white">
            Description
          </label>

          <input
            type="text"
            name="category_description"
            value={formData.category_description}
            onChange={handleChange}
            placeholder="Enter description"
            className="border border-stroke dark:border-strokedark w-full p-3 rounded-lg mb-6 bg-transparent text-black dark:text-white"
          />

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseCategoryForm;