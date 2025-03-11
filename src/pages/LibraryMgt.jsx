import React, { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  Users,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useStore } from "../store/store";
import Navbar from "../components/navbar";
import { redirect, useLoaderData } from "react-router-dom";

const LibraryManagement = () => {
  const data = useLoaderData();
  const [errorMessage, setErrorMessage] = useState(""); // Error state
  // State management
  const [books, setBooks] = useState(data);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [borrowerDetails, setBorrowerDetails] = useState({
    adminNo: "",
    name: "",
  });

  const [showBookDialog, setShowBookDialog] = useState(false);
  const [bookFormData, setBookFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    total_copies: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const { updateActiveModule, activeModule } = useStore();

  useEffect(() => {
    updateActiveModule("library");
  }, [activeModule]);

  // Filter books based on search query
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery)
  );

  // Check for overdue books
  const overdueBooks = books.filter(
    (book) => book.status === "borrowed" && new Date(book.dueDate) < new Date()
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5;

  // Pagination calculations
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Borrow book function
  const handleBorrow = async () => {
    if (!selectedBook || !borrowerDetails.name) return;

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks borrowing period

      const response = await fetch(
        `http://localhost:5010/api/library/books/${selectedBook.id}/borrow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            borrower_name: borrowerDetails.name,
            borrower_type: "student",
            borrower_contact: borrowerDetails.adminNo,
            borrow_date: new Date().toISOString().split("T")[0],
            due_date: dueDate.toISOString().split("T")[0],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to borrow book");

      setBooks(
        books.map((book) =>
          book.id === selectedBook.id
            ? {
                ...book,
                status: "borrowed",
                borrower: borrowerDetails.name,
                dueDate: dueDate.toISOString().split("T")[0],
              }
            : book
        )
      );

      setShowBorrowDialog(false);
      setBorrowerDetails({ adminNo: "", name: "" });
      setSelectedBook(null);
      setErrorMessage(""); // Clear error on success
    } catch (error) {
      setErrorMessage(error.message);
      console.error("Error borrowing book:", error);
    }
  };
  // Book management functions
  const handleAddBook = () => {
    setIsEditing(false);
    setBookFormData({ title: "", author: "", isbn: "", total_copies: "" });
    setShowBookDialog(true);
  };
  const handleEditBook = (book) => {
    setIsEditing(true);
    setBookFormData({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      total_copies: book.total_copies,
    });
    setShowBookDialog(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      const response = await fetch(
        `http://localhost:5010/api/library/books/${bookId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete book");

      setBooks(books.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handleSaveBook = async () => {
    try {
      const url = isEditing
        ? `http://localhost:5010/api/library/books/${bookFormData.id}`
        : `http://localhost:5010/api/library/books`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(bookFormData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save book");

      if (isEditing) {
        setBooks(
          books.map((book) =>
            book.id === bookFormData.id ? { ...book, ...bookFormData } : book
          )
        );
      } else {
        setBooks([...books, data.data]); // Append newly added book
      }

      setShowBookDialog(false);
      setBookFormData({ title: "", author: "", isbn: "" });
    } catch (error) {
      console.error("Error saving book:", error);
    }
  };
  // Return book function
  const handleReturn = async (bookId) => {
    try {
      const response = await fetch(
        `http://localhost:5010/api/library/books/${bookId}/return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to return book");

      setBooks(
        books.map((book) =>
          book.id === bookId
            ? { ...book, status: "available", borrower: null, dueDate: null }
            : book
        )
      );
    } catch (error) {
      console.error("Error returning book:", error);
    }
  };

  return (
    <Navbar>
      <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm m-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Library Management
          </h1>
          <div className="flex gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              <BookOpen className="w-4 h-4 mr-2" />
              {books.length} Books
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              <Users className="w-4 h-4 mr-2" />
              {books.filter((b) => b.status === "borrowed").length} Borrowed
            </span>
          </div>
        </div>

        {overdueBooks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-600">
              {overdueBooks.length} book(s) are overdue. Please check the list
              below.
            </p>
          </div>
        )}

        {showBookDialog && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black opacity-50"></div>

            {/* Dialog Content */}
            <div className="relative bg-white rounded-lg max-w-md w-full p-6 z-50">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? "Edit Book" : "Add New Book"}
              </h3>
              <div className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="Book Title"
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  value={bookFormData.title}
                  onChange={(e) =>
                    setBookFormData({ ...bookFormData, title: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Author"
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  value={bookFormData.author}
                  onChange={(e) =>
                    setBookFormData({ ...bookFormData, author: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="ISBN"
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  value={bookFormData.isbn}
                  onChange={(e) =>
                    setBookFormData({ ...bookFormData, isbn: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Total Copies"
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  value={bookFormData.total_copies}
                  onChange={(e) =>
                    setBookFormData({
                      ...bookFormData,
                      total_copies: e.target.value,
                    })
                  }
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowBookDialog(false);
                      setBookFormData({ title: "", author: "", isbn: "" });
                    }}
                    className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBook}
                    disabled={
                      !bookFormData.title ||
                      !bookFormData.author ||
                      !bookFormData.isbn
                    }
                    className="px-4 py-2 border rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {isEditing ? "Save Changes" : "Add Book"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Book Catalog
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage and track all library books
            </p>

            <div className="mt-6 flex gap-4 justify-between">
              <button
                onClick={handleAddBook}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Book
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, author, or ISBN..."
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ISBN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Copies Available
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrower
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBooks.map((book) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.isbn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.total_copies ? book.total_copies : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            !book.borrower
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {book.borrower ? "Unavailable" : "Available"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.borrower || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={
                            book.due_date &&
                            new Date(book.due_date) < new Date()
                              ? "text-red-600 font-medium"
                              : "text-gray-900"
                          }
                        >
                          {book.due_date
                            ? new Date(book.due_date)
                                .toISOString()
                                .split("T")[0]
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {!book.borrower ? (
                          <button
                            onClick={() => {
                              setSelectedBook(book);
                              setShowBorrowDialog(true);
                            }}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Borrow
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReturn(book.id)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center m-4 space-x-2">
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {showBorrowDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black opacity-50"></div>

            {/* Dialog Content */}
            <div className="relative bg-white rounded-lg max-w-md w-full p-6 z-60">
              <h3 className="text-lg font-medium text-gray-900">Borrow Book</h3>
              <p className="mt-2 text-sm text-gray-600">
                Enter borrower details for{" "}
                <span className="font-bold">"{selectedBook?.title}"</span> for 2
                weeks
              </p>
              <div className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="Borrower's Admission No:"
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={borrowerDetails.adminNo}
                  onChange={(e) =>
                    setBorrowerDetails({
                      ...borrowerDetails,
                      adminNo: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Borrower's name"
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={borrowerDetails.name}
                  onChange={(e) =>
                    setBorrowerDetails({
                      ...borrowerDetails,
                      name: e.target.value,
                    })
                  }
                />
                {errorMessage && (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md">
                    {errorMessage}
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowBorrowDialog(false);
                      setBorrowerName("");
                      setSelectedBook(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBorrow}
                    disabled={!borrowerDetails}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Borrow
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
};

export default LibraryManagement;

export async function loader({ params, request }) {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // If no token exists, redirect to login
  if (!token) {
    return redirect("/");
  }

  
  try {

    const tokenUrl = "http://localhost:5010/api/auth/verify-token";

    const tokenResponse = await fetch(tokenUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const tokenData = await tokenResponse.json();
    console.log(tokenData)
    // If token is invalid or expired
    if (!tokenResponse.ok || tokenData.error) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }

    // API endpoint for fetching books
    const apiUrl = `http://localhost:5010/api/library/books`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response Status:", response.status);

    // Handle authentication failure
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }

    // Parse the response data
    const data = await response.json();
    console.log("API Response:", data);

    // Check if the response contains a valid book list
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to fetch books data");
    }

    // Return book data
    return data.data; // Ensures only the books array is returned
  } catch (error) {
    console.error("Error fetching books data:", error);

    return {
      error: true,
      message:
        error.message || "Failed to fetch books. Please try again later.",
    };
  }
}
