import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';

interface Category {
  cat_id: number;
  cat_name: string;
}

interface Reference {
  reference_id: number;
  reference_name: string;
}

interface Area {
  area_id: number;
  area_name: string;
}

interface Client {
  assign_id: any;
  id: number;
  master_id: number;
  name: string;
  number: string; // WhatsApp Number
  alternate_number?: string; // Alternate No.
  email: string;
  address: string;
  area: string;
  area_id: string;
  status: string;
  cat_name: string;
  cat_id: number;
  reference_name: string;
  reference_id: number;
  reference?: string | number;
  city?: string;
  original_city?: string;
  original_area?: string;
  location_link?: string;
  room_length: string;
  room_width: string;
  room_height: string;
  p_type?: string;
  budget_range?: string;
  current_stage?: string;
  time_to_complete?: string;
  site_visit_date?: string;
  demo_date?: string;
  ar_number?: string; // Architect Number
  architect_name?: string; // Architect Name
  ca_number?: string;
  e_number?: string;
  sm_number?: string;
  pop_number?: string;
  other_number?: string;
  lead_stage?: string;
  quick_remark?: string;
  detailed_remark?: string;
  followup_date?: string;
    followup_time?: string;  // ✅ ADD THIS - Time field
  assign_date?: string; // Entry Date (read-only)
  assigned_to: string[];
  reassignment_date?: string;
  category_other?: string;
  reference_other?: string;
  reassignment_remarks?: ReassignmentRemark[];

}

interface ReassignmentRemark {
  assignedTo?: string;
  leadStage?: string;
  reassignment_date?: string;
  remark?: string;
  created_by_user?: number;
  created_at?: string;
  name?: string;
  role?: string;
}

interface UpdateDataModalProps {
  showEditPopup: boolean;
  editingClient: Client | null;
  setEditingClient: React.Dispatch<React.SetStateAction<Client | null>>;
  closeEditPopup: () => void;
  fetchRawData: () => void;
  categories: Category[];
  references: Reference[];
  area: Area[];
}
// Follow-up time is restricted to business hours: 10:00 AM – 7:00 PM
const FOLLOWUP_TIME_START_HOUR = 10; // 10 AM
const FOLLOWUP_TIME_END_HOUR = 19; // 7 PM (24-hr)

const FOLLOWUP_HOUR_OPTIONS = Array.from(
  { length: FOLLOWUP_TIME_END_HOUR - FOLLOWUP_TIME_START_HOUR + 1 },
  (_, i) => {
    const hour = FOLLOWUP_TIME_START_HOUR + i;
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return { value: hour.toString().padStart(2, '0'), label: `${hour12} ${period}` };
  },
);

const FOLLOWUP_MINUTE_OPTIONS_FULL = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, '0'),
);

const getFollowupHourMinute = (time?: string): { hour: string; minute: string } => {
  if (!time) return { hour: '', minute: '' };
  const [h, m] = time.slice(0, 5).split(':');
  return { hour: h || '', minute: m || '' };
};
const UpdateRawData: React.FC<UpdateDataModalProps> = ({
  showEditPopup,
  editingClient,
  setEditingClient,
  closeEditPopup,
  fetchRawData,
  categories,
  references,
  area,
}) => {
  React.useEffect(() => {
    if (showEditPopup) {
      // console.log('🔍 UPDATE RAW DATA DEBUG:');
    }
  }, [showEditPopup, editingClient, categories, references, area]);

  const [leadStages, setLeadStages] = useState([]);
  const [quickRemarks, setQuickRemarks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [allowedRoles, setAllowedRoles] = useState([]);

  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' = 'success',
    duration = 9000,
  ) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, duration);
  };

