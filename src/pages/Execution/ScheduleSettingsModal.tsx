import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

/* ================= TYPES ================= */
interface TypeWithProcesses {
  type_id: number;
  type_name: string;
  processes: Process[];
}

interface Process {
  process_id: number;
  process_name: string;
}

interface MappingDetail {
  type_id: number;
  process_id: number;
  type_name?: string;
  process_name?: string;
}

interface PreviewData {
  schedule_name: string;
  schedule_id: string;
  selected_mappings: Array<{
    type_id: number;
    type_name: string;
    processes: Array<{
      process_id: number;
      process_name: string;
    }>;
  }>;
}

/* ================= COMPONENT ================= */
const ScheduleSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [types, setTypes] = useState<TypeWithProcesses[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<Record<number, number[]>>({});
  const [scheduleName, setScheduleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  /* ================= LOAD ALL ================= */
  useEffect(() => {
    if (id) loadAll();
  }, [id]);

  const loadAll = async () => {
    try {
      setLoading(true);
      
      const scheduleRes = await axios.get(
        `${BASE_URL}api/schedule/${id}`,
        { withCredentials: true }
      );
      setScheduleName(scheduleRes.data?.data?.schedule_name || "");

      const typeRes = await axios.get(
        `${BASE_URL}api/get/types`,
        { withCredentials: true }
      );
      const typeList = typeRes.data?.data || [];

      const fullData = await Promise.all(
        typeList.map(async (type: any) => {
          const procRes = await axios.get(
            `${BASE_URL}api/types/${type.type_id}/processes`,
            { withCredentials: true }
          );
          return {
            ...type,
            processes: procRes.data?.data || []
          };
        })
      );
      setTypes(fullData);

      const mapRes = await axios.get(
        `${BASE_URL}api/get/schedule/${id}/mapping-details`,
        { withCredentials: true }
      );
      const rows = mapRes.data?.data || [];
      const grouped = {};
      rows.forEach(r => {
        if (!grouped[r.type_id]) grouped[r.type_id] = [];
        grouped[r.type_id].push(r.process_id);
      });
      setSelectedProcesses(grouped);

    } catch (err) {
      console.error("Load error:", err);
      alert("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHECKBOX TOGGLE ================= */
  const toggleProcess = (typeId: number, processId: number) => {
    setSelectedProcesses(prev => {
      const arr = prev[typeId] || [];
      if (arr.includes(processId)) {
        return {
          ...prev,
          [typeId]: arr.filter(p => p !== processId)
        };
      } else {
        return {
          ...prev,
          [typeId]: [...arr, processId]
        };
      }
    });
  };

  /* ================= PREVIEW ================= */
  const handlePreview = () => {
    const selectedMappings = types
      .filter(type => selectedProcesses[type.type_id]?.length > 0)
      .map(type => ({
        type_id: type.type_id,
        type_name: type.type_name,
        processes: type.processes
          .filter(proc => selectedProcesses[type.type_id]?.includes(proc.process_id))
          .map(proc => ({
            process_id: proc.process_id,
            process_name: proc.process_name
          }))
      }));

    setPreviewData({
      schedule_name: scheduleName,
      schedule_id: id || "",
      selected_mappings: selectedMappings
    });
    setShowPreview(true);
  };

  /* ================= SAVE MAPPING ================= */
  const saveMapping = async () => {
    try {
      const mappings = Object.keys(selectedProcesses)
        .filter(typeId => selectedProcesses[Number(typeId)]?.length > 0)
        .map(typeId => ({
          type_id: Number(typeId),
          process_ids: selectedProcesses[Number(typeId)]
        }));

      await axios.post(
        `${BASE_URL}api/schedule/mapping`,
        {
          schedule_id: id,
          mappings
        },
        { withCredentials: true }
      );

      setShowConfirmModal(false);
      setShowPreview(false);
      
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  /* ================= RENDER PREVIEW ================= */
  const renderPreview = () => {
    if (!previewData) return null;

    return (
      
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center pt-20 px-4">

  <div className="bg-white dark:bg-boxdark rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">

    {/* Header */}
    <div className="p-6 border-b shrink-0">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        Schedule Preview
      </h2>
    </div>

    {/* Scroll Content ONLY */}
    <div className="p-6 overflow-y-auto flex-1">

      {/* Schedule Info */}
      <div className="mb-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded flex items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
          Schedule Name :
        </span>
        <span className="font-bold text-base text-gray-800 dark:text-white">
          {previewData.schedule_name}
        </span>
      </div>

      {/* Selected Mappings */}
      <div>
        <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">
          Selected Types & Processes
        </h3>

        {previewData.selected_mappings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No processes selected
          </p>
        ) : (
          previewData.selected_mappings.map(mapping => (
            <div key={mapping.type_id} className="mb-4 p-4 border rounded bg-white dark:bg-gray-800">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {mapping.type_name}
              </h4>

              <div className="ml-4">
                {mapping.processes.map(proc => (
                  <div key={proc.process_id} className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{proc.process_name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

    </div>

    {/* Footer */}
    <div className="p-6 border-t shrink-0 flex justify-end gap-3">
      <button
        onClick={() => setShowPreview(false)}
        className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Back to Edit
      </button>

      <button
        onClick={() => {
          setShowPreview(false);
          setShowConfirmModal(true);
        }}
        className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Confirm & Save
      </button>
    </div>

  </div>

</div>

    );
  };

  /* ================= CONFIRMATION MODAL ================= */
  const renderConfirmModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Confirm Save
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to save these mappings to the schedule?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveMapping}
                className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ================= MAIN UI ================= */
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="px-2 sm:px-4 dark:bg-boxdark">
      <Breadcrumb pageName={`Schedule Settings `} />

      {/* Cancel Button */}
      <button
        onClick={() => navigate("/execution/schedule")}
        className="mb-6 px-4 py-2 bg-gray-600 text-white rounded flex gap-2 items-center hover:bg-gray-700"
      >
        ← Back to Schedules
      </button>

      {/* TYPE → PROCESS VIEW (AV Rack Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {types.map(type => (
          <div key={type.type_id} className="border rounded p-4 bg-white dark:bg-gray-800 shadow-sm">
            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
              {type.type_name}
            </h3>

            {type.processes.length === 0 ? (
              <p className="text-gray-400 text-sm ml-4 italic">
                No processes available
              </p>
            ) : (
              <div className="space-y-1">
                {type.processes.map(proc => (
                  <label
                    key={proc.process_id}
                    className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(selectedProcesses[type.type_id] || []).includes(proc.process_id)}
                      onChange={() => toggleProcess(type.type_id, proc.process_id)}
                      className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {proc.process_name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => navigate("/execution/schedule")}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handlePreview}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Preview
        </button>
      </div>

      {/* Modals */}
      {showPreview && renderPreview()}
      {showConfirmModal && renderConfirmModal()}
    </div>
  );
};

export default ScheduleSettings;