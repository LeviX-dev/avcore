import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import Logo from '../../images/logo/MMS_logo.png';
import {
  LayoutDashboard,
  Database,
  Users,
  FileText,
  Megaphone,
  CalendarCheck,
  MapPin,
  BarChart3,
  FolderOpen,
  Package,
  Bookmark,
  Map,
  UserPlus,
  List,
  FolderPlus,
  Eye,
  PhoneOutgoing,
  ClipboardList,
  TrendingUp,
  ChevronDown,
  X,
  CheckCircle,
  CalendarDays,
  CheckSquare,
  LogOut
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );

  // State to track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // State for logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Function to handle dropdown toggle with auto-close logic
  const handleDropdownToggle = (menuName: string) => {
    // If clicking the same dropdown, close it
    if (openDropdown === menuName) {
      setOpenDropdown(null);
    } else {
      // If clicking a different dropdown, open the new one and close any existing one
      setOpenDropdown(menuName);
    }
  };

  // Auto-open correct dropdown based on current route on mount and route changes
  useEffect(() => {
    // Determine which dropdown should be open based on current pathname
    if (pathname.includes('/master') || pathname === '/master') {
      setOpenDropdown('master');
    } else if (pathname.includes('/user') || pathname === '/user') {
      setOpenDropdown('user');
    } else if (pathname.includes('/followup') || pathname.includes('/campaign') || pathname === '/campaign') {
      setOpenDropdown('campaign');
    } else if (pathname.includes('/report') || pathname === '/report') {
      setOpenDropdown('report');
    } else {
      // If not in any of these sections, close all dropdowns
      setOpenDropdown(null);
    }
  }, [pathname]);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, setSidebarOpen]);

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
        {/* <!-- SIDEBAR HEADER --> */}
        <div className="flex items-center justify-between gap-2 px-4 py-6 lg:py-4 flex-shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <img 
              className="h-auto w-full max-w-[180px] rounded-xl" 
              src={Logo} 
              alt="Logo" 
              style={{ 
                maxHeight: '50px',
                objectFit: 'contain' 
              }}
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
        {/* <!-- SIDEBAR HEADER --> */}

        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: '#4B5563 transparent',
          }}
        >
          {/* Custom scrollbar styles */}
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

          {/* <!-- Sidebar Menu --> */}
          <nav className="py-4 px-4 lg:px-6 sidebar-scrollbar">
            {/* <!-- Menu Group --> */}
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-blue-400 uppercase tracking-wider">
                MENU
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                {/* <!-- Menu Item Dashboard --> */}
                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-blue-500/20 hover:border-l-4 hover:border-l-blue-400 hover:pl-3 ${
                        isActive 
                          ? 'bg-blue-500/20 border-l-4 border-l-blue-400 text-white shadow-lg' 
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
                    <LayoutDashboard className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="transition-all duration-300 text-sm lg:text-base">Dashboard</span>
                  </NavLink>
                </li>
                {/* <!-- Menu Item Dashboard --> */}

                {/* <!-- Menu Item Master --> */}
                <SidebarLinkGroup
                  activeCondition={
                    pathname === '/master' || pathname.includes('master')
                  }
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <NavLink
                          to="#"
                          className={`group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-purple-500/20 hover:border-l-4 hover:border-l-purple-400 hover:pl-3 ${
                            (pathname === '/master' || pathname.includes('master')) &&
                            'bg-purple-500/20 border-l-4 border-l-purple-400 text-white shadow-lg'
                          } text-gray-300`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDropdownToggle('master');
                          }}
                        >
                          <Database className="w-5 h-5 transition-transform group-hover:scale-110" />
                          <span className="transition-all duration-300 text-sm lg:text-base">Master</span>
                          <ChevronDown 
                            className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-300 ${
                              openDropdown === 'master' ? 'rotate-180' : ''
                            }`}
                          />
                        </NavLink>
                        {/* <!-- Dropdown Menu Start --> */}
                        <div
                          className={`translate transform overflow-hidden transition-all duration-300 ${
                            openDropdown !== 'master' && 'hidden'
                          }`}
                        >
                          <ul className="mt-2 mb-3 flex flex-col gap-1 pl-8">
                            <li>
                              <NavLink
                                to="/master/category"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-purple-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-purple-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <FolderOpen className="w-4 h-4" />
                                Category
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/master/product"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-purple-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-purple-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <Package className="w-4 h-4" />
                                Product
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/master/reference"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-purple-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-purple-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <Bookmark className="w-4 h-4" />
                                Reference
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/master/area"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-purple-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-purple-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <Map className="w-4 h-4" />
                                Area
                              </NavLink>
                            </li> 
                          </ul>
                        </div>
                        {/* <!-- Dropdown Menu End --> */}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                {/* <!-- Menu Item Master --> */}

                {/* <!-- Menu Item User --> */}
                <SidebarLinkGroup
                  activeCondition={
                    pathname === '/user' || pathname.includes('user')
                  }
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <NavLink
                          to="#"
                          className={`group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-green-500/20 hover:border-l-4 hover:border-l-green-400 hover:pl-3 ${
                            (pathname === '/user' || pathname.includes('user')) &&
                            'bg-green-500/20 border-l-4 border-l-green-400 text-white shadow-lg'
                          } text-gray-300`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDropdownToggle('user');
                          }}
                        >
                          <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
                          <span className="transition-all duration-300 text-sm lg:text-base">User</span>
                          <ChevronDown 
                            className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-300 ${
                              openDropdown === 'user' ? 'rotate-180' : ''
                            }`}
                          />
                        </NavLink>
                        {/* <!-- Dropdown Menu Start --> */}
                        <div
                          className={`translate transform overflow-hidden transition-all duration-300 ${
                            openDropdown !== 'user' && 'hidden'
                          }`}
                        >
                          <ul className="mt-2 mb-3 flex flex-col gap-1 pl-8">
                            <li>
                              <NavLink
                                to="/user/add-user"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-green-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-green-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <UserPlus className="w-4 h-4" />
                                Add User
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/user/user-list"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-green-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-green-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <List className="w-4 h-4" />
                                User List
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                        {/* <!-- Dropdown Menu End --> */}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                {/* <!-- Menu Item User --> */}

                {/* <!-- Menu Item Master Data --> */}
                <li>
                  <NavLink
                    to="/master-data"
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-orange-500/20 hover:border-l-4 hover:border-l-orange-400 hover:pl-3 ${
                        isActive 
                          ? 'bg-orange-500/20 border-l-4 border-l-orange-400 text-white shadow-lg' 
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
                    <FileText className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="transition-all duration-300 text-sm lg:text-base">Master Data</span>
                  </NavLink>
                </li>
                {/* <!-- Menu Item Master Data --> */}

                {/* <!-- Menu Item Campaign --> */}
                <SidebarLinkGroup
                  activeCondition={
                    pathname.includes('followup') || pathname.includes('campaign')
                  }
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <NavLink
                          to="#"
                          className={`group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-pink-500/20 hover:border-l-4 hover:border-l-pink-400 hover:pl-3 ${
                            (pathname.includes('followup') || pathname.includes('campaign')) &&
                            'bg-pink-500/20 border-l-4 border-l-pink-400 text-white shadow-lg'
                          } text-gray-300`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDropdownToggle('campaign');
                          }}
                        >
                          <Megaphone className="w-5 h-5 transition-transform group-hover:scale-110" />
                          <span className="transition-all duration-300 text-sm lg:text-base">Campaign</span>
                          <ChevronDown 
                            className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-300 ${
                              openDropdown === 'campaign' ? 'rotate-180' : ''
                            }`}
                          />
                        </NavLink>
                        {/* <!-- Dropdown Menu Start --> */}
                        <div
                          className={`translate transform overflow-hidden transition-all duration-300 ${
                            openDropdown !== 'campaign' && 'hidden'
                          }`}
                        >
                          <ul className="mt-2 mb-3 flex flex-col gap-1 pl-8">
                            <li>
                              <NavLink
                                to="/followup/campaign-page"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-pink-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-pink-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <FolderPlus className="w-4 h-4" />
                                Create Campaign
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/followup/view-campaign"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-pink-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-pink-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4" />
                                View Campaign
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                        {/* <!-- Dropdown Menu End --> */}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                {/* <!-- Menu Item Campaign --> */}

                {/* <!-- Menu Item Assigned Call --> */}
                <li>
                  <NavLink
                    to="/call"
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-teal-500/20 hover:border-l-4 hover:border-l-teal-400 hover:pl-3 ${
                        isActive 
                          ? 'bg-teal-500/20 border-l-4 border-l-teal-400 text-white shadow-lg' 
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
                    <PhoneOutgoing className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="transition-all duration-300 text-sm lg:text-base">Assigned Call</span>
                  </NavLink>
                </li>
                {/* <!-- Menu Item Assigned Call --> */}

                <li>
                  <NavLink
                    to="/todays-todo"
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-blue-500/20 hover:border-l-4 hover:border-l-blue-400 hover:pl-3 ${
                        isActive 
                          ? 'bg-blue-500/20 border-l-4 border-l-blue-400 text-white shadow-lg' 
                          : 'text-gray-300'
                      }`
                    }
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <CheckSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="transition-all duration-300 text-sm lg:text-base">Today's To-Do</span>
                  </NavLink>
                </li>

                {/* <!-- Menu Item: Follow-up List --> */}
                <li>
                  <NavLink
                    to="/followup/followup-list"
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-yellow-500/20 hover:border-l-4 hover:border-l-yellow-400 hover:pl-3 ${
                        isActive 
                          ? 'bg-yellow-500/20 border-l-4 border-l-yellow-400 text-white shadow-lg' 
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
                    <ClipboardList className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="transition-all duration-300 text-sm lg:text-base"> Missed Follow-up List</span>
                  </NavLink>
                </li>
                {/* <!-- Menu Item: Follow-up List --> */}

                <li>
                  <NavLink
                    to="/upcoming-followups"
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-purple-500/20 hover:border-l-4 hover:border-l-purple-400 hover:pl-3 ${
                        isActive 
                          ? 'bg-purple-500/20 border-l-4 border-l-purple-400 text-white shadow-lg' 
                          : 'text-gray-300'
                      }`
                    }
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <CalendarDays className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="transition-all duration-300 text-sm lg:text-base">Upcoming Follow-ups</span>
                  </NavLink>
                </li>

<li>
  <NavLink
    to="/attendance-report"
    className={({ isActive }) =>
      `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-indigo-500/20 hover:border-l-4 hover:border-l-indigo-400 hover:pl-3 ${
        isActive
          ? 'bg-indigo-500/20 border-l-4 border-l-indigo-400 text-white shadow-lg'
          : 'text-gray-300'
      }`
    }
  >
    <CalendarCheck className="w-5 h-5" />
    Attendance Report
  </NavLink>
</li>


                {/* <!-- Menu Item Report --> */}
                <SidebarLinkGroup
                  activeCondition={
                    pathname === '/report' || pathname.includes('report')
                  }
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <NavLink
                          to="#"
                          className={`group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out transition-all hover:bg-cyan-500/20 hover:border-l-4 hover:border-l-cyan-400 hover:pl-3 ${
                            (pathname === '/report' || pathname.includes('report')) &&
                            'bg-cyan-500/20 border-l-4 border-l-cyan-400 text-white shadow-lg'
                          } text-gray-300`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDropdownToggle('report');
                          }}
                        >
                          <BarChart3 className="w-5 h-5 transition-transform group-hover:scale-110" />
                          <span className="transition-all duration-300 text-sm lg:text-base">Report</span>
                          <ChevronDown 
                            className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-300 ${
                              openDropdown === 'report' ? 'rotate-180' : ''
                            }`}
                          />
                        </NavLink>
                        {/* <!-- Dropdown Menu Start --> */}
                        <div
                          className={`translate transform overflow-hidden transition-all duration-300 ${
                            openDropdown !== 'report' && 'hidden'
                          }`}
                        >
                          <ul className="mt-2 mb-3 flex flex-col gap-1 pl-8">
                            <li>
                              <NavLink
                                to="/drop-leads"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-red-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-red-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4" />
                                Drop Leads Report
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/closed-leads"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-green-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-green-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Closed Leads Report
                              </NavLink>
                            </li> 

                            <li>
                              <NavLink
                                to="/employee-assigned-count-report"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-blue-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-blue-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <Users className="w-4 h-4" />
                                Emp Assignment Count             
                              </NavLink>
                            </li>
                            
                            <li>
                              <NavLink
                                to="/employee-reports"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-blue-500/10 hover:text-white ${
                                    isActive ? 'text-white bg-blue-500/20' : 'text-gray-400'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                  }
                                }}
                              >
                                <Users className="w-4 h-4" />
                                Employee Reports
                              </NavLink>
                            </li> 

                            <li>
  <NavLink
    to="/report/daily-reports"
    className={({ isActive }) =>
      `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-cyan-500/10 hover:text-white ${
        isActive ? 'text-white bg-cyan-500/20' : 'text-gray-400'
      }`
    }
  >
    <TrendingUp className="w-4 h-4" />
    Daily Reports & Tasks
  </NavLink>
</li>


                          </ul>
                        </div>
                        {/* <!-- Dropdown Menu End --> */}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                {/* <!-- Menu Item Report --> */}
              </ul>
            </div>
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>

     
     <div className="mt-auto border-t border-gray-700 py-4 px-4 lg:px-6 flex-shrink-0">
  <button
    onClick={() => setShowLogoutModal(true)}
    className="group relative flex w-full items-center gap-3 rounded-lg py-3 px-4 font-medium text-sm lg:text-base duration-300 ease-in-out transition-all
               hover:bg-red-500/20 hover:border-l-4 hover:border-l-red-400 hover:pl-3
               text-red-500 hover:text-red-600"
  >
    <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
    <span className="transition-all duration-300">Logout</span>
  </button>
</div>


        {/* <!-- Logout Button Section --> */}
      </aside>

      {/* <!-- Logout Confirmation Modal --> */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
            {/* <!-- Modal header --> */}
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

            {/* <!-- Modal content --> */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to logout from your account?
              </p>
            </div>

            {/* <!-- Modal footer --> */}
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
      {/* <!-- Logout Confirmation Modal --> */}
    </>
  );
};

export default AdminSidebar;