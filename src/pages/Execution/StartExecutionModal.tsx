import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config";
import { FiEye } from "react-icons/fi";

/* ================= TYPES ================= */

interface Lead {
  master_id: number;
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
  executionId?: number;   // ✅ SAFE ADD (no breaking change)
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
  executionId,   // ✅ SAFE USE
}) => {

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

  
  /* ================= FETCH SCHEDULE DETAILS ================= */

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

  /* ================= PREFILL EXECUTION ================= */

  useEffect(() => {
  if (!show || selectedLeads.length === 0) return;

  const leadId = selectedLeads[0]?.master_id;
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
        setStartDate(d.start_date || "");  // Already in YYYY-MM-DD format
        setEndDate(d.end_date || "");      // Already in YYYY-MM-DD format
        setRemark(d.remark || "");
        setSelectedUsers(d.assigned_users || []);
        setSelectedUserIds(d.assigned_user_ids || []);
        setStatus(d.status || "startExecution"); // ✅ Now properly set
      }
    } catch (err) {
      console.error("Prefill execution error:", err);
    }
  };

  fetchPrefill();
}, [show, selectedLeads]);


  /* ================= GROUP TYPE + PROCESS ================= */

  const groupedDetails = scheduleDetails.reduce((acc: any, curr: any) => {
    if (!acc[curr.type_name]) {
      acc[curr.type_name] = [];
    }
    acc[curr.type_name].push(curr.process_name);
    return acc;
  }, {});

  /* ================= HANDLE EYE ICON CLICK ================= */
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
    setShowScheduleModal(true);  // ✅ This sets modal to true
  }
};
  if (!show) return null;

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      let response;

      if (executionId) {
        // ✅ UPDATE - Remove schedule_id from update data since it shouldn't change
        const { schedule_id, schedule_name, ...updateData } = executionData;
        response = await axios.put(
          `${BASE_URL}api/execution/update/${executionId}`,
          updateData,  // Send only updatable fields
          { withCredentials: true }
        );
      } else {
        // ✅ CREATE
        response = await axios.post(
          `${BASE_URL}api/execution/start`,
          executionData,
          { withCredentials: true }
        );
      }

      if (response.data.success) {
        alert(executionId ? "Execution updated" : "Execution started");
        onStartExecution(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Execution save error:", error);
      alert("Failed to save execution");
    }
  };

  /* ================= UI ================= */

  return (
<>
  <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center pt-20 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">

      <div className="p-5 border-b bg-gray-50 rounded-t-xl">
        <h3 className="text-xl font-semibold text-gray-800">
          {executionId ? "Update Execution" : "Start Execution"}
        </h3>
       
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Schedule - Read Only in Update Mode */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Schedule *
          </label>

          <div className="flex gap-2">
            {executionId ? (
              // Read-only display for update mode
              <div className="flex-1 p-3 border rounded-lg bg-gray-100 text-gray-700 flex items-center">
                {schedules.find(s => s.schedule_id === Number(selectedSchedule))?.schedule_name || 'Schedule not found'}
              </div>
            ) : (
              // Editable select for create mode
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
              disabled={!selectedSchedule} // Disable if no schedule selected
            >
              <FiEye className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          {executionId && (
            <p className="text-xs text-gray-500 mt-1">Schedule cannot be changed after creation</p>
          )}
        </div>

        {/* Status */}
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
            <option value="startExecution">Select</option>
            <option value="in_progress">In Progress</option>
            <option value="hold_by_client">Hold by Client</option>
            <option value="hold_by_avcore">Hold by Avcore</option>
            <option value="complete">Complete</option>
          </select>
        </div>

        {/* Dates with Labels */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                // Optional: Clear end date if it's before new start date
                if (endDate && new Date(endDate) < new Date(e.target.value)) {
                  setEndDate('');
                }
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                !startDate ? 'border-gray-300' : 'border-gray-300'
              }`}
              required
            />
            {!startDate && (
              <p className="text-xs text-red-500 mt-1">Start date is required</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate} // Ensures end date is not before start date
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                !endDate ? 'border-gray-300' : 'border-gray-300'
              }`}
              required
            />
            {!endDate && (
              <p className="text-xs text-red-500 mt-1">End date is required</p>
            )}
            {startDate && endDate && new Date(endDate) < new Date(startDate) && (
              <p className="text-xs text-red-500 mt-1">End date must be after start date</p>
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
            className="w-full p-3 border rounded-lg"
            rows={3}
            placeholder="Enter any remarks or notes..."
          />
        </div>

        {/* Users */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Assign *
          </label>
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
          {selectedUserIds.length === 0 && (
            <p className="text-xs text-red-500 mt-1">At least one user must be assigned</p>
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
            disabled={!startDate || !endDate || selectedUserIds.length === 0}
            className={`px-5 py-2 rounded-lg transition-colors ${
              !startDate || !endDate || selectedUserIds.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {executionId ? "Update Execution" : "Start Execution"}
          </button>
        </div>
      </form>
    </div>
  </div>

  {/* Schedule Details Modal */}
  {showScheduleModal && selectedScheduleForModal && (
    <div className="fixed inset-0 z-[60] bg-black/40 flex justify-center pt-28 px-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[55vh] overflow-y-auto">

        {/* Header */}
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

        {/* Body */}
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

        {/* Footer */}
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