import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users as UsersIcon, RefreshCcw } from "lucide-react";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  //  Fetch all users from backend
  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.get("https://optimizalphabackend.onrender.com/api/allusers", {
        withCredentials: true,
      });

      //  Handle all possible response structures
      const data = res.data.Users || res.data.users || res.data;

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.warn(" Unexpected API response:", res.data);
        setUsers([]);
        setErrorMsg(
          res.data?.Error ||
            "Unexpected response. Only Super Admins can access this."
        );
      }
    } catch (error) {
      console.error(" Error fetching users:", error);
      setErrorMsg(
        error.response?.data?.Error ||
          "Failed to fetch users. Please try again later."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //  Search filter
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const query = search.toLowerCase();
        return (
          user.entity_name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query)
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 transition-colors duration-300 -mt-20">
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-lg p-8 w-full max-w-5xl transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <UsersIcon className="w-12 h-12 text-blue-600 dark:text-blue-500 mb-2" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Registered Users
          </h2>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            View all registered users and their assigned roles.
          </p>
        </div>

        {/*  Search & Refresh */}
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50 text-gray-900 dark:text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchUsers}
            disabled={loading}
            className={`ml-2 flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
            }`}
          >
            <RefreshCcw
              className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="text-center mb-3 text-red-600 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-neutral-800/60 text-gray-800 dark:text-neutral-300">
              <tr>
                <th className="px-4 py-3 text-left">Entity ID</th>
                <th className="px-4 py-3 text-left">Entity Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-4 text-gray-500 dark:text-neutral-400"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.entity_id}
                    className="border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <td className="px-4 py-2">{user.entity_id || "—"}</td>
                    <td className="px-4 py-2">{user.entity_name || "—"}</td>
                    <td className="px-4 py-2">{user.email || "—"}</td>
                    <td className="px-4 py-2">
                      {user.role ? (
                        <span className="px-2 py-1 text-xs rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 capitalize">
                          {user.role}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-neutral-400">
                          No Role
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-4 text-gray-500 dark:text-neutral-400"
                  >
                    {errorMsg
                      ? "Access denied or no users available."
                      : "No users found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
