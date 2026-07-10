import React, { useState, useEffect } from 'react';
import attendanceService from './attendanceService';

interface DashboardStats {
  present_count?: number;
  absent_count?: number;
  late_count?: number;
  total_employees?: number;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'monthly' | 'trend'>('stats');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [statsRes, monthlyRes, trendRes] = await Promise.all([
        attendanceService.getDashboardStats(),
        attendanceService.getDashboardMonthlyStats(),
        attendanceService.getDashboard20DayTrend(),
      ]);

      setStats(statsRes.data);
      setMonthlyStats(monthlyRes.data);
      setTrend(trendRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">
      <h3 className="mb-6 text-xl font-semibold">Attendance Dashboard</h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4 border-b border-stroke">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'stats'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600'
          }`}
        >
          Today Stats
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'monthly'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setActiveTab('trend')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'trend'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600'
          }`}
        >
          20-Day Trend
        </button>
      </div>

      {loading && <div className="text-center text-gray-500">Loading...</div>}

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-2xl font-bold text-blue-600">{stats.present_count || 0}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-2xl font-bold text-red-600">{stats.absent_count || 0}</p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-gray-600">Late</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.late_count || 0}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-gray-600">Total Employees</p>
            <p className="text-2xl font-bold text-green-600">{stats.total_employees || 0}</p>
          </div>
        </div>
      )}

      {activeTab === 'monthly' && monthlyStats && (
        <div className="space-y-4">
          <h4 className="font-semibold">Monthly Statistics</h4>
          {Array.isArray(monthlyStats) ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {monthlyStats.map((month: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-stroke p-4">
                  <p className="mb-2 font-semibold">{month.month || `Month ${idx + 1}`}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Present:</span>
                      <span className="font-medium">{month.present || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absent:</span>
                      <span className="font-medium">{month.absent || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">{month.total || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-stroke p-4">
              <div className="space-y-2 text-sm">
                {Object.entries(monthlyStats).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trend' && trend && (
        <div className="space-y-4">
          <h4 className="font-semibold">20-Day Attendance Trend</h4>
          <div className="grid grid-cols-1 gap-4">
            {Array.isArray(trend) ? (
              trend.map((day: any, idx: number) => (
                <div key={idx} className="border-b border-stroke py-2">
                  <div className="flex justify-between text-sm">
                    <span>{day.date || `Day ${idx + 1}`}</span>
                    <span className="font-medium">
                      <span className="text-green-600">{day.present || 0} P</span>
                      <span className="mx-2 text-red-600">{day.absent || 0} A</span>
                      <span className="text-yellow-600">{day.late || 0} L</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-stroke p-4">
                <pre className="text-xs">{JSON.stringify(trend, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={fetchDashboardData}
        className="mt-6 rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600"
      >
        Refresh Data
      </button>
    </div>
  );
};

export default Dashboard;
