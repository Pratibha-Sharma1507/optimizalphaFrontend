import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const colors = [
  "#4F46E5", "#16A34A", "#EAB308", "#F97316",
  "#EC4899", "#0EA5E9", "#6D28D9", "#10B981"
];

export default function PremiumDrilldownDonut() {
  const [currency] = useState("INR");
  const [chartData, setChartData] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([{ name: "Client", level: 0 }]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("value");

  const safeNumber = (v) => {
    if (v === null || v === undefined) return 0;
    const cleaned = String(v).replace(/[^0-9.-]/g, "");
    const num = Number(cleaned);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://optimizalphabackend.onrender.com/api/account", {
          credentials: 'include'
        });
        const data = await res.json();
        
        const totalAmount = data.reduce((sum, item) => sum + safeNumber(item.today_total), 0);

        setChartData([{
          name: "Client",
          amount: totalAmount,
          level: 0,
          breadcrumbName: "Client",
          allClients: data
        }]);
      } catch (err) {
        console.error("API ERROR:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center py-4 text-sm">Loading...</p>;

  const formatValue = (v) => {
    if (v == null) return "—";
    const n = safeNumber(v);
    const symbol = currency === "INR" ? "₹" : "$";
    const locale = currency === "INR" ? "en-IN" : "en-US";

    if (currency === "INR") {
      if (n >= 10000000) return `${symbol}${(n / 10000000).toFixed(2)}Cr`;
      if (n >= 100000) return `${symbol}${(n / 100000).toFixed(2)}L`;
      if (n >= 1000) return `${symbol}${(n / 1000).toFixed(2)}K`;
      return `${symbol}${n.toLocaleString(locale)}`;
    }

    return `${symbol}${n.toLocaleString(locale)}`;
  };

  const handleSliceClick = async (slice) => {
    if (slice.level >= 4) return;

    try {
      let next = [];
      let response;

      if (slice.level === 0) {
        // Client click → Show all Entities
        const allClients = slice.allClients;
        let allEntities = [];
        
        for (const client of allClients) {
          const entityRes = await fetch(`https://optimizalphabackend.onrender.com/api/pan-list/${client.client_id}`, {
            credentials: 'include'
          });
          const entityData = await entityRes.json();
          const entities = entityData.map(row => ({
            name: row.account_name,
            client_id: client.client_id,
            account_name: row.account_name,
            amount: safeNumber(row.today_total),
            level: 1,
            breadcrumbName: row.account_name
          }));
          allEntities = [...allEntities, ...entities];
        }

        next = allEntities;
        // Breadcrumb: Client / Entity
        setBreadcrumb([
          breadcrumb[0], // Client
          { name: "Entity", level: 1, isCategory: true, data: allEntities }
        ]);
      }

      else if (slice.level === 1) {
        // Entity click → Show Asset Classes
        response = await fetch(
          `https://optimizalphabackend.onrender.com/api/account-asset/${slice.client_id}/${encodeURIComponent(slice.account_name)}`,
          { credentials: 'include' }
        );
        const data = await response.json();

        next = data.map(row => ({
          name: row.asset_class,
          client_id: slice.client_id,
          account_name: slice.account_name,
          asset_class: row.asset_class,
          amount: safeNumber(row.today_total),
          level: 2,
          breadcrumbName: row.asset_class
        }));

        // Breadcrumb: Client / Entity / Entity Name / Asset Class
        setBreadcrumb([
          breadcrumb[0], // Client
          breadcrumb[1], // Entity (category - clickable)
          { name: slice.breadcrumbName || slice.name, level: 1, data: chartData, isNonClickable: true },
          { name: "Asset Class", level: 2, isCategory: true, data: next }
        ]);
      }

      else if (slice.level === 2) {
        // Asset Class click → Show Sub Assets
        response = await fetch(
          `https://optimizalphabackend.onrender.com/api/subassets/${slice.client_id}/${encodeURIComponent(slice.account_name)}/${encodeURIComponent(slice.asset_class)}`,
          { credentials: 'include' }
        );
        const data = await response.json();

        let subassets = [];
        if (data?.subassets && Array.isArray(data.subassets)) {
          subassets = data.subassets;
        } else if (Array.isArray(data)) {
          subassets = data;
        } else if (data?.data && Array.isArray(data.data)) {
          subassets = data.data;
        }
        
        next = subassets.map(row => ({
          name: row.asset_class2 || row.name || row.asset_class || 'Unknown',
          client_id: slice.client_id,
          account_name: slice.account_name,
          asset_class: slice.asset_class,
          amount: safeNumber(row.today_total || row.amount || row.value),
          level: 3,
          breadcrumbName: row.asset_class2 || row.name || row.asset_class || 'Unknown'
        }));

        // Breadcrumb: Client / Entity / Entity Name / Asset Class / Asset Class Name
        setBreadcrumb([
          breadcrumb[0], // Client
          breadcrumb[1], // Entity (category - clickable)
          breadcrumb[2], // Entity Name (non-clickable)
          breadcrumb[3], // Asset Class (category - clickable)
          { name: slice.breadcrumbName || slice.name, level: 2, data: chartData, isNonClickable: true }
        ]);
      }

      else if (slice.level === 3) {
        // Sub Asset click
        setBreadcrumb([
          breadcrumb[0], // Client
          breadcrumb[1], // Entity (category - clickable)
          breadcrumb[2], // Entity Name (non-clickable)
          breadcrumb[3], // Asset Class (category - clickable)
          breadcrumb[4], // Asset Class Name (non-clickable)
          { name: slice.breadcrumbName || slice.name, level: 3, data: chartData }
        ]);
        
        setChartData(chartData);
      }

      if (next.length > 0) {
        setChartData(next);
      }

    } catch (err) {
      console.error("Drilldown Error:", err);
    }
  };

  const handleBreadcrumbClick = async (index) => {
    const targetCrumb = breadcrumb[index];
    
    if (index === 0) {
      // Reset to Client
      const res = await fetch("https://optimizalphabackend.onrender.com/api/account", {
        credentials: 'include'
      });
      const data = await res.json();
      const totalAmount = data.reduce((sum, item) => sum + safeNumber(item.today_total), 0);

      setChartData([{
        name: "Client",
        amount: totalAmount,
        level: 0,
        breadcrumbName: "Client",
        allClients: data
      }]);
      setBreadcrumb([{ name: "Client", level: 0 }]);
    } else {
      // Category click - show its data
      if (targetCrumb.data) {
        setChartData(targetCrumb.data);
        setBreadcrumb(breadcrumb.slice(0, index + 1));
      }
    }
  };

  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

  const formattedChartData = chartData
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map(item => {
      if (viewMode === "percentage") {
        const percentage = (item.amount / totalAmount) * 100;
        return {
          ...item,
          value: percentage
        };
      }
      return {
        ...item,
        value: item.amount
      };
    });

  return (
    <div className="bg-white dark:bg-[#141414] p-6 rounded-xl border dark:border-neutral-700">

      {/* Header with Portfolio Breakdown Label */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Breakdown</h3>
        
        <select 
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="text-xs px-3 py-2 w-36 border rounded dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="value">Value</option>
          <option value="percentage">Percentage</option>
        </select>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm mb-6 pb-3 border-b dark:border-neutral-700 overflow-x-auto">
        {breadcrumb.map((crumb, index) => (
          <div key={index} className="flex items-center">
            {crumb.isNonClickable ? (
              <span className="px-2 py-1 rounded whitespace-nowrap text-gray-900 dark:text-white font-medium bg-gray-100 dark:bg-gray-800">
                {crumb.name}
              </span>
            ) : (
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  crumb.isCategory 
                    ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                    : index === breadcrumb.length - 1 
                      ? 'font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {crumb.name}
              </button>
            )}
            {index < breadcrumb.length - 1 && (
              <span className="mx-1 text-gray-400">/</span>
            )}
          </div>
        ))}
      </div>

      {/* Chart - with more top margin */}
      <div className="relative h-[300px] flex justify-center items-center mt-4">
        <div className="absolute text-center z-10">
          {viewMode === "value" ? (
            <>
             <p className="font-bold text-2xl sm:text-2xl lg:text-3xl">
  {formatValue(totalAmount)}
</p>
<p className="text-sm text-gray-400 dark:text-white">
  Portfolio Value
</p>


            </>
          ) : (
            <>
                       <p className="font-bold text-2xl sm:text-2xl lg:text-3xl">
  {formatValue(totalAmount)}
</p>
<p className="text-sm text-gray-400 dark:text-white">
  Portfolio Value
</p>
            </>
          )}
        </div>

        {formattedChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedChartData}
                dataKey="value"
                nameKey="name"
                innerRadius={85}
                outerRadius={135}
                strokeWidth={2}
                onClick={handleSliceClick}
                cursor={chartData[0]?.level < 4 ? "pointer" : "default"}
                paddingAngle={2}
                minAngle={15}
              >
                {formattedChartData.map((slice, i) => (
                  <Cell 
                    key={`cell-${i}`} 
                    fill={colors[i % colors.length]}
                  />
                ))}
              </Pie>

              <Tooltip 
                formatter={(value, name, props) => {
                  if (viewMode === "percentage") {
                    return [`${value.toFixed(2)}%`, props.payload.name];
                  }
                  return [formatValue(props.payload.amount), props.payload.name];
                }} 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm">No data available</p>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
        {formattedChartData.map((item, i) => {
          const percentage = ((item.amount / totalAmount) * 100).toFixed(1);
          return (
            <div key={i} className="flex items-center">
              <span className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" style={{ background: colors[i % colors.length] }}></span>
              <span className="truncate dark:text-gray-300">
                {item.name}: <strong className="ml-1">
                  {viewMode === "value" ? formatValue(item.amount) : `${percentage}%`}
                </strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}