// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Plus, RotateCcw, FileText } from 'lucide-react';
// import { BASE_URL } from '../../../public/config.js';

// const UserAssets = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Assign Modal
//   const [showModal, setShowModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [availableAssets, setAvailableAssets] = useState([]);

//   const [formData, setFormData] = useState({
//     asset_id: '',
//     remark: ''
//   });

//   // Return Modal
//   const [showReturnModal, setShowReturnModal] = useState(false);
//   const [assignedAsset, setAssignedAsset] = useState(null);
//   const [returnDate, setReturnDate] = useState('');
//   const [returnRemark, setReturnRemark] = useState('');
//   const [showLogsModal, setShowLogsModal] = useState(false);
//   const [assetHistory, setAssetHistory] = useState([]);

//   // ✅ Fetch Users
//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${BASE_URL}api/users`);
//       setUsers(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // ✅ ASSIGN CLICK
//   const handleAddClick = async (user) => {
//     if (user.has_asset === 1) {
//       return alert("User already has asset");
//     }

//     try {
//       const res = await axios.get(`${BASE_URL}api/assets/status-grouped`);
//       const available = res.data?.data?.available || [];

//       setAvailableAssets(available);
//       setSelectedUser(user);
//       setShowModal(true);

//     } catch (err) {
//       alert("Failed to fetch assets");
//     }
//   };

//   // ✅ RETURN CLICK
//   const handleReturnClick = async (user) => {
//     try {
//       const res = await axios.get(
//         `${BASE_URL}api/user-assigned-asset/${user.user_id}`
//       );

//       setAssignedAsset(res.data.data);
//       setSelectedUser(user);
//       setShowReturnModal(true);

//     } catch (err) {
//       alert(err.response?.data?.message || "No asset found");
//     }
//   };

//   // ✅ HANDLE INPUT
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // ✅ ASSIGN SUBMIT
//   const handleAssign = async () => {
//     if (!formData.asset_id) {
//       return alert("Select asset");
//     }

//     try {
//       const res = await axios.post(`${BASE_URL}api/assets/assignAsset`, {
//         user_id: selectedUser.user_id,
//         asset_id: formData.asset_id,
//         remark: formData.remark
//       });

//       if (res.data.success) {
//         alert("Asset assigned");

//         setShowModal(false);
//         setFormData({ asset_id: '', remark: '' });
//         fetchUsers();
//       }

//     } catch (err) {
//       alert(err.response?.data?.message || "Error");
//     }
//   };

//   // ✅ RETURN SUBMIT
//   const handleReturnSubmit = async () => {
//     if (!returnDate) {
//       return alert("Select return date");
//     }

//     try {
//       const res = await axios.post(`${BASE_URL}api/return-asset`, {
//         user_id: selectedUser.user_id,
//         return_date: returnDate,
//         remark: returnRemark
//       });

//       if (res.data.success) {
//         alert("Asset returned");

//         setShowReturnModal(false);
//         setReturnDate('');
//         setReturnRemark('');
//         fetchUsers();
//       }

//     } catch (err) {
//       alert(err.response?.data?.message || "Error");
//     }
//   };

//   const handleLogsClick = async (user) => {
//   try {
//     const res = await axios.get(
//       `${BASE_URL}api/user-asset-history/${user.user_id}`
//     );

//     setAssetHistory(res.data.data || []);
//     setSelectedUser(user);
//     setShowLogsModal(true);

//   } catch (err) {
//     alert("Failed to fetch logs");
//   }
// };

// const formatDate = (date) => {
//   if (!date) return "-";
//   return new Date(date).toLocaleDateString();
// };
//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-semibold mb-4">User Asset Management</h1>

//       <div className="bg-white rounded-xl shadow">
//         {loading ? (
//           <p className="p-4">Loading...</p>
//         ) : (
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100 text-xs uppercase">
//               <tr>
//                 <th className="p-3">ID</th>
//                 <th>Name</th>
//                 <th>Contact</th>
//                 <th>Email</th>
//                 <th>Role</th>
//                 <th>Asset</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {users.map((user) => (
//                 <tr key={user.user_id} className="border-b">
//                   <td className="p-3">{user.user_id}</td>
//                   <td>{user.name}</td>
//                   <td>{user.contact_no}</td>
//                   <td>{user.email}</td>
//                   <td>{user.role_label}</td>

