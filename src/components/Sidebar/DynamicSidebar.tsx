// import React, { useEffect, useRef, useState } from 'react';
// import { NavLink, useLocation } from 'react-router-dom';
// import SidebarLinkGroup from './SidebarLinkGroup';
// import axios from 'axios';
// import { BASE_URL } from '../../../public/config';
// import Logo from '../../images/logo/MMS_logo.png';
// import { buildTree } from '../../utils/buildTree';

// import {
//   LayoutDashboard,
//   Database,
//   Users,
//   FileText,
//   Megaphone,
//   PhoneOutgoing,
//   CheckSquare,
//   ClipboardList,
//   CalendarDays,
//   BarChart3,
//   FolderOpen,
//   Package,
//   Bookmark,
//   Map,
//   UserPlus,
//   List,
//   FolderPlus,
//   Eye,
//   CheckCircle,
//   ChevronDown,
//   X,
//   LogOut,
//   TrendingUp,
//   ShieldCheck,
//   UserCog,
//   ClipboardCheck,
//   CalendarCheck,

//   // ✅ ADD THESE
//   Boxes,
//   Warehouse,
//   FileStack,
//   Clipboard
// } from 'lucide-react';



// interface MenuItem {
//   menu_key: string;
//   label: string;
//   path: string | null;
//   parent_key: string | null;
//   children?: MenuItem[];
//   type?: string; // Add type to distinguish logout
// }

// interface SidebarProps {
//   sidebarOpen: boolean;
//   setSidebarOpen: (arg: boolean) => void;
// }

// const DynamicSidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
//   const { pathname } = useLocation();
//   const sidebar = useRef<HTMLDivElement | null>(null);
//   const trigger = useRef<HTMLButtonElement | null>(null);

//   const [menus, setMenus] = useState<MenuItem[]>([]);
//   const [logoutItem, setLogoutItem] = useState<MenuItem | null>(null);
//   const [openDropdown, setOpenDropdown] = useState<string | null>(null);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   // Fetch menus
//   useEffect(() => {
//     axios
//       .get(`${BASE_URL}api/dynamic/sidebar`, { withCredentials: true })
//       .then(res => {
//         const allItems = res.data || [];
        
//         // Separate logout item from regular menus
//         const logoutMenuItem = allItems.find((item: MenuItem) => 
//           item.menu_key === 'logout' || item.label.toLowerCase() === 'logout'
//         );
        
//         if (logoutMenuItem) {
//           // Add type to identify logout item
//           const logoutItemWithType = {
//             ...logoutMenuItem,
//             type: 'logout'
//           };
//           setLogoutItem(logoutItemWithType);
//         }
        
//         // Filter out logout from regular menus
//         const regularMenus = allItems.filter((item: MenuItem) => 
//           !(item.menu_key === 'logout' || item.label.toLowerCase() === 'logout')
//         );
//         const tree = buildTree(regularMenus);
//         setMenus(tree);
//       })
//       .catch(err => {
//         console.error('❌ Sidebar load failed', err);
//         setMenus([]);
//       });
//   }, []);

//   // Function to handle dropdown toggle
//   const handleDropdownToggle = (menuName: string) => {
//     if (openDropdown === menuName) {
//       setOpenDropdown(null);
//     } else {
//       setOpenDropdown(menuName);
//     }
//   };

//   // Auto-open correct dropdown based on current route
//   useEffect(() => {
//     const findActiveMenu = (menus: MenuItem[]): string | null => {
//       for (const menu of menus) {
//         if (menu.children && menu.children.length > 0) {
//           const childActive = menu.children.some(child =>
//             child.path && (pathname === child.path || pathname.startsWith(child.path + '/'))
//           );
//           if (childActive) {
//             return menu.menu_key;
//           }
          
//           for (const child of menu.children) {
//             if (child.children && child.children.length > 0) {
//               const nestedActive = child.children.some(nestedChild =>
//                 nestedChild.path && (pathname === nestedChild.path || pathname.startsWith(nestedChild.path + '/'))
//               );
//               if (nestedActive) {
//                 return menu.menu_key;
//               }
//             }
//           }
//         }
//       }
//       return null;
//     };

