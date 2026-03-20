import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faCog } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const ExecutionType = () => {
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [newType, setNewType] = useState({
    type_name: "",
    status: "active"
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, types]);

  const fetchTypes = async () => {
    try {
      const res = await axios.get(
        BASE_URL + "api/type/execution-type",
        { withCredentials: true }
      );
      setTypes(res.data);
      setFilteredData(res.data);
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  const saveType = async () => {
    if (!newType.type_name.trim()) {
      alert("Please enter a type name");
      return;
    }

    try {
      if (editMode) {
        await axios.put(
          BASE_URL + `api/execution-type/${currentId}`,
          newType,
          { withCredentials: true }
        );
        setSuccessMessage("Type updated successfully!");
      } else {
        await axios.post(
          BASE_URL + "api/execution-type",
          newType,
          { withCredentials: true }
        );
        setSuccessMessage("Type added successfully!");
      }

      setShowModal(false);
      setNewType({ type_name: "", status: "active" });
      fetchTypes();
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error saving type:", error);
      alert("Failed to save type.");
    }
  };

  const deleteType = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this type?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        BASE_URL + `api/execution-type/${id}`,
        { withCredentials: true }
      );
      fetchTypes();
      alert("Type deleted successfully!");
    } catch (error) {
      console.error("Error deleting type:", error);
      alert("Failed to delete type.");
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      await axios.put(
        BASE_URL + `api/execution-type/${id}`,
        { status: status === "active" ? "inactive" : "active" },
        { withCredentials: true }
      );
      fetchTypes();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSearch = () => {
    const filtered = types.filter((type) =>
      Object.values(type).some((value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className="px-2 sm:px-4 dark:bg-boxdark">
      <Breadcrumb pageName="Manage Execution Types" />

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Add Type Button */}
        <button
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
            setNewType({ type_name: "", status: "active" });
          }}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 justify-center"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Type
        </button>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-4 py-2"
            placeholder="Search Types..."
          />
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto sm:min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 text-left dark:bg-meta-4">
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                #
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Type Name
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Process Count
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
              filteredData.map((type, index) => (
                <tr key={type.type_id} className="dark:border-strokedark">
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {index + 1}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {type.type_name}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {type.process_count || 0}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11">
                    <span
                      onClick={() => toggleStatus(type.type_id, type.status)}
                      className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium cursor-pointer ${
                        type.status === "active"
                          ? "bg-success text-success"
                          : "bg-danger text-danger"
                      }`}
                    >
                      {type.status.charAt(0).toUpperCase() + type.status.slice(1)}
                    </span>
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <div className="flex items-center gap-2">
                      {/* Settings Button */}
                      <button
                        className="rounded-md bg-gray-600 px-3 py-1 text-white hover:bg-opacity-80"
                        onClick={() =>
                          navigate(`/execution/process-settings/${type.type_id}`)
                        }
                      >
                        <FontAwesomeIcon icon={faCog} />
                      </button>

                      {/* Edit Button */}
                      <button
                        className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-opacity-80"
                        onClick={() => {
                          setEditMode(true);
                          setShowModal(true);
                          setCurrentId(type.type_id);
                          setNewType({
                            type_name: type.type_name,
                            status: type.status
                          });
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                     
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-5 text-black dark:text-white">
                  No types found
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
                {editMode ? "Edit Type" : "Add Type"}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Type Name
                </label>
                <input
                  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
                  placeholder="Enter type name"
                  value={newType.type_name}
                  onChange={(e) =>
                    setNewType({ ...newType, type_name: e.target.value })
                  }
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Status
                </label>
                <select
                  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
                  value={newType.status}
                  onChange={(e) =>
                    setNewType({ ...newType, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-stroke dark:border-strokedark rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4"
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={saveType}
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

export default ExecutionType;