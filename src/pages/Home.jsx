import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
axios.defaults.withCredentials = true;

const API_ENDPOINT = "https://optimizalphabackend.onrender.com/api/account";

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false); // Changed from true to false
  const [error, setError] = useState(null);
  const scrollRef = useRef();
  const { currency } = useOutletContext();
  const hasFetchedRef = useRef(false); // To prevent double fetch
const [selectedPan, setSelectedPan] = useState(localStorage.getItem("selectedPan") || "All");


const fetchPortfolios = async () => {
  try {
    setLoading(true);

    const clientId = localStorage.getItem("client");

    let url = "";

  
    if (selectedPan === "All") {
      url = `${API_ENDPOINT}?currency=${currency}`;
    } else {
      url = `https://optimizalphabackend.onrender.com/api/pan-summary/${clientId}/${selectedPan}?currency=${currency}`;
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

  //  Memoized format function
  const formatValue = useCallback((v, isCurrency = false) => {
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
  }, [currency]);

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


  //  Memoized scroll function
  const scroll = useCallback((dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -350 : 350,
        behavior: "smooth",
      });
    }
  }, []);
//   const todayChange = first.today_total - first.yesterday_total;
// const lastUpdated = new Date(first.latest_date).toLocaleDateString("en-IN", {
//   day: "2-digit",
//   month: "short",
//   year: "numeric",
// });


  //  Memoized static data
  const staticData = useMemo(() => ({
    topStatsKeys: ["today_total"],
    horizontalItems: [
    { title: "Daily", returnKey: "daily_return"},
    { title: "1-Week", returnKey: "1w_return" },
    { title: "1-Month", returnKey: "1m_return", valueKey: "1m_value" },
    { title: "3-Month", returnKey: "3m_return", valueKey: "3m_value" },
    { title: "6-Month", returnKey: "6m_return", valueKey: "6m_value" },
    { title: "MTD", returnKey: "mtd_return", valueKey: "mtd_value" },
    { title: "FYTD", returnKey: "fytd_return", valueKey: "fytd_value" },
  ],
    insights: [
      { title: "Largest Profit and Loss", desc: "Portfolio P&L is $92,155,175. Largest profit: Netflix $21,051,449; Largest loss: Chipotle $4,337,137." },
      { title: "Portfolio Concentration", desc: "26 of 132 positions make up 98.5% of the portfolio. High concentration observed." },
      { title: "P&L Contribution", desc: "US Equities contribute 79.2% of P&L worth $63.4m of the total portfolio." },
      { title: "Income Yields", desc: "Next 12 months: $4,246,964 income expected (yield 0.82%)." },
    ],
    news: [
      { title: "Future of Sustainable Investing", source: "Bloomberg", date: "15 Jun 2025" },
      { title: "Market Volatility and Resilience", source: "Financial Times", date: "22 Jul 2025" },
      { title: "Crypto Regulations Decoded", source: "WSJ", date: "05 Aug 2025" },
      { title: "AI in Financial Markets", source: "Reuters", date: "12 Oct 2025" },
    ],
    events: [
      { type: "United States", icon: "🇺🇸", impact: "⭐⭐⭐", title: "FOMC US Interest Rate Decision (EUR/USD)", time: "01:30 am" },
      { type: "Education News", icon: "📚", impact: "⭐⭐⭐", title: "Goldman Sachs US Dollar Liquid Reserved fund On (JP90009545)", time: "11:01 pm" },
      { type: "Finance + News", icon: "💰", impact: "⭐⭐⭐", title: "Lufax Held Monetary - Lufax Volatility Society & unexplained", time: "12:29 pm" },
      { type: "United States + News", icon: "🇺🇸", impact: "⭐⭐⭐", title: "Visa Inc. Class A earnings call", time: "02:37 pm" },
      { type: "United States + News", icon: "🇺🇸", impact: "⭐⭐⭐", title: "Sherwin Electric Company earnings call", time: "06:30 pm" },
    ],
    notifications: [
      { title: "Market Correction Alert", desc: "The S&P 500 has dropped by 3% in the last 24 hours. Review your portfolio's risk exposure.", time: "2 hours ago" },
      { title: "Portfolio Rebalancing Required", desc: "Your Growth Portfolio has drifted from target allocations. Please review to stay within target.", time: "5 hours ago" },
      { title: "Trading Performance Alert", desc: "Trading platform experiencing higher than normal latency. Engineers are investigating.", time: "8 hours ago" },
      { title: "Options Trade Executed", desc: "Your limit order for AAPL call options has been filled at $175.50.", time: "Yesterday" },
    ],
    indicators: [
      { title: "Currency", last: "$86.56", prev: "$86.47", high: "$88.1", low: "$0.01" },
      { title: "Stock Market", last: "$75.31K", prev: "$75.74K", high: "$85.98K", low: "$113" },
      { title: "GDP Growth", last: "$1.1", prev: "$1.1", high: "$22.4", low: "-$22.7" },
      { title: "GDP Annual", last: "$5.4", prev: "$6.7", high: "$22.6", low: "-$23.1" },
      { title: "Unemployment", last: "$8.3", prev: "$8", high: "$23.5", low: "$6.4" },
      { title: "Inflation Rate", last: "$4.31", prev: "$5.22", high: "$12.17", low: "$1.54" },
      { title: "Interest Rate", last: "$6.25", prev: "$6.5", high: "$14.5", low: "$4" },
      { title: "Cash Reserve", last: "$4", prev: "$4", high: "$10.5", low: "$3" },
      { title: "Balance Of Trade", last: "-$22.99", prev: "-$21.94", high: "$0.71", low: "-$37.84" },
    ],
    watchlist: [
      { flag: "🇺🇸", major: "US500", price: "$6.01K", day: "$104.39", change: "-1.71%", weekly: "-1.66%" },
      { flag: "🇺🇸", major: "US30", price: "$43.43K", day: "$104.39", change: "-1.71%", weekly: "-1.66%" },
      { flag: "🇺🇸", major: "US100", price: "$21.61K", day: "$104.39", change: "+0.39%", weekly: "+0.39%" },
      { flag: "🇯🇵", major: "JP225", price: "$38.78K", day: "$104.39", change: "+0.39%", weekly: "+0.39%" },
      { flag: "🇬🇧", major: "GB100", price: "$8.66K", day: "$104.39", change: "-1.71%", weekly: "-1.66%" },
      { flag: "🇩🇪", major: "DE40", price: "$22.29K", day: "$104.39", change: "+0.39%", weekly: "+1.17%" },
      { flag: "🇫🇷", major: "FR40", price: "$8.16K", day: "$104.39", change: "-1.71%", weekly: "-1.66%" },
      { flag: "🇮🇹", major: "IT40", price: "$38.42K", day: "$104.39", change: "-1.71%", weekly: "-1.66%" },
      { flag: "🇪🇸", major: "ES35", price: "$12.95K", day: "$104.39", change: "+0.39%", weekly: "+0.39%" },
    ],
    keenSights: [
      { source: "Keenai Pulse Keynote", date: "31 March 2025", title: "A Conversation with LC's Nilesh Jasani" },
      { source: "Keenai Pulse Insights", date: "20 Feb 2025", title: "Emerging Market Trends for Retail Investors" },
      { source: "Keenai Pulse Report", date: "05 Jan 2025", title: "Sector Outlook 2025: What to Expect" },
    ],
  }), []);

  //  Memoized horizontal cards data