//     const activeMenu = findActiveMenu(menus);
//     setOpenDropdown(activeMenu);
//   }, [pathname, menus]);

//   // Close sidebar on click outside
//   useEffect(() => {
//     const clickHandler = ({ target }: MouseEvent) => {
//       if (!sidebar.current || !trigger.current) return;
//       if (
//         !sidebarOpen ||
//         sidebar.current.contains(target as Node) ||
//         trigger.current.contains(target as Node)
//       )
//         return;
//       setSidebarOpen(false);
//     };
//     document.addEventListener('click', clickHandler);
//     return () => document.removeEventListener('click', clickHandler);
//   }, [sidebarOpen, setSidebarOpen]);

//   // Close sidebar on escape key
//   useEffect(() => {
//     const keyHandler = ({ key }: KeyboardEvent) => {
//       if (!sidebarOpen || key !== 'Escape') return;
//       setSidebarOpen(false);
//     };
//     document.addEventListener('keydown', keyHandler);
//     return () => document.removeEventListener('keydown', keyHandler);
//   }, [sidebarOpen, setSidebarOpen]);

//   // Check if a path is active
//   const isPathActive = (path?: string | null) =>
//     path && (pathname === path || pathname.startsWith(path + '/'));



//   const normalize = (text: string) =>
//   text?.toLowerCase().replace(/['’]/g, "").trim();

// const getIcon = (label: string) => {
//   const key = normalize(label);

//   const iconMap: Record<string, React.ReactNode> = {
//     // ===== TOP MENUS =====
//     "dashboard": <LayoutDashboard className="w-5 h-5" />,
//     "master": <Database className="w-5 h-5" />,
//     "user": <Users className="w-5 h-5" />,
//     "master data": <FileText className="w-5 h-5" />,
//     "campaign": <Megaphone className="w-5 h-5" />,
//     "assigned call": <PhoneOutgoing className="w-5 h-5" />,
//     "Today's Task": <CheckSquare className="w-5 h-5" />,
//     "missed follow-up list": <ClipboardList className="w-5 h-5" />,
//     "upcoming follow-ups": <CalendarDays className="w-5 h-5" />,
//     "report": <BarChart3 className="w-5 h-5" />,
//     "attendance report": <CalendarCheck className="w-5 h-5" />,

//     // ===== EXECUTION =====
//     "execution": <TrendingUp className="w-5 h-5" />,
//     "Assigned Procress": <CalendarCheck className="w-5 h-5" />,
//     "Daily Operations": <ClipboardCheck className="w-5 h-5" />,
//     "process type": <ClipboardCheck className="w-4 h-4" />,
//     "schedule": <CalendarCheck className="w-4 h-4" />,
//     "pre execution": <CalendarCheck className="w-4 h-4" />,
//     "complete execution": <CheckCircle className="w-4 h-4" />,

//     // ===== INVENTORY =====
//     "stock": <Warehouse className="w-5 h-5" />,
//     "inword": <Boxes className="w-5 h-5" />,
//     "mrn": <FileStack className="w-5 h-5" />,

//     // MRN children
//     "generate mrn": <FileStack className="w-4 h-4" />,
//     "verify mrn": <CheckCircle className="w-4 h-4" />,
//     "approve mrn": <CheckCircle className="w-4 h-4" />,
//     "manage mrn": <Clipboard className="w-4 h-4" />,

//     // ===== QUOTATION =====
//     "quotation template": <FileStack className="w-5 h-5" />,
//     "quotation": <Clipboard className="w-5 h-5" />,

//     // ===== MASTER CHILDREN =====
//     "category": <FolderOpen className="w-4 h-4" />,
//     "product": <Package className="w-4 h-4" />,
//     "reference": <Bookmark className="w-4 h-4" />,
//     "area": <Map className="w-4 h-4" />,
//     "kit": <Package className="w-4 h-4" />,

//     // ===== USER =====
//     "add user": <UserPlus className="w-4 h-4" />,
//     "user list": <List className="w-4 h-4" />,

