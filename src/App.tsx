import React, { useEffect, useState } from 'react';
import {
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import axios from 'axios';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import ECommerce from './pages/Dashboard/ECommerce';
import DefaultLayout from './layout/DefaultLayout';
// import Add_client from './pages/client/Add_client';
import AddClient from './pages/Client/Add_client';
import Client_list from './pages/Client/Client_list';
import Add_user from './pages/User/Add_user';
import User_list from './pages/User/User_list';
import Category from './pages/Master/Category';
import Reference from './pages/Master/Reference';
import Product from './pages/Master/Product';
import Followup from './pages/Marketing/Followup';
import MarketingProduct from './pages/Marketing/MarketingProduct';
// import View_task from './pages/Task/View_task';

import { BASE_URL } from '../public/config.js';

import Raw_data from './pages/Rawdata/Raw_data';
import Call from './pages/Call/Call';
import Visit from './pages/Visit/Visit';
import Area from './pages/Master/Area';
import CallReport from './pages/Report/CallReport';
import DropLeadsPage from './pages/Report/DropLeadsPage';
import ClosedLeadsPage from './pages/Report/ClosedLeadsPage';

import UploadDocument from './pages/Master/DocumentUpload';

import CampaignPage from './pages/Campaign/CampaignPage';
import ViewCampaign from './pages/Campaign/ViewCampaign';
import PreviewPage from './pages/Campaign/PreviewPage';
import ResponsesPage from './pages/Campaign/ResponsesPage';
import StudentForm from './pages/Campaign/studentForm.jsx';
import InactiveLeadList from './pages/Marketing/InactiveLeadList';
import TodaysTodoPage from './pages/Report/TodaysTodoPage';
import UpcomingFollowupsPage from './pages/Report/UpcomingFollowupsPage';
import { PermissionProvider } from './context/PermissionContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRolePermission from './components/Sidebar/AdminRolePermission';
import EmployeeReportsPage from './pages/Report/EmployeeReportsPage';
import EmployeeAssignedCountReport from './pages/Report/EmployeeAssignedCountReport';
import KitManagement from './pages/Master/KitManagement';
import AddKitForm from './pages/Master/AddKit';
import AddQuotation from './pages/Rawdata/AddQuotation';
import ViewQuotation from './pages/Rawdata/ViewQuotation';
import QuotationPending from './pages/Rawdata/QuotationPending';
import QuotationRevision from './pages/Rawdata/QuotationRevision';
import EditQuotation from './pages/Rawdata/EditQuotation';
import DailyReportsTasks from './pages/Report/DailyReportsTasks';
import AttendanceReport from './pages/Report/AttendanceReport';


function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Scroll to the top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Simulate loading effect
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Check session-based authentication
  // Check authentication except for public routes
  useEffect(() => {
    const publicRoutes = ['/signin', '/followup/campaign/student']; // base public routes

    // ✅ Allow all routes starting with /followup/campaign/student (even with :id)
    const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

    if (isPublic) return; // ⛔ Skip authentication check

    const checkAuth = async () => {
      try {
        const response = await axios.get(BASE_URL + 'auth/check-session', {
          withCredentials: true,
        });
        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
          setUserRole(response.data.role);
        } else {
          setIsAuthenticated(false);
          navigate('/signin');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsAuthenticated(false);
        navigate('/signin');
      }
    };

    checkAuth();
  }, [pathname, navigate]);

  // Handle login
  const handleLogin = (auth: boolean, role: string) => {
    setIsAuthenticated(auth);
    setUserRole(role);
    if (auth) {
      navigate('/dashboard');
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <PermissionProvider role={userRole}>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/signin" element={<SignIn handleLogin={handleLogin} />} />

        <Route
          path="/followup/campaign/student/:id"
          element={
            <>
              <PageTitle title="Preview Campaign" />
              <StudentForm />
            </>
          }
        />

        {/* ---------- PROTECTED ROUTES ---------- */}
        {isAuthenticated ? (
          <>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute menuKey="dashboard">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Dashboard" />
                    <ECommerce />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/master/category"
              element={
                <ProtectedRoute menuKey="master.category">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Category" />
                    <Category />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

           <Route
  path="/product"
  element={
    <ProtectedRoute menuKey="product">
      <DefaultLayout userRole={userRole}>
        <PageTitle title="Product" />
        <Product />
      </DefaultLayout>
    </ProtectedRoute>
  }
/>


            <Route
              path="/upload-document/:product_id"
              element={
                <ProtectedRoute menuKey="master.product">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Upload Document" />
                    <UploadDocument />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/master/reference"
              element={
                <ProtectedRoute menuKey="master.reference">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Reference" />
                    <Reference />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/role-permission"
              element={
                <ProtectedRoute menuKey="master.role_permission">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Role Permission" />
                    <AdminRolePermission />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/master/area"
              element={
                <ProtectedRoute menuKey="master.area">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Area" />
                    <Area />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/add-user"
              element={
                <ProtectedRoute menuKey="user.add">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Add User" />
                    <Add_user />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/user-list"
              element={
                <ProtectedRoute menuKey="user.list">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="User List" />
                    <User_list />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/quatation-pending"
              element={
                <ProtectedRoute menuKey="quotationpending">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="quatation-pending" />
                    <QuotationPending />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/quotation/add/:master_id"
              element={
                <ProtectedRoute menuKey="quotationpending">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="quatation-pending" />
                    <AddQuotation />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/master-data"
              element={
                <ProtectedRoute menuKey="master_data">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Master Data" />
                    <Raw_data />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/add-client"
              element={
                <ProtectedRoute menuKey="client.add">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Add Client" />
                    <AddClient />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/client-list"
              element={
                <ProtectedRoute menuKey="client.list">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Client List" />
                    <Client_list />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="/followup/followup-list"
              element={
                <ProtectedRoute menuKey="followup.list">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Followup Record" />
                    <Followup />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            /> */}

            <Route
              path="/followup/followup-list"
              element={
                <ProtectedRoute menuKey="missed_followup">
                  {' '}
                  {/* Changed here */}
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Missed Follow-up List" />
                    <Followup />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/followup/meeting-scheduled"
              element={
                <ProtectedRoute menuKey="followup.meeting">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Followup Record" />
                    <MarketingProduct />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/followup/campaign-page"
              element={
                <ProtectedRoute menuKey="campaign.create">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Create Campaign" />
                    <CampaignPage />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/followup/view-campaign"
              element={
                <ProtectedRoute menuKey="campaign.view">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="View Campaign" />
                    <ViewCampaign />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/inactiveleadlist"
              element={
                <ProtectedRoute menuKey="campaign.responses">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Campaign Responses" />
                    <InactiveLeadList />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/call"
              element={
                <ProtectedRoute menuKey="call">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Call" />
                    <Call />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/visit"
              element={
                <ProtectedRoute menuKey="visit">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Visit" />
                    <Visit />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/followup/campaign/preview/:id"
              element={
                <ProtectedRoute menuKey="campaign.view">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Preview Campaign" />
                    <PreviewPage />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/report/call"
              element={
                <ProtectedRoute menuKey="report.call">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Report" />
                    <CallReport />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/drop-leads"
              element={
                <ProtectedRoute menuKey="report.drop">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Drop Leads Report" />
                    <DropLeadsPage />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/closed-leads"
              element={
                <ProtectedRoute menuKey="report.closed">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Closed Leads Report" />
                    <ClosedLeadsPage />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-reports"
              element={
                <ProtectedRoute menuKey="report.employee">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Employee Reports" />
                    {/* You'll need to create this component */}
                    <EmployeeReportsPage />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/todays-todo"
              element={
                <ProtectedRoute menuKey="todays_todo">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Today's To-Do List" />
                    <TodaysTodoPage />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/upcoming-followups"
              element={
                <ProtectedRoute menuKey="upcoming_followups">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Upcoming Follow-ups" />
                    <UpcomingFollowupsPage />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

          <Route
  path="/quotation-template"
  element={
    <ProtectedRoute menuKey="quotation_template">
      <DefaultLayout userRole={userRole}>
        <PageTitle title="Quotation Template" />
        <KitManagement />
      </DefaultLayout>
    </ProtectedRoute>
  }
/>


            <Route
  path="/master/add-kit"
  element={
    <ProtectedRoute menuKey="quotation_template">
      <DefaultLayout userRole={userRole}>
        <PageTitle title="Kit Management" />
        <AddKitForm />
      </DefaultLayout>
    </ProtectedRoute>
  }
/>


           <Route
              path="/lead/view/:master_id/:revision"
              element={
                <ProtectedRoute menuKey="quotationpending">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Quotation Pending" />
                    <ViewQuotation />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-assigned-count-report"
              element={
                <ProtectedRoute menuKey="report.employee_assigned">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Emp Assignment Count" />
                    <EmployeeAssignedCountReport />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/quotation/revisions/:master_id"
              element={
                <ProtectedRoute menuKey="quotationpending">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Quotation Revisions" />
                    <QuotationRevision />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/quotation/edit/:qt_id"
              element={
                <ProtectedRoute menuKey="quotationpending">
                  <DefaultLayout userRole={userRole}>
                    <PageTitle title="Edit Quotation" />
                    <EditQuotation />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            /> 

            <Route
  path="/report/daily-reports"
  element={
    <ProtectedRoute menuKey="report.daily">
      <DefaultLayout userRole={userRole}>
        <PageTitle title="Daily Reports & Tasks" />
        <DailyReportsTasks />
      </DefaultLayout>
    </ProtectedRoute>
  }
/>


<Route
  path="/attendance-report"
  element={
    <ProtectedRoute menuKey="attendance">
      <DefaultLayout userRole={userRole}>
        <PageTitle title="Attendance Report" />
        <AttendanceReport />
      </DefaultLayout>
    </ProtectedRoute>
  }
/>




          </>
        ) : (
          <Route path="*" element={<Navigate to="/signin" />} />
        )}
      </Routes>
    </PermissionProvider>
  );
}

export default App;
