import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import Logo from '../../images/logo/MMS_logo.png';
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
  UserCog ,
    ClipboardCheck,
    CalendarCheck,
} from 'lucide-react';

interface MenuItem {
  menu_key: string;
  label: string;
  path: string | null;
  parent_key: string | null;
  children?: MenuItem[];
  type?: string; // Add type to distinguish logout
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

  // Fetch menus
  useEffect(() => {
    axios
      .get(`${BASE_URL}api/dynamic/sidebar`, { withCredentials: true })
      .then(res => {
        const allItems = res.data || [];
        
        // Separate logout item from regular menus
        const logoutMenuItem = allItems.find((item: MenuItem) => 
          item.menu_key === 'logout' || item.label.toLowerCase() === 'logout'
        );
        
        if (logoutMenuItem) {
          // Add type to identify logout item
          const logoutItemWithType = {
            ...logoutMenuItem,
            type: 'logout'
          };
          setLogoutItem(logoutItemWithType);
        }
        
        // Filter out logout from regular menus
        const regularMenus = allItems.filter((item: MenuItem) => 
          !(item.menu_key === 'logout' || item.label.toLowerCase() === 'logout')
        );
        const tree = buildTree(regularMenus);
        setMenus(tree);
      })
      .catch(err => {
        console.error('❌ Sidebar load failed', err);
        setMenus([]);
      });
  }, []);

  // Function to handle dropdown toggle
  const handleDropdownToggle = (menuName: string) => {
    if (openDropdown === menuName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(menuName);
    }
  };

  // Auto-open correct dropdown based on current route
  useEffect(() => {
    const findActiveMenu = (menus: MenuItem[]): string | null => {
      for (const menu of menus) {
        if (menu.children && menu.children.length > 0) {
          const childActive = menu.children.some(child =>
            child.path && (pathname === child.path || pathname.startsWith(child.path + '/'))
          );
          if (childActive) {
            return menu.menu_key;
          }
          
          for (const child of menu.children) {
            if (child.children && child.children.length > 0) {
              const nestedActive = child.children.some(nestedChild =>
                nestedChild.path && (pathname === nestedChild.path || pathname.startsWith(nestedChild.path + '/'))
              );
              if (nestedActive) {
                return menu.menu_key;
              }
            }
          }
        }
      }
      return null;
    };

    const activeMenu = findActiveMenu(menus);
    setOpenDropdown(activeMenu);
  }, [pathname, menus]);

  // Close sidebar on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== 'Escape') return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Check if a path is active
  const isPathActive = (path?: string | null) =>
    path && (pathname === path || pathname.startsWith(path + '/'));

  // Get icon for menu
const getIcon = (label: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Dashboard': <LayoutDashboard className="w-5 h-5" />,
    'Master': <Database className="w-5 h-5" />,
    'User': <Users className="w-5 h-5" />,
    'Master Data': <FileText className="w-5 h-5" />,
    'Campaign': <Megaphone className="w-5 h-5" />,
    'Assigned Call': <PhoneOutgoing className="w-5 h-5" />,
    'Today’s To-Do': <CheckSquare className="w-5 h-5" />,
    'Missed Follow-up List': <ClipboardList className="w-5 h-5" />,
    'Upcoming Follow-ups': <CalendarDays className="w-5 h-5" />,
    'Report': <BarChart3 className="w-5 h-5" />,

    // Master children
    'Category': <FolderOpen className="w-4 h-4" />,
    'Product': <Package className="w-4 h-4" />,
    'Reference': <Bookmark className="w-4 h-4" />,
    'Area': <Map className="w-4 h-4" />,
    'Kit': <Package className="w-4 h-4" />,

    // User
    'Add User': <UserPlus className="w-4 h-4" />,
    'User List': <List className="w-4 h-4" />,

    // Campaign
    'Create Campaign': <FolderPlus className="w-4 h-4" />,
    'View Campaign': <Eye className="w-4 h-4" />,

    // Reports
    'Drop Leads Report': <Eye className="w-4 h-4" />,
    'Closed Leads Report': <CheckCircle className="w-4 h-4" />,
    'EmployeeWise Report': <Users className="w-4 h-4" />,
    'LeadWise Report': <TrendingUp className="w-4 h-4" />,

    // ✅ THESE TWO WERE MISSING / WRONG
    'Quotation Template': <FileText className="w-5 h-5" />,
    'Attendance Report': <CalendarCheck className="w-5 h-5" />,

    // Admin
    'Role Permission': <ShieldCheck className="w-4 h-4" />,
    'Employee Report': <UserCog className="w-4 h-4" />,

    // Logout
    'Logout': <LogOut className="w-5 h-5" />,
  };