//     // ===== CAMPAIGN =====
//     "create campaign": <FolderPlus className="w-4 h-4" />,
//     "view campaign": <Eye className="w-4 h-4" />,

//     // ===== REPORT =====
//     "drop leads report": <Eye className="w-4 h-4" />,
//     "closed leads report": <CheckCircle className="w-4 h-4" />,
//     "employeewise report": <Users className="w-4 h-4" />,
//     "leadwise report": <TrendingUp className="w-4 h-4" />,

//     // ===== ADMIN =====
//     "role permission": <ShieldCheck className="w-4 h-4" />,
//     "employee report": <UserCog className="w-4 h-4" />,

//     "logout": <LogOut className="w-5 h-5" />,
//     // Add this to your iconMap in the sidebar
// "employee work report": <UserCog className="w-4 h-4" />,

// "Meta Leads Report": <Package className="w-4 h-4" />,


//   };

//   return iconMap[key] || <FileText className="w-5 h-5" />;
// };




//   // Get color for menu item with static classes
//   const getColorClass = (label: string) => {
//     const colorMap: Record<string, {hover: string, active: string, childHover: string, childActive: string}> = {
//       'Dashboard': { 
//         hover: 'hover:bg-blue-500/20 hover:border-l-blue-400 hover:text-white',
//         active: 'bg-blue-500/20 border-l-4 border-l-blue-400 text-white shadow-lg',
//         childHover: 'hover:bg-blue-500/10 hover:text-white',
//         childActive: 'text-white bg-blue-500/20'
//       },
//       'Master': { 
//         hover: 'hover:bg-purple-500/20 hover:border-l-purple-400 hover:text-white',
//         active: 'bg-purple-500/20 border-l-4 border-l-purple-400 text-white shadow-lg',
//         childHover: 'hover:bg-purple-500/10 hover:text-white',
//         childActive: 'text-white bg-purple-500/20'
//       },
//       'User': { 
//         hover: 'hover:bg-green-500/20 hover:border-l-green-400 hover:text-white',
//         active: 'bg-green-500/20 border-l-4 border-l-green-400 text-white shadow-lg',
//         childHover: 'hover:bg-green-500/10 hover:text-white',
//         childActive: 'text-white bg-green-500/20'
//       },
//       'Master Data': { 
//         hover: 'hover:bg-orange-500/20 hover:border-l-orange-400 hover:text-white',
//         active: 'bg-orange-500/20 border-l-4 border-l-orange-400 text-white shadow-lg',
//         childHover: 'hover:bg-orange-500/10 hover:text-white',
//         childActive: 'text-white bg-orange-500/20'
//       },
//       'Campaign': { 
//         hover: 'hover:bg-pink-500/20 hover:border-l-pink-400 hover:text-white',
//         active: 'bg-pink-500/20 border-l-4 border-l-pink-400 text-white shadow-lg',
//         childHover: 'hover:bg-pink-500/10 hover:text-white',
//         childActive: 'text-white bg-pink-500/20'
//       },
//       'Assigned Call': { 
//         hover: 'hover:bg-teal-500/20 hover:border-l-teal-400 hover:text-white',
//         active: 'bg-teal-500/20 border-l-4 border-l-teal-400 text-white shadow-lg',
//         childHover: 'hover:bg-teal-500/10 hover:text-white',
//         childActive: 'text-white bg-teal-500/20'
//       },
//       'Today\'s To-Do': { 
//         hover: 'hover:bg-blue-500/20 hover:border-l-blue-400 hover:text-white',
//         active: 'bg-blue-500/20 border-l-4 border-l-blue-400 text-white shadow-lg',
//         childHover: 'hover:bg-blue-500/10 hover:text-white',
//         childActive: 'text-white bg-blue-500/20'
//       },
//       'Missed Follow-up List': { 
//         hover: 'hover:bg-yellow-500/20 hover:border-l-yellow-400 hover:text-white',
//         active: 'bg-yellow-500/20 border-l-4 border-l-yellow-400 text-white shadow-lg',
//         childHover: 'hover:bg-yellow-500/10 hover:text-white',
//         childActive: 'text-white bg-yellow-500/20'
//       },
//       'Upcoming Follow-ups': { 
//         hover: 'hover:bg-purple-500/20 hover:border-l-purple-400 hover:text-white',
//         active: 'bg-purple-500/20 border-l-4 border-l-purple-400 text-white shadow-lg',
//         childHover: 'hover:bg-purple-500/10 hover:text-white',
//         childActive: 'text-white bg-purple-500/20'
//       },
//       'Report': { 
//         hover: 'hover:bg-cyan-500/20 hover:border-l-cyan-400 hover:text-white',
//         active: 'bg-cyan-500/20 border-l-4 border-l-cyan-400 text-white shadow-lg',
//         childHover: 'hover:bg-cyan-500/10 hover:text-white',
//         childActive: 'text-white bg-cyan-500/20'
//       },
//       'Logout': { 
//         hover: 'hover:bg-red-500/20 hover:border-l-red-400 hover:text-red-600',
//         active: 'bg-red-500/20 border-l-4 border-l-red-400 text-red-600 shadow-lg',
//         childHover: 'hover:bg-red-500/10 hover:text-white',
//         childActive: 'text-white bg-red-500/20'
//       },
//     };
//     return colorMap[label] || colorMap['Dashboard'];
//   };

