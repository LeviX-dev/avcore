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

  // Select all items in a specific checklist
  const selectAllInChecklist = (checklistId, items) => {
    const itemIds = items.map(item => item.item_id);
    const newSelectedItems = [...selectedItems];
    
    // Add all items from this checklist that aren't already selected
    itemIds.forEach(itemId => {
      if (!newSelectedItems.includes(itemId)) {
        newSelectedItems.push(itemId);
      }
    });
    
    setSelectedItems(newSelectedItems);
  };

  // Deselect all items in a specific checklist
  const deselectAllInChecklist = (checklistId, items) => {
    const itemIds = items.map(item => item.item_id);
    const newSelectedItems = selectedItems.filter(id => !itemIds.includes(id));
    setSelectedItems(newSelectedItems);
  };

  // Check if all items in a checklist are selected
  const isAllSelectedInChecklist = (items) => {
    if (items.length === 0) return false;
    const itemIds = items.map(item => item.item_id);
    return itemIds.every(id => selectedItems.includes(id));
  };

  // Check if some items are selected in a checklist
  const isSomeSelectedInChecklist = (items) => {
    const itemIds = items.map(item => item.item_id);
    const selectedCount = itemIds.filter(id => selectedItems.includes(id)).length;
    return selectedCount > 0 && selectedCount < itemIds.length;
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

  // Calculate total items across all checklists
  const totalItems = checklists.reduce((acc, c) => acc + c.items.length, 0);
  const selectedPercentage = totalItems > 0 ? (selectedItems.length / totalItems) * 100 : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Execution Checklist 
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Lead ID: {master_id} | Selected: {selectedItems.length} / {totalItems} items
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Back
        </button>
      </div>

 

      {/* Checklists */}
      {checklists.map((checklist) => {
        const allSelected = isAllSelectedInChecklist(checklist.items);
        const someSelected = isSomeSelectedInChecklist(checklist.items);
        const checklistTotal = checklist.items.length;
        const checklistSelected = checklist.items.filter(item => selectedItems.includes(item.item_id)).length;
        
        return (
          <div
            key={checklist.checklist_id}
            className="bg-white border rounded-xl p-5 mb-6 shadow"
          >
            {/* Checklist Header with Select All */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <div>
                <h2 className="text-lg font-semibold text-indigo-600">
                  {checklist.checklist_name}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {checklistSelected} / {checklistTotal} items selected
                </p>
              </div>
              
              {/* Select All / Deselect All Buttons */}
              <div className="flex gap-2">
                {allSelected ? (
                  <button
                    onClick={() => deselectAllInChecklist(checklist.checklist_id, checklist.items)}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Deselect All</span>
                    <span className="text-xs">({checklistTotal})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => selectAllInChecklist(checklist.checklist_id, checklist.items)}
                    className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Select All</span>
                    <span className="text-xs">({checklistTotal})</span>
                  </button>
                )}
                
                {someSelected && !allSelected && (
                  <button
                    onClick={() => deselectAllInChecklist(checklist.checklist_id, checklist.items)}
                    className="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

       

            {/* Checklist Items */}
            <div className="space-y-3">
              {checklist.items.map((item) => (
                <label
                  key={item.item_id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedItems.includes(item.item_id) 
                      ? 'bg-green-50 border border-green-200' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.item_id)}
                    onChange={() => toggleItem(item.item_id)}
                    className="mt-1 h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className={`text-sm flex-1 ${
                    selectedItems.includes(item.item_id) ? 'font-medium text-gray-900' : 'text-gray-700'
                  }`}>
                    {item.item_name}
                  </span>
                  {selectedItems.includes(item.item_id) && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      ✓ Selected
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      {/* Save Button */}
      <div className="flex justify-end gap-3 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
        <button
          onClick={() => {
            if (window.confirm(`Are you sure you want to save ${selectedItems.length} selected items?`)) {
              saveChecklist();
            }
          }}
          disabled={saving || selectedItems.length === 0}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            saving || selectedItems.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-md'
          }`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </span>
          ) : (
            `Save Checklist (${selectedItems.length} items)`
          )}
        </button>
      </div>
    </div>
  );
};

export default ExecutionChecklist;