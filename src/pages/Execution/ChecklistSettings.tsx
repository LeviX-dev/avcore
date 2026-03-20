import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const ChecklistSettings = () => {
  const { checklistId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    fetchItems();
  }, [checklistId]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, items]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(
        BASE_URL + `api/checklist-item/by-checklist/${checklistId}`,
        { withCredentials: true }
      );
      setItems(res.data);
      setFilteredData(res.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      setErrorMessage("Failed to load items");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const saveItem = async () => {
    if (!itemName.trim()) {
      setErrorMessage("Item name required");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      if (editMode) {
        await axios.put(
          BASE_URL + `api/checklist-item/${editingId}`,
          { item_name: itemName },
          { withCredentials: true }
        );
        setSuccessMessage("Item updated successfully!");
      } else {
        await axios.post(
          BASE_URL + "api/checklist-item",
          {
            item_name: itemName,
            checklist_id: checklistId,
            status: "active"
          },
          { withCredentials: true }
        );
        setSuccessMessage("Execution CheckList successfully!");
      }

      setShowModal(false);
      setItemName("");
      fetchItems();
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error saving item:", error);
      setErrorMessage("Failed to save item");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const deleteItem = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        BASE_URL + `api/checklist-item/${id}`,
        { withCredentials: true }
      );
      setSuccessMessage("Item deleted successfully!");
      fetchItems();
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error deleting item:", error);
      setErrorMessage("Failed to delete item");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(
        BASE_URL + `api/checklist-item/${id}`,
        { status: currentStatus === "active" ? "inactive" : "active" },
        { withCredentials: true }
      );
      fetchItems();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSearch = () => {
    const filtered = items.filter((item) =>
      Object.values(item).some((value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className="px-2 sm:px-4 dark:bg-boxdark">
      <Breadcrumb pageName="Checklist Items" />

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded dark:bg-green-900 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Back Button */}
          <button
            onClick={() => navigate("/execution/checklist")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2 justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Checklists
          </button>

          {/* Add Item Button */}
          <button
            onClick={() => {
              setEditMode(false);
              setItemName("");
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Execution CheckList
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-4 py-2 pl-10"
              placeholder="Search Items..."
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-3 text-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left dark:bg-meta-4">
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                #
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Item Name
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Status
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.item_id} className="dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4">
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {index + 1}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white font-medium">
                    {item.item_name}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11">
                    <span
                      onClick={() => toggleStatus(item.item_id, item.status)}
                      className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-80 ${
                        item.status === "active"
                          ? "bg-success text-success"
                          : "bg-danger text-danger"
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-opacity-80 transition-colors"
                        onClick={() => {
                          setEditMode(true);
                          setEditingId(item.item_id);
                          setItemName(item.item_name);
                          setShowModal(true);
                        }}
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                  
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-5 text-black dark:text-white">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
                {editMode ? "Edit Execution CheckList" : "Add Execution CheckList"}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Item Name
                </label>
                <input
                  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setItemName("");
                    setEditMode(false);
                  }}
                  className="px-4 py-2 border border-stroke dark:border-strokedark rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition-colors"
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={saveItem}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistSettings;