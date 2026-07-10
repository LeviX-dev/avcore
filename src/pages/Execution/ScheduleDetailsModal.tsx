import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface MappingRow {
  type_id: number;
  type_name: string;
  process_id: number;
  process_name: string;
}

interface ScheduleDetails {
  schedule_id: number;
  schedule_name: string;
  mappings: MappingRow[];
}

interface Props {
  scheduleId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ScheduleDetailsModal: React.FC<Props> = ({
  scheduleId,
  isOpen,
  onClose
}) => {

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScheduleDetails | null>(null);

  useEffect(() => {
    if (isOpen && scheduleId) load();
  }, [isOpen, scheduleId]);

  const load = async () => {
    try {

      setLoading(true);

      const scheduleRes = await axios.get(
        `${BASE_URL}api/schedule/${scheduleId}`,
        { withCredentials: true }
      );

      const mappingRes = await axios.get(
        `${BASE_URL}api/get/schedule/${scheduleId}/mapping-details`,
        { withCredentials: true }
      );

      setData({
        ...scheduleRes.data.data,
        mappings: mappingRes.data.data || []
      });

    } catch (e) {
      alert("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  /* GROUP TYPE → PROCESS */
  const grouped = {};
  data?.mappings?.forEach(m => {
    if (!grouped[m.type_id]) {
      grouped[m.type_id] = {
        type_name: m.type_name,
        processes: []
      };
    }
    grouped[m.type_id].processes.push(m.process_name);
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center pt-20 z-50">

      <div className="bg-white dark:bg-boxdark w-full max-w-lg rounded shadow-lg flex flex-col max-h-[70vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg">Schedule Details</h3>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes}/>
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto">

          {loading ? (
            <div className="flex justify-center py-6">
              <FontAwesomeIcon icon={faSpinner} spin />
            </div>
          ) : (

            <>
              {/* Schedule Name */}
              <div className="mb-4 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <span className="text-gray-500 mr-2">Schedule :</span>
                <span className="font-bold">{data?.schedule_name}</span>
              </div>

              {/* Type → Process */}
              {Object.values(grouped).map((type:any, i) => (
                <div key={i} className="mb-4">

                  <div className="font-bold text-blue-600 mb-1">
                    {type.type_name}
                  </div>

                  <div className="ml-4 text-sm space-y-1">
                    {type.processes.map((p,pi) => (
                      <div key={pi}>• {p}</div>
                    ))}
                  </div>

                </div>
              ))}

            </>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-600 text-white rounded text-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ScheduleDetailsModal;
