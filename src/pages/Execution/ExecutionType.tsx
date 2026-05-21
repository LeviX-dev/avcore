import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPlus,
  faCog
} from "@fortawesome/free-solid-svg-icons";

import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const ExecutionType = () => {

  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [currentId, setCurrentId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [newType, setNewType] = useState({
    type_name: "",
    completion_percentage: 0,
    status: "active"
  });

  /* ======================================================
      FETCH TYPES
  ====================================================== */

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
        {
          withCredentials: true
        }
      );

      setTypes(res.data);
      setFilteredData(res.data);

    } catch (error) {
      console.error("Fetch Types Error:", error);
    }
  };

  /* ======================================================
      SAVE TYPE
  ====================================================== */

  const saveType = async () => {

    if (!newType.type_name.trim()) {
      alert("Please enter stage name");
      return;
    }

    if (
      newType.completion_percentage < 0 ||
      newType.completion_percentage > 100
    ) {
      alert("Percentage must be between 0 to 100");
      return;
    }

    try {

      if (editMode) {

        await axios.put(
          BASE_URL + `api/execution-type/${currentId}`,
          newType,
          {
            withCredentials: true
          }
        );

        setSuccessMessage(
          "Stage updated successfully!"
        );

      } else {

        await axios.post(
          BASE_URL + "api/execution-type",
          newType,
          {
            withCredentials: true
          }
        );

        setSuccessMessage(
          "Stage added successfully!"
        );
      }

      resetForm();

      fetchTypes();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);

    } catch (error) {

      console.error("Save Type Error:", error);

      alert("Failed to save stage");
    }
  };

  /* ======================================================
      TOGGLE STATUS
  ====================================================== */

  const toggleStatus = async (
    id,
    status
  ) => {

    try {

      await axios.put(
        BASE_URL + `api/execution-type/${id}`,
        {
          status:
            status === "active"
              ? "inactive"
              : "active"
        },
        {
          withCredentials: true
        }
      );

      fetchTypes();

    } catch (error) {

      console.error(
        "Toggle Status Error:",
        error
      );
    }
  };

  /* ======================================================
      SEARCH
  ====================================================== */

  const handleSearch = () => {

    const filtered = types.filter((type) =>
      Object.values(type).some((value) =>
        value
          ?.toString()
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
      )
    );

    setFilteredData(filtered);
  };

  /* ======================================================
      RESET FORM
  ====================================================== */

  const resetForm = () => {

    setShowModal(false);

    setEditMode(false);

    setCurrentId(null);

    setNewType({
      type_name: "",
      completion_percentage: 0,
      status: "active"
    });
  };

  return (
    <div className="px-2 sm:px-4 dark:bg-boxdark">

      <Breadcrumb pageName="Manage Execution Stage" />

      {/* ======================================================
            SUCCESS MESSAGE
      ====================================================== */}

      {successMessage && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {/* ======================================================
            TOP CONTROLS
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">

        {/* ADD BUTTON */}

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Stage
        </button>

        {/* SEARCH */}

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

          <input
            type="text"
            placeholder="Search Stage..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full sm:w-72 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-4 py-2"
          />

          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Search
          </button>
        </div>
      </div>

      {/* ======================================================
            TABLE
      ====================================================== */}

      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">

        <table className="w-full table-auto sm:min-w-[800px]">

          <thead>

            <tr className="bg-gray-200 dark:bg-meta-4 text-left">

              <th className="py-4 px-4 xl:pl-11">
                #
              </th>

              <th className="py-4 px-4 xl:pl-11">
                Stage Name
              </th>

              <th className="py-4 px-4 xl:pl-11">
                Completion %
              </th>

              <th className="py-4 px-4 xl:pl-11">
                Process Count
              </th>

              <th className="py-4 px-4 xl:pl-11">
                Status
              </th>

              <th className="py-4 px-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredData.length > 0 ? (

              filteredData.map((type, index) => (

                <tr
                  key={type.type_id}
                  className="dark:border-strokedark"
                >

                  {/* INDEX */}

                  <td className="border-b border-stroke py-3 px-4 xl:pl-11 dark:border-strokedark dark:text-white">
                    {index + 1}
                  </td>

                  {/* STAGE NAME */}

                  <td className="border-b border-stroke py-3 px-4 xl:pl-11 dark:border-strokedark dark:text-white">
                    {type.type_name}
                  </td>

                  {/* PERCENTAGE */}

                  <td className="border-b border-stroke py-3 px-4 xl:pl-11 dark:border-strokedark">

                    <span className="inline-flex rounded-full bg-primary bg-opacity-10 py-1 px-3 text-sm font-medium text-primary">
                      {type.completion_percentage || 0}%
                    </span>

                  </td>

                  {/* PROCESS COUNT */}

                  <td className="border-b border-stroke py-3 px-4 xl:pl-11 dark:border-strokedark dark:text-white">
                    {type.process_count || 0}
                  </td>

                  {/* STATUS */}

                  <td className="border-b border-stroke py-3 px-4 xl:pl-11 dark:border-strokedark">

                    <span
                      onClick={() =>
                        toggleStatus(
                          type.type_id,
                          type.status
                        )
                      }
                      className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium cursor-pointer
                      ${
                        type.status === "active"
                          ? "bg-success text-success"
                          : "bg-danger text-danger"
                      }`}
                    >
                      {type.status}
                    </span>

                  </td>

                  {/* ACTIONS */}

                  <td className="border-b border-stroke py-3 px-4 dark:border-strokedark">

                    <div className="flex items-center gap-2">

                      {/* PROCESS SETTINGS */}

                      <button
                        className="rounded-md bg-gray-600 px-3 py-1 text-white hover:bg-opacity-80"
                        onClick={() =>
                          navigate(
                            `/execution/process-settings/${type.type_id}`
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faCog} />
                      </button>

                      {/* EDIT */}

                      <button
                        className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-opacity-80"
                        onClick={() => {

                          setEditMode(true);

                          setShowModal(true);

                          setCurrentId(type.type_id);

                          setNewType({
                            type_name:
                              type.type_name || "",

                            completion_percentage:
                              type.completion_percentage || 0,

                            status:
                              type.status || "active"
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

                <td
                  colSpan={6}
                  className="text-center py-5 dark:text-white"
                >
                  No stages found
                </td>

              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* ======================================================
            MODAL
      ====================================================== */}

      {showModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

          <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-full max-w-md">

            <div className="p-6">

              {/* TITLE */}

              <h3 className="text-lg font-semibold mb-4 dark:text-white">

                {editMode
                  ? "Edit Stage"
                  : "Add Stage"}

              </h3>

              {/* STAGE NAME */}

              <div className="mb-4">

                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Stage Name
                </label>

                <input
                  type="text"
                  placeholder="Enter stage name"
                  value={newType.type_name}
                  onChange={(e) =>
                    setNewType({
                      ...newType,
                      type_name: e.target.value
                    })
                  }
                  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
                />

              </div>

              {/* COMPLETION PERCENTAGE */}

             <div className="mb-4">

  <label className="block text-sm font-medium mb-2 dark:text-white">
    Completion Percentage
  </label>

  <input
    type="number"
    min="0"
    max="100"
    placeholder="Enter completion percentage"
    value={newType.completion_percentage}
    
    onChange={(e) =>
      setNewType({
        ...newType,
        completion_percentage: Number(e.target.value)
      })
    }

    className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
  />

</div>

              {/* STATUS */}

              <div className="mb-6">

                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Status
                </label>

                <select
                  value={newType.status}
                  onChange={(e) =>
                    setNewType({
                      ...newType,
                      status: e.target.value
                    })
                  }
                  className="w-full border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-3 py-2"
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>

              </div>

              {/* FOOTER */}

              <div className="flex justify-end gap-3">

                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-stroke dark:border-strokedark rounded dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4"
                >
                  Cancel
                </button>

                <button
                  onClick={saveType}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
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