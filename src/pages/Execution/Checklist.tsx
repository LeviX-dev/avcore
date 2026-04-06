// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { BASE_URL } from "../../../public/config";
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faPlus, faCog, faSearch } from "@fortawesome/free-solid-svg-icons";
// import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

// const Checklist = () => {

//   const navigate = useNavigate();

//   const [checklists, setChecklists] = useState<any[]>([]);
//   const [filteredData, setFilteredData] = useState<any[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentId, setCurrentId] = useState<number | null>(null);

//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   const [newChecklist, setNewChecklist] = useState({
//     checklist_name: "",
//     status: "active"
//   });

//   useEffect(() => {
//     fetchChecklists();
//   }, []);

//   useEffect(() => {
//     handleSearch();
//   }, [searchTerm, checklists]);

//   const fetchChecklists = async () => {
//     try {
//       const res = await axios.get(
//         BASE_URL + "api/sujit/checklist",
//         { withCredentials: true }
//       );

//       const data = res.data || [];
//       setChecklists(data);
//       setFilteredData(data);

//     } catch (error: any) {
//       console.error("Checklist fetch error:", error);

//       if (error.response?.status === 404) {
//         setChecklists([]);
//         setFilteredData([]);
//       } else {
//         setErrorMessage("Failed to load checklists");
//         setTimeout(() => setErrorMessage(""), 3000);
//       }
//     }
//   };

//   const saveChecklist = async () => {

//     if (!newChecklist.checklist_name.trim()) {
//       setErrorMessage("Checklist name required");
//       setTimeout(() => setErrorMessage(""), 3000);
//       return;
//     }

//     try {

//       if (editMode && currentId) {

//         await axios.put(
//           BASE_URL + `api/checklist/${currentId}`,
//           newChecklist,
//           { withCredentials: true }
//         );

//         setSuccessMessage("Checklist updated successfully!");

//       } else {

//         await axios.post(
//           BASE_URL + "api/checklist",
//           newChecklist,
//           { withCredentials: true }
//         );

//         setSuccessMessage("Checklist added successfully!");
//       }

//       setShowModal(false);
//       setNewChecklist({ checklist_name: "", status: "active" });

//       fetchChecklists();
//       setTimeout(() => setSuccessMessage(""), 2000);

//     } catch (error) {
//       console.error(error);
//       setErrorMessage("Failed to save checklist");
//       setTimeout(() => setErrorMessage(""), 3000);
//     }
//   };

//   const toggleStatus = async (id: number, status: string) => {
//     try {

//       await axios.put(
//         BASE_URL + `api/checklist/${id}`,
//         { status: status === "active" ? "inactive" : "active" },
//         { withCredentials: true }
//       );

//       fetchChecklists();

//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleSearch = () => {

//     const filtered = checklists.filter((item) =>
//       Object.values(item).some((value) =>
//         value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     );

//     setFilteredData(filtered);
//   };

//   return (

//     <div className="px-2 sm:px-4 dark:bg-boxdark">

//       <Breadcrumb pageName="Manage Checklists" />

//       {successMessage && (
//         <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
//           {successMessage}
//         </div>
//       )}

//       {errorMessage && (
//         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
//           {errorMessage}
//         </div>
//       )}

//       <div className="flex justify-between mb-4 flex-col sm:flex-row gap-4">

//         <button
//           onClick={() => {
//             setShowModal(true);
//             setEditMode(false);
//             setNewChecklist({ checklist_name: "", status: "active" });
//           }}
//           className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2"
//         >
//           <FontAwesomeIcon icon={faPlus} />
//           Add Checklist
//         </button>

//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search..."
//             className="border px-4 py-2 rounded pl-10"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />

//           <FontAwesomeIcon
//             icon={faSearch}
//             className="absolute left-3 top-3 text-gray-400"
//           />
//         </div>

//       </div>

//       <div className="border rounded overflow-x-auto">

