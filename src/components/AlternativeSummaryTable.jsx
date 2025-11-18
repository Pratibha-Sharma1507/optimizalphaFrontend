import React, { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const API_BASE = "https://optimizalphabackend.onrender.com/api";

export default function AlternativeSummaryTable() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [subData, setSubData] = useState({});
  const [expandedSub, setExpandedSub] = useState({});
  const [portfolioData, setPortfolioData] = useState({});
  const [loading, setLoading] = useState(true);
    const [allocationOption, setAllocationOption] = useState("Asset Class");
  const [distributionOption, setDistributionOption] = useState("Account");
    const { currency } = useOutletContext();

  const allocationOptions = ["Asset Class", "Currency", "Custodian", "Member"];
  const [openDropdown, setOpenDropdown] = useState(null);

  const distributionOptions = [
    "Account",
    "Category",
    "Portfolio Name",
    "Stock Ticker"
  ];
  

//   const formatNumber = (value) => {
//     if (value == null || isNaN(value)) return "—";
//     const num = Number(value);
//     return num.toLocaleString("en-IN", {
//       minimumFractionDigits: 3,
//       maximumFractionDigits: 3,
//     });
//   };

  

  //  Level 1 – Fetch Asset Class 1 Summary
 useEffect(() => {
  const fetchData = async () => {
    try {
      //  Fetch data with dynamic currency
      const res = await axios.get(`${API_BASE}/assetclass1?currency=${currency}`);

      // Filter only 'Cash' data
      const cashOnly = res.data.filter(
        (item) => item.asset_class?.toLowerCase() === "alternative investments"
      );

      if (cashOnly.length > 0) {
        const allCols = Object.keys(cashOnly[0]);
        const filteredCols = allCols.filter(
          (col) =>
            !["pan", "account", "latest_date", "previous_date"].includes(
              col.toLowerCase()
            )
        );
        setColumns(filteredCols);
        setData(cashOnly);
      } else {
        setColumns([]);
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching Cash summary:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [currency]); // re-fetch whenever currency changes


  // Level 2 – Fetch Asset Class 2 Summary
  const handleLevel1Click = async (assetClass) => {
    if (expanded === assetClass) {
      setExpanded(null);
      return;
    }

    setExpanded(assetClass);

    if (subData[assetClass]) return;

    try {
      const res = await axios.get(
        `${API_BASE}/assetclass2/${assetClass}?currency=${currency}`
      );
      setSubData((prev) => ({ ...prev, [assetClass]: res.data }));
    } catch (err) {
      console.error(`Error fetching Level 2 for ${assetClass}:`, err);
    }
  };


  //  Level 3 – Fetch Portfolio Details
  const handleLevel2Click = async (asset1, asset2) => {
    const key = `${asset1}-${asset2}`;

    // Toggle expand/collapse
    setExpandedSub((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    //  Always fetch fresh data when expanding
    if (!expandedSub[key]) {
      try {
        // Optional: clear old cache first
        setPortfolioData((prev) => ({ ...prev, [key]: [] }));

        const res = await axios.get(
          `${API_BASE}/portfolio/details/${asset1}/${asset2}?currency=${currency}`
        );

        console.log(" Fresh API Response:", res.data);

        setPortfolioData((prev) => ({ ...prev, [key]: res.data }));
      } catch (err) {
        console.error(
          ` Error fetching portfolio for ${asset1} → ${asset2}:`,
          err
        );
      }
    }
  };


  const formatValue = (v, isCurrency = false) => {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  const symbol = currency === "INR" ? "₹" : "$";
  const locale = currency === "INR" ? "en-IN" : "en-US";


  if (!isCurrency) return n.toLocaleString(locale);

  //  Unit logic for INR
  if (currency === "INR") {
    if (n >= 10000000) return `${symbol}${(n / 10000000).toFixed(2)}Cr`;
    if (n >= 100000) return `${symbol}${(n / 100000).toFixed(2)}L`;
    if (n >= 1000) return `${symbol}${(n / 1000).toFixed(2)}K`;
    return `${symbol}${n.toLocaleString(locale)}`;
  }

  //  Unit logic for USD
  if (currency === "USD") {
    if (n >= 1000000000) return `${symbol}${(n / 1000000000).toFixed(2)}B`;
    if (n >= 1000000) return `${symbol}${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `${symbol}${(n / 1000).toFixed(2)}K`;
    return `${symbol}${n.toLocaleString(locale)}`;
  }

  return `${symbol}${n.toLocaleString(locale)}`;
};



  //  FIXED: Recognizes avg_3d_return_pct and avg_1w_return_pct
  const findValue = (obj, col) => {
    const colLower = col.toLowerCase();

    if (obj[col] !== undefined) return obj[col];

    //  Handles Level 2 keys (with avg_ prefix)
    if (colLower.includes("3d"))
      return (
        obj["avg_3d_return_pct"] ??
        obj["3d_return_pct"] ??
        obj["avg_three_day_return_pct"]
      );

    if (colLower.includes("1w"))
      return (
        obj["avg_1w_return_pct"] ??
        obj["1w_return_pct"] ??
        obj["avg_one_week_return_pct"]
      );

    // Fuzzy fallback
    const possible = Object.keys(obj).find((k) =>
      k.toLowerCase().includes(colLower)
    );
    if (possible) return obj[possible];

    return "—";
  };

  if (loading)
    return <div className="text-center text-gray-500 py-6">Loading data...</div>;
  if (!data.length)
    return <div className="text-center text-gray-500 py-6">No data available.</div>;

  return (
    <div className="bg-white dark:bg-[#0e0e0e] text-gray-900 dark:text-white rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-800 overflow-hidden transition-colors duration-300">
      {/* Header */}
      {/* Allocation by Dropdown */}
     {/* Header Section */}
<div className="flex flex-wrap items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#111111]">
  {/* Title */}
  <h3 className="text-base font-semibold text-gray-700 dark:text-neutral-200">
    Allocation & Performance
  </h3>

  {/* Right Side Controls */}
  <div className="flex flex-wrap gap-5 text-xs items-center">
  {/* Allocation Dropdown */}
  <div className="flex items-center gap-2 relative">
    {/* Label outside the dropdown */}
    <span className="text-gray-400 dark:text-gray-500 font-medium">
      Allocation by:
    </span>

    {/* Dropdown Button */}
    {/* Allocation Button */}
<button
  onClick={() =>
    setOpenDropdown(openDropdown === "allocation" ? null : "allocation")
  }
  className="flex items-center justify-between min-w-[110px]
             bg-white dark:bg-[#0f0f0f]
             border border-gray-300 dark:border-[#2A2A2A]
             text-gray-700 dark:text-gray-200
             px-3 py-1.5 rounded-md
             hover:bg-gray-50 dark:hover:bg-[#1A1A1A]
             transition-all duration-200"
>
  <span className="font-semibold truncate">{allocationOption}</span>
  <svg
    className={`w-3 h-3 ml-2 transform transition-transform duration-200 ${
      openDropdown === "allocation" ? "rotate-180" : ""
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
  </svg>
</button>

{/* Dropdown Options */}
{openDropdown === "allocation" && (
  <div className="absolute right-0 top-8 
                  bg-white dark:bg-[#141414] 
                  border border-gray-200 dark:border-[#2A2A2A] 
                  rounded-md shadow-lg z-20 
                  w-[150px] py-1 
                  transition-all duration-200">
    {allocationOptions.map((option) => (
      <button
        key={option}
        onClick={() => {
          setAllocationOption(option);
          setOpenDropdown(null);
        }}
        className={`block w-full text-left px-4 py-2 text-xs rounded-sm transition-all duration-150 ${
          allocationOption === option
            ? "font-semibold bg-gray-100 dark:bg-[#1F1F1F] text-green-600 dark:text-green-400"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
        }`}
      >
        {option}
      </button>
    ))}
  </div>
)}

  </div>

  {/* Distribution Dropdown */}
  <div className="flex items-center gap-2 relative">
    {/* Label outside the dropdown */}
    <span className="text-gray-400 dark:text-gray-500 font-medium">
      Distribution by:
    </span>

    {/* Dropdown Button */}
 <button
  onClick={() =>
    setOpenDropdown(openDropdown === "distribution" ? null : "distribution")
  }
  className="flex items-center justify-between min-w-[130px] 
             bg-white dark:bg-[#0f0f0f] 
             border border-gray-300 dark:border-[#2A2A2A] 
             text-gray-700 dark:text-gray-200 
             px-3 py-1.5 rounded-md 
             hover:bg-gray-50 dark:hover:bg-[#1A1A1A] 
             transition-all duration-200"
>
  <span className="font-semibold truncate">{distributionOption}</span>
  <svg
    className={`w-3 h-3 ml-2 transform transition-transform duration-200 ${
      openDropdown === "distribution" ? "rotate-180" : ""
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
  </svg>
</button>


    {/* Dropdown Options */}
    {openDropdown === "distribution" && (
      <div className="absolute right-0 top-8 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-md shadow-lg z-20 w-[160px] py-1 transition-all">
  {distributionOptions.map((option) => (
    <button
      key={option}
      onClick={() => {
        setDistributionOption(option);
        setOpenDropdown(null);
      }}
      className={`block w-full text-left px-4 py-2 text-xs rounded-sm transition-all duration-150 ${
        distributionOption === option
          ? "font-semibold bg-gray-100 dark:bg-[#1F1F1F] text-green-600 dark:text-green-400"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
      }`}
    >
      {option}
    </button>
  ))}
</div>

    )}
  </div>
</div>
</div>

    
      {/* Table */}
  <table className="w-full border-collapse text-sm transition-all">
    {/* ===== HEADER ===== */}
    <thead className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-neutral-300 uppercase tracking-wide">
      <tr>
        {columns
          .filter((col) => col.toLowerCase() !== "currency") // remove currency column
          .map((col) => (
            <th
              key={col}
              className="px-3 py-3 text-left font-medium border-b border-gray-200 dark:border-neutral-800"
            >
              {col.replace(/_/g, " ")}
            </th>
          ))}
      </tr>
    </thead>

    {/* ===== BODY ===== */}
    <tbody>
      {data.map((row, idx) => {
        const assetClass = row.asset_class;
        const isExpanded = expanded === assetClass;
        const level2Rows = subData[assetClass] || [];

        return (
          <React.Fragment key={idx}>
            {/* LEVEL 1 ROW */}
            <tr
              className="cursor-pointer bg-white dark:bg-[#0E0E0E] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-all duration-200"
              onClick={() => handleLevel1Click(assetClass)}
            >
              {columns
                .filter((col) => col.toLowerCase() !== "currency")
                .map((col, i) => {
                  const colLower = col.toLowerCase();
                  const isCurrencyCol =
                    colLower === "today_total" || colLower === "yesterday_total";

                  return (
                    <td
                      key={col}
                      className="px-3 py-3 border-b border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-gray-100 font-medium"
                    >
                      {i === 0 ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block text-gray-400 text-xs transition-transform duration-200 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          >
                            ▸
                          </span>
                          <span className="font-semibold">
                            {row[col] ?? "—"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-800 dark:text-gray-300">
                          {formatValue(row[col], isCurrencyCol)}
                        </span>
                      )}
                    </td>
                  );
                })}
            </tr>

            {/* LEVEL 2 ROWS */}
            {isExpanded &&
              level2Rows.map((subRow, i) => {
                const asset2 = subRow["Asset Class_2"];
                const key = `${assetClass}-${asset2}`;
                const isSubExpanded = expandedSub[key];
                const portfolioRows = portfolioData[key] || [];

                return (
                  <React.Fragment key={key}>
                    <tr
                      className="cursor-pointer bg-gray-50 dark:bg-[#141414] hover:bg-gray-100 dark:hover:bg-[#1F1F1F] transition-all duration-200"
                      onClick={() => handleLevel2Click(assetClass, asset2)}
                    >
                      {columns
                        .filter((col) => col.toLowerCase() !== "currency")
                        .map((col, i) => {
                          const colLower = col.toLowerCase();
                          const isCurrencyCol =
                            colLower === "today_total" ||
                            colLower === "yesterday_total";
                          let value =
                            i === 0 ? asset2 : findValue(subRow, col);

                          return (
                            <td
                              key={col}
                              className="px-3 py-3 border-b border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-300"
                            >
                              {i === 0 ? (
                                <div className="flex items-center justify-between pl-6">
                                  <span>{asset2}</span>
                                  <span
                                    className={`inline-block text-gray-400 text-xs transition-transform duration-200 ${
                                      isSubExpanded ? "rotate-90" : ""
                                    }`}
                                  >
                                    ▸
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-800 dark:text-gray-300">
                                  {formatValue(value, isCurrencyCol)}
                                </span>
                              )}
                            </td>
                          );
                        })}
                    </tr>

                    {/* LEVEL 3 ROWS */}
                    {isSubExpanded &&
                      portfolioRows.map((p, j) => (
                        <tr
                          key={j}
                          className="bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#222222] transition-all duration-150"
                        >
                          {columns
                            .filter((col) => col.toLowerCase() !== "currency")
                            .map((col, i) => {
                              const colLower = col.toLowerCase();
                              const isCurrencyCol =
                                colLower === "today_total" ||
                                colLower === "yesterday_total";
                              let value =
                                p[col] !== undefined
                                  ? p[col]
                                  : findValue(p, col);

                              return (
                                <td
                                  key={col}
                                  className="px-3 py-2 border-b border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200"
                                >
                                  {i === 0 ? (
                                    <div className="pl-12">
                                      {/* Dynamic field mapping */}
                                      {(() => {
                                        const distKeyMap = {
                                          "Portfolio Name": "Portfolio Name",
                                          Category: "Category",
                                          "Stock Ticker":
                                            "Fund / Stock Ticker",
                                          Account: "Account",
                                        };
                                        const keyToDisplay =
                                          distKeyMap[distributionOption] ||
                                          "Portfolio Name";
                                        return p[keyToDisplay] ?? "—";
                                      })()}
                                    </div>
                                  ) : (
                                    <span className="text-gray-800 dark:text-gray-200">
                                      {formatValue(value, isCurrencyCol)}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
          </React.Fragment>
        );
      })}
    </tbody>
  </table>
    </div>
  );
}
