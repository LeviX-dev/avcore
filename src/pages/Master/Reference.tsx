import { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { BASE_URL } from "../../../public/config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import AddReferenceForm from "./AddReferenceForm";
import EditReference from "./EditReference";

const Reference = () => {
  const [reference, setReference] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedReference, setSelectedReference] = useState(null);

  // Fetch reference
  useEffect(() => {
    const fetchreference = async () => {
      try {
        const response = await axios.get(BASE_URL + "api/reference");
        setReference(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching reference:", error);
      }
    };
    fetchreference();
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reference?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}api/reference/${id}`);
      const updatedreference = reference.filter(
        (reference) => reference.reference_id !== id
      );
      setReference(updatedreference);
      setFilteredData(updatedreference);
      alert("Reference deleted successfully!");
    } catch (error) {
      console.error("Error deleting reference:", error);
      alert("Failed to delete reference.");
    }
  };

  // Handle search
  const handleSearch = () => {
    const filtered = reference.filter((reference) =>
      Object.values(reference).some((value) =>
        value
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className="px-2 sm:px-4 dark:bg-boxdark">
      <Breadcrumb pageName="Manage Sources" />

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Add Reference */}
        <button
          onClick={() => setShowPopup(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Reference
        </button>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-4 py-2"
            placeholder="Search References..."
          />
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>

      {/* Popup Forms */}
      {showPopup && selectedReference === null && (
        <AddReferenceForm
          onClose={() => setShowPopup(false)}
          onReferenceAdded={() => {
            axios.get(BASE_URL + "api/reference").then((response) => {
              setReference(response.data);
              setFilteredData(response.data);
              setSuccessMessage("Reference added successfully!");
              setTimeout(() => setSuccessMessage(""), 2000);
            });
          }}
          referenceToEdit={undefined}
        />
      )}

      {showPopup && selectedReference !== null && (
        <EditReference
          referenceToEdit={selectedReference}
          onClose={() => {
            setShowPopup(false);
            setSelectedReference(null);
          }}
          onReferenceUpdated={() => {
            axios.get(BASE_URL + "api/reference").then((response) => {
              setReference(response.data);
              setFilteredData(response.data);
              setSuccessMessage("Reference updated successfully!");
              setTimeout(() => setSuccessMessage(""), 2000);
            });
          }}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto sm:min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 text-left dark:bg-meta-4">
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Reference ID
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Reference From
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
              filteredData.map((reference) => (
                <tr key={reference.reference_id} className="dark:border-strokedark">
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {reference.reference_id}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {reference.reference_name}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11">
                    <span
                      className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                        reference.status === "active"
                          ? "bg-success text-success"
                          : "bg-danger text-danger"
                      }`}
                    >
                      {reference.status.charAt(0).toUpperCase() +
                        reference.status.slice(1)}
                    </span>
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md bg-green-600 px-3 py-1 text-white hover:bg-opacity-80"
                        onClick={() => {
                          setSelectedReference(reference);
                          setShowPopup(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <button
                        className="rounded-md bg-black px-3 py-1 text-white hover:bg-opacity-80"
                        onClick={() =>
                          handleDelete(reference.reference_id)
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
                <td colSpan={4} className="text-center py-5 text-black dark:text-white">
                  No reference found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reference;