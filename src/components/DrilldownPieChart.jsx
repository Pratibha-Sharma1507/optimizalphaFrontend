import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useOutletContext } from "react-router-dom";

const colors = [
  "#4F46E5", "#16A34A", "#EAB308", "#F97316",
  "#EC4899", "#0EA5E9", "#6D28D9", "#10B981"
];

export default function PremiumDrilldownDonut() {
  const [chartData, setChartData] = useState([]);
  const [history, setHistory] = useState([]);
  const [title, setTitle] = useState("Portfolio Breakdown");
  const [loading, setLoading] = useState(true);
    const { currency } = useOutletContext();

  // ---------- LEVEL 1: CLIENT TOTAL ----------
  useEffect(() => {
    const fetchLevelOne = async () => {
      try {
        const res = await axios.get("https://optimizalphabackend.onrender.com/api/account");
        const list = res.data ?? [];

        const formatted = list.map(item => ({
          name: `Client ${item.client_id}`,
          client_id: item.client_id,
          amount: Number(item.today_total),
          level: 1
        }));

        setChartData(formatted);
      } catch (err) {
        console.error("❌ API ERROR:", err);
      }
      setLoading(false);
    };

    fetchLevelOne();
  }, []);

  if (loading) return <p className="text-center py-6">Loading...</p>;

  const total = chartData.reduce((s, i) => s + i.amount, 0);
  const formattedChartData = chartData.map(i => ({ ...i, value: i.amount }));

  // ---------- DRILLDOWN HANDLER ----------
  const handleSliceClick = async (slice) => {
    try {
      let response;
      let nextData = [];

      // LEVEL 1 → Show accounts/entities
   // LEVEL 1 → get accounts/entities
if (slice.level === 1) {
  response = await axios.get(`https://optimizalphabackend.onrender.com/api/pan-list/${slice.client_id}`);

  nextData = (response.data ?? []).map(row => ({
    name: row.account_name,
    client_id: slice.client_id,  // ⭐ FIX: force store
    account_name: row.account_name,
    amount: Number(row.today_total),
    level: 2
  }));
}


      // LEVEL 2 → Show Asset Classes
      // LEVEL 2 → get asset classes
else if (slice.level === 2) {
  response = await axios.get(
    `https://optimizalphabackend.onrender.com/api/account-asset/${slice.client_id}/${encodeURIComponent(slice.account_name)}`
  );

  nextData = (response.data ?? []).map(row => ({
    name: row.asset_class,
    client_id: slice.client_id,  // ⭐ FIX: carry forward
    account_name: slice.account_name,
    asset_class: row.asset_class,
    amount: Number(row.today_total),
    level: 3
  }));
}

      // LEVEL 3 → Show Sub-assets
      else if (slice.level === 3) {
  response = await axios.get(
    `https://optimizalphabackend.onrender.com/api/subassets/${slice.client_id}/${encodeURIComponent(slice.account_name)}/${encodeURIComponent(slice.asset_class)}`
  );

  const list = response.data.subassets ?? [];

  nextData = list.map(row => ({
    name: row.asset_class2,
    client_id: slice.client_id,  // ⭐ Not mandatory but safe
    amount: Number(row.today_total),
    level: 4
  }));
}

      else return; // last level reached

      setHistory([...history, { chartData, title }]);
      setChartData(nextData);
    //   setTitle(slice.name);

    } catch (error) {
      console.error("🔥 Drilldown Error:", error);
    }
  };

  // ---------- BACK BUTTON ----------
  const goBack = () => {
    const last = history.pop();
    if (!last) return;
    setChartData(last.chartData);
    setTitle(last.title);
    setHistory([...history]);
  };

  const formatValue = (v, isCurrency = false) => {
    if (v === null || v === undefined) return "—";
    const n = Number(v);
    if (Number.isNaN(n)) return v;

    const symbol = currency === "INR" ? "₹" : "$";
    const locale = currency === "INR" ? "en-IN" : "en-US";

    if (!isCurrency) return n.toLocaleString(locale);

    // Unit logic for INR
    if (currency === "INR") {
      if (n >= 10000000) return `${symbol}${(n / 10000000).toFixed(2)}Cr`;
      if (n >= 100000) return `${symbol}${(n / 100000).toFixed(2)}L`;
      if (n >= 1000) return `${symbol}${(n / 1000).toFixed(2)}K`;
      return `${symbol}${n.toLocaleString(locale)}`;
    }

    // Unit logic for USD
    if (currency === "USD") {
      if (n >= 1000000000) return `${symbol}${(n / 1000000000).toFixed(2)}B`;
      if (n >= 1000000) return `${symbol}${(n / 1000000).toFixed(2)}M`;
      if (n >= 1000) return `${symbol}${(n / 1000).toFixed(2)}K`;
      return `${symbol}${n.toLocaleString(locale)}`;
    }

    return `${symbol}${n.toLocaleString(locale)}`;
  };


  return (
    <div className="bg-white dark:bg-[#141414] p-6 rounded-xl w-full max-w-xl mx-auto border border-gray-300 dark:border-neutral-800">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-sm">{title}</h2>

        {history.length > 0 && (
          <button onClick={goBack} className="text-xs text-blue-500 hover:underline">
            ⟵ Back
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="relative h-[300px] flex justify-center items-center">

        <div className="absolute text-center pointer-events-none">
        <p className="text-lg font-bold">{formatValue(total, true)}</p>

      <p className="text-xs text-gray-400">Portfolio Value</p>

        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedChartData}
              dataKey="value"
              innerRadius={90}
              outerRadius={130}
              strokeWidth={4}
              onClick={handleSliceClick}
              className="cursor-pointer transition hover:brightness-95"
            >
              {formattedChartData.map((slice, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>

            <Tooltip
  formatter={(v, name) => [formatValue(v, true), name]}
  contentStyle={{
    background: "#1E1E1E",
    color: "#fff",
    borderRadius: "10px",
    padding: "10px 14px",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.4)"
  }}
  itemStyle={{
    color: "#fff",
    fontSize: "13px"
  }}
/>

          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-3">
  {formattedChartData.map((item, i) => (
    <div key={i} className="flex items-center text-xs">
      <span
        className="w-3 h-3 rounded-sm mr-2"
        style={{ background: colors[i % colors.length] }}
      ></span>

      {item.name}: 
      <b className="ml-1">
        {formatValue(item.amount, true)}
      </b>
    </div>
  ))}


     
      </div>
    </div>
  );
}
