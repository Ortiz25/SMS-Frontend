import { useState } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentMgt';
import TeacherManagement from './pages/TeacherMgt';
import TimetableManagement from './pages/TimetableMgt';
import ExamGrading from './pages/ExamGrading';
import LibraryManagement from './pages/LibraryMgt';
import DisciplineMgt from './pages/DiscplinaryMgt';
import InventoryManagement from './pages/InventoryMgt';
import CommunicationHub from './pages/CommunicationMgt';
import HostelTransportManagement from './pages/HostelTransportMgt';
import SettingsModule from './pages/SettingsMgt';
import ErrorPage from './pages/ErrorPage';
import AlumniManagement from './pages/AlumniPages';
import LoginPage from './pages/LoginPage';
import ForgotPass from './pages/ForgotPassPage';
import FinanceMgt from './pages/FinanceMgt';
import Borrowers from './pages/LibraryBorrowers';
import PasswordRecovery from './pages/ResetPassword';
import { action as LoginAction, loader as LoginLoader } from './pages/LoginPage';
import { loader as DashLoader } from './pages/Dashboard';
import { loader as StudentLoader } from './pages/StudentMgt';
import { loader as LibraryLoader } from './pages/LibraryMgt';
import { loader as timetableLoader } from './pages/TimetableMgt';
import { loader as teacherLoader } from './pages/TeacherMgt';
import { loader as ExamLoader } from './pages/ExamGrading';
import { loader as DisciplinaryLoader } from './pages/DiscplinaryMgt';
import { loader as loaderTransport  } from './pages/HostelTransportMgt';
import { loader as commsLoader } from './pages/CommunicationMgt';
import { loader as loaderSettings  } from './pages/SettingsMgt';
import { loader as inventoryLoader } from './pages/InventoryMgt';
import { loader as financeLoader } from './pages/FinanceMgt';
import { action as resetAction } from './pages/ResetPassword';

// Authentication checker function
const authRequired = async () => {
  // Get token from localStorage
  const token = localStorage.getItem("token");
  
  // If no token exists, redirect to login
  if (!token) {
    return redirect("/");
  }
  
  const tokenUrl = "http://localhost:5010/api/auth/verify-token";
  
  try {
    const tokenResponse = await fetch(tokenUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    // If token is invalid or expired
    if (!tokenResponse.ok) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }
    
    // Token is valid, return null to continue to the requested route
    return null;
  } catch (error) {
    console.error("Error verifying authentication:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return redirect("/");
  }
};

// Wrap existing loaders with authentication check
const withAuth = (existingLoader) => {
  return async (...args) => {
    // First check auth
    const authCheck = await authRequired();
    if (authCheck) {
      return authCheck; // This is a redirect response if auth failed
    }
    
    // Auth passed, run the original loader if it exists
    if (existingLoader) {
      return existingLoader(...args);
    }
    
    return null; // No loader to run, just continue
  };
};

const router = createBrowserRouter([
  // Public routes (no auth required)
  { 
    path: "/", 
    element: <LoginPage/>, 
    action: LoginAction, 
    loader: LoginLoader 
  },
  { 
    path: "/forgotpassword", 
    element: <ForgotPass/> 
  },
  { 
    path: "/resetpassword", 
    element: <PasswordRecovery/>, 
    action: resetAction 
  },
  
  // Protected routes (auth required)
  { 
    path: "/dashboard", 
    element: <Dashboard/>, 
    loader: withAuth(DashLoader) 
  },
  { 
    path: "/students", 
    element: <StudentManagement/>, 
    loader: withAuth(StudentLoader) 
  },
  { 
    path: "/teachers", 
    element: <TeacherManagement/>, 
    loader: withAuth(teacherLoader) 
  },
  { 
    path: "/timetable", 
    element: <TimetableManagement/>, 
    loader: withAuth(timetableLoader)
  },
  { 
    path: "/grading", 
    element: <ExamGrading/>, 
    loader: withAuth(ExamLoader)
  },
  { 
    path: "/library", 
    element: <LibraryManagement/>, 
    loader: withAuth(LibraryLoader)
  },
  { 
    path: "/disciplinary", 
    element: <DisciplineMgt/>, 
    loader: withAuth(DisciplinaryLoader) 
  },
  { 
    path: "/inventory", 
    element: <InventoryManagement/>, 
    loader: withAuth(inventoryLoader) 
  },
  { 
    path: "/communications", 
    element: <CommunicationHub/>, 
    loader: withAuth(commsLoader) 
  },
  { 
    path: "/transport", 
    element: <HostelTransportManagement/>, 
    loader: withAuth(loaderTransport) 
  },
  { 
    path: "/settings", 
    element: <SettingsModule/>, 
    loader: withAuth(loaderSettings)
  },
  { 
    path: "/alumni", 
    element: <AlumniManagement/>,
    loader: withAuth() 
  },
  { 
    path: "/borrowers", 
    element: <Borrowers/>,
    loader: withAuth() 
  },
  { 
    path: "/finance", 
    element: <FinanceMgt/>, 
    loader: withAuth(financeLoader) 
  },
  { 
    path: "*", 
    element: <ErrorPage/> 
  }
]);

function App() {
  return (
    <RouterProvider router={router}/>
  )
}

export default App