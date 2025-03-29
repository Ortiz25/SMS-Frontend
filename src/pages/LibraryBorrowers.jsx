import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Filter,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  DollarSign,
  BookOpen
} from "lucide-react";
import { useStore } from "../store/store";
import Navbar from "../components/navbar";
import { redirect, Link, useNavigate } from "react-router-dom";

const Borrowers = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, overdue, active
  const [stats, setStats] = useState({
    total: 0,
    overdue: 0,
    students: 0,
    teachers: 0,
    others: 0
  });
  const { updateActiveModule } = useStore();
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    updateActiveModule("library");
    fetchBorrowers();
  }, [filter, searchQuery]);

  const fetchBorrowers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }
  
      // Use the dedicated borrowers endpoint we created
      const endpoint = filter === "overdue" 
        ? "/backend/api/library/borrowers/overdue"
        : searchQuery
          ? `/backend/api/library/borrowers/search?search=${encodeURIComponent(searchQuery)}`
          : "/backend/api/library/borrowers";
      
      //console.log("Requesting endpoint:", endpoint);
      //console.log("Using token:", token.substring(0, 10) + "..." + (token.length > 20 ? token.substring(token.length - 10) : ""));
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", response.status, errorText);
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          return;
        }
        
        throw new Error(`Failed to fetch borrowers: ${response.status} ${errorText}`);
      }
  
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch borrowers");
      }
      
      //console.log("Received borrowers data:", data);
      
      // Set the borrowers from the API response
      setBorrowers(data.data || []);
      
      // If we have stats, store them separately
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching borrowers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `/backend/api/library/books/${bookId}/return`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to return book");
      }

      // Update local state instead of refetching all data
      setBorrowers(borrowers.filter(book => book.book_id !== bookId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        overdue: prev.overdue - (borrowers.find(b => b.book_id === bookId)?.status === 'overdue' ? 1 : 0)
      }));
      
      // Show success message
      alert(`Book has been successfully returned to the library.`);
    } catch (err) {
      console.error("Error returning book:", err);
      // Show error notification
      setError(err.message);
    }
  };
  
  const handleExtendLoan = async (book) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      // Calculate new due date (extend by 7 days from current due date)
      const currentDueDate = new Date(book.due_date);
      const newDueDate = new Date(currentDueDate);
      newDueDate.setDate(newDueDate.getDate() + 7);
      
      // Send extension request to server
      const response = await fetch(
        `/backend/api/library/books/${book.book_id}/extend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            new_due_date: newDueDate.toISOString().split('T')[0],
            borrowing_id: book.id // Pass the borrowing record ID
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extend loan period");
      }
      
      // Update the borrowers list with the new due date
      setBorrowers(
        borrowers.map(b => 
          b.id === book.id 
            ? { 
                ...b, 
                due_date: newDueDate.toISOString().split('T')[0],
                status: 'borrowed', // Reset status from 'overdue' if applicable
                is_overdue: false,
                fine_amount: 0 // Reset fine amount as we've extended
              } 
            : b
        )
      );
      
      // If the book was overdue, update stats
      if (book.status === 'overdue') {
        setStats(prev => ({
          ...prev,
          overdue: Math.max(0, prev.overdue - 1)
        }));
      }
      
      alert(`Loan period extended for "${book.title}" until ${newDueDate.toLocaleDateString()}`);
    } catch (err) {
      console.error("Error extending loan:", err);
      setError(err.message);
    }
  };

  const handleSendReminder = async (borrower) => {
    // In a real implementation, this would send an email or SMS to the borrower
    alert(`Reminder sent to ${borrower.borrower} for book "${borrower.title}"`);
  };

  // Filter borrowers based on search query and selected filter
  const filteredBorrowers = borrowers.filter(book => {
    const matchesSearch = 
      book.borrower_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.borrower_contact?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "overdue") {
      // Check both status and due date
      return matchesSearch && (
        book.status === 'overdue' || 
        (book.due_date && new Date(book.due_date) < new Date())
      );
    }
    if (filter === "active") {
      return matchesSearch && 
        book.status !== 'overdue' && 
        (book.due_date && new Date(book.due_date) >= new Date());
    }
    return matchesSearch;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBorrowers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBorrowers.length / itemsPerPage);

  // Check if there are any overdue books
  const overdueCount = borrowers.filter(book => 
    new Date(book.due_date) < new Date()
  ).length;

  // Days remaining calculation
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const differenceInTime = due.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    return differenceInDays;
  };

  return (
    <Navbar>
      <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm m-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link 
              to="/library" 
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Borrowers
            </h1>
          </div>
          
          <div className="flex gap-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              <Users className="w-4 h-4 mr-2" />
              {borrowers.length} Borrowed Books
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Calendar className="w-4 h-4 mr-2" />
              {borrowers.filter(b => new Date(b.due_date) >= new Date()).length} Active
            </span>
            {overdueCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <AlertCircle className="w-4 h-4 mr-2" />
                {overdueCount} Overdue
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                filter === "all" 
                  ? "bg-blue-100 text-blue-800 border border-blue-200" 
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              All Borrowers
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                filter === "active" 
                  ? "bg-green-100 text-green-800 border border-green-200" 
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <Clock className="w-4 h-4 mr-1" />
              Active Loans
            </button>
            <button
              onClick={() => setFilter("overdue")}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                filter === "overdue" 
                  ? "bg-red-100 text-red-800 border border-red-200" 
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              Overdue
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <form onSubmit={(e) => {
                e.preventDefault();
                fetchBorrowers();
              }}>
                <input
                  type="text"
                  placeholder="Search by borrower or book title..."
                  className="pl-10 w-full md:w-80 rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : borrowers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Borrowed Books</h3>
            <p className="mt-1 text-sm text-gray-500">Currently no books are checked out from the library.</p>
            <div className="mt-4">
              <Link 
                to="/library" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Go to Book Catalog
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrower
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrowed Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((book) => {
                    // Use the is_overdue flag from API or calculate based on due date
                    const isOverdue = book.is_overdue || book.status === 'overdue' || (book.due_date && new Date(book.due_date) < new Date());
                    const daysRemaining = getDaysRemaining(book.due_date);
                    
                    return (
                      <tr key={book.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {book.full_name || book.borrower_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {book.borrower_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {book.identifier || book.borrower_contact || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{book.title}</div>
                          <div className="text-xs text-gray-500">By {book.author}</div>
                          {book.isbn && <div className="text-xs text-gray-400">ISBN: {book.isbn}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {book.borrow_date ? new Date(book.borrow_date).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-500"}>
                            {book.due_date ? new Date(book.due_date).toLocaleDateString() : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isOverdue ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Overdue by {Math.abs(daysRemaining)} days
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {daysRemaining} days remaining
                            </span>
                          )}
                          {book.fine_amount > 0 && (
                            <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <DollarSign className="w-3 h-3 mr-1" /> 
                              Fine: KES {parseFloat(book.fine_amount).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleReturn(book.book_id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Return
                          </button>
                          {!isOverdue && (
                            <button
                              onClick={() => handleExtendLoan(book)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200"
                            >
                              <Calendar className="w-3 h-3 mr-1" /> Extend Loan
                            </button>
                          )}
                          {isOverdue && (
                            <button
                              onClick={() => handleSendReminder(book)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              <Mail className="w-3 h-3 mr-1" /> Send Reminder
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-4 space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 border rounded-md text-gray-700 bg-gray-100">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Navbar>
  );
};

export default Borrowers;

export async function loader() {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // If no token exists, redirect to login
  if (!token) {
    return redirect("/");
  }

  try {
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
    if (!tokenResponse.ok || tokenData.error) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }

    return null;
  } catch (error) {
    console.error("Error verifying token:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return redirect("/");
  }
}