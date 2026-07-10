import { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { BASE_URL } from "../../../public/config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import AddCategoryForm from "./AddCategoryForm";
import EditCategoryForm from "./EditCategoryForm";

// Updated Category.jsx
const Category = () => {
  const [categories, setCategories] = useState([]);
  const [regularCategories, setRegularCategories] = useState([]);
  const [customisedCategories, setCustomisedCategories] = useState([]);
  const [showCustomised, setShowCustomised] = useState(false); // Toggle view
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        // Use the new combined API
        const response = await axios.get(BASE_URL + "api/all-categories");
        
        // Store all categories
        setCategories(response.data.allCategories);
        setRegularCategories(response.data.regularCategories);
        setCustomisedCategories(response.data.customisedCategories);
        
        // By default, show regular categories
        setFilteredData(response.data.regularCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchAllCategories();
  }, []);

  // Toggle between regular and customised categories
  const toggleCategoryView = (type) => {
    if (type === 'regular') {
      setFilteredData(regularCategories);
      setShowCustomised(false);
    } else if (type === 'customised') {
      setFilteredData(customisedCategories);
      setShowCustomised(true);
    } else if (type === 'all') {
      setFilteredData(categories);
      setShowCustomised(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}api/category/${id}`);
      // Refresh all categories after delete
      const response = await axios.get(BASE_URL + "api/all-categories");
      setCategories(response.data.allCategories);
      setRegularCategories(response.data.regularCategories);
      setCustomisedCategories(response.data.customisedCategories);
      setFilteredData(response.data.regularCategories);
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  const handleSearch = () => {
    const currentDataSource = showCustomised ? customisedCategories : 
                              (filteredData === categories ? categories : regularCategories);
    const filtered = currentDataSource.filter((category) =>
      Object.values(category).some((value) =>
        value
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className="px-2 sm:px-4">
      <Breadcrumb pageName="Manage Categories" />
{/* Category Type Toggle Buttons & Add Category - Single Line */}
<div className="flex flex-wrap items-center gap-2 mb-4">
  <button
    onClick={() => setShowPopup(true)}
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    Add Category
  </button>
  
  <button
    onClick={() => toggleCategoryView('regular')}
    className={`px-4 py-2 rounded ${
      !showCustomised && filteredData !== categories
        ? 'bg-teal-500 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    Leads Categories ({regularCategories.length})
  </button>
  
  
  <button
    onClick={() => toggleCategoryView('customised')}
    className={`px-4 py-2 rounded ${
      showCustomised
        ? 'bg-green-500 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    Quatation Categories ({customisedCategories.length})
  </button>
  
  <button
    onClick={() => toggleCategoryView('all')}
    className={`px-4 py-2 rounded ${
      filteredData === categories
        ? 'bg-purple-500 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    All Categories ({categories.length})
  </button>

  {/* Search Bar - Also in same line */}
  <div className="flex gap-2 ml-auto">
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-64 border rounded px-4 py-2"
      placeholder="Search categories..."
    />
    <button
      onClick={handleSearch}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Search
    </button>
  </div>
</div>


      {/* Popup and table code remains the same as your original */}
      {showPopup && (
        <AddCategoryForm
          onClose={() => setShowPopup(false)}
          onCategoryAdded={() => {
            axios.get(BASE_URL + "api/all-categories").then((response) => {
              setCategories(response.data.allCategories);
              setRegularCategories(response.data.regularCategories);
              setCustomisedCategories(response.data.customisedCategories);
              setFilteredData(response.data.regularCategories);
            })
          }}
        />
      )}

      {/* Table wrapper - same as your original */}
      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto sm:min-w-[600px]">
          {/* Rest of your table code remains exactly the same */}
          <thead>
            <tr className="bg-gray-200 dark:bg-meta-4">
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">
                #
              </th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">
                Category Name
              </th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">
                Status
              </th>
              <th className="py-3 px-3 text-left text-sm font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {showEditPopup && editCategory && (
              <EditCategoryForm
                category={editCategory}
                onClose={() => setShowEditPopup(false)}
                onCategoryUpdated={() => {
                  axios.get(BASE_URL + "api/all-categories").then((res) => {
                    setCategories(res.data.allCategories);
                    setRegularCategories(res.data.regularCategories);
                    setCustomisedCategories(res.data.customisedCategories);
                    setFilteredData(res.data.regularCategories);
                  });
                }}
              />
            )}

            {filteredData.length > 0 ? (
              filteredData.map((category, index) => (
                <tr key={category.cat_id}>
                  <td className="border-b py-2 px-3 text-sm">
                    {index + 1}
                  </td>
                  <td className="border-b py-2 px-3 text-sm font-medium">
                    {category.cat_name}
                  </td>
                  <td className="border-b py-2 px-3">
                    <span
                      className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-xs font-medium ${
                        category.status === "active"
                          ? "bg-success text-success"
                          : "bg-danger text-danger"
                      }`}
                    >
                      {category.status.charAt(0).toUpperCase() +
                        category.status.slice(1)}
                    </span>
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
                        onClick={() => handleDelete(category.cat_id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-5">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Category;
