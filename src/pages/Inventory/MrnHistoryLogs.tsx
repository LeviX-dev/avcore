import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faUser,
  faSpinner,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from '../../../public/config.js';

interface MRNLog {
  log_id: number;
  action_type: string;
  status: string;
  created_at: string;
  action_by: string;
}

interface MrnHistoryLogsProps {
  lead: any;
  onClose: () => void;
}

const MrnHistoryLogs = ({ lead, onClose }: MrnHistoryLogsProps) => {
  const [logs, setLogs] = useState<MRNLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (lead && lead.mrn_id) {
    fetchMRNLogs();
  }
}, [lead]);

const fetchMRNLogs = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await axios.get(
      `${BASE_URL}api/mrn/logs/${lead.mrn_id}`,
      { withCredentials: true }
    );

    if (response.data?.success && response.data?.data) {
      const rawLogs: MRNLog[] = response.data.data;

      /* ✅ CLEAN + GROUP LOGS */
     const groupedLogsMap = new Map();

rawLogs.forEach((log: MRNLog) => {
  let key: any = "";

  if (
    log.action_type === "MRN_APPROVED" ||
    log.action_type === "MRN_STATUS_UPDATE"
  ) {
    key = log.action_type;
  }
  else if (log.action_type === "VERIFICATION") {
    key = "VERIFICATION";
  }
  else if (log.action_type === "APPROVAL") {
    key = "APPROVAL";
  }
  else if (log.action_type === "ISSUE") {
    key = `ISSUE_${log.log_id}`;
  }
  else if (log.action_type === "PURCHASE_REQUEST") {
    key = `PR_${log.log_id}`;
  }
  else {
    key = log.log_id;
  }

  if (!groupedLogsMap.has(key)) {
    groupedLogsMap.set(key, log);
  }
});

      /* ✅ FINAL SORT (latest first) */
    const finalLogs = rawLogs.sort(
  (a: MRNLog, b: MRNLog) =>
    new Date(b.created_at).getTime() -
    new Date(a.created_at).getTime()
);

setLogs(finalLogs);
    } else {
      setError("Failed to fetch MRN logs");
    }
  } catch (err: any) {
    console.error("Error fetching MRN logs:", err);
    setError(
      err.response?.data?.message || "Failed to fetch MRN logs"
    );
  } finally {
    setLoading(false);
  }
};

  if (!lead) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionName = (log: MRNLog) => {
  switch (log.action_type) {
    case 'GENERATE':
      return 'MRN Generated';

    case 'VERIFICATION':
      return log.status === 'Verified'
        ? 'Material Verified'
        : 'Verification Started';

    case 'APPROVAL':
      return 'Material Approved';

    case 'PURCHASE_REQUEST':
      return 'Purchase Requested';

    case 'PURCHASE_APPROVAL':
      return 'Purchase Approved';

    case 'PO_CREATED':
      return 'PO Created';

    case 'ISSUE':
      return 'Material Issued';

    case 'MRN_STATUS_UPDATE':
      return `MRN ${log.status}`; // Approved / Partially Issued

    default:
      return log.status || '—';
  }
};

const getActionBadge = (log: MRNLog) => {
  if (log.action_type === 'ISSUE') {
    return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
  }

  if (log.action_type === 'APPROVAL') {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  }

  if (log.action_type === 'PURCHASE_APPROVAL') {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  if (log.action_type === 'PURCHASE_REQUEST') {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  }

  if (log.action_type === 'PO_CREATED') {
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
  }

  if (log.action_type === 'VERIFICATION') {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  }

  if (log.status === 'Generated') {
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }

  if (log.status === 'Partially Issued') {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
  }

  return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300";
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


        {/* Activity Table Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">
            MRN Activity Logs
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
            {logs.length} Events
          </span>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden max-h-[350px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400 py-12">
              <FontAwesomeIcon icon={faTimesCircle} className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p>No logs found</p>
            </div>
          ) : (
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
                {logs.map((log) => (
                  <tr
                    key={log.log_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {/* Action */}
                    <td className="p-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getActionBadge(log)}`}
                      >
                        {getActionName(log)}
                      </span>
                    </td>

                    {/* MRN */}
                    <td className="p-2 font-mono text-gray-700 dark:text-gray-300">
                      {lead.mrn_number}
                    </td>

                    {/* User */}
                    <td className="p-2 dark:text-gray-300">
                      {log.action_by || 'System'}
                    </td>

                    {/* Date */}
                    <td className="p-2 dark:text-gray-300">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MrnHistoryLogs;