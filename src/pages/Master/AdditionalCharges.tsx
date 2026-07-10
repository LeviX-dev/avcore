import { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { BASE_URL } from "../../../public/config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import AddAdditionalChargeForm from "./AddAdditionalChargeForm.js";
import EditAdditionalCharge from "./EditAdditionalCharge.js";

// Type definitions
interface AdditionalCharge {
  charge_id: number;
  charge_name: string;
  price: number;
  status: "active" | "inactive";
}

const AdditionalCharges: React.FC = () => {
  const [charges, setCharges] = useState<AdditionalCharge[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<AdditionalCharge[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedCharge, setSelectedCharge] = useState<AdditionalCharge | null>(null);

  // Fetch additional charges
  useEffect(() => {
    fetchCharges();
  }, []);

  const fetchCharges = async (): Promise<void> => {
    try {
      const response = await axios.get<AdditionalCharge[]>(BASE_URL + "api/additional-charges");
      setCharges(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error fetching additional charges:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number): Promise<void> => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this additional charge?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}api/additional-charges/${id}`);
      fetchCharges();
      alert("Additional charge deleted successfully!");
    } catch (error) {
      console.error("Error deleting additional charge:", error);
      alert("Failed to delete additional charge.");
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id: number, currentStatus: string): Promise<void> => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const confirmToggle = window.confirm(
      `Are you sure you want to ${newStatus === "active" ? "activate" : "deactivate"} this charge?`
    );
    if (!confirmToggle) return;

    try {
      await axios.patch(`${BASE_URL}api/additional-charges/${id}/status`, {
        status: newStatus,
      });
      fetchCharges();
      alert(`Charge ${newStatus === "active" ? "activated" : "deactivated"} successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  // Handle search
  const handleSearch = (): void => {
    const filtered = charges.filter((charge) =>
      Object.values(charge).some((value) =>
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
      <Breadcrumb pageName="Manage Additional Charges" />

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Add Additional Charge */}
        <button
          onClick={() => setShowPopup(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Additional Charge
        </button>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded px-4 py-2"
            placeholder="Search charges..."
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
      {showPopup && selectedCharge === null && (
        <AddAdditionalChargeForm
          onClose={() => setShowPopup(false)}
          onChargeAdded={() => {
            fetchCharges();
            setSuccessMessage("Additional charge added successfully!");
            setTimeout(() => setSuccessMessage(""), 2000);
          }}
        />
      )}

      {showPopup && selectedCharge !== null && (
        <EditAdditionalCharge
          chargeToEdit={selectedCharge}
          onClose={() => {
            setShowPopup(false);
            setSelectedCharge(null);
          }}
          onChargeUpdated={() => {
            fetchCharges();
            setSuccessMessage("Additional charge updated successfully!");
            setTimeout(() => setSuccessMessage(""), 2000);
          }}
        />
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto sm:min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 text-left dark:bg-meta-4">
              <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                ID
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Charge Name
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Price (₹)
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Status
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((charge) => (
                <tr key={charge.charge_id} className="dark:border-strokedark">
                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 xl:pl-11 text-black dark:text-white">
                    {charge.charge_id}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 text-black dark:text-white font-medium">
                    {charge.charge_name}
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4 text-black dark:text-white">
                    ₹{Number(charge.price).toLocaleString()}/-
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <span
                      className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                        charge.status === "active"
                          ? "bg-success text-success"
                          : "bg-danger text-danger"
                      }`}
                    >
                      {charge.status.charAt(0).toUpperCase() + charge.status.slice(1)}
                    </span>
                  </td>

                  <td className="border-b border-stroke dark:border-strokedark py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md bg-green-600 px-3 py-1 text-white hover:bg-opacity-80"
                        onClick={() => {
                          setSelectedCharge(charge);
                          setShowPopup(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <button
                        className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-opacity-80"
                        onClick={() => handleDelete(charge.charge_id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>

                    
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-5 text-black dark:text-white">
                  No additional charges found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdditionalCharges;