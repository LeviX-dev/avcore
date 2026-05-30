// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { BASE_URL } from "../../../public/config.js";
// import { 
//   FaTimes, FaImage, FaSearch, FaChevronDown, FaClock, FaFileAlt,
//   FaUser, FaMapMarkerAlt, FaCalendarAlt, FaFile,
//   FaEdit,
//   FaTrash,
//   FaInfoCircle,
//   FaFileUpload   
// } from "react-icons/fa";

// // Types and Interfaces based on actual API response
// interface Document {
//   id: number;
//   lead_id: number;
//   process_id: number;
//   document_id: number;
//   file_path: string;
//   file_type: string;
//   remark: string | null;
//   manager_status: string | null;
//   manager_remark: string | null;
//   updated_by: number;
//   updated_by_name: string;
//   document_created_at: string;
//   client_name: string;
//   city: string;
//   process_name: string;
//   description: string;
//   schedule_name?: string | null;
//   schedule_id?: number;
// } 

// interface UserInfo {
//   id: number;
//   name: string;
//   role: string;
// }


// // Image Viewer Component
// const ImageViewer = ({ 
//   documents, 
//   initialIndex = 0, 
//   onClose 
// }: { 
//   documents: Document[]; 
//   initialIndex: number; 
//   onClose: () => void;
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(initialIndex);

//   const handlePrevious = () => {
//     setCurrentIndex((prev) => (prev > 0 ? prev - 1 : documents.length - 1));
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) => (prev < documents.length - 1 ? prev + 1 : 0));
//   };

//   const currentDoc = documents[currentIndex];

//   // Construct full image URL
//   const getImageUrl = (filePath: string) => {
//     return `${BASE_URL}uploads/${filePath}`;
//   };

//   return (
//     <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4">
//       <div className="relative max-w-7xl max-h-[90vh] w-full">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all"
//         >
//           <FaTimes className="h-6 w-6" />
//         </button>

//         <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
//           {currentIndex + 1} / {documents.length}
//         </div>

//         <div className="flex items-center justify-center h-full">
//           <img
//             src={getImageUrl(currentDoc.file_path)}
//             alt={`Document ${currentIndex + 1}`}
//             className="max-w-full max-h-[85vh] object-contain rounded-lg"
//             onError={(e) => {
//               console.error('Image failed to load:', getImageUrl(currentDoc.file_path));
//               e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
//             }}
//           />
//         </div>

//         {documents.length > 1 && (
//           <>
//             <button
//               onClick={handlePrevious}
//               className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all"
//             >
//               <FaChevronDown className="h-6 w-6 rotate-90" />
//             </button>
//             <button
//               onClick={handleNext}
//               className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all"
//             >
//               <FaChevronDown className="h-6 w-6 -rotate-90" />
//             </button>
//           </>
//         )}

//         {documents.length > 1 && (
//           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg">
//             {documents.map((doc, idx) => (
//               <button
//                 key={doc.document_id || doc.id}
//                 onClick={() => setCurrentIndex(idx)}
//                 className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
//                   idx === currentIndex 
//                     ? 'border-blue-500 scale-110' 
//                     : 'border-transparent opacity-70 hover:opacity-100'
//                 }`}
//               >
//                 <img
//                   src={getImageUrl(doc.file_path)}
//                   alt=""
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     e.currentTarget.src = 'https://placeholder.com/64?text=Error';
//                   }}
//                 />
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Single Image Component for Table
// const SingleImage = ({ 
//   document,
//   allDocuments,
//   index
// }: { 
//   document: Document;
//   allDocuments: Document[];
//   index: number;
// }) => {
//   const [showViewer, setShowViewer] = useState(false);
//   const [imageError, setImageError] = useState(false);

//   // Construct full image URL
//   const getImageUrl = (filePath: string) => {
//     return `${BASE_URL}uploads/${filePath}`;
//   };

//   const handleImageError = () => {
//     setImageError(true);
//   };

//   const handleImageClick = () => {
//     setShowViewer(true);
//   };

//   return (
//     <>
//       <div
//         className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white dark:border-gray-800 shadow-md cursor-pointer hover:scale-110 transition-all"
//         onClick={handleImageClick}
//       >
//         {imageError ? (
//           <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
//             <FaImage className="h-4 w-4 text-gray-500" />
//           </div>
//         ) : (
//           <img
//             src={getImageUrl(document.file_path)}
//             alt={`${document.client_name} - ${document.process_name}`}
//             className="w-full h-full object-cover"
//             onError={handleImageError}
//           />
//         )}
//       </div>

//       {showViewer && (
//         <ImageViewer
//           documents={allDocuments}
//           initialIndex={index}
//           onClose={() => setShowViewer(false)}
//         />
//       )}
//     </>
//   );
// };

// // Pagination Component
// const Pagination: React.FC<{
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
//   totalItems: number;
//   itemsPerPage: number;
//   showingStart: number;
//   showingEnd: number;
// }> = ({
//   currentPage,
//   totalPages,
//   onPageChange,
//   totalItems,
//   itemsPerPage,
//   showingStart,
//   showingEnd,
// }) => {
//   const getPageNumbers = () => {
//     const delta = 2;
//     const range = [];
//     const rangeWithDots = [];

//     for (
//       let i = Math.max(2, currentPage - delta);
//       i <= Math.min(totalPages - 1, currentPage + delta);
//       i++
//     ) {
//       range.push(i);
//     }

//     if (currentPage - delta > 2) {
//       rangeWithDots.push(1, '...');
//     } else {
//       rangeWithDots.push(1);
//     }

//     rangeWithDots.push(...range);

//     if (currentPage + delta < totalPages - 1) {
//       rangeWithDots.push('...', totalPages);
//     } else if (totalPages > 1) {
//       rangeWithDots.push(totalPages);
//     }

//     return rangeWithDots;
//   };

//   return (
//     <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 px-4 py-3 sm:px-6">
//       <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
//         <div>
//           <p className="text-xs text-gray-700 dark:text-gray-300">
//             Showing
//             <span className="font-medium mx-1 text-gray-900 dark:text-white">{showingStart}</span>
//             to
//             <span className="font-medium mx-1 text-gray-900 dark:text-white">{showingEnd}</span>
//             of
//             <span className="font-medium mx-1 text-gray-900 dark:text-white">{totalItems}</span>
//             results
//           </p>
//         </div>
//         <div>
//           <nav className="isolate inline-flex -space-x-px rounded-md">
//             <button
//               onClick={() => onPageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               className={`relative inline-flex items-center rounded-l-md px-2 py-1 text-xs text-gray-400 dark:text-gray-300 border border-gray-300 dark:border-gray-700 ${
//                 currentPage === 1
//                   ? 'cursor-not-allowed opacity-50'
//                   : 'hover:bg-gray-50 dark:hover:bg-white/5'
//               }`}
//             >
//               <span className="sr-only">Previous</span>
//               <FaChevronDown className="h-3 w-3 rotate-90" />
//             </button>

//             {getPageNumbers().map((page, index) => {
//               if (page === '...') {
//                 return (
//                   <span
//                     key={`dots-${index}`}
//                     className="relative inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
//                   >
//                     ...
//                   </span>
//                 );
//               }

