import React, { useEffect, useState } from "react";
import { Shield, Eye, EyeOff, Loader, Mail, Building2 } from "lucide-react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigate,
  useNavigation,
} from "react-router-dom";

const LoginPage = () => {
  const [showPassword, updateShowPassword] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";
  const navigate = useNavigate();

  const errors = useActionData();

  useEffect(() => {
    if (
      errors?.email ===
      "Please reset your Registration Password, Redirecting..."
    ) {
      const timeoutId = setTimeout(() => {
        navigate("/resetpassword");
      }, 5001);
      return () => clearTimeout(timeoutId);
    }
  }, [errors]);

  function handleClick() {
    updateShowPassword(!showPassword);
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 ">
        <div className="absolute top-10 lg:left-20 flex items-center justify-center  bg-gray-100">
          <Building2 className="mr-2 size-12" />
          <h1 className="text-4xl font-bold">Shule SMS</h1>
        </div>

        <div className="w-full max-w-sm md:max-w-lg ">
          <Form
            method="post"
            className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 shadow-2xl "
          >
            <h1 className="text-center p-4 text-4xl font-semibold">Login</h1>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="username"
              >
                Username:
              </label>
              <input
                className="shadow appearance-none border-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:border-blue-400 focus:outline-none focus:shadow-outline"
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="relative mb-6 ">
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="password"
              >
                Password:
              </label>
              <input
                className="shadow appearance-none border-2 focus:border-blue-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="password"
                required
                minLength="8"
              />
              {errors && (
                <p className="text-red-500 text-md text-bold italic">
                  {errors.message}
                </p>
              )}
              {showPassword ? (
                <EyeOff
                  className={`absolute right-5 ${
                    errors?.message ? "bottom-10" : "bottom-5"
                  }`}
                  onClick={handleClick}
                />
              ) : (
                <Eye
                  className={`absolute right-5 ${
                    errors?.message? "bottom-10" : "bottom-5"
                  }`}
                  onClick={handleClick}
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                {isSubmitting || isLoading ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <></>
                )}
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
              <Link
                className="inline-block align-baseline font-bold text-md text-blue-500 hover:text-blue-800"
                to="/forgotpassword"
              >
                Forgot Password?
              </Link>
            </div>
          </Form>
          <p className="text-center text-gray-500 text-md">
            &copy;2025 Stratlix. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

export async function action({ request, params }) {
  const data = await request.formData();
  const errors = {};
  // Get form data
  const loginData = {
    username: data.get("username").trim().toLocaleLowerCase(),
    password: data.get("password").trim(),
  };
  // Validate input (optional)
  if (!loginData.username) {
    errors.username = "Username is required";
    return errors;
  }
  if (!loginData.password) {
    errors.password = "Password is required";
    return errors;
  }
  try {
    // Set correct API endpoint for our backend
    let loginUrl = "/backend/api/auth/login";
    const loginResponse = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });
    const loginResult = await loginResponse.json(); // Changed variable name here
    
    // Handle successful login
    if (loginResponse.ok) {
      // Store token
      localStorage.setItem("token", loginResult.token); // Using the renamed variable
      
      // Fetch user profile with the token
      try {
        const profileUrl = "/backend/api/auth/user-profile";
        const profileResponse = await fetch(profileUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loginResult.token}` // Using the renamed variable
          }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
         // console.log(profileData)
          // Store complete user info with profile data
          localStorage.setItem("user", JSON.stringify(profileData.user));
        } else {
          // If profile fetch fails, store basic user info
          localStorage.setItem("user", JSON.stringify(loginResult.user)); // Using the renamed variable
        }
      } catch (profileError) {
        console.error("Error fetching user profile:", profileError);
        // Fall back to basic user data if profile fetch fails
        localStorage.setItem("user", JSON.stringify(loginResult.user)); // Using the renamed variable
      }
      
      // Return success and redirect
      return redirect("/dashboard");
    }
    console.log(loginResponse)
    // Handle specific error responses
    if (loginResponse.status === 404) {
      errors.message = loginResult.error || "User not found"; // Using the renamed variable
      return errors;
    }
    if (loginResponse.status === 401) {
      errors.message = loginResult.error || "Invalid credentials"; // Using the renamed variable
      return errors;
    }
    // Handle any other error
    errors.message = loginResult.error || "Login failed"; // Using the renamed variable
    return errors;
  } catch (error) {
    // Handle network or unexpected errors
    console.error("Login error:", error);
    errors.message = "Connection failed. Please try again.";
    return errors;
  }
}

export async function loader() {
  // Check if we have a token in localStorage
  const token = localStorage.getItem("token");
  
  // If no token exists, allow access to login page
  if (!token) {
    return null;
  }
  
  try {
    // Set correct API endpoint for our backend
    const url = "/backend/api/auth/verify-token";
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });
    
    const userData = await response.json();
    
    // If token is invalid or expired
    if (!response.ok || userData.error) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
    
    // Token is valid, redirect to dashboard
    return redirect("/dashboard");
    
  } catch (error) {
    // Handle network errors by clearing token and allowing login
    console.error("Token verification failed:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}