import React from 'react';

interface SelectRoleDepartmentProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const SelectRoleDepartment: React.FC<SelectRoleDepartmentProps> = ({
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
}) => {
  const isRoleSelected = selectedRole !== '';
  const isStatusSelected = selectedStatus !== '';

  return (
    <div className="flex mb-4.5 space-x-4 w-full">
      {/* Role dropdown */}


<div className="w-1/2">
  <label className="mb-2.5 block text-black dark:text-white">
    Select Role
  </label>

  <div className="relative z-20 bg-transparent dark:bg-form-input">
    
<select
  value={selectedRole}
  onChange={(e) => onRoleChange(e.target.value)}
  required
  className="relative z-20 w-full appearance-none rounded border py-3 px-5"
>
  <option value="" disabled>Select Role</option>

  <option value="admin">Director (Super Admin)</option>
  <option value="sub_admin">Business Head (Sub Admin)</option>

  <option value="digital_marketing">Digital Marketing</option>
  <option value="tele_caller">Tele Caller</option>
  <option value="field_marketing_executive">Field Marketing Executive</option>
  <option value="junior_autocad_designer">Junior AutoCAD Designer</option>
  <option value="senior_autocad_designer">Senior AutoCAD Designer</option>
  <option value="tech_sale_sound_engineer">Tech-sale Sound Engineer</option>
  <option value="technical_head">Technical Head</option>
  <option value="project_manager">Project Manager</option>

  {/* ✅ Newly Added Roles */}
  <option value="av_engineer">AV Engineer</option>
  <option value="acoustic_engineer">Acoustic Engineer</option>
  <option value="acoustic_designer">Acoustic Designer</option>
  <option value="hr_executive">HR Executive</option>  {/* ✅ Added */}
</select>

    <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
      {/* SVG Icon */}
    </span>
  </div>
</div>




      {/* Status dropdown */}
      <div className="w-1/2">
        <label className="mb-2.5 block text-black dark:text-white">Select Status</label>

        <div className="relative z-20 bg-transparent dark:bg-form-input">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            required
            className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
              isStatusSelected ? 'text-black dark:text-white' : ''
            }`}
          >
            <option value="" disabled className="text-body dark:text-bodydark">
              Select Status
            </option>
            <option value="active" className="text-body dark:text-bodydark">
              Active
            </option>
            <option value="inactive" className="text-body dark:text-bodydark">
              Inactive
            </option>
          </select>

          <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
            {/* SVG Icon */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SelectRoleDepartment;












// import React, { useState } from 'react';



// const SelectRoleDepartment: React.FC = () => {
//   const [selectedRole, setSelectedRole] = useState<string>('');
//   const [selectedStatus, setSelectedStatus] = useState<string>('');
//   const [isRoleSelected, setIsRoleSelected] = useState<boolean>(false);
//   const [isStatusSelected, setIsStatusSelected] = useState<boolean>(false);

  
//   const changeRoleTextColor = () => {
//     setIsRoleSelected(true);
//   };

//   const changeStatusTextColor = () => {
//     setIsStatusSelected(true);
//   };

//   return (
//     <div className="flex mb-4.5 space-x-4 w-full">
//       {/* Role dropdown */}
//       <div className="w-1/2">
//         <label className="mb-2.5 block text-black dark:text-white">Select Role</label>

//         <div className="relative z-20 bg-transparent dark:bg-form-input">
//           <select
//             value={selectedRole}
//             onChange={(e) => {
//               setSelectedRole(e.target.value);
//               changeRoleTextColor();
//             }}
//             required
//             className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
//               isRoleSelected ? 'text-black dark:text-white' : ''
//             }`}
//           >
//             <option value="" disabled className="text-body dark:text-bodydark">
//               Select Role
//             </option>
//             <option value="admin" className="text-body dark:text-bodydark">
//               Admin
//             </option>
//             <option value="project manager" className="text-body dark:text-bodydark">
//               Project Manager
//             </option>
//             <option value="team lead" className="text-body dark:text-bodydark">
//               Team Lead
//             </option>
//             <option value="designer" className="text-body dark:text-bodydark">
//               Designer
//             </option>
//           </select>

//           <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
//             {/* SVG Icon */}
//           </span>
//         </div>
//       </div>

//       {/* Status dropdown */}
//       <div className="w-1/2">
//         <label className="mb-2.5 block text-black dark:text-white">Select Status</label>

//         <div className="relative z-20 bg-transparent dark:bg-form-input">
//           <select
//             value={selectedStatus}
//             onChange={(e) => {
//               setSelectedStatus(e.target.value);
//               changeStatusTextColor();
//             }}
//             required
//             className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
//               isStatusSelected ? 'text-black dark:text-white' : ''
//             }`}
//           >
//             <option value="" disabled className="text-body dark:text-bodydark">
//               Select Status
//             </option>
//             <option value="active" className="text-body dark:text-bodydark">
//               Active
//             </option>
//             <option value="inactive" className="text-body dark:text-bodydark">
//               Inactive
//             </option>
//           </select>

//           <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
//             {/* SVG Icon */}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SelectRoleDepartment;