//               const pageNumber = page as number;
//               const isCurrent = pageNumber === currentPage;

//               return (
//                 <button
//                   key={pageNumber}
//                   onClick={() => onPageChange(pageNumber)}
//                   className={`relative inline-flex items-center px-3 py-1 text-xs font-semibold border border-gray-300 dark:border-gray-700 ${
//                     isCurrent
//                       ? 'z-10 bg-indigo-600 text-white'
//                       : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
//                   }`}
//                 >
//                   {pageNumber}
//                 </button>
//               );
//             })}

//             <button
//               onClick={() => onPageChange(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className={`relative inline-flex items-center rounded-r-md px-2 py-1 text-xs text-gray-400 dark:text-gray-300 border border-gray-300 dark:border-gray-700 ${
//                 currentPage === totalPages
//                   ? 'cursor-not-allowed opacity-50'
//                   : 'hover:bg-gray-50 dark:hover:bg-white/5'
//               }`}
//             >
//               <span className="sr-only">Next</span>
//               <FaChevronDown className="h-3 w-3 -rotate-90" />
//             </button>
//           </nav>
//         </div>
//       </div>
//     </div>
//   );
// };


// // Delete Confirmation Modal Component
// const DeleteConfirmationModal = ({ 
//   document, 
//   onClose, 
//   onConfirm,
//   isDeleting 
// }: { 
//   document: Document | null;
//   onClose: () => void;
//   onConfirm: () => void;
//   isDeleting: boolean;
// }) => {
//   if (!document) return null;

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10002] p-4">
//       <div className="bg-white dark:bg-boxdark w-full max-w-md rounded-lg shadow-lg">
//         {/* Header */}
//         <div className="flex justify-between items-center border-b px-4 py-3">
//           <h3 className="font-medium text-gray-800 dark:text-white text-sm">
//             Confirm Delete
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
//           >
//             ×
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-4">
//           <div className="flex items-center justify-center mb-4 text-red-500">
//             <FaTrash className="h-8 w-8" />
//           </div>
          
//           <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-2">
//             Are you sure you want to delete this document?
//           </p>
          
//           <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
//             <p className="text-xs text-gray-600 dark:text-gray-400">
//               <span className="font-semibold">Client:</span> {document.client_name}
//             </p>
//             <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//               <span className="font-semibold">Process:</span> {document.process_name}
//             </p>
//             <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//               <span className="font-semibold">Uploaded By:</span> {document.updated_by_name}
//             </p>
//             <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//               <span className="font-semibold">Date:</span> {new Date(document.document_created_at).toLocaleDateString()}
//             </p>
//           </div>
          
//           <p className="text-xs text-red-600 dark:text-red-400 text-center">
//             This action cannot be undone. The file will be permanently deleted.
//           </p>
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end gap-2 border-t px-4 py-3">
//           <button
//             onClick={onClose}
//             disabled={isDeleting}
//             className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             disabled={isDeleting}
//             className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
//           >
//             {isDeleting ? (
//               <>
//                 <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
//                 <span>Deleting...</span>
//               </>
//             ) : (
//               <>
//                 <FaTrash className="h-3 w-3" />
//                 <span>Delete Permanently</span>
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };


// // Manager Status Edit Modal Component
// const ManagerStatusEditModal = ({ 
//   document, 
//   onClose, 
//   onUpdate 
// }: { 
//   document: Document | null;
//   onClose: () => void;
//   onUpdate: () => void;
// }) => {
//   const [managerStatus, setManagerStatus] = useState(document?.manager_status || 'pending');
//   const [managerRemark, setManagerRemark] = useState(document?.manager_remark || '');
//   const [updating, setUpdating] = useState(false);

//   const handleUpdate = async () => {
//     if (!document) return;

//     try {
//       setUpdating(true);
//       await axios.put(
//         `${BASE_URL}api/daily-execution/document/${document.document_id || document.id}/status`,
//         {
//           manager_status: managerStatus,
//           manager_remark: managerRemark
//         },
//         { withCredentials: true }
//       );

//       alert("Document status updated successfully ✅");
//       onUpdate();
//       onClose();
//     } catch (err) {
//       console.error("Error updating document status:", err);
//       alert("Failed to update document status");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   if (!document) return null;

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10001] p-4">
//       <div className="bg-white dark:bg-boxdark w-full max-w-md rounded-lg shadow-lg">
//         {/* Header */}
//         <div className="flex justify-between items-center border-b px-4 py-3">
//           <h3 className="font-medium text-gray-800 dark:text-white text-sm">
//             Update Manager Status
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
//           >
//             ×
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-4 space-y-4">
//           <div>
//             <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
//               Client Name: <span className="font-semibold text-gray-900 dark:text-white">{document.client_name}</span>
//             </p>
//             <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
//               Process Name: <span className="font-semibold text-gray-900 dark:text-white">{document.process_name}</span>
//             </p>
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Manager Status
//             </label>
//             <select
//               value={managerStatus}
//               onChange={(e) => setManagerStatus(e.target.value)}
//               className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
//             >
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//               <option value="needs_revision">Needs Revision</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Manager Remark
//             </label>
//             <textarea
//               value={managerRemark}
//               onChange={(e) => setManagerRemark(e.target.value)}
//               rows={3}
//               className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
//               placeholder="Enter your feedback..."
//             />
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end gap-2 border-t px-4 py-3">
//           <button
//             onClick={onClose}
//             className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleUpdate}
//             disabled={updating}
//             className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
//           >
//             {updating ? (
//               <>
//                 <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
//                 <span>Updating...</span>
//               </>
//             ) : (
//               <>
//                 <FaEdit className="h-3 w-3" />
//                 <span>Update Status</span>
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };


// // Update Image Modal Component
// const UpdateImageModal = ({ 
//   document, 
//   onClose, 
//   onUpdate 
// }: { 
//   document: Document | null;
//   onClose: () => void;
//   onUpdate: () => void;
// }) => {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [remark, setRemark] = useState(document?.remark || '');
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [updating, setUpdating] = useState(false);

//   // Get current image URL
//   const getCurrentImageUrl = () => {
//     if (!document?.file_path) return null;
//     return `${BASE_URL}uploads/${document.file_path}`;
//   };

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleUpdate = async () => {
//     if (!document) return;

//     try {
//       setUpdating(true);
      
//       const formData = new FormData();
      
//       // Add file if selected
//       if (selectedFile) {
//         formData.append('file', selectedFile);
//       }
      
//       // Add remark
//       formData.append('remark', remark);

//       const documentId = document.document_id || document.id;
      
//       const response = await axios.put(
//         `${BASE_URL}api/daily-execution/document/${documentId}`,
//         formData,
//         {
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );

