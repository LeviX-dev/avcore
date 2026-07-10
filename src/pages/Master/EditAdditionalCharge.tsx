import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';

// Type definition for the charge object
interface AdditionalCharge {
  charge_id: number;
  charge_name: string;
  price: number;
  status: 'active' | 'inactive';
}

// Props type definition
interface EditAdditionalChargeProps {
  chargeToEdit: AdditionalCharge;
  onClose: () => void;
  onChargeUpdated: () => void;
}

const EditAdditionalCharge: React.FC<EditAdditionalChargeProps> = ({ chargeToEdit, onClose, onChargeUpdated }) => {
  const [chargeName, setChargeName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    if (chargeToEdit) {
      setChargeName(chargeToEdit.charge_name);
      setPrice(chargeToEdit.price.toString());
      setStatus(chargeToEdit.status);
    }
  }, [chargeToEdit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const data = {
      charge_name: chargeName,
      price: parseFloat(price) || 0,
      status: status,
    };

    try {
      await axios.put(
        `${BASE_URL}api/additional-charges/${chargeToEdit.charge_id}`,
        data,
        { withCredentials: true }
      );

      setFeedback("Additional charge updated successfully!");
      
      setTimeout(() => {
        onChargeUpdated(); // refresh list in parent
        onClose(); // close modal
      }, 2000);
    } catch (error) {
      console.error('Error updating additional charge:', error);
      setFeedback("Failed to update additional charge");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-boxdark p-5 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
          Edit Additional Charge
        </h2>
        
        {feedback && (
          <div className={`mb-3 text-sm text-center ${
            feedback.includes("successfully") 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          }`}>
            {feedback}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={chargeName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChargeName(e.target.value)}
            placeholder="Charge Name"
            className="w-full p-3 mb-4 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg"
            required
          />
          
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
            placeholder="Price (₹)"
            className="w-full p-3 mb-4 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg"
            required
          />
          
          <select
            value={status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as 'active' | 'inactive')}
            className="w-full p-3 mb-6 border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white rounded-lg"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdditionalCharge;