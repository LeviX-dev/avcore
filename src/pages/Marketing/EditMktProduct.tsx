import React, { useState } from 'react';

interface MarketingProduct {
  mkt_id: number;
  client_name: string;
  client_contact: number;
  cat_name: string;
  product_name: string;
  status: string;
}

interface PopupFormProps {
  product: MarketingProduct;
  onClose: () => void;
  onUpdate: (updatedProduct: MarketingProduct) => void;
}

const PopupForm: React.FC<PopupFormProps> = ({ product, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<MarketingProduct>({ ...product });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6.5">
        <h2>Edit Marketing Product</h2>
        <form onSubmit={handleSubmit}>
        <div className="mb-4.5">
          <label className="mb-2.5 block text-black dark:text-white">
            Client Name:
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </label>
          </div>
          <label className="mb-2.5 block text-black dark:text-white">
            Client Contact:
            <input
              type="text"
              name="client_contact"
              value={formData.client_contact}
              onChange={handleChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </label>
          <label className="mb-2.5 block text-black dark:text-white">
            Product Name:
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </label>
          <label className="mb-2.5 block text-black dark:text-white">
            Status:
            <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
              <option value="meeting schedule">Meeting Schedule</option>
              <option value="interested">Interested</option>
              <option value="hold">Hold</option>
              <option value="follow up">Follow Up</option>
              <option value="win">Win</option>
              <option value="lost">Lost</option>
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Update</button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>

  );
};

export default PopupForm;
