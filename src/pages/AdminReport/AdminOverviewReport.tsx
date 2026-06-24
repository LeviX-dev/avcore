import React, { useState } from 'react';
import LeadsTab from './tabs/LeadsTab';
import ExpenseTab from './tabs/ExpenseTab';
import MRNTab from './tabs/MRNTab';
import ExecutionTab from './tabs/ExecutionTab';

type TabType = 'leads' | 'expense' | 'mrn' | 'execution';

const AdminOverviewReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('leads');

  const tabs = [
    { id: 'leads' as TabType, label: 'Leads' },
    { id: 'expense' as TabType, label: 'Expense' },
    { id: 'mrn' as TabType, label: 'MRN' },
    { id: 'execution' as TabType, label: 'Execution' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-boxdark p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Admin Overview Report
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-stroke dark:border-strokedark">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'expense' && <ExpenseTab />}
          {activeTab === 'mrn' && <MRNTab />}
          {activeTab === 'execution' && <ExecutionTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewReport;