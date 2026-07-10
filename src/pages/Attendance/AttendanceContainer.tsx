import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import CheckInOut from './CheckInOut';
import AttendanceReport from './AttendanceReport';
import Dashboard from './Dashboard';
import AdminManagement from './AdminManagement';
import ShiftHolidayManagement from './ShiftHolidayManagement';

type TabType = 'checkin' | 'report' | 'dashboard' | 'admin' | 'shift-holiday';

const AttendanceContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('checkin');

  return (
    <div>
      <Breadcrumb pageName="Attendance Management" />
      
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="rounded-sm border border-stroke bg-white shadow-default">
          <div className="flex flex-wrap gap-4 border-b border-stroke p-6 md:gap-0">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex-1 border-b-2 px-4 py-4 font-medium transition ${
                activeTab === 'checkin'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Check In/Out
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 border-b-2 px-4 py-4 font-medium transition ${
                activeTab === 'report'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 border-b-2 px-4 py-4 font-medium transition ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 border-b-2 px-4 py-4 font-medium transition ${
                activeTab === 'admin'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setActiveTab('shift-holiday')}
              className={`flex-1 border-b-2 px-4 py-4 font-medium transition ${
                activeTab === 'shift-holiday'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Shift & Holiday
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'checkin' && <CheckInOut />}
          {activeTab === 'report' && <AttendanceReport />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'admin' && <AdminManagement />}
          {activeTab === 'shift-holiday' && <ShiftHolidayManagement />}
        </div>
      </div>
    </div>
  );
};

export default AttendanceContainer;