//         <table className="w-full">

//           <thead className="bg-gray-200">
//             <tr>
//               <th className="p-3">#</th>
//               <th className="p-3">Checklist Name</th>
//               <th className="p-3">Items</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>

//           <tbody>

//             {filteredData.length > 0 ? (

//               filteredData.map((c: any, index) => (

//                 <tr key={c.checklist_id} className="border-t">

//                   <td className="p-3">{index + 1}</td>

//                   <td className="p-3 font-medium">{c.checklist_name}</td>

//                   <td className="p-3">
//                     {c.item_count || 0} items
//                   </td>

//                   <td className="p-3">

//                     <span
//                       onClick={() => toggleStatus(c.checklist_id, c.status)}
//                       className={`px-3 py-1 rounded text-xs cursor-pointer ${
//                         c.status === "active"
//                           ? "bg-green-100 text-green-700"
//                           : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {c.status}
//                     </span>

//                   </td>

//                   <td className="p-3 flex gap-2">

//                     <button
//                       className="bg-gray-600 text-white px-3 py-1 rounded"
//                       onClick={() =>
//                         navigate(`/execution/checklist-settings/${c.checklist_id}`)
//                       }
//                     >
//                       <FontAwesomeIcon icon={faCog} />
//                     </button>

//                     <button
//                       className="bg-blue-600 text-white px-3 py-1 rounded"
//                       onClick={() => {
//                         setEditMode(true);
//                         setCurrentId(c.checklist_id);
//                         setNewChecklist({
//                           checklist_name: c.checklist_name,
//                           status: c.status
//                         });
//                         setShowModal(true);
//                       }}
//                     >
//                       <FontAwesomeIcon icon={faEdit} />
//                     </button>

//                   </td>

//                 </tr>

//               ))

//             ) : (

//               <tr>
//                 <td colSpan={5} className="text-center py-6">
//                   No checklists found
//                 </td>
//               </tr>

//             )}

//           </tbody>

//         </table>

//       </div>

//       {showModal && (

//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

//           <div className="bg-white p-6 rounded w-96">

//             <h3 className="font-semibold mb-4">
//               {editMode ? "Edit Checklist" : "Add Checklist"}
//             </h3>

//             <input
//               className="border w-full p-2 mb-4"
//               placeholder="Checklist name"
//               value={newChecklist.checklist_name}
//               onChange={(e) =>
//                 setNewChecklist({
//                   ...newChecklist,
//                   checklist_name: e.target.value
//                 })
//               }
//             />

//             <div className="flex justify-end gap-3">

//               <button
//                 onClick={() => setShowModal(false)}
//                 className="border px-4 py-2 rounded"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={saveChecklist}
//                 className="bg-blue-500 text-white px-4 py-2 rounded"
//               >
//                 Save
//               </button>

//             </div>

//           </div>

//         </div>

//       )}

//     </div>

//   );
// };

// export default Checklist;  