const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '—';
  
  // Debug log to see what's coming from API
  console.log('formatDateTime received:', dateString, 'type:', typeof dateString);
  
  try {
    // If the string is already in DD/MM/YYYY format, return as-is
    if (typeof dateString === 'string' && dateString.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return dateString;
  }
};

  // Fetch users with role-based filtering
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/users/by-role`, {
          withCredentials: true,
        });

        console.log('API Response:', response.data);

        if (response.data.success) {
          // Extract users array from the response
          const usersData = response.data.users || [];
          setUsers(usersData);
          setFilteredUsers(usersData);
          setCurrentUserRole(response.data.currentUserRole);
          setAllowedRoles(response.data.allowedRoles || []);
        } else {
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsers([]);
        setFilteredUsers([]);

        // Show error toast
        showToast('Failed to load users', 'error');
      }
    };

    if (showEditPopup) {
      fetchUsers();
    }
  }, [showEditPopup]);

  useEffect(() => {
    if (!showEditPopup || !editingClient) return;

    // ❌ DO NOT PREFILL ASSIGNED USERS
    // Always reset on popup open

    setEditingClient((prev) =>
      prev
        ? {
            ...prev,
            assigned_to: [], // 🔥 EMPTY by default
          }
        : prev,
    );
  }, [showEditPopup]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          (user.role && user.role.toLowerCase().includes(term)) ||
          (user.role_label && user.role_label.toLowerCase().includes(term)),
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleUpdateClient = async (editingClient: Client) => {
    try {
      // 🔥 ADD VALIDATION: Check if at least one user is selected
      if (
        !Array.isArray(editingClient.assigned_to) ||
        editingClient.assigned_to.length === 0
      ) {
        showToast(
          '⚠️ Please select at least one user to reassign.',
          'warning',
          3000,
        );
        return { success: false, message: 'No user selected' };
      }

      // Prepare the data to send
      const updateData: any = {
        name: editingClient.name,
        email: editingClient.email,
        number: editingClient.number,
        alternate_number: editingClient.alternate_number,
        address: editingClient.address,
        cat_id: editingClient.cat_id,
        reference_id: editingClient.reference_id || editingClient.reference,
        area_id: editingClient.area_id,
        // 🔥 MODIFIED: Send the appropriate value based on what's being shown
        city: editingClient.city,
        location_link: editingClient.location_link,
        room_length: editingClient.room_length,
        room_width: editingClient.room_width,
        room_height: editingClient.room_height,
        p_type: editingClient.p_type,
        budget_range: editingClient.budget_range,
        current_stage: editingClient.current_stage,
        time_to_complete: editingClient.time_to_complete,
        site_visit_date: editingClient.site_visit_date,
        demo_date: editingClient.demo_date,
        ar_number: editingClient.ar_number,
        architect_name: editingClient.architect_name,
        ca_number: editingClient.ca_number,
        e_number: editingClient.e_number,
        sm_number: editingClient.sm_number,
        pop_number: editingClient.pop_number,
        other_number: editingClient.other_number,
        lead_stage: editingClient.lead_stage,
        quick_remark: editingClient.quick_remark,
        detailed_remark: editingClient.detailed_remark,
        followup_date: editingClient.followup_date,
          followup_time: editingClient.followup_time,  // ✅ ADD THIS LINE
        assign_id: editingClient.assign_id,
        category_other: editingClient.category_other,
        reference_other: editingClient.reference_other,
      };

      // Auto-copy quick_remark to detailed_remark if quick_remark is selected and detailed_remark is empty
      if (editingClient.quick_remark && !editingClient.detailed_remark) {
        updateData.detailed_remark = editingClient.quick_remark;
      }

      // If assigned_to is provided and not empty, include it for reassignment
      if (
        Array.isArray(editingClient.assigned_to) &&
        editingClient.assigned_to.length > 0
      ) {
        updateData.assignedTo = editingClient.assigned_to;

        // Also include leadStage for reassignment if provided
        if (editingClient.lead_stage) {
          updateData.leadStage = editingClient.lead_stage;
        }

        // You might want to add reassignment_date if needed
        if (editingClient.reassignment_date) {
          updateData.reassignment_date = editingClient.reassignment_date;
        } else {
          // Default to today's date if not provided
          updateData.reassignment_date = new Date().toISOString().split('T')[0];
        }

        // Include remark for reassignment
        if (editingClient.detailed_remark) {
          updateData.remark = editingClient.detailed_remark;
        }
      }

      const response = await axios.put(
        `${BASE_URL}api/master-data/${editingClient.master_id}`,
        updateData,
        { withCredentials: true },
      );

      const data = response.data;

      if (response.status === 200) {
        let alertMsg = '✅ Client updated successfully.';

        // Show quick remark auto-copy notification
        if (data.quick_remark_copied) {
          alertMsg += '\n📝 Quick Remark copied to Detailed Remark.';
        }

        // Show inserted reassignment info
        if (data.inserted && data.inserted.length) {
          alertMsg += `\nAdded ${data.inserted.length} new reassignment(s).`;

          // Optionally show details of inserted reassignments
          if (data.inserted_details) {
            data.inserted_details.forEach((detail: any) => {
              alertMsg += `\n• ${detail.user_name} - ${detail.stage}`;
            });
          }
        }

        // Show skipped duplicates info
        if (data.skipped && data.skipped.length) {
          const skippedList = data.skipped
            .map(
              (s: any) =>
                `• ${s.finalName || s.user_name} (Stage: ${
                  s.leadStage || s.stage
                })`,
            )
            .join('\n');
          alertMsg += `\n\n⚠️ Skipped ${data.skipped.length} duplicate reassignment(s):\n${skippedList}`;
        }

        // Show reassignment remarks info if available
        if (data.reassignment_remarks_added) {
          alertMsg += `\n\n📝 Added reassignment remark to history.`;
        }

        // If there were reassignment changes, show summary
        if (
          (data.inserted && data.inserted.length > 0) ||
          (data.skipped && data.skipped.length > 0)
        ) {
          alertMsg += `\n\n📊 Summary: ${
            (data.inserted?.length || 0) + (data.skipped?.length || 0)
          } total reassignment attempts.`;
        }

        showToast(alertMsg, 'success', 2000);

        fetchRawData(); // Refresh the table
        return { success: true };
      } else {
        return { success: false, message: 'Failed to update client' };
      }
    } catch (error: any) {
      console.error('Update failed:', error);

      let errorMessage = '❌ Failed to update client.';

      if (error.response) {
        // Server responded with error
        console.error('Response error:', error.response.data);
        console.error('Status:', error.response.status);

        if (error.response.data.message) {
          errorMessage = `❌ ${error.response.data.message}`;
        } else if (error.response.data.error) {
          errorMessage = `❌ ${error.response.data.error}`;
        }

        // Check for specific error types
        if (
          error.response.data.duplicates &&
          error.response.data.duplicates.length > 0
        ) {
          errorMessage += `\n\n⚠️ Found ${error.response.data.duplicates.length} duplicate entries:`;
          error.response.data.duplicates.forEach((dup: any) => {
            errorMessage += `\n• ${dup.name || 'N/A'} (${
              dup.number || 'No number'
            })`;
          });
        }
      } else if (error.request) {
        // Request made but no response
        console.error('No response received:', error.request);
        errorMessage = '❌ No response from server. Check your connection.';
      } else {
        // Something else happened
        console.error('Error:', error.message);
        errorMessage = `❌ Error: ${error.message}`;
      }

      showToast(errorMessage, 'error', 5000);
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message,
      };
    }
  };

  const [isNewRemark, setIsNewRemark] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (!editingClient) return;

    let processedValue: any = value;

    // Convert some fields to numbers
    if (
      ['cat_id', 'reference_id', 'area_id'].includes(name) ||
      name.endsWith('_id')
    ) {
      processedValue = value === '' ? '' : Number(value);
    }

    // Handle room dimensions - allow decimals
    if (['room_length', 'room_width', 'room_height'].includes(name)) {
      // Allow only digits and decimal point
      const sanitizedValue = value.replace(/[^\d.]/g, '');
      // Ensure only one decimal point
      const parts = sanitizedValue.split('.');
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('');
      } else {
        processedValue = sanitizedValue;
      }
    }

    // Handle contact numbers - allow only digits
    if (['number', 'alternate_number'].includes(name)) {
      processedValue = value.replace(/\D/g, '');
    }

    // Handle budget range dropdown
    if (name === 'budget_range_dropdown') {
      processedValue = value;
      return setEditingClient((prev) => ({
        ...prev,
        budget_range:
          value === 'Other'
            ? prev.budget_range &&
              ![
                'Basic Range: Above ₹7 Lakh',
                'Premium Range: Above ₹10 Lakh',
                'Ultra-Premium Range: Above ₹15 Lakh',
                'Elite Range: Above ₹25 Lakh',
              ].includes(prev.budget_range)
              ? prev.budget_range
              : ''
            : value,
      }));
    }

    // Custom budget textbox
    if (name === 'budget_range_custom') {
      return setEditingClient((prev) => ({
        ...prev,
        budget_range: value,
      }));
    }

    // Auto-copy quick_remark to detailed_remark when quick_remark is selected
    if (name === 'quick_remark' && value) {
      setEditingClient({
        ...editingClient,
        [name]: processedValue,
        detailed_remark: value,
      });
      return;
    }

    setEditingClient({
      ...editingClient,
      [name]: processedValue,
    });
  };
const handleFollowupHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  if (!editingClient) return;
  const newHour = e.target.value;
  const { minute } = getFollowupHourMinute(editingClient.followup_time);
  // 7 PM is the closing boundary, so lock minutes to :00 once it's selected
  const safeMinute = newHour === '19' ? '00' : minute || '00';
  setEditingClient({
    ...editingClient,
    followup_time: newHour ? `${newHour}:${safeMinute}` : '',
  });
};

const handleFollowupMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  if (!editingClient) return;
  const newMinute = e.target.value;
  const { hour } = getFollowupHourMinute(editingClient.followup_time);
  setEditingClient({
    ...editingClient,
    followup_time: hour ? `${hour}:${newMinute}` : '',
  });
};
  useEffect(() => {
    const fetchLeadStages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/leadstage`);
        setLeadStages(response.data);
      } catch (error) {
        console.error('Error fetching lead stages:', error);
      }
    };

    fetchLeadStages();
  }, []);

  useEffect(() => {
    const fetchQuickRemarks = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/quickremark`);
        setQuickRemarks(response.data);
      } catch (error) {
        console.error('Error fetching quick remarks:', error);
      }
    };

    fetchQuickRemarks();
  }, []);

  const handleUserCheckboxChange = (userId: string, userName: string) => {
    if (!editingClient) return;

    const currentAssigned = Array.isArray(editingClient.assigned_to)
      ? [...editingClient.assigned_to]
      : [];

    // If user is already selected, deselect them
    if (currentAssigned.includes(userId)) {
      setEditingClient({
        ...editingClient,
        assigned_to: currentAssigned.filter((id) => id !== userId),
      });
      return;
    }

    // If trying to select a different user, show toast and enforce single selection
    if (currentAssigned.length === 1) {
      // Show toast notification that only one user can be selected
      showToast(
        '⚠️ Only one user can be selected at a time. Please deselect the current user first.',
        'warning',
        3000,
      );
      return;
    }

    // If no user is selected, select this one
    setEditingClient({
      ...editingClient,
      assigned_to: [userId], // 🔥 Only this user selected
    });
  };

  // Handle select all filtered users
  const handleSelectAllFiltered = () => {
    if (!editingClient || filteredUsers.length === 0) return;

    const currentAssigned = Array.isArray(editingClient.assigned_to)
      ? [...editingClient.assigned_to]
      : [];

    // Get IDs of filtered users
    const filteredUserIds = filteredUsers.map((user) => user.user_id);

    // Check if all filtered users are already selected
    const allFilteredSelected = filteredUserIds.every((id) =>
      currentAssigned.includes(id),
    );

    if (allFilteredSelected) {
      // Deselect all filtered users
      setEditingClient({
        ...editingClient,
        assigned_to: currentAssigned.filter(
          (id) => !filteredUserIds.includes(id),
        ),
      });
    } else {
      // Add all filtered users (avoiding duplicates)
      const newAssigned = Array.from(
        new Set([...currentAssigned, ...filteredUserIds]),
      );
      setEditingClient({
        ...editingClient,
        assigned_to: newAssigned,
      });
    }
  };

  if (!showEditPopup || !editingClient) return null;
const { hour: followupHour, minute: followupMinute } = getFollowupHourMinute(
  editingClient.followup_time,
);
const followupMinuteOptions =
  followupHour === '19' ? ['00'] : FOLLOWUP_MINUTE_OPTIONS_FULL;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-2xl mt-20 max-h-[85vh] overflow-y-auto dark:border-strokedark dark:bg-boxdark">
        <div className="flex justify-between items-center border-b-2 mb-4 pb-3 dark:border-strokedark">
          <h2 className="text-xl font-bold dark:text-white">Edit Client</h2>
          <button
            onClick={closeEditPopup}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            // 🔥 Add validation check before submission
            if (
              !Array.isArray(editingClient.assigned_to) ||
              editingClient.assigned_to.length === 0
            ) {
              showToast(
                '⚠️ Please select at least one user to reassign.',
                'warning',
                3000,
              );
              return; // Stop form submission
            }

            const result = await handleUpdateClient(editingClient);
            if (result.success) {
              setTimeout(() => {
                closeEditPopup();
              }, 2200);
            }
          }}
        >
          {/* Required Fields Section */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingClient.name}
                  onChange={handleInputChange}
                  required
                  pattern="^[A-Za-z\s]+$"
                  title="Only alphabets and spaces allowed"
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Contact No. *
                </label>
                <input
                  type="text"
                  name="number"
                  value={editingClient.number}
                  onChange={handleInputChange}
                  required
                  pattern="^[0-9]{10}$"
                  maxLength={10}
                  title="Enter valid 10 digit number"
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Alternate No. */}
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Alternate No.
                </label>
                <input
                  type="text"
                  name="alternate_number"
                  value={editingClient.alternate_number || ''}
                  onChange={handleInputChange}
                  pattern="\d*"
                  title="Only digits are allowed"
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editingClient.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Category *
                </label>
                <select
                  name="cat_id"
                  value={editingClient.cat_id || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">Select category</option>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.cat_id} value={category.cat_id}>
                        {category.cat_name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  )}
                </select>

                {/* CATEGORY OTHER TEXTBOX */}
                {categories.find((c) => c.cat_id === editingClient.cat_id)
                  ?.cat_name === 'Other' && (
                  <input
                    type="text"
                    name="category_other"
                    value={editingClient.category_other || ''}
                    onChange={handleInputChange}
                    pattern="^[A-Za-z\s]+$"
                    title="Only alphabets and spaces allowed"
                    className="w-full p-2 border rounded text-sm"
                  />
                )}
              </div>

              <div>
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Sources *
                </label>
                <select
                  name="reference_id"
                  value={
                    editingClient.reference_id || editingClient.reference || ''
                  }
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-md text-sm
                           focus:ring-2 focus:ring-blue-500
                           dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">Select resources</option>
                  {references?.length > 0 ? (
                    references.map((reference) => (
                      <option
                        key={reference.reference_id}
                        value={reference.reference_id}
                      >
                        {reference.reference_name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Loading references...
                    </option>
                  )}
                </select>

                {/* RESOURCE CONDITIONAL TEXTBOX */}
                {(() => {
                  const selectedRef = references.find(
                    (r) => r.reference_id === editingClient.reference_id,
                  )?.reference_name;

                  if (
                    ![
                      'Architect',
                      'Existing Client Reference',
                      'Other',
                      'other',
                    ].includes(selectedRef || '')
                  ) {
                    return null;
                  }

                  return (
                    <input
                      type="text"
                      name="reference_other"
                      value={editingClient.reference_other || ''}
                      onChange={handleInputChange}
                      pattern="^[A-Za-z\s]+$"
                      title="Only alphabets and spaces allowed"
                      className="w-full p-2 border rounded text-sm"
                    />
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Location & Project Details Section */}
          <div>
            <h3 className="text-md font-semibold mb-2 dark:text-white border-b pb-1">
              Location & Project Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* 🔥 MODIFIED: City as Dropdown from Area Table */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                      City
                    </label>

                    <select
                      name="area_id"
                      value={editingClient.area_id || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    >
                      <option value="">Select City</option>
                      {area && area.length > 0 ? (
                        area.map((areaItem) => (
                          <option
                            key={areaItem.area_id}
                            value={areaItem.area_id}
                          >
                            {areaItem.area_name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Loading cities...
                        </option>
                      )}
                    </select>

                    {/* Show original city value as reference if different from selected area */}
                    {editingClient.original_city &&
                      editingClient.original_city !== '' &&
                      editingClient.original_city !==
                        (area.find(
                          (a) => a.area_id === Number(editingClient.area_id),
                        )?.area_name || '') && (
                        <p className="text-xs text-gray-500 mt-1">
                          Original City: {editingClient.original_city}
                        </p>
                      )}
                  </div>

                  {/* Room Dimensions (L / W / H) */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                      Room Dimensions
                    </label>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Length */}
                      <div>
                        <label className="block mb-1 text-xs text-gray-800 dark:text-gray-200">
                          Length (L) ft
                        </label>
                        <input
                          type="text"
                          name="room_length"
                          value={editingClient.room_length}
                          onChange={handleInputChange}
                          placeholder="e.g., 12.5"
                          pattern="\d*\.?\d*"
                          className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      </div>

                      {/* Width */}
                      <div>
                        <label className="block mb-1 text-xs text-gray-800 dark:text-gray-200">
                          Width (W) ft
                        </label>
                        <input
                          type="text"
                          name="room_width"
                          value={editingClient.room_width}
                          onChange={handleInputChange}
                          placeholder="e.g., 10.75"
                          pattern="\d*\.?\d*"
                          className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      </div>

                      {/* Height */}
                      <div>
                        <label className="block mb-1 text-xs text-gray-800 dark:text-gray-200">
                          Height (H) ft
                        </label>
                        <input
                          type="text"
                          name="room_height"
                          value={editingClient.room_height}
                          onChange={handleInputChange}
                          placeholder="e.g., 9.0"
                          pattern="\d*\.?\d*"
                          className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Video Type
                </label>
                <select
                  name="p_type"
                  value={editingClient.p_type || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">Select type</option>
                  <option value="Projector">Projector</option>
                  <option value="TV">TV</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Budget Range
                </label>

                {/* DROPDOWN */}
                <select
                  name="budget_range_dropdown"
                  value={
                    [
                      'Basic Range: Above ₹7 Lakh',
                      'Premium Range: Above ₹10 Lakh',
                      'Ultra-Premium Range: Above ₹15 Lakh',
                      'Elite Range: Above ₹25 Lakh',
                      'Other',
                    ].includes(editingClient.budget_range)
                      ? editingClient.budget_range
                      : 'Other'
                  }
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">Select Budget Range</option>
                  <option value="Basic Range: Above ₹7 Lakh">
                    Basic Range: Above ₹7 Lakh
                  </option>
                  <option value="Premium Range: Above ₹10 Lakh">
                    Premium Range: Above ₹10 Lakh
                  </option>
                  <option value="Ultra-Premium Range: Above ₹15 Lakh">
                    Ultra-Premium Range: Above ₹15 Lakh
                  </option>
                  <option value="Elite Range: Above ₹25 Lakh">
                    Elite Range: Above ₹25 Lakh
                  </option>
                  <option value="Other">Other</option>
                </select>

                {[
                  'Basic Range: Above ₹7 Lakh',
                  'Premium Range: Above ₹10 Lakh',
                  'Ultra-Premium Range: Above ₹15 Lakh',
                  'Elite Range: Above ₹25 Lakh',
                ].includes(editingClient.budget_range) === false && (
                  <input
                    type="text"
                    name="budget_range_custom"
                    value={editingClient.budget_range}
                    onChange={handleInputChange}
                    placeholder="Enter custom budget"
                    className="w-full p-2 mt-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                )}
              </div>

              {/* Current Stage */}
              <div className="-mt-2">
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  What's the current stage of your home theater room?
                </label>
                <select
                  name="current_stage"
                  value={editingClient.current_stage || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">Select stage</option>
                  <option value="Room is ready">Room is ready</option>
                  <option value="Brick work">Brick work</option>
                  <option value="Plaster work">Plaster work</option>
                  <option value="Tile work">Tile work</option>
                  <option value="Electrical work">Electrical work</option>
                  <option value="Furniture work">Furniture work</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div>
            <h3 className="text-md font-semibold mb-2 dark:text-white border-b pb-1">
              Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Site Visit Date */}
              <div>
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Site Visit Date
                </label>
                <input
                  type="date"
                  name="site_visit_date"
                  value={editingClient.site_visit_date || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Demo Date */}
              <div>
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Demo Date
                </label>
                <input
                  type="date"
                  name="demo_date"
                  value={editingClient.demo_date || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Entry Date (was Assign Date) - Read Only */}
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Entry Date
                </label>
                <input
                  type="date"
                  name="assign_date"
                  value={editingClient.assign_date || ''}
                  readOnly
                  disabled
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Entry date cannot be modified
                </p>
              </div>
            </div>
          </div>

          {/* Contact Numbers Section */}
          <div>
            <h3 className="text-md font-semibold mb-2 dark:text-white border-b pb-1">
              Contact Numbers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Architect Number
                </label>
                <input
                  type="text"
                  name="ar_number"
                  value={editingClient.ar_number || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Architect Name
                </label>
                <input
                  type="text"
                  name="architect_name"
                  value={editingClient.architect_name || ''}
                  onChange={handleInputChange}
                  pattern="^[A-Za-z\s]+$"
                  title="Only alphabets and spaces allowed"
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Carpenter Number
                </label>
                <input
                  type="text"
                  name="ca_number"
                  value={editingClient.ca_number || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Electrician Number
                </label>
                <input
                  type="text"
                  name="e_number"
                  value={editingClient.e_number || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Site Manager Number
                </label>
                <input
                  type="text"
                  name="sm_number"
                  value={editingClient.sm_number || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  POP Number
                </label>
                <input
                  type="text"
                  name="pop_number"
                  value={editingClient.pop_number || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Other Number
                </label>
                <input
                  type="text"
                  name="other_number"
                  value={editingClient.other_number || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Lead Management Section */}
          <div>
            <h3 className="text-md font-semibold mb-2 dark:text-white border-b pb-1">
              Lead Management
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Reassign To - MULTI SELECT with Checkboxes, Search, and 5 Columns */}
              <div className="md:col-span-3">
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Reassign To
                </label>

                {/* Search Box */}
                <div className="mb-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-form-input dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search users by name or role..."
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Showing {filteredUsers.length} of {users.length} users
                    </p>
                  )}
                </div>

                {/* Checkbox Selection Area - 5 Columns */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-3 max-h-60 overflow-y-auto">
                  {/* Select All Filtered Button */}
                  <div className="mb-2 pb-2 border-b dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors whitespace-nowrap"
                      >
                        {filteredUsers.length > 0 &&
                        filteredUsers.every(
                          (user) =>
                            Array.isArray(editingClient.assigned_to) &&
                            editingClient.assigned_to.includes(user.user_id),
                        )
                          ? 'Deselect All Filtered'
                          : 'Select All Filtered'}
                      </button>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Array.isArray(editingClient.assigned_to)
                        ? editingClient.assigned_to.length
                        : 0}{' '}
                      selected
                    </span>
                  </div>

                  {/* Users List - 5 Columns */}
                  {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {filteredUsers.map((user) => {
                        // Helper function to format role display
                        const formatRoleForDisplay = (role: string) => {
                          if (!role) return 'No role';
                          if (role.length > 18)
                            return role.substring(0, 16) + '...';
                          return role;
                        };

                        const isSelected =
                          Array.isArray(editingClient.assigned_to) &&
                          editingClient.assigned_to.includes(user.user_id);

                        return (
                          <div
                            key={user.user_id}
                            className={`flex items-start p-2 rounded transition-colors min-w-[120px] ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                                : 'border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`user-${user.user_id}`}
                              checked={isSelected}
                              onChange={() =>
                                handleUserCheckboxChange(
                                  user.user_id,
                                  user.name,
                                )
                              }
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 mt-1 flex-shrink-0"
                            />
                            <label
                              htmlFor={`user-${user.user_id}`}
                              className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1 min-w-0"
                            >
                              <div
                                className="font-medium truncate mb-0.5"
                                title={user.name}
                              >
                                {user.name}
                              </div>
                              <div
                                className="text-xs text-gray-500 dark:text-gray-400 truncate"
                                title={user.role_label || user.role}
                              >
                                {user.role_label || user.role}
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <div className="text-2xl mb-2">🔍</div>
                      <p className="text-sm">No users found</p>
                      <p className="text-xs mt-1">
                        Try a different search term
                      </p>
                    </div>
                  )}
                </div>

                {/* Selected Users Preview */}
                {Array.isArray(editingClient.assigned_to) &&
                  editingClient.assigned_to.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
                      <div className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-medium">
                        Selected Users ({editingClient.assigned_to.length}):
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-1">
                        {editingClient.assigned_to.map((userId) => {
                          const user = users.find((u) => u.user_id === userId);
                          if (!user) return null;

                          const displayText = `${user.name}${
                            user.role_label ? ` (${user.role_label})` : ''
                          }`;

                          return (
                            <span
                              key={userId}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700 max-w-[160px]"
                            >
                              <span className="truncate" title={displayText}>
                                {displayText}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUserCheckboxChange(userId, user.name)
                                }
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-bold flex-shrink-0"
                                aria-label={`Remove ${user.name}`}
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>

              {/* Follow-up Date */}
              <div className="md:col-span-1 mt-4">
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  name="followup_date"
                  value={editingClient.followup_date || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
<div className="md:col-span-1 mt-4">
  <label className="block mb-1 text-base font-semibold text-orange-600 dark:text-orange-400">
    Follow-up Time
  </label>
  <div className="flex items-center gap-2">
    <select
      value={followupHour}
      onChange={handleFollowupHourChange}
      className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
    >
      <option value="">Hour</option>
      {FOLLOWUP_HOUR_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <span className="text-gray-500 dark:text-gray-400">:</span>
    <select
      value={followupMinute}
      onChange={handleFollowupMinuteChange}
      disabled={!followupHour}
      className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">Min</option>
      {followupMinuteOptions.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  </div>
</div>


           <div className="md:col-span-1 mt-4 ">
  <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
    Lead Stage
  </label>
  
  {/* 🔥 FIX: If lead stage is "Execution", show as disabled/read-only */}
  {editingClient.lead_stage === 'Execution' ? (
    <div className="relative">
      <input
        type="text"
        value="Execution"
        disabled
        className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white bg-gray-100 cursor-not-allowed"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-xs text-red-500 font-semibold">🔒 Locked</span>
      </div>
     
    </div>
  ) : (
    <select
      name="lead_stage"
      value={editingClient.lead_stage || ''}
      onChange={handleInputChange}
      className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
    >
      <option value="">Select Lead Stage</option>
      {leadStages.map((stage, index) => (
        <option key={index} value={stage}>
          {stage}
        </option>
      ))}
    </select>
  )}
</div>

              <div className="md:col-span-1 mt-4">
                <label className="block mb-1 text-sm dark:text-white">
                  Quick Remark
                </label>
                <select
                  name="quick_remark"
                  value={editingClient.quick_remark || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">Select Quick Remark</option>
                  {quickRemarks
                    .filter((remark) => remark !== 'Assigned')
                    .map((remark, index) => (
                      <option key={index} value={remark}>
                        {remark}
                      </option>
                    ))}
                </select>
              </div>
            </div>

          
       {Array.isArray(editingClient.reassignment_remarks) &&
  editingClient.reassignment_remarks.length > 0 && (
    <div className="mt-3">
      <label className="text-md font-semibold mb-2 dark:text-white border-b pb-1">
        Reassignment History (
        {editingClient.reassignment_remarks.length})
      </label>

      <div className="bg-white dark:bg-boxdark border rounded-md p-2 max-h-60 overflow-y-auto space-y-1.5">
        {editingClient.reassignment_remarks
          .slice()
          .sort((a: any, b: any) => {
            // Helper function to parse dates in DD/MM/YYYY format
            const parseDate = (dateStr: string) => {
              if (!dateStr) return new Date(0);
              
              // Check if it's in DD/MM/YYYY, HH:MM:SS format
              if (typeof dateStr === 'string' && dateStr.match(/^\d{2}\/\d{2}\/\d{4}/)) {
                const [datePart, timePart] = dateStr.split(', ');
                const [day, month, year] = datePart.split('/');
                const [hours, minutes, seconds] = timePart ? timePart.split(':') : ['00', '00', '00'];
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
              }
              
              // Try parsing as ISO string
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) return date;
              
              return new Date(0);
            };
            
            const dateA = parseDate(a?.created_at || a?.reassignment_date || '');
            const dateB = parseDate(b?.created_at || b?.reassignment_date || '');
            
            return dateB.getTime() - dateA.getTime();
          })
          .map((remarkObj: any, index: number) => {
            const displayNumber = index + 1;

            if (remarkObj && typeof remarkObj === 'object') {
              return (
                <div
                  key={index}
                  className="border rounded p-2 text-[11px] bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-blue-600">
                        #{displayNumber}
                      </span>

                      {remarkObj.leadStage && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                          {remarkObj.leadStage}
                        </span>
                      )}

                      {index === 0 && (
                        <span className="px-1 py-0.5 text-[9px] bg-green-100 text-green-700 rounded">
                          Latest
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-gray-500" title={remarkObj.created_at}>
                      {formatDateTime(remarkObj.created_at)}
                    </span>
                  </div>

                  {remarkObj.assignedTo && (
                    <div className="text-gray-700 dark:text-gray-300 mb-0.5">
                      <span className="font-medium">
                        {remarkObj.name || 'Unknown'}
                      </span>
                      {remarkObj.role && (
                        <span className="text-gray-400">
                          {' '}({remarkObj.role})
                        </span>
                      )}
                      <span className="mx-1 text-gray-400">→</span>
                      <span className="font-medium">
                        {remarkObj.assignedTo}
                      </span>
                    </div>
                  )}

                  {remarkObj.remark && (
                    <div className="bg-white dark:bg-gray-900 px-3 py-2 rounded text-base text-gray-800 dark:text-gray-200">
                      {remarkObj.remark}
                    </div>
                  )}
                </div>
              );
            }

            if (typeof remarkObj === 'string') {
              return (
                <div
                  key={index}
                  className="border rounded p-2 text-[11px] bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-blue-600">
                      #{displayNumber}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Legacy
                    </span>
                  </div>
                  {remarkObj}
                </div>
              );
            }

            return null;
          })}
      </div>
    </div>
  )}
  

            <div className="mt-3">
              <label className="block mb-1 text-sm italic font-medium text-emerald-600 dark:text-emerald-400">
                Detailed Remark (New)
              </label>

              <textarea
                name="detailed_remark"
                value={editingClient.detailed_remark || ''}
                onChange={handleInputChange}
                onFocus={() => {
                  if (!isNewRemark) {
                    setEditingClient((prev) => ({
                      ...prev,
                      detailed_remark: '',
                    }));
                    setIsNewRemark(true);
                  }
                }}
                rows={3}
                placeholder="Click to write a new remark"
                className="w-full p-2 text-xs border rounded placeholder:italic
                           dark:border-form-strokedark dark:bg-form-input dark:text-white
                           focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-strokedark">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Update Client
            </button>
            <button
              type="button"
              onClick={closeEditPopup}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className={`max-w-sm rounded-lg px-5 py-3 shadow-lg text-sm whitespace-pre-line animate-fade-in
              pointer-events-auto
              ${
                toast.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : toast.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateRawData;
