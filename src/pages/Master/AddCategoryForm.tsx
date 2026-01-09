import React, { useState } from "react";
import { BASE_URL } from "../../../public/config.js";
import axios from "axios";

interface AddCategoryFormProps {
  onClose: () => void;
  onCategoryAdded: () => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({
  onClose,
  onCategoryAdded,
}) => {
  const [formData, setFormData] = useState({ cat_name: "" });
  const [feedback, setFeedback] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(BASE_URL + "api/category", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setFeedback("Category added successfully!");
      setTimeout(() => {
        setFeedback("");
        onClose();
        onCategoryAdded();
      }, 3000);
      setFormData({ cat_name: "" });
    } catch (error: any) {
      console.error(
        "Error adding category:",
        error.response?.data || error.message
      );
      setFeedback("Error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2">
      <div className="bg-white rounded-md shadow-lg w-[90%] sm:w-[70%] lg:w-1/3 p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">
          Add New Category
        </h3>

        {feedback && (
          <p className="mb-3 text-sm text-green-500 text-center sm:text-left">
            {feedback}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-2">
            Category Name
          </label>

          <input
            type="text"
            name="cat_name"
            value={formData.cat_name}
            onChange={handleChange}
            placeholder="Enter category name"
            className="border w-full p-2 rounded mb-4 text-sm"
            required
          />

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryForm;