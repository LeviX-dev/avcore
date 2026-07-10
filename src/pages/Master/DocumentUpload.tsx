import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../../../public/config.js';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { product_id } = useParams();
  const [formData, setFormData] = useState({
    content: '',
    documents: [],
    upload_status: 'Active',
  });
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const fetchUploadedDocs = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}api/document-upload/${product_id}`,
      );
      setUploadedDocs(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch uploaded documents.');
    }
  };

  useEffect(() => {
    if (product_id) {
      fetchUploadedDocs();
    }
  }, [product_id]);

  const handleUpload = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append('product_id', product_id);
      data.append('content', formData.content);
      data.append('upload_status', formData.upload_status);
      for (let i = 0; i < formData.documents.length; i++) {
        data.append('documents', formData.documents[i]);
      }

      await axios.post(`${BASE_URL}api/document-upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      alert('Document uploaded successfully!');
      setFormData({ content: '', documents: [], upload_status: 'Active' });
      fetchUploadedDocs();
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Upload failed');
    }
  };

  const shareOnWhatsApp = (url, content) => {
    const ext = url.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

    let message;
    if (imageExts.includes(ext)) {
      message = url;
    } else {
      message = `Document: ${content || 'No description'}\n ${url}`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/master/product')}
        className="mb-4 bg-gray-600 text-white px-4 py-2 rounded"
      >
        Back
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center">
        Upload Product Document
      </h2>

      <form
        onSubmit={handleUpload}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        <div>
          <label className="block mb-2 font-medium">Document Content</label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Upload Files</label>
          <input
            type="file"
            multiple
            onChange={(e) =>
              setFormData({ ...formData, documents: e.target.files })
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Status</label>
          <select
            value={formData.upload_status}
            onChange={(e) =>
              setFormData({ ...formData, upload_status: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Upload
        </button>
      </form>

      <hr className="my-6" />

      <h3 className="text-xl font-semibold mb-4">Uploaded Documents</h3>
      {uploadedDocs.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <div className="space-y-4">
          {uploadedDocs.map((doc) => (
            <div
              key={doc.docu_id}
              className="border p-4 rounded flex items-center justify-between bg-gray-50"
            >
              <div>
                <p className="font-medium">{doc.content || 'No Description'}</p>
                <p className="text-sm text-gray-600">{doc.upload_date}</p>
                <a
                  href={`${BASE_URL}uploads/documents/${doc.document_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Document
                </a>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    doc.upload_status === 'Active'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  {doc.upload_status}
                </span>
                {doc.upload_status === 'Active' && (
                  <button
                    onClick={() =>
                      shareOnWhatsApp(
                        `${BASE_URL}uploads/documents/${doc.document_file}`,
                        doc.content,
                      )
                    }
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Share on WhatsApp
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate, useParams } from 'react-router-dom';
// import { BASE_URL } from '../../../public/config.js';

// const DocumentUpload = () => {
//   const navigate = useNavigate();
//   const { product_id } = useParams();
//   const [formData, setFormData] = useState({
//     content: '',
//     documents: [],
//     upload_status: 'Active',
//   });
//   const [uploadedDocs, setUploadedDocs] = useState([]);

//   const fetchUploadedDocs = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}api/document-upload/${product_id}`);
//       setUploadedDocs(res.data);
//     } catch (err) {
//       console.error(err);
//       alert('Failed to fetch uploaded documents.');
//     }
//   };

//   useEffect(() => {
//     if (product_id) {
//       fetchUploadedDocs();
//     }
//   }, [product_id]);

//   const handleUpload = async (e) => {
//     e.preventDefault();

//     try {
//       const data = new FormData();
//       data.append('product_id', product_id);
//       data.append('content', formData.content);
//       data.append('upload_status', formData.upload_status);
//       for (let i = 0; i < formData.documents.length; i++) {
//         data.append('documents', formData.documents[i]);
//       }

//       await axios.post(`${BASE_URL}api/document-upload`, data, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         withCredentials: true,
//       });

//       alert('Document uploaded successfully!');
//       setFormData({ content: '', documents: [], upload_status: 'Active' });
//       fetchUploadedDocs();
//     } catch (error) {
//       console.error('Error uploading:', error);
//       alert('Upload failed');
//     }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <button
//         onClick={() => navigate('/master/product')}
//         className="mb-4 bg-gray-600 text-white px-4 py-2 rounded"
//       >
//         Back
//       </button>

//       <h2 className="text-2xl font-bold mb-4 text-center">Upload Product Document</h2>

//       <form onSubmit={handleUpload} className="bg-white p-6 rounded shadow space-y-4">
//         <div>
//           <label className="block mb-2 font-medium">Document Content</label>
//           <textarea
//             value={formData.content}
//             onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//             className="w-full border px-3 py-2 rounded"
//             rows={3}
//           />
//         </div>

//         <div>
//           <label className="block mb-2 font-medium">Upload Files</label>
//           <input
//             type="file"
//             multiple
//             onChange={(e) => setFormData({ ...formData, documents: e.target.files })}
//             className="w-full"
//           />
//         </div>

//         <div>
//           <label className="block mb-2 font-medium">Status</label>
//           <select
//             value={formData.upload_status}
//             onChange={(e) => setFormData({ ...formData, upload_status: e.target.value })}
//             className="w-full border px-3 py-2 rounded"
//           >
//             <option value="Active">Active</option>
//             <option value="Inactive">Inactive</option>
//           </select>
//         </div>

//         <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
//           Upload
//         </button>
//       </form>

//       <hr className="my-6" />

//       <h3 className="text-xl font-semibold mb-2">Uploaded Documents</h3>

//       {uploadedDocs.length === 0 ? (
//         <p>No documents uploaded yet.</p>
//       ) : (
//         <div className="space-y-4">
//           {uploadedDocs.map((doc) => {
//             const docUrl = `${BASE_URL}uploads/documents/${doc.document_file}`;
//             return (
//               <div
//                 key={doc.docu_id}
//                 className="border p-4 rounded flex items-center justify-between bg-gray-50"
//               >
//                 <div>
//                   <p className="font-medium">{doc.content || 'No Description'}</p>
//                   <p className="text-sm text-gray-600">{doc.upload_date}</p>
//                   <div className="mt-2">
//                     <a
//                       href={docUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 underline"
//                     >
//                       View Document
//                     </a>
//                   </div>
//                 </div>

//                 <div>
//                   <span
//                     className={`px-2 py-1 rounded text-sm ${
//                       doc.upload_status === 'Active'
//                         ? 'bg-green-200 text-green-800'
//                         : 'bg-red-200 text-red-800'
//                     }`}
//                   >
//                     {doc.upload_status}
//                   </span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentUpload;