//       if (response.data.success) {
//         alert("Document updated successfully ✅");
//         onUpdate();
//         onClose();
//       }
//     } catch (err) {
//       console.error("Error updating document:", err);
//       alert("Failed to update document");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   if (!document) return null;

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10003] p-4">
//       <div className="bg-white dark:bg-boxdark w-full max-w-2xl rounded-lg shadow-lg">
//         {/* Header */}
//         <div className="flex justify-between items-center border-b px-4 py-3">
//           <h3 className="font-medium text-gray-800 dark:text-white text-sm">
//             Update Document
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
//           >
//             ×
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-4 max-h-[70vh] overflow-y-auto">
//           {/* Document Info */}
//           <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
//             <p className="text-xs text-gray-600 dark:text-gray-400">
//               <span className="font-semibold">Client:</span> {document.client_name}
//             </p>
//             <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//               <span className="font-semibold">Process:</span> {document.process_name}
//             </p>
//             <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//               <span className="font-semibold">Uploaded By:</span> {document.updated_by_name}
//             </p>
//           </div>

//           {/* Current Image */}
//           <div className="mb-4">
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Current Image
//             </label>
//             <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2">
//               <img
//                 src={getCurrentImageUrl() || ''}
//                 alt="Current"
//                 className="max-h-48 mx-auto object-contain"
//                 onError={(e) => {
//                   (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Image+Not+Found';
//                 }}
//               />
//             </div>
//           </div>

//           {/* Upload New Image */}
//           <div className="mb-4">
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Upload New Image (Optional)
//             </label>
//             <div className="flex items-center justify-center w-full">
//               <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
//                 <div className="flex flex-col items-center justify-center pt-3 pb-2">
//                   <FaImage className="w-6 h-6 mb-2 text-gray-400" />
//                   <p className="text-xs text-gray-500 dark:text-gray-400">
//                     <span className="font-semibold">Click to upload</span> or drag and drop
//                   </p>
//                   <p className="text-[10px] text-gray-500 dark:text-gray-400">
//                     PNG, JPG, GIF (MAX. 10MB)
//                   </p>
//                 </div>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileSelect}
//                   className="hidden"
//                 />
//               </label>
//             </div>
//           </div>

//           {/* New Image Preview */}
//           {imagePreview && (
//             <div className="mb-4">
//               <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 New Image Preview
//               </label>
//               <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 relative">
//                 <img
//                   src={imagePreview}
//                   alt="Preview"
//                   className="max-h-48 mx-auto object-contain"
//                 />
//                 <button
//                   onClick={() => {
//                     setSelectedFile(null);
//                     setImagePreview(null);
//                   }}
//                   className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
//                   title="Remove"
//                 >
//                   <FaTimes className="h-3 w-3" />
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Remark Input */}
//           <div>
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Remark
//             </label>
//             <textarea
//               value={remark}
//               onChange={(e) => setRemark(e.target.value)}
//               rows={3}
//               className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
//               placeholder="Enter remark..."
//             />
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end gap-2 border-t px-4 py-3">
//           <button
//             onClick={onClose}
//             disabled={updating}
//             className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleUpdate}
//             disabled={updating || (!selectedFile && remark === document.remark)}
//             className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
//           >
//             {updating ? (
//               <>
//                 <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
//                 <span>Updating...</span>
//               </>
//             ) : (
//               <>
//                 <FaEdit className="h-3 w-3" />
//                 <span>Update Document</span>
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };


// const ManagerReport = () => {
//   const [documents, setDocuments] = useState<Document[]>([]);
//   const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(50);
//   const [totalDocuments, setTotalDocuments] = useState(0);
  
//   // User info state - now coming from API response
//   const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
//   // State for modals
//   const [editingDocument, setEditingDocument] = useState<Document | null>(null);
//   const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [updatingDocument, setUpdatingDocument] = useState<Document | null>(null);
  
//   // Filter states
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedEmployee, setSelectedEmployee] = useState<string>('');
//   const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  
//   // Refs
//   const employeeDropdownRef = useRef<HTMLDivElement>(null);

//   // Fetch manager documents
//   const fetchManagerDocuments = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${BASE_URL}api/daily-execution/manager-processes`,
//         {
//           params: {
//             page: currentPage,
//             limit: itemsPerPage,
//           },
//           withCredentials: true,
//         }
//       );

//       if (response.data.success) {
//         const data = response.data.data;
//         setDocuments(data);
//         setFilteredDocuments(data);
//         setTotalDocuments(response.data.pagination?.total || data.length);
        
//         // Set user info from response
//         if (response.data.user) {
//           setUserInfo(response.data.user);
//           console.log("User info from API:", response.data.user);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching manager documents:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle delete document
//   const handleDeleteDocument = async () => {
//     if (!deletingDocument) return;

//     try {
//       setIsDeleting(true);
//       const documentId = deletingDocument.document_id || deletingDocument.id;
      
//       await axios.delete(
//         `${BASE_URL}api/daily-execution/document/${documentId}`,
//         { withCredentials: true }
//       );

//       alert("Document deleted successfully ✅");
      
//       // Refresh the document list
//       await fetchManagerDocuments();
//       setDeletingDocument(null);
//     } catch (err) {
//       console.error("Error deleting document:", err);
//       alert("Failed to delete document");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   useEffect(() => {
//     fetchManagerDocuments();
//   }, [currentPage, itemsPerPage]);

//   useEffect(() => {
//     applyFilters();
//   }, [searchTerm, selectedEmployee, documents]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
//         setShowEmployeeDropdown(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const applyFilters = () => {
//     let filtered = [...documents];

//     // Search filter - client name, city, process
//     if (searchTerm) {
//       const lowerSearch = searchTerm.toLowerCase();
//       filtered = filtered.filter(doc => 
//         doc.client_name?.toLowerCase().includes(lowerSearch) ||
//         doc.city?.toLowerCase().includes(lowerSearch) ||
//         doc.process_name?.toLowerCase().includes(lowerSearch)
//       );
//     }

//     // Employee filter - only for admin
//     if (selectedEmployee && isAdmin) {
//       filtered = filtered.filter(doc => doc.updated_by_name === selectedEmployee);
//     }

//     setFilteredDocuments(filtered);
//   };

//   const formatDateOnly = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-GB", {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   };

