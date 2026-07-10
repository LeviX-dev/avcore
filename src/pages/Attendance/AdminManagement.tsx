import React, { useState, useEffect } from 'react';
import attendanceService from './attendanceService';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  checkin_time: string;
  checkout_time: string;
  status: string;
}

const AdminManagement: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    checkin_time: '',
    checkout_time: '',
    status: 'Present',
  });

  const [generateData, setGenerateData] = useState({
    year: new Date().getFullYear(),
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingId) {
        await attendanceService.updateAttendance({ id: editingId, ...formData });
        setSuccess('Record updated successfully!');
      } else {
        await attendanceService.addAttendance(formData);
        setSuccess('Record added successfully!');
      }

      setFormData({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        checkin_time: '',
        checkout_time: '',
        status: 'Present',
      });
      setShowForm(false);
      setEditingId(null);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      setLoading(true);
      await attendanceService.deleteAttendance(id);
      setSuccess('Record deleted successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    
    try {
      setLoading(true);
      await attendanceService.deleteAttendanceLog(logId);
      setSuccess('Log deleted successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateYear = async () => {
    try {
      setLoading(true);
      await attendanceService.generateYearAttendance(generateData);
      setSuccess('Year attendance generated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">
        <h3 className="mb-4 text-xl font-semibold">
          {editingId ? 'Edit Attendance Record' : 'Add Attendance Record'}
        </h3>

        <form onSubmit={handleAddOrUpdate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">Employee ID *</label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleFormChange}
                required
                placeholder="Enter employee ID"
                className="w-full rounded border border-stroke bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                required
                className="w-full rounded border border-stroke bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Check-in Time</label>
              <input
                type="time"
                name="checkin_time"
                value={formData.checkin_time}
                onChange={handleFormChange}
                className="w-full rounded border border-stroke bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Check-out Time</label>
              <input
                type="time"
                name="checkout_time"
                value={formData.checkout_time}
                onChange={handleFormChange}
                className="w-full rounded border border-stroke bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full rounded border border-stroke bg-white px-4 py-2"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (editingId ? 'Update' : 'Add')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    employee_id: '',
                    date: new Date().toISOString().split('T')[0],
                    checkin_time: '',
                    checkout_time: '',
                    status: 'Present',
                  });
                }}
                className="rounded-lg bg-gray-500 px-6 py-2 font-medium text-white hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bulk Generate Year */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">
        <h3 className="mb-4 text-xl font-semibold">Bulk Generate Year Attendance</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium">Year</label>
            <input
              type="number"
              value={generateData.year}
              onChange={(e) => setGenerateData({ ...generateData, year: parseInt(e.target.value) })}
              min={2000}
              max={2099}
              className="w-full rounded border border-stroke bg-white px-4 py-2 md:w-1/3"
            />
          </div>

          <button
            onClick={handleGenerateYear}
            disabled={loading}
            className="rounded-lg bg-green-500 px-6 py-2 font-medium text-white hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Year Attendance'}
          </button>
        </div>
      </div>



      {/* Attendance Range Lookup */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">
        <h3 className="mb-4 text-xl font-semibold">Attendance Range Lookup</h3>
        <button
          onClick={async () => {
            try {
              const res = await attendanceService.getAttendanceRange({
                start_date: '2024-01-01',
                end_date: '2024-12-31',
              });
              alert('Range Data:\n' + JSON.stringify(res.data, null, 2));
            } catch (err: any) {
              alert('Error: ' + (err.response?.data?.message || 'Failed to fetch'));
            }
          }}
          className="w-full rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600"
        >
          Fetch Attendance Range
        </button>
      </div>
    </div>
  );
};

export default AdminManagement;