//                   <td>
//                     <span className={`px-2 py-1 rounded text-xs ${
//                       user.has_asset
//                         ? 'bg-green-100 text-green-600'
//                         : 'bg-gray-100 text-gray-500'
//                     }`}>
//                       {user.has_asset ? 'Assigned' : 'Not Assigned'}
//                     </span>
//                   </td>

//                   <td className="flex gap-2 p-2">

//                     {/* ASSIGN */}
//                     <button
//                       onClick={() => handleAddClick(user)}
//                       disabled={user.has_asset === 1}
//                       className="p-2 bg-blue-100 rounded disabled:opacity-50"
//                     >
//                       <Plus size={16} />
//                     </button>

//                     {/* RETURN */}
//                     <button
//                       onClick={() => handleReturnClick(user)}
//                       disabled={user.has_asset === 0}
//                       className="p-2 bg-yellow-100 rounded disabled:opacity-50"
//                     >
//                       <RotateCcw size={16} />
//                     </button>

//                   <button
//   className="p-2 bg-purple-100 rounded"
//   onClick={() => handleLogsClick(user)}
// >
//   <FileText size={16} />
// </button>

//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* ✅ ASSIGN MODAL */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
//           <div className="bg-white p-5 rounded-xl w-[350px]">

//             <h2 className="font-semibold mb-3">
//               Assign Asset → {selectedUser?.name}
//             </h2>

//             <select
//               name="asset_id"
//               value={formData.asset_id}
//               onChange={handleChange}
//               className="w-full border p-2 mb-3"
//             >
//               <option value="">Select Asset</option>
//               {availableAssets.map((a) => (
//                 <option key={a.asset_id} value={a.asset_id}>
//                   {a.asset_name} ({a.serial_no})
//                 </option>
//               ))}
//             </select>

//             <textarea
//               name="remark"
//               placeholder="Remark"
//               value={formData.remark}
//               onChange={handleChange}
//               className="w-full border p-2 mb-3"
//             />

//             <div className="flex justify-end gap-2">
//               <button onClick={() => setShowModal(false)}>Cancel</button>
//               <button
//                 onClick={handleAssign}
//                 className="bg-blue-600 text-white px-3 py-1 rounded"
//               >
//                 Assign
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//       {/* ✅ RETURN MODAL */}
//       {showReturnModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
//           <div className="bg-white p-5 rounded-xl w-[400px]">

//             <h2 className="font-semibold mb-3">
//               Return Asset → {selectedUser?.name}
//             </h2>

//             <p><strong>Asset:</strong> {assignedAsset?.asset_name}</p>
//             <p><strong>Serial:</strong> {assignedAsset?.serial_no}</p>
//             <p className="mb-2">
//               <strong>Assigned:</strong> {assignedAsset?.assigned_date}
//             </p>

//             <input
//               type="date"
//               value={returnDate}
//               onChange={(e) => setReturnDate(e.target.value)}
//               className="w-full border p-2 mb-3"
//             />

//             <textarea
//               placeholder="Remark"
//               value={returnRemark}
//               onChange={(e) => setReturnRemark(e.target.value)}
//               className="w-full border p-2 mb-3"
//             />

//             <div className="flex justify-end gap-2">
//               <button onClick={() => setShowReturnModal(false)}>Cancel</button>
//               <button
//                 onClick={handleReturnSubmit}
//                 className="bg-yellow-600 text-white px-3 py-1 rounded"
//               >
//                 Submit
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//       {/* ✅ LOGS MODAL */}
// {/* ✅ LOGS MODAL */}
// {showLogsModal && (
//   <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
//     <div className="bg-white p-5 rounded-xl w-[900px] max-h-[80vh] overflow-y-auto">

//       <h2 className="font-semibold mb-4 text-lg">
//         Asset History → {selectedUser?.name}
//       </h2>