//   const getStatusColor = (status: string | null) => {
//     if (!status) return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    
//     const colors = {
//       'approved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
//       'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
//       'rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
//       'needs_revision': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
//     };
//     return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setSelectedEmployee('');
//   };

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages && page !== currentPage) {
//       setCurrentPage(page);
//     }
//   };

//   const totalPages = Math.ceil(totalDocuments / itemsPerPage);
//   const showingStart = totalDocuments === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
//   const showingEnd = Math.min(currentPage * itemsPerPage, totalDocuments);

//   // Check if user is admin
//   const isAdmin = userInfo?.role === 'admin';

//   // Get unique employees for filter (only for admin)
//   const uniqueEmployees = isAdmin 
//     ? Array.from(new Set(documents.map(doc => doc.updated_by_name).filter(Boolean)))
//     : [];

//   return (
//     <div className="p-4">
//       {/* Header with Filters */}
//       <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">  
//         <div className="px-4 py-3">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//             <div className="flex items-center gap-3">
//               {/* User Info Badge */}
//               {userInfo && (
//                 <>
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30">
//                     <FaClock className="w-3 h-3 mr-1" />
//                     {totalDocuments} {isAdmin ? 'Total Documents' : 'Total Documents'}
//                   </span>
                  
                 
//                 </>
//               )}
//             </div>

//             <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//               {/* Employee Dropdown Filter - Only for Admin */}
//               {isAdmin && (
//                 <div className="w-full sm:w-48 relative" ref={employeeDropdownRef}>
//                   <button
//                     onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
//                     className="w-full flex items-center justify-between px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
//                   >
//                     <span className="flex items-center gap-2">
//                       <FaUser className="h-3 w-3 text-gray-400" />
//                       <span className="truncate">{selectedEmployee || 'All Employees'}</span>
//                     </span>
//                     <FaChevronDown className={`h-3 w-3 transition-transform ${showEmployeeDropdown ? 'rotate-180' : ''}`} />
//                   </button>

//                   {showEmployeeDropdown && (
//                     <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto text-xs">
//                       <div
//                         onClick={() => {
//                           setSelectedEmployee('');
//                           setShowEmployeeDropdown(false);
//                         }}
//                         className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
//                       >
//                         All Employees
//                       </div>
//                       {uniqueEmployees.map((empName) => (
//                         <div
//                           key={empName}
//                           onClick={() => {
//                             setSelectedEmployee(empName);
//                             setShowEmployeeDropdown(false);
//                           }}
//                           className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
//                         >
//                           {empName}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Search Input */}
//               <div className="w-full sm:w-64">
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaSearch className="h-3 w-3 text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                     placeholder={isAdmin ? "Search by Client, City, Process..." : "Search your documents by Client, City, Process..."}
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* Reset Filter Button */}
//               <button
//                 onClick={clearFilters}
//                 className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
//               >
//                 <FaTimes className="h-3 w-3" />
//                 Reset
//               </button>
//             </div>
//           </div>


//         </div>
//       </div>

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
//         </div>
//       ) : (
//         <>
//           {/* Table */}
//           <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
//               <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
//                 <tr>
//                   <th className="py-2 px-3 text-left whitespace-nowrap">
//                     <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Date
//                     </span>
//                   </th>

//                   <th className="py-2 px-3 text-left whitespace-nowrap">
//                     <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Client Name
//                     </span>
//                   </th>

//                   <th className="py-2 px-3 text-left whitespace-nowrap">
//                     <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       City
//                     </span>
//                   </th> 

//                    <th className="py-2 px-3 text-left whitespace-nowrap">
//                     <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Schedule
//                     </span>
//                   </th>


//                   <th className="py-2 px-3 text-left whitespace-nowrap">
//                     <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Process
//                     </span>
//                   </th>

                 

//                   <th className="py-2 px-3 text-left whitespace-nowrap">
//                     <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Remark
//                     </span>
//                   </th>

//                   <th className="py-2 px-3 text-left whitespace-nowrap">
//                     <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Updated By
//                     </span>
//                   </th>

//                   <th className="py-2 px-3 text-left whitespace-nowrap">
//                     <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Manager Remark
//                     </span>
//                   </th>

//                   <th className="py-2 px-3 text-center whitespace-nowrap">
//                     <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Manager Status
//                     </span>
//                   </th>

//                   <th className="py-2 px-3 text-left whitespace-nowrap">
//                     <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                       Image
//                     </span>
//                   </th>

//                   {/* Action Column - Only for Admin */}
//                   {isAdmin && (
//                     <th className="py-2 px-3 text-center whitespace-nowrap">
//                       <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
//                         Actions
//                       </span>
//                     </th>
//                   )}
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
//                 {filteredDocuments.length === 0 ? (
//                   <tr>
//                     <td colSpan={isAdmin ? 11 : 10} className="px-6 py-8 text-center">
//                       <div className="text-gray-500 dark:text-gray-400">
//                         <FaFileAlt className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                         <p className="text-sm font-medium">No documents found</p>
//                         {!isAdmin && (
//                           <p className="text-xs mt-2">You haven't uploaded any documents yet.</p>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredDocuments.map((document, index) => (
//                     <tr 
//                       key={document.document_id || document.id} 
//                       className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
//                     >
//                       {/* Date */}
//                       <td className="py-2 px-3 whitespace-nowrap">
//                         <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
//                           {formatDateOnly(document.document_created_at)}
//                         </div>
//                       </td>

//                       {/* Client Name */}
//                       <td className="py-2 px-3">
//                         <div className="text-xs font-medium text-gray-900 dark:text-white">
//                           {document.client_name}
//                         </div>
//                       </td>

//                       {/* City */}
//                       <td className="py-2 px-3">
//                         <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
//                           <span className="truncate max-w-[80px]">{document.city || '-'}</span>
//                         </div>
//                       </td>

//  {/* Schedule Name */}
//                       <td className="py-2 px-3">
//                         <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
//                           {document.schedule_name || '-'}
//                         </div>
//                       </td>


//                       {/* Process */}
//                       <td className="py-2 px-3">
//                         <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">
//                           {document.process_name}
//                         </div>
//                       </td>

                     
//                       {/* Remark */}
//                       <td className="py-2 px-3">
//                         <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
//                           {document.remark || '-'}
//                         </div>
//                       </td>

//                       {/* Updated By - Show with role for admin */}
//                       <td className="py-2 px-3">
//                         <div className="flex flex-col">
//                           <span className="text-xs font-medium text-gray-900 dark:text-white">
//                             {document.updated_by_name || '-'}
//                           </span>
//                           {isAdmin && document.updated_by && (
//                             <span className="text-[9px] text-gray-500 dark:text-gray-400">
//                               ({document.updated_by})
//                             </span>
//                           )}
//                         </div>
//                       </td>

//                       {/* Manager Remark */}
//                       <td className="py-2 px-3">
//                         <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
//                           {document.manager_remark || 'No Remark'}
//                         </div>
//                       </td>

//                       {/* Manager Status */}
//                       <td className="py-2 px-3 text-center">
//                         <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${getStatusColor(document.manager_status)}`}>
//                           {document.manager_status || 'pending'}
//                         </span>
//                       </td>

//                       {/* Image */}
//                       <td className="py-2 px-3">
//                         <SingleImage 
//                           document={document}
//                           allDocuments={filteredDocuments}
//                           index={index}
//                         />
//                       </td>

//                       {/* Action Buttons - Only for Admin */}
//                       {isAdmin && (
//                         <td className="py-2 px-3">
//                           <div className="flex items-center justify-center gap-1.5">
//                             {/* Update Image Button */}
//                            {/* Upload Document Button - enabled only when manager_status is pending */}
// <button
//   onClick={() => setUpdatingDocument(document)}
//   disabled={document.manager_status !== 'pending' && document.manager_status !== null || (document.manager_status !== null && document.manager_status !== 'pending')}
//   className={`p-1.5 rounded-lg transition-all duration-200 ${
//     !document.manager_status || document.manager_status === 'pending'
//       ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 cursor-pointer'
//       : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed opacity-50'
//   }`}
//   title={
//     !document.manager_status || document.manager_status === 'pending'
//       ? 'Upload Document'
//       : `Upload disabled (Status: ${document.manager_status})`
//   }
// >
//   <FaFileUpload className="h-3.5 w-3.5" />
// </button>

