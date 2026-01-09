
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import Logo from '../../images/logo/MMS_logo.png';
import { buildTree } from '../../utils/buildTree';
import { menuIcons } from './menuIcons';

interface MenuItem {
  menu_key: string;
  label: string;
  path: string | null;
  parent_key: string | null;
  children?: MenuItem[];
}

const DynamicSidebar = ({ sidebarOpen, setSidebarOpen }: any) => {
  const { pathname } = useLocation();

  const sidebar = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}api/dynamic/sidebar`, { withCredentials: true })
      .then(res => {
        const tree = buildTree(res.data || []);
        setMenus(tree);
      })
      .catch(err => {
        console.error('❌ Sidebar load failed', err);
        setMenus([]);
      });
  }, []);

  /** ✅ Check active path (supports params) */
  const isPathActive = (path?: string | null) =>
    path &&
    (pathname === path || pathname.startsWith(path + '/'));

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/dashboard">
          <img className="min-w-xs h-25 w-60" src={Logo} alt="Logo" />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="block lg:hidden"
        >
          ☰
        </button>
      </div>

      {/* MENU */}
      <div className="no-scrollbar flex flex-col overflow-y-auto">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
            MENU
          </h3>

          <ul className="mb-6 flex flex-col gap-1.5">
            {menus.map(menu => {
              /** ✅ CASE 1: Parent menu with children */
              if (menu.children && menu.children.length > 0) {
                const parentActive = menu.children.some(child =>
                  isPathActive(child.path)
                );

                return (
                  <SidebarLinkGroup
                    key={menu.menu_key}
                    activeCondition={parentActive}
                  >
                    {(handleClick, open) => (
                      <>
                        <button
                          onClick={handleClick}
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 hover:bg-graydark dark:hover:bg-meta-4 ${
                            parentActive
                              ? 'bg-graydark dark:bg-meta-4'
                              : ''
                          }`}
                        >
                          {menu.label}
                        </button>

                        <div className={`${!open && 'hidden'}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            {menu.children.map(child => (
                              <li key={child.menu_key}>
                                <NavLink
                                  to={child.path!}
                                  className={({ isActive }) =>
                                    'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 hover:text-white ' +
                                    (isActive && '!text-white')
                                  }
                                >
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

              /** ✅ CASE 2: Standalone menu */
              if (menu.path) {
                return (
                  <li key={menu.menu_key}>
                    <NavLink
                      to={menu.path}
                      className={({ isActive }) =>
                        'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 hover:bg-graydark dark:hover:bg-meta-4 ' +
                        (isActive ? 'bg-graydark dark:bg-meta-4' : '')
                      }
                    >
                      {menu.label}
                    </NavLink>
                  </li>
                );
              }

              /** ❌ Group-only menu without children (should not render) */
              return null;
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default DynamicSidebar;