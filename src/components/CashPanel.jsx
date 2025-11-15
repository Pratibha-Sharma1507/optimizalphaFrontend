import React, { useState , useRef, useCallback, useEffect, useMemo} from 'react';
import { RefreshCw, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import CashSummaryTable from './CashSummaryTable';

const API_ENDPOINT = "https://optimizalphabackend.onrender.com/api/cash"

const CashPanel = () => {
  const [selectedView, setSelectedView] = useState('percentage');
    const [portfolios, setPortfolios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
     const { currency } = useOutletContext();
    // const [allocationBy, setAllocationBy] = useState("Asset Class");
    // const [distributionBy, setDistributionBy] = useState("Account");
    // const [expandedGroups, setExpandedGroups] = useState(new Set());
    // const [topLevel, setTopLevel] = useState({});
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
    
      // Static configuration
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
    
      // Build horizontal cards
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

  const cashData = {
    total: 8.23,
    investible: 2.23,
    change: 22.3,
    changePercent: 1,
    lastUpdated: 'Mar 30, 01:00:00 PM'
  };

  const breakdownData = [
    { label: 'CASH BALANCES (BASE)', value: 54495956 },
    { label: 'CASH EQUIVALENTS', value: 28750320 },
    { label: 'LOANS', value: 12375000 },
    { label: 'UNFUNDED COMMITMENTS', value: 8950450 }
  ];

  const currencyData = [
    { currency: 'USD', percentage: 45, color: '#4fb0a8', label: 'USD\n45.00%' },
    { currency: 'INR', percentage: 20, color: '#ea9a4d', label: 'INR\n20.00%' },
    { currency: 'AED', percentage: 8, color: '#f4c74a', label: 'AED\n8.00%' },
    { currency: 'EUR', percentage: 5, color: '#9b8fd9', label: 'EUR' },
    { currency: 'GBP', percentage: 22, color: '#5d86d4', label: 'GBP' }
  ];

  const custodianData = [
    { name: 'JP Morgan', percentage: 27, color: '#4fb0a8' },
    { name: 'Others', percentage: 10, color: '#ea9a4d' },
    { name: 'Credit Suisse', percentage: 16, color: '#f4c74a' },
    { name: 'Deutsche Bank', percentage: 15, color: '#5d86d4' },
  ];

const formatValue = (v, isCurrency = false) => {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return v;

  //  currency context/state से लो
  const symbol = currency === "INR" ? "₹" : "$";
  const locale = currency === "INR" ? "en-IN" : "en-US";

  //  अगर currency format नहीं चाहिए तो simple number return करो
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

  const formatDate = (dateStr) => {
  if (!dateStr) return "—";

  const [day, month, year] = dateStr.split("-");
  const parsedDate = new Date(`${year}-${month}-${day}`);

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

  const DonutChart = ({ data }) => {
    let currentAngle = 0;
    const total = data.reduce((sum, item) => sum + item.percentage, 0);

    return (
      <div className="relative w-full h-64 flex items-center justify-between">
        <svg viewBox="0 0 200 200" className="w-56 h-56">
          {data.map((item, index) => {
            const percentage = (item.percentage / total) * 100;
            const angle = (percentage / 100) * 360;
            const radius = 80;
            const innerRadius = 50;
            const centerX = 100;
            const centerY = 100;

            const startAngle = currentAngle - 90;
            const endAngle = startAngle + angle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);

            const x3 = centerX + innerRadius * Math.cos(endRad);
            const y3 = centerY + innerRadius * Math.sin(endRad);
            const x4 = centerX + innerRadius * Math.cos(startRad);
            const y4 = centerY + innerRadius * Math.sin(startRad);

            const largeArc = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
              `L ${x3} ${y3}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
              'Z'
            ].join(' ');

            currentAngle += angle;

            const labelAngle = startAngle + angle / 2;
            const labelRad = (labelAngle * Math.PI) / 180;
            const labelRadius = 65;
            const labelX = centerX + labelRadius * Math.cos(labelRad);
            const labelY = centerY + labelRadius * Math.sin(labelRad);

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={item.color}
                  className="hover:opacity-90 transition-opacity cursor-pointer"
                />
                {percentage > 8 && (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white text-xs font-medium pointer-events-none"
                  >
                    {item.percentage}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
              <div className="text-xs text-gray-700 dark:text-neutral-300 leading-tight">
                <div className="font-medium">{item.name}</div>
                <div className="text-gray-500 dark:text-neutral-500">{item.percentage}.0%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-neutral-100 p-3 sm:p-4 md:p-6">
      {/* ==================== TOP STATS ==================== */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 md:gap-12 mb-4 md:mb-6">
        {staticData.topStatsKeys.map((key) => (
          <div key={key} className="min-w-0">
            <p className="text-[11px] text-gray-600 dark:text-neutral-500 mb-1 uppercase tracking-wide">
               {key === "today_total" ? "PORTFOLIO VALUE" : key.replace(/_/g, " ")}
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
                • Last Updated: {},
                 {formatDate(first.latest_date)}
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

      <CashSummaryTable ></CashSummaryTable>

        {/* Charts Section */}
<div className="mt-6 grid grid-cols-2 gap-4">
  {/* Currency Breakdown */}
  <div className="bg-white dark:bg-[#141414] p-5 rounded-lg border border-gray-200 dark:border-neutral-800">
    <h3 className="font-semibold mb-4 text-sm text-gray-900 dark:text-white">
      Currency Breakdown
    </h3>
    <div className="relative h-48">
      {currencyData.map((item, idx) => {
        let left = 0;
        for (let i = 0; i < idx; i++) {
          left += currencyData[i].percentage;
        }
        return (
          <div
            key={idx}
            className="absolute top-0 bottom-0 flex items-center justify-center text-white font-medium"
            style={{
              left: `${left}%`,
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
          >
            {item.percentage >= 15 && (
              <div className="text-center text-sm leading-tight">
                <div className="font-bold">{item.currency}</div>
                <div className="text-xs">{item.percentage}.00%</div>
              </div>
            )}
          </div>
        );
      })}

      {/* Small segments labels */}
      <div
        className="absolute"
        style={{ left: "45%", top: "-30px", fontSize: "11px" }}
      >
        <div className="text-gray-600 dark:text-neutral-400 font-medium">
          EUR
        </div>
      </div>
      <div
        className="absolute"
        style={{ left: "73%", top: "100px", fontSize: "11px" }}
      >
        <div className="text-gray-600 dark:text-neutral-400 font-medium">
          AED
        </div>
        <div className="text-gray-500 dark:text-neutral-500">8.00%</div>
      </div>
    </div>
  </div>

  {/* Custodian Breakdown */}
  <div className="bg-white dark:bg-[#141414] p-5 rounded-lg border border-gray-200 dark:border-neutral-800">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
        Custodian Breakdown
      </h3>
      <select
        className="bg-white dark:bg-neutral-800 text-xs px-3 py-1.5 rounded border border-gray-300 dark:border-neutral-700 focus:outline-none focus:border-gray-400 dark:focus:border-neutral-600 text-gray-900 dark:text-neutral-300"
        value={selectedView}
        onChange={(e) => setSelectedView(e.target.value)}
      >
        <option value="percentage">Percentage</option>
        <option value="amount">Amount</option>
      </select>
    </div>
    <DonutChart data={custodianData} />
  </div>
</div>

        {/* Performance vs Benchmark and Cash Equivalents Distribution */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Performance vs Benchmark */}
          <div className="bg-white dark:bg-[#141414] p-5 rounded-lg border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-base text-gray-900 dark:text-white">Performance vs Benchmark</h3>
              <select className="bg-white dark:bg-neutral-800 text-xs px-3 py-1.5 rounded border border-gray-300 dark:border-neutral-700 focus:outline-none text-gray-900 dark:text-neutral-300">
                <option>NIFTY 1 DAY RATE INDEX</option>
              </select>
            </div>
            
            <div className="relative h-72">
              <svg viewBox="0 0 600 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                {[0, 5, 10, 15, 20].map((y, i) => (
                  <g key={i}>
                    <line x1="60" y1={240 - (y * 10)} x2="580" y2={240 - (y * 10)} stroke="#e5e5e5" className="dark:stroke-[#1f1f1f]" strokeWidth="1" />
                    <text x="25" y={245 - (y * 10)} fill="#9ca3af" className="dark:fill-[#737373]" fontSize="12">{y}%</text>
                  </g>
                ))}
                
                {/* X-axis */}
                <line x1="60" y1="240" x2="580" y2="240" stroke="#e5e5e5" className="dark:stroke-[#1f1f1f]" strokeWidth="1.5" />
                
                {/* X-axis labels */}
                {['Sep\'24', 'Oct\'24', 'Nov\'24', 'Dec\'24', 'Jan\'25', 'Feb\'25'].map((label, i) => (
                  <text key={i} x={90 + (i * 85)} y="265" fill="#9ca3af" className="dark:fill-[#737373]" fontSize="12" textAnchor="middle">{label}</text>
                ))}
                
                {/* Performance line (teal) - smooth curve */}
                <path
                  d="M 60,140 Q 120,135 180,115 T 300,95 Q 360,85 420,75 T 540,60 L 580,55"
                  fill="none"
                  stroke="#4fb0a8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                
                {/* Benchmark line (orange) - smooth curve */}
                <path
                  d="M 60,200 Q 120,198 180,192 T 300,180 Q 360,170 420,158 T 540,140 L 580,130"
                  fill="none"
                  stroke="#ea9a4d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Legend */}
              <div className="flex items-center gap-6 mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4fb0a8]"></div>
                  <span className="text-gray-600 dark:text-neutral-400">Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ea9a4d]"></div>
                  <span className="text-gray-600 dark:text-neutral-400">Nifty 1 Day Rate Index</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Equivalents Distribution */}
          <div className="bg-white dark:bg-[#141414] p-5 rounded-lg border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-base text-gray-900 dark:text-white">Cash Equivalents Distribution</h3>
              <select className="bg-white dark:bg-neutral-800 text-xs px-3 py-1.5 rounded border border-gray-300 dark:border-neutral-700 focus:outline-none text-gray-900 dark:text-neutral-300">
                <option>Percentage</option>
              </select>
            </div>
            
            <div className="relative h-72 flex items-center">
              <div className="flex-1 flex justify-center">
                <svg viewBox="0 0 280 280" className="w-72 h-72">
                  {/* Cash Balance - 32% (Teal) - Top Right */}
                  <path
                    d="M 140,50 A 90,90 0 0,1 218,100 L 140,140 Z"
                    fill="#4fb0a8"
                    className="hover:opacity-90 cursor-pointer transition-opacity"
                  />
                  
                  {/* Term Deposits - 25% (Orange) - Right */}
                  <path
                    d="M 218,100 A 90,90 0 0,1 210,195 L 140,140 Z"
                    fill="#ea9a4d"
                    className="hover:opacity-90 cursor-pointer transition-opacity"
                  />
                  
                  {/* Treasury Bills - 18% (Purple) - Bottom */}
                  <path
                    d="M 210,195 A 90,90 0 0,1 80,210 L 140,140 Z"
                    fill="#9b8fd9"
                    className="hover:opacity-90 cursor-pointer transition-opacity"
                  />
                  
                  {/* Money Market Funds - 15% (Yellow) - Left */}
                  <path
                    d="M 80,210 A 90,90 0 0,1 50,140 L 140,140 Z"
                    fill="#f4c74a"
                    className="hover:opacity-90 cursor-pointer transition-opacity"
                  />
                  
                  {/* Fixed Deposits - 10% (Blue) - Top Left */}
                  <path
                    d="M 50,140 A 90,90 0 0,1 140,50 L 140,140 Z"
                    fill="#5d86d4"
                    className="hover:opacity-90 cursor-pointer transition-opacity"
                  />
                  
                  {/* Percentage labels inside segments */}
                  <text x="190" y="95" fill="white" fontSize="13" fontWeight="600">32.0%</text>
                  <text x="195" y="155" fill="white" fontSize="13" fontWeight="600">25.0%</text>
                  <text x="125" y="210" fill="white" fontSize="13" fontWeight="600">18.0%</text>
                  <text x="65" y="160" fill="white" fontSize="13" fontWeight="600">15.0%</text>
                  <text x="105" y="85" fill="white" fontSize="13" fontWeight="600">10.0%</text>
                  
                  {/* Inner circle to create donut effect */}
                  <circle cx="140" cy="140" r="60" fill="currentColor" className="fill-gray-50 dark:fill-[#0A0A0A]" />
                </svg>
              </div>
              
              {/* Labels on the right side */}
              <div className="space-y-3 ml-4">
                <div className="text-xs text-gray-600 dark:text-neutral-400 text-right">
                  <div className="font-medium leading-tight">Cash</div>
                  <div className="font-medium leading-tight">Balance</div>
                </div>
                <div className="text-xs text-gray-600 dark:text-neutral-400 text-right">
                  <div className="font-medium leading-tight">Term</div>
                  <div className="font-medium leading-tight">Deposits</div>
                </div>
                <div className="text-xs text-gray-600 dark:text-neutral-400 text-right">
                  <div className="font-medium leading-tight">Treasury</div>
                  <div className="font-medium leading-tight">Bills</div>
                </div>
                <div className="text-xs text-gray-600 dark:text-neutral-400 text-right">
                  <div className="font-medium leading-tight">Money</div>
                  <div className="font-medium leading-tight">Market</div>
                  <div className="font-medium leading-tight">Funds</div>
                </div>
                <div className="text-xs text-gray-600 dark:text-neutral-400 text-right">
                  <div className="font-medium leading-tight">Fixed</div>
                  <div className="font-medium leading-tight">Deposits</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projected Cashflows */}
        <div className="bg-white dark:bg-[#141414] p-5 rounded-lg border border-gray-200 dark:border-neutral-800 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white">Projected Cashflows</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-neutral-400">Filter by:</span>
                <select className="bg-white dark:bg-neutral-800 text-xs px-3 py-1.5 rounded border border-gray-300 dark:border-neutral-700 focus:outline-none text-gray-900 dark:text-neutral-300">
                  <option>Inflow</option>
                  <option>Outflow</option>
                  <option>Net</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-neutral-400">View By:</span>
                <select className="bg-white dark:bg-neutral-800 text-xs px-3 py-1.5 rounded border border-gray-300 dark:border-neutral-700 focus:outline-none text-gray-900 dark:text-neutral-300">
                  <option>Gross</option>
                  <option>Net</option>
                </select>
              </div>
            </div>
          </div>

          <div className="relative h-80">
            <svg viewBox="0 0 1200 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              {/* Y-axis labels and grid */}
              {[0, 40, 80, 150].map((value, i) => (
                <g key={i}>
                  <line x1="80" y1={350 - (i * 90)} x2="1180" y2={350 - (i * 90)} stroke="#e5e5e5" className="dark:stroke-[#1f1f1f]" strokeWidth="1" />
                  <text x="20" y={355 - (i * 90)} fill="#9ca3af" className="dark:fill-[#737373]" fontSize="13">${value}K</text>
                </g>
              ))}

              {/* Month labels */}
              {['Jan\'25', 'Feb\'25', 'Jun\'25', 'Mar\'25', 'Apr\'25', 'May\'25', 'Jun\'25', 'Aug\'25', 'Sep\'25', 'Oct\'25', 'Nov\'25', 'Dec\'25'].map((month, i) => (
                <text key={i} x={125 + (i * 88)} y="385" fill="#9ca3af" className="dark:fill-[#737373]" fontSize="12" textAnchor="middle">{month}</text>
              ))}

              {/* Stacked bars data */}
              {[
                { dividends: 65, coupon: 30, bonds: 35 },
                { dividends: 75, coupon: 70, bonds: 35 },
                { dividends: 40, coupon: 55, bonds: 30 },
                { dividends: 38, coupon: 25, bonds: 15 },
                { dividends: 60, coupon: 35, bonds: 35 },
                { dividends: 75, coupon: 70, bonds: 40 },
                { dividends: 55, coupon: 35, bonds: 20 },
                { dividends: 38, coupon: 30, bonds: 10 },
                { dividends: 63, coupon: 35, bonds: 30 },
                { dividends: 75, coupon: 50, bonds: 40 },
                { dividends: 38, coupon: 30, bonds: 10 },
                { dividends: 60, coupon: 60, bonds: 50 }
              ].map((data, i) => {
                const x = 95 + (i * 88);
                const width = 40;
                const scale = 2.5;
                
                const dividendsHeight = data.dividends * scale;
                const couponHeight = data.coupon * scale;
                const bondsHeight = data.bonds * scale;
                
                return (
                  <g key={i}>
                    {/* Dividends (Teal) */}
                    <rect
                      x={x}
                      y={350 - dividendsHeight}
                      width={width}
                      height={dividendsHeight}
                      fill="#4fb0a8"
                      className="hover:opacity-90 cursor-pointer transition-opacity"
                      rx="2"
                    />
                    
                    {/* Coupon (Orange) */}
                    <rect
                      x={x}
                      y={350 - dividendsHeight - couponHeight}
                      width={width}
                      height={couponHeight}
                      fill="#ea9a4d"
                      className="hover:opacity-90 cursor-pointer transition-opacity"
                    />
                    
                    {/* Bond Maturity (Purple) */}
                    <rect
                      x={x}
                      y={350 - dividendsHeight - couponHeight - bondsHeight}
                      width={width}
                      height={bondsHeight}
                      fill="#9b8fd9"
                      className="hover:opacity-90 cursor-pointer transition-opacity"
                      rx="2"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 text-xs">
              <div className="text-gray-500 dark:text-neutral-500 font-medium">Inflows:</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#4fb0a8]"></div>
                <span className="text-gray-600 dark:text-neutral-400">Dividends</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#ea9a4d]"></div>
                <span className="text-gray-600 dark:text-neutral-400">Coupon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#9b8fd9]"></div>
                <span className="text-gray-600 dark:text-neutral-400">Bond Maturity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white dark:bg-[#141414] p-5 rounded-lg border border-gray-200 dark:border-neutral-800 mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-800">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-neutral-400 font-medium text-xs">Date of Payment</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-neutral-400 font-medium text-xs">Type of Transaction</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-neutral-400 font-medium text-xs">Instruments</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-neutral-400 font-medium text-xs">Directions</th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-neutral-400 font-medium text-xs">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '21-Jan-2025', type: 'Coupon', instrument: 'HDFC Bank', direction: 'Out Flow', cost: '$1M', isOutFlow: true },
                  { date: '25-Jan-2025', type: 'Coupon', instrument: 'Apple Inc.', direction: 'Out Flow', cost: '$1M', isOutFlow: true },
                  { date: '21-Jan-2025', type: 'Coupon', instrument: 'NTPC Ltd.', direction: 'In Flow', cost: '$1M', isOutFlow: false },
                  { date: '21-Jan-2025', type: 'Coupon', instrument: 'Apple Inc.', direction: 'Out Flow', cost: '$1M', isOutFlow: true },
                  { date: '21-Jan-2025', type: 'Coupon', instrument: 'NTPC Ltd.', direction: 'In Flow', cost: '$1M', isOutFlow: false },
                  { date: '21-Jan-2025', type: 'Coupon', instrument: 'NTPC Ltd.', direction: 'In Flow', cost: '$1M', isOutFlow: false },
                  { date: '15-Feb-2025', type: 'Dividend', instrument: 'HDFC Bank', direction: 'In Flow', cost: '$500K', isOutFlow: false },
                  { date: '10-Mar-2025', type: 'Principal Repayment', instrument: 'ICICI Bonds', direction: 'In Flow', cost: '$2M', isOutFlow: false },
                  { date: '05-Apr-2025', type: 'Interest Payment', instrument: 'SBI NCD', direction: 'In Flow', cost: '$750K', isOutFlow: false },
                  { date: '28-May-2025', type: 'Capital Call', instrument: 'Kotak PE Fund', direction: 'Out Flow', cost: '$1.2M', isOutFlow: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-200/50 dark:border-neutral-800/50 hover:bg-gray-100 dark:hover:bg-[#0D0D0D] transition">
                    <td className="py-3 px-4 text-gray-700 dark:text-neutral-300 text-xs">{row.date}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-neutral-300 text-xs">{row.type}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-neutral-300 text-xs">{row.instrument}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-neutral-400 text-xs">{row.direction}</td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-neutral-200 text-xs font-medium">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 transition">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-neutral-400">
                  <path d="M10 12L6 8l4-4" />
                </svg>
              </button>
              <button className="px-3 py-1.5 rounded bg-[#4fb0a8] text-white text-xs font-medium">1</button>
              <button className="px-3 py-1.5 rounded bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-xs font-medium transition">2</button>
              <button className="p-2 rounded bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 transition">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-neutral-400">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-neutral-400">Results per page:</span>
              <select className="bg-white dark:bg-neutral-800 text-xs px-3 py-1.5 rounded border border-gray-300 dark:border-neutral-700 focus:outline-none text-gray-900 dark:text-neutral-300">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Breakdown Details */}
        <div className="bg-white dark:bg-[#141414] p-5 rounded-lg border border-gray-200 dark:border-neutral-800 mt-6">
          <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-5">Breakdown Details</h3>
          
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 dark:border-neutral-800 mb-5">
            <button className="pb-3 text-xs font-medium text-gray-900 dark:text-white border-b-2 border-[#4fb0a8]">
              Cash Balances
            </button>
            <button className="pb-3 text-xs font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 transition">
              Cash Equivalents
            </button>
            <button className="pb-3 text-xs font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 transition">
              Loans
            </button>
            <button className="pb-3 text-xs font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 transition">
              Unfunded Commitments
            </button>
            <button className="pb-3 text-xs font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 transition">
              Receivables/Payables
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-800">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-neutral-400 font-medium text-xs">
                    <div className="flex items-center gap-2">
                      Entity
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-gray-500 dark:text-neutral-500">
                        <path d="M8 4v8M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-neutral-400 font-medium text-xs">
                    <div className="flex items-center gap-2">
                      Bank
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-gray-500 dark:text-neutral-500">
                        <path d="M8 4v8M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-neutral-400 font-medium text-xs">
                    <div className="flex items-center gap-2">
                      Currency
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-gray-500 dark:text-neutral-500">
                        <path d="M8 4v8M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-neutral-400 font-medium text-xs">
                    <div className="flex items-center justify-end gap-2">
                      Local Value
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-gray-500 dark:text-neutral-500">
                        <path d="M8 4v8M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-neutral-400 font-medium text-xs">
                    <div className="flex items-center justify-end gap-2">
                      Base Value
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-gray-500 dark:text-neutral-500">
                        <path d="M8 4v8M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { entity: 'Vanronma Ventures', bank: 'JP Morgan', currency: 'USD', localValue: '$200K', baseValue: '$150K' },
                  { entity: 'Pichory Trust', bank: 'Citi Bank', currency: 'USD', localValue: '$35K', baseValue: '$35K' },
                  { entity: 'Ruval Inc', bank: 'HSBC', currency: 'USD', localValue: '$200K', baseValue: '$200K' },
                  { entity: 'Anita Gibbs', bank: 'Standard Chartered', currency: 'INR', localValue: '$25K', baseValue: '$25K' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-200/50 dark:border-neutral-800/50 hover:bg-gray-100 dark:hover:bg-[#0D0D0D] transition group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gray-500 dark:text-neutral-500 group-hover:text-gray-600 dark:group-hover:text-neutral-400 transition">
                          <path d="M6 10l2 2 2-2M6 6l2-2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span className="text-gray-700 dark:text-neutral-300 text-xs">{row.entity}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-neutral-400 text-xs">{row.bank}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-neutral-300 text-xs">{row.currency}</td>
                    <td className="py-3 px-4 text-right text-gray-700 dark:text-neutral-300 text-xs font-medium">{row.localValue}</td>
                    <td className="py-3 px-4 text-right text-gray-700 dark:text-neutral-300 text-xs font-medium">{row.baseValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    // </div>
  );
};

export default CashPanel;