// // components/EditUserForm.tsx
// import React, { useState, useEffect } from "react";
// import SelectRoleDepartment from "../../components/Forms/SelectGroup/SelectRoleDepartment";
// import './popform.css';
// import { BASE_URL } from '../../../public/config.js';

// type EditUserFormProps = {
//   user: {
//     user_id: number;
//     name: string;
//     contact: string;
//     email: string;
//     address: string;
//     role: string;
//     status: string;
//   } | null;
//   onClose: () => void;
//   onSave: (updatedUser: any) => void;
// };

// const EditUserForm: React.FC<EditUserFormProps> = ({ user, onClose, onSave }) => {
// // In state initialization and useEffect, include id
// const [formData, setFormData] = useState({
//   user_id: user?.user_id || null, // Ensure id is included
//   name: user?.name || "",
//   email: user?.email || "",
//   contact: user?.contact || "", 
//   address: user?.address || "", 
//   role: user?.role || "",
//   status: user?.status || "active",
// });

// useEffect(() => {
//   if (user) {
//     setFormData({
//       user_id: user.user_id, // Ensure id is set correctly
//       name: user.name,
//       email: user.email,
//       contact: user.contact,
//       address: user.address,
//       role: user.role,
//       status: user.status,
//     });
//   }
// }, [user]);


// const [showReset, setShowReset] = useState(false);
// const [otp, setOtp] = useState('');
// const [newPassword, setNewPassword] = useState('');


// // In handleSubmit
// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   const updatedUser  = { ...formData };
//   console.log("Updated User Data:", updatedUser ); // Log the updated user data

//   try {
//     const response = await fetch(BASE_URL + `api/users/${formData.user_id}`, { // Use formData.id
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(updatedUser ),
//     });

//     if (!response.ok) throw new Error("Failed to update user");

//     const data = await response.json();
//     console.log("User  updated successfully:", data);

//     onSave(updatedUser );
//     onClose();
//   } catch (error) {
//     console.error("Error updating user:", error);
//   }
// };


// useEffect(() => {
//   if (user) setFormData(user);
// }, [user]);

// const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//   const { name, value } = e.target;
//   setFormData((prev) => ({ ...prev, [name]: value }));
// };

// const handleRoleChange = (role: string) => {
//   setFormData({ ...formData, role });
// };

// const handleStatusChange = (status: string) => {
//   setFormData({ ...formData, status });
// };

//   return (
//     <div className="popup-overlay">
//       <div className="popup-content rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6.5">
//         <h2 className="font-medium text-black dark:text-white mb-4 ">Edit User</h2>
//         <form onSubmit={handleSubmit}>
//           {/* Name */}
//           <div className="mb-4.5">
//             <label className="mb-2.5 block text-black dark:text-white">Name</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Enter Name"
//               className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//               required
//             />
//           </div>

//           <div className="flex flex-wrap -mx-2">
//             {/* Contact */}
//             <div className="w-full md:w-1/2 px-2 mb-4">
//               <label className="mb-2.5 block text-black dark:text-white">Contact No.</label>
//               <input
//                 type="text"
//                 name="contact"
//                 value={formData.contact}
//                 onChange={handleChange}
//                 placeholder="Enter Contact Number"
//                 className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                 required
//               />
//             </div>

//             {/* Email */}
//             <div className="w-full md:w-1/2 px-2 mb-4">
//               <label className="mb-2.5 block text-black dark:text-white">Email</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter Email"
//                 className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                 required
//               />
//             </div>
//           </div>

//           {/* Address */}
//           <div className="mb-4.5">
//             <label className="mb-2.5 block text-black dark:text-white">Address</label>
//             <input
//               type="text"
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               placeholder="Enter Address"
//               className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//             />
//           </div>

//           {/* Role and Status Select */}
//           <SelectRoleDepartment
//             selectedRole={formData.role}
//             onRoleChange={handleRoleChange}
//             selectedStatus={formData.status}
//             onStatusChange={handleStatusChange}
//           />


//           <div className="flex justify-end gap-2">
//             <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Update</button>
//             <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditUserForm; 




import React, { useState, useEffect } from "react";
import SelectRoleDepartment from "../../components/Forms/SelectGroup/SelectRoleDepartment";
import './popform.css';
import { BASE_URL } from '../../../public/config.js';

type EditUserFormProps = {
  user: {
    user_id: number;
    name: string;
    contact: string;
    email: string;
    address: string;
    role: string;
    status: string;
  } | null;
  onClose: () => void;
  onSave: (updatedUser: any) => void;
};

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onClose, onSave }) => {

const [formData, setFormData] = useState({
  user_id: user?.user_id || null,
  name: user?.name || "",
  email: user?.email || "",
  contact: user?.contact || "",
  address: user?.address || "",
  role: user?.role || "",
  status: user?.status || "active",
  reset_password: ""
});

useEffect(() => {
  if (user) {
    setFormData({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      contact: user.contact,
      address: user.address,
      role: user.role,
      status: user.status,
      reset_password: ""
    });
  }
}, [user]);

const handleSubmit = async (e: React.FormEvent) => {

  e.preventDefault();

  const updatedUser = { ...formData };

  try {

    const response = await fetch(BASE_URL + `api/users/${formData.user_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    if (!response.ok) throw new Error("Failed to update user");

    const data = await response.json();

    console.log("User updated successfully:", data);

    onSave(updatedUser);

    onClose();

  } catch (error) {

    console.error("Error updating user:", error);

  }

};

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value
  }));

};

const handleRoleChange = (role: string) => {
  setFormData({ ...formData, role });
};

const handleStatusChange = (status: string) => {
  setFormData({ ...formData, status });
};

  return (
    <div className="popup-overlay">

      <div className="popup-content rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6.5">

        <h2 className="font-medium text-black dark:text-white mb-4">
          Edit User
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none"
              required
            />
          </div>

          <div className="flex flex-wrap -mx-2">

            {/* Contact */}
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label className="mb-2.5 block text-black dark:text-white">Contact No.</label>

              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Enter Contact Number"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none"
                required
              />
            </div>

            {/* Email */}
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label className="mb-2.5 block text-black dark:text-white">Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none"
                required
              />
            </div>

          </div>

          {/* Address */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">Address</label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Address"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none"
            />
          </div>

          {/* Reset Password */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Reset Password(Optional)
            </label>

            <input
              type="password"
              name="reset_password"
              value={formData.reset_password}
              onChange={handleChange}
              placeholder="Enter new password if you want to reset"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none"
            />
          </div>

          {/* Role and Status */}
          <SelectRoleDepartment
            selectedRole={formData.role}
            onRoleChange={handleRoleChange}
            selectedStatus={formData.status}
            onStatusChange={handleStatusChange}
          />

          <div className="flex justify-end gap-2">

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Update
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditUserForm;