//                             {/* Edit Status Button */}
//                             <button
//                               onClick={() => setEditingDocument(document)}
//                               className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all duration-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
//                               title="Update Status & Remark"
//                             >
//                               <FaEdit className="h-3.5 w-3.5" />
//                             </button>                         
//                           </div>
//                         </td>
//                       )}
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={handlePageChange}
//               totalItems={totalDocuments}
//               itemsPerPage={itemsPerPage}
//               showingStart={showingStart}
//               showingEnd={showingEnd}
//             />
//           )}
//         </>
//       )}

//       {/* Modals - Only accessible by admin */}
//       {isAdmin && editingDocument && (
//         <ManagerStatusEditModal
//           document={editingDocument}
//           onClose={() => setEditingDocument(null)}
//           onUpdate={fetchManagerDocuments}
//         />
//       )}

//       {isAdmin && deletingDocument && (
//         <DeleteConfirmationModal
//           document={deletingDocument}
//           onClose={() => setDeletingDocument(null)}
//           onConfirm={handleDeleteDocument}
//           isDeleting={isDeleting}
//         />
//       )}

//       {isAdmin && updatingDocument && (
//         <UpdateImageModal
//           document={updatingDocument}
//           onClose={() => setUpdatingDocument(null)}
//           onUpdate={fetchManagerDocuments}
//         />
//       )}
//     </div>
//   );
// };


// export default ManagerReport;



import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";
import { 
  FaTimes, FaImage, FaSearch, FaChevronDown, FaClock, FaFileAlt,
  FaUser, FaMapMarkerAlt, FaCalendarAlt, FaFile,
  FaEdit,
  FaTrash,
  FaInfoCircle,
  FaFileUpload, FaEye, FaMapMarker, FaPhone, FaBuilding
} from "react-icons/fa";



// Types and Interfaces based on actual API response
interface Document {
  type_id: any;
  id: number;
  lead_id: number;
  process_id: number;
  document_id: number;
  file_path: string;
  file_type: string;
  remark: string | null;
  manager_status: string | null;
  manager_remark: string | null;
  updated_by: number;
  updated_by_name: string;
  document_created_at: string;
  client_name: string;
  city: string;
  process_name: string;
  description: string;
  schedule_name?: string | null;
  schedule_id?: number;
  start_date?: string | null;
  start_time?: string | null;
  end_time?: string | null; 

    process_status?: string | null;  // This is the process execution status
  process_remark?: string | null;   // Process remark
  execution_id?: number;         


} 

interface UserInfo {
  id: number;
  name: string;
  role: string;
}


