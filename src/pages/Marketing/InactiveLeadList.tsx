import React, { useEffect, useState } from "react";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { faEye, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { BASE_URL } from '../../../public/config.js';
import { useNavigate } from "react-router-dom";

const InactiveLeadList = () => {
  const [inactiveLeads, setInactiveLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}api/getinactiveleaddetails`, { withCredentials: true });
        setInactiveLeads(res.data);
      } catch (err) {
        console.error("Error fetching inactive leads:", err);
      }
    };

    fetchData();
  }, []);

  // Filtering
  const filteredData = inactiveLeads.filter((lead) => {
    const search = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(search) ||
      lead.city?.toLowerCase().includes(search) ||
      lead.assign_user?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-4">
      <Breadcrumb pageName="Inactive Lead List" />

      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </button>
      </div>

      {/* 🔎 Search */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-90">
            <label className="block text-sm font-medium mb-1 text-black dark:text-white">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, city, assigned user..."
              className="w-full p-2 border border-gray-300 rounded text-black dark:text-white dark:bg-form-input dark:border-strokedark"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-bold text-black dark:text-white text-sm">Sr. No</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white text-sm">Client Name</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white text-sm">Contact</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white text-sm">City</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white text-sm">Assign Date</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white text-sm">Assigned User</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white text-sm">Call Status</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white text-sm">Remark</th>
                {/* <th className="py-4 px-4 font-bold text-black dark:text-white text-sm">Actions</th> */}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((lead, index) => (
                <tr key={lead.master_id} className="border-b border-stroke dark:border-strokedark">
                  
                  <td className="py-4 px-4 text-black dark:text-white text-sm">{index + 1}</td>
                  <td className="py-4 px-4 text-black dark:text-white text-sm font-medium">{lead.name}</td>
                  <td className="py-4 px-4 text-black dark:text-white text-sm">{lead.contact || "-"}</td>
                  <td className="py-4 px-4 text-black dark:text-white text-sm">{lead.city || "-"}</td>
                  <td className="py-4 px-4 text-black dark:text-white text-sm">
                    {lead.assign_date
                      ? new Date(lead.assign_date).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                  <td className="py-4 px-4 text-black dark:text-white text-sm">{lead.assign_user || "-"}</td>

                  <td className="py-4 px-4 text-black dark:text-white text-sm">
                    <span className="inline-flex rounded-full bg-gray-200 py-1 px-3 text-gray-700 text-sm">
                      {lead.call_status}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-black dark:text-white text-sm">{lead.remark || "-"}</td>

                  {/* <td className="py-4 px-4 text-center">
                    <button
                      className="inline-flex items-center justify-center rounded-md py-2 px-3 text-white bg-blue-600 hover:bg-blue-700 font-medium text-sm"
                      title="View"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </td> */}

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};

export default InactiveLeadList;
