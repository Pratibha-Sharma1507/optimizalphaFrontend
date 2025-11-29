// import React from "react";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from "recharts";

// export default function PerformanceVsBenchmark() {
  
//   const chartData = [
//     { month: "Sep'24", performance: 0, nifty: 0 },
//     { month: "Oct'24", performance: 5, nifty: 4 },
//     { month: "Nov'24", performance: 10, nifty: 9 },
//     { month: "Dec'24", performance: 15, nifty: 13 },
//     { month: "Jan'25", performance: 20, nifty: 17 },
//     { month: "Feb'25", performance: 22, nifty: 18 },
//   ];

//   return (
//     <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-4 sm:p-5 md:p-6">
//       <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">
//         Performance vs Benchmark
//       </h2>

//       <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={chartData}>
//             <CartesianGrid
//               strokeDasharray="2 2"
//               stroke="#e5e5e5"
//               className="dark:stroke-[#2c2c2c]"
//             />

//             <XAxis
//               dataKey="month"
//               stroke="#9ca3af"
//               tick={{ fontSize: 11 }}
//               className="dark:stroke-[#6b6b6b]"
//             />

//             <YAxis
//               stroke="#9ca3af"
//               tick={{ fontSize: 11 }}
//               className="dark:stroke-[#6b6b6b]"
//             />

//             <Tooltip />
//             <Legend wrapperStyle={{ fontSize: "12px" }} />

//             <Line type="monotone" dataKey="performance" stroke="#34d399" strokeWidth={2} />
//             <Line type="monotone" dataKey="nifty" stroke="#fbbf24" strokeWidth={2} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import AllocationPerformance from "../components/AllocationPerformance";
import DeltaVisionAssetClassChart from "../components/DeltaVisionWithFilters";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import DrilldownPieChart from '../components/DrilldownPieChart';
import Select, { components } from "react-select";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

axios.defaults.withCredentials = true;

const API_ENDPOINT = "http://localhost:5500/api/account";

// Small sparkline component for Risk Metrics
const Sparkline = ({ data }) => (
  <svg viewBox="0 0 100 24" className="w-full h-5">
    <polyline
      fill="none"
      stroke={data?.[0] > data?.[data.length - 1] ? "#f87171" : "#4ade80"}
      strokeWidth="2"
      points={data.map((v, i) => `${i * 12},${24 - v}`).join(" ")}
    />
  </svg>
);

// Custom Option component with checkbox
const CheckboxOption = (props) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
        />
        <label className="cursor-pointer text-sm">{props.label}</label>
      </div>
    </components.Option>
  );
};

// Custom ValueContainer to show count
const CustomValueContainer = ({ children, ...props }) => {
  const { getValue, hasValue } = props;
  const selectedCount = getValue().length;
  
  if (!hasValue) {
    return <components.ValueContainer {...props}>{children}</components.ValueContainer>;
  }

  return (
    <components.ValueContainer {...props}>
      <div className="text-sm text-gray-200">
        {selectedCount} {selectedCount === 1 ? 'index' : 'indices'}
      </div>
    </components.ValueContainer>
  );
};