//   // Handle logout function
//   const handleLogout = async () => {
//     try {
//       // Clear session data
//       sessionStorage.removeItem('userToken');  
//       sessionStorage.removeItem('userDetails'); 
      
//       // Call logout API if needed
//       await axios.post(BASE_URL + 'auth/logout', {}, { withCredentials: true });
      
//       // Close modal and redirect
//       setShowLogoutModal(false);
//       window.location.href = '/signin'; 
//     } catch (error) {
//       console.error('Error during logout:', error);
//       // Still redirect even if API call fails
//       sessionStorage.clear();
//       setShowLogoutModal(false);
//       window.location.href = '/signin';
//     }
//   };

//   // Render menu items
//   const renderMenuItem = (menu: MenuItem) => {
//     const color = getColorClass(menu.label);

//     // Special handling for logout item
//     if (menu.type === 'logout' || menu.label.toLowerCase() === 'logout') {
//       return (
//         <li key={menu.menu_key} className="mt-auto">
//           <button
//             onClick={() => setShowLogoutModal(true)}
//             className={`group relative flex w-full items-center gap-3 rounded-lg py-3 px-4 font-medium text-sm lg:text-base duration-300 ease-in-out transition-all ${color.hover} ${
//               pathname === menu.path
//                 ? `${color.active} border-l-4`
//                 : 'text-gray-300'
//             }`}
//           >
//             {getIcon(menu.label)}
//             <span className="transition-all duration-300 text-sm lg:text-base">
//               {menu.label}
//             </span>
//           </button>
//         </li>
//       );
//     }

//     // Case 1: Parent menu with children
//     if (menu.children && menu.children.length > 0) {
//       const isActive = menu.children.some(child => isPathActive(child.path));
//       const isOpen = openDropdown === menu.menu_key;

//       return (
//         <SidebarLinkGroup key={menu.menu_key} activeCondition={isActive}>
//           {(handleClick, open) => (
//             <>
//               <NavLink
//                 to="#"
//                 className={`group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all ${color.hover} ${
//                   isActive
//                     ? `${color.active} border-l-4`
//                     : 'text-gray-300'
//                 }`}
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handleDropdownToggle(menu.menu_key);
//                 }}
//               >
//                 {getIcon(menu.label)}
//                 <span className="transition-all duration-300 text-sm lg:text-base">
//                   {menu.label}
//                 </span>
//                 <ChevronDown 
//                   className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-300 ${
//                     isOpen ? 'rotate-180' : ''
//                   }`}
//                 />
//               </NavLink>
              
