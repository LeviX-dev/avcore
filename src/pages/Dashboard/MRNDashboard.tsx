import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Clock, 
  UserCheck, 
  ShoppingBag, 
  FileCheck,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  FileText,
  ShoppingCart
} from 'lucide-react';
import { BASE_URL } from '../../../public/config';

interface MRNCounts {
  total_executions: number;
  pending_executions: number;
  verify_mrn: number;
  managed_mrn: number;
  purchase_mrn: number;
  purchased_mrn: number;
  completed_mrn: number;
  total_pr: number;
  total_po: number;
}

const MRNDashboard: React.FC = () => {
  const [counts, setCounts] = useState<MRNCounts>({
    total_executions: 0,
    pending_executions: 0,
    verify_mrn: 0,
    managed_mrn: 0,
    purchase_mrn: 0,
    purchased_mrn: 0,
    completed_mrn: 0,
    total_pr: 0,
    total_po: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string>('');
  const navigate = useNavigate();

  // Format display value
  const formatDisplayValue = (value: any): string => {
    if (value === null || value === undefined) return '0';
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

  // Fetch MRN counts from API
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMRNCounts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}api/dashboard/mrn/executed/leads/count`, {
          credentials: 'include',
        });
        const data = await response.json();
        
        if (data.success && data.data) {
          setCounts({
            total_executions: data.data.total_executions || 0,
            pending_executions: data.data.pending_executions || 0,
            verify_mrn: data.data.verify_mrn || 0,
            managed_mrn: data.data.managed_mrn || 0,
            purchase_mrn: data.data.purchase_mrn || 0,
            purchased_mrn: data.data.purchased_mrn || 0,
            completed_mrn: data.data.completed_mrn || 0,
            total_pr: data.data.total_pr || 0,
            total_po: data.data.total_po || 0
          });
        }
      } catch (err) {
        console.error('Error fetching MRN counts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMRNCounts();
  }, [isAuthenticated]);

  // All cards configuration
  const allCards = [
    {
      id: 'total_executions',
      title: 'Total MRNs',
      value: formatDisplayValue(counts.total_executions),
      icon: Package,
      color: 'text-blue-600',
      bgGradient: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-300/50',
      animation: { rotate: [0, 3, -3, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/generatemrn'),
      clickable: true,
      description: 'All MRN requests'
    },
    {
      id: 'verify_mrn',
      title: 'Verify MRN',
      value: formatDisplayValue(counts.verify_mrn),
      icon: UserCheck,
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-500/10 to-indigo-600/5',
      borderColor: 'border-indigo-300/50',
      animation: { scale: [1, 1.05, 1] },
      onClick: () => navigate('/verifymrn'),
      clickable: true,
      description: 'Ready for verification'
    },
    {
      id: 'pending_executions',
      title: 'Approve MRN',
      value: formatDisplayValue(counts.pending_executions),
      icon: Clock,
      color: 'text-yellow-600',
      bgGradient: 'from-yellow-500/10 to-yellow-600/5',
      borderColor: 'border-yellow-300/50',
      animation: { rotate: [0, -5, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/approvemrn'),
      clickable: true,
      description: 'Awaiting processing'
    },
    {
      id: 'managed_mrn',
      title: 'Managed MRN',
      value: formatDisplayValue(counts.managed_mrn),
      icon: CheckCircle,
      color: 'text-green-600',
      bgGradient: 'from-green-500/10 to-green-600/5',
      borderColor: 'border-green-300/50',
      animation: { x: [0, 2, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/managemrn'),
      clickable: true,
      description: 'Under management'
    },
    {
      id: 'purchase_mrn',
      title: 'Purchase Required',
      value: formatDisplayValue(counts.purchase_mrn),
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgGradient: 'from-purple-500/10 to-purple-600/5',
      borderColor: 'border-purple-300/50',
      animation: { y: [0, -2, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/purchasemrn'),
      clickable: true,
      description: 'Needs purchase order'
    },
    {
      id: 'purchased_mrn',
      title: 'Purchased',
      value: formatDisplayValue(counts.purchased_mrn),
      icon: DollarSign,
      color: 'text-cyan-600',
      bgGradient: 'from-cyan-500/10 to-cyan-600/5',
      borderColor: 'border-cyan-300/50',
      animation: { rotate: [0, 3, -3, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/purchaseapproval'),
      clickable: true,
      description: 'Purchase completed'
    },
    {
      id: 'completed_mrn',
      title: 'Completed',
      value: formatDisplayValue(counts.completed_mrn),
      icon: FileCheck,
      color: 'text-emerald-600',
      bgGradient: 'from-emerald-500/10 to-emerald-600/5',
      borderColor: 'border-emerald-300/50',
      animation: { y: [0, -3, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/completedmrn'),
      clickable: true,
      description: 'Fully completed'
    },
{
  id: 'total_pr',
  title: 'Total PR',
  value: formatDisplayValue(counts.total_pr),
  icon: FileText,
  color: 'text-orange-600',
  bgGradient: 'from-orange-500/10 to-orange-600/5',
  borderColor: 'border-orange-300/50',
  animation: { scale: [1, 1.03, 1], rotate: [0, 2, -2, 0] },
      onClick: () => navigate('/purchasemrn'),
  clickable: true,     // Make it non-clickable
  description: 'Purchase Requests'
},
{
  id: 'total_po',
  title: 'Total PO',
  value: formatDisplayValue(counts.total_po),
  icon: ShoppingCart,
  color: 'text-rose-600',
  bgGradient: 'from-rose-500/10 to-rose-600/5',
  borderColor: 'border-rose-300/50',
  animation: { y: [0, -3, 0], scale: [1, 1.02, 1] },
      onClick: () => navigate('/purchasemrn'),
  clickable: true,     // Make it non-clickable
  description: 'Purchase Orders'
},
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-9 2xl:gap-8">
        {Array.from({ length: 9 }).map((_, index) => (
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
    <div className="space-y-8 p-6">
      {/* MRN Status Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-9 2xl:gap-8">
        <AnimatePresence>
          {allCards.map((card, index) => (
            <motion.div
              key={card.id}
              onClick={card.clickable ? () => card.onClick?.() : undefined}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{
                y: -4,
                transition: { type: 'spring', stiffness: 400, damping: 17 },
              }}
              transition={{
                delay: index * 0.05,
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
                    {card.value}
                  </motion.div>
                </AnimatePresence>

                <motion.div
                  className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: index * 0.05 + 0.5, duration: 0.8 }}
                >
                  <motion.div
                    className={`h-full ${card.color.replace('text-', 'bg-')}`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        ((parseInt(card.value?.replace(/,/g, '') || '0') || 0) / 
                        (Math.max(counts.total_executions, counts.total_pr, counts.total_po) || 1)) * 100,
                        100,
                      )}%`,
                    }}
                    transition={{ delay: index * 0.05 + 1, duration: 1, type: 'spring' }}
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

export default MRNDashboard;