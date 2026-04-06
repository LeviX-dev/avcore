// StartExecutionModal.tsx - FIXED VERSION (no hook order violations)

import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config";
import { FiEye } from "react-icons/fi";

/* ================= TYPES ================= */

interface Lead {
  master_id: number;
  execution_id?: number;
  [key: string]: any;
}

interface Schedule {
  schedule_id: number;
  schedule_name: string;
  description?: string;
}

interface User {
  user_id: number;
  name: string;
}

interface StartExecutionModalProps {
  show: boolean;
  onClose: () => void;
  lead?: Lead;
  schedules: Schedule[];
  users: User[];
  selectedLeads?: Lead[];
  onStartExecution: (data: any) => void;
  executionId?: number;
}

/* ================= COMPONENT ================= */

const StartExecutionModal: React.FC<StartExecutionModalProps> = ({
  show,
  onClose,
  lead,
  schedules,
  users,
  selectedLeads = [],
  onStartExecution,
  executionId: propExecutionId,
}) => {
  // ========== ALL useState hooks MUST be at the top ==========
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [remark, setRemark] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [scheduleDetails, setScheduleDetails] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("startExecution");
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [selectedScheduleForModal, setSelectedScheduleForModal] = useState<Schedule | null>(null);
  const [originalStatus, setOriginalStatus] = useState<string>("");
  const [originalRemark, setOriginalRemark] = useState<string>("");
  const [originalStartDate, setOriginalStartDate] = useState<string>("");
  const [originalEndDate, setOriginalEndDate] = useState<string>("");
  const [existingExecutionId, setExistingExecutionId] = useState<number | null>(null);

  // ========== ALL useEffect hooks must be at the top ==========
  
  /* Fetch schedule details when selectedSchedule changes */
  useEffect(() => {
    if (!selectedSchedule) {
      setScheduleDetails([]);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}api/execution/schedule-mapping/${selectedSchedule}`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setScheduleDetails(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching schedule mapping:", error);
      }
    };

    fetchDetails();
  }, [selectedSchedule]);

  /* Prefill execution data when modal opens */
  useEffect(() => {
    if (!show || selectedLeads.length === 0) return;

    const leadData = selectedLeads[0];
    const leadId = leadData?.master_id;
    
    // Check if lead already has an execution_id from the prefill data
    if (leadData?.execution_id) {
      console.log("Lead has existing execution_id:", leadData.execution_id);
      setExistingExecutionId(leadData.execution_id);
    }

    if (!leadId) return;

    const fetchPrefill = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}api/execution/prefill/${leadId}`,
          { withCredentials: true }
        );

        if (res.data.success && res.data.exists) {
          const d = res.data.data;

          setSelectedSchedule(String(d.schedule_id || ""));
          setStartDate(d.start_date || "");
          setEndDate(d.end_date || "");
          setRemark(d.remark || "");
          setSelectedUsers(d.assigned_users || []);
          setSelectedUserIds(d.assigned_user_ids || []);
          setStatus(d.status || "startExecution");
          
          // Store original values for comparison
          setOriginalStatus(d.status || "startExecution");
          setOriginalRemark(d.remark || "");
          setOriginalStartDate(d.start_date || "");
          setOriginalEndDate(d.end_date || "");
          
          // Store the execution ID if available from prefill response
          if (d.execution_id) {
            setExistingExecutionId(d.execution_id);
          }
        } else {
          // Reset for new execution
          setExistingExecutionId(null);
          setSelectedSchedule("");
          setStartDate("");
          setEndDate("");
          setRemark("");
          setSelectedUsers([]);
          setSelectedUserIds([]);
          setStatus("startExecution");
          setOriginalStatus("");
          setOriginalRemark("");
          setOriginalStartDate("");
          setOriginalEndDate("");
        }
      } catch (err) {
        console.error("Prefill execution error:", err);
      }
    };

    fetchPrefill();
  }, [show, selectedLeads]);

  /* ========== CONDITIONAL RETURN (after all hooks) ========== */
  if (!show) return null;

  /* ========== DERIVED VALUES ========== */
  const groupedDetails = scheduleDetails.reduce((acc: any, curr: any) => {
    if (!acc[curr.type_name]) {
      acc[curr.type_name] = [];
    }
    acc[curr.type_name].push(curr.process_name);
    return acc;
  }, {});

  const isUpdateMode = !!existingExecutionId || !!propExecutionId;

  /* ========== HANDLERS ========== */
  const handleEyeIconClick = () => {
    if (!selectedSchedule) {
      alert("Please select a schedule first");
      return;
    }

    const schedule = schedules.find(
      (s) => s.schedule_id == Number(selectedSchedule)
    );

    if (schedule) {
      setSelectedScheduleForModal(schedule);
      setShowScheduleModal(true);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If we have an existing execution ID, use UPDATE endpoint
    if (existingExecutionId) {
      console.log("Updating existing execution:", existingExecutionId);
      
      // Check if status or remark changed
      const statusChanged = status !== originalStatus;
      const remarkChanged = remark !== originalRemark;
      const startDateChanged = startDate !== originalStartDate;
      const endDateChanged = endDate !== originalEndDate;
      const usersChanged = JSON.stringify(selectedUserIds) !== JSON.stringify(
        selectedLeads[0]?.assigned_user_ids || []
      );
      
      const hasChanges = statusChanged || remarkChanged || startDateChanged || endDateChanged || usersChanged;
      
      if (!hasChanges) {
        alert("No changes to update");
        onClose();
        return;
      }

      try {
        const updateData: any = {};
        if (statusChanged) updateData.status = status;
        if (remarkChanged) updateData.remark = remark;
        if (startDateChanged) updateData.start_date = startDate;
        if (endDateChanged) updateData.end_date = endDate;
        if (usersChanged) {
          updateData.assigned_users = selectedUsers;
          updateData.assigned_user_ids = selectedUserIds;
        }

        const response = await axios.put(
          `${BASE_URL}api/execution/update/${existingExecutionId}`,
          updateData,
          { withCredentials: true }
        );

        if (response.data.success) {
          alert("Execution updated successfully");
          onStartExecution(response.data);
          onClose();
        }
      } catch (error) {
        console.error("Update execution error:", error);
        alert("Failed to update execution");
      }
    } 
    // Check if we have an execution ID from props (alternative)
    else if (propExecutionId) {
      // UPDATE MODE - Only send status and remark
      const statusChanged = status !== originalStatus;
      const remarkChanged = remark !== originalRemark;
      
      if (!statusChanged && !remarkChanged) {
        alert("No changes to update");
        onClose();
        return;
      }

      try {
        const updateData: any = {};
        if (statusChanged) updateData.status = status;
        if (remarkChanged) updateData.remark = remark;

        const response = await axios.put(
          `${BASE_URL}api/execution/update/${propExecutionId}`,
          updateData,
          { withCredentials: true }
        );

        if (response.data.success) {
          alert("Execution status updated successfully");
          onStartExecution(response.data);
          onClose();
        }
      } catch (error) {
        console.error("Update status error:", error);
        alert("Failed to update execution status");
      }
    } 
    else {
      // ✅ CREATE MODE - Create new execution
      if (!selectedSchedule || !startDate || !endDate || selectedUsers.length === 0) {
        alert("Please fill all required fields");
        return;
      }

      const selectedScheduleObj = schedules.find(
        (s) => s.schedule_id == Number(selectedSchedule)
      );

      const executionData = {
        schedule_id: selectedSchedule,
        schedule_name: selectedScheduleObj?.schedule_name || "",
        start_date: startDate,
        end_date: endDate,
        remark,
        status,
        assigned_users: selectedUsers,
        assigned_user_ids: selectedUserIds,
        lead_ids: selectedLeads.map((lead) => lead.master_id),
      };

      try {
        const response = await axios.post(
          `${BASE_URL}api/execution/start`,
          executionData,
          { withCredentials: true }
        );

        if (response.data.success) {
          alert("Execution started successfully");
          onStartExecution(response.data);
          onClose();
        }
      } catch (error) {
        console.error("Create execution error:", error);
        alert("Failed to start execution");
      }
    }
  };

  /* ========== RENDER ========== */
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center pt-20 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">
          <div className="p-5 border-b bg-gray-50 rounded-t-xl">
            <h3 className="text-xl font-semibold text-gray-800">
              {isUpdateMode ? "Update Execution" : "Start Execution"}
            </h3>
            {isUpdateMode && (
              <p className="text-sm text-gray-500 mt-1">
                Update execution details below
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Schedule - Read Only in Update Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Schedule {!isUpdateMode && "*"}
              </label>
              <div className="flex gap-2">
                {isUpdateMode ? (
                  <div className="flex-1 p-3 border rounded-lg bg-gray-100 text-gray-700 flex items-center">
                    {schedules.find(s => s.schedule_id === Number(selectedSchedule))?.schedule_name || 'Schedule not found'}
                  </div>
                ) : (
                  <select
                    value={selectedSchedule}
                    onChange={(e) => setSelectedSchedule(e.target.value)}
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">-- Choose Schedule --</option>
                    {schedules.map((schedule) => (
                      <option key={schedule.schedule_id} value={schedule.schedule_id}>
                        {schedule.schedule_name}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={handleEyeIconClick}
                  className="px-4 py-3 bg-gray-100 border rounded-lg hover:bg-gray-200"
                  disabled={!selectedSchedule}
                >
                  <FiEye className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Status - Always editable */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Execution Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="startExecution">Select Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="hold_by_client">Hold by Client</option>
                <option value="hold_by_avcore">Hold by Avcore</option>
                <option value="complete">Complete</option>
              </select>
              {isUpdateMode && originalStatus && status !== originalStatus && (
                <p className="text-xs text-blue-500 mt-1">
                  Status will change from "{originalStatus}" to "{status}"
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date {!isUpdateMode && "*"}
                </label>
                {isUpdateMode ? (
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date {!isUpdateMode && "*"}
                </label>
                {isUpdateMode ? (
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>
            </div>

            {/* Remark */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Remark (optional)
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Enter any remarks or notes..."
              />
            </div>

            {/* Users */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Assigned Users {!isUpdateMode && "*"}
              </label>
              {isUpdateMode ? (
                <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 border rounded-lg">
                  {users.map((user) => (
                    <label key={user.user_id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.user_id)}
                        onChange={() => {
                          if (selectedUserIds.includes(user.user_id)) {
                            setSelectedUserIds(selectedUserIds.filter(id => id !== user.user_id));
                            setSelectedUsers(selectedUsers.filter(u => u !== user.name));
                          } else {
                            setSelectedUserIds([...selectedUserIds, user.user_id]);
                            setSelectedUsers([...selectedUsers, user.name]);
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">{user.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {users.map((user) => (
                    <label key={user.user_id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.user_id)}
                        onChange={() => {
                          if (selectedUserIds.includes(user.user_id)) {
                            setSelectedUserIds(selectedUserIds.filter(id => id !== user.user_id));
                            setSelectedUsers(selectedUsers.filter(u => u !== user.name));
                          } else {
                            setSelectedUserIds([...selectedUserIds, user.user_id]);
                            setSelectedUsers([...selectedUsers, user.name]);
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">{user.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button 
                type="submit"
                className={`px-5 py-2 rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white`}
              >
                {isUpdateMode ? "Update Execution" : "Start Execution"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Schedule Details Modal */}
      {showScheduleModal && selectedScheduleForModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex justify-center pt-28 px-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[55vh] overflow-y-auto">
            <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center rounded-t-lg">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  Schedule Details
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedScheduleForModal.schedule_name}
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              {scheduleDetails.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(groupedDetails).map(
                    ([typeName, processes]: any) => (
                      <div key={typeName} className="border rounded-md p-3">
                        <p className="text-xs font-semibold text-indigo-600 mb-2">
                          {typeName}
                        </p>
                        <ul className="space-y-1">
                          {processes.map((process: string, index: number) => (
                            <li key={index} className="text-xs text-gray-700">
                              • {process}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No schedule details
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end rounded-b-lg">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StartExecutionModal;