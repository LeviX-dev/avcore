import React, { useEffect, useState } from 'react';
import { FaPlus, FaEye, FaHistory, FaSearch, FaFilter, FaFile, FaInfoCircle, FaImage, FaVideo, FaFileAlt, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaUsers, FaComment } from 'react-icons/fa';
import { MdPerson, MdPhone, MdCategory } from 'react-icons/md';
import { HiDocumentText } from 'react-icons/hi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config';

interface Document {
  doc_id: number;
  document_name: string;
  document_path: string;
  document_type: string;
  file_extension: string;
  remark?: string;
  uploaded_at?: string;
  url?: string;
}

interface ReassignmentRemark {
  remark: string;
  assignedTo: string;
  leadStage: string;
  created_by_user: number;
  created_at: string;
  reassignment_date: string;
  name: string;
  role: string;
}

interface ClientDetails {
  master_id: number;
  name: string;
  number: string;
  email?: string;
  address?: string;
  city?: string;
  area?: string;
  cat_name?: string;
  category_other?: string;
  reference_name?: string;
  reference_other?: string;
  assigned_to?: string;
  lead_stage?: string;
  stage?: string;
  latest_leadStage?: string;
  quick_remark?: string;
  detailed_remark?: string;
  assign_date?: string;
  followup_date?: string;
  site_visit_date?: string;
  demo_date?: string;
  budget_range?: string;
  p_type?: string;
  room_length?: string;
  room_width?: string;
  room_height?: string;
  room_ready?: string;
  time_to_complete?: string;
  document_location_link?: string;
  ar_number?: string;
  ca_number?: string;
  e_number?: string;
  sm_number?: string;
  pop_number?: string;
  other_number?: string;
  architect_name?: string;
  created_flag?: boolean;
  reassignment_remarks?: ReassignmentRemark[];
  status_percentage?: number;
  is_drop_stage?: boolean;
  previous_stage?: string;
}

interface QuotationLead {
  master_id: number;
  name: string;
  number: string;
  city?: string;
  lead_stage?: string;
  assigned_to?: string;
  cat_name?: string;
  created_flag?: boolean;
  latest_assignedTo?: string;
  [key: string]: any;
}

