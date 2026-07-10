
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../../public/config.js';

interface client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

type clientFormProps = {
  client: client | null;
  onClose: (updatedclient?: client) => void;
};

const ClientForm: React.FC<clientFormProps> = ({ client, onClose }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
      });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client) return;
    const updatedclient = { ...client, ...formData };

    try {
      const response = await fetch(BASE_URL + `api/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedclient),
      });

      if (!response.ok) {
        throw new Error('Failed to update client');
      }

      const data = await response.json();
      console.log('client updated successfully:', data);
      onClose(updatedclient);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content rounded border bg-white shadow p-6">
        <h3 className="font-semibold mb-4">Edit Client</h3>
        <form onSubmit={handleSubmit}>
          {/* client ID (disabled) */}
          <div className="mb-4">
            <label className="block mb-2">Client ID</label>
            <input
              type="text"
              value={client?.id || ''}
              disabled
              className="w-full p-2 border rounded"
            />
          </div>
          {/* Name */}
          <div className="mb-4">
            <label className="block mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {/* Email */}
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {/* Phone */}
          <div className="mb-4">
            <label className="block mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {/* Address */}
          <div className="mb-4">
            <label className="block mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Update
            </button>
            <button type="button" onClick={() => onClose()} className="px-4 py-2 bg-gray-500 text-white rounded">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
