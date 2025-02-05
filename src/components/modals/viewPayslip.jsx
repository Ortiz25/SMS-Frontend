import React from 'react';
import { X, Download, Printer } from 'lucide-react';

const ViewPayslipModal = ({ isOpen, onClose, payslip }) => {
  if (!isOpen || !payslip) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg w-full max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-medium">Payslip Details</h3>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-500">
                <Printer className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-500">
                <Download className="h-5 w-5" />
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* School Info */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Kenya School</h2>
              <p className="text-gray-600">P.O. Box 123, Nairobi</p>
              <p className="text-gray-600">Payslip for {payslip.month} {payslip.year}</p>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium mb-2">Employee Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Name:</span> {payslip.employeeName}</p>
                  <p><span className="text-gray-600">ID:</span> {payslip.employeeId}</p>
                  <p><span className="text-gray-600">Department:</span> {payslip.department}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Payment Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Payment Date:</span> {payslip.paymentDate}</p>
                  <p><span className="text-gray-600">Payment Method:</span> {payslip.paymentMethod}</p>
                  <p><span className="text-gray-600">Bank Account:</span> ****{payslip.accountLast4}</p>
                </div>
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-2 gap-6">
              {/* Earnings */}
              <div>
                <h4 className="font-medium mb-2 pb-2 border-b">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Basic Salary</span>
                    <span>KES {payslip.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Housing Allowance</span>
                    <span>KES {payslip.housingAllowance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Transport Allowance</span>
                    <span>KES {payslip.transportAllowance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="font-medium mb-2 pb-2 border-b">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>PAYE</span>
                    <span>KES {payslip.paye.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>NHIF</span>
                    <span>KES {payslip.nhif.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>NSSF</span>
                    <span>KES {payslip.nssf.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between font-medium">
                <span>Net Pay</span>
                <span className="text-lg">KES {payslip.netPay.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPayslipModal;