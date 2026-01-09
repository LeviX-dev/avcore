import React, { useState } from 'react';

const SelectGroupTwo: React.FC = () => {
  const [selectedOption1, setSelectedOption1] = useState<string>('');
  const [selectedOption2, setSelectedOption2] = useState<string>('');
  const [isOptionSelected1, setIsOptionSelected1] = useState<boolean>(false);
  const [isOptionSelected2, setIsOptionSelected2] = useState<boolean>(false);

  const changeTextColor1 = () => {
    setIsOptionSelected1(true);
  };

  const changeTextColor2 = () => {
    setIsOptionSelected2(true);
  };

  return (
    <div className="flex mb-4.5 space-x-4 w-full">
      {/* First dropdown */}
      <div className="w-1/2">
        <label className="mb-2.5 block text-black dark:text-white">Subject 1</label>

        <div className="relative z-20 bg-transparent dark:bg-form-input">
          <select
            value={selectedOption1}
            onChange={(e) => {
              setSelectedOption1(e.target.value);
              changeTextColor1();
            }}
            className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
              isOptionSelected1 ? 'text-black dark:text-white' : ''
            }`}
          >
            <option value="" disabled className="text-body dark:text-bodydark">
              Select your subject
            </option>
            <option value="USA" className="text-body dark:text-bodydark">
              USA
            </option>
            <option value="UK" className="text-body dark:text-bodydark">
              UK
            </option>
            <option value="Canada" className="text-body dark:text-bodydark">
              Canada
            </option>
          </select>

          <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity="0.8">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                  fill=""
                ></path>
              </g>
            </svg>
          </span>
        </div>
      </div>

      {/* Second dropdown */}
      <div className="w-1/2">
        <label className="mb-2.5 block text-black dark:text-white">Subject 2</label>

        <div className="relative z-20 bg-transparent dark:bg-form-input">
          <select
            value={selectedOption2}
            onChange={(e) => {
              setSelectedOption2(e.target.value);
              changeTextColor2();
            }}
            className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
              isOptionSelected2 ? 'text-black dark:text-white' : ''
            }`}
          >
            <option value="" disabled className="text-body dark:text-bodydark">
              Select your subject
            </option>
            <option value="Option1" className="text-body dark:text-bodydark">
              Option1
            </option>
            <option value="Option2" className="text-body dark:text-bodydark">
              Option2
            </option>
            <option value="Option3" className="text-body dark:text-bodydark">
              Option3
            </option>
          </select>

          <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity="0.8">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                  fill=""
                ></path>
              </g>
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SelectGroupTwo;
