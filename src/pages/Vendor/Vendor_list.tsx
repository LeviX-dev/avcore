import React, { useState, useEffect } from 'react';
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import VendorForm from './VendorForm'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Vendor_list: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function fetchVendors() {
      try {
        const response = await fetch(BASE_URL + 'api/vendor-list'); 
        const data = await response.json();
        const vendors = Array.isArray(data) ? data : [data];
        setVendors(vendors);
        setFilteredVendors(vendors); 
      } catch (error) {
        console.error('Error fetching Clients:', error);
      }
    }
    fetchVendors();
  }, []);

  useEffect(() => {
    setFilteredVendors(
      vendors.filter((vendor) =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, vendors]);

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleModalClose = (updatedVendor?: Vendor) => {
    setIsModalOpen(false);
    setSelectedVendor(null);

    if (updatedVendor) {
      // Update the vendors list with the updated vendor
      setVendors((prevVendors) =>
        prevVendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
      );
      setSuccessMessage('Vendor details updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="p-4">
      <Breadcrumb pageName="Client List" />
      <div className="p-4">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">
            {successMessage}
          </div>
        )}
        {/* Search Box */}
        <div className="mb-4">
          <input
            type="text"
            className="w-100 p-2 border border-gray-300 rounded"
            placeholder="Search Clients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Vendor Table */}
        <div className="max-w-full overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark px-0">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              {/* <th className="py-2 px-4 border">Client ID</th> */}
              <th className="py-4 px-4 font-medium text-black dark:text-white">Client Name</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Client Email</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Client Phone</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Client Address</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id}>
                {/* <td className="py-2 px-4 border text-center">{vendor.id}</td> */}
                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                  <p className="text-black dark:text-white ml-4">{vendor.name}</p>
                </td>

                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                 <p className="text-black dark:text-white ml-4"> {vendor.email}</p>
                </td>

                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                 <p className="text-black dark:text-white ml-4"> {vendor.phone}</p>
                </td>

                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                  <p className="text-black dark:text-white ml-4">{vendor.address}</p>
                </td>

                <td className="border-b border-[#eee] py-3 px-0 dark:border-strokedark">
                <div className="flex items-center gap-2">
                <button className="bg-meta-3 inline-flex items-center justify-center rounded-md py-1 px-3 text-center text-white hover:bg-opacity-75" onClick={() => handleEdit(vendor)}>
                <FontAwesomeIcon icon={faEdit} className="text-white" />
                </button>
                </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Vendor Form Modal */}
        {isModalOpen && selectedVendor && (
          <VendorForm vendor={selectedVendor} onClose={handleModalClose} />
        )}
      </div>
    </div>
  );
};

export default Vendor_list;
