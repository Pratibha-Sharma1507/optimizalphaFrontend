import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function DeltaVisionAssetClassChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("Asset Class");
  const [selectedPeriods, setSelectedPeriods] = useState(["FY 2025"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const viewByOptions = [
    "Asset Class",
    "Sub-Asset Class",
    "Geography",
    "Custodian",
    "Entity",
  ];

  const allPeriods = [
    "FY 2025",
    "FY 2024",
    "FY 2023",
    "FY 2022",
    "FY 2021",
  ];

  //  Fetch backend data (only for FY 2025)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/assetclass1");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching Asset Class data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Check if selected year(s) have available data
  const has2025Data = selectedPeriods.includes("FY 2025");

  // ✅ Prepare chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item) => ({
      name: item.asset_class || "Unknown",
      "Week Return (%)": Math.abs(parseFloat(item["1w_return_pct"] || 0) ),
      "Month Return (%)": Math.abs(parseFloat(item["mtd_return_pct"] || 0) ),
      "Year Return (%)": Math.abs(parseFloat(item["fytd_return_pct"] || 0) ),
    }));
  }, [data]);

  if (loading)
    return (
      <div className="text-center text-gray-500 dark:text-gray-300 py-10">
        Loading Delta Vision data...
      </div>
    );

  return (
    <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-5 mb-8 mt-10 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Delta Vision
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* View By Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-gray-400 dark:text-gray-500 font-medium">
              View By:
            </label>
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="border rounded px-2 py-1 dark:bg-[#1f1f1f] dark:text-white text-sm"
            >
              {viewByOptions.map((view) => (
                <option key={view} value={view}>
                  {view}
                </option>
              ))}
            </select>
          </div>

          {/* Compare Periods Dropdown */}
          <div className="flex items-center gap-2 relative">
            <label className="text-gray-400 dark:text-gray-500 font-medium">
              Compare Periods:
            </label>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center justify-between w-[180px] border rounded px-2 py-1 text-sm dark:bg-[#1f1f1f] dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
              <span className="truncate font-semibold text-gray-900 dark:text-white">
                {selectedPeriods.length > 0
                  ? selectedPeriods.join(", ")
                  : "Select FY"}
              </span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-9 w-44 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 p-2">
                {allPeriods.map((year) => (
                  <label
                    key={year}
                    className="flex items-center gap-2 text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPeriods.includes(year)}
                      onChange={() => {
                        setSelectedPeriods((prev) =>
                          prev.includes(year)
                            ? prev.filter((y) => y !== year)
                            : [...prev, year]
                        );
                      }}
                      className="accent-green-500 cursor-pointer"
                    />
                    <span
                      className={
                        selectedPeriods.includes(year)
                          ? "text-green-500 font-semibold"
                          : "text-gray-700 dark:text-neutral-300"
                      }
                    >
                      {year}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Chart or “No Data” Message */}
      {/* ✅ Chart or “No Data” Message */}
<div className="w-full h-[420px] flex flex-col items-center justify-center">
  {has2025Data ? (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2c" />
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            interval={0}
            angle={0}
            textAnchor="middle"
            height={40}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(v) => `${v.toFixed(2)}%`}
            contentStyle={{
              backgroundColor: "#1f1f1f",
              border: "1px solid #333",
              color: "#fff",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "#fff" }} />

          <Bar dataKey="Week Return (%)" fill="#16a34a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Month Return (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Year Return (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Optional message if extra unavailable FYs were selected */}
      {selectedPeriods.some((p) => p !== "FY 2025") && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Data is currently available only for <b>FY 2025</b>.
        </p>
      )}
    </>
  ) : (
    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
      📊 No data available for selected period.
    </p>
  )}
</div>

    </div>
  );
}
