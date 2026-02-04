import { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { BASE_URL } from "../../../public/config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import AddAreaForm from "./AddAreaForm";
import EditArea from "../../../src/pages/Master/EditArea";

const Area = () => {
  const [area, setArea] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);

  /* Fetch Area */
  useEffect(() => {
    const fetchArea = async () => {
      try {
        const response = await axios.get(BASE_URL + "api/area");
        setArea(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching Area:", error);
      }
    };
    fetchArea();
  }, []);

  /* Delete Area */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this Area?")) return;

    try {
      await axios.delete(`${BASE_URL}api/area/${id}`, {
        withCredentials: true,
      });

      const updatedArea = area.filter(a => a.area_id !== id);
      setArea(updatedArea);
      setFilteredData(updatedArea);
      alert("Area deleted successfully!");
    } catch (error) {
      console.error("Error deleting Area:", error);
      alert("Failed to delete Area.");
    }
  };

  /* Search */
  const handleSearch = () => {
    const filtered = area.filter(a =>
      Object.values(a).some(value =>
        value
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className="w-full px-2 sm:px-4 dark:bg-boxdark">
      <Breadcrumb pageName="Manage Areas" />

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Add Area */}
        <button
          onClick={() => {
            setSelectedArea(null);
            setShowPopup(true);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Area
        </button>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-4 py-2"
            placeholder="Search Areas..."
          />
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <p className="mb-2 text-green-600 dark:text-green-400 font-medium">
          {successMessage}
        </p>
      )}

      {/* Popup */}
      {showPopup && (
        selectedArea === null ? (
          <AddAreaForm
            onClose={() => setShowPopup(false)}
            onAreaAdded={() => {
              axios.get(BASE_URL + "api/area").then(response => {
                setArea(response.data);
                setFilteredData(response.data);
                setSuccessMessage("Area added successfully!");
                setTimeout(() => setSuccessMessage(""), 2000);
              });
            }}
            AreaToEdit={undefined}
          />
        ) : (
          <EditArea
            AreaToEdit={selectedArea}
            onClose={() => {
              setShowPopup(false);
              setSelectedArea(null);
            }}
            onAreaUpdated={() => {
              axios.get(BASE_URL + "api/area").then(response => {
                setArea(response.data);
                setFilteredData(response.data);
                setSuccessMessage("Area updated successfully!");
                setTimeout(() => setSuccessMessage(""), 2000);
              });
            }}
          />
        )
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto sm:min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 dark:bg-meta-4 text-left">
              <th className="py-3 px-4 font-medium text-black dark:text-white">Area ID</th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">Area</th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map(a => (
                <tr key={a.area_id} className="border-b border-stroke dark:border-strokedark">
                  <td className="py-3 px-4 text-black dark:text-white">{a.area_id}</td>
                  <td className="py-3 px-4 text-black dark:text-white">{a.area_name}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                        onClick={() => {
                          setSelectedArea(a);
                          setShowPopup(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <button
                        className="rounded bg-black px-3 py-1 text-white hover:bg-gray-800"
                        onClick={() => handleDelete(a.area_id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-5 text-black dark:text-white">
                  No Area found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Area;