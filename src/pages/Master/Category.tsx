import { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { BASE_URL } from "../../../public/config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import AddCategoryForm from "./AddCategoryForm";
import EditCategoryForm from "./EditCategoryForm";

const Category = () => {
  const [categories, setcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);

  useEffect(() => {
    const fetchcategories = async () => {
      try {
        const response = await axios.get(BASE_URL + "api/category");
        setcategories(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchcategories();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}api/category/${id}`);
      const updatedcategories = categories.filter(
        (cat) => cat.cat_id !== id
      );
      setcategories(updatedcategories);
      setFilteredData(updatedcategories);
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  const handleSearch = () => {
    const filtered = categories.filter((category) =>
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

      {/* Top Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <button
          onClick={() => setShowPopup(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Category
        </button>

        <div className="flex w-full sm:w-auto gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border rounded px-4 py-2"
            placeholder="Search categories..."
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>

      {/* Add Popup */}
      {showPopup && (
        <AddCategoryForm
          onClose={() => setShowPopup(false)}
          onCategoryAdded={() => {
            axios.get(BASE_URL + "api/category").then((response) => {
              setcategories(response.data);
              setFilteredData(response.data);
            });
          }}
        />
      )}

      {/* Table Wrapper */}
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
                  axios.get(BASE_URL + "api/category").then((res) => {
                    setcategories(res.data);
                    setFilteredData(res.data);
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
                        onClick={() =>
                          handleDelete(category.cat_id)
                        }
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