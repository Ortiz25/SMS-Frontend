import { useState } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
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





const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard/>,
  },
  {
    path: "/students",
    element: <StudentManagement/>,
  },
  {
    path: "/teachers",
    element: <TeacherManagement/>,
  },
  {
    path: "/timetable",
    element: <TimetableManagement/>,
  },
  {
    path: "/grading",
    element: <ExamGrading/>,
  },
  {
    path: "/library",
    element: <LibraryManagement/>,
  },
  {
    path: "/disciplinary",
    element: <DisciplineMgt/>,
  },
  {
    path: "/inventory",
    element: <InventoryManagement/>,
  },
  {
    path: "/communications",
    element: <CommunicationHub/>,
  },
  {
    path: "/transport",
    element: <HostelTransportManagement/>,
  },
  {
    path: "/settings",
    element: <SettingsModule/>,
  },
  {
    path: "/error",
    element: <ErrorPage/>,
  },
  {
    path: "/alumni",
    element: <AlumniManagement/>,
  },
  {
    path: "/login",
    element: <LoginPage/>,
  },
  {
    path: "/forgotpassword",
    element: <ForgotPass/>,
  },
  
  
  
]);

function App() {
  return (
     <RouterProvider router={router}/>
  )
}

export default App
