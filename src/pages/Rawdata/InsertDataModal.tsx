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

interface User {
  user_id: string;
  name: string;
  role: string;
}

interface InsertDataModalProps {
  showAddPopup: boolean;
  setShowAddPopup: (show: boolean) => void;
  singleFormData: {
    // Required Fields
    name: string;
    number: string;
    email: string;
    address: string;
    cat_id: string;
    reference_id: string;
    area_id: string;
    
    // Other Fields
    alternate_number?: string;
    city?: string;
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
    ar_number?: string;
    architect_name?: string;
    ca_number?: string;
    e_number?: string;
    sm_number?: string;
    pop_number?: string;
    other_number?: string;
    lead_stage?: string;
    quick_remark?: string;
    detailed_remark?: string;
    followup_date?: string;
    assign_date?: string; // Entry Date
    assigned_to: string[];
    
    category_other?: string;
    reference_other?: string;
  };
  setSingleFormData: (data: any) => void;
  categories: Category[];
  references: Reference[];
  area: Area[];
  fetchRawData: () => void;
  setError: (error: string) => void;
  setDuplicateEntries: (entries: any[]) => void;
  setShowDuplicateModal: (show: boolean) => void;
}

const InsertDataModal: React.FC<InsertDataModalProps> = ({
  showAddPopup,
  setShowAddPopup,
  singleFormData,
  setSingleFormData,
  categories,
  references,
  area,
  fetchRawData,
  setError,
  setDuplicateEntries,
  setShowDuplicateModal,
}) => {
  const [leadStages, setLeadStages] = useState<string[]>([]);
  const [quickRemarks, setQuickRemarks] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Set current date as default for assign_date (Entry Date)
  useEffect(() => {
    if (showAddPopup && !singleFormData.assign_date) {
      const today = new Date().toISOString().split('T')[0];
      setSingleFormData(prev => ({
        ...prev,
        assign_date: today
      }));
    }
  }, [showAddPopup]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/users`);
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(term) ||
        (user.role && user.role.toLowerCase().includes(term))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Fetch lead stages
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

  // Fetch quick remarks
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Handle contact numbers - allow only digits
    if (['number', 'alternate_number'].includes(name)) {
      return setSingleFormData({
        ...singleFormData,
        [name]: value.replace(/\D/g, '')
      });
    }

    // Handle room dimensions - allow decimals
    if (['room_length', 'room_width', 'room_height'].includes(name)) {
      const sanitizedValue = value.replace(/[^\d.]/g, '');
      const parts = sanitizedValue.split('.');
      if (parts.length > 2) {
        return setSingleFormData({
          ...singleFormData,
          [name]: parts[0] + '.' + parts.slice(1).join('')
        });
      } else {
        return setSingleFormData({
          ...singleFormData,
          [name]: sanitizedValue
        });
      }
    }

    // Handle budget range dropdown
    if (name === 'budget_range_dropdown') {
      return setSingleFormData((prev) => ({
        ...prev,
        budget_range:
          value === 'Other'
            ? prev.budget_range && ![
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
      return setSingleFormData((prev) => ({
        ...prev,
        budget_range: value,
      }));
    }

    // Auto-copy quick_remark to detailed_remark when quick_remark is selected
    if (name === 'quick_remark' && value && !singleFormData.detailed_remark) {
      setSingleFormData({
        ...singleFormData,
        [name]: value,
        detailed_remark: value,
      });
      return;
    }

    setSingleFormData({ ...singleFormData, [name]: value });
  };

  // Checkbox handler for user selection
  const handleUserCheckboxChange = (userId: string) => {
    const currentAssigned = Array.isArray(singleFormData.assigned_to)
      ? [...singleFormData.assigned_to]
      : [];

    if (currentAssigned.includes(userId)) {
      // Remove user
      setSingleFormData({
        ...singleFormData,
        assigned_to: currentAssigned.filter(id => id !== userId)
      });
    } else {
      // Add user
      setSingleFormData({
        ...singleFormData,
        assigned_to: [...currentAssigned, userId]
      });
    }
  };

  // Handle select all filtered users
  const handleSelectAllFiltered = () => {
    if (filteredUsers.length === 0) return;

    const currentAssigned = Array.isArray(singleFormData.assigned_to)
      ? [...singleFormData.assigned_to]
      : [];

    // Get IDs of filtered users
    const filteredUserIds = filteredUsers.map(user => user.user_id);

    // Check if all filtered users are already selected
    const allFilteredSelected = filteredUserIds.every(id =>
      currentAssigned.includes(id)
    );

    if (allFilteredSelected) {
      // Deselect all filtered users
      setSingleFormData({
        ...singleFormData,
        assigned_to: currentAssigned.filter(id => !filteredUserIds.includes(id))
      });
    } else {
      // Add all filtered users (avoiding duplicates)
      const newAssigned = [...new Set([...currentAssigned, ...filteredUserIds])];
      setSingleFormData({
        ...singleFormData,
        assigned_to: newAssigned
      });
    }
  };


  const handleAddSingleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  // Basic validation
  if (!singleFormData.name || !singleFormData.number || !singleFormData.cat_id || !singleFormData.reference_id) {
    alert('Please fill all required fields: Name, Contact, Category, and Sources');
    return;
  }

  // Contact number validation
  if (singleFormData.number.length !== 10) {
    alert('Contact number must be 10 digits');
    return;
  }

  try {
    // 🔹 CRITICAL FIX: Get ONE user ID (not array) for backend
    let assignedUserId = null;
    
    if (Array.isArray(singleFormData.assigned_to) && singleFormData.assigned_to.length > 0) {
      // Take the FIRST user ID only (backend only accepts one)
      const firstUserId = singleFormData.assigned_to[0];
      
      // Try to convert to number if needed
      assignedUserId = parseInt(firstUserId);
      
      if (isNaN(assignedUserId)) {
        assignedUserId = firstUserId; // Keep as string if not a number
      }
      
      console.log("Selected user ID for assignment:", assignedUserId);
    } else {
      // Optional: You can either require a user or allow null
      // const confirmContinue = window.confirm(
      //   "No user selected. The lead will be unassigned. Continue?"
      // );
      // if (!confirmContinue) return;
      
      // Or simply proceed without assignment
      console.log("No user selected, lead will be unassigned");
    }

    const payload = {
      // MANDATORY FIELDS (as per backend)
      name: singleFormData.name,
      number: singleFormData.number,
      cat_id: parseInt(singleFormData.cat_id),
      reference_id: parseInt(singleFormData.reference_id),
      
      // 🔹 CRITICAL: Send SINGLE user ID, not array
      assigned_to_user_id: assignedUserId,
      
      // 🔹 REMOVE THESE - backend doesn't accept them
      // client_ids: [],
      // assigned_user_ids: [],
      // assigned_to_names: [],
      // user_ids: [],
      // master_id: null,

      // Optional fields
      email: singleFormData.email || null,
      address: singleFormData.address || null,
      area_id: singleFormData.area_id ? parseInt(singleFormData.area_id) : null,
      alternate_number: singleFormData.alternate_number || null,
      city: singleFormData.city || null,
      location_link: singleFormData.location_link || null,
      
      // Room/project details
      room_length: singleFormData.room_length ? parseFloat(singleFormData.room_length) : null,
      room_width: singleFormData.room_width ? parseFloat(singleFormData.room_width) : null,
      room_height: singleFormData.room_height ? parseFloat(singleFormData.room_height) : null,
      p_type: singleFormData.p_type || null,
      budget_range: singleFormData.budget_range || null,
      current_stage: singleFormData.current_stage || null,
      time_to_complete: singleFormData.time_to_complete || null,

      // Dates
      site_visit_date: singleFormData.site_visit_date || null,
      demo_date: singleFormData.demo_date || null,
      followup_date: singleFormData.followup_date || null,
      assign_date: singleFormData.assign_date || new Date().toISOString().split('T')[0],

      // Contact numbers
      ar_number: singleFormData.ar_number || null,
      architect_name: singleFormData.architect_name || null,
      ca_number: singleFormData.ca_number || null,
      e_number: singleFormData.e_number || null,
      sm_number: singleFormData.sm_number || null,
      pop_number: singleFormData.pop_number || null,
      other_number: singleFormData.other_number || null,

      // Lead info
      lead_stage: singleFormData.lead_stage || "Fresh Lead",
      quick_remark: singleFormData.quick_remark || null,
      detailed_remark: singleFormData.detailed_remark || null,

      // Other inputs
      category_other: singleFormData.category_other || null,
      reference_other: singleFormData.reference_other || null
    };

    console.log("📤 FINAL payload to create new lead:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${BASE_URL}api/sujit-master-data/add-single`,
      payload,
      {
        withCredentials: true,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      }
    );

    console.log("✅ Response from backend:", response.data);

    if (response.status === 200 || response.status === 201) {
      alert("✅ Client added successfully");

      // Reset form
      const today = new Date().toISOString().split('T')[0];
      setSingleFormData({
        name: "",
        number: "",
        email: "",
        address: "",
        cat_id: "",
        reference_id: "",
        area_id: "",
        alternate_number: "",
        city: "",
        location_link: "",
        room_length: "",
        room_width: "",
        room_height: "",
        p_type: "",
        budget_range: "",
        current_stage: "",
        time_to_complete: "",
        site_visit_date: "",
        demo_date: "",
        ar_number: "",
        architect_name: "",
        ca_number: "",
        e_number: "",
        sm_number: "",
        pop_number: "",
        other_number: "",
        lead_stage: "",
        quick_remark: "",
        detailed_remark: "",
        followup_date: "",
        assign_date: today,
        assigned_to: [],
        category_other: "",
        reference_other: ""
      });

      setSearchTerm("");
      setShowAddPopup(false);
      fetchRawData();
    }
  } catch (err: any) {
    console.error("❌ API Error:", err);
    console.error("Error details:", {
      status: err.response?.status,
      data: err.response?.data,
      headers: err.response?.headers
    });

    // 🔥 HANDLE DUPLICATE CONTACT ERROR
    if (err.response?.status === 409) {
      const duplicateData = err.response.data;
      
      setDuplicateEntries([{
        name: singleFormData.name,
        number: singleFormData.number,
        existingId: duplicateData.duplicate?.master_id,
        existingName: duplicateData.duplicate?.name,
        reason: "Contact number already exists"
      }]);
      setShowDuplicateModal(true);
      setShowAddPopup(false);
      return;
    }

    // Handle validation errors
    if (err.response?.status === 400) {
      const errorMsg = err.response.data.message || "Validation failed";
      alert(`Validation Error: ${errorMsg}`);
      return;
    }

    // Handle other errors
    const backendMessage = err.response?.data?.message || err.response?.data?.error || "Failed to add data.";
    alert(`Error: ${backendMessage}`);
  }
};


  if (!showAddPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-2xl mt-20 max-h-[85vh] overflow-y-auto dark:border-strokedark dark:bg-boxdark">
        <div className="flex justify-between items-center border-b-2 mb-4 pb-3 dark:border-strokedark">
          <h2 className="text-xl font-bold dark:text-white">Insert New Client</h2>
          <button
            onClick={() => setShowAddPopup(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAddSingleSubmit} className="space-y-4">
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
                  value={singleFormData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Contact No. */}
              <div>
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Contact No. *
                </label>
                <input
                  type="text"
                  name="number"
                  value={singleFormData.number}
                  onChange={handleInputChange}
                  required
                  pattern="\d*"
                  title="Only digits are allowed"
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
                  value={singleFormData.alternate_number || ''}
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
                  value={singleFormData.email}
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
                  value={singleFormData.cat_id || ''}
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
                {categories.find(
                  (c) => c.cat_id === parseInt(singleFormData.cat_id)
                )?.cat_name === 'Other' && (
                    <input
                      type="text"
                      name="category_other"
                      value={singleFormData.category_other || ''}
                      onChange={handleInputChange}
                      placeholder="Enter other category"
                      className="w-full p-2 mt-2 border rounded text-sm
                             dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  )}
              </div>

              <div>
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Sources *
                </label>
                <select
                  name="reference_id"
                  value={singleFormData.reference_id || ''}
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
                    (r) => r.reference_id === parseInt(singleFormData.reference_id)
                  )?.reference_name;

                  if (
                    !['Architect', 'Existing Client Reference', 'Other', 'other'].includes(
                      selectedRef || ''
                    )
                  ) {
                    return null;
                  }

                  // Dynamic placeholder text
                  let placeholderText = 'Enter details';
                  if (selectedRef === 'Architect') {
                    placeholderText = 'Enter architect name';
                  } else if (selectedRef === 'Existing Client Reference') {
                    placeholderText = 'Enter client reference name';
                  } else if (selectedRef === 'Other') {
                    placeholderText = 'Enter other reference';
                  }

                  return (
                    <input
                      type="text"
                      name="reference_other"
                      value={singleFormData.reference_other || ''}
                      onChange={handleInputChange}
                      placeholder={placeholderText}
                      className="w-full p-2 mt-2 border rounded-md text-sm
                               focus:ring-2 focus:ring-blue-500
                               dark:border-form-strokedark dark:bg-form-input dark:text-white"
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
                  {/* City Field */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm dark:text-white">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={singleFormData.city || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>

                  {/* Room Dimensions (L / W / H) */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm dark:text-white">
                      Room Dimensions
                    </label>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Length */}
                      <div>
                        <label className="block mb-1 text-xs dark:text-white text-gray-500">
                          Length (L) ft
                        </label>
                        <input
                          type="text"
                          name="room_length"
                          value={singleFormData.room_length}
                          onChange={handleInputChange}
                          placeholder="e.g., 12.5"
                          pattern="\d*\.?\d*"
                          title="Only digits and decimal point allowed"
                          className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      </div>

                      {/* Width */}
                      <div>
                        <label className="block mb-1 text-xs dark:text-white text-gray-500">
                          Width (W) ft
                        </label>
                        <input
                          type="text"
                          name="room_width"
                          value={singleFormData.room_width}
                          onChange={handleInputChange}
                          placeholder="e.g., 10.75"
                          pattern="\d*\.?\d*"
                          title="Only digits and decimal point allowed"
                          className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      </div>

                      {/* Height */}
                      <div>
                        <label className="block mb-1 text-xs dark:text-white text-gray-500">
                          Height (H) ft
                        </label>
                        <input
                          type="text"
                          name="room_height"
                          value={singleFormData.room_height}
                          onChange={handleInputChange}
                          placeholder="e.g., 9.0"
                          pattern="\d*\.?\d*"
                          title="Only digits and decimal point allowed"
                          className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Project Type
                </label>
                <select
                  name="p_type"
                  value={singleFormData.p_type || ''}
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
                <label className="block mb-1 text-sm dark:text-white">
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
                    ].includes(singleFormData.budget_range || '')
                      ? singleFormData.budget_range
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

                {
                  [
                    'Basic Range: Above ₹7 Lakh',
                    'Premium Range: Above ₹10 Lakh',
                    'Ultra-Premium Range: Above ₹15 Lakh',
                    'Elite Range: Above ₹25 Lakh',
                  ].includes(singleFormData.budget_range || '') === false && singleFormData.budget_range !== '' && (
                    <input
                      type="text"
                      name="budget_range_custom"
                      value={singleFormData.budget_range || ''}
                      onChange={handleInputChange}
                      placeholder="Enter custom budget"
                      className="w-full p-2 mt-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  )}
              </div>

              {/* Current Stage */}
              <div className="-mt-2">
                <label className="block mb-1 text-sm dark:text-white">
                  What's the current stage of your home theater room?
                </label>
                <select
                  name="current_stage"
                  value={singleFormData.current_stage || ''}
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
                <label className="block mb-1 text-sm dark:text-white">
                  Site Visit Date
                </label>
                <input
                  type="date"
                  name="site_visit_date"
                  value={singleFormData.site_visit_date || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Demo Date */}
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Demo Date
                </label>
                <input
                  type="date"
                  name="demo_date"
                  value={singleFormData.demo_date || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

           

              {/* Entry Date - Read Only */}
              <div>
                <label className="block mb-1 text-sm dark:text-white">
                  Entry Date
                </label>
                <input
                  type="date"
                  name="assign_date"
                  value={singleFormData.assign_date || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white bg-gray-100 cursor-not-allowed"
                  readOnly
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Entry date cannot be modified</p>
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
                  value={singleFormData.ar_number || ''}
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
                  value={singleFormData.architect_name || ''}
                  onChange={handleInputChange}
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
                  value={singleFormData.ca_number || ''}
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
                  value={singleFormData.e_number || ''}
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
                  value={singleFormData.sm_number || ''}
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
                  value={singleFormData.pop_number || ''}
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
                  value={singleFormData.other_number || ''}
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
              {/* Assign To - MULTI SELECT with Checkboxes, Search, and 5 Columns */}
              <div className="md:col-span-3">
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Assign To
                </label>

                {/* Search Box */}
                <div className="mb-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                  <div className="mb-2 pb-2 border-b dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      {filteredUsers.length > 0 &&
                        filteredUsers.every(user =>
                          Array.isArray(singleFormData.assigned_to) &&
                          singleFormData.assigned_to.includes(user.user_id)
                        )
                        ? 'Deselect All Filtered'
                        : 'Select All Filtered'}
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {Array.isArray(singleFormData.assigned_to) ? singleFormData.assigned_to.length : 0} selected
                    </span>
                  </div>

                  {/* Users List - 5 Columns */}
                  {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {filteredUsers.map((user) => {
                        const isSelected = Array.isArray(singleFormData.assigned_to) &&
                          singleFormData.assigned_to.includes(user.user_id);
                        return (
                          <div
                            key={user.user_id}
                            className={`flex items-start p-2 rounded transition-colors ${isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                                : 'border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                              }`}
                          >
                            <input
                              type="checkbox"
                              id={`user-${user.user_id}`}
                              checked={isSelected}
                              onChange={() => handleUserCheckboxChange(user.user_id)}
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 mt-1"
                            />
                            <label
                              htmlFor={`user-${user.user_id}`}
                              className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                            >
                              <div className="font-medium line-clamp-1">{user.name}</div>
                            
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <div className="text-2xl mb-2">🔍</div>
                      <p className="text-sm">No users found</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>

                {/* Selected Users Preview */}
                {Array.isArray(singleFormData.assigned_to) && singleFormData.assigned_to.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
                    <div className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-medium">
                      Selected Users ({singleFormData.assigned_to.length}):
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {singleFormData.assigned_to.map(userId => {
                        const user = users.find(u => u.user_id === userId);
                        return user ? `${user.name}${user.role ? ` (${user.role})` : ''}` : userId;
                      }).join(', ')}
                    </div>
                  </div>
                )}
              </div>

   {/* Follow-up Date */}
              <div className="md:col-span-1 mt-4 ">
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  name="followup_date"
                  value={singleFormData.followup_date || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              <div className="md:col-span-1 mt-4 ">
                <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                  Lead Stage
                </label>
                <select
                  name="lead_stage"
                  value={singleFormData.lead_stage || ''}
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
              </div>

              <div className="md:col-span-1 mt-4">
                <label className="block mb-1 text-sm dark:text-white">
                  Quick Remark
                </label>
                <select
                  name="quick_remark"
                  value={singleFormData.quick_remark || ''}
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

            <div className="mt-3">
              <label className="block mb-1 text-base font-semibold text-green-700 dark:text-green-600">
                Detailed Remark
              </label>
              <textarea
                name="detailed_remark"
                value={singleFormData.detailed_remark || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Add detailed remark here..."
                className="w-full p-2 border rounded text-sm
               dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-strokedark">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Add Client
            </button>
            <button
              type="button"
              onClick={() => setShowAddPopup(false)}
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

export default InsertDataModal;  

