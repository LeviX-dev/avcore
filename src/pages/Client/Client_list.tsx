import React, { useState, useEffect } from 'react';
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb.js";
import ClientForm from './EditClient.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../../public/config.js';

interface client {
  id: number;
  name: string;
  person_name:string;
  email: string;
  phone: string;
}

const Client_list: React.FC = () => {
  const [clients, setclients] = useState<client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredclients, setFilteredclients] = useState<client[]>([]);
  const [selectedclient, setSelectedclient] = useState<client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // useEffect(() => {
  //   async function fetchclients() {
  //     try {
  //       const response = await fetch(BASE_URL + 'api/clients'); 
  //       const data = await response.json();
  //       const clients = Array.isArray(data) ? data : [data];
  //       setclients(clients);
  //       setFilteredclients(clients); 
  //     } catch (error) {
  //       console.error('Error fetching Clients:', error);
  //     }
  //   }
  //   fetchclients();
  // }, []);

  useEffect(() => {
    setFilteredclients(
      clients.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, clients]);

  const handleEdit = (client: client) => {
    setSelectedclient(client);
    setIsModalOpen(true);
  };

  const handleModalClose = (updatedclient?: client) => {
    setIsModalOpen(false);
    setSelectedclient(null);

    if (updatedclient) {
      // Update the clients list with the updated client
      setclients((prevclients) =>
        prevclients.map((v) => (v.id === updatedclient.id ? updatedclient : v))
      );
      setSuccessMessage('client details updated successfully.');
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
        {/* client Table */}
        <div className="max-w-full overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark px-0">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              {/* <th className="py-2 px-4 border">Client ID</th> */}
              <th className="py-4 px-4 font-medium text-black dark:text-white">Client Name</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Contact Person</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Client Email</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Client Phone</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredclients.map((client) => (
              <tr key={client.id}>
                {/* <td className="py-2 px-4 border text-center">{client.id}</td> */}
                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                  <p className="text-black dark:text-white ml-4">{client.name}</p>
                </td>
                
                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                  <p className="text-black dark:text-white ml-4">{client.person_name}</p>
                </td>

                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                 <p className="text-black dark:text-white ml-4"> {client.email}</p>
                </td>

                <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                 <p className="text-black dark:text-white ml-4"> {client.phone}</p>
                </td>

                {/* <td className="border-b border-[#eee] py-3 px-0  dark:border-strokedark">
                  <p className="text-black dark:text-white ml-4">{client.address}</p>
                </td> */}

                <td className="border-b border-[#eee] py-3 px-0 dark:border-strokedark">
                <div className="flex items-center gap-2">
                <button className="bg-meta-3 inline-flex items-center justify-center rounded-md py-1 px-3 text-center text-white hover:bg-opacity-75" onClick={() => handleEdit(client)}>
                <FontAwesomeIcon icon={faEdit} className="text-white" />
                </button>
                </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* client Form Modal */}
        {isModalOpen && selectedclient && (
          <ClientForm client={selectedclient} onClose={handleModalClose} />
        )}
      </div>
    </div>
  );
};

export default Client_list;
