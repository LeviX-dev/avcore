// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { BASE_URL } from '../../../public/config.js';

// interface FollowupProduct {
//   followup_id: number;
//   client_name: string;
//   client_contact: number;
//   followup_date: string;
//   status: string;
//   next_followup_date: string;
//   remark: string;
// }

// interface PopupFormProps {
//   product: FollowupProduct;
//   onClose: () => void;
//   onUpdate: (updatedProduct: FollowupProduct) => void;
// }

// const PopupForm: React.FC<PopupFormProps> = ({
//   product,
//   onClose,
//   onUpdate,
// }) => {
//   const [formData, setFormData] = useState<FollowupProduct>({
//     ...product,
//     next_followup_date: product.next_followup_date || '',
//     remark: product.remark || '',
//   });

//   const [statuses, setStatuses] = useState<string[]>([]);

//   const formatDateLocal = (dateStr) => {
//     if (!dateStr) return '';
//     const date = new Date(dateStr);
//     const offset = date.getTimezoneOffset();
//     const localDate = new Date(date.getTime() - offset * 60 * 1000);
//     return localDate.toISOString().split('T')[0];
//   };

//   // Fetch enum status values
//   useEffect(() => {
//     const fetchStatuses = async () => {
//       try {
//         const response = await axios.get(`${BASE_URL}api/followup/statuses`);
//         if (response.data.statuses) {
//           setStatuses(response.data.statuses);
//         }
//       } catch (error) {
//         console.error('Error fetching statuses:', error);
//       }
//     };
//     fetchStatuses();
//   }, []);

//   // Update form field values
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Submit updated data to backend
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await axios.put(
//         `${BASE_URL}api/followup/${formData.followup_id}`,
//         formData,
//       );
//       onUpdate(formData);
//       onClose();
//     } catch (error) {
//       console.error('Error updating followup:', error);
//     }
//   };

//   return (
//     <div className="popup-overlay">
//       <div className="popup-content rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6.5">
//         <h2 className="text-lg font-bold mb-4">Edit Followup Product</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4.5">
//             <label className="mb-2.5 block text-black dark:text-white">
//               Client Name:
//               <input
//                 type="text"
//                 name="client_name"
//                 value={formData.client_name}
//                 onChange={handleChange}
//                 className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                 required
//               />
//             </label>
//           </div>

//           <label className="mb-2.5 block text-black dark:text-white">
//             Client Contact:
//             <input
//               type="text"
//               name="client_contact"
//               value={formData.client_contact}
//               onChange={handleChange}
//               className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//               required
//             />
//           </label>

//           <label className="mb-2.5 block text-black dark:text-white">
//             Followup Date:
//             <input
//               type="date"
//               name="followup_date"
//               value={formatDateLocal(formData.followup_date)}
//               onChange={handleChange}
//               className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//               required
//             />
//           </label>

//           <label className="mb-2.5 block text-black dark:text-white">
//             Remark:
//             <input
//               type="text"
//               name="remark"
//               value={formData.remark}
//               onChange={handleChange}
//               className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//             />
//           </label>

//           <label className="mb-2.5 block text-black dark:text-white">
//             Status:
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//               className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//               required
//             >
//               {statuses.map((status) => (
//                 <option key={status} value={status}>
//                   {status.charAt(0).toUpperCase() + status.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </label>

//           <label className="mb-2.5 block text-black dark:text-white">
//             Next Followup Date:
//             <input
//               type="date"
//               name="next_followup_date"
//               value={formatDateLocal(formData.next_followup_date)}
//               onChange={handleChange}
//               className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//             />
//           </label>

//           <div className="flex justify-end gap-2 mt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-500 text-white rounded"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-500 text-white rounded"
//             >
//               Update
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default PopupForm;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';

interface FollowupProduct {
  followup_id: number;
  client_name: string;
  client_contact: number;
  followup_date: string;
  status: string;
  next_followup_date: string;
  remark: string;
}

interface PopupFormProps {
  product: FollowupProduct;
  onClose: () => void;
  onUpdate: (updatedProduct: FollowupProduct) => void;
}

const PopupForm: React.FC<PopupFormProps> = ({
  product,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<FollowupProduct>({
    ...product,
    next_followup_date: product.next_followup_date || '',
    remark: product.remark || '',
  });

  const [statuses, setStatuses] = useState<string[]>([]);
  const [leadStages, setLeadStages] = useState([]);

  const formatDateLocal = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  };

  // Fetch enum status values
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/followup/statuses`);
        if (response.data.statuses) {
          setStatuses(response.data.statuses);
        }
      } catch (error) {
        console.error('Error fetching statuses:', error);
      }
    };
    fetchStatuses();
  }, []);

  // Update form field values
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated data to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `${BASE_URL}api/followup/${formData.followup_id}`,
        formData,
      );
      onUpdate(formData);
      onClose();
    } catch (error) {
      console.error('Error updating followup:', error);
    }
  };

  useEffect(() => {
    const fetchLeadStages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/leadstage`);

        const allowed = [
          'On Hold',
          'Pre Site Visit',
          'Quotation Pending',
          'Quotation Follow-up',
          'Post Site Visit',
          'Demo',
          'Projection List',
          'Drop',
          'Closed Deal',
        ];

        const filtered = response.data.filter((stage) =>
          allowed.includes(stage),
        );

        setLeadStages(filtered);
      } catch (error) {
        console.error('Error fetching lead stages:', error);
      }
    };

    fetchLeadStages();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-2xl mt-20 max-h-[85vh] overflow-y-auto dark:border-strokedark dark:bg-boxdark">
        <div className="flex justify-between items-center border-b-2 mb-4 pb-3 dark:border-strokedark">
          <h2 className="text-xl font-bold dark:text-white">
            Edit Followup Product
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-md font-semibold mb-2 dark:text-white border-b pb-1">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Client Contact *
                </label>
                <input
                  type="text"
                  name="client_contact"
                  value={formData.client_contact}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Followup Details Section */}
          <div>
            <h3 className="text-md font-semibold mb-2 dark:text-white border-b pb-1">
              Followup Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Followup Date *
                </label>
                <input
                  type="date"
                  name="followup_date"
                  value={formatDateLocal(formData.followup_date)}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Status *
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  required
                >
                  <option value="">Select Status</option>

                  {leadStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Next Followup Date
                </label>
                <input
                  type="date"
                  name="next_followup_date"
                  value={formatDateLocal(formData.next_followup_date)}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 text-sm dark:text-white">
                  Remark
                </label>
                <input
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  placeholder="Enter followup remarks"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-strokedark">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupForm;
