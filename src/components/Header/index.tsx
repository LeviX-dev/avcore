import { Link } from 'react-router-dom';
import DropdownMessage from './DropdownMessage';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import LogoIcon from '../../images/logo/matrix2.png';
import DarkModeSwitcher from './DarkModeSwitcher';
import axios from 'axios';
import { BASE_URL } from '../../../public/config';
import { useState, useEffect, useRef } from 'react';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {

  // ===============================
  // Attendance toggle state
  // ===============================
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());


  // Prevent multiple auto calls
  const autoRunRef = useRef(false);

  // ==================================
  // Load today attendance on mount
  // ==================================
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}api/attendance/status`, {
          withCredentials: true,
        });
        setIsCheckedIn(res.data.checkedIn);
      } catch (err) {
        console.log('Attendance status fetch failed');
      }
    };

    loadStatus();
  }, []);


  // ==================================
// Live Clock
// ==================================
useEffect(() => {
  setCurrentTime(new Date());
}, []);



const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};


  // ==================================
  // FRONTEND AUTO CHECKOUT AT 8PM
  // ==================================
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const hours = now.getHours();

      // After 8PM
      if (hours >= 20 && !autoRunRef.current) {
        try {
          await axios.post(`${BASE_URL}api/attendance/auto-checkout`, {}, {
            withCredentials: true,
          });
          console.log('✅ Frontend auto checkout executed');
          autoRunRef.current = true;
        } catch (err) {
          console.error('❌ Frontend auto checkout failed');
        }
      }
    }, 60000); // every 1 minute

    return () => clearInterval(interval);
  }, []);

  // ==================================
  // Manual Toggle
  // ==================================
const handleAttendanceToggle = async () => {
  try {
    if (!isCheckedIn) {
      await axios.post(`${BASE_URL}api/attendance/check-in`, {}, { withCredentials: true });
      alert('Checked In Successfully');
      setIsCheckedIn(true);
      setCurrentTime(new Date()); // 👈 update once
    } else {
      await axios.post(`${BASE_URL}api/attendance/check-out`, {}, { withCredentials: true });
      alert('Checked Out Successfully');
      setIsCheckedIn(false);
      setCurrentTime(new Date()); // 👈 update once
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Attendance action failed');
  }
};

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!w-full delay-300'
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && 'delay-400 !w-full'
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!w-full delay-500'
                  }`}
                ></span>
              </span>
            </span>
          </button>
        </div>

        <div className="hidden sm:block">
          <form>
            <div className="relative">
              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">

            {/* Attendance Toggle Button */}
<div className="flex items-center gap-2">
  {/* Live Time */}
  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
    {formatTime(currentTime)}
  </span>


  <button
    onClick={handleAttendanceToggle}
    className={`rounded px-3 py-1 text-xs text-white sm:text-sm ${
      isCheckedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
    }`}
  >
    {isCheckedIn ? 'Check Out' : 'Check In'}
  </button>


</div>


            <DarkModeSwitcher />
          </ul>

          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

export default Header;