const QuotationPending = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<QuotationLead[]>([]);
  const [allClientDetails, setAllClientDetails] = useState<Map<number, ClientDetails>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('active');

  // ── NEW: stage filter state ──────────────────────────────────────────────────
  const [stageFilter, setStageFilter] = useState<'all' | 'created' | 'pending'>('all');

  // Modal states
  const [selectedClient, setSelectedClient] = useState<ClientDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [documentsData, setDocumentsData] = useState({
    images: [] as Document[],
    documents: [] as Document[],
    videos: [] as Document[],
  });
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsFetched, setDocsFetched] = useState(false);
  const [openRemark, setOpenRemark] = useState<string | null>(null);

  const EMPTY_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSI3NSIgeT0iNzUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
  const EMPTY_POSTER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMjUiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSIyMDAiIHk9IjExMiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+VmlkZW88L3RleHQ+PC9zdmc+';

  useEffect(() => {
    fetchQuotationPending();
  }, []);

  // Reset modal state when client changes
  useEffect(() => {
    if (selectedClient) {
      setActiveTab('details');
      setDocsFetched(false);
      setDocumentsData({ images: [], documents: [], videos: [] });
    }
  }, [selectedClient?.master_id]);

  const fetchQuotationPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}api/quotation-pending`);
      setData(res.data);
      await fetchAllMasterData();
    } catch (error) {
      console.error('Error fetching quotation pending leads', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotationClosed = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}api/getQuotationClosedLeads`);
      setData(res.data);
      await fetchAllMasterData();
    } catch (error) {
      console.error('Error fetching quotation closed leads', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMasterData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/master-data`, {
        withCredentials: true,
      });

      const STAGE_PERCENTAGE_MAP: Record<string, number> = {
        'Fresh Lead': 0,
        'Cold Lead': 10,
        'On Hold': 20,
        'Positive Lead': 30,
        'Pre Site Visit': 40,
        Demo: 50,
        'Quotation Pending': 60,
        'Quotation Follow-up': 70,
        'Post Site Visit': 80,
        'Projection List': 90,
        Drop: -1,
        'Closed Deal': 100,
      };

      const lastNonDropStages: Record<number, string> = {};

      response.data.forEach((item: any) => {
        const clientId = item.master_id;
        const currentStage = item.stage || item.lead_stage || item.current_stage;
        const cleanStage = currentStage ? currentStage.trim() : '';
        if (cleanStage && cleanStage !== 'Drop') {
          lastNonDropStages[clientId] = cleanStage;
        }
      });

      const clientMap = new Map();

      response.data.forEach((item: any) => {
        const parseValue = (value: any): string => {
          if (value === 'Not Available' || value === null || value === undefined || value === 'null') {
            return '';
          }
          return String(value);
        };

        const currentStage = parseValue(item.stage || item.lead_stage || item.current_stage);
        const cleanStage = currentStage ? currentStage.trim() : '';

        let previousStage = lastNonDropStages[item.master_id] || '';

        if (cleanStage === 'Drop' && !previousStage) {
          if (item.quotation_date || item.site_visit_date) {
            previousStage = 'Quotation Pending';
          } else if (item.demo_date) {
            previousStage = 'Demo';
          } else {
            previousStage = 'Positive Lead';
          }
        }

        const stageForPercentage = cleanStage === 'Drop' ? previousStage : cleanStage;
        const status_percentage = stageForPercentage ? STAGE_PERCENTAGE_MAP[stageForPercentage] || 0 : 0;

        let displayCity = '';
        const areaName = parseValue(item.area_name);
        const cityName = parseValue(item.city);

        if (areaName && areaName !== '') {
          displayCity = areaName;
        } else if (cityName && cityName !== '') {
          displayCity = cityName;
        }

        clientMap.set(item.master_id, {
          master_id: item.master_id,
          name: parseValue(item.name),
          number: parseValue(item.number),
          email: parseValue(item.email),
          address: parseValue(item.address),
          city: displayCity,
          area: parseValue(item.area_name),
          cat_name: parseValue(item.cat_name),
          category_other: item.category_other || '',
          reference_name: parseValue(item.reference_name),
          reference_other: item.reference_other || '',
          assigned_to: parseValue(item.assigned_to),
          lead_stage: parseValue(item.lead_stage),
          stage: cleanStage,
          latest_leadStage: parseValue(item.latest_leadStage),
          quick_remark: parseValue(item.quick_remark),
          detailed_remark: parseValue(item.detailed_remark),
          assign_date: parseValue(item.assign_date),
          followup_date: parseValue(item.followup_date),
          site_visit_date: parseValue(item.site_visit_date),
          demo_date: parseValue(item.demo_date),
          budget_range: parseValue(item.budget_range),
          p_type: parseValue(item.p_type),
          room_length: parseValue(item.room_length),
          room_width: parseValue(item.room_width),
          room_height: parseValue(item.room_height),
          room_ready: parseValue(item.room_ready),
          time_to_complete: parseValue(item.time_to_complete),
          document_location_link: parseValue(item.document_location_link),
          ar_number: parseValue(item.ar_number),
          ca_number: parseValue(item.ca_number),
          e_number: parseValue(item.e_number),
          sm_number: parseValue(item.sm_number),
          pop_number: parseValue(item.pop_number),
          other_number: parseValue(item.other_number),
          architect_name: parseValue(item.architect_name),
          reassignment_remarks: Array.isArray(item.reassignment_remarks)
            ? item.reassignment_remarks.map((remark: any) => {
                if (typeof remark === 'string') {
                  return { remark, assignedTo: '', leadStage: '', created_by_user: 0, created_at: '', reassignment_date: '', name: '', role: '' };
                } else if (remark && typeof remark === 'object') {
                  return {
                    remark: remark.remark || '',
                    assignedTo: remark.assignedTo || '',
                    leadStage: remark.leadStage || '',
                    reassignment_date: remark.reassignment_date || '',
                    created_by_user: remark.created_by_user || 0,
                    created_at: remark.created_at || '',
                    name: remark.name || '',
                    role: remark.role || '',
                  };
                }
                return { remark: '', assignedTo: '', leadStage: '', created_by_user: 0, created_at: '', reassignment_date: '', name: '', role: '' };
              })
            : [],
          previous_stage: previousStage,
          status_percentage: status_percentage,
          is_drop_stage: cleanStage === 'Drop',
        });
      });

      setAllClientDetails(clientMap);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const fetchDocuments = async (masterId: number) => {
    if (docsFetched) return;

    setLoadingDocs(true);
    try {
      const response = await axios.get(
        `${BASE_URL}api/documents/${masterId}`,
        { withCredentials: true }
      );

      const images: Document[] = [];
      const documents: Document[] = [];
      const videos: Document[] = [];

      response.data.documents.forEach((doc: any) => {
        let filePath = doc.document_path
          .replace(/^server\//, '')
          .replace(/\\/g, '/');

        if (!filePath.startsWith('uploads/')) filePath = `uploads/${filePath}`;

        const fullUrl = `${BASE_URL}${filePath}`;

        const obj: Document = {
          ...doc,
          url: fullUrl,
          document_name: doc.document_name || `Document ${doc.doc_id}`,
          file_extension: doc.file_extension || '',
        };

        if (doc.document_type === 'image') images.push(obj);
        else if (doc.document_type === 'video') videos.push(obj);
        else documents.push(obj);
      });

      setDocumentsData({ images, documents, videos });
      setDocsFetched(true);
    } catch (e) {
      console.error(e);
      setDocumentsData({ images: [], documents: [], videos: [] });
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleClientNameClick = async (client: QuotationLead) => {
    const cachedDetails = allClientDetails.get(client.master_id);

    if (cachedDetails) {
      setSelectedClient(cachedDetails);
      setShowDetailsModal(true);
    } else {
      try {
        const response = await axios.get(`${BASE_URL}api/master-data/${client.master_id}`, {
          withCredentials: true,
        });
        setSelectedClient(response.data);
        setShowDetailsModal(true);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setSelectedClient({
          master_id: client.master_id,
          name: client.name,
          number: client.number,
          city: client.city,
          cat_name: client.cat_name,
          assigned_to: client.latest_assignedTo || client.assigned_to,
          lead_stage: client.lead_stage,
        });
        setShowDetailsModal(true);
      }
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'documents' && selectedClient) {
      fetchDocuments(selectedClient.master_id);
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '—';
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const formatValue = (value: any): string => {
    if (!value || value === '' || value === 'Not Available' || value === 'N/A' || value === 'null' || value === null || value === undefined) {
      return 'N/A';
    }
    return String(value);
  };

  const hasField = (value: any): boolean => {
    return value && value !== '' && value !== 'Not Available' && value !== 'N/A' && value !== 'null' && value !== null && value !== undefined;
  };

  const getFileIcon = (extension: string) => {
    const ext = extension?.toLowerCase() || '';
    if (ext.includes('pdf')) return '📕';
    if (ext.includes('doc')) return '📄';
    if (ext.includes('xls')) return '📊';
    if (ext.includes('ppt')) return '📽️';
    if (ext.includes('txt')) return '📝';
    return '📎';
  };

  const ProgressStatus: React.FC<{
    stage: string;
    status_percentage?: number;
    is_drop_stage?: boolean;
    previous_stage?: string;
  }> = ({ stage, status_percentage = 0, is_drop_stage = false, previous_stage = '' }) => {
    const cleanStage = stage ? stage.trim() : '';
    const percentage = status_percentage;

    const getProgressColor = (stage: string) => {
      const stageLower = stage.toLowerCase().trim();
      if (stageLower.includes('fresh')) return 'bg-[#FFFFFF] border border-gray-300';
      if (stageLower.includes('cold')) return 'bg-[#A9A9A9]';
      if (stageLower.includes('on hold')) return 'bg-[#FDFD96]';
      if (stageLower.includes('positive')) return 'bg-[#ADD8E6]';
      if (stageLower.includes('pre site')) return 'bg-[#E0B0FF]';
      if (stageLower.includes('past site') || stageLower.includes('post site')) return 'bg-[#593E67]';
      if (stageLower.includes('demo')) return 'bg-[#FFB6C1]';
      if (stageLower.includes('quote pending')) return 'bg-[#FFA500]';
      if (stageLower.includes('quote followup')) return 'bg-[#A52A2A]';
      if (stageLower.includes('projection')) return 'bg-[#90EE90]';
      if (stageLower.includes('drop')) return 'bg-[#FF0000]';
      if (stageLower.includes('closed')) return 'bg-[#006400]';
      return 'bg-[#A9A9A9]';
    };

    return (
      <div className="flex flex-col items-center w-16">
        <div className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{percentage}%</div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-0.5">
          <div
            className={`h-full rounded-full ${getProgressColor(cleanStage)} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="w-full text-center">
          <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">
            {is_drop_stage ? previous_stage || cleanStage : cleanStage || 'N/A'}
          </div>
          {is_drop_stage && <div className="text-[8px] text-red-500 font-medium mt-0.5">DROPPED</div>}
        </div>
      </div>
    );
  };

  // ── Search filter (unchanged) ────────────────────────────────────────────────
  const filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.number?.includes(searchTerm) ||
      item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cat_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── NEW: stage filter applied on top of search ───────────────────────────────
  const displayData = filteredData.filter((item) => {
    if (stageFilter === 'created') return item.created_flag;
    if (stageFilter === 'pending') return !item.created_flag;
    return true;
  });

  // ── NEW: find the latest created quotation (highest master_id with created_flag) ──
