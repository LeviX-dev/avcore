import React, { useState, useEffect } from 'react';
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb.js";
import visitForm from "./VisitForm.js"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';

interface visit {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const visit: React.FC = () => {
  const [visits, setvisits] = useState<visit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredvisits, setFilteredvisits] = useState<visit[]>([]);
  const [selectedvisit, setSelectedvisit] = useState<visit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function fetchvisits() {
      try {
        const response = await fetch(BASE_URL + 'api/visit-list'); 
        const data = await response.json();
        const visits = Array.isArray(data) ? data : [data];
        setvisits(visits);
        setFilteredvisits(visits); 
      } catch (error) {
        console.error('Error fetching visits:', error);
      }
    }
    fetchvisits();
  }, []);

  useEffect(() => {
    setFilteredvisits(
      visits.filter((visit) =>
        visit.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, visits]);

  const handleEdit = (visit: visit) => {
    setSelectedvisit(visit);
    setIsModalOpen(true);
  };

  const handleModalClose = (updatedvisit?: visit) => {
    setIsModalOpen(false);
    setSelectedvisit(null);

    if (updatedvisit) {
      // Update the visits list with the updated visit
      setvisits((prevvisits) =>
        prevvisits.map((v) => (v.id === updatedvisit.id ? updatedvisit : v))
      );
      setSuccessMessage('visit details updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="p-4">
      <Breadcrumb pageName="visit List" />
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
            placeholder="Search visits by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* visit Table */}
        <div className="max-w-full overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark px-0">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              {/* <th className="py-2 px-4 border">visit ID</th> */}
              <th className="py-4 px-4 font-medium text-black dark:text-white">visit Name</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">visit Email</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">visit Phone</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">visit Address</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredvisits.map((visit) => (
              <tr key={visit.id}>
                {/* <td className="py-2 px-4 border text-center">{visit.id}</td> */}
                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                  <p className="text-black dark:text-white ml-4">{visit.name}</p>
                </td>

                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                 <p className="text-black dark:text-white ml-4"> {visit.email}</p>
                </td>

                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                 <p className="text-black dark:text-white ml-4"> {visit.phone}</p>
                </td>

                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                  <p className="text-black dark:text-white ml-4">{visit.address}</p>
                </td>

                <td className="border-b border-[#eee] py-3 px-0 dark:border-strokedark">
                <div className="flex items-center gap-2">
                <button className="bg-meta-3 inline-flex items-center justify-center rounded-md py-1 px-3 text-center text-white hover:bg-opacity-75" onClick={() => handleEdit(visit)}>
                <FontAwesomeIcon icon={faEdit} className="text-white" />
                </button>
                </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* visit Form Modal */}
        {isModalOpen && selectedvisit && (
          <visitForm visit={selectedvisit} onClose={handleModalClose} />

        
        )}
      </div>
    </div>
  );
};

export default visit;
