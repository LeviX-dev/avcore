import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, User, MessageSquare, Phone, Mail, MapPin, FileText, CalendarCheck } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faDownload } from '@fortawesome/free-solid-svg-icons';


interface ReassignmentRemark {
  remark: string;
  created_by_user: number;
  created_at: string;
  name: string;
  role: string;
  assignedTo?: string;
  leadStage?: string;
  reassignment_date?: string;
}

interface Lead {
  master_id: number;
  name: string;
  number: string;
  email: string;
  address: string;
  city: string;
  cat_id: number;
  status: string;
  lead_status: string;
  lead_stage: string;
  created_at: string;
  quick_remark: string | null;
  detailed_remark: string | null;
  followup_date: string | null;
  assign_date: string;
  assigned_to: string;
  assigned_user_name: string;
  reassignment_id: number | null;
  reassignment_date: string | null;
  reassigned_to: string | null;
  telecaller_name?: string;
  document_count?: number;
  area?: string;
  cat_name?: string;
  reference_name?: string;
  room_length?: number | null;
  room_width?: number | null;
  room_height?: number | null;
  location_link?: string | null;
  p_type?: string | null;
  budget_range?: string | null;
  current_stage?: string | null;
  room_ready?: string | null;
  time_to_complete?: string | null;
  site_visit_date?: string | null;
  demo_date?: string | null;
  ar_number?: string | null;
  ca_number?: string | null;
  e_number?: string | null;
  sm_number?: string | null;
  pop_number?: string | null;
  other_number?: string | null;
  reassignment_remarks?: ReassignmentRemark[];
}

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  isTodayPage?: boolean;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, isTodayPage = false }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFollowupStatusColor = (followupDate: string | null) => {
    if (!followupDate) return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    
    const today = new Date();
    const followup = new Date(followupDate);
    const diffTime = followup.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
    if (diffDays === 0) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    if (diffDays <= 3) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
    return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
  };

  const getFollowupStatusText = (followupDate: string | null) => {
    if (!followupDate) return 'No Follow-up';
    
    const today = new Date();
    const followup = new Date(followupDate);
    const diffTime = followup.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Missed';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const isFollowupToday = (followupDate: string | null) => {
    if (!followupDate) return false;
    const today = new Date();
    const followup = new Date(followupDate);
    return followup.toDateString() === today.toDateString();
  };

  const isFollowupMissed = (followupDate: string | null) => {
    if (!followupDate) return false;
    return new Date(followupDate) < new Date();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              {isTodayPage ? (
                <CalendarCheck className="w-5 h-5 text-blue-500" />
              ) : (
                <Calendar className="w-5 h-5 text-blue-500" />
              )}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isTodayPage ? "Today's Assignment Details" : "Upcoming Lead Details"}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Master ID: {lead.master_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Follow-up Status Banner (for upcoming leads) */}
            {!isTodayPage && (
              <div className={`p-4 rounded-lg ${getFollowupStatusColor(lead.followup_date)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Follow-up Status</h3>
                    <p className="text-lg font-bold">{getFollowupStatusText(lead.followup_date)}</p>
                    {lead.followup_date && (
                      <p className="text-sm opacity-80">
                        Scheduled for: {formatDate(lead.followup_date)}
                      </p>
                    )}
                  </div>
                  <Clock className="w-8 h-8" />
                </div>
              </div>
            )}

            {/* Today's Assignment Banner (for today's page) */}
            {isTodayPage && (
              <div className={`rounded-lg p-4 border ${
                isFollowupMissed(lead.followup_date) 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : isFollowupToday(lead.followup_date)
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" />
                  Today's Assignment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Stage</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      lead.lead_stage === 'Closed Deal' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : lead.lead_stage === 'Drop'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {lead.lead_stage || 'Not Set'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Follow-up Date</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${
                        isFollowupMissed(lead.followup_date) 
                          ? 'text-red-600 dark:text-red-400'
                          : isFollowupToday(lead.followup_date)
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {formatDate(lead.followup_date)}
                      </p>
                      {isFollowupMissed(lead.followup_date) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Missed
                        </span>
                      ) : isFollowupToday(lead.followup_date) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Today
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Lead Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.city}</p>
                </div>
                {lead.address && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Info */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Assignment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {lead.reassigned_to || lead.assigned_user_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assignment Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(lead.assign_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lead Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    lead.lead_status === 'Active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {lead.lead_status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current Stage</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    lead.lead_stage === 'Drop' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : lead.lead_stage === 'Closed Deal'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {lead.lead_stage}
                  </span>
                </div>
                {lead.reassignment_date && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reassignment Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(lead.reassignment_date)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Remarks & History Section */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Remarks & History
              </h3>
              
              {/* Current Detailed Remark */}
              {lead.detailed_remark && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Current Remark</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Latest
                    </span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {lead.detailed_remark}
                    </p>
                  </div>
                </div>
              )}

              {/* Reassignment History */}
              {lead.reassignment_remarks && 
                Array.isArray(lead.reassignment_remarks) && 
                lead.reassignment_remarks.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-yellow-500" />
                      Reassignments ({lead.reassignment_remarks.length})
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Showing all {lead.reassignment_remarks.length} records
                    </span>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lead.reassignment_remarks.map((remarkObj, index) => (
                        <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm mb-1">
                                <span className="text-blue-600 truncate block">{remarkObj.name || 'Unknown'}</span>
                                <div className="flex items-center mt-1">
                                  <span className="text-blue-500 text-xs">From:</span>
                                  <span className="mx-1 text-gray-400">→</span>
                                  <span className="text-green-600 text-sm font-medium truncate">{remarkObj.assignedTo || 'Unknown'}</span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mb-1 flex flex-wrap gap-1">
                                {remarkObj.created_at && (
                                  <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                    📅 {remarkObj.created_at}
                                  </span>
                                )}
                                {remarkObj.leadStage && (
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    remarkObj.leadStage === 'Cold Lead' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' :
                                    remarkObj.leadStage === 'Hot Lead' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
                                    remarkObj.leadStage === 'Warm Lead' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300' :
                                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                  }`}>
                                    {remarkObj.leadStage}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-2 flex-shrink-0">
                              #{index + 1}
                            </span>
                          </div>
                          
                          {remarkObj.remark && (
                            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 pt-2 border-t dark:border-gray-700">
                              <div className="flex items-start">
                                <span className="text-gray-400 mr-2 mt-0.5">💬</span>
                                <div className="flex-1">
                                  <p className="whitespace-pre-line break-words">{remarkObj.remark}</p>
                                  {remarkObj.reassignment_date && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      Reassigned: {remarkObj.reassignment_date}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LeadDetailModal;