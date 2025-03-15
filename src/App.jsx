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
import FinanceMgt from './pages/FinanceMgt';
import Borrowers from './pages/LibraryBorrowers';
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






const router = createBrowserRouter([
  { path: "/", element: <LoginPage/>, action:LoginAction, loader: LoginLoader },
  { path: "/dashboard", element: <Dashboard/>, loader:DashLoader },
  { path: "/students", element: <StudentManagement/>, loader:StudentLoader },
  { path: "/teachers", element: <TeacherManagement/>, loader:teacherLoader },
  { path: "/timetable", element: <TimetableManagement/>, loader:timetableLoader},
  { path: "/grading", element: <ExamGrading/>, loader:ExamLoader},
  { path: "/library", element: <LibraryManagement/>, loader:LibraryLoader},
  { path: "/disciplinary", element: <DisciplineMgt/>, loader:DisciplinaryLoader },
  { path: "/inventory", element: <InventoryManagement/>, loader: inventoryLoader },
  { path: "/communications", element: <CommunicationHub/>, loader:commsLoader },
  { path: "/transport", element: <HostelTransportManagement/>, loader:loaderTransport },
  { path: "/settings", element: <SettingsModule/>, loader:loaderSettings},
  { path: "/alumni", element: <AlumniManagement/> },
  { path: "/borrowers", element: <Borrowers/> },
  { path: "/finance", element: <FinanceMgt/>, loader:financeLoader },
  { path: "/forgotpassword", element: <ForgotPass/> },
  { path: "*", element: <ErrorPage/> }
]);


function App() {
  return (
     <RouterProvider router={router}/>
  )
}

export default App