//       {assetHistory.length === 0 ? (
//         <p className="text-center py-4">No history found</p>
//       ) : (
//         <table className="w-full text-sm border">

//           {/* ✅ TABLE HEADER */}
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2">Asset</th>
//               <th>Type</th>
//               <th>Device Type</th>
//               <th>Serial</th>
//               <th>Assigned Date</th>
//               <th>Returned Date</th>

//               <th>Remark</th>
//             </tr>
//           </thead>

//           {/* ✅ TABLE BODY */}
//           <tbody>
//             {assetHistory.map((item) => {

//               // ✅ TYPE LOGIC
//               const type = item.returned_date ? "Returned" : "Assigned";

//               return (
//                 <tr key={item.assignment_id} className="border-t text-center">

//                   <td className="p-2">{item.asset_name}</td>

//                   {/* TYPE */}
//                   <td>
//                     <span className={`px-2 py-1 rounded text-xs ${
//                       type === 'Assigned'
//                         ? 'bg-green-100 text-green-600'
//                         : 'bg-yellow-100 text-yellow-600'
//                     }`}>
//                       {type}
//                     </span>
//                   </td>

//                   {/* DEVICE TYPE */}
//                   <td>{item.asset_type}</td>

//                   {/* SERIAL */}
//                   <td>{item.serial_no}</td>

//                   {/* ASSIGNED DATE */}
//                   <td>{formatDate(item.assigned_date)}</td>

//                   {/* RETURNED DATE */}
//                   <td>{formatDate(item.returned_date)}</td>

//                   {/* REMARK */}
//                   <td>{item.remark || "-"}</td>

//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       )}

//       {/* ✅ CLOSE BUTTON */}
//       <div className="flex justify-end mt-4">
//         <button
//           onClick={() => setShowLogsModal(false)}
//           className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//         >
//           Close
//         </button>
//       </div>

//     </div>
//   </div>
// )}
//     </div>
//   );
// };

// export default UserAssets;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Plus,
  RotateCcw,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  Mail,
  Phone,
  UserCircle,
  History,
  Search,
  Filter,
} from 'lucide-react';
import { BASE_URL } from '../../../public/config.js';

