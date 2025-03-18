import React, { useEffect, useState } from "react";
import { Building2, Eye, EyeOff, Loader } from "lucide-react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import { Outlet } from "react-router-dom";

const PasswordRecovery = () => {
  const [showPassword, updateShowPassword] = useState(false);
  const error = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isLoading = navigation.state === "loading";
  const isSubmitting = navigation.state === "submitting";

  function handleClick() {
    updateShowPassword(!showPassword);
  }

  useEffect(() => {
    if (error?.success) {
      console.log(error?.success);

      // Delay navigation for 5 seconds (5000 ms)
      const timeoutId = setTimeout(() => {
        navigate("/dashboard");
      }, 5000);

      // Clean up the timeout if the component unmounts or error changes
      return () => clearTimeout(timeoutId);
    }
  }, [error, navigate]);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        {/* Logo Section */}
        <div className="absolute top-10 lg:left-20 flex items-center justify-center  bg-gray-100">
          <Building2 className="mr-2 size-12" />
          <h1 className="text-4xl font-bold">Shule SMS</h1>
        </div>

        <div className="w-full max-w-sm md:max-w-lg">
          <Form
            method="post"
            className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 shadow-2xl"
          >
            <h1 className="text-center p-4 text-4xl font-semibold">
              Create New Password
            </h1>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="password"
              >
                New Password:
              </label>
              <div className="relative">
                <input
                  className="shadow appearance-none border-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:border-blue-400 focus:outline-none focus:shadow-outline"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter New password"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={handleClick}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="cpassword"
              >
                Retype Password:
              </label>
              <div className="relative">
                <input
                  className="shadow appearance-none border-2 focus:border-blue-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="cpassword"
                  type={showPassword ? "text" : "password"}
                  name="cpassword"
                  placeholder="Retype New password"
                  required
                  minLength="8"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={handleClick}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>
            
            {/* Custom styled alerts */}
            {error?.success && (
              <div className="p-4 mb-4 rounded-md bg-green-50 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{error.success}</p>
                  </div>
                </div>
              </div>
            )}
            
            {error?.message && (
              <div className="p-4 mb-4 rounded-md bg-red-50 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error.message}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center"
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {(isSubmitting || isLoading) ? (
                  <>
                    <Loader className="animate-spin mr-2" size={16} />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
              <Link
                className="inline-block align-baseline font-bold text-md text-blue-500 hover:text-blue-800 transition-colors duration-200"
                to="/resetpassword"
              >
                Resend Email?
              </Link>
            </div>
          </Form>
          <Outlet />
          <p className="text-center text-gray-500 text-md">
            &copy;2025 Teqova. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default PasswordRecovery;

export async function action({ request, params }) {
  const formData = await request.formData();
  const newPassword = formData.get("password");
  const confirmPassword = formData.get("cpassword");
  const error = {};

  // Get the full URL from the request object
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  console.log(token, newPassword, confirmPassword);
  if (newPassword !== confirmPassword) {
    error.message = "Passwords don't Match !!!";
    return error;
  }
  const data = { token: token, newPassword: newPassword };
  try {
    const response = await fetch(
      "http://localhost:5010/api/password/resetpassword",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const dataRes = await response.json();
    if (dataRes.message === "token expired") {
      error.message = "Token expired, resend reset Email";
      return error;
    }

    if (response.ok) {
      error.success = "Password Reset Successful";
      return error;
    }
  } catch (error) {
    console.log(error);
  }
  return null;
}