  return iconMap[label] || <FileText className="w-5 h-5" />;
};


  // Get color for menu item with static classes
  const getColorClass = (label: string) => {
    const colorMap: Record<string, {hover: string, active: string, childHover: string, childActive: string}> = {
      'Dashboard': { 
        hover: 'hover:bg-blue-500/20 hover:border-l-blue-400 hover:text-white',
        active: 'bg-blue-500/20 border-l-4 border-l-blue-400 text-white shadow-lg',
        childHover: 'hover:bg-blue-500/10 hover:text-white',
        childActive: 'text-white bg-blue-500/20'
      },
      'Master': { 
        hover: 'hover:bg-purple-500/20 hover:border-l-purple-400 hover:text-white',
        active: 'bg-purple-500/20 border-l-4 border-l-purple-400 text-white shadow-lg',
        childHover: 'hover:bg-purple-500/10 hover:text-white',
        childActive: 'text-white bg-purple-500/20'
      },
      'User': { 
        hover: 'hover:bg-green-500/20 hover:border-l-green-400 hover:text-white',
        active: 'bg-green-500/20 border-l-4 border-l-green-400 text-white shadow-lg',
        childHover: 'hover:bg-green-500/10 hover:text-white',
        childActive: 'text-white bg-green-500/20'
      },
      'Master Data': { 
        hover: 'hover:bg-orange-500/20 hover:border-l-orange-400 hover:text-white',
        active: 'bg-orange-500/20 border-l-4 border-l-orange-400 text-white shadow-lg',
        childHover: 'hover:bg-orange-500/10 hover:text-white',
        childActive: 'text-white bg-orange-500/20'
      },
      'Campaign': { 
        hover: 'hover:bg-pink-500/20 hover:border-l-pink-400 hover:text-white',
        active: 'bg-pink-500/20 border-l-4 border-l-pink-400 text-white shadow-lg',
        childHover: 'hover:bg-pink-500/10 hover:text-white',
        childActive: 'text-white bg-pink-500/20'
      },
      'Assigned Call': { 
        hover: 'hover:bg-teal-500/20 hover:border-l-teal-400 hover:text-white',
        active: 'bg-teal-500/20 border-l-4 border-l-teal-400 text-white shadow-lg',
        childHover: 'hover:bg-teal-500/10 hover:text-white',
        childActive: 'text-white bg-teal-500/20'
      },
      'Today\'s To-Do': { 
        hover: 'hover:bg-blue-500/20 hover:border-l-blue-400 hover:text-white',
        active: 'bg-blue-500/20 border-l-4 border-l-blue-400 text-white shadow-lg',
        childHover: 'hover:bg-blue-500/10 hover:text-white',
        childActive: 'text-white bg-blue-500/20'
      },
      'Missed Follow-up List': { 
        hover: 'hover:bg-yellow-500/20 hover:border-l-yellow-400 hover:text-white',
        active: 'bg-yellow-500/20 border-l-4 border-l-yellow-400 text-white shadow-lg',
        childHover: 'hover:bg-yellow-500/10 hover:text-white',
        childActive: 'text-white bg-yellow-500/20'
      },
      'Upcoming Follow-ups': { 
        hover: 'hover:bg-purple-500/20 hover:border-l-purple-400 hover:text-white',
        active: 'bg-purple-500/20 border-l-4 border-l-purple-400 text-white shadow-lg',
        childHover: 'hover:bg-purple-500/10 hover:text-white',
        childActive: 'text-white bg-purple-500/20'
      },
      'Report': { 
        hover: 'hover:bg-cyan-500/20 hover:border-l-cyan-400 hover:text-white',
        active: 'bg-cyan-500/20 border-l-4 border-l-cyan-400 text-white shadow-lg',
        childHover: 'hover:bg-cyan-500/10 hover:text-white',
        childActive: 'text-white bg-cyan-500/20'
      },
      'Logout': { 
        hover: 'hover:bg-red-500/20 hover:border-l-red-400 hover:text-red-600',
        active: 'bg-red-500/20 border-l-4 border-l-red-400 text-red-600 shadow-lg',
        childHover: 'hover:bg-red-500/10 hover:text-white',
        childActive: 'text-white bg-red-500/20'
      },
    };
    return colorMap[label] || colorMap['Dashboard'];
  };

  // Handle logout function
  const handleLogout = async () => {
    try {
      // Clear session data
      sessionStorage.removeItem('userToken');  
      sessionStorage.removeItem('userDetails'); 
      
      // Call logout API if needed
      await axios.post(BASE_URL + 'auth/logout', {}, { withCredentials: true });
      
      // Close modal and redirect
      setShowLogoutModal(false);
      window.location.href = '/signin'; 
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect even if API call fails
      sessionStorage.clear();
      setShowLogoutModal(false);
      window.location.href = '/signin';
    }
  };

  // Render menu items
  const renderMenuItem = (menu: MenuItem) => {
    const color = getColorClass(menu.label);

    // Special handling for logout item
    if (menu.type === 'logout' || menu.label.toLowerCase() === 'logout') {
      return (
        <li key={menu.menu_key} className="mt-auto">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`group relative flex w-full items-center gap-3 rounded-lg py-3 px-4 font-medium text-sm lg:text-base duration-300 ease-in-out transition-all ${color.hover} ${
              pathname === menu.path
                ? `${color.active} border-l-4`
                : 'text-gray-300'
            }`}
          >
            {getIcon(menu.label)}
            <span className="transition-all duration-300 text-sm lg:text-base">
              {menu.label}
            </span>
          </button>
        </li>
      );
    }

    // Case 1: Parent menu with children
    if (menu.children && menu.children.length > 0) {
      const isActive = menu.children.some(child => isPathActive(child.path));
      const isOpen = openDropdown === menu.menu_key;

      return (
        <SidebarLinkGroup key={menu.menu_key} activeCondition={isActive}>
          {(handleClick, open) => (
            <>
              <NavLink
                to="#"
                className={`group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all ${color.hover} ${
                  isActive
                    ? `${color.active} border-l-4`
                    : 'text-gray-300'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownToggle(menu.menu_key);
                }}
              >
                {getIcon(menu.label)}
                <span className="transition-all duration-300 text-sm lg:text-base">
                  {menu.label}
                </span>
                <ChevronDown 
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </NavLink>
              
              {/* Dropdown Menu */}
              <div
                className={`translate transform overflow-hidden transition-all duration-300 ${
                  !isOpen && 'hidden'
                }`}
              >
                <ul className="mt-2 mb-3 flex flex-col gap-1 pl-8">
                  {menu.children.map(child => (
                    <li key={child.menu_key}>
                      <NavLink
                        to={child.path!}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 ${color.childHover} ${
                            isActive ? `${color.childActive}` : 'text-gray-400'
                          }`
                        }
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                      >
                        {getIcon(child.label)}
                        {child.label}
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

    // Case 2: Standalone menu item
    if (menu.path) {
      return (
        <li key={menu.menu_key}>
          <NavLink
            to={menu.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all ${color.hover} ${
                isActive 
                  ? `${color.active} border-l-4` 
                  : 'text-gray-300'
              }`
            }
            onClick={() => {
              setOpenDropdown(null);
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
          >
            {getIcon(menu.label)}
            <span className="transition-all duration-300 text-sm lg:text-base">
              {menu.label}
            </span>
          </NavLink>
        </li>
      );
    }

    return null;
  };

  return (
    <>
      <aside
        ref={sidebar}
        className={`fixed left-0 top-0 z-9999 flex h-screen w-full max-w-xs flex-col overflow-hidden bg-gradient-to-b from-gray-900 to-black duration-300 ease-linear lg:static lg:h-auto lg:w-72.5 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        style={{
          maxHeight: '100dvh',
          minHeight: '-webkit-fill-available',
        }}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between gap-2 px-4 py-6 lg:py-4 flex-shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
<img
  src={Logo}
  alt="Logo"
  className="
    w-full
    max-w-[230px]
    lg:max-w-[300px]
    h-auto
    max-h-[60px]
    lg:max-h-[80px]
    object-contain
    rounded-xl
  "
/>



          </NavLink>

          <button
            ref={trigger}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            className="block lg:hidden"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* SIDEBAR CONTENT */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar"
        >
          <style>{`
            .sidebar-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .sidebar-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .sidebar-scrollbar::-webkit-scrollbar-thumb {
              background-color: #4B5563;
              border-radius: 20px;
            }
            .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: #6B7280;
            }
            @media (max-width: 1024px) {
              .sidebar-scrollbar::-webkit-scrollbar {
                width: 3px;
              }
            }
          `}</style>

          <nav className="py-4 px-4 lg:px-6">
            <div>
           
              <ul className="mb-6 flex flex-col gap-1.5">
                {/* Render regular menus */}
                {menus.map(menu => renderMenuItem(menu))}
                
                {/* Render logout item as part of the menu list */}
                {logoutItem && renderMenuItem(logoutItem)}
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-stroke pb-4 mb-4">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                Confirm Logout
              </h3>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal content */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to logout from your account?
              </p>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded border border-stroke bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-strokedark dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
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