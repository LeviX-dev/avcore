import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '/public/config';   
import ClickOutside from '../ClickOutside';

interface Notification {
  id: number;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;        // ✅ matches DB field
  created_at: string;
}

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/notifications`, {
        withCredentials: true,
      });
      // ✅ API returns { success: true, data: { notifications, unreadCount } }
      setNotifications(res.data.data?.notifications || []);
      setUnreadCount(res.data.data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  // Mark all as read when dropdown opens
  const handleDropdownOpen = async () => {
    setDropdownOpen(true);
    if (unreadCount > 0) {
      try {
        // ✅ Use PUT /api/notifications/mark-all-read
        await axios.put(
          `${BASE_URL}api/notifications/mark-all-read`,
          {},
          { withCredentials: true }
        );
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      } catch (error) {
        console.error('Failed to mark all as read', error);
      }
    }
  };

  // Mark individual notification as read
  const markAsRead = async (id: number) => {
    try {
      // ✅ Use PUT /api/notifications/mark-read/:id
      await axios.put(
        `${BASE_URL}api/notifications/mark-read/${id}`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li>
        <Link
          onClick={handleDropdownOpen}
          to="#"
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        >
          {/* Badge with unread count */}
          <span
            className={`absolute -top-0.5 -right-0.5 z-1 flex h-5 w-5 items-center justify-center rounded-full bg-meta-1 text-xs text-white ${
              unreadCount === 0 ? 'hidden' : 'inline'
            }`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>

          {/* Bell icon (unchanged) */}
          <svg
            className="fill-current duration-300 ease-in-out"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343Z"
              fill=""
            />
          </svg>
        </Link>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className={`absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80`}
          >
            <div className="px-4.5 py-3">
              <h5 className="text-sm font-medium text-bodydark2">
                Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
              </h5>
            </div>

            <ul className="flex h-auto flex-col overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4.5 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No notifications
                </li>
              ) : (
                notifications.map((notif) => (
                  <li key={notif.id}>
                    <Link
                      to={notif.link || '#'}
                      className={`flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4 ${
                        !notif.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <p className="text-sm">
                        <span
                          className={`${
                            !notif.is_read
                              ? 'font-semibold text-black dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {notif.title}
                        </span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">
                          {notif.message}
                        </span>
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                        {!notif.is_read && (
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;