//               {/* Dropdown Menu */}
//               <div
//                 className={`translate transform overflow-hidden transition-all duration-300 ${
//                   !isOpen && 'hidden'
//                 }`}
//               >
//                 <ul className="mt-2 mb-3 flex flex-col gap-1 pl-8">
//                   {menu.children.map(child => (
//                     <li key={child.menu_key}>
//                       <NavLink
//                         to={child.path!}
//                         className={({ isActive }) =>
//                           `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 ${color.childHover} ${
//                             isActive ? `${color.childActive}` : 'text-gray-400'
//                           }`
//                         }
//                         onClick={() => {
//                           if (window.innerWidth < 1024) {
//                             setSidebarOpen(false);
//                           }
//                         }}
//                       >
//                         {getIcon(child.label)}
//                         {child.label}
//                       </NavLink>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </>
//           )}
//         </SidebarLinkGroup>
//       );
//     }

//     // Case 2: Standalone menu item
//     if (menu.path) {
//       return (
//         <li key={menu.menu_key}>
//           <NavLink
//             to={menu.path}
//             className={({ isActive }) =>
//               `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all ${color.hover} ${
//                 isActive 
//                   ? `${color.active} border-l-4` 
//                   : 'text-gray-300'
//               }`
//             }
//             onClick={() => {
//               setOpenDropdown(null);
//               if (window.innerWidth < 1024) {
//                 setSidebarOpen(false);
//               }
//             }}
//           >
//             {getIcon(menu.label)}
//             <span className="transition-all duration-300 text-sm lg:text-base">
//               {menu.label}
//             </span>
//           </NavLink>
//         </li>
//       );
//     }

//     return null;
//   };

//   return (
//     <>
//       <aside
//         ref={sidebar}
//         className={`fixed left-0 top-0 z-9999 flex h-screen w-full max-w-xs flex-col overflow-hidden bg-gradient-to-b from-gray-900 to-black duration-300 ease-linear lg:static lg:h-auto lg:w-72.5 lg:translate-x-0 ${
//           sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
//         }`}
//         style={{
//           maxHeight: '100dvh',
//           minHeight: '-webkit-fill-available',
//         }}
//       >
//         {/* SIDEBAR HEADER */}
//         <div className="flex items-center justify-between gap-2 px-4 py-6 lg:py-4 flex-shrink-0">
//           <NavLink to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
// <img
//   src={Logo}
//   alt="Logo"
//   className="
//     w-full
//     max-w-[230px]
//     lg:max-w-[300px]
//     h-auto
//     max-h-[60px]
//     lg:max-h-[80px]
//     object-contain
//     rounded-xl
//   "
// />



//           </NavLink>

//           <button
//             ref={trigger}
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             aria-controls="sidebar"
//             aria-expanded={sidebarOpen}
//             className="block lg:hidden"
//           >
//             <X className="w-6 h-6 text-white" />
//           </button>
//         </div>

//         {/* SIDEBAR CONTENT */}
//         <div 
//           className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar"
//         >
//           <style>{`
//             .sidebar-scrollbar::-webkit-scrollbar {
//               width: 4px;
//             }
//             .sidebar-scrollbar::-webkit-scrollbar-track {
//               background: transparent;
//             }
//             .sidebar-scrollbar::-webkit-scrollbar-thumb {
//               background-color: #4B5563;
//               border-radius: 20px;
//             }
//             .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
//               background-color: #6B7280;
//             }
//             @media (max-width: 1024px) {
//               .sidebar-scrollbar::-webkit-scrollbar {
//                 width: 3px;
//               }
//             }
//           `}</style>

//           <nav className="py-4 px-4 lg:px-6">
//             <div>
           
//               <ul className="mb-6 flex flex-col gap-1.5">
//                 {/* Render regular menus */}
//                 {menus.map(menu => renderMenuItem(menu))}
                
//                 {/* Render logout item as part of the menu list */}
//                 {logoutItem && renderMenuItem(logoutItem)}
//               </ul>
//             </div>
//           </nav>
//         </div>
//       </aside>

