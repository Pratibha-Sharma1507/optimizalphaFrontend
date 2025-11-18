import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import EquitySummaryTable from "./EquitySummaryTable";
const API_ENDPOINT = "https://optimizalphabackend.onrender.com/api/euity"; //  corrected endpoint

export default function EquityPanel() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currency } = useOutletContext();
  const [allocationBy, setAllocationBy] = useState("Asset Class");
  const [distributionBy, setDistributionBy] = useState("Account");
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [topLevel, setTopLevel] = useState({});
  const scrollRef = useRef();
  const hasFetchedRef = useRef(false);

  //  Fetch data once
  const fetchPortfolios = useCallback(async () => {
    if (hasFetchedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINT, {
        headers: { "Cache-Control": "max-age=60" },
        timeout: 5000,
      });
      setPortfolios(response.data);
      hasFetchedRef.current = true;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  //  Scroll handler
  const scroll = useCallback((dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -350 : 350,
        behavior: "smooth",
      });
    }
  }, []);

  //  Static configuration
  const staticData = useMemo(
    () => ({
      topStatsKeys: ["today_total"],
      horizontalItems: [
        { title: "Daily Return (%)", key: "daily_return_pct" },
        { title: "3-Day Return (%)", key: "3d_return_pct" },
        { title: "1-Week Return (%)", key: "1w_return_pct" },
        { title: "Month-to-Date Return (%)", key: "mtd_return_pct" },
        { title: "FYTD Return (%)", key: "fytd_return_pct" },
      ],
    }),
    []
  );

  //  Build horizontal cards
  const horizontalCardsData = useMemo(() => {
    if (!portfolios.length) return [];
    const first = portfolios[0];

    return staticData.horizontalItems.map((item) => {
      const rawValue = first[item.key];
      const numericValue =
        rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
      const isNegative = numericValue < 0;
      return { ...item, numericValue, isNegative };
    });
  }, [portfolios, staticData.horizontalItems]);

  //  Table data fetch
  useEffect(() => {
    if (allocationBy && distributionBy) {
      fetch(
        `/data?allocationBy=${encodeURIComponent(
          allocationBy
        )}&distributionBy=${encodeURIComponent(distributionBy)}`
      )
        .then((res) => res.json())
        .then((rows) => {
          const grouped = rows.reduce((acc, row) => {
            const group = row.allocation_by_name;
            if (!acc[group]) acc[group] = [];
            acc[group].push([
              row.name,
              row.market_value,
              row.total_cost,
              row.realised_pnl,
              row.unrealised_pnl,
              row.portfolio_weight,
              row.abs_return,
              row.twrr_itd,
              row.bmtwrr_itd,
            ]);
            return acc;
          }, {});
          setTopLevel(grouped);
        })
        .catch((err) => console.error("Error fetching data:", err));
    }
  }, [allocationBy, distributionBy]);

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      newSet.has(group) ? newSet.delete(group) : newSet.add(group);
      return newSet;
    });
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

  //  Handle loading/error states
  if (loading)
    return (
      <p className="text-gray-900 dark:text-white p-6">Loading portfolios...</p>
    );
  if (error)
    return (
      <p className="text-red-500 dark:text-red-400 p-6">Error: {error}</p>
    );
  if (!portfolios.length)
    return (
      <p className="text-gray-900 dark:text-white p-6">No portfolios found.</p>
    );

  const first = portfolios[0];

  //  Utility for formatting change and date
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

     const allocationOptions = ["Asset Class", "Currency", "Custodian", "Member"];

  const distributionOptions = [
    "Account",
    "Asset Class",
    "Currency",
    "Custodian",
    "Product Type",
    "Sub Asset Class",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-neutral-100 p-3 sm:p-4 md:p-6">
      {/* ==================== TOP STATS ==================== */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 md:gap-12 mb-4 md:mb-6">
        {staticData.topStatsKeys.map((key) => (
          <div key={key} className="min-w-0">
            <p className="text-[11px] text-gray-600 dark:text-neutral-500 mb-1 uppercase tracking-wide">
              {key.replace(/_/g, " ")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
         {formatValue(first[key],true)}
            </h2>
            {key === "today_total" && (
              <p className="text-[11px] text-gray-700 dark:text-neutral-400 mt-1">
                Today's Change:{" "}
                <span
                  className={
                    Number(todayChange) < 0 ? "text-red-500" : "text-green-400"
                  }
                >
                  {todayChange}
                </span>{" "}
                • Last Updated: {lastUpdated}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ==================== HORIZONTAL KPI CARDS ==================== */}
      <div className="relative mb-6 md:mb-8">
        {/* Left Scroll */}
        <button
          onClick={() => scroll("left")}
          className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700 text-gray-900 dark:text-white p-2 rounded-full z-10"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <path d="M10 4L6 8l4 4" />
          </svg>
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 scrollbar-hide scroll-smooth px-1"
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

        {/* Right Scroll */}
        <button
          onClick={() => scroll("right")}
          className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700 text-gray-900 dark:text-white p-2 rounded-full z-10"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* ==================== REST OF YOUR SECTIONS (TABLES, CHARTS) ==================== */}
{/* 
<div className="bg-white dark:bg-[#141414] rounded-xl shadow-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">

  <div className="px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
    <h3 className="text-sm font-medium text-gray-700 dark:text-neutral-300 flex-1">
      Allocation & Performance
    </h3>


    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs w-full sm:w-auto">
      <label className="text-gray-600 dark:text-neutral-400">Allocation by</label>
      <select
        className="w-full sm:w-auto bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded px-2 py-1.5 text-gray-700 dark:text-neutral-300"
        value={allocationBy}
        onChange={(e) => {
          setAllocationBy(e.target.value);
          setExpandedGroups(new Set()); // collapse all when changed
        }}
      >
        <option value="">Select Allocation By</option>
        {allocationOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <label className="text-gray-600 dark:text-neutral-400 sm:ml-2">Distribution by</label>
      <select
        className="w-full sm:w-auto bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded px-2 py-1.5 text-gray-700 dark:text-neutral-300"
        value={distributionBy}
        onChange={(e) => setDistributionBy(e.target.value)}
      >
        <option value="">Select Distribution By</option>
        {distributionOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  </div>


  <div className="overflow-x-auto -mx-3 sm:mx-0">
    {allocationBy && distributionBy ? (
      <div className="inline-block min-w-full align-middle px-3 sm:px-0">
        <table className="min-w-[880px] w-full text-sm border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400">
            <tr>
              {[
                "Name",
                "Market Value",
                "Total Cost",
                "Realized P&L",
                "Unrealized P&L",
                "Portfolio Weight",
                "Abs. Return",
                "TWRR(%) ITD",
                "MB TWRR(%) ITD",
              ].map((h) => (
                <th
                  key={h}
                  className="font-medium text-xs tracking-wide text-left py-2 px-3 border border-gray-300 dark:border-neutral-700 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300 dark:divide-neutral-700">
            {Object.entries(topLevel).length > 0 ? (
              Object.entries(topLevel).map(([group, rows]) => (
                <React.Fragment key={group}>
            
                  <tr
                    className="bg-gray-100 dark:bg-neutral-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
                    onClick={() => toggleGroup(group)}
                  >
                    <td
                      colSpan={9}
                      className="py-3 px-3 text-gray-800 dark:text-neutral-200 font-semibold"
                    >
                      <div className="flex items-center justify-between">
                        <span>{group}</span>
                        <span
                          className={`text-xs transition-transform duration-200 ${
                            expandedGroups.has(group) ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                    </td>
                  </tr>

              
                  {expandedGroups.has(group) &&
                    rows.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        {row.map((cell, j) => {
                          let displayValue = cell;

                          if (typeof cell === "number") {
                         
                            if (Math.abs(cell) >= 1_000_000)
                              displayValue = (cell / 1_000_000).toFixed(2) + "M";
                            else if (Math.abs(cell) >= 1_000)
                              displayValue = (cell / 1_000).toFixed(2) + "K";
                            else displayValue = cell.toFixed(2);
                          }

                          return (
                            <td
                              key={j}
                              className={`border border-gray-300 dark:border-neutral-700 px-3 sm:px-4 py-2 text-sm text-gray-800 dark:text-neutral-200 whitespace-nowrap ${
                                j === 0 ? "pl-6 sm:pl-8" : ""
                              }`}
                            >
                              {displayValue ?? "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center text-gray-500 dark:text-neutral-400 py-4"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-6 text-sm text-gray-600 dark:text-neutral-400">
        Please select both “Allocation by” and “Distribution by” options to view data.
      </div>
    )}
  </div>
</div> */}

<EquitySummaryTable ></EquitySummaryTable>
     
     <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
    <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
      <div className="text-xs text-gray-700 dark:text-neutral-300">Performance vs Benchmark</div>
      <select className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded px-2 py-1.5 text-xs text-gray-700 dark:text-neutral-300">
        <option>NIFTY 50</option>
      </select>
    </div>
    <div className="p-4">
      <div className="h-40 w-full rounded border border-dashed border-gray-300 dark:border-neutral-800 relative">
        <div className="absolute inset-x-2 top-1/4 h-px bg-gray-300 dark:bg-neutral-800" />
        <div className="absolute inset-x-2 top-2/4 h-px bg-gray-300 dark:bg-neutral-800" />
        <div className="absolute inset-x-2 top-3/4 h-px bg-gray-300 dark:bg-neutral-800" />
        <svg viewBox="0 0 400 160" className="absolute inset-2 text-emerald-500 dark:text-emerald-400">
          <polyline fill="none" stroke="currentColor" strokeWidth="2" points="10,110 70,100 130,95 190,85 250,80 310,72 370,65" />
        </svg>
        <svg viewBox="0 0 400 160" className="absolute inset-2 text-yellow-500 dark:text-yellow-300">
          <polyline fill="none" stroke="currentColor" strokeDasharray="4 4" strokeWidth="2" points="10,130 70,128 130,126 190,124 250,120 310,118 370,115" />
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300"><span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" /> Performance</div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300"><span className="h-2 w-2 rounded-full bg-yellow-500 dark:bg-yellow-300" /> Nifty 50</div>
      </div>
    </div>
  </div>

  <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
    <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
      <div className="text-xs text-gray-700 dark:text-neutral-300">Benchmark Deviation Analysis</div>
    </div>
    <div className="p-4">
      <div className="h-40 w-full rounded border border-dashed border-gray-300 dark:border-neutral-800 relative">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute top-2 bottom-2" style={{ left: `${(i + 1) * 16}%` }}>
            <div className="w-px h-full bg-gray-300 dark:bg-neutral-800" />
          </div>
        ))}
        {[...Array(4)].map((_, i) => (
          <div key={`h-${i}`} className="absolute inset-x-2" style={{ top: `${(i + 1) * 20}%` }}>
            <div className="h-px w-full bg-gray-300 dark:bg-neutral-800" />
          </div>
        ))}
        {[{ x: 10, y: 15 }, { x: 25, y: 40 }, { x: 35, y: 28 }, { x: 50, y: 60 }, { x: 65, y: 35 }, { x: 78, y: 55 }, { x: 90, y: 22 }, { x: 95, y: 70 }].map((p, idx) => (
          <div key={idx} className="absolute h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
        ))}
      </div>
    </div>
  </div>
</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-xs text-gray-700 dark:text-neutral-300 font-medium">Allocation by Product Type</div>
            <select className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded px-2 py-1.5 text-xs text-gray-700 dark:text-neutral-300">
              <option>Percentage</option>
            </select>
          </div>
          <div className="p-4">
            <div className="relative h-56 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="h-48 w-48">
                <circle cx="100" cy="100" r="70" strokeWidth="24" stroke="#34d399" fill="none" strokeDasharray="220 440" strokeLinecap="butt" />
                <circle cx="100" cy="100" r="70" strokeWidth="24" stroke="#a78bfa" fill="none" strokeDasharray="132 440" strokeDashoffset="-220" />
                <circle cx="100" cy="100" r="70" strokeWidth="24" stroke="#fcd34d" fill="none" strokeDasharray="88 440" strokeDashoffset="-352" />
                <circle cx="100" cy="100" r="46" className="fill-white dark:fill-[#0b0e12]" />
              </svg>
              <div className="absolute right-6 text-xs text-gray-700 dark:text-neutral-300">Options</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-xs text-gray-700 dark:text-neutral-300 font-medium">P&L by Product Type</div>
            <select className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded px-2 py-1.5 text-xs text-gray-700 dark:text-neutral-300">
              <option>Attribution</option>
              <option>Type</option>
            </select>
          </div>
          <div className="p-4">
            <div className="h-56 w-full rounded border border-dashed border-gray-300 dark:border-neutral-800 relative p-4">
              <div className="absolute left-4 right-4 top-6 bottom-10 grid grid-cols-4 gap-6 items-end">
                {[
                  {price: 60, fx: 25, income: 15, label: 'Common Stock'},
                  {price: 50, fx: 30, income: 20, label: 'Preference Shares'},
                  {price: 40, fx: 25, income: 15, label: 'Mutual Funds'},
                  {price: 28, fx: 18, income: 12, label: 'Call Options'},
                ].map((b, i) => (
                  <div key={i} className="flex flex-col justify-end items-center gap-1">
                    <div className="w-12">
                      <div className="bg-emerald-500/60" style={{height: `${b.price}%`}} />
                      <div className="bg-cyan-400/70" style={{height: `${b.fx}%`}} />
                      <div className="bg-teal-300/70" style={{height: `${b.income}%`}} />
                    </div>
                    <div className="text-[10px] text-gray-600 dark:text-neutral-400 text-center leading-tight">{b.label}</div>
                  </div>
                ))}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300"><span className="h-2 w-2 rounded-full bg-emerald-500/70" /> Price</div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300"><span className="h-2 w-2 rounded-full bg-cyan-400/70" /> FX</div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300"><span className="h-2 w-2 rounded-full bg-teal-300/70" /> Income</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-xs text-gray-700 dark:text-neutral-300 font-medium">Market Cap Allocation</div>
          </div>
          <div className="p-4">
            <div className="relative h-64 w-full rounded border border-gray-200 dark:border-neutral-800 overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-emerald-200/60 dark:bg-emerald-300/30 flex items-center justify-center">
                <div className="text-center text-xs text-gray-900 dark:text-neutral-100">
                  <div className="font-medium">Large Cap</div>
                  <div>50.00%</div>
                </div>
              </div>
              <div className="absolute inset-y-0 left-1/2 w-1/2">
                <div className="h-1/2 bg-emerald-200/70 dark:bg-emerald-300/40 flex items-center justify-center">
                  <div className="text-center text-xs text-gray-900 dark:text-neutral-100">
                    <div className="font-medium">Mid Cap</div>
                    <div>30.00%</div>
                  </div>
                </div>
                <div className="h-1/2 bg-emerald-200/40 dark:bg-emerald-300/20 flex items-center justify-center">
                  <div className="text-center text-xs text-gray-900 dark:text-neutral-100">
                    <div className="font-medium">Small Cap</div>
                    <div>20.00%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-xs text-gray-700 dark:text-neutral-300 font-medium">Performance Extremes</div>
            <select className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded px-2 py-1.5 text-xs text-gray-700 dark:text-neutral-300">
              <option>Top 10</option>
            </select>
          </div>
          <div className="p-0 overflow-auto">
            <table className="min-w-[520px] w-full text-sm">
              <thead>
                <tr className="text-gray-600 dark:text-neutral-400">
                  {['Security Name','Returns','Market Value','Avg. Cost'].map(h => (
                    <th key={h} className="font-normal text-xs tracking-wide text-left py-2 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {[
                  ['NVIDIA Corp.','80.49%','$1.25M','$—'],
                  ['Tesla Inc.','43.92%','$876.54K','$—'],
                  ['Apple Inc.','35.22%','$1.36M','$—'],
                  ['Microsoft Corp.','31.25%','$1.57M','$—'],
                  ['Amazon.com Inc.','28.5%','$987.65K','$—'],
                  ['Alphabet Inc.','26.45%','$876.54K','$—'],
                  ['Meta Platforms Inc.','23.45%','$765.43K','$—'],
                  ['Taiwan Semiconductor','21.88%','$654.32K','$—'],
                  ['Netflix Inc.','21.1%','$543.21K','$—'],
                  ['Adobe Inc.','20.2%','$432.1K','$—'],
                ].map((r,i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-neutral-900/40">
                    <td className="py-2 px-4 text-gray-800 dark:text-neutral-200">{r[0]}</td>
                    <td className="py-2 px-4 text-emerald-500 dark:text-emerald-400">{r[1]}</td>
                    <td className="py-2 px-4 text-gray-800 dark:text-neutral-200">{r[2]}</td>
                    <td className="py-2 px-4 text-gray-500 dark:text-neutral-400">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* 💡 Keep all your other UI sections below — they remain unchanged */}
    </div>
  );
}
