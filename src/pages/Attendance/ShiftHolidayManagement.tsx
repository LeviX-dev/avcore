import React, { useState, useEffect } from 'react';
import attendanceService from './attendanceService';

interface Shift {
  id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  description?: string;
}

interface Holiday {
  id: string;
  holiday_date: string;
  holiday_name: string;
  description?: string;
}

const ShiftHolidayManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shift' | 'holiday'>('shift');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Shift state
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [editingShift, setEditingShift] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState({
    shift_name: '',
    start_time: '09:00',
    end_time: '18:00',
    description: '',
  });

  // Holiday state
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [editingHoliday, setEditingHoliday] = useState<string | null>(null);
  const [holidayForm, setHolidayForm] = useState({
    holiday_date: new Date().toISOString().split('T')[0],
    holiday_name: '',
    description: '',
  });

  // Fetch shifts on mount
  useEffect(() => {
    if (activeTab === 'shift') {
      fetchShifts();
    }
  }, [activeTab]);

  // Fetch holidays on mount
  useEffect(() => {
    if (activeTab === 'holiday') {
      fetchHolidays();
    }
  }, [activeTab]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getShifts();
      setShifts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getHolidays();
      setHolidays(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };
  const handleShiftFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShiftForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle holiday form change
  const handleHolidayFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHolidayForm(prev => ({ ...prev, [name]: value }));
  };

  // Add/Update Shift
  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (editingShift) {
        await attendanceService.updateShift(editingShift, shiftForm);
        setSuccess('Shift updated successfully!');
      } else {
        await attendanceService.addShift(shiftForm);
        setSuccess('Shift added successfully!');
      }

      // Reset form
      setShiftForm({ shift_name: '', start_time: '09:00', end_time: '18:00', description: '' });
      setEditingShift(null);

      // Refresh shifts
      await fetchShifts();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete Shift
  const handleDeleteShift = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;
    try {
      setLoading(true);
      await attendanceService.deleteShift(id);
      setSuccess('Shift deleted successfully!');
      await fetchShifts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  // Add/Update Holiday
  const handleSaveHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (editingHoliday) {
        await attendanceService.updateHoliday(editingHoliday, holidayForm);
        setSuccess('Holiday updated successfully!');
      } else {
        await attendanceService.addHoliday(holidayForm);
        setSuccess('Holiday added successfully!');
      }

      // Reset form
      setHolidayForm({
        holiday_date: new Date().toISOString().split('T')[0],
        holiday_name: '',
        description: '',
      });
      setEditingHoliday(null);

      // Refresh holidays
      await fetchHolidays();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete Holiday
  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    try {
      setLoading(true);
      await attendanceService.deleteHoliday(id);
      setSuccess('Holiday deleted successfully!');
      await fetchHolidays();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
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

      {/* Tab Navigation */}
      <div className="rounded-sm border border-stroke bg-white shadow-default">
        <div className="flex border-b border-stroke">
          <button
            onClick={() => setActiveTab('shift')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'shift'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Shift Management
          </button>
          <button
            onClick={() => setActiveTab('holiday')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'holiday'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Holiday Management
          </button>
        </div>
      </div>

      {/* SHIFT MANAGEMENT TAB */}
      {activeTab === 'shift' && (
        <div className="space-y-6">
          {/* Add/Edit Shift Form */}
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">
            <h3 className="mb-4 text-xl font-semibold">
              {editingShift ? 'Edit Shift' : 'Add New Shift'}
            </h3>

            <form onSubmit={handleSaveShift} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium">Shift Name *</label>
                  <input
                    type="text"
                    name="shift_name"
                    value={shiftForm.shift_name}
                    onChange={handleShiftFormChange}
                    required
                    placeholder="e.g., Morning Shift, Evening Shift"
                    className="w-full rounded border border-stroke bg-white px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={shiftForm.description}
                    onChange={handleShiftFormChange}
                    placeholder="Optional description"
                    className="w-full rounded border border-stroke bg-white px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">Start Time *</label>
                  <input
                    type="time"
                    name="start_time"
                    value={shiftForm.start_time}
                    onChange={handleShiftFormChange}
                    required
                    className="w-full rounded border border-stroke bg-white px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">End Time *</label>
                  <input
                    type="time"
                    name="end_time"
                    value={shiftForm.end_time}
                    onChange={handleShiftFormChange}
                    required
                    className="w-full rounded border border-stroke bg-white px-4 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (editingShift ? 'Update Shift' : 'Add Shift')}
                </button>
                {editingShift && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingShift(null);
                      setShiftForm({ shift_name: '', start_time: '09:00', end_time: '18:00', description: '' });
                    }}
                    className="rounded-lg bg-gray-500 px-6 py-2 font-medium text-white hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Shifts List */}
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">
            <h3 className="mb-4 text-xl font-semibold">Shifts List</h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Shift Name</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Start Time</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">End Time</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Description</th>
                    <th className="border px-4 py-2 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.length > 0 ? (
                    shifts.map((shift) => (
                      <tr key={shift.id} className="border-b hover:bg-gray-50">
                        <td className="border px-4 py-2 text-sm font-medium">{shift.shift_name}</td>
                        <td className="border px-4 py-2 text-sm">{shift.start_time}</td>
                        <td className="border px-4 py-2 text-sm">{shift.end_time}</td>
                        <td className="border px-4 py-2 text-sm">{shift.description || '-'}</td>
                        <td className="border px-4 py-2 text-center">
                          <button
                            onClick={() => {
                              setEditingShift(shift.id);
                              setShiftForm({
                                shift_name: shift.shift_name,
                                start_time: shift.start_time,
                                end_time: shift.end_time,
                                description: shift.description || '',
                              });
                            }}
                            className="mr-2 inline-block rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteShift(shift.id)}
                            className="inline-block rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="border px-4 py-4 text-center text-gray-500">
                        No shifts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HOLIDAY MANAGEMENT TAB */}
      {activeTab === 'holiday' && (
        <div className="space-y-6">
          {/* Add/Edit Holiday Form */}
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">
            <h3 className="mb-4 text-xl font-semibold">
              {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
            </h3>

            <form onSubmit={handleSaveHoliday} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium">Holiday Date *</label>
                  <input
                    type="date"
                    name="holiday_date"
                    value={holidayForm.holiday_date}
                    onChange={handleHolidayFormChange}
                    required
                    className="w-full rounded border border-stroke bg-white px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">Holiday Name *</label>
                  <input
                    type="text"
                    name="holiday_name"
                    value={holidayForm.holiday_name}
                    onChange={handleHolidayFormChange}
                    required
                    placeholder="e.g., Independence Day, Christmas"
                    className="w-full rounded border border-stroke bg-white px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block font-medium">Description</label>
                  <textarea
                    name="description"
                    value={holidayForm.description}
                    onChange={handleHolidayFormChange}
                    placeholder="Optional description"
                    rows={3}
                    className="w-full rounded border border-stroke bg-white px-4 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (editingHoliday ? 'Update Holiday' : 'Add Holiday')}
                </button>
                {editingHoliday && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHoliday(null);
                      setHolidayForm({
                        holiday_date: new Date().toISOString().split('T')[0],
                        holiday_name: '',
                        description: '',
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

          {/* Holidays List */}
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">
            <h3 className="mb-4 text-xl font-semibold">Holidays List</h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Holiday Name</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Date</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Description</th>
                    <th className="border px-4 py-2 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.length > 0 ? (
                    holidays.map((holiday) => (
                      <tr key={holiday.id} className="border-b hover:bg-gray-50">
                        <td className="border px-4 py-2 text-sm font-medium">{holiday.holiday_name}</td>
                        <td className="border px-4 py-2 text-sm">{holiday.holiday_date}</td>
                        <td className="border px-4 py-2 text-sm">{holiday.description || '-'}</td>
                        <td className="border px-4 py-2 text-center">
                          <button
                            onClick={() => {
                              setEditingHoliday(holiday.id);
                              setHolidayForm({
                                holiday_date: holiday.holiday_date,
                                holiday_name: holiday.holiday_name,
                                description: holiday.description || '',
                              });
                            }}
                            className="mr-2 inline-block rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(holiday.id)}
                            className="inline-block rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="border px-4 py-4 text-center text-gray-500">
                        No holidays found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftHolidayManagement;
