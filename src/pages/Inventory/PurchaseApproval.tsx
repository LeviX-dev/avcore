import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileInvoice,
  faBuilding,
  faMapMarkerAlt,
  faBox,
  faEye,
  faFilter,
  faCheckCircle,
  faSpinner,
  faCalendarAlt,
  faRupeeSign,
  faTruck,
  faUser,
  faBarcode,
  faStore,
  faTag,
  faSearch,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faShoppingCart,
} from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';
import ReceivePOPopup from './ReceivePOPopup.js';

interface PurchaseOrder {
  po_id: number;
  po_number: string;
  qty: number;
  unit_price: string;
  total_price: string;
  po_status: string;
  created_at: string;
  vendor_id: number;
  vendor_name: string;
  pr_id: number;
  mrn_id: number;
  mpm_id: number;
  mrn_number: string;
  client_name: string;
  city: string;
  model_id: number;
  brand_id: number;
  brand_name: string;
  model_no: string;
}

const PurchaseApproval: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Dropdown states
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [showVendorFilter, setShowVendorFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Refs for dropdowns
  const cityFilterRef = useRef<HTMLTableHeaderCellElement>(null);
  const vendorFilterRef = useRef<HTMLTableHeaderCellElement>(null);
  const statusFilterRef = useRef<HTMLTableHeaderCellElement>(null);
  const [showReceivePopup, setShowReceivePopup] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const availableCities = Array.from(
    new Set(purchaseOrders.map((po) => po.city)),
  );

  const availableVendors = Array.from(
    new Set(purchaseOrders.map((po) => po.vendor_name)),
  );

  const availableStatuses = Array.from(
    new Set(purchaseOrders.map((po) => po.po_status)),
  );
  // Available filter options

  const navigate = useNavigate();
  // Fetch purchase orders
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityFilterRef.current &&
        !cityFilterRef.current.contains(event.target as Node)
      ) {
        setShowCityFilter(false);
      }
      if (
        vendorFilterRef.current &&
        !vendorFilterRef.current.contains(event.target as Node)
      ) {
        setShowVendorFilter(false);
      }
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setShowStatusFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}api/purchase/orders`, {
        withCredentials: true,
      });

      if (response.data?.success) {
        setPurchaseOrders(response.data.data || []);
      } else {
        setError(response.data?.message || 'Failed to fetch purchase orders');
      }
    } catch (err: any) {
      console.error('Error fetching purchase orders:', err);
      setError(
        err.response?.data?.message || 'Failed to fetch purchase orders',
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (order) => {
    setSelectedPO(order);
    setShowPopup(true);
  };

  const closeAllDropdowns = () => {
    setShowCityFilter(false);
    setShowVendorFilter(false);
    setShowStatusFilter(false);
  };

  // Filter logic
  const filteredOrders = purchaseOrders.filter((order) => {
    // Search filter
    const matchesSearch =
      searchTerm === '' ||
      order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mrn_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.model_no.toLowerCase().includes(searchTerm.toLowerCase());

    // City filter
    const matchesCity =
      selectedCities.length === 0 || selectedCities.includes(order.city);

    // Vendor filter
    const matchesVendor =
      selectedVendors.length === 0 ||
      selectedVendors.includes(order.vendor_name);

    // Status filter
    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(order.po_status);

    return matchesSearch && matchesCity && matchesVendor && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; icon: any }
    > = {
      Ordered: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        icon: faTruck,
      },
      Delivered: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        icon: faCheckCircle,
      },
      Cancelled: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        icon: faTimes,
      },
    };

    const config = statusConfig[status] || {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-300',
      icon: faFileInvoice,
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${config.bg} ${config.text}`}
      >
        <FontAwesomeIcon icon={config.icon} className="h-3 w-3 mr-1.5" />
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleViewMRN = (mrnNumber: string) => {
    navigate(`/mrn/view/${mrnNumber}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">
            Loading purchase orders...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-6">
            <FontAwesomeIcon
              icon={faTimes}
              className="h-12 w-12 text-red-600 mx-auto mb-4"
            />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchPurchaseOrders}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon
                icon={faFileInvoice}
                className="text-purple-600"
              />
              Purchase Orders
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and track all purchase orders
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Orders: {filteredOrders.length}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
          />
          <input
            type="text"
            placeholder="Search by PO number, client name, MRN number, or model..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-boxdark text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <tr>
              <th className="py-3 px-4 text-left">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  PO Details
                </div>
              </th>

              <th className="py-3 px-4 text-left">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Client Details
                </div>
              </th>

              <th className="py-3 px-4 text-left relative" ref={cityFilterRef}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    City
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAllDropdowns();
                      setShowCityFilter(!showCityFilter);
                    }}
                    className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faFilter}
                      className={`h-3 w-3 transition-colors duration-200 ${
                        selectedCities.length > 0 ? 'text-purple-600' : ''
                      } ${showCityFilter ? 'text-purple-600' : ''}`}
                    />
                  </button>
                </div>
                {showCityFilter && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-sm dark:text-white">
                        Filter Cities
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCities([])}
                          className="text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => setShowCityFilter(false)}
                          className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {availableCities.map((city) => (
                      <div key={city} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`city-${city}`}
                          checked={selectedCities.includes(city)}
                          onChange={() => {
                            setSelectedCities((prev) =>
                              prev.includes(city)
                                ? prev.filter((c) => c !== city)
                                : [...prev, city],
                            );
                            setCurrentPage(1);
                          }}
                          className="h-3.5 w-3.5 mr-2.5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500"
                        />
                        <label
                          htmlFor={`city-${city}`}
                          className="text-sm font-medium dark:text-white cursor-pointer"
                        >
                          {city}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </th>

              <th
                className="py-3 px-4 text-left relative"
                ref={vendorFilterRef}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Vendor
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAllDropdowns();
                      setShowVendorFilter(!showVendorFilter);
                    }}
                    className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faFilter}
                      className={`h-3 w-3 transition-colors duration-200 ${
                        selectedVendors.length > 0 ? 'text-purple-600' : ''
                      } ${showVendorFilter ? 'text-purple-600' : ''}`}
                    />
                  </button>
                </div>
                {showVendorFilter && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-sm dark:text-white">
                        Filter Vendors
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedVendors([])}
                          className="text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => setShowVendorFilter(false)}
                          className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {availableVendors.map((vendor) => (
                      <div key={vendor} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`vendor-${vendor}`}
                          checked={selectedVendors.includes(vendor)}
                          onChange={() => {
                            setSelectedVendors((prev) =>
                              prev.includes(vendor)
                                ? prev.filter((v) => v !== vendor)
                                : [...prev, vendor],
                            );
                            setCurrentPage(1);
                          }}
                          className="h-3.5 w-3.5 mr-2.5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500"
                        />
                        <label
                          htmlFor={`vendor-${vendor}`}
                          className="text-sm font-medium dark:text-white cursor-pointer"
                        >
                          {vendor}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </th>

              <th className="py-3 px-4 text-left">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Product
                </div>
              </th>

              <th className="py-3 px-4 text-left">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Quantity
                </div>
              </th>

              <th className="py-3 px-4 text-left">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Amount
                </div>
              </th>

              <th
                className="py-3 px-4 text-left relative"
                ref={statusFilterRef}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Status
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAllDropdowns();
                      setShowStatusFilter(!showStatusFilter);
                    }}
                    className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faFilter}
                      className={`h-3 w-3 transition-colors duration-200 ${
                        selectedStatuses.length > 0 ? 'text-purple-600' : ''
                      } ${showStatusFilter ? 'text-purple-600' : ''}`}
                    />
                  </button>
                </div>
                {showStatusFilter && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-boxdark border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-sm dark:text-white">
                        Filter Status
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedStatuses([])}
                          className="text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => setShowStatusFilter(false)}
                          className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {availableStatuses.map((status) => (
                      <div key={status} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`status-${status}`}
                          checked={selectedStatuses.includes(status)}
                          onChange={() => {
                            setSelectedStatuses((prev) =>
                              prev.includes(status)
                                ? prev.filter((s) => s !== status)
                                : [...prev, status],
                            );
                            setCurrentPage(1);
                          }}
                          className="h-3.5 w-3.5 mr-2.5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500"
                        />
                        <label
                          htmlFor={`status-${status}`}
                          className="text-sm font-medium dark:text-white cursor-pointer"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </th>

              <th className="py-3 px-4 text-left">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <FontAwesomeIcon
                      icon={faFileInvoice}
                      className="h-12 w-12 mx-auto mb-4 opacity-50"
                    />
                    <p className="text-lg font-medium">
                      No purchase orders found
                    </p>
                    <p className="text-sm mt-2">
                      {searchTerm ||
                      selectedCities.length > 0 ||
                      selectedVendors.length > 0 ||
                      selectedStatuses.length > 0
                        ? 'Try adjusting your filters'
                        : 'All purchase orders will appear here'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((order) => (
                <tr
                  key={order.po_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {/* PO Details */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                        {order.po_number}
                      </div>
                    </div>
                  </td>

                  {/* Client Details */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-gray-400 text-xs"
                        />
                        {order.client_name}
                      </div>
                    </div>
                  </td>

                  {/* City */}
                  <td className="py-4 px-4">
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-gray-400 text-xs"
                      />
                      {order.city}
                    </div>
                  </td>

                  {/* Vendor */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faStore}
                        className="text-gray-400 text-xs"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.vendor_name}
                      </span>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {order.model_no}
                      </div>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="py-4 px-4">
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <FontAwesomeIcon
                          icon={faBox}
                          className="h-3 w-3 mr-1"
                        />
                        {order.qty}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                        <FontAwesomeIcon
                          icon={faRupeeSign}
                          className="h-3 w-3"
                        />
                        {parseFloat(order.total_price).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Unit: ₹
                        {parseFloat(order.unit_price).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    {getStatusBadge(order.po_status)}
                  </td>

                  {/* Actions */}

                  <td className="py-4 flex gap-2 px-4">
                    <button
                      onClick={() => handlePurchase(order)}
                      disabled={order.po_status === 'Received'}
                      className={`px-2 py-1 rounded text-white transition-all
    ${
      order.po_status === 'Received'
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-purple-600 hover:bg-purple-700'
    }
  `}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                    </button>

                    <button
                      onClick={() => handleViewMRN(order.mrn_number)}
                      className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center justify-center"
                      title="View MRN Details"
                    >
                      <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showPopup && selectedPO && (
        <ReceivePOPopup
          po={selectedPO}
          onClose={() => setShowPopup(false)}
          onSuccess={fetchPurchaseOrders}
        />
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to{' '}
            {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of{' '}
            {filteredOrders.length} orders
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseApproval;

// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faEye,
//   faSpinner,
//   faRupeeSign,
//   faBox,
//   faTruck,
//   faCheckCircle,
//   faTimes,
//   faShoppingCart,
// } from "@fortawesome/free-solid-svg-icons";
// import { BASE_URL } from "../../../public/config.js";

// interface PurchaseOrder {
//   po_id: number;
//   po_number: string;
//   qty: number;
//   unit_price: string;
//   total_price: string;
//   po_status: string;
//   vendor_name: string;
//   mrn_number: string;
//   client_name: string;
//   city: string;
//   model_no: string;
// }

// const PurchaseApproval: React.FC = () => {
//   const [orders, setOrders] = useState<PurchaseOrder[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const navigate = useNavigate();

//   // Fetch Data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}api/purchase/orders`, {
//           withCredentials: true,
//         });
//         setOrders(res.data?.data || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Search Filter
//   const filteredOrders = useMemo(() => {
//     return orders.filter((o) =>
//       [o.po_number, o.client_name, o.model_no, o.mrn_number]
//         .join(" ")
//         .toLowerCase()
//         .includes(search.toLowerCase())
//     );
//   }, [orders, search]);

//   const getStatusBadge = (status: string) => {
//     const styles: any = {
//       Ordered: "bg-blue-100 text-blue-700",
//       Delivered: "bg-green-100 text-green-700",
//       Cancelled: "bg-red-100 text-red-700",
//     };

//     const icons: any = {
//       Ordered: faTruck,
//       Delivered: faCheckCircle,
//       Cancelled: faTimes,
//     };

//     return (
//       <span className={`px-2 py-1 rounded text-xs ${styles[status]}`}>
//         <FontAwesomeIcon icon={icons[status]} className="mr-1" />
//         {status}
//       </span>
//     );
//   };

//   const handlePurchase = (order: PurchaseOrder) => {
//     // 👉 Navigate to purchase page (change route as needed)
//     navigate(`/purchase/create/${order.po_id}`);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <h2 className="text-xl font-bold mb-4">Purchase Orders</h2>

//       {/* Search */}
//       <input
//         type="text"
//         placeholder="Search..."
//         className="border p-2 mb-4 w-full rounded"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {/* Table */}
//       <div className="overflow-auto border rounded">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 text-left">PO</th>
//               <th className="p-2 text-left">Client</th>
//               <th className="p-2 text-left">City</th>
//               <th className="p-2 text-left">Vendor</th>
//               <th className="p-2 text-left">Product</th>
//               <th className="p-2 text-center">Qty</th>
//               <th className="p-2 text-left">Amount</th>
//               <th className="p-2 text-left">Status</th>
//               <th className="p-2 text-center">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredOrders.length === 0 ? (
//               <tr>
//                 <td colSpan={9} className="text-center p-4">
//                   No Data Found
//                 </td>
//               </tr>
//             ) : (
//               filteredOrders.map((o) => (
//                 <tr key={o.po_id} className="border-t">
//                   <td className="p-2 font-semibold">{o.po_number}</td>
//                   <td className="p-2">{o.client_name}</td>
//                   <td className="p-2">{o.city}</td>
//                   <td className="p-2">{o.vendor_name}</td>
//                   <td className="p-2">{o.model_no}</td>

//                   <td className="p-2 text-center">
//                     <FontAwesomeIcon icon={faBox} className="mr-1" />
//                     {o.qty}
//                   </td>

//                   <td className="p-2 text-green-600 font-semibold">
//                     <FontAwesomeIcon icon={faRupeeSign} />
//                     {Number(o.total_price).toLocaleString()}
//                   </td>

//                   <td className="p-2">{getStatusBadge(o.po_status)}</td>

//                   {/* ACTIONS */}
//                   <td className="p-2 flex gap-2 justify-center">
//                     {/* View */}
//                     <button
//                       onClick={() => navigate(`/mrn/view/${o.mrn_number}`)}
//                       className="bg-blue-500 text-white px-2 py-1 rounded"
//                     >
//                       <FontAwesomeIcon icon={faEye} />
//                     </button>

//                     {/* Purchase Button */}
//                     <button
//                       onClick={() => handlePurchase(o)}
//                       className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
//                     >
//                       <FontAwesomeIcon icon={faShoppingCart} />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default PurchaseApproval;
