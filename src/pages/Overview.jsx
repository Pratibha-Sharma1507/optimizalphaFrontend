import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import AllocationPerformance from "../components/AllocationPerformance";
import  DeltaVisionAssetClassChart from "../components/DeltaVisionWithFilters";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
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

const API_ENDPOINT = "https://optimizalphabackend.onrender.com/api/account";

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

export default function Overview() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef();
  const { currency } = useOutletContext();
 
    const hasFetchedRef = useRef(false); // To prevent double fetch
const [selectedPan, setSelectedPan] = useState(localStorage.getItem("selectedPan") || "All");
    
  const allocationOptions = ['Asset Class', 'Currency', 'Custodian', 'Member'];
  const distributionOptions = [
    'Account',
    'Asset Class',
    'Currency',
    'Custodian',
    'Product Type',
    'Sub Asset Class',
  ];

   const toggleGroup = (group) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  };

 
const fetchPortfolios = async () => {
  try {
    setLoading(true);

    const accountId = localStorage.getItem("acc");

    let url = "";

   
    if (selectedPan === "All") {
      url = `${API_ENDPOINT}?currency=${currency}`;
    } else {
      url = `https://optimizalphabackend.onrender.com/api/pan-summary/${accountId}/${selectedPan}?currency=${currency}`;
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



useEffect(() => {
  fetchPortfolios();
}, [currency, selectedPan]);



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
      { title: "Daily", key: "daily_return_pct" },
      { title: "3-Day", key: "3d_return_pct" },
      { title: "1-Week", key: "1w_return_pct" },
      { title: "MTD", key: "mtd_return_pct" },
      { title: "FYTD", key: "fytd_return_pct" },
  ];

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


  const deltaVisionData = [
    { name: "North America", FY2022: 4000, FY2023: 3600, FY2024: 4200 },
    { name: "Germany", FY2022: 3000, FY2023: 3800, FY2024: 3500 },
    { name: "Asia Region", FY2022: 4200, FY2023: 4100, FY2024: 3900 },
    { name: "Latin America", FY2022: 3000, FY2023: 3400, FY2024: 3200 },
    { name: "Middle East", FY2022: 2800, FY2023: 3000, FY2024: 3100 },
  ];

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

  const toggleExpand = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-neutral-100 p-3 sm:p-4 md:p-6">
      {/* TOP STATS */}
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 md:gap-12 mb-4 md:mb-6">
  {topStatsKeys.map((key) => (
    <div key={key} className="min-w-0">
      <p className="text-[10px] text-gray-500 dark:text-neutral-500 mb-1 uppercase tracking-wide">
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
  {/* Left scroll button */}
  <button
    onClick={() =>
      scrollRef.current.scrollBy({ left: -350, behavior: "smooth" })
    }
    className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white p-2 rounded-full z-10"
  >
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 4L6 8l4 4" />
    </svg>
  </button>

  {/* Scrollable cards */}
  <div
    ref={scrollRef}
    className="flex overflow-x-auto gap-3 scrollbar-hide scroll-smooth px-1"
  >
    {horizontalItems.map((item, i) => {
      const rawValue = first[item.key];
      const numericValue = rawValue != null ? Number(rawValue) : null;
      const isNegative = numericValue < 0;
      const lineColor = isNegative ? "#ef4444" : "#22c55e";

      // Small random/simulated trend line (you can replace with real trend data)
      const trendData = Array.from({ length: 8 }, (_, j) => ({
        value:
          numericValue +
          (Math.random() - 0.5) * (isNegative ? 0.6 : 0.4),
      }));

      return (
        <div
          key={i}
          className="bg-white dark:bg-[#141414] p-4 rounded-lg border border-gray-200 dark:border-neutral-800 min-w-[180px] sm:min-w-[200px] flex-shrink-0 shadow-sm hover:shadow-md transition"
        >
          {/* Title */}
          <p className="text-[10px] text-gray-500 dark:text-neutral-500 uppercase">
            {item.title}
          </p>

          {/* Value + line */}
          <div className="flex items-center justify-between mt-1">
            {/* Value */}
            <h3
              className={`text-xl font-bold ${
                isNegative ? "text-red-400" : "text-green-400"
              }`}
            >
             {numericValue != null && !isNaN(numericValue)
      ? `${numericValue > 0 ? "+" : ""}${numericValue.toFixed(3)}%`
      : "—"}
            </h3>

            {/* ✅ Small right-side sparkline */}
            <div className="w-[55px] h-[24px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient
                      id={`gradient-${i}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={lineColor}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor={lineColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={lineColor}
                    fill={`url(#gradient-${i})`}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* Right scroll button */}
  <button
    onClick={() =>
      scrollRef.current.scrollBy({ left: 350, behavior: "smooth" })
    }
    className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white p-2 rounded-full z-10"
  >
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  </button>
</div>

  <AllocationPerformance></AllocationPerformance>
  < DeltaVisionAssetClassChart />


      {/* DELTA VISION */}
    

      {/* PERFORMANCE VS BENCHMARK + SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-8 md:mt-12">
        {/* Left: Performance vs Benchmark */}
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-4 sm:p-5 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Performance vs Benchmark</h2>
          <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { month: "Sep'24", performance: 0, nifty: 0 },
                  { month: "Oct'24", performance: 5, nifty: 4 },
                  { month: "Nov'24", performance: 10, nifty: 9 },
                  { month: "Dec'24", performance: 15, nifty: 13 },
                  { month: "Jan'25", performance: 20, nifty: 17 },
                  { month: "Feb'25", performance: 22, nifty: 18 },
                ]}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e5e5" className="dark:stroke-[#2c2c2c]" />
                <XAxis dataKey="month" stroke="#9ca3af" className="dark:stroke-[#6b6b6b]" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" className="dark:stroke-[#6b6b6b]" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="performance" stroke="#34d399" strokeWidth={2} />
                <Line type="monotone" dataKey="nifty" stroke="#fbbf24" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Performance Snapshot */}
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-4 sm:p-5 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Performance Snapshot</h2>
          <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Opening", value: 0.8 },
                  { name: "Inflow", value: 0.175 },
                  { name: "Gain", value: 0.175 },
                  { name: "Int. Sum", value: 1.15 },
                  { name: "Loss", value: -0.14 },
                  { name: "Outflow", value: -0.25 },
                  { name: "Closing", value: 0.76 },
                ]}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e5e5" className="dark:stroke-[#2c2c2c]" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  className="dark:stroke-[#6b6b6b]" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9ca3af" className="dark:stroke-[#6b6b6b]" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PORTFOLIO DRAWDOWN + RISK METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-8 md:mt-12">
        {/* Drawdown */}
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

        {/* Risk Metrics */}
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