export default function Overview() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef();
  const { currency } = useOutletContext();
  const hasFetchedRef = useRef(false);
  const [selectedPan, setSelectedPan] = useState(localStorage.getItem("selectedPan") || "All");
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  // Comparison Chart States - UPDATED with 3 dropdowns
  const [comparisonData, setComparisonData] = useState([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);
  
  const [selectedAssetClass1, setSelectedAssetClass1] = useState({
    value: "equity",
    label: "Equity",
  });
  const [selectedAssetClass2, setSelectedAssetClass2] = useState(null);
  const [selectedIndices, setSelectedIndices] = useState([
    { value: "nifty50", label: "NIFTY 50", color: "#fbbf24" },
  ]);

  // Asset Class 1 options (main categories)
  const assetClass1Options = [
    { value: "equity", label: "Equity" },
    { value: "fixedIncome", label: "Fixed Income" },
    { value: "cash", label: "Cash" },
    { value: "alternative", label: "Alternative Investments" },
  ];

  // Asset Class 2 options (subcategories) - mapped to Asset Class 1
  const assetClass2OptionsMap = {
    equity: [
      { value: "equityListed", label: "Equity-Listed" },
      { value: "equityMF", label: "Equity-MF" },
      { value: "equityPEDirect", label: "Private Equity - Direct" },
      { value: "equityPEVC", label: "Private Equity - VC" },
    ],
    fixedIncome: [
      { value: "fixedIncomeMF", label: "Fixed Income-MF" },
    ],
    cash: [
      { value: "cashMMF", label: "Cash-MMF" },
    ],
    alternative: [
      { value: "aifREIT", label: "AIF-REIT" },
      { value: "aifHF", label: "AIF-HF" },
    ],
  };

  // Get Asset Class 2 options based on selected Asset Class 1
  const assetClass2Options = assetClass2OptionsMap[selectedAssetClass1?.value] || [];

  // UPDATED: Index options - Now with 5 indices
  const indexOptions = [
    { value: "nifty50", label: "NIFTY 50", color: "#fbbf24" },
    { value: "nse150", label: "NSE 150", color: "#64748b" },
    { value: "nse500", label: "NSE 500", color: "#7c3aed" },
    { value: "nseGscmp", label: "NSE GSCMP", color: "#e11d48" },
    { value: "overnightLiquid", label: "Overnight Liquid Rate", color: "#10b981" },
  ];

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const clientId = localStorage.getItem("client");
      let url = "";

      if (selectedPan === "All") {
        url = `${API_ENDPOINT}?currency=${currency}`;
      } else {
        url = `http://localhost:5500/api/pan-summary/${clientId}/${selectedPan}?currency=${currency}`;
      }

      console.log(" API Running:", url);
      const response = await axios.get(url, { withCredentials: true });
      setPortfolios(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    try {
      setComparisonLoading(true);
      setComparisonError(null);
      
      const clientId = localStorage.getItem("client") || "CLIENT1";
      
      // Build query parameters
      let queryParams = `assetClass1=${selectedAssetClass1.value}&client=${clientId}`;
      
      if (selectedAssetClass2) {
        queryParams += `&assetClass2=${selectedAssetClass2.value}`;
      }
      
      console.log(`Fetching comparison data with params: ${queryParams}`);
      
      const response = await axios.get(
        `http://localhost:5500/api/comparison-data?${queryParams}`,
        { withCredentials: false }
      );
      
      console.log('Comparison data received:', response.data.length, 'records');
      setComparisonData(response.data);
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      setComparisonError(error?.response?.data?.message || error.message);
      setComparisonData([]);
    } finally {
      setComparisonLoading(false);
    }
  };

  // Handle Asset Class 1 change - reset Asset Class 2
  const handleAssetClass1Change = (option) => {
    setSelectedAssetClass1(option);
    setSelectedAssetClass2(null);
    setComparisonData([]);
  };

  // Handle Asset Class 2 change
  const handleAssetClass2Change = (option) => {
    setSelectedAssetClass2(option);
  };

  useEffect(() => {
    fetchPortfolios();
  }, [currency, selectedPan]);

  useEffect(() => {
    // Fetch data when Asset Class 1 or 2 changes
    fetchComparisonData();
  }, [selectedAssetClass1, selectedAssetClass2]);

  useEffect(() => {
    const listener = () => {
      setSelectedPan(localStorage.getItem("selectedPan") || "All");
    };

    window.addEventListener("pan-update", listener);
    return () => window.removeEventListener("pan-update", listener);
  }, []);

  if (loading) return <p className="text-gray-900 dark:text-white p-4 md:p-6">Loading portfolios...</p>;
  if (error) return <p className="text-red-400 p-4 md:p-6">Error: {error}</p>;
  if (!portfolios.length) return <p className="text-gray-900 dark:text-white p-4 md:p-6">No portfolios found.</p>;

  const first = portfolios[0];
  const topStatsKeys = ["today_total"];

  const horizontalItems = [
    { title: "Daily", returnKey: "daily_return" },
    { title: "1-Week", returnKey: "1w_return" },
    { title: "1-Month", returnKey: "1m_return", valueKey: "1m_value" },
    { title: "3-Month", returnKey: "3m_return", valueKey: "3m_value" },
    { title: "6-Month", returnKey: "6m_return", valueKey: "6m_value" },
    { title: "MTD", returnKey: "mtd_return", valueKey: "mtd_value" },
    { title: "FYTD", returnKey: "fytd_return", valueKey: "fytd_value" },
  ];

  const formatValue = (v, isCurrency = false) => {
    if (v === null || v === undefined) return "—";
    const n = Number(v);
    if (Number.isNaN(n)) return v;

    const symbol = currency === "INR" ? "₹" : "$";
    const locale = currency === "INR" ? "en-IN" : "en-US";

    if (!isCurrency) return n.toLocaleString(locale);

    if (currency === "INR") {
      if (n >= 10000000) {
        const cr = n / 10000000;
        return `${symbol}${Number(cr.toPrecision(4)).toFixed(2)}Cr`;
      }
      if (n >= 100000) {
        const lakh = n / 100000;
        return `${symbol}${Number(lakh.toPrecision(4)).toFixed(2)}L`;
      }
      if (n >= 1000) {
        const k = n / 1000;
        return `${symbol}${Number(k.toPrecision(4)).toFixed(2)}K`;
      }
      return `${symbol}${n.toLocaleString(locale)}`;
    }

    if (currency === "USD") {
      if (n >= 1000000000) return `${symbol}${(n / 1000000000).toFixed(2)}B`;
      if (n >= 1000000) return `${symbol}${(n / 1000000).toFixed(2)}M`;
      if (n >= 1000) return `${symbol}${(n / 1000).toFixed(2)}K`;
      return `${symbol}${n.toLocaleString(locale)}`;
    }

    return `${symbol}${n.toLocaleString(locale)}`;
  };

  const drawdownData = [
    { month: "Sep'24", value: 0 },
    { month: "Oct'24", value: -7 },
    { month: "Nov'24", value: -11 },
    { month: "Dec'24", value: -9 },
    { month: "Jan'25", value: -8 },
    { month: "Feb'25", value: -9 },
  ];

  const riskMetrics = [
    { name: "Portfolio Volatility", portfolio: 12.8, benchmark: 14.5, trend: [2, 5, 6, 4, 5] },
    { name: "Beta", portfolio: 0.92, benchmark: 1, trend: [4, 4, 5, 5, 4] },
    { name: "Tracking Error", portfolio: 3.2, benchmark: 0, trend: [6, 5, 3, 4, 3] },
    { name: "Value At Risk (VaR)", portfolio: 2.4, benchmark: 2.8, trend: [5, 4, 3, 3, 4] },
    { name: "Drawdown", portfolio: 8.7, benchmark: 12.3, trend: [3, 4, 5, 4, 3] },
    { name: "Sharpe Ratio", portfolio: 1.8, benchmark: 1.4, trend: [3, 4, 4, 5, 5] },
    { name: "Sortino Ratio", portfolio: 2.3, benchmark: 1.9, trend: [3, 4, 4, 4, 5] },
    { name: "Information Ratio", portfolio: 0.65, benchmark: 0, trend: [4, 4, 5, 4, 4] },
    { name: "Maximum Drawdown", portfolio: 15.2, benchmark: 18.7, trend: [3, 4, 4, 5, 5] },
  ];

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "transparent",
      borderColor: "#404040",
      minHeight: "40px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#525252",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#1a1a1a",
      border: "1px solid #404040",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#2a2a2a" : "#1a1a1a",
      color: "#fff",
      cursor: "pointer",
      padding: "8px 12px",
      "&:active": {
        backgroundColor: "#3a3a3a",
      },
    }),
    multiValue: (base) => ({
      ...base,
      display: "none",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fff",
    }),
    input: (base) => ({
      ...base,
      color: "#fff",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#6b7280",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "2px 8px",
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-neutral-100 p-3 sm:p-4 md:p-6">
      {/* TOP STATS */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 md:gap-12 mb-4 md:mb-6">
        {topStatsKeys.map((key) => (
          <div key={key} className="min-w-0">
            <p className="text-[11px] text-gray-600 dark:text-white mb-1 uppercase tracking-wide">
              {key === "today_total" ? "PORTFOLIO VALUE" : key.replace(/_/g, " ")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
              {formatValue(first[key], true)}
            </h2>
          </div>
        ))}
      </div>

      {/* HORIZONTAL SCROLLABLE CARDS */}
      <div className="relative mb-8 md:mb-12">
        <button
          onClick={() =>
            scrollRef.current.scrollBy({ left: -350, behavior: "smooth" })
          }
          className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white p-2 rounded-full z-10"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 4L6 8l4 4" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 scrollbar-hide scroll-smooth px-1"
        >
          {horizontalItems.map((item, i) => {
            const returnValue = item.returnKey ? first[item.returnKey] : null;
            const numericReturn = returnValue != null ? Number(returnValue) : null;
            const value = item.valueKey ? first[item.valueKey] : null;

            const isNegative = numericReturn < 0;
            const lineColor = isNegative ? "#ef4444" : "#22c55e";

            const trendData = Array.from({ length: 8 }, () => ({
              value: numericReturn + (Math.random() - 0.5) * 0.4,
            }));

            return (
              <div
                key={i}
                className="bg-white dark:bg-[#141414] p-4 rounded-lg border border-gray-200 dark:border-neutral-800 min-w-[200px] sm:min-w-[220px] flex-shrink-0 shadow-sm hover:shadow-md transition"
              >
                <p className="text-[10px] text-gray-500 dark:text-gray-200 uppercase mb-2">
                  {item.title}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-medium text-gray-700 dark:text-gray-300 flex flex-col gap-1">
                    <span>
                      Return{" "}
                      <span className={`font-semibold ${isNegative ? "text-red-500" : "text-green-500"}`}>
                        {numericReturn != null ? `${numericReturn > 0 ? "+" : ""}${numericReturn.toFixed(2)}%` : "—"}
                      </span>
                    </span>

                    {value != null && (
                      <span>
                        Value{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {value != null ? formatValue(value, true) : "—"}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="w-[60px] h-[26px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={lineColor} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={lineColor}
                          fill={`url(#gradient-${i})`}
                          strokeWidth={2}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() =>
            scrollRef.current.scrollBy({ left: 350, behavior: "smooth" })
          }
          className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white p-2 rounded-full z-10"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      <AllocationPerformance />
      <DeltaVisionAssetClassChart />

      {/* PERFORMANCE VS BENCHMARK + SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-8 md:mt-12">
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-4 sm:p-5 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Asset Class vs Index Comparison
          </h2>

          {/* UPDATED: 3 Cascading Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Dropdown 1: Asset Class */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Asset Class</label>
              <Select
                options={assetClass1Options}
                value={selectedAssetClass1}
                onChange={handleAssetClass1Change}
                placeholder="Select asset class..."
                isSearchable={false}
                styles={selectStyles}
                classNamePrefix="select"
              />
            </div>

            {/* Dropdown 2: Sub Category */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Sub Category</label>
              <Select
                options={assetClass2Options}
                value={selectedAssetClass2}
                onChange={handleAssetClass2Change}
                placeholder="sub category..."
                isSearchable={false}
                isClearable
                styles={selectStyles}
                classNamePrefix="select"
              />
            </div>

            {/* Dropdown 3: Indices (Multi-select) */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Indices</label>
              <Select
                isMulti
                options={indexOptions}
                value={selectedIndices}
                onChange={setSelectedIndices}
                placeholder="Select indices..."
                isSearchable={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                blurInputOnSelect={false}
                menuIsOpen={menuIsOpen}
                onMenuOpen={() => setMenuIsOpen(true)}
                onMenuClose={() => setMenuIsOpen(false)}
                components={{ 
                  Option: CheckboxOption,
                  ValueContainer: CustomValueContainer
                }}
                styles={selectStyles}
                classNamePrefix="select"
              />
            </div>
          </div>

          {comparisonLoading ? (
            <div className="flex items-center justify-center h-[350px]">
              <p className="text-gray-600 dark:text-neutral-400">
                Loading comparison data...
              </p>
            </div>
          ) : comparisonError ? (
            <div className="flex items-center justify-center h-[350px]">
              <p className="text-red-400">Error: {comparisonError}</p>
            </div>
          ) : comparisonData.length === 0 ? (
            <div className="flex items-center justify-center h-[350px]">
              <p className="text-gray-600 dark:text-neutral-400">
                No data available
              </p>
            </div>
          ) : (
            <div className="w-full h-[280px] sm:h-[310px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparisonData}
                  margin={{ top: 5, right: 24, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2c" />
                  
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    tick={{ fontSize: 12 }}
                    interval={Math.floor(comparisonData.length / 6)}
                  />
                  
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  
                  <Legend wrapperStyle={{ fontSize: "13px" }} />

                  {/* Main Asset Class Line */}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name={selectedAssetClass2?.label || selectedAssetClass1?.label}
                    dot={{ fill: '#22c55e', r: 3 }}
                    activeDot={{ r: 5 }}
                  />

                  {/* Index Lines */}
                  {selectedIndices.map((index) => (
                    <Line
                      key={index.value}
                      type="monotone"
                      dataKey={index.value}
                      stroke={index.color}
                      strokeWidth={2}
                      name={index.label}
                      dot={{ fill: index.color, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* <DrilldownPieChart /> */}
      </div>

      {/* PORTFOLIO DRAWDOWN + RISK METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-8 md:mt-12">
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-4 sm:p-5 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Portfolio Drawdown</h2>
          <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={drawdownData}>
                <XAxis dataKey="month" stroke="#9ca3af" className="dark:stroke-[#666]" tick={{ fontSize: 11 }} />
                <YAxis domain={[-15, 0]} tickFormatter={(v) => `${v}%`} stroke="#9ca3af" className="dark:stroke-[#666]" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRed)"
                />
                <defs>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-4 sm:p-5 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Metrics</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-gray-600 dark:text-neutral-400 text-xs">
                    <th className="whitespace-nowrap">Name</th>
                    <th className="whitespace-nowrap">Portfolio</th>
                    <th className="whitespace-nowrap">Benchmark</th>
                    <th className="whitespace-nowrap">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {riskMetrics.map((item) => (
                    <tr key={item.name} className="hover:bg-gray-100 dark:hover:bg-neutral-800/40 text-xs sm:text-sm">
                      <td className="py-2 text-gray-900 dark:text-neutral-200 whitespace-nowrap">{item.name}</td>
                      <td className="py-2 text-gray-900 dark:text-neutral-200 whitespace-nowrap">{item.portfolio}</td>
                      <td className="py-2 text-gray-900 dark:text-neutral-200 whitespace-nowrap">{item.benchmark}</td>
                      <td className="py-2 w-[80px] sm:w-[100px]">
                        <Sparkline data={item.trend} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* EXPOSURE FINDER */}
      <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-4 sm:p-5 md:p-6 mt-8 md:mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Exposure Finder</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600 dark:text-neutral-400 whitespace-nowrap">Show Widgets:</label>
            <select
              className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-neutral-200 text-sm rounded-md px-2 py-1 focus:outline-none"
              defaultValue="2"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-neutral-700 rounded-md py-2 pl-10 pr-20 sm:pr-24 text-sm text-gray-900 dark:text-neutral-200 placeholder-gray-500 dark:placeholder-neutral-500 focus:outline-none"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-neutral-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
            />
          </svg>

          <select
            className="absolute right-2 top-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md text-gray-900 dark:text-neutral-200 text-xs sm:text-sm px-2 py-1 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Select</option>
            <option value="Equity">Equity</option>
            <option value="Fixed Income">Fixed Income</option>
            <option value="Alternative">Alternative</option>
          </select>
        </div>
      </div>
    </div>
  );
}
