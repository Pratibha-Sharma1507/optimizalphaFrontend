import React, { useEffect, useState } from "react";
import axios from "axios";
import { ShieldCheck } from "lucide-react";

export default function Roles() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch users and roles
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  //  Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/getUsers");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  };

  //  Fetch all roles (static list from backend)
  const fetchRoles = async () => {
    try {
      const res = await axios.get("/getRoles");
      setRoles(res.data);
    } catch (error) {
      console.error("Error fetching roles:", error.message);
    }
  };

  //  Assign role
  const handleAssignRole = async (userId, roleId) => {
    if (!roleId) return alert("⚠️ Please select a role first!");
    setLoading(true);
    try {
      await axios.post("/assignRole", { userId, roleId });
      alert("Role assigned successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error assigning role:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 transition-colors duration-300 -mt-20">
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-lg p-8 w-full max-w-4xl transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <ShieldCheck className="w-12 h-12 text-blue-600 dark:text-blue-500 mb-2" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Assign Roles to Users
          </h2>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            Select a role for each user and assign it easily.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-neutral-800/60 text-gray-800 dark:text-neutral-300">
              <tr>
                <th className="px-4 py-3 text-left">User Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Current Role</th>
                <th className="px-4 py-3 text-left">Assign Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    {/*  entity_name instead of name */}
                    <td className="px-4 py-2">{user.name}</td>

                    {/*  email field same */}
                    <td className="px-4 py-2">{user.email}</td>

                    {/*  show current role */}
                    <td className="px-4 py-2">
                      {user.role ? (
                        <span className="px-2 py-1 text-xs rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                          {user.role}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-neutral-400">
                          No Role
                        </span>
                      )}
                    </td>

                    {/*  Assign Role dropdown */}
                    <td className="px-4 py-2 flex items-center">
                      <select
                        value={selectedRole[user._id] || ""}
                        onChange={(e) =>
                          setSelectedRole({
                            ...selectedRole,
                            [user._id]: e.target.value,
                          })
                        }
                        className="px-2 py-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50 text-gray-900 dark:text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                          <option key={role._id} value={role._id}>
                            {role.roleName}
                          </option>
                        ))}
                      </select>

                      {/* Assign button */}
                      <button
                        onClick={() =>
                          handleAssignRole(user._id, selectedRole[user._id])
                        }
                        disabled={!selectedRole[user._id] || loading}
                        className={`ml-2 px-3 py-1 text-xs rounded-lg font-medium transition-all duration-300 ${
                          loading
                            ? "bg-blue-800 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                        } text-white`}
                      >
                        {loading ? "Assigning..." : "Assign"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-4 text-gray-500 dark:text-neutral-400"
                  >
                    No users found.
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
