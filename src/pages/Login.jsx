import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import logo from "../assests/optimiz-logo.png";

export default function LoginPage({ setLoggedIn }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError === "authentication_failed" || oauthError === "no_token") {
      setError("Google authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://optimizalphabackend.onrender.com/api/loginuser",
        { email, password, role },
        { withCredentials: true }
      );

      if (response.data.Status === "Success") {
        setSuccess("Login successful! Redirecting...");
        await new Promise((resolve) => setTimeout(resolve, 800));
        console.log(role)
        console.log(response.data)
        localStorage.setItem('pan', response.data.user.pan_id);
        localStorage.setItem('role', role);
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response?.data?.Error) {
        setError(err.response.data.Error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://optimizalphabackend.onrender.com/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f111a] text-white px-3">
      <div className="w-full max-w-sm bg-[#1a1d29] rounded-xl shadow-lg border border-[#2c3243] p-5">
        {/*  Logo & Heading */}
        <div className="flex flex-col items-center mb-4">
          <img
                          src={logo}
                          alt="Company Logo"
                          className="h-10 w-10 rounded"
                          style={{
                            backgroundColor: "white",
                            borderRadius: "3.25rem",
                            width: "6.25rem",
                            height: "6.25rem",
                          }}
                        />
          <h2 className="text-lg font-semibold mt-2">Welcome Back</h2>
          <p className="text-gray-400 text-xs">Sign in to continue</p>
        </div>

        {/* Error/Success */}
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        {success && <p className="text-green-500 text-xs mb-2">{success}</p>}

        {/* Form */}
        <form className="space-y-3" onSubmit={handleLogin}>
          {/* Email */}
          <div>
            <label className="block text-xs text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f111a] border border-[#2c3243] rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#26c6da]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f111a] border border-[#2c3243] rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#26c6da]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1.5 text-gray-400 hover:text-[#26c6da]"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Role */}
          {/* <div>
            <label className="block text-xs text-gray-300 mb-1">Role</label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#0f111a] border border-[#2c3243] rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#26c6da]"
            >
              <option value="">Select Role</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div> */}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#7e57c2] to-[#26c6da] text-white font-medium py-2 rounded-md text-sm hover:opacity-90 transition-all duration-150"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-3">
          <hr className="flex-1 border-gray-700" />
          <span className="text-gray-400 text-xs">OR</span>
          <hr className="flex-1 border-gray-700" />
        </div>

        {/* Google Login */}
        {/* <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 rounded-md text-sm hover:opacity-90 transition-all duration-150"
        >
          <FcGoogle size={16} /> Google Sign-In
        </button> */}

        {/* Signup */}
        <p className="text-center text-gray-400 text-xs mt-3">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#26c6da] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
