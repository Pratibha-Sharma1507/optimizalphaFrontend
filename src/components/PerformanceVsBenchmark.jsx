import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function PerformanceVsBenchmark() {
  
  const chartData = [
    { month: "Sep'24", performance: 0, nifty: 0 },
    { month: "Oct'24", performance: 5, nifty: 4 },
    { month: "Nov'24", performance: 10, nifty: 9 },
    { month: "Dec'24", performance: 15, nifty: 13 },
    { month: "Jan'25", performance: 20, nifty: 17 },
    { month: "Feb'25", performance: 22, nifty: 18 },
  ];

  return (
    <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 p-4 sm:p-5 md:p-6">
      <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Performance vs Benchmark
      </h2>

      <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="2 2"
              stroke="#e5e5e5"
              className="dark:stroke-[#2c2c2c]"
            />

            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              className="dark:stroke-[#6b6b6b]"
            />

            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              className="dark:stroke-[#6b6b6b]"
            />

            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "12px" }} />

            <Line type="monotone" dataKey="performance" stroke="#34d399" strokeWidth={2} />
            <Line type="monotone" dataKey="nifty" stroke="#fbbf24" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