// Image Viewer Component
const ImageViewer = ({ 
  documents, 
  initialIndex = 0, 
  onClose 
}: { 
  documents: Document[]; 
  initialIndex: number; 
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : documents.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < documents.length - 1 ? prev + 1 : 0));
  };

  const currentDoc = documents[currentIndex];

  // Construct full image URL
  const getImageUrl = (filePath: string) => {
    return `${BASE_URL}uploads/${filePath}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4">
      <div className="relative max-w-7xl max-h-[90vh] w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all"
        >
          <FaTimes className="h-6 w-6" />
        </button>

        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} / {documents.length}
        </div>

        <div className="flex items-center justify-center h-full">
          <img
            src={getImageUrl(currentDoc.file_path)}
            alt={`Document ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onError={(e) => {
              console.error('Image failed to load:', getImageUrl(currentDoc.file_path));
              e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
            }}
          />
        </div>

        {documents.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all"
            >
              <FaChevronDown className="h-6 w-6 rotate-90" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all"
            >
              <FaChevronDown className="h-6 w-6 -rotate-90" />
            </button>
          </>
        )}

        {documents.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg">
            {documents.map((doc, idx) => (
              <button
                key={doc.document_id || doc.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentIndex 
                    ? 'border-blue-500 scale-110' 
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={getImageUrl(doc.file_path)}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placeholder.com/64?text=Error';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Single Image Component for Table
const SingleImage = ({ 
  document,
  allDocuments,
  index
}: { 
  document: Document;
  allDocuments: Document[];
  index: number;
}) => {
  const [showViewer, setShowViewer] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Construct full image URL
  const getImageUrl = (filePath: string) => {
    return `${BASE_URL}uploads/${filePath}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageClick = () => {
    setShowViewer(true);
  };

  return (
    <>
      <div
        className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white dark:border-gray-800 shadow-md cursor-pointer hover:scale-110 transition-all"
        onClick={handleImageClick}
      >
        {imageError ? (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <FaImage className="h-4 w-4 text-gray-500" />
          </div>
        ) : (
          <img
            src={getImageUrl(document.file_path)}
            alt={`${document.client_name} - ${document.process_name}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
      </div>

      {showViewer && (
        <ImageViewer
          documents={allDocuments}
          initialIndex={index}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
};

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  showingStart: number;
  showingEnd: number;
}> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showingStart,
  showingEnd,
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Showing
            <span className="font-medium mx-1 text-gray-900 dark:text-white">{showingStart}</span>
            to
            <span className="font-medium mx-1 text-gray-900 dark:text-white">{showingEnd}</span>
            of
            <span className="font-medium mx-1 text-gray-900 dark:text-white">{totalItems}</span>
            results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-1 text-xs text-gray-400 dark:text-gray-300 border border-gray-300 dark:border-gray-700 ${
                currentPage === 1
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <span className="sr-only">Previous</span>
              <FaChevronDown className="h-3 w-3 rotate-90" />
            </button>

            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="relative inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
                  >
                    ...
                  </span>
                );
              }

              const pageNumber = page as number;
              const isCurrent = pageNumber === currentPage;

              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`relative inline-flex items-center px-3 py-1 text-xs font-semibold border border-gray-300 dark:border-gray-700 ${
                    isCurrent
                      ? 'z-10 bg-indigo-600 text-white'
                      : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-1 text-xs text-gray-400 dark:text-gray-300 border border-gray-300 dark:border-gray-700 ${
                currentPage === totalPages
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <span className="sr-only">Next</span>
              <FaChevronDown className="h-3 w-3 -rotate-90" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};


// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ 
  document, 
  onClose, 
  onConfirm,
  isDeleting 
}: { 
  document: Document | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10002] p-4">
      <div className="bg-white dark:bg-boxdark w-full max-w-md rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h3 className="font-medium text-gray-800 dark:text-white text-sm">
            Confirm Delete
          </h3>
          <button
            onClick={onClose}
            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <FaTrash className="h-8 w-8" />
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-2">
            Are you sure you want to delete this document?
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Client:</span> {document.client_name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span className="font-semibold">Process:</span> {document.process_name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span className="font-semibold">Uploaded By:</span> {document.updated_by_name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span className="font-semibold">Date:</span> {new Date(document.document_created_at).toLocaleDateString()}
            </p>
          </div>
          
          <p className="text-xs text-red-600 dark:text-red-400 text-center">
            This action cannot be undone. The file will be permanently deleted.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <FaTrash className="h-3 w-3" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// Manager Status Edit Modal Component
const ManagerStatusEditModal = ({ 
  document, 
  onClose, 
  onUpdate 
}: { 
  document: Document | null;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [managerStatus, setManagerStatus] = useState(document?.manager_status || 'pending');
  const [managerRemark, setManagerRemark] = useState(document?.manager_remark || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!document) return;

    try {
      setUpdating(true);
      await axios.put(
        `${BASE_URL}api/daily-execution/document/${document.document_id || document.id}/status`,
        {
          manager_status: managerStatus,
          manager_remark: managerRemark
        },
        { withCredentials: true }
      );

      alert("Document status updated successfully ✅");
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating document status:", err);
      alert("Failed to update document status");
    } finally {
      setUpdating(false);
    }
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10001] p-4">
      <div className="bg-white dark:bg-boxdark w-full max-w-md rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h3 className="font-medium text-gray-800 dark:text-white text-sm">
            Update Manager Status
          </h3>
          <button
            onClick={onClose}
            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Client Name: <span className="font-semibold text-gray-900 dark:text-white">{document.client_name}</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Process Name: <span className="font-semibold text-gray-900 dark:text-white">{document.process_name}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Manager Status
            </label>
            <select
              value={managerStatus}
              onChange={(e) => setManagerStatus(e.target.value)}
              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs_revision">Needs Revision</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Manager Remark
            </label>
            <textarea
              value={managerRemark}
              onChange={(e) => setManagerRemark(e.target.value)}
              rows={3}
              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter your feedback..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <FaEdit className="h-3 w-3" />
                <span>Update Status</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// Update Image Modal Component
const UpdateImageModal = ({ 
  document, 
  onClose, 
  onUpdate 
}: { 
  document: Document | null;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remark, setRemark] = useState(document?.remark || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Get current image URL
  const getCurrentImageUrl = () => {
    if (!document?.file_path) return null;
    return `${BASE_URL}uploads/${document.file_path}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!document) return;

    try {
      setUpdating(true);
      
      const formData = new FormData();
      
      // Add file if selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      // Add remark
      formData.append('remark', remark);

      const documentId = document.document_id || document.id;
      
      const response = await axios.put(
        `${BASE_URL}api/daily-execution/document/${documentId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert("Document updated successfully ✅");
        onUpdate();
        onClose();
      }
    } catch (err) {
      console.error("Error updating document:", err);
      alert("Failed to update document");
    } finally {
      setUpdating(false);
    }
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10003] p-4">
      <div className="bg-white dark:bg-boxdark w-full max-w-2xl rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h3 className="font-medium text-gray-800 dark:text-white text-sm">
            Update Document
          </h3>
          <button
            onClick={onClose}
            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Document Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Client:</span> {document.client_name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span className="font-semibold">Process:</span> {document.process_name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span className="font-semibold">Uploaded By:</span> {document.updated_by_name}
            </p>
          </div>

          {/* Current Image */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Image
            </label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2">
              <img
                src={getCurrentImageUrl() || ''}
                alt="Current"
                className="max-h-48 mx-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Image+Not+Found';
                }}
              />
            </div>
          </div>

          {/* Upload New Image */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload New Image (Optional)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="flex flex-col items-center justify-center pt-3 pb-2">
                  <FaImage className="w-6 h-6 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF (MAX. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* New Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Image Preview
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto object-contain"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  title="Remove"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Remark Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remark
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter remark..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <button
            onClick={onClose}
            disabled={updating}
            className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating || (!selectedFile && remark === document.remark)}
            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <FaEdit className="h-3 w-3" />
                <span>Update Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};



// Add this component before the ManagerReport component
const ManagerProcessStatusUpdateModal = ({ 
  document, 
  onClose, 
  onUpdate 
}: { 
  document: Document | null;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [status, setStatus] = useState(document?.manager_status || 'pending');
  const [remark, setRemark] = useState(document?.manager_remark || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!document) return;
    
    try {
      setLoading(true);
      
      await axios.put(
        `${BASE_URL}api/daily-execution/document/${document.document_id || document.id}/status`,
        {
          manager_status: status,
          manager_remark: remark
        },
        { withCredentials: true }
      );

      alert("Process status updated successfully ✅");
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!document) return null;

  const getStatusColor = (statusValue: string) => {
    const colors = {
      'approved': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'rejected': 'bg-red-100 text-red-700',
      'needs_revision': 'bg-orange-100 text-orange-700'
    };
    return colors[statusValue as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10004] p-4">
      <div className="bg-white dark:bg-boxdark w-full max-w-md rounded-lg shadow-lg">
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h3 className="font-medium text-gray-800 dark:text-white text-sm">
            Update Manager Status
          </h3>
          <button
            onClick={onClose}
            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Client: <span className="font-semibold text-gray-900 dark:text-white">{document.client_name}</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Process: <span className="font-semibold text-gray-900 dark:text-white">{document.process_name}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs_revision">Needs Revision</option>
            </select>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Preview:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(status)}`}>
                {status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Manager Remark
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter your feedback..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-gray-400 flex items-center gap-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <FaEdit className="h-3 w-3" />
                <span>Update Status</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// Process Status Details Modal - Shows process status and allows updates
const ProcessStatusModal = ({ 
  document, 
  onClose, 
  onUpdate 
}: { 
  document: Document | null;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [status, setStatus] = useState(document?.process_status || 'pending');
  const [remark, setRemark] = useState(document?.process_remark || '');
  const [loading, setLoading] = useState(false);
  const [processDetails, setProcessDetails] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (document?.execution_id && document?.process_id) {
      fetchProcessDetails();
      fetchDocuments();
    }
  }, [document]);

  const fetchProcessDetails = async () => {
    if (!document?.execution_id) return;
    try {
      const response = await axios.get(
        `${BASE_URL}api/execution/process/${document.execution_id}`,
        { withCredentials: true }
      );
      if (response.data?.success) {
        setProcessDetails(response.data.data);
        setStatus(response.data.data?.status || 'pending');
        setRemark(response.data.data?.remark || '');
      }
    } catch (err) {
      console.error("Error fetching process details:", err);
    }
  };

  const fetchDocuments = async () => {
    if (!document?.execution_id || !document?.process_id) return;
    try {
      const res = await axios.get(
        `${BASE_URL}api/daily-execution/upload/${document.execution_id}/${document.process_id}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        setDocuments(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };


  const handleUpdateProcessStatus = async () => {
  if (!document) return;

  try {
    setLoading(true);

    await axios.put(
      `${BASE_URL}api/execution/update-process-status`,
      {
        lead_id: document.lead_id,
        process_id: document.process_id,
        status: status,
        remark: remark,
      },
      { withCredentials: true }
    );

    alert("Process status updated successfully ✅");

    onUpdate();
    onClose();

  } catch (err) {
    console.error("Error updating process status:", err);

    alert("Failed to update process status");

  } finally {
    setLoading(false);
  }
};

  if (!document) return null;

  const getStatusColor = (statusValue: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'hold_by_client': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'hold_by_avcore': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[statusValue as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[10005] pt-20 p-4">
      <div className="bg-white dark:bg-boxdark w-full max-w-2xl rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-3 sticky top-0 bg-white dark:bg-boxdark z-10">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white text-sm">
              Process Status Details
            </h3>
            <p className="text-xs text-gray-500">
              {document.process_name} - {document.client_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Current Process Status */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Current Process Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(processDetails?.status || 'pending')}`}>
                {(processDetails?.status || 'pending')?.replace(/_/g, ' ')}
              </span>
            </div>
            {processDetails?.remark && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span className="font-medium">Remark:</span> {processDetails.remark}
              </div>
            )}
          </div>

          {/* Update Process Status Form */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Update Process Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="hold_by_client">Hold by Client</option>
              <option value="hold_by_avcore">Hold by Avcore</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Process Remark
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter process remark..."
            />
          </div>

          {/* Uploaded Documents Section */}
          {documents.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Uploaded Documents ({documents.length})
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      {doc.file_path.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={`${BASE_URL}uploads/${doc.file_path}`}
                          alt="document"
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <FaFileAlt className="h-6 w-6 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {doc.file_path.split('/').pop()}
                        </p>
                     
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-4 py-3 sticky bottom-0 bg-white dark:bg-boxdark">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateProcessStatus}
            disabled={loading}
            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <FaEdit className="h-3 w-3" />
                <span>Update Process Status</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManagerReport = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalDocuments, setTotalDocuments] = useState(0);
  
  // User info state - now coming from API response
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // State for modals
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingDocument, setUpdatingDocument] = useState<Document | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  
  // Refs
  const employeeDropdownRef = useRef<HTMLDivElement>(null);


  // Add this with other state declarations
const [updatingProcessStatus, setUpdatingProcessStatus] = useState<Document | null>(null);


// Add this with other state declarations
const [viewingProcessStatus, setViewingProcessStatus] = useState<Document | null>(null);



  // Format date and time helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    // Format time from "10:30:00" to "10:30 AM"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getProcessStatusColor = (status: string) => {
  const colors = {
    'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'hold_by_client': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'hold_by_avcore': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};


const fetchManagerDocuments = async () => {
  try {
    setLoading(true);
    
    // Fetch documents (uploads)
    const documentsResponse = await axios.get(
      `${BASE_URL}api/daily-execution/manager-processes`,
      {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
        withCredentials: true,
      }
    );

    // Fetch process statuses from my-processes endpoint
    const processStatusResponse = await axios.get(
      `${BASE_URL}api/daily-execution/my-processes`,
      {
        params: {
          page: 1,
          limit: 1000, // Get all processes to build the map
        },
        withCredentials: true,
      }
    );

    if (documentsResponse.data.success) {
      let data = documentsResponse.data.data;
      
      // Build a map of process status by lead_id and process_id
      const processStatusMap = new Map();
      if (processStatusResponse.data?.success) {
        const processes = processStatusResponse.data.data;
        processes.forEach((process: any) => {
          const key = `${process.lead_id}-${process.process_id}`;
          processStatusMap.set(key, {
            process_status: process.status || 'pending',
            process_remark: process.remark || null,
            execution_id: process.execution_id || null,
              type_id: process.type_id || null, // ✅ ADD
            start_date: process.start_date,
            end_date: process.end_date
          });
        });
      }
      
      // Merge process status into documents
      const enrichedData = data.map((doc: Document) => {
        const key = `${doc.lead_id}-${doc.process_id}`;
        const processInfo = processStatusMap.get(key);
        return {
          ...doc,
          process_status: processInfo?.process_status || 'pending',
          process_remark: processInfo?.process_remark || null,
          execution_id: processInfo?.execution_id || null,
          process_start_date: processInfo?.start_date || null,
          process_end_date: processInfo?.end_date || null ,
          type_id: processInfo?.type_id || null, 
        };
      });
      
      setDocuments(enrichedData);
      setFilteredDocuments(enrichedData);
      setTotalDocuments(documentsResponse.data.pagination?.total || enrichedData.length);
      
      if (documentsResponse.data.user) {
        setUserInfo(documentsResponse.data.user);
      }
    }
  } catch (error) {
    console.error('Error fetching manager documents:', error);
  } finally {
    setLoading(false);
  }
};


  // Handle delete document
  const handleDeleteDocument = async () => {
    if (!deletingDocument) return;

    try {
      setIsDeleting(true);
      const documentId = deletingDocument.document_id || deletingDocument.id;
      
      await axios.delete(
        `${BASE_URL}api/daily-execution/document/${documentId}`,
        { withCredentials: true }
      );

      alert("Document deleted successfully ✅");
      
      // Refresh the document list
      await fetchManagerDocuments();
      setDeletingDocument(null);
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchManagerDocuments();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedEmployee, documents]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
        setShowEmployeeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const applyFilters = () => {
    let filtered = [...documents];

    // Search filter - client name, city, process
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.client_name?.toLowerCase().includes(lowerSearch) ||
        doc.city?.toLowerCase().includes(lowerSearch) ||
        doc.process_name?.toLowerCase().includes(lowerSearch)
      );
    }

    // Employee filter - only for admin
    if (selectedEmployee && isAdmin) {
      filtered = filtered.filter(doc => doc.updated_by_name === selectedEmployee);
    }

    setFilteredDocuments(filtered);
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    
    const colors = {
      'approved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'needs_revision': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEmployee('');
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const totalPages = Math.ceil(totalDocuments / itemsPerPage);
  const showingStart = totalDocuments === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalDocuments);

  // Check if user is admin
const isAdminOrProjectManager = userInfo?.role === 'admin' || userInfo?.role === 'project_manager';

const isAdmin = userInfo?.role === 'admin';


  // Get unique employees for filter (only for admin)
  const uniqueEmployees = isAdmin 
    ? Array.from(new Set(documents.map(doc => doc.updated_by_name).filter(Boolean)))
    : [];

  return (
    <div className="p-4">
      {/* Header with Filters */}
      <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-boxdark/95 backdrop-blur-sm shadow-lg border-b border-gray-200/80 dark:border-gray-800 mb-4">  
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* User Info Badge */}
              {userInfo && (
                <>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30">
  <FaClock className="w-3 h-3 mr-1" />
  {totalDocuments} {(isAdmin || userInfo?.role === 'project_manager') ? 'Daily Execution Updates' : 'Daily Execution Updates'}
</span>
                  
                 
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
             {/* Employee Dropdown Filter - Only for Admin or Project Manager */}
{(isAdmin || userInfo?.role === 'project_manager') && (
  <div className="w-full sm:w-48 relative" ref={employeeDropdownRef}>
    <button
      onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
      className="w-full flex items-center justify-between px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <span className="flex items-center gap-2">
        <FaUser className="h-3 w-3 text-gray-400" />
        <span className="truncate">{selectedEmployee || 'All Employees'}</span>
      </span>
      <FaChevronDown className={`h-3 w-3 transition-transform ${showEmployeeDropdown ? 'rotate-180' : ''}`} />
    </button>

    {showEmployeeDropdown && (
      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto text-xs">
        <div
          onClick={() => {
            setSelectedEmployee('');
            setShowEmployeeDropdown(false);
          }}
          className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          All Employees
        </div>
        {uniqueEmployees.map((empName) => (
          <div
            key={empName}
            onClick={() => {
              setSelectedEmployee(empName);
              setShowEmployeeDropdown(false);
            }}
            className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            {empName}
          </div>
        ))}
      </div>
    )}
  </div>
)}

              {/* Search Input */}
              <div className="w-full sm:w-64">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-3 w-3 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder={isAdmin ? "Search by Client, City, Process..." : "Search your documents by Client, City, Process..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Reset Filter Button */}
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <FaTimes className="h-3 w-3" />
                Reset
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-boxdark shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <tr>
                  <th className="py-2 px-3 text-left whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Date
                    </span>
                  </th>

                  <th className="py-2 px-3 text-left whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Client Name
                    </span>
                  </th>

                  <th className="py-2 px-3 text-left whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      City
                    </span>
                  </th> 

              
                  <th className="py-2 px-3 text-left whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Process
                    </span>
                  </th>

                  <th className="py-2 px-3 text-left whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Remark
                    </span>
                  </th>

                  <th className="py-2 px-3 text-left whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Updated By
                    </span>
                  </th>

                  <th className="py-2 px-3 text-left whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Manager Remark
                    </span>
                  </th>

                  <th className="py-2 px-3 text-center whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Manager Status
                    </span>
                  </th>

                  <th className="py-2 px-3 text-left whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Image
                    </span>
                  </th>
    {/* New Schedule Column with Date and Time */}
                  <th className="py-2 px-3 text-left whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Daily Work
                    </span>
                  </th>

                  <th className="py-2 px-3 text-center whitespace-nowrap">
  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
    Process Status
  </span>
</th>



                  {/* Action Column - Only for Admin or Project Manager */}
{(isAdmin || userInfo?.role === 'project_manager') && (
  <th className="py-2 px-3 text-center whitespace-nowrap">
    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
      Actions
    </span>
  </th>
)}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 12 : 11} className="px-6 py-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <FaFileAlt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No documents found</p>
                        {!isAdmin && (
                          <p className="text-xs mt-2">You haven't uploaded any documents yet.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((document, index) => (
                    <tr 
                      key={document.document_id || document.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          {formatDateOnly(document.document_created_at)}
                        </div>
                      </td>

                      {/* Client Name */}
                      <td className="py-2 px-3">
                        <div className="text-xs font-medium text-gray-900 dark:text-white">
                          {document.client_name}
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-2 px-3">
                        <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                          <span className="truncate max-w-[80px]">{document.city || '-'}</span>
                        </div>
                      </td>

               
                      {/* Process */}
                      <td className="py-2 px-3">
                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">
                          {document.process_name}
                        </div>
                      </td>

                      {/* Remark */}
                      <td className="py-2 px-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                          {document.remark || '-'}
                        </div>
                      </td>

                      {/* Updated By - Show with role for admin */}
                      <td className="py-2 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {document.updated_by_name || '-'}
                          </span>
                          {isAdmin && document.updated_by && (
                            <span className="text-[9px] text-gray-500 dark:text-gray-400">
                              ({document.updated_by})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Manager Remark */}
                      <td className="py-2 px-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                          {document.manager_remark || 'No Remark'}
                        </div>
                      </td>

                      {/* Manager Status */}
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${getStatusColor(document.manager_status)}`}>
                          {document.manager_status || 'pending'}
                        </span>
                      </td>

                      {/* Image */}
                      <td className="py-2 px-3">
                        <SingleImage 
                          document={document}
                          allDocuments={filteredDocuments}
                          index={index}
                        />
                      </td>

                             {/* Schedule with Date and Time */}
                      <td className="py-2 px-3">
                        <div className="flex flex-col space-y-1">
                          {document.start_date && (
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                              <FaCalendarAlt className="h-3 w-3 mr-1 text-gray-400" />
                              <span>{formatDate(document.start_date)}</span>
                            </div>
                          )}
                          {(document.start_time || document.end_time) && (
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                              <FaClock className="h-3 w-3 mr-1 text-gray-400" />
                              <span>
                                {document.start_time && formatTime(document.start_time)}
                                {document.start_time && document.end_time && ' - '}
                                {document.end_time && formatTime(document.end_time)}
                              </span>
                            </div>
                          )}
                          {!document.start_date && !document.start_time && !document.end_time && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>

{/* Process Status */}
<td className="py-2 px-3 text-center">
  <div className="flex items-center justify-center gap-2">
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${getProcessStatusColor(document.process_status || 'pending')}`}>
      {(document.process_status || 'pending')?.replace(/_/g, ' ')}
    </span>
    {(isAdmin || userInfo?.role === 'project_manager') && (
      <button
        onClick={() => setViewingProcessStatus(document)}
        className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded transition-all"
        title="View/Update Process Status"
      >
        <FaEdit className="h-3 w-3" />
      </button>
    )}
  </div>
</td>



                     {/* Action Buttons - Only for Admin or Project Manager */}
{(isAdmin || userInfo?.role === 'project_manager') && (
  <td className="py-2 px-3">
    <div className="flex items-center justify-center gap-1.5">
      {/* Update Process Status Button */}
      <button
        onClick={() => setUpdatingProcessStatus(document)}
        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all duration-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
        title="Update Manager Status & Remark"
      >
        <FaEdit className="h-3.5 w-3.5" />
      </button>

      {/* Upload Document Button - enabled only when manager_status is pending */}
      <button
        onClick={() => setUpdatingDocument(document)}
        disabled={document.manager_status !== 'pending' && document.manager_status !== null || (document.manager_status !== null && document.manager_status !== 'pending')}
        className={`p-1.5 rounded-lg transition-all duration-200 ${
          !document.manager_status || document.manager_status === 'pending'
            ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 cursor-pointer'
            : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed opacity-50'
        }`}
        title={
          !document.manager_status || document.manager_status === 'pending'
            ? 'Upload Document'
            : `Upload disabled (Status: ${document.manager_status})`
        }
      >
        <FaFileUpload className="h-3.5 w-3.5" />
      </button>
    </div>
  </td>
)}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalDocuments}
              itemsPerPage={itemsPerPage}
              showingStart={showingStart}
              showingEnd={showingEnd}
            />
          )}
        </>
      )}

     {/* Modals - Accessible by admin or project manager */}
{(isAdmin || userInfo?.role === 'project_manager') && editingDocument && (
  <ManagerStatusEditModal
    document={editingDocument}
    onClose={() => setEditingDocument(null)}
    onUpdate={fetchManagerDocuments}
  />
)}

{(isAdmin || userInfo?.role === 'project_manager') && deletingDocument && (
  <DeleteConfirmationModal
    document={deletingDocument}
    onClose={() => setDeletingDocument(null)}
    onConfirm={handleDeleteDocument}
    isDeleting={isDeleting}
  />
)}

{(isAdmin || userInfo?.role === 'project_manager') && updatingDocument && (
  <UpdateImageModal
    document={updatingDocument}
    onClose={() => setUpdatingDocument(null)}
    onUpdate={fetchManagerDocuments}
  />
)}

{(isAdmin || userInfo?.role === 'project_manager') && updatingProcessStatus && (
  <ManagerProcessStatusUpdateModal
    document={updatingProcessStatus}
    onClose={() => setUpdatingProcessStatus(null)}
    onUpdate={fetchManagerDocuments}
  />
)} 

{/* Process Status Modal */}
{viewingProcessStatus && (
  <ProcessStatusModal
    document={viewingProcessStatus}
    onClose={() => setViewingProcessStatus(null)}
    onUpdate={fetchManagerDocuments}
  />
)}



    </div>
  );
};


export default ManagerReport;