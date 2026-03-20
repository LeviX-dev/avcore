import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  PlayCircle, 
  Settings, 
  ListChecks,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BASE_URL } from '../../../public/config.js';

interface ExecutionCounts {
  preExecution: number | null;
  execution: number | null;
  assignedProcess: number | null;
  dailyOperation: number | null;
}

const ExecutionDashboard = () => {
  const [counts, setCounts] = useState<ExecutionCounts>({
    preExecution: null,
    execution: null,
    assignedProcess: null,
    dailyOperation: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const ADMIN_AND_SUB_ADMIN_ROLES = ['admin', 'sub_admin'];
  const isAdminOrSubAdmin = ADMIN_AND_SUB_ADMIN_ROLES.includes(role);
  const isProjectManager = role === 'project_manager';

  // Format display value
  const formatDisplayValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BASE_URL}auth/check-session`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          setRole(data.role);
        } else {
          setIsAuthenticated(false);
          navigate('/login');
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch execution counts
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchExecutionCounts = async () => {
      try {
        setIsLoading(true);

        const fetchWithSession = (url: string, options: RequestInit = {}) =>
          fetch(url, { ...options, credentials: 'include' });

        // Only fetch for admin/sub_admin or project manager
        if (isAdminOrSubAdmin || isProjectManager) {
          const response = await fetchWithSession(`${BASE_URL}api/dashboard/execution-dashboard-counts`);
          const data = await response.json();
          
          if (data.success) {
            setCounts({
              preExecution: data.pre_execution || 0,
              execution: data.execution || 0,
              assignedProcess: data.assigned_process || 0,
              dailyOperation: data.daily_operation || 0
            });
          }
        }
      } catch (err) {
        console.error('Error fetching execution counts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExecutionCounts();
  }, [isAuthenticated, isAdminOrSubAdmin, isProjectManager]);

  // Card data configuration (copied from ECommerce adminOperationCards)
  const operationCards = [
    {
      title: 'Pre Execution',
      value: formatDisplayValue(counts.preExecution),
      icon: Settings,
      color: 'text-violet-600',
      bgGradient: 'from-violet-500/10 to-violet-600/5',
      borderColor: 'border-violet-300/50',
      animation: { rotate: [0, -5, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/execution/pre-execution'),
      clickable: true,
    },
    {
      title: 'Execution',
      value: formatDisplayValue(counts.execution),
      icon: PlayCircle,
      color: 'text-emerald-600',
      bgGradient: 'from-emerald-500/10 to-emerald-600/5',
      borderColor: 'border-emerald-300/50',
      animation: { scale: [1, 1.05, 1] },
      onClick: () => navigate('/execution/pending'),
      clickable: true,
    },
    {
      title: 'Assigned Process',
      value: formatDisplayValue(counts.assignedProcess),
      icon: ListChecks,
      color: 'text-orange-600',
      bgGradient: 'from-orange-500/10 to-orange-600/5',
      borderColor: 'border-orange-300/50',
      animation: { x: [0, 2, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/execution/daily'),
      clickable: true,
    },
    {
      title: 'Daily Operation',
      value: formatDisplayValue(counts.dailyOperation),
      icon: Activity,
      color: 'text-cyan-600',
      bgGradient: 'from-cyan-500/10 to-cyan-600/5',
      borderColor: 'border-cyan-300/50',
      animation: { y: [0, -2, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/execution/manage'),
      clickable: true,
    },
  ];

  // Check if user has access
  const hasAccess = isAdminOrSubAdmin || isProjectManager;

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 border border-white/20 shadow-lg rounded-2xl p-6"
          >
            <div className="animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-300 rounded w-24"></div>
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              </div>
              <div className="h-8 bg-gray-400 rounded w-16"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
     

      {/* Operation Cards - MOVED FROM ECOMMERCE */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
        <AnimatePresence>
          {operationCards.map((card, index) => (
            <motion.div
              key={card.title}
              onClick={card.clickable ? () => card.onClick?.() : undefined}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{
                y: -4,
                transition: { type: 'spring', stiffness: 400, damping: 17 },
              }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className={`
                relative p-6 bg-gradient-to-br ${card.bgGradient} 
                rounded-2xl shadow-lg border-l-4 ${card.borderColor}
                hover:shadow-2xl hover:scale-105 hover:-translate-y-1
                transform transition-all duration-300 ease-out
                cursor-pointer overflow-hidden
                ${card.clickable ? '' : 'cursor-default hover:shadow-lg hover:scale-100 hover:-translate-y-0'}
              `}
            >
              <div className="absolute inset-0 bg-white dark:bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
                    {card.title}
                  </h3>
                  <motion.div
                    animate={card.animation}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }}
                    className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 shadow-sm ${card.color}`}
                  >
                    <card.icon className="w-5 h-5" />
                  </motion.div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={card.value}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {card.value === 'N/A' ? (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-gray-400"
                      >
                        {card.value}
                      </motion.span>
                    ) : (
                      card.value
                    )}
                  </motion.div>
                </AnimatePresence>

                <motion.div
                  className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                >
                  <motion.div
                    className={`h-full ${card.color.replace('text-', 'bg-')}`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        ((parseInt(card.value?.replace(/,/g, '') || '0') || 0) / 100) * 100,
                        100,
                      )}%`,
                    }}
                    transition={{ delay: index * 0.1 + 1, duration: 1, type: 'spring' }}
                  />
                </motion.div>
              </div>

              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.color.replace('text-', 'bg-')} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-300`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

   
    </div>
  );
};

export default ExecutionDashboard;