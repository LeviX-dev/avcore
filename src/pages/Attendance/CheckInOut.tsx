import React, { useState, useEffect } from 'react';
import attendanceService from './attendanceService';

const CheckInOut: React.FC = () => {
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load today's status on mount
  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getTodayStatus();
      setTodayStatus(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch today status');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.checkIn({});
      setSuccess('Check-in successful!');
      setError('');
      fetchTodayStatus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.checkOut({});
      setSuccess('Check-out successful!');
      setError('');
      fetchTodayStatus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCheckout = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.autoCheckout();
      setSuccess('Auto checkout triggered!');
      setError('');
      fetchTodayStatus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Auto checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">
      <h3 className="mb-4 text-xl font-semibold">Check In / Check Out</h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="flex-1 rounded-lg bg-green-500 px-6 py-3 font-medium text-white hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Check In'}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-500 px-6 py-3 font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Check Out'}
          </button>
          <button
            onClick={handleAutoCheckout}
            disabled={loading}
            className="flex-1 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Auto Checkout (8PM)'}
          </button>
        </div>
      </div>

      {todayStatus && (
        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
          <h4 className="font-semibold">Today's Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-medium">{todayStatus.checkin_time || 'Not checked in'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-medium">{todayStatus.checkout_time || 'Not checked out'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{todayStatus.status || 'Absent'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInOut;
