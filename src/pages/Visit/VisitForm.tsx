
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../../public/config.js';

interface visit {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

type visitFormProps = {
  visit: visit | null;
  onClose: (updatedvisit?: visit) => void;
};

const visitForm: React.FC<visitFormProps> = ({ visit, onClose }) => {
  const [formData, setFormData] = useState({
    name: visit?.name || '',
    email: visit?.email || '',
    phone: visit?.phone || '',
    address: visit?.address || '',
  });

  useEffect(() => {
    if (visit) {
      setFormData({
        name: visit.name,
        email: visit.email,
        phone: visit.phone,
        address: visit.address,
      });
    }
  }, [visit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visit) return;
    const updatedvisit = { ...visit, ...formData };

    try {
      const response = await fetch(BASE_URL + `api/visits/${visit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedvisit),
      });

      if (!response.ok) {
        throw new Error('Failed to update visit');
      }

      const data = await response.json();
      console.log('visit updated successfully:', data);
      onClose(updatedvisit);
    } catch (error) {
      console.error('Error updating visit:', error);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content rounded border bg-white shadow p-6">
        <h3 className="font-semibold mb-4">Edit visit</h3>
        <form onSubmit={handleSubmit}>
          {/* visit ID (disabled) */}
          <div className="mb-4">
            <label className="block mb-2">visit ID</label>
            <input
              type="text"
              value={visit?.id || ''}
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

export default visitForm;