const latestCreatedLead = data
  .filter((item) => item.created_flag && item.quotation_created_date)
  .sort(
    (a, b) =>
      new Date(b.quotation_created_date).getTime() -
      new Date(a.quotation_created_date).getTime()
  )[0];

const latestCreatedId = latestCreatedLead?.master_id; 


  const renderDetailsModal = () => {
    if (!selectedClient) return null;

    const hasContactNumbers = hasField(selectedClient.ar_number) ||
      hasField(selectedClient.ca_number) ||
      hasField(selectedClient.e_number) ||
      hasField(selectedClient.sm_number) ||
      hasField(selectedClient.pop_number) ||
      hasField(selectedClient.other_number) ||
      hasField(selectedClient.architect_name) ||
      hasField(selectedClient.number);

    const hasLeadInfo = hasField(selectedClient.cat_name) ||
      hasField(selectedClient.category_other) ||
      hasField(selectedClient.reference_name) ||
      hasField(selectedClient.reference_other);

    const hasProjectDetails = hasField(selectedClient.room_length) ||
      hasField(selectedClient.room_width) ||
      hasField(selectedClient.room_height) ||
      hasField(selectedClient.p_type) ||
      hasField(selectedClient.budget_range) ||
      hasField(selectedClient.time_to_complete) ||
      hasField(selectedClient.room_ready);

    const hasDates = hasField(selectedClient.assign_date) ||
      hasField(selectedClient.followup_date) ||
      hasField(selectedClient.site_visit_date) ||
      hasField(selectedClient.demo_date);

    const hasLinks = hasField(selectedClient.document_location_link);
    const hasRemarks = hasField(selectedClient.quick_remark) || hasField(selectedClient.detailed_remark);
    const hasReassignmentHistory = selectedClient.reassignment_remarks && selectedClient.reassignment_remarks.length > 0;

    return (
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {selectedClient.name?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black dark:text-white truncate max-w-xs">
                      {selectedClient.name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1 flex-wrap">
                      {hasField(selectedClient.master_id) && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          ID: {selectedClient.master_id}
                        </span>
                      )}
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Created: {selectedClient.assign_date || 'N/A'}
                      </span>
                      <div className="ml-2">
                        <ProgressStatus
                          stage={selectedClient.stage || selectedClient.lead_stage || ''}
                          status_percentage={selectedClient.status_percentage}
                          is_drop_stage={selectedClient.is_drop_stage}
                          previous_stage={selectedClient.previous_stage}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedClient(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="mt-4 flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleTabChange('details')}
                className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'details'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <FaInfoCircle className="h-4 w-4" />
                Details
              </button>
              <button
                onClick={() => handleTabChange('documents')}
                className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'documents'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <FaFile className="h-4 w-4" />
                Documents
                {documentsData.images.length + documentsData.documents.length + documentsData.videos.length > 0 && (
                  <span className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {documentsData.images.length + documentsData.documents.length + documentsData.videos.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
            {activeTab === 'details' ? (
              <div className="p-4 space-y-4">
                {/* Contact Info */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaUser className="h-4 w-4 text-blue-500" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {hasField(selectedClient.name) && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedClient.name)}
                        </div>
                      </div>
                    )}
                    {hasField(selectedClient.number) && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedClient.number)}
                        </div>
                      </div>
                    )}
                    {hasField(selectedClient.email) && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedClient.email)}
                        </div>
                      </div>
                    )}
                    {hasField(selectedClient.address) && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedClient.address)}
                        </div>
                      </div>
                    )}
                    {hasField(selectedClient.city) && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">City</div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedClient.city)}
                        </div>
                      </div>
                    )}
                    {hasField(selectedClient.area) && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Area</div>
                        <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded truncate">
                          {formatValue(selectedClient.area)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Contact Numbers */}
                {hasContactNumbers && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaUsers className="h-4 w-4 text-indigo-500" />
                      Additional Contacts
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      {hasField(selectedClient.architect_name) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Architect</div>
                          <div className="font-medium text-black dark:text-white truncate">
                            {formatValue(selectedClient.architect_name)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.ar_number) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Architect Number</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.ar_number)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.ca_number) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CA Number</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.ca_number)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.e_number) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Electrician</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.e_number)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.sm_number) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Site Manager</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.sm_number)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.pop_number) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">POP Number</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.pop_number)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lead Details */}
                {hasLeadInfo && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaInfoCircle className="h-4 w-4 text-blue-500" />
                      Lead Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hasField(selectedClient.cat_name) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Category</div>
                          <div className="font-medium text-black dark:text-white truncate">
                            {formatValue(selectedClient.cat_name)}
                            {hasField(selectedClient.category_other) && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                                ({selectedClient.category_other})
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.reference_name) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Reference</div>
                          <div className="font-medium text-black dark:text-white truncate">
                            {formatValue(selectedClient.reference_name)}
                            {hasField(selectedClient.reference_other) && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                                ({selectedClient.reference_other})
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dates */}
                {hasDates && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaCalendarAlt className="h-4 w-4 text-emerald-500" />
                      Dates
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {hasField(selectedClient.assign_date) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Entry Date</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatDate(selectedClient.assign_date)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.followup_date) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Follow-up Date</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatDate(selectedClient.followup_date)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.site_visit_date) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Site Visit</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.site_visit_date)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.demo_date) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Demo Date</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.demo_date)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Project Details */}
                {hasProjectDetails && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaFile className="h-4 w-4 text-amber-500" />
                      Project Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {(hasField(selectedClient.room_length) || hasField(selectedClient.room_width)) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Room Size</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.room_length)} × {formatValue(selectedClient.room_width)}
                            {hasField(selectedClient.room_height) && ` × ${formatValue(selectedClient.room_height)}`}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.p_type) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
                          <div className="font-medium text-black dark:text-white truncate">
                            {formatValue(selectedClient.p_type)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.budget_range) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Budget Range</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.budget_range)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.time_to_complete) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Time to Complete</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.time_to_complete)}
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.room_ready) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Room Ready</div>
                          <div className="font-medium text-black dark:text-white">
                            {formatValue(selectedClient.room_ready)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Links */}
                {hasLinks && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaMapMarkerAlt className="h-4 w-4 text-blue-500" />
                      Links
                    </h3>
                    <div className="space-y-2">
                      {hasField(selectedClient.document_location_link) && (
                        <a
                          href={selectedClient.document_location_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors border border-blue-200 dark:border-blue-700"
                        >
                          <FaFile className="h-3 w-3" />
                          Document Location Link
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Remarks Section */}
                {hasRemarks && (
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaComment className="h-4 w-4 text-gray-500" />
                      Remarks
                    </h3>
                    <div className="text-sm">
                      {hasField(selectedClient.quick_remark) && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quick Remark</div>
                          <div className="font-medium text-black dark:text-white bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              selectedClient.quick_remark === 'Interested'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : selectedClient.quick_remark === 'Not Interested'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : selectedClient.quick_remark === 'Not Reachable'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                              {formatValue(selectedClient.quick_remark)}
                            </span>
                          </div>
                        </div>
                      )}
                      {hasField(selectedClient.detailed_remark) && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Detailed Remark</div>
                          <div className="text-black dark:text-white bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-line">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">{formatValue(selectedClient.detailed_remark)}</div>
                              {selectedClient.detailed_remark && selectedClient.detailed_remark.length > 100 && (
                                <button
                                  onClick={() => setOpenRemark(selectedClient.detailed_remark)}
                                  className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs font-medium"
                                >
                                  View Full
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reassignment History Section */}
                {hasReassignmentHistory && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaHistory className="h-4 w-4 text-purple-500" />
                      Reassignment History ({selectedClient.reassignment_remarks?.length || 0})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedClient.reassignment_remarks?.slice().reverse().map((remark, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                            <div>
                              <span className="font-medium text-blue-600 dark:text-blue-400">
                                {remark.name || 'Unknown'}
                              </span>
                              <span className="mx-2 text-gray-400">→</span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {remark.assignedTo || 'Unknown'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {remark.created_at ? new Date(remark.created_at).toLocaleDateString() : remark.reassignment_date || 'N/A'}
                            </span>
                          </div>
                          {remark.leadStage && (
                            <div className="text-xs text-gray-500 mb-1">
                              Stage: <span className="font-medium">{remark.leadStage}</span>
                            </div>
                          )}
                          {remark.remark && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                              {remark.remark.length > 150 ? (
                                <>
                                  {remark.remark.substring(0, 150)}...
                                  <button
                                    onClick={() => setOpenRemark(remark.remark)}
                                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs font-medium"
                                  >
                                    Read More
                                  </button>
                                </>
                              ) : (
                                remark.remark
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                {loadingDocs ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading documents...</span>
                  </div>
                ) : (
                  <>
                    {/* Total Count */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Documents Summary</h3>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {documentsData.images.length + documentsData.documents.length + documentsData.videos.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700/30">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{documentsData.images.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Images</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700/30">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">{documentsData.documents.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700/30">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{documentsData.videos.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Videos</div>
                        </div>
                      </div>
                    </div>

                    {/* Images Section */}
                    {documentsData.images.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <FaImage className="h-4 w-4 text-blue-500" />
                          Images ({documentsData.images.length})
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {documentsData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image.url}
                                className="w-full h-32 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = EMPTY_IMAGE;
                                }}
                                alt={image.document_name}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <a
                                  href={image.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm mr-2"
                                >
                                  View
                                </a>
                              </div>
                              {image.remark && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg">
                                  {image.remark.length > 50 ? image.remark.substring(0, 50) + '...' : image.remark}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents Section */}
                    {documentsData.documents.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <FaFileAlt className="h-4 w-4 text-green-500" />
                          Documents ({documentsData.documents.length})
                        </h4>
                        <div className="space-y-2">
                          {documentsData.documents.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-xl">{getFileIcon(doc.file_extension)}</div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                    {doc.document_name}
                                  </div>
                                  {doc.remark && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                      {doc.remark}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {doc.uploaded_at && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                  </span>
                                )}
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                                >
                                  Open
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos Section */}
                    {documentsData.videos.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <FaVideo className="h-4 w-4 text-purple-500" />
                          Videos ({documentsData.videos.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {documentsData.videos.map((video, index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                              <div className="aspect-video bg-black">
                                <video controls className="w-full h-full" poster={EMPTY_POSTER}>
                                  <source src={video.url} type="video/mp4" />
                                </video>
                              </div>
                              <div className="p-3">
                                <div className="flex justify-between items-start">
                                  <div className="font-medium text-gray-800 dark:text-gray-200">Video {index + 1}</div>
                                  <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-colors"
                                  >
                                    Download
                                  </a>
                                </div>
                                {video.remark && (
                                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{video.remark}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Documents Message */}
                    {documentsData.images.length === 0 && documentsData.documents.length === 0 && documentsData.videos.length === 0 && (
                      <div className="text-center py-12">
                        <FaFile className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">No Documents Found</h3>
                        <p className="text-gray-500 dark:text-gray-500 mt-1">No documents have been uploaded for this client.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRemarkModal = () => {
    if (!openRemark) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[10000]">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg max-w-lg w-full mx-4 my-4 mt-16">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Full Remark</h2>
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setOpenRemark(null)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            <p className="text-gray-800 dark:text-gray-300 whitespace-pre-line">
              {openRemark}
            </p>
          </div>
          <button
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => setOpenRemark(null)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Blinking dot keyframe injected once ─────────────────────────────── */}
      <style>{`
        @keyframes blink-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.7); }
        }
        .blink-dot {
          animation: blink-dot 0.9s ease-in-out infinite;
        }
      `}</style>

      <div className="p-4 md:p-6 bg-gray-50 dark:bg-boxdark min-h-screen">
        <Breadcrumb pageName={viewMode === 'active' ? 'Quotation Pending' : 'Quotation History'} />

        {/* Top Bar with Search */}
        <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Section */}
            <div className="flex-1 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Search by name, contact, city or category..."
                />
              </div>
            </div>

            {/* Stats + Filters + History button */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Counts */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="font-bold text-gray-900 dark:text-white px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">
                  {data.length} leads
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Filtered:</span>
                <span className="font-bold text-gray-900 dark:text-white px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded">
                  {displayData.length} leads
                </span>
              </div>

              {/* ── NEW: Stage filter buttons ─────────────────────────────── */}
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setStageFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                    stageFilter === 'all'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStageFilter('created')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                    stageFilter === 'created'
                      ? 'bg-green-600 text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Quotation Created
                </button>
                <button
                  onClick={() => setStageFilter('pending')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                    stageFilter === 'pending'
                      ? 'bg-yellow-500 text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Quotation Pending
                </button>
              </div>

              {/* History toggle */}
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => {
                  if (viewMode === 'active') {
                    fetchQuotationClosed();
                    setViewMode('history');
                  } else {
                    fetchQuotationPending();
                    setViewMode('active');
                  }
                }}
              >
                <FaHistory className="text-sm" />
                <span className="font-medium">
                  {viewMode === 'active' ? 'History' : 'Back'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-boxdark-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-left">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Sr No.</span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <MdPerson className="text-gray-600 dark:text-gray-400 text-sm" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">Client Details</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <MdPhone className="text-gray-600 dark:text-gray-400 text-sm" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">Contact</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Lead Stage</span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Assigned To</span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <MdCategory className="text-gray-600 dark:text-gray-400 text-sm" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">Subject</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <HiDocumentText className="text-gray-600 dark:text-gray-400 text-sm" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Loading leads...</p>
                    </td>
                  </tr>
                ) : displayData.length > 0 ? (
                  displayData.map((row, index) => {
                    // ── NEW: is this the latest created quotation? ──────────────
                    const isLatestCreated = row.master_id === latestCreatedId;

                    return (
                      <tr
                        key={row.master_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                        // ── NEW: green background for latest created ──────────
                        style={isLatestCreated ? { backgroundColor: '#dfefda' } : {}}
                      >
                        {/* Serial Number */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg">
                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                              {index + 1}
                            </span>
                          </div>
                        </td>

                        {/* Client Details */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                              {/* ── NEW: red blinking dot for latest created ── */}
                              {isLatestCreated && (
                                <span
                                  className="blink-dot inline-block w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"
                                />
                              )}
                              <button
                                onClick={() => handleClientNameClick(row)}
                                className="font-bold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-left cursor-pointer"
                              >
                                {row.name}
                              </button>
                            </div>
                            {row.city && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block w-fit">
                                {row.city}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-white text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30">
                            {row.number || 'N/A'}
                          </div>
                        </td>

                        {/* Lead Stage */}
                        <td className="py-3 px-4">
                          {row.lead_stage === 'Closed Deal' ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border border-red-200 dark:border-red-700/30">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="font-semibold text-red-700 dark:text-red-300 text-xs">
                                Closed Deal
                              </span>
                            </div>
                          ) : row.created_flag ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border border-green-200 dark:border-green-700/30">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-semibold text-green-700 dark:text-green-300 text-xs">
                                Quotation Created
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700/30">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="font-semibold text-yellow-700 dark:text-yellow-300 text-xs">
                                Quotation Pending
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Assigned To */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-white text-sm bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800/30">
                            {row.latest_assignedTo || row.assigned_to || 'Unassigned'}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-white text-sm bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-800/30">
                            {row.cat_name || 'N/A'}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {/* ADD QUOTATION BUTTON */}
                            <button
                              className={`flex items-center justify-center p-2 rounded-lg font-medium transition-all duration-200 ${
                                row.created_flag
                                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                              }`}
                              title={row.created_flag ? 'Quotation already created' : 'Add Quotation'}
                              onClick={() =>
                                !row.created_flag &&
                                navigate(`/quotation/add/${row.master_id}`, {
                                  state: { name: row.name },
                                })
                              }
                              disabled={row.created_flag}
                            >
                              <FaPlus className="text-sm" />
                            </button>

                            {/* VIEW REVISIONS BUTTON */}
                            <button
                              className={`flex items-center justify-center p-2 rounded-lg font-medium transition-all duration-200 ${
                                row.created_flag
                                  ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-md hover:shadow-lg'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                              }`}
                              title={row.created_flag ? 'View Quotation Logs' : 'Quotation Pending'}
                              onClick={() =>
                                row.created_flag &&
                                navigate(`/quotation/revisions/${row.master_id}`)
                              }
                              disabled={!row.created_flag}
                            >
                              <FaEye className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                          <FaSearch className="text-gray-400 dark:text-gray-500 text-xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          No leads found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {searchTerm
                            ? `No results for "${searchTerm}"`
                            : 'No quotation pending leads available'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-bold">{displayData.length}</span> of{' '}
                <span className="font-bold">{data.length}</span> leads
              </div>

              {displayData.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Quotations Created:</span>
                    <span className="ml-2 font-bold text-green-600 dark:text-green-400">
                      {data.filter((item) => item.created_flag).length}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                    <span className="ml-2 font-bold text-yellow-600 dark:text-yellow-400">
                      {data.filter((item) => !item.created_flag).length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && renderDetailsModal()}

        {/* Remark Full View Modal */}
        {renderRemarkModal()}
      </div>
    </>
  );
};

export default QuotationPending;