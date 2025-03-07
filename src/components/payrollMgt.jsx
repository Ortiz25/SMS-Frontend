import React, { useState } from "react";
import {
  DollarSign,
  Download,
  FileText,
  Plus,
  Printer,
  ChevronDown,
} from "lucide-react";
import PayrollTable from "./payrollTable";
import GeneratePayrollModal from "./modals/generalPayroll";
import ViewPayslipModal from "./modals/viewPayslip";

const PayrollManagement = () => {
  // Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("February 2024");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Handler functions
  const handleGeneratePayroll = (formData) => {
    console.log("Generating payroll:", formData);
    // Add your payroll generation logic here
    setShowGenerateModal(false);
  };

  const handleViewPayslip = (employee) => {
    setSelectedPayslip({
      month: selectedMonth,
      year: "2024",
      employeeName: employee.name,
      employeeId: employee.employeeId,
      department: employee.position,
      paymentDate: "2024-02-28",
      paymentMethod: "Bank Transfer",
      accountLast4: "4321",
      basicSalary: employee.basicSalary,
      housingAllowance: 5001,
      transportAllowance: 3000,
      paye: 4500,
      nhif: 1000,
      nssf: 800,
      netPay: employee.netPay,
    });
    setShowPayslipModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Payroll Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Payroll</h3>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">KES 850,000</div>
          <p className="text-xs text-gray-600">This month</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Average Salary
            </h3>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold">KES 45,000</div>
          <p className="text-xs text-green-600">+5% from last year</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Pending Payslips
            </h3>
            <FileText className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-yellow-600">Need generation</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Tax Deductions
            </h3>
            <FileText className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold">KES 127,500</div>
          <p className="text-xs text-gray-600">Total deductions</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option>February 2024</option>
            <option>January 2024</option>
            <option>December 2023</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Payroll</span>
          </button>
        </div>
      </div>

      {/* Render PayrollTable component */}
      {/* Payroll Table */}
      <PayrollTable onViewPayslip={handleViewPayslip} />

      {/* Modals */}
      <GeneratePayrollModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGeneratePayroll}
      />

      <ViewPayslipModal
        isOpen={showPayslipModal}
        onClose={() => {
          setShowPayslipModal(false);
          setSelectedPayslip(null);
        }}
        payslip={selectedPayslip}
      />
    </div>
  );
};

export default PayrollManagement;
