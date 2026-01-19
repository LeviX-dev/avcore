import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';

interface TeleCallerData {
  name: string;
  cat_id: string;
  tc_status: string;
  tc_remark: string;
  tc_call_duration: string;
  master_id: number;
  category: string;
  quick_remark?: string;
  detailed_remark?: string;
  lead_stage?: string;
  assigned_to?: string | string[];
  telecaller_name?: string;
  followup_date?: string;
  assigned_to_ids?: string; 

    number?: string; // For contact number
  reassignment_remarks?: any[]; // For reassignment history

}

interface EditTeleCallerFormProps {
  data: TeleCallerData;
  onClose: () => void;
  onUpdate: () => void;
}

const EditTeleCallerForm: React.FC<EditTeleCallerFormProps> = ({
  data,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: data.name || '',
    call_status: data.quick_remark || '',
    call_remark: data.tc_remark || '',
    master_id: data.master_id || 0,
    cat_id: data.cat_id || 0,
    next_followup_date: data.followup_date || '',
    lead_stage: data.lead_stage || '',
    quick_remark: data.quick_remark || '',
    detailed_remark: data.detailed_remark || '', 
      contact_number: data.number || '',
  });

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [tcStatuses, setTcStatuses] = useState<string[]>([]);
  const [leadStages, setLeadStages] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const rawUserId = localStorage.getItem('user_id');
  const currentUserId = rawUserId && !isNaN(parseInt(rawUserId)) ? parseInt(rawUserId) : null;

  // Initialize selected users from data
  useEffect(() => {
    const initializeSelectedUsers = () => {
      if (data.assigned_to) {
        if (Array.isArray(data.assigned_to)) {
          setSelectedUsers(data.assigned_to);
        } else if (typeof data.assigned_to === 'string') {
          if (data.assigned_to.includes(',')) {
            setSelectedUsers(data.assigned_to.split(',').map(s => s.trim()));
          } else {
            setSelectedUsers([data.assigned_to.trim()]);
          }
        }
      } else if (data.telecaller_name) {
        setSelectedUsers([data.telecaller_name.trim()]);
      }
    };

    initializeSelectedUsers();
  }, [data.assigned_to, data.telecaller_name]);

  // Initialize user IDs if available
  useEffect(() => {
    if (data.assigned_to_ids) {
      if (typeof data.assigned_to_ids === 'string') {
        if (data.assigned_to_ids.includes(',')) {
          setSelectedUserIds(data.assigned_to_ids.split(',').map(s => s.trim()));
        } else {
          setSelectedUserIds([data.assigned_to_ids.trim()]);
        }
      }
    }
  }, [data.assigned_to_ids]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories
        const categoriesRes = await axios.get(`${BASE_URL}api/categories`);
        const categoryData = categoriesRes.data.map((cat: any) => ({
          id: cat.cat_id,
          name: cat.cat_name,
        }));
        setCategories(categoryData);

        // Auto-select category if exists in data
        const matchedCategory = categoryData.find(
          (cat) => cat.name.toLowerCase() === data.category?.toLowerCase(),
        );
        if (matchedCategory) {
          setFormData((prev) => ({
            ...prev,
            category: matchedCategory.id.toString(),
            cat_id: matchedCategory.id,
          }));
        }

        // Fetch telecaller statuses
        const tcStatusRes = await axios.get(`${BASE_URL}api/tcstatus`);
        setTcStatuses(tcStatusRes.data);

        // Fetch lead stages
        const leadStagesRes = await axios.get(`${BASE_URL}api/leadstage`);
        setLeadStages(leadStagesRes.data);

        // Fetch users
        const usersRes = await axios.get(`${BASE_URL}api/users`);
        console.log('Users fetched:', usersRes.data);
        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data); // Initialize filtered users

      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [data.category]);

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


  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
) => {
  const { name, value } = e.target;
  
  // Auto-copy quick_remark (call_status) to detailed_remark when quick_remark is selected
  if (name === 'call_status' && value) {
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value,
      detailed_remark: value // Copy to detailed_remark
    }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
  
  // Clear error when field is updated
  if (formErrors[name]) {
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  }
};



  const handleUserSelection = (userName: string, userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userName)) {
        // Remove user
        const newUsers = prev.filter(name => name !== userName);
        
        // Also remove from userIds
        setSelectedUserIds(prevIds => prevIds.filter(id => {
          const user = users.find(u => u.name === userName);
          return user ? id !== user.user_id : true;
        }));
        
        return newUsers;
      } else {
        // Add user
        const newUsers = [...prev, userName];
        
        // Also add userId
        const user = users.find(u => u.name === userName);
        if (user) {
          setSelectedUserIds(prevIds => [...prevIds, user.user_id]);
        }
        
        return newUsers;
      }
    });

    // Clear assigned users error
    if (formErrors.assignedUsers) {
      setFormErrors(prev => ({ ...prev, assignedUsers: '' }));
    }
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      // Deselect all filtered users
      const newSelectedUsers = selectedUsers.filter(name => 
        !filteredUsers.some(user => user.name === name)
      );
      setSelectedUsers(newSelectedUsers);
      
      // Also remove user IDs
      const newSelectedUserIds = selectedUserIds.filter(id => 
        !filteredUsers.some(user => user.user_id === id)
      );
      setSelectedUserIds(newSelectedUserIds);
    } else {
      // Select all filtered users
      const filteredUserNames = filteredUsers.map(user => user.name);
      const filteredUserIds = filteredUsers.map(user => user.user_id);
      
      // Combine with already selected users (avoiding duplicates)
      const allUserNames = [...new Set([...selectedUsers, ...filteredUserNames])];
      const allUserIds = [...new Set([...selectedUserIds, ...filteredUserIds])];
      
      setSelectedUsers(allUserNames);
      setSelectedUserIds(allUserIds);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Client name is required';
    }

    if (!formData.cat_id) {
      errors.category = 'Category is required';
    }

    // Removed validation for call_status (Quick Remark)
    // if (!formData.call_status) {
    //   errors.call_status = 'Quick remark is required';
    // }

    if (!formData.next_followup_date) {
      errors.next_followup_date = 'Follow-up date is required';
    } else {
      const selectedDate = new Date(formData.next_followup_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.next_followup_date = 'Follow-up date cannot be in the past';
      }
    }

    if (!formData.lead_stage) {
      errors.lead_stage = 'Lead stage is required';
    }

    if (selectedUsers.length === 0) {
      errors.assignedUsers = 'At least one user must be assigned';
    }

    // Removed validation for detailed_remark
    // if (!formData.detailed_remark?.trim()) {
    //   errors.detailed_remark = 'Detailed remark is required';
    // }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get user IDs for selected names
    const finalSelectedUserIds = selectedUsers.map(userName => {
      const user = users.find(u => u.name === userName);
      return user ? user.user_id : '';
    }).filter(id => id);

    const payload = {
      master_id: formData.master_id,
      cat_id: formData.cat_id,
      client_name: formData.name,
      call_status: formData.call_status,
      quick_remark: formData.quick_remark || 'Assigned',
      detailed_remark: formData.detailed_remark,
      tc_next_followup_date: formData.next_followup_date || null,
      raw_data_status: 'Assigned',
      created_by_user: currentUserId,
      lead_stage: formData.lead_stage || 'Cold Lead',
      assigned_to_names: selectedUsers,
      assigned_to_ids: finalSelectedUserIds,
    };

    console.log('Sending payload:', {
      ...payload,
      detailed_remark: payload.detailed_remark?.substring(0, 100) + '...'
    });

    try {
      setIsLoading(true);
      const response = await axios.put(`${BASE_URL}api/edittelecaller`, payload, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        alert(`✅ Lead updated successfully!\n\n` +
              `📅 Follow-Up Date: ${formData.next_followup_date}\n` +
              `👥 Assigned to: ${selectedUsers.join(', ')}\n` +
              `📋 Lead Stage: ${formData.lead_stage}\n` +
              `💬 Quick Remark: ${formData.call_status}`);
        onUpdate();
        onClose();
      } else {
        alert(`❌ ${response.data.message || 'Update failed'}`);
      }
    } catch (err: any) {
      console.error('Error updating data:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to update lead. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedUserNames = () => {
    return selectedUsers.map(userName => {
      const user = users.find(u => u.name === userName);
      return user ? `${user.name} (${user.role})` : userName;
    }).filter(name => name);
  };

  const removeSelectedUser = (userName: string) => {
    handleUserSelection(userName, '');
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-boxdark p-8 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-center text-gray-700 dark:text-gray-300 font-medium">
            Loading form data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center mt-10 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-9/12 max-w-2xl  mt-10 mb-10 max-h-[90vh] overflow-y-auto dark:border-strokedark dark:bg-boxdark">
        <div className="flex justify-between items-center border-b-2 border-gray-200 dark:border-gray-700 mb-6 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              📞 Update Lead Information
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Update lead details and assign to team members
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleEdit} className="space-y-8">
{/* Basic Information Section */}
<div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl">
  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2">
    📋 Basic Information
  </h3>
  
  {/* ADD CONTACT NUMBER HERE */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
    {/* Client Name */}
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
        Client Name *
      </label>
      <input
        type="text"
        name="name"
        className={`w-full p-3 border rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          formErrors.name 
            ? 'border-red-500 dark:border-red-500' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter client name"
        required
      />
      {formErrors.name && (
        <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
      )}
    </div>

    {/* ADDED: Contact Number */}
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
        Contact No.
      </label>
      <input
        type="text"
        name="contact_number" // You might need to add this to your formData state
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        value={data.number || ''} // Assuming data has a 'number' field
        readOnly // Make it read-only since it's for display
        placeholder="Contact number"
      />
    </div>

    {/* Category */}
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
        Category *
      </label>
      <select
        name="category"
        value={formData.cat_id}
        onChange={(e) => {
          const val = e.target.value;
          setFormData((prev) => ({
            ...prev,
            category: val,
            cat_id: parseInt(val, 10),
          }));
          if (formErrors.category) {
            setFormErrors(prev => ({ ...prev, category: '' }));
          }
        }}
        className={`w-full p-3 border rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          formErrors.category 
            ? 'border-red-500 dark:border-red-500' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
        required
      >
        <option value="">Select category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      {formErrors.category && (
        <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
      )}
    </div>
  </div>
</div>

          {/* Lead Management Section */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2">
              🎯 Lead Management
            </h3>

            {/* First Row: Quick Remark, Follow-Up Date, Lead Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {/* QUICK REMARK */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                  Quick Remark {/* Removed * */}
                </label>
                <select
                  name="call_status"
                  className={`w-full p-3 border rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    formErrors.call_status 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  value={formData.call_status}
                  onChange={handleChange}
                  // Removed required attribute
                >
                  <option value="">Select Quick Remark</option>
                  {tcStatuses.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {formErrors.call_status && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.call_status}</p>
                )}
              </div>

              {/* FOLLOW-UP DATE */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                  Follow-Up Date *
                 
                </label>
                <input
                  type="date"
                  name="next_followup_date"
                  value={formatDateForInput(formData.next_followup_date)}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    formErrors.next_followup_date 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                />
                {formErrors.next_followup_date && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.next_followup_date}</p>
                )}
              
              </div>

              {/* LEAD STAGE */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                  Lead Stage *
                </label>
                <select
                  name="lead_stage"
                  value={formData.lead_stage || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    formErrors.lead_stage 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  <option value="">Select Lead Stage</option>
                  {leadStages.map((stage, index) => (
                    <option key={index} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
                {formErrors.lead_stage && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.lead_stage}</p>
                )}
              </div>
            </div>

          
          {/* Assigned To (Multiple) - Checkbox Style with Search and 5 Columns */}
<div className="mb-6">
  <div className="flex justify-between items-center mb-3">
    <label className="block text-sm font-medium text-gray-700 dark:text-white">
      Assigned To (Multiple) *
    </label>
    <div className="flex gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {selectedUsers.length} of {users.length} selected
      </span>
      <button
        type="button"
        onClick={handleSelectAllUsers}
        className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors whitespace-nowrap"
      >
        {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All Filtered'}
      </button>
    </div>
  </div>
  
  {/* Search Box */}
  <div className="mb-4">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        placeholder="Search users by name or role..."
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => setSearchTerm('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  
  {/* Selected Users Preview */}
  {selectedUsers.length > 0 && (
    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="text-xs text-blue-700 dark:text-blue-300 mb-2 font-medium">
        Selected Users ({selectedUsers.length}):
      </div>
      <div className="flex flex-wrap gap-2">
        {getSelectedUserNames().map((userName, index) => (
          <span 
            key={index} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-700 max-w-[180px]"
          >
            <span className="truncate" title={userName}>
              {userName}
            </span>
            <button
              type="button"
              onClick={() => removeSelectedUser(selectedUsers[index])}
              className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-bold flex-shrink-0"
              aria-label={`Remove ${userName}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )}
  
  {/* Users Checkbox Grid - 5 Columns */}
  <div className={`border rounded-lg p-4 max-h-64 overflow-y-auto transition-colors ${
    formErrors.assignedUsers 
      ? 'border-red-500 dark:border-red-500' 
      : 'border-gray-300 dark:border-gray-600'
  }`}>
    {filteredUsers.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredUsers.map((user) => {
          // Helper function to format role display
          const formatRoleForDisplay = (role: string) => {
            if (!role) return 'No role';
            if (role.length > 18) return role.substring(0, 16) + '...';
            return role;
          };

          return (
            <div 
              key={user.user_id} 
              className={`flex flex-col p-3 rounded-lg transition-all min-w-[140px] ${
                selectedUsers.includes(user.name)
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm'
                  : 'border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-start mb-2">
                <input
                  type="checkbox"
                  id={`user-${user.user_id}`}
                  checked={selectedUsers.includes(user.name)}
                  onChange={() => handleUserSelection(user.name, user.user_id)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 mt-1 flex-shrink-0"
                />
                <label 
                  htmlFor={`user-${user.user_id}`}
                  className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1 min-w-0"
                >
                  <div 
                    className="font-medium truncate mb-1"
                    title={user.name}
                  >
                    {user.name}
                  </div>
                  <div 
                    className="text-xs text-gray-500 dark:text-gray-400 truncate w-full"
                    title={user.role || 'No role'}
                  >
                    {formatRoleForDisplay(user.role || 'No role')}
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-3xl mb-3">🔍</div>
        <p className="font-medium">No users found</p>
        <p className="text-xs mt-1">Try a different search term</p>
      </div>
    )}
  </div>
  
  {formErrors.assignedUsers && (
    <p className="text-red-500 text-xs mt-2">{formErrors.assignedUsers}</p>
  )}
</div>



{/* Add this section after the Detailed Remark section, before the Submit Buttons */}

{/* Reassignment History Section - Without FontAwesome */}
{Array.isArray(data.reassignment_remarks) && data.reassignment_remarks.length > 0 && (
  <div className="mt-6 bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl">
    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2 flex items-center gap-2">
      <span className="text-yellow-500">📋</span>
      Reassignment History ({data.reassignment_remarks.length})
    </h3>

    <div className="bg-white dark:bg-boxdark border rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
      {data.reassignment_remarks
        .slice()
        .sort((a: any, b: any) => {
          const dateA = new Date(a?.reassignment_date || a?.created_at || 0).getTime();
          const dateB = new Date(b?.reassignment_date || b?.created_at || 0).getTime();
          return dateB - dateA; // Latest first
        })
        .map((remarkObj: any, index: number) => {
          const displayNumber = index + 1;

          // Object format
          if (remarkObj && typeof remarkObj === 'object') {
            return (
              <div
                key={index}
                className="border rounded p-3 text-xs bg-gray-50 dark:bg-gray-800"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-1">
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

                  <span className="text-[10px] text-gray-500">
                    {remarkObj.reassignment_date || remarkObj.created_at || ''}
                  </span>
                </div>

                {/* From → To */}
                {remarkObj.assignedTo && (
                  <div className="text-gray-700 dark:text-gray-300 mb-1">
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

                {/* Remark */}
                {remarkObj.remark && (
                  <div className="bg-white dark:bg-gray-900 px-2 py-1 rounded text-gray-800 dark:text-gray-200 text-[11px]">
                    {remarkObj.remark}
                  </div>
                )}
              </div>
            );
          }

          // Legacy string format
          if (typeof remarkObj === 'string') {
            return (
              <div
                key={index}
                className="border rounded p-3 text-xs bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-blue-600">
                    #{displayNumber}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Legacy Format
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

            {/* DETAILED REMARK */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                Detailed Remark {/* Removed * */}
              </label>
              <textarea
                name="detailed_remark"
                value={formData.detailed_remark}
                onChange={handleChange}
                rows={5}
                className={`w-full p-3 border rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  formErrors.detailed_remark 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                // Removed required attribute
              />
              {formErrors.detailed_remark && (
                <p className="text-red-500 text-xs mt-1">{formErrors.detailed_remark}</p>
              )}
              <div className="flex justify-between mt-2">
               
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.detailed_remark?.length || 0} characters
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedUsers.length === 0}
              className={`px-6 py-3 rounded-lg text-sm font-medium text-white transition-colors duration-200 flex items-center gap-2 ${
                isLoading || selectedUsers.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Lead
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeleCallerForm;