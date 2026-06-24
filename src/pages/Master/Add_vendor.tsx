import { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SelectRoleDepartment from '../../components/Forms/SelectGroup/SelectRoleDepartment';
import { BASE_URL } from '../../../public/config.js';

const Add_vendor = () => {
  // State to hold form data
  const [formData, setFormData] = useState({
    vendorName: '',
    email: '',
    phone: '',
    address: '',
    // comment: '',
  });

  
  // Handle input changes
  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(BASE_URL + 'api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      setFeedback('Vendor added successfully!');
      setTimeout(() => setFeedback(''), 3000);
  
      setFormData({
        vendorName: '',
        email: '',
        phone: '',
        address: '',
        // comment: '',
      });
  
    } catch (error) {
      setFeedback('Error occurred. Please try again.');
    }
  };
  

  return (
    <div>
      <Breadcrumb pageName="Add Client" />

      <h2 className="bg-warning grid-cols-1  sm:grid-cols-1 m-5 gap-9 font-bold  ">{feedback && <p className='p-5 shadow-default rounded  dark:border-strokedark font-bold text-black rounded-sm'>{feedback}</p>}
      </h2>
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-1 m-5">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">

          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Add Client form
            </h3>

          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              {/* Name */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Name <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="flex flex-wrap -mx-2">
                {/* Contact No. */}
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Contact No. <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text" // Consider keeping this as text for better flexibility
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>

                {/* Email */}
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Email <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Address 
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter Address"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

                {/* Comment*/}
                {/* <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Comment
                </label>
                <input
                  type="text"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Enter Comment"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div> */}

            <button
                  type="submit"
                  className="w-full rounded bg-primary py-2 px-4 text-white transition hover:bg-primary/80"
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

export default Add_vendor;











