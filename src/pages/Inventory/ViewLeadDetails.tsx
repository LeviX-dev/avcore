import React from "react";

const ViewLeadDetails = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center ml-40 justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Lead Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ×
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-6">
          <div><b>Name:</b> {lead.name}</div>
          <div><b>Mobile:</b> {lead.number}</div>
          <div><b>City:</b> {lead.city}</div>
          <div><b>Email:</b> {lead.email || "N/A"}</div>
          <div><b>Category:</b> {lead.cat_name}</div>
          <div><b>Reference:</b> {lead.reference_name}</div>
          <div><b>Lead Stage:</b> {lead.latest_leadStage}</div>
          <div><b>Assigned To:</b> {lead.latest_assignedTo}</div>
          <div><b>Status:</b> {lead.status}</div>
        </div>

        {/* Execution Info */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Execution Details
          </h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><b>Schedule:</b> {lead.schedule_name}</div>
            <div><b>Start Date:</b> {lead.execution_start_date}</div>
            <div><b>End Date:</b> {lead.execution_end_date}</div>
            <div><b>Budget:</b> {lead.budget_range}</div>
            <div><b>Room Size:</b> {lead.room_length} x {lead.room_width} x {lead.room_height}</div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Remarks
          </h3>
          <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
            {lead.detailed_remark}
          </p>
        </div>

        {/* Reassignment History */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Reassignment History
          </h3>

          <div className="border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Assigned To</th>
                  <th className="p-2 text-left">Stage</th>
                  <th className="p-2 text-left">By</th>
                  <th className="p-2 text-left">Remark</th>
                </tr>
              </thead>
              <tbody>
                {lead.reassignment_remarks?.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{item.created_at}</td>
                    <td className="p-2">{item.assignedTo}</td>
                    <td className="p-2">{item.leadStage}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewLeadDetails;