const horizontalCardsData = useMemo(() => {
  if (!portfolios.length) return [];
  const first = portfolios[0];

  return staticData.horizontalItems.map(item => {
    const returnValue = first[item.returnKey] ?? 0;
    const value = item.valueKey ? first[item.valueKey] : null;

    return {
      ...item,
      isNegative: returnValue < 0,
      numericValue: Number(returnValue),
      value
    };
  });
}, [portfolios, staticData.horizontalItems]);


  // Improved Loading UI with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 md:gap-12 mb-4 md:mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-0">
              <div className="h-3 w-24 bg-gray-300 dark:bg-neutral-800 rounded mb-2 animate-pulse"></div>
              <div className="h-8 w-32 bg-gray-300 dark:bg-neutral-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="text-center text-gray-600 dark:text-neutral-400 mt-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] p-3 sm:p-4 md:p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
          <button 
            onClick={() => {
              hasFetchedRef.current = false;
              fetchPortfolios();
            }}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data UI
  if (!portfolios.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] p-3 sm:p-4 md:p-6">
        <div className="text-center text-gray-600 dark:text-neutral-400 mt-12">
          <p>No portfolios found.</p>
        </div>
      </div>
    );
  }

  const first = portfolios[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-neutral-100 p-3 sm:p-4 md:p-6">
      {/* Top Stats */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 md:gap-12 mb-4 md:mb-6">
  {staticData.topStatsKeys.map((key) => (
    <div key={key} className="min-w-0">
    <p className="text-[11px] text-gray-600 dark:text-white mb-1 uppercase tracking-wide">
  {key === "today_total" ? "PORTFOLIO VALUE" : key.replace(/_/g, " ")}
</p>

      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
        {formatValue(first[key], true)}
      </h2>

      {key === "today_total" && (
        <p className="text-[11px] text-gray-700 dark:text-neutral-400 mt-1">
          Today's Change:{" "}
         <span
  className={
    Number(first.today_total - first.yesterday_total) < 0
      ? "text-red-500"
      : "text-green-400"
  }
>
  {Number(first.today_total - first.yesterday_total) >= 0
    ? `+${formatValue(first.today_total - first.yesterday_total, true)}`
    : `-${formatValue(Math.abs(first.today_total - first.yesterday_total), true)}`
  }
</span>{" "}

          • Last Updated:{" "}
      {formatDate(first.latest_date)}

        </p>
      )}
    </div>
  ))}
</div>

      {/* Horizontal Cards */}
 
{/* Horizontal Cards */}
<div className="relative mb-6 md:mb-8">

  {/* LEFT BUTTON */}
<button
  onClick={() => scrollRef.current.scrollBy({ left: -250, behavior: "smooth" })}
  className="absolute -left-[3px] top-1/2 -translate-y-1/2 z-10 
  bg-white dark:bg-[#222] shadow-md border border-gray-300 dark:border-neutral-700 
  w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition"
>
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 4L6 8l4 4" />
  </svg>
</button>



  {/* SCROLLABLE CARDS */}
  <div
    ref={scrollRef}
    className="flex overflow-x-auto gap-4 scrollbar-hide scroll-smooth px-5"
  >
    {horizontalCardsData.map((item, i) => {
      const lineColor = item.isNegative ? "#ef4444" : "#22c55e";
      const trendData = item.trendData || Array.from({ length: 10 }, () => ({
        value: item.numericValue + (Math.random() - 0.5) * 0.4,
      }));

      return (
        <div
          key={i}
          className="bg-white dark:bg-[#141414] p-4 rounded-xl border border-gray-300 dark:border-neutral-800 
          min-w-[260px] sm:min-w-[280px] flex-shrink-0 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          {/* Title */}
                  <p className="text-[10px] text-gray-500 dark:text-gray-200 uppercase mb-2">
  {item.title}
</p>

          {/* CONTENT WRAPPER */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-[13px] font-medium flex flex-col gap-1 text-gray-600 dark:text-gray-400">
              
              {/* Return */}
              <div className="flex items-center justify-between w-[120px]">
              <span className="opacity-75 dark:text-white">Return</span>

                <span
                  className={`font-bold ${
                    item.isNegative ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {item.numericValue > 0 ? "+" : ""}
                  {item.numericValue?.toFixed(2)}%
                </span>
              </div>

              {/* Value */}
              {item.value !== null && (
                <div className="flex items-center justify-between w-[120px]">
                 <span className="opacity-75 dark:text-white">Value</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.value !== null
                      ? formatValue(Number(item.value), true)
                      : "—"}
                  </span>
                </div>
              )}
            </div>

            {/* Sparkline */}
            <div className="w-[80px] h-[30px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={lineColor} stopOpacity={0.45} />
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
                    animationDuration={700}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* RIGHT BUTTON */}
 <button
  onClick={() => scrollRef.current.scrollBy({ left: 250, behavior: "smooth" })}
  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 
  bg-white dark:bg-[#222] shadow-md border border-gray-300 dark:border-neutral-700 
  w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition"
>
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 4l4 4-4 4" />
  </svg>
</button>
</div>


      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 md:mb-6">
        {/* Left Column - Portfolio Insights */}
        <div className="bg-white dark:bg-[#141414] p-4 md:p-5 rounded-lg border border-gray-300 dark:border-neutral-800 shadow-sm">
          <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">Portfolio Insights</h3>
          <p className="text-[11px] text-gray-700 dark:text-neutral-400 mb-3">
            Personalized insights to help you make informed investment decisions
          </p>
          <div className="space-y-3">
            {staticData.insights.map((item, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-[#0D0D0D] p-3 rounded-lg border border-gray-200 dark:border-neutral-800"
              >
                <p className="font-medium text-xs text-gray-800 dark:text-neutral-200 mb-1">{item.title}</p>
                <p className="text-[11px] text-gray-700 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns - Significant News */}
        <div className="lg:col-span-2 bg-white dark:bg-[#141414] p-4 md:p-5 rounded-lg border border-gray-300 dark:border-neutral-800 shadow-sm">
          <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">Significant News</h3>
          <p className="text-[11px] text-gray-700 dark:text-neutral-400 mb-3">
            Curated news & articles by Gen-AI
          </p>
          <div className="space-y-2">
            {staticData.news.map((news, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-[#0D0D0D] p-3 rounded-lg border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
              >
                <p className="text-xs font-medium text-gray-900 dark:text-neutral-200">{news.title}</p>
                <p className="text-[10px] text-gray-600 dark:text-neutral-500">{news.source} • {news.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Bottom Section - Upcoming Events and Recent Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 md:mb-6">
          {/* Upcoming Events */}
          <div className="bg-white dark:bg-[#141414] p-4 md:p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h3 className="font-semibold mb-1 text-sm text-gray-900 dark:text-neutral-100">
              Upcoming Events
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-neutral-500 mb-4">
              Upcoming events to help you make informed investment decisions
            </p>

            <div className="space-y-3">
              {staticData.events.map((event, i) => (
                <div
                  key={i}
                  className="bg-gray-50 dark:bg-[#0D0D0D] p-3 rounded-lg border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs">{event.icon}</span>
                      <span className="text-[10px] text-gray-600 dark:text-neutral-500">
                        {event.type}
                      </span>
                      <span className="text-xs">{event.impact}</span>
                    </div>
                    <button className="text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300 transition flex-shrink-0">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M8 4v8M4 8h8" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-800 dark:text-neutral-200 font-medium mb-1">
                    {event.title}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-neutral-500">
                    {event.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-[#141414] p-4 md:p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h3 className="font-semibold mb-1 text-sm text-gray-900 dark:text-neutral-100">
              Recent Notifications
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-neutral-500 mb-4">
              Recent notifications to help you make informed investment decisions
            </p>

            <div className="space-y-3">
              {staticData.notifications.map((notif, i) => (
                <div
                  key={i}
                  className="bg-gray-50 dark:bg-[#0D0D0D] p-3 rounded-lg border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs text-gray-800 dark:text-neutral-200 font-medium">
                      {notif.title}
                    </p>
                    {i === 3 && (
                      <button className="text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300 transition flex-shrink-0">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M3 8h10M8 3l5 5-5 5" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-neutral-400 leading-relaxed mb-1">
                    {notif.desc}
                  </p>
                  <p className="text-[9px] text-gray-500 dark:text-neutral-600">
                    {notif.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important Indicators and Watchlist Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Important Indicators */}
          <div className="bg-white dark:bg-[#141414] p-4 md:p-5 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm transition">
            <h3 className="font-semibold mb-0.5 text-sm text-gray-900 dark:text-white">
              Important Indicators
            </h3>
            <p className="text-[10px] text-neutral-500 mb-4">
              Important indicators to help you make informed investment decisions
            </p>

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle px-4 md:px-0">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-neutral-800">
                      <th className="text-left py-2 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">Title</th>
                      <th className="text-right py-2 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">Last</th>
                      <th className="text-right py-2 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">Previous</th>
                      <th className="text-right py-2 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">Highest</th>
                      <th className="text-right py-2 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">Lowest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staticData.indicators.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-200 dark:border-neutral-800/50 hover:bg-gray-100 dark:hover:bg-[#0d0d0d]/70 transition"
                      >
                        <td className="py-2.5 text-gray-800 dark:text-neutral-200 whitespace-nowrap">{row.title}</td>
                        <td className="py-2.5 text-right text-gray-700 dark:text-neutral-300 whitespace-nowrap">{row.last}</td>
                        <td className="py-2.5 text-right text-gray-700 dark:text-neutral-400 whitespace-nowrap">{row.prev}</td>
                        <td className="py-2.5 text-right text-gray-700 dark:text-neutral-400 whitespace-nowrap">{row.high}</td>
                        <td className="py-2.5 text-right text-gray-700 dark:text-neutral-400 whitespace-nowrap">{row.low}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Watchlist */}
          <div className="bg-white dark:bg-[#141414] p-4 md:p-5 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm transition">
            <h3 className="font-semibold mb-0.5 text-sm text-gray-900 dark:text-white">
              Watchlist
            </h3>
            <p className="text-[10px] text-neutral-500 mb-4">
              Watchlist to help you make informed investment decisions
            </p>

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle px-4 md:px-0">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-neutral-800">
                      <th className="text-left py-2 text-neutral-600 dark:text-neutral-400 font-medium"></th>
                      <th className="text-left py-2 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">Major</th>
                      <th className="text-right py-2 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">Price</th>
                      <th className="text-right py-2 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">Day</th>
                      <th className="text-right py-2 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">%</th>
                      <th className="text-right py-2 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">Weekly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staticData.watchlist.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-200 dark:border-neutral-800/50 hover:bg-gray-100 dark:hover:bg-[#0d0d0d]/70 transition"
                      >
                        <td className="py-2.5">{row.flag}</td>
                        <td className="py-2.5 text-gray-800 dark:text-neutral-200 whitespace-nowrap">{row.major}</td>
                        <td className="py-2.5 text-right text-gray-700 dark:text-neutral-300 whitespace-nowrap">{row.price}</td>
                        <td className="py-2.5 text-right text-gray-700 dark:text-neutral-400 whitespace-nowrap">{row.day}</td>
                        <td
                          className={`py-2.5 text-right whitespace-nowrap ${
                            row.change.startsWith("+") ? "text-green-500" : "text-red-400"
                          }`}
                        >
                          {row.change}
                        </td>
                        <td
                          className={`py-2.5 text-right whitespace-nowrap ${
                            row.weekly.startsWith("+") ? "text-green-500" : "text-red-400"
                          }`}
                        >
                          {row.weekly}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Keen Sights Section */}
        <div className="bg-white dark:bg-[#141414] p-4 md:p-5 rounded-lg border border-gray-200 dark:border-neutral-800">
          <h3 className="font-semibold mb-0.5 text-sm text-gray-900 dark:text-white">
            Keen Sights
          </h3>
          <p className="text-[10px] text-neutral-500 mb-4">
            Keen Sights to help you make informed investment decisions
          </p>

          <div className="space-y-3">
            {staticData.keenSights.map((item, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-[#0D0D0D] p-3 rounded-lg border border-gray-200 dark:border-neutral-800 
                           hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-100 dark:hover:bg-[#161616] 
                           transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Icon Circle */}
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#737373" strokeWidth="1.5" />
                      <circle cx="8" cy="8" r="3" fill="#737373" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] text-gray-600 dark:text-neutral-400">
                        {item.source}
                      </span>
                      <span className="text-[10px] text-gray-700 dark:text-neutral-600">•</span>
                      <span className="text-[10px] text-gray-600 dark:text-neutral-400">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-medium leading-snug">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}