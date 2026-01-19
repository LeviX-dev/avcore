import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import UserOne from '../../images/user/user-01.png';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState<string>('U');

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(BASE_URL + 'auth/get-role', { withCredentials: true });
        const userRole = response.data.role;
        setUserRole(userRole);
      } catch (error) {
        console.error('Error fetching role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get(BASE_URL + 'auth/get-name', { withCredentials: true });
        const userName = response.data.username;
        console.log('User Name:', userName);
        setUserName(userName);
        // Set initial from username
        if (userName && userName.length > 0) {
          setUserInitial(userName.charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error('Error fetching name:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userDetails');
    window.location.href = '/signin';
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      {/* Mobile Toggle Button - Enhanced Design */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative lg:hidden"
        aria-label="User menu"
      >
        {/* Animated Background Circle */}
        <div className="relative w-12 h-12">
          {/* Outer Ring Animation */}
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
            dropdownOpen 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse-ring' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'
          }`}></div>
          
          {/* Inner Circle with User Initial */}
          <div className={`absolute inset-1 rounded-full flex items-center justify-center transition-all duration-300 ${
            dropdownOpen 
              ? 'bg-white dark:bg-gray-900 shadow-lg scale-110' 
              : 'bg-white dark:bg-gray-800 shadow-md'
          }`}>
            <span className={`text-lg font-bold transition-colors duration-300 ${
              dropdownOpen 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {userInitial}
            </span>
          </div>

          {/* Notification Dot (if needed) */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
        </div>

        {/* Dropdown Arrow - Floating */}
        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
          dropdownOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-1'
        }`}>
          <svg
            className="w-4 h-4 text-blue-500 drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 12 8"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            />
          </svg>
        </div>
      </button>

      {/* Desktop User Info - Hidden on Mobile */}
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="hidden lg:flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            Hii, {userName}
          </span>
          <span className="block text-xs">{userRole}</span>
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </Link>

      {/* Dropdown Menu - Enhanced Design */}
      {dropdownOpen && (
        <div
          className={`
            absolute right-0 mt-6 flex flex-col rounded-xl 
            bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800
            shadow-2xl border border-gray-200 dark:border-gray-700
            backdrop-blur-sm backdrop-filter bg-opacity-95
            z-50 overflow-hidden
            animate-slide-down
            lg:w-64
            sm:w-60
            w-56
          `}
        >
      
          {/* Dropdown Items */}
          <div className="py-2">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 text-left group hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <div className="relative">
                <svg
                  className="w-5 h-5 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
                  Log Out
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sign out of your account
                </p>
              </div>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>

         
        
          </div>

      
        </div>
      )}


    </ClickOutside>
  );
};

export default DropdownUser;