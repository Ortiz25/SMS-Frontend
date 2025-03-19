import React, { useState } from "react";
import { Mail, Building2, AlertTriangle, CheckCircle, Loader } from "lucide-react";
import { Form, Link } from "react-router-dom";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        "http://localhost:5010/api/password/forgotpassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again later.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="absolute top-10 lg:left-20 flex items-center justify-center bg-gray-100">
          <Building2 className="mr-2 size-12" />
          <h1 className="text-4xl font-bold">Shule SMS</h1>
        </div>
        <div className="w-full max-w-sm md:max-w-lg">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 shadow-2xl"
          >
            <h1 className="text-center p-4 text-4xl font-semibold">
              Reset Password
            </h1>
            
            {message && (
              <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm font-medium text-green-800">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
              </div>
            )}
            
            <div className="mb-6">
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="email"
              >
                Email:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="shadow appearance-none border-2 rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:border-blue-400 focus:outline-none focus:shadow-outline"
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin mr-2 h-5 w-5" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" /> Reset Password
                  </>
                )}
              </button>
              <Link
                className="inline-block align-baseline font-bold text-md text-blue-500 hover:text-blue-800 transition-colors duration-200"
                to="/"
              >
                Sign in?
              </Link>
            </div>
          </form>
          <p className="text-center text-gray-500 text-md">
            &copy;2025 Livecrib. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPass;