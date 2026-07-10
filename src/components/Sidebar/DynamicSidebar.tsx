import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import Logo from '../../images/logo/AVCoreLogoSide.png';
import { buildTree } from '../../utils/buildTree';
import {
  LayoutDashboard,
  Database,
  Users,
  FileText,
  Megaphone,
  PhoneOutgoing,
  CheckSquare,
  ClipboardList,
  CalendarDays,
  BarChart3,
  FolderOpen,
  Package,
  Bookmark,
  Map,
  UserPlus,
  List,
  FolderPlus,
  Eye,
  CheckCircle,
  ChevronDown,
  X,
  LogOut,
  TrendingUp,
  ShieldCheck,
  UserCog,
  ClipboardCheck,
  CalendarCheck,
  Boxes,
  Warehouse,
  FileStack,
  Clipboard,
  Activity,
  Clock,
  Settings,
  GitBranch,
  Calendar,
  Plus,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  CreditCard,
  Wallet,
  ShoppingBag,
  FileCheck,
  CheckCircle2,
  Building,
  BarChart,
  Users2,
  Facebook,
  Truck,
  Download,
} from 'lucide-react';

interface MenuItem {
  menu_key: string;
  label: string;
  icon_key?: string;
  path: string | null;
  parent_key: string | null;
  children?: MenuItem[];
  type?: string;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const DynamicSidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { pathname } = useLocation();
  const sidebar = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [logoutItem, setLogoutItem] = useState<MenuItem | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mini, setMini] = useState(false);
  const [tooltip, setTooltip] = useState<{ label: string; y: number } | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  // Fetch active logo
  useEffect(() => {
    const fetchActiveLogo = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/logo/active`, {
          withCredentials: true
        });
        
        if (response.data.success && response.data.data) {
          const logoUrl = `${BASE_URL}${response.data.data.logo_url}`;
          setCompanyLogo(logoUrl);
        }
      } catch (error) {
        console.error('Error fetching active logo:', error);
      } finally {
        setLogoLoading(false);
      }
    };
    
    fetchActiveLogo();
  }, []);

  // Fetch menus
  useEffect(() => {
    axios
      .get(`${BASE_URL}api/dynamic/sidebar`, { withCredentials: true })
      .then(res => {
        console.log(res.data);
        const allItems = res.data || [];

        const logoutMenuItem = allItems.find(
          (item: MenuItem) =>
            item.menu_key === 'logout' || item.label.toLowerCase() === 'logout',
        );

        if (logoutMenuItem) {
          setLogoutItem({ ...logoutMenuItem, type: 'logout' });
        }

        const regularMenus = allItems.filter(
          (item: MenuItem) =>
            !(item.menu_key === 'logout' || item.label.toLowerCase() === 'logout'),
        );
        setMenus(buildTree(regularMenus));
      })
      .catch(err => {
        console.error('❌ Sidebar load failed', err);
        setMenus([]);
      });
  }, []);

  const handleDropdownToggle = (menuName: string) => {
    if (mini) return;
    setOpenDropdown(prev => (prev === menuName ? null : menuName));
  };

  // Auto-open the active parent dropdown
  useEffect(() => {
    const findActiveMenu = (items: MenuItem[]): string | null => {
      for (const menu of items) {
        if (menu.children?.length) {
          const childActive = menu.children.some(
            child => child.path && (pathname === child.path || pathname.startsWith(child.path + '/')),
          );
          if (childActive) return menu.menu_key;

          for (const child of menu.children) {
            if (child.children?.length) {
              const nested = child.children.some(
                nc => nc.path && (pathname === nc.path || pathname.startsWith(nc.path + '/')),
              );
              if (nested) return menu.menu_key;
            }
          }
        }
      }
      return null;
    };
    setOpenDropdown(findActiveMenu(menus));
  }, [pathname, menus]);

  // Close on outside click
  useEffect(() => {
    const handler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    const handler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== 'Escape') return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sidebarOpen, setSidebarOpen]);

  const isPathActive = (path?: string | null) =>
    !!path && (pathname === path || pathname.startsWith(path + '/'));

  // Improved icon mapping using menu_key first, then label
  const getIconByKey = (menuKey: string, label: string): React.ReactNode => {
    // Map menu_key to specific icons
    const keyIconMap: Record<string, React.ReactNode> = {
      // Dashboard and Statistics
      dashboard: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
      statistics_dashboard: <BarChart className="w-5 h-5 flex-shrink-0" />,
      execution_dashboard: <Activity className="w-5 h-5 flex-shrink-0" />,
      mrn_dashboard: <TrendingUp className="w-5 h-5 flex-shrink-0" />,

      // Master sections
      master: <Database className="w-5 h-5 flex-shrink-0" />,
      master_data: <Database className="w-5 h-5 flex-shrink-0" />,
      'master.category': <FolderOpen className="w-5 h-5 flex-shrink-0" />,
      'master.reference': <Bookmark className="w-5 h-5 flex-shrink-0" />,
      'master.area': <Map className="w-5 h-5 flex-shrink-0" />,
      city: <Map className="w-5 h-5 flex-shrink-0" />,
      'master.vendor': <Building className="w-5 h-5 flex-shrink-0" />,
      
      // User management
      user: <Users className="w-5 h-5 flex-shrink-0" />,
      'user.add': <UserPlus className="w-5 h-5 flex-shrink-0" />,
      'user.list': <List className="w-5 h-5 flex-shrink-0" />,
      userassets: <Users2 className="w-5 h-5 flex-shrink-0" />,
      
      // Quotation management
      quotation_management: <FileText className="w-5 h-5 flex-shrink-0" />,
      quotationpending: <FileText className="w-5 h-5 flex-shrink-0" />,
      quotation_template: <FileText className="w-5 h-5 flex-shrink-0" />,
      product: <Package className="w-5 h-5 flex-shrink-0" />,
      additional_charges: <Receipt className="w-5 h-5 flex-shrink-0" />,
      
      // Calls and tasks
      call: <PhoneOutgoing className="w-5 h-5 flex-shrink-0" />,
      todays_todo: <CheckSquare className="w-5 h-5 flex-shrink-0" />,
      missed_followup: <ClipboardList className="w-5 h-5 flex-shrink-0" />,
      upcoming_followups: <CalendarDays className="w-5 h-5 flex-shrink-0" />,
      
      // Execution
      execution: <Activity className="w-5 h-5 flex-shrink-0" />,
      execution_master: <Settings className="w-5 h-5 flex-shrink-0" />,
      'execution.type': <GitBranch className="w-5 h-5 flex-shrink-0" />,
      'execution.schedule': <Calendar className="w-5 h-5 flex-shrink-0" />,
      'execution.checklist': <ClipboardCheck className="w-5 h-5 flex-shrink-0" />,
      'execution.pre': <Clock className="w-5 h-5 flex-shrink-0" />,
      'execution.pending': <Clock className="w-5 h-5 flex-shrink-0" />,
      'execution.completed': <CheckCircle className="w-5 h-5 flex-shrink-0" />,
      'execution.daily': <CalendarCheck className="w-5 h-5 flex-shrink-0" />,
      'execution.manage': <Settings className="w-5 h-5 flex-shrink-0" />,
      
      // MRN
      mrn: <FileStack className="w-5 h-5 flex-shrink-0" />,
      'mrn.generatemrn': <FileStack className="w-5 h-5 flex-shrink-0" />,
      'mrn.verifymrn': <ShieldCheck className="w-5 h-5 flex-shrink-0" />,
      'mrn.approvemrn': <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
      'mrn.managemrn': <Clipboard className="w-5 h-5 flex-shrink-0" />,
      'mrn.purchasemrn': <ShoppingBag className="w-5 h-5 flex-shrink-0" />,
      'mrn.purchaseapp': <FileCheck className="w-5 h-5 flex-shrink-0" />,
      'mrn.completedmrn': <CheckCircle className="w-5 h-5 flex-shrink-0" />,
      
      // Expenses
      expense: <CreditCard className="w-5 h-5 flex-shrink-0" />,
      expense_group: <CreditCard className="w-5 h-5 flex-shrink-0" />,
      'expense.entry': <Receipt className="w-5 h-5 flex-shrink-0" />,
      'expense.categories': <FolderOpen className="w-5 h-5 flex-shrink-0" />,
      'expense.reports': <BarChart3 className="w-5 h-5 flex-shrink-0" />,
      
      // Wallet
      wallet_my_transactions: <Wallet className="w-5 h-5 flex-shrink-0" />,
      wallet_management: <Wallet className="w-5 h-5 flex-shrink-0" />,
      
      // Reports
      report: <BarChart3 className="w-5 h-5 flex-shrink-0" />,
      'report.drop': <Eye className="w-5 h-5 flex-shrink-0" />,
      'report.closed': <CheckCircle className="w-5 h-5 flex-shrink-0" />,
      'report.employee_assigned': <Users className="w-5 h-5 flex-shrink-0" />,
      'report.daily': <TrendingUp className="w-5 h-5 flex-shrink-0" />,
      'report.meta': <Facebook className="w-5 h-5 flex-shrink-0" />,
      'report.employee_work': <UserCog className="w-5 h-5 flex-shrink-0" />,
      attendance: <CalendarCheck className="w-5 h-5 flex-shrink-0" />,
      
      // Campaign
      campaign: <Megaphone className="w-5 h-5 flex-shrink-0" />,
      'campaign.create': <FolderPlus className="w-5 h-5 flex-shrink-0" />,
      'campaign.view': <Eye className="w-5 h-5 flex-shrink-0" />,
      
      // Stock/Inword
      stock: <Warehouse className="w-5 h-5 flex-shrink-0" />,
      inword: <Boxes className="w-5 h-5 flex-shrink-0" />,
      outward: <Truck className="w-5 h-5 flex-shrink-0" />,
      
      // AV Core Documents
      av_core_document: <FolderOpen className="w-5 h-5 flex-shrink-0" />,
      avcore_pricelist: <FileText className="w-5 h-5 flex-shrink-0" />,
      
   download_center: <Download className="w-5 h-5 flex-shrink-0" />,

   admin_report: <BarChart3 className="w-5 h-5 flex-shrink-0" />,
'admin_report.overview': <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,


  
      // Logout
      logout: <LogOut className="w-5 h-5 flex-shrink-0" />,
    };
    
    // Check if menu_key has a direct mapping
    if (keyIconMap[menuKey]) {
      return keyIconMap[menuKey];
    }
    
    // Fallback to label-based mapping
    return getIconByLabel(label);
  };
  
  const getIconByLabel = (label: string): React.ReactNode => {
    const normalized = label?.toLowerCase().replace(/[^a-z0-9]/g, ' ') || '';
    
    const labelIconMap: Record<string, React.ReactNode> = {
      dashboard: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
      master: <Database className="w-5 h-5 flex-shrink-0" />,
      user: <Users className="w-5 h-5 flex-shrink-0" />,
      'master data': <Database className="w-5 h-5 flex-shrink-0" />,
      'user assets': <Users2 className="w-5 h-5 flex-shrink-0" />,
      quotation: <FileText className="w-5 h-5 flex-shrink-0" />,
      'assigned call': <PhoneOutgoing className="w-5 h-5 flex-shrink-0" />,
      "today's task": <CheckSquare className="w-5 h-5 flex-shrink-0" />,
      'upcoming follow ups': <CalendarDays className="w-5 h-5 flex-shrink-0" />,
      execution: <Activity className="w-5 h-5 flex-shrink-0" />,
      'execution master': <Settings className="w-5 h-5 flex-shrink-0" />,
      'process stage': <GitBranch className="w-5 h-5 flex-shrink-0" />,
      schedule: <Calendar className="w-5 h-5 flex-shrink-0" />,
      checklist: <ClipboardCheck className="w-5 h-5 flex-shrink-0" />,
      mrn: <FileStack className="w-5 h-5 flex-shrink-0" />,
      expenses: <CreditCard className="w-5 h-5 flex-shrink-0" />,
      'expense entry': <Receipt className="w-5 h-5 flex-shrink-0" />,
      'my transactions': <Wallet className="w-5 h-5 flex-shrink-0" />,
      'wallet management': <Wallet className="w-5 h-5 flex-shrink-0" />,
      report: <BarChart3 className="w-5 h-5 flex-shrink-0" />,
      'design pipeline': <Clock className="w-5 h-5 flex-shrink-0" />,
      'live projects': <Activity className="w-5 h-5 flex-shrink-0" />,
      'daily updates': <CalendarCheck className="w-5 h-5 flex-shrink-0" />,
      'task allocation': <ClipboardList className="w-5 h-5 flex-shrink-0" />,
      'complete projects': <CheckCircle className="w-5 h-5 flex-shrink-0" />,
      'generate mrn': <FileStack className="w-5 h-5 flex-shrink-0" />,
      'verify mrn': <ShieldCheck className="w-5 h-5 flex-shrink-0" />,
      'approve mrn': <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
      'manage mrn': <Clipboard className="w-5 h-5 flex-shrink-0" />,
      'purchase approval': <ShoppingBag className="w-5 h-5 flex-shrink-0" />,
      'purchased mrn': <FileCheck className="w-5 h-5 flex-shrink-0" />,
      'completed mrn': <CheckCircle className="w-5 h-5 flex-shrink-0" />,
      category: <FolderOpen className="w-5 h-5 flex-shrink-0" />,
      sources: <Bookmark className="w-5 h-5 flex-shrink-0" />,
      vendor: <Building className="w-5 h-5 flex-shrink-0" />,
      'expense categories': <FolderOpen className="w-5 h-5 flex-shrink-0" />,
      city: <Map className="w-5 h-5 flex-shrink-0" />,
      product: <Package className="w-5 h-5 flex-shrink-0" />,
      'additional charges': <Receipt className="w-5 h-5 flex-shrink-0" />,
      'quotation template': <FileText className="w-5 h-5 flex-shrink-0" />,
        'download center': <Download className="w-5 h-5 flex-shrink-0" />,
  'apk download': <Package className="w-5 h-5 flex-shrink-0" />,
      statistics: <BarChart className="w-5 h-5 flex-shrink-0" />,
      'admin report': <BarChart3 className="w-5 h-5 flex-shrink-0" />,
'overview report': <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
      logout: <LogOut className="w-5 h-5 flex-shrink-0" />,
    };
    
    // Exact match
    if (labelIconMap[normalized]) {
      return labelIconMap[normalized];
    }
    
    // Partial match
    for (const [key, icon] of Object.entries(labelIconMap)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return icon;
      }
    }
    
    // Default icon
    return <FileText className="w-5 h-5 flex-shrink-0" />;
  };

  const getIcon = (menu: MenuItem): React.ReactNode => {
    if (menu.icon_key) {
      const iconMap: Record<string, React.ReactNode> = {
        dashboard: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
        master: <Database className="w-5 h-5 flex-shrink-0" />,
        user: <Users className="w-5 h-5 flex-shrink-0" />,
        product: <Package className="w-5 h-5 flex-shrink-0" />,
        kit: <Package className="w-5 h-5 flex-shrink-0" />,
        quotationpending: <FileText className="w-5 h-5 flex-shrink-0" />,
        money: <Receipt className="w-5 h-5 flex-shrink-0" />,
        "file-text": <FileText className="w-5 h-5 flex-shrink-0" />,
        calendar: <Calendar className="w-5 h-5 flex-shrink-0" />,
        settings: <Settings className="w-5 h-5 flex-shrink-0" />,
        users: <Users className="w-5 h-5 flex-shrink-0" />,
        facebook: <Facebook className="w-5 h-5 flex-shrink-0" />,
        check: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
        clock: <Clock className="w-5 h-5 flex-shrink-0" />,
        map: <Map className="w-5 h-5 flex-shrink-0" />,
        receipt: <Receipt className="w-5 h-5 flex-shrink-0" />,
      };

      if (iconMap[menu.icon_key]) {
        return iconMap[menu.icon_key];
      }
    }

    return getIconByKey(menu.menu_key, menu.label);
  };
  
  const getColorClass = (label: string) => {
    const colorMap: Record<string, { hover: string; active: string; childHover: string; childActive: string }> = {
      Dashboard: {
        hover: 'hover:bg-blue-500/20 hover:border-l-blue-400 hover:text-white',
        active: 'bg-blue-500/20 border-l-4 border-l-blue-400 text-white shadow-lg',
        childHover: 'hover:bg-blue-500/10 hover:text-white',
        childActive: 'text-white bg-blue-500/20',
      },
      Master: {
        hover: 'hover:bg-purple-500/20 hover:border-l-purple-400 hover:text-white',
        active: 'bg-purple-500/20 border-l-4 border-l-purple-400 text-white shadow-lg',
        childHover: 'hover:bg-purple-500/10 hover:text-white',
        childActive: 'text-white bg-purple-500/20',
      },
      User: {
        hover: 'hover:bg-green-500/20 hover:border-l-green-400 hover:text-white',
        active: 'bg-green-500/20 border-l-4 border-l-green-400 text-white shadow-lg',
        childHover: 'hover:bg-green-500/10 hover:text-white',
        childActive: 'text-white bg-green-500/20',
      },
      'Master Data': {
        hover: 'hover:bg-orange-500/20 hover:border-l-orange-400 hover:text-white',
        active: 'bg-orange-500/20 border-l-4 border-l-orange-400 text-white shadow-lg',
        childHover: 'hover:bg-orange-500/10 hover:text-white',
        childActive: 'text-white bg-orange-500/20',
      },
      Campaign: {
        hover: 'hover:bg-pink-500/20 hover:border-l-pink-400 hover:text-white',
        active: 'bg-pink-500/20 border-l-4 border-l-pink-400 text-white shadow-lg',
        childHover: 'hover:bg-pink-500/10 hover:text-white',
        childActive: 'text-white bg-pink-500/20',
      },
      'Assigned Call': {
        hover: 'hover:bg-teal-500/20 hover:border-l-teal-400 hover:text-white',
        active: 'bg-teal-500/20 border-l-4 border-l-teal-400 text-white shadow-lg',
        childHover: 'hover:bg-teal-500/10 hover:text-white',
        childActive: 'text-white bg-teal-500/20',
      },
      "Today's Task": {
        hover: 'hover:bg-cyan-500/20 hover:border-l-cyan-400 hover:text-white',
        active: 'bg-cyan-500/20 border-l-4 border-l-cyan-400 text-white shadow-lg',
        childHover: 'hover:bg-cyan-500/10 hover:text-white',
        childActive: 'text-white bg-cyan-500/20',
      },
      'Missed Follow-up List': {
        hover: 'hover:bg-yellow-500/20 hover:border-l-yellow-400 hover:text-white',
        active: 'bg-yellow-500/20 border-l-4 border-l-yellow-400 text-white shadow-lg',
        childHover: 'hover:bg-yellow-500/10 hover:text-white',
        childActive: 'text-white bg-yellow-500/20',
      },
      'Upcoming Follow-ups': {
        hover: 'hover:bg-indigo-500/20 hover:border-l-indigo-400 hover:text-white',
        active: 'bg-indigo-500/20 border-l-4 border-l-indigo-400 text-white shadow-lg',
        childHover: 'hover:bg-indigo-500/10 hover:text-white',
        childActive: 'text-white bg-indigo-500/20',
      },
      Report: {
        hover: 'hover:bg-emerald-500/20 hover:border-l-emerald-400 hover:text-white',
        active: 'bg-emerald-500/20 border-l-4 border-l-emerald-400 text-white shadow-lg',
        childHover: 'hover:bg-emerald-500/10 hover:text-white',
        childActive: 'text-white bg-emerald-500/20',
      },
      Stock: {
        hover: 'hover:bg-amber-500/20 hover:border-l-amber-400 hover:text-white',
        active: 'bg-amber-500/20 border-l-4 border-l-amber-400 text-white shadow-lg',
        childHover: 'hover:bg-amber-500/10 hover:text-white',
        childActive: 'text-white bg-amber-500/20',
      },
      Expenses: {
        hover: 'hover:bg-rose-500/20 hover:border-l-rose-400 hover:text-white',
        active: 'bg-rose-500/20 border-l-4 border-l-rose-400 text-white shadow-lg',
        childHover: 'hover:bg-rose-500/10 hover:text-white',
        childActive: 'text-white bg-rose-500/20',
      },
      MRN: {
        hover: 'hover:bg-slate-500/20 hover:border-l-slate-400 hover:text-white',
        active: 'bg-slate-500/20 border-l-4 border-l-slate-400 text-white shadow-lg',
        childHover: 'hover:bg-slate-500/10 hover:text-white',
        childActive: 'text-white bg-slate-500/20',
      },
      Execution: {
        hover: 'hover:bg-violet-500/20 hover:border-l-violet-400 hover:text-white',
        active: 'bg-violet-500/20 border-l-4 border-l-violet-400 text-white shadow-lg',
        childHover: 'hover:bg-violet-500/10 hover:text-white',
        childActive: 'text-white bg-violet-500/20',
      },
      Logout: {
        hover: 'hover:bg-red-500/20 hover:border-l-red-400 hover:text-red-400',
        active: 'bg-red-500/20 border-l-4 border-l-red-400 text-red-400 shadow-lg',
        childHover: 'hover:bg-red-500/10 hover:text-white',
        childActive: 'text-white bg-red-500/20',
      },
    };

    if (colorMap[label]) return colorMap[label];
    for (const [key, value] of Object.entries(colorMap)) {
      if (label.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(label.toLowerCase()))
        return value;
    }
    return colorMap['Dashboard'];
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('userDetails');
      await axios.post(BASE_URL + 'auth/logout', {}, { withCredentials: true });
      setShowLogoutModal(false);
      window.location.href = '/signin';
    } catch {
      sessionStorage.clear();
      setShowLogoutModal(false);
      window.location.href = '/signin';
    }
  };

  // Render a single menu item
  const renderMenuItem = (menu: MenuItem) => {
    const color = getColorClass(menu.label);

    // Logout
    if (menu.type === 'logout' || menu.label.toLowerCase() === 'logout') {
      return (
        <li key={menu.menu_key}>
          <button
            onClick={() => setShowLogoutModal(true)}
            onMouseEnter={e => {
              if (mini) {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setTooltip({ label: menu.label, y: rect.top + rect.height / 2 });
              }
            }}
            onMouseLeave={() => setTooltip(null)}
            title={mini ? menu.label : undefined}
            className={`group relative flex w-full items-center rounded-lg py-3 font-medium text-sm duration-300 ease-in-out transition-all ${color.hover} ${
              mini ? 'justify-center px-0' : 'gap-3 px-4'
            } ${pathname === menu.path ? `${color.active} border-l-4` : 'text-gray-300'}`}
          >
            {getIcon(menu)}
            {!mini && (
              <span className="transition-all duration-300 text-sm lg:text-base">
                {menu.label}
              </span>
            )}
          </button>
        </li>
      );
    }

    // Parent with children
    if (menu.children && menu.children.length > 0) {
      const isActive = menu.children.some(child => isPathActive(child.path));
      const isOpen = openDropdown === menu.menu_key;

      // In mini mode
      if (mini) {
        return (
          <li key={menu.menu_key}>
            <div
              className={`group relative flex items-center justify-center rounded-lg py-3 px-0 font-medium duration-300 ease-in-out transition-all cursor-pointer ${color.hover} ${
                isActive ? `${color.active} border-l-4` : 'text-gray-300'
              }`}
              onMouseEnter={e => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setTooltip({ label: menu.label, y: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {getIcon(menu)}
              <ChevronRight className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 opacity-50" />
            </div>
          </li>
        );
      }

      // Full mode with dropdown
      return (
        <SidebarLinkGroup key={menu.menu_key} activeCondition={isActive}>
          {(handleClick, open) => (
            <>
              <NavLink
                to="#"
                className={`group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all ${color.hover} ${
                  isActive ? `${color.active} border-l-4` : 'text-gray-300'
                }`}
                onClick={e => {
                  e.preventDefault();
                  handleDropdownToggle(menu.menu_key);
                }}
              >
                {getIcon(menu)}
                <span className="transition-all duration-300 text-sm lg:text-base flex-1">
                  {menu.label}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </NavLink>

              <div className={`translate transform overflow-hidden transition-all duration-300 ${!isOpen && 'hidden'}`}>
                <ul className="mt-2 mb-3 flex flex-col gap-1 pl-8">
                  {menu.children.map(child => (
                    <li key={child.menu_key}>
                      <NavLink
                        to={child.path!}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 ${color.childHover} ${
                            isActive ? color.childActive : 'text-gray-400'
                          }`
                        }
                        onClick={() => {
                          if (window.innerWidth < 1024) setSidebarOpen(false);
                        }}
                      >
                        {getIcon(child)}
                        <span className="flex-1">{child.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </SidebarLinkGroup>
      );
    }

    // Leaf link
    if (menu.path) {
      return (
        <li key={menu.menu_key}>
          <NavLink
            to={menu.path}
            onMouseEnter={e => {
              if (mini) {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setTooltip({ label: menu.label, y: rect.top + rect.height / 2 });
              }
            }}
            onMouseLeave={() => setTooltip(null)}
            className={({ isActive }) =>
              `group relative flex items-center rounded-lg py-3 font-medium duration-300 ease-in-out transition-all ${color.hover} ${
                mini ? 'justify-center px-0' : 'gap-3 px-4'
              } ${isActive ? `${color.active} border-l-4` : 'text-gray-300'}`
            }
            onClick={() => {
              setOpenDropdown(null);
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          >
            {getIcon(menu)}
            {!mini && (
              <span className="transition-all duration-300 text-sm lg:text-base">
                {menu.label}
              </span>
            )}
          </NavLink>
        </li>
      );
    }

    return null;
  };

  const sidebarWidth = mini ? 'w-16' : 'w-72';

  return (
    <>
      {/* Tooltip for mini mode */}
      {mini && tooltip && (
        <div
          className="fixed z-[99999] pointer-events-none"
          style={{ top: tooltip.y, left: 68, transform: 'translateY(-50%)' }}
        >
          <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl border border-gray-700 whitespace-nowrap">
            {tooltip.label}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebar}
        className={`
          fixed left-0 top-0 z-[9999] flex flex-col overflow-hidden
          bg-gradient-to-b from-gray-900 to-black
          transition-all duration-300 ease-in-out
          h-screen
          ${sidebarWidth}
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:h-screen lg:flex-shrink-0
        `}
        style={{ maxHeight: '100dvh' }}
      >
        {/* Header: Logo + toggle */}
        <div
          className={`flex items-center justify-between gap-2 px-3 py-4 flex-shrink-0 border-b border-gray-700/50 ${
            mini ? 'flex-col px-2' : ''
          }`}
        >
          {!mini && (
            <NavLink to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
              {!logoLoading && companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="w-full max-w-[280px] lg:max-w-[220px] h-auto max-h-[52px] object-contain rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = Logo;
                  }}
                />
              ) : (
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-full max-w-[280px] lg:max-w-[220px] h-auto max-h-[52px] object-contain rounded-xl"
                />
              )}
            </NavLink>
          )}

          {mini && (
            <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
              {!logoLoading && companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="w-9 h-9 object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = Logo;
                  }}
                />
              ) : (
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-9 h-9 object-contain rounded-lg"
                />
              )}
            </NavLink>
          )}

          <button
            onClick={() => setMini(prev => !prev)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors flex-shrink-0"
            title={mini ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {mini ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          <button
            ref={trigger}
            onClick={() => setSidebarOpen(false)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            className="block lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
          <style>{`
            .sidebar-scrollbar::-webkit-scrollbar { width: 4px; }
            .sidebar-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .sidebar-scrollbar::-webkit-scrollbar-thumb { background-color: #4B5563; border-radius: 20px; }
            .sidebar-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #6B7280; }
          `}</style>

          <nav className={`py-4 ${mini ? 'px-1' : 'px-4 lg:px-6'}`}>
            <ul className="mb-6 flex flex-col gap-1">
              {menus.map(menu => renderMenuItem(menu))}
              {logoutItem && renderMenuItem(logoutItem)}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Logout modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
            <div className="flex items-center justify-between border-b border-stroke pb-4 mb-4">
              <h3 className="text-xl font-semibold text-black dark:text-white">Confirm Logout</h3>
              <button onClick={() => setShowLogoutModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">Are you sure you want to logout from your account?</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded border border-stroke bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-strokedark dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors">
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicSidebar;