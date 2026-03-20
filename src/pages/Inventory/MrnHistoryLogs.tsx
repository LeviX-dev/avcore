// MaterialIssueLogs.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faCheckCircle,
  faClipboardCheck,
  faTruck,
  faUser,
  faCalendarAlt,
  faClock,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

interface MaterialIssueLogsProps {
  lead: any;
  onClose: () => void;
}

const MrnHistoryLogs = ({ lead, onClose }: MaterialIssueLogsProps) => {
  if (!lead) return null;

  // Static sample logs data
  const materialLogs = [
    {
      id: 1,
      action: "MRN Generated",
      action_type: "generate",
      mrn_number: "MRN/2024/001",
      performed_by: "Rajesh Kumar",
      performed_at: "2024-02-15 10:30 AM",
      remarks: "MRN created based on approved quotation",
      icon: faFileAlt,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      id: 2,
      action: "MRN Verified",
      action_type: "verify",
      mrn_number: "MRN/2024/001",
      performed_by: "Amit Sharma",
      performed_at: "2024-02-16 11:45 AM",
      remarks: "All materials verified against quotation, quantities are correct",
      icon: faClipboardCheck,
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    {
      id: 3,
      action: "MRN Approved",
      action_type: "approve",
      mrn_number: "MRN/2024/001",
      performed_by: "Priya Patel",
      performed_at: "2024-02-17 09:15 AM",
      remarks: "Materials approved for issue, stock availability confirmed",
      icon: faCheckCircle,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      id: 4,
      action: "Materials Issued",
      action_type: "issue",
      mrn_number: "MRN/2024/001",
      performed_by: "Suresh Yadav",
      performed_at: "2024-02-18 02:30 PM",
      remarks: "All materials issued to site, delivery note generated",
      issued_items: [
        { name: "Premium Paint", qty: 10 },
        { name: "Wall Putty", qty: 5 },
        { name: "Primer", qty: 3 },
      ],
      icon: faTruck,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
    },

 
  ];

  const getActionBadge = (action_type: string) => {
    const badges = {
      generate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      verify: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      approve: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      issue: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    };
    return badges[action_type as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center ml-40 justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FontAwesomeIcon icon={faInfoCircle} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Material Issue History
              </h2>
             
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ×
          </button>
        </div>

        {/* Client Info Card */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
            Client Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium dark:text-white">{lead.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mobile</p>
              <p className="font-medium dark:text-white">{lead.number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
              <p className="font-medium dark:text-white">{lead.city}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
              <p className="font-medium dark:text-white">{lead.cat_name}</p>
            </div>
          </div>
        </div>

   {/* Activity Table Header */}
<div className="flex items-center justify-between mb-3">
  <h3 className="font-semibold text-gray-700 dark:text-gray-200">
    MRN Activity Logs
  </h3>
  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
    {materialLogs.length} Events
  </span>
</div>

{/* Table */}
<div className="border rounded-lg overflow-hidden max-h-[350px] overflow-y-auto">
  <table className="w-full text-sm">
    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
      <tr>
        <th className="p-2 text-left">Action</th>
        <th className="p-2 text-left">MRN No</th>
        <th className="p-2 text-left">Performed By</th>
        <th className="p-2 text-left">Date</th>
       
      </tr>
    </thead>

    <tbody className="divide-y dark:divide-gray-700">
      {materialLogs.map((log) => (
        <tr
          key={log.id}
          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          {/* Action */}
          <td className="p-2">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${getActionBadge(
                log.action_type
              )}`}
            >
              {log.action}
            </span>
          </td>

          {/* MRN */}
          <td className="p-2 font-mono text-gray-700 dark:text-gray-300">
            {log.mrn_number}
          </td>

          {/* User */}
          <td className="p-2 dark:text-gray-300">
            {log.performed_by}
          </td>

          {/* Date */}
          <td className="p-2 dark:text-gray-300">
            {log.performed_at}
          </td>

      
        </tr>
      ))}
    </tbody>
  </table>
</div>
      

        
      </div>
    </div>
  );
};

export default MrnHistoryLogs;