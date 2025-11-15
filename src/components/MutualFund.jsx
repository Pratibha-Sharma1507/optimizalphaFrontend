import React from "react";

export default function MutualFunds() {
  const mutualFunds = [
    {
      name: "Axis Bluechip Fund",
      category: "Large Cap",
      risk: "Moderate",
      value: "$25,430",
      return1Y: "+12.4%",
      return3Y: "+32.8%",
      sip: "$2,000 / month",
    },
    {
      name: "HDFC Flexi Cap Fund",
      category: "Flexi Cap",
      risk: "High",
      value: "$14,980",
      return1Y: "+15.2%",
      return3Y: "+46.1%",
      sip: "$1,500 / month",
    },
    {
      name: "Parag Parikh ELSS Fund",
      category: "Tax Saving (ELSS)",
      risk: "Low",
      value: "$8,200",
      return1Y: "+10.1%",
      return3Y: "+24.6%",
      sip: "$1,000 / month",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 p-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Mutual Fund Portfolio
          </h1>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            Your current mutual fund investments and SIP performance
          </p>
        </div>
        <button className="bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition">
          + Add New Fund
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <SummaryCard title="Total Value" value="$48,610" />
        <SummaryCard title="Total SIP" value="$4,500 / month" />
        <SummaryCard title="Average Return (1Y)" value="+12.6%" positive />
        <SummaryCard title="Funds Count" value="3" />
      </div>

      {/* Mutual Funds Table */}
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-neutral-400 uppercase text-xs border-b border-gray-200 dark:border-neutral-800">
            <tr>
              <th className="px-6 py-3">Fund Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Risk</th>
              <th className="px-6 py-3 text-right">Value</th>
              <th className="px-6 py-3 text-right">1Y Return</th>
              <th className="px-6 py-3 text-right">3Y Return</th>
              <th className="px-6 py-3 text-right">SIP</th>
            </tr>
          </thead>
          <tbody>
            {mutualFunds.map((fund, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-all duration-200 border-b border-gray-100 dark:border-neutral-800/50"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {fund.name}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-neutral-300">
                  {fund.category}
                </td>
                <td
                  className={`px-6 py-4 font-medium ${
                    fund.risk === "High"
                      ? "text-red-500 dark:text-red-400"
                      : fund.risk === "Low"
                      ? "text-green-600 dark:text-green-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {fund.risk}
                </td>
                <td className="px-6 py-4 text-right text-gray-800 dark:text-neutral-200">
                  {fund.value}
                </td>
                <td
                  className={`px-6 py-4 text-right ${
                    fund.return1Y.startsWith("+")
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {fund.return1Y}
                </td>
                <td
                  className={`px-6 py-4 text-right ${
                    fund.return3Y.startsWith("+")
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {fund.return3Y}
                </td>
                <td className="px-6 py-4 text-right text-gray-700 dark:text-neutral-300">
                  {fund.sip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ Reusable Summary Card (light/dark support)
function SummaryCard({ title, value, positive }) {
  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
      <p className="text-sm text-gray-600 dark:text-neutral-400">{title}</p>
      <h2
        className={`text-2xl font-semibold mt-2 ${
          positive ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}
