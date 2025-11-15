import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileUp, UploadCloud } from "lucide-react";

export default function Uploader() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState("");

  //  Get logged-in user's account_id from API or localStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Example: assuming backend has /api/current-user endpoint
        const res = await axios.get("/upload/current-user", {
          withCredentials: true,
        });
        setAccountId(res.data.account_id);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  // ✅ File selection validation
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (
      selected &&
      (selected.name.endsWith(".csv") ||
        selected.name.endsWith(".xlsx") ||
        selected.name.endsWith(".xls"))
    ) {
      setFile(selected);
      setMessage("");
    } else {
      setMessage("⚠️ Please upload a valid CSV or Excel file.");
      setFile(null);
    }
  };

  // ✅ Upload handler
  const handleUpload = async () => {
    if (!file) {
      setMessage("No file selected.");
      return;
    }

    if (!accountId) {
      setMessage("Account ID not found. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("account_id", accountId); // 👈 important

    try {
      setLoading(true);
      const res = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setMessage(res.data.message || "File uploaded successfully!");
      setFile(null);
      document.getElementById("file-upload").value = "";
    } catch (err) {
      console.error(err);
      setMessage(" File upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 py-6 sm:py-0 transition-colors duration-300">
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-md text-center transition-all duration-300 overflow-y-auto">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-500" />
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
          Upload Your File
        </h2>
        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-6">
          Supported formats:{" "}
          <span className="text-blue-600 dark:text-blue-400">CSV</span>,{" "}
          <span className="text-blue-600 dark:text-blue-400">XLSX</span>,{" "}
          <span className="text-blue-600 dark:text-blue-400">XLS</span>
        </p>

        {/* File Upload Box */}
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl p-4 sm:p-6 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 bg-gray-50 dark:bg-neutral-900/50"
        >
          <FileUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-sm text-gray-700 dark:text-neutral-300 break-all">
            {file ? file.name : "Click to select a file"}
          </span>
          <input
            id="file-upload"
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`mt-6 w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
            loading
              ? "bg-blue-800 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
          }`}
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

        {/* Message */}
        {message && (
          <p className="mt-4 text-sm bg-gray-100 dark:bg-neutral-800/60 text-gray-800 dark:text-neutral-300 p-2 rounded-lg transition-all duration-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
