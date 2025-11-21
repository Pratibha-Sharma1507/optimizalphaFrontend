import React, { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

axios.defaults.withCredentials = true;

const API_BASE = "https://optimizalphabackend.onrender.com/api";

export default function AssetClass1SummaryTable() {

  // ---------------- ARROW ICONS ----------------
  const ExpandArrow = ({ open }) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      className={`transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  const HeaderSortIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 20 20"
      className="opacity-50"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 8l3-3 3 3" />
      <path d="M7 12l3 3 3-3" />
    </svg>
  );

  // ---------------- STATE ----------------
  const [data, setData] = useState([]);
  const [subData, setSubData] = useState({});

  const [columns, setColumns] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const { currency } = useOutletContext();

  const [allocationOption, setAllocationOption] = useState("Asset Class");
  const [distributionOption, setDistributionOption] = useState("Account");

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [pan] = useState(localStorage.getItem('pan'));

  const allocationOptions = ["Asset Class", "Account"];
  const distributionOptions = ["Account", "Asset Class", "Sub Asset Class"];

  // ---------------- GET ACCOUNT LIST ----------------
useEffect(() => {
  const fetchAccounts = async () => {
    try {
      const clientId = localStorage.getItem("client"); // <-- FIX here

      console.log("Client ID from storage:", clientId);

      const res = await axios.get(`${API_BASE}/filter/accounts/${clientId}`);
      setAccounts(res.data);

      if (res.data.length > 0) {
        setSelectedAccount(res.data[0].client_id);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  fetchAccounts();
}, []);


useEffect(() => {
  const fetchSummary = async () => {
    try {
      const clientId = localStorage.getItem("client");
      const res = await axios.get(`${API_BASE}/pan-summary1/${clientId}`);

      const formatted = res.data.map(item => ({
        Name: item.client_no,
        "Today Total": item.today_total ?? "—",
        "Yesterday Total": item.yesterday_total ?? "—",
        "Daily Return %": item.daily_return ?? "—",
        "1W value": item["1w_value"] ?? "—",
        "1W Return %": item["1w_return"] ?? "—",
        "1M Value": item["1m_value"] ?? "—",
        "1M Return %": item["1m_return"] ?? "—",
        "3M Value": item["3m_value"] ?? "—",
        "3M Return %": item["3m_return"] ?? "—",
        "6M Value": item["6m_value"] ?? "—",
        "6M Return %": item["6m_return"] ?? "—",
        "MTD Value": item.mtd_value ?? "—",
        "MTD Return %": item.mtd_return ?? "—",
        "FYTD Value": item.fytd_value ?? "—",
        "FYTD Return %": item.fytd_return ?? "—",
      }));

      setSubData(prev => ({
        ...prev,
        "Summary View": formatted
      }));

    } catch (error) {
      console.error("Summary API Error:", error);
    }
  };

  fetchSummary();
}, []); 

  // ---------------- GET MAIN DATA ----------------
  useEffect(() => {
  if (!selectedAccount) return;

  const fetchPrimary = async () => {
    try {
      let res;

      // 🔥 Primary table => Always account to asset classes
      if (allocationOption === "Account") {
        res = await axios.get(`${API_BASE}/account-summary/${selectedAccount}`);
      } else {
        res = await axios.get(`${API_BASE}/asset-classes/${selectedAccount}`);
      }

     const transformed = res.data.map((item) => ({
  Name: allocationOption === "Account"
    ? item.account_name
    : (item.asset_class || item.account_name),

  "Today Total": item.today_total ?? "—",
  "Yesterday Total": item.yesterday_total ?? "—",
  "Daily Return %": item.daily_return ?? "—",
  "1W value": item["1w_value"] ?? "—",
  "1W Return %": item["1w_return"] ?? "—",
  "1M Value": item["1m_value"] ?? "—",
  "1M Return %": item["1m_return"] ?? "—",
  "3M Value": item["3m_value"] ?? "—",
  "3M Return %": item["3m_return"] ?? "—",
  "6M Value": item["6m_value"] ?? "—",
  "6M Return %": item["6m_return"] ?? "—",
  "MTD Value": item.mtd_value ?? "—",
  "MTD Return %": item.mtd_return ?? "—",
  "FYTD Value": item.fytd_value ?? "—",
  "FYTD Return %": item.fytd_return ?? "—",
}));

      setColumns(Object.keys(transformed[0]));
      setData(transformed);

    } catch (error) {
      console.error("Main Table Fetch Error:", error);
    }
  };

  fetchPrimary();
}, [selectedAccount, allocationOption]);

  // reset table expand + sub rows when dropdown changes
useEffect(() => {
  setExpanded(null);

  setSubData(prev => {
    const summary = prev["Summary View"] || null; // keep summary

    return summary
      ? { "Summary View": summary } // preserve only summary row
      : {};
  });
}, [allocationOption, distributionOption]);


  // ---------------- EXPAND ROW ----------------

const handleExpand = async (rowName) => {
  if (expanded === rowName) {
    setExpanded(null);
    return;
  }

  setExpanded(rowName);

  if (subData[rowName]) return;

  try {
    let res;
    let nameField;
     if (rowName === "Summary View") {
  const clientId = localStorage.getItem("client");
  const res = await axios.get(`${API_BASE}/pan-summary1/${clientId}`);

  console.log("📌 Summary Raw Response:", res.data);

  if (!res.data || res.data.length === 0) return;

  const formatted = res.data.map(item => ({
    Name: item.client_no || "—",

    "Today Total": item.today_total ?? "—",
    "Yesterday Total": item.yesterday_total ?? "—",
    "Daily Return %": item.daily_return ?? "—",

    "1W Value": item["1w_value"] ?? "—",
    "1W Return %": item["1w_return"] ?? "—",

    "1M Value": item["1m_value"] ?? "—",
    "1M Return %": item["1m_return"] ?? "—",

    "3M Value": item["3m_value"] ?? "—",
    "3M Return %": item["3m_return"] ?? "—",

    "6M Value": item["6m_value"] ?? "—",
    "6M Return %": item["6m_return"] ?? "—",

    "MTD Value": item.mtd_value ?? "—",
    "MTD Return %": item.mtd_return ?? "—",

    "FYTD Value": item.fytd_value ?? "—",
    "FYTD Return %": item.fytd_return ?? "—",
  }));

  // 🟢 CORRECT: USE formatted — not res.data
  setColumns(Object.keys(formatted[0]));
  setSubData(prev => ({
    ...prev,
    ["Summary View"]: formatted
  }));

  console.log("📌 Summary Formatted:", formatted);
  return;
}


    // ========== MEMBER MODE ==========
    // if (allocationOption === "Member" && distributionOption === "Account") {
    //   res = await axios.get(`${API_BASE}/filter/accounts/${selectedAccount}`);
    //   nameField = "account_name";
    // } 
  if (allocationOption === "Account" && distributionOption === "Asset Class") {

  const clientId = localStorage.getItem("client");
  res = await axios.get(`${API_BASE}/account-asset/${clientId}/${rowName}`);

  console.log("Account → Asset Response:", res.data);

  const formatted = res.data.map(item => ({
    Name: item.asset_class ?? "—",

    "Today Total": item.today_total ?? "—",
    "Yesterday Total": item.yesterday_total ?? "—",
    "Daily Return %": item.daily_return ?? "—",

    "1W value": item["1w_value"] ?? "—",
    "1W Return %": item["1w_return"] ?? "—",
    "1M Value": item["1m_value"] ?? "—",
    "1M Return %": item["1m_return"] ?? "—",
    "3M Value": item["3m_value"] ?? "—",
    "3M Return %": item["3m_return"] ?? "—",
    "6M Value": item["6m_value"] ?? "—",
    "6M Return %": item["6m_return"] ?? "—",
    "MTD Value": item.mtd_value ?? "—",
    "MTD Return %": item.mtd_return ?? "—",
    "FYTD Value": item.fytd_value ?? "—",
    "FYTD Return %": item.fytd_return ?? "—",
  }));

  setColumns(Object.keys(formatted[0]));
  setSubData(prev => ({
    ...prev,
    [rowName]: formatted
  }));

  return;
}




    
    else if (allocationOption === "Account" && distributionOption === "Sub Asset Class") {
     try {
   const clientId = localStorage.getItem("client");
const res = await axios.get(`${API_BASE}/account/sub-asset/${clientId}/${rowName}`);


    console.log("Sub-Asset API Response:", res.data);

    const formatted = res.data.map(item => ({
      Name: item.sub_asset_class ?? item.sub_asset ?? item.asset_class_2,
      "Today Total": item.today_total ?? "—",
       "Yesterday Total": item.yesterday_total ?? "—",
      "Daily Return %": item.daily_return ?? "—",
      "1W value": item["1w_value"] ?? "—",
      "1W Return %": item["1w_return"] ?? "—",
      "1M Value": item["1m_value"] ?? "—",
      "1M Return %": item["1m_return"] ?? "—",
      "3M Value": item["3m_value"] ?? "—",
      "3M Return %": item["3m_return"] ?? "—",
      "6M Value": item["6m_value"] ?? "—",
      "6M Return %": item["6m_return"] ?? "—",
      "MTD Value": item.mtd_value ?? "—",
      "MTD Return %": item.mtd_return ?? "—",
      "FYTD Value": item.fytd_value ?? "—",
      "FYTD Return %": item.fytd_return ?? "—",
    }));

    if (formatted.length > 0) {
      setColumns(Object.keys(formatted[0]));
    }

    setSubData(prev => ({
      ...prev,
      [rowName]: formatted
    }));

  } catch (error) {
    console.error("Sub Asset API Error:", error);
  }

  return;
}

    

    // ========== ASSET CLASS MODE ==========
   else if (allocationOption === "Asset Class" && distributionOption === "Account") {
    
     const clientId = localStorage.getItem("client"); // <-- FIX

  res = await axios.get(`${API_BASE}/asset-summary/${clientId}`);

  //  API response is grouped by asset classes
  const grouped = res.data;

  //  rowName here is the clicked Asset Class (e.g., "Equity")
  const selectedAssetClass = rowName;

  //  Extract accounts for just that asset class
  const accountsForAsset = grouped[selectedAssetClass] || [];

  //  Transform format for Table
const transformed = accountsForAsset.map((acc) => ({
  Name: acc.account_name,
  "Today Total": acc.today_total ?? "—",
   "Yesterday Total": acc.yesterday_total ?? "—",
  "Daily Return %": acc.daily_return ?? "—",
  "1W value": acc["1w_value"] ?? "—",   // <-- FIXED
  "1W Return %": acc["1w_return"] ?? "—",
  "1M Value": acc["1m_value"] ?? "—",
  "1M Return %": acc["1m_return"] ?? "—",
  "3M Value": acc["3m_value"] ?? "—",
  "3M Return %": acc["3m_return"] ?? "—",
  "6M Value": acc["6m_value"] ?? "—",
  "6M Return %": acc["6m_return"] ?? "—",
  "MTD Value": acc.mtd_value ?? "—",
  "MTD Return %": acc.mtd_return ?? "—",
  "FYTD Value": acc.fytd_value ?? "—",
  "FYTD Return %": acc.fytd_return ?? "—",
}));


  setSubData((prev) => ({ ...prev, [rowName]: transformed }));
  return; 
}

  else if (allocationOption === "Asset Class" && distributionOption === "Sub Asset Class") {
  try {
    const clientId = localStorage.getItem("client");
    const res = await axios.get(`${API_BASE}/filter/${clientId}/${rowName}`);

    console.log("Sub-Asset API Response:", res.data);

    const formatted = res.data.map(item => ({
      Name: item.sub_asset_class ?? item.sub_asset ?? item.asset_class_2,
      "Today Total": item.today_total ?? "—",
         "Yesterday Total": item.yesterday_total ?? "—",
      "Daily Return %": item.daily_return ?? "—",
      "1W value": item["1w_value"] ?? "—",
      "1W Return %": item["1w_return"] ?? "—",
      "1M Value": item["1m_value"] ?? "—",
      "1M Return %": item["1m_return"] ?? "—",
      "3M Value": item["3m_value"] ?? "—",
      "3M Return %": item["3m_return"] ?? "—",
      "6M Value": item["6m_value"] ?? "—",
      "6M Return %": item["6m_return"] ?? "—",
      "MTD Value": item.mtd_value ?? "—",
      "MTD Return %": item.mtd_return ?? "—",
      "FYTD Value": item.fytd_value ?? "—",
      "FYTD Return %": item.fytd_return ?? "—",
    }));

    if (formatted.length > 0) {
      setColumns(Object.keys(formatted[0]));
    }

    setSubData(prev => ({
      ...prev,
      [rowName]: formatted
    }));

  } catch (error) {
    console.error("Sub Asset API Error:", error);
  }

  return;
}


    else if (allocationOption === "Asset Class" && distributionOption === "Member") {
      res = await axios.get(`${API_BASE}/filter/pan/${selectedAccount}`);
      nameField = "pan_no";
    }

    const transformed = res.data.map((item) => ({
      Name: item[nameField] || item.sub_asset_class || item.asset_class || item.account_name || item.pan_no,
      "Today Total": item.today_total ?? "—",
      "Yesterday Total": item.yesterday_total ?? "—",
      "Daily Return %": item.daily_return_pct ?? "—",
      "3D Return %": item["3d_return_pct"] ?? "—",
      "1W Return %": item["1w_return_pct"] ?? "—",
      "MTD Return %": item.mtd_return_pct ?? "—",
      "FYTD Return %": item.fytd_return_pct ?? "—",
    }));

    setSubData((prev) => ({ ...prev, [rowName]: transformed }));

  } catch (err) {
    console.error("Expand API Error:", err);
  }



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

  const formatDecimal = (num) => {
  if (num == null || isNaN(num)) return "—";
  let truncated = Math.floor(Number(num) * 100) / 100;
  return truncated.toFixed(2);
};


  return (
    <div className="bg-white dark:bg-[#0b0b0b] rounded-xl shadow-lg border border-gray-200 dark:border-[#1a1a1a] w-full">

  {/* HEADER */}
  <div className="flex flex-wrap gap-4 sm:gap-6 items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-[#1f1f1f]">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 w-full sm:w-auto">
      Allocation & Performance
    </h3>

    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Allocation Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">Allocation by:</span>
        <select
          className="bg-white dark:bg-[#141414] text-gray-900 dark:text-gray-200 text-sm px-3 py-1 border border-gray-300 dark:border-[#3a3a3a] rounded-md"
          value={allocationOption}
          onChange={(e) => setAllocationOption(e.target.value)}
        >
          {allocationOptions.map((opt) => <option key={opt}>{opt}</option>)}
        </select>
      </div>

      {/* Distribution Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">Distribution by:</span>
        <select
          className="bg-white dark:bg-[#141414] text-gray-900 dark:text-gray-200 text-sm px-3 py-1 border border-gray-300 dark:border-[#3a3a3a] rounded-md"
          value={distributionOption}
          onChange={(e) => setDistributionOption(e.target.value)}
        >
          {distributionOptions.map((opt) => <option key={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  </div>

  {/* TABLE / MOBILE VIEW */}
  <div className="overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">

    <table className="hidden sm:table w-full text-sm table-auto border-collapse">
      <thead className="bg-gray-100 dark:bg-[#0F0F0F] sticky top-0 z-10">
        <tr>
          {columns.map((col) => (
            <th
              key={col}
              className="px-6 py-3 border-b border-gray-200 dark:border-[#1f1f1f] text-left text-gray-700 dark:text-gray-400 font-semibold whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                {col}
                <HeaderSortIcon />
              </div>
            </th>
          ))}
        </tr>
      </thead>

<tbody>
  {/* 🔥 Always visible Summary Row (no click, always open) */}
{subData["Summary View"]?.[0] && (
  <tr className="sticky top-0 z-50 bg-yellow-50 dark:bg-[#2f2f0a] font-semibold border-b border-gray-300 dark:border-[#333]">
    {columns.map((col, i) => (
      <td key={i} className="px-6 py-4 text-gray-900 dark:text-gray-200 whitespace-nowrap">
        {i === 0 
          ? subData["Summary View"][0]?.Name || "—"
          : (
              col.toLowerCase().includes("value") || col.includes("Total")
                ? formatValue(subData["Summary View"][0][col], true)
                : !isNaN(subData["Summary View"][0][col])
                ? Number(subData["Summary View"][0][col]).toFixed(2)
                : (subData["Summary View"][0][col] ?? "—")
            )
        }
      </td>
    ))}
  </tr>
)}

  {data.map((row) => (
    <React.Fragment key={row.Name}>
      <tr
        onClick={() => handleExpand(row.Name)}
        className="cursor-pointer bg-white dark:bg-[#141414] hover:bg-gray-100 dark:hover:bg-[#1d1d1d] border-b border-gray-200 dark:border-[#1f1f1f]"
      >
        {columns.map((col, i) => (
          <td key={i} className="px-6 py-4 text-gray-800 dark:text-gray-200 whitespace-nowrap">
            {i === 0 ? (
              <div className="flex items-center gap-2 font-medium">
                <ExpandArrow open={expanded === row.Name} /> {row[col]}
              </div>
            ) : 
              // 🟢 currency/value fields
              col.toLowerCase().includes("value") || col === "Today Total" || col === "Yesterday Total"
                ? formatValue(row[col], true)
                :
              // 🟠 return fields
              !isNaN(row[col]) && row[col] !== null && row[col] !== ""
                ? Number(row[col]).toFixed(2)
                : (row[col] ?? "—")
            }
          </td>
        ))}
      </tr>

      {expanded === row.Name &&
        subData[row.Name]?.map((sub, i2) => (
          <tr key={i2} className="bg-gray-50 dark:bg-[#0b0b0b] hover:bg-gray-100 dark:hover:bg-[#151515]">
            {columns.map((col, i3) => (
              <td key={i3} className="px-6 py-4 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                {i3 === 0 ? (
                  <span className="pl-10">{sub[col]}</span>
                ) :
                  // 🟢 Currency/value columns
                  col.toLowerCase().includes("value") || col === "Today Total" || col === "Yesterday Total"
                    ? formatValue(sub[col], true)
                    :
                  // 🟠 return columns format with decimals
                  !isNaN(sub[col]) && sub[col] !== null && sub[col] !== ""
                    ? Number(sub[col]).toFixed(2)
                    : (sub[col] ?? "—")
                }
              </td>
            ))}
          </tr>
        ))}
    </React.Fragment>
  ))}
</tbody>




    </table>

    {/* 📱 MOBILE CARD VIEW */}
    <div className="sm:hidden space-y-3 p-3">
      {data.map((row) => (
        <div
          key={row.Name}
          onClick={() => handleExpand(row.Name)}
          className="border border-gray-300 dark:border-[#333] rounded-lg p-3 bg-white dark:bg-[#141414] shadow-sm"
        >
          <div className="flex justify-between font-semibold text-gray-900 dark:text-gray-200">
            {row.Name}
            <ExpandArrow open={expanded === row.Name} />
          </div>

          <div className="mt-2 text-gray-700 dark:text-gray-400 space-y-1 text-sm">
            {columns.slice(1).map((col) => (
              <div key={col} className="flex justify-between">
                <span className="font-medium">{col}:</span>
                <span>{row[col] ?? "—"}</span>
              </div>
            ))}
          </div>

          {/* Expanded Details */}
          {expanded === row.Name && subData[row.Name] && (
            <div className="mt-3 bg-gray-50 dark:bg-[#0b0b0b] p-3 rounded-md">
              {subData[row.Name].map((sub, i2) => (
                <div key={i2} className="border-b border-gray-300 dark:border-[#222] pb-2 mb-2">
                  {columns.map((col) => (
                    <div key={col} className="flex justify-between text-xs py-1">
                      <span className="font-medium">{col}:</span>
                      <span>{sub[col] ?? "—"}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>

  </div>
</div>

  );
}