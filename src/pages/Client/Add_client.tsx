import { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb.js';
import { BASE_URL } from '../../../public/config.js';
import axios from 'axios';
// import Category from '../Master/Category.js';

const AddClient = () => {

  interface Category {
    cat_id: number;
    cat_name: string;
  }
  interface Product {
    product_id : number;
    product_name: string
  }

  const [formData, setFormData] = useState({
    clientName: "",
    clientContact: "",
    contactPersonName: "",
    contactPersonContact: "",
    contactPersonEmail: "",
    address: "",
    status: "",
    cat_id: "", // Track the selected category
    product_id: "", // Track the selected product
    followupDate: "",
    remark: "",
    mode: "",
    reference: "",
  });

  const [references, setReferences] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  // Fetch references from the backend
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/reference`);
        setReferences(response.data);
      } catch (err) {
        setError('Failed to load references. Please try again.');
      }
    };
    fetchReferences();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/category`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

   // Fetch products by category
   useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (!formData.cat_id) {
        setProducts([]); // Reset products if no category is selected
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL}api/products-by-cat-id/${formData.cat_id}`
        );
        setProducts(response.data); // Update products based on category
      } catch (error) {
        console.error("Error fetching products by category:", error);
        setProducts([]);
      }
    };

    fetchProductsByCategory();
  }, [formData.cat_id]); // Trigger whenever the category changes

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  // Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const payload = {
      clientName: formData.clientName,
      clientContact: formData.clientContact,
      contactPersonName: formData.contactPersonName,
      contactPersonContact: formData.contactPersonContact,
      contactPersonEmail: formData.contactPersonEmail,
      status: formData.status,
      category: formData.cat_id, // Map correctly
      product: formData.product_id, // Map correctly
      followupDate: formData.followupDate,
      remark: formData.remark,
      mode: formData.mode,
      reference: formData.reference,
    };
    console.log("payload",payload);
    const response = await axios.post('http://localhost:3000/api/clients',payload, {
  withCredentials: true
})
.then(response => console.log(response.data))
.catch(error => console.error('Error adding client:', error));


    setFeedback('Client added successfully!');
    
    setFormData({
      clientName: "",
      clientContact: "",
      contactPersonName: "",
      contactPersonContact: "",
      contactPersonEmail: "",
      address: "",
      status: "",
      cat_id: "",
      product_id: "",
      followupDate: "",
      remark: "",
      mode: "",
      reference: "",
    });

  } catch (err) {
    console.error("Error adding client:", err);
    setFeedback('Error adding client. Please try again.');
  } finally {
    setTimeout(() => setFeedback(''), 3000);
  }
};


  return (
    <div>
      <Breadcrumb pageName="Add Client" />

      <h2 className="bg-warning grid-cols-1 sm:grid-cols-1 m-5 gap-9 font-bold">
        {feedback && (
          <p className="p-5 shadow-default rounded dark:border-strokedark font-bold text-black rounded-sm">
            {feedback}
          </p>
        )}
        {error && (
          <p className="p-5 shadow-default rounded dark:border-strokedark text-red-600">
            {error}
          </p>
        )}
      </h2>
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-1 m-5">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Add Client Form
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              {/* Form Fields */}
              <div className="flex flex-wrap -mx-2">
                {/* Client Name */}
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <label
                    htmlFor="clientName"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Client Name <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Enter Client Name"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>

              {/* Client Contact */}
              <div className="w-full md:w-1/2 px-2 mb-4">
                <label className="mb-2.5 block text-black dark:text-white" >
                  Client Contact <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  name="clientContact"
                  value={formData.clientContact}
                  onChange={handleChange}
                  placeholder="Enter Client Contact"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap -mx-2">
              {/* Contact Person Name */}
              <div className="w-full md:w-1/2 px-2 mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Contact Person Name <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  placeholder="Enter Contact Person Name"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              {/* Contact Person Contact */}
              <div className="w-full md:w-1/2 px-2 mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Contact Person Contact <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  name="contactPersonContact"
                  value={formData.contactPersonContact}
                  onChange={handleChange}
                  placeholder="Enter Contact Person Contact"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap -mx-2">      
              {/* Contact Person Email */}
              <div className="w-full md:w-1/2 px-2 mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Contact Person Email <span className="text-meta-1">*</span>
                </label>
                <input
                  type="email"
                  name="contactPersonEmail"
                  value={formData.contactPersonEmail}
                  onChange={handleChange}
                  placeholder="Enter Contact Person Email"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>



              {/* Status */}
              <div className="w-full md:w-1/2 px-2 mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Status <span className="text-meta-1">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="meeting schedule">Meeting Schedule</option>
                  <option value="follow up">Follow Up</option>
                  <option value="not interested">Not Interested</option>
                  <option value="win">Win</option>
                  <option value="lose">Lose</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap -mx-2">      
              {/* Category Dropdown */}
              <div className="w-full md:w-1/2 px-2 mb-4">
                <label className="mb-2.5 block text-black dark:text-white">Category</label>
                <select
                  name="cat_id"
                  value={formData.cat_id}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.cat_id} value={category.cat_id}>
                      {category.cat_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Dropdown */}
              <div className="w-full md:w-1/2 px-2 mb-4">
                <label className="mb-2.5 block text-black dark:text-white">Product</label>
                <select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.product_id} value={product.product_id}>
                      {product.product_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap -mx-2">
              {/* Follow-up Date */}
              <div className="w-full md:w-1/2 px-2 mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Follow-Up Date <span className="text-meta-1">*</span>
                </label>
                <input
                  type="date"
                  name="followupDate"
                  value={formData.followupDate}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              {/* Remark */}
              <div className="w-full md:w-1/2 px-2 mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Remark
                </label>
                <input
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Enter Remark"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-2">
              {/* Mode */}
              <div className="w-full md:w-1/2 px-2 mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Mode <span className="text-meta-1">*</span>
                </label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="">Select Mode</option>
                  <option value="call">Call</option>
                  <option value="visit">Visit</option>
                </select>
              </div>

              {/* Reference */}
              <div className="w-full md:w-1/2 px-2 mb-4">
              <label className="mb-2.5 block text-black dark:text-white">
                Reference <span className="text-meta-1">*</span>
              </label>
              <select
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              >
                <option value="">Select Reference</option>
                {references.map((reference) => (
                  <option key={reference.reference_id} value={reference.reference_id}>
                    {reference.reference_name}
                  </option>
                ))}
              </select>
              </div>
            </div>

              <button
                type="submit"
                className=" px-2 mb-4 rounded bg-primary py-2 px-4 text-white transition hover:bg-primary/80"
              >
                Add Client
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClient;




