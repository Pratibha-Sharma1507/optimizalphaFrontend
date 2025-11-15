import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assests/optimiz-logo.png";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  //  Password Validation Function
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    //  Check Password Strength
   if (!validatePassword(password)) {
  setError("Weak password. Use 8+ chars with A-Z, a-z, 0-9 & symbol.");
  return;
}


    setLoading(true);
    try {
      const response = await axios.post(
        "/api/userregister",
        {
          username: fullName,
          email,
          password,
        },
        { withCredentials: true }
      );

      if (response.data.Status === "Success") {
        setSuccess("Signup successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.Error) {
        setError(err.response.data.Error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f111a] text-white">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#1a1d29] rounded-2xl shadow-lg border border-[#2c3243] p-6">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 mb-1">
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
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

          {/* Signup Form */}
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-[#0f111a] border border-[#2c3243] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#26c6da]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0f111a] border border-[#2c3243] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#26c6da]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0f111a] border border-[#2c3243] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#26c6da]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-[#26c6da]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/*  Password Hint */}
              <p className="text-gray-400 text-xs mt-1">
                Must include 8+ chars, upper/lowercase, number, and symbol.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7e57c2] to-[#26c6da] text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-all duration-200"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-[#26c6da] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
