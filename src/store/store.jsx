import { create } from 'zustand'





const currentYear = new Date().getFullYear()

export const useStore = create((set) => ({
  activeModule:"overview",
  updateActiveModule: (value) => set({ activeModule: value }),
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
  role: "employee",
  changeRole: (value) => set({ role: value }),
  userName: {},
  changeUser: (value) => set({ userName: value }),
  studentsData: [],
  updateStudents: (value) => set({ studentsData: value }),
}));

// export const generatePassword = (length = 8) => {
//   const charset =
//     "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
//   let password = "";

//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * charset.length);
//     password += charset[randomIndex];
//   }

//   return password;
// };
