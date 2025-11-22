import React, { useState, useMemo } from "react";
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
  const [selectedView, setSelectedView] = useState("Asset Class");
  const [selectedPeriods, setSelectedPeriods] = useState(["FY 2025"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const viewByOptions = ["Asset Class", "Sub-Asset Class", "Geography", "Custodian", "Entity", "Total Group"];
  const allPeriods = ["FY 2025", "FY 2024", "FY 2023", "FY 2022", "FY 2021"];

  /** ---------------------- REAL DATA SUPPORT ---------------------- **/
  const staticData = [
    {
       entity: "Entity 1",
      returns: {
        "FY 2025": 10.1,
        "FY 2024": 5.8,
        "FY 2023": 2.2,
        "FY 2022": -1.5,
        "FY 2021": 8.5,
      },
   
      asset_class: "Equity",
      returns: {
        "FY 2025": 10.1,
        "FY 2024": 5.8,
        "FY 2023": 2.2,
        "FY 2022": -1.5,
        "FY 2021": 8.5,
      },
    },
    {

      asset_class: "Fixed Income",
      returns: {
        "FY 2025": 6.2,
        "FY 2024": 4.3,
        "FY 2023": -1.1,
        "FY 2022": 2.9,
        "FY 2021": 4.8,
      },
    },
    {
 
      asset_class: "Alternative Investments",
      returns: {
        "FY 2025": 9.1,
        "FY 2024": 6.9,
        "FY 2023": 2.4,
        "FY 2022": -0.5,
        "FY 2021": 6.4,
      },
    },
    {
   
      asset_class: "Cash",
      returns: {
        "FY 2025": 2.2,
        "FY 2024": 1.8,
        "FY 2023": 1.2,
        "FY 2022": 1.1,
        "FY 2021": 1.5,
      },
    },
  ];

  const hasData = selectedPeriods.length > 0;

  /** ---------------------- LOGIC FOR VIEW SELECTION ---------------------- **/
  const chartData = useMemo(() => {
  if (!staticData.length) return [];

  // ---- If Entity is selected → only first entity row show ----
  if (selectedView === "Entity") {
    const entityRow = staticData.find(item => item.entity);

    if (!entityRow) return [];

    const obj = { name: entityRow.entity };
    
    selectedPeriods.forEach(period => {
      obj[period] = Math.abs(entityRow.returns?.[period] || 0);
    });

    return [obj]; // <-- Always single row
  }

  // ---- Asset Class Mode → Show all asset classes ----
  return staticData.map(item => {
    const label = item.asset_class || "Unknown Asset Class";
    const obj = { name: label };

    selectedPeriods.forEach(period => {
      obj[period] = Math.abs(item.returns?.[period] || 0);
    });

    return obj;
  });

}, [staticData, selectedPeriods, selectedView]);

  const barColors = ["#16a34a", "#f59e0b", "#3b82f6", "#a855f7", "#ef4444"];

  return (
    <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-5 mb-8 mt-10 transition-colors duration-300">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Delta Vision
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">

          {/* View By */}
          <div className="flex items-center gap-2">
            <label className="text-gray-400 dark:text-gray-500 font-medium">View By:</label>
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="border rounded px-2 py-1 dark:bg-[#1f1f1f] dark:text-white text-sm"
            >
              {viewByOptions.map((view) => (
                <option key={view} value={view}>{view}</option>
              ))}
            </select>
          </div>

          {/* Compare Periods */}
          <div className="flex items-center gap-2 relative">
            <label className="text-gray-400 dark:text-gray-500 font-medium">Compare Periods:</label>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center justify-between w-[180px] border rounded px-2 py-1 text-sm dark:bg-[#1f1f1f] dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
              <span className="truncate font-semibold text-gray-900 dark:text-white">
                {selectedPeriods.join(", ")}
              </span>
              <svg
                className={`w-4 h-4 transform transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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
                  <label key={year} className="flex items-center gap-2 text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPeriods.includes(year)}
                      onChange={() =>
                        setSelectedPeriods((prev) =>
                          prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
                        )
                      }
                      className="accent-green-500 cursor-pointer"
                    />
                    <span className={selectedPeriods.includes(year)
                      ? "text-green-500 font-semibold"
                      : "text-gray-700 dark:text-neutral-300"}>
                      {year}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[420px] flex flex-col items-center justify-center">
        {hasData ? (
         <ResponsiveContainer width="100%" height="100%">
  <BarChart
  data={chartData}
  margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
  barCategoryGap={selectedView === "Entity" ? "70%" : "20%"}
  barGap={selectedView === "Entity" ? 5 : 10}
  barSize={selectedView === "Entity" ? 38 : undefined}
  activeBar={false}
>
  <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2c" />
  <XAxis dataKey="name" />
  <YAxis />
<Tooltip
  cursor={{ fill: "rgba(255,255,255,0.05)" }}   // <-- VERY SOFT HOVER EFFECT
  contentStyle={{
    backgroundColor: "#1f1f1f",
    borderRadius: "8px",
    border: "1px solid #333",
  }}
  itemStyle={{ color: "#fff", fontWeight: 600 }}
  labelStyle={{ color: "#fff" }}
/>

  <Legend />

  {selectedPeriods.map((period, i) => (
    <Bar
      key={period}
      dataKey={period}
      fill={barColors[i % barColors.length]}
      radius={[6, 6, 0, 0]}
    />
  ))}
</BarChart>

</ResponsiveContainer>

        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No data available for selected period.</p>
        )}
      </div>
    </div>
  );
}
