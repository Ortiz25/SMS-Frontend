import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { redirect } from "react-router-dom";
import { downloadPdfReceipt, printReceipt } from "../util/printingAndPDF";

const FinanceDashboard = () => {
  const token = localStorage.getItem("token");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsResponse, setStatsResponse] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [academicSessions, setAcademicSessions] = useState([]);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    admissionNumber: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    academicSessionId: "",
    paymentMethod: "bank", // Default to bank payment
    transactionReference: "",
    mpesaCode: "", // For M-Pesa payments
    mpesaPhone: "", // For M-Pesa payments
    bankName: "", // For bank payments
    bankBranch: "", // For bank payments
    notes: "",
  });

  // Payment stats state
  const [paymentStats, setPaymentStats] = useState({
    totalAmount: 0,
    mpesaAmount: 0,
    bankAmount: 0,
    cashAmount: 0,
    chequeAmount: 0,
    mpesaCount: 0,
    bankCount: 0,
    cashCount: 0,
    chequeCount: 0,
  });

  // Enhanced transaction table states
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);
  const [allPayments, setAllPayments] = useState([]);

  const { updateActiveModule, activeModule } = useStore();

  useEffect(() => {
    updateActiveModule("finance");
  }, [updateActiveModule, activeModule]);

  // Fetch academic sessions for dropdown
  useEffect(() => {
    const fetchAcademicSessions = async () => {
      try {
        const response = await axios.get(
          "/backend/api/finance/academic-sessions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAcademicSessions(response.data.data);

        // Set default session to current session
        const currentSession = response.data.data.find(
          (session) => session.is_current
        );
        if (currentSession) {
          setPaymentForm((prev) => ({
            ...prev,
            academicSessionId: currentSession.id.toString(),
          }));
        }
      } catch (err) {
        console.error("Failed to fetch academic sessions:", err);
      }
    };

    fetchAcademicSessions();
  }, [token]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentTypeFilter]);

  // Function to fetch all payments (both M-Pesa and Bank)
  const fetchAllPayments = async () => {
    try {
      const response = await axios.get(
        "/backend/api/finance/payments",
        {
          params: {
            limit: 100, // Fetch more payments for client-side pagination
            academicSession:
              selectedTerm !== "all"
                ? academicSessions.find(
                    (s) =>
                      s.term.toString() === selectedTerm &&
                      s.year === selectedYear
                  )?.id
                : undefined,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAllPayments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching all payments:", error);
    }
  };

  // Fetch payment data and statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Convert selectedTerm to academicSessionId for API query
        let academicSessionId = null;
        if (selectedTerm !== "all") {
          const matchingSession = academicSessions.find(
            (session) =>
              session.term.toString() === selectedTerm &&
              session.year === selectedYear
          );
          if (matchingSession) {
            academicSessionId = matchingSession.id;
          }
        }

        // Fetch payment stats for dashboard cards
        const statsResponse = await axios.get(
          "/backend/api/finance/stats",
          {
            params: { academicSessionId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Store full stats response for chart data
        setStatsResponse(statsResponse);

        if (statsResponse.data.success) {
          const statsData = statsResponse.data.data;

          // Map payment methods to state structure
          const mpesaData = statsData.paymentMethods.find(
            (m) => m.payment_method === "mpesa"
          ) || { count: 0, total_amount: 0 };
          const bankData = statsData.paymentMethods.find(
            (m) => m.payment_method === "bank"
          ) || { count: 0, total_amount: 0 };
          const cashData = statsData.paymentMethods.find(
            (m) => m.payment_method === "cash"
          ) || { count: 0, total_amount: 0 };
          const chequeData = statsData.paymentMethods.find(
            (m) => m.payment_method === "cheque"
          ) || { count: 0, total_amount: 0 };

          setPaymentStats({
            totalAmount: parseFloat(statsData.currentSessionTotal || 0),
            mpesaAmount: parseFloat(mpesaData.total_amount || 0),
            bankAmount: parseFloat(bankData.total_amount || 0),
            cashAmount: parseFloat(cashData.total_amount || 0),
            chequeAmount: parseFloat(chequeData.total_amount || 0),
            mpesaCount: parseInt(mpesaData.count || 0),
            bankCount: parseInt(bankData.count || 0),
            cashCount: parseInt(cashData.count || 0),
            chequeCount: parseInt(chequeData.count || 0),
            monthly: statsData.monthly || [],
          });
        }

        // Now fetch all payments for the enhanced table
        await fetchAllPayments();

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load payment data. Please try again later.");
        setLoading(false);
      }
    };

    if (academicSessions.length > 0) {
      fetchData();
    }
  }, [selectedTerm, selectedYear, academicSessions, token]);

  // Filtering logic - combines search and payment type filter
  const filteredPayments = useMemo(() => {
    return allPayments.filter((payment) => {
      // Filter by payment type
      if (
        paymentTypeFilter !== "all" &&
        payment.payment_method !== paymentTypeFilter
      ) {
        return false;
      }

      // Search term filtering - check across multiple fields
      if (searchTerm.trim() !== "") {
        const lowercasedSearch = searchTerm.toLowerCase();
        return (
          payment.receipt_number?.toLowerCase().includes(lowercasedSearch) ||
          payment.transaction_reference
            ?.toLowerCase()
            .includes(lowercasedSearch) ||
          payment.mpesa_code?.toLowerCase().includes(lowercasedSearch) ||
          payment.first_name?.toLowerCase().includes(lowercasedSearch) ||
          payment.last_name?.toLowerCase().includes(lowercasedSearch) ||
          payment.admission_number?.toLowerCase().includes(lowercasedSearch) ||
          payment.amount?.toString().includes(lowercasedSearch)
        );
      }

      return true;
    });
  }, [allPayments, searchTerm, paymentTypeFilter]);

  // Pagination calculations
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );

  // Calculate page numbers for pagination
  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(filteredPayments.length / paymentsPerPage);
    i++
  ) {
    // Show only 5 page numbers at a time
    if (
      i === 1 ||
      i === Math.ceil(filteredPayments.length / paymentsPerPage) ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pageNumbers.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pageNumbers.push("...");
    }
  }

  // Function to change page
  const paginate = (pageNumber) => {
    if (
      pageNumber < 1 ||
      pageNumber > Math.ceil(filteredPayments.length / paymentsPerPage)
    ) {
      return;
    }
    setCurrentPage(pageNumber);
  };

  // Function to handle form submission
  const handlePaymentSubmit = async () => {
    try {
      // Form validation
      if (!paymentForm.admissionNumber) {
        alert("Please enter a valid admission number");
        return;
      }

      if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      if (!paymentForm.academicSessionId) {
        alert("Please select an academic term");
        return;
      }

      if (paymentForm.paymentMethod === "mpesa" && !paymentForm.mpesaCode) {
        alert("Please enter the M-Pesa code");
        return;
      }

      if (paymentForm.paymentMethod === "bank" && !paymentForm.bankName) {
        alert("Please select a bank");
        return;
      }

      // Prepare data for API
      const paymentData = {
        admissionNumber: paymentForm.admissionNumber,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        academicSessionId: parseInt(paymentForm.academicSessionId),
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference,
        mpesaCode: paymentForm.mpesaCode,
        mpesaPhone: paymentForm.mpesaPhone,
        bankName: paymentForm.bankName,
        bankBranch: paymentForm.bankBranch,
        notes: paymentForm.notes,
      };

      // Submit to backend
      const response = await axios.post(
        "/backend/api/finance/payments",
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert(
          `${
            paymentForm.paymentMethod === "mpesa" ? "M-Pesa" : "Bank"
          } payment recorded successfully!`
        );

        // Reset form but keep selected payment method
        setPaymentForm({
          admissionNumber: "",
          amount: "",
          paymentDate: new Date().toISOString().split("T")[0],
          academicSessionId: paymentForm.academicSessionId,
          paymentMethod: paymentForm.paymentMethod,
          transactionReference: "",
          mpesaCode: "",
          mpesaPhone: "",
          bankName: "",
          bankBranch: "",
          notes: "",
        });

        // Refresh stats and payments data
        await fetchAllPayments();

        // Refresh stats data
        const statsResponse = await axios.get(
          "/backend/api/finance/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStatsResponse(statsResponse);

        if (statsResponse.data.success) {
          const statsData = statsResponse.data.data;

          // Update payment stats with new data
          // Same as before...
        }
      }
    } catch (err) {
      console.error("Error submitting payment:", err);
      alert(
        `Failed to record payment: ${
          err.response?.data?.message || "Unknown error"
        }`
      );
    }
  };

  // View payment details
  const viewPaymentDetails = async (paymentId) => {
    try {
      const response = await axios.get(
        `/backend/api/finance/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setSelectedPayment(response.data.data);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error fetching payment details:", err);
      alert("Could not load payment details");
    }
  };

  // Prepare data for charts
  const prepareMonthlyData = () => {
    // First check if stats has a monthly property
    if (paymentStats.monthly && Array.isArray(paymentStats.monthly)) {
      return paymentStats.monthly;
    }

    // If statsResponse exists, try to get monthly data from it
    if (statsResponse?.data?.success && statsResponse.data.data.monthly) {
      return statsResponse.data.data.monthly;
    }

    // Otherwise create a fallback dataset
    const monthlyData = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize all months
    months.forEach((month) => {
      monthlyData[month] = {
        month,
        mpesa: 0,
        bank: 0,
        total: 0,
      };
    });

    return Object.values(monthlyData);
  };

  const preparePaymentMethodData = () => {
    return [
      {
        name: "M-Pesa",
        value: paymentStats.mpesaAmount,
        count: paymentStats.mpesaCount,
      },
      {
        name: "Bank",
        value: paymentStats.bankAmount,
        count: paymentStats.bankCount,
      },
    ];
  };

  // For colors in pie chart - only MPesa and Bank
  const COLORS = ["#0088FE", "#00C49F"];

  // Custom tooltip for displaying formatted currency
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: KES ${
                entry.value ? entry.value.toLocaleString() : "0"
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading)
    return (
      <Navbar>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Navbar>
    );

  const monthlyData = prepareMonthlyData();
  const paymentMethodData = preparePaymentMethodData();

  return (
    <Navbar>
      <div className="p-2 sm:p-4 lg:p-6 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">
            School Fee Payments Dashboard
          </h1>

          {/* Term and Year Filters */}
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="p-2 border rounded text-sm"
            >
              <option value="all">All Terms</option>
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-2 border rounded text-sm"
            >
              {Array.from(
                { length: 3 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards - Stack on small screens, flex on larger */}
        <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-blue-100 p-3 sm:p-4 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
              Total Collections
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
              KES {paymentStats.totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="bg-green-100 p-3 sm:p-4 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
              M-Pesa Collections
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
              KES {paymentStats.mpesaAmount.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {paymentStats.mpesaCount} transactions
            </p>
          </div>

          <div className="bg-yellow-100 p-3 sm:p-4 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
              Bank Collections
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
              KES {paymentStats.bankAmount.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {paymentStats.bankCount} transactions
            </p>
          </div>
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
              Monthly Payment Trends
            </h2>
            <div className="h-64 sm:h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="mpesa"
                    stroke="#0088FE"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bank"
                    stroke="#00C49F"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
              Payment Methods Distribution
            </h2>
            <div className="h-64 sm:h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `KES ${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
            Payment Methods Comparison
          </h2>
          <div className="h-64 sm:h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="mpesa" name="M-Pesa" fill="#0088FE" />
                <Bar dataKey="bank" name="Bank" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions and form section */}
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Transactions Table Section with expanded functionality */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-3 w-full">
              <h2 className="text-base sm:text-lg font-semibold">
                Recent Transactions
              </h2>

              {/* Search and filter controls */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-4">
                {/* Search Input */}
                <div className="relative w-full sm:w-64 max-w-sm">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full min-w-[200px] max-w-md p-2 pl-8 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Payment Filter Dropdown */}
                <select
                  value={paymentTypeFilter}
                  onChange={(e) => setPaymentTypeFilter(e.target.value)}
                  className="w-full sm:w-auto min-w-[150px] max-w-sm p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Payment Types</option>
                  <option value="mpesa">M-Pesa Only</option>
                  <option value="bank">Bank Only</option>
                </select>
              </div>
            </div>

            {/* Responsive table with horizontal scrolling for small screens */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-2 sm:px-4 border-b text-left">
                      Receipt
                    </th>
                    <th className="py-2 px-2 sm:px-4 border-b text-left">
                      Method
                    </th>
                    <th className="py-2 px-2 sm:px-4 border-b text-left">
                      Reference
                    </th>
                    <th className="py-2 px-2 sm:px-4 border-b text-right">
                      Amount
                    </th>
                    <th className="py-2 px-2 sm:px-4 border-b text-left hidden sm:table-cell">
                      Date
                    </th>
                    <th className="py-2 px-2 sm:px-4 border-b text-left hidden md:table-cell">
                      Student
                    </th>
                    <th className="py-2 px-2 sm:px-4 border-b text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length > 0 ? (
                    currentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="py-2 px-2 sm:px-4 border-b truncate max-w-[80px]">
                          {payment.receipt_number}
                        </td>
                        <td className="py-2 px-2 sm:px-4 border-b">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.payment_method === "mpesa"
                                ? "bg-green-100 text-green-800"
                                : payment.payment_method === "bank"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {payment.payment_method === "mpesa"
                              ? "M-Pesa"
                              : payment.payment_method === "bank"
                              ? "Bank"
                              : payment.payment_method}
                          </span>
                        </td>
                        <td className="py-2 px-2 sm:px-4 border-b font-medium truncate max-w-[80px]">
                          {payment.payment_method === "mpesa"
                            ? payment.mpesa_code
                            : payment.transaction_reference}
                        </td>
                        <td className="py-2 px-2 sm:px-4 border-b text-right">
                          KES {parseFloat(payment.amount).toLocaleString()}
                        </td>
                        <td className="py-2 px-2 sm:px-4 border-b hidden sm:table-cell">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-2 sm:px-4 border-b hidden md:table-cell truncate max-w-[150px]">
                          {payment.first_name} {payment.last_name}
                        </td>
                        <td className="py-2 px-2 sm:px-4 border-b text-center">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm"
                            onClick={() => viewPaymentDetails(payment.id)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-4 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "No transactions found matching your search"
                          : paymentTypeFilter !== "all"
                          ? `No ${paymentTypeFilter} transactions found`
                          : "No transactions found for the selected filters"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {filteredPayments.length > paymentsPerPage && (
              <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstPayment + 1} to{" "}
                  {Math.min(indexOfLastPayment, filteredPayments.length)} of{" "}
                  {filteredPayments.length} transactions
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Previous
                  </button>
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === number
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage ===
                      Math.ceil(filteredPayments.length / paymentsPerPage)
                    }
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage ===
                      Math.ceil(filteredPayments.length / paymentsPerPage)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Updated Payment Entry Form with M-Pesa and Bank options */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
              Enter Payment
            </h2>
            <form
              className="space-y-3 sm:space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handlePaymentSubmit();
              }}
            >
              {/* Payment Method Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentMethod: "mpesa",
                      })
                    }
                    className={`p-2 rounded border transition-colors ${
                      paymentForm.paymentMethod === "mpesa"
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold uppercase">
                        M-Pesa
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentMethod: "bank",
                      })
                    }
                    className={`p-2 rounded border transition-colors ${
                      paymentForm.paymentMethod === "bank" ||
                      !paymentForm.paymentMethod
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold uppercase">
                        Bank Transfer
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">
                    Student Admission Number
                  </label>
                  <input
                    type="text"
                    value={paymentForm.admissionNumber}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        admissionNumber: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. ADM001/2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        amount: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              {/* M-Pesa specific fields */}
              {paymentForm.paymentMethod === "mpesa" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">
                      M-Pesa Transaction Code
                    </label>
                    <input
                      type="text"
                      value={paymentForm.mpesaCode || ""}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          mpesaCode: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="e.g. QWE123XYZP"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">
                      M-Pesa Phone
                    </label>
                    <input
                      type="text"
                      value={paymentForm.mpesaPhone || ""}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          mpesaPhone: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="e.g. 07XXXXXXXX"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentDate: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">
                    Academic Term
                  </label>
                  <select
                    value={paymentForm.academicSessionId}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        academicSessionId: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="">Select Term</option>
                    {academicSessions.map((session) => (
                      <option key={session.id} value={session.id.toString()}>
                        Term {session.term} - {session.year}{" "}
                        {session.is_current ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Show different transaction reference field based on payment method */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">
                    {paymentForm.paymentMethod === "mpesa"
                      ? "Transaction Reference"
                      : "Bank Reference Number"}
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transactionReference}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        transactionReference: e.target.value,
                      })
                    }
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                      paymentForm.paymentMethod === "mpesa"
                        ? "focus:ring-green-500"
                        : "focus:ring-blue-500"
                    } text-sm`}
                    placeholder={
                      paymentForm.paymentMethod === "mpesa"
                        ? "Additional reference (optional)"
                        : "Bank reference number"
                    }
                    required={paymentForm.paymentMethod === "bank"}
                  />
                </div>

                {/* Bank-specific fields */}
                {paymentForm.paymentMethod === "bank" && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">
                      Bank Name
                    </label>
                    <select
                      value={paymentForm.bankName || ""}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          bankName: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select bank</option>
                      <option value="kcb">KCB</option>
                      <option value="equity">Equity</option>
                      <option value="cooperative">Co-operative</option>
                      <option value="absa">ABSA</option>
                      <option value="stanbic">Stanbic</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}

                {/* Additional bank field for branch */}
                {paymentForm.paymentMethod === "bank" &&
                  paymentForm.bankName && (
                    <div className="col-span-full">
                      <label className="block text-xs sm:text-sm font-medium mb-1">
                        Bank Branch
                      </label>
                      <input
                        type="text"
                        value={paymentForm.bankBranch || ""}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            bankBranch: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="e.g. Nairobi Main"
                      />
                    </div>
                  )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Notes
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      notes: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Additional notes"
                  rows="2"
                ></textarea>
              </div>

              <button
                type="submit"
                className={`w-full p-2 rounded font-medium transition duration-150 text-white ${
                  paymentForm.paymentMethod === "mpesa"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Record{" "}
                {paymentForm.paymentMethod === "mpesa" ? "M-Pesa" : "Bank"}{" "}
                Payment
              </button>
            </form>
          </div>
        </div>

        {/* Payment Details Modal */}
        {showModal && selectedPayment && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-black opacity-50 w-full h-full absolute"></div>
            <div className="relative bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold">
                  {selectedPayment.payment_method === "mpesa"
                    ? "M-Pesa"
                    : selectedPayment.payment_method === "bank"
                    ? "Bank"
                    : selectedPayment.payment_method.charAt(0).toUpperCase() +
                      selectedPayment.payment_method.slice(1)}{" "}
                  Payment Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-700 hover:text-gray-900 text-2xl focus:outline-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Receipt Number
                    </p>
                    <p className="font-medium">
                      {selectedPayment.receipt_number}
                    </p>
                  </div>
                  {selectedPayment.payment_method === "mpesa" && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        M-Pesa Code
                      </p>
                      <p className="font-medium">
                        {selectedPayment.mpesa_code}
                      </p>
                    </div>
                  )}
                  {selectedPayment.payment_method === "bank" && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Bank Name
                      </p>
                      <p className="font-medium capitalize">
                        {selectedPayment.bank_name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Amount</p>
                    <p className="font-medium text-base sm:text-lg">
                      KES {parseFloat(selectedPayment.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Student</p>
                    <p className="font-medium">
                      {selectedPayment.first_name} {selectedPayment.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedPayment.admission_number}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Payment Date
                    </p>
                    <p className="font-medium">
                      {new Date(
                        selectedPayment.payment_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Status</p>
                    <p
                      className={`font-medium ${
                        selectedPayment.payment_status === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedPayment.payment_status === "success"
                        ? "Success"
                        : "Failed"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Payment Method
                  </p>
                  <p className="font-medium capitalize">
                    {selectedPayment.payment_method}
                  </p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Transaction Reference
                  </p>
                  <p className="font-medium">
                    {selectedPayment.transaction_reference || "N/A"}
                  </p>
                </div>

                {selectedPayment.bank_branch && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Bank Branch
                    </p>
                    <p className="font-medium">{selectedPayment.bank_branch}</p>
                  </div>
                )}

                {selectedPayment.mpesa_phone && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      M-Pesa Phone
                    </p>
                    <p className="font-medium">{selectedPayment.mpesa_phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Academic Term
                  </p>
                  <p className="font-medium">
                    Term {selectedPayment.term} - {selectedPayment.year}
                  </p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Class & Stream
                  </p>
                  <p className="font-medium">
                    {selectedPayment.current_class} {selectedPayment.stream}
                  </p>
                </div>

                {selectedPayment.notes && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Notes</p>
                    <p>{selectedPayment.notes || "No additional notes"}</p>
                  </div>
                )}
              </div>

              {/* Updated modal buttons with separate action buttons */}
              <div className="mt-6 flex flex-wrap justify-between">
                <button
                  onClick={() => printReceipt(selectedPayment)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-150 flex-1 sm:flex-none flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print Receipt
                </button>

                <button
                  onClick={() => downloadPdfReceipt(selectedPayment)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-150 flex-1 sm:flex-none flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800  px-4 py-2 rounded transition duration-150 flex-1 sm:flex-none"
                >
                  Close
                </button>
                {/* <button
                  onClick={() => {
                    // In a real app, this would send the receipt to the student's email
                    alert("Email functionality would be implemented here");
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition duration-150 flex-1 sm:flex-none flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Email Receipt
                </button> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
};

export default FinanceDashboard;

export async function loader({ params }) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    console.log();
    // If no token exists, redirect to login
    if (!token) {
      return redirect("/");
    }

    const tokenUrl = "/backend/api/auth/verify-token";

    const tokenResponse = await fetch(tokenUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const tokenData = await tokenResponse.json();

    // If token is invalid or expired
    if (!tokenResponse.ok) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }

    return null;
  } catch (error) {
    console.error("Error loading timetable:", error);
    return {
      error: {
        message: error.message,
        status: error.status || 500,
      },
    };
  }
}
