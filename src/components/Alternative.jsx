import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useOutletContext } from "react-router-dom";
import AlternativeSummaryTable from "./AlternativeSummaryTable";


const API_ENDPOINT = "https://optimizalphabackend.onrender.com/api/alternative"; 

function KpiCard({ title, value, change, positive }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] transition-colors">
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between text-xs text-gray-600 dark:text-neutral-400">
        <span className="truncate">{title}</span>
        <span
          className={`font-medium whitespace-nowrap ml-2 ${
            positive ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {change}
        </span>
      </div>
      <div className="p-3 sm:p-4">
        <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="mt-2 h-6 sm:h-8 w-full rounded bg-gray-100 dark:bg-neutral-900" />
      </div>
    </div>
  );
}

export default function Alternative() {
  // Hooks at top
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
     const { currency } = useOutletContext();
  const scrollRef = useRef();

  const scroll = useCallback((dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -350 : 350,
        behavior: "smooth",
      });
    }
  }, []);

  const horizontalItems = useMemo(
    () => [
      { title: "Daily Return (%)", key: "daily_return_pct" },
      { title: "3-Day Return (%)", key: "3d_return_pct" },
      { title: "1-Week Return (%)", key: "1w_return_pct" },
      { title: "Month-to-Date Return (%)", key: "mtd_return_pct" },
      { title: "FYTD Return (%)", key: "fytd_return_pct" },
    ],
    []
  );

  //  Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINT);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Conditional rendering after hooks
  if (loading)
    return (
      <div className="text-center text-gray-700 dark:text-gray-300 py-10">
        Loading Fixed Income Data...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 dark:text-red-400 py-10">
        Error: {error}
      </div>
    );

  if (!data.length)
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-10">
        No data found.
      </div>
    );

  //  Extract first record
  const first = data[0];

  const todayChange =
    first.today_total && first.yesterday_total
      ? (first.today_total - first.yesterday_total).toFixed(2)
      : "0.00";

  const lastUpdated = first.latest_date
    ? new Date(first.latest_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const horizontalCardsData = horizontalItems.map((item) => {
    const rawValue = first[item.key];
    const numericValue =
      rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
    const isNegative = numericValue < 0;
    return { ...item, numericValue, isNegative };
  });

  //  Chart Data (Static)
  const subAssetData = [
    { name: "Equity", value: 35 },
    { name: "Debt", value: 30 },
    { name: "Options", value: 30 },
  ];
  const COLORS = ["#A8E6CF", "#FFD3B6", "#D6A2E8"];

  const issuerData = [
    { name: "REC LTD.", Price: 1200000, FX: 400000, Income: 200000 },
    { name: "NABARD", Price: 950000, FX: 350000, Income: 150000 },
    { name: "NTPC", Price: 870000, FX: 280000, Income: 130000 },
    { name: "Barclays", Price: 450000, FX: 180000, Income: 100000 },
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


  // Main UI
  return (
    <div className="space-y-4 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white min-h-screen p-3 sm:p-4 md:p-6 transition-colors duration-300">
      {/* ===== TOP SECTION ===== */}
      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] shadow-md transition-colors">
        <div className="p-4 sm:p-5">
          <div className="text-xs text-gray-600 dark:text-neutral-400 uppercase">
            Fixed Income Value
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
          {formatValue(first.today_total, true)}
          </div>
          <div className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
            Today's Change:{" "}
            <span
              className={
                Number(todayChange) < 0 ? "text-red-400" : "text-emerald-400"
              }
            >
              {todayChange}
            </span>{" "}
            · Last Updated: {lastUpdated}
          </div>
        </div>

        {/* Horizontal KPI Cards */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 scrollbar-hide scroll-smooth px-3 pb-3"
        >
          {horizontalCardsData.map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#141414] p-4 rounded-lg border border-gray-300 dark:border-neutral-800 min-w-[180px] sm:min-w-[200px] flex-shrink-0 shadow-sm hover:shadow-md transition"
            >
              <p className="text-[11px] text-gray-700 dark:text-neutral-400 uppercase tracking-wide mb-1">
                {item.title}
              </p>
              <h3
                className={`text-xl font-bold ${
                  item.isNegative ? "text-red-500" : "text-green-500"
                }`}
              >
              {item.numericValue != null && !isNaN(item.numericValue)
  ? item.numericValue.toFixed(3) + "%"
  : "—"}

              </h3>
            </div>
          ))}
        </div>
      </div>
      <AlternativeSummaryTable></AlternativeSummaryTable>

      {/* ===== Charts Section ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] p-4 sm:p-5 shadow-md transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <span className="text-xs text-gray-900 dark:text-neutral-300 font-medium">
              Allocation by Sub-Asset Class
            </span>
            <select className="w-full sm:w-auto bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded px-2 py-1.5 text-xs text-gray-900 dark:text-neutral-300">
              <option>Percentage</option>
            </select>
          </div>
          <div className="h-48 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subAssetData}
                  dataKey="value"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={5}
                >
                  {subAssetData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] p-4 sm:p-5 shadow-md transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <span className="text-xs text-gray-900 dark:text-neutral-300 font-medium">
              Allocation by Issuer
            </span>
            <select className="w-full sm:w-auto bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded px-2 py-1.5 text-xs text-gray-900 dark:text-neutral-300">
              <option>Attribution</option>
              <option>Type</option>
            </select>
          </div>
          <div className="h-48 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuerData}>
                <XAxis
                  dataKey="name"
                  stroke="#777"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#777" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Price" stackId="a" fill="#64CCC5" />
                <Bar dataKey="FX" stackId="a" fill="#4DB6AC" />
                <Bar dataKey="Income" stackId="a" fill="#00796B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