import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const Checklist = () => {

  const navigate = useNavigate();

  const [checklists, setChecklists] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [newChecklist, setNewChecklist] = useState({
    checklist_name: "",
    status: "active",
    checklist_type: "pre_execution"
  });

  useEffect(() => {
    fetchChecklists();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, checklists]);

  const fetchChecklists = async () => {
    try {
      const res = await axios.get(
        BASE_URL + "api/sujit/checklist",
        { withCredentials: true }
      );

      const data = res.data || [];
      setChecklists(data);
      setFilteredData(data);

    } catch (error: any) {
      console.error("Checklist fetch error:", error);

      if (error.response?.status === 404) {
        setChecklists([]);
        setFilteredData([]);
      } else {
        setErrorMessage("Failed to load checklists");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const saveChecklist = async () => {
    if (!newChecklist.checklist_name.trim()) {
      setErrorMessage("Checklist name required");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      if (editMode && currentId) {
        await axios.put(
          BASE_URL + `api/checklist/${currentId}`,
          newChecklist,
          { withCredentials: true }
        );
        setSuccessMessage("Checklist updated successfully!");
      } else {
        await axios.post(
          BASE_URL + "api/checklist",
          newChecklist,
          { withCredentials: true }
        );
        setSuccessMessage("Checklist added successfully!");
      }

      setShowModal(false);
      setNewChecklist({ 
        checklist_name: "", 
        status: "active",
        checklist_type: "pre_execution" 
      });

      fetchChecklists();
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to save checklist");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const toggleStatus = async (id: number, status: string) => {
    try {
      await axios.put(
        BASE_URL + `api/checklist/${id}`,
        { status: status === "active" ? "inactive" : "active" },
        { withCredentials: true }
      );
      fetchChecklists();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    const filtered = checklists.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  // Function to get type badge color
  const getTypeBadgeColor = (type: string) => {
    if (type === 'pre_execution') {
      return 'bg-purple-100 text-purple-700';
    } else if (type === 'execution') {
      return 'bg-orange-100 text-orange-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  // Function to get type display name
  const getTypeDisplayName = (type: string) => {
    if (type === 'pre_execution') return 'Pre Execution';
    if (type === 'execution') return 'Execution';
    return type;
  };

  return (
    <div className="px-2 sm:px-4 dark:bg-boxdark">
      <Breadcrumb pageName="Manage Checklists" />

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-between mb-4 flex-col sm:flex-row gap-4">
        <button
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
            setNewChecklist({ 
              checklist_name: "", 
              status: "active",
              checklist_type: "pre_execution" 
            });
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Checklist
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="border px-4 py-2 rounded pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-3 text-gray-400"
          />
        </div>
      </div>

      <div className="border rounded overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Checklist Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Items</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((c: any, index) => (
                <tr key={c.checklist_id} className="border-t">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium">{c.checklist_name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(c.checklist_type)}`}>
                      {getTypeDisplayName(c.checklist_type)}
                    </span>
                  </td>
                  <td className="p-3">
                    {c.item_count || 0} items
                  </td>
                  <td className="p-3">
                    <span
                      onClick={() => toggleStatus(c.checklist_id, c.status)}
                      className={`px-3 py-1 rounded text-xs cursor-pointer ${
                        c.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      className="bg-gray-600 text-white px-3 py-1 rounded"
                      onClick={() =>
                        navigate(`/execution/checklist-settings/${c.checklist_id}`)
                      }
                    >
                      <FontAwesomeIcon icon={faCog} />
                    </button>
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setEditMode(true);
                        setCurrentId(c.checklist_id);
                        setNewChecklist({
                          checklist_name: c.checklist_name,
                          status: c.status,
                          checklist_type: c.checklist_type || "pre_execution"
                        });
                        setShowModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  No checklists found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="font-semibold mb-4">
              {editMode ? "Edit Checklist" : "Add Checklist"}
            </h3>

            <input
              className="border w-full p-2 mb-4"
              placeholder="Checklist name"
              value={newChecklist.checklist_name}
              onChange={(e) =>
                setNewChecklist({
                  ...newChecklist,
                  checklist_name: e.target.value
                })
              }
            />

            {/* Type Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Checklist Type
              </label>
              <select
                className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newChecklist.checklist_type}
                onChange={(e) =>
                  setNewChecklist({
                    ...newChecklist,
                    checklist_type: e.target.value
                  })
                }
              >
                <option value="pre_execution">Pre Execution</option>
                <option value="execution">Execution</option>
              </select>
              
            </div>

            {/* Status Dropdown (Optional - if you want to allow status change in modal) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newChecklist.status}
                onChange={(e) =>
                  setNewChecklist({
                    ...newChecklist,
                    status: e.target.value
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setCurrentId(null);
                }}
                className="border px-4 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveChecklist}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checklist;
