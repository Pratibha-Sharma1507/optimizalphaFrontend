import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function DeltaVisionAssetClassChart() {
   const clientId = localStorage.getItem("client");

  const [selectedView, setSelectedView] = useState("Total Group");
  const [compareMode, setCompareMode] = useState("Yearly");
  const [selectedPeriods, setSelectedPeriods] = useState(["FY 2025"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [apiValue, setApiValue] = useState(null);
  const [apiClientNo, setApiClientNo] = useState(null);
  const [entityData, setEntityData] = useState([]);

  const viewByOptions = ["Entity", "Total Group"];
  const yearlyOptions = ["FY 2025"];
  const monthlyOptions = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const staticData = [
    {
      entity: "Entity 1",
      total_group: "CLIENT1",
      returns: {
        Jan: 2.1, Feb: -0.5, Mar: 0.9, Apr: 1.2, May: -1.4, Jun: 2.4,
        Jul: 1.3, Aug: 0.4, Sep: -0.9, Oct: 1.8, Nov: 2.2, Dec: -0.7,
      },
    },
  ];

  useEffect(() => {
    if (selectedView === "Entity" && compareMode === "Yearly") {
      axios.get(`https://optimizalphabackend.onrender.com/api/entity/fytd/${clientId}`)
        .then(res => setEntityData(res.data.mtd || []))
        .catch(() => setEntityData([]));
    }
  }, [selectedView, compareMode]);

  useEffect(() => {
    if (selectedView === "Total Group" && compareMode === "Yearly") {
      axios.get(`https://optimizalphabackend.onrender.com/api/fytd/${clientId}`)
        .then((res) => {
          setApiValue(res.data.fytd?.fytd_return ?? 0);
          setApiClientNo(res.data.fytd?.client_no || "No Name");
        })
        .catch(() => {
          setApiValue(0);
          setApiClientNo("N/A");
        });
    }
  }, [selectedView, compareMode]);


  const chartData = useMemo(() => {
    if (selectedView === "Entity" && compareMode === "Yearly") {
      return entityData.map(item => ({
        name: item.account_name,
        "FY 2025": Number(item.fytd_return),
      }));
    }

    const row = staticData[0];

    const obj = {
      name: selectedView === "Entity" ? row.entity : apiClientNo ?? row.total_group,
    };

    selectedPeriods.forEach((period) => {
      if (
        selectedView === "Total Group" &&
        compareMode === "Yearly" &&
        period === "FY 2025" &&
        apiValue !== null
      ) {
        obj[period] = apiValue;
      } else {
        obj[period] = row.returns?.[period] ?? 0;
      }
    });

    return [obj];

  }, [selectedPeriods, selectedView, apiValue, apiClientNo, compareMode, entityData]);

  const barColors = ["#16a34a","#f59e0b","#3b82f6","#a855f7","#ef4444","#10b981"];


  return (
    <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-5 mt-10 transition-all">

      {/* ------- HEADER ------- */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delta Vision</h2>

        <div className="flex gap-4 items-center">

          {/* View Selector WITH LABEL */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">View By:</span>
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="border rounded px-2 py-1 text-sm dark:bg-[#1f1f1f] dark:text-white"
            >
              {viewByOptions.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>

          {/* Compare Selector WITH LABEL */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Compare Periods:</span>
            <select
              value={compareMode}
              onChange={(e) => {
                setCompareMode(e.target.value);
                setSelectedPeriods(e.target.value === "Yearly" ? ["FY 2025"] : ["Jan"]);
              }}
              className="border rounded px-2 py-1 text-sm dark:bg-[#1f1f1f] dark:text-white"
            >
              <option>Yearly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* ------- CHART ------- */}
      <div className="w-full h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 60 }}
            barGap={10}
            barCategoryGap="30%"
            barSize={selectedView === "Entity" ? 45 : 35}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2c" />
            <XAxis dataKey="name" />

            <YAxis 
              label={{ value: "Return (%)", angle: -90, position: "insideLeft" }}
              tickFormatter={(val) => Number(val).toFixed(2)}
            />

            <Tooltip
              formatter={(value) => Number(value).toFixed(2)}
              cursor={{ fill: "rgba(255,255,255,0.1)" }}
              contentStyle={{ background: "#1f1f1f", color: "#fff", borderRadius: "6px" }}
            />

            <Legend />

            {selectedPeriods.map((period, i) => (
              <Bar key={period} dataKey={period} fill={barColors[i]} radius={[6,6,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
