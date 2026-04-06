import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../public/config";

const ExecutionChecklist = () => {
  const { master_id } = useParams();
  const navigate = useNavigate();

  const [checklists, setChecklists] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch checklists
      const checklistRes = await axios.get(
        `${BASE_URL}api/sujit/pre-execution-checklists`,
        { withCredentials: true }
      );

      if (checklistRes.data.success) {
        setChecklists(checklistRes.data.data);
      }

      // Fetch saved selections for this lead
      const selectionsRes = await axios.get(
        `${BASE_URL}api/execution/get-checklist/${master_id}`,
        { withCredentials: true }
      );

      if (selectionsRes.data.success) {
        setSelectedItems(selectionsRes.data.selected_items);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (item_id) => {
    if (selectedItems.includes(item_id)) {
      setSelectedItems(selectedItems.filter(id => id !== item_id));
    } else {
      setSelectedItems([...selectedItems, item_id]);
    }
  };

  const saveChecklist = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(
        `${BASE_URL}api/execution/save-checklist/${master_id}`,
        { selected_items: selectedItems },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("Checklist saved successfully!");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error saving checklist:", error);
      alert("Failed to save checklist");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Execution Checklist
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Lead ID: {master_id} | Selected: {selectedItems.length} items
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
            style={{ 
              width: `${(selectedItems.length / checklists.reduce((acc, c) => acc + c.items.length, 0)) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Checklists */}
      {checklists.map((checklist) => (
        <div
          key={checklist.checklist_id}
          className="bg-white border rounded-xl p-5 mb-6 shadow"
        >
          <h2 className="text-lg font-semibold text-indigo-600 mb-4">
            {checklist.checklist_name}
            <span className="ml-2 text-sm text-gray-500">
              ({checklist.items.length} items)
            </span>
          </h2>

          <div className="space-y-3">
            {checklist.items.map((item) => (
              <label
                key={item.item_id}
                className={`flex items-start gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                  selectedItems.includes(item.item_id) ? 'bg-green-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.item_id)}
                  onChange={() => toggleItem(item.item_id)}
                  className="mt-1"
                />
                <span className="text-sm flex-1">
                  {item.item_name}
                </span>
                {selectedItems.includes(item.item_id) && (
                  <span className="text-xs text-green-600">✓ Selected</span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveChecklist}
          disabled={saving || selectedItems.length === 0}
          className={`px-6 py-2 rounded-lg ${
            saving || selectedItems.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {saving ? 'Saving...' : `Save Checklist (${selectedItems.length} items)`}
        </button>
      </div>
    </div>
  );
};

export default ExecutionChecklist;