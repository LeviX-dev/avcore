import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import EditUserForm from "./EditUserForm";
import { BASE_URL } from '../../../public/config.js';

const User_list = () => {
  type User = {
    user_id: number;
    name: string;
    contact: string;
    email: string;
    address: string;
    role: string;
    status: string;
    role_label: string;
  };

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(BASE_URL + "api/users");
        const data = await response.json();

        const formattedData = data.map((user: any) => ({
          user_id: user.user_id,
          name: user.name,
          role: user.role,
          email: user.email,
          address: user.address,
          contact: user.contact_no,
          status: user.status,
          role_label: user.role_label,
        }));

        setUsers(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = () => {
    const filtered = users.filter((user) =>
      Object.values(user).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const openEditPopup = (user: User) => {
    setCurrentEditUser(user);
    setIsEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setIsEditPopupOpen(false);
    setCurrentEditUser(null);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const payload = {
        ...updatedUser,
        contact_no: updatedUser.contact,
      };

      await fetch(BASE_URL + `api/users/${updatedUser.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setUsers(prev =>
        prev.map(u => u.user_id === updatedUser.user_id ? updatedUser : u)
      );
      setFilteredData(prev =>
        prev.map(u => u.user_id === updatedUser.user_id ? updatedUser : u)
      );

      closeEditPopup();
      alert("User updated successfully!");
    } catch {
      alert("Failed to update user");
    }
  };

  const handleDelete = async (user_id: number) => {
    if (!window.confirm("Are you sure?")) return;

    await fetch(BASE_URL + `api/users/${user_id}`, { method: "DELETE" });

    const updated = users.filter(u => u.user_id !== user_id);
    setUsers(updated);
    setFilteredData(updated);
  };

  return (
    <div>
      {/* 🔹 MOBILE RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 768px) {
          .user-table-wrapper {
            overflow-x: auto;
          }

          table {
            min-width: 700px;
          }

          .search-bar {
            flex-direction: column;
            gap: 10px;
          }

          .search-bar input,
          .search-bar button {
            width: 100%;
          }
        }
      `}</style>

      <Breadcrumb pageName="User List" />

      {/* Search */}
      <div className="flex items-center mb-5 mt-8 search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 mr-2 w-full md:w-auto"
          placeholder="Search users..."
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="max-w-full user-table-wrapper rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left dark:bg-meta-4">
              <th className="py-4 px-4">Name</th>
              <th className="py-4 px-4">Role</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Contact</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length ? (
              filteredData.map((user) => (
                <tr key={user.user_id}>
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.role_label}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.contact}</td>
                 <td className="py-3 px-4">
  <span
    className={`rounded-full px-3 py-1 text-sm text-white ${
      user.status === "active"
        ? "bg-success"
        : "bg-danger"
    }`}
  >
    {user.status}
  </span>
</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditPopup(user)}
                        className="bg-meta-3 px-3 py-1 rounded text-white"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="bg-black px-3 py-1 rounded text-white"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditPopupOpen && currentEditUser && (
        <EditUserForm
          user={currentEditUser}
          onClose={closeEditPopup}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default User_list;