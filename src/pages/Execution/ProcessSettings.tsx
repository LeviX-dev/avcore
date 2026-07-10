import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams, useNavigate } from "react-router-dom";
import { faPlus, faEdit, faTrash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const ProcessSettings = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();

  const [processes, setProcesses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [newProcess, setNewProcess] = useState({
    process_name: "",
    description: "",
    status: "active"
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchProcesses();
  }, [typeId]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, processes]);

  const fetchProcesses = async () => {
    try {
      const res = await axios.get(
        BASE_URL + `api/process/by-type/${typeId}`,
        { withCredentials: true }
      );
      setProcesses(res.data);
      setFilteredData(res.data);
    } catch (error) {
      console.error("Fetch process error:", error);
    }
  };

  /* ================= SAVE (ADD / EDIT) ================= */

  const [isSaving, setIsSaving] = useState(false);


  const saveProcess = async () => {

  if (isSaving) return;

  if (!newProcess.process_name.trim()) {
    alert("Process name required");
    return;
  }

  try {

    setIsSaving(true);

    if (editMode) {

      await axios.put(
        BASE_URL + `api/process/${editingId}`,
        {
          ...newProcess,
          type_id: typeId
        },
        { withCredentials: true }
      );

      setSuccessMessage("Process updated successfully!");

    } else {

      await axios.post(
        BASE_URL + "api/process",
        {
          ...newProcess,
          type_id: typeId
        },
        { withCredentials: true }
      );

      setSuccessMessage("Process added successfully!");
    }

    resetForm();

    fetchProcesses();

    setTimeout(() => setSuccessMessage(""), 2000);

  } catch (error) {

    console.error("Save error:", error);

    alert("Failed to save process.");

  } finally {

    setIsSaving(false);
  }
};


  /* ================= EDIT ================= */
  const handleEdit = (process) => {
    setEditMode(true);
    setEditingId(process.process_id);
    setNewProcess({
      process_name: process.process_name || "",
      description: process.description || "",
      status: process.status || "active"
    });
    setShowModal(true);
  };

  /* ================= DELETE ================= */
  const deleteProcess = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this process?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        BASE_URL + `api/process/${id}`,
        { withCredentials: true }
      );
      setSuccessMessage("Process deleted successfully!");
      fetchProcesses();
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete process.");
    }
  };

  /* ================= STATUS ================= */
  const toggleStatus = async (id) => {
    try {
      await axios.put(
        BASE_URL + `api/process/toggle-status/${id}`,
        {},
        { withCredentials: true }
      );
      fetchProcesses();
    } catch (error) {
      console.error("Status error:", error);
    }
  };

  /* ================= SEARCH ================= */
  const handleSearch = () => {
    const filtered = processes.filter((p) =>
      Object.values(p).some((v) =>
        v?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  /* ================= RESET ================= */
  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setEditingId(null);
    setNewProcess({
      process_name: "",
      description: "",
      status: "active"
    });
  };

  return (
    <div className="px-2 sm:px-4 dark:bg-boxdark">
      <Breadcrumb pageName="Process Settings" />

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded dark:bg-green-900 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Back Button */}
          <button
            onClick={() => navigate("/execution/type")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2 justify-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Types
          </button>

          {/* Add Process Button */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 justify-center"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Process
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-4 py-2"
            placeholder="Search Processes..."
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
                Process Name
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Description
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
              filteredData.map((process, index) => (
                <tr key={process.process_id} className="dark:border-strokedark">
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {index + 1}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {process.process_name}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {process.description || "-"}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11">
                    <span
                      onClick={() => toggleStatus(process.process_id)}
                      className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium cursor-pointer ${
                        process.status === "active"
                          ? "bg-success text-success"
                          : "bg-danger text-danger"
                      }`}
                    >
                      {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                    </span>
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-opacity-80"
                        onClick={() => handleEdit(process)}
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
                  No processes found
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
                {editMode ? "Edit Process" : "Add Process"}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Process Name
                </label>
                <input
                  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
                  placeholder="Enter process name"
                  value={newProcess.process_name}
                  onChange={(e) =>
                    setNewProcess({ ...newProcess, process_name: e.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Description
                </label>
              <textarea
  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
  placeholder="Enter description"
  rows={3}  
  value={newProcess.description}
  onChange={(e) =>
    setNewProcess({ ...newProcess, description: e.target.value })
  }
/>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Status
                </label>
                <select
                  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
                  value={newProcess.status}
                  onChange={(e) =>
                    setNewProcess({ ...newProcess, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-stroke dark:border-strokedark rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4"
                >
                  Cancel
                </button>

<button
  className={`px-4 py-2 text-white rounded ${
    isSaving
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-500 hover:bg-blue-600"
  }`}
  onClick={saveProcess}
  disabled={isSaving}
>
  {isSaving ? "Saving..." : "Save"}
</button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessSettings;