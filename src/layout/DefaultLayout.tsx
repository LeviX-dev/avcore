// default layout priyanka code 


// import React, { useState, ReactNode, useEffect  } from 'react';
// import Header from '../components/Header/index';
// import AdminSidebar from '../components/Sidebar/AdminSidebar';
// import PMsidebar from '../components/Sidebar/PMsidebar';
// import TLsidebar from '../components/Sidebar/TLsidebar';
// import UserSidebar from '../components/Sidebar/UserSidebar';
// import axios from 'axios';
// import { BASE_URL } from '../../public/config.js';

// interface DefaultLayoutProps {
//   children: ReactNode;
//   userRole: string | null;
// }

// const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children, userRole }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   if (!userRole) {
//     return <div>Loading...</div>; 
//   }

//   let SidebarComponent;
//   switch (userRole) {
//     case 'admin':
//       SidebarComponent = AdminSidebar;
//       break;
//     case 'project manager':
//       SidebarComponent = PMsidebar;
//       break;
//     case 'team lead':
//       SidebarComponent = TLsidebar;
//       break;
//     case 'tele_caller':
//       SidebarComponent = UserSidebar;
//       break;
//     default:
//       SidebarComponent = AdminSidebar;
//       break;
//   }

//   return (
//     <div className="dark:bg-boxdark-2 dark:text-bodydark">
//       <div className="flex h-screen overflow-hidden">
//         {SidebarComponent && <SidebarComponent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
//         <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
//           <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//           <main>
//             <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
//               {children}
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DefaultLayout;









//default layout nehal code 

// import React, { useState, ReactNode, useEffect  } from 'react';
// import Header from '../components/Header/index';
// import AdminSidebar from '../components/Sidebar/AdminSidebar';
// import PMsidebar from '../components/Sidebar/PMsidebar';
// import TLsidebar from '../components/Sidebar/TLsidebar';
// import UserSidebar from '../components/Sidebar/UserSidebar';
// import axios from 'axios';
// import { BASE_URL } from '../../public/config.js';


// const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children, userRole }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [userRole, setUserRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);


//     // Fetch user role from the backend
//     useEffect(() => {
//       const fetchUserRole = async () => {
//         try {
//           const response = await axios.get(BASE_URL + 'auth/get-role', { withCredentials: true });
//           setUserRole(response.data.role); 
//         } catch (error) {
//           console.error('Error fetching role:', error);
//         } finally {
//           setLoading(false);
//         }
//       };
  
//       fetchUserRole();
//     }, []);


//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   let SidebarComponent;
//   switch (userRole) {
//     case 'admin':
//       SidebarComponent = AdminSidebar;
//       break;
//     case 'project manager':
//       SidebarComponent = PMsidebar;
//       break;
//     case 'team lead':
//       SidebarComponent = TLsidebar;
//       break;
//     case 'tele_caller':
//       SidebarComponent = UserSidebar;
//       break;
//     default:
//       SidebarComponent = AdminSidebar; 
//       break;
//   }


//   return (

//     <div className="dark:bg-boxdark-2 dark:text-bodydark">
//       <div className="flex h-screen overflow-hidden">
//         {/* Sidebar: Dynamically render the sidebar based on the role */}
//         {SidebarComponent && <SidebarComponent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
        
//         <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
//           <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
//           <main>
//             <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
//               {children}
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>

    
//   );
// };

// export default DefaultLayout;




// import React, { useState, ReactNode, useEffect  } from 'react';
// import Header from '../components/Header/index';
// import AdminSidebar from '../components/Sidebar/AdminSidebar';
// import PMsidebar from '../components/Sidebar/PMsidebar';
// import TLsidebar from '../components/Sidebar/TLsidebar';
// import UserSidebar from '../components/Sidebar/UserSidebar';
// import axios from 'axios';
// import { BASE_URL } from '../../public/config.js';

// interface DefaultLayoutProps {
//   children: ReactNode;
//   userRole: string | null;
// }

// const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children, userRole }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   if (!userRole) {
//     return <div>Loading...</div>; 
//   }

//   let SidebarComponent;
//   switch (userRole) {
//     case 'admin':
//       SidebarComponent = AdminSidebar;
//       break;
//     case 'project manager':
//       SidebarComponent = PMsidebar;
//       break;
//     case 'team lead':
//       SidebarComponent = TLsidebar;
//       break;
//     // case 'tele_caller':
//     //   SidebarComponent = UserSidebar;
//     //   break;

     
//     case 'tele_caller':
// case 'digital-marketing':
// case 'field-marketing-executive':
// case 'tech-sale-sound-engineer':
// case 'junior-autocad-designer':
// case 'senior-autocad-designer':
// case 'technical-head':
//   SidebarComponent = UserSidebar; // SAME AS TELECALLER
//   break;

  


//     default:
//       SidebarComponent = AdminSidebar;
//       break;
//   }

//   return (
//     <div className="dark:bg-boxdark-2 dark:text-bodydark">
//       <div className="flex h-screen overflow-hidden">
//         {SidebarComponent && <SidebarComponent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
//         <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
//           <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//           <main>
//             <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
//               {children}
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DefaultLayout;


// import React, { useState, ReactNode } from 'react';
// import Header from '../components/Header/index';
// import DynamicSidebar from '../components/Sidebar/DynamicSidebar';

// interface DefaultLayoutProps {
//   children: ReactNode;
//   userRole: string | null;
// }

// const DefaultLayout: React.FC<DefaultLayoutProps> = ({
//   children,
//   userRole,
// }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Safety check (role still required for permissions context)
//   if (!userRole) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="dark:bg-boxdark-2 dark:text-bodydark">
//       <div className="flex h-screen overflow-hidden">

//         {/* ✅ SINGLE DYNAMIC SIDEBAR */}
//         <DynamicSidebar
//           sidebarOpen={sidebarOpen}
//           setSidebarOpen={setSidebarOpen}
//         />

//         {/* ✅ MAIN CONTENT */}
//         <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
//           <Header
//             sidebarOpen={sidebarOpen}
//             setSidebarOpen={setSidebarOpen}
//           />

//           <main>
//             <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
//               {children}
//             </div>
//           </main>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default DefaultLayout; 


import React, { useState, ReactNode } from 'react';
import Header from '../components/Header/index';
import DynamicSidebar from '../components/Sidebar/DynamicSidebar';

interface DefaultLayoutProps {
  children: ReactNode;
  userRole: string | null;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({
  children,
  userRole,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!userRole) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <DynamicSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <main>
            <div className="mx-auto max-w-screen-2xl pt-3 px-4 md:px-6 2xl:px-10 pb-4">
              {children}
            </div>
          </main>

        </div>

      </div>
    </div>
  );
};

export default DefaultLayout;