const UserAssets = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Assign Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableAssets, setAvailableAssets] = useState([]);

  const [formData, setFormData] = useState({
    asset_id: '',
    remark: '',
  });

  // Return Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [assignedAsset, setAssignedAsset] = useState(null);
  const [returnDate, setReturnDate] = useState('');
  const [returnRemark, setReturnRemark] = useState('');
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [assetHistory, setAssetHistory] = useState([]);

  // Alert Modal
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}api/users`);
      setUsers(res.data);
    } catch (err) {
      showAlertMessage('Failed to fetch users', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ASSIGN CLICK
  const handleAddClick = async (user) => {
    if (user.has_asset === 1) {
      showAlertMessage('User already has an asset assigned', 'warning');
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}api/assets/status-grouped`);
      const available = res.data?.data?.available || [];

      if (available.length === 0) {
        showAlertMessage('No available assets to assign', 'error');
        return;
      }

      setAvailableAssets(available);
      setSelectedUser(user);
      setShowModal(true);
    } catch (err) {
      showAlertMessage('Failed to fetch available assets', 'error');
    }
  };

  // RETURN CLICK
  //   const handleReturnClick = async (user) => {
  //     if (user.has_asset === 0) {
  //       showAlertMessage("This user doesn't have any asset to return", "warning");
  //       return;
  //     }

  //     try {
  //       const res = await axios.get(
  //         `${BASE_URL}api/user-assigned-asset/${user.user_id}`
  //       );

  //       if (!res.data.data) {
  //         showAlertMessage("No asset found for this user", "error");
  //         return;
  //       }

  //       setAssignedAsset(res.data.data);
  //       setSelectedUser(user);
  //       setShowReturnModal(true);

  //     } catch (err) {
  //       showAlertMessage(err.response?.data?.message || "No asset found for this user", "error");
  //     }
  //   };

  const handleReturnClick = async (user) => {
    try {
      const res = await axios.get(
        `${BASE_URL}api/user-assigned-asset/${user.user_id}`,
      );

      if (!res.data?.data) {
        showAlertMessage('No active asset assigned to this user', 'warning');
        return;
      }

      setAssignedAsset(res.data.data);
      setSelectedUser(user);
      setShowReturnModal(true);
    } catch (err) {
      showAlertMessage(
        err.response?.data?.message || 'No asset available for return',
        'warning',
      );
    }
  };

  // Show Alert Message
  const showAlertMessage = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ASSIGN SUBMIT
  const handleAssign = async () => {
    if (!formData.asset_id) {
      showAlertMessage('Please select an asset to assign', 'warning');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}api/assets/assignAsset`, {
        user_id: selectedUser.user_id,
        asset_id: formData.asset_id,
        remark: formData.remark,
      });

      if (res.data.success) {
        showAlertMessage('Asset assigned successfully', 'success');
        setShowModal(false);
        setFormData({ asset_id: '', remark: '' });
        fetchUsers();
      }
    } catch (err) {
      showAlertMessage(
        err.response?.data?.message || 'Failed to assign asset',
        'error',
      );
    }
  };

  // RETURN SUBMIT
  const handleReturnSubmit = async () => {
    if (!returnDate) {
      showAlertMessage('Please select a return date', 'warning');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}api/return-asset`, {
        user_id: selectedUser.user_id,
        return_date: returnDate,
        remark: returnRemark,
      });

      if (res.data.success) {
        showAlertMessage('Asset returned successfully', 'success');
        setShowReturnModal(false);
        setReturnDate('');
        setReturnRemark('');
        fetchUsers();
      }
    } catch (err) {
      showAlertMessage(
        err.response?.data?.message || 'Failed to return asset',
        'error',
      );
    }
  };

  const handleLogsClick = async (user) => {
    try {
      const res = await axios.get(
        `${BASE_URL}api/user-asset-history/${user.user_id}`,
      );
      setAssetHistory(res.data.data || []);
      setSelectedUser(user);
      setShowLogsModal(true);
    } catch (err) {
      showAlertMessage('Failed to fetch asset history', 'error');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.contact_no?.includes(searchTerm),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                User Asset Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage asset assignments, returns, and track history
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {users.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">With Assets</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {users.filter((u) => u.has_asset === 1).length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Without Assets
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {users.filter((u) => u.has_asset === 0).length}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div> */}

   
        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {/* <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
  Asset
</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.user_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* <td className="px-6 py-4 text-sm text-gray-600">
                        #{user.user_id}
                      </td> */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <UserCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {user.contact_no}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {user.role_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
  <span
    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      user.has_asset
        ? 'bg-green-100 text-green-700'
        : 'bg-gray-100 text-gray-500'
    }`}
  >
    {user.has_asset ? 'Assigned' : 'Not Assigned'}
  </span>
</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleAddClick(user)}
                            disabled={user.has_asset === 1}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              user.has_asset === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105'
                            }`}
                            title="Assign Asset"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => handleReturnClick(user)}
                            disabled={user.has_asset === 0}
                            className={`p-2 rounded-lg transition ${
                              user.has_asset === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:scale-105'
                            }`}
                            title={
                              user.has_asset === 0
                                ? 'No asset to return'
                                : 'Return Asset'
                            }
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-105 transition-all duration-200"
                            onClick={() => handleLogsClick(user)}
                            title="View History"
                          >
                            <History size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Alert Popup */}
   {showAlert && (
  <div className="fixed top-20 right-6 z-[9999] animate-in slide-in-from-top-2 fade-in duration-300">
    
    <div
      className={`rounded-xl shadow-xl p-4 min-w-[320px] flex items-start gap-3 backdrop-blur-sm ${
        alertType === 'success'
          ? 'bg-green-50 border-l-4 border-green-500'
          : alertType === 'warning'
          ? 'bg-yellow-50 border-l-4 border-yellow-500'
          : 'bg-red-50 border-l-4 border-red-500'
      }`}
    >
      
      {/* ICON */}
      <div className="flex-shrink-0">
        {alertType === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : alertType === 'warning' ? (
          <AlertCircle className="w-5 h-5 text-yellow-600" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600" />
        )}
      </div>

      {/* MESSAGE */}
      <p
        className={`text-sm flex-1 font-medium ${
          alertType === 'success'
            ? 'text-green-800'
            : alertType === 'warning'
            ? 'text-yellow-800'
            : 'text-red-800'
        }`}
      >
        {alertMessage}
      </p>

      {/* CLOSE */}
      <button
        onClick={() => setShowAlert(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

    </div>
  </div>
)}

      {/* Enhanced ASSIGN MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Assign Asset
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Assigning to:</p>
                <p className="text-base font-semibold text-gray-800">
                  {selectedUser?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedUser?.email}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Asset *
                  </label>
                  <select
                    name="asset_id"
                    value={formData.asset_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose an asset...</option>
                    {availableAssets.map((a) => (
                      <option key={a.asset_id} value={a.asset_id}>
                        {a.asset_name} ({a.serial_no})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remark (Optional)
                  </label>
                  <textarea
                    name="remark"
                    placeholder="Add notes about this assignment..."
                    value={formData.remark}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Assign Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced RETURN MODAL */}
      {showReturnModal && assignedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl animate-in fade-in zoom-in-95">
            {/* HEADER */}
            <div className="flex justify-between items-center border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-lg font-semibold">Return Asset</h2>
              </div>

              <button
                onClick={() => setShowReturnModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 grid grid-cols-2 gap-6">
              {/* LEFT SIDE → USER + ASSET */}
              <div className="space-y-4">
                {/* USER INFO */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">User</p>
                  <p className="font-semibold">{selectedUser?.name}</p>
                  <p className="text-xs text-gray-500">{selectedUser?.email}</p>
                </div>

                {/* ASSET INFO */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-2">
                    Asset Info
                  </p>

                  <p className="font-semibold text-gray-800">
                    {assignedAsset?.asset_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    Serial: {assignedAsset?.serial_no}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Assigned: {formatDate(assignedAsset?.assigned_date)}
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE → FORM */}
              <div className="space-y-4">
                {/* RETURN DATE */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Return Date *
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* REMARK */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Remark
                  </label>
                  <textarea
                    value={returnRemark}
                    onChange={(e) => setReturnRemark(e.target.value)}
                    placeholder="Condition / notes..."
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleReturnSubmit}
                className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Return Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced LOGS MODAL */}
     {showLogsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
    
    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[60vh] flex flex-col shadow-xl">

      {/* HEADER */}
      <div className="px-5 py-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <History className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Asset History
            </h2>
            <p className="text-xs text-gray-500">
              {selectedUser?.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowLogsModal(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-auto px-4 py-3">

        {assetHistory.length === 0 ? (
          <div className="text-center py-10">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No asset history found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              {/* HEADER */}
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Asset</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Assigned</th>
                  <th className="px-3 py-2 text-left">Returned</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Remark</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody className="divide-y">
                {assetHistory.map((item) => {
                  const isReturned = !!item.returned_date;

                  return (
                    <tr key={item.assignment_id} className="hover:bg-gray-50">

                      <td className="px-3 py-2 font-medium text-gray-800">
                        {item.asset_name}
                      </td>

                      <td className="px-3 py-2 text-gray-600">
                        {item.asset_type || '-'}
                      </td>

                      <td className="px-3 py-2 text-gray-600">
                        {formatDate(item.assigned_date)}
                      </td>

                      <td className="px-3 py-2 text-gray-600">
                        {formatDate(item.returned_date)}
                      </td>

                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            isReturned
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {isReturned ? 'Returned' : 'Assigned'}
                        </span>
                      </td>

                      <td
                        className="px-3 py-2 text-gray-600 max-w-[180px] truncate"
                        title={item.remark || '-'}
                      >
                        {item.remark || '-'}
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="px-4 py-3 border-t flex justify-end">
        <button
          onClick={() => setShowLogsModal(false)}
          className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default UserAssets;