//       {/* Logout Confirmation Modal */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
//           <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
//             {/* Modal header */}
//             <div className="flex items-center justify-between border-b border-stroke pb-4 mb-4">
//               <h3 className="text-xl font-semibold text-black dark:text-white">
//                 Confirm Logout
//               </h3>
//               <button
//                 onClick={() => setShowLogoutModal(false)}
//                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Modal content */}
//             <div className="mb-6">
//               <p className="text-gray-600 dark:text-gray-300">
//                 Are you sure you want to logout from your account?
//               </p>
//             </div>

//             {/* Modal footer */}
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowLogoutModal(false)}
//                 className="px-4 py-2 rounded border border-stroke bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-strokedark dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
//               >
//                 Yes, Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default DynamicSidebar; 

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
  UserCog,
  ClipboardCheck,
  CalendarCheck,
  Boxes,
  Warehouse,
  FileStack,
  Clipboard,
  MapPin,
  Activity,
  AlertCircle,
  Clock,
  UserCheck,
  Target,
  Settings,
  GitBranch,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  PieChart,
  LineChart,
  Download,
  Upload,
  RefreshCw,
  Flag,
  Award,
  Briefcase,
  Home,
  Grid,
  Layers,
  Tag,
  Hash,
  Crosshair,
  Compass,
  Globe,
  Lock,
  Unlock,
  Key,
  Bell,
  BookOpen,
  Box,
  Truck,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Percent,
  Clock3,
  Hourglass,
  ThumbsUp,
  ThumbsDown,
  Star,
  Heart,
  Zap,
  Wind,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Droplets,
  Flame,
  Leaf,
  TreePine,
  Mountain,
  Waves,
  Anchor,
  Ship,
  Plane,
  Car,
  Bike,
  Train,
  Bus,
  Coffee,
  Pizza,
  Utensils,
  Wine,
  Beer,
  Cake,
  Gift,
  Gem,
  Diamond,
  Crown,
  Rocket,
  Satellite,
  Telescope,
  Microscope,
  Beaker,
  Atom,
  Brain,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Camera,
  Video,
  Music,
  Headphones,
  Mic,
  Speaker,
  Radio,
  Tv,
  Printer,
  Copy,
  Save,
  Trash2,
  Edit,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Move,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Plus,
  Minus,
  Divide,
  Equal,
  Infinity,
  Pi,
  Sigma,
  Omega
} from 'lucide-react';

interface MenuItem {
  menu_key: string;
  label: string;
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

