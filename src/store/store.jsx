import { create } from "zustand";

const currentYear = new Date().getFullYear();

export const useStore = create((set, get) => ({
  activeModule: "overview",
  updateActiveModule: (value) => set({ activeModule: value }),
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
  role: "employee",
  changeRole: (value) => set({ role: value }),
  userName: {},
  changeUser: (value) => set({ userName: value }),
  studentsData: [],
  updateStudents: (value) => set({ studentsData: value }),

  // Theme state and toggle function
  isDarkMode: false,
  toggleTheme: (value) => set({ isDarkMode: value }),
}));


