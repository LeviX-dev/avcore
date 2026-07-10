import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  PlayCircle, 
  Settings, 
  ListChecks,
  CheckCircle,
  AlertCircle,
  Package,
  Trophy
} from 'lucide-react';
import { BASE_URL } from '../../../public/config.js';

interface ExecutionCounts {
  closedDeals: number | null;
  preExecution: number | null;
  execution: number | null;
  completeExecution: number | null;
  assignedProcess: number | null;
  dailyOperation: number | null;
}

const TELECALLER_ROLES = [
  'tele_caller',
  'digital_marketing',
  'field_marketing_executive',
  'tech_sale_sound_engineer',
  'junior_autocad_designer',
  'senior_autocad_designer',
  'av_engineer',
  'acoustic_engineer',
  'acoustic_designer',
  'hr_executive',
  'project_manager',
  'carpenter',
  'accountant'
];

const ADMIN_ROLES = ['admin', 'sub_admin'];
const MANAGEMENT_ROLES = ['technical_head'];

const ExecutionDashboard = () => {
  const [counts, setCounts] = useState<ExecutionCounts>({
    closedDeals: null,
    preExecution: null,
    execution: null,
    completeExecution: null,
    assignedProcess: null,
    dailyOperation: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if user has access to all cards
  const isAdminOrSubAdmin = ADMIN_ROLES.includes(role);
  const isTechnicalHead = MANAGEMENT_ROLES.includes(role);
  const isProjectManager = role === 'project_manager';
  
  // Users who can see all cards (admin, sub_admin, technical_head, project_manager)
  const canSeeAllCards = isAdminOrSubAdmin || isTechnicalHead || isProjectManager;
  
  // Users who can only see limited cards (telecaller roles except project_manager)
  const isLimitedRole = TELECALLER_ROLES.includes(role) && !isProjectManager;

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

  // Fetch all counts from single endpoint
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAllCounts = async () => {
      try {
        setIsLoading(true);

        const fetchWithSession = (url: string, options: RequestInit = {}) =>
          fetch(url, { ...options, credentials: 'include' });

        const response = await fetchWithSession(`${BASE_URL}api/dashboard/execution-dashboard-counts`);
        const data = await response.json();
        
        if (data.success) {
          setCounts({
            closedDeals: data.closed_deals || 0,
            preExecution: data.pre_execution || 0,
            execution: data.execution || 0,
            completeExecution: data.complete_execution || 0,
            assignedProcess: data.assigned_process || 0,
            dailyOperation: data.daily_operation || 0
          });
        }
      } catch (err) {
        console.error('Error fetching execution counts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCounts();
  }, [isAuthenticated]);

  // All cards configuration
  const allCards = [
    {
      id: 'closedDeals',
      title: 'Closed Deals',
      value: formatDisplayValue(counts.closedDeals),
      icon: Package,
      color: 'text-blue-600',
      bgGradient: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-300/50',
      animation: { rotate: [0, 3, -3, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/closed-leads'),
      clickable: true,
      description: ''
    },
    {
      id: 'preExecution',
      title: 'Design Pipeline',
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
      id: 'execution',
      title: 'Live Projects',
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
      id: 'assignedProcess',
      title: 'Task Allocation',
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
      id: 'dailyOperation',
      title: 'Daily Updates',
      value: formatDisplayValue(counts.dailyOperation),
      icon: Activity,
      color: 'text-cyan-600',
      bgGradient: 'from-cyan-500/10 to-cyan-600/5',
      borderColor: 'border-cyan-300/50',
      animation: { y: [0, -2, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/execution/manage'),
      clickable: true,
    },
     {
      id: 'completeExecution',
      title: 'Complete Projects',
      value: formatDisplayValue(counts.completeExecution),
      icon: Trophy,
      color: 'text-green-600',
      bgGradient: 'from-green-500/10 to-green-600/5',
      borderColor: 'border-green-300/50',
      animation: { y: [0, -3, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/execution/completed'),
      clickable: true,
    },
    
  ];

  // Limited cards for telecaller roles (only Assigned Process and Daily Operation)
  const limitedCards = allCards.filter(card => 
    card.id === 'assignedProcess' || card.id === 'dailyOperation'
  );

  // Select cards based on user role
  const operationCards = canSeeAllCards ? allCards : limitedCards;

  // Check if user has any access
  const hasAccess = canSeeAllCards || isLimitedRole;

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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 2xl:gap-8">
        {Array.from({ length: canSeeAllCards ? 6 : 2 }).map((_, index) => (
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
      {/* Operation Cards */}
      <div className={`grid grid-cols-1 gap-6 ${
        canSeeAllCards 
          ? 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6' 
          : 'md:grid-cols-2 lg:grid-cols-2'
      } 2xl:gap-8`}>
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
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
                      {card.title}
                    </h3>
                    {card.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {card.description}
                      </p>
                    )}
                  </div>
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