  // Fetch menus
  useEffect(() => {
    axios
      .get(`${BASE_URL}api/dynamic/sidebar`, { withCredentials: true })
      .then(res => {
        const allItems = res.data || [];
        
        const logoutMenuItem = allItems.find((item: MenuItem) => 
          item.menu_key === 'logout' || item.label.toLowerCase() === 'logout'
        );
        
        if (logoutMenuItem) {
          const logoutItemWithType = {
            ...logoutMenuItem,
            type: 'logout'
          };
          setLogoutItem(logoutItemWithType);
        }
        
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

  const handleDropdownToggle = (menuName: string) => {
    if (openDropdown === menuName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(menuName);
    }
  };

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

  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== 'Escape') return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  const isPathActive = (path?: string | null) =>
    path && (pathname === path || pathname.startsWith(path + '/'));

  const normalize = (text: string) => {
    return text?.toLowerCase()
      .replace(/['’"`]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getIcon = (label: string) => {
    const key = normalize(label);
    
    const iconMap: Record<string, React.ReactNode> = {
      // Dashboard
      "dashboard": <LayoutDashboard className="w-5 h-5" />,
      "dash board": <LayoutDashboard className="w-5 h-5" />,
      
      // Master
      "master": <Database className="w-5 h-5" />,
      "master data": <Database className="w-5 h-5" />,
      
      // User related
      "user": <Users className="w-5 h-5" />,
      "users": <Users className="w-5 h-5" />,
      "add user": <UserPlus className="w-5 h-5" />,
      "user list": <List className="w-5 h-5" />,
      "employee wise report": <Users className="w-5 h-5" />,
      "employee work report": <UserCog className="w-5 h-5" />,
      "employeewise report": <Users className="w-5 h-5" />,
      "role permission": <ShieldCheck className="w-5 h-5" />,
      
      // Campaign
      "campaign": <Megaphone className="w-5 h-5" />,
      "create campaign": <FolderPlus className="w-5 h-5" />,
      "view campaign": <Eye className="w-5 h-5" />,
      
      // Calls & Tasks
      "assigned call": <PhoneOutgoing className="w-5 h-5" />,
      "assigned calls": <PhoneOutgoing className="w-5 h-5" />,
      "today's task": <CheckSquare className="w-5 h-5" />,
      "todays task": <CheckSquare className="w-5 h-5" />,
      "today task": <CheckSquare className="w-5 h-5" />,
      "missed follow up list": <ClipboardList className="w-5 h-5" />,
      "missed follow-up list": <ClipboardList className="w-5 h-5" />,
      "upcoming follow ups": <CalendarDays className="w-5 h-5" />,
      "upcoming follow-ups": <CalendarDays className="w-5 h-5" />,
      
      // Reports
      "report": <BarChart3 className="w-5 h-5" />,
      "reports": <BarChart3 className="w-5 h-5" />,
      "attendance report": <CalendarCheck className="w-5 h-5" />,
      "drop leads report": <Eye className="w-5 h-5" />,
      "closed leads report": <CheckCircle className="w-5 h-5" />,
      "leadwise report": <TrendingUp className="w-5 h-5" />,
      "lead wise report": <TrendingUp className="w-5 h-5" />,
      "meta leads report": <Package className="w-5 h-5" />,
      "statistics": <BarChart3 className="w-5 h-5" />,
      
      // Execution
      "execution": <TrendingUp className="w-5 h-5" />,
      "pre execution": <Clock className="w-5 h-5" />,
      "complete execution": <CheckCircle className="w-5 h-5" />,
      "assigned procress": <CalendarCheck className="w-5 h-5" />,
      "assigned process": <CalendarCheck className="w-5 h-5" />,
      "daily operations": <ClipboardCheck className="w-5 h-5" />,
      "process type": <GitBranch className="w-5 h-5" />,
      "schedule": <Calendar className="w-5 h-5" />,
      "managed execution": <ClipboardCheck className="w-5 h-5" />,
      
      // Inventory/Stock
      "stock": <Warehouse className="w-5 h-5" />,
      "inword": <Boxes className="w-5 h-5" />,
      "inward": <Boxes className="w-5 h-5" />,
      "mrn": <FileStack className="w-5 h-5" />,
      "generate mrn": <FileStack className="w-5 h-5" />,
      "verify mrn": <CheckCircle className="w-5 h-5" />,
      "approve mrn": <CheckCircle className="w-5 h-5" />,
      "manage mrn": <Clipboard className="w-5 h-5" />,
       "daily operation": <Activity className="w-5 h-5" />,        // <-- Second occurrence (duplicate key?)
      
      // Quotation
      "quotation template": <FileText className="w-5 h-5" />,
      "quotation": <FileText className="w-5 h-5" />,
      "quotations": <FileText className="w-5 h-5" />,
      
      // Master Data children
      "category": <FolderOpen className="w-5 h-5" />,
      "categories": <FolderOpen className="w-5 h-5" />,
      "product": <Package className="w-5 h-5" />,
      "products": <Package className="w-5 h-5" />,
      "sources": <Bookmark className="w-5 h-5" />,
      "references": <Bookmark className="w-5 h-5" />,
      "city": <Map className="w-5 h-5" />,
      "areas": <Map className="w-5 h-5" />,
      "kit": <Package className="w-5 h-5" />,
      "kits": <Package className="w-5 h-5" />,
      
      // Logout
      "logout": <LogOut className="w-5 h-5" />,
      "sign out": <LogOut className="w-5 h-5" />,
      
      // Default icons for common patterns
      "add": <Plus className="w-5 h-5" />,
      "create": <Plus className="w-5 h-5" />,
      "new": <Plus className="w-5 h-5" />,
      "view": <Eye className="w-5 h-5" />,
      "list": <List className="w-5 h-5" />,
      "manage": <Settings className="w-5 h-5" />,
      "settings": <Settings className="w-5 h-5" />,
      "profile": <UserCog className="w-5 h-5" />,
    };

    // Try exact match first
    if (iconMap[key]) {
      return iconMap[key];
    }

    // Try to find partial match
    for (const [mapKey, icon] of Object.entries(iconMap)) {
      if (key.includes(mapKey) || mapKey.includes(key)) {
        return icon;
      }
    }

    // Return default icon if no match found
    return <FileText className="w-5 h-5" />;
  };

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
      'Today\'s Task': { 
        hover: 'hover:bg-cyan-500/20 hover:border-l-cyan-400 hover:text-white',
        active: 'bg-cyan-500/20 border-l-4 border-l-cyan-400 text-white shadow-lg',
        childHover: 'hover:bg-cyan-500/10 hover:text-white',
        childActive: 'text-white bg-cyan-500/20'
      },
      'Missed Follow-up List': { 
        hover: 'hover:bg-yellow-500/20 hover:border-l-yellow-400 hover:text-white',
        active: 'bg-yellow-500/20 border-l-4 border-l-yellow-400 text-white shadow-lg',
        childHover: 'hover:bg-yellow-500/10 hover:text-white',
        childActive: 'text-white bg-yellow-500/20'
      },
      'Upcoming Follow-ups': { 
        hover: 'hover:bg-indigo-500/20 hover:border-l-indigo-400 hover:text-white',
        active: 'bg-indigo-500/20 border-l-4 border-l-indigo-400 text-white shadow-lg',
        childHover: 'hover:bg-indigo-500/10 hover:text-white',
        childActive: 'text-white bg-indigo-500/20'
      },
      'Report': { 
        hover: 'hover:bg-emerald-500/20 hover:border-l-emerald-400 hover:text-white',
        active: 'bg-emerald-500/20 border-l-4 border-l-emerald-400 text-white shadow-lg',
        childHover: 'hover:bg-emerald-500/10 hover:text-white',
        childActive: 'text-white bg-emerald-500/20'
      },
      'Stock': { 
        hover: 'hover:bg-amber-500/20 hover:border-l-amber-400 hover:text-white',
        active: 'bg-amber-500/20 border-l-4 border-l-amber-400 text-white shadow-lg',
        childHover: 'hover:bg-amber-500/10 hover:text-white',
        childActive: 'text-white bg-amber-500/20'
      },
      'Logout': { 
        hover: 'hover:bg-red-500/20 hover:border-l-red-400 hover:text-red-400',
        active: 'bg-red-500/20 border-l-4 border-l-red-400 text-red-400 shadow-lg',
        childHover: 'hover:bg-red-500/10 hover:text-white',
        childActive: 'text-white bg-red-500/20'
      },
    };
    
    // Try to find exact match first
    if (colorMap[label]) {
      return colorMap[label];
    }
    
    // Try to find partial match
    for (const [key, value] of Object.entries(colorMap)) {
      if (label.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(label.toLowerCase())) {
        return value;
      }
    }
    
    // Default to Dashboard colors
    return colorMap['Dashboard'];
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('userToken');  
      sessionStorage.removeItem('userDetails'); 
      
      await axios.post(BASE_URL + 'auth/logout', {}, { withCredentials: true });
      
      setShowLogoutModal(false);
      window.location.href = '/signin'; 
    } catch (error) {
      console.error('Error during logout:', error);
      sessionStorage.clear();
      setShowLogoutModal(false);
      window.location.href = '/signin';
    }
  };

  const renderMenuItem = (menu: MenuItem) => {
    const color = getColorClass(menu.label);

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
                <span className="transition-all duration-300 text-sm lg:text-base flex-1">
                  {menu.label}
                </span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </NavLink>
              
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

        <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
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
                {menus.map(menu => renderMenuItem(menu))}
                {logoutItem && renderMenuItem(logoutItem)}
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
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

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to logout from your account?
              </p>
            </div>

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
