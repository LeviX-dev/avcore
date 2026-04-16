import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import AddExpenseCategoryForm from './AddExpenseCategoryForm';
import EditExpenseCategoryForm from './EditExpenseCategoryForm';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashCan } from '@fortawesome/free-solid-svg-icons';

type ExpenseCategory = {
  category_id: number;
  category_name: string;
  category_description?: string | null;
};

const ExpenseCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<ExpenseCategory[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editCategory, setEditCategory] = useState<ExpenseCategory | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/v1/expense/categories`, {
        withCredentials: true,
      });
      setCategories(response.data?.data || []);
      setFilteredData(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load expense categories:', error);
      setCategories([]);
      setFilteredData([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteCategory = async (categoryId: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this expense category?'
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}api/v1/expense/categories/${categoryId}`, {
        withCredentials: true,
      });

      fetchCategories();
      alert('Expense category deleted successfully!');
    } catch (error) {
      console.error('Failed to delete expense category:', error);
      alert('Failed to delete expense category.');
    }
  };

  const handleSearch = () => {
    const filtered = categories.filter((category) =>
      Object.values(category).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className="px-2 sm:px-4">
      <Breadcrumb pageName="Manage Expense Categories" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <button
          onClick={() => setShowPopup(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Expense Category
        </button>

        <div className="flex w-full sm:w-auto gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border rounded px-4 py-2"
            placeholder="Search expense categories..."
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>

      {showPopup && (
        <AddExpenseCategoryForm
          onClose={() => setShowPopup(false)}
          onCategoryAdded={() => {
            fetchCategories();
          }}
        />
      )}

      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto sm:min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 dark:bg-meta-4">
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">
                #
              </th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">
                Category Name
              </th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">
                Description
              </th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {showEditPopup && editCategory && (
              <EditExpenseCategoryForm
                category={editCategory}
                onClose={() => setShowEditPopup(false)}
                onCategoryUpdated={() => {
                  fetchCategories();
                }}
              />
            )}

            {filteredData.length > 0 ? (
              filteredData.map((category, index) => (
                <tr key={category.category_id}>
                  <td className="border-b py-2 px-3 text-sm">{index + 1}</td>

                  <td className="border-b py-2 px-3 text-sm font-medium">
                    {category.category_name}
                  </td>

                  <td className="border-b py-2 px-3 text-sm font-medium">
                    {category.category_description || '-'}
                  </td>

                  <td className="border-b py-2 px-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded-md p-2 bg-green-600 text-white"
                        onClick={() => {
                          setEditCategory(category);
                          setShowEditPopup(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <button
                        className="rounded-md p-2 bg-black text-white"
                        onClick={() => deleteCategory(category.category_id)}
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-5">
                  No expense categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseCategoryManagement;
