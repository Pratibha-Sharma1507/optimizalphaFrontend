import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useOutletContext } from "react-router-dom";

axios.defaults.withCredentials = true;

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

  const [viewType, setViewType] = useState("value");

  // Fetch Level 1 Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("https://optimizalphabackend.onrender.com/api/account");

        const formatted = res.data.map(item => ({
          name: `Client ${item.client_id}`,
          client_id: item.client_id,
          amount: Number(item.today_total),
          percentage: Number(item.daily_return),
          level: 1
        }));

        setChartData(formatted);
      } catch (err) {
        console.error("API ERROR:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center py-4 text-sm">Loading...</p>;

  // ---- UPDATED: Slice size ALWAYS based on "amount"
  const formattedChartData = chartData.map(item => ({
    ...item,
    rawPercentage: Number(item.percentage),
    value: item.amount // chart never uses percentage for size
  }));

  // Drilldown Logic
  const handleSliceClick = async (slice) => {
    try {
      let next = [];
      let response;

      if (slice.level === 1) {
        response = await axios.get(`https://optimizalphabackend.onrender.com/api/pan-list/${slice.client_id}`);
        next = response.data.map(row => ({
          name: row.account_name,
          client_id: slice.client_id,
          account_name: row.account_name,
          amount: Number(row.today_total),
          percentage: Number(row.daily_return),
          level: 2
        }));
      }

      else if (slice.level === 2) {
        response = await axios.get(
          `https://optimizalphabackend.onrender.com/api/account-asset/${slice.client_id}/${encodeURIComponent(slice.account_name)}`
        );
        next = response.data.map(row => ({
          name: row.asset_class,
          client_id: slice.client_id,
          account_name: slice.account_name,
          asset_class: row.asset_class,
          amount: Number(row.today_total),
          percentage: Number(row.daily_return),
          level: 3
        }));
      }

      else if (slice.level === 3) {
        response = await axios.get(
          `https://optimizalphabackend.onrender.com/api/subassets/${slice.client_id}/${encodeURIComponent(slice.account_name)}/${encodeURIComponent(slice.asset_class)}`
        );
        next = response.data.subassets.map(row => ({
          name: row.asset_class2,
          client_id: slice.client_id,
          amount: Number(row.today_total),
          percentage: Number(row.daily_return),
          level: 4
        }));
      }

      setHistory(prev => [...prev, { chartData }]);
      setChartData(next);

    } catch (err) {
      console.error("Drilldown Error:", err);
    }
  };

  const goBack = () => {
    const last = history.pop();
    if (!last) return;
    setChartData(last.chartData);
    setHistory([...history]);
  };

  // Currency Formatter

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
  // Center Value
  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

  const centerDisplay =
    viewType === "value"
      ? formatValue(totalAmount, true)
      : `${chartData.reduce((sum, item) => sum + item.percentage, 0).toFixed(2)}%`;

  return (
    <div className="bg-white dark:bg-[#141414] p-6 rounded-xl border dark:border-neutral-700">

      {/* Header */}
      <div className="flex justify-between mb-3">
        <h2 className="font-semibold text-sm">{title}</h2>

        <div className="flex items-center gap-3">
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="text-xs bg-white dark:bg-[#1f1f1f] dark:text-white border border-gray-300 dark:border-neutral-700 rounded px-2 py-1"
          >
            <option value="value">Value</option>
            <option value="percentage">Percentage</option>
          </select>

          {history.length > 0 && (
            <button onClick={goBack} className="text-lg text-blue-500">⟵</button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[300px] flex justify-center items-center">
        <div className="absolute text-center">
          <p className="font-bold text-lg">{centerDisplay}</p>
        <p className="text-xs text-gray-400 dark:text-white">
  {viewType === "value" ? "Portfolio Value" : "Portfolio Return"}
</p>

        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedChartData}
              dataKey="value"
              innerRadius={90}
              outerRadius={130}
              strokeWidth={4}
              className="cursor-pointer"
              onClick={handleSliceClick}
            >
              {formattedChartData.map((slice, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, label, info) =>
                viewType === "value"
                  ? [formatValue(info.payload.amount, true), info.payload.name]
                  : [`${info.payload.rawPercentage.toFixed(2)}%`, info.payload.name]
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        {formattedChartData.map((item, i) => (
          <div key={i} className="flex items-center">
            <span
              className="w-3 h-3 rounded-sm mr-2"
              style={{ background: colors[i % colors.length] }}
            ></span>

            {item.name}:{" "}
            <b className="ml-1">
              {viewType === "value"
                ? formatValue(item.amount, true)
                : `${item.rawPercentage.toFixed(2)}%`}
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}
