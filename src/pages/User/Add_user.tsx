

  import { useState } from 'react';
  import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
  import SelectRoleDepartment from '../../components/Forms/SelectGroup/SelectRoleDepartment';
  import { BASE_URL } from '../../../public/config.js';

  const Add_user = () => {
    // State to hold form data
    const [formData, setFormData] = useState({
      name: '',
      contact: '',
      email: '',
      address: '',
      username: '',
      password: '',
      role: '', 
      status: 'active' 
    });

    
    // Handle input changes
    const handleChange = (e: { target: { name: any; value: any; }; }) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    // Handle role change
    const handleRoleChange = (role: string) => {
      setFormData({ ...formData, role });
    };

    // Handle status change
    const handleStatusChange = (status: string) => {
      setFormData({ ...formData, status });
    };

    // Handle form submission
    const [feedback, setFeedback] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(BASE_URL + 'api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
    
        const data = await response.json();
        setFeedback('User added successfully!');
        setTimeout(() => setFeedback(''), 3000); 
    
        setFormData({
          name: '',
          contact: '',
          email: '',
          address: '',
          username: '',
          password: '',
          role: '',
          status: 'active',
        });
    
      } catch (error) {
        setFeedback('Error occurred. Please try again.');
      }
    };
    
    return (
      <div>
        <Breadcrumb pageName="Add User" />
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-1 m-5">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Add User Form
              </h3>
              <h4>{feedback && <p className="text-center text-green-500">{feedback}</p>}
              </h4>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                {/* Name */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
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
                      name="contact"
                      value={formData.contact}
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

                {/* Select Role and Status */}
                <SelectRoleDepartment
                  selectedRole={formData.role}
                  onRoleChange={handleRoleChange}
                  selectedStatus={formData.status}
                  onStatusChange={handleStatusChange}
                />

                <div className="flex flex-wrap -mx-2">
                  {/* User Name */}
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="mb-2.5 block text-black dark:text-white">
                      User Name <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter User Name"
                      autoComplete="off"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Password <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Generate Password"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      required    
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                  // onSubmit={handleSubmit}
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  export default Add